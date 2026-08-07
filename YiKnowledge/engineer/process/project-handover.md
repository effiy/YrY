---
aliases:
- Project Handover Process
title: Cross-team handover process (project handoff)
tags:
- process
- project handover
- handoff
- cross-team
- SOP
category: engineer/process
created: 2026-07-30
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: process
status: stable
lifecycle: active
review_cycle: yearly
roles:
- engineer
benefit: process followed predictably
acceptance_criteria:
  - "steps are ordered and each has a clear owner or role"
  - "prerequisites and inputs are listed before the first step"
  - "outcome is measurable or verifiable"
related:
- ./knowledge-transfer.md
- ../../oncall-sre/release/release.md
- ./incident-response.md
tacit: false
---

# Cross-team handover process (project handoff)

> **As an** engineer, **I want to** project handover, **so that** process followed predictably.

## 1. Purpose and scope

Standardize the actions when a project is handed from one party to another; ensure knowledge, responsibility, documentation, permissions, and pending items are not lost; avoid the post-handover vacuum and disputes over responsibility.

Applies to: project ownership transfer (A team → B team), personnel changes (owner change), outsourcing to in-house, in-house to SaaS.

Does not apply to: temporary support (no ownership transfer).

## 2. Roles and responsibilities

| Role | Responsibility |
|---|---|
| Outgoing owner (R) | Prepare handover materials; execute the handover |
| Incoming owner (R) | Receive and confirm; owns it going forward |
| Both tech leads (A) | Audit technical state and open issues |
| Both iteration PMs (C) | Coordinate timing and communications |
| Business stakeholders (I) | Confirm business continuity |

## 3. Step breakdown

```
Trigger → Handover prep → Handover meeting → Acceptance verification → Permission transfer → Formal switchover → Post-handover support
```

| Step | Key actions | Exit criteria |
|---|---|---|
| 1. Trigger | Determine handover cause and timing; PMs on both sides align | Handover plan sent out |
| 2. Handover prep | Outgoing side organizes documentation, todos, open issues, dependencies, contacts, permission inventory | Handover package complete |
| 3. Handover meeting | Outgoing side walks through; incoming side asks questions; actions recorded | Meeting minutes sent out |
| 4. Acceptance verification | Incoming side operates independently per documentation; verify the process works | Verification passed |
| 5. Permission transfer | Transfer permissions for resources, repos, monitoring, alerts, secrets; revoke old permissions | Permission inventory updated |
| 6. Formal switchover | Business stakeholders notified; after switchover, outgoing side enters support period | Switchover complete |
| 7. Post-handover support | Outgoing side agrees on support period (recommend 2-4 weeks); handles open issues | Support period ends |

## 4. Handover package checklist

- [ ] Project README and architecture documentation
- [ ] Technical design and interface contracts
- [ ] Dependencies and related-party contacts
- [ ] Production resource inventory (apps / databases / cache / queues / storage)
- [ ] Permission inventory (repos / monitoring / alerts / secrets / cloud resources)
- [ ] Pending items and known issues (including tech debt)
- [ ] Key processes and ops SOPs
- [ ] Monitoring dashboards and alert thresholds
- [ ] Backup and rollback plans
- [ ] Historical incident retrospectives

## 5. Measurement metrics

- Handover cadence (trigger to switchover)
- Number of incidents within 30 days post-handover
- Incoming side's time to independent operation
- Open-issue resolution rate during the support period

## 6. Exception handling and escalation path

| Scenario | Handling |
|---|---|
| Outgoing side delays | PMs on both sides escalate; up the chain if needed |
| Handover package incomplete | Pause switchover; resume after completion |
| Incoming side verification fails | Pause switchover; outgoing side fixes and re-verifies |
| Business continuity risk | Business stakeholders intervene; extend support period if needed |
| Permission revocation missed | Security notification; clean up immediately |
| Post-handover incident responsibility | Outgoing side primary during support period; incoming side primary after |

## 7. Notes

- **Handover is not "toss it over"** — must verify the incoming side can operate independently
- Permission transfer must be "add first, remove later" — avoid the vacuum
- Support period must have a defined duration; do not drag indefinitely
- Notify business stakeholders early; avoid them being uninformed
- Coordinate with [knowledge-transfer-process](./knowledge-transfer.md): this doc focuses on ownership transfer; knowledge retention focuses on experience handoff
- Archive the handover record under `projects/<project>/handover.md`
