---
title: FDE exit without internal owner kills Day 2 projects
aliases: [fde-day-two-without-internal-owner, no-internal-owner-failure, day-two-death-spiral]
tags: [retrospective, fde, day-two, internal-owner, handover, project-death, failure]
category: engineer/lessons
created: 2026-08-05
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: yearly
tacit: true
roles: [engineer, tech-lead, product-manager]
benefit: "failure does not repeat"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified
related:
---

# FDE exit without internal owner kills Day 2 projects

> **As an** engineer, **I want to** avoid the no-internal-owner failure, **so that** failure does not repeat.

> After the FDE exits, the customer has no internal owner → the system collapses within 4-12 weeks → the customer churns and renewal is deadlocked. This retrospective is the basis for [ADR Delta-as-contract](../../tech-lead/decisions/fde/delta-as-a-contract.md) §risk #5 and [Day 2 operations](../engineering/plan-day-two-operations.md) §"no internal owner = project death".

## Summary

- **Symptom**: After FDE exit the customer has no internal owner; the system collapses in 4-12 weeks; the customer churns.
- **Root cause**: Discovery skipped the 3rd Three Whys question (Day 2 owner); SOW had no exit criteria; handover was a formality.
- **Root-cause chain**: 5-Why down to the system layer (missing process / no internal owner identification / handover SOP lacks spot audit).
- **Actions**: Discovery enforces Day 2 owner identification + SOW exit criteria mandatory + handover spot audit with 30/60/90-day follow-up.
- **Reusable**: FDE Practice "Day 2 owner must be identified in Week 1" SOP.

## Core viewpoints

- **The FDE's exit is not the end of the project -- it is the beginning of the project's real test**: The MVA proved the concept works; the UAT proved the customer accepts it. But the system's value is realized in Day 2 operations, not Day 1 launch. An FDE engagement that treats handover as the finish line is measuring the wrong milestone.

- **An internal owner is not a name on an org chart -- it is a person with authority, budget, and skin in the game**: Handing over to "the IT department" is handing over to no one. The internal owner must have the authority to allocate resources, the budget to pay for ongoing operations, and a personal stake in the system's success. Without all three, the system is orphaned the moment the FDE walks out the door.

- **The Three Whys question about Day 2 is the most important question in the Discovery call, and it is the one most frequently skipped**: Everyone wants to talk about the technology (Why 1: System of Record) and the business case (Why 2: Cost of Inaction). The Day 2 question (Why 3: who runs this after we leave) is uncomfortable because it forces the customer to confront their own organizational gaps. Skipping it is comfortable in the short term and catastrophic in the long term.

- **Raw alerts without runbooks are not monitoring -- they are noise that trains the customer to ignore the system**: When an alert fires and the internal owner has no documented procedure for diagnosing or resolving it, the alert becomes background noise. After three ignored alerts, the system is effectively unmonitored. A runbook entry for every alert is not documentation -- it is the operational backbone of Day 2.

- **The SOW exit criteria are the legal and operational backbone of a successful handover**: Without explicit exit criteria -- system uptime, response accuracy, alert resolution time, internal owner sign-off -- the handover is a ceremony, not a transition. The SOW must define what "done" means in measurable terms, and the handover must demonstrate that each criterion is met before the FDE disengages.

## Key info

- **FDE Day 2 collapse pattern (FDE-D2-001, P1 severity, multi-customer retrospective)**: System collapses 4-12 weeks after FDE exit when no internal owner is designated. Timeline: Week 0 — FDE onboards, Discovery skips the 3rd Three Whys question (Day 2 owner); Week 4 — MVA launches, customer signs UAT; Week 12 — FDE exits, handover is a formality; Week 16 — system alerts go unattended (raw alerts, no runbook); Week 20 — customer complains "system is inaccurate"; Week 24 — customer renewal deadlock. Impact: multiple customers deadlocked on renewal, project survival rate after FDE exit ~50%, renewal rate dropped from 80% to 30%.
- **5-Why root cause chain**: Why 1: System collapses → no one operates it. Why 2: No one operates → no internal owner after FDE exit. Why 3: No internal owner → Discovery skipped the 3rd Three Whys question. Why 4: 3rd question skipped → Discovery SOP not enforced + Lead no spot audit. Why 5: SOP not enforced → FDE Practice "Day 2 owner must be identified in Week 1" SOP missing. Root cause type: process missing (Day 2 owner identification + handover spot audit) + monitoring missing (raw alerts, no runbook).
- **Internal owner qualification criteria (3 requirements)**: The internal owner must be a named individual (not a department, not a distribution list) with: (1) Authority to allocate resources — can assign personnel and budget to ongoing operations; (2) Budget ownership — has allocated budget for maintenance, updates, and incident response; (3) Personal stake — career incentive tied to the system's success. "The IT department" is not an owner — alerts sent to a distribution list are ignored by everyone because they are addressed to no one. If the named owner leaves, a new named owner must be identified before FDE disengages.
- **SOW mandatory exit criteria (4 fields, all must be demonstrated before FDE exit)**: (1) System uptime ≥ 99.5% — measured over minimum 2-week period; (2) Response accuracy — measured against UAT baseline, no regression from launch; (3) Alert resolution time — P0 < 1 hour, P1 < 4 hours, demonstrated by injecting faults during handover walkthrough; (4) Internal owner sign-off — documented handover walkthrough where owner executes each runbook remediation step while FDE observes. Any step the owner cannot complete (due to lack of access, permissions, or knowledge) must be resolved before FDE exits.
- **30/60/90-day follow-up audit protocol**: Each follow-up must be quantitative, not conversational. Audit includes: uptime metrics, alert volume and resolution times, response accuracy against UAT baseline, user satisfaction scores, and unresolved action items. Each follow-up produces a written report with green/yellow/red status shared with customer's executive sponsor. Alert thresholds must be tuned to customer's production baseline during first week of operation (target: < 5 alerts/day for healthy system). The 2-week parallel-run period — owner is primary operator, FDE available for escalation — ensures operational confidence before full disengagement.
- **Yi-family Day 2 operations relevance (2026-08)**: Yi-family projects are internal tools with the team as the only users — no formal handover or Day 2 owner designation needed. The FDE Practice Day 2 collapse pattern is documented for when external customer deployments begin. The "Day 2 owner must be identified in Week 1" SOP, SOW exit criteria template, and 30/60/90-day follow-up protocol are in development (due 2026-09-30).

## 1. Basic info

| Field | Content |
|---|---|
| Incident ID | FDE-D2-001 |
| Title | FDE exit without internal owner kills Day 2 projects |
| Severity | P1 |
| Date | 2026-08-05 (retrospective) |
| Reporter | FDE Practice Lead |
| Related project | FDE Playbook (multi-customer retrospective) |
| Related ADR | [ADR Delta-as-contract](../../tech-lead/decisions/fde/delta-as-a-contract.md) §risk #5 |

## 2. Impact scope

| Dimension | Impact |
|---|---|
| Customer churn | Multiple customers deadlocked on renewal |
| Project cadence | System collapses after 4-12 weeks |
| FDE Practice reputation | "Always collapses after FDE leaves" label |
| Team morale | FDE feels the work was wasted |
| Business metrics | Renewal rate drops; CAC rises |

## 3. Event timeline

| Time | Event | Operator | Source |
|---|---|---|---|
| Week 0 | FDE onboards; Discovery skips the 3rd Three Whys question | FDE | Recording retrospective |
| Week 4 | MVA launches; customer signs UAT | FDE + customer | SOW |
| Week 12 | FDE exits; handover is a formality | FDE + customer IT | Handover doc |
| Week 16 | System alerts go unattended; alerts fire raw | — | Monitoring |
| Week 20 | Customer complains "system is inaccurate" | Customer business owner | Ticket |
| Week 24 | Customer renewal deadlock | CTO | Renewal meeting |

## 4. Root-cause chain (5-Why)

| Why level | Symptom | Direct cause |
|---|---|---|
| Why 1 | System collapses | No one operates it |
| Why 2 | No one operates it | No internal owner after FDE exit |
| Why 3 | No internal owner | Discovery skipped the 3rd Three Whys question |
| Why 4 | 3rd question skipped | Discovery SOP not enforced + Lead no spot audit |
| Why 5 | SOP not enforced | FDE Practice "Day 2 owner must be identified in Week 1" SOP missing |

**Root cause type** (multi-select):
- [x] Process missing (Day 2 owner identification + handover spot audit)
- [x] Monitoring missing (raw alerts; no runbook)
- [ ] Code defect
- [ ] Configuration error
- [ ] Insufficient capacity
- [ ] Third-party dependency
- [ ] Human operation

## 5. Interim and root measures

| Type | Measure | Owner | Due date | Status |
|---|---|---|---|---|
| Interim | Dispatch FDE temporarily back to existing customers | FDE Practice Lead | 2026-08-15 | To do |
| Root | Discovery SOP enforces Day 2 owner identification | FDE Practice Lead | 2026-08-30 | To do |
| Root | SOW template adds mandatory exit criteria fields | FDE Practice Lead + Legal | 2026-09-15 | To do |
| Root | Handover SOP adds 30/60/90-day follow-up | FDE Practice Lead | 2026-09-30 | To do |
| Root | Lead quarterly spot audit of 20% of handover recordings | FDE Practice Lead | 2026-10-15 | To do |

## 6. Action items

| ID | Action item | Type | Owner | Due date | Acceptance method | Status |
|---|---|---|---|---|---|---|
| 1 | Discovery SOP adds Day 2 owner must be identified in Week 1 | Process | FDE Practice Lead | 2026-08-30 | SOP launch | To do |
| 2 | SOW template adds 4 mandatory exit-criteria fields | Process | FDE Practice Lead + Legal | 2026-09-15 | Template launch | To do |
| 3 | Handover SOP adds 30/60/90-day follow-up | Process | FDE Practice Lead | 2026-09-30 | SOP launch | To do |
| 4 | Lead quarterly spot audit of 20% of handover recordings | Governance | FDE Practice Lead | 2026-10-15 | Audit report | To do |
| 5 | Runbook template adds mandatory field per alert | Documentation | FDE Practice Lead | 2026-09-30 | Template launch | To do |
| 6 | Customer internal owner training handbook | Documentation | FDE Practice Lead | 2026-10-15 | Handbook launch | To do |

## 7. Lessons learned

- ✅ Done well: MVA proved value in 30 days; UAT signed; SOW acceptance met the bar
- ❌ To improve: Discovery skipped the 3rd question; SOW had no exit criteria; handover was a formality; raw alerts had no runbook
- 🧠 Reusable: FDE Practice "Day 2 owner must be identified in Week 1" SOP; handover 30/60/90-day follow-up

## 8. Monitoring metric regression

| Metric | Before incident | During incident | Current | Goal |
|---|---|---|---|---|
| Project survival rate after FDE exit | — | 50% (collapse in 4-12 weeks) | — | >= 90% (12 months) |
| Renewal rate | 80% | 30% | — | >= 75% |
| Handover spot-audit coverage | 0% | 0% | — | 20% quarterly |

## 9. Communication and archiving

- Communicated to: CTO, customer CISO, PMO, Legal
- Communication date: 2026-08-10
- Archive path: `lessons/failures/fde-day-two-without-internal-owner.md`
- Related ADR / TD: [ADR Delta-as-contract](../../tech-lead/decisions/fde/delta-as-a-contract.md)

## 10. Retrospective meeting metadata

- Duration: 60 minutes
- Blameless: yes
- Follow-up action item completion rate: N/A (first time)



- **Discovery skips the 3rd Three Whys question** — Day 2 owner not identified; project doomed
- **SOW has no exit criteria** — FDE exit has no basis; customer IT doesn't know when to take it offline
- **Handover as formality** — Customer IT doesn't know how to operate; collapses in 4-12 weeks
- **Raw alerts with no runbook** — Customer IT doesn't know how to fix; alert fatigue
- **FDE exit with no follow-up** — No one notices the system collapse; renewal deadlock

## Action recommendations

1. **Add a "Day 2 owner identification" gate to the Discovery SOP that blocks the MVA phase from starting until a named individual with budget authority is confirmed.** The Three Whys question about Day 2 ownership is the most frequently skipped question in Discovery calls because it is uncomfortable. Make it non-negotiable: the Discovery call is not complete, and the MVA phase cannot begin, until a named person (not a department, not a distribution list) is identified as the Day 2 owner, with documented authority to allocate resources and budget for ongoing operations.

2. **Require every SOW to include four mandatory exit-criteria fields before the FDE can disengage: system uptime (target >= 99.5%), response accuracy (measured against the UAT baseline), alert resolution time (P0 < 1 hour, P1 < 4 hours), and internal owner sign-off with a documented handover walkthrough.** The SOW exit criteria are the legal and operational backbone of a successful handover. Without them, the handover is a ceremony, not a transition. These four fields must be measurable and must be demonstrated before the FDE exits.

3. **Implement a 30/60/90-day follow-up audit that is quantitative, not conversational.** The follow-up must include: uptime metrics, alert volume and resolution times, response accuracy, user satisfaction scores, and unresolved action items. The audit data, not the owner's sentiment, determines whether the system is healthy. Each follow-up must produce a written report with a green/yellow/red status that is shared with the customer's executive sponsor.

4. **Create a runbook template that requires one documented remediation procedure per alert, and test each runbook by injecting the fault during the handover walkthrough.** A runbook that says "Check the database connection string and restart the service" is a theory. The owner must execute each remediation step while the FDE observes. Any step that the owner cannot complete (because they lack access, permissions, or knowledge) must be documented and resolved before the FDE exits.

5. **Tune all alert thresholds to the customer's production baseline during the first week of operation, before the handover walkthrough.** Alerts configured for the FDE's development environment will fire at rates that are noise in the customer's environment (e.g., 500ms latency spikes that are normal background traffic). The owner who receives 50 alerts per day will ignore all of them, including the one that signals a real problem. Thresholds must be tuned to the customer's baseline, and the alert volume must be verified to be manageable (target: fewer than 5 alerts per day for a healthy system).

## Anti-patterns

- **Designating the customer's IT department as the internal owner without identifying a specific named individual.** "The IT department" is not an owner -- it is an org chart. Alerts sent to a distribution list are ignored by everyone because they are addressed to no one. The internal owner must be a named person with a phone number, an email address, and a personal stake in the system's success. If that person leaves, the handover must identify a new named owner before the FDE disengages.
- **Writing the runbook for each alert but not testing it by triggering the alert in production and walking the owner through the runbook in real time.** A runbook that says "Check the database connection string and restart the service" is a theory. The first time the owner follows it, they discover that the database connection string is in a config file they do not have access to, and the service restart requires a ticket to a different team. The runbook must be tested by injecting the fault and having the owner execute the remediation steps while the FDE observes.
- **Scheduling the 30/60/90-day follow-ups but conducting them as a status check rather than a system health audit.** A follow-up call where the FDE asks "How is the system doing?" and the owner says "Fine" is not a follow-up -- it is a courtesy call. The follow-up must include a quantitative audit: uptime, response accuracy, alert volume, unresolved action items, and user satisfaction. The audit data, not the owner's sentiment, determines whether the system is healthy.
- **Handing over the system with all monitoring alerts enabled but no tuning of alert thresholds for the customer's environment.** The alerts were configured for the FDE's development environment, where a 500ms latency spike is notable. In the customer's environment, a 500ms spike is normal background noise. The owner receives 50 alerts per day, ignores all of them, and misses the one alert that signals a real problem. Alert thresholds must be tuned to the customer's baseline during the first week of operation.
- **Treating the handover as complete when the SOW exit criteria are met, without a 2-week parallel-run period where the FDE and the internal owner share operational responsibility.** The owner takes over on Day 1 and encounters a problem on Day 3 that the FDE could have solved in 5 minutes. The owner spends 2 days on it, confidence erodes, and the system is abandoned. A 2-week parallel-run period where the owner is the primary operator but the FDE is available for escalation ensures the owner builds operational confidence before the FDE fully disengages.

## Related

- Same class: [./incident-postmortem.md](failure-incident-postmortem.md) — retrospective template
- Upstream: [Day 2 operations](../engineering/plan-day-two-operations.md) — "no internal owner = project death"
- Design basis: [ADR Delta-as-contract](../../tech-lead/decisions/fde/delta-as-a-contract.md) §risk #5
- Trigger trap: [Discovery skips Three Whys](gotcha-discovery-three-whys-skipped.md)
