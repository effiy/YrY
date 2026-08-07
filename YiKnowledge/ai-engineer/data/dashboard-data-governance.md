---
title: data governance dashboard
aliases:
- data catalog dashboard
- data compliance dashboard
- data lineage dashboard
- data quality governance dashboard
tags:
- dashboard
- data-governance
- data-catalog
- data-lineage
- data-compliance
- pii
- gdpr
category: ai-engineer/data
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: dashboard
status: stable
lifecycle: active
review_cycle: monthly
roles:
- ai-engineer
- engineer
- tech-lead
- executive
benefit: data governance maturity and compliance visible at a glance
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"
related:
- ./dashboard-data-pipeline.md
- ../../engineer/infrastructure/dashboard-database-performance.md
- ../../engineer/quality-security/dashboard-security-posture.md
- ../../oncall-sre/observability/dashboard-business-continuity.md
tacit: false
---

# data governance dashboard

> **As a** data engineer, **I want to** track data governance maturity and compliance, **so that** data assets are discoverable, classified, protected, and managed throughout their lifecycle.

> Data governance is the discipline of treating data as a strategic asset. This dashboard tracks data catalog coverage, classification, lineage, access control, and retention across the data estate.

## Summary

- 5 governance dimensions: data catalog, data classification, data lineage, access control, retention & lifecycle
- Data catalog tracks 280+ data assets across 8 source systems with ownership, description, and quality metadata
- Classification enforced by sensitivity tier (PII, PCI, PHI, Confidential, Internal, Public) with automated scanning
- Lineage tracked end-to-end from source → ingestion → transformation → serving → consumption
- Dashboard reviewed monthly; data governance council quarterly

## Core viewpoints

- Data is an asset, not a byproduct — data needs ownership, documentation, quality standards, and lifecycle management
- You can't protect what you can't find — data catalog and classification are prerequisites for data security and compliance
- Lineage is the chain of custody for data — if you can't trace where data came from, you can't trust it or delete it
- Access control is a governance concern, not just a security one — least privilege is a data quality and compliance requirement

## Key information

### 5-panel data governance overview

```
┌──────────────────────────────────────────────────────────────────┐
│  DATA CATALOG                    │  DATA CLASSIFICATION             │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Assets:     285 total  │   │  │  Classified:  235 (82%) │   │
│  │  Documented: 228 (80%)  │   │  │  PII:          42 (15%) │   │
│  │  Owned:      255 (89%)  │   │  │  PCI:           8 (3%)  │   │
│  │  Tagged:     198 (69%)  │   │  │  Confidential: 85 (30%) │   │
│  │  Quality:    76% score  │   │  │  Internal:     72 (25%) │   │
│  │  Discovered: 72% < 5 min│   │  │  Public:       28 (10%) │   │
│  │  Stale:       12 assets │   │  │  Unclassified: 50 (18%) │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  DATA LINEAGE                    │  ACCESS CONTROL                 │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  End-to-end:  72% ███▌  │   │  │  Least privilege: 78%   │   │
│  │  Source→Ingest: 92%     │   │  │  Over-permission: 15%   │   │
│  │  Ingest→Transform: 85%  │   │  │  Access reviews: 82%    │   │
│  │  Transform→Serve: 78%   │   │  │  MFA enforced:  95%     │   │
│  │  Serve→Consume: 65%     │   │  │  PII masking:   88%     │   │
│  │  Breakage:     3 nodes  │   │  │  Audit log:     92%    │   │
│  │  Auto-lineage: 55%      │   │  │  Anomaly det:   3/week  │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Data catalog coverage

| Source system | Total assets | Documented | Owned | Tagged | Quality score | Stale (>90d) |
|---|---|---|---|---|---|---|
| PostgreSQL (primary) | 85 | 78 (92%) | 80 (94%) | 65 (76%) | 82% | 3 |
| MongoDB (knowledge) | 45 | 35 (78%) | 40 (89%) | 30 (67%) | 72% | 2 |
| Redis (cache) | 20 | 12 (60%) | 15 (75%) | 10 (50%) | 65% | 1 |
| S3 (file storage) | 35 | 28 (80%) | 30 (86%) | 25 (71%) | 75% | 4 |
| Elasticsearch (search) | 25 | 20 (80%) | 22 (88%) | 18 (72%) | 74% | 0 |
| Kafka (streaming) | 30 | 25 (83%) | 28 (93%) | 22 (73%) | 78% | 1 |
| Data Warehouse (Snowflake) | 28 | 22 (79%) | 26 (93%) | 20 (71%) | 80% | 0 |
| Third-party APIs | 17 | 8 (47%) | 14 (82%) | 8 (47%) | 55% | 1 |
| **Total** | **285** | **228 (80%)** | **255 (89%)** | **198 (69%)** | **76%** | **12** |

### Data classification by sensitivity

| Classification | Definition | Assets | % of total | Examples |
|---|---|---|---|---|
| **PII** | Personally identifiable information | 42 | 15% | User emails, names, IPs, session tokens |
| **PCI** | Payment card industry data | 8 | 3% | Billing tokens, transaction metadata |
| **PHI** | Protected health information | 0 | 0% | N/A — not in our data |
| **Confidential** | Business-sensitive, trade secrets | 85 | 30% | Model weights, prompt templates, eval results, pricing |
| **Internal** | Not public, low sensitivity | 72 | 25% | Internal metrics, logs, dev configs, code review data |
| **Public** | Safe for public disclosure | 28 | 10% | Public API docs, OSS code, public benchmarks |
| **Unclassified** | Not yet classified | 50 | 18% | Legacy data, new sources, unverified exports |

### PII inventory and protection

| PII category | Data elements | Locations | Encrypted at rest | Encrypted in transit | Masked in logs | Access controlled | GDPR ready |
|---|---|---|---|---|---|---|---|
| User identity | email, name, username | PG, Mongo, Redis | Yes | Yes | Yes | Yes | Yes |
| Contact | phone, address | PG | Yes | Yes | Yes | Yes | Partial |
| Credentials | passwords, tokens, API keys | PG, Vault | Yes | Yes | Yes | Yes | Yes |
| Session | session tokens, refresh tokens | Redis, PG | Yes | Yes | Yes | Yes | Yes |
| Behavioral | search history, chat history | Mongo, ES | Yes | Yes | Partial | Yes | Partial |
| Payment | billing tokens, plan info | PG, Stripe | Yes | Yes | Yes | Yes | Yes |
| IP/Device | IP addresses, user agents | Logs, PG | Yes | Yes | Partial | Partial | Partial |
| **Overall** | | | **100%** | **100%** | **88%** | **90%** | **78%** |

### Data lineage coverage by pipeline stage

| Pipeline | Source → Ingest | Ingest → Transform | Transform → Serve | Serve → Consume | End-to-end | Auto-lineage |
|---|---|---|---|---|---|---|
| Chat data pipeline | 95% | 90% | 85% | 70% | 85% | Yes |
| Code review pipeline | 90% | 85% | 80% | 65% | 80% | Yes |
| Knowledge base pipeline | 92% | 88% | 78% | 60% | 78% | Partial |
| User analytics pipeline | 95% | 90% | 85% | 75% | 86% | Yes |
| Billing pipeline | 90% | 85% | 80% | 70% | 81% | Partial |
| Search indexing pipeline | 88% | 80% | 72% | 55% | 72% | No |
| Notification pipeline | 92% | 85% | 75% | 60% | 76% | No |
| Model training pipeline | 90% | 85% | 80% | 65% | 78% | Partial |
| **Overall** | **92%** | **85%** | **78%** | **65%** | **72%** | **55%** |

### Data lineage breakage register

| Breakage | Pipeline | Stage | Impact | Detected | Owner | Status |
|---|---|---|---|---|---|---|
| Chat → Analytics transform | Chat | Transform → Serve | Analytics dashboards show stale data | 2026-07-28 | Data Lead | In progress |
| Knowledge → Search mapping | Knowledge | Ingest → Transform | Search results incomplete | 2026-07-20 | Platform | Open |
| Billing → Finance export | Billing | Serve → Consume | Finance reports missing 3 days | 2026-07-15 | Platform | Resolved |

### Access control health

| Data store | Least privilege enforced | Over-permissioned accounts | Access review current | MFA enforced | Audit logging | PII masking |
|---|---|---|---|---|---|---|
| PostgreSQL | 85% | 12 | 90% | 100% | 95% | 90% |
| MongoDB | 75% | 18 | 80% | 95% | 90% | 85% |
| Redis | 70% | 8 | 75% | 90% | 85% | 80% |
| S3 | 80% | 15 | 85% | 95% | 92% | 88% |
| Elasticsearch | 78% | 10 | 80% | 95% | 88% | 82% |
| Kafka | 82% | 6 | 85% | 95% | 90% | 90% |
| Snowflake | 80% | 8 | 82% | 100% | 95% | 92% |
| Third-party APIs | 65% | 12 | 60% | 85% | 75% | 70% |
| **Overall** | **78%** | **89 (15%)** | **82%** | **95%** | **92%** | **88%** |

### Access review cadence

| Review type | Frequency | Last completed | Overdue | Findings | Remediated |
|---|---|---|---|---|---|
| User access review | Quarterly | 2026-07-01 | 0 | 12 over-permissioned | 8 (67%) |
| Service account review | Monthly | 2026-07-15 | 0 | 3 unused accounts | 2 (67%) |
| PII access review | Monthly | 2026-07-01 | 0 | 5 excessive PII access | 4 (80%) |
| Third-party access review | Quarterly | 2026-06-15 | 0 | 2 vendor access expired | 2 (100%) |
| Admin/root access review | Monthly | 2026-07-10 | 0 | 1 unauthorized escalation | 1 (100%) |
| **Overall** | | | **0 overdue** | **23 findings** | **17 (74%)** |

### Data retention compliance

| Data category | Retention policy | Systems | Compliant | Non-compliant | Over-retained | Risk |
|---|---|---|---|---|---|---|
| User PII | 7 years after account deletion | PG, Mongo | 85% | 15% | 12,400 records | Medium |
| Chat history | 2 years | Mongo | 90% | 10% | 8,500 records | Medium |
| Code review data | 3 years | Mongo, S3 | 95% | 5% | 2,200 records | Low |
| Billing records | 10 years (legal) | PG | 100% | 0% | 0 | None |
| Logs | 1 year | S3, ES | 88% | 12% | 450 GB | Medium |
| Analytics events | 3 years | Snowflake, Kafka | 80% | 20% | 850 GB | Medium |
| Backups | 30-365 days by tier | S3 | 94% | 6% | 120 GB | Low |
| Session tokens | 30 days | Redis | 98% | 2% | 5,200 tokens | Low |
| **Overall** | | | **91%** | **9%** | | |

### Data subject request (DSAR) tracking

| Month | Requests received | Responded within SLA (30 days) | Avg response time | Data deleted | Data exported | Overdue |
|---|---|---|---|---|---|---|
| Jan | 8 | 7 (88%) | 18 days | 5 | 3 | 1 |
| Feb | 6 | 5 (83%) | 22 days | 4 | 2 | 1 |
| Mar | 12 | 10 (83%) | 20 days | 8 | 4 | 2 |
| Apr | 9 | 8 (89%) | 16 days | 6 | 3 | 1 |
| May | 7 | 6 (86%) | 19 days | 5 | 2 | 1 |
| Jun | 11 | 9 (82%) | 21 days | 7 | 4 | 2 |
| Jul | 8 | 7 (88%) | 15 days | 5 | 3 | 1 |
| **Total** | **61** | **52 (85%)** | **19 days** | **40** | **21** | **9** |

## Action recommendations

1. **Classify unclassified assets**: 50 assets (18%) unclassified; run automated classification scan, manually review edge cases within 30 days
2. **Complete PII masking in logs**: 88% masked; 12% of PII categories still exposed in logs (behavioral, IP/device); fix within 2 weeks
3. **Improve serve→consume lineage**: 65% end-to-end for consumption stage; add consumer-side lineage tracking for dashboards and reports
4. **Fix lineage breakages**: 3 active breakages; prioritize Chat→Analytics (stale dashboards), then Knowledge→Search (incomplete results)
5. **Reduce over-permissioned accounts**: 89 accounts (15%) over-permissioned; quarterly access review remediation from 67% → 95%
6. **Third-party API data governance**: 47% documented, 65% least privilege; create third-party data inventory, enforce access controls
7. **Data retention cleanup**: 9% non-compliant; purge 450 GB over-retained logs, 850 GB analytics events, 12,400 PII records
8. **Improve DSAR responsiveness**: 85% within SLA → 95%; automate data discovery across all systems, reduce avg response to 10 days
9. **Auto-lineage expansion**: 55% → 75%; implement auto-lineage for Search, Notification, and Model Training pipelines
10. **Quarterly data governance council**: review classification, retention, access, and compliance; update policies



- Data hoarding → "keep everything forever, storage is cheap"; retention without policy creates legal liability and compliance risk
- Classification theater → classifying data but not applying protection controls based on classification; classification is the input to protection, not the output
- Lineage as documentation → drawing lineage diagrams manually instead of automated discovery; manual lineage is always out of date
- Access accumulation → granting access and never revoking it; people change roles, data access should follow least privilege
- Governance as gatekeeper → data governance that blocks all access instead of enabling responsible use; governance should accelerate trusted data use, not prevent it

## Related

- Same class: [dashboard-data-pipeline](dashboard-data-pipeline.md) — data pipeline health
- Same class: [dashboard-database-performance](../../engineer/infrastructure/dashboard-database-performance.md) — database performance
- Same class: [dashboard-security-posture](../../engineer/quality-security/dashboard-security-posture.md) — security posture
- Same class: [dashboard-business-continuity](../../oncall-sre/observability/dashboard-business-continuity.md) — BC/DR
- References: DAMA — *DMBOK (Data Management Body of Knowledge)*; GDPR Article 30 — *Records of Processing Activities*; CCPA — *California Consumer Privacy Act*; NIST — *Data Governance Framework*; Apache Atlas; DataHub