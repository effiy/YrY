---

title: I want to prepare a frontend architecture strategy
aliases:
- i-want-to-prepare-a-frontend-architecture-strategy
- frontend-architecture-journey
- frontend-strategy-journey
- frontend architecture entry
tags:
- journeys
- frontend-architecture
- spa
- ssr
- module-federation
- micro-frontend
- state-management
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
- Filename is descriptive verb-phrase, hyphens only, no underscores or digits
- body contains user-story header + 7 fixed-order sections
related:
- ../../engineer/engineering/bootstrap-a-new-project.md
- ../../engineer/strategies/decompose-a-monolith.md
- ../../engineer/strategies/improve-developer-experience.md
- ../../engineer/architecture-design/ssot-view-layer.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a frontend architecture strategy

> **As a** tech lead, **I want to** prepare a frontend architecture, **so that** launch is safe.

> "SPA + SSR + module federation + micro-frontend + state management + build + performance + quarterly audit" — reach process + thinking + cases within 2 hops.

## Summary

- process: [design-review.md](../../product-manager/processes/design-review.md) + [tech-review.md](../../product-manager/processes/tech-review.md) + [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md)
- thinking: [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- platform: [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) + [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md)
- cases: [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) + [yry-vite-to-rsbuild-migration-win.md](../../engineer/lessons/wins/yry-vite-to-rsbuild-migration.md)

## Scenario

When preparing frontend architecture / SPA / SSR / SSG / ISR / module federation / micro-frontend / state management / routing / build tools / dependencies / performance / Core Web Vitals / accessibility / i18n / multi-end unification / cross-end / promotion frontend freeze / frontend quarterly audit / frontend retrospective, TL + architect + frontend + PM + sponsor need to look up process + thinking + cases. This entry aggregates frontend-architecture-related process + thinking + cases to 2-hop paths, avoiding "scattered strategy / chaotic state / slow build / hollow performance / micro-frontend overuse / no quarterly audit".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [design-review.md](../../product-manager/processes/design-review.md) · [tech-review.md](../../product-manager/processes/tech-review.md) · [quarterly-tech-debt-process.md](../../engineer/quality-security/quarterly-tech-debt.md) · [code-review.md](../../engineer/processes/do-a-code-review.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) · [contract-test-baseline-pattern.md](../../engineer/patterns/contract-test-baseline.md) · [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md) · [supply-chain-hardening-pattern.md](../../engineer/quality-security/harden-supply-chain.md) · [observability-pattern.md](../../engineer/patterns/observability.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — essence of frontend · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — reverse-thinking of collapse · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) |
| `resources/prompts/` | [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [weekly-report-prompt.md](../../ai-engineer/methodology/prompts/weekly-report.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `work/meetings/` | [review-meeting-template.md](../../product-manager/meetings/review-meeting.md) · [weekly-meeting-template.md](../../product-manager/meetings/weekly-meeting.md) · [retrospective-sample.md](../../product-manager/delivery/retrospective.md) |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — frontend matrix |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — notification |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `lessons/wins/` | [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) · [yry-vite-to-rsbuild-migration-win.md](../../engineer/lessons/wins/yry-vite-to-rsbuild-migration.md) · [yipet-stack-migration.md](../../engineer/lessons/wins/yipet-stack-migration.md) · [yivad-leaf-view-leaves-ssot-win.md](../../engineer/lessons/wins/yivad-leaf-view-leaves-ssot.md) |
| `lessons/failures/` | [incident-postmortem-summary.md](../../engineer/lessons/failures/incident-postmortem.md) · [ai-product-launch-lessons-summary.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) — frontend incident archive |
| `lessons/gotchas/` | [no-lockfile-supply-chain-risk.md](./../../engineer/lessons/gotchas/no-lockfile-supply-chain-risk.md) · [macos-fsevents-silent-drop.md](./../../engineer/lessons/gotchas/macos-fsevents-silent-drop.md) · [sse-ondone-guard.md](./../../engineer/lessons/gotchas/sse-ondone-guard.md) |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [brd-objectives](../../brd/) · [scenarios](../../brd/) — business background |
| `projects/` | each project `architecture-summary.md` §frontend + `adr-*` §frontend |
| `journeys/` | [../../engineer/engineering/bootstrap-a-new-project.md](../../engineer/engineering/bootstrap-a-new-project.md) · [../../engineer/strategies/decompose-a-monolith.md](../../engineer/strategies/decompose-a-monolith.md) · [../../engineer/strategies/improve-developer-experience.md](../../engineer/strategies/improve-developer-experience.md) · [../../engineer/strategies/do-an-accessibility-audit.md](../../engineer/strategies/do-an-accessibility-audit.md) |

## Action recommendations

1. **first principles**: first ask "what does frontend architecture solve / what happens if not adjusted / ROI / user impact"; don't adjust for adjustment's sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **inversion**: first imagine "how architecture could go out of control (chaotic state / slow build / performance collapse / micro-frontend overuse / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **second-order effects**: one refactor → dependency change → another refactor; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
4. **Occam**: the simplest architecture that satisfies the business wins; don't pile up frameworks; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **SSOT**: must run [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) + view layering + one-way.
6. **render**: must run SPA / SSR / SSG / ISR selected by business + mixed mode.
7. **micro-frontend**: must run module federation / qiankun / single-spa + on-demand + independent deployment.
8. **state**: must run state management (Redux / Zustand / Pinia) + layering + persistence.
9. **build**: must run Rsbuild / Vite / webpack + HMR + code splitting.
10. **dependencies**: must run lockfile + audit + license; follow [supply-chain-hardening-pattern.md](../../engineer/quality-security/harden-supply-chain.md).
11. **performance**: must run Core Web Vitals + LCP / INP / CLS + budget + monitoring.
12. **AI frontend**: LLM must run streaming / SSE / streaming render + prompt boundary + hallucination fallback; follow [sse-ondone-guard.md](./../../engineer/lessons/gotchas/sse-ondone-guard.md).
13. **a11y**: must run [i-want-to-do-an-accessibility-audit.md](../../engineer/strategies/do-an-accessibility-audit.md) + WCAG + keyboard / screen reader.
14. **i18n**: must run [i-want-to-roll-out-i18n.md](../../engineer/infrastructure/roll-out-i18n.md) + copy + no hardcoding.
15. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); frontend / TL / sponsor owner.
16. **freeze period**: during promotions follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) — don't change frontend architecture.
17. **Reporting**: must follow [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to report internally and externally.
18. **monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) for Web Vitals + errors + thresholds + alerts.
19. **retrospective**: after a frontend incident, must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive under [bugs/](../../engineer/lessons/failures/bugs).
20. **quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to sweep whether architecture is still accurate + whether dependencies are still reasonable.
21. **ADR**: frontend architecture decisions must be recorded in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
22. **flywheel**: good architecture → speed grows → experience grows → more business; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- similar journey: [../../engineer/engineering/bootstrap-a-new-project.md](../../engineer/engineering/bootstrap-a-new-project.md) — bootstrap
- similar journey: [../../engineer/strategies/decompose-a-monolith.md](../../engineer/strategies/decompose-a-monolith.md) — decomposition
- similar journey: [../../engineer/strategies/improve-developer-experience.md](../../engineer/strategies/improve-developer-experience.md) — DevEx
- similar journey: [../../engineer/strategies/do-an-accessibility-audit.md](../../engineer/strategies/do-an-accessibility-audit.md) — a11y
- Upstream: [../../engineer/patterns/README.md](../../engineer/patterns/README.md) - patterns leaf entry
