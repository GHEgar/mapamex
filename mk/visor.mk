# Visor — frontend (React+Vite+OpenLayers) + backend (FastAPI)
# dev: perfil dev con hot-reload / prod: build de frontend + nginx + gunicorn

VISOR_COMPOSE_DEV  := docker compose -p visor-dev --env-file .env.development
VISOR_COMPOSE_PROD := docker compose -p visor -f docker-compose.yml --env-file .env.production

BACKEND_HOST ?= http://localhost:8000

.PHONY: help-visor visor-up visor-deploy visor-down visor-logs visor-status visor-clean \
        visor-setup-hooks visor-refresh-layer-tree visor-mcp

help-visor:
	@echo -e "$(C_BOLD)visor$(C_RESET) — visor de mapas (frontend + backend)"
	@echo "  make visor-up                 Modo desarrollo (Vite + backend hot-reload)"
	@echo "  make visor-deploy             Produccion: backend + mcp (el frontend lo sirve el gateway; make gateway-deploy)"
	@echo "  make visor-down               Detener dev y prod"
	@echo "  make visor-logs               Logs de desarrollo"
	@echo "  make visor-status             Estado de los servicios (dev y prod)"
	@echo "  make visor-clean              Detener servicios y limpiar todo"
	@echo "  make visor-setup-hooks        Configurar git hooks del proyecto"
	@echo "  make visor-refresh-layer-tree Regenerar cache del arbol de capas en DB"
	@echo ""

visor-setup-hooks:
	@cd $(VISOR_DIR) && git config core.hooksPath .githooks
	@echo "Hooks configurados en .githooks/"

visor-up: visor-setup-hooks
	@echo ""
	@echo "visor: levantando servicios de desarrollo..."
	@cd $(VISOR_DIR) && $(VISOR_COMPOSE_DEV) --profile dev up -d
	@echo ""
	@echo "Frontend (Vite):  http://localhost:3006"
	@echo "Backend API:      http://localhost:8000"
	@echo "Backend Docs:     http://localhost:8000/docs"
	@echo ""
	@echo "Hot-reload activado en frontend y backend"

visor-deploy: ensure-network
	@echo "visor: desplegando en produccion..."
ifeq ($(DEPLOY_MODE),pull)
	@cd $(VISOR_DIR) && $(VISOR_COMPOSE_PROD) pull
endif
	@cd $(VISOR_DIR) && $(VISOR_COMPOSE_PROD) up -d $(COMPOSE_BUILD_FLAG) --force-recreate
	@echo "visor: deploy completado"
	@created=$$(docker image inspect gateway-nginx:local --format '{{.Created}}' 2>/dev/null || true); \
	 if [ -n "$$created" ]; then \
	     epoch=$$(date -d "$$created" +%s 2>/dev/null || true); \
	     if [ -n "$$epoch" ]; then \
	         ref=$$(mktemp); touch -d "@$$epoch" "$$ref"; \
	         changed=$$(find $(VISOR_DIR)/frontend/src $(VISOR_DIR)/frontend/public $(VISOR_DIR)/frontend/index.html $(VISOR_DIR)/frontend/package.json -newer "$$ref" -print -quit 2>/dev/null || true); \
	         rm -f "$$ref"; \
	         if [ -n "$$changed" ]; then \
	             echo ""; \
	             echo -e "  $(C_YELLOW)ATENCION: visor/frontend cambio DESPUES del ultimo build del gateway.$(C_RESET)"; \
	             echo -e "  $(C_YELLOW)visor-deploy NO publica el frontend (solo backend + mcp).$(C_RESET)"; \
	             echo -e "  $(C_YELLOW)Para publicar el frontend corre:  make gateway-deploy$(C_RESET)"; \
	             echo ""; \
	         fi; \
	     fi; \
	 fi

visor-down:
	@cd $(VISOR_DIR) && { $(VISOR_COMPOSE_DEV) --profile dev down 2>/dev/null || true; }
	@cd $(VISOR_DIR) && { $(VISOR_COMPOSE_PROD) --profile production --profile build down 2>/dev/null || true; }
	@echo "visor: servicios detenidos (dev y prod)"

visor-clean: visor-down
	@cd $(VISOR_DIR) && { $(VISOR_COMPOSE_DEV) --profile dev down -v --remove-orphans 2>/dev/null || true; }
	@cd $(VISOR_DIR) && { $(VISOR_COMPOSE_PROD) --profile production --profile build down -v --remove-orphans 2>/dev/null || true; }
	@cd $(VISOR_DIR) && { docker run --rm -v "$$(pwd)/frontend/dist":/dist alpine sh -c "rm -rf /dist/*" 2>/dev/null || true; }
	@cd $(VISOR_DIR) && rm -rf frontend/dist frontend/node_modules
	@echo "visor: limpieza completada"

visor-logs:
	@cd $(VISOR_DIR) && $(VISOR_COMPOSE_DEV) --profile dev logs -f

visor-status:
	@echo "=== DESARROLLO ==="
	@cd $(VISOR_DIR) && { $(VISOR_COMPOSE_DEV) ps 2>/dev/null || echo "  No hay servicios de desarrollo corriendo"; }
	@echo ""
	@echo "=== PRODUCCION ==="
	@cd $(VISOR_DIR) && { $(VISOR_COMPOSE_PROD) ps 2>/dev/null || echo "  No hay servicios de produccion corriendo"; }

visor-refresh-layer-tree:
	@if docker ps --format '{{.Names}}' | grep -q '^database-jobs$$'; then \
		$(MAKE) database-refresh-layer-tree; \
	else \
		echo "Fallback: trigger vía endpoint del backend"; \
		curl -fsS -X POST $(BACKEND_HOST)/layers/refresh-cache | python3 -m json.tool; \
	fi

visor-mcp:
	@docker exec -i -e PYTHONPATH=/app visor-visor-mcp-1 python servers/visor.py
