---
title: Oncall SRE
tags: [leaf, srer, incident-response, observability, release]
category: srer
created: 2026-08-06
updated: 2026-08-12
last_verified: 2026-08-12
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [srer, engineer]
benefit: "Oncall SREs find incident response, observability, and release procedures organized by problem domain"
acceptance_criteria:
  - "3 problem-domain subdirectories: incident-response, observability, release"
  - "Each subdirectory has a README with categorized file listings"
  - "Max 3 directory levels"
related:
  - ./INDEX.md
  - ../INDEX.md
  - ../engineer/SECURITY.md
  - ../engineer/ship/
---

# Oncall SRE

> **Pipeline stage 4/5: Quality + Release + 5/5: Operate + Learn** — Input chips: `Working software`, `Running services` → Output chips: `Release procedures`, `Incident response`, `Observability`, `SLO compliance`, `Postmortems`
>
> **As an** oncall SRE, **I want to** find incident response procedures, observability guides, and release management processes, **so that** I can keep systems reliable and respond to incidents effectively.
>
> Srer OPERATES production. It does not build systems (→ [engineer/](../engineer/)), make architecture decisions (→ [leader/](../leader/)), or define product requirements (→ [producter/](../producter/)).

## Quick navigation

| Resource | Description |
|---|---|
| [INDEX.md](./INDEX.md) | Srer role index — subdirectory map, file counts, key procedures |
| [incident-response/](./incident-response/) ([README](./incident-response/README.md)) | Incident procedures, postmortems, oncall handovers, drills — 17 files |
| [observability/](./observability/) ([README](./observability/README.md)) | Monitoring, alerting, infra, SLO/SLI, capacity — 13 files |
| [release/](./release/) ([README](./release/README.md)) | Release coordination, canary, hotfix, rollback, freeze — 6 files |

## Pipeline chip contract

| Chip | Type | Stage | Description | Knowledge area |
|---|---|---|---|---|
| Working software | ← Input | 4 | Implementation artifacts from engineer/ | [engineer/](../engineer/) |
| Running services | ← Input | 5 | Services running in production | [observability/](./observability/) |
| `release-procedures` | Output → | 4 | Release, rollback, canary, hotfix procedures | [release/](./release/) |
| `incident-response` | Output → | 4 | On-call handover, blameless postmortem templates | [incident-response/](./incident-response/) |
| `observability` | Output → | 4 | Monitoring, alerting, dashboards, SLO/SLI | [observability/](./observability/) |
| `slo-compliance` | Output → | 5 | SLO tracking, error budget management, availability | [observability/](./observability/) |
| `postmortems` | Output → | 5 | Root cause analysis, action items, timeline reconstruction | [incident-response/](./incident-response/) |

## Summary

- 3 sub-directories: [incident-response/](./incident-response/) (incident procedures + postmortems) / [observability/](./observability/) (monitoring + infra + SLO) / [release/](./release/) (release + rollback + hotfix)
- 2 real postmortems: [FSEvents silent drop](./incident-response/tl-postmortem-fsevents-silent-drop-2026-08.md) / [no-lockfile supply chain](./incident-response/tl-postmortem-no-lockfile-supply-chain-2026-07.md)
- 2 oncall handover examples: [W32](./incident-response/tl-oncall-handover-2026-w32.md) / [W33](./incident-response/tl-oncall-handover-2026-w33.md)
- Observability covers the triad (logging/metrics/tracing), containerization, CI/CD, reverse proxy, GPU inference, capacity/cost, and tech debt
- Release covers standard, canary, hotfix, and rollback drill workflows
- Incident response postmortems live here; postmortem **methodology** lives in [leader/risk/](../leader/risk/)

## Core viewpoints

- **SRE operates, does not build** — incident response procedures, observability dashboards, and release coordination are operational concerns; implementation patterns belong to [engineer/](../engineer/)
- **Postmortem is operational record, methodology is strategic** — actual postmortems live in [incident-response/](./incident-response/); the postmortem template and methodology live in [leader/risk/](../leader/risk/)
- **Observability is the foundation of reliability** — you can't improve what you can't measure; SLO/SLI definitions drive error budgets and release confidence
- **Release is a process, not a button** — release coordination, freeze management, and rollback drills are practiced operational procedures, not CI/CD automation (that's [engineer/](../engineer/))

## Sub-directories

### incident-response/ (17 files)

| Category | Key files |
|---|---|
| Response procedures | [respond-to-an-incident.md](./incident-response/respond-to-an-incident.md) · [handle-a-data-breach.md](./incident-response/handle-a-data-breach.md) · [handle-a-ddos-attack.md](./incident-response/handle-a-ddos-attack.md) · [handle-a-cache-invalidation.md](./incident-response/handle-a-cache-invalidation.md) · [handle-a-major-version-upgrade.md](./incident-response/handle-a-major-version-upgrade.md) |
| Drills & exercises | [run-a-war-room.md](./incident-response/run-a-war-room.md) · [run-a-game-day.md](./incident-response/run-a-game-day.md) · [run-a-chaos-engineering-experiment.md](./incident-response/run-a-chaos-engineering-experiment.md) · [do-a-rollback-drill.md](./incident-response/do-a-rollback-drill.md) · [do-a-blast-radius-analysis.md](./incident-response/do-a-blast-radius-analysis.md) |
| Oncall operations | [handle-an-oncall-shift.md](./incident-response/handle-an-oncall-shift.md) · [set-up-an-oncall-rotation.md](./incident-response/set-up-an-oncall-rotation.md) |
| Postmortems | [tl-postmortem-fsevents-silent-drop-2026-08.md](./incident-response/tl-postmortem-fsevents-silent-drop-2026-08.md) · [tl-postmortem-no-lockfile-supply-chain-2026-07.md](./incident-response/tl-postmortem-no-lockfile-supply-chain-2026-07.md) |
| Handovers | [tl-oncall-handover-2026-w32.md](./incident-response/tl-oncall-handover-2026-w32.md) · [tl-oncall-handover-2026-w33.md](./incident-response/tl-oncall-handover-2026-w33.md) |

### observability/ (13 files)

| Category | Key files |
|---|---|
| Core observability | [observability-triad.md](./observability/observability-triad.md) · [set-up-observability.md](./observability/set-up-observability.md) |
| Infrastructure | [docker-kubernetes.md](./observability/docker-kubernetes.md) · [containerized-deployment.md](./observability/containerized-deployment.md) · [reverse-proxy.md](./observability/reverse-proxy.md) · [private-vs-public-cloud.md](./observability/private-vs-public-cloud.md) · [gpu-inference.md](./observability/gpu-inference.md) |
| CI/CD | [cicd.md](./observability/cicd.md) |
| Capacity & cost | [capacity-and-cost.md](./observability/capacity-and-cost.md) · [capacity-and-cost-template.md](./observability/capacity-and-cost-template.md) |
| Tech debt | [tech-debt-inventory.md](./observability/tech-debt-inventory.md) · [tech-debt-inventory-template.md](./observability/tech-debt-inventory-template.md) |

### release/ (6 files)

| Category | Key files |
|---|---|
| Release procedures | [release.md](./release/release.md) · [canary-release.md](./release/canary-release.md) · [hotfix-release.md](./release/hotfix-release.md) |
| Release governance | [release-freeze.md](./release/release-freeze.md) |
| Rollback | [rollback-drill.md](./release/rollback-drill.md) |

## Scope

### In scope (srer OWNS)

**`release-procedures` chip:**
- Release coordination, hotfix procedures, rollback drills → [release/](./release/)
- Release freeze management → [release/](./release/)

**`incident-response` chip:**
- Incident response procedures and runbooks → [incident-response/](./incident-response/)
- On-call handover templates and schedules → [incident-response/](./incident-response/)
- War room and game day facilitation → [incident-response/](./incident-response/)

**`observability` chip:**
- Observability setup (monitoring, alerting, dashboards, SLOs) → [observability/](./observability/)
- Capacity and cost monitoring dashboards → [observability/](./observability/)

**`slo-compliance` chip:**
- SLO/SLI definition and tracking → [observability/](./observability/)
- Error budget management → [observability/](./observability/)

**`postmortems` chip:**
- Blameless postmortem writing and examples → [incident-response/](./incident-response/)
- Tech debt inventory tracking → [observability/](./observability/)

### Out of scope (delegated to other roles)
- Pre-incident risk assessment and risk register → **[leader/risk/](../leader/risk/)**
- Architecture decisions about reliability → **[leader/decisions/](../leader/decisions/)**
- Resilience implementation patterns (retry, backoff, circuit breaker) → **[engineer/ship/](../engineer/ship/)**
- CI/CD pipeline setup → **[engineer/build/](../engineer/build/)**
- Security hardening and threat modeling → **[engineer/ship/](../engineer/ship/)**
- Capacity planning and FinOps strategy → **[leader/capacity/](../leader/capacity/)**
- Deployment strategies (canary, blue-green) → **[engineer/ship/](../engineer/ship/)**

## Decision rules for boundary cases

| When content involves... | Chip | Route to | Because |
|---|---|---|---|
| What to do during an incident | `incident-response` | [srer/incident-response/](./incident-response/) | Operational procedure |
| How to prevent this class of incident | `adrs` | [leader/risk/](../leader/risk/) | Strategic risk mitigation |
| Postmortem of a specific incident | `postmortems` | [srer/incident-response/](./incident-response/) | Operational record |
| Postmortem methodology/template | `adrs` | [leader/risk/](../leader/risk/) | Methodology (shared with leader) |
| How to set up monitoring for X | `observability` | [srer/observability/](./observability/) | Operational setup |
| How to implement canary release | `release-procedures` | [engineer/ship/](../engineer/ship/) | Implementation pattern |
| Release coordination and approval | `release-procedures` | [srer/release/](./release/) | Operational process |
| SLO definition and tracking | `slo-compliance` | [srer/observability/](./observability/) | Operational tracking |
| Pre-incident risk assessment | `adrs` | [leader/risk/](../leader/risk/) | Strategic planning |
| How to implement retry logic in code | — | [engineer/ship/](../engineer/ship/) | Implementation pattern |
| Release coordination checklist | `release-procedures` | [srer/release/](./release/) | Operational procedure |
| Canary deployment implementation | — | [engineer/ship/](../engineer/ship/) | Implementation pattern |
| Cost monitoring dashboard | `observability` | [srer/observability/](./observability/) | Operational monitoring |
| Cost planning and budget | `capacity-plans` | [leader/capacity/](../leader/capacity/) | Strategic planning |

## Problem domains

| Domain | Solves | Files |
|---|---|---|
| [incident-response/](./incident-response/) | How do I respond to and manage incidents? | 17 |
| [observability/](./observability/) | How do I monitor and observe systems? | 13 |
| [release/](./release/) | How do I release and rollback safely? | 6 |

## Quick reference

| I want to... | Go to |
|---|---|
| Respond to an incident | [incident-response/respond-to-an-incident.md](./incident-response/respond-to-an-incident.md) |
| Handle a data breach | [incident-response/handle-a-data-breach.md](./incident-response/handle-a-data-breach.md) |
| Handle a DDoS attack | [incident-response/handle-a-ddos-attack.md](./incident-response/handle-a-ddos-attack.md) |
| Run a war room | [incident-response/run-a-war-room.md](./incident-response/run-a-war-room.md) |
| Run a game day | [incident-response/run-a-game-day.md](./incident-response/run-a-game-day.md) |
| Run a chaos experiment | [incident-response/run-a-chaos-engineering-experiment.md](./incident-response/run-a-chaos-engineering-experiment.md) |
| Do a blast radius analysis | [incident-response/do-a-blast-radius-analysis.md](./incident-response/do-a-blast-radius-analysis.md) |
| Handle an oncall shift | [incident-response/handle-an-oncall-shift.md](./incident-response/handle-an-oncall-shift.md) |
| Set up oncall rotation | [incident-response/set-up-an-oncall-rotation.md](./incident-response/set-up-an-oncall-rotation.md) |
| Write a postmortem | [../leader/risk/write-a-postmortem.md](../leader/risk/write-a-postmortem.md) |
| Read a real postmortem | [incident-response/tl-postmortem-fsevents-silent-drop-2026-08.md](./incident-response/tl-postmortem-fsevents-silent-drop-2026-08.md) |
| Set up observability | [observability/set-up-observability.md](./observability/set-up-observability.md) |
| Understand observability triad | [observability/observability-triad.md](./observability/observability-triad.md) |
| Monitor capacity and cost | [observability/capacity-and-cost.md](./observability/capacity-and-cost.md) |
| Manage tech debt inventory | [observability/tech-debt-inventory.md](./observability/tech-debt-inventory.md) |
| Ship a release | [release/release.md](./release/release.md) |
| Do a canary release | [release/canary-release.md](./release/canary-release.md) |
| Ship a hotfix | [release/hotfix-release.md](./release/hotfix-release.md) |
| Manage release freeze | [release/release-freeze.md](./release/release-freeze.md) |
| Do a rollback drill | [release/rollback-drill.md](./release/rollback-drill.md) |

## Cross-references

### Upstream (inputs to srer)
- [../engineer/](../engineer/) — Implementation artifacts (Working software)
- [../engineer/ship/](../engineer/ship/) — Resilience implementation patterns
- [../engineer/build/](../engineer/build/) — CI/CD pipeline setup
- [../engineer/ship/](../engineer/ship/) — Security hardening, threat modeling
- [../leader/roadmap/](../leader/roadmap/) — SLO definitions, roadmap priorities

### Peer (same pipeline stage)
- [../engineer/SECURITY.md](../engineer/SECURITY.md) — Security domain index (cross-cutting)

### Downstream (consumers of srer outputs)
- [../leader/risk/](../leader/risk/) — Postmortem methodology, risk register
- [../leader/capacity/](../leader/capacity/) — Capacity planning and FinOps strategy
- [../engineer/learn/lessons/](../engineer/learn/lessons/) — Field notes from incidents

### Same kind (role READMEs)
- [../engineer/README.md](../engineer/README.md) · [../leader/README.md](../leader/README.md) · [../producter/README.md](../producter/README.md) · [../aier/README.md](../aier/README.md) · [../executiver/README.md](../executiver/README.md)

## Pipeline flow

```
engineer/ (Stage 3: Design+Build)
    │ architecture-patterns, dev-practices, quality-security
    ▼
┌── srer/ (Stage 4: Quality+Release + 5: Operate+Learn) ──┐
│  Input:  Working software, Running services               │
│  Output: Release procedures, Incident response,           │
│          Observability, SLO compliance, Postmortems       │
└──────────────────────────────────────────────────────────┘
    │ postmortems, lessons-learned
    ▼
leader/risk/ (Postmortem methodology) + engineer/learn/lessons/ (Field notes)
```

### Key cross-stage links
- [release.md](./release/release.md) ← [engineer/ship/harden-supply-chain.md](../engineer/ship/harden-supply-chain.md) → [release/canary-release.md](./release/canary-release.md)
- [respond-to-an-incident.md](./incident-response/respond-to-an-incident.md) ← [leader/risk/write-a-postmortem.md](../leader/risk/write-a-postmortem.md) → [observability/set-up-observability.md](./observability/set-up-observability.md)
- [set-up-observability.md](./observability/set-up-observability.md) ← [leader/roadmap/define-an-slo.md](../leader/roadmap/define-an-slo.md) → [engineer/ship/retry-with-backoff.md](../engineer/ship/retry-with-backoff.md)
- [rollback-drill.md](./release/rollback-drill.md) ← [engineer/ship/migrate-data.md](../engineer/ship/migrate-data.md) — Data migrations need rollback plans
- [capacity-and-cost.md](./observability/capacity-and-cost.md) ← [leader/capacity/run-a-finops-review.md](../leader/capacity/run-a-finops-review.md) — FinOps feeds into monitoring

## Action recommendations

1. **Incident happens** → start with [respond-to-an-incident.md](./incident-response/respond-to-an-incident.md), then follow the scenario-specific procedure
2. **Post-incident** → write a postmortem using [leader/risk/write-a-postmortem.md](../leader/risk/write-a-postmortem.md); store the actual postmortem in [incident-response/](./incident-response/)
3. **New service launch** → set up observability via [set-up-observability.md](./observability/set-up-observability.md), define SLOs via [leader/roadmap/define-an-slo.md](../leader/roadmap/define-an-slo.md), run capacity assessment via [capacity-and-cost.md](./observability/capacity-and-cost.md)
4. **Release day** → follow [release.md](./release/release.md); if hotfix needed, use [hotfix-release.md](./release/hotfix-release.md); if rollback needed, use [rollback-drill.md](./release/rollback-drill.md)
5. **Oncall handover** → use [tl-oncall-handover-2026-w33.md](./incident-response/tl-oncall-handover-2026-w33.md) as template; update weekly
6. **Quarterly** → review tech debt via [tech-debt-inventory.md](./observability/tech-debt-inventory.md), run a game day via [run-a-game-day.md](./incident-response/run-a-game-day.md)

## Anti-patterns

- **Writing postmortems without methodology** — consequence: inconsistent format, missing root cause analysis; always use the [postmortem template](../leader/risk/write-a-postmortem.md) from leader/risk/
- **Skipping rollback drills** — consequence: first rollback attempt is during a real incident; run [rollback-drill.md](./release/rollback-drill.md) quarterly
- **Alerting without SLOs** — consequence: alert fatigue, no prioritization; define SLOs first via [leader/roadmap/define-an-slo.md](../leader/roadmap/define-an-slo.md), then configure alerts
- **Observability as afterthought** — consequence: blind spots in production; set up observability as part of launch checklist, not post-launch
- **Oncall without handover** — consequence: context loss between shifts; always complete the handover doc before rotation ends
- **Confusing operational monitoring with strategic planning** — consequence: cost dashboards (srer) vs. cost budgets (leader) get mixed; use the [decision rules](#decision-rules-for-boundary-cases) table