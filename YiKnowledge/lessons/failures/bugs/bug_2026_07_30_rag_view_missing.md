---
title: staticRouter imported @/views/rag/index.vue but the view file was never created, blocking build
key: bug_2026_07_30_rag_view_missing
tags:
- router
- missing-view
- build-blocker
category: lessons/failures/bugs
created: '2026-07-30'
updated: '2026-07-30'
source: internal
type: bug
status: resolved
severity: major
priority: p1
project: YiVad
module: routers/modules/staticRouter
iteration: 2026-S1
defectUrl: ''
assignee: claude
reporter: claude
environment: dev (rsbuild build:dev)
affectedVersion: 1.0.0
fixedVersion: 1.0.0
frequency: always
---

## Description
`pnpm build:dev` failed at module-resolution time with `Cannot find module '@/views/rag/index.vue' for matched aliased key '@'`. The static router file had declared a `/rag` route pointing at `() => import("@/views/rag/index.vue")` — apparently in anticipation of a RAG playground view — but the view itself was never committed. The store (`src/stores/modules/rag.ts`) and the API service (`src/api/modules/ragService.ts`) were both present and wired; only the view was missing. Because `staticRouter.ts` is imported from `src/routers/index.ts` which is imported from `src/main.ts`, the missing module surfaced as a hard build blocker before any route could render.

## Steps to Reproduce
1. `pnpm build:dev` in `YiVad/`.
2. Rsbuild emits `File: ./src/routers/modules/staticRouter.ts:1:1` × `Cannot find module '@/views/rag/index.vue'`.
3. Build fails in ~6s with `Rspack build failed`.

## Expected Result
Every route declared in `staticRouter.ts` resolves to a real `.vue` file under `src/views/`. Either the view is committed alongside the route, or the route is removed.

## Actual Result
The `/rag` route was declared but the corresponding view was never created, so the build could not resolve the dynamic import.

## Cause
The route was added speculatively — the store and service were built first, and the route was wired to match them, but the view itself was deferred and never landed. Static routes in this app are eagerly loaded from `staticRouter.ts`, so unlike dynamic routes (which only fail when the user navigates to them), the missing view fails the entire build at resolution time. The Rsbuild→Rspack→Vue stack has no concept of "lazy route that resolves later"; a missing `import()` target is a build-time hard error.

## Solution
Applied — created `src/views/rag/index.vue` as a RAG playground page that consumes the existing `useRagStore` store (`refreshStatus`, `rebuild`, `runQuery`, `sendChat`, `stopChat`, `clearChat`) and renders three panels: index status, one-shot retrieval, and streaming chat with sources rendered via the existing `RagSources.vue` component. The view reuses the existing `useMarkdown` hook for assistant-turn rendering. No new store or service code was needed — the fix is purely the missing view file. Process follow-up (not yet landed): add a CI check that greps `staticRouter.ts` for `import("@/views/...")` paths and asserts each resolves to a real file, so a speculative route cannot land without its view.
