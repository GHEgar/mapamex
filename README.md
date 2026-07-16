# MapaMex

Plataforma multicapa de México: visor geoespacial y su ecosistema de servicios (monorepo).
El **gateway** (nginx) es la entrada pública; los servicios se unen por la red `mapamex-network`.

## Ecosistema (desde la raíz)

```bash
make ecosystem-up        # levantar todo en orden topológico
make ecosystem-status    # estado (git + docker)
make ecosystem-down      # detener todo
make ecosystem-backup    # respaldar servicios con estado
```

Servicios: `visor` · `cms` · `storage` · `gateway` · `database` · `geoserver`.
Todos los comandos viven en el Makefile de la raíz (fragmentos en `mk/`), con targets
`<servicio>-<acción>` (`make help` lista todo). Convención: `<servicio>-up` = desarrollo,
`<servicio>-deploy` = producción; database, storage y geoserver solo tienen `deploy`.

## Licencia

**AGPL-3.0-only** para todo el monorepo (ver `LICENSE`). Derivado de un ecosistema
recibido bajo MIT; el aviso original se conserva en `NOTICE`.
