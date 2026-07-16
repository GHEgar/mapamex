# Storage — SeaweedFS (almacenamiento de objetos)

STORAGE_ENV_FILE     := .env
STORAGE_COMPOSE      := docker compose --env-file $(STORAGE_ENV_FILE) -f docker-compose.yml
STORAGE_COMPOSE_INIT := docker compose --env-file $(STORAGE_ENV_FILE) -f docker-compose.yml --profile init

.PHONY: help-storage storage-deploy storage-down storage-logs storage-setup storage-migrate \
        storage-init-seaweedfs storage-rotate-seaweedfs storage-backup storage-restore \
        storage-backup-list storage-cron-install storage-cron-remove storage-clean \
        storage-shell-seaweedfs

help-storage:
	@echo -e "$(C_BOLD)storage$(C_RESET) — SeaweedFS"
	@echo "  make storage-deploy           Build + up del stack de storage"
	@echo "  make storage-down             Detener todos los contenedores"
	@echo "  make storage-logs             Logs en tiempo real"
	@echo "  make storage-setup            Crea archivo .env inicial"
	@echo "  make storage-migrate          Migracion completa MinIO -> SeaweedFS"
	@echo "  make storage-init-seaweedfs   Generar config/identities.json (passwords nuevas para users que no existen)"
	@echo "  make storage-rotate-seaweedfs Rotar TODAS las passwords [BUCKET=nombre]"
	@echo "  make storage-backup           Ejecutar respaldo manual"
	@echo "  make storage-restore          Restaurar respaldo (DATE=YYYY-MM-DD [BUCKET=nombre])"
	@echo "  make storage-backup-list      Listar respaldos disponibles"
	@echo "  make storage-cron-install     Instalar cron de respaldos (mensual, dia 1 a las 3:00 AM)"
	@echo "  make storage-cron-remove      Desinstalar cron de respaldos"
	@echo "  make storage-clean            Elimina contenedores, redes y volumenes (DESTRUCTIVO)"
	@echo "  make storage-shell-seaweedfs  Terminal del contenedor SeaweedFS"
	@echo ""

storage-migrate:
	@cd $(STORAGE_DIR) && bash scripts/migrate.sh

storage-deploy:
	@echo -e "$(C_GREEN)storage: build + up...$(C_RESET)"
	@cd $(STORAGE_DIR) && $(STORAGE_COMPOSE) up -d --build

storage-down:
	@echo -e "$(C_YELLOW)storage: deteniendo entorno...$(C_RESET)"
	@cd $(STORAGE_DIR) && $(STORAGE_COMPOSE) down

storage-logs:
	@cd $(STORAGE_DIR) && $(STORAGE_COMPOSE) logs -f

storage-clean:
	@echo -e "$(C_YELLOW)ADVERTENCIA: make storage-clean borra TODOS los datos persistentes.$(C_RESET)"
	@echo -e "$(C_YELLOW)Esto eliminara:$(C_RESET)"
	@echo "  - Contenedores definidos en docker-compose.yml"
	@echo "  - Redes creadas por el stack"
	@echo "  - Volumen seaweedfs_data (todos los buckets, objetos y datos)"
	@cd $(STORAGE_DIR) && if [ -f "$(STORAGE_ENV_FILE)" ]; then \
		BUCKETS=$$(grep -E '^STORAGE_BUCKETS=' "$(STORAGE_ENV_FILE)" | cut -d= -f2- | tr -d '"' || true); \
		if [ -n "$$BUCKETS" ]; then \
			echo ""; \
			echo -e "$(C_YELLOW)Buckets declarados en $(STORAGE_ENV_FILE):$(C_RESET) $$BUCKETS"; \
		fi; \
	fi
	@echo ""
	@read -p "Escribe 'borrar' para confirmar: " CONFIRM; \
		if [ "$$CONFIRM" != "borrar" ]; then \
			echo -e "$(C_GREEN)Cancelado, no se borro nada.$(C_RESET)"; \
			exit 1; \
		fi
	@echo -e "$(C_YELLOW)storage: limpiando (contenedores, redes y volumenes)...$(C_RESET)"
	@cd $(STORAGE_DIR) && $(STORAGE_COMPOSE) down -v --remove-orphans

storage-shell-seaweedfs:
	@cd $(STORAGE_DIR) && $(STORAGE_COMPOSE) exec seaweedfs /bin/sh

storage-setup:
	@cd $(STORAGE_DIR) && if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo -e "$(C_GREEN)Creado .env desde ejemplo$(C_RESET)"; \
		echo -e "$(C_YELLOW)Edita .env con las credenciales reales antes de 'make storage-migrate'$(C_RESET)"; \
	else \
		echo -e "$(C_YELLOW).env ya existe$(C_RESET)"; \
	fi

storage-init-seaweedfs:
	@echo -e "$(C_GREEN)Generando config/identities.json...$(C_RESET)"
	@cd $(STORAGE_DIR) && $(STORAGE_COMPOSE_INIT) run --rm storage-init

storage-rotate-seaweedfs:
	@echo -e "$(C_YELLOW)Rotando passwords (BUCKET=$(BUCKET))...$(C_RESET)"
	@cd $(STORAGE_DIR) && $(STORAGE_COMPOSE_INIT) run --rm -e ROTATE_FLAG=1 -e TARGET_BUCKET=$(BUCKET) storage-init

storage-backup:
	@echo -e "$(C_GREEN)storage: ejecutando respaldo manual...$(C_RESET)"
	@cd $(STORAGE_DIR) && ENV_FILE=$(STORAGE_ENV_FILE) bash scripts/backup.sh

storage-restore:
	@echo -e "$(C_GREEN)storage: restaurando respaldo...$(C_RESET)"
	@cd $(STORAGE_DIR) && ENV_FILE=$(STORAGE_ENV_FILE) bash scripts/restore.sh $(DATE) $(BUCKET)

storage-backup-list:
	@echo -e "$(C_GREEN)Respaldos disponibles:$(C_RESET)"
	@echo ""
	@echo -e "$(C_YELLOW)Mensuales:$(C_RESET)"
	@cd $(STORAGE_DIR) && bash -c 'source $(STORAGE_ENV_FILE); ls -la $${BACKUP_DIR:-$(CURDIR)/$(STORAGE_DIR)/backups}/monthly/backup-*.tar.gz 2>/dev/null || echo "  (ninguno)"'

storage-cron-install:
	@echo -e "$(C_GREEN)Instalando cron de respaldos...$(C_RESET)"
	@cd $(STORAGE_DIR) && \
	sed -e "s|/opt/storage|$$(pwd)|g" -e "s|/bin/bash|/usr/bin/env ENV_FILE=$(STORAGE_ENV_FILE) /bin/bash|g" scripts/backup-cron | crontab -
	@echo -e "$(C_GREEN)Cron instalado. Respaldos mensuales el dia 1 a las 3:00 AM$(C_RESET)"

storage-cron-remove:
	@echo -e "$(C_YELLOW)Desinstalando cron de respaldos...$(C_RESET)"
	@crontab -r 2>/dev/null || true
	@echo -e "$(C_GREEN)Cron desinstalado$(C_RESET)"
