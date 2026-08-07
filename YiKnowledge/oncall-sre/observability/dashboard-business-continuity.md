---
title: business continuity dashboard
aliases:
- BC/DR dashboard
- disaster recovery dashboard
- business continuity management dashboard
- resilience dashboard
tags:
- dashboard
- business-continuity
- disaster-recovery
- resilience
- backup
- failover
- rpo-rto
category: oncall-sre/observability
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: dashboard
status: stable
lifecycle: active
review_cycle: monthly
roles:
- oncall-sre
- tech-lead
- executive
benefit: business continuity and disaster recovery readiness visible at a glance
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"
related:
- ../observability/dashboard-system-health.md
- ../incident-response/dashboard-incident-trends.md
- ../release/dashboard-release-management.md
- ../../tech-lead/risk/dashboard-risk-management.md
tacit: false
---

# business continuity dashboard

> **As an** SRE, **I want to** track business continuity and disaster recovery readiness, **so that** the organization can recover from disruptions within defined RPO/RTO targets.

> Business continuity is not a document — it's a practiced capability. This dashboard tracks RPO/RTO compliance, backup health, DR test results, failover readiness, and BC plan coverage across all critical systems.

## Summary

- 5 BC/DR dimensions: RPO/RTO compliance, backup & recovery health, DR test execution, failover readiness, BC plan coverage
- 12 critical systems tracked with defined RPO (15 min to 4 hours) and RTO (30 min to 8 hours) per tier
- Backups monitored for completeness, integrity, recoverability, and retention compliance
- DR tests conducted quarterly with full failover annually; tabletop exercises biannually
- Dashboard reviewed monthly; BC/DR steering committee quarterly

## Core viewpoints

- RPO and RTO are business decisions, not technical ones — they define how much data you can lose and how fast you must recover, and they drive architecture
- Backups that aren't tested aren't backups — every backup is a hypothesis until a restore test proves it works
- DR is a muscle, not a plan — regular testing is the only way to ensure recovery works under real conditions
- Resilience is layered — no single DR strategy (backup, replication, multi-AZ, multi-region) is sufficient alone

## Key information

### 5-panel BC/DR overview

```
┌──────────────────────────────────────────────────────────────────┐
│  RPO/RTO COMPLIANCE              │  BACKUP & RECOVERY HEALTH        │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  RPO compliance: 92%    │   │  │  Backup success: 98%    │   │
│  │  RTO compliance: 88%    │   │  │  Restore tested: 85%    │   │
│  │  Tier 1 (4 sys): 95%    │   │  │  Integrity:     96%    │   │
│  │  Tier 2 (5 sys): 90%    │   │  │  Retention:     94%    │   │
│  │  Tier 3 (3 sys): 85%    │   │  │  Encryption:    100%   │   │
│  │  SLA breaches:  2 this Q│   │  │  Immutable:     88%    │   │
│  │  Avg data loss: 8 min   │   │  │  Recovery time: 42 min  │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  DR TEST EXECUTION               │  FAILOVER READINESS             │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Tests planned:  4/Q    │   │  │  Multi-AZ:     10/12    │   │
│  │  Tests executed: 3/4    │   │  │  Multi-region:   4/12   │   │
│  │  Pass rate:     85%     │   │  │  Auto-failover:  6/12   │   │
│  │  Tabletop:       2/yr   │   │  │  DNS failover:  10/12   │   │
│  │  Full failover:  1/yr   │   │  │  Runbook:       10/12   │   │
│  │  Findings:      12 open │   │  │  Playbook tested: 8/12  │   │
│  │  Remediation:    8 done │   │  │  Mean failover:  3.2 min │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### System criticality tiers

| Tier | RPO | RTO | Systems | Business impact | Annual cost of downtime |
|---|---|---|---|---|---|
| **Tier 1 — Critical** | 15 min | 30 min | 4 (Chat, Auth, API Gateway, Database) | Revenue + user trust | $85K/hour |
| **Tier 2 — Essential** | 1 hour | 2 hours | 5 (Code Review, Knowledge, Billing, Notifications, Search) | Degraded service | $35K/hour |
| **Tier 3 — Important** | 4 hours | 8 hours | 3 (Admin, Analytics, File Processing) | Internal impact | $8K/hour |

### RPO/RTO compliance by system

| System | Tier | Target RPO | Actual RPO | Target RTO | Actual RTO | RPO met? | RTO met? | Last test |
|---|---|---|---|---|---|---|---|---|
| Chat Service | T1 | 15 min | 8 min | 30 min | 22 min | Green | Green | 2026-07-15 |
| Auth Service | T1 | 15 min | 12 min | 30 min | 28 min | Green | Green | 2026-07-15 |
| API Gateway | T1 | 15 min | 10 min | 30 min | 18 min | Green | Green | 2026-06-20 |
| Primary Database | T1 | 15 min | 5 min | 30 min | 35 min | Green | **Red** | 2026-07-15 |
| Code Review | T2 | 1 hour | 45 min | 2 hours | 1.8 hours | Green | Green | 2026-06-20 |
| Knowledge Base | T2 | 1 hour | 55 min | 2 hours | 2.2 hours | Green | **Red** | 2026-07-15 |
| Billing Service | T2 | 1 hour | 30 min | 2 hours | 1.5 hours | Green | Green | 2026-05-10 |
| Notification Service | T2 | 1 hour | 40 min | 2 hours | 1.2 hours | Green | Green | 2026-06-20 |
| Search Service | T2 | 1 hour | 50 min | 2 hours | 1.8 hours | Green | Green | 2026-07-15 |
| Admin Console | T3 | 4 hours | 2.5 hours | 8 hours | 5.2 hours | Green | Green | 2026-04-15 |
| Analytics | T3 | 4 hours | 3.8 hours | 8 hours | 7.5 hours | Green | Green | 2026-04-15 |
| File Processing | T3 | 4 hours | 3.2 hours | 8 hours | 6.8 hours | Green | Green | 2026-05-10 |

### Backup health by system

| System | Backup type | Frequency | Success rate | Restore tested | Integrity check | Retention | Immutable |
|---|---|---|---|---|---|---|---|
| Primary Database | Continuous + daily snapshot | Real-time | 99.8% | Weekly | 100% | 30 days | Yes |
| Chat Service (state) | Daily snapshot + WAL | Daily | 99.5% | Monthly | 98% | 14 days | Yes |
| Auth Service (state) | Daily snapshot | Daily | 99.9% | Monthly | 100% | 30 days | Yes |
| Knowledge Base (index) | Rebuild + snapshot | Daily | 98.5% | Monthly | 95% | 7 days | No |
| Billing DB | Continuous | Real-time | 99.9% | Weekly | 99% | 90 days | Yes |
| Search Index | Rebuild (no snapshot) | Daily | 97.2% | Monthly | 92% | 7 days | No |
| File Storage (S3) | Cross-region replication | Real-time | 99.99% | Quarterly | 100% | 365 days | Yes |
| Config/Secrets | Encrypted snapshot | Daily | 99.8% | Quarterly | 100% | 90 days | Yes |
| Logs/Audit | Streaming to cold storage | Real-time | 99.5% | Quarterly | 96% | 365 days | Yes |
| CI/CD state | Daily snapshot | Daily | 98.0% | Monthly | 94% | 30 days | No |

### Backup restore test log

| Date | System | Backup age | Restore time | Data integrity | Result | Issue |
|---|---|---|---|---|---|---|
| 2026-07-28 | Primary Database | 2 hours | 28 min | 100% | Pass | None |
| 2026-07-28 | Auth Service | 4 hours | 12 min | 100% | Pass | None |
| 2026-07-22 | Chat Service | 1 day | 18 min | 99.8% | Pass | 0.2% WAL replay gap |
| 2026-07-15 | Knowledge Base | 3 days | 45 min | 98% | Pass | Index rebuild needed |
| 2026-07-10 | Billing DB | 1 hour | 15 min | 100% | Pass | None |
| 2026-07-05 | Search Index | 2 days | 52 min | 95% | **Fail** | Rebuild incomplete, 5% missing |
| 2026-06-28 | File Storage | 1 day | 8 min | 100% | Pass | None |
| 2026-06-28 | Config/Secrets | 1 day | 5 min | 100% | Pass | None |

### DR test calendar

| Date | Type | Systems tested | Scenario | Duration | Result | Findings |
|---|---|---|---|---|---|---|
| 2026-07-15 | Full failover | Chat, Auth, DB, Gateway | Primary region outage | 4 hours | Pass | 3 findings |
| 2026-06-20 | Partial failover | Code Review, Knowledge, Search | AZ failure | 2 hours | Pass | 2 findings |
| 2026-05-10 | Tabletop | All T1/T2 systems | Ransomware scenario | 3 hours | Pass | 5 findings |
| 2026-04-15 | Partial failover | Analytics, File Processing | Data center flood | 1.5 hours | Pass | 1 finding |
| 2026-03-20 | Tabletop | All systems | Supply chain attack | 3 hours | Pass | 4 findings |
| 2026-02-10 | Full failover | All T1 systems | Database corruption | 6 hours | **Fail** | 8 findings (DB RTO exceeded) |

### DR test findings register

| ID | Finding | Severity | Test date | Status | Owner | Due |
|---|---|---|---|---|---|---|
| DR-028 | DB failover 35 min vs 30 min RTO | Major | 2026-07-15 | Open | DBA Lead | 2026-08-15 |
| DR-027 | Chat service WAL replay gap 0.2% | Minor | 2026-07-15 | Open | AI Lead | 2026-08-15 |
| DR-026 | Knowledge Base index rebuild manual steps | Minor | 2026-07-15 | In progress | Platform | 2026-08-01 |
| DR-025 | Search Index rebuild incomplete, 5% data gap | **Critical** | 2026-07-05 | In progress | Platform | 2026-08-05 |
| DR-024 | Code Review service DNS propagation slow | Minor | 2026-06-20 | Done | SRE | Done |
| DR-023 | Auth service session token invalidation | Major | 2026-06-20 | Done | Platform | Done |
| DR-022 | Ransomware communication plan outdated | Major | 2026-05-10 | Done | Security | Done |
| DR-021 | Third-party dependency recovery order | Minor | 2026-05-10 | Open | SRE | 2026-08-30 |
| DR-020 | No runbook for Admin Console | Major | 2026-04-15 | Done | Platform | Done |
| DR-019 | DB corruption recovery exceeded RTO (Feb test) | **Critical** | 2026-02-10 | Done | DBA Lead | Done |

### Failover architecture coverage

| System | Multi-AZ | Multi-region | Auto-failover | DNS failover | Runbook | Playbook tested |
|---|---|---|---|---|---|---|
| Chat Service | Yes | Yes | Yes | Yes | Yes | Yes |
| Auth Service | Yes | Yes | No | Yes | Yes | Yes |
| API Gateway | Yes | Yes | Yes | Yes | Yes | Yes |
| Primary Database | Yes | Yes | Yes | Yes | Yes | Yes |
| Code Review | Yes | No | No | Yes | Yes | Yes |
| Knowledge Base | Yes | No | No | Yes | Yes | No |
| Billing Service | Yes | Yes | Yes | Yes | Yes | Yes |
| Notification Service | Yes | No | No | Yes | Yes | No |
| Search Service | Yes | No | No | Yes | Yes | No |
| Admin Console | Yes | No | No | Yes | No | No |
| Analytics | No | No | No | No | Yes | No |
| File Processing | Yes | No | Yes | Yes | Yes | Yes |

### BC plan document health

| Plan component | Exists? | Last updated | Reviewed | Tested in exercise | Score |
|---|---|---|---|---|---|
| Crisis communication plan | Yes | 2026-06 | Monthly | May 2026 tabletop | 85% |
| Emergency response procedure | Yes | 2026-07 | Monthly | Jul 2026 failover | 90% |
| System recovery runbook (12 systems) | 10/12 | Various | Quarterly | 8/12 tested | 75% |
| Vendor/third-party contingency | Yes | 2026-03 | Biannually | Feb 2026 tabletop | 70% |
| Data recovery procedure | Yes | 2026-07 | Monthly | Jul 2026 failover | 88% |
| Alternative site/work arrangement | Yes | 2026-01 | Annually | Never tested | 55% |
| Business impact analysis (BIA) | Yes | 2026-04 | Annually | N/A | 80% |
| **Overall BC plan health** | | | | | **78%** |

### Recovery time objective trend

| Quarter | RPO compliance | RTO compliance | DR tests | Findings open | Mean time to remediate |
|---|---|---|---|---|---|
| 2025-Q3 | 85% | 78% | 2 | 15 | 45 days |
| 2025-Q4 | 88% | 82% | 3 | 12 | 38 days |
| 2026-Q1 | 90% | 85% | 3 | 10 | 32 days |
| 2026-Q2 | 92% | 88% | 3 | 12 | 28 days |
| 2026-Q3 (to date) | 92% | 88% | 2 | 12 | 22 days |

## Action recommendations

1. **Fix Primary Database RTO**: 35 min actual vs 30 min target; optimize failover automation, reduce manual checkpoint step
2. **Resolve Search Index rebuild**: DR-025 critical — 5% data gap; implement incremental snapshot, test rebuild weekly
3. **Multi-region coverage**: 4/12 systems multi-region; add Code Review, Knowledge Base, and Search to multi-region by Q4
4. **Auto-failover gap**: 6/12 systems with auto-failover; prioritize Auth Service, Code Review, and Knowledge Base
5. **Complete runbooks**: 2/12 systems without runbooks (Admin Console, Search); create within 30 days
6. **Test all playbooks**: 8/12 playbooks tested; schedule tests for remaining 4 in next quarter
7. **Immutable backups**: 2 systems without immutability (Knowledge Base, Search Index); enable within 30 days
8. **Alternative site test**: never tested; schedule tabletop exercise for Q4
9. **Improve Analytics resilience**: no multi-AZ, no auto-failover; assess cost/benefit of upgrading to Tier 2
10. **Quarterly BC/DR steering committee**: review compliance, test results, and investment priorities



- DR plan on a shelf → BC/DR plan is a beautiful document that's never been tested; a plan is a hypothesis until proven by exercise
- Backup without restore → "we have backups" without ever testing restore; a backup that can't be restored is overhead, not insurance
- RPO/RTO as wishful thinking → setting aggressive RPO/RTO without the architecture to support it; RPO/RTO must match infrastructure investment
- Single-region comfort → "the cloud is reliable" as a substitute for multi-region architecture; cloud regions fail
- DR only for disasters → DR capabilities are useful for migrations, maintenance, and capacity planning; test DR for non-disaster use cases

## Related

- Same class: [dashboard-system-health](dashboard-system-health.md) — system health and SLO
- Same class: [dashboard-incident-trends](../incident-response/dashboard-incident-trends.md) — incident management
- Same class: [dashboard-risk-management](../../tech-lead/risk/dashboard-risk-management.md) — risk management
- References: ISO 22301 — *Business Continuity Management*; NIST SP 800-34 — *Contingency Planning*; AWS — *Well-Architected Framework: Reliability Pillar*; Google — *Site Reliability Engineering* (Chapter 12: Disaster Recovery)