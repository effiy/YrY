---
description: "Verification integration points — where verify fits in the pipeline, how it connects to other skills, and CI integration."
---

# Verification Integration Points

## Pipeline Position

```
detect → explore → generate → arch → verify
                                    ↑
                              engineering gate
```

Verify is always the final step. Its output is a binary pass/fail that gates the entire pipeline.

## CI Integration

```bash
# In CI pipeline
python -m scripts.quick_validate "rui-*/SKILL.md"  # Pre-commit
node rui-init-verify/check.mjs --cwd . --json       # Post-init
```

Exit codes: 0 = pass, 1 = fail, 2 = error (could not run).

## Cross-Skill Dependencies

| Verify check | Depends on | On failure |
|-------------|-----------|------------|
| 1: claude-md-name | generate | Re-run generate |
| 2: readme-md-name | generate | Re-run generate |
| 3: domain-language | generate + user | User adds terms |
| 4: docs-home-files | generate | Re-run generate |
| 5: arch-scenes | arch | Re-run arch |
| 6: self-test-scenes | arch | Re-run arch |
| 7: scene-counts | arch | Add scenes |
