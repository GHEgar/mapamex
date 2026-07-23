from __future__ import annotations

import threading
from collections import defaultdict

from fastapi import APIRouter, Response
from prometheus_client import REGISTRY, generate_latest

_counters: dict[str, int] = defaultdict(int)
_lock = threading.Lock()

COUNTER_RATE_LIMIT_HITS = 'cms_rate_limit_hits_total'
COUNTER_TREE_NOTIFY = 'cms_tree_notify_total'
COUNTER_TREE_NOTIFY_FAILED = 'cms_tree_notify_failed_total'
COUNTER_GEOSERVER_CALLS = 'cms_geoserver_calls_total'
COUNTER_LAYER_WRITES = 'cms_layer_writes_total'
COUNTER_LAYER_READS = 'cms_layer_reads_total'
COUNTER_PROJECT_WRITES = 'cms_project_writes_total'
COUNTER_USER_WRITES = 'cms_user_writes_total'
COUNTER_MEDIA_BUCKET_WRITES = 'cms_media_bucket_writes_total'
COUNTER_MEDIA_UPLOADS = 'cms_media_uploads_total'
COUNTER_MEDIA_DELETES = 'cms_media_deletes_total'
COUNTER_LAYER_METADATA_WRITES = 'cms_layer_metadata_writes_total'
COUNTER_BULK_INGEST_UPLOADS = 'cms_bulk_ingest_uploads_total'
COUNTER_BULK_INGEST_APPLIES = 'cms_bulk_ingest_applies_total'
COUNTER_EVENTO_WRITES = 'cms_evento_writes_total'
COUNTER_EVENTO_PUBLISH = 'cms_evento_publish_total'
COUNTER_HOME_WRITES = 'cms_home_writes_total'
COUNTER_VISOR_SHARE_WRITES = 'cms_visor_share_writes_total'
COUNTER_LOGIN_SUCCESS = 'cms_login_success_total'
COUNTER_LOGIN_FAILED = 'cms_login_failed_total'
COUNTER_LOGIN_LOCKED = 'cms_login_locked_total'
COUNTER_REFRESH_SUCCESS = 'cms_refresh_success_total'
COUNTER_REFRESH_REUSED = 'cms_refresh_reuse_detected_total'


def incr(name: str, amount: int = 1) -> None:
    with _lock:
        _counters[name] += amount


def _render_prometheus() -> str:
    lines: list[str] = []
    for name, value in sorted(_counters.items()):
        lines.append(f'# TYPE {name} counter')
        lines.append(f'{name} {value}')
    return '\n'.join(lines) + '\n'


router = APIRouter(tags=['metrics'])


@router.get('/metrics', include_in_schema=False)
async def metrics() -> Response:
    body = _render_prometheus() + generate_latest(REGISTRY).decode('utf-8')
    return Response(content=body, media_type='text/plain; version=0.0.4')
