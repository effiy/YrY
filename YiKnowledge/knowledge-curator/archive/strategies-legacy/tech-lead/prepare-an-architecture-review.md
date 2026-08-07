---

title: I want to prepare an architecture review
aliases:
- I want toprepareArchitectureReview
- architecture-review-journey
- arch-review-journey
- ArchitectureReviewentry
tags:
- journeys
- architecture
- review
- adr
- design-review
- tech-review
category: tech-lead/roadmap
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- tech-lead
- engineer
benefit: launch is safe
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- filename is descriptive verb-phrase, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
related:
- ../architecture/design-architecture-decision.md
- ./do-a-tech-selection.md
- ../../knowledge-curator/templates/write-documentation.md
- ../../engineer/processes/README.md
review_cycle: quarterly
tacit: false
---

# I want to prepare an architecture review

> **As a** tech lead, **I want to** prepare an architecture review, **so that** launch is safe. 

> "Architecture diagram + ADR + Decision tree + risk + tradeoffs + Review Process + Retrospective"reach within 2 hopsTemplate + Thinking + Process + Case study. 

## Summary

- Template walk [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) + [adr-template.md](../../knowledge-curator/templates/adr.md) + [tech-selection-evaluation-template.md](../../knowledge-curator/templates/tech-selection-evaluation.md)
- Process walk [design-review-process.md](../../product-manager/processes/design-review.md) + [tech-review-process.md](../../product-manager/processes/tech-review.md) + [requirement-review-process.md](../../product-manager/processes/requirement-review.md)
- Thinking walk [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [strong-opinions-loosely-held-summary.md](../../knowledge-curator/templates/thinking/strong-opinions-loosely-held.md)
- Pattern walk [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md) + [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [supply-chain-hardening-pattern.md](../../engineer/quality-security/harden-supply-chain.md)

## Scenario description

When preparing an architecture review / writing tech design / running ADR Decision / evaluating tech selection / scanning architecture risk / cross-team architecture alignment, architect + TL + Platform + business owner need to look up Template + Thinking + Pattern + Process + Case study. This entry aggregates Architecture Review related Template + Thinking + Pattern + Process into a 2-hop path, avoiding "Review becomes formality / ADR missing / Decision without cross-reference / tradeoffs not written / risk not traceable / Review without Retrospective". 

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [tech-selection-evaluation-template.md](../../knowledge-curator/templates/tech-selection-evaluation.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) |
| `work/processes/` | [design-review-process.md](../../product-manager/processes/design-review.md) · [tech-review-process.md](../../product-manager/processes/tech-review.md) · [requirement-review-process.md](../../product-manager/processes/requirement-review.md) · [tech-roadmap-review-summary.md](../../engineer/processes/tech-roadmap-review.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [shared-client-vendor-rollout-process.md](../../engineer/processes/shared-client-vendor-rollout.md) · [capacity-planning-process.md](../../engineer/infrastructure/capacity-planning.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) · [strong-opinions-loosely-held-summary.md](../../knowledge-curator/templates/thinking/strong-opinions-loosely-held.md) · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/engineering-patterns/` | [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md) · [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [supply-chain-hardening-pattern.md](../../engineer/quality-security/harden-supply-chain.md) · [one-to-one-mapping-migration-pattern.md](../../engineer/architecture-design/one-to-one-mapping-migration.md) · [staged-port-methodology-pattern.md](../../engineer/architecture-design/staged-port-methodology.md) · [evaluation-driven-development-pattern.md](../../engineer/engineering/evaluation-driven-development.md) · [inline-citation-rag-pattern.md](../../engineer/patterns/inline-citation-rag.md) · [rpc-envelope-pattern.md](../../engineer/architecture-design/rpc-envelope.md) · [sse-streaming-pattern.md](../../engineer/architecture-design/sse-streaming.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `work/meetings/` | [review-meeting-template.md](../../product-manager/meetings/review-meeting.md) · [weekly-meeting-template.md](../../product-manager/meetings/weekly-meeting.md) · [retrospective-sample.md](../../product-manager/delivery/retrospective.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [capacity-and-cost-template.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) · [tech-debt-inventory-template.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `tech/ai-platform/` | [llm-comparison-summary.md](../../ai-engineer/platform/llm-comparison.md) · [inference-engine-comparison-summary.md](../../ai-engineer/platform/inference-engine-comparison.md) · [vector-db-comparison-summary.md](../../ai-engineer/platform/vector-db-comparison.md) · [embedding-model-selection-summary.md](../../ai-engineer/platform/embedding-model-selection.md) · [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [lakehouse-architecture-summary.md](../../ai-engineer/data/lakehouse-architecture.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) |
| `methodology/ai-specific/` | [rag-design-patterns-summary.md](../../ai-engineer/methodology/rag-design-patterns.md) · [agent-architecture-patterns-summary.md](../../ai-engineer/methodology/agent-architecture-patterns.md) · [prompt-injection-defense-summary.md](../../ai-engineer/methodology/prompt-injection-defense.md) |
| `lessons/wins/` | [yiai-supply-chain-hardening-win.md](../../engineer/lessons/wins/yiai-supply-chain-hardening.md) · [yipet-stack-migration-win.md](../../engineer/lessons/wins/yipet-stack-migration.md) · [yry-vite-to-rsbuild-migration-win.md](../../engineer/lessons/wins/yry-vite-to-rsbuild-migration.md) · [yivad-leaf-view-leaves-ssot-win.md](../../engineer/lessons/wins/yivad-leaf-view-leaves-ssot.md) |
| `lessons/gotchas/` | [no-lockfile-supply-chain-risk.md](./../../engineer/lessons/gotchas/no-lockfile-supply-chain-risk.md) · [vite-to-rsbuild-migration.md](./../../engineer/lessons/gotchas/vite-to-rsbuild-migration.md) · [react-jsxdev-mismatch.md](./../../engineer/lessons/gotchas/react-jsxdev-mismatch.md) · [sse-ondone-guard.md](./../../engineer/lessons/gotchas/sse-ondone-guard.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — Review stakeholders |
| `people/experts/` | [external-experts-roster.md](../../knowledge-curator/people/experts/external-experts-roster.md) — external expert Review |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) — ADR quarterly audit |
| `industry/competitors/` | [llm-vendor-landscape-summary.md](../../executive/industry/competitors/llm-vendor-landscape.md) · [competitor-analysis-template.md](../../executive/industry/competitors/competitor-analysis.md) — industry cross-reference |
| `projects/` | each project `adr-*.md` · `architecture-summary.md` · `dev-standards-summary.md` |
| `resources/prompts/` | [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [weekly-report-prompt.md](../../ai-engineer/methodology/prompts/weekly-report.md) — AI-assisted review |

## Action recommendations

1. **First principles**: first ask "Review what decision to solve / who reviews / when to review / what to do after review"; do not Review for Review's sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md). 
2. **Strong opinions loosely held**: Reviewer must express convincing viewpoints; avoid "everything is fine" style Review; see [strong-opinions-loosely-held-summary.md](../../knowledge-curator/templates/thinking/strong-opinions-loosely-held.md). 
3. **Inversion**: first imagine "how the solution could blow up (cost / consistency / team cognition / dependency lock / compliance) " then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md). 
4. **Second-order effects**: how will the solution change Architecture / team / cost / Governance? see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md). 
5. **Occam**: the simplest solution that meets requirements wins; do not over-design for the "future"; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md). 
6. **Architecture diagram**: must include C4 three layers (context / container / component) + data flow + trust boundary + deploy topology; not just one paragraph of text. 
7. **ADR**: every decision must land an ADR; must include background / Decision / tradeoffs / alternatives / consequences; see [adr-template.md](../../knowledge-curator/templates/adr.md). 
8. **Decision cross-reference**: must run [tech-selection-evaluation-template.md](../../knowledge-curator/templates/tech-selection-evaluation.md); at least 2 alternatives + evaluation. 
9. **Risk register**: every risk must carry owner + Mitigation + traceability; not just listed without tracking. 
10. **Tradeoffs**: must write "trading what for what" (CAP / consistency vs availability / cost vs latency / flexibility vs simplicity) . 
11. **Dependency**: must run [i-want-to-adopt-a-new-dependency.md](../../engineer/patterns/adopt-a-new-dependency.md) + [i-want-to-harden-supply-chain.md](../../engineer/process/harden-supply-chain.md). 
12. **Data**: involves data walk [data-governance-summary.md](../../ai-engineer/data/data-governance.md) + [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md). 
13. **AI**: involves LLM walk [i-want-to-pick-an-llm-provider.md](../../ai-engineer/platform/pick-an-llm-provider.md) + [rag-design-patterns-summary.md](../../ai-engineer/methodology/rag-design-patterns.md). 
14. **Cost**: must run [capacity-and-cost-template.md](../../oncall-sre/observability/capacity-and-cost.md); three-year total cost. 
15. **RACI**: cross-team Review must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md). 
16. **Retrospective**: after Review decision lands must run [review-meeting-template.md](../../product-manager/meetings/review-meeting.md) Retrospective + quarterly scan ADR validity; see [review-log.md](../../knowledge-curator/governance/review-log.md). 

## Related

- Related journey: [../architecture/design-architecture-decision.md](../architecture/design-architecture-decision.md) — ADR Decision
- Related journey: [./do-a-tech-selection.md](./do-a-tech-selection.md) — tech selection
- Related journey: [../../knowledge-curator/templates/write-documentation.md](../../knowledge-curator/templates/write-documentation.md) — docs
- Related journey: [./plan-tech-roadmap.md](./plan-tech-roadmap.md) — roadmap diagram
- Upstream: [../../knowledge-curator/templates/README.md](../../knowledge-curator/templates/README.md) — templates leaf entry
