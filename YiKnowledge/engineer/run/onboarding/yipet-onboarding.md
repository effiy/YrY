---
title: YiPet Onboarding — Day 1 Quick Start
tags: [onboarding, yipet, setup, quick-start]
category: engineer/run/onboarding
created: 2026-08-21
updated: 2026-08-21
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "New YiPet engineers set up their dev environment and understand the Chrome extension architecture within the first day"
acceptance_criteria:
  - "Setup steps verified working"
  - "Key architectural concepts explained (dual-world, CDN, four-tier API)"
  - "Common gotchas documented"
  - "Day-1 task checklist included"
related:
  - ./README.md
  - ./yivad-onboarding.md
  - ./yiai-onboarding.md
  - ../../../../YiPet/CLAUDE.md
  - ../../learn/projects/yipet/README.md
---

# YiPet Onboarding — Day 1

> **Goal**: By end of day 1, you can build and load YiPet in Chrome, understand the dual-world architecture, and trace a message from popup to pet.

## Prerequisites

- Node.js 18+ and npm
- Chrome 114+ (Manifest V3)
- YiAi backend running on `http://localhost:10086`

## Setup (30 min)

```bash
cd YiPet
npm install
npm run build        # Multi-entry: popup + chat + CDN + bootstrap
npm run typecheck    # tsc --noEmit
npm test             # Vitest 2 + jsdom
```

Load the extension:
1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** → select `YiPet/dist/`
4. Open any web page — the pet appears

## Architecture overview

Start with the project [CLAUDE.md](../../../../YiPet/CLAUDE.md). Key concepts:

| Concept | What it is | Where |
|---|---|---|
| Dual-world boundary | ISOLATED (chrome.runtime.*) + MAIN (page JS) | `src/content/bootstrap.ts` |
| Four-tier API | client → endpoints → types → services | `src/api/` |
| CDN catalog | 80+ local vendor libs, MV3 CSP-compliant | `src/content/cdn/catalog.ts` |
| Chat controller | State machine with useSyncExternalStore | `src/chat/controller.ts` |
| Multi-entry build | 4 Rsbuild configs (popup, chat, CDN, bootstrap) | `rsbuild.config.*.ts` |
| Cross-project bridge | Seeds YiVad sessions, reports bugs to MongoDB | `src/chat/controller.ts` |

## Data flow (trace a message)

```
User types in chat window
  → ChatController.send(text)
  → api.chat.stream({messages, model, stream: true})
  → fetch POST /  body: {module_name: "services.ai.chat_service", ...}
  → YiAi FastAPI → Ollama → SSE stream
  → ApiClient parses SSE → onChunk(text)
  → ChatController appends deltas → React re-renders

Popup → Content Script → MAIN world:
  Popup (React) → chrome.tabs.sendMessage({type, payload})
  → Content Script (ISOLATED) → CustomEvent
  → Bootstrap (MAIN) → mutates pet DOM
```

## Common gotchas

1. **`chrome.runtime.*` only in ISOLATED world** — Calling Chrome APIs from MAIN world code throws silently. All Chrome API calls must stay in ISOLATED.
2. **Chat bundle requires `--mode production`** — Dev-mode React + production NODE_ENV = `jsxDEV is not a function`. The chat build script already handles this.
3. **`filter` not `query`** — Same RPC parameter name contract as YiVad. The backend silently ignores `query`.
4. **CDN catalog is load-bearing** — Adding a new dependency means adding it to `CDN_CATALOG` in `src/content/cdn/catalog.ts`, not just `npm install`. MV3 CSP requires all vendor libs to be local.
5. **Co-located CSS** — A component's CSS lives in its component directory. `buildChatCSS()` concatenates per-component CSS into `dist/cdn/styles/chat.css`.

## Day-1 task checklist

- [ ] Run `npm run build` and load the extension in Chrome
- [ ] Open any web page, verify the pet appears
- [ ] Press `Ctrl+Shift+X` (⌘+Shift+X on Mac) to open the chat window
- [ ] Read `YiPet/CLAUDE.md` (~30 min)
- [ ] Open `src/content/bootstrap.ts` and trace the dual-world injection
- [ ] Open `src/api/` and trace the four-tier architecture
- [ ] Open `src/chat/controller.ts` and find the `sendMessage` action
- [ ] Make a small change: add a console.log to the popup, rebuild, reload, verify
- [ ] Run `npm run typecheck` and verify 0 errors
- [ ] Run `npm test` and verify all tests pass

## Next steps

- [YiPet engineering README](../../learn/projects/yipet/README.md) — deeper architecture, anti-patterns
- [YiPet CLAUDE.md](../../../../YiPet/CLAUDE.md) — authoritative reference
- [Cross-project RPC protocol](../../build/cross-project-rpc-protocol.md) — API contract