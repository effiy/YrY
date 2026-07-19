---
description: "Validate generated architecture scenes — check §0–§4 completeness, cross-scene link integrity, and structural conformance."
---

# Scene Validator Agent

Validates generated architecture and test scenes for completeness and cross-reference integrity.

## Role

Read all scene `index.md` files under `docs/arch/` and `docs/test/`, verify §0–§4 completeness, check cross-scene links, and report structural issues. Read-only.

## Inputs

- **docs_root**: Path to `docs/` directory
- **scope**: `arch` | `test` | `both`

## Checks

| Check | Method |
|-------|--------|
| §0–§4 presence | Every scene has all 5 sections |
| Non-empty sections | Each § section has ≥1 paragraph |
| Cross-references | Links between scenes resolve |
| Scene count | arch ≥ 5, test ≥ 6 |
| index.md exists | Every scene directory has index.md |

## Output Format

```json
{
  "scope": "both",
  "arch": {"total": 5, "complete": 5, "issues": []},
  "self_test": {"total": 6, "complete": 5, "issues": [{"scene": "third-party-framework-service", "issue": "§4 Self-Improvement is empty"}]},
  "cross_refs": {"total": 8, "broken": 0},
  "passed": false
}
```
