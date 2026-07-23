import hashlib
import json
import logging
import secrets
import time
import uuid

from app.core.cache import redis_client
from app.core.settings import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

GRACE_SECONDS = 30
ROTATE_OK = "ok"
ROTATE_REUSED = "reused"
ROTATE_INVALID = "invalid"

_TOK_KEY = "rt:tok:{}"
_FAM_KEY = "rt:fam:{}"
_USER_KEY = "rt:user:{}"


def _ttl_seconds() -> int:
    return settings.refresh_token_expire_minutes * 60


def _now() -> float:
    return time.time()


def _hash(raw: str) -> str:
    return hashlib.sha256(raw.encode()).hexdigest()


def _mint_in_family(username: str, family: str) -> str:
    raw = secrets.token_urlsafe(32)
    ttl = _ttl_seconds()
    redis_client.setex(
        _TOK_KEY.format(_hash(raw)),
        ttl,
        json.dumps({"u": username, "f": family, "used": False}),
    )
    fam_key = _FAM_KEY.format(family)
    redis_client.sadd(fam_key, _hash(raw))
    redis_client.expire(fam_key, ttl)
    user_key = _USER_KEY.format(username)
    redis_client.sadd(user_key, family)
    redis_client.expire(user_key, ttl)
    return raw


def issue_refresh_token(username: str) -> str | None:
    try:
        return _mint_in_family(username, uuid.uuid4().hex)
    except Exception as exc:
        logger.warning("refresh issue redis error user=%s: %s", username, exc)
        return None


def rotate_refresh_token(raw: str) -> tuple[str, str | None, str | None]:
    try:
        key = _TOK_KEY.format(_hash(raw))
        data_raw = redis_client.get(key)
        if not data_raw:
            return (ROTATE_INVALID, None, None)
        data = json.loads(data_raw)
        username = data["u"]
        family = data["f"]
        if data.get("used"):
            if _now() - (data.get("used_at") or 0) <= GRACE_SECONDS:
                return (ROTATE_OK, _mint_in_family(username, family), username)
            _revoke_family(username, family)
            return (ROTATE_REUSED, None, username)
        data["used"] = True
        data["used_at"] = _now()
        redis_client.setex(key, _ttl_seconds(), json.dumps(data))
        return (ROTATE_OK, _mint_in_family(username, family), username)
    except Exception as exc:
        logger.warning("refresh rotate redis error: %s", exc)
        return (ROTATE_INVALID, None, None)


def _revoke_family(username: str, family: str) -> None:
    fam_key = _FAM_KEY.format(family)
    hashes = list(redis_client.smembers(fam_key) or [])
    if hashes:
        redis_client.delete(*[_TOK_KEY.format(h) for h in hashes])
    redis_client.delete(fam_key)
    redis_client.srem(_USER_KEY.format(username), family)


def revoke_refresh_token(raw: str) -> None:
    try:
        data_raw = redis_client.get(_TOK_KEY.format(_hash(raw)))
        if not data_raw:
            return
        data = json.loads(data_raw)
        _revoke_family(data["u"], data["f"])
    except Exception as exc:
        logger.warning("refresh revoke redis error: %s", exc)


def revoke_user_refresh_tokens(username: str) -> None:
    try:
        user_key = _USER_KEY.format(username)
        for family in list(redis_client.smembers(user_key) or []):
            _revoke_family(username, family)
        redis_client.delete(user_key)
    except Exception as exc:
        logger.warning("refresh revoke_user redis error user=%s: %s", username, exc)
