---
title: Gotchas
aliases: [gotchas-leaf-readme, gotchas-readme]
tags: [leaf, lessons, gotchas]
category: engineer/lessons
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: monthly
roles: [engineer, srer]
benefit: "Engineers can understand and apply gotchas with clear frameworks, actionable recommendations, and anti-pattern awareness"
acceptance_criteria:
  - "scope of the leaf directory is clearly bounded"
  - "file inventory table is complete with one-liner descriptions"
  - cross-references to related leaves and parent INDEX are present
related:
---

# Gotchas

> **As a** engineer, **I want to** understand and apply gotchas, **so that** the team learns from past mistakes and avoids repeating them.

> Pitfalls and notes encountered in engineering, product, and process. **Adding a gotcha within 24h of hitting the pit is a hard requirement of the knowledge contributor charter.**

## Scope

- Engineering gotchas (build tools, dependency conflicts, runtime errors)
- Product gotchas (scope creep, user misuse, UX below expectations)
- Process gotchas (missing review, handoff omissions)
- Third-party API / tool exception behavior

## File types and naming

- `*-gotcha.md` or `*.md`: single-point gotcha record
- `*-summary.md`: collection summary of a theme's gotchas
- naming uses English kebab-case

## Included

| file | content | state |
|---|---|---|
| [macos-fsevents-silent-drop.md](gotcha-macos-fsevents-silent-drop.md) | macOS FSEvents silently dropping events | active |
| [vite-to-rsbuild-migration.md](gotcha-vite-to-rsbuild-migration.md) | Vite to Rsbuild migration gotchas | active |
| [react-jsxdev-mismatch.md](gotcha-react-jsxdev-mismatch.md) | React 18 + jsxDEV mismatch | active |
| [sse-ondone-guard.md](gotcha-sse-ondone-guard.md) | SSE onDone guard and cross-project half-sent emissions | active |
| [no-lockfile-supply-chain-risk.md](gotcha-no-lockfile-supply-chain-risk.md) | Supply-chain attack surface of no lockfile | active |

## To be included

- MongoDB index failure scenarios
- Tauri cross-platform packaging gotchas
- vLLM deploy memory overflow
- Cross-timezone data consistency gotchas

## Recommended structure

1. Symptom (signs, errors, reproduction conditions)
2. Root cause (technical principle, misunderstanding)
3. Solution (immediately usable fix)
4. Prevention (CI checks, documentation tips, norm constraints)
5. Related (links to similar gotchas or failures)

## Related leaves

- [../failures/](.) — failure retrospectives (gotcha upgraded to failure)
- [../wins/](.) — success contrast
- [../../processes/incident-response.md](../process/incident-response.md) — incident process
- [../../strategies/check-engineering-gotchas.md](../process/check-engineering-gotchas.md) — scenario entry
- [../../../curator/governance/tacit-knowledge-backlog.md](../../curator/governance/tacit-knowledge-backlog.md) — tacit knowledge backlog
