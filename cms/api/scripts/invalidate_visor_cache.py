"""Invalida el caché público del visor (eventos, home, basemaps).

Los endpoints públicos cachean su payload en Redis bajo una versión que solo
se bumpea desde las rutas admin del CMS. Una migración que inserta o modifica
datos públicos (por ejemplo un seed de mapas base) escribe directo en Postgres
y deja la versión intacta: el visor sigue recibiendo el payload viejo hasta que
alguien guarda algo desde el panel. Este script cierra ese hueco y lo invoca
`make cms-migrate` al terminar.
"""
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))

from app.services.visor_public_cache import (
    get_versions,
    notify_basemaps_changed,
    notify_eventos_changed,
    notify_home_changed,
)


def main() -> None:
    notify_eventos_changed()
    notify_home_changed()
    notify_basemaps_changed()
    versions = get_versions()
    for scope, version in versions.items():
        print(f"  {scope:<10} {version}")


if __name__ == "__main__":
    main()
