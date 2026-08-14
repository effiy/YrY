---
title: css
name: css
description: >
  Modern CSS patterns — cascade layers, container queries, custom properties,
  Grid, Flexbox, responsive design, and CSS-in-JS strategies. Invoke when the
  user is styling components, creating layouts, debugging CSS, implementing
  responsive breakpoints, authoring design tokens, or writing CSS architecture
  patterns. Trigger words: "CSS", "Grid", "Flexbox", "container query",
  "cascade layer", "custom property", "CSS variable", "media query",
  "responsive", "BEM", "SCSS", "Sass", "Tailwind", "CSS modules",
  "styled-components", "style", "layout", "centering", "z-index",
  "specificity", "animation", "transition", "transform".
  Do NOT trigger for: UI/UX design review (see /ui-ux), component library
  API usage (Element Plus, etc.), or JavaScript-driven styling.
lifecycle: active
user_invocable: true
status: stable
type: skill
source: internal
created: 2026-08-10
updated: 2026-08-10
category: aier/skills/css
review_cycle: quarterly
roles:
  - aier
tags:
  - skill
  - css
  - frontend
  - styling
chip: frontend
---
# CSS

Modern CSS best practices and patterns for production-grade styling.

## Core Concepts

- **Cascade Layers** — `@layer` for explicit specificity management
- **Container Queries** — component-based responsive design with `@container`
- **Custom Properties** — design tokens, theming, and dynamic values
- **Grid & Flexbox** — modern layout primitives and when to use each
- **Responsive Patterns** — mobile-first, breakpoint systems, fluid typography

## Key Rules

1. Prefer `@layer` over specificity hacks
2. Use `@container` for component-level responsiveness
3. Design tokens via custom properties on `:root`
4. Grid for 2D layouts, Flexbox for 1D alignment
5. Mobile-first media queries, ascending `min-width`