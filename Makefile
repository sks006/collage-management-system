.PHONY: up down dev dev-api dev-web dev-worker db-migrate db-generate test lint build clean

up:
	docker compose up -d

down:
	docker compose down

dev:
	pnpm dev

dev-api:
	pnpm dev:api

dev-web:
	pnpm dev:web

dev-worker:
	pnpm dev:worker

db-generate:
	pnpm db:generate

db-migrate:
	pnpm db:migrate

test:
	pnpm test

lint:
	pnpm lint

build:
	pnpm build

clean:
	rm -rf dist node_modules */node_modules apps/*/dist packages/*/dist
