---
title: prototype
name: prototype
description: >
  Build a throwaway prototype to answer a design question before committing
  to production code. Two modes: (1) single sharable HTML file for
  state/logic/UI questions — open in any browser, zero dependencies;
  (2) multiple UI variations toggleable from one route for A/B comparison.
  Use this skill when the user is unsure about a design approach, wants to
  see options before deciding, or needs to validate an assumption before
  investing in a full implementation. Trigger words: prototype, 原型,
  proof of concept, 验证想法, spike, 快速验证, throwaway, mockup, 先看看效果,
  做个 demo, 试一下.
  Do NOT trigger for: production code, or when the user says "just build it."
lifecycle: active
user_invocable: true
status: stable
type: skill
source: internal
created: 2026-08-21
updated: 2026-08-21
category: aier/skills/prototype
review_cycle: quarterly
roles:
  - engineer
  - aier
tags:
  - skill
  - ai
  - prototyping
  - design
  - validation
chip: ai-engineering
---

# prototype

> Build throwaway prototypes to answer design questions. Inspired by
> mattpocock's prototype — adapted for the YrY stack (Vue 3, React 18,
> FastAPI, MongoDB).

## What this skill does

- Build a minimal, self-contained prototype that answers ONE design question.
- Two modes:
  - **Single HTML file**: For state, logic, or UI flow questions. Zero
    dependencies — open in any browser. Ideal for YiVad (Vue 3) or YiPet
    (React 18) component behavior.
  - **Multi-variation toggle**: Several radically different UI approaches
    toggleable from one route. For A/B comparison of design options.
- The prototype is explicitly throwaway — it exists to validate or
  invalidate a hypothesis, then it's discarded.

## What this skill does NOT do

- Does NOT produce production code — the prototype is thrown away after
  the design question is answered.
- Does NOT replace `/brainstorm` or `/write-plan` — prototyping is for
  design validation, not requirement gathering.
- Does NOT build full-stack prototypes — keep it to the minimum needed
  to answer the question.
- Does NOT need tests, linting, or CI — it's throwaway code.

## Workflow

```
Design question stated
  → Identify the ONE question the prototype must answer
  → Choose the mode: single HTML file or multi-variation toggle
  → Build the minimum prototype
  → Validate: does it answer the question?
  → Present findings to the user
  → Discard the prototype (or save to /tmp for reference)
```

### When to prototype

| Scenario | Mode | Example |
|----------|------|---------|
| "Will this state machine work?" | Single HTML | Prototype a Pinia store's state transitions |
| "Which layout feels better?" | Multi-variation | Toggle between 3 dashboard layouts |
| "Can this animation be smooth?" | Single HTML | Test a CSS transition on real DOM |
| "Is this API response shape usable?" | Single HTML | Mock the API response and render it |
| "Which color scheme works?" | Multi-variation | Toggle between 3 theme palettes |
| "Does this component API make sense?" | Single HTML | Build the component with fake props |

### When NOT to prototype

| Scenario | Why not |
|----------|---------|
| The design is already clear | Just build it |
| The question is about data correctness | Prototyping won't help — you need real data |
| The user wants production code | Prototypes are throwaway by definition |
| The question can be answered by reading docs | Read the docs instead |

### Single HTML file convention

For YiVad (Vue 3) and YiPet (React 18) UI questions, a single HTML file
with inline CSS + JS is the fastest way to validate:

```html
<!DOCTYPE html>
<html>
<head><title>Prototype: [question]</title></head>
<body>
<div id="app"></div>
<script type="module">
// Minimal Vue 3 or React 18 CDN import
// Just enough to answer the question
</script>
</body>
</html>
```

Save to `/tmp/prototype-[slug].html` and open in the browser.

### Multi-variation toggle convention

For A/B comparison, build a single page with a toggle control:

```html
<select id="variation">
  <option value="a">Option A: [description]</option>
  <option value="b">Option B: [description]</option>
  <option value="c">Option C: [description]</option>
</select>
<div id="preview"><!-- variation renders here --></div>
```

### YrY-specific prototyping guidance

1. **YiVad prototypes**: Use Vue 3 CDN for simple prototypes. For
   component-level prototyping, use the existing `pnpm build:dev` and
   add a temporary route.
2. **YiPet prototypes**: Use React 18 CDN for simple prototypes. For
   chat-widget prototyping, use the existing `npm run build` and test
   in Chrome.
3. **YiAi prototypes**: For API shape validation, use a Python script
   with `httpx` against the running server. For data model validation,
   use a standalone script against MongoDB.
4. **Cross-project prototypes**: A single HTML file that mocks both the
   YiVad UI and the YiAi API response shape is often the fastest way
   to validate a contract change.

## Rules

| # | Rule | Rationale |
|---|------|-----------|
| 1 | Answer ONE question per prototype | Compound questions = compound confusion |
| 2 | Throwaway by design | If you're tempted to keep it, it's not a prototype |
| 3 | Zero dependencies (or CDN only) | Prototypes should run anywhere, instantly |
| 4 | Present findings, not the code | The user cares about the answer, not the prototype |
| 5 | 30 minutes max | If it takes longer, it's not a prototype — it's a feature |
| 6 | Save to /tmp, not the project | Prototypes in the repo confuse future readers |
| 7 | Delete after the question is answered | Stale prototypes are misleading |

## Borders

| Boundary | Permission |
|----------|-----------|
| /tmp/ (for saving prototypes) | read + write |
| Project source files | read (for context only) |
| CDN URLs (for library imports) | fetch |
| Browser | open (for validation) |

## Supporting resources

- [YiVad/CLAUDE.md](../../../YiVad/CLAUDE.md) — component patterns, Element Plus API
- [YiPet/CLAUDE.md](../../../YiPet/CLAUDE.md) — React 18 patterns, Ant Design 5 API
- [YiAi/CLAUDE.md](../../../YiAi/CLAUDE.md) — API response shapes, data models

## Fallback

| Situation | Behavior |
|-----------|----------|
| User wants to keep the prototype | Warn that prototypes are throwaway by design; if they insist, move it to a feature branch |
| Prototype doesn't answer the question | State what was learned; suggest a new prototype with a narrower question |
| Prototype requires a backend | Mock the API response; don't build a real backend |
| Browser not available (headless) | Skip visual prototypes; use console output for logic validation |