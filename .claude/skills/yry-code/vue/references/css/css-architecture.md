---
description: "CSS architecture for yry-html-vue 4-file components: the @import chain, layer responsibilities, token bridge pattern, and theme switching."
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
| **tokens.css** | `--yry-doc-*` design variables: color bridge, font stacks, spacing scale, radii, animation | Any selectors or rules |
| **base.css** | Reset, `.yry-doc` root, `code`/`pre`/`table`/`.card`/`.callout`/`.badge`/`.tabs`, `@keyframes`, `:focus-visible`, `prefers-reduced-motion` | Layout, component-specific styles |
| **layout.css** | `.sidebar`, `.main`, `h1`–`h4`, `.nav-link`, `.nav-group`, link styles | Responsive overrides, component styles |
| **responsive.css** | `@media` queries only: ≤768, ≤1024, ≥1440, <375 | Base styles, component styles |

## Token Bridge Pattern

```css
/* tokens.css — bridge CDN theme tokens to docs-specific names */
:root, .yry-doc {
    /* Surface (from CDN theme) */
    --yry-doc-bg:        var(--yry-bg-card);
    --yry-doc-bg-soft:   var(--yry-bg-flat);
    --yry-doc-bg-raised: var(--yry-bg-raised);

    /* Text (from CDN theme) */
    --yry-doc-text:         var(--yry-text);
    --yry-doc-text-soft:    var(--yry-text-soft);
    --yry-doc-text-muted:   var(--yry-text-muted);

    /* Brand (from CDN theme) */
    --yry-doc-primary: var(--yry-accent);

    /* Status (from CDN theme) */
    --yry-doc-success: var(--yry-pass);
    --yry-doc-warning: var(--yry-warn);

    /* Border (from CDN theme) */
    --yry-doc-border: var(--yry-border-color, #e2e8f0);

    /* Docs-specific tokens (NOT in CDN theme) */
    --yry-doc-font-sans: 'IBM Plex Sans', ...;
    --yry-doc-font-mono: 'JetBrains Mono', ...;
    --yry-doc-sidebar-width: 280px;
    --yry-doc-content-max-width: 1100px;
    --yry-doc-space-xs: 4px;
}
```

**Key principle**: All 10 CDN themes define identical `--yry-*` variable names. Changing the theme `<link>` instantly switches colors — zero other file changes.
