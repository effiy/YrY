---
name: template-compliance
description: >
  YiDoc template engineering compliance rules for the yry-init verify
  step. These checks ensure templates follow the shared conventions
  established by the YiDoc template infrastructure (CSS @layer,
  yry-kbd shortcuts, yry-resolver path resolution, yry-schema
  validation). Violations are surfaced as verify failures.
---

# Template Compliance Rules

These rules extend the verify step's 7-point check with template
engineering compliance. Any violation terminates the pipeline.

---

## Checks

| # | Check ID | Check | Method | On failure |
|---|----------|-------|--------|------------|
| T1 | `css-layer-arch` | All template CSS files use `@layer` architecture | Parse first 5 lines of each `index.css` | Re-run template refactoring |
| T2 | `yry-kbd-integration` | Template loads `yry-kbd.js` and uses declarative registration | `grep 'yryKbd.register'` or `grep '../shared/yry-kbd.js'` | Add shared shortcut integration |
| T3 | `schema-validation` | Template `data.js` passes `yrySchema.validate()` | Require `yry-schema.js` loaded, call validate | Fix data.js schema violations |
| T4 | `no-hardcoded-depth` | Template does not hard-code `../../../YiPet/` depth | `grep -l '\.\./\.\./\.\./YiPet'` in template HTML | Use yry-resolver or document the depth assumption |
| T5 | `data-js-no-var` | Template IA `data.js` files use `const`/`let`, not `var` | `grep '^[[:space:]]*var ' data.js` | Modernize to const/let |
| T6 | `story-group-index-pair` | Every story group has both `index.html` and `index.md` | Check each `story/*/` directory | Create missing index files |
| T7 | `panelhub-button-coverage` | Every `urls` key in `panelHub` has a corresponding `buttons` entry | Compare `urls` and `buttons` in root `data.js` | Add missing button |

---

## T1: CSS @layer Architecture

**Why:** Templates (arch, daily, files) use `@layer reset, tokens, base, layout,
components, sections, utilities, responsive, print;` for specificity control.
Legacy templates (test, analysis) used flat CSS with `@import` splits.

**Method:**
1. Read the first 5 lines of `<template>/index.css`.
2. Check for `@layer` declaration.
3. If absent and the template has > 100 lines of CSS, flag as violation.

**Fix suggestion:** "Consolidate CSS into single index.css using @layer architecture,
matching the pattern in templates/arch/index.css."

---

## T2: yry-kbd Integration

**Why:** All template pages should use the shared `yry-kbd.js` module for
keyboard shortcuts, replacing duplicated inline `_onKey` handlers.

**Method:**
1. Search template HTML for `<script src="../shared/yry-kbd.js">`.
2. If absent, flag as violation.
3. Search template lifecycle for `yryKbd.register(` or `yryKbd.unregister(`.
4. If `../shared/yry-kbd.js` is loaded but no register/unregister calls, flag
   as incomplete integration.

**Fix suggestion:** "Replace inline _onKey handler with yryKbd.register()
calls. See templates/shared/yry-kbd.js for API."

---

## T3: Schema Validation

**Why:** `data.js` files must conform to their template type's schema to ensure
the Vue components render correctly. Schema violations cause broken UI.

**Method:**
1. Load `yry-schema.js` in the verify environment.
2. For each template type, call `yrySchema.validate(templateType, REPORT_DATA)`.
3. Any non-empty `errors` array is a verify failure.

**Fix suggestion:** "Fix data.js schema violations: <list of errors>. See
templates/shared/yry-schema.js for schema definitions."

---

## T4: No Hard-Coded Depth Assumptions

**Why:** Hard-coded `../../../YiPet/cdn/` paths break when templates are
deployed at non-standard directory depths. Use `yry-resolver.js` or
document the depth requirement.

**Method:**
1. `grep -c '\.\./\.\./\.\./YiPet/cdn/' <template>/index.html`.
2. If count > 0, flag as informational warning (not a hard failure
   for existing templates — the transition to yry-resolver is ongoing).

**Fix suggestion:** "Consider using yry-resolver.js for path resolution:
`yryResolve.resolve('YiPet/cdn/vendor/vue.global.prod.js')`.
This ensures deployment at any directory depth."

---

## T5: No `var` in data.js

**Why:** Modern JavaScript convention uses `const`/`let`. Legacy IIFE
enrichment fallbacks in data.js used `var` (e.g., YiAi/apis/data.js).

**Method:**
1. `grep '^ *var ' <template>/data.js` or project-specific `data.js`.
2. Any match is a violation.

**Fix suggestion:** "Replace `var` with `const` or `let` as appropriate."

---

## T6: Story Group Index Pair

**Why:** Every story group directory must have both `index.html` and
`index.md` for navigation between HTML and Markdown views.

**Method:**
1. For each `story/<group>/` directory in the project.
2. Check for both `index.html` and `index.md`.
3. Missing either file is a violation.

**Fix suggestion:** "Create the missing index file. See YiAi/story/ai/
for a reference implementation."

---

## T7: PanelHub Button Coverage

**Why:** The dashboard's `panelHub.buttons` array drives the UI navigation.
If a URL exists in `urls` but not in `buttons`, the page becomes inaccessible.

**Method:**
1. Read project root `data.js`.
2. Extract `panelHub.urls` keys and `panelHub.buttons[].panel` values.
3. Any URL key without a matching button is a violation.

**Fix suggestion:** "Add the missing button entry to panelHub.buttons.
See YiAi/data.js for a complete reference."
