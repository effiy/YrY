---
paths:
  - ".claude/rui-init-arch/SKILL.md"
description: "Architecture story contracts: §0–§4 lifecycle, scene directory structure, cross-scene consistency rules."
---

# Story Generation Contracts

`rui-init-arch` builds `docs/arch/` (5 scenes) and `docs/self-test/` (6 scenes) story directories. Each scene follows a strict §0–§4 lifecycle.

## §0–§4 Lifecycle (Per Scene)

| Section | Title | Content |
|---------|-------|---------|
| §0 | Effect Sketch | What this scene demonstrates, why it matters |
| §1 | Test Design | How to verify correctness — concrete steps |
| §2 | Output Inventory | What files/directories are produced |
| §3 | Test Report | Validation results against §1 criteria |
| §4 | Self-Improvement | What could be better, edge cases found |

## Arch Scenes (5 Required)

| # | Directory | Focus |
|---|-----------|-------|
| 1 | `module-location` | Where to find things in the project |
| 2 | `data-flow-tracing` | How data moves through the system |
| 3 | `newcomer-onboarding` | How a new developer gets started |
| 4 | `dependency-change-impact` | What happens when a dependency changes |
| 5 | `trust-boundary-security-surface` | Security boundaries and trust zones |

## Self-Test Scenes (6 Required)

| # | Directory | Focus |
|---|-----------|-------|
| 1 | `post-init-full-self-check` | Full self-check after init |
| 2 | `pre-commit-incremental-self-check` | Incremental check before commit |
| 3 | `doc-code-consistency` | Documentation matches code |
| 4 | `security-surface-regression` | Security surface hasn't regressed |
| 5 | `cross-story-integration-regression` | Cross-story references are intact |
| 6 | `third-party-framework-service` | Third-party integrations documented |

## Hard Constraints

1. Every scene directory must contain `index.md`.
2. `index.md` must follow the §0–§4 structure. Missing sections are a verify failure.
3. Scene count is checked by verify: arch ≥ 5, self-test ≥ 6.
4. Scene names are semantic kebab-case, not numeric.
