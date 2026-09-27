.PHONY: help setup install-api install-web dev-api dev-web dev seed test clean docker-up docker-down

help:
	@echo "Gujarat SentinelX - Command Interface"
	@echo "---------------------------------------"
	@echo "make setup        - Install dependencies for both backend and frontend"
	@echo "make seed         - Seed 50 cameras, demo vehicles & initial users"
	@echo "make dev-api      - Run FastAPI backend development server (port 8000)"
	@echo "make dev-web      - Run Next.js frontend development server (port 3000)"
	@echo "make dev          - Run both API and Web concurrently"
	@echo "make test         - Run backend and integration test suite"
	@echo "make docker-up    - Start all containerized services via Docker Compose"
	@echo "make docker-down  - Stop all containerized services"

setup: install-api install-web
	@echo "Setup completed successfully."

install-api:
	cd apps/api && python3 -m venv .venv && . .venv/bin/activate && pip install --upgrade pip && pip install -r requirements.txt

install-web:
	cd apps/web && npm install

seed:
	cd apps/api && . .venv/bin/activate && python -m app.seeder

dev-api:
	cd apps/api && . .venv/bin/activate && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

dev-web:
	cd apps/web && npm run dev

test:
	cd apps/api && . .venv/bin/activate && pytest -v tests/

docker-up:
	docker compose up -d

docker-down:
	docker compose down
