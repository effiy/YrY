---
title: Observability Directory
tags: [leaf, observability, monitoring, infra, sre]
category: srer/observability
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: quarterly
roles: [srer, leader]
benefit: "SREs find observability patterns, monitoring setup, and infrastructure guides in one place"
acceptance_criteria:
  - "scope of the leaf directory is clearly bounded"
  - "file inventory table is complete with one-liner descriptions"
  - cross-references to related leaves and parent INDEX are present
related:
  - ../../engineer/run/check-engineering-gotchas.md
  - ../../aier/platform/README.md
  - ../../README.md
---

# Observability Directory

> **As an** oncall SRE, **I want to** find observability patterns, monitoring setup guides, and infrastructure documentation, **so that** I can keep systems observable and reliable.

Covers infrastructure, ops, deployment, tech debt, capacity and cost related summaries.

## Included scope

- Tech debt inventory (Fowler four quadrants + interest assessment)
- Capacity and cost (FinOps)
- Containerization and orchestration (Docker / Kubernetes)
- CI/CD (GitHub Actions / GitLab CI)
- Observability triad (Logging / Metrics / Tracing)
- Reverse proxy (Nginx / Caddy)
- GPU inference service deployment

## File type and naming

- `*-summary.md`: summary of a topic
- `*-template.md`: reusable template
- Naming uses English kebab-case

## Frontmatter Template

```yaml
---
title: An infrastructure topic
tags: [infrastructure, topic]
created: YYYY-MM-DD
updated: YYYY-MM-DD
last_verified: 2026-08-07
source: internal
type: summary
lifecycle: active
review_cycle: quarterly
related:
  - ./capacity-and-cost-template.md
  - ./capacity-and-cost.md
  - ./dashboard-business-continuity.md
  - ../README.md
  - ../INDEX.md
---
```

## Recommended writing structure

1. Background and question definition
2. Core concepts
3. Mainstream solution comparison
4. Deployment and ops key points
5. Anti-patterns and pitfalls
6. This team's implementation status

## Already included

- `tech-debt-inventory-template.md` — tech debt inventory template (by domain category + interest assessment + quarterly payoff priority)
- `tech-debt-inventory-summary.md` — tech debt inventory summary (Fowler four quadrants + interest assessment)
- `capacity-and-cost-template.md` — capacity and cost template (FinOps, includes resource utilization / scale-up threshold / per-request cost / quarterly optimization items)
- `capacity-and-cost-summary.md` — capacity and cost summary (FinOps methodology)
- `docker-kubernetes.md` — Docker and Kubernetes observability
- `cicd.md` — CI/CD pipeline design and observability
- `observability-triad.md` — Logs, metrics, traces — the three pillars
- `reverse-proxy.md` — Reverse proxy patterns
- `containerized-deployment.md` — Containerized deployment strategies
- `gpu-inference.md` — GPU inference deployment
- `private-vs-public-cloud.md` — Private vs public cloud deployment

## Related leaf

- [../../aier/platform](../../aier/platform) — AI Platform
- [../../aier/data](../../aier/data) — data
- [../../engineer/processes](../../engineer/run/README.md) — ops process
- [../../engineer/ship/capacity-planning.md](../../engineer/ship/capacity-planning.md) — capacity assessment
- [../../engineer/ship/quarterly-tech-debt.md](../../engineer/ship/quarterly-tech-debt.md) — quarterly tech debt
- [../../engineer/run/check-engineering-gotchas.md](../../engineer/run/check-engineering-gotchas.md) — scenario entry
