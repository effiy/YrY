---

title: I want to prepare a 1-on-1
aliases:
- I want to prepare a 1:1
- one-on-one-journey
- 1on1-journey
- 1:1 entry
tags:
- journeys
- 1on1
- mentoring
- feedback
- career
- growth
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
- ../processes/mentor-and-grow-engineers.md
- ../processes/run-a-retrospective.md
- ./handle-customer-feedback.md
- ../../knowledge-curator/templates/one-on-one.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a 1-on-1

> **As an** engineer, **I want to** prepare a 1 on 1, **so that** launch is safe.

> "1:1 agenda + feedback + career development + venting + action item follow-up" template, thinking, retrospective, team, and case studies reachable within 2 hops.

## Summary

- template: [one-on-one-template.md](../../knowledge-curator/templates/one-on-one.md) + [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md)
- thinking: [strong-opinions-loosely-held-summary.md](../../knowledge-curator/templates/thinking/strong-opinions-loosely-held.md) + [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md)
- growth: [i-want-to-mentor-and-grow-engineers.md](../processes/mentor-and-grow-engineers.md) + [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md)
- feedback closed loop: [i-want-to-handle-customer-feedback.md](./handle-customer-feedback.md) pattern + [sprint-retrospective-template.md](../../engineer/process/sprint-retrospective.md)

## Scenario

When preparing 1:1 / weekly 1:1 / monthly deep 1:1 / career development 1:1 / venting 1:1, TL + mentor + primary owner need to look up template + thinking + feedback + team + case studies. This entry aggregates 1:1-related template + thinking + retrospective into a 2-hop path, avoiding "1:1 becomes status update / feedback not landing / action items not followed up / career development empty talk".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `resources/templates/` | [one-on-one-template.md](../../knowledge-curator/templates/one-on-one.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) |
| `methodology/thinking/` | [strong-opinions-loosely-held-summary.md](../../knowledge-curator/templates/thinking/strong-opinions-loosely-held.md) · [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) |
| `methodology/pm-frameworks/` | [okr-design-summary.md](../../product-manager/frameworks/okr-design.md) · [jobs-to-be-done-summary.md](../../product-manager/frameworks/jobs-to-be-done.md) · [kano-model-summary.md](../../product-manager/frameworks/kano-model.md) — personal OKR / personal JTBD |
| `methodology/engineering-patterns/` | [evaluation-driven-development-pattern.md](../../engineer/engineering/evaluation-driven-development.md) · [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) — action items traceable |
| `work/meetings/` | [review-meeting-template.md](../../product-manager/meetings/review-meeting.md) · [weekly-meeting-template.md](../../product-manager/meetings/weekly-meeting.md) · [retrospective-sample.md](../../product-manager/delivery/retrospective.md) · [weekly-report-sample.md](../../product-manager/delivery/weekly-report.md) · [daily-report-sample.md](../../product-manager/delivery/daily-report.md) |
| `work/processes/` | [sprint-retrospective-template.md](../../engineer/process/sprint-retrospective.md) · [iteration-pm-handbook-summary.md](../../engineer/process/iteration-pm-handbook.md) · [engineering-productivity-metrics-summary.md](../../engineer/process/engineering-productivity-metrics.md) · [org-productivity-diagnosis-summary.md](../../engineer/processes/org-productivity-diagnosis.md) · [knowledge-transfer-process.md](../../engineer/processes/knowledge-transfer.md) · [project-handover-process.md](../../engineer/process/project-handover.md) |
| `work/collaboration/` | [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/{team,stakeholders,experts}/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) · [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) · [external-experts-roster.md](../../knowledge-curator/people/experts/external-experts-roster.md) |
| `lifecycle/` | [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) · [yivad-leaf-view-leaves-ssot-win.md](../../engineer/lessons/wins/yivad-leaf-view-leaves-ssot.md) · [yivad-vitest-phase-*](../../engineer/lessons/wins) — personal growth case studies |
| `lessons/failures/` | [ai-product-launch-lessons-summary.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) — failure feedback sample |
| `lessons/gotchas/` | [macos-fsevents-silent-drop.md](./../lessons/gotchas/macos-fsevents-silent-drop.md) · [sse-ondone-guard.md](./../lessons/gotchas/sse-ondone-guard.md) · [react-jsxdev-mismatch.md](./../lessons/gotchas/react-jsxdev-mismatch.md) — feedback sample |
| `journeys/` | [../processes/mentor-and-grow-engineers.md](../processes/mentor-and-grow-engineers.md) · [../../new-hire/onboarding/onboard-as-a-new-engineer.md](../../new-hire/onboarding/onboard-as-a-new-engineer.md) · [./handle-customer-feedback.md](./handle-customer-feedback.md) · [../processes/run-a-retrospective.md](../processes/run-a-retrospective.md) |
| `projects/` | each project `project-management-summary.md` section people + section growth |
| `resources/prompts/` | [weekly-report-prompt.md](../../ai-engineer/methodology/prompts/weekly-report.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) — AI-assisted 1:1 agenda generation |

## Action recommendations

1. **Not a status update**: 1:1 is not a standup; let the engineer lead the agenda; TL only prepares 20% guiding questions.
2. **first principles**: first ask "what does this engineer need most right now / what are the pain points / next growth direction"; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
3. **inversion**: first imagine "how a 1:1 can become a venting / credit-claiming / blame session" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
4. **structure**: opening (recent status) / main topic (work / growth / relationships / difficulties) / feedback (bidirectional) / action items (owner + due) / close; use [one-on-one-template.md](../../knowledge-curator/templates/one-on-one.md).
5. **bidirectional feedback**: TL gives engineer feedback + engineer gives TL feedback + engineer gives team feedback; do not go one-way.
6. **strong opinions loosely held**: TL can express strong opinions but allow persuasion; see [strong-opinions-loosely-held-summary.md](../../knowledge-curator/templates/thinking/strong-opinions-loosely-held.md).
7. **career development**: quarterly deep 1:1 run separately; discuss 1-year / 3-year goals + current gap + resource support; see [iteration-pm-handbook-summary.md](../../engineer/process/iteration-pm-handbook.md).
8. **action items**: each item carries owner + due date + acceptance; must be reviewed at the next 1:1; see [evaluation-driven-development-pattern.md](../../engineer/engineering/evaluation-driven-development.md).
9. **venting**: leave 10-15 minutes for the engineer to say whatever they want; do not fill the agenda.
10. **tacit to explicit**: know-how heard in 1:1 enters [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) and is progressively made explicit.
11. **confidentiality**: 1:1 content is not retold in team meetings; unless the engineer agrees; build trust.
12. **frequency**: weekly 30min / monthly deep 60min / quarterly career 90min; do not meet only monthly.
13. **flywheel**: 1:1 trust -> more real feedback -> improvement -> more trust; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).
14. **archive**: 1:1 notes archived in [work/meetings/](../../product-manager/meetings); action items tracked in iterations.
15. **seek external experts**: pull [external-experts-roster.md](../../knowledge-curator/people/experts/external-experts-roster.md) for complex growth topics.

## Related

- same-class journey: [../processes/mentor-and-grow-engineers.md](../processes/mentor-and-grow-engineers.md) — growth main entry
- same-class journey: [../processes/run-a-retrospective.md](../processes/run-a-retrospective.md) — retrospective template
- same-class journey: [./handle-customer-feedback.md](./handle-customer-feedback.md) — feedback closed loop
- same-class journey: [../../new-hire/onboarding/onboard-as-a-new-engineer.md](../../new-hire/onboarding/onboard-as-a-new-engineer.md) — new-hire 1:1
- upstream: [../../knowledge-curator/templates/README.md](../../knowledge-curator/templates/README.md) — templates leaf entry
