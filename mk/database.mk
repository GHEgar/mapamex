# Database — Postgres/PostGIS + pg-backup + jobs (Alembic)
# El .env del servicio se carga por receta (no global, para no contaminar al resto del monorepo).

define database_load_env
if [ -f .env ]; then set -a; . ./.env; set +a; fi
endef

# Las migraciones viven DENTRO de la imagen de jobs: hay que resincronizarla antes de migrar.
# En el servidor eso es un pull; en local, un build. El guard sobre DATABASE_JOBS_IMAGE cubre
# un .env.images anterior a que se fijara esa imagen: sin la variable, cae a build.
JOBS_SYNC := $(if $(and $(filter pull,$(DEPLOY_MODE)),$(DATABASE_JOBS_IMAGE)),pull,build)

.PHONY: help-database database-deploy database-down database-build database-certs \
        database-logs database-logs-primary database-logs-backup database-logs-jobs \
        database-shell database-backup database-restore database-restore-cms database-restore-local database-clean \
        database-prod-migration database-migrate database-migrate-status _database-migrate-report \
        database-refresh-periodicity database-refresh-layer-tree database-refresh-layer-stats \
        database-refresh-municipios database-refresh-all database-check-periodicity \
        database-ingest-metadata

help-database:
	@echo -e "$(C_BOLD)database$(C_RESET) — Postgres/PostGIS + pooling + jobs"
	@echo "  make database-deploy          Certs + build + up"
	@echo "  make database-down            Detener todos los servicios"
	@echo "  make database-build           Reconstruir imagenes sin cache (escape hatch)"
	@echo "  make database-logs            Logs de todos los servicios"
	@echo "  make database-logs-primary    Logs del primary"
	@echo "  make database-logs-backup     Logs del backup"
	@echo "  make database-logs-jobs       Logs del cron en database-jobs"
	@echo "  make database-shell           Consola psql en primary"
	@echo "  make database-backup          Respaldo manual de BACKUP_DBS (gis + cms)"
	@echo "  make database-restore         Restaurar dump (auto-detecta si solo hay un archivo; DB=<nombre> para otra BD)"
	@echo "  make database-restore-cms     Restaurar el dump mapamex_cms_* mas reciente en la BD del CMS"
	@echo "  make database-certs           Generar certificados SSL (solo primera vez)"
	@echo "  make database-clean           Eliminar volumenes (DESTRUCTIVO)"
	@echo "  make database-prod-migration  Bootstrap idempotente + alembic upgrade head."
	@echo "                                Default: with-etl (pull del Sheet activo, fase de testing)."
	@echo "                                Override: make database-prod-migration PROD_MIGRATION_FLAGS=\"--skip-etl\""
	@echo "  make database-migrate         Rebuild de imagen jobs + alembic upgrade head (estado antes/despues)"
	@echo "  make database-migrate-status  Estado de migraciones: resalta la actual y las pendientes"
	@echo "  make database-refresh-periodicity  Refrescar tabla de periodicidad (SQL)"
	@echo "  make database-refresh-layer-tree   Refrescar cache del arbol de capas Visor"
	@echo "  make database-refresh-layer-stats  Refrescar stats (numeralia) del catalogo"
	@echo "  make database-refresh-municipios   Refrescar MV visor.municipios desde mapa_base"
	@echo "  make database-refresh-all          Ejecutar todos los refresh en orden"
	@echo "  make database-check-periodicity    Verificar si periodicidad esta al dia"
	@echo "  make database-ingest-metadata      Ingesta upsert de metadatos a layer_metadata desde CSV."
	@echo "                                     Uso: make database-ingest-metadata DEP=<dep> SOURCE=<path|url> [EXTRA=...]"
	@echo "                                     EXTRA: --apply | --review --apply | --plan-out /tmp/plan.json"
	@echo "                                     Sin --apply: dry-run (no toca DB). Sin DEP/SOURCE: imprime ayuda."
	@echo ""

database-certs:
	@cd $(DATABASE_DIR) && if [ -f postgres/certs/server.crt ] && [ -f postgres/certs/server.key ] && [ -f postgres/certs/ca.crt ]; then \
		echo "Certificados SSL ya existen, omitiendo generacion."; \
	else \
		echo "Generando certificados SSL..."; \
		mkdir -p postgres/certs; \
		openssl req -new -x509 -days 3650 -nodes \
			-keyout postgres/certs/ca.key \
			-out postgres/certs/ca.crt \
			-subj "/CN=database-ca"; \
		openssl req -new -nodes \
			-keyout postgres/certs/server.key \
			-out postgres/certs/server.csr \
			-subj "/CN=postgres-primary"; \
		openssl x509 -req -days 730 \
			-in postgres/certs/server.csr \
			-CA postgres/certs/ca.crt \
			-CAkey postgres/certs/ca.key \
			-CAcreateserial \
			-out postgres/certs/server.crt; \
		rm -f postgres/certs/server.csr postgres/certs/ca.srl; \
		chmod 600 postgres/certs/ca.key postgres/certs/server.key; \
		chmod 644 postgres/certs/ca.crt postgres/certs/server.crt; \
		echo "Certificados SSL generados en postgres/certs/"; \
	fi

database-deploy: database-certs
ifeq ($(JOBS_SYNC),pull)
	@cd $(DATABASE_DIR) && docker compose pull pg-backup jobs
endif
	@cd $(DATABASE_DIR) && docker compose up -d $(COMPOSE_BUILD_FLAG)

database-down:
	@cd $(DATABASE_DIR) && docker compose down

database-build:
	@cd $(DATABASE_DIR) && docker compose build --no-cache

database-logs:
	@cd $(DATABASE_DIR) && docker compose logs -f --tail=100

database-logs-primary:
	@cd $(DATABASE_DIR) && docker compose logs -f --tail=100 postgres-primary

database-logs-backup:
	@cd $(DATABASE_DIR) && docker compose logs -f --tail=100 pg-backup

database-logs-jobs:
	@cd $(DATABASE_DIR) && docker compose exec jobs tail -n 100 -f /var/log/cron.log

database-shell:
	@cd $(DATABASE_DIR) && $(database_load_env); \
	 docker compose exec postgres-primary psql -U $$POSTGRES_USER -d $$POSTGRES_DB

database-backup:
	@cd $(DATABASE_DIR) && $(database_load_env); \
	 if [ "$${ENV:-}" = "production" ]; then \
		DEBUG=$${DEBUG:-} bash backup/do-backup.sh; \
	 else \
		echo "⚠️  Backup deshabilitado en ENV=$${ENV:-}. Solo disponible en production."; \
	 fi

database-restore:
	@cd $(DATABASE_DIR) && $(database_load_env); \
	 DEBUG=$${DEBUG:-} DB=$(DB) bash restore/do-restore.sh $(FILE)

database-restore-cms:
	@cd $(DATABASE_DIR) && $(database_load_env); \
	 f=$${FILE:-$$(ls -1t restore/mapamex_cms_*.sql.gz 2>/dev/null | head -1 | xargs -r basename)}; \
	 if [ -z "$$f" ]; then echo "No hay dumps mapamex_cms_*.sql.gz en restore/"; exit 1; fi; \
	 DEBUG=$${DEBUG:-} DB=mapamex_cms bash restore/do-restore.sh $$f

database-restore-local:
	@cd $(DATABASE_DIR) && $(database_load_env); \
	 PGHOST=$$DATABASE_DB_HOST PGPORT=$$DATABASE_DB_PORT \
	 PGUSER=$$DATABASE_DB_USER PGPASSWORD=$$DATABASE_DB_PASSWORD \
	 PGDATABASE=$$DATABASE_DB_NAME \
	 bash restore/do-restore-local.sh $(FILE)

database-clean:
	@echo "ATENCION: Esto eliminara todos los datos de PostgreSQL y backups"
	@read -p "Escribir 'si' para confirmar: " confirm && [ "$$confirm" = "si" ] || (echo "Cancelado" && exit 1)
	@cd $(DATABASE_DIR) && docker compose down -v

database-refresh-layer-tree:
	@echo "Refrescando arbol de capas..."
	@cd $(DATABASE_DIR) && docker compose exec -T jobs python run_refresh_layer_tree.py
	@echo "OK"

database-refresh-layer-stats:
	@echo "Refrescando numeralia dinamica..."
	@cd $(DATABASE_DIR) && docker compose exec -T jobs python run_refresh_layer_stats.py
	@echo "OK"

database-refresh-municipios:
	@echo "Refrescando visor.municipios (MV de MapaMex + INEGI)..."
	@cd $(DATABASE_DIR) && docker compose exec -T jobs python run_refresh_municipios.py
	@echo "OK"

database-refresh-all: database-refresh-periodicity database-refresh-layer-tree database-refresh-layer-stats database-refresh-municipios
	@echo "Todo refresh completado"

database-prod-migration:
	@cd $(DATABASE_DIR) && ./scripts/prod-migration.sh $(PROD_MIGRATION_FLAGS)

database-migrate:
	@printf "$(C_BOLD)» Sincronizando imagen de jobs con el repo...$(C_RESET)\n"
	@cd $(DATABASE_DIR) && docker compose $(JOBS_SYNC) jobs
	@cd $(DATABASE_DIR) && docker compose up -d jobs
	@printf "\n$(C_BOLD)» Estado antes de migrar$(C_RESET)\n"
	@$(MAKE) _database-migrate-report
	@printf "\n$(C_BOLD)» Aplicando migraciones alembic pendientes...$(C_RESET)\n"
	@cd $(DATABASE_DIR) && docker compose exec -T jobs alembic upgrade head
	@printf "\n$(C_BOLD)» Estado despues de migrar$(C_RESET)\n"
	@$(MAKE) _database-migrate-report
	@printf "$(C_GREEN)OK$(C_RESET)\n"

database-migrate-status:
	@printf "$(C_BOLD)» Estado de migraciones alembic$(C_RESET)\n"
	@$(MAKE) _database-migrate-report

_database-migrate-report:
	@cd $(DATABASE_DIR) && if ! err=$$(docker compose exec -T jobs true 2>&1 >/dev/null); then \
	  printf "  $(C_YELLOW)! No se pudo acceder al contenedor 'jobs'.$(C_RESET)\n"; \
	  reason=$$(printf '%s\n' "$$err" | grep -iE 'invalid spec|is not set|no such|not running|no configuration' | tail -1 || true); \
	  if [ -n "$$reason" ]; then printf "  $(C_DIM)Motivo: %s$(C_RESET)\n" "$$reason"; fi; \
	  if printf '%s' "$$err" | grep -qiE 'invalid spec|is not set'; then \
	    printf "  $(C_DIM)Falta cargar el .env (variables vacias). Verifica que exista .env en database/.$(C_RESET)\n"; \
	  else \
	    printf "  $(C_DIM)Levantalo con 'make database-deploy' o 'make database-migrate'.$(C_RESET)\n"; \
	  fi; \
	else \
	  docker compose exec -T jobs alembic history --indicate-current 2>/dev/null | awk \
	  -v cur='$(C_CYAN)' -v pen='$(C_YELLOW)' -v app='$(C_DIM)' \
	  -v grn='$(C_GREEN)' -v bold='$(C_BOLD)' -v rst='$(C_RESET)' '\
	  { if ($$0 ~ /^[[:space:]]*$$/) next; \
	    n++; arr[n]=$$0; if (index($$0,"(current)")>0) curidx=n } \
	  END { \
	    if (n==0) { printf "  %s(sin historial de migraciones)%s\n", app, rst; exit } \
	    if (curidx==0) pend=n; else pend=curidx-1; \
	    if (pend==0) printf "  %s* Al dia%s -- %d migracion(es) aplicada(s), 0 pendientes\n\n", grn, rst, n; \
	    else printf "  %s* %d pendiente(s)%s de %d totales\n\n", pen, pend, rst, n; \
	    for (i=1;i<=n;i++) { \
	      if (curidx>0 && i==curidx) printf "  %s%s>%s %s%s  (actual)%s\n", cur, bold, rst, cur, arr[i], rst; \
	      else if (curidx==0 || i<curidx) printf "  %so %s  (pendiente)%s\n", pen, arr[i], rst; \
	      else printf "  %s+ %s%s\n", app, arr[i], rst; \
	    } \
	  }' || true; \
	fi

database-refresh-periodicity:
	@echo "Refrescando periodicidad..."
	@cd $(DATABASE_DIR) && docker compose exec -T jobs python run_refresh_periodicity.py
	@echo "OK"

database-check-periodicity:
	@echo "Verificando periodicidad..."
	@cd $(DATABASE_DIR) && $(database_load_env); \
	 docker compose exec -T postgres-primary psql -U $$POSTGRES_USER -d $$POSTGRES_DB \
		-f /scripts/check_periodicity.sql -q

database-ingest-metadata:
	@cd $(DATABASE_DIR) && if [ -z "$(DEP)" ] || [ -z "$(SOURCE)" ]; then \
		echo "Uso: make database-ingest-metadata DEP=<dependencia> SOURCE=<path|url> [EXTRA='--apply']"; \
		echo "Ejemplos:"; \
		echo "  make database-ingest-metadata DEP=sct SOURCE=/tmp/sct.csv"; \
		echo "  make database-ingest-metadata DEP=sct SOURCE=/tmp/sct.csv EXTRA=--apply"; \
		echo "  make database-ingest-metadata DEP=sct SOURCE=/tmp/sct.csv EXTRA='--review --apply'"; \
		echo "  make database-ingest-metadata DEP=sct SOURCE=/tmp/sct.csv EXTRA='--plan-out /tmp/plan.json'"; \
		exit 1; \
	fi
	@cd $(DATABASE_DIR) && if echo "$(SOURCE)" | grep -qE "^https?://"; then \
		docker compose exec -T jobs python ingest/run_ingest_metadata.py \
			--dependencia "$(DEP)" --source "$(SOURCE)" $(EXTRA); \
	else \
		docker cp "$(SOURCE)" database-jobs:/tmp/ingest_source.csv && \
		docker compose exec -T jobs python ingest/run_ingest_metadata.py \
			--dependencia "$(DEP)" --source /tmp/ingest_source.csv $(EXTRA); \
	fi
