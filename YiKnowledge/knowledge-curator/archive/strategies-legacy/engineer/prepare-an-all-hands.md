---

title: I want to prepare an all-hands
aliases:
- I want to prepare an all-hands
- all-hands-journey
- town-hall-journey
- all-hands entry
tags:
- journeys
- all-hands
- town-hall
- communication
- storytelling
- org-update
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
- ./run-iteration-meetings.md
- ./prepare-a-tech-talk.md
- ./prepare-a-quarterly-review.md
- ../../knowledge-curator/people/stakeholders/communication-cadence.md
review_cycle: quarterly
tacit: false
---

# I want to prepare an all-hands

> **As an** engineer, **I want to** prepare an all hands, **so that** launch is safe.

> "Theme + agenda + stories + data + Q&A + archive + retrospective" reachable within 2 hops: template + thinking + case meetings.

## Summary

- Template: [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) + [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) + [tech-design-template.md](../../knowledge-curator/templates/tech-design.md)
- Thinking: [strong-opinions-loosely-held-summary.md](../../knowledge-curator/templates/thinking/strong-opinions-loosely-held.md) + [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md)
- Communication: [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) + [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md)
- Cases: [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) + [yipet-stack-migration-win.md](../../engineer/lessons/wins/yipet-stack-migration.md) + [yry-vite-to-rsbuild-migration-win.md](../../engineer/lessons/wins/yry-vite-to-rsbuild-migration.md)

## Scenario

When preparing all-hands / town hall / quarterly all-hands / monthly all-hands / cross-region all-hands / executive briefing / strategic alignment / OKR communication / major announcement, TL + PM + business owner + sponsor need templates + thinking + case meetings. This entry aggregates all-hands-related template + thinking + cases into a 2-hop path, avoiding "scattered agenda / messy stories / hollow data / cold Q&A / missing communication / empty archive / missing retrospective".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `resources/templates/` | [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) · [one-on-one-template.md](../../knowledge-curator/templates/one-on-one.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) · [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) |
| `work/meetings/` | [review-meeting-template.md](../../product-manager/meetings/review-meeting.md) · [weekly-meeting-template.md](../../product-manager/meetings/weekly-meeting.md) · [retrospective-sample.md](../../product-manager/delivery/retrospective.md) · [weekly-report-sample.md](../../product-manager/delivery/weekly-report.md) · [daily-report-sample.md](../../product-manager/delivery/daily-report.md) |
| `resources/prompts/` | [weekly-report-prompt.md](../../ai-engineer/methodology/prompts/weekly-report.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) — AI-assisted draft · [brd-generation-prompt.md](../../ai-engineer/methodology/prompts/brd-generation.md) |
| `methodology/thinking/` | [strong-opinions-loosely-held-summary.md](../../knowledge-curator/templates/thinking/strong-opinions-loosely-held.md) — communication style · [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — intent of all-hands · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — invert the cold room · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) — trust flywheel · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) |
| `methodology/pm-frameworks/` | [okr-design-summary.md](../../product-manager/frameworks/okr-design.md) · [jobs-to-be-done-summary.md](../../product-manager/frameworks/jobs-to-be-done.md) · [kano-model-summary.md](../../product-manager/frameworks/kano-model.md) · [rice-ice-prioritization-summary.md](../../product-manager/frameworks/rice-ice-prioritization.md) |
| `product/strategy/` | [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) · [now-next-later-roadmap-summary.md](../../executive/strategy/now-next-later-roadmap.md) · [second-curve-summary.md](../../executive/strategy/second-curve.md) · [blue-ocean-strategy-summary.md](../../executive/strategy/blue-ocean.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — all-hands cadence |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — team introduction |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `work/processes/` | [iteration-pm-handbook-process.md](../../engineer/process/iteration-pm-handbook.md) · [cross-team-collaboration-process.md](../../engineer/process/cross-team-collaboration.md) · [project-handover-process.md](../../engineer/process/project-handover.md) · [knowledge-transfer-process.md](../../engineer/processes/knowledge-transfer.md) |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yipet-stack-migration-win.md](../../engineer/lessons/wins/yipet-stack-migration.md) · [yry-vite-to-rsbuild-migration-win.md](../../engineer/lessons/wins/yry-vite-to-rsbuild-migration.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) · [yiai-rag-hybrid-retrieval-win.md](../../engineer/lessons/wins/yiai-rag-hybrid-retrieval.md) |
| `lessons/failures/` | [ai-product-launch-lessons-summary.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [incident-postmortem-summary.md](../../engineer/lessons/failures/incident-postmortem.md) · [bugs/](../../engineer/lessons/failures/bugs) — communication archive |
| `industry/` | [ai-industry-report.md](../../executive/industry/reports/ai-industry-report.md) · [ai-market-trend-first-half.md](../../executive/industry/market-trends/ai-market-trend-first-half.md) · [llm-vendor-landscape-summary.md](../../executive/industry/competitors/llm-vendor-landscape.md) |
| `brd/` | [brd-domains](../../brd/) · [brd-reference](../../brd/) · [brd-terminology](../../brd/) — business background |
| `lifecycle/` | [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `projects/` | each project `project-management-summary.md` + `architecture-summary.md` |
| `journeys/` | [./run-iteration-meetings.md](./run-iteration-meetings.md) · [./prepare-a-tech-talk.md](./prepare-a-tech-talk.md) · [./prepare-a-quarterly-review.md](./prepare-a-quarterly-review.md) · [../../product-manager/frameworks/prepare-a-go-to-market.md](../../product-manager/frameworks/prepare-a-go-to-market.md) |

## Action recommendations

1. **First principles**: first ask "what does the all-hands convey / what happens without the meeting / ROI"; do not meet for the sake of meeting; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: first imagine "the all-hands could go out of control (cold room / misinterpretation / cross-timezone disconnect / information leak / sponsor unhappy)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Strong opinions loosely held**: must run [strong-opinions-loosely-held-summary.md](../../knowledge-curator/templates/thinking/strong-opinions-loosely-held.md); neither humble nor arrogant + clear stance + leave room for dialogue.
4. **Cadence**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md); monthly all-hands + quarterly strategic all-hands + annual review.
5. **Agenda**: must run [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md); 5-7 items / each with owner + duration.
6. **Stories**: must run [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md); wins / customer stories / team highlights; emotion before data.
7. **Data**: must run [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) + [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md); 3-5 core metrics + trends + benchmarks.
8. **Strategy**: must run [product-strategy-summary.md](../../product-manager/frameworks/prepare-a-product-strategy.md) + [now-next-later-roadmap-summary.md](../../executive/strategy/now-next-later-roadmap.md); now / next / later three sections.
9. **OKR**: must run [okr-design-summary.md](../../product-manager/frameworks/okr-design.md); quarterly OKR progress + risk + adjustments.
10. **Q&A**: must be open + must be anonymous + must be pre-screened + must be answered live + must be followed up in writing; do not let it go cold.
11. **Cross-timezone**: must run [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md); must record + must use multi-timezone windows.
12. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); host / lead speaker / data / Q&A / recording / archive roles.
13. **Draft**: use [weekly-report-prompt.md](../../ai-engineer/methodology/prompts/weekly-report.md) to have AI draft + human edit.
14. **Preview**: send agenda + pre-read materials 3-7 days ahead; use [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md).
15. **Confidentiality**: classified content must be tagged + NDA scope must be tagged; use [data-compliance-process.md](../../engineer/infrastructure/data-compliance.md).
16. **Recording**: must record + must caption + must archive + must be replayable; use [knowledge-transfer-process.md](../../engineer/processes/knowledge-transfer.md).
17. **Retrospective**: must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective of the all-hands itself + revise the agenda.
18. **Archive**: must run [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to archive all-hands minutes.
19. **Sponsor**: must run [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) to brief sponsors + collect feedback.
20. **Second-order effects**: all-hands → team alignment → smoother collaboration → trust rises; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
21. **Flywheel**: all-hands goes well → trust → more transparency → better collaboration; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Same-class journey: [./run-iteration-meetings.md](./run-iteration-meetings.md) — iteration meetings
- Same-class journey: [./prepare-a-tech-talk.md](./prepare-a-tech-talk.md) — tech talk
- Same-class journey: [./prepare-a-quarterly-review.md](./prepare-a-quarterly-review.md) — quarterly review
- Same-class journey: [../../product-manager/frameworks/prepare-a-go-to-market.md](../../product-manager/frameworks/prepare-a-go-to-market.md) — GTM
- Upstream: [../../knowledge-curator/people/stakeholders/README.md](../../knowledge-curator/people/stakeholders/README.md) — stakeholders leaf entry
