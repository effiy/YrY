---

title: I want to prepare a developer relations strategy
aliases:
- i-want-to-prepare-a-developer-relations-strategy
- devrel-journey
- developer-advocacy-journey
- developer-experience-dx-journey
- DevRel entry
tags:
- journeys
- devrel
- developer-relations
- developer-advocacy
- dx
- developer-experience
- community
category: engineer/strategies
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- engineer
benefit: launch is safe
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, underscores and digits forbidden
- body contains user-story header + 7 fixed-order sections
related:
- ./prepare-a-developer-portal-strategy.md
- ./prepare-a-developer-marketing-strategy.md
- ../../product-manager/frameworks/jobs-to-be-done.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a developer relations strategy

> **As an** engineer, **I want to** prepare a developer relations strategy, **so that** launch is safe.

> "Developer journey + documentation + SDK + examples + community + feedback + advocacy + quarterly audit" reachable within 2 hops across process + thinking + case studies.

## Summary

- Process: [code-review.md](../../engineer/processes/do-a-code-review.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md)
- Thinking: [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform: [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + [observability-pattern.md](../../engineer/patterns/observability.md)
- Case studies: [yry-vite-to-rsbuild-migration-win.md](../../engineer/lessons/wins/yry-vite-to-rsbuild-migration.md) + [yiai-supply-chain-hardening-win.md](../../engineer/lessons/wins/yiai-supply-chain-hardening.md)

## Scenario

When preparing a DevRel strategy / developer relations / developer advocacy / developer experience / DX / SDK / documentation / examples / community / feedback / DevRel notifications / DevRel promo freeze / quarterly DevRel audit / DevRel retrospective, TL + DevRel + platform + sponsor need to look up process + thinking + case studies. This entry aggregates DevRel-related process + thinking + case studies into a 2-hop path, avoiding "documentation hollow / SDK scattered / community gaps / feedback loop missing / no quarterly audit".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [code-review.md](../../engineer/processes/do-a-code-review.md) - [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) - [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) - [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) - [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) |
| `methodology/pm-frameworks/` | [jobs-to-be-done-summary.md](../../product-manager/frameworks/jobs-to-be-done.md) - [kano-model-summary.md](../../product-manager/frameworks/kano-model.md) - [okr-summary.md](../../product-manager/frameworks/prepare-a-okr-strategy.md) - [rice-ice-prioritization-summary.md](../../product-manager/frameworks/rice-ice-prioritization.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — DevRel intent - [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — reverse think about loss - [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain - [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) - [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) - [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) - [observability-pattern.md](../../engineer/patterns/observability.md) - [eval-driven-pattern.md](../../engineer/engineering/evaluation-driven-development.md) |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) - [now-next-later-roadmap-summary.md](../../executive/strategy/now-next-later-roadmap.md) - [business-model-canvas-summary.md](../../executive/strategy/business-model-canvas.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) - [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) — DevRel North Star |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) - [adr-template.md](../../knowledge-curator/templates/adr.md) - [runbook](../../engineer/processes/write-a-runbook.md) - [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) - [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) |
| `resources/prompts/` | [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) - [weekly-report-prompt.md](../../ai-engineer/methodology/prompts/weekly-report.md) - [brd-generation-prompt.md](../../ai-engineer/methodology/prompts/brd-generation.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) - [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) - [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) - [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) - [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — DevRel notifications |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) - [roster.md](../../knowledge-curator/people/team/roster.md) — DevRel matrix |
| `lessons/wins/` | [yry-vite-to-rsbuild-migration-win.md](../../engineer/lessons/wins/yry-vite-to-rsbuild-migration.md) - [yiai-supply-chain-hardening-win.md](../../engineer/lessons/wins/yiai-supply-chain-hardening.md) - [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [incident-postmortem-summary.md](../../engineer/lessons/failures/incident-postmortem.md) - [bugs/](../../engineer/lessons/failures/bugs) — DevRel crash archive |
| `lessons/gotchas/` | [no-lockfile-supply-chain-risk.md](./../lessons/gotchas/no-lockfile-supply-chain-risk.md) - [macos-fsevents-silent-drop.md](./../lessons/gotchas/macos-fsevents-silent-drop.md) |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) - [review-log.md](../../knowledge-curator/governance/review-log.md) - [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) - [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) - [brd-objectives](../../brd/) - [scenarios](../../brd/) — DevRel business |
| `projects/` | Each project's `architecture-summary.md` §DevRel + `adr-*` §DX |
| `journeys/` | [./prepare-a-developer-portal-strategy.md](./prepare-a-developer-portal-strategy.md) - [./prepare-a-developer-marketing-strategy.md](./prepare-a-developer-marketing-strategy.md) - [../../knowledge-curator/templates/write-documentation.md](../../knowledge-curator/templates/write-documentation.md) - [./bootstrap-a-new-project.md](./bootstrap-a-new-project.md) |

## Action recommendations

1. **First principles**: First ask "what does DevRel solve / what happens if not done / ROI / business impact"; do not do DevRel for its own sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: First imagine "DevRel going out of control (documentation hollow / SDK scattered / community gaps / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Second-order effects**: One advocacy round -> behavior changes -> adjust again; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: The simplest DevRel that meets business needs wins; do not pile up activities; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **Developer journey**: Must run discover -> trial -> adopt -> scale; avoid breakage points.
6. **Documentation**: Must run [i-want-to-write-documentation.md](../../knowledge-curator/templates/write-documentation.md); avoid staleness; see [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md).
7. **SDK**: Must run SDK + examples; avoid bare API.
8. **Examples**: Must run runnable examples; avoid snippets only.
9. **Community**: Must run community (Slack / Discord / GitHub Discussions); avoid silos.
10. **Feedback**: Must run feedback -> improvement -> notification; avoid silence; see [i-want-to-handle-customer-feedback.md](./handle-customer-feedback.md).
11. **Advocacy**: Must run advocacy (conferences / blogs / live streams); avoid only posting articles.
12. **DX metrics**: Must run TTFHW / activation rate / retention / NPS; avoid PV-only.
13. **Portal**: Must run [i-want-to-prepare-a-developer-portal-strategy.md](./prepare-a-developer-portal-strategy.md); avoid scatter.
14. **Testing**: Must run [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md); avoid bare API.
15. **RACI**: Must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); DevRel / platform / TL / sponsor owners.
16. **Freeze period**: During big promos follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md); do not change SDK API.
17. **Notifications**: Must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to notify internal and external.
18. **Monitoring**: Must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) for SDK errors / documentation visits / community activity alerts.
19. **Retrospective**: After DevRel crashes, must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) and archive in [bugs/](../../engineer/lessons/failures/bugs).
20. **Quarterly audit**: Run [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether SDK is still usable and documentation is still accurate.
21. **ADR**: DevRel decisions must land in an ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
22. **Flywheel**: Good DevRel -> faster adoption -> higher trust -> more business; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Same-class journey: [./prepare-a-developer-portal-strategy.md](./prepare-a-developer-portal-strategy.md) — developer portal
- Same-class journey: [./prepare-a-developer-marketing-strategy.md](./prepare-a-developer-marketing-strategy.md) — developer marketing
- Same-class journey: [../../knowledge-curator/templates/write-documentation.md](../../knowledge-curator/templates/write-documentation.md) — documentation
- Same-class journey: [./bootstrap-a-new-project.md](./bootstrap-a-new-project.md) — bootstrap
- Upstream: [../../engineer/patterns/README.md](../../engineer/patterns/README.md) — patterns leaf entry
