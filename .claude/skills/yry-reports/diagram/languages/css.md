# CSS Language Prompt Snippet

## Key Concepts

- **Selectors**: Element, class (`.name`), ID (`#name`), attribute (`[attr]`), and pseudo-class (`:hover`) targeting
- **Specificity**: Inline > ID > Class > Element cascade priority determining which rules win
- **Box Model**: `margin`, `border`, `padding`, `content` dimensions controlling element sizing
- **Flexbox**: `display: flex` with `justify-content`, `align-items` for one-dimensional layouts
- **Grid**: `display: grid` with `grid-template-columns/rows` for two-dimensional layouts
- **Custom Properties (Variables)**: `--name: value` with `var(--name)` for reusable design tokens
- **Media Queries**: `@media (max-width: ...)` for responsive design breakpoints
- **SCSS/Sass Features**: Nesting, `$variables`, `@mixin`, `@include`, `@extend`, `@use`, `@forward`
- **CSS Modules**: Scoped class names (`.module.css`) preventing global style collisions
- **Cascade Layers**: `@layer` for explicit control over cascade ordering

## Notable File Patterns

- `*.css` — Standard CSS stylesheets
- `*.scss` / `*.sass` — Sass/SCSS preprocessor files
- `*.less` — Less preprocessor files
- `*.module.css` / `*.module.scss` — CSS Modules (scoped styles)
- `globals.css` / `reset.css` / `normalize.css` — Global base styles
- `tailwind.config.js` — Tailwind CSS configuration (though a JS file)
- `variables.scss` / `_variables.scss` — Design token definitions

## Edge Detection Heuristics

**SCSS partial dependencies** — `@use 'variables'`, `@forward 'mixins'`, `@import 'theme'` → `imports` edges from the importing file to the partial (`_variables.scss`). `@use` is namespaced (preferred); `@import` is global (deprecated).

**CSS Module component binding** — `import styles from './Button.module.css'` in a React component → `depends_on` edges from the component to the CSS Module. Class name mapping is deterministic (`styles.primary` → `Button_primary_abc123`).

**Tailwind directive layers** — `@tailwind base; @tailwind components; @tailwind utilities;` + `@layer components { ... }` → `configures` edges from the CSS entry point to each Tailwind layer. Custom `@layer` definitions extend the framework.

**Design token/variable propagation** — `:root { --color-primary: #22d3ee; }` defined in `tokens.css` and consumed via `var(--color-primary)` in component stylesheets → `configures` edges from the token definition to each consumer file.

**Critical CSS extraction** — Files marked as critical (inline in `<head>`) vs deferred (loaded async) → critical CSS `depends_on` the HTML layout it styles. Deferred CSS is non-blocking.

**Media query breakpoints** — `@media (min-width: 768px) { ... }` → responsive breakpoints define layout variation points. Each breakpoint range can target different component states.

## Summary Style

> "Global stylesheet defining CSS custom properties for the design system color palette and typography."
> "Responsive layout styles with flexbox and grid for the dashboard page across 3 breakpoints."
> "SCSS partial defining shared mixins for spacing, shadows, and media query breakpoints."
