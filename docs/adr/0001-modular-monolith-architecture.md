# 1. Architecture: Nx Modular Monolith

Date: 2026-11-20
Status: Accepted

## Context
Dhaka Model College requires a system serving 10,000–20,000 students and 200–500 staff. Distributed microservices introduce significant network latency, distributed transaction complexity (2PC/Saga), and heavy deployment overhead unsuitable for single-institution reliability.

## Decision
Adopt an Nx-style modular monorepo using pnpm workspaces:
- `apps/api`: NestJS Fastify backend with 11 domain modules.
- `apps/worker`: NestJS event worker handling asynchronous jobs via Postgres Outbox (`FOR UPDATE SKIP LOCKED`).
- `apps/web`: Next.js 15 frontend with React 19, Tailwind CSS, and shadcn/ui.
- `packages/database`: Drizzle ORM schemas and migration scripts.
- `packages/shared`: Shared Zod validation schemas and TypeScript types.

## Consequences
- Single transactional boundary within PostgreSQL.
- Fast type sharing and zero duplicate validation code.
- Strict module boundaries enforced by linting and tsconfig path aliases.
