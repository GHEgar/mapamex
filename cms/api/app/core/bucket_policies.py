"""Políticas por bucket: prefijos ocultos en el listado del CMS y lista
canónica de buckets registrados.

Cada feature que reserva una sub-ruta dentro de un bucket compartido (p. ej.
reportes guarda screenshots en `cms/reportes/`) registra aquí su prefijo
para que la página de Multimedia no lo exponga al usuario final.

`KNOWN_STORAGE_BUCKETS` enumera los buckets registrables desde `storage_buckets`.
Es la fuente que usan los validators de schemas (eventos, home, etc.) para
aceptar paths relativos del storage en formato `bucket/object` sin habilitar
escritura de paths arbitrarios. La lista coincide con la documentada en
`docs/context.md` §"Bucket compartido `mapamex`".
"""

from __future__ import annotations

GLOBAL_HIDDEN_PREFIXES: tuple[str, ...] = (".thumbs/",)

HIDDEN_PREFIXES_BY_BUCKET: dict[str, tuple[str, ...]] = {
    "cms": ("reportes/",),
}


KNOWN_STORAGE_BUCKETS: frozenset[str] = frozenset({
    "portal",
    "visor",
    "mapamex",
    "cms",
    "database",
})


def get_hidden_prefixes(storage_bucket: str) -> tuple[str, ...]:
    return GLOBAL_HIDDEN_PREFIXES + HIDDEN_PREFIXES_BY_BUCKET.get(storage_bucket, ())
