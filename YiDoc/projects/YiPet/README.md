# YiPet · AI Chrome Extension

> The `## Domain Language` section at the bottom of this file is
> **user-curated**. The pipeline rebuilds every other section on every
> `yry-init` run, but appends the domain-language section only if it
> is absent, and preserves it if it is already present.

## System view

YiPet is a Manifest V3 Chrome extension that ships an AI companion
("温柔陪伴助手") as a content-script inject. The extension is
fully self-hosted (no public CDN dependency), organized as IIFE
modules loaded via `content_scripts` in `manifest.json`, and uses
26 self-built Vue 3 / Custom-Element components backed by 49
vendored third-party libraries. The reference code path ships 275
source files (205 JS + 70 CSS) across four business modules:
`core` / `extension` / `pet` / `faq`. This catalog hub (`YiPet/`)
is the documentation project for the extension — it contains the
baseline docs, the architecture and self-check story trees, the
file / API / daily report leaves, and the standalone dashboard
home that ties them together.

## Command flow

| Action | Command | Notes |
|--------|---------|-------|
| Open dashboard | open `index.html` in a browser | No build step; Vue 3 loaded from `../../.claude/shared/loader.js` |
| Inspect arch stories | open `arch/index.html` | 6 scenes, each with §0–§4 lifecycle |
| Inspect self-check stories | open `test/index.html` | 6 scenes, each with §0–§4 lifecycle |
| File inventory | open `files/index.html` | 563 files · 21.8 MB audit |
| API inventory | open `apis/index.html` | 33 endpoints · 48-point scoring |
| Daily reports | open `daily/index.html` | Cadence-bucketed archive |
| Reference docs | open `docs/index.html` | Changelog / FAQ / setup / specs / modules |

## Quick start

1. Clone the repository and navigate to `YiDoc/projects/YiPet/`.
2. Open `index.html` in any modern browser — no build step, no
   `npm install`. Vue 3 is loaded from the shared CDN at
   `../../.claude/shared/loader.js`.
3. Verify the dashboard mounts: the header shows "🐾 YiPet · AI
   Chrome Extension" and the stats row reads `26 · 49 · 4 · 275`.
4. Navigate the panel hub (Architecture / Self-Check / Files /
   APIs) to reach the four report leaves.
5. Run a pipeline rebuild with `/yry-init` to regenerate
   `CLAUDE.md`, `README.md` (non-domain sections), and the
   dashboard data model (`data.js`). Existing scene `index.md`
   files in `arch/` and `test/` are preserved.

## Project structure

```
YiPet/
├── CLAUDE.md               # Pipeline baseline (rebuilt each run)
├── README.md               # System view + Domain Language (append-once)
├── index.html              # Dashboard shell (template from yry-init)
├── index.css               # Dashboard styles (template from yry-init)
├── index.js                # Dashboard Vue 3 mount (template from yry-init)
├── data.js                 # Dashboard data model (regenerated each run)
├── arch/                   # Architecture stories · 6 scenes (§0–§4)
│   ├── index.html          # Arch diagram dashboard
│   ├── index.css           # Arch dashboard styles
│   ├── data.js             # Arch data model
│   └── scene-N-<slug>/index.md
├── test/                   # Self-check stories · 6 scenes (§0–§4)
│   ├── index.html          # Self-check dashboard
│   └── scene-N-<slug>/index.md
├── apis/                   # API inventory report leaf
│   ├── index.html
│   └── data.js
├── daily/                  # Daily report archive
│   ├── index.html
│   ├── gen_daily.js
│   └── YYYY-MM-DD.js
├── files/                  # File inventory report leaf
│   ├── index.html
│   └── data.js
└── docs/                   # Reference docs (changelog, FAQ, setup, specs)
    ├── index.html
    ├── changelog.html
    ├── customization.html
    ├── faq.html
    ├── modules.html
    ├── setup.html
    └── specifications.html
```

## Domain Language

The YiPet extension operates within a domain of **AI companionship**,
**content-script injection**, and **IIFE module composition**. The
terms below are the canonical vocabulary for this project; use them
consistently in commits, reviews, and scene documentation.

### Terms

- **Pet** — The AI companion entity. A Pet instance owns the
  chat state, the drag interaction, and the UI rendering. There
  is exactly one active Pet per page inject, held by `PetManager`.
- **PetManager** — The singleton class (`petManager.core.js`) that
  owns the Pet's lifecycle: state initialization, message routing,
  and the DOM mount. Every business sub-module
  (`petManager.chat.js`, `petManager.ui.js`, `petManager.drag.js`,
  …) extends the class via shared-prototype injection, not ES
  imports.
- **Content Script** — The Chrome MV3 injection mechanism.
  `manifest.json` declares an ordered array of IIFE scripts;
  Chrome loads them into the host page's context. The ordering
  in the manifest is the dependency graph — there is no build
  tool and no source map.
- **CDN Component** — A self-hosted Custom Element shipped under
  `cdn/components/`. Each component is a three-file unit
  (`index.js` + `index.css` + `index.html`), registered via
  `customElements.define`, and loaded on demand by `cdn/loader.js`.
- **ApiManager** — The fetch-interceptor chain
  (`core/api/core/ApiManager.js`). Every REST call passes through
  it; it owns the `X-Token` injection, retry policy, and the
  mute-logger hook.
- **StorageHelper** — The persistence facade
  (`core/bootstrap/bootstrap.js`). Abstracts `chrome.storage.local`
  and provides the default-location fallback when the user has
  not yet picked a Pet position.

### Relationships

- `PetManager` **owns** the `Pet` (parent → child; one-to-one).
- `Content Script` **loads** `PetManager` (producer → consumer;
  ordered by `manifest.json`).
- `ApiManager` **serves** `PetManager` (infrastructure → business;
  via `globalThis.ApiManager`).
- `CDN Component` **extends** the host page DOM (injection;
  registered on demand via `cdn/loader.js`).
- `StorageHelper` **persists** `PetManager` state (state → storage;
  via `window.StorageHelper`).

### Example dialogue

> **Developer**: "Where does the chat message flow live?"
> **System**: "Chat messages flow through `PetManager` →
> `petManager.chat.js` (send + stream receive) → `ApiManager`
> (interceptor chain, `X-Token` injection) → backend. The rendered
> bubble is mounted by `petManager.ui.js` and styled by
> `chat.css`. The `ChatWindow/index.js` Vue component wraps the
> input form."
>
> **Developer**: "If I upgrade Mermaid, what breaks?"
> **System**: "Mermaid is loaded on demand by
> `petManager.mermaid.js` when a chat message contains a fenced
> ```mermaid block. Upgrade impact is isolated to that facade —
> see `arch/scene-4-dependency-change-impact/index.md`."

### Disambiguation markers

| Term | Do NOT confuse with |
|------|---------------------|
| Pet | the `pet/` directory as a whole — it contains the Pet class and all sub-modules |
| PetManager | the `modules/pet/` directory — PetManager is one class inside it |
| Content Script | the `content_scripts` manifest field — the field lists the scripts; the term refers to the injection mechanism |
| CDN Component | a public CDN — all 26 components are self-hosted under `cdn/components/` |
| ApiManager | the `core/api/` directory — ApiManager is one class inside it |
| StorageHelper | `chrome.storage.local` — StorageHelper is a facade over it |
