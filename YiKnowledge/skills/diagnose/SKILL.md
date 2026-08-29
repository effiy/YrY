---
title: diagnose
name: diagnose
description: >
  Systematic debugging with a disciplined 4-phase loop: reproduce → isolate →
  hypothesize → fix → regression-test. Use this skill when facing a bug that
  isn't obvious from a stack trace, a performance regression, a flaky test,
  or any issue where the root cause is unclear. The skill enforces a structured
  process — no guessing, no random print statements, no "try this and see."
  Trigger words: diagnose, debug, 调试, 排查, 找原因, root cause, 为什么,
  isn't working, broken, bug hunt, 定位问题, 修 bug, what's wrong.
  Do NOT trigger for: obvious bugs with a clear fix (typo, missing import),
  or when the user already knows the root cause and just wants a fix.
lifecycle: active
user_invocable: true
status: stable
type: skill
source: internal
created: 2026-08-21
updated: 2026-08-21
category: aier/skills/diagnose
review_cycle: quarterly
roles:
  - engineer
  - aier
tags:
  - skill
  - ai
  - debugging
  - diagnosis
  - quality
chip: ai-engineering
---

# diagnose

> Systematic debugging for the YrY stack. Inspired by superpowers'
> systematic-debugging and mattpocock's diagnosing-bugs — adapted for
> the monorepo's multi-language, multi-runtime reality.

## What this skill does

- Guide a 4-phase debugging process: reproduce → isolate → hypothesize → fix
  → regression-test.
- Build a feedback loop: find a way to trigger the bug reliably, then shrink
  the reproduction to the minimum.
- Use evidence, not intuition — every hypothesis must be tested before acting.
- Document the root cause and the fix so the same bug doesn't recur.

## What this skill does NOT do

- Does NOT guess — every step is verified.
- Does NOT add random debug logging and hope — instrumentation is targeted
  at a specific hypothesis.
- Does NOT fix the bug until the root cause is confirmed.
- Does NOT skip regression testing — the fix must be proven to work.

## Workflow

```
Phase 1: REPRODUCE
  → Find a reliable way to trigger the bug
  → Document the exact reproduction steps
  → If not reproducible, add targeted instrumentation

Phase 2: ISOLATE
  → Shrink the reproduction to the minimum
  → Binary-search through the code: comment out half, test, repeat
  → Identify the exact line or condition that triggers the bug

Phase 3: HYPOTHESIZE
  → Form a specific hypothesis: "The bug is caused by X because Y"
  → Test the hypothesis with a targeted instrument or assertion
  → If wrong, form a new hypothesis — don't commit to the first guess

Phase 4: FIX + REGRESSION-TEST
  → Apply the minimal fix
  → Verify the reproduction no longer triggers
  → Run the project's verification suite
  → If the bug is tracked in YiVad's bug system (`YiKnowledge/engineer/learn/lessons/failures/bugs/`), note the fix in the bug's markdown file
```

## YrY-specific debugging guide

### YiVad (Vue 3 + TypeScript + browser)

| Symptom | Common causes | Investigation |
|---------|--------------|---------------|
| Component not rendering | `v-if` false, missing route, missing `v-auth` | Check Vue DevTools component tree |
| API call failing | Wrong `module_name`/`method_name`, wrong field name (`query` vs `filter`) | Check Network tab; verify RPC envelope |
| Store not updating | Missing `ref()` wrapper, Pinia plugin issue | Check Pinia DevTools |
| SSE stream hanging | `onDone` not firing, `aborted` flag not checked | Check `aiChat.ts` `onDone` handler |
| Type error | Wrong type import, missing generic | `vue-tsc --noEmit` to see the full error |

### YiAi (Python/FastAPI/MongoDB)

| Symptom | Common causes | Investigation |
|---------|--------------|---------------|
| 422 Unprocessable | Wrong field name (`path` vs `target_file`) | Check Pydantic model; check request body |
| Empty query results | `query` sent instead of `filter` | Check `_build_filter`; log the Mongo query |
| SSE stream broken | Generator not yielding `data:` format | Check `StreamingResponse`; check `text/event-stream` |
| MongoDB timeout | Motor connection pool exhausted | Check `database.py` singleton; check connection string |
| Agent loop stall | Model narrating instead of calling tools | Check `agent.py` logs for nudge/escalation |

### YiPet (TypeScript/Chrome MV3)

| Symptom | Common causes | Investigation |
|---------|--------------|---------------|
| Content script not loading | MV3 manifest mismatch, CSP violation | Check `chrome://extensions` errors |
| API call failing | `filter` vs `query` field name | Check `ApiService` request body |
| Chat not rendering | React state not updating, `useSyncExternalStore` issue | Check React DevTools |
| CDN resource not loading | Path mismatch, catalog entry missing | Check `catalog.ts`; check Network tab |
| Storage not persisting | `chrome.storage.local` quota exceeded | Check `chrome.storage.local.getBytesInUse()` |

## Techniques

### Root-cause tracing (from superpowers)

Instead of fixing the symptom, trace backward from the failure to the root cause:

```
Observed: "Menu list shows empty after create"
  → Why? API returned empty list
  → Why? MongoDB query returned no results
  → Why? Document was created with `parent: ""` instead of `parent: "/"`
  → Root cause: The form default value is `""` but the query filters on `parent: "/"`
  → Fix: Use `"/"` as the default parent value for root-level menus
```

### Condition-based waiting (from superpowers)

Instead of `sleep(5000)` (which is fragile and slow), wait for a specific condition:

```typescript
// BAD: Fragile timing
await sleep(5000);
expect(wrapper.text()).toContain('Loaded');

// GOOD: Wait for condition
await waitFor(() => {
  expect(wrapper.text()).toContain('Loaded');
}, { timeout: 5000 });
```

### Defense in depth (from superpowers)

After fixing the root cause, add a layer of defense so the same class of bug can't recur:

1. **Fix the bug** — correct the code
2. **Add a test** — the reproduction becomes a regression test
3. **Add a guard** — if possible, add a runtime check or type constraint
4. **Document** — if the bug is project-knowledge-worthy, add to YiKnowledge/lessons/failures/

## Rules

| # | Rule | Rationale |
|---|------|-----------|
| 1 | Reproduce before you fix | You can't fix what you can't trigger |
| 2 | One hypothesis at a time | Changing multiple things hides the real fix |
| 3 | Evidence over intuition | "I think it's X" is not a diagnosis |
| 4 | Minimum reproduction | The smaller the repro, the closer to the root cause |
| 5 | Regression test after fix | The bug must be proven gone, not assumed gone |
| 6 | Fix the root cause, not the symptom | Symptoms recur; root causes don't |
| 7 | Document non-obvious bugs | Future you (or a teammate) will thank you |

## Borders

| Boundary | Permission |
|----------|-----------|
| Project source files | read |
| Log files | read |
| Browser DevTools (YiVad, YiPet) | read (suggest, don't control) |
| MongoDB (YiAi) | read (query diagnostics) |
| YiKnowledge/engineer/learn/lessons/failures/ | read + write (for documenting the fix) |

## Supporting resources

- [YiVad/CLAUDE.md](../../../YiVad/CLAUDE.md) — data flow, degradation countermeasures
- [YiAi/CLAUDE.md](../../../YiAi/CLAUDE.md) — module boundaries, error codes, retry policy
- [YiPet/CLAUDE.md](../../../YiPet/CLAUDE.md) — dual-world boundary, degradation countermeasures
- [YiKnowledge/engineer/learn/lessons/](../../../YiKnowledge/engineer/learn/lessons/) — past failures and gotchas

## Fallback

| Situation | Behavior |
|-----------|----------|
| Bug is not reproducible | Add targeted instrumentation to capture state at the failure point |
| Bug is in a third-party dependency | Check the dependency's issue tracker; suggest version pin or workaround |
| Bug is a known issue | Reference the existing issue/lesson; don't re-diagnose |
| Diagnosis takes > 30 minutes | Surface what's known; suggest the user provide more context or a smaller repro |