# 7. Payment Integration: Aggregator Webhooks & BEFTN Bank Dispatches

Date: 2026-11-20
Status: Accepted

## Context
Tuition fees arrive from domestic MFS providers (bKash, Nagad, Rocket) and credit cards through aggregators (SSLCommerz / Shurjopay). Staff salaries disburse monthly through commercial banks via the Bangladesh Electronic Funds Transfer Network (BEFTN).

## Decision
- Fee Collection: Use idempotent payment initiation (`Idempotency-Key` header) and IPN webhook handlers that verify callbacks directly with the aggregator before posting to the ledger.
- Payroll Disbursement: Compute net pay, generate standard BEFTN batch transfer files formatted to Bangladesh Bank specification, securely upload to private Cloudflare R2 object storage, and record the transaction in the ledger.

## Consequences
- Prevents double crediting from duplicate webhook retries.
- Automates direct bank file delivery with clear trace numbers for settlement reconciliation.
