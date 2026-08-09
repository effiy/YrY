---
title: Run a game day
aliases:
- I want to run a game day
- game-day-journey
- it-rehearsal-journey
- Incident rehearsal entry
tags:
- journeys
- game-day
- chaos
- drill
- rehearsal
- incident-readiness
category: oncall-sre/incident-response
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- oncall-sre
- engineer
benefit: process is repeatable
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./prepare-a-disaster-recovery-plan.md
- ./respond-to-an-incident.md
- ./do-a-rollback-drill.md
- ../../engineer/quality-security/chaos-engineering.md
review_cycle: quarterly
tacit: false
last_verified: 2026-08-07
---

# I want to run a game day

> **As a** oncall sre, **I want to** run a game day, **so that** process is repeatable.

> Reach "scenario + fault injection + response + monitoring + communication + retrospective + improvements + archiving" within 2 hops across process + thinking + case studies.

## Summary

- Process: [chaos-engineering-process.md](../../engineer/quality-security/chaos-engineering.md) + [disaster-recovery-drill-process.md](../../engineer/infrastructure/disaster-recovery-drill.md) + [incident-response-process.md](../../engineer/process/incident-response.md) + [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md)
- Thinking: [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) + [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md)
- Monitoring: [monitoring-governance-process.md](../../engineer/process/monitoring-governance.md) + [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md)
- Case studies: [incident-postmortem-summary.md](../../engineer/lessons/failure-incident-postmortem.md) + [yiai-supply-chain-hardening-win.md](../../engineer/lessons/win-yiai-supply-chain-hardening.md) + [yiai-llm-phase-{two,three,four,five}-win.md](../../engineer/lessons)

## Core viewpoints

**Game days are not about proving the system works; they are about finding where it breaks.**
Teams that run game days to "validate" their disaster recovery plan inevitably design scenarios they already know the system can handle. The correct mindset is to actively try to break the system. Design scenarios that target known weak points, that stress unclear ownership boundaries, and that simulate the worst timing possible. If no one is uncomfortable during the scenario design phase, the scenarios are too easy.

**The value of a game day is proportional to the quality of the retrospective, not the execution.**
Running the drill is the easy part. The hard part is the 2-hour retrospective where the team honestly confronts what went wrong: the alert that never fired, the runbook that was out of date, the person who was supposed to be on call but was unreachable, the rollback that took 20 minutes instead of 2. A game day without a thorough, blameless retrospective is a theater production.

**Game days must be run in production-like environments, not staging.**
Staging environments paper over the real failure modes: network partitions, cold caches, realistic data volumes, third-party dependency failures, and operator stress. While you should never inject faults into production without guardrails, the game day environment must be as close to production as possible. If you use a completely separate test environment, the only thing you learn is that the test environment can survive the drill.

**Involve the actual oncall rotation, not the SRE architects.**
The people who designed the system are the worst people to test it. They know the workarounds, the undocumented features, and the tricks. The real test is whether the person who is on call at 3 AM, who may have joined the team 3 months ago, can follow the runbook and contain the incident. Run game days with the actual oncall rotation, not the architects.

## Key info

- **Game day scenario design**: each scenario must have: (1) a specific fault injection (e.g., "kill the primary database," "sever the network link between services A and B," "exhaust disk space on the logging volume"), (2) expected detection (which alert should fire, within how many minutes), (3) expected response (which runbook steps, which person should respond), (4) blast radius containment (what should NOT be affected), (5) time limit (when to abort if the team hasn't contained it). The scenario should be designed to target a specific weakness, not to demonstrate a known strength.
- **Game day cadence**: quarterly for each critical system (any system with a P0 severity classification). Monthly for the oncall rotation as a whole (a different system each month). The quarterly game day is planned 2 weeks in advance; the monthly game day is lighter-weight (1-2 hours, simpler scenarios). A system that hasn't had a game day in 6 months is a system whose failure modes are unknown.
- **Fault injection techniques**: (1) network (iptables rules to drop/slow traffic, simulate partitions), (2) resource (stress-ng to consume CPU, fill disk with dd, memory with stress), (3) dependency (DNS poisoning, mock API returning errors/timeouts), (4) process (kill -9 on service processes, restart with stale config), (5) data (corrupt a database file, introduce inconsistent state). Each injection must have a precise rollback procedure (the "abort" button) that restores the system to the pre-game-day state within 5 minutes.
- **Game day roles**: (1) Incident Commander (coordinates the response, same person as in a real incident), (2) Scribe (documents every action, timestamp, and observation), (3) Responders (the oncall rotation, follow runbooks, contain the incident), (4) Observers (silent, watch the response, take notes for the retrospective), (5) Game Master (controls the fault injection, can escalate or de-escalate based on team performance). The Game Master is the most important role: they adjust the scenario in real-time based on the team's response, making it harder if the team is handling it too easily or backing off if the team is overwhelmed.
- **Game day retrospective**: within 24 hours, 2 hours, must include: (1) what the team did well (response speed, communication, correct diagnosis), (2) what the team did poorly (missed alerts, wrong runbook, slow escalation), (3) what the runbook got wrong (outdated steps, missing scenarios, wrong contact), (4) what the monitoring missed (alert that didn't fire, fired too late, wrong threshold), (5) action items (owner, due date, priority). The retrospective produces a game day report that is archived alongside incident postmortems.

## Scenario

When running a game day / incident drill / disaster recovery drill / chaos experiment / pre-promotion drill / cross-team drill / red-blue team exercise / IR drill / failover drill, platform + SRE + TL + oncall + business owner need process + thinking + case studies. This entry aggregates game-day-related process + thinking + case studies into a 2-hop path, avoiding "scattered scenarios / chaotic injection / slow response / monitoring gaps / delayed communication / missing retrospective / improvements not landed / empty archiving".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [chaos-engineering-process.md](../../engineer/quality-security/chaos-engineering.md) · [disaster-recovery-drill-process.md](../../engineer/infrastructure/disaster-recovery-drill.md) · [incident-response-process.md](../../engineer/process/incident-response.md) · [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md) · [oncall-rotation-process.md](../../engineer/process/oncall-rotation.md) · [monitoring-governance-process.md](../../engineer/process/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [hotfix-release-process.md](../../oncall-sre/release/hotfix-release.md) · [capacity-planning-process.md](../../engineer/infrastructure/capacity-planning.md) |
| `methodology/thinking/` | [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) — invert failures · [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) — true purpose of drilling · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) — chain effects · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md) |
| `methodology/engineering-patterns/` | [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md) · [supply-chain-hardening-pattern.md](../../engineer/process/harden-supply-chain.md) · [contract-test-baseline-pattern.md](../../engineer/quality-security/contract-test-baseline.md) · [eval-driven](../../engineer/engineering/evaluation-driven-development.md) |
| `methodology/ai-specific/` | [prompt-injection-defense-summary.md](../../ai-engineer/methodology/prompt-injection-defense.md) — AI red team · [hallucination-mitigation-summary.md](../../ai-engineer/methodology/hallucination-mitigation.md) · [llm-evaluation-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md) |
| `tech/ai-platform/` | [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) · [inference-engine-comparison-summary.md](../../ai-engineer/platform/inference-engine-comparison.md) · [llm-comparison-summary.md](../../ai-engineer/platform/llm-comparison.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) · [tech-debt-inventory-template.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [mongodb-indexing-summary.md](../../ai-engineer/data/mongodb-indexing.md) |
| `resources/templates/` | [runbook-template.md](../../engineer/infrastructure/write-a-runbook.md) · [incident-postmortem-template.md](../../engineer/lessons/failure-incident-postmortem.md) · [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `lessons/failures/` | [incident-postmortem-summary.md](../../engineer/lessons/failure-incident-postmortem.md) · [incident-postmortem-template.md](../../engineer/lessons/failure-incident-postmortem.md) · [ai-product-launch-lessons-summary.md](../../engineer/lessons/failure-ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons) |
| `lessons/gotchas/` | [sse-ondone-guard.md](../../engineer/lessons/gotcha-sse-ondone-guard.md) · [macos-fsevents-silent-drop.md](../../engineer/lessons/gotcha-macos-fsevents-silent-drop.md) · [no-lockfile-supply-chain-risk.md](../../engineer/lessons/gotcha-no-lockfile-supply-chain-risk.md) |
| `lessons/wins/` | [yiai-supply-chain-hardening-win.md](../../engineer/lessons/win-yiai-supply-chain-hardening.md) · [yiai-llm-phase-{two,three,four,five}-win.md](../../engineer/lessons) · [yry-vite-to-rsbuild-migration-win.md](../../engineer/lessons/win-yry-vite-to-rsbuild-migration.md) |
| `people/team--` | [team-overview.md](../../knowledge-curator/people/team--team-overview.md) · [roster.md](../../knowledge-curator/people/team--roster.md) — red/blue team owners |
| `people/stakeholders--` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders--stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders--communication-cadence.md) — drill communication |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/process/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/process/cross-timezone-collaboration.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics--north-star-metric.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics--retention-and-churn.md) — user impact |
| `lifecycle/` | [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [governance.md](../../knowledge-curator/governance/governance.md) — drill archive |
| `work/meetings/` | [review-meeting-template.md](../../product-manager/delivery/review-meeting.md) · [retrospective-sample.md](../../product-manager/delivery/retrospective.md) |
| `journeys/` | [./prepare-a-disaster-recovery-plan.md](../../knowledge-curator/archive/strategies-legacy/oncall-sre/prepare-a-disaster-recovery-plan.md) · [./respond-to-an-incident.md](./respond-to-an-incident.md) · [./do-a-rollback-drill.md](./do-a-rollback-drill.md) · [./handle-an-oncall-shift.md](./handle-an-oncall-shift.md) |

## Action recommendations

1. **First principles**: First ask "what should the drill verify (DR / failover / traffic cut / oncall / monitoring / communication) / what happens without drilling / ROI"; do not drill for the sake of drilling; see [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md).
2. **Inversion**: First imagine "how the drill could go out of control (production data pollution / false alerts / traffic hitting real users / cut traffic cannot come back / team fatigue)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md).
3. **Second-order effects**: Find one issue → fix one → drill another; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md).
4. **Occam**: The simplest scenario that meets the verification goal wins; do not pile up tools; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md).
5. **Scenarios**: Must list scenarios first (DB down / provider down / region down / cache down / network split / LLM hallucinate) + injection points per scenario + expected response + success criteria; follow [chaos-engineering-process.md](../../engineer/quality-security/chaos-engineering.md).
6. **Red/blue teams**: Must run [raci-matrix-summary.md](../../engineer/process/raci-matrix.md); red team injects / blue team responds / chair / scribe / sponsor.
7. **Monitoring**: Must run [monitoring-governance-process.md](../../engineer/process/monitoring-governance.md); during the drill monitor QPS / latency / error rate / traffic cut / elasticity.
8. **Communication**: Must run [i-want-to-handle-outage-communication.md](../../engineer/process/handle-outage-communication.md) + [communication-cadence.md](../../knowledge-curator/people/stakeholders--communication-cadence.md) to communicate internally and to sponsors; do not disturb users.
9. **Isolation**: Must isolate from real traffic (tagged / tenant / shadow traffic); follow [i-want-to-handle-multi-tenancy.md](../../engineer/architecture-design/handle-multi-tenancy.md).
10. **Rollback**: Must be able to halt the drill within seconds + rollback; follow [i-want-to-do-a-rollback-drill.md](./do-a-rollback-drill.md).
11. **Data**: Must mask + tag + isolate + clean up after the drill; follow [data-compliance-process.md](../../engineer/infrastructure/data-compliance.md).
12. **AI red team**: AI apps must run [prompt-injection-defense-summary.md](../../ai-engineer/methodology/prompt-injection-defense.md) + jailbreak set + hallucination injection.
13. **Disaster recovery**: Must run [disaster-recovery-drill-process.md](../../engineer/infrastructure/disaster-recovery-drill.md) + cross-region failover + RTO / RPO validation.
14. **Oncall**: Must run [i-want-to-handle-an-oncall-shift.md](./handle-an-oncall-shift.md) + real response + real communication.
15. **Freeze period**: During big promotions follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) and do not drill; drills must be during low-peak periods.
16. **Retrospective**: After the drill must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) + [incident-postmortem-template.md](../../engineer/lessons/failure-incident-postmortem.md) for retrospective + improvements + archive under [bugs/](../../engineer/lessons).
17. **Improvements**: After the retrospective must land improvement items + owner + due + quarterly sweep.
18. **Runbook**: After the drill must update [runbook-template.md](../../engineer/infrastructure/write-a-runbook.md) + verify whether the runbook is still executable.
19. **Quarterly audit**: Follow [review-log.md](../../knowledge-curator/governance/review-log.md) + [governance.md](../../knowledge-curator/governance/governance.md) to sweep whether drill scenarios still represent real risk.
20. **ADR**: Drill architecture decisions must land in an ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
21. **Flywheel**: Drill → early discovery → early fix → confidence rises → dare to scale more; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md).

## Anti-patterns

- **Designing scenarios that the system can already handle.** When the game day ends with "everything worked as expected," the team has learned nothing. Scenarios should be designed to fail. If the system passes every test, the tests are wrong. A good game day produces at least one P0 action item: a runbook gap, a monitoring blind spot, or a recovery procedure that did not work. If the retrospective board is empty, the drill was a waste of time.

- **Running a game day without a kill switch.** Every fault injection must have an immediate, tested abort mechanism. The kill switch must be independent of the system under test. If the injected fault causes the monitoring system itself to fail, the team must still be able to abort. Never run a game day without first testing the abort mechanism in isolation.

- **Stacking multiple independent failures in a single scenario.** The first game day is not the time to simulate "database goes down, and the cache is cold, and the CDN is misconfigured, and the oncall is on vacation." Start with single-fault scenarios and build up. Multi-fault scenarios are for mature teams that have already mastered single-fault drills. Stacking failures too early produces a chaotic outcome that is too complex to learn from.

- **Not notifying dependent teams and stakeholders.** Even in a sandboxed environment, game days can trigger alerts that downstream teams see, produce unusual traffic patterns that confuse business partners, and consume shared resources. Every game day must be announced in advance to all dependent teams, with the exact time window, scope, and abort criteria. Surprising your dependencies is a fast way to lose trust and permission to run future drills.

- **Skipping the oncall handoff simulation.** Many game days simulate the technical failure but skip the organizational failure: the oncall handoff. The real test is whether the person picking up the phone at 3 AM can take over the incident from the daytime responder. Include a simulated handoff in at least one game day per year, where the initial responder hands off to someone who was not in the room.

## Related

- Same-class journey: [./prepare-a-disaster-recovery-plan.md](../../knowledge-curator/archive/strategies-legacy/oncall-sre/prepare-a-disaster-recovery-plan.md) — disaster recovery
- Same-class journey: [./respond-to-an-incident.md](./respond-to-an-incident.md) — incident response
- Same-class journey: [./do-a-rollback-drill.md](./do-a-rollback-drill.md) — rollback drill
- Same-class journey: [./handle-an-oncall-shift.md](./handle-an-oncall-shift.md) — oncall
- Upstream: [../../README.md](../../README.md) — processes leaf entry
