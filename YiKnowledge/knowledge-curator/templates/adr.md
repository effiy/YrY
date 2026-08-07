---
title: Architecture Decision Record template (ADR)
lifecycle: active
tags:
- template
- ADR
- architecturedecision
- architecture
- retrospective
category: knowledge-curator/templates
created: 2026-07-30
updated: 2026-07-30
last_verified: 2026-08-07
source: internal
type: template
status: stable
roles:
- knowledge-curator
- engineer
- product-manager
- tech-lead
- ai-engineer
- new-hire
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

# Architecture Decision Record template (ADR)

> **As a** knowledge curator, **I want to** adr, **so that** template reusable.

> Usage method: create a new ADR for every irreversible or cross-team architecture decision. Numbering increments, state machine: Proposed → Accepted → Deprecated / Superseded. Copy to `resources/templates/adr-{number}-{short-description}.md`, e.g. `adr-007-use-rsbuild.md`. Companion qb-row "Architecture decision records" one-click prompt: list key changes, risks, and rollback plans from recent ADRs.

## 1. Basic info

| Field | Content |
|------|------|
| ADR number | (example: ADR-007) |
| Title | (example: YiVad migrates from Vite to Rsbuild) |
| State | Proposed / Accepted / Deprecated / Superseded |
| Date | (example: 2026-07-28) |
| Decision maker | (example: architecture group + frontend lead) |
| Reviewer | (example: CTO, ops, QA) |
| Related project | (example: YiVad) |
| Related PR/Issue | (example: #1234) |
| Supersedes | (example: ADR-003) |
| Superseded by | (example: —) |

## 2. Background (Context)

State the facts, constraints, and pain points that triggered this decision. Include but not limited to:
- Current state: __ (e.g. Vite 8 upgrade caused multiple HMR failures)
- Pain point quantification: __ (e.g. dev server startup 90s, HMR failure rate 12%)
- Trigger event: __ (e.g. a release blocked by a Vite plugin)
- External constraint: __ (e.g. Node 22 upgrade, RSBUILD_ENV_* prefix requirement)

## 3. Decision

One-sentence conclusion: __ "We choose X, not Y / Z".

List the key changes of this decision (landing checklist):

| No. | Change | Impact scope | Launch strategy |
|---|---|---|---|
| 1 | Switch bundler to Rsbuild 1 | All frontend | One-shot switch |
| 2 | Env prefix VITE_ → RSBUILD_ENV_* | All env references | Gradual replacement |
| 3 | svg-sprite + views-glob custom plugin | Resources and routes | New addition |

## 4. Alternatives Considered

| Alternative | Description | Pros | Cons | Conclusion |
|---|---|---|---|---|
| A. Rsbuild | Rspack-based, Vite-compatible | Fast startup, simple config | Smaller ecosystem | ✅ Selected |
| B. Webpack 5 | Mainstream and stable | Mature ecosystem | Heavy config | ❌ |
| C. Stay on Vite | Status quo | No change | HMR failures persist | ❌ |

## 5. Evaluation dimensions

| Dimension | A. Rsbuild | B. Webpack | C. Stay on Vite |
|---|---|---|---|
| Build performance | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Config complexity | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| Ecosystem maturity | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Learning cost | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Long-term direction | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |

## 6. Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Plugin ecosystem insufficient | Medium | Medium | Self-write svg-sprite + views-glob |
| Env migration omissions | High | Low | Lint rule to check VITE_ prefix |
| HMR behavior differences | Medium | Medium | Keep watchfiles fallback |

## 7. Rollback Plan

| Trigger condition | Rollback action | Owner | Estimated recovery time |
|---|---|---|---|
| Build output size > 15% larger | Switch back to Vite branch | Frontend lead | 30 min |
| Dev server startup still > 60s | Keep Vite dev branch | Frontend lead | 1 h |
| Key dependency missing | Temporary Vite fallback | Architecture group | 2 h |

> Rollback operations must be executable within one hour, without redeploying the backend.

## 8. Implementation plan

| Phase | Content | Completion date | Owner |
|---|---|---|---|
| Phase 1 | PoC: dev/build passes | 2026-07-15 | Frontend team |
| Phase 2 | Full migration + lint rules | 2026-07-28 | Frontend team |
| Phase 3 | Monitor one-week stability | 2026-08-04 | Ops |

## 9. Follow-up tracking metrics

| Metric | Pre-launch | Goal | Actual |
|---|---|---|---|
| Dev startup time | 90s | < 30s | — |
| HMR failure rate | 12% | < 3% | — |
| Build output size | 4.2 MB | ≤ 4.5 MB | — |

## 10. References

- [Vite → Rsbuild migration memory]({link})
- [Rsbuild documentation](https://rsbuild.dev)
