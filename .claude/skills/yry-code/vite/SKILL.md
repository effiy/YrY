---
name: yry-code-vite
description: >
  Curated Vite.js ecosystem navigator — pulls Vite starters, plugin
  registries, framework integrations, SSR tools, backend integrations,
  and showcase projects from vitejs/awesome-vite, indexes them
  locally, and recommends the right template, plugin, or example app
  for a given task. Trigger when the user wants to: pick a Vite
  starter template (React, Vue 3, Svelte, Solid, Electron, Tauri,
  Neutralino, Elm, Petite-Vue), find a Vite plugin for a capability
  (PWA, legacy browser support, SVG sprites, module federation,
  Windi/Tailwind, MDX, image optimization, compression, single-file
  build, mock server, GLSL, GraphQL, Rust/WASM), find a framework-
  specific Vite plugin (Vue Router, Vuex/Pinia, React Refresh,
  Preact preset, Svelte HMR, Solid Router, Fastify DX), find an SSR
  library (Vike, vite-ssr-boost, Vinxi, Rakkas, fastify-dx, domco),
  find a backend integration (Craft CMS, Django, Flask, Rails,
  Laravel, WordPress, Go, Rust, Node.js, ASP.NET Core, Drupal, PHP),
  find showcase projects (VitePress, Slidev, Astro, Ladle, IslandJS,
  Vituum), or migrate an existing project (Create React App → Vite
  via Viject). Trigger words: "vite", "vitejs", "vite plugin", "vite
  starter", "vite template", "vite awesome", "vite pwa", "vite ssg",
  "vite ssr", "vite hmr", "vite bundler", "vite rollup", "vite
  module federation", "vite wasm", "vite mock", "vite alias", "vite
  env", "vite docker", "vite vercel", "vite netlify", "vite
  electron", "vite tauri", "vite react", "vite vue", "vite svelte",
  "vite sveltekit", "vite solid", "vite preact", "vite elm", "vite
  fastify", "vite drupal", "vite wordpress", "vite laravel", "vite
  rails", "vite django", "vite flask", "vite rust", "vite go", "vite
  ASP.NET", "vite shopify", "vitepress", "slidev", "astro", "ladle",
  "vituum", "frontend build tool".

  Do NOT trigger for: Webpack-specific tooling, Rollup standalone
  tooling (without Vite), Parcel, esbuild CLI use, Turbopack, or any
  task unrelated to the curated Vite ecosystem above.
lifecycle: default-pipeline
user_invocable: true
---

# yry-code-vite — Curated Vite Ecosystem Navigator

> Pick the right Vite template, plugin, integration, or showcase project.
> Pulls from [vitejs/awesome-vite](https://github.com/vitejs/awesome-vite),
> ~506 resources across 7 categories and 71 topics.

## What this skill does

1. **Maps a Vite question** to a topic in the registered `awesome-vite`
   source.
2. **Recommends a starter template** for a chosen frontend stack
   (Vanilla, Vue 3, Vue 2, React, Svelte, Solid, Electron, Tauri,
   Neutralino, Elm, Petite-Vue, VanJS, GitHub Pages) with the official
   framework combo (Tailwind, TypeScript, Vitest, ESLint, Prettier).
3. **Recommends a plugin** for a specific capability (PWA, legacy browser,
   SVG sprites, module federation, MDX, image optimization, GLSL, GraphQL,
   Cesium, Comlink, Rust/WASM, single-file build, compression, mock
   server, env switching, browserslist, inspect). Distinguishes
   framework-agnostic from framework-specific (Vue / React / Preact /
   Svelte / Solid / Elm / Angular / Fastify / Electron). Tags Rollup
   plugin compatibility: `Included in Vite` / `Covered by default` /
   `Compatible` / `Community`.
4. **Recommends an SSR library or framework** (Vike, vite-ssr-boost,
   Vinxi, Rakkas, Vise, fastify-dx, domco) for the chosen frontend stack.
5. **Recommends a backend integration** (Craft CMS, Django, Flask, Rails,
   Laravel, WordPress, etc.) when a Vite app needs to play with a
   server-rendered host.
6. **Recommends a showcase project** for inspiration — open-source
   generators / SSGs (VitePress, Slidev, Astro, Ladle, IslandJS,
   Vituum, Compiiile, Gracile) and production apps.
7. **Cites every recommendation** by exact title and URL with
   `[src:awesome-vite]`.

## What this skill does NOT do

- Does NOT pull from upstream at answer time — uses a local snapshot.
- Does NOT teach Vite from scratch — point at the official Vite docs
  (https://vitejs.dev/) for conceptual / config / plugin authoring.
- Does NOT cover Webpack / Rollup standalone / Parcel / esbuild CLI /
  Turbopack.
- Does NOT cover Vite core debugging or plugin authoring.
- Does NOT auto-scaffold a project — recommend a template, then point
  the user at its README for setup.

## Workflow

1. **Read** `references/sources.json` and `references/index.json` (the
   manifest with `summary` + per-category `file` pointers). For a
   human-readable view of every resource, also read
   `references/index.md`.
2. **Open** the per-category file at `references/categories/<slug>.json`
   for the routed topic (e.g. `categories/plugins.json` for
   "Vite plugin for X", `categories/get-started.json` for "starter
   template for X framework", `categories/ssr.json` for "SSR for X").
3. **Match** the user's intent:
   - "starter template for X framework" → `Get Started / Templates / <framework>`
   - "scaffolding tool / create-X" → `Get Started / Get Started` (8 official scaffolders)
   - "plugin for X capability" → `Plugins / Framework-agnostic Plugins / <capability>` first; if framework-specific, `Plugins / <framework> / <capability>`
   - "Rollup plugin in Vite" → `Plugins / Rollup Plugins / <Included | Covered | Compatible | Community>`
   - "SSR for X" → `SSR / Libraries` or `SSR / Frameworks`
   - "Vite + <backend>" → `Integrations with Backends / <backend name>`
   - "showcase / example project" → `Projects Using Vite.js / Open Source` or `Apps/Websites`
4. **Filter** to 1-3 high-signal picks.
5. **Cite** every recommendation with exact title + URL + `[src:…]`.

## Borders

| Boundary | Permission |
|----------|-----------|
| `references/**` | read |
| Skill directory | read + write |
| Outside the skill directory | no automatic writes |

## Supporting resources

- [references/index.json](./references/index.json) — slim manifest of
  `sources`, a `summary` (category/topic/resource counts), and a
  `categories` list with `slug` + `file` pointer for each top-level
  category. Start here to discover what is registered.
- [references/index.md](./references/index.md) — human-readable topic
  index (every resource, with `[src:…]` provenance). Regenerate from
  the category JSON files when the upstream snapshot changes.
- [references/categories/](./references/categories/) — per-category
  payloads. One JSON file per top-level category (`resources.json`,
  `get-started.json`, `plugins.json`, `ssr.json`,
  `integrations-with-backends.json`, `migrations.json`,
  `projects-using-vite-js.json`). Open the one matching the routed
  topic.
- [references/sources.json](./references/sources.json) — registered
  sources.
- [references/README-awesome-vite.md](./references/README-awesome-vite.md) — verbatim upstream README.

## Fallback

| Situation | Behavior |
|-----------|----------|
| `references/index.md` missing | Grep `references/README-awesome-vite.md` directly, or read `references/categories/<slug>.json` for the routed topic. |
| `references/categories/<slug>.json` missing | Use `references/index.json` `categories[*].file` as the source of truth, then fall back to grepping `references/README-awesome-vite.md`. |
| Topic not in the registered source | State the gap, suggest the closest related topic. |
| User asks about Webpack / Rollup standalone / Parcel / Turbopack | Out of scope; defer to general Claude. |
| User wants me to actually scaffold a Vite project | Recommend a template or one of the 8 scaffolders, then hand off. |
| User asks for a "tutorial" or "guide" | `awesome-vite` doesn't curate tutorials; point at the official Vite docs (https://vitejs.dev/guide/). |
| User asks about Vite 1.x–7.x migration | Out of scope; point at the official Vite migration guide. |
| User asks about plugin authoring / Vite core internals | Out of scope; point at the official Vite plugin API docs. |
| `Migrations / Vue CLI` lookup | Upstream section is empty. State the gap, suggest community blog posts. |
| `Migrations / React` lookup | Recommend `Viject` (https://github.com/bhbs/viject) — the only entry for CRA → Vite. |
| User asks in a language other than English | Respond in the user's language; keep resource titles in original language. |
