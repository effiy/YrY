---
title: Incident Retrospective Template (Blameless Postmortem)
aliases:
- incident-postmortem-template
- blameless-postmortem-template
tags:
- Template
- incidentRetrospective
- Postmortem
- blameless
- SRE
category: engineer/lessons
created: 2026-07-30
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: template
status: stable
lifecycle: reference
review_cycle: yearly
roles:
- engineer
- tech-lead
- oncall-sre
benefit: failure does not repeat
acceptance_criteria:
  - "all placeholders are annotated with expected content type"
  - "field descriptions include required-vs-optional and format constraints"
  - "usage guidance explains when to use this template and common mistakes"
related:
- ./incident-postmortem.md
- ../../processes/incident-response.md
tacit: false
---

# Incident Retrospective Template (Blameless Postmortem)

> **As an** engineer, **I want to** incident postmortem, **so that** failure does not repeat.

> For any P0/P1/P2 incident, hold a retrospective within 5 working days, and fill in this template by the blameless principle. Copy to `lessons/failures/{date}-{incident-name}-postmortem.md`.

## Summary

- Ten-section retrospective table single-page: basic info → impact scope → timeline → root-cause chain → measures → action items → lessons learned → monitoring regression → communication and archive → retrospective metadata.
- Root-cause analysis uses 5-Why layer-by-layer tracing; forbidden to stop at "personal error".
- Action items must have responsible person + due date + acceptance method + status; tracked in a task system.

## Core viewpoints

- **Blameless is the template bottom line** — "whether blameless" is a required field in retrospective metadata; if "no", re-open the retrospective.
- **Root-cause chain must 5-Why to the bottom** — stopping at "personal error" equals no retrospective.
- **Action items must be acceptable** — the "acceptance method" column is mandatory; otherwise improvement cannot be falsified.

## Key information

### 1. Basic info

| field | content |
|------|------|
| incident id | (example: INC-2026-0142) |
| incident name | (example: AI large-scale timeout) |
| severity | P0 / P1 / P2 |
| impact scope | (example: 6 countries, 12k users, 4h unresponsive) |
| duration | trigger __ → recovery __, total __ |
| detection method | alert / user feedback / upstream error report |
| incident time | (example: 2026-07-29 14:30 ~ 18:30) |
| retrospective date | (example: 2026-07-30) |
| retrospective facilitator | (example: SRE Zhang San) |
| participants | backend, model team, ops, customer service |
| incident owner | (example: model team Li Si) |
| status | Open / Action Items Pending / Closed |

### 2. Impact scope (Impact Scope)

| dimension | data |
|---|---|
| affected users | 12k |
| affected countries | 6 |
| estimated business loss | ¥__ |
| data integrity | whether there is data loss / contamination |
| SLA breach | yes / no |
| media / customer complaints | yes / no |
| related incidents | (example: same source as INC-2026-0138) |

### 3. Incident timeline

| time | event | operator | source |
|---|---|---|---|
| 14:30 | alert triggered | SRE | Monitoring |
| 14:35 | confirmed P1 | oncall | manual |
| 14:40 | emergency group pulled | SRE | IM |
| 15:00 | temporary rate limit | model team | config change |
| 16:20 | root cause located | backend | log |
| 17:50 | fix deployed | backend | CI |
| 18:30 | full recovery | SRE | Monitoring |

### 4. Root-cause chain (Root Cause Chain)

Use 5-Why layer-by-layer tracing; forbidden to stop at "personal error".

| Why layer | phenomenon | direct cause |
|---|---|---|
| Why 1 | model timeout | compute squeezed |
| Why 2 | compute squeeze | no quota mechanism |
| Why 3 | no quota mechanism | many teams share 1 card |
| Why 4 | sharing 1 card | cost control |
| Why 5 | cost control one-size-fits-all | no model SLA |

**Root-cause category** (multi-select):
- [x] Process missing (quota / SLA)
- [ ] code defect
- [ ] config error
- [ ] capacity insufficient
- [ ] monitoring missing
- [ ] third-party dependency
- [ ] personal operation

### 5. Temporary and root measures

| type | measure | responsible person | completion date | status |
|---|---|---|---|---|
| temporary | rate limit | model team | 2026-07-29 | done |
| root | compute quota mechanism | model team | 2026-08-15 | pending |
| root | model SLA escalation | model team + product | 2026-08-30 | pending |
| root | alert threshold tuning | SRE | 2026-08-05 | pending |

### 6. Action items

| id | action item | type | responsible person | due date | acceptance method | status |
|---|---|---|---|---|---|---|
| 1 | increase GPU quota SLA | Process | model team | 2026-08-15 | docs launch | pending |
| 2 | alert threshold tuning | Monitoring | SRE | 2026-08-05 | alert validation | pending |
| 3 | capacity drill rehearsal | drill | ops | 2026-09-01 | drill report | pending |
| 4 | add runbook | docs | backend | 2026-08-10 | runbook review | pending |

### 7. Lessons learned

- done well: oncall pulled the group in 5 minutes; temporary rate limit stopped bleeding fast.
- to improve: compute has no quota mechanism; model team squeezed by many teams; alert threshold too high caused slow detection.
- reusable: temporary rate limit + quota rehearsal template (codified into runbook).

### 8. Monitoring metric regression

| metric | before incident | during incident | current | target |
|---|---|---|---|---|
| P95 latency | 1.2s | 30s | 1.5s | < 1.5s |
| error rate | 0.1% | 35% | 0.2% | < 0.5% |
| alert detection time | — | 5min | — | ≤ 3min |

### 9. Communication and archive

- Communication audience: business side, customer success, management
- Communication date: __
- Archive path: `lessons/failures/{file}`
- Related ADR / TD: __

### 10. Retrospective metadata

- Duration: __ minutes
- Whether blameless: yes / no
- Follow-up action item completion rate: __%

## Action recommendations

1. Copy this template to `lessons/failures/{date}-{incident-name}-postmortem.md`; fill in basic info and impact scope first.
2. Timeline must follow "time / event / operator / source" four columns; do not miss timestamps.
3. Root-cause chain must run 5-Why to the bottom; multi-select root-cause categories with checkmarks; do not only check "personal operation".
4. Temporary and root measures use two tables; root measures must have responsible person + completion date.
5. Action items enter the task system (JIRA / Linear); weekly follow up on incomplete items.
6. Retrospective metadata must include "whether blameless"; if "no", re-open the retrospective.

## Anti-patterns

- **Root cause stops at "personal operation"** — equals no retrospective; must 5-Why to the system layer.
- **Action items without acceptance method** — improvement cannot be falsified; half a year later status still "pending".
- **Retrospective over 90 minutes** — fatigue lowers speaking quality; split complex incidents into multiple retrospectives.
- **Not publicly archived** — only if the whole company can view it can other teams learn.

## Related

- same category: [incident-postmortem-summary.md](failure-incident-postmortem.md) — retrospective document and process summary
- upstream: [../../processes/incident-response.md](../process/incident-response.md) — incident response process
- reference: Google SRE Book — *Postmortem Culture*
