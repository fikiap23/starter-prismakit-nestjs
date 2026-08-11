# =============================================================================
# Makefile - starter-prismakit-nestjs
# =============================================================================

ENV_PROD ?= build/.env.production

COMPOSE_DEV       := -f build/docker-compose.yml
COMPOSE_PROD      := -f build/docker-compose.production.yml $(if $(ENV_PROD),--env-file $(ENV_PROD))
COMPOSE_MIGRATE   := -f build/docker-compose.migrate.yml --env-file build/.env.migrate

CONTAINER_DEV        := starter-prismakit-dev
CONTAINER_PROD       := starter-prismakit-production
CONTAINER_MIGRATE    := starter-prismakit-migrate

.PHONY: up down restart logs exec pull
up:
	docker compose $(COMPOSE_DEV) up -d
	docker logs -f $(CONTAINER_DEV)

down:
	docker compose $(COMPOSE_DEV) down

restart:
	docker restart $(CONTAINER_DEV)
	docker logs -f $(CONTAINER_DEV)

logs:
	docker logs -f $(CONTAINER_DEV)

exec:
	docker exec -it $(CONTAINER_DEV) sh

pull:
	docker compose $(COMPOSE_DEV) pull

.PHONY: up-prod down-prod restart-prod logs-prod exec-prod build-prod
up-prod:
	docker compose $(COMPOSE_PROD) up -d --build
	docker logs -f $(CONTAINER_PROD)

down-prod:
	docker compose $(COMPOSE_PROD) down

restart-prod:
	docker compose $(COMPOSE_PROD) restart $(CONTAINER_PROD)
	docker logs -f $(CONTAINER_PROD)

logs-prod:
	docker logs -f $(CONTAINER_PROD)

exec-prod:
	docker exec -it $(CONTAINER_PROD) sh

build-prod:
	docker compose $(COMPOSE_PROD) build --no-cache

.PHONY: up-migrate down-migrate logs-migrate exec-migrate reset-migrate
up-migrate:
	docker compose $(COMPOSE_MIGRATE) up -d --build
	docker logs -f $(CONTAINER_MIGRATE)

down-migrate:
	docker compose $(COMPOSE_MIGRATE) down

logs-migrate:
	docker logs -f $(CONTAINER_MIGRATE)

exec-migrate:
	docker exec -it $(CONTAINER_MIGRATE) sh

reset-migrate:
	docker compose $(COMPOSE_MIGRATE) down -v

.PHONY: network fix-generated-perms cache-flush cache-keys
REDIS_CONTAINER_DEV ?= starter-prismakit-redis-dev
REDIS_PREFIX ?= starter

network:
	docker network create starter-network 2>/dev/null || true

fix-generated-perms:
	sudo chown -R $$(id -u):$$(id -g) src/generated

cache-flush:
	docker exec $(REDIS_CONTAINER_DEV) redis-cli FLUSHDB

cache-keys:
	@test -n "$(MODEL)" || (echo "Usage: make cache-keys MODEL=product" && exit 1)
	docker exec $(REDIS_CONTAINER_DEV) redis-cli --scan --pattern "$(REDIS_PREFIX):repo:$(MODEL):*"
