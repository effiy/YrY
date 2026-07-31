---
title: RagSources open-file handlers called window.open with a relative knowledge
  path, every click 404'd
key: bug_2026_07_30_rag_sources_open_file_broken_url
tags:
- rag
- routing
- ux
- knowledge
- regression
category: lessons/failures/bugs
created: '2026-07-30'
updated: '2026-07-30'
source: internal
type: bug
status: resolved
severity: major
priority: p1
project: YiVad
module: views/rag, views/story, views/aiChat, views/aicr
assignee: claude
reporter: claude
environment: dev (localhost:8848)
affectedVersion: 1.0.0
fixedVersion: 1.0.0
frequency: always
---

## Description
The `RagSources.vue` shared component emits an `open-file` event with the source's `file_path`, which is a path **relative to the YiKnowledge root** (e.g. `tech/ai-platform/foo-summary.md` or `projects/YiVad/rag/index.vue`). Four call sites handled that event by calling `window.open(\`${filePath}\`, "_blank", "noopener,noreferrer")`:

- `src/views/rag/index.vue` → `openFile(path)`
- `src/views/story/index.vue` → `onOpenSourceFile(filePath)`
- `src/views/aiChat/components/MessageBubble.vue` → `onOpenSourceFile(filePath)`
- `src/views/aicr/components/MessageBubble.vue` → `onOpenSourceFile(filePath)`

Because `filePath` is a relative path with no leading slash, `window.open` resolves it against the current page's URL. From `http://localhost:8848/#/rag` clicking a source navigated to `http://localhost:8848/tech/ai-platform/foo-summary.md` — not a real SPA route, not a static asset. The server returned the SPA's `index.html` (hash router), the new tab showed the home page, and the user thought the citation was broken. Every RAG citation click in every surface (playground, story chat, aiChat with RAG toggle, aicr chat) was affected.

## Steps to Reproduce
1. Open `http://localhost:8848/#/rag`, build the index, run a query.
2. Click on any source's `file_path` link.
3. A new tab opens to `http://localhost:8848/<relative-path>` and shows the SPA home page (not the file content).
4. Same behaviour in `/story` (Ask about this story dialog), in aiChat with the Knowledge RAG toggle on, and in aicr chat.

## Expected Result
Clicking a RAG citation opens the file in the Knowledge detail page — `router.push({ path: "/knowledge/detail", query: { path: filePath } })` — which reads the file via the `/knowledge-read` endpoint and renders it.

## Actual Result
`window.open` with a relative path resolved against the current URL; the new tab hit a non-existent path; the SPA fallback showed the home page. The user had no way to read the cited source file.

## Cause
The `RagSources.vue` component was introduced to render citations under chat messages, and each parent page wired `@open-file` to a handler that called `window.open(filePath)`. The `file_path` field returned by the backend's `rag_query` / `rag_chat_stream` is a **relative** path under `~/YiKnowledge` (see `domain/rag/indexer.py:_to_rel_file_path` which rewrites absolute SimpleDirectoryReader paths to relative). None of the call sites converted the relative path into a real SPA route. The aicr `MessageBubble.vue` even had a comment acknowledging "Knowledge file paths are relative to YiKnowledge" — but the chosen `window.open` was still wrong; it should have routed to the Knowledge detail page that was built for exactly this case.

## Solution
Replaced all four `window.open(\`${filePath}\`, "_blank")` call sites with `router.push({ path: "/knowledge/detail", query: { path: filePath } })`. Each component now imports `useRouter` from `vue-router`. The Knowledge detail page (`src/views/knowledge/Detail.vue`) reads `route.query.path` and calls `readKnowledgeFile` via `knowledgeService.readKnowledgeFile`, which POSTs to YiAi's `/knowledge-read` endpoint — the existing, correct path for reading a knowledge file's content + frontmatter. The `RagSources.vue` component itself is unchanged: its `open-file` event contract is preserved, only the parent handlers were fixed. `vue-tsc --noEmit` passes.
