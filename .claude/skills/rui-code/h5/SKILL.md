---
name: rui-code-h5
description: >
  Curated Vue 3 H5 / mobile-web navigator — combines best practices,
  a full reference H5 e-commerce project, and a starter template
  (all indexed locally) and recommends the right mix for a given
  task. Pulls from three upstream repositories registered in
  references/sources.json, indexes them into a single topic tree, and
  answers H5 / mobile-web / Vue3-mobile questions with exact titles,
  URLs, and source provenance. Trigger when the user wants to:
  scaffold a new Vue 3 H5 project, pick a Vue 3 + Vant 4 + Pinia +
  i18n starter, learn a specific H5 / mobile-web best practice
  (layered architecture, micro-frontend, JSBridge, offline package,
  error monitoring, page state, request cache, native API guard,
  style adaptation, form validation, gesture library, debug console,
  packet capture, deployment, FAQ), look up mobile-web H5 styling
  (vw/rem, 1px border, safe-area, viewport), find a reference H5
  project (H5 mall, e-commerce, newbee-mall), find a H5 starter
  template (vue3-h5-template, Vant starter), or get a H5 project
  stack recommendation (Vue 3 + Vant 4 + Pinia + better-scroll /
  Vite + Tailwind + i18n + dark mode). Trigger words: "h5", "mobile
  web", "vue3 h5", "vue3 mobile", "vue3 mobile template", "h5
  template", "h5 starter template", "h5 best practices", "mobile
  best practices", "vant template", "vant4 starter", "newbee-mall",
  "vue3 mall", "h5 e-commerce", "layered architecture", "clean
  architecture", "micro frontend", "jsbridge", "offline package",
  "error monitoring", "sentry", "page state persistence", "request
  cache", "vw adaptation", "rem adaptation", "1px", "safe area",
  "form validation", "gesture", "hammer", "vconsole", "eruda",
  "charles", "whistle", "webpack optimization", "packet capture",
  "mobile debugging", "vue3 e-commerce", "vue3 shop", "mobile
  webview", "taobao adaptation", "h5 performance", "h5 engineering",
  "h5 scaffold".

  Do NOT trigger for: pure React / Angular / mini-program / native
  client (iOS / Android native) work, server-side / Node.js backend
  questions, or non-H5 desktop work.
lifecycle: default-pipeline
user_invocable: true
---

# rui-code-h5 — Curated Vue 3 H5 / Mobile Web Navigator

> Pick the right template, learn the right pattern, copy the right
> reference. Pulls from three upstream repos, indexes them locally.

## What this skill does

1. **Maps a Vue 3 H5 / mobile-web question** to one of three registered
   sources, each with a different `kind`:
   - `mobile-web-best-practice` — best-practices knowledge base for 16
     mobile-web topics (layered architecture, micro-frontend, JSBridge,
     offline package, error monitoring, page state, request cache,
     native API guard, style adaptation, form validation, gesture library,
     webpack strategy, debug console, packet capture, deployment, FAQ).
   - `newbee-mall-vue3-app` — reference H5 e-commerce project on Vue 3
     + Vant 4 + Pinia + Vue-Router 4 + better-scroll. Login / home /
     product search / detail / cart / order / address modules.
   - `vue3-h5-template` — starter template on Vue 3 + Vite 8 + Vant 4
     + TS + Pinia + Tailwind + i18n + dark mode + Axios + Mock + eruda
     + ESLint + Husky. Three branches: `master` (TS), `i18n`
     (multi-language), `js-version` (pure JS).
2. **Recommends the right source(s)** for the user's intent.
3. **Cites every recommendation** by exact title and URL with
   `[src:<source-id>]` and the `kind` (`best-practices` /
   `reference-project` / `starter-template`).
4. **Flags coverage gaps** when a topic isn't well covered.

## What this skill does NOT do

- Does NOT auto-fetch new sources at answer time — uses a local snapshot.
- Does NOT scaffold a project for you — recommend a template, then
  point at the upstream README for setup.
- Does NOT cover React / Angular / mini-programs / native mobile.
- Does NOT cover backend / server-side topics — point the user at the
  `newbee-mall-api` repo for the matching API project.

## Workflow

1. **Read** `references/sources.json` and `references/index.md`.
2. **Match** the user's intent to a `kind`:
   - "scaffold / starter / template" → `starter-template` (`vue3-h5-template`).
     Surface the right branch (`master` / `i18n` / `js-version`) and the
     feature list.
   - "reference / real-world project / mall / e-commerce" → `reference-project`
     (`newbee-mall-vue3-app`). Surface tech stack + page modules + Juejin
     tutorial booklet.
   - "best practice / how to / adaptation / monitoring / performance" →
     `best-practices` (`mobile-web-best-practice`). Pick the matching
     topic (Architecture / JSBridge / Style Adaptation / Error
     Monitoring / Request Cache / Webpack Strategy).
3. **Filter** to 1-3 high-signal picks.
4. **Cite** every recommendation with exact title + URL +
   `[src:<source-id>]` + the `kind`.

## Borders

| Boundary | Permission |
|----------|-----------|
| `references/**` | read |
| Skill directory | read + write |
| Outside the skill directory | no automatic writes |

## Supporting resources

- [references/index.md](./references/index.md) — unified topic index, start here.
- [references/sources.json](./references/sources.json) — registered sources and their kind / dialect.
- [references/README-mobile-web-best-practice.md](./references/README-mobile-web-best-practice.md) — verbatim best-practices source.
- [references/README-newbee-mall-vue3-app.md](./references/README-newbee-mall-vue3-app.md) — verbatim newbee-mall source.
- [references/README-vue3-h5-template.md](./references/README-vue3-h5-template.md) — verbatim vue3-h5-template source.

## Fallback

| Situation | Behavior |
|-----------|----------|
| `references/index.md` missing | Grep `references/README-<source>.md` directly. |
| Topic not in any registered source | State the gap, suggest the closest related topic. |
| User wants to actually scaffold a project | Recommend `vue3-h5-template` (right branch) and point at its README for `pnpm install` / `pnpm dev`. |
| User wants a real H5 shop code reference | Recommend `newbee-mall-vue3-app` and the matching `newbee-mall-api` for the backend. |
| User wants a specific best practice (1px border, vw adaptation) | Point at the matching topic in `mobile-web-best-practice`; if the starter template demonstrates the pattern, also surface it. |
| User asks about React / Angular / mini-programs / native | Out of scope; defer to general Claude. |
| User asks in a language other than English | Respond in the user's language; keep resource titles in original language. |
