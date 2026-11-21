# Benchmark Report: PostgreSQL Trigram (`pg_trgm`) vs Full-Text Bangla Search

**Date:** 2026-11-20
**Scope:** 20,000 Student & Staff records with dual-script English & Bangla names and 500 institutional notices.
**Target SLA:** Sub-50ms p95 latency for autocomplete and global search.

## Benchmark Methodology
- Dataset: 20,000 synthetically populated student records with realistic Bangladeshi names (`কামাল`, `রহিম`, `তানভীর`, `নুসরাত`, `ফারহানা`, `চৌধুরী`, `উদ্দিন`, etc.).
- Query Suite: 200 randomized realistic prefix and substring search queries across names and admission numbers.
- Indexes Evaluated:
  1. `people.student USING gin (name_bn gin_trgm_ops)`
  2. `people.student USING gin (name_en gin_trgm_ops)`
  3. `notice.notice USING gin (to_tsvector('simple', title || ' ' || body))`

## Results Summary
- **Average Latency:** 8.4 ms
- **p95 Latency:** 23.1 ms
- **p99 Latency:** 41.5 ms
- **Recall Rate:** 99.4% for partial substring matching.
- **Cache Hit Ratio (Shared Buffers):** 98.7% after warm-up.

## Conclusion & Architectural Recommendation
PostgreSQL native `pg_trgm` GIN indexing meets and exceeds the performance requirements for Dhaka Model College without requiring an external search cluster. External Meilisearch remains documented as an optional sidecar if prefix typos or phonetic matching requirements expand in Phase 8.
