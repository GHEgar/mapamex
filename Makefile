.PHONY: help ensure-network ecosystem-up ecosystem-down ecosystem-deploy ecosystem-status ecosystem-backup ecosystem-restore ecosystem-commands

.DEFAULT_GOAL := help

MAKEFLAGS += --no-print-directory

SHELL := bash
.SHELLFLAGS := -eu -o pipefail -c

# UID/GID del host para que volumenes escritos por contenedores tengan ownership correcto
export UID := $(shell id -u)
export GID := $(shell id -g)

NETWORK_NAME := mapamex-network

# DEPLOY_MODE=build (default) compila desde fuente; DEPLOY_MODE=pull baja las
# imagenes fijadas en .env.images (servidor sin codigo). Ver RUNBOOK-DEPLOY.md.
DEPLOY_MODE ?= build
COMPOSE_BUILD_FLAG := $(if $(filter pull,$(DEPLOY_MODE)),,--build)

GATEWAY_DIR := ./gateway
STORAGE_DIR := ./storage
DATABASE_DIR := ./database
GEOSERVER_DIR := ./geoserver
CMS_DIR := ./cms
VISOR_DIR := ./visor

C_BOLD := \033[1m
C_DIM := \033[2m
C_GREEN := \033[0;32m
C_RED := \033[0;31m
C_YELLOW := \033[0;33m
C_CYAN := \033[0;36m
C_RESET := \033[0m

include mk/gateway.mk
include mk/cms.mk
include mk/visor.mk
include mk/database.mk
include mk/storage.mk
include mk/geoserver.mk

# Orden topologico del ecosistema (formato: name:dir:target-up:target-down)
ECOSYSTEM_STEPS := \
    storage:$(STORAGE_DIR):storage-deploy:storage-down \
    database:$(DATABASE_DIR):database-deploy:database-down \
    geoserver:$(GEOSERVER_DIR):geoserver-deploy:geoserver-down \
    cms:$(CMS_DIR):cms-deploy:cms-down \
    visor:$(VISOR_DIR):visor-deploy:visor-down \
    gateway:$(GATEWAY_DIR):gateway-deploy:gateway-down

# Backup de los servicios con estado (formato: name:dir:target)
BACKUP_STEPS := \
    database:$(DATABASE_DIR):database-backup \
    geoserver:$(GEOSERVER_DIR):geoserver-backup \
    storage:$(STORAGE_DIR):storage-backup

# Restore de los servicios con estado (formato: name:dir:target:patrones-de-dump)
# Los patrones (separados por coma) se buscan en RESTORE_SRC y se hardlinkean a <dir>/restore/.
RESTORE_SRC ?= ../mapamex-docs/restore
RESTORE_STEPS := \
    database:$(DATABASE_DIR):database-restore:*gis_*.sql.gz \
    database-cms:$(DATABASE_DIR):database-restore-cms:mapamex_cms_*.sql.gz \
    geoserver:$(GEOSERVER_DIR):geoserver-restore:geoserver_data_*.tar.gz \
    storage:$(STORAGE_DIR):storage-restore:backup-*.tar.gz

STACKS ?=

help:
	@echo ""
	@echo -e "$(C_BOLD)MapaMex — Comandos de ecosistema$(C_RESET)"
	@echo ""
	@echo "  make ecosystem-up          Levantar todo el ecosistema en orden topologico"
	@echo "  make ecosystem-down        Detener todo el ecosistema en orden inverso"
	@echo "  make ecosystem-deploy      Pull + down + deploy de todo el ecosistema"
	@echo "  make ecosystem-status      Estado del ecosistema: git, docker y errores en logs"
	@echo "  make ecosystem-backup      Backup de todo con estado (database, cms, geoserver, storage)"
	@echo "  make ecosystem-restore     Restore de todo con estado (hardlink de dumps + restores encadenados)"
	@echo "  make ecosystem-commands    Ver todos los comandos por servicio"
	@echo ""
	@echo "  Filtro: STACKS=cms,visor make ecosystem-up"
	@echo ""

ecosystem-commands:
	@echo ""
	@echo -e "$(C_BOLD)MapaMex — Comandos por servicio$(C_RESET)"
	@echo ""
	@echo "  Convencion: <servicio>-up = desarrollo, <servicio>-deploy = produccion."
	@echo "  database, storage y geoserver no tienen modo desarrollo: solo <servicio>-deploy."
	@echo ""
	@$(MAKE) help-gateway help-cms help-visor help-database help-storage help-geoserver

ensure-network:
	@docker network create $(NETWORK_NAME) 2>/dev/null || true

ecosystem-up:
	@echo ""
	@echo -e "  $(C_BOLD)ECOSISTEMA — UP + BUILD$(C_RESET)"
	@echo -e "  $(C_DIM)------------------------------------------$(C_RESET)"
	@if docker network inspect $(NETWORK_NAME) >/dev/null 2>&1; then \
	     echo -e "  Red           $(C_GREEN)ya existe$(C_RESET)    ($(NETWORK_NAME))"; \
	 else \
	     docker network create $(NETWORK_NAME) >/dev/null 2>&1 && echo -e "  Red           $(C_GREEN)creada$(C_RESET)      ($(NETWORK_NAME))"; \
	 fi
	@STEPS="$(ECOSYSTEM_STEPS)"; \
	 FILTER="$(STACKS)"; \
	 SELECTED=""; \
	 for step in $$STEPS; do \
	     name=$$(echo $$step | cut -d: -f1); \
	     if [ -z "$$FILTER" ] || echo ",$$FILTER," | grep -q ",$$name,"; then \
	         SELECTED="$$SELECTED $$step"; \
	     fi; \
	 done; \
	 for step in $$SELECTED; do \
	     name=$$(echo $$step | cut -d: -f1); \
	     dir=$$(echo $$step | cut -d: -f2); \
	     tgt=$$(echo $$step | cut -d: -f3); \
	     if [ -d "$$dir" ]; then \
	         printf "  $(C_DIM)...%s$(C_RESET) " "$$name"; \
	         $(MAKE) $$tgt > /tmp/ecosystem-up-$$name.log 2>&1 & pid=$$!; \
	         sp='⣾⣽⣻⢿⡿⣟⣯⣷'; start=$$(date +%s); i=0; elapsed=0; \
	         while kill -0 $$pid 2>/dev/null; do \
	             now=$$(date +%s); elapsed=$$((now - start)); \
	             frame="$${sp:$$((i % 8)):1}"; \
	             printf "\r\033[K  $(C_DIM)...%s$(C_RESET)  %s  %02d:%02d" "$$name" "$$frame" "$$((elapsed/60))" "$$((elapsed%60))"; \
	             sleep 0.15; \
	             i=$$((i+1)); \
	         done; \
	         printf "\r\033[K"; \
	         set +e; wait $$pid; rc=$$?; set -e; \
	         if [ $$rc -eq 0 ]; then \
	             printf "  $(C_GREEN)ok$(C_RESET)            %-14s %02d:%02d\n" "$$name" "$$((elapsed/60))" "$$((elapsed%60))"; \
	         else \
	             printf "  $(C_RED)fail$(C_RESET)          %-14s %02d:%02d\n" "$$name" "$$((elapsed/60))" "$$((elapsed%60))"; \
	             tail -40 /tmp/ecosystem-up-$$name.log | while IFS= read -r line; do echo "         $$line"; done; \
	             rm -f /tmp/ecosystem-up-$$name.log; \
	             exit 1; \
	         fi; \
	         rm -f /tmp/ecosystem-up-$$name.log; \
	     else \
	         printf "  $(C_DIM)skip$(C_RESET)          %s\n" "$$name"; \
	     fi; \
	 done
	@echo -e "  $(C_DIM)------------------------------------------$(C_RESET)"
	@echo ""
	@$(MAKE) ecosystem-status

ecosystem-down:
	@echo ""
	@echo -e "  $(C_BOLD)ECOSISTEMA — DOWN$(C_RESET)"
	@echo -e "  $(C_DIM)------------------------------------------$(C_RESET)"
	@STEPS="$(ECOSYSTEM_STEPS)"; \
	 FILTER="$(STACKS)"; \
	 REVERSED=""; \
	 for step in $$STEPS; do \
	     name=$$(echo $$step | cut -d: -f1); \
	     if [ -z "$$FILTER" ] || echo ",$$FILTER," | grep -q ",$$name,"; then \
	         REVERSED="$$step $$REVERSED"; \
	     fi; \
	 done; \
	 for step in $$REVERSED; do \
	     name=$$(echo $$step | cut -d: -f1); \
	     dir=$$(echo $$step | cut -d: -f2); \
	     tgt=$$(echo $$step | cut -d: -f4); \
	     if [ -d "$$dir" ]; then \
	         printf "  $(C_DIM)...%s$(C_RESET) " "$$name"; \
	         $(MAKE) $$tgt > /tmp/ecosystem-down-$$name.log 2>&1 & pid=$$!; \
	         sp='⣾⣽⣻⢿⡿⣟⣯⣷'; start=$$(date +%s); i=0; elapsed=0; \
	         while kill -0 $$pid 2>/dev/null; do \
	             now=$$(date +%s); elapsed=$$((now - start)); \
	             frame="$${sp:$$((i % 8)):1}"; \
	             printf "\r\033[K  $(C_DIM)...%s$(C_RESET)  %s  %02d:%02d" "$$name" "$$frame" "$$((elapsed/60))" "$$((elapsed%60))"; \
	             sleep 0.15; \
	             i=$$((i+1)); \
	         done; \
	         printf "\r\033[K"; \
	         set +e; wait $$pid; rc=$$?; set -e; \
	         if [ $$rc -eq 0 ]; then \
	             printf "  $(C_GREEN)ok$(C_RESET)            %-14s %02d:%02d\n" "$$name" "$$((elapsed/60))" "$$((elapsed%60))"; \
	         else \
	             if ( cd "$$dir" && docker compose down ) > /tmp/ecosystem-down-fb-$$name.log 2>&1; then \
	                 printf "  $(C_GREEN)ok$(C_RESET)            %-14s %02d:%02d\n" "$$name" "$$((elapsed/60))" "$$((elapsed%60))"; \
	             elif ( cd "$$dir" && for f in docker-compose.yml compose.yml docker-compose.yaml compose.yaml; do [ -f "$$f" ] && docker compose -f "$$f" down && exit 0; done; exit 1 ) > /tmp/ecosystem-down-fb-$$name.log 2>&1; then \
	                 printf "  $(C_GREEN)ok$(C_RESET)            %-14s %02d:%02d\n" "$$name" "$$((elapsed/60))" "$$((elapsed%60))"; \
	             else \
	                 printf "  $(C_RED)fail$(C_RESET)          %-14s %02d:%02d\n" "$$name" "$$((elapsed/60))" "$$((elapsed%60))"; \
	                 tail -40 /tmp/ecosystem-down-$$name.log | while IFS= read -r line; do echo "         $$line"; done; \
	                 tail -40 /tmp/ecosystem-down-fb-$$name.log | while IFS= read -r line; do echo "         $$line"; done; \
	             fi; \
	             rm -f /tmp/ecosystem-down-fb-$$name.log; \
	         fi; \
	         rm -f /tmp/ecosystem-down-$$name.log; \
	     else \
	         printf "  $(C_DIM)skip$(C_RESET)          %s\n" "$$name"; \
	     fi; \
	 done
	@echo -e "  $(C_DIM)------------------------------------------$(C_RESET)"
	@echo ""

ecosystem-deploy:
	@echo ""
	@deploy_start=$$(date +%s); \
	 echo -e "  $(C_BOLD)ECOSISTEMA — DEPLOY$(C_RESET)"; \
	 echo -e "  $(C_DIM)------------------------------------------$(C_RESET)"; \
	 echo -e "  $(C_CYAN)Pull ...$(C_RESET)"; \
	 section_start=$$(date +%s); \
	 STEPS="$(ECOSYSTEM_STEPS)"; \
	 FILTER="$(STACKS)"; \
	 for step in $$STEPS; do \
	     name=$$(echo $$step | cut -d: -f1); \
	     dir=$$(echo $$step | cut -d: -f2); \
	     if [ -z "$$FILTER" ] || echo ",$$FILTER," | grep -q ",$$name,"; then \
	     if [ -d "$$dir/.git" ]; then \
	         branch=$$(git -C "$$dir" branch --show-current 2>/dev/null || echo "?"); \
	         printf "  $(C_DIM)...%s$(C_RESET) " "$$name"; \
	         git -C "$$dir" pull --ff-only > /tmp/ecosystem-pull-$$name.log 2>&1 & pid=$$!; \
	         sp='⣾⣽⣻⢿⡿⣟⣯⣷'; start=$$(date +%s); i=0; elapsed=0; \
	         while kill -0 $$pid 2>/dev/null; do \
	             now=$$(date +%s); elapsed=$$((now - start)); \
	             frame="$${sp:$$((i % 8)):1}"; \
	             printf "\r\033[K  $(C_DIM)...%s$(C_RESET)  %s  %02d:%02d" "$$name" "$$frame" "$$((elapsed/60))" "$$((elapsed%60))"; \
	             sleep 0.15; \
	             i=$$((i+1)); \
	         done; \
	         printf "\r\033[K"; \
	         set +e; wait $$pid; rc=$$?; set -e; \
	         if [ $$rc -eq 0 ]; then \
	             printf "  $(C_GREEN)ok$(C_RESET)            %-14s %-12s %02d:%02d\n" "$$name" "$$branch" "$$((elapsed/60))" "$$((elapsed%60))"; \
	         else \
	             printf "  $(C_RED)fail$(C_RESET)          %-14s %-12s %02d:%02d\n" "$$name" "$$branch" "$$((elapsed/60))" "$$((elapsed%60))"; \
	             tail -40 /tmp/ecosystem-pull-$$name.log | while IFS= read -r line; do echo "         $$line"; done; \
	         fi; \
	         rm -f /tmp/ecosystem-pull-$$name.log; \
	         elif [ -d "$$dir" ]; then \
	             printf "  $(C_DIM)n/a$(C_RESET)           %s\n" "$$name"; \
	         else \
	             printf "  $(C_DIM)skip$(C_RESET)          %s\n" "$$name"; \
	         fi; \
	     fi; \
	 done; \
	 section_end=$$(date +%s); \
	 section_elapsed=$$((section_end - section_start)); \
	 echo -e "  $(C_DIM)------------------------------------------$(C_RESET)"; \
	 printf "  $(C_DIM)Pull total$(C_RESET)    %02d:%02d\n\n" "$$((section_elapsed/60))" "$$((section_elapsed%60))"; \
	 section_start=$$(date +%s); \
	 $(MAKE) ecosystem-down; \
	 section_end=$$(date +%s); \
	 section_elapsed=$$((section_end - section_start)); \
	 printf "  $(C_DIM)Down total$(C_RESET)    %02d:%02d\n\n" "$$((section_elapsed/60))" "$$((section_elapsed%60))"; \
	 section_start=$$(date +%s); \
	 $(MAKE) ecosystem-up; \
	 section_end=$$(date +%s); \
	 section_elapsed=$$((section_end - section_start)); \
	 printf "  $(C_DIM)Up total$(C_RESET)      %02d:%02d\n" "$$((section_elapsed/60))" "$$((section_elapsed%60))"; \
	 total_end=$$(date +%s); \
	 total_elapsed=$$((total_end - deploy_start)); \
	 echo ""; \
	 echo -e "  $(C_DIM)------------------------------------------$(C_RESET)"; \
	 printf "  $(C_BOLD)Total$(C_RESET)         %02d:%02d\n" "$$((total_elapsed/60))" "$$((total_elapsed%60))"; \
	 echo ""

ecosystem-status:
	@./gateway/scripts/ecosystem-status.sh "." "./gateway"

ecosystem-backup:
	@echo ""
	@echo -e "  $(C_BOLD)ECOSISTEMA — BACKUP$(C_RESET)  $(C_DIM)$$(date '+%Y-%m-%d %H:%M:%S')$(C_RESET)"
	@echo -e "  $(C_DIM)------------------------------------------$(C_RESET)"
	@ok=0; fail=0; \
	 for step in $(BACKUP_STEPS); do \
	     name=$$(echo $$step | cut -d: -f1); \
	     dir=$$(echo $$step | cut -d: -f2); \
	     tgt=$$(echo $$step | cut -d: -f3); \
	     if [ ! -d "$$dir" ]; then printf "  $(C_DIM)skip$(C_RESET)          %s\n" "$$name"; continue; fi; \
	     printf "  $(C_DIM)...%s$(C_RESET) " "$$name"; \
	     $(MAKE) $$tgt > /tmp/ecosystem-backup-$$name.log 2>&1 & pid=$$!; \
	     sp='⣾⣽⣻⢿⡿⣟⣯⣷'; start=$$(date +%s); i=0; elapsed=0; \
	     while kill -0 $$pid 2>/dev/null; do \
	         now=$$(date +%s); elapsed=$$((now - start)); \
	         printf "\r\033[K  $(C_DIM)...%s$(C_RESET)  %s  %02d:%02d" "$$name" "$${sp:$$((i % 8)):1}" "$$((elapsed/60))" "$$((elapsed%60))"; \
	         sleep 0.15; i=$$((i+1)); \
	     done; \
	     printf "\r\033[K"; \
	     set +e; wait $$pid; rc=$$?; set -e; \
	     if [ $$rc -eq 0 ]; then \
	         printf "  $(C_GREEN)ok$(C_RESET)            %-14s %02d:%02d\n" "$$name" "$$((elapsed/60))" "$$((elapsed%60))"; ok=$$((ok+1)); \
	     else \
	         printf "  $(C_RED)fail$(C_RESET)          %-14s %02d:%02d\n" "$$name" "$$((elapsed/60))" "$$((elapsed%60))"; \
	         tail -20 /tmp/ecosystem-backup-$$name.log | while IFS= read -r line; do echo "         $$line"; done; \
	         fail=$$((fail+1)); \
	     fi; \
	     rm -f /tmp/ecosystem-backup-$$name.log; \
	 done; \
	 echo -e "  $(C_DIM)------------------------------------------$(C_RESET)"; \
	 printf "  $(C_BOLD)RESUMEN$(C_RESET)  $(C_GREEN)%d ok$(C_RESET)  $(C_RED)%d fallo$(C_RESET)\n\n" "$$ok" "$$fail"

ecosystem-restore:
	@echo ""
	@echo -e "  $(C_BOLD)ECOSISTEMA — RESTORE$(C_RESET)  $(C_DIM)$$(date '+%Y-%m-%d %H:%M:%S')$(C_RESET)"
	@echo -e "  $(C_DIM)------------------------------------------$(C_RESET)"
	@STEPS="$(RESTORE_STEPS)"; \
	 FILTER="$(STACKS)"; \
	 SELECTED=""; \
	 for step in $$STEPS; do \
	     name=$$(echo $$step | cut -d: -f1); \
	     if [ -z "$$FILTER" ] || echo ",$$FILTER," | grep -q ",$$name,"; then \
	         SELECTED="$$SELECTED $$step"; \
	     fi; \
	 done; \
	 if [ -d "$(RESTORE_SRC)" ]; then \
	     echo -e "  Dumps desde   $(C_CYAN)$(RESTORE_SRC)$(C_RESET)"; \
	 else \
	     echo -e "  $(C_YELLOW)No existe $(RESTORE_SRC); se usara lo que ya haya en <servicio>/restore/ y backups/$(C_RESET)"; \
	 fi; \
	 for step in $$SELECTED; do \
	     name=$$(echo $$step | cut -d: -f1); \
	     dir=$$(echo $$step | cut -d: -f2); \
	     pats=$$(echo $$step | cut -d: -f4 | tr ',' ' '); \
	     [ -d "$$dir" ] || continue; \
	     mkdir -p "$$dir/restore"; \
	     n=0; \
	     if [ -d "$(RESTORE_SRC)" ]; then \
	         for pat in $$pats; do \
	             for f in $(RESTORE_SRC)/$$pat; do \
	                 [ -f "$$f" ] || continue; \
	                 ln -f "$$f" "$$dir/restore/" 2>/dev/null || cp -f "$$f" "$$dir/restore/"; \
	                 n=$$((n+1)); \
	             done; \
	         done; \
	     fi; \
	     have=$$(ls -1p "$$dir/restore" 2>/dev/null | grep -v '/' | grep -vE '\.sh$$' | tr '\n' ' ' || true); \
	     if [ -n "$$have" ]; then \
	         printf "  %-13s %s enlazado(s): $(C_DIM)%s$(C_RESET)\n" "$$name" "$$n" "$$have"; \
	     else \
	         printf "  %-13s $(C_YELLOW)sin dumps en restore/$(C_RESET) (se intentara con backups/ locales)\n" "$$name"; \
	     fi; \
	 done; \
	 echo -e "  $(C_DIM)------------------------------------------$(C_RESET)"; \
	 echo -e "  $(C_YELLOW)ATENCION: esto SOBRESCRIBE las bases de datos y los datos actuales.$(C_RESET)"; \
	 printf "  Escribe 'restaurar' para continuar: "; \
	 read -r CONFIRM; \
	 if [ "$$CONFIRM" != "restaurar" ]; then \
	     echo -e "  $(C_GREEN)Cancelado, no se restauro nada.$(C_RESET)"; \
	     echo ""; \
	     exit 1; \
	 fi; \
	 ok=0; fail=0; \
	 for step in $$SELECTED; do \
	     name=$$(echo $$step | cut -d: -f1); \
	     dir=$$(echo $$step | cut -d: -f2); \
	     tgt=$$(echo $$step | cut -d: -f3); \
	     if [ ! -d "$$dir" ]; then printf "  $(C_DIM)skip$(C_RESET)          %s\n" "$$name"; continue; fi; \
	     echo ""; \
	     echo -e "  $(C_BOLD)RESTORE — $$name$(C_RESET)"; \
	     echo -e "  $(C_DIM)------------------------------------------$(C_RESET)"; \
	     if $(MAKE) $$tgt; then \
	         printf "  $(C_GREEN)ok$(C_RESET)            %s\n" "$$name"; ok=$$((ok+1)); \
	     else \
	         printf "  $(C_RED)fail$(C_RESET)          %s\n" "$$name"; fail=$$((fail+1)); \
	     fi; \
	 done; \
	 echo ""; \
	 echo -e "  $(C_DIM)------------------------------------------$(C_RESET)"; \
	 printf "  $(C_BOLD)RESUMEN$(C_RESET)  $(C_GREEN)%d ok$(C_RESET)  $(C_RED)%d fallo$(C_RESET)\n\n" "$$ok" "$$fail"
