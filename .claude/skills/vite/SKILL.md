---
name: vite
description: >
  Vite.js build tool & ecosystem navigator. Covers Vite configuration,
  plugins, framework integrations, SSR/SSG, and migration from other
  bundlers. Invoke when the user wants to: configure Vite (`vite.config.ts`),
  add a Vite plugin (PWA, SVG sprites, module federation, image optimization,
  compression, mock server, Windi/Tailwind, MDX, GLSL, GraphQL, Rust/WASM),
  integrate a framework with Vite (Vue, React, Svelte, Solid, Preact),
  set up SSR/SSG (Vike, Vinxi, Rakkas), configure env variables and modes,
  optimize build (code splitting, tree shaking, chunking), set up dev server
  proxy, or migrate from CRA/Webpack to Vite.
  Trigger words: "vite", "vitejs", "vite plugin", "vite config",
  "vite build", "vite dev", "vite ssr", "vite ssg", "vite env",
  "vite proxy", "vite alias", "vite pwa", "vite react", "vite vue",
  "vite svelte", "Rsbuild" (Vite successor).
  Do NOT trigger for: framework-specific component patterns (see /vue, /react),
  general webpack/Rollup/esbuild questions without Vite context.
lifecycle: default-pipeline
user_invocable: true
---

# vite — Vite.js Build Tool & Ecosystem

> Configure, plugin, optimize — the canonical Vite reference covering config, plugins, SSR, and migration.

## What this skill does

1. **Configuration** — `vite.config.ts` structure: `defineConfig`, plugins array, resolve aliases (`@/`), env prefix (`VITE_*`), build options (`rollupOptions`, `chunkSizeWarningLimit`, `target`).
2. **Plugins** — official Vue/React/Svelte plugins, PWA (`vite-plugin-pwa`), SVG sprites, module federation, image optimization, compression (brotli/gzip), mock server, Windi/Tailwind CSS, MDX, GraphQL, Rust/WASM.
3. **Framework integrations** — Vue Router + Pinia, React Router + Redux/Zustand, SvelteKit, Solid Router, Preact preset.
4. **SSR/SSG** — Vike (formerly vite-plugin-ssr), Vinxi, Rakkas, fastify-dx, domco.
5. **Env variables** — `VITE_*` prefix, `.env` files (`.env`, `.env.local`, `.env.[mode]`), `import.meta.env`, TypeScript intellisense via `env.d.ts`.
6. **Dev server** — proxy configuration, HMR, `server.port`, `server.open`, middleware.
7. **Build optimization** — code splitting, chunk strategies, tree shaking, CSS code splitting, `manualChunks`, `build.minify` (esbuild/terser).
8. **Migration** — CRA → Vite (viject), Webpack → Vite, Rsbuild (Vite successor in this project).
9. **Backend integrations** — Craft CMS, Django, Flask, Rails, Laravel, WordPress, Go, Rust, Node.js, ASP.NET Core.

## What this skill does NOT do

- Does NOT cover framework-specific component patterns — use `/vue`, etc.
- Does NOT cover general Rollup/esbuild configuration outside Vite context.
- Does NOT cover deployment/hosting (Vercel, Netlify, Docker) in depth — provide config snippets only.
- Does NOT replace the official Vite docs — for deep API reference, point to https://vitejs.dev/.

## Workflow

1. **Identify the task** — config change / plugin addition / SSR setup / migration / optimization.
2. **Read project's current Vite/Rsbuild config** to understand baseline.
3. **Apply the change** — add plugin, update config, adjust env vars.
4. **Verify** — `vite build` (or `rsbuild build`) must succeed; check bundle size and chunk layout.

## Borders

| Boundary | Permission |
|----------|-----------|
| `vite.config.ts` / `rsbuild.config.ts` | read + write |
| `package.json` | read + write (for plugin deps) |
| `.env*` files | read |
| Official Vite docs (https://vitejs.dev/) | reference only |
| Skill directory | read + write |
| Outside the project | no automatic writes |

## Fallback

| Situation | Behavior |
|-----------|----------|
| User asks about Webpack/Rollup/esbuild standalone | Out of scope; defer to general knowledge. |
| User asks about Rsbuild (this project's bundler) | Apply Vite knowledge with Rsbuild-specific adaptations; Rsbuild wraps Rspack. |
| Plugin not in curated index | Search npm for `vite-plugin-*`; verify compatibility. |
| Build failure after config change | Roll back and check the Vite/Rsbuild error output; suggest `--debug` flag. |
| User asks in a language other than English | Respond in the user's language; keep identifiers in original. |
