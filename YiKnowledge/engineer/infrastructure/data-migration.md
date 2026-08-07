---
aliases:
- Data Migration Process
title: Data migration and rollback process
tags:
- process
- data migration
- rollback
- DBA
- SOP
category: engineer/infrastructure
created: 2026-07-30
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: process
status: stable
lifecycle: active
review_cycle: yearly
roles:
- engineer
benefit: process followed predictably
acceptance_criteria:
  - "steps are ordered and each has a clear owner or role"
  - "prerequisites and inputs are listed before the first step"
  - "outcome is measurable or verifiable"
related:
- ./data-compliance.md
- ./capacity-planning.md
- ../../oncall-sre/release/rollback-drill.md
- ../../oncall-sre/release/release.md
tacit: false
---

# Data migration and rollback process

> **As an** engineer, **I want to** data migration, **so that** process followed predictably. 

## 1. Purpose and applicable scope

Standardize the actions of database structure changes and data migration, ensuring rollbackable, verifiable, traceable; avoid table locks, data loss, inconsistency. 

Applicable to: DDL changes, large-table data migration, cross-database/cross-system data sync, historical data archive. 

Not applicable to: business-side CRUD (handled at application layer). 

## 2. Roles and responsibilities

| role | responsibility |
|---|---|
| DBA / backend owner (R) | write migration scripts; execute; verify |
| tech owner (A) | review plan; decide execution window |
| iteration PM (C) | coordinate window and dependency parties |
| ops / SRE (C) | monitoring, scaling, contingency plan |
| business stakeholders (I) | business impact confirmation and downtime window decision |

## 3. Step breakdown

```
Plan review → Preparation → Dry run → Execute → Verify → Rollback plan → Wrap-up
```

| step | key actions | exit criteria |
|---|---|---|
| 1. Plan review | table structure change, data volume assessment, lock impact, rollback SQL, downtime or not | plan approved |
| 2. Preparation | script review; backup strategy confirmed; monitoring dashboard in place; alert threshold tuned | all in place |
| 3. Dry run | execute on staging/shadow database; verify correctness and duration | dry run passed |
| 4. Execute | execute per planned window; commit in batches; watch monitoring throughout | script execution complete |
| 5. Verify | row count reconciliation, sample comparison, business-side verification | data consistent |
| 6. Rollback plan | if verification fails, execute rollback SQL immediately; assess whether to restore from backup | restored to pre-migration |
| 7. Wrap-up | archive scripts and records; clean up temp tables | archive complete |

## 4. Input / output artifacts

- **input**: table structure change explanation, data mapping rules, rollback SQL
- **output**: migration scripts, execution records, verification report, rollback records

## 5. Measurement metrics

- Migration success rate
- Average migration duration
- Number of incidents from migration (goal 0) 
- Rollback execution count

## 6. Exception handling and upgrade path

| scenario | handling |
|---|---|
| Lock beyond expectation | pause; assess whether to abort migration |
| Data inconsistency | stop immediately; execute rollback plan |
| Backup failure | abort migration; fix backup capability first |
| Downtime window insufficient | split migration; execute in batches |
| Cross-system sync failure | pause downstream consumption; assess data repair scope |
| Involves funds/orders | must have business stakeholder + tech owner dual sign-off |

## 7. Notes

- **Always assume migration will fail — rollback SQL must be written and verified as feasible first**
- Large tables prefer online DDL tools (e.g. gh-ost / pt-osc) 
- Do not execute during business peak; prefer low-traffic window
- Backup is the bottom line — no execution without backup
- Data migration and code release decoupled — avoid simultaneous changes
- Migrations involving funds/orders/user identity must have dual sign-off
