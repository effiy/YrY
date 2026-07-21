---
description: "Architecture and test scene catalog — all 5 arch + 6 test scenes with directory names and focus areas."
---

# Scene Catalog

## Arch Scenes (5)

| # | Directory | Focus | Key output |
|---|-----------|-------|------------|
| 1 | `module-location` | Project navigation | Module map with entry points |
| 2 | `data-flow-tracing` | Data movement | End-to-end data flow diagram |
| 3 | `newcomer-onboarding` | Developer setup | Step-by-step onboarding guide |
| 4 | `dependency-change-impact` | Change analysis | Impact chain for dependency updates |
| 5 | `trust-boundary-security-surface` | Security audit | Trust boundary map + vulnerability surface |

## test Scenes (6)

| # | Directory | Focus | Key output |
|---|-----------|-------|------------|
| 1 | `post-init-full-self-check` | Full system check | All 7 verify checks pass |
| 2 | `pre-commit-incremental-self-check` | Pre-commit gate | Changed-files-only verification |
| 3 | `doc-code-consistency` | Doc-code alignment | Drift report |
| 4 | `security-surface-regression` | Security regression | Changed surface comparison |
| 5 | `cross-story-integration-regression` | Integration test | Cross-scene link integrity |
| 6 | `third-party-framework-service` | External dependency docs | 3rd-party integration catalog |

## §0–§4 Lifecycle

Every scene `index.md` follows this structure:
- **§0** Effect Sketch — what and why
- **§1** Test Design — concrete verification steps
- **§2** Output Inventory — files/directories produced
- **§3** Test Report — validation results
- **§4** Self-Improvement — edge cases, suggested improvements
