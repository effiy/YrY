---
title: CI/CD Pipeline Design
aliases: [cicd, ci-cd, continuous-integration, continuous-deployment, pipeline]
tags: [sre, observability, cicd, deployment, automation]
category: srer/observability
created: 2026-08-24
updated: 2026-08-24
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [srer, engineer]
benefit: "Teams design CI/CD pipelines that catch issues early, deploy safely, and provide fast feedback"
acceptance_criteria:
  - "covers CI, CD, and the difference between continuous delivery and deployment"
  - "includes pipeline stage design with YrY examples"
  - "defines pipeline health metrics"
related:
  - ./README.md
  - ./set-up-observability.md
  - ../release/release-procedure.md
  - ../release/canary-release.md
---

# CI/CD Pipeline Design

> **When to use:** When setting up or improving the deployment pipeline for any YrY project. A good CI/CD pipeline catches issues before they reach production.

## CI vs. CD

| Term | What it means | YiVad example |
|---|---|---|
| **CI** (Continuous Integration) | Every push triggers build + test | `npm run typecheck && npm run build && npm test` |
| **CD** (Continuous Delivery) | Every merge to main is deployable | Main branch is always in a releasable state |
| **CD** (Continuous Deployment) | Every merge to main is deployed automatically | Merge → deploy to production (no manual gate) |

**YrY recommendation:** Continuous Delivery (not Deployment). Main is always deployable, but deployment is a manual trigger.

## Pipeline Stages

```
Push → Lint → Typecheck → Test → Build → Staging Deploy → Smoke Test → Production Deploy
  │       │         │        │       │           │              │              │
  │       │         │        │       │           │              │              │
  └─ Fast feedback (< 2 min) ─┘       └─ Slower, thorough (< 10 min) ─┘
```

### Stage 1: Lint (30s)

Fast, mechanical checks that catch syntax errors and style violations.

**YiVad:** `npx biome check --max-diagnostics=0`
**YiAi:** `ruff check src/`
**YiPet:** `npx biome check --max-diagnostics=0`

### Stage 2: Typecheck (1-2 min)

Catches type errors that linting misses.

**YiVad:** `vue-tsc --noEmit`
**YiPet:** `tsc --noEmit`
**YiAi:** (Python — type hints checked by IDE/mypy if configured)

### Stage 3: Test (2-5 min)

Unit tests + integration tests. Fail fast — run unit tests first.

**YiVad:** `vitest run`
**YiAi:** `python -m pytest tests/ -v`
**YiPet:** `vitest run`

### Stage 4: Build (1-3 min)

Production build. Catches build-time errors (import resolution, bundling).

**YiVad:** `pnpm build`
**YiPet:** `npm run build`

### Stage 5: Staging Deploy (1-2 min)

Deploy to a staging environment that mirrors production.

### Stage 6: Smoke Test (1-2 min)

Quick check that the deployment is alive and core flows work.

- Health check endpoint returns 200
- Can log in
- Can perform a basic action (create a document, view a page)

### Stage 7: Production Deploy (manual trigger)

Deploy to production with canary → gradual rollout.

## Pipeline Health Metrics

| Metric | Healthy | Warning | Critical |
|---|---|---|---|
| **Pipeline duration** | < 10 min | 10-20 min | > 20 min |
| **Pipeline success rate** | > 95% | 85-95% | < 85% |
| **Mean time to recovery** | < 5 min | 5-15 min | > 15 min |
| **Flaky test rate** | < 1% | 1-5% | > 5% |

## YrY Pipeline Status

| Project | CI | CD | Status |
|---|---|---|---|
| YiVad | `vue-tsc --noEmit` + `vite build` | Manual deploy | Functional |
| YiAi | `pytest` + `ruff` | Manual (uvicorn restart) | Functional |
| YiPet | `tsc --noEmit` + `npm run build` + `vitest` | Manual (Chrome load unpacked) | Functional |

### Quick Wins

1. **Add a pre-push hook** — run lint + typecheck before push (30 min)
2. **Add smoke tests** — health check + basic CRUD after each deploy (1 hour)
3. **Add pipeline duration tracking** — measure and alert on pipeline slowdowns (1 hour)
4. **Add flaky test detection** — track test failure patterns; auto-quarantine flaky tests (2 hours)

## Anti-patterns

| Anti-pattern | Why it fails | What to do instead |
|---|---|---|
| Pipeline > 20 minutes | Developers context-switch; pipeline is ignored | Split into fast (< 5 min) + slow (parallel, < 10 min) stages |
| Skipping CI on "small changes" | Small changes cause big outages | Every change goes through CI; no exceptions |
| No smoke tests after deploy | Deploy succeeds but the app is broken | Smoke test after every deploy; rollback on failure |
| Flaky tests in CI | Team stops trusting CI; real failures are ignored | Quarantine flaky tests immediately; fix within 1 sprint |