---
name: rui-tools-mermaid
description: >
  Render beautiful Mermaid diagrams as SVG or ASCII art using the beautiful-mermaid library.
  Supports 15+ themes, 5 diagram types (flowchart, sequence, state, class, ER), and ultra-fast rendering.

  Use this skill when:
  1. User asks to "render a mermaid diagram" or provides .mmd files
  2. User requests "create a flowchart/sequence diagram/state diagram"
  3. User wants to "apply a theme" or "beautify a diagram"
  4. User needs to "batch process multiple diagrams"
  5. User mentions "ASCII diagram" or "terminal-friendly diagram"
  6. User wants to visualize architecture, workflows, or data models
lifecycle: default-pipeline
user_invocable: true
---

# rui-tools-mermaid

> Render stunning, professionally-styled Mermaid diagrams. Supports SVG for
> web/docs and ASCII for terminals. 15+ themes, 5 diagram types.

## What this skill does

1. **Render a single diagram** from a `.mmd` file or inline code block to
   SVG or ASCII. Picks a theme, output format, and options (transparent
   background, custom font, custom colors).
2. **Batch render a directory** of `.mmd` files in parallel (default 4
   workers) — SVG for docs, ASCII for README.
3. **Apply a theme** — 15 themes available: `tokyo-night` (dark mode),
   `github-light` (light mode), `dracula` (vibrant), `nord` (minimal),
   `catppuccin-mocha`/`latte`, `zinc-light`/`zinc-dark`, `solarized-dark`/
   `light`, `one-dark`, `github-dark`, `tokyo-night-storm`/`light`.
4. **Pick a diagram type** — flowchart (process/workflow), sequence (API
   calls/interactions), state (lifecycle/FSM), class (object model), ER
   (database schema).

## What this skill does NOT do

- Does NOT install `beautiful-mermaid` for you — if rendering fails with
  `Cannot find module 'beautiful-mermaid'`, the user must run `npm install`
  in the skill directory.
- Does NOT validate Mermaid syntax beyond what the library reports — for
  tricky syntax, test on https://mermaid.live/ first.
- Does NOT invent diagram content — the user describes the system; this
  skill picks the type and renders it.

## Workflow

1. **Identify user intent**: render existing code / create new diagram /
   apply theme / batch process.
2. **Pick output format**: SVG (web, docs, presentations) or ASCII
   (terminal, logs, plain text).
3. **Pick diagram type** (if creating): process → flowchart; API flow →
   sequence; states → state; object model → class; database → ER.
4. **Pick theme**: dark mode docs → `tokyo-night`; light mode docs →
   `github-light`; vibrant → `dracula`; projector / presentation →
   `zinc-light` (high contrast).
5. **Render** with the render command, then verify the output opens.

## Borders

| Boundary | Permission |
|----------|-----------|
| `references/**` | read |
| Skill directory | read + write |
| Outside the skill directory | no automatic writes |

## Supporting resources

- [references/THEMES.md](./references/THEMES.md) — detailed theme reference with examples.
- [references/DIAGRAM_TYPES.md](./references/DIAGRAM_TYPES.md) — comprehensive syntax guide for all diagram types.
- [references/api_reference.md](./references/api_reference.md) — beautiful-mermaid API documentation.

## Fallback

| Situation | Behavior |
|-----------|----------|
| `beautiful-mermaid` not installed | Tell the user to run `npm install` in the skill directory, then retry. |
| Invalid Mermaid syntax | Suggest testing on https://mermaid.live/ first; cite [references/DIAGRAM_TYPES.md](./references/DIAGRAM_TYPES.md) for common errors (missing spaces, bad node shape, unclosed brackets). |
| Input file not found | Ask the user to verify the path; suggest absolute path. |
| User wants a theme not in the 15-list | State the gap; suggest the closest available theme. |
| User asks in a language other than English | Respond in the user's language; keep theme names in original English. |
