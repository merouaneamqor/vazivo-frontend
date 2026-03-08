.PHONY: help build up down logs shell lint test upgrade

help:
	@echo "Frontend Commands:"
	@echo "  make build   - Build Docker image"
	@echo "  make up      - Start the app"
	@echo "  make down    - Stop the app"
	@echo "  make upgrade - Rebuild for Next 16 (down -v, build --no-cache, up)"
	@echo "  make logs    - View logs"
	@echo "  make shell   - Open shell in container"
	@echo "  make lint    - Run linter"
	@echo "  make test    - Run tests"

build:
	docker-compose build

# Rebuild image and volumes so container runs Next 16 (clears old node_modules)
upgrade:
	docker-compose down -v
	docker-compose build --no-cache
	docker-compose up -d
	@echo "Container upgraded. Run 'make logs' to confirm Next.js 16."

up:
	docker-compose up -d

down:
	docker-compose down

logs:
	docker-compose logs -f

shell:
	docker-compose exec app sh

lint:
	docker-compose exec app npm run lint

test:
	docker-compose exec app npm test
