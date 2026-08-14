---
title: Incident Response
tags: [leaf, incident-response, oncall, postmortem, war-room]
category: srer/incident-response
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: monthly
roles: [srer, engineer, leader]
benefit: "Oncall engineers find incident procedures, postmortems, and handover templates in one place"
acceptance_criteria:
  - "Incident response procedures categorized by scenario"
  - "Postmortem examples and templates included"
  - "Oncall handover templates present"
related:
  - ../INDEX.md
  - ../../INDEX.md
  - ../../engineer/SECURITY.md
  - ../../leader/risk/
---

# Incident Response

> **As an** oncall SRE, **I want to** find incident response procedures, postmortem templates, and handover docs, **so that** I can respond to incidents quickly and learn from past failures.

## Response procedures

| Scenario | File | Type |
|---|---|---|
| General incident | [respond-to-an-incident.md](./respond-to-an-incident.md) | procedure |
| Data breach | [handle-a-data-breach.md](./handle-a-data-breach.md) | procedure |
| DDoS attack | [handle-a-ddos-attack.md](./handle-a-ddos-attack.md) | procedure |
| Cache invalidation | [handle-a-cache-invalidation.md](./handle-a-cache-invalidation.md) | procedure |
| Cost overrun | [handle-a-cost-overrun.md](./handle-a-cost-overrun.md) | procedure |
| Customer escalation | [handle-a-customer-escalation.md](./handle-a-customer-escalation.md) | procedure |
| Major version upgrade | [handle-a-major-version-upgrade.md](./handle-a-major-version-upgrade.md) | procedure |
| Pull request incident | [handle-a-pull-request.md](./handle-a-pull-request.md) | procedure |
| Team conflict | [handle-a-team-conflict.md](./handle-a-team-conflict.md) | procedure |
| Reorg | [handle-a-reorg.md](./handle-a-reorg.md) | procedure |

## Drills & exercises

| Exercise | File |
|---|---|
| War room | [run-a-war-room.md](./run-a-war-room.md) |
| Game day | [run-a-game-day.md](./run-a-game-day.md) |
| Chaos engineering | [run-a-chaos-engineering-experiment.md](./run-a-chaos-engineering-experiment.md) |
| Rollback drill | [do-a-rollback-drill.md](./do-a-rollback-drill.md) |
| Blast radius analysis | [do-a-blast-radius-analysis.md](./do-a-blast-radius-analysis.md) |
| Security audit | [do-a-security-audit.md](./do-a-security-audit.md) |
| FinOps review | [run-a-finops-review.md](./run-a-finops-review.md) |

## Oncall operations

| Task | File |
|---|---|
| Oncall shift | [handle-an-oncall-shift.md](./handle-an-oncall-shift.md) |
| Set up rotation | [set-up-an-oncall-rotation.md](./set-up-an-oncall-rotation.md) |
| Dashboard trends | [dashboard-incident-trends.md](./dashboard-incident-trends.md) |

## Postmortems & handovers

| Document | File |
|---|---|
| FSEvents silent drop (2026-08) | [tl-postmortem-fsevents-silent-drop-2026-08.md](./tl-postmortem-fsevents-silent-drop-2026-08.md) |
| No lockfile supply chain (2026-07) | [tl-postmortem-no-lockfile-supply-chain-2026-07.md](./tl-postmortem-no-lockfile-supply-chain-2026-07.md) |
| Oncall handover W32 | [tl-oncall-handover-2026-w32.md](./tl-oncall-handover-2026-w32.md) |
| Oncall handover W33 | [tl-oncall-handover-2026-w33.md](./tl-oncall-handover-2026-w33.md) |

## Cross-references

- [../../leader/risk/](../../leader/risk/) — Risk register and postmortem methodology
- [../../engineer/ship/](../../engineer/ship/) — Resilience patterns, health checks, capacity planning
- [../../srer/release/](../../srer/release/) — Release, canary, rollback, hotfix
- [../../engineer/SECURITY.md](../../engineer/SECURITY.md) — Security domain index