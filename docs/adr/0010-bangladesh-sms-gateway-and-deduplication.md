# 10. Communication: Bangladesh SMS Gateway Integration and Deduplication

Date: 2026-11-20
Status: Accepted

## Context
Daily attendance alerts (student absentees), exam fee due reminders, and emergency closure notices must reach parents via SMS across all Bangladeshi mobile network operators (Grameenphone, Banglalink, Robi, Teletalk). Duplicate SMS messages confuse parents and waste institutional funds.

## Decision
- Integrate domestic SMS gateways via HTTP REST with fallback providers.
- Implement fingerprint deduplication in `NotificationProcessor`:
  - Calculate `SHA256(recipient + message_template + date)`.
  - Cache deduplication keys in Redis / PostgreSQL with an 18-hour TTL.
  - Skip duplicate transmissions if marked again within the same school day.

## Consequences
- Protects against accidental multiple SMS transmissions to parents.
- Cost-efficient delivery with delivery receipt tracking.
