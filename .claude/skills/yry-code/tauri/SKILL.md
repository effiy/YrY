---
name: yry-code-tauri
description: >
  Curated Tauri ecosystem navigator — uses local indexes derived from
  tauri-apps/awesome-tauri for templates, plugins, integrations,
  articles, and showcase apps, and recommends the
  right template, plugin, or example app for a given task. Trigger
  when the user wants to: pick a Tauri starter template (React, Vue,
  Svelte, Solid, Angular, Next.js, Nuxt, Yew, Leptos), find a Tauri
  plugin for a capability (clipboard, file system, store, network,
  notifications, BLE, MQTT, deep linking, autostart, updater), find
  a Tauri integration with another framework (Axios adapter, Vite
  plugin, Angular wrapper, htmx, Deno, MCP server), find example /
  showcase Tauri apps (audio / video, ChatGPT clients, developer
  tools, finance, gaming, productivity), or find Tauri tutorials /
  articles (SQLite + Tauri, mobile, state management, Actix
  integration, async patterns). Trigger words: "tauri", "tauri
  template", "tauri plugin", "tauri starter", "tauri awesome",
  "tauri v2", "tauri v1", "tauri mobile", "tauri ios", "tauri
  android", "tauri desktop app", "tauri scaffold", "tauri example",
  "tauri tutorial", "tauri integration", "tauri with react", "tauri
  with vue", "tauri with svelte", "tauri with next.js", "tauri with
  yew", "tauri with leptos", "tauri with deno", "tauri with rust",
  "tauri with fastapi", "tauri clipboard", "tauri file system",
  "tauri store", "tauri mqtt", "tauri ble", "tauri sqlite", "tauri
  mcp", "tauri menubar", "tauri tray", "tauri deep link", "tauri
  autostart", "tauri updater", "cross-platform desktop".

  Do NOT trigger for: non-Tauri desktop frameworks (Electron,
  Neutralino, Wails, Flutter desktop), Tauri core / API debugging,
  or any task unrelated to the curated Tauri ecosystem above.
lifecycle: default-pipeline
user_invocable: true
---

# yry-code-tauri — Curated Tauri Ecosystem Navigator

> Pick the right Tauri template, plugin, integration, or example app.
> Pulls from [tauri-apps/awesome-tauri](https://github.com/tauri-apps/awesome-tauri),
> ~420 resources across 3 categories and 23 topics.

## What this skill does

1. **Maps a Tauri question to a topic** across the single registered
   source (`awesome-tauri`).
2. **Recommends a template** for a chosen frontend stack (React, Vue,
   Svelte, Solid, Angular, Next.js, Nuxt, Yew, Leptos, etc.) with the
   official framework combo (Tailwind, shadcn/ui, TypeScript, Vite, HMR,
   GitHub Actions).
3. **Recommends a plugin** for a specific capability (clipboard, file
   system, store, network, BLE, MQTT, notifications, deep linking,
   autostart, autoupdate) — distinguishes official plugins (Tauri team)
   from community, and tags v1-only vs v2-ready.
4. **Recommends a showcase application** for inspiration or as a code
   reference, bucketed by domain (audio & video, ChatGPT clients, data,
   developer tools, finance, gaming, learning, productivity, security).
5. **Cites every recommendation** by exact title and URL with the
   `[src:awesome-tauri]` tag.

## What this skill does NOT do

- Does NOT pull from upstream at answer time — uses local indexes in
  `references/`.
- Does NOT teach Tauri from scratch — recommend the upstream Tauri docs
  (https://v2.tauri.app/start/) for conceptual questions.
- Does NOT cover non-Tauri desktop frameworks (Electron, Neutralino,
  Wails, Flutter desktop).
- Does NOT cover Tauri core / API debugging or migration scripting —
  use the official Tauri docs and migration guides.
- Does NOT auto-generate project scaffolding — recommend a template,
  then point the user at its README.

## Workflow

1. **Read** `references/sources.json` and `references/index.md`.
2. **Match** the user's intent:
   - "starter template for X framework" → `Getting Started / Templates`,
     filter by frontend stack.
   - "plugin for X capability" → `Development / Plugins`, filter by
     capability keyword. Distinguish `Official Plugins` from community;
     note the `v1` / `v2` badge when it matters.
   - "example app for X domain" → `Applications / <Domain>`.
   - "how do I do X in Tauri" / "tutorial for X" → `Getting Started /
     Guides & Tutorials` or `Development / Articles`.
3. **Filter** to 1-3 high-signal picks — prefer fewer, well-chosen
   resources over a dump of 50 links.
4. **Cite** every recommendation with exact title + URL + `[src:…]`.
   Do not paraphrase the title.

## Borders

| Boundary | Permission |
|----------|-----------|
| `references/**` | read |
| Skill directory | read + write |
| Outside the skill directory | no automatic writes |

## Supporting resources

- [references/index.md](./references/index.md) — unified topic index, start here.
- [references/index.json](./references/index.json) — machine-readable index for filtering topics and resources.
- [references/sources.json](./references/sources.json) — registered sources.

## Fallback

| Situation | Behavior |
|-----------|----------|
| `references/index.md` missing | Read `references/index.json` directly. |
| Topic not in any registered source | State the gap, suggest the closest related topic (e.g. "no Tauri mobile templates in the registry — check `tauri-mobile` upstream"). |
| Stale README (upstream has moved on) | Tell the user the snapshot may be stale; suggest re-fetching from the upstream `tauri-apps/awesome-tauri` repo. |
| User asks about Tauri 1.x vs 2.x migration | Out of scope; point the user at the official Tauri migration guide. |
| User asks about non-Tauri desktop frameworks (Electron, Wails, etc.) | Out of scope; defer to general Claude. |
| User wants to actually scaffold a Tauri project | Recommend a template from the index, then hand off — this skill is a navigator, not a generator. |
| User asks in a language other than English | Respond in the user's language; keep resource titles in original language. |
