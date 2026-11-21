# 3. Asynchronous Processing: Transactional Outbox Worker Engine

Date: 2026-11-20
Status: Accepted

## Context
Side effects like sending SMS notifications, generating PDF receipts/payslips, dispatching BEFTN bank payout files, and querying external payment aggregators must never block API response latencies or be lost during transient failures.

## Decision
Implement the Transactional Outbox Pattern using PostgreSQL table `audit.outbox_event`:
- Business mutations and outbox records are inserted within the same PostgreSQL transaction.
- An independent worker (`apps/worker`) polls pending events using `FOR UPDATE SKIP LOCKED`.
- Exponential backoff with jitter and dead-letter classification (`status = 'FAILED'`) handles retries up to 5 attempts.

## Consequences
- At-least-once delivery guarantee for all background jobs.
- Zero dual-write failure vulnerabilities.
- Safe concurrent worker scaling across multiple instances without lock contention.
