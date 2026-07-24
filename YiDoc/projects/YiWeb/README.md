# YiWeb · AI Code Review Web Application

> Vue 3 SPA · three views (aicr / claude / story) · hook-pattern state
> management · CDN-based component system. Source root:
> `/Users/ruiyi/Downloads/YrY/YiWeb/`.

## System view

YiWeb is a single-page application that hosts three independently-bootstrapped
views — `aicr` (AI code review), `claude` (Claude project explorer), and
`story` (story/dependency editor). Each view owns its own state via the
"hook pattern" (`store` + `useComputed` + `useMethods` composables), and all
views share a `src/services/` layer that wraps fetch, auth, business-process,
and session-sync concerns. Vue 3 is loaded from a self-hosted CDN
(`/YiPet/cdn/vendor/vue.global.prod.js`); there is no `package.json` and no
build step — source ships as native ES modules with absolute CDN imports.

## Command flow

| Command | Purpose |
|---------|---------|
| `python3 -m http.server 8080` (in source root) | Serve the SPA locally (Nginx in prod) |
| Nginx reverse proxy | Routes `/cdn/`, `/src/`, `/api/`, `/ollama/` |
| `ollama serve` (or `ollama.effiy.cn`) | Local LLM inference backend |
| No `npm install` | CDN-loaded — no install step |
| No `npm test` | No automated test runner; verify via `docs/test/` scenes |

## Quick start

1. Serve `/Users/ruiyi/Downloads/YrY/YiWeb/` over HTTP (e.g.
   `python3 -m http.server 8080` from that directory).
2. Ensure `ollama` is reachable on the endpoint configured in `config.js`
   (default `http://localhost:11434`, prod `ollama.effiy.cn`).
3. Set the `X-Token` value via the in-app API-settings dialog (handled by
   `src/services/authUtils.js`) — required for any authenticated endpoint.
4. Open the served `index.html`, pick a view from the top nav
   (`aicr` / `claude` / `story`).
5. To inspect the documentation catalog entry for this project, open
   `/Users/ruiyi/Downloads/YrY/YiDoc/projects/YiWeb/index.html` in a browser.

**Goal-Driven Execution** — success criteria: (a) the SPA boots without
console errors, (b) each of the three views renders its initial state,
(c) the API-settings dialog persists the `X-Token` in `localStorage`.

## Project structure

```
YiWeb/
├── index.html            # SPA entry shell (served by Nginx)
├── config.js             # ENV + ENDPOINTS (local / prod)
├── assets/               # favicon
├── cdn/                  # symlink / mount point for /YiPet/cdn
└── src/
    ├── views/
    │   ├── aicr/          # AI Code Review view
    │   │   ├── index.{html,js}
    │   │   ├── composables/   # 24 hook modules (chat, fileTree, session, tag…)
    │   │   ├── state/         # storeFactory + ops (fileTree, sessions, ui, fileContent)
    │   │   └── styles/        # codePage, layout, welcomeCard, contextModals
    │   ├── claude/        # Claude project explorer view
    │   │   ├── index.{html,js}
    │   │   ├── composables/   # store + useMethods + useComputed
    │   │   └── styles/
    │   └── story/         # Story management view
    │       ├── index.{html,js}
    │       ├── composables/   # storyData, storyEdit, storyDeps, filter, useMethods
    │       ├── state/         # storeState, storeFactory
    │       ├── utils/         # knowledgeGraphUtils
    │       └── styles/
    ├── components/        # 3 shared UI primitives (YiGlobalLoading, YiNoScript, YiSkipLink)
    ├── services/          # 12 modules (auth, request, crud, business, sessionSync…)
    ├── composables/       # useViewInit (shared bootstrap)
    ├── utils/             # 8 helpers (resizer, listenerManager, modelService, view…)
    └── styles/            # common.css
```

## Domain Language

YiWeb's domain is **AI-assisted code review over a knowledge graph of
"stories"** — the same project surfaces three lenses (aicr / claude / story)
over a shared session + tag model.

- **Story** — a unit of captured knowledge: a requirement, design note, or
  bug fix that can have bidirectional dependencies on other stories. Edited
  in the `story` view; surfaced as context in the `aicr` chat.
- **Session** — a single chat conversation in the `aicr` view. A session
  owns a file tree (the code under review), a chat log, and per-session
  tags. Sessions sync to the backend via `sessionSyncService.js`.
- **Hook pattern** — the per-view state convention: `store` (reactive
  state), `useComputed` (derived state), `useMethods` (actions). Every
  view follows this triple; new state lives in the owning view's
  `composables/`.
- **File-to-story mapper** — the cross-view bridge that maps a code file
  to the stories that touch it (`src/views/story/utils/knowledgeGraphUtils.js`,
  `src/utils/fileToStoryMapper.js`).
- **Tag** — a multi-level filter primitive (skill / template / rule /
  agent). Tags are managed in `tagManagerMethods.js` and consumed by
  `tagFilterMethods.js` to scope the file tree.

### Relationships

- **Story** ↔ **Story**: bidirectional dependencies (parent / child
  rendered both ways by `depEditor`).
- **Session** → **Story**: a session can attach stories as chat context;
  the file-to-story mapper resolves which stories touch the session's
  file tree.
- **Tag** → **Session / Story**: tags filter both sessions (in `aicr`)
  and stories (in `story`); the same tag taxonomy is shared.
- **Hook pattern** ⊇ **Story / Session / Tag**: the hook pattern is the
  container; the other three are domain entities managed inside it.

### Example dialogue

> User: "Show me every story that touches `requestHelper.js`."
> System (story view): runs `knowledgeGraphUtils.fileToStories()`,
> returns the matching stories, highlights the dependency edges in the
> graph.
> User: "Open an aicr session with that file tree."
> System (aicr view): creates a session, attaches the file tree, opens
> the chat context with the linked stories pre-attached.
> User: "Filter by the `auth` skill tag."
> System: `tagFilterMethods.js` narrows the file tree to files tagged
> with the `auth` skill.

### Disambiguation markers

- "story" in this codebase **never** means a user story in the agile
  sense; it always means a knowledge-graph node editable in the `story`
  view.
- "session" **never** means a browser session or HTTP session; it is
  specifically an aicr chat conversation.
- "hook" **does not** refer to Vue lifecycle hooks alone — it refers to
  the per-view `composables/*.js` modules that follow the store +
  computed + methods triple.
- "tag" is broader than a UI label — it includes skill / template /
  rule / agent taxonomies, not free-form labels.
