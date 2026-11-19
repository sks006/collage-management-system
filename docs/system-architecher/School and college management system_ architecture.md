# School and college management system: architecture

One institution, built as a modular monolith on PostgreSQL. It covers attendance for students, teachers and office staff, student fee collection, and teacher and staff payroll.

- 10,000–20,000 students
- 200–500 teachers
- Self-hosted origin
- Single database, no tenant IDs

## How the system fits together

Clients reach one API through a reverse proxy. Business data and background events are written in the same database transaction, and workers handle everything slow or external.

```mermaid
flowchart TB
  subgraph Clients
    W[Web portal]
    M[Mobile app]
    D[Attendance devices]
  end
  Clients --> EDGE[Reverse proxy, WAF, rate limiting]
  GW[Payment aggregator] -- IPN webhook --> EDGE
  EDGE --> API
  subgraph Core[Modular monolith, 2 instances]
    API[API layer]
    API --> PPL[People and classes]
    API --> ATT[Attendance]
    API --> FEE[Student fees]
    API --> PAY[Payroll]
    FEE --> LED[Ledger]
    PAY --> LED
  end
  API -. OIDC .-> IDP[Keycloak]
  Core --> PG[(PostgreSQL)]
  Core --> RD[(Redis cache)]
  PG --> OB[(Outbox)]
  OB --> WK[Workers]
  WK --> OBJ[(S3-compatible storage)]
  WK --> EXT[SMS, email, payment gateway]
```

## Attendance, fees and payroll

Attendance is stored as raw events and summarised daily. Payroll reads the daily summary, and every money movement posts to one immutable ledger.

```mermaid
flowchart LR
  E1[Check-in events] --> AE[(attendance_event)]
  E2[Manual entry] --> AE
  AE -->|nightly job| AD[(attendance_day)]
  AD -->|month close| PS[Draft payslips]
  PS -->|maker-checker approval| AP[Approved payslips]
  AP -->|payout| PO[Salary paid]
  INV[Invoices] --> PM[Student payment]
  IPN[Gateway IPN, validated] --> PM
  PM --> LG[(Ledger)]
  PO --> LG
  LG --> REC[Daily reconciliation]
```

## Month close, payroll and payout

Payroll reads a locked attendance period, never raw clock-ins. A payslip needs a second approver, and a failed payout stays unpaid until it is retried. Corrections after the lock become adjustments in the next payroll instead of rewriting a paid month.

```mermaid
flowchart LR
  AD[(attendance_day)] --> CL[Month close: lock attendance]
  LV[Approved leave and holidays] --> CL
  CL --> DR[Draft payslips]
  DR --> AP{Second approver}
  AP -->|approved| PB[Payout batch]
  AP -->|returned| DR
  PB --> BK[Bank or wallet]
  BK -->|paid| LG[(Ledger)]
  BK -->|failed| RT[Retry or manual payout]
  RT --> PB
  LG --> RC[Reconcile with bank statement]
  LC[Late correction after lock] --> AJ[Adjustment line in next payroll]
  AJ --> DR
```

## Leave and attendance corrections

Approved leave changes a day’s status so it isn’t counted as an absence. Corrections need a reason and a second approver, and every outcome is written to the audit log.

```mermaid
flowchart TB
  subgraph Leave
    L1[Staff submits leave request] --> L2{Head or HR approves}
    L2 -->|yes| L3[attendance_day status becomes leave]
    L2 -->|no| L4[Stays absent]
  end
  subgraph Correction
    C1[Teacher requests correction with reason] --> C2{Second approver}
    C2 -->|approved, period open| C3[Update attendance_day]
    C2 -->|approved, period locked| C4[Adjustment in next payroll]
    C2 -->|rejected| C5[No change]
    C3 --> AU[(Audit log)]
    C4 --> AU
    C5 --> AU
  end
```

## Invoices, waivers and refunds

The invoice job runs once per student and month, so a rerun can’t bill anyone twice. Payments are confirmed by a validated IPN or a status poll. Waivers and refunds need a second approver and post to the same ledger as payments.

```mermaid
flowchart LR
  FS[Fee structure by class and year] --> GEN[Monthly invoice job, one per student and month]
  GEN --> INV[(Invoices)]
  INV --> NT[Guardian notice]
  INV --> PAY[Payment via aggregator]
  PAY --> VAL[Validated IPN or status poll]
  VAL --> LG[(Ledger)]
  WV[Waiver or scholarship request] --> A1{Second approver}
  RF[Refund request] --> A1
  A1 -->|waiver| CN[Credit note entry]
  A1 -->|refund| GR[Gateway refund]
  CN --> LG
  GR --> LG
```

## Decisions

| Area | Choice | Reason |
| --- | --- | --- |
| Architecture | Modular monolith, 2 app instances | One institution at this scale doesn’t need microservices. Strict module boundaries keep extraction possible later. |
| Database | PostgreSQL, partitioned by academic year | Transactions for money, about 25M period-attendance rows a year at 20k students, point-in-time recovery. |
| Events and jobs | Outbox table plus worker | Notifications and PDFs commit atomically with the data and retry safely. Scheduled jobs use advisory locks. |
| Search | Postgres full-text and `pg_trgm` | OpenSearch is added only if a Bangla search spike fails. |
| Identity | Keycloak over OIDC | MFA for admin, finance and HR. Phone OTP for guardians and students. Fine-grained permissions stay in the app. |
| Payments | One aggregator integration | Session, hosted payment page, then a validated IPN webhook processed idempotently. |
| Money | Integer amounts, double-entry ledger | Corrections are reversing entries. Payroll, refunds and waivers need a second approver. |
| Files | S3-compatible object storage | Receipts, payslips and report cards served by short-lived signed URLs. Backups kept off-site. |

## Still to confirm

- Whether the institution must collect fees through a specific government gateway, which would decide the payment integration.
- Whether hosting is fully on-premises or an on-premises origin behind Cloudflare.
- How attendance is captured: manual entry, RFID or QR cards, or biometric devices.
- Bangla search quality on real names and notices, tested in a one-week spike.
- Which payout format your bank supports for bulk salary payments.
- The institution’s leave and holiday rules, which decide how absences are counted.