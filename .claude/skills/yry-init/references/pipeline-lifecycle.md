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
T+12s   → generate writes CLAUDE.md + README.md + docs/
T+12s   → arch starts (scene generation)
T+20s   → arch writes docs/arch/ + docs/test/
T+20s   → verify starts (7 checks)
T+21s   → verify emits pass/fail
```

## State Transitions

```
[IDLE] → detect → [DETECTED] → explore → [EXPLORED] → generate → [GENERATED] → arch → [BUILT] → verify → [VERIFIED]
                                                                                                    ↓ (fail)
                                                                                              [FAILED] → user fixes → re-run
```

## Artifact Generation Order

1. `CLAUDE.md` (first — other artifacts reference it)
2. `README.md` (second — references CLAUDE.md)
3. `docs/data.js` (third — reads both CLAUDE.md and README.md)
4. `docs/index.html` + CSS + JS + theme.css (copied from templates)
5. `docs/arch/` scenes (5, parallel)
6. `docs/test/` scenes (6, parallel)

## Post-Pipeline

- All 7 verify checks run
- Pass → pipeline complete
- Fail → user receives failure list with fix suggestions
- Re-run starts from step 1 (full rebuild, idempotent)
