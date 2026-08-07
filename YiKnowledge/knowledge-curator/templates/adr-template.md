---
title: Architecture Decision Record Template (ADR)
lifecycle: active
tags:
- Template
- ADR
- ArchitectureDecision
- Architecture
- Retrospective
category: knowledge-curator/templates
created: 2026-07-30
updated: 2026-07-30
last_verified: 2026-08-07
source: internal
type: template
status: stable
roles:
- knowledge-curator
benefit: template reusable
acceptance_criteria:
  - "all placeholders are annotated with expected content type"
  - "field descriptions include required-vs-optional and format constraints"
  - "usage guidance explains when to use this template and common mistakes"
review_cycle: quarterly
tacit: false
related:
  - ./INDEX-resources.md
  - ./README-resources.md
  - ./README-templates.md
  - ../README.md
  - ../INDEX.md
---

# Architecture Decision Record Template (ADR)

> **As a** knowledge curator, **I want to** adr template, **so that** template reusable.

> Usage: every irreversible or many-team-impacting architecture decision gets a new ADR. Number increments; state machine: Proposed → Accepted → Deprecated / Superseded. Copy to `resources/templates/adr-{number}-{short-description}.md`, like `adr-007-use-rsbuild.md`. Paired with the qb-row "Architecture decision records" one-key prompt: list key changes, risks, and rollback plans from recent ADRs.

## 1. Basic information

| field | content |
|------|------|
| ADR number |  (example: ADR-007)  |
| title |  (example: YiVad migrates from Vite to Rsbuild)  |
| state | Proposed / Accepted / Deprecated / Superseded |
| date |  (example: 2026-07-28)  |
| Decision maker |  (example: Architecture team + frontend lead)  |
| Reviewer |  (example: CTO, ops, QA)  |
| Related project |  (example: YiVad)  |
| Related PR/Issue |  (example: #1234)  |
| Supersedes |  (example: ADR-003)  |
| Superseded by |  (example: —)  |

## 2. Background (Context)

State the facts, constraints, and pain points that triggered this decision, including but not limited to:
- Current state: __ (e.g., Vite 8 escalated multiple HMR failures)
- Quantified pain: __ (e.g., dev server startup 90s, HMR failure rate 12%)
- Trigger event: __ (e.g., a release blocked by a Vite plugin)
- External constraint: __ (e.g., Node 22 upgrade, RSBUILD_ENV_* prefix required)

## 3. Decision

One-sentence conclusion: __"We choose X, not Y / Z".

List the key changes of this decision (landing checklist):

| No. | Change | Impact scope | Rollout strategy |
|---|---|---|---|
| 1 | Switch bundler to Rsbuild 1 | all frontend | one-shot cutover |
| 2 | env prefix VITE_ → RSBUILD_ENV_* | all env references | progressive replacement |
| 3 | svg-sprite + views-glob custom plugins | resources and routing | new addition |

## 4. Options Considered

| Option | description | advantage | disadvantage | conclusion |
|---|---|---|---|---|
| A. Rsbuild | Rspack-based, Vite-compatible | fast startup, simple config | small ecosystem | ✅ chosen |
| B. Webpack 5 | mainstream, stable | mature ecosystem | verbose config | ❌ |
| C. Stay on Vite | status quo | no change | persistent HMR failures | ❌ |

## 5. Assessment dimensions

| dimension | A. Rsbuild | B. Webpack | C. Stay on Vite |
|---|---|---|---|
| build performance | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| config complexity | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| ecosystem maturity | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| learning cost | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| long-term direction | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |

## 6. Risks

| risk | probability | impact | Mitigation |
|---|---|---|---|
| Plugin ecosystem insufficient | medium | medium | self-write svg-sprite + views-glob |
| env migration missed | high | low | lint rules checking VITE_ prefix |
| HMR inconsistency | medium | medium | retain watchfiles fallback |

## 7. Rollback plan

| Trigger condition | Rollback action | Responsible | Estimated recovery time |
|---|---|---|---|
| Build output size grows > 15% | Cut back to Vite branch | Frontend lead | 30 min |
| dev server startup still > 60s | Retain Vite dev branch | Frontend lead | 1 h |
| Key dependency missing | Temporary Vite fallback | Architecture team | 2 h |

> Rollback actions must be executable within one hour, with no backend redeploy required.

## 8. Implementation plan

| stage | content | completion date | responsible |
|---|---|---|---|
| Phase 1 | PoC: dev/build runs through | 2026-07-15 | Frontend team |
| Phase 2 | Full migration + lint rules | 2026-07-28 | Frontend team |
| Phase 3 | Monitoring one week stability | 2026-08-04 | ops |

## 9. Follow-up tracking metrics

| metric | Before launch | Target | Actual |
|---|---|---|---|
| dev startup time | 90s | < 30s | — |
| HMR failure rate | 12% | < 3% | — |
| build output size | 4.2 MB | ≤ 4.5 MB | — |

## 10. References

- [Vite → Rsbuild migration memo]({link})
- [Rsbuild docs](https://rsbuild.dev)
