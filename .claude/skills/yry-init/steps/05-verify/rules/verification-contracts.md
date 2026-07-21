---
paths:
  - ".claude/yry-init-verify/SKILL.md"
description: "Verification contracts: 7-check invariants, failure handling protocol, edge case rules, and the engineering gate contract."
---

# Verification Contracts

`yry-init-verify` is the engineering gate of the yry-init pipeline. These contracts define the 7 checks and failure handling rules.

## The 7 Checks (Immutable)

| # | Check ID | Method | Fix on failure |
|---|----------|--------|----------------|
| 1 | `claude-md-name` | `CLAUDE.md` contains `profile.identity.name` | Re-run generate |
| 2 | `readme-md-name` | `README.md` contains `profile.identity.name` | Add project name |
| 3 | `domain-language` | `README.md` has `## Domain Language` + ≥3 terms | Add domain language section |
| 4 | `docs-home-files` | All 4 docs home files exist (`index.html`, `index.css`, `index.js`, `data.js`) | Re-run generate |
| 5 | `arch-scenes` | `docs/arch/` exists + each scene has `index.md` | Re-run arch |
| 6 | `test-scenes` | `docs/test/` exists + each scene has `index.md` | Re-run arch |
| 7 | `scene-counts` | arch ≥ 5 scenes, test ≥ 6 scenes | Add missing scenes |

## Failure Handling Protocol

1. Any single failed check → `result: 'fail'`
2. All failures reported in `failures[]`, ordered by check ID
3. Pipeline terminates immediately — no further steps run
4. User receives the full failure list with fix suggestions
5. Verify never attempts to repair artifacts

## Edge Case Rules

| Edge case | Handling |
|-----------|----------|
| `cwd` doesn't exist | All checks fail with `cwd-not-found` |
| `projectType === 'unknown'` | Check 1 passes if name present; record warning |
| Empty `moduleMap` | Check 5 passes if scene structure is well-formed; record warning |
| Permission error reading file | Treat as missing; include permission error in failure message |
| Empty `index.md` (0 bytes) | Check fails with "empty file" message |

## Engineering Gate Contract

The verify step is the final gate. It never silently passes — if it cannot evaluate a check, the check fails. This is by design: a noisy failure is better than a silent pass that masks a broken artifact.
