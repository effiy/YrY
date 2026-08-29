---
description: "Pipeline lifecycle reference — full execution timeline, state transitions, artifact generation order, and post-pipeline verification."
---

# Pipeline Lifecycle Reference

## Execution Timeline

```
T+0s    → detect starts (filesystem probe)
T+2s    → detect emits profile
T+2s    → explore starts (source code scan)
T+10s   → explore emits exploration (varies with codebase size)
T+10s   → generate starts (document rendering)
T+12s   → generate writes CLAUDE.md + README.md
T+12s   → verify starts (4 checks)
T+13s   → verify emits pass/fail
```

## State Transitions

```
[IDLE] → detect → [DETECTED] → explore → [EXPLORED] → generate → [GENERATED] → verify → [VERIFIED]
                                                                                       ↓ (fail)
                                                                                 [FAILED] → user fixes → re-run
```

## Artifact Generation Order

1. `CLAUDE.md` (first — README.md references it)
2. `README.md` (second — references CLAUDE.md)

## Post-Pipeline

- All 4 verify checks run
- Pass → pipeline complete
- Fail → user receives failure list with fix suggestions
- Re-run starts from step 1 (full rebuild, idempotent)