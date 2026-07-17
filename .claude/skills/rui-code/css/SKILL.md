---
name: rui-code-css
description: >
  Curated CSS reference navigator — pull together CSS frameworks and pro
  tips from two upstream "awesome-…" repos, index them locally, and
  recommend the right framework, reset, or technique for a given task.

  Trigger when the user wants to: pick a CSS framework for a project
  (Bootstrap, Tailwind, Bulma, Pico, etc.), reset / normalize a
  stylesheet, evaluate utility-first vs. classless vs. general-purpose
  frameworks, find a quick CSS pattern for a recurring problem
  (centering, intrinsic ratio, focus styles, broken images, equal-width
  tables, comma-separated lists, lobotomized owl, etc.), choose between
  PostCSS / SCSS / LESS / vanilla CSS, build a retro / nostalgic UI,
  and find canonical CodePen demos for any CSS trick. Trigger words:
  CSS framework, CSS reset, CSS tips, CSS protips, normalize, modern
  reset, utility CSS, Tailwind, Bootstrap, Bulma, Pico, classless
  framework, SCSS framework, PostCSS, CSS pattern, CSS trick, CSS
  technique, vertically center, intrinsic ratio, lobotomized owl,
  best CSS framework for X, awesome CSS, list of CSS frameworks,
  CSS best practices, frontend CSS framework, CSS utility library.
  Do NOT trigger for: JavaScript framework selection, design system
  end-to-end (color / typography / motion) — those are out of scope
  of these two upstream repos.
lifecycle: default-pipeline
user_invocable: true
---

# rui-code-css — Curated CSS Reference Navigator

> Pick the right CSS framework, reset, or pattern. Pulls from two
> upstream "awesome-…" repos, indexes them locally.

## What this skill does

1. **Maps a CSS question** to a topic across two registered sources
   (`css-frameworks`, `css-protips`).
2. **Recommends a framework** with side-by-side context (category,
   language — SCSS / LESS / PostCSS / vanilla CSS, links to demo /
   docs / repo) and source provenance.
3. **Recommends a pattern** for a recurring CSS problem (centering,
   focus styles, intrinsic ratio, comma lists, equal-width tables)
   with the original CodePen demo link when available.
4. **Cites every recommendation** by exact title and URL with
   `[src:<source-id>]`.

## What this skill does NOT do

- Does NOT pull from upstream at answer time — uses a local snapshot.
- Does NOT teach CSS basics from scratch — it indexes curated lists.
- Does NOT cover JS frameworks, design tokens, or design systems
  beyond what the registered sources curate.

## Registered sources

- `css-frameworks` — [troxler/awesome-css-frameworks](https://github.com/troxler/awesome-css-frameworks) (~50 frameworks across 8 categories)
- `css-protips` — [AllThingsSmitty/css-protips](https://github.com/AllThingsSmitty/css-protips) (~18 topics with demos + references)

## Workflow

1. **Read** `references/sources.json` and `references/index.md`.
2. **Match** the user's intent:
   - "pick a framework" / "Bootstrap vs Tailwind vs Bulma" → look in
     `css-frameworks`, filter by category (utility-first / classless /
     general-purpose) and language (SCSS / LESS / PostCSS / vanilla).
   - "quick pattern for X" / "centering" / "intrinsic ratio" / "focus
     styles" / "lobotomized owl" → look in `css-protips`, surface the
     CodePen demo link when available.
   - "reset / normalize" → look in `css-frameworks` under reset category.
3. **Filter** to 1-3 high-signal picks.
4. **Cite** every recommendation with exact title + URL + `[src:…]`.

## Borders

| Boundary | Permission |
|----------|-----------|
| `references/**` | read |
| Skill directory | read + write |
| Outside the skill directory | no automatic writes |

## Supporting resources

- [references/index.md](./references/index.md) — unified topic index, start here.
- [references/sources.json](./references/sources.json) — registered sources.

## Fallback

| Situation | Behavior |
|-----------|----------|
| `references/index.md` missing | Re-run `/rui-init` to rebuild the index, or filter `sources.json` by topic manually. |
| Topic not in any registered source | State the gap, suggest the closest related topic. |
| User asks about JS frameworks / design tokens / design systems | Out of scope; defer to general Claude or the rui-tools/design-system skill. |
| User asks about a specific framework's API / config | Out of scope; point the user at the framework's official docs. |
| User asks in a language other than English | Respond in the user's language; keep resource titles in original language. |
