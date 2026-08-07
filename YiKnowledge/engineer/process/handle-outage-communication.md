---
title: Handle outage communication
aliases:
- I want to handle outage communication
- outage-comms-journey
- incident-comms-journey
- outage communication entry
tags:
- journeys
- outage
- communication
- stakeholders
- postmortem
- crisis-comms
category: engineer/process
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- engineer
benefit: incident is contained
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../../oncall-sre/incident-response/respond-to-an-incident.md
- ./collaborate-across-teams.md
- ../processes/run-a-retrospective.md
- ../../knowledge-curator/people/stakeholders/README.md
review_cycle: quarterly
tacit: false
---

# I want to handle outage communication

> **As an** engineer, **I want to** handle outage communication, **so that** incident is contained.

> "Incident classification + internal notification + external announcement + customer reassurance + regulatory reporting + retrospective communication" reachable within 2 hops: stakeholders + collaboration + meetings + retrospective + incident response.

## Summary

- Stakeholders follow [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) + [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md)
- Incident response follows [incident-response-process.md](../process/incident-response.md) + [oncall-rotation-process.md](../process/oncall-rotation.md)
- Collaboration follows [async-collaboration-principles-summary.md](../process/async-collaboration-principles.md) + [raci-matrix-summary.md](../process/raci-matrix.md)
- Retrospective follows [incident-postmortem-template.md](../lessons/failure-incident-postmortem.md) + [review-meeting-template.md](../../product-manager/delivery/review-meeting.md)
- Compliance follows [data-compliance-process.md](../infrastructure/data-compliance.md) — regulatory reporting

## Core viewpoints

- **The first 15 minutes of an outage determine whether it becomes a technical incident or a trust incident.** The initial internal notification does not need to explain the root cause -- it needs to say "we know, we are on it, next update in 30 minutes." Silence during those first 15 minutes creates an information vacuum that stakeholders fill with worst-case assumptions, and the trust damage from that vacuum is harder to repair than the technical damage from the outage itself.

- **External communication cadence is more important than external communication accuracy.** Customers will forgive a status page that says "investigating -- root cause unknown" if it updates every 30 minutes. They will not forgive a status page that says "all systems operational" for 3 hours while they cannot log in. The commitment to a predictable update cadence (every 30-60 minutes) is the primary trust signal during an outage.

- **The spokesperson role is a single point of failure that must be explicitly assigned and backed up.** When multiple people communicate externally without coordination, customers receive contradictory information and the company looks disorganized. The RACI model's single Accountable spokesperson ensures message consistency, but the spokesperson must have a designated backup who is briefed and ready -- because outages have a habit of happening when the primary spokesperson is asleep.

- **Customer reassurance is a separate function from status communication and requires prepared talking points.** Telling a customer "we are investigating" is status communication. Telling a customer "here is what this means for your business, here is what you should do right now, and here is when you will hear from us next" is reassurance. The customer success team cannot invent this on the fly during an incident -- they need pre-written FAQs, escalation paths, and talking points prepared before the outage happens.

- **The retrospective communication is more important than the retrospective itself for external trust.** Customers and regulators care less about your internal 5-whys analysis than about two things: what you are doing to prevent recurrence, and when those changes will be in place. The external retrospective must be a commitment document with dates and owners, not a narrative of what went wrong.

## Key info

- **Incident classification and notification scope**: P0 (all users down, data leak, revenue loss >$10K/hour) — notify all-hands channel within 5 minutes, VP-level within 15 minutes, external status page within 30 minutes. P1 (main feature unavailable, >10% users affected) — notify engineering channel within 10 minutes, tech-lead within 15 minutes, external status page within 1 hour. P2 (secondary feature degraded, <10% users) — notify team channel within 30 minutes, external status page optional. P3 (latent risk, no user impact) — Jira ticket, no notification required. The classification determines the escalation path, not the severity of the technical fix.
- **Notification timeline (the 15-30-60 rule)**: T+15 min: first internal notification (time detected, symptoms, impacted scope, current state, who is responding, next update time). T+30 min: escalate to sponsor + legal/PR if compliance/data/PR risk exists. T+60 min: first external announcement (status page, customer group, email) — even if root cause is unknown, communicate "known symptoms + being handled + next update time." The 15-minute window is the most critical: silence beyond 15 minutes creates an information vacuum that stakeholders fill with worst-case assumptions.
- **Stakeholder communication matrix**: (1) Engineering team — technical channel, real-time, full detail; (2) Leadership/sponsor — dedicated channel or direct message, every 30 minutes, summary + business impact + ETA; (3) Customer success/support — pre-written FAQ + talking points + escalation path, updated every hour; (4) Customers — status page + email, every 30-60 minutes, non-technical summary + impact + ETA; (5) Legal/PR — direct call for P0/P1 with compliance risk, pre-approved messaging templates; (6) Regulators — within 24-72 hours per regional regulation, formal report with timeline + impact + remediation.
- **Regulatory reporting deadlines by region**: GDPR (EU) — 72 hours from discovery for personal data breaches; CCPA (California) — 72 hours for breaches affecting >500 California residents; PIPL (China) — immediate notification to Cyberspace Administration for personal information breaches; PDPA (Singapore) — 72 hours for notifiable data breaches. The Yi-family projects currently serve primarily China-market users, making PIPL the most relevant regulation. The reporting clock starts at discovery, not at resolution.
- **External retrospective communication template**: (1) What happened (one paragraph, non-technical, no blame); (2) Impact (duration, affected users, data exposure if any); (3) Root cause (one paragraph, systemic factor, not individual); (4) What we're doing to prevent recurrence (specific actions with owners and target dates); (5) When you'll hear from us next (date of follow-up communication). The external retrospective must be published within 5 business days of resolution. The Yi-family projects currently have no standardized external retrospective communication process.
- **Communication drill cadence**: Quarterly communication drills (aligned with rollback drills) ensure the first time the team executes the outage communication playbook is not during a real incident. The drill covers: (1) internal notification within 15 minutes, (2) RACI assignment, (3) first external announcement drafted, (4) customer success talking points prepared. The drill takes 60 minutes and the output is a scored assessment of communication readiness.

## Scenario

During an online incident / P0 outage / data leak / cross-region downtime / regulatory inspection, oncall + TL + PR/legal + business owner need internal notification + external announcement + customer reassurance + regulatory reporting + retrospective communication. This entry aggregates outage-communication-related 4 leaves + collaboration + meetings + retrospective into a 2-hop path, avoiding "internal info vacuum / external silence too long / angry customers / reactive regulators / retrospective turning into blame-shifting".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) |
| `people/experts/` | [external-experts-roster.md](../../knowledge-curator/people/experts/external-experts-roster.md) — external PR / legal experts |
| `work/collaboration/` | [async-collaboration-principles-summary.md](../process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../process/cross-timezone-collaboration.md) · [raci-matrix-summary.md](../process/raci-matrix.md) |
| `work/processes/` | [incident-response-process.md](../process/incident-response.md) · [oncall-rotation-process.md](../process/oncall-rotation.md) · [hotfix-release-process.md](../../oncall-sre/release/hotfix-release.md) · [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md) · [monitoring-governance-process.md](../process/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [data-compliance-process.md](../infrastructure/data-compliance.md) · [quarterly-security-audit-process.md](../quality-security/quarterly-security-audit.md) |
| `work/meetings/` | [review-meeting-template.md](../../product-manager/delivery/review-meeting.md) · [weekly-meeting-template.md](../../product-manager/delivery/weekly-meeting.md) · [retrospective-sample.md](../../product-manager/delivery/retrospective.md) |
| `lessons/failures/` | [incident-postmortem-summary.md](../lessons/failure-incident-postmortem.md) · [incident-postmortem-template.md](../lessons/failure-incident-postmortem.md) · [ai-product-launch-lessons-summary.md](../lessons/failure-ai-product-launch-lessons.md) · [bugs/](../lessons) |
| `lessons/gotchas/` | [sse-ondone-guard.md](../lessons/gotcha-sse-ondone-guard.md) · [macos-fsevents-silent-drop.md](../lessons/gotcha-macos-fsevents-silent-drop.md) · [no-lockfile-supply-chain-risk.md](../lessons/gotcha-no-lockfile-supply-chain-risk.md) |
| `methodology/thinking/` | [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — invert the communication failure · [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) · [strong-opinions-loosely-held-summary.md](../../knowledge-curator/templates/thinking/strong-opinions-loosely-held.md) |
| `product/ux/` | [cross-cultural-ux-summary.md](../../product-manager/discovery/ux/cross-cultural-ux.md) — cross-cultural announcements · [nielsen-heuristics-summary.md](../../product-manager/discovery/ux/nielsen-heuristics.md) |
| `brd/reference/` | [countries.md](./../../brd/README.md) · [regulations.md](./../../brd/README.md) — cross-border notification + regulations |
| `resources/templates/` | [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) · [one-on-one-template.md](../../knowledge-curator/templates/one-on-one.md) |
| `resources/prompts/` | [weekly-report-prompt.md](../../ai-engineer/methodology/prompts/weekly-report.md) — incident weekly report generation |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) — when the incident involves capacity |

## Action recommendations

1. **Classification**: P0 (all users down / data leak) / P1 (some users) / P2 (degraded experience) / P3 (latent risk); determines notification scope + notification level.
2. **Within 15 minutes**: post the first internal notification in the internal channel (time / symptoms / impact / current state / next-update time); do not wait until investigation finishes.
3. **Within 30 minutes**: escalate to sponsor + legal / PR (if compliance / data / PR involved).
4. **Within 1 hour**: external announcement (status page / official account / customer group / email); even if investigation is not done, send "known symptoms + being handled + next-update time".
5. **Cadence**: progress update every 30-60 minutes; do not let the external side go silent for more than 1 hour.
6. **RACI**: spokesperson (Accountable) / information collection (Responsible) / stakeholder notification (Consulted) / all-hands notification (Informed); see [raci-matrix-summary.md](../process/raci-matrix.md).
7. **Customer reassurance**: customer success / customer service team gets talking points + FAQ + escalation process; do not let customer service find answers ad-hoc.
8. **Regulatory reporting**: compliance / data leak follows [data-compliance-process.md](../infrastructure/data-compliance.md) + [quarterly-security-audit-process.md](../quality-security/quarterly-security-audit.md); report to regulators within 24-72h (by regional regulation).
9. **Cross-border**: for cross-region incidents, follow [countries.md](./../../brd/README.md) + [regulations.md](./../../brd/README.md) for each region's reporting; see [cross-cultural-ux-summary.md](../../product-manager/discovery/ux/cross-cultural-ux.md).
10. **Retrospective communication**: hold a retrospective meeting within 24h; communicate the retrospective conclusions + improvements + timeline externally; see [incident-postmortem-template.md](../lessons/failure-incident-postmortem.md).
11. **Principles**: focus on the issue not the person / no blame-shifting / no covering up / no exaggeration / no impossible promises; see [strong-opinions-loosely-held-summary.md](../../knowledge-curator/templates/thinking/strong-opinions-loosely-held.md).
12. **Second-order effects**: incidents can trigger user churn / public opinion / regulatory fines / team morale hits; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md).
13. **Archive**: archive the retrospective under [lessons/failures/bugs/](../lessons) + archive the communication log; queryable at the next audit.
14. **Drill**: quarterly [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md) + communication drill, so the first time is not in production.

## Anti-patterns

- **Silence during the first 15 minutes** — The initial internal notification does not need to explain the root cause; it needs to say "we know, we are on it, next update in 30 minutes." Silence creates an information vacuum that stakeholders fill with worst-case assumptions. The trust damage from the silence is harder to repair than the technical damage from the outage.

- **External communication before internal alignment** — Announcing an outage to customers before the internal team has a unified message creates confusion. The customer-facing team gives one answer, the engineering team gives another, and the customer receives conflicting information. Internal alignment must precede external communication.

- **Over-promising on recovery time** — "We'll be back up in 5 minutes" is a promise that, when broken, damages trust more than the outage itself. Communicate what you know ("we are investigating") and what you are doing ("rolling back to the previous version"), not what you hope ("should be back soon").

- **No retrospective communication** — An outage that is resolved but never communicated retrospectively leaves stakeholders wondering what happened and whether it will happen again. The retrospective communication (conclusions + improvements + timeline) is the closure that restores trust.

- **Blaming individuals in communication** — External or internal communication that names an individual ("X pushed a bad config") violates the blameless contract and creates a culture of fear. Focus on the system ("a configuration change caused the outage") and the fix ("we've added a validation step to prevent this").

## Related

- Same-category journey: [../../oncall-sre/incident-response/respond-to-an-incident.md](../../oncall-sre/incident-response/respond-to-an-incident.md) — incident response main entry
- Same-category journey: [./collaborate-across-teams.md](./collaborate-across-teams.md) — cross-team collaboration
- Same-category journey: [../processes/run-a-retrospective.md](./run-a-retrospective.md) — retrospective
- Same-category journey: [../../executive/strategy/handle-data-compliance.md](../../executive/strategy/handle-data-compliance.md) — compliance communication
- Upstream: [../../knowledge-curator/people/stakeholders/README.md](../../knowledge-curator/people/stakeholders/README.md) — stakeholders leaf entry
