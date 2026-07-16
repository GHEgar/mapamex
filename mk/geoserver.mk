# GeoServer — servidor de mapas OGC + GeoNetwork

GEOSERVER_BACKUP_DIR := backups
# Rutas relativas a geoserver/ (las recetas hacen cd al directorio del servicio)
BACKUP_FILE ?= $(GEOSERVER_BACKUP_DIR)/geoserver_data_$(shell date +%Y%m%d_%H%M%S).tar.gz
RESTORE_FILE ?=

.PHONY: help-geoserver geoserver-deploy geoserver-down geoserver-logs geoserver-generate-config \
        geoserver-backup geoserver-restore geoserver-init-datastores \
        geoserver-init-cultivos-layer geoserver-seed-cache geoserver-plugins-fetch geoserver-clean

help-geoserver:
	@echo -e "$(C_BOLD)geoserver$(C_RESET) — servidor de mapas OGC + GeoNetwork"
	@echo "  make geoserver-deploy           Config + build + up + espera health + init de datastores"
	@echo "  make geoserver-down             Detiene GeoServer"
	@echo "  make geoserver-logs             Muestra logs en tiempo real"
	@echo "  make geoserver-generate-config  Genera server.xml y config/global.xml desde .env"
	@echo "  make geoserver-backup           Respalda geoserver_data/ y plugins/ en $(GEOSERVER_BACKUP_DIR)/"
	@echo "  make geoserver-restore          Restaura el backup más reciente (o RESTORE_FILE=ruta)"
	@echo "  make geoserver-init-datastores  Reapunta todos los datastores al PostGIS configurado en .env"
	@echo "  make geoserver-seed-cache       Encola el seed GWC de capas tiled (solo tiles faltantes)"
	@echo "  make geoserver-plugins-fetch    Descarga JARs de extensions faltantes a plugins/ (idempotente)"
	@echo "  make geoserver-clean            Detiene contenedor y elimina geoserver_data/"
	@echo ""
	@echo "  Ejemplos:"
	@echo "    make geoserver-restore RESTORE_FILE=backups/geoserver_data_20260220_120000.tar.gz"
	@echo ""

geoserver-generate-config:
	@echo "Generando configuración desde .env..."
	@cd $(GEOSERVER_DIR) && set -a && . ./.env && set +a && \
		envsubst < server.xml.template > server.xml && \
		envsubst < config/global.xml.template > config/global.xml
	@echo "Archivos generados: server.xml, config/global.xml"

geoserver-deploy: geoserver-generate-config geoserver-plugins-fetch
	@cd $(GEOSERVER_DIR) && { cp -f config/global.xml geoserver_data/global.xml 2>/dev/null && chmod 666 geoserver_data/global.xml || true; }
	@docker network inspect database-network >/dev/null 2>&1 || docker network create database-network
	@cd $(GEOSERVER_DIR) && docker compose up -d --build --force-recreate
	@echo "Esperando que GeoServer esté listo..."
	@attempts=0; max=60; \
	until docker exec geoserver curl -sf http://localhost:8080/geoserver/web/ > /dev/null 2>&1; do \
		attempts=$$((attempts+1)); \
		if [ $$attempts -ge $$max ]; then \
			echo ""; \
			echo "✗ GeoServer no respondió después de $$((max*5))s. Últimos logs:"; \
			docker logs geoserver --tail 20 2>&1; \
			exit 1; \
		fi; \
		printf '.'; sleep 5; \
	done
	@echo ""
	@docker exec geoserver curl -sf -u "$$(docker exec geoserver env | grep '^GEOSERVER_ADMIN_USER=' | cut -d= -f2):$$(docker exec geoserver env | grep '^GEOSERVER_ADMIN_PASSWORD=' | cut -d= -f2)" -X PUT -H "Content-Type: application/json" -d '{"global":{"settings":{"charset":"UTF-8"}}}' http://localhost:8080/geoserver/rest/settings > /dev/null 2>&1 || true
	@cd $(GEOSERVER_DIR) && bash scripts/init-datastores.sh
	@cd $(GEOSERVER_DIR) && bash scripts/init-cultivos-layer.sh
	# PENDIENTE: remover cuando los URLChecks se provisionen via geoserver_data en bootstrap de produccion.
	@cd $(GEOSERVER_DIR) && bash scripts/setup-urlchecks.sh

geoserver-down:
	@cd $(GEOSERVER_DIR) && docker compose down

geoserver-logs:
	@cd $(GEOSERVER_DIR) && docker compose logs -f

geoserver-backup:
	@cd $(GEOSERVER_DIR) && mkdir -p $(GEOSERVER_BACKUP_DIR)
	@echo ""
	@echo "═══ Backup GeoServer ═══"
	@echo "[1/5] Limpiando archivos temporales..."
	@docker exec -u root geoserver find /opt/geoserver/data_dir -name "global.xml.*.tmp" -delete 2>/dev/null || true
	@echo "[2/5] Preparando staging..."
	@cd $(GEOSERVER_DIR) && docker run --rm -v "$$(pwd)":/data alpine rm -rf /data/.backup_staging
	@cd $(GEOSERVER_DIR) && mkdir -p .backup_staging
	@echo "[3/5] Extrayendo data_dir del contenedor..."
	@cd $(GEOSERVER_DIR) && docker exec -u root geoserver tar -cf - -C /opt/geoserver data_dir | tar -xf - -C .backup_staging
	@echo "[4/5] Copiando plugins..."
	@cd $(GEOSERVER_DIR) && cp -r plugins .backup_staging/
	@echo "[5/5] Comprimiendo backup (un punto = 1000 archivos)..."
	@cd $(GEOSERVER_DIR) && tar -czf $(BACKUP_FILE) -C .backup_staging --checkpoint=1000 --checkpoint-action=exec='printf .' data_dir plugins && echo ''
	@cd $(GEOSERVER_DIR) && docker run --rm -v "$$(pwd)":/data alpine rm -rf /data/.backup_staging
	@cd $(GEOSERVER_DIR) && FILESIZE=$$(du -h $(BACKUP_FILE) | cut -f1); \
		echo ""; \
		echo "✓ Backup guardado: $(BACKUP_FILE) ($$FILESIZE)"
	@echo ""

geoserver-restore: geoserver-generate-config
	@cd $(GEOSERVER_DIR) && \
	RF="$(RESTORE_FILE)"; \
	if [ -z "$$RF" ]; then RF=$$(ls restore/geoserver_data_*.tar.gz 2>/dev/null | sort | tail -1 || true); fi; \
	if [ -z "$$RF" ]; then RF=$$(ls $(GEOSERVER_BACKUP_DIR)/geoserver_data_*.tar.gz 2>/dev/null | sort | tail -1 || true); fi; \
	if [ -z "$$RF" ] || [ ! -f "$$RF" ]; then \
		echo "No se encontró ningún backup en restore/ ni en backups/."; \
	else \
		FILESIZE=$$(du -h "$$RF" | cut -f1); \
		echo ""; \
		echo "═══ Restore GeoServer ═══"; \
		echo "Archivo: $$RF ($$FILESIZE)"; \
		echo "[1/5] Deteniendo contenedor..."; \
		docker compose down; \
		echo "[2/5] Limpiando datos anteriores..."; \
		docker run --rm -v "$$(pwd)":/data alpine rm -rf /data/geoserver_data /data/plugins; \
		echo "[3/5] Extrayendo backup (un punto = 1000 archivos)..."; \
		tar -xzf "$$RF" --checkpoint=1000 --checkpoint-action=exec='printf .' && echo ''; \
		mv data_dir geoserver_data; \
		echo "[4/5] Aplicando configuración..."; \
		cp -f config/global.xml geoserver_data/global.xml 2>/dev/null && chmod 666 geoserver_data/global.xml || true; \
		echo "[5/6] Levantando contenedor..."; \
		docker network inspect database-network >/dev/null 2>&1 || docker network create database-network; \
		docker compose up -d; \
		echo "Esperando que GeoServer esté listo..."; \
		attempts=0; max=60; \
		until docker exec geoserver curl -sf http://localhost:8080/geoserver/web/ > /dev/null 2>&1; do \
			attempts=$$((attempts+1)); \
			if [ $$attempts -ge $$max ]; then \
				echo ""; \
				echo "✗ GeoServer no respondió después de $$((max*5))s. Últimos logs:"; \
				docker logs geoserver --tail 20 2>&1; \
				exit 1; \
			fi; \
			printf '.'; sleep 5; \
		done; \
		echo ""; \
		echo "[6/6] Actualizando credenciales admin e inicializando datastores..."; \
		bash scripts/reset-admin.sh; \
		bash scripts/init-datastores.sh; \
		bash scripts/init-cultivos-layer.sh; \
		echo ""; \
		echo "✓ Restauración completa."; \
		echo ""; \
	fi

geoserver-init-datastores: geoserver-generate-config
	@cd $(GEOSERVER_DIR) && bash scripts/init-datastores.sh

geoserver-init-cultivos-layer:
	@cd $(GEOSERVER_DIR) && bash scripts/init-cultivos-layer.sh $(FORCE)

geoserver-seed-cache:
	@cd $(GEOSERVER_DIR) && set -a && . ./.env && set +a && \
		GEOSERVER_URL="$$GWC_SEED_LOCAL_URL" SEED_LAYERS="$$GWC_SEED_LAYERS" \
		SEED_THREADS="$$GWC_SEED_THREADS" SEED_BOUNDS="$$GWC_SEED_BOUNDS" \
		SEED_EXPIRE_CLIENTS="$$GWC_SEED_EXPIRE_CLIENTS" \
		SEED_LAYERS_FILE=config/seed-layers.txt \
		sh scripts/seed-cache.sh

geoserver-plugins-fetch:
	@cd $(GEOSERVER_DIR) && bash scripts/fetch-plugins.sh

geoserver-clean:
	@echo "Advertencia: esto eliminará geoserver_data/ permanentemente."
	@read -p "¿Continuar? [s/N]: " confirm && [ "$$confirm" = "s" ] || exit 1
	@cd $(GEOSERVER_DIR) && docker compose down
	@cd $(GEOSERVER_DIR) && docker run --rm -v "$$(pwd)":/data alpine rm -rf /data/geoserver_data
	@echo "Limpieza completa."
