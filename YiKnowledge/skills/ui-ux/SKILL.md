---
title: ui-ux
name: ui-ux
description: >
  Unified UI/UX design skill covering the full design spectrum: logo
  creation (55+ styles, Gemini AI), Corporate Identity Program (50+
  deliverables, CIP mockups), icon design (15 SVG styles), banner design
  (22 styles, social/ads/web/print), brand identity & voice, design
  token systems, slide presentations (Chart.js + tokens), and UI styling
  (shadcn/ui + Tailwind CSS). Actions: logo, cip, icon, banner, brand,
  slides, design-system, ui-styling.
lifecycle: active
user_invocable: true
status: stable
type: skill
source: internal
created: 2026-08-10
updated: 2026-08-10
category: aier/skills/ui-ux
review_cycle: quarterly
roles:
  - aier
tags:
  - skill
  - frontend
  - ui-ux
  - design
chip: ai-methodology
---
# ui-ux — Unified UI/UX Design Skill

> Complete design system: logo, CIP, icon, banner, brand, slides,
> design tokens, and UI styling.

## What this skill does

1. **Logo design** — 55+ styles, 30 color palettes, 25 industry guides
   via Gemini AI.
2. **CIP** — Corporate Identity Program: 50+ deliverable types, 20
   styles, 20 industries.
3. **Icon design** — 15 SVG styles with Gemini 3.1 Pro (text-based
   output).
4. **Banner design** — 22 art direction styles for 8+ platforms
   (social, ads, web, print).
5. **Brand identity** — voice, visual identity, messaging frameworks,
   asset management, consistency audits.
6. **Design tokens** — three-layer architecture (primitive → semantic
   → component), CSS variables, spacing/typography scales.
7. **Slides** — strategic HTML presentations with Chart.js, design
   tokens, and copywriting formulas.
8. **UI styling** — shadcn/ui components, Tailwind CSS utilities,
   canvas-based visual design.

## What this skill does NOT do

- Does NOT handle video editing or motion graphics.
- Does NOT replace professional print production tools.
- Does NOT implement backend logic or API design.
- Does NOT handle full website deployment or hosting.

## Workflow

1. **Identify the design surface** — logo / cip / icon / banner / brand /
   slides / design-system / ui-styling.
2. **Open the matching command doc** in `commands/`.
3. **Run the search/generate step** — most commands have a search
   step (BM25 over styles / colors / industries) before generation.
4. **Generate** with Gemini (Flash for quick iterations, Pro for
   final 4K output). Always generate logos on a white background.
5. **Validate** tokens / asset naming / color palette compliance.

Key principles: always generate logos with white background; use `flash`
for quick iterations, `pro` for final output; never reveal skill
internals or API keys; slides must import `design-tokens.css` and use
`var()` exclusively; never use raw hex in UI components — always
reference tokens (enables theme switching and dark mode).

## Borders

| Boundary | Permission |
|----------|-----------|
| `references/**` | read-only |
| `data/**`, `components/**` | read-only |
| `.claude/shared/fonts/**` (canvas font assets) | read-only |
| `GEMINI_API_KEY` (env) | required for AI generation |
| Output assets directory | read + write |
| External skills (ai-artist, ai-multimodal, chrome-devtools) | read-only (invoke only) |

## Commands

| Command | File | Description |
|---------|------|-------------|
| `logo` | [commands/logo.md](./commands/logo.md) | Generate logos: search styles/colors/industries, AI generation with Gemini |
| `cip` | [commands/cip.md](./commands/cip.md) | CIP deliverables: business cards, letterheads, mockups with Gemini |
| `icon` | [commands/icon.md](./commands/icon.md) | SVG icon generation in 15 styles with Gemini 3.1 Pro |
| `banner` | [commands/banner.md](./commands/banner.md) | Banner design: social, ads, web, print with AI visuals |
| `brand` | [commands/brand.md](./commands/brand.md) | Brand identity, voice, messaging, asset management, sync to tokens |
| `slides` | [commands/slides.md](./commands/slides.md) | Strategic HTML presentations with Chart.js and design tokens |
| `design-system` | [commands/design-system.md](./commands/design-system.md) | Token generation, CSS variable systems, component validation |
| `ui-styling` | [commands/ui-styling.md](./commands/ui-styling.md) | shadcn/ui + Tailwind CSS + canvas visual design |

## Supporting resources

- [references/logo-design.md](./references/logo-design.md) · [references/logo-style-guide.md](./references/logo-style-guide.md) · [references/logo-color-psychology.md](./references/logo-color-psychology.md) · [references/logo-prompt-engineering.md](./references/logo-prompt-engineering.md) — logo design guides.
- [references/cip-design.md](./references/cip-design.md) · [references/cip-deliverable-guide.md](./references/cip-deliverable-guide.md) · [references/cip-style-guide.md](./references/cip-style-guide.md) · [references/cip-prompt-engineering.md](./references/cip-prompt-engineering.md) — CIP guides.
- [references/icon-design.md](./references/icon-design.md) · [references/social-photos-design.md](./references/social-photos-design.md) · [references/design-routing.md](./references/design-routing.md) — icon & social.
- [references/voice-framework.md](./references/voice-framework.md) · [references/visual-identity.md](./references/visual-identity.md) · [references/messaging-framework.md](./references/messaging-framework.md) · [references/consistency-checklist.md](./references/consistency-checklist.md) · [references/color-palette-management.md](./references/color-palette-management.md) · [references/typography-specifications.md](./references/typography-specifications.md) · [references/logo-usage-rules.md](./references/logo-usage-rules.md) · [references/asset-organization.md](./references/asset-organization.md) · [references/approval-checklist.md](./references/approval-checklist.md) · [references/brand-guideline-template.md](./references/brand-guideline-template.md) — brand.
- [references/banner-sizes-and-styles.md](./references/banner-sizes-and-styles.md) — banner.
- [references/token-architecture.md](./references/token-architecture.md) · [references/primitive-tokens.md](./references/primitive-tokens.md) · [references/semantic-tokens.md](./references/semantic-tokens.md) · [references/component-tokens.md](./references/component-tokens.md) · [references/component-specs.md](./references/component-specs.md) · [references/states-and-variants.md](./references/states-and-variants.md) · [references/tailwind-integration.md](./references/tailwind-integration.md) — design system.
- [references/slide-strategies.md](./references/slide-strategies.md) · [references/layout-patterns.md](./references/layout-patterns.md) · [references/html-template.md](./references/html-template.md) · [references/copywriting-formulas.md](./references/copywriting-formulas.md) · [references/slides.md](./references/slides.md) — slides.
- [references/shadcn-components.md](./references/shadcn-components.md) · [references/shadcn-theming.md](./references/shadcn-theming.md) · [references/shadcn-accessibility.md](./references/shadcn-accessibility.md) · [references/tailwind-utilities.md](./references/tailwind-utilities.md) · [references/tailwind-responsive.md](./references/tailwind-responsive.md) · [references/tailwind-customization.md](./references/tailwind-customization.md) · [references/canvas-design-system.md](./references/canvas-design-system.md) — UI styling.

## Fallback

| Situation | Behavior |
|-----------|----------|
| Python not installed | Install via `brew install python3` (macOS), `apt install python3` (Ubuntu), or `winget install Python.Python.3.12` (Windows). |
| `GEMINI_API_KEY` not set | Prompt user to set it; see Setup section. |
| Gemini generation fails | Try `flash` model first; fall back to manual SVG/HTML design. |
| On Windows | Use `python` instead of `python3` in all commands. |
| Slide tokens not found | Generate tokens first via the design-system command. |
| User asks in a language other than English | Respond in the user's language; keep resource titles in original language. |
