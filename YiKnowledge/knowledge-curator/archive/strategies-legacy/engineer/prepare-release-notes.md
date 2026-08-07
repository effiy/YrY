---

title: I want to prepare release notes
aliases:
- I want to write release notes
- release-notes-journey
- changelog-journey
- release notes entry
tags:
- journeys
- release-notes
- changelog
- communication
- documentation
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
- ../processes/ship-a-release.md
- ../../knowledge-curator/templates/write-documentation.md
- ./handle-outage-communication.md
- ../../oncall-sre/release/release.md
review_cycle: quarterly
tacit: false
---

# I want to prepare release notes

> **As an** engineer, **I want to** prepare release notes, **so that** launch is safe.

> "Change list + user perspective + breaking + upgrade guide + rollback + notification + archive" reachable within 2 hops: template + process + thinking.

## Summary

- Process follows [release-process.md](../../oncall-sre/release/release.md) + [canary-release-process.md](../../oncall-sre/release/canary-release.md) + [hotfix-release-process.md](../../oncall-sre/release/hotfix-release.md)
- Template follows [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) + [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) + [weekly-report-sample.md](../../product-manager/delivery/weekly-report.md)
- Thinking follows [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) + [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md)
- Notification follows [i-want-to-handle-outage-communication.md](./handle-outage-communication.md) + [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md)

## Scenario

When writing release notes / changelog / upgrade guide / breaking changes notification / user weekly report / hotfix notification / cross-team release sync, TL + platform + oncall + business owner need to look up template + process + thinking. This entry aggregates release-notes-related template + process + thinking to a 2-hop path, avoiding "scattered change list / missing user perspective / breaking not notified / hollow upgrade guide / missing rollback steps / delayed notification".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [release-process.md](../../oncall-sre/release/release.md) · [canary-release-process.md](../../oncall-sre/release/canary-release.md) · [hotfix-release-process.md](../../oncall-sre/release/hotfix-release.md) · [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [dependency-upgrade-process.md](../../engineer/processes/dependency-upgrade.md) · [data-migration-process.md](../../engineer/processes/data-migration.md) · [incident-response-process.md](../../engineer/processes/incident-response.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) |
| `resources/templates/` | [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [one-on-one-template.md](../../knowledge-curator/templates/one-on-one.md) |
| `resources/prompts/` | [weekly-report-prompt.md](../../ai-engineer/methodology/prompts/weekly-report.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [brd-generation-prompt.md](../../ai-engineer/methodology/prompts/brd-generation.md) — AI-assisted generation |
| `work/meetings/` | [weekly-report-sample.md](../../product-manager/delivery/weekly-report.md) · [daily-report-sample.md](../../product-manager/delivery/daily-report.md) · [review-meeting-template.md](../../product-manager/meetings/review-meeting.md) · [weekly-meeting-template.md](../../product-manager/meetings/weekly-meeting.md) · [retrospective-sample.md](../../product-manager/delivery/retrospective.md) |
| `methodology/thinking/` | [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) — concise · [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — user perspective · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — invert misread · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md) — single source · [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md) · [evaluation-driven-development-pattern.md](../../engineer/engineering/evaluation-driven-development.md) |
| `methodology/pm-frameworks/` | [jobs-to-be-done-summary.md](../../product-manager/frameworks/jobs-to-be-done.md) — user JTBD · [kano-model-summary.md](../../product-manager/frameworks/kano-model.md) |
| `product/ux/` | [ai-product-ux-patterns-summary.md](../../product-manager/discovery/ux/ai-product-ux-patterns.md) · [nielsen-heuristics-summary.md](../../product-manager/discovery/ux/nielsen-heuristics.md) · [cross-cultural-ux-summary.md](../../product-manager/discovery/ux/cross-cultural-ux.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — notification cadence |
| `work/collaboration/` | [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) · [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) |
| `lessons/failures/` | [incident-postmortem-summary.md](../../engineer/lessons/failures/incident-postmortem.md) · [incident-postmortem-template.md](../../engineer/lessons/failures/incident-postmortem.md) · [ai-product-launch-lessons-summary.md](../../engineer/lessons/failures/ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons/failures/bugs) |
| `lessons/gotchas/` | [sse-ondone-guard.md](./../lessons/gotchas/sse-ondone-guard.md) · [react-jsxdev-mismatch.md](./../lessons/gotchas/react-jsxdev-mismatch.md) · [vite-to-rsbuild-migration.md](./../lessons/gotchas/vite-to-rsbuild-migration.md) · [no-lockfile-supply-chain-risk.md](./../lessons/gotchas/no-lockfile-supply-chain-risk.md) — breaking cases |
| `lessons/wins/` | [yipet-stack-migration-win.md](../../engineer/lessons/wins/yipet-stack-migration.md) · [yry-vite-to-rsbuild-migration-win.md](../../engineer/lessons/wins/yry-vite-to-rsbuild-migration.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) · [yiai-brd-agent-launch.md](../../engineer/lessons/wins/yiai-brd-agent-launch.md) |
| `lifecycle/` | [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [governance.md](../../knowledge-curator/governance/governance.md) — release notes archive |
| `journeys/` | [../processes/ship-a-release.md](../processes/ship-a-release.md) · [../../knowledge-curator/templates/write-documentation.md](../../knowledge-curator/templates/write-documentation.md) · [./handle-outage-communication.md](./handle-outage-communication.md) · [../../oncall-sre/incident-response/handle-a-major-version-upgrade.md](../../oncall-sre/incident-response/handle-a-major-version-upgrade.md) |
| `projects/` | each project `dev-standards-summary.md` §release + `project-management-summary.md` §release cadence |

## Action recommendations

1. **First principles**: first ask "who reads / what can they do after reading / what happens if they don't"; do not pile up commit log; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **User perspective**: must distinguish internal (ops / oncall) / external (user / customer) / cross-team; each perspective different.
3. **Inversion**: first imagine "how the notes will be misread (missing breaking / incomplete upgrade steps / missing rollback / time-window misunderstanding)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
4. **Occam**: the simplest version that meets audience needs wins; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **Structure**: version + time + summary + new features + improvements + fixes + breaking + upgrade guide + rollback + links (ADR / PR / commit).
6. **Change list**: must aggregate from PR / commit / ADR automatically; do not hand-copy; follow [ssot-view-layer-pattern.md](../../engineer/architecture-design/ssot-view-layer.md).
7. **Breaking listed separately**: must highlight + assess impact + give migration steps + contact; see [i-want-to-handle-a-major-version-upgrade.md](../../oncall-sre/incident-response/handle-a-major-version-upgrade.md).
8. **Upgrade guide**: must be copy-pasteable; commands + expected output + exception handling; not prose; follow [i-want-to-write-a-runbook.md](../processes/write-a-runbook.md) style.
9. **Rollback**: must write rollback steps + trigger conditions + contact; see [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md).
10. **Canary**: must write canary percentage + time window + traffic-switching strategy; see [canary-release-process.md](../../oncall-sre/release/canary-release.md).
11. **Hotfix**: must run [hotfix-release-process.md](../../oncall-sre/release/hotfix-release.md) + fast lane + post-fill notes.
12. **Freeze period**: big promotions follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md); notes must tag freeze window.
13. **AI assist**: use [weekly-report-prompt.md](../../ai-engineer/methodology/prompts/weekly-report.md) pattern to let AI aggregate commits + generate draft; human fills in.
14. **Notification**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) cadence; breaking must notify 24h ahead; follow [i-want-to-handle-outage-communication.md](./handle-outage-communication.md).
15. **Cross-timezone**: follow [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md); async notification + leave window.
16. **Archive**: must archive under [lifecycle/review-log.md](../../knowledge-curator/governance/review-log.md) + [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md); do not drop after sending.
17. **Retrospective**: after a release incident, run [incident-postmortem-template.md](../../engineer/lessons/failures/incident-postmortem.md) retrospective + update release notes template.
18. **Flywheel**: good release notes → trust → more autonomous releases; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Related

- Same-category journey: [../processes/ship-a-release.md](../processes/ship-a-release.md) — release process
- Same-category journey: [../../knowledge-curator/templates/write-documentation.md](../../knowledge-curator/templates/write-documentation.md) — documentation
- Same-category journey: [./handle-outage-communication.md](./handle-outage-communication.md) — notification
- Same-category journey: [../../oncall-sre/incident-response/handle-a-major-version-upgrade.md](../../oncall-sre/incident-response/handle-a-major-version-upgrade.md) — major version
- Upstream: [../../engineer/processes/README.md](../../engineer/processes/README.md) — processes leaf entry
