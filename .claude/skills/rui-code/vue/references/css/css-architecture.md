---
description: "CSS architecture for rui-html-vue 4-file components: the @import chain, layer responsibilities, token bridge pattern, and theme switching."
---

# CSS Architecture Reference

## The `@import` Chain

```css
/* docs/index.css — entry point, NO styles here, only @import */
@import url('styles/tokens.css');
@import url('styles/base.css');
@import url('styles/layout.css');
@import url('styles/responsive.css');
```

## Layer Responsibilities

| File | Contains | Does NOT Contain |
|------|----------|-----------------|
| **tokens.css** | `--rui-doc-*` design variables: color bridge, font stacks, spacing scale, radii, animation | Any selectors or rules |
| **base.css** | Reset, `.rui-doc` root, `code`/`pre`/`table`/`.card`/`.callout`/`.badge`/`.tabs`, `@keyframes`, `:focus-visible`, `prefers-reduced-motion` | Layout, component-specific styles |
| **layout.css** | `.sidebar`, `.main`, `h1`–`h4`, `.nav-link`, `.nav-group`, link styles | Responsive overrides, component styles |
| **responsive.css** | `@media` queries only: ≤768, ≤1024, ≥1440, <375 | Base styles, component styles |

## Token Bridge Pattern

```css
/* tokens.css — bridge CDN theme tokens to docs-specific names */
:root, .rui-doc {
    /* Surface (from CDN theme) */
    --rui-doc-bg:        var(--rui-bg-card);
    --rui-doc-bg-soft:   var(--rui-bg-flat);
    --rui-doc-bg-raised: var(--rui-bg-raised);

    /* Text (from CDN theme) */
    --rui-doc-text:         var(--rui-text);
    --rui-doc-text-soft:    var(--rui-text-soft);
    --rui-doc-text-muted:   var(--rui-text-muted);

    /* Brand (from CDN theme) */
    --rui-doc-primary: var(--rui-accent);

    /* Status (from CDN theme) */
    --rui-doc-success: var(--rui-pass);
    --rui-doc-warning: var(--rui-warn);

    /* Border (from CDN theme) */
    --rui-doc-border: var(--rui-border-color, #e2e8f0);

    /* Docs-specific tokens (NOT in CDN theme) */
    --rui-doc-font-sans: 'IBM Plex Sans', ...;
    --rui-doc-font-mono: 'JetBrains Mono', ...;
    --rui-doc-sidebar-width: 280px;
    --rui-doc-content-max-width: 1100px;
    --rui-doc-space-xs: 4px;
}
```

**Key principle**: All 10 CDN themes define identical `--rui-*` variable names. Changing the theme `<link>` instantly switches colors — zero other file changes.
