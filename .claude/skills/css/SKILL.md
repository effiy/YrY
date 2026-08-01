---
name: css
description: >
  Modern CSS navigator — cascade layers, container queries, custom
  properties (design tokens), logical properties, nesting, scoping,
  and modern layout (Grid, Flexbox, subgrid). Invoke when the user wants
  to: structure CSS with cascade layers (`@layer`), use container queries
  (`@container`), set up CSS custom properties as design tokens,
  use logical properties for internationalization, write nested CSS,
  use `@scope` for component-scoped styles, create modern layouts with
  Grid/subgrid/Flexbox, optimize CSS performance (containment,
  `content-visibility`), or debug specificity issues. Trigger words:
  "css cascade layers", "css container queries", "css custom properties",
  "css tokens", "css nesting", "css has selector", "css logical properties",
  "css grid", "css subgrid", "css flexbox", "css scoping", "css layers",
  "css specificity", "css containment", "content-visibility", "modern css".
  Do NOT trigger for: CSS-in-JS (styled-components, Emotion, CSS Modules),
  Tailwind CSS utility questions (see /ui-ux), or SCSS/Sass/Less preprocessor
  specifics.
lifecycle: default-pipeline
user_invocable: true
---

# css — Modern CSS Navigator

> Cascade layers, container queries, custom properties, logical properties — the modern CSS toolkit.

## What this skill does

1. **Cascade layers** (`@layer`) — organizing styles by priority: `@layer reset, base, components, utilities`; layer order management; unlayered styles cascade behavior.
2. **Container queries** (`@container`) — element-responsive design: `container-type: inline-size`, `@container (min-width: 300px)`, container query units (`cqw`, `cqi`).
3. **Custom properties** — design tokens via `--token-name`, `var()` with fallbacks, `@property` for typed/animated custom properties, CSS variable scope and inheritance.
4. **Logical properties** — RTL-friendly CSS: `margin-inline`, `padding-block`, `border-inline-start`, `inset-inline`; replacing physical `left`/`right`/`top`/`bottom`.
5. **CSS nesting** — native nesting rules, `&` parent selector, nesting media queries, browser support.
6. **Scoping** (`@scope`) — component-scoped styles without shadow DOM: `@scope (.card) { ... }`, `:scope` pseudo-class.
7. **Modern layout** — Grid (`grid-template-columns`, `grid-template-areas`, `subgrid`), Flexbox (`flex`, `gap`), `min()`, `max()`, `clamp()` for fluid sizing.
8. **Performance** — `contain` (layout/style/paint/size), `content-visibility: auto` for virtualized rendering, `will-change` usage.
9. **Selectors** — `:has()` (parent selector), `:is()`, `:where()`, `:not()` with selector lists, `:focus-visible`.

## What this skill does NOT do

- Does NOT cover CSS-in-JS libraries (styled-components, Emotion, vanilla-extract).
- Does NOT cover Tailwind CSS utility classes in depth — use `/ui-ux` for Tailwind-specific patterns.
- Does NOT cover SCSS/Sass/Less preprocessor features unless mapping them to native CSS equivalents.
- Does NOT teach basic CSS — assume familiarity with selectors, box model, and cascading.
- Does NOT generate complete design systems — provide the CSS patterns; design decisions are project-specific.

## Workflow

1. **Identify the CSS concern** — layout / responsiveness / design tokens / specificity / performance.
2. **Check browser support** — `caniuse.com` for the feature; note fallback strategy.
3. **Apply the pattern** — write modern CSS with progressive enhancement.
4. **Verify** — test across target browsers; check DevTools for computed styles and specificity conflicts.

## Borders

| Boundary | Permission |
|----------|-----------|
| Project stylesheets (`*.css`, `*.scss`) | read + write |
| caniuse.com | reference (check compatibility) |
| Skill directory | read + write |
| Outside the project | no automatic writes |

## Fallback

| Situation | Behavior |
|-----------|----------|
| Feature not supported in target browser | Recommend a progressive enhancement or polyfill; cite caniuse data. |
| User asks about Tailwind utility class | Note the Tailwind equivalent; defer to `/ui-ux` for full Tailwind patterns. |
| User asks about CSS-in-JS | State the boundary; recommend native CSS approach for new code. |
| User asks about SCSS/Sass features | Show the native CSS equivalent where available; note preprocessor-only features. |
| User asks in a language other than English | Respond in the user's language; keep CSS keywords in original. |
