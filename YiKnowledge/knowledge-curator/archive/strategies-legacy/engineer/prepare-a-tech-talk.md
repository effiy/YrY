---

title: I want to prepare a tech talk
aliases:
- I want to prepare a tech talk
- tech-talk-journey
- presentation-journey
- Tech talk entry
tags:
- journeys
- tech-talk
- presentation
- sharing
- communication
- knowledge-transfer
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
- ../../knowledge-curator/templates/write-documentation.md
- ./run-iteration-meetings.md
- ../../new-hire/onboarding/contribute-to-the-knowledge-base.md
- ../../product-manager/meetings/README.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a tech talk

> **As an** engineer, **I want to** prepare a tech talk, **so that** launch is safe.

> "Topic selection + agenda + story + failure case + demo + feedback + archive" reach template + thinking + cases + team within 2 hops.

## Summary

- Template follows [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) + [review-meeting-template.md](../../product-manager/meetings/review-meeting.md) + [retrospective-sample.md](../../product-manager/delivery/retrospective.md)
- Thinking follows [strong-opinions-loosely-held-summary.md](../../knowledge-curator/templates/thinking/strong-opinions-loosely-held.md) + [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) + [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md)
- Cases follow [lessons/wins/](../../engineer/lessons/wins) + [lessons/gotchas/](../../engineer/lessons/gotchas) + [lessons/failures/](../../engineer/lessons/failures)
- Archive follows [i-want-to-contribute-to-the-knowledge-base.md](../../new-hire/onboarding/contribute-to-the-knowledge-base.md) + [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md)

## Scenario

When preparing a tech talk / internal brown bag / external meetup / team sync presentation / themed training / incident retrospective sharing, engineer + TL + main owner need to look up template + thinking + story + cases. This entry aggregates tech-talk related template + thinking + cases into 2-hop paths, avoiding "talk becomes a stream of consciousness / story has no arc / demo crashes / audience disengages / no archive after talk / tacit knowledge not made explicit".

## 2-hop reachability paths

| Hop 1 (category/leaf)  | Hop 2 (specific file)  |
|---|---|
| `resources/templates/` | [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [one-on-one-template.md](../../knowledge-curator/templates/one-on-one.md) |
| `work/meetings/` | [review-meeting-template.md](../../product-manager/meetings/review-meeting.md) · [weekly-meeting-template.md](../../product-manager/meetings/weekly-meeting.md) · [retrospective-sample.md](../../product-manager/delivery/retrospective.md) · [weekly-report-sample.md](../../product-manager/delivery/weekly-report.md) · [daily-report-sample.md](../../product-manager/delivery/daily-report.md) |
| `methodology/thinking/` | [strong-opinions-loosely-held-summary.md](../../knowledge-curator/templates/thinking/strong-opinions-loosely-held.md) · [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) |
| `methodology/pm-frameworks/` | [jobs-to-be-done-summary.md](../../product-manager/frameworks/jobs-to-be-done.md) — audience JTBD · [kano-model-summary.md](../../product-manager/frameworks/kano-model.md) · [heart-aarrr-metrics-summary.md](../../product-manager/frameworks/heart-aarrr-metrics.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) — talk structure · [evaluation-driven-development-pattern.md](../../engineer/engineering/evaluation-driven-development.md) · [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md) |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yiai-rag-hybrid-retrieval-win.md](../../engineer/lessons/wins/yiai-rag-hybrid-retrieval.md) · [yiai-supply-chain-hardening-win.md](../../engineer/lessons/wins/yiai-supply-chain-hardening.md) · [yipet-stack-migration-win.md](../../engineer/lessons/wins/yipet-stack-migration.md) · [yry-vite-to-rsbuild-migration-win.md](../../engineer/lessons/wins/yry-vite-to-rsbuild-migration.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) · [yivad-leaf-view-leaves-ssot-win.md](../../engineer/lessons/wins/yivad-leaf-view-leaves-ssot.md) — success story material |
| `lessons/gotchas/` | [macos-fsevents-silent-drop.md](./../lessons/gotchas/macos-fsevents-silent-drop.md) · [sse-ondone-guard.md](./../lessons/gotchas/sse-ondone-guard.md) · [react-jsxdev-mismatch.md](./../lessons/gotchas/react-jsxdev-mismatch.md) · [vite-to-rsbuild-migration.md](./../lessons/gotchas/vite-to-rsbuild-migration.md) · [no-lockfile-supply-chain-risk.md](./../lessons/gotchas/no-lockfile-supply-chain-risk.md) — failure story material |
| `lessons/failures/` | [incident-postmortem-summary.md](../../engineer/lessons/failures/incident-postmortem.md) · [incident-postmortem-template.md](../../engineer/lessons/failures/incident-postmortem.md) · [ai-product-launch-lessons-summary.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) |
| `work/processes/` | [knowledge-transfer-process.md](../../engineer/processes/knowledge-transfer.md) · [knowledge-contributor-charter.md](../../engineer/processes/knowledge-contributor-charter.md) · [iteration-pm-handbook-summary.md](../../engineer/process/iteration-pm-handbook.md) |
| `work/collaboration/` | [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — audience profile |
| `people/experts/` | [external-experts-roster.md](../../knowledge-curator/people/experts/external-experts-roster.md) — invited external experts |
| `lifecycle/` | [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) · [knowledge-map.md](../../knowledge-curator/diagrams/knowledge-map.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) |
| `resources/prompts/` | [weekly-report-prompt.md](../../ai-engineer/methodology/prompts/weekly-report.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) — AI-assisted outline generation |
| `projects/` | Each project's `architecture-summary.md` + `project-management-summary.md` — project material |
| `industry/reports/` | [ai-industry-report.md](../../executive/industry/reports/ai-industry-report.md) · [market-trends/](../../executive/industry/market-trends) — industry background material |

## Action recommendations

1. **First principles**: first ask "who is the audience / what they already know / what they can do after listening / JTBD"; do not pile up jargon; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Inversion**: first think "how the talk could fail (demo crashes / audience disengages / too long / too short / no conclusion / no archive)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
3. **Strong opinions loosely held**: presenter can express strong opinions but should allow being persuaded + leave Q&A space; see [strong-opinions-loosely-held-summary.md](../../knowledge-curator/templates/thinking/strong-opinions-loosely-held.md).
4. **Occam**: 3 core messages beats 10 shallow ones; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **Story arc**: background → conflict → choice → action → result → reflection; see [lessons/wins/](../../engineer/lessons/wins) and [lessons/gotchas/](../../engineer/lessons/gotchas) cases.
6. **Demo**: must pre-record + local fallback + offline version; do not bet on venue network.
7. **Agenda**: 30min talk = 5min hook + 15min main + 5min demo + 5min Q&A; 60min scales proportionally.
8. **Failure case**: pick 1-2 real failures from [bugs/](../../engineer/lessons/failures/bugs) + [gotchas/](../../engineer/lessons/gotchas); failures > stream of consciousness.
9. **Interaction**: must keep Q&A + live voting / mini survey; do not one-way lecture.
10. **Feedback**: send pre-read before / collect questions during / send survey after / improve next time.
11. **Archive**: after talk must run [i-want-to-contribute-to-the-knowledge-base.md](../../new-hire/onboarding/contribute-to-the-knowledge-base.md); slides + recording + notes enter knowledge base; tacit knowledge follows [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md).
12. **AI assistance**: use [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) pattern to let AI proofread whether the outline covers key points.
13. **Cadence**: talk + training + retrospective three types separate; do not mix.
14. **Quarterly cadence**: team must run a brown bag every 4-6 weeks + one deep talk per quarter; follow [iteration-pm-handbook-summary.md](../../engineer/process/iteration-pm-handbook.md).
15. **Flywheel**: talk → feedback → improvement → trust → more talks; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Same category journey: [../../knowledge-curator/templates/write-documentation.md](../../knowledge-curator/templates/write-documentation.md) — documentation writing
- Same category journey: [./run-iteration-meetings.md](./run-iteration-meetings.md) — iteration meetings
- Same category journey: [../../new-hire/onboarding/contribute-to-the-knowledge-base.md](../../new-hire/onboarding/contribute-to-the-knowledge-base.md) — archive
- Same category journey: [../processes/run-a-retrospective.md](../processes/run-a-retrospective.md) — retrospective sharing
- Upstream: [../../product-manager/meetings/README.md](../../product-manager/meetings/README.md) — meetings leaf entry
