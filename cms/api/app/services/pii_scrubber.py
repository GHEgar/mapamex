"""Scrubber de PII para la telemetría del visor.

Recorre estructuras (dict/list/str) y enmascara datos personales (email,
teléfono, CURP, RFC, tarjetas) antes de persistir los `props` de un evento.
Diseñado para ser tolerante: nunca lanza; ante un valor no soportado lo deja igual.

API usada por `app.services.visor_telemetry`:
    patterns = _compile_patterns(None)
    scrubbed = _scrub_walk(props, patterns)
"""

from __future__ import annotations

import re
from typing import Any

_REDACTED = "[redacted]"

_DEFAULT_PATTERNS: list[str] = [
    r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}",
    r"\b[A-Z][AEIOUX][A-Z]{2}\d{6}[HM][A-Z]{5}[A-Z0-9]\d\b",
    r"\b[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}\b",
    r"\b(?:\d[ -]?){13,16}\b",
    r"\b(?:\+?52[\s-]?)?(?:\d[\s-]?){10}\b",
]


def _compile_patterns(extra: list[str] | None = None) -> list[re.Pattern[str]]:
    """Compila los patrones por defecto más los adicionales que se pasen."""
    sources = list(_DEFAULT_PATTERNS)
    if extra:
        sources.extend(extra)
    compiled: list[re.Pattern[str]] = []
    for src in sources:
        try:
            compiled.append(re.compile(src))
        except re.error:
            continue
    return compiled


def _scrub_str(text: str, patterns: list[re.Pattern[str]]) -> str:
    for pat in patterns:
        text = pat.sub(_REDACTED, text)
    return text


def _scrub_walk(value: Any, patterns: list[re.Pattern[str]]) -> Any:
    """Enmascara PII recursivamente en dict/list/str; el resto se devuelve igual."""
    if isinstance(value, str):
        return _scrub_str(value, patterns)
    if isinstance(value, dict):
        return {k: _scrub_walk(v, patterns) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [_scrub_walk(v, patterns) for v in value]
    return value
