---
title: Do a data quality audit
aliases:
- I want to do a data quality audit
- data-quality-audit-journey
- data-quality-journey
- data quality audit entry
tags:
- journeys
- data-quality
- audit
- governance
- completeness
- accuracy
category: engineer/infrastructure
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- engineer
benefit: review is structured
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../tools/set-up-a-data-pipeline.md
- ../strategies/migrate-data.md
- ../../executive/strategy/handle-data-compliance.md
- ../../ai-engineer/data/data-governance.md
review_cycle: quarterly
last_verified: 2026-08-07
tacit: false
---

# I want to do a data quality audit

> **As an** engineer, **I want to** do a data quality audit, **so that** review is structured.

> "Dimensions + rules + batch runs + reports + root cause + remediation + monitoring + quarterly audit" reachable within 2 hops — process + thinking + case studies.

## Summary

- Process: [data-governance-process.md](../../ai-engineer/data/data-governance.md) + [data-compliance-process.md](data-compliance.md) + [monitoring-governance-process.md](../process/monitoring-governance.md)
- Thinking: [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md)
- Data: [data-governance-summary.md](../../ai-engineer/data/data-governance.md) + [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) + [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) + [lakehouse-architecture-summary.md](../../ai-engineer/data/lakehouse-architecture.md)
- Case studies: [yiai-rag-hybrid-retrieval-win.md](../lessons/win-yiai-rag-hybrid-retrieval.md) + [incident-postmortem-summary.md](../lessons/failure-incident-postmortem.md)

## Core viewpoints

**Data quality is a product attribute, not a data engineering concern.** When a user sees incorrect data in the application, they do not care whether the error is in the ETL pipeline, the database schema, or the application code. They care that the product is wrong. Data quality must be owned by the product team with the same rigor as feature quality, and data quality regressions must be treated with the same severity as application regressions.

**The six dimensions of data quality are a checklist, not a menu.** Completeness, accuracy, consistency, timeliness, uniqueness, and validity must all be measured. A dataset that is 100% complete but 50% accurate is worse than a dataset that is 80% complete and 100% accurate. The dimensions are not additive; a failure in any dimension is a quality failure.

**Data quality monitoring must be continuous, not point-in-time.** A quarterly audit that finds 12% of data is missing is a quarterly audit that is 90 days late. The quality checks must run as part of the data pipeline on every execution, and the quality metrics must be trended over time. A quality degradation that starts on Tuesday should be detected on Tuesday, not next quarter.

**The root cause of data quality issues is almost always a process gap, not a technical failure.** A null value in a required field is not caused by a database bug; it is caused by a process that allowed the null value to be written. The 5 Whys applied to a data quality issue should lead to the process gap (missing validation, missing schema enforcement, missing upstream contract) that must be closed, not just the data fix that must be applied.

**Data quality is the foundation of trust in the entire data stack.** A data pipeline that is fast, scalable, and cost-efficient but produces incorrect data is a pipeline that nobody trusts. The downstream consumers (reports, dashboards, ML models, business decisions) are only as reliable as the data they consume. Trust lost through data quality failures is hard to regain, and every quality failure erodes the willingness of the business to invest in data infrastructure.

## Key info

- **Six dimensions of data quality with measurement methods**: (1) Completeness — percentage of records with all required fields populated; measured as: (records with all required fields / total records) × 100; target > 99%; (2) Accuracy — percentage of values that match the real-world entity they represent; measured by sampling and manual verification; target > 98%; (3) Consistency — percentage of values that match across systems (e.g., same customer name in CRM and billing); measured by cross-system reconciliation; target > 99%; (4) Timeliness — latency between data creation and availability for use; measured as P95 latency in minutes; target: < 5 minutes for operational data, < 24 hours for analytical data; (5) Uniqueness — percentage of records that are not duplicated; measured as: (1 - duplicate records / total records) × 100; target > 99.5%; (6) Validity — percentage of values that conform to the defined schema (type, format, range, enum); measured by schema validation; target > 99.9%. The Yi-family data quality audit uses these 6 dimensions.
- **Data quality rule types (5 rule categories with examples)**: (1) Schema rules — column type matches definition (e.g., `created_at` is datetime, not string), required fields are not null; (2) Domain rules — value within valid range (e.g., `age` between 0-150, `price` > 0), enum values match allowed list; (3) Relationship rules — foreign key referential integrity, parent-child record consistency, cross-table counts match; (4) Business rules — context-specific logic (e.g., `shipped_date` >= `order_date`, `total` = `quantity` × `unit_price`); (5) Temporal rules — data freshness (last update within SLA), data retention (no records older than retention policy). Each rule is implemented as a SQL query or Python check that runs in the data pipeline. The Yi-family data quality checks are primarily schema rules (MongoDB schema validation) and temporal rules (knowledge base file freshness).
- **Data quality audit cadence and triggers**: Scheduled — full audit quarterly, covering all 6 dimensions for all critical datasets; Pipeline — quality checks run on every data pipeline execution, blocking on critical rule failures; Event-driven — audit triggered by: schema change, data migration, new data source onboarding, regulatory submission deadline; Continuous — monitoring of quality metrics with trend alerts (e.g., completeness dropping 0.1% per week triggers investigation). The Yi-family projects: quarterly audit is planned but not yet executed; pipeline quality checks are limited to MongoDB schema validation; continuous monitoring is not implemented.
- **Data quality issue remediation process (5 steps)**: (1) Triage — classify by severity: P0 (affects > 10% of records or blocks critical business process), P1 (affects 1-10%), P2 (affects < 1%); (2) Root cause — 5 Whys to find the process gap; common root causes: missing validation, upstream schema change, ETL bug, manual data entry error; (3) Fix the data — correct the affected records in the target system; always fix the root cause before or simultaneously with the data fix; (4) Fix the process — add validation, schema enforcement, or monitoring to prevent recurrence; (5) Verify — re-run the quality check to confirm the fix, add the specific failure case to regression tests. The Yi-family standard: P0 issues must be fixed within 24 hours; P1 within 1 week; P2 within the current sprint.
- **Data quality SLA framework**: Each dataset has a published SLA: completeness ≥ 99.5%, accuracy ≥ 99%, timeliness ≤ 5 minutes (operational) or ≤ 24 hours (analytical), uniqueness ≥ 99.9%, validity ≥ 99.9%. The SLA is measured monthly; a breach triggers a root cause analysis and a remediation plan. The SLA is owned by the data producer (the team that writes the data), not the data consumer. The Yi-family data quality SLAs are not yet defined; the framework is in place for when production data pipelines are deployed.
- **Yi-family data quality state (2026-08)**: YiAi — MongoDB with schema validation (required fields, type checking), knowledge base file scanner validates frontmatter completeness; YiVad — client-side only, no data quality concerns; YiPet — Chrome extension, client-side only. The primary data quality concern is the YiKnowledge markdown corpus: 3142 files with frontmatter, 182 files had broken YAML (fixed in Phase 1 audit), RSS import files (84) have inconsistent formatting. The data quality audit process and 6-dimension framework are in place for when production data pipelines are deployed.

## Scenario

When conducting data quality audits / completeness / accuracy / consistency / timeliness / uniqueness / validity / data governance / data asset inventory / data SLA / data quality rules / cross-source reconciliation / ETL drift / pre-promotion data checks / regulatory data submission checks, platform + data engineering + business owner + legal need to look up process + thinking + case studies. This entry aggregates data quality audit related process + thinking + case studies into a 2-hop path, avoiding "dimensions scattered / rules missed / batches late / root cause shallow / remediation delayed / monitoring absent / no quarterly audit".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) · [lakehouse-architecture-summary.md](../../ai-engineer/data/lakehouse-architecture.md) · [mongodb-indexing-summary.md](../../ai-engineer/data/mongodb-indexing.md) |
| `work/processes/` | [data-compliance-process.md](data-compliance.md) · [data-migration-process.md](data-migration.md) · [monitoring-governance-process.md](../process/monitoring-governance.md) · [incident-response-process.md](../process/incident-response.md) · [quarterly-security-audit-process.md](../quality-security/quarterly-security-audit.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) — quality essence · [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) — invert thinking about dirty data · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) — cascading · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md) · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) |
| `methodology/engineering-patterns/` | [eval-driven](../engineering/evaluation-driven-development.md) · [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md) · [contract-test-baseline-pattern.md](../quality-security/contract-test-baseline.md) · [ssot-view-layer-pattern.md](../architecture-design/ssot-view-layer.md) · [supply-chain-hardening-pattern.md](../process/harden-supply-chain.md) |
| `methodology/ai-specific/` | [rag-design-patterns-summary.md](../../ai-engineer/methodology/rag-design-patterns.md) — RAG data quality · [hallucination-mitigation-summary.md](../../ai-engineer/methodology/hallucination-mitigation.md) · [llm-evaluation-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md) |
| `tech/ai-platform/` | [vector-db-comparison-summary.md](../../ai-engineer/platform/vector-db-comparison.md) · [embedding-model-selection-summary.md](../../ai-engineer/platform/embedding-model-selection.md) · [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [incident-postmortem-template.md](../lessons/failure-incident-postmortem.md) |
| `resources/prompts/` | [code-review-prompt.md](../../ai-engineer/methodology/prompts--code-review.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts--sql-generation.md) · [agent-tool-use-prompt.md](../../ai-engineer/methodology/prompts--agent-tool-use.md) |
| `lessons/wins/` | [yiai-rag-hybrid-retrieval-win.md](../lessons/win-yiai-rag-hybrid-retrieval.md) · [yiai-supply-chain-hardening-win.md](../lessons/win-yiai-supply-chain-hardening.md) · [yry-vite-to-rsbuild-migration-win.md](../lessons/win-yry-vite-to-rsbuild-migration.md) |
| `lessons/gotchas/` | [macos-fsevents-silent-drop.md](../lessons/gotcha-macos-fsevents-silent-drop.md) · [sse-ondone-guard.md](../lessons/gotcha-sse-ondone-guard.md) · [no-lockfile-supply-chain-risk.md](../lessons/gotcha-no-lockfile-supply-chain-risk.md) |
| `lessons/failures/` | [incident-postmortem-summary.md](../lessons/failure-incident-postmortem.md) · [ai-product-launch-lessons-summary.md](../lessons/failure-ai-product-launch-lessons.md) · [bugs/](../lessons) — dirty data archive |
| `people/stakeholders--` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders--stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders--communication-cadence.md) — quality communication |
| `people/experts--` | [external-experts-roster.md](../../knowledge-curator/people/experts--external-experts-roster.md) — legal / compliance |
| `work/collaboration/` | [raci-matrix-summary.md](../process/raci-matrix.md) · [async-collaboration-principles-summary.md](../process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../process/cross-timezone-collaboration.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics--north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics--ai-product-metrics.md) — business depends on |
| `brd/` | [brd-domains](../../brd/) · [brd-reference](../../brd/) — business background |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `projects/` | Each project's `architecture-summary.md` §data + `dev-standards-summary.md` §data conventions |
| `journeys/` | [../tools/set-up-a-data-pipeline.md](set-up-a-data-pipeline.md) · [../strategies/migrate-data.md](migrate-data.md) · [../../executive/strategy/handle-data-compliance.md](../../executive/strategy/handle-data-compliance.md) · [../../executive/strategy/do-a-data-retention-review.md](../../executive/strategy/do-a-data-retention-review.md) |

## Action recommendations

1. **First principles**: ask first "what business does the data serve / what happens if not audited / ROI / user impact"; do not audit for the sake of auditing; see [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md).
2. **Inversion**: imagine first "what dirty data would cause (business misjudgment / regulatory violation / user churn / model incident / report error)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md).
3. **Second-order effects**: one dirty field → cascades to downstream / reports / models / decisions; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md).
4. **Occam**: the simplest rules that satisfy business win; do not pile up metrics; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md).
5. **Dimensions**: must run 6 dimensions (completeness / accuracy / consistency / timeliness / uniqueness / validity); each with independent rules.
6. **Asset inventory**: must scan data assets / tables / fields / ETLs / reports / models / owners / SLAs; follow [data-governance-summary.md](../../ai-engineer/data/data-governance.md).
7. **Rules**: must run a rules engine / expected values + layer (row-level / column-level / table-level / cross-table / cross-source).
8. **Batch runs**: must embed in ETL + run daily / weekly / monthly + trend reports; follow [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md).
9. **Cross-source reconciliation**: must run cross-source reconciliation (business DB / warehouse / reports / third party); follow [lakehouse-architecture-summary.md](../../ai-engineer/data/lakehouse-architecture.md).
10. **AI data**: RAG data must follow [rag-design-patterns-summary.md](../../ai-engineer/methodology/rag-design-patterns.md) + citation consistency + retrieval quality.
11. **Model data**: training / evaluation data must follow [llm-evaluation-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md) + desensitization + versioning.
12. **Root cause**: must run 5 whys; common root causes: ETL drift / schema change / upstream dirty / retry / timezone / null values.
13. **Remediation**: must follow [data-migration-process.md](data-migration.md) + dual-write / backfill / rerun; do not directly modify production.
14. **Dual-world**: migration / remediation must follow [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md) + dual-run + diff.
15. **Monitoring**: must follow [monitoring-governance-process.md](../process/monitoring-governance.md) + dashboards + thresholds + alerts.
16. **PII**: must follow [data-compliance-process.md](data-compliance.md) + desensitization + access audit + least privilege.
17. **Freeze period**: during promotions follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md); do not change data rules.
18. **Communication**: must follow [communication-cadence.md](../../knowledge-curator/people/stakeholders--communication-cadence.md) to communicate with sponsors + business + legal.
19. **Retrospective**: after dirty data incidents follow [incident-postmortem-template.md](../lessons/failure-incident-postmortem.md) for retrospective + supplement rules + archive to [bugs/](../lessons).
20. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether rules are still accurate + whether SLAs are still met.
21. **ADR**: data governance decisions must be recorded as ADRs; see [adr-template.md](../../knowledge-curator/templates/adr.md).
22. **Flywheel**: good quality → trust grows → more data investment → larger business; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md).

## Anti-patterns

- **Auditing only the data warehouse and ignoring the source systems.** The data warehouse is clean, the ETL pipeline is verified, but the source system is producing garbage. The audit found that the warehouse is correct, but the business is still making decisions based on incorrect data. The audit must trace data quality back to the source system of record, not stop at the first transformation layer.

- **Measuring only completeness and calling it a quality audit.** The dataset is 100% complete (no nulls, all rows present) but the values are wrong (accuracy), the timestamps are from different timezones (consistency), and the same entity appears in multiple rows (uniqueness). Completeness is the easiest dimension to measure, and it is the most misleading single dimension.

- **Fixing the data without fixing the pipeline.** The audit finds 10,000 rows with incorrect values, and the team runs a data fix script to correct them. The next pipeline run produces the same 10,000 incorrect rows because the root cause (the pipeline transformation logic) was not fixed. The data fix is a band-aid; the pipeline fix is the cure.

- **Running the audit as a one-time project and never repeating it.** The audit is completed, the report is presented, and the team moves on. Six months later, the same quality issues have returned because the upstream systems, the pipeline logic, and the business requirements have all changed. The audit must be a recurring process, not a one-time project.

- **Treating data quality thresholds as suggestions rather than gates.** The audit finds that 5% of data fails the completeness check, and the threshold is 2%. The team decides that 5% is "close enough" and ships the data. The threshold exists to protect the downstream consumers; if the threshold is not enforced, the downstream consumers are not protected. The threshold must be a hard gate, not a suggestion.

## Related

- Same-category journey: [../tools/set-up-a-data-pipeline.md](set-up-a-data-pipeline.md) — data pipeline
- Same-category journey: [../strategies/migrate-data.md](migrate-data.md) — data migration
- Same-category journey: [../../executive/strategy/handle-data-compliance.md](../../executive/strategy/handle-data-compliance.md) — data compliance
- Same-category journey: [../../executive/strategy/do-a-data-retention-review.md](../../executive/strategy/do-a-data-retention-review.md) — data retention
- Upstream: [../../ai-engineer/data/README.md](../../ai-engineer/data/README.md) — data leaf entry
