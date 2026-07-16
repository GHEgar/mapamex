# CMS — panel admin MapaMex + API
# dev: docker-compose.dev.yml + .env.development / prod: docker-compose.yml + .env.production

CMS_ENV_DEV      := .env.development
CMS_ENV_PROD     := .env.production
CMS_COMPOSE_DEV  := docker compose --env-file $(CMS_ENV_DEV) -f docker-compose.dev.yml
CMS_COMPOSE_PROD := docker compose --env-file $(CMS_ENV_PROD) -f docker-compose.yml
CMS_TARJETITAS_DIR := backups/tarjetitas

.PHONY: help-cms cms-up cms-build cms-deploy cms-down cms-logs cms-shell-api cms-shell-admin \
        cms-setup cms-setup-hooks cms-test-backend cms-clean \
        cms-backup-tarjetitas cms-restore-tarjetitas cms-refresh-visor-stats cms-purge-visor-events

help-cms:
	@echo -e "$(C_BOLD)cms$(C_RESET) — panel admin + API"
	@echo "  make cms-up                     Entorno de desarrollo (segundo plano)"
	@echo "  make cms-build                  Rebuild + up del entorno de desarrollo"
	@echo "  make cms-deploy                 Produccion: build + up (.env.production)"
	@echo "  make cms-down                   Detener dev y prod"
	@echo "  make cms-logs                   Logs de desarrollo en tiempo real"
	@echo "  make cms-shell-api              Terminal del contenedor API (dev)"
	@echo "  make cms-shell-admin            Terminal del contenedor Admin (dev)"
	@echo "  make cms-setup                  Crea archivos .env iniciales si no existen"
	@echo "  make cms-setup-hooks            Configura git hooks (core.hooksPath)"
	@echo "  make cms-test-backend           Lint + pytest del backend (mismo entorno que CI)"
	@echo "  make cms-clean                  Elimina contenedores, redes y volumenes (¡Cuidado!)"
	@echo "  make cms-backup-tarjetitas      Exporta infobox_config de TODAS las capas (prod)"
	@echo "  make cms-restore-tarjetitas [FILE=...]  Aplica un export de tarjetitas (prod; backup previo + confirmacion)"
	@echo "  make cms-refresh-visor-stats    Recomputa rollups diarios de visor-stats (prod)"
	@echo "  make cms-purge-visor-events     Purga eventos crudos mas viejos que la retencion (prod)"
	@echo ""

cms-up:
	@echo -e "$(C_GREEN)cms: iniciando entorno de desarrollo...$(C_RESET)"
	@cd $(CMS_DIR) && COMPOSE_BAKE=true API_ENV_FILE=$(CMS_ENV_DEV) $(CMS_COMPOSE_DEV) up -d

cms-build:
	@echo -e "$(C_GREEN)cms: reconstruyendo entorno de desarrollo...$(C_RESET)"
	@cd $(CMS_DIR) && COMPOSE_BAKE=true API_ENV_FILE=$(CMS_ENV_DEV) $(CMS_COMPOSE_DEV) up -d --build

cms-deploy: ensure-network
	@echo -e "$(C_GREEN)cms: deploy de produccion$(C_RESET)"
ifeq ($(DEPLOY_MODE),pull)
	@cd $(CMS_DIR) && API_ENV_FILE=$(CMS_ENV_PROD) $(CMS_COMPOSE_PROD) pull
else
	@cd $(CMS_DIR) && COMPOSE_BAKE=true API_ENV_FILE=$(CMS_ENV_PROD) $(CMS_COMPOSE_PROD) build
endif
	@cd $(CMS_DIR) && API_ENV_FILE=$(CMS_ENV_PROD) $(CMS_COMPOSE_PROD) up -d
	@echo -e "$(C_GREEN)cms: deploy completado$(C_RESET)"

cms-down:
	@echo -e "$(C_YELLOW)cms: deteniendo dev y prod...$(C_RESET)"
	@cd $(CMS_DIR) && { API_ENV_FILE=$(CMS_ENV_DEV) $(CMS_COMPOSE_DEV) down 2>/dev/null || true; }
	@cd $(CMS_DIR) && { API_ENV_FILE=$(CMS_ENV_PROD) $(CMS_COMPOSE_PROD) down 2>/dev/null || true; }

cms-logs:
	@cd $(CMS_DIR) && API_ENV_FILE=$(CMS_ENV_DEV) $(CMS_COMPOSE_DEV) logs -f

cms-shell-api:
	@cd $(CMS_DIR) && API_ENV_FILE=$(CMS_ENV_DEV) $(CMS_COMPOSE_DEV) exec api /bin/bash

cms-shell-admin:
	@cd $(CMS_DIR) && API_ENV_FILE=$(CMS_ENV_DEV) $(CMS_COMPOSE_DEV) exec admin /bin/sh

cms-setup-hooks:
	@cd $(CMS_DIR) && git config core.hooksPath .githooks
	@echo -e "$(C_GREEN)Hooks configurados en .githooks/$(C_RESET)"

## Reproduce el job 'backend / test' de CI (ruff + pytest) localmente.
## Util para validar antes de hacer push (el pre-push hook lo invoca).
cms-test-backend:
	@cd $(CMS_DIR)/api && ruff check --no-cache app tests
	@cd $(CMS_DIR) && ./api/scripts/run-tests.sh

cms-clean:
	@echo -e "$(C_YELLOW)cms: limpiando sistema (contenedores, redes y volúmenes)...$(C_RESET)"
	@cd $(CMS_DIR) && docker compose -f docker-compose.dev.yml down -v --remove-orphans || true
	@cd $(CMS_DIR) && docker compose -f docker-compose.yml down -v --remove-orphans || true

cms-setup:
	@cd $(CMS_DIR) && if [ ! -f .env.development ]; then \
		cp .env.development.example .env.development; \
		echo -e "$(C_GREEN)Creado .env.development desde ejemplo$(C_RESET)"; \
	else \
		echo -e "$(C_YELLOW).env.development ya existe$(C_RESET)"; \
	fi
	@cd $(CMS_DIR) && if [ ! -f .env.production ]; then \
		cp .env.production.example .env.production; \
		echo -e "$(C_GREEN)Creado .env.production desde ejemplo$(C_RESET)"; \
	else \
		echo -e "$(C_YELLOW).env.production ya existe$(C_RESET)"; \
	fi

# =============================================================================
# TARJETITAS (infobox_config en Database)
# =============================================================================

# Lee DATABASE_GIS_URL EXCLUSIVAMENTE de .env.production.
# Las tarjetitas siempre se mueven contra prod (fuente de verdad); usar dev
# por accidente puede sobrescribir capas reales. Override consciente:
# DATABASE_URL='postgres://...' make ...
define cms_resolve_database_url
DE_URL="$${DATABASE_URL:-}"; \
if [ -z "$$DE_URL" ]; then \
	f=$(CMS_ENV_PROD); \
	if [ -f "$$f" ]; then \
		DE_URL="$$(grep -E '^DATABASE_GIS_URL=' "$$f" 2>/dev/null | head -1 | sed -E 's/^DATABASE_GIS_URL=//; s/^[\"\x27]//; s/[\"\x27]$$//' || true)"; \
		if [ -n "$$DE_URL" ]; then echo "[tarjetitas] usando DATABASE_GIS_URL de $$f"; fi; \
	fi; \
fi; \
if [ -z "$$DE_URL" ]; then \
	echo -e "$(C_YELLOW)No se encontro DATABASE_GIS_URL en $(CMS_ENV_PROD) (las tarjetitas solo se leen de ese archivo).$(C_RESET)"; \
	echo "Uso: DATABASE_URL='postgres://...' make $@"; \
	exit 1; \
fi
endef

## Exporta infobox_config de visor.layers a backups/tarjetitas/ (JSON + SQL).
## Override: DATABASE_URL='postgres://...' make cms-backup-tarjetitas
cms-backup-tarjetitas:
	@cd $(CMS_DIR) && mkdir -p $(CMS_TARJETITAS_DIR) && \
	$(cms_resolve_database_url); \
	DATABASE_URL="$$DE_URL" OUT_DIR=$(CMS_TARJETITAS_DIR) ./scripts/database-export-infobox.sh

## Aplica un export de tarjetitas en la BD destino. Hace backup reverso primero.
## Sin FILE: selector interactivo; busca en restore/ primero, fallback a backups/tarjetitas/.
## Con FILE: usa el archivo explicito (saltea el selector).
## Override de URL: DATABASE_URL='postgres://...' make cms-restore-tarjetitas [FILE=...]
cms-restore-tarjetitas:
	@cd $(CMS_DIR) && \
	if [ -n "$(FILE)" ]; then \
		FILE_SEL="$(FILE)"; \
	else \
		FILE_SEL=$$(./scripts/pick-tarjetita.sh) || exit $$?; \
	fi; \
	if [ -z "$$FILE_SEL" ]; then \
		echo -e "$(C_YELLOW)No se selecciono ningun archivo.$(C_RESET)"; \
		exit 1; \
	fi; \
	$(cms_resolve_database_url); \
	DATABASE_URL="$$DE_URL" ./scripts/database-apply-infobox.sh "$$FILE_SEL"

# =============================================================================
# VISOR STATS (telemetria, siempre contra produccion)
# =============================================================================

## Recomputa los rollups diarios persistentes de visor-stats. Se invoca cada
## 30 min por cron en prod; este target es para refresh manual.
cms-refresh-visor-stats:
	@cd $(CMS_DIR) && API_ENV_FILE=$(CMS_ENV_PROD) $(CMS_COMPOSE_PROD) exec -T api python scripts/refresh_visor_stats.py

## Purga eventos crudos mas viejos que la retencion configurada (default 90 dias).
## Usa VISOR_EVENTS_RETENTION_DAYS / VISOR_SESSIONS_RETENTION_DAYS para ajustar.
cms-purge-visor-events:
	@cd $(CMS_DIR) && API_ENV_FILE=$(CMS_ENV_PROD) $(CMS_COMPOSE_PROD) exec -T api python scripts/purge_visor_events.py
