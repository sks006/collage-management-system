# Dhaka Model College · Institutional Management System (SMS)

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat&logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.4-e0234e?style=flat&logo=nestjs)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16_Alpine-336791?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![Keycloak](https://img.shields.io/badge/Keycloak-26.0_OIDC-blue?style=flat&logo=redhat)](https://www.keycloak.org/)
[![Redis](https://img.shields.io/badge/Redis-7_Alpine-dc382d?style=flat&logo=redis)](https://redis.io/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.36-C5F74F?style=flat)](https://orm.drizzle.team/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![License: Institutional](https://img.shields.io/badge/License-Institutional_Proprietary-lightgrey.svg)](LICENSE)

An enterprise-grade, single-source-of-truth Institutional Management System (SMS) engineered for higher secondary and undergraduate colleges in Bangladesh. Built with an **Nx Modular Monolith** architecture featuring strict multi-schema relational integrity, banking-compliant financial ledgers, biometric attendance gateway, Keycloak OIDC role-based access control, and asynchronous background worker processing.

---

## Table of Contents

- [Architectural Overview](#architectural-overview)
- [Monorepo Topology](#monorepo-topology)
- [Core Functional Domains](#core-functional-domains)
- [Institutional Safety Invariants](#institutional-safety-invariants)
- [Frontend Architecture & Single-Gateway Pattern](#frontend-architecture--single-gateway-pattern)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Environment Setup](#1-environment-setup)
  - [2. Infrastructure Bootstrapping](#2-infrastructure-bootstrapping)
  - [3. Database Migration & Institutional Seeding](#3-database-migration--institutional-seeding)
  - [4. Launching the Applications](#4-launching-the-applications)
- [Institutional Seed Personas & Default Credentials](#institutional-seed-personas--default-credentials)
- [SMTP Notification & Gmail Service Configuration](#smtp-notification--gmail-service-configuration)
- [Testing & Quality Assurance](#testing--quality-assurance)
- [Development Scripts Reference](#development-scripts-reference)

---

## Architectural Overview

The platform is designed around strict separation of concerns, high throughput, and zero-trust security:

```
[ Web Browser Client ]
         │
         │ HTTP / JSON
         ▼
[ Next.js 15 Web Application (Port 3000) ]
  ├── Client Gateway: apiClient<T>() (Auto Tracing, Correlation ID, Response Unwrapping)
  ├── Server-Side BFF Proxy: /api/v1/[...slug] (Bearer & Session Cookie Forwarding)
  └── Slicer Pattern (Vertical Slice Feature Layout & SOLID Handles)
         │
         │ Upstream HTTP Proxy (X-Request-ID, Bearer JWT)
         ▼
[ NestJS 10 Fastify Core API (Port 4000) ]
  ├── JwtAuthGuard (Keycloak RS256 JWKS Verification with 1-hr Cache)
  ├── Multi-Domain Controllers (Academic, People, Attendance, Finance, Payroll, Leave, Notices)
  ├── Maker-Checker Business Rules & Transactional Audit Logger
  └── Transactional Outbox Pattern (Transactional DB Writes + Async Worker Queue)
         │
         ├──────────────────────┬──────────────────────┬─────────────────────┐
         ▼                      ▼                      ▼                     ▼
[ PostgreSQL 16 ]        [ Keycloak 26 ]         [ Redis 7 ]            [ MinIO S3 ]
  (9 Distinct Schemas)     (OIDC Realm: sms)      (Token TTL, Cache,     (Document Storage,
  (Append-Only Ledgers)    (RBAC Direct Grants)    Rate Limiting)         Presigned URLs)
         ▲
         │ Polling Transactional Outbox
[ Background Worker (Port 4001) ]
  ├── Nodemailer Gmail SMTP Dispatcher (6-digit OTP delivery)
  ├── PDFKit Document Generation (Fee Receipts, Payslips, Student ID Cards)
  ├── Bangladesh Bank BEFTN 128-Byte Fixed-Width Engine
  └── MFS Webhook Reconciler (bKash, Nagad, SSLCommerz IPN)
```

---

## Monorepo Topology

```
collage-management-system/
├── apps/
│   ├── api/                  # NestJS 10 (Fastify) Core Backend REST API
│   │   ├── src/modules/      # Domain modules (auth, academic, attendance, finance, etc.)
│   │   ├── src/shared/       # Guards, interceptors, audit, S3, redis providers
│   │   └── test/             # E2E institutional safety invariant test suites
│   ├── web/                  # Next.js 15 (App Router) Institutional Frontend
│   │   ├── src/app/          # Route pages ((auth), (dashboard), /api/v1 BFF proxy)
│   │   ├── src/components/   # UI component library (shadcn/ui adapted, sidebar, navbar)
│   │   ├── src/lib/          # apiClient, auth context, session persistence
│   │   ├── src/services/     # Typed domain service layer consuming apiClient
│   │   └── src/slicer/       # Vertical slice layout, state hooks, and action handlers
│   └── worker/               # NestJS 10 Background Worker Engine
│       └── src/processors/   # Outbox, BEFTN, PDF generation, email, payment reconciler
├── packages/
│   ├── database/             # Drizzle ORM schemas, pool factory, and migrations
│   │   ├── src/schema/       # 9 PostgreSQL schema declarations & relations
│   │   ├── src/seed.ts       # Idempotent database & Keycloak user synchronization
│   │   └── drizzle/          # Generated SQL migration snapshots
│   └── shared/               # Shared TypeScript types, DTOs, and RBAC constants
├── infra/
│   ├── docker/postgres/      # PostgreSQL initialization scripts and multi-schema DDL
│   └── keycloak/             # Keycloak realm configuration export (realm-export.json)
├── docs/                     # Technical specifications, ADRs, and runbooks
├── docker-compose.yml        # Multi-container orchestration (PostgreSQL, Redis, Keycloak, MinIO)
└── pnpm-workspace.yaml       # Monorepo workspace configuration
```

---

## Core Functional Domains

### 1. Identity & Access Management (IAM)
- **Keycloak 26 OIDC Single Sign-On**: Managed realm `sms` supporting standard Authorization Code and Direct Grant flows.
- **7 Strict Institutional Roles**: `ADMIN`, `PRINCIPAL`, `TEACHER`, `OFFICE`, `FINANCE`, `PARENT`, `STUDENT`.
- **Public Registration & Role Verification**: 6-digit numeric OTP with SHA-256 HMAC hashing, 10-minute Redis TTL, 60-second cooldown protection, and admin approval workflows (`people.role_request`).

### 2. Academic Lifecycle
- Structured hierarchy: **Academic Year ➔ Terms ➔ Classes ➔ Sections (Padma / Meghna) ➔ Subjects**.
- Student enrollment tracking, teacher-subject mapping, and syllabus rosters.

### 3. Biometric Attendance & Period Close
- **Biometric Punch Gateway**: Dedicated endpoint `POST /attendance/device` for hardware biometric clock devices secured by `DEVICE_API_KEY`.
- **Maker-Checker Period Close**: Monthly attendance freeze requiring validation by academic coordinator and explicit sign-off by the Principal.

### 4. Finance & Append-Only General Ledger
- **Append-Only Immutable Ledger (`finance.ledger_entry`)**: Enforced at the PostgreSQL engine level via trigger functions blocking all `UPDATE` and `DELETE` operations.
- **Mobile Financial Services (MFS)**: Instant payment notification (IPN) webhooks for bKash, Nagad, and SSLCommerz with cryptographic signature verification and idempotent deduplication.
- **Automated Invoice Generation**: Tuition, lab, registration, and examination fee billing with automated receipt generation.

### 5. Payroll & Bangladesh Bank BEFTN Engine
- **Salary Structure Management**: Basic pay, House Rent Allowance (HRA), Medical, Conveyance, and Provident Fund deductions.
- **Bangladesh Bank 128-Byte BEFTN Generator**: Generates fixed-width ASCII bank transaction files conforming to national clearinghouse standards (Record Types 1, 5, 6, 8, 9) for sonali Bank, Dutch-Bangla Bank, BRAC Bank, City Bank, and Islami Bank Bangladesh.

### 6. Leave Management
- Formal employee leave applications (Casual, Sick, Earned, Maternity) with real-time balance tracking, multi-tier approvals, and audit logging.

### 7. Notices & Communications
- Institutional announcements with bilingual English and Bengali markdown content, target audience filtering (All, Staff, Students), and emergency broadcast flags.

---

## Institutional Safety Invariants

To guarantee audit compliance and protect institutional finances, four non-negotiable invariants are validated through automated E2E tests:

| Invariant | Scope | Enforcement Mechanism |
|---|---|---|
| **Invariant 1: Append-Only Ledger** | `finance.ledger_entry` | PostgreSQL trigger `trg_prevent_ledger_entry_mutation` forbids `UPDATE` and `DELETE` queries. |
| **Invariant 2: Maker-Checker Segregation** | Attendance & Payroll | Submitter cannot approve their own period close or payroll disbursement (`creatorId !== approverId`). |
| **Invariant 3: Idempotent Payment Webhooks** | MFS Aggregators | Ingestion rejects duplicate `tran_id` / `idempotency_key` payloads, preventing double-credits. |
| **Invariant 4: BEFTN 128-Byte Formatting** | Bangladesh Bank | Every line in generated BEFTN files must strictly equal 128 ASCII bytes; amount in paisa. |

Run tests to verify invariants:
```bash
pnpm --filter @sms/api test
```

---

## Frontend Architecture & Single-Gateway Pattern

The web frontend operates under a robust three-tier communication gateway:

```
[ Frontend Component / View ]
              │
              ▼
[ Domain Service (e.g. authService, staffService) ]
              │
              ▼
[ Client Gateway: apiClient<T>() (apps/web/src/lib/api-client.ts) ]
  • Resolves Bearer token (SSR cookies or CSR localStorage)
  • Injects UUID correlation ID: X-Request-ID
  • Detailed collapsed dev console logger with latency and status
  • Unwraps NestJS response enveloper ({ data: ... } -> ...)
  • Normalizes errors into typed ApiError with 401 redirect
              │
              ▼
[ Server-Side BFF Proxy: /api/v1/[...slug] (apps/web/src/app/api/v1/[...slug]/route.ts) ]
  • Proxies all HTTP verbs to NestJS (http://127.0.0.1:4000)
  • Forwards X-Request-ID and credentials
  • Formats upstream unreachable errors into structured 502 Bad Gateway responses
```

- **Slicer Feature Architecture**: Complex views (Staff, Students, Finance, Payroll, Attendance) reside in `apps/web/src/slicer/`, following SOLID principles with centralized state, memoized filters, and decoupled presentation components.
- **Responsive Layout**: Designed for seamless operation on laptops and monitors, including collapsible sidebars (`256px`), flexible metric KPI grids (`xl:grid-cols-4`), and thin custom scrollbars for wide financial tables.

---

## Tech Stack

| Tier | Technologies |
|---|---|
| **Monorepo Engine** | Nx 20, pnpm 9 Workspaces, TypeScript 5.7 |
| **Frontend** | Next.js 15.5 (App Router, React 19), Tailwind CSS 3.4, Lucide React, TanStack Query |
| **Backend API** | NestJS 10 (Fastify engine), Jose (JWKS/JWT), Zod validation |
| **Background Worker** | NestJS 10, Nodemailer, PDFKit, BullMQ / Transactional Outbox |
| **Database & ORM** | PostgreSQL 16 Alpine, Drizzle ORM 0.36, pg-pool |
| **Cache & Queue** | Redis 7 Alpine |
| **IAM & Identity** | Keycloak 26.0 (OIDC / OAuth 2.0) |
| **Object Storage** | MinIO / AWS S3 SDK (Presigned URL uploads/downloads) |
| **Observability** | Prometheus metrics, Winston structured JSON logger |

---

## Getting Started

### Prerequisites

Ensure you have the following installed on your host machine:
- **Node.js**: `v20.x` or `v22.x`
- **pnpm**: `v9.x` (`npm install -g pnpm`)
- **Docker & Docker Compose**: Docker Engine 24+

---

### 1. Environment Setup

Clone the repository and copy the environment configuration:
```bash
git clone <repository-url>
cd "collage management system"
cp .env.example .env
```

Review `.env` to verify default ports and credentials:
- `API_PORT=4000`
- `APP_PORT=3000`
- `DATABASE_URL=postgresql://sms_api:sms_api_password@127.0.0.1:5432/sms`
- `KEYCLOAK_URL=http://localhost:8080`

Install all dependencies across the monorepo:
```bash
pnpm install
```

---

### 2. Infrastructure Bootstrapping

Start the containerized backing services (PostgreSQL 16, Keycloak 26, Redis 7, MinIO):
```bash
docker compose up -d
```

Verify service health:
```bash
docker compose ps
```
All containers (`sms-postgres`, `sms-redis`, `sms-keycloak`, `sms-minio`) should be healthy and running.

---

### 3. Database Migration & Institutional Seeding

Apply Drizzle database migrations across all 9 PostgreSQL schemas:
```bash
pnpm db:migrate
```

Run the institutional seed script. This provisions the academic calendar, fee structures, classes, sections, and synchronizes 20 institutional staff and student accounts across PostgreSQL and Keycloak:
```bash
pnpm db:seed
```

---

### 4. Launching the Applications

You can start all services concurrently:
```bash
pnpm dev
```

Or run individual services in dedicated terminal tabs:

**Terminal 1 — Core Backend API:**
```bash
pnpm dev:api
# Listens on http://127.0.0.1:4000
```

**Terminal 2 — Frontend Application:**
```bash
pnpm dev:web
# Accessible at http://localhost:3000
```

**Terminal 3 — Background Worker Engine:**
```bash
pnpm dev:worker
# Polls PostgreSQL Outbox table
```

## SMTP Notification & Gmail Service Configuration

The background worker dispatches registration OTPs and institutional alerts via Nodemailer SMTP.

### Setting Up Real Gmail Delivery

Google requires an **App Password** for SMTP access:

1. Enable **2-Step Verification (2FA)** in your Google Account.
2. Navigate to **Google Account ➔ Security ➔ 2-Step Verification ➔ App passwords**.
3. Generate a new App Password named `College Management System`.
4. Copy the generated 16-character code into `.env`:
   ```properties
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-college-noreply@gmail.com
   SMTP_PASSWORD=abcd efgh ijkl mnop
   MAIL_FROM_NAME="Dhaka Model College"
   MAIL_FROM_ADDRESS=your-college-noreply@gmail.com
   ```
5. Ensure `apps/worker` is running (`pnpm dev:worker`).

> **Note on Development Mode:** If `SMTP_PASSWORD` is left as `xxxx-xxxx-xxxx-xxxx`, the worker skips SMTP network calls and logs the rendered email and OTP directly to the terminal console.

---

## Testing & Quality Assurance

The codebase enforces strict test coverage across institutional business invariants and compilation validation:

```bash
# Run unit & E2E invariant test suites
pnpm test

# Run API-specific invariant tests
pnpm --filter @sms/api test

# Monorepo full production build check (TypeScript + Webpack)
pnpm build

# Linting check across all workspaces
pnpm lint
```

---

## Development Scripts Reference

| Command | Action |
|---|---|
| `pnpm dev` | Start API, Web, and Worker concurrently |
| `pnpm dev:api` | Run NestJS API with hot reload (`apps/api`) |
| `pnpm dev:web` | Run Next.js 15 dev server on port 3000 (`apps/web`) |
| `pnpm dev:worker` | Run NestJS Background Worker (`apps/worker`) |
| `pnpm build` | Compile all packages and applications for production |
| `pnpm test` | Run Vitest test suites across the monorepo |
| `pnpm db:generate` | Generate Drizzle SQL migration files from schema |
| `pnpm db:migrate` | Execute pending SQL migrations against PostgreSQL |
| `pnpm db:seed` | Run database and Keycloak idempotent provisioning |
| `pnpm db:studio` | Launch Drizzle Studio web GUI for database inspection |

---

## Institutional Compliance & Security Notice

This software manages sensitive student, staff, and financial records. When deploying to production:
1. Rotate all secret keys in `.env` (`OTP_HASH_SECRET`, `KEYCLOAK_CLIENT_SECRET`, database passwords).
2. Ensure PostgreSQL runs behind TLS with role-based database users (`sms_api`, `sms_worker`, `sms_payroll_reader`).
3. Maintain immutable audit log retention under the `audit` schema for a minimum of 7 years in accordance with national education board standards.

---

**Dhaka Model College Institutional Management System** · *Single Source of Truth ERP Architecture*
