from __future__ import annotations

import logging
from datetime import date

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.settings import get_settings
from app.models.visor_mcp_event import VisorMcpEvent
from app.schemas.visor_mcp import VisorMcpEventBatch

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/internal/visor/mcp", tags=["visor internal"])


def _require_internal_token(
    x_internal_token: str | None = Header(default=None, alias="X-Internal-Token"),
) -> None:
    settings = get_settings()
    expected = settings.visor_internal_token
    if not expected:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="VISOR_INTERNAL_TOKEN no configurado en cms-api",
        )
    if not x_internal_token or x_internal_token != expected:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token interno inválido",
        )


@router.post("/events")
async def registrar_eventos_mcp_batch(
    payload: VisorMcpEventBatch,
    db: Session = Depends(get_db),
    _: None = Depends(_require_internal_token),
):
    if not payload.items:
        return {"ok": True, "inserts": 0}
    inserts = 0
    for item in payload.items:
        ts = item.timestamp
        dia = ts.date() if hasattr(ts, "date") else date.today()
        db.add(VisorMcpEvent(
            timestamp=ts,
            dia=dia,
            method=item.method[:40],
            tool=(item.tool or None) and item.tool[:80],
            status=item.status[:20],
            error_code=item.error_code,
            duration_ms=item.duration_ms,
            bytes_out=item.bytes_out,
            session_hash=(item.session_hash or None) and item.session_hash[:64],
            ip_hash=(item.ip_hash or None) and item.ip_hash[:64],
            client_name=(item.client_name or None) and item.client_name[:80],
            client_version=(item.client_version or None) and item.client_version[:40],
        ))
        inserts += 1
    db.commit()
    return {"ok": True, "inserts": inserts}
