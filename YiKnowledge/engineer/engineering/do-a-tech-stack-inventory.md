---
title: Do a tech stack inventory
aliases:
- I want to do a tech stack inventory
- tech-stack-inventory-journey
- dependency-matrix-journey
- tech stack inventory entry
tags:
- journeys
- tech-stack-inventory
- dependency-matrix
- tech-debt
- governance
category: engineer/engineering
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
- ../../tech-lead/roadmap/manage-tech-debt.md
- ./do-a-knowledge-audit.md
- ../../tech-lead/roadmap/plan-tech-roadmap.md
- ../../oncall-sre/observability/tech-debt-inventory.md
review_cycle: quarterly
last_verified: 2026-08-07
tacit: false
---

# I want to do a tech stack inventory

> **As an** engineer, **I want to** do a tech stack inventory, **so that** review is structured. 

> "Scan + tiering + owner + risk + dependency matrix + deprecation + quarterly audit + retrospective" reachable within 2 hops via process + thinking + case study. 

## Summary

- Process follows [quarterly-tech-debt-process.md](../quality-security/quarterly-tech-debt.md) + [dependency-upgrade-process.md](dependency-upgrade.md) + [knowledge-review-process.md](../process/knowledge-review.md)
- Thinking follows [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md)
- Inventory follows [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) + [tech-debt-inventory-template.md](../../oncall-sre/observability/tech-debt-inventory.md)
- Case studies follow [yipet-stack-migration-win.md](../lessons/win-yipet-stack-migration.md) + [yry-vite-to-rsbuild-migration-win.md](../lessons/win-yry-vite-to-rsbuild-migration.md) + [yiai-supply-chain-hardening-win.md](../lessons/win-yiai-supply-chain-hardening.md)

## Key info

- **Tech stack inventory dimensions (8 dimensions per component)**: (1) Name and version — exact version number, not a range; (2) Purpose — what problem does this component solve in the system? (3) Tier — Tier 1 (critical path, outage if removed), Tier 2 (important but replaceable), Tier 3 (nice-to-have, removable); (4) Owner — who is the primary maintainer? Must be a named person, not a team; (5) Risk — security (CVE count, last patch date), operational (bus factor, maintenance activity), license (copyleft risk, compatibility); (6) Dependencies — what does this component depend on? What depends on it? Build a dependency matrix; (7) Upgrade path — what is the latest version? What is the migration effort to get there? (8) Lifecycle state — active (regular releases), maintenance (bug fixes only), deprecated (no longer maintained), sunset (end-of-life announced). The Yi-family projects use this 8-dimension framework for quarterly inventory.
- **Tier classification and action rules**: Tier 1 — critical path components; must have: at least 2 engineers who know it, a documented upgrade path, a rollback plan, and a replacement candidate evaluated; quarterly review. Tier 2 — important but replaceable; must have: at least 1 engineer who knows it, a documented upgrade path, and a known replacement; biannual review. Tier 3 — nice-to-have; must have: a documented purpose and a removal plan if it becomes unmaintained; annual review. The inventory should reveal the tier distribution: a healthy stack has < 20% Tier 1 components, 50-60% Tier 2, and 20-30% Tier 3. More than 30% Tier 1 indicates excessive coupling or insufficient modularization.
- **Dependency matrix construction methodology**: Rows = components, Columns = components. Cell (i, j) = 1 if component i depends on component j, 0 otherwise. The matrix reveals: (1) Most-depended-on components (highest column sums) — these are the architectural keystones; (2) Most-dependent components (highest row sums) — these are the most fragile; (3) Circular dependencies — where A→B and B→A; (4) Orphan components — row sum = 0, column sum = 0, meaning nothing depends on it and it depends on nothing. The matrix should be rebuilt quarterly; the first build typically reveals 3-5 surprising dependencies that were not documented.
- **Deprecation and removal decision framework**: A component should be evaluated for deprecation when: (1) Last release > 12 months ago; (2) CVE count > 5 with no patches in 90 days; (3) Bus factor = 1 (single maintainer); (4) License changed to GPL/AGPL; (5) A replacement exists that is 2x better on a critical dimension. The deprecation decision follows the tech selection process: evaluate alternatives, run a PoC, write an ADR, and follow the dual-world migration pattern. The Yi-family deprecation history: ESLint→Biome, Vite→Rsbuild, Bootstrap→Ant Design.
- **Quarterly inventory process (5 phases)**: (1) Scan — run `pip list`/`npm ls`/`cargo tree` for each project, capture exact versions; (2) Enrich — for each component, fill in the 8 dimensions (owner, risk, tier, lifecycle state); (3) Analyze — build the dependency matrix, identify keystones, flag at-risk components, detect circular dependencies; (4) Decide — for each at-risk component, decide: keep (with justification), upgrade (with plan), replace (with ADR), or remove (with migration plan); (5) Act — execute the decisions, update the inventory, set reminders for next quarter. The Yi-family projects run this process aligned with the quarterly tech debt review.
- **Yi-family tech stack inventory (2026-08)**: YiAi — Python/FastAPI, llama_index, MongoDB (PyMongo), apscheduler, uv (package manager), no lockfile; 3 Tier 1 components (FastAPI, llama_index, MongoDB). YiVad — Vue 3/TypeScript, Rsbuild, Ant Design Vue, Pinia, Biome, Vitest (planned); 4 Tier 1 components (Vue, Rsbuild, Ant Design, Pinia). YiPet — React 18.3/TypeScript, Ant Design 5.21, Biome 2.5, Chrome Extension Manifest V3; 4 Tier 1 components (React, Ant Design, Biome, Chrome APIs). Cross-project: MongoDB Atlas (shared database, Tier 1 for all), YiAi API (shared backend, Tier 1 for YiVad/YiPet). Total component count: ~40 across 3 projects. The inventory is documented in each project's `architecture-summary.md` and `dev-standards-summary.md`.

## Scenario description

When doing a tech stack inventory / dependency matrix / framework checklist / version matrix / deprecation scan / license scan / CVE scan / quarterly tech debt inventory / pre-handover inventory / strategy retrospective, TLs + platform + architects + sponsors need to look up process + thinking + case studies. This entry aggregates tech stack inventory related processes + thinking + case studies into a 2-hop path, avoiding "duplicate wheel-reinvention / old framework pile-up / scattered versions / empty owners / missed risks / dragged deprecations / no quarterly audit". 

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `tech/infra/` | [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) · [tech-debt-inventory-template.md](../../oncall-sre/observability/tech-debt-inventory.md) · [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) |
| `work/processes/` | [quarterly-tech-debt-process.md](../quality-security/quarterly-tech-debt.md) · [dependency-upgrade-process.md](dependency-upgrade.md) · [security-audit.md](../quality-security/quarterly-security-audit.md) · [quarterly-security-audit-process.md](../quality-security/quarterly-security-audit.md) · [tech-roadmap-review-process.md](../process/tech-roadmap-review.md) · [knowledge-review-process.md](../process/knowledge-review.md) · [knowledge-deprecation-policy.md](../process/knowledge-deprecation-policy.md) · [shared-client-vendor-rollout-process.md](./shared-client-vendor-rollout.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) — intent of inventory · [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) — inversion to find gaps · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) — escalation chain · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md) · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) |
| `methodology/engineering-patterns/` | [supply-chain-hardening-pattern.md](../process/harden-supply-chain.md) · [one-to-one-mapping-migration-pattern.md](../architecture-design/one-to-one-mapping-migration.md) · [staged-port-methodology-pattern.md](../architecture-design/staged-port-methodology.md) · [ssot-view-layer-pattern.md](../architecture-design/ssot-view-layer.md) |
| `resources/templates/` | [tech-debt-inventory-template.md](../../oncall-sre/observability/tech-debt-inventory.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) |
| `resources/prompts/` | [code-review-prompt.md](../../ai-engineer/methodology/prompts--code-review.md) — AI-assisted stack scan · [agent-tool-use-prompt.md](../../ai-engineer/methodology/prompts--agent-tool-use.md) |
| `lessons/wins/` | [yipet-stack-migration-win.md](../lessons/win-yipet-stack-migration.md) · [yry-vite-to-rsbuild-migration-win.md](../lessons/win-yry-vite-to-rsbuild-migration.md) · [yiai-supply-chain-hardening-win.md](../lessons/win-yiai-supply-chain-hardening.md) · [yivad-aicr-phase-port.md](../lessons/win-yivad-aicr-phase-port.md) · [yivad-leaf-view-leaves-ssot-win.md](../lessons/win-yivad-leaf-view-leaves-ssot.md) |
| `lessons/gotchas/` | [no-lockfile-supply-chain-risk.md](../lessons/gotcha-no-lockfile-supply-chain-risk.md) · [vite-to-rsbuild-migration.md](../lessons/gotcha-vite-to-rsbuild-migration.md) · [react-jsxdev-mismatch.md](../lessons/gotcha-react-jsxdev-mismatch.md) · [macos-fsevents-silent-drop.md](../lessons/gotcha-macos-fsevents-silent-drop.md) · [sse-ondone-guard.md](../lessons/gotcha-sse-ondone-guard.md) |
| `lessons/failures/` | [incident-postmortem-summary.md](../lessons/failure-incident-postmortem.md) · [ai-product-launch-lessons-summary.md](../lessons/failure-ai-product-launch-lessons.md) · [bugs/](../lessons) — missed inventory archive |
| `people/team--` | [team-overview.md](../../knowledge-curator/people/team--team-overview.md) · [roster.md](../../knowledge-curator/people/team--roster.md) — owner matrix |
| `people/stakeholders--` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders--stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders--communication-cadence.md) — communication |
| `work/collaboration/` | [raci-matrix-summary.md](../process/raci-matrix.md) · [async-collaboration-principles-summary.md](../process/async-collaboration-principles.md) |
| `industry/competitors--` | [llm-vendor-landscape-summary.md](../../executive/industry/competitors--llm-vendor-landscape.md) · [competitor-analysis-template.md](../../executive/industry/competitors--competitor-analysis.md) — peer benchmarking |
| `tech/ai-platform/` | [llm-comparison-summary.md](../../ai-engineer/platform/llm-comparison.md) · [inference-engine-comparison-summary.md](../../ai-engineer/platform/inference-engine-comparison.md) · [embedding-model-selection-summary.md](../../ai-engineer/platform/embedding-model-selection.md) · [vector-db-comparison-summary.md](../../ai-engineer/platform/vector-db-comparison.md) |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `work/meetings/` | [review-meeting-template.md](../../product-manager/delivery/review-meeting.md) · [weekly-meeting-template.md](../../product-manager/delivery/weekly-meeting.md) |
| `projects/` | Each project's `architecture-summary.md` §tech stack + `dev-standards-summary.md` §dependency + `adr-*` |
| `journeys/` | [../../tech-lead/roadmap/manage-tech-debt.md](../../tech-lead/roadmap/manage-tech-debt.md) · [./do-a-knowledge-audit.md](../process/do-a-knowledge-audit.md) · [../../tech-lead/roadmap/plan-tech-roadmap.md](../../tech-lead/roadmap/plan-tech-roadmap.md) · [../strategies/harden-supply-chain.md](../process/harden-supply-chain.md) |

## Action recommendations

1. **First principles**: first ask "what must the inventory answer (duplicates / scattered versions / risk / deprecation / owner) / what happens if not inventoried / ROI"; do not inventory for inventory's sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md). 
2. **Inversion**: first think "what happens if not inventoried (duplicate wheel-reinvention / old framework pile-up / missed CVEs / drift / escalated incidents)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md). 
3. **Second-order effects**: escalating one framework → impacts QA / docs / monitoring / business; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md). 
4. **Occam**: the simplest table that meets the inventory need wins; do not pile up tools; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md). 
5. **Scan**: must first scan all repos + package.json / pyproject.toml / pom.xml / go.mod / Cargo.toml; see [architecture-summary.md](../../engineer/projects). 
6. **Dependency matrix**: must draw a dependency matrix (service × framework × version × owner × state); see [tech-debt-inventory-template.md](../../oncall-sre/observability/tech-debt-inventory.md). 
7. **Tiering**: must run strategic / core / supportive / deprecated four tiers; by business-criticality + risk + ROI. 
8. **Owner**: every piece of stack must tag owner + escalation owner + deprecation owner; see [raci-matrix-summary.md](../process/raci-matrix.md). 
9. **Risk**: must scan CVE + license + EOL + drift + single point; see [security-audit.md](../quality-security/quarterly-security-audit.md) + [i-want-to-handle-a-dependency-cve.md](../quality-security/handle-a-dependency-cve.md). 
10. **Duplicate wheel-reinvention**: must scan duplicate implementations / multiple frameworks doing the same job / in-house vs open source; see [i-want-to-do-a-code-archaeology.md](./do-a-code-archaeology.md). 
11. **AI assistance**: use [code-review-prompt.md](../../ai-engineer/methodology/prompts--code-review.md) + [agent-tool-use-prompt.md](../../ai-engineer/methodology/prompts--agent-tool-use.md) to let AI scan stack + find gaps. 
12. **Version matrix**: must list current / target / blocking / planned escalation / planned deprecation columns; see [dependency-upgrade-process.md](dependency-upgrade.md). 
13. **Deprecation**: must run [knowledge-deprecation-policy.md](../process/knowledge-deprecation-policy.md) + [i-want-to-decommission-a-service.md](../../tech-lead/roadmap/decommission-a-service.md); mark deprecated + replacement + timeline. 
14. **Escalation**: must run [i-want-to-handle-a-major-version-upgrade.md](../../oncall-sre/incident-response/handle-a-major-version-upgrade.md) + [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md) + canary. 
15. **Shared client**: cross-project shared stack must run [i-want-to-share-client-across-projects.md](share-client-across-projects.md) + [shared-client-vendor-rollout-process.md](./shared-client-vendor-rollout.md). 
16. **Roadmap**: inventory conclusions must feed [i-want-to-plan-tech-roadmap.md](../../tech-lead/roadmap/plan-tech-roadmap.md) + [tech-roadmap-review-process.md](../process/tech-roadmap-review.md). 
17. **Communication**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders--communication-cadence.md) to communicate sponsors + quarterly retrospective. 
18. **Freeze period**: during promotions use [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) and do not touch inventory conclusions. 
19. **Retrospective**: after inventory follow [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) to retrospective + improve items + archive in [review-log.md](../../knowledge-curator/governance/review-log.md). 
20. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether inventory is still accurate + owner still correct. 
21. **ADR**: key stack decisions must land an ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md). 
22. **Flywheel**: inventory → fewer duplicates → smoother escalation → trust rises → more investment; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md). 

## Core viewpoints

**An inventory without owners is a snapshot that decays immediately.** Every piece of the tech stack must have a named owner, an escalation owner, and a deprecation owner. Without ownership, the inventory becomes stale within a quarter as teams shift and priorities change. The owner matrix is the single most important field in the inventory; a dependency without an owner is a dependency that will become a surprise incident.

**Tiering by business criticality matters more than tiering by technology.** The four-tier model (strategic, core, supportive, deprecated) must be driven by business impact, not by engineer enthusiasm. A framework that is technically elegant but serves a supportive function should not receive strategic investment. The tiering conversation is a business conversation disguised as a technical one.

**Duplicate implementations are the most expensive form of tech debt.** Two frameworks doing the same job in different services multiply the maintenance burden, the onboarding cost, and the incident surface area. The inventory must explicitly flag duplicate implementations and converge them to a single standard. The cost of convergence is almost always lower than the cost of indefinite duplication.

**The dependency matrix is the inventory's single source of truth, not the summary paragraph.** A matrix with columns for service, framework, version, owner, risk, and state can be queried, sorted, and automated. A prose summary cannot. The matrix format enables quarterly diffing, automated CVE scanning, and dependency upgrade planning. The prose summary is a derived artifact, not the primary artifact.

**An inventory done once without a quarterly audit cadence is a wasted effort.** The value of a tech stack inventory is not in the first pass but in the delta between quarters. The quarterly audit (scanning for staleness, ownership changes, new risks, and deprecation progress) is what converts the inventory from a one-time project into an ongoing governance capability. Without the audit cadence, the inventory is a book that is never read.

## Anti-patterns

- **Inventorying for the sake of inventorying.** Running a full-stack inventory without first defining the questions it must answer (duplicates, scattered versions, risks, deprecation candidates, ownership gaps) produces a spreadsheet that no one uses. The inventory must be backward-designed from the decisions it will inform. If the inventory cannot answer "what should we deprecate this quarter," it has failed.

- **Treating the inventory as a one-time project.** Completing the inventory and moving on without setting up the quarterly audit cadence means the inventory is stale within 90 days. The real value is in the delta between quarters. Teams that treat the inventory as a checkbox item rather than a living governance artifact will find themselves reinventing the wheel every 18 months.

- **Skipping the CVE and license scan.** A tech stack inventory that misses the security and compliance dimensions is dangerously incomplete. An EOL framework with a known CVE that is still listed as "active" in the inventory creates a false sense of security. The CVE scan must be part of the initial inventory, not a separate project.

- **Using prose instead of a structured matrix.** A narrative summary of the tech stack is not queryable, not diffable, and not automatable. The inventory must be a structured matrix (service x framework x version x owner x state) that can be filtered, sorted, and version-controlled. Prose summaries are acceptable as executive summaries but not as the primary artifact.

- **Omitting the deprecation plan for each deprecated item.** Flagging a framework as "deprecated" without specifying the replacement, migration timeline, and deprecation owner is worse than not flagging it at all. It creates the illusion of action while the deprecated framework continues to accumulate risk. Every deprecated item must have a concrete deprecation plan with a target date.

## Related

- Related journey: [../../tech-lead/roadmap/manage-tech-debt.md](../../tech-lead/roadmap/manage-tech-debt.md) — tech debt
- Related journey: [./do-a-knowledge-audit.md](../process/do-a-knowledge-audit.md) — knowledge audit
- Related journey: [../../tech-lead/roadmap/plan-tech-roadmap.md](../../tech-lead/roadmap/plan-tech-roadmap.md) — tech roadmap
- Related journey: [../strategies/harden-supply-chain.md](../process/harden-supply-chain.md) — supply chain
- Upstream: [../../oncall-sre/observability/README.md](../../oncall-sre/observability/README.md) — infra leaf entry
