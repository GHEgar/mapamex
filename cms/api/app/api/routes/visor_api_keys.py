from __future__ import annotations

from datetime import date, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_role, verify_csrf
from app.core.time import utcnow
from app.models.visor_api_key import VisorApiKey
from app.models.visor_api_key_acceso import VisorApiKeyAcceso
from app.models.visor_api_key_embed import VisorApiKeyEmbed
from app.models.visor_api_key_evento import VisorApiKeyEvento
from app.models.visor_api_key_uso import VisorApiKeyUsoDiario
from app.models.user import Usuario
from app.schemas.visor_api_key import (
    VisorApiKeyAccesoPage,
    VisorApiKeyAccesoResponse,
    VisorApiKeyCreate,
    VisorApiKeyEmbedCreate,
    VisorApiKeyEmbedFromLayers,
    VisorApiKeyEmbedResponse,
    VisorApiKeyEmbedSummary,
    VisorApiKeyEventoResponse,
    VisorApiKeyResponse,
    VisorApiKeyRevealResponse,
    VisorApiKeyRotateRequest,
    VisorApiKeyUpdate,
    VisorApiKeyUsoDiarioResponse,
)
from app.services.visor_embed_webhook import (
    create_share,
    fetch_share_meta,
    notify_invalidate_cache,
    pin_share_permanent,
    unpin_share,
)
from app.services.visor_keys import generate_api_key

router = APIRouter(prefix="/visor/api-keys", tags=["visor api-keys"])


def _to_response(api_key: VisorApiKey) -> VisorApiKeyResponse:
    return VisorApiKeyResponse.model_validate(api_key)


def _validate_public_referers(visibility: str, dominios: list[str]) -> None:
    if visibility == "public" and not dominios:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Una llave pública necesita al menos un sitio autorizado. "
                "Agrega la dirección del sitio donde se va a mostrar el mapa antes de continuar."
            ),
        )


def _record_event(
    db: Session,
    api_key: VisorApiKey,
    evento: str,
    actor: Usuario | None,
    payload: dict | None = None,
) -> None:
    db.add(
        VisorApiKeyEvento(
            api_key_id=api_key.id,
            evento=evento,
            actor_user_id=actor.id if actor else None,
            payload=payload,
        )
    )


@router.get("", response_model=list[VisorApiKeyResponse])
async def listar_api_keys(
    db: Session = Depends(get_db),
    estado: str | None = Query(default=None, pattern=r"^(active|suspended|revoked)$"),
    visibility: str | None = Query(default=None, pattern=r"^(public|private)$"),
    busqueda: str | None = Query(default=None, max_length=120),
):
    query = db.query(VisorApiKey)
    if estado:
        query = query.filter(VisorApiKey.estado == estado)
    if visibility:
        query = query.filter(VisorApiKey.visibility == visibility)
    if busqueda:
        like = f"%{busqueda.lower()}%"
        query = query.filter(VisorApiKey.institucion_nombre.ilike(like))
    rows = query.order_by(VisorApiKey.id.desc()).all()
    return [_to_response(r) for r in rows]


@router.get("/{api_key_id}", response_model=VisorApiKeyResponse)
async def obtener_api_key(api_key_id: int, db: Session = Depends(get_db)):
    api_key = db.query(VisorApiKey).filter(VisorApiKey.id == api_key_id).first()
    if not api_key:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La llave no existe (o ya fue eliminada)")
    return _to_response(api_key)


@router.post("", response_model=VisorApiKeyRevealResponse, status_code=status.HTTP_201_CREATED)
async def crear_api_key(
    payload: VisorApiKeyCreate,
    db: Session = Depends(get_db),
    user: Usuario = Depends(verify_csrf),
    _: Usuario = Depends(require_role(["tetlamamakani"])),
):
    _validate_public_referers(payload.visibility, payload.dominios_permitidos)

    plain_key, prefix, hashed = generate_api_key(payload.visibility)

    api_key = VisorApiKey(
        institucion_nombre=payload.institucion_nombre,
        institucion_email_contacto=payload.institucion_email_contacto,
        descripcion=payload.descripcion,
        visibility=payload.visibility,
        key_prefix=prefix,
        key_hash=hashed,
        dominios_permitidos=payload.dominios_permitidos,
        ips_permitidas=payload.ips_permitidas,
        capas_permitidas=payload.capas_permitidas,
        cuota_diaria=payload.cuota_diaria,
        cuota_mensual=payload.cuota_mensual,
        estado="active",
        expira_en=payload.expira_en,
        notas_admin=payload.notas_admin,
        creado_por_user_id=user.id,
    )
    db.add(api_key)
    db.flush()
    _record_event(
        db,
        api_key,
        "created",
        user,
        payload={"visibility": payload.visibility, "prefix": prefix},
    )
    db.commit()
    db.refresh(api_key)

    return VisorApiKeyRevealResponse(api_key=_to_response(api_key), plain_key=plain_key)


@router.patch("/{api_key_id}", response_model=VisorApiKeyResponse)
async def actualizar_api_key(
    api_key_id: int,
    payload: VisorApiKeyUpdate,
    db: Session = Depends(get_db),
    user: Usuario = Depends(verify_csrf),
    _: Usuario = Depends(require_role(["tetlamamakani"])),
):
    api_key = db.query(VisorApiKey).filter(VisorApiKey.id == api_key_id).first()
    if not api_key:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La llave no existe (o ya fue eliminada)")

    update_data = payload.model_dump(exclude_unset=True)
    if "dominios_permitidos" in update_data:
        nuevos_dominios = update_data["dominios_permitidos"] or []
        _validate_public_referers(api_key.visibility, nuevos_dominios)

    for field, value in update_data.items():
        setattr(api_key, field, value)
    api_key.actualizado_en = utcnow()

    _record_event(db, api_key, "updated", user, payload=update_data)
    db.commit()
    db.refresh(api_key)
    return _to_response(api_key)


@router.post("/{api_key_id}/rotate-key", response_model=VisorApiKeyRevealResponse)
async def rotar_api_key(
    api_key_id: int,
    payload: VisorApiKeyRotateRequest,
    db: Session = Depends(get_db),
    user: Usuario = Depends(verify_csrf),
    _: Usuario = Depends(require_role(["tetlamamakani"])),
):
    api_key = db.query(VisorApiKey).filter(VisorApiKey.id == api_key_id).first()
    if not api_key:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La llave no existe (o ya fue eliminada)")

    visibility = payload.visibility or api_key.visibility
    previous_prefix = api_key.key_prefix
    plain_key, prefix, hashed = generate_api_key(visibility)
    api_key.visibility = visibility
    api_key.key_prefix = prefix
    api_key.key_hash = hashed
    api_key.actualizado_en = utcnow()
    _record_event(db, api_key, "rotated", user, payload={"visibility": visibility, "prefix": prefix})
    db.commit()
    db.refresh(api_key)
    if previous_prefix:
        notify_invalidate_cache(previous_prefix)

    return VisorApiKeyRevealResponse(api_key=_to_response(api_key), plain_key=plain_key)


def _change_estado(
    db: Session,
    api_key_id: int,
    nuevo_estado: str,
    evento: str,
    actor: Usuario,
) -> VisorApiKeyResponse:
    api_key = db.query(VisorApiKey).filter(VisorApiKey.id == api_key_id).first()
    if not api_key:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La llave no existe (o ya fue eliminada)")
    if api_key.estado == nuevo_estado:
        return _to_response(api_key)
    api_key.estado = nuevo_estado
    api_key.actualizado_en = utcnow()
    _record_event(db, api_key, evento, actor)
    db.commit()
    db.refresh(api_key)
    if nuevo_estado in {"revoked", "suspended"}:
        notify_invalidate_cache(api_key.key_prefix)
    return _to_response(api_key)


@router.post("/{api_key_id}/revoke", response_model=VisorApiKeyResponse)
async def revocar_api_key(
    api_key_id: int,
    db: Session = Depends(get_db),
    user: Usuario = Depends(verify_csrf),
    _: Usuario = Depends(require_role(["tetlamamakani"])),
):
    return _change_estado(db, api_key_id, "revoked", "revoked", user)


@router.post("/{api_key_id}/suspend", response_model=VisorApiKeyResponse)
async def suspender_api_key(
    api_key_id: int,
    db: Session = Depends(get_db),
    user: Usuario = Depends(verify_csrf),
    _: Usuario = Depends(require_role(["tetlamamakani"])),
):
    return _change_estado(db, api_key_id, "suspended", "suspended", user)


@router.post("/{api_key_id}/reactivate", response_model=VisorApiKeyResponse)
async def reactivar_api_key(
    api_key_id: int,
    db: Session = Depends(get_db),
    user: Usuario = Depends(verify_csrf),
    _: Usuario = Depends(require_role(["tetlamamakani"])),
):
    api_key = db.query(VisorApiKey).filter(VisorApiKey.id == api_key_id).first()
    if not api_key:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La llave no existe (o ya fue eliminada)")
    if api_key.estado == "revoked":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se puede reactivar una llave que fue cancelada. Crea una llave nueva.",
        )
    return _change_estado(db, api_key_id, "active", "reactivated", user)


@router.get("/{api_key_id}/events", response_model=list[VisorApiKeyEventoResponse])
async def listar_eventos(
    api_key_id: int,
    db: Session = Depends(get_db),
    limit: int = Query(default=50, ge=1, le=500),
):
    api_key = db.query(VisorApiKey).filter(VisorApiKey.id == api_key_id).first()
    if not api_key:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La llave no existe (o ya fue eliminada)")
    rows = (
        db.query(VisorApiKeyEvento)
        .filter(VisorApiKeyEvento.api_key_id == api_key_id)
        .order_by(VisorApiKeyEvento.creado_en.desc(), VisorApiKeyEvento.id.desc())
        .limit(limit)
        .all()
    )
    return [VisorApiKeyEventoResponse.model_validate(r) for r in rows]


@router.get("/{api_key_id}/usage", response_model=list[VisorApiKeyUsoDiarioResponse])
async def listar_uso(
    api_key_id: int,
    db: Session = Depends(get_db),
    dias: int = Query(default=30, ge=1, le=365),
):
    api_key = db.query(VisorApiKey).filter(VisorApiKey.id == api_key_id).first()
    if not api_key:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La llave no existe (o ya fue eliminada)")
    desde = date.today() - timedelta(days=dias)
    rows = (
        db.query(VisorApiKeyUsoDiario)
        .filter(
            VisorApiKeyUsoDiario.api_key_id == api_key_id,
            VisorApiKeyUsoDiario.dia >= desde,
        )
        .order_by(VisorApiKeyUsoDiario.dia.asc())
        .all()
    )
    return [VisorApiKeyUsoDiarioResponse.model_validate(r) for r in rows]


@router.get("/{api_key_id}/accesos", response_model=VisorApiKeyAccesoPage)
async def listar_accesos(
    api_key_id: int,
    db: Session = Depends(get_db),
    desde: datetime | None = Query(default=None),
    hasta: datetime | None = Query(default=None),
    origin: str | None = Query(default=None, max_length=255),
    capa: str | None = Query(default=None, max_length=120),
    resultado: str | None = Query(default=None, pattern=r"^(allowed|denied|quota_exceeded)$"),
    endpoint: str | None = Query(default=None, max_length=20),
    page: int = Query(default=1, ge=1),
    size: int = Query(default=50, ge=1, le=500),
):
    api_key = db.query(VisorApiKey).filter(VisorApiKey.id == api_key_id).first()
    if not api_key:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La llave no existe (o ya fue eliminada)")
    query = db.query(VisorApiKeyAcceso).filter(VisorApiKeyAcceso.api_key_id == api_key_id)
    if desde is not None:
        query = query.filter(VisorApiKeyAcceso.timestamp >= desde)
    if hasta is not None:
        query = query.filter(VisorApiKeyAcceso.timestamp <= hasta)
    if origin:
        query = query.filter(VisorApiKeyAcceso.origin.ilike(f"%{origin}%"))
    if capa:
        query = query.filter(VisorApiKeyAcceso.layers.op('?')(capa))
    if resultado:
        query = query.filter(VisorApiKeyAcceso.resultado == resultado)
    if endpoint:
        query = query.filter(VisorApiKeyAcceso.endpoint == endpoint)
    total = query.count()
    rows = (
        query.order_by(VisorApiKeyAcceso.timestamp.desc(), VisorApiKeyAcceso.id.desc())
        .offset((page - 1) * size)
        .limit(size)
        .all()
    )
    return VisorApiKeyAccesoPage(
        items=[VisorApiKeyAccesoResponse.model_validate(r) for r in rows],
        total=total,
        page=page,
        size=size,
    )


@router.delete("/{api_key_id}")
async def eliminar_api_key(
    api_key_id: int,
    db: Session = Depends(get_db),
    user: Usuario = Depends(verify_csrf),
    _: Usuario = Depends(require_role(["tetlamamakani"])),
):
    api_key = db.query(VisorApiKey).filter(VisorApiKey.id == api_key_id).first()
    if not api_key:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La llave no existe (o ya fue eliminada)")
    if api_key.estado != "revoked":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Solo se pueden eliminar llaves que ya fueron canceladas. Cancela la llave primero.",
        )
    db.delete(api_key)
    db.commit()
    return {"message": "Llave eliminada del listado"}


def _summary_from_meta(meta: dict | None) -> VisorApiKeyEmbedSummary | None:
    if not meta:
        return None
    payload = meta.get("payload") or {}
    if not isinstance(payload, dict):
        return None
    layers_list: list[str] = []
    raw_layers = payload.get("layers")
    if isinstance(raw_layers, list):
        for entry in raw_layers:
            if isinstance(entry, dict):
                slug = entry.get("slug")
                if isinstance(slug, str) and slug:
                    layers_list.append(slug)
    view = payload.get("view") if isinstance(payload.get("view"), dict) else None
    return VisorApiKeyEmbedSummary(layers=layers_list, view=view)


def _embed_to_response(embed: VisorApiKeyEmbed, meta: dict | None) -> VisorApiKeyEmbedResponse:
    pinned_until = None
    permanent = False
    kind = None
    share_exists = meta is not None
    if meta:
        kind = meta.get("kind")
        pinned_raw = meta.get("pinned_until") or meta.get("pinnedUntil")
        if pinned_raw:
            try:
                pinned_until = datetime.fromisoformat(pinned_raw.replace("Z", "+00:00"))
            except ValueError:
                pinned_until = None
            if pinned_until and pinned_until.year >= 9999:
                permanent = True
    return VisorApiKeyEmbedResponse(
        id=embed.id,
        api_key_id=embed.api_key_id,
        share_id=embed.share_id,
        label=embed.label,
        creado_por_user_id=embed.creado_por_user_id,
        creado_en=embed.creado_en,
        pinned_until=pinned_until,
        permanent=permanent,
        share_kind=kind,
        share_exists=share_exists,
        summary=_summary_from_meta(meta),
    )


@router.get("/{api_key_id}/embeds", response_model=list[VisorApiKeyEmbedResponse])
async def listar_embeds(
    api_key_id: int,
    db: Session = Depends(get_db),
):
    api_key = db.query(VisorApiKey).filter(VisorApiKey.id == api_key_id).first()
    if not api_key:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La llave no existe (o ya fue eliminada)")
    embeds = (
        db.query(VisorApiKeyEmbed)
        .filter(VisorApiKeyEmbed.api_key_id == api_key_id)
        .order_by(VisorApiKeyEmbed.creado_en.desc(), VisorApiKeyEmbed.id.desc())
        .all()
    )
    return [_embed_to_response(e, fetch_share_meta(e.share_id)) for e in embeds]


@router.post(
    "/{api_key_id}/embeds",
    response_model=VisorApiKeyEmbedResponse,
    status_code=status.HTTP_201_CREATED,
)
async def crear_embed(
    api_key_id: int,
    payload: VisorApiKeyEmbedCreate,
    db: Session = Depends(get_db),
    user: Usuario = Depends(verify_csrf),
    _: Usuario = Depends(require_role(["tetlamamakani"])),
):
    api_key = db.query(VisorApiKey).filter(VisorApiKey.id == api_key_id).first()
    if not api_key:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La llave no existe (o ya fue eliminada)")

    meta = fetch_share_meta(payload.share_id)
    if meta is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ese código de mapa no existe o ya expiró. Genera uno nuevo desde el visor Visor.",
        )

    existing = (
        db.query(VisorApiKeyEmbed)
        .filter(
            VisorApiKeyEmbed.api_key_id == api_key_id,
            VisorApiKeyEmbed.share_id == payload.share_id,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Este mapa ya está guardado en esta llave.",
        )

    embed = VisorApiKeyEmbed(
        api_key_id=api_key_id,
        share_id=payload.share_id,
        label=payload.label,
        creado_por_user_id=user.id if user else None,
    )
    db.add(embed)
    db.flush()
    _record_event(db, api_key, "embed_linked", user, payload={"shareId": payload.share_id, "label": payload.label})
    db.commit()
    db.refresh(embed)

    pin_share_permanent(payload.share_id)
    meta_after = fetch_share_meta(payload.share_id) or meta
    return _embed_to_response(embed, meta_after)


@router.post(
    "/{api_key_id}/embeds/from-layers",
    response_model=VisorApiKeyEmbedResponse,
    status_code=status.HTTP_201_CREATED,
)
async def crear_embed_from_layers(
    api_key_id: int,
    payload: VisorApiKeyEmbedFromLayers,
    db: Session = Depends(get_db),
    user: Usuario = Depends(verify_csrf),
    _: Usuario = Depends(require_role(["tetlamamakani"])),
):
    api_key = db.query(VisorApiKey).filter(VisorApiKey.id == api_key_id).first()
    if not api_key:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La llave no existe (o ya fue eliminada)")

    envelope_payload: dict = {
        "layers": [
            {"slug": entry.slug, **({"opacity": entry.opacity} if entry.opacity is not None else {})}
            for entry in payload.layers
        ],
    }
    if payload.view and any(v is not None for v in (payload.view.lon, payload.view.lat, payload.view.zoom)):
        view = {}
        if payload.view.lon is not None:
            view["lon"] = payload.view.lon
        if payload.view.lat is not None:
            view["lat"] = payload.view.lat
        if payload.view.zoom is not None:
            view["zoom"] = payload.view.zoom
        envelope_payload["view"] = view

    envelope = {"version": 1, "kind": "single", "payload": envelope_payload}
    share = create_share(envelope)
    if not share or not share.get("id"):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="No se pudo guardar el mapa en Visor. Intenta de nuevo.",
        )
    share_id = share["id"]

    existing = (
        db.query(VisorApiKeyEmbed)
        .filter(
            VisorApiKeyEmbed.api_key_id == api_key_id,
            VisorApiKeyEmbed.share_id == share_id,
        )
        .first()
    )
    if existing:
        meta_after = fetch_share_meta(share_id)
        return _embed_to_response(existing, meta_after)

    embed = VisorApiKeyEmbed(
        api_key_id=api_key_id,
        share_id=share_id,
        label=payload.label,
        creado_por_user_id=user.id if user else None,
    )
    db.add(embed)
    db.flush()
    _record_event(
        db,
        api_key,
        "embed_created_from_layers",
        user,
        payload={"shareId": share_id, "label": payload.label, "envelope": envelope_payload},
    )
    db.commit()
    db.refresh(embed)

    pin_share_permanent(share_id)
    meta_after = fetch_share_meta(share_id)
    return _embed_to_response(embed, meta_after)


@router.delete("/{api_key_id}/embeds/{share_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_embed(
    api_key_id: int,
    share_id: str,
    db: Session = Depends(get_db),
    user: Usuario = Depends(verify_csrf),
    _: Usuario = Depends(require_role(["tetlamamakani"])),
):
    api_key = db.query(VisorApiKey).filter(VisorApiKey.id == api_key_id).first()
    if not api_key:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La llave no existe (o ya fue eliminada)")

    embed = (
        db.query(VisorApiKeyEmbed)
        .filter(
            VisorApiKeyEmbed.api_key_id == api_key_id,
            VisorApiKeyEmbed.share_id == share_id,
        )
        .first()
    )
    if not embed:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ese mapa guardado no existe en esta llave")

    db.delete(embed)
    _record_event(db, api_key, "embed_unlinked", user, payload={"shareId": share_id})
    db.commit()

    remaining = (
        db.query(VisorApiKeyEmbed)
        .filter(VisorApiKeyEmbed.share_id == share_id)
        .count()
    )
    if remaining == 0:
        unpin_share(share_id)
    return None
