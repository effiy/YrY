# YiH5

> Vanilla JavaScript ES-module single-page application for the H5
> mobile web: chat (streaming AI), news feed, and session management,
> powered by `api.effiy.cn`. No build tooling — served as static
> files with `YiPet/cdn` providing Vue 3 + shared components.

## System view

YiH5 is a mobile-first H5 web app built as a single `src/` tree of
vanilla JavaScript ES modules. There is no `package.json`, no bundler,
and no test runner. Vue 3 is loaded from a self-hosted CDN
(`YiPet/cdn/vendor/vue.global.prod.js`). The app talks to a backend at
`api.effiy.cn` for chat (streaming SSE), news (MongoDB-backed), FAQ,
and session persistence, authenticating each request with an `X-Token`
stored in `localStorage`.

## Command flow

| Command | What it does | Where |
|---------|--------------|-------|
| serve | `python3 -m http.server 8080` (or any static server) at the H5 source root | `/Users/ruiyi/Downloads/YrY/YiH5/` |
| open  | visit `http://localhost:8080/` | browser |
| test  | (none — no automated test framework; self-check is manual via `test/` story tree) | — |
| lint  | (none) | — |
| build | (none — served as static files) | — |

## Quick start

1. Confirm the H5 source is present at `/Users/ruiyi/Downloads/YrY/YiH5/`.
2. From the source root, start any static file server:
   ```
   cd /Users/ruiyi/Downloads/YrY/YiH5
   python3 -m http.server 8080
   ```
3. Open `http://localhost:8080/` in a mobile-width browser.
4. Set `X-Token` via the in-app settings panel (or via `localStorage`)
   — chat / session endpoints require it.
5. Verify the dashboard at `YiDoc/projects/YiH5/index.html` opens
   locally (no server needed — uses CDN).

**Goal-Driven Execution**: success = chat sends a message and receives
a streamed reply; sessions persist across reloads; news list paginates.

## Project structure

```
YiDoc/projects/YiH5/              ← docs hub (this cwd)
├── CLAUDE.md                     ← engineering guide (this run)
├── README.md                     ← project overview (this run)
├── index.html / .css / .js       ← dashboard 4-file set
├── data.js                       ← dashboard data model
├── arch/                         ← architecture story (5 scenes)
├── test/                         ← self-check story (6 scenes)
├── apis/                         ← API inventory report leaf
├── daily/                        ← CTO daily report leaf
├── files/                        ← file inventory report leaf
└── docs/                         ← H5 user-facing docs (Bootstrap, separate)

YiH5/                             ← actual source repo (read-only from here)
├── config.js                     ← app config (apiBase, endpoints, ui)
├── index.html                    ← HTML shell (#app mount)
├── assets/                       ← static assets
└── src/
    ├── main.js                   ← ES-module entry
    ├── App/                       ← root app component (index.html + index.js)
    ├── components/                ← FilterBar, ChatMessage, AppFooter, FaqPopup
    ├── views/                     ← ChatView, SessionList, NewsList
    ├── services/                  ← client, auth, faq, news, prompt, session, index
    ├── composables/               ← useChat, useListPage
    ├── utils/                     ← defineView, time
    ├── store/index.js             ← global reactive store
    ├── router/index.js            ← hash-based router
    └── styles/style.css           ← global stylesheet
```

## Domain Language

YiH5's domain centers on **mobile-first H5 AI chat sessions**.

### Term definitions

- **H5** — A mobile-web-optimized HTML5 page designed for in-app
  browsers on phones (typically served at `<1MB` initial payload, with
  viewport and safe-area insets for notch / home-indicator).
- **Session** — A persisted conversation thread between the user and
  the AI backend; each session owns its own message history and is
  identified by a server-assigned ID stored locally.
- **Chat Message** — A single turn in a session, either `user` or
  `assistant` role, rendered as Markdown with embedded Mermaid
  diagrams; assistant messages may be streamed token-by-token via SSE.
- **X-Token** — The authentication credential placed in the
  `X-Token` HTTP header on every API request; persisted in
  `localStorage` under a fixed key.
- **executeModule** — The unified backend RPC pattern used by
  `services/client.js`: a single `POST` to `apiBase` with a
  `module` + `operation` payload, returning a structured result.

### Relationships

- `H5` is the **platform** that hosts `Session`s.
- A `Session` **contains** many `Chat Message`s in chronological
  order.
- Every `Session` operation (create / list / delete / favorite)
  **uses** `executeModule` over HTTP, authenticated by `X-Token`.
- A `Chat Message` is **rendered by** the `ChatMessage` component,
  which consumes the `marked` + `mermaid` CDN libraries.

### Example dialogue

> **User**: "Start a new H5 chat session."
> **System**: Creates a `Session` via `executeModule('session',
> 'upsert')`, persists the returned ID, and navigates to `ChatView`.
>
> **User**: "Send 'hello'."
> **System**: Appends a `Chat Message` (role `user`) to the active
> `Session`, opens an SSE stream to the prompt endpoint with the
> `X-Token` header, and renders the streamed assistant reply as
> Markdown / Mermaid.
>
> **User**: "Reload the page."
> **System**: Reads `X-Token` from `localStorage`, rehydrates the
> `Session` list, and resumes the last active `Session`.

### Disambiguation markers

- **H5** ≠ HTML5 the standard ≠ the HTML5 boilerplate template. Here
  it specifically means the mobile-web delivery format.
- **Session** ≠ browser session ≠ HTTP session. Here it means a
  persisted AI chat thread on the backend.
- **Chat Message** ≠ a raw WebSocket frame. Here it is the
  application-level turn (one user utterance or one assistant reply).
- **X-Token** ≠ JWT ≠ session cookie. Here it is an opaque bearer
  string in a custom header.
- **executeModule** ≠ REST verb ≠ GraphQL. Here it is the project's
  specific RPC convention.

## Footer

Generated by the `yry-init` pipeline (`detect → explore → generate →
arch → reports? → verify`). See `CLAUDE.md` for engineering guidance
and `arch/` + `test/` for story-driven knowledge.
