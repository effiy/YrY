---
description: "Generation principle sources — the four Karpathy principles and how they shape CLAUDE.md sections."
---

# Generation Principle Sources

## The Four Principles (Default)

From [Andrej Karpathy's CLAUDE.md](https://github.com/multica-ai/andrej-karpathy-skills/blob/main/CLAUDE.md):

1. **Think Before Coding** — State assumptions explicitly; if multiple interpretations exist, present them; if a simpler approach exists, say so.
2. **Simplicity First** — No features beyond what was asked. No abstractions for single-use code.
3. **Surgical Changes** — Touch only what you must. Don't "improve" adjacent code.
4. **Goal-Driven Execution** — Every change traces to a user request or verify-check failure.

## CLAUDE.md Section Mapping

| Principle | CLAUDE.md section |
|-----------|-------------------|
| Think Before Coding | `## Foundational beliefs` |
| Simplicity First | `## Iron laws` |
| Surgical Changes | `## Iron laws`  |
| Goal-Driven Execution | `## Iron laws` |

## Custom Principles

Users can provide custom principles via the `principles` input to yry-init-generate. Each principle becomes one bullet in the appropriate CLAUDE.md section.
