import logging
import uuid
from datetime import timedelta

from fastapi import (
    APIRouter,
    Cookie,
    Depends,
    File,
    HTTPException,
    Request,
    Response,
    UploadFile,
    status,
)
from fastapi.responses import JSONResponse
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import (
    get_current_user,
    get_current_user_context,
    list_user_memberships,
    verify_csrf,
)
from app.api.metrics import (
    COUNTER_LOGIN_FAILED,
    COUNTER_LOGIN_LOCKED,
    COUNTER_LOGIN_SUCCESS,
    COUNTER_REFRESH_REUSED,
    COUNTER_REFRESH_SUCCESS,
    incr,
)
from app.api.rate_limit import _client_ip, rate_limit_ip
from app.core.cache import redis_client
from app.core.database import get_db
from app.core.refresh_token import (
    ROTATE_OK,
    ROTATE_REUSED,
    issue_refresh_token,
    revoke_refresh_token,
    revoke_user_refresh_tokens,
    rotate_refresh_token,
)
from app.core.security import crear_access_token, crear_csrf_token, hash_password, verify_password
from app.core.settings import get_settings
from app.core.storage_url import to_relative
from app.models.storage_bucket import StorageBucket
from app.models.user import Usuario
from app.schemas.user import (
    CurrentUserResponse,
    LoginRequest,
    LoginResponse,
    PasswordChange,
    PerfilUpdate,
    UsuarioResponse,
)
from app.services.actividad_service import registrar_actividad
from app.services.storage import StorageClient

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/autenticacion", tags=["autenticación"])
settings = get_settings()

_LOGIN_USERNAME_LOCKOUT_KEY = 'rate_limit:login:username:{}'
_LOGIN_USERNAME_MAX_FAILS = 5
_LOGIN_USERNAME_WINDOW_SECONDS = 300


def _username_lockout_key(identifier: str) -> str:
    return _LOGIN_USERNAME_LOCKOUT_KEY.format(identifier)


_REFRESH_COOKIE_PATH = f"{settings.admin_prefix}/autenticacion"


def _set_access_cookie(response: Response, access_token: str) -> None:
    response.set_cookie(
        key=settings.cookie_name,
        value=access_token,
        max_age=settings.cookie_max_age,
        httponly=settings.cookie_httponly,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        domain=settings.cookie_domain,
    )


def _set_refresh_cookie(response: Response, raw: str) -> None:
    response.set_cookie(
        key=settings.refresh_cookie_name,
        value=raw,
        max_age=settings.refresh_token_expire_minutes * 60,
        path=_REFRESH_COOKIE_PATH,
        httponly=settings.cookie_httponly,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        domain=settings.cookie_domain,
    )


def _delete_session_cookies(response: Response) -> None:
    response.delete_cookie(
        key=settings.cookie_name,
        httponly=settings.cookie_httponly,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        domain=settings.cookie_domain,
    )
    response.delete_cookie(
        key=settings.refresh_cookie_name,
        path=_REFRESH_COOKIE_PATH,
        httponly=settings.cookie_httponly,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        domain=settings.cookie_domain,
    )


def _refresh_rejected() -> JSONResponse:
    resp = JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        content={"detail": "Sesión expirada"},
    )
    _delete_session_cookies(resp)
    return resp


@router.post(
    "/iniciar-sesion",
    response_model=LoginResponse,
    dependencies=[Depends(rate_limit_ip(max_requests=10, window_seconds=60, scope='login'))],
)
async def login(
    credentials: LoginRequest,
    response: Response,
    request: Request,
    db: Session = Depends(get_db),
):
    identifier = (credentials.username or "").strip().lower()

    lockout_key = _username_lockout_key(identifier)
    try:
        fail_count = int(redis_client.get(lockout_key) or 0)
    except Exception as exc:
        logger.warning('login lockout redis error identifier=%s: %s', identifier, exc)
        fail_count = 0

    if fail_count >= _LOGIN_USERNAME_MAX_FAILS:
        try:
            ttl = redis_client.ttl(lockout_key)
        except Exception:
            ttl = _LOGIN_USERNAME_WINDOW_SECONDS
        retry = ttl if ttl and ttl > 0 else _LOGIN_USERNAME_WINDOW_SECONDS
        logger.warning('login locked identifier=%s fails=%s', identifier, fail_count)
        incr(COUNTER_LOGIN_LOCKED)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Cuenta temporalmente bloqueada por intentos fallidos. Intenta en {retry}s.",
            headers={"Retry-After": str(retry)},
        )

    usuario = (
        db.query(Usuario)
        .filter(
            (func.lower(Usuario.username) == identifier)
            | (func.lower(Usuario.email) == identifier)
        )
        .first()
    )

    if not usuario or not verify_password(credentials.password, usuario.hashed_password):
        try:
            pipe = redis_client.pipeline()
            pipe.incr(lockout_key)
            pipe.expire(lockout_key, _LOGIN_USERNAME_WINDOW_SECONDS)
            pipe.execute()
        except Exception as exc:
            logger.warning('login lockout incr error identifier=%s: %s', identifier, exc)
        logger.info('action=login.failed identifier=%s', identifier)
        try:
            registrar_actividad(
                db,
                actor=usuario,
                action="login.failed",
                resource_type="usuario",
                resource_id=usuario.id if usuario else None,
                metadata={"identifier": identifier},
                ip=_client_ip(request),
            )
            db.commit()
        except Exception as exc:
            db.rollback()
            logger.warning('actividad login.failed fallo identifier=%s: %s', identifier, exc)
        incr(COUNTER_LOGIN_FAILED)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas",
        )

    try:
        redis_client.delete(lockout_key)
    except Exception:
        pass
    incr(COUNTER_LOGIN_SUCCESS)

    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = crear_access_token(
        data={"sub": usuario.username}, expires_delta=access_token_expires
    )

    _set_access_cookie(response, access_token)

    refresh_raw = issue_refresh_token(usuario.username)
    if refresh_raw:
        _set_refresh_cookie(response, refresh_raw)

    csrf_token = crear_csrf_token(usuario.username)

    user_payload = UsuarioResponse.model_validate(usuario).model_dump()
    user_payload["projects"] = list_user_memberships(db, usuario)

    logger.info('action=login.success user_id=%s role=%s', usuario.id, usuario.role)
    try:
        registrar_actividad(
            db,
            actor=usuario,
            action="login.success",
            resource_type="usuario",
            resource_id=usuario.id,
            metadata={"role": usuario.role},
            ip=_client_ip(request),
        )
        db.commit()
    except Exception as exc:
        db.rollback()
        logger.warning('actividad login.success fallo user_id=%s: %s', usuario.id, exc)

    return LoginResponse(
        csrf_token=csrf_token,
        user=UsuarioResponse.model_validate(user_payload),
    )


@router.post(
    "/refrescar",
    dependencies=[Depends(rate_limit_ip(max_requests=20, window_seconds=60, scope='refresh'))],
)
async def refrescar_sesion(
    request: Request,
    db: Session = Depends(get_db),
    refresh_cookie: str | None = Cookie(default=None, alias=settings.refresh_cookie_name),
):
    if not refresh_cookie:
        return _refresh_rejected()

    rotate_status, new_raw, username = rotate_refresh_token(refresh_cookie)

    if rotate_status == ROTATE_REUSED:
        incr(COUNTER_REFRESH_REUSED)
        logger.warning(
            'action=refresh.reuse_detected user=%s ip=%s', username, _client_ip(request)
        )
        try:
            actor = db.query(Usuario).filter(Usuario.username == username).first()
            registrar_actividad(
                db,
                actor=actor,
                action="login.refresh_reuse",
                resource_type="usuario",
                resource_id=actor.id if actor else None,
                metadata={"username": username},
                ip=_client_ip(request),
            )
            db.commit()
        except Exception as exc:
            db.rollback()
            logger.warning('actividad refresh_reuse fallo user=%s: %s', username, exc)
        return _refresh_rejected()

    if rotate_status != ROTATE_OK or not new_raw:
        return _refresh_rejected()

    usuario = db.query(Usuario).filter(Usuario.username == username).first()
    if usuario is None:
        revoke_user_refresh_tokens(username)
        return _refresh_rejected()

    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = crear_access_token(
        data={"sub": usuario.username}, expires_delta=access_token_expires
    )

    resp = JSONResponse(content={"csrf_token": crear_csrf_token(usuario.username)})
    _set_access_cookie(resp, access_token)
    _set_refresh_cookie(resp, new_raw)
    incr(COUNTER_REFRESH_SUCCESS)
    return resp


@router.post("/cerrar-sesion")
async def logout(
    response: Response,
    request: Request,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
    refresh_cookie: str | None = Cookie(default=None, alias=settings.refresh_cookie_name),
):
    if refresh_cookie:
        revoke_refresh_token(refresh_cookie)
    _delete_session_cookies(response)
    try:
        registrar_actividad(
            db,
            actor=current_user,
            action="login.logout",
            resource_type="usuario",
            resource_id=current_user.id,
            ip=_client_ip(request),
        )
        db.commit()
    except Exception as exc:
        db.rollback()
        logger.warning('actividad login.logout fallo user_id=%s: %s', current_user.id, exc)
    return {"message": "Sesión cerrada exitosamente"}


@router.get("/perfil", response_model=CurrentUserResponse)
async def get_current_user_info(
    context: dict = Depends(get_current_user_context),
):
    return context


@router.put("/perfil", response_model=UsuarioResponse)
async def actualizar_perfil(
    payload: PerfilUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    data = payload.model_dump(exclude_unset=True)

    if "email" in data and data["email"]:
        data["email"] = data["email"].strip().lower()
        if data["email"] != current_user.email:
            existing = (
                db.query(Usuario)
                .filter(func.lower(Usuario.email) == data["email"], Usuario.id != current_user.id)
                .first()
            )
            if existing:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email ya está en uso")

    for field, value in data.items():
        setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/verificar")
async def verify_token(current_user: Usuario = Depends(get_current_user)):
    return {"valid": True}


@router.get("/csrf")
async def refrescar_csrf(current_user: Usuario = Depends(get_current_user)):
    return {"csrf_token": crear_csrf_token(current_user.username)}


_AVATAR_ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
}
_AVATAR_MAX_BYTES = 2 * 1024 * 1024


def _avatar_extension(content_type: str) -> str:
    return {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/gif": "gif",
    }.get(content_type, "bin")


@router.post("/perfil/avatar", response_model=UsuarioResponse)
async def subir_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    if file.content_type not in _AVATAR_ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tipo no permitido. Use {', '.join(sorted(_AVATAR_ALLOWED_CONTENT_TYPES))}",
        )

    file.file.seek(0, 2)
    size = file.file.tell()
    file.file.seek(0)
    if size > _AVATAR_MAX_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Avatar excede {_AVATAR_MAX_BYTES // (1024 * 1024)} MB",
        )

    bucket = (
        db.query(StorageBucket)
        .filter(StorageBucket.storage_bucket == "mapamex", StorageBucket.is_active.is_(True))
        .first()
    )
    if bucket is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Bucket de assets institucionales no disponible",
        )

    ext = _avatar_extension(file.content_type)
    object_name = f"avatars/u{current_user.id}/{uuid.uuid4().hex}.{ext}"

    client = StorageClient.for_bucket(bucket)
    public_url = await client.upload_file(file, object_name)

    if current_user.avatar_url:
        previous_relative = to_relative(current_user.avatar_url)
        if previous_relative and previous_relative.startswith(f"mapamex/avatars/u{current_user.id}/"):
            old_object = previous_relative[len("mapamex/"):]
            client.delete_file(old_object)

    current_user.avatar_url = to_relative(public_url)
    db.commit()
    db.refresh(current_user)
    logger.info('action=user.avatar_upload user_id=%s object=%s', current_user.id, object_name)
    return UsuarioResponse.model_validate(current_user)


@router.post("/cambiar-contrasena")
async def cambiar_contrasena(
    password_data: PasswordChange,
    response: Response,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Contraseña actual incorrecta",
        )

    from app.core.time import utcnow

    current_user.hashed_password = hash_password(password_data.new_password)
    current_user.must_change_password = False
    current_user.password_changed_at = utcnow()
    db.commit()
    logger.info('action=user.change_password user_id=%s', current_user.id)

    revoke_user_refresh_tokens(current_user.username)

    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = crear_access_token(
        data={"sub": current_user.username}, expires_delta=access_token_expires
    )
    _set_access_cookie(response, access_token)
    refresh_raw = issue_refresh_token(current_user.username)
    if refresh_raw:
        _set_refresh_cookie(response, refresh_raw)
    csrf_token = crear_csrf_token(current_user.username)

    return {
        "message": "Contraseña actualizada exitosamente",
        "csrf_token": csrf_token,
    }
