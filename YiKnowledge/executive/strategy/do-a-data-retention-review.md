---
title: Do a data retention review
aliases:
- i-want-to-do-a-data-retention-review
- data-retention-journey
- retention-journey
- data-retention-portal
tags:
- journeys
- data
- retention
- gdpr
- compliance
- deletion
- privacy
category: executive/strategy
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
last_verified: 2026-08-07
roles:
- executive
benefit: review is structured
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./handle-data-compliance.md
- ../../engineer/infrastructure/migrate-data.md
- ../../oncall-sre/incident-response/do-a-security-audit.md
- ../../engineer/infrastructure/data-compliance.md
review_cycle: quarterly
tacit: false
---

# I want to do a data retention review

> **As an** executive, **I want to** do a data retention review, **so that** review is structured.

> "Inventory + classification + retention period + deletion + GDPR + cross-border + quarterly audit + retrospective" — processes + thinking + cases + compliance reachable within 2 hops.

## Summary

- Process: [data-compliance-process.md](../../engineer/infrastructure/data-compliance.md) + [quarterly-security-audit-process.md](../../engineer/quality-security/quarterly-security-audit.md) + [data-migration-process.md](../../engineer/infrastructure/data-migration.md)
- Thinking: [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md)
- Data: [data-governance-summary.md](../../ai-engineer/data/data-governance.md) + [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) + [lakehouse-architecture-summary.md](../../ai-engineer/data/lakehouse-architecture.md)
- Compliance: data compliance process + quarterly security audit

## Core viewpoints

**Data retention is a deletion strategy, not a storage strategy.** Most organizations approach retention by asking "how long should we keep this?" The correct question is "when must we delete this, and what is the hard evidence that deletion occurred?" A retention policy without an automated, auditable deletion mechanism is a liability document that proves you knew you should have deleted data but did not.

**Every copy of data is a separate retention obligation.** Production database, read replicas, backups, data warehouse, analytics exports, developer laptop snapshots, third-party vendor copies -- each is an independent retention surface. A deletion from the primary store that leaves copies in six other locations is not a deletion. The retention review must inventory every copy, and the deletion process must reach every copy.

**The right to be forgotten is the hardest single requirement to implement.** Deleting a user record is easy; deleting every derivative of that user record -- their entries in aggregate tables, their embeddings in vector databases, their fine-tuning contributions in model weights, their mentions in support tickets and logs -- is a systems-engineering challenge that spans every team and every data store. Systems designed without this requirement will require architectural rewrites to satisfy it.

**Retention periods should be the shortest of legal, business, and technical constraints.** Legal says keep tax records for 7 years. Business says keep user behavior data for personalization. Technical says logs are useful for debugging for 30 days. The retention period for any data class is the minimum of these, not the maximum. "Keep everything forever, it might be useful" is the default engineering instinct and the source of most compliance violations.

**Backup deletion is the hidden compliance iceberg.** Most retention policies address production data but ignore backups entirely. A GDPR deletion request that removes a user from the production database but leaves their PII in 90 days of rolling backups is non-compliant. Backup systems must support selective deletion, or retention periods must be shorter than the backup window, or backups must be encrypted with per-user keys that can be destroyed.

## Scenario description

When doing data retention audit / data lifecycle / deletion strategy / GDPR right to be forgotten / cross-border data compliance / quarterly data audit / PII cleanup, platform + legal + security + business owners need to look up processes + thinking + cases + compliance. This entry aggregates data-retention-related processes + thinking + cases into 2-hop paths to avoid "data stored forever / no deletion process / PII sprawl / cross-border violations / no historical data audit / missing right to be forgotten".

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [data-compliance-process.md](../../engineer/infrastructure/data-compliance.md) · [quarterly-security-audit-process.md](../../engineer/quality-security/quarterly-security-audit.md) · [data-migration-process.md](../../engineer/infrastructure/data-migration.md) · [incident-response-process.md](../../engineer/process/incident-response.md) · [monitoring-governance-process.md](../../engineer/process/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [secret-rotation-process.md](./../../oncall-sre/incident-response/do-a-security-audit.md) |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [lakehouse-architecture-summary.md](../../ai-engineer/data/lakehouse-architecture.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) · [mongodb-indexing-summary.md](../../ai-engineer/data/mongodb-indexing.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) — data necessity · [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) — reverse-think leaks · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) |
| `methodology/engineering-patterns/` | [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md) · [supply-chain-hardening-pattern.md](../../engineer/process/harden-supply-chain.md) · [evaluation-driven-development-pattern.md](../../engineer/engineering/evaluation-driven-development.md) · [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) |
| `methodology/ai-specific/` | [prompt-injection-defense-summary.md](../../ai-engineer/methodology/prompt-injection-defense.md) · [hallucination-mitigation-summary.md](../../ai-engineer/methodology/hallucination-mitigation.md) · [rag-design-patterns-summary.md](../../ai-engineer/methodology/rag-design-patterns.md) — AI data retention |
| `tech/ai-platform/` | [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) · [vector-db-comparison-summary.md](../../ai-engineer/platform/vector-db-comparison.md) · [embedding-model-selection-summary.md](../../ai-engineer/platform/embedding-model-selection.md) — AI data retention |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) — data storage cost |
| `lessons/gotchas/` | [no-lockfile-supply-chain-risk.md](../../engineer/lessons/gotcha-no-lockfile-supply-chain-risk.md) · [macos-fsevents-silent-drop.md](../../engineer/lessons/gotcha-macos-fsevents-silent-drop.md) · [sse-ondone-guard.md](../../engineer/lessons/gotcha-sse-ondone-guard.md) |
| `lessons/failures/` | [incident-postmortem-summary.md](../../engineer/lessons/failure-incident-postmortem.md) · [incident-postmortem-template.md](../../engineer/lessons/failure-incident-postmortem.md) · [ai-product-launch-lessons-summary.md](../../engineer/lessons/failure-ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons) — data breach incidents |
| `lessons/wins/` | [yiai-supply-chain-hardening-win.md](../../engineer/lessons/win-yiai-supply-chain-hardening.md) · [yiai-rag-hybrid-retrieval-win.md](../../engineer/lessons/win-yiai-rag-hybrid-retrieval.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [tech-selection-evaluation-template.md](../../knowledge-curator/templates/tech-selection-evaluation.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) |
| `people/stakeholders--` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders--stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders--communication-cadence.md) — legal + compliance |
| `people/experts--` | [external-experts-roster.md](../../knowledge-curator/people/experts--external-experts-roster.md) — external legal experts |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/process/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/process/cross-timezone-collaboration.md) |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) — quarterly audit |
| `journeys/` | [./handle-data-compliance.md](./handle-data-compliance.md) · [../../engineer/infrastructure/migrate-data.md](../../engineer/infrastructure/migrate-data.md) · [../../oncall-sre/incident-response/do-a-security-audit.md](../../oncall-sre/incident-response/do-a-security-audit.md) · [../../oncall-sre/incident-response/handle-a-data-breach.md](../../oncall-sre/incident-response/handle-a-data-breach.md) |

## Action recommendations

1. **First principles**: first ask "what must data retention satisfy (business / legal / compliance / security) / what happens if not stored"; don't store everything; see [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md).
2. **Inversion**: first think "what happens if data is stored forever (leaks / compliance fines / sprawl / deletion cost explosion)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md).
3. **Second-order effects**: one deletion → related data not deleted → backup not deleted → copy not deleted; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md).
4. **Occam**: the simplest strategy that meets compliance wins; don't pile on data; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md).
5. **Data inventory**: must list data assets (DB / files / backups / caches / logs / lakehouse / third party) + dictionary + PII tags; no audit without inventory.
6. **Classification**: must classify PII / sensitive / business / logs / monitoring / backup; each class has a different retention period.
7. **Retention period**: must set retention period by regulation + business need; delete on expiry; don't "store forever".
8. **GDPR**: must support right to be forgotten + data portability + deletion tracking.
9. **Cross-border**: must use data localization; cross-border must desensitize / encrypt / DPA.
10. **PII**: must do desensitization + encryption + access audit + least privilege; don't store plaintext.
11. **Backups**: must include deletion strategy for backups + copies + logs + caches; don't miss backups.
12. **Deletion process**: must be executable + auditable + verifiable + rollback-able; see [i-want-to-write-a-runbook.md](../../engineer/infrastructure/write-a-runbook.md).
13. **AI data**: training data + RAG index + embeddings + conversation history; must use [rag-design-patterns-summary.md](../../ai-engineer/methodology/rag-design-patterns.md) + deletion cascade.
14. **Monitoring**: must monitor deletion execution rate + overdue retained data + PII access; see [monitoring-governance-process.md](../../engineer/process/monitoring-governance.md).
15. **Quarterly audit**: use [quarterly-security-audit-process.md](../../engineer/quality-security/quarterly-security-audit.md) + [review-log.md](../../knowledge-curator/governance/review-log.md); scan whether retention periods are still accurate + whether deletions have landed.
16. **Incident response**: data breach uses [i-want-to-handle-a-data-breach.md](../../oncall-sre/incident-response/handle-a-data-breach.md) + report to regulators.
17. **RACI**: deletion must use [raci-matrix-summary.md](../../engineer/process/raci-matrix.md); business / legal / security / platform graded.
18. **ADR**: retention strategy must be recorded as an ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
19. **Retrospective**: after audit / incident use [incident-postmortem-template.md](../../engineer/lessons/failure-incident-postmortem.md) retrospective + archive in [lessons/failures/bugs/](../../engineer/lessons).

## Anti-patterns

- **Setting retention periods without an automated deletion mechanism.** A documented policy that says "delete after 365 days" with no cron job, no verification step, and no alerting is a paper compliance exercise. The first audit will reveal that no deletion has ever occurred. Retention periods must be enforced by code, not by policy documents.

- **Deleting from the primary store and declaring victory.** The deletion request is satisfied, the production row is gone, and the ticket is closed. Meanwhile, the data persists in yesterday's backup, the analytics warehouse, the cached search index, and the third-party email provider. True deletion requires a data-flow map that traces every copy and a process that reaches every destination.

- **Applying the same retention period to all data classes.** Logs, PII, business analytics, AI training data, and session recordings have fundamentally different legal requirements, business value, and storage costs. A uniform retention policy is either illegally short for some classes (financial records) or wastefully long for others (debug logs). Each data class must have its own retention period justified against a specific regulation or business need.

- **Treating retention as a one-time cleanup project.** The team spends a sprint building a deletion pipeline, runs it once, and moves on. New data accumulates, new data stores are added, new third parties are integrated, and within three months the retention gap is back. Retention is infrastructure, not a project. It requires ongoing monitoring, new-store onboarding, and quarterly verification.

- **Storing data "just in case" without a documented lawful basis.** Every piece of retained data must have a specific, documented reason: legal obligation (tax records), contractual necessity (order history), legitimate interest (product improvement with opt-out), or consent (marketing preferences). Data retained because "it does not cost much to store" has no lawful basis and will be the first thing requested in a regulatory audit.

## Related

- Similar journeys: [./handle-data-compliance.md](./handle-data-compliance.md) — data compliance
- Similar journeys: [../../engineer/infrastructure/migrate-data.md](../../engineer/infrastructure/migrate-data.md) — data migration
- Similar journeys: [../../oncall-sre/incident-response/do-a-security-audit.md](../../oncall-sre/incident-response/do-a-security-audit.md) — security audit
- Similar journeys: [../../oncall-sre/incident-response/handle-a-data-breach.md](../../oncall-sre/incident-response/handle-a-data-breach.md) — data breach
- Upstream: [../../README.md](../../README.md) — processes leaf entry
