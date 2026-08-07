---
title: Agents CLI Alpha-stage breaking changes
aliases: [agents-cli-alpha-instability, agents-cli-breaking-changes, alpha-tool-gotcha]
tags: [pitfall, agents-cli, alpha, breaking-changes, versioning, adk, google-cloud]
category: engineer/lessons
created: 2026-08-05
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
tacit: true
roles: [engineer, ai-engineer, devops]
benefit: "same mistake avoided"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified
related:
---

# Agents CLI Alpha-stage breaking changes

> **As an** engineer, **I want to** agents cli alpha instability, **so that** same mistake avoided.

> Google Agents CLI was released in Alpha on 2026-04-22; Alpha-stage breaking changes are frequent (command renames / output format changes / skill package structure changes / default behavior changes); FDE customer-production pipelines pin the version + review quarterly + upgrade via pairwise comparison. This gotcha is the basis for [ADR Two-loop eval gate](../../tech-lead/decisions/fde/two-loop-eval-as-production-gate.md) §Risk #3; see [ADK + Agents CLI](../../ai-engineer/platform/orchestrate-agents-with-adk-and-agents-cli.md) §Alpha instability.

## Summary

- **Symptom**: After Agents CLI upgrade, pipelines break; command renames / output format changes / skill package structure changes.
- **Root cause**: Alpha stage has no SemVer guarantee; breaking changes happen often.
- **Fix**: Pin the version + quarterly review + upgrade via pairwise comparison; do not chase the latest.
- **Lesson**: Any Alpha tool used in production must be version-locked + run regression on upgrade.

## Core viewpoints

- **Alpha = no SemVer guarantee** — breaking changes happen often; not pinning the version guarantees breakage.
- **Production pipelines must pin the version** — `uvx google-agents-cli@<version>`; do not let `uvx google-agents-cli` pull the latest.
- **Upgrades must run pairwise** — new vs old eval run; quantify the drift.
- **Quarterly review**: during Alpha, read release notes quarterly; assess breaking changes.
- **Fallback plan**: Alpha tools cannot meet prod expectations; fall back to hand-written gcloud + Terraform.

## Key information

### Symptom

- `uvx google-agents-cli setup` upgrades to a new Alpha → pipeline breaks; command renames (e.g. `agents-cli create` → `agents-cli scaffold`).
- Output format changes (JSON field renames / fields added or removed) → downstream parsing breaks.
- Skill package structure changes (e.g. `google-agents-cli-eval` skill name / path changes) → coding agent auto-discovery fails.
- Default behavior changes (e.g. `deploy --target` default value changes) → deployment goes to the wrong place.
- Customer incident: prod deployment to the wrong service / eval run fails / scaffold template changes.

### Root cause

- **Alpha stage has no SemVer guarantee**: Google explicitly states Alpha can introduce breaking changes; does not follow SemVer.
- **Version not pinned**: `uvx google-agents-cli` pulls latest; not `@<version>` pinned.
- **No pairwise run**: upgrades do not run pairwise (new vs old eval run) → drift not discovered.
- **Release notes not read**: quarterly review of release notes is skipped; breaking changes go unnoticed.
- **CI default chases latest**: `uvx google-agents-cli setup` in CI pulls latest on every run; version not pinned.
- **No fallback plan**: Alpha tool breaks → no hand-written gcloud + Terraform fallback.

### Impact scope

- All AI customers in FDE Practice; especially those that put Agents CLI into prod pipelines.
- ADK + Agents CLI lifecycle cadence (scaffold / eval / deploy / publish / observe).
- Coding agent's workflow for auto-discovering skills.

### Resolution

**Production pipelines must pin the version:**

| Dimension | Must do | Consequence if not |
|---|---|---|
| Version pin | `uvx google-agents-cli@<version>`; do not pull latest | Pulling latest breaks; pipeline incident |
| CI pin | CI must pin `@<version>`; do not `setup` and pull latest | CI pulls latest every run; breaks frequently |
| Pairwise upgrade | Upgrades must run pairwise (new × old eval run) | Drift not discovered; prod incident |
| Quarterly release notes review | Review release notes quarterly; assess breaking changes | Breaking changes go unnoticed; sudden breakage |
| Fallback plan | Hand-written gcloud + Terraform; do not depend on Agents CLI | Alpha tool breaks → no fallback |
| Skill package path | Coding agent workflows must not hard-code skill paths | Skill package structure changes → discovery fails |
| Output schema validation | Downstream parsing must validate schema; do not parse raw | Output format changes → parsing breaks |

**Pairwise upgrade process:**
1. CI runs the old version eval → produce baseline run.
2. Upgrade to the new version; run new eval → produce new run.
3. `agents-cli eval compare baseline.json new.json` → quantify drift.
4. Drift > threshold → do not upgrade; find root cause.
5. Drift ≤ threshold → upgrade; pin new version.

### Similar pitfalls

- `uvx google-agents-cli` without version pin → latest breaks.
- CI `setup` pulling latest → breaks every run.
- Coding agent hard-coding skill path → skill package structure change breaks.
- Downstream parsing raw JSON without schema validation → field change breaks.
- Not reading release notes → sudden breakage from breaking changes.
- No fallback → Alpha breakage with no hand-written solution.

## Action recommendations

1. **Pin the version in production pipelines**: `uvx google-agents-cli@<version>`; do not pull latest ([ADR Two-loop eval gate](../../tech-lead/decisions/fde/two-loop-eval-as-production-gate.md) §Decision #7).
2. **Pin the version in CI**: CI must pin `@<version>`; do not `setup` and pull latest.
3. **Pairwise upgrade**: upgrades must run pairwise (new × old eval run); quantify drift.
4. **Quarterly review of release notes**: assess breaking changes; FDE Practice Lead reviews quarterly.
5. **Fallback plan**: hand-written gcloud + Terraform; do not rely on Agents CLI for prod.
6. **Coding agent must not hard-code skill paths**: use workflow auto-discovery; do not hard-code.
7. **Downstream parsing must validate schema**: JSON schema validation; do not parse raw.
8. **Do not let Alpha into compliance customers' prod**: compliance customer prod must use GA tools; Alpha only for dev/test.
9. **Release notes monitoring**: Google Agents CLI GitHub releases; subscribe to notifications.
10. **Emergency rollback**: CI must be able to roll back to the previous version; ≤ 15 min recovery.

## Anti-patterns

- **Using `uvx google-agents-cli` without a version pin in production** — every run pulls the latest Alpha release, which may ship breaking command renames, output format changes, or default behavior shifts. This guarantees pipeline breakage with no rollback target.

- **Running `setup` in CI without pinning** — CI pulls the latest on every run, so a release that passes today may fail tomorrow with no code change. The build becomes non-deterministic and untrustworthy.

- **Skipping pairwise comparison on upgrade** — upgrading without running old vs. new eval side-by-side means drift is discovered only in production. Quantifying the delta before landing is the only safe path.

- **Hard-coding skill package paths in coding agent workflows** — Alpha-stage skill package structure changes without notice, so any hard-coded path breaks agent auto-discovery. Always use discovery mechanisms, never static paths.

- **Parsing raw CLI JSON output without schema validation** — output format changes (field renames, additions, removals) are common in Alpha, and downstream parsers that consume raw JSON will silently break or produce incorrect results.

## Related

- [../../ai-engineer/platform/orchestrate-agents-with-adk-and-agents-cli.md](../../ai-engineer/platform/orchestrate-agents-with-adk-and-agents-cli.md) — ADK + Agents CLI overview and Alpha instability context
- [../../tech-lead/decisions/fde/two-loop-eval-as-production-gate.md](../../tech-lead/decisions/fde/two-loop-eval-as-production-gate.md) — ADR two-loop eval gate that references this gotcha as Risk #3
- [./gotcha-air-gap-first-boot-surprise.md](./gotcha-air-gap-first-boot-surprise.md) — Another FDE customer-facing gotcha in air-gapped environments
- [./gotcha-no-lockfile-supply-chain-risk.md](./gotcha-no-lockfile-supply-chain-risk.md) — Supply chain risk gotcha with similar version-pinning lessons
- [../../tech-lead/decisions/fde/air-gap-first-for-regulated-clients.md](../../tech-lead/decisions/fde/air-gap-first-for-regulated-clients.md) — ADR for air-gap regulated clients in FDE context
