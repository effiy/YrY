---
title: backup and recovery dashboard
aliases:
- backup dashboard
- data recovery dashboard
- backup health dashboard
- disaster recovery testing dashboard
- data protection health dashboard
tags:
- dashboard
- backup
- recovery
- disaster-recovery
- data-protection
- backup-testing
- retention
- rpo-rto
category: oncall-sre/observability
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: weekly
roles:
- sre
- engineer
- tech-lead
- security-engineer
benefit: backup success, recovery capability, and data protection health visible at a glance
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
- backup success, recovery testing, data integrity, retention compliance, backup performance, and recovery automation defined
related:
- ./dashboard-business-continuity.md
- ./dashboard-system-health.md
- ./dashboard-capacity-planning.md
- ./dashboard-cost-and-resource.md
- ../../engineer/quality-security/dashboard-data-protection-privacy.md
tacit: false
---

# backup and recovery dashboard

> **As an** SRE, **I want to** track backup success and recovery capability, **so that** every critical dataset is backed up, every backup is tested, every recovery meets RPO/RTO targets, and data protection is a measured, verified, and continuously improving practice — not a prayer that the backups work when disaster strikes.

> Backups are the last line of defense against data loss. This dashboard tracks backup success, recovery testing, data integrity, retention compliance, backup performance, and recovery automation — turning backup and recovery from "somebody should check if the backups ran" into a rigorously tested, continuously verified, and auditable data protection practice.

## Summary

- 6 backup and recovery dimensions: backup success, recovery testing, data integrity, retention compliance, backup performance, recovery automation
- 285 backup jobs; 42 databases; 8 storage systems; 1.2 PB total data under backup; 850 TB daily incremental; 28 recovery tests/month
- Backup success: 96.5% success rate; 10 failed backups/day (avg); 3 critical failures/month (needing manual intervention); 5 backup jobs with > 3 consecutive failures
- Recovery testing: 28 recovery tests/month; 85% success rate; 12% partial success (data recovered but with issues); 3% failure; 8 systems never tested; avg recovery time: 2.5 hours (target < 1 hour)
- Data integrity: 99.8% checksum verification pass rate; 12 corruption events/year (8 detected and repaired, 4 detected at recovery); 5 backup chains with silent corruption
- Dashboard reviewed weekly; backup and recovery audit with SRE and security monthly

## Core viewpoints

- An untested backup is not a backup — it's a hope; a backup that has never been restored is a file that may or may not contain your data; the only way to know if a backup works is to restore it and verify the data is correct
- Recovery time is the only metric that matters during an incident — you can have 99.9% backup success rate, but if recovery takes 8 hours and your RTO is 2 hours, you've failed; backup is easy, recovery is hard, recovery within the RTO is the entire job
- Backup chains are only as strong as their weakest link — a full backup from Sunday, 6 differentials, and 48 transaction logs; if Tuesday's differential is corrupted, Wednesday through Saturday's backups are unrecoverable; chain integrity is more important than individual backup success
- The backup that fails silently for 6 months is the one that destroys the company — a backup job that reports success but writes corrupted data is worse than a backup job that fails loudly; silent corruption is the nightmare scenario of backup engineering

## Key information

### 6-panel backup and recovery overview

```
┌──────────────────────────────────────────────────────────────────┐
│  BACKUP SUCCESS                       │  RECOVERY TESTING                      │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Backup jobs: 285        │   │  │  Recovery tests/mo: 28  │   │
│  │  Success rate: 96.5%     │   │  │  Success: 85% (24)       │   │
│  │  Failed/day: 10          │   │  │  Partial: 12% (3)        │   │
│  │  Critical failures: 3/mo │   │  │  Failure: 3% (1)         │   │
│  │  >3 consecutive fails: 5 │   │  │  Never tested: 8 systems │   │
│  │  Silent failures: 5      │   │  │  Avg recovery time: 2.5h │   │
│  │  Backup score: B (78)    │   │  │  Recovery score: C+(68)  │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  DATA INTEGRITY                       │  RETENTION COMPLIANCE                  │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Checksum pass: 99.8%    │   │  │  Retention policy: 42    │   │
│  │  Corruption events: 12/yr│   │  │  Compliant: 88% (37)    │   │
│  │  Detected+repaired: 8    │   │  │  Over-retained: 3 (cost)│   │
│  │  Detected at recovery: 4 │   │  │  Under-retained: 2 (risk│   │
│  │  Silent corruption: 5    │   │  │  Legal hold: 8 active    │   │
│  │  chains (investigating)  │   │  │  Data sovereignty: 92%   │   │
│  │  Integrity score: B(78)  │   │  │  Retention score: B(78)  │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  BACKUP PERFORMANCE                   │  RECOVERY AUTOMATION                  │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Daily backup: 850 TB    │   │  │  Automated recovery: 42% │   │
│  │  Avg duration: 4.2 hrs   │   │  │  Manual recovery: 58%    │   │
│  │  Backup window: 6 hrs    │   │  │  Runbook quality: 72%    │   │
│  │  Window violations: 8/mo │   │  │  Runbook tested: 45%     │   │
│  │  Storage: 1.2 PB total   │   │  │  Recovery drill freq:    │   │
│  │  Cost: $42K/mo backup    │   │  │  Quarterly (target: mo) │   │
│  │  Performance: B- (72)    │   │  │  Automation score: C(65) │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Backup success by data type

| Data type | Backup jobs | Success rate | Failed/day | Critical failures/mo | Backup method | RPO | RTO | Data volume |
|---|---|---|---|---|---|---|---|---|
| **PostgreSQL (prod)** | 12 | 98.5% | 0.5 | 0.5 | pgBackRest + WAL archiving | < 5 min | < 15 min | 8.5 TB |
| **PostgreSQL (non-prod)** | 28 | 96.0% | 1.5 | 0.5 | pg_dump + WAL | < 1 hour | < 2 hours | 12 TB |
| **MySQL** | 15 | 97.2% | 0.8 | 0.3 | Percona XtraBackup + binlog | < 15 min | < 30 min | 5.2 TB |
| **MongoDB** | 8 | 95.5% | 1.2 | 0.5 | mongodump + oplog | < 1 hour | < 3 hours | 18 TB |
| **Redis** | 6 | 99.0% | 0.2 | 0.1 | RDB + AOF | < 1 hour | < 30 min | 0.8 TB |
| **Elasticsearch** | 4 | 94.5% | 0.8 | 0.3 | Snapshot API + S3 | < 1 hour | < 4 hours | 22 TB |
| **Object storage (S3)** | 45 | 99.5% | 0.5 | 0.1 | Cross-region replication + versioning | < 15 min | < 1 hour | 850 TB |
| **File storage (EFS/FSx)** | 18 | 95.0% | 1.5 | 0.5 | AWS Backup + snapshots | < 1 hour | < 4 hours | 95 TB |
| **Kubernetes (etcd + PVs)** | 22 | 96.8% | 1.2 | 0.3 | Velero + CSI snapshots | < 1 hour | < 2 hours | 28 TB |
| **Configuration (IaC state)** | 8 | 99.8% | 0.1 | 0 | Git + S3 versioning | Immediate | < 5 min | 0.05 TB |
| **Logs/telemetry** | 85 | 94.0% | 3.5 | 0.5 | S3 lifecycle + Glacier | < 24 hours | < 8 hours | 185 TB |
| **ML models/artifacts** | 34 | 97.5% | 1.2 | 0.2 | S3 + DVC | < 1 hour | < 2 hours | 42 TB |
| **Overall** | **285** | **96.5%** | **10** | **3** | | | | **1.2 PB** |

### Recovery testing by system

| System | Recovery tests/mo | Success rate | Avg recovery time | RTO target | RTO met? | Last tested | Data verified? | Issue |
|---|---|---|---|---|---|---|---|---|
| **YiVad DB (prod)** | 4 | 95% | 18 min | 15 min | 80% | 2026-08-01 | Full checksum | 1 test exceeded RTO (network bottleneck) |
| **YiWeb DB (prod)** | 3 | 90% | 22 min | 30 min | 100% | 2026-07-28 | Full checksum | Recovery time improving (was 35 min) |
| **YiAi DB (prod)** | 2 | 85% | 45 min | 30 min | 50% | 2026-07-25 | Full checksum | RTO consistently missed, needs optimization |
| **YiPet DB (prod)** | 2 | 100% | 12 min | 15 min | 100% | 2026-07-30 | Full checksum | Excellent |
| **User data (MongoDB)** | 2 | 80% | 2.5 hrs | 3 hours | 100% | 2026-07-20 | Sample (10%) | 1 partial failure (index rebuild needed) |
| **Search index (ES)** | 1 | 75% | 5.5 hrs | 4 hours | 0% | 2026-07-15 | Sample (20%) | Recovery too slow, reindexing faster than restore |
| **Object storage (S3)** | 3 | 98% | 35 min | 1 hour | 100% | 2026-08-02 | Full checksum | Near-perfect, cross-region replication |
| **K8s cluster state** | 2 | 85% | 1.8 hrs | 2 hours | 100% | 2026-07-22 | Validation only | 1 partial (PVC not restored correctly) |
| **Never tested** | 0 | N/A | Unknown | Varies | Unknown | Never | No | 8 systems: dev, staging, tools, legacy |
| **Overall** | **28** | **85%** | **2.5 hrs** | | **78%** | | | |

### Data integrity and corruption

| Corruption type | Events/yr | Detected by | Detected at | Repaired | Impact | Root cause | Prevention |
|---|---|---|---|---|---|---|---|
| **Backup file corruption** | 5 | Checksum verification | Backup validation (8 hr later) | 4 repaired, 1 re-backed up | 1 recovery failed (old backup used) | Disk bit rot, network transfer error | Add CRC on write, verify after write |
| **Transaction log gap** | 3 | WAL continuity check | Backup validation | 2 repaired, 1 chain broken | 1 chain unrecoverable (6 hours of data at risk) | WAL archiving lag, network partition | Add WAL gap detection, alert on lag > 5 min |
| **Silent data corruption** | 2 | Recovery test (data comparison) | At recovery (weeks later) | 1 repaired, 1 data loss (0.01%) | 1 recovery test failed, 0.01% data loss | Application-level corruption, not detected by FS | Add application-level checksums, block-level validation |
| **Cross-region replica drift** | 2 | Replica verification | Weekly audit | 2 re-synced | No data loss, but 2-week replication gap | Network throttling, large delete operations | Add continuous replica verification, alert on drift |
| **Overall** | **12** | | | **8 repaired** | **4 incidents** | | |

### Backup performance and window compliance

| Backup tier | Jobs | Avg data/day | Avg duration | Backup window | Window violations/mo | Concurrency | Bottleneck |
|---|---|---|---|---|---|---|---|
| **Tier 0** (critical, RPO < 5 min) | 22 | 85 TB | 1.5 hrs | Continuous (WAL streaming) | 0.5 | 8 parallel | Network bandwidth to S3 (10 Gbps shared) |
| **Tier 1** (production, RPO < 1 hr) | 48 | 320 TB | 3.5 hrs | 4 hrs (01:00-05:00) | 3 | 6 parallel | Disk I/O on source (IOPS contention) |
| **Tier 2** (non-prod, RPO < 24 hrs) | 85 | 280 TB | 5.5 hrs | 8 hrs (22:00-06:00) | 5 | 4 parallel | Backup compression CPU, network |
| **Tier 3** (archival, RPO < 7 days) | 130 | 165 TB | 8.5 hrs | 12 hrs (weekend) | 0 | 2 parallel | Glacier upload speed, object count |
| **Overall** | **285** | **850 TB** | **4.2 hrs** | | **8** | | |

### Recovery automation maturity

| Automation level | Recovery tests | Recovery time | Manual steps | Runbook exists | Runbook tested | Risk |
|---|---|---|---|---|---|---|
| **Fully automated** (1-click, no human decision) | 12 (42%) | 18 min avg | 0 | Yes (100%) | 85% | Low — proven, repeatable |
| **Semi-automated** (scripted, human approval) | 10 (36%) | 1.8 hrs avg | 3-5 steps | Yes (80%) | 55% | Medium — human error, decision delay |
| **Manual** (runbook-driven, human execution) | 6 (22%) | 4.5 hrs avg | 15-20 steps | Yes (55%) | 25% | High — slow, error-prone, person-dependent |
| **No runbook** (ad-hoc) | 0 (0%) | Unknown | Unknown | No (0%) | 0% | Critical — 8 systems, recovery is guesswork |
| **Overall** | **28** | **2.5 hrs** | | **72%** | **45%** | |

## Action recommendations

1. **Recovery testing gap closure**: 8 systems never tested, 3% test failure rate; implement recovery testing for all systems, test every system at least quarterly, target 100% coverage and 95% success rate
2. **YiAi DB RTO compliance**: 50% RTO met, avg 45 min vs 30 min target; optimize recovery parallelism, pre-warm standby instance, add read replica for faster recovery, target 90% RTO compliance
3. **Silent corruption elimination**: 5 backup chains with silent corruption, 4 corruption events detected at recovery; add block-level checksums, verify after write, continuous integrity scanning, target 0 silent corruption
4. **Recovery automation**: 42% automated, 22% fully manual; automate top 10 manual recovery procedures, add 1-click recovery for tier 0/1 systems, target 75% automated recovery
5. **Backup window violations**: 8 window violations/month; add parallel backup streams, optimize compression, move large backups to off-peak, target 0 window violations
6. **Runbook quality and testing**: 72% runbook quality, 45% tested; create runbooks for all systems, test runbooks quarterly, add recovery runbook to incident response, target 95% quality + 90% tested
7. **Search index recovery strategy**: 75% success, 5.5 hrs recovery vs 4 hr RTO; evaluate reindexing from source vs backup restore, implement faster recovery method, add search index snapshot to tier 0
8. **Backup chain integrity monitoring**: 5 chains with > 3 consecutive failures, 1 chain unrecoverable; add chain integrity monitoring, alert on chain break, auto-repair broken chains, target 0 broken chains
9. **Recovery time optimization**: 2.5 hrs avg, only 78% RTO met; implement point-in-time recovery automation, pre-stage recovery infrastructure, add parallel restore, target < 1 hour avg and 95% RTO compliance
10. **Weekly backup and recovery review**: review backup success, recovery testing, data integrity, retention compliance, backup performance, and recovery automation with SRE and security



- The "backups are running, we're fine" assumption → monitoring backup success rate (96.5%) without monitoring recovery success rate (85%); a backup that succeeds but can't be restored is a failure that hasn't been discovered yet — backup monitoring without recovery testing is security theater
- The quarterly recovery test → testing recovery once a quarter and calling it sufficient; if your recovery procedure changes (new DB version, new backup tool, new infrastructure) the day after the quarterly test, you have 89 days of untested recovery — recovery testing should be continuous and automated
- The "we'll figure it out during the incident" recovery → having no runbook, no automation, and no tested procedure; during an incident, stress is high, time is short, and the person who set up the backups 3 years ago has left the company — recovery must be documented, automated, and practiced
- The infinite retention trap → keeping backups forever because "we might need them"; 3 over-retained systems are costing $8,500/month in storage, creating data sovereignty risk, and increasing recovery search time — retention policies exist for a reason, and that reason includes cost
- The backup-is-disaster-recovery confusion → treating backups as the disaster recovery plan; backups protect against data loss, not service loss — if your primary region goes down, restoring 1.2 PB from backups takes days, not the 2-hour RTO your business requires; backups are a component of DR, not the entire DR plan

## Related

- Same class: [dashboard-business-continuity](dashboard-business-continuity.md) — business continuity
- Same class: [dashboard-system-health](dashboard-system-health.md) — system health
- Same class: [dashboard-capacity-planning](dashboard-capacity-planning.md) — capacity planning
- Same class: [dashboard-cost-and-resource](dashboard-cost-and-resource.md) — cost and resource
- Same class: [dashboard-data-protection-privacy](../../engineer/quality-security/dashboard-data-protection-privacy.md) — data protection and privacy
- References: AWS — *Backup and Recovery Best Practices*; Google — *SRE Workbook: Data Integrity*; Veeam — *Data Protection Trends Report*; PostgreSQL — *Backup and Recovery Documentation*; Veritas — *Backup Executive Survey*; W. Curtis Preston — *Backup & Recovery*; NIST — *SP 800-34 Contingency Planning*