# Gateway — nginx, entrada publica del ecosistema

GATEWAY_FILES := -f docker-compose.yml

.PHONY: help-gateway gateway-up gateway-deploy gateway-down

help-gateway:
	@echo -e "$(C_BOLD)gateway$(C_RESET) — nginx entrada publica"
	@echo "  make gateway-up            Iniciar gateway (sin rebuildear)"
	@echo "  make gateway-deploy        Detener + rebuild + levantar gateway"
	@echo "  make gateway-down          Detener gateway"
	@echo ""

gateway-up:
	@echo ""
	@echo -e "  $(C_BOLD)GATEWAY — UP$(C_RESET)"
	@echo -e "  $(C_DIM)------------------------------------------$(C_RESET)"
	@if docker network inspect $(NETWORK_NAME) >/dev/null 2>&1; then \
	     echo -e "  Red           $(C_GREEN)ya existe$(C_RESET)    ($(NETWORK_NAME))"; \
	 else \
	     docker network create $(NETWORK_NAME) >/dev/null 2>&1 && echo -e "  Red           $(C_GREEN)creada$(C_RESET)      ($(NETWORK_NAME))"; \
	 fi
	@echo -e "  $(C_DIM)------------------------------------------$(C_RESET)"
	@printf "  $(C_DIM)...%s$(C_RESET) " "Up"; \
	 cd $(GATEWAY_DIR) && docker compose $(GATEWAY_FILES) up -d > /tmp/gateway-up.log 2>&1 & pid=$$!; \
	 sp='⣾⣽⣻⢿⡿⣟⣯⣷'; start=$$(date +%s); i=0; elapsed=0; \
	 while kill -0 $$pid 2>/dev/null; do \
	     now=$$(date +%s); elapsed=$$((now - start)); \
	     frame="$${sp:$$((i % 8)):1}"; \
	     printf "\r\033[K  $(C_DIM)...%s$(C_RESET)  %s  %02d:%02d" "Up" "$$frame" "$$((elapsed/60))" "$$((elapsed%60))"; \
	     sleep 0.15; \
	     i=$$((i+1)); \
	 done; \
	 printf "\r\033[K"; \
	 set +e; wait $$pid; rc=$$?; set -e; \
	 if [ $$rc -eq 0 ]; then \
	     printf "  $(C_GREEN)Up$(C_RESET)            ok  %02d:%02d\n" "$$((elapsed/60))" "$$((elapsed%60))"; \
	 else \
	     printf "  $(C_RED)Up$(C_RESET)            fail  %02d:%02d\n" "$$((elapsed/60))" "$$((elapsed%60))"; \
	     tail -40 /tmp/gateway-up.log | while IFS= read -r line; do echo "         $$line"; done; \
	     rm -f /tmp/gateway-up.log; \
	     exit 1; \
	 fi; \
	 rm -f /tmp/gateway-up.log
	@echo -e "  $(C_DIM)------------------------------------------$(C_RESET)"
	@echo ""

gateway-deploy:
	@echo ""
	@deploy_start=$$(date +%s); \
	 cd $(GATEWAY_DIR); \
	 echo -e "  $(C_BOLD)GATEWAY — DEPLOY$(C_RESET)"; \
	 echo -e "  $(C_DIM)------------------------------------------$(C_RESET)"; \
	 if docker network inspect $(NETWORK_NAME) >/dev/null 2>&1; then \
	     echo -e "  Red           $(C_GREEN)ya existe$(C_RESET)    ($(NETWORK_NAME))"; \
	 else \
	     docker network create $(NETWORK_NAME) >/dev/null 2>&1 && echo -e "  Red           $(C_GREEN)creada$(C_RESET)      ($(NETWORK_NAME))"; \
	 fi; \
	 if output=$$(docker compose $(GATEWAY_FILES) down 2>&1); then \
	     echo -e "  Down          $(C_GREEN)ok$(C_RESET)"; \
	 else \
	     echo -e "  Down          $(C_RED)fail$(C_RESET)"; \
	     echo "$$output" | tail -40 | while IFS= read -r line; do echo "         $$line"; done; \
	     exit 1; \
	 fi; \
	 echo ""; \
	 printf "  $(C_DIM)...%s$(C_RESET) " "Build+Up"; \
	 docker compose $(GATEWAY_FILES) up -d $(COMPOSE_BUILD_FLAG) > /tmp/gateway-build.log 2>&1 & pid=$$!; \
	 sp='⣾⣽⣻⢿⡿⣟⣯⣷'; start=$$(date +%s); i=0; elapsed=0; \
	 while kill -0 $$pid 2>/dev/null; do \
	     now=$$(date +%s); elapsed=$$((now - start)); \
	     frame="$${sp:$$((i % 8)):1}"; \
	     printf "\r\033[K  $(C_DIM)...%s$(C_RESET)  %s  %02d:%02d" "Build+Up" "$$frame" "$$((elapsed/60))" "$$((elapsed%60))"; \
	     sleep 0.15; \
	     i=$$((i+1)); \
	 done; \
	 printf "\r\033[K"; \
	 set +e; wait $$pid; rc=$$?; set -e; \
	 if [ $$rc -eq 0 ]; then \
	     printf "  $(C_GREEN)Build+Up$(C_RESET)      ok  %02d:%02d\n" "$$((elapsed/60))" "$$((elapsed%60))"; \
	 else \
	     printf "  $(C_RED)Build+Up$(C_RESET)      fail  %02d:%02d\n" "$$((elapsed/60))" "$$((elapsed%60))"; \
	     tail -40 /tmp/gateway-build.log | while IFS= read -r line; do echo "         $$line"; done; \
	     rm -f /tmp/gateway-build.log; \
	     exit 1; \
	 fi; \
	 rm -f /tmp/gateway-build.log; \
	 echo -e "  $(C_DIM)------------------------------------------$(C_RESET)"; \
	 deploy_end=$$(date +%s); \
	 total=$$((deploy_end - deploy_start)); \
	 echo ""; \
	 printf "  $(C_GREEN)Deploy completado$(C_RESET)  %02d:%02d\n" "$$((total/60))" "$$((total%60))"; \
	 echo ""

gateway-down:
	@cd $(GATEWAY_DIR) && docker compose $(GATEWAY_FILES) down
