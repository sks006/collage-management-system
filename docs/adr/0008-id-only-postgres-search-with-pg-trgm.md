# 8. Search Architecture: ID-Only PostgreSQL Trigram Search

Date: 2026-11-20
Status: Accepted

## Context
Staff and faculty need instant search across student names, student IDs, parent phone numbers, and notices in both English and Bangla scripts. Adding external search engines (Elasticsearch, OpenSearch) introduces cluster management overhead and synchronization lags.

## Decision
Use PostgreSQL native `pg_trgm` and `tsvector` GIN indexes for global search:
- The search service query returns only primary key IDs (`student_id`, `notice_id`).
- Full row data is fetched from PostgreSQL in a secondary step applying row-level scoping (`RowScope`).
- A benchmark spike verifies that 20k records achieve sub-50ms response times. If performance or recall degrades, Meilisearch will be deployed as an isolated sidecar fallback.

## Consequences
- Zero external search cluster operational burden.
- Enforces row-level security and permission scopes transparently after search ID retrieval.
