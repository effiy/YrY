---
title: Do a Data Retention Review
aliases: [data-retention, retention-review, data-lifecycle, purge]
tags: [strategy, compliance, data, retention, journey]
category: executiver/strategy
created: 2026-08-18
updated: 2026-08-18
last_verified: 2026-08-18
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: quarterly
roles: [executiver, leader]
benefit: "Audit retention policies, classify data lifecycle stages, and implement purge schedules to minimize compliance risk and storage costs"
related:
  - ./handle-data-compliance.md
  - ./handle-a-regulatory-change.md
  - ../README.md
  - ../INDEX.md
---

# Do a Data Retention Review

> **As a** data steward, **I want to** review and enforce data retention policies, **so that** we don't keep data longer than necessary, reducing compliance risk and storage costs.

## Trigger condition

- **Scheduled**: Bi-annual review (every 6 months)
- **Event-driven**:
  - New data type introduced to the system
  - Legal hold placed on specific data
  - New regulation with specific retention requirements
  - Storage cost spike indicating data accumulation
  - Pre-acquisition or pre-funding due diligence

## Step-by-step walkthrough

### Step 1: Classify data by lifecycle stage

Every data type falls into one of these lifecycle stages:

| Stage | Definition | Example |
|---|---|---|
| **Active** | Regularly accessed and used | Current user profiles, active orders |
| **Inactive** | Retained but rarely accessed | Completed orders > 6 months old |
| **Archived** | Moved to cold storage; retained for legal/compliance | Financial records > 2 years |
| **Purge candidate** | No legal or business reason to retain | Abandoned carts > 1 year, deleted account data past grace period |

### Step 2: Define retention rules

For each data type, define:

| Data type | Retention period | Legal basis | Business justification | Disposal method |
|---|---|---|---|---|
| User account data | Account life + 30 days | Contractual necessity | Account recovery window | Hard delete |
| Transaction records | 7 years | Tax law (country-specific) | Audit trail | Archive then delete |
| Analytics events | 2 years | Legitimate interest | Product improvement | Anonymize or delete |
| Support tickets | 3 years | Legitimate interest | Customer history | Archive then delete |
| Email logs | 1 year | Legitimate interest | Deliverability monitoring | Delete |
| Abandoned carts | 90 days | Legitimate interest | Cart recovery | Delete |

### Step 3: Implement retention controls

| Control | Implementation |
|---|---|
| **TTL indexes** | Database-level TTL for time-based auto-deletion |
| **Soft delete** | Mark as deleted; hard delete after grace period |
| **Anonymization** | Remove PII but keep aggregate patterns |
| **Archive pipeline** | Move to cold storage; delete from primary after X days |
| **Legal hold override** | Flag to suspend deletion for specific records under legal hold |

### Step 4: Define the purge schedule

```
Frequency           Data types
──────────────────────────────────────────
Daily               Session data, temporary tokens
Weekly              Cache, rate-limit counters
Monthly             Abandoned carts, soft-deleted items (past grace period)
Quarterly           Inactive accounts (past retention), old logs
Annually            Archived transactions (past retention), analytics raw data
```

### Step 5: Verify and document

After each review cycle:

1. Run a retention report: what was purged, what was retained, what was archived?
2. Spot-check: pick 5 random records and verify their retention status matches policy
3. Update the retention policy document with any changes
4. Log the review: date, reviewer, findings, actions taken

## Decision points and branching

| Decision point | Options | Guidance |
|---|---|---|
| Retention period for a new data type | Align with similar type vs. create new rule | Default to the most restrictive applicable regulation |
| Data has potential future value | Retain vs. anonymize and retain aggregates | Anonymize: keep the insight, lose the liability |
| Legal hold received | Suspend deletion for specific records | Flag in the system; do NOT suspend all purges |
| Regulation changed retention period | Apply retroactively vs. going forward | Legal advice required; typically retroactive for existing data |
| Storage cost exceeds retention value | Shorten retention vs. archive to cheaper tier | Archive first; delete only when both legal and business need expire |

## Key deliverables at each stage

| Stage | Deliverable |
|---|---|
| Classification | Data lifecycle matrix with all data types classified |
| Retention rules | Retention policy document with per-type rules and legal basis |
| Controls | Technical implementation of TTL, soft delete, anonymization |
| Purge schedule | Automated purge calendar with verification |
| Verification | Retention review report with spot-check results |

## Anti-patterns and common pitfalls

| Anti-pattern | Why it fails | Fix |
|---|---|---|
| "Keep everything forever — storage is cheap" | Storage is cheap; liability is not. Breach surface area grows with every retained byte | Default to delete; justify retention, not the other way around |
| No grace period on account deletion | Users accidentally delete and can't recover | 30-day soft delete with user-visible recovery option |
| Retention policy exists but isn't enforced | Policy without automated enforcement is fiction | Implement TTL and automated purge; audit quarterly |
| One-size-fits-all retention | Different data types have different legal and business requirements | Per-type rules with clear legal basis for each |
| Ignoring backups and replicas | Deleting from primary doesn't delete from backups | Include backup purging in the retention pipeline; document the propagation delay |

## This product's landing instance

*To be filled in with your current retention policy. Include the date of last review, the data types covered, the retention periods, and the purge automation status.*