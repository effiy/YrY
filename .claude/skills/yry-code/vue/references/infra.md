# Infrastructure Scripts & Workflows Reference

## Infrastructure Scripts

### `assets/mount-component.js` — Vue App Factory

```javascript
mountDocComponent({ name, templateId, dataKey, extra? })
```

1. Resolves `SELF_DIR` from `document.currentScript`'s `data-cs-dir` or `script.src`
2. Auto-injects `index.css` `<link>` if component is in `_COMPONENTS_WITH_CSS` Set (idempotent)
3. Inserts mount `<div>` before `<template>`
4. Creates `Vue.createApp({ name, template, data, ...extra })`
5. Copies `extra.data()` private state into resolved object

### `assets/include.js` — HTML Inclusion

1. Finds all `[data-include]` elements
2. Fetches each target HTML
3. Injects HTML into placeholder
4. **Sequentially executes** all `<script>` tags — `data.js` always executes before `index.js` within each component

### `assets/main.js` — Page-Level Logic

Calls `includeHTML().then(...)` and wires scroll spy + smooth scroll after all components mount.

## Workflows

### W1: Generate New Doc Page
Create entry point → CSS `@import` chain → tokens/base/layout/responsive → copy assets → 4-file components → `data-include` placeholders → select theme → verify `file://` works.

### W2: Refactor Existing Static Page
Audit → extract to data.js → template-ify → replace inline JS → wire mountDocComponent → entry point → move styles → verify at 4 breakpoints.

### W3: Add Section to Existing Page
Create component dir → 4 files → add `data-include` placeholder → register CSS if needed → add sidebar link.

### W4: Switch Theme
Change one `<link>` in `index.html`. Verify contrast (≥ 4.5:1 body, ≥ 3:1 secondary).

### W5: Standalone Sub-Page or Interactive Artifact
Self-contained `index.html` with Vue 3 CDN + theme + token bridge + 4-file pattern. No `data-include` cross-deps.

### W6: Add Component with Custom CSS
Create `index.css` → add to `_COMPONENTS_WITH_CSS` Set → auto-injected on mount.

## Critical Rules

### Script Order
- `data.js` before `index.js` in every component
- Entry point: yry-loader → yry-tag-chip → yry-scene-card → yry-back-top → mount-component.js → include.js → main.js

### Theme Tokens
- ALL colors use `var(--yry-*)` — zero hardcoded hex
- `tokens.css` bridges CDN tokens → `--yry-doc-*` tokens
- Changing theme = one `<link>` change, zero other file changes

### Component Names
- `<template id>` globally unique; `<section id>` matches sidebar `href`
- `window.XXX_CONFIG` key globally unique
- Component name in `_COMPONENTS_WITH_CSS` is the directory name

## Pre-Delivery Checklist

- [ ] `file://` URL works (no build, no server)
- [ ] All 4 files present per component
- [ ] `data.js` before `index.js` in every component HTML
- [ ] `<template id>` unique across all components
- [ ] `<section id>` unique, matches sidebar `href`
- [ ] ALL colors use `var(--yry-*)` — zero hardcoded hex
- [ ] All `data-include` placeholders resolve
- [ ] Verify at 375/768/1024/1440px
- [ ] `prefers-reduced-motion` respected
- [ ] Keyboard navigation works (focus-visible)
- [ ] Print stylesheet present
- [ ] No 404 console errors

