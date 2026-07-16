# MapaMex

Plataforma multicapa de México: visor geoespacial y su ecosistema de servicios (monorepo).
El **gateway** (nginx) es la única entrada pública; los servicios se comunican entre sí por la
red Docker `mapamex-network`.

Servicios: `visor` (mapa) · `cms` (panel de administración) · `storage` (archivos) ·
`gateway` (entrada) · `database` (PostGIS) · `geoserver` (capas).

## Requisitos

- Docker + Docker Compose v2
- `make`, `git`, `openssl`

## Primer arranque

No hay un comando único: hay que crear la configuración local (secretos y certificados **no**
vienen en el repositorio, por seguridad). Resumen:

```bash
# 1. Configuración: crea los .env desde las plantillas .env.example
make cms-setup storage-setup
# database, gateway y geoserver: cp <servicio>/.env.example <servicio>/.env

# 2. Genera secretos y certificados locales
openssl rand -base64 32        # usa la salida para cada PASSWORD/SECRET_KEY/TOKEN en los .env
make database-certs            # certificados TLS de la base de datos

# 3. Levanta todo en orden
make ecosystem-up
```

> Los pasos completos (storage, migraciones, usuario admin, datos) están en el runbook de
> setup del repositorio **mapamex-docs** (`RUNBOOK-SETUP.md`). Esta guía cubre lo esencial;
> el detalle vive ahí.

## Uso diario

```bash
make ecosystem-up        # levantar todo (orden: storage→database→geoserver→cms→visor→gateway)
make ecosystem-status    # ver estado de los servicios
make ecosystem-down      # detener todo
make ecosystem-backup    # respaldar los servicios con datos
make help                # lista de comandos del ecosistema
```

Acceso local tras arrancar: `https://localhost` (visor) y `https://localhost/administrador`
(panel del CMS).

### Por servicio

Cada servicio tiene sus propios comandos `make <servicio>-<acción>` (ver `make help`):

- `make <servicio>-up` — modo desarrollo (solo `cms` y `visor`)
- `make <servicio>-deploy` — modo producción
- `make <servicio>-logs` / `make <servicio>-down`

## Documentación

La documentación técnica (arquitectura, diagramas, runbooks de base de datos, tiles, deploy y
seguridad) vive en el repositorio **mapamex-docs**. Si trabajas en el proyecto, clónalo al lado:

```bash
git clone git@github.com:GHEgar/mapamex-docs.git ../mapamex-docs
```

## Licencia

**AGPL-3.0-only** para todo el monorepo (ver `LICENSE`). Derivado de un ecosistema recibido
bajo MIT; el aviso original se conserva en `NOTICE`.
