---
name: yry-code
description: >
  Framework & language knowledge dispatcher. Routes a coding
  question to one of nine leaf skills: chrome, css, fastapi, h5,
  nginx, nodejs, tauri, vite, vue. Use when the user asks about a
  specific framework / runtime / language pattern and the answer
  should come from that framework's canonical guide — not from
  general web search. Triggers: "Vue 3 reactivity", "Vite plugin",
  "FastAPI dependency injection", "Node stream", "CSS cascade
  layers", "H5 viewport", "Tauri IPC", "Nginx location block",
  "Chrome extension manifest v3". Do NOT trigger for: build / CI
  config that is not framework-specific (see yry-tools), test
  strategy (see yry-test), or general JavaScript / Python without
  a framework lens.
lifecycle: default-pipeline
user_invocable: true
---

# yry-code

> One skill, nine leaves. Each leaf owns one framework / runtime.
> This file dispatches. Manual entry: `/yry-code <leaf>`.

## Quick Start

```
/yry-code fastapi  → Python FastAPI backend
/yry-code nodejs   → Node runtime / package mgmt
/yry-code tauri    → desktop Tauri / IPC
/yry-code nginx    → reverse proxy / static hosting
/yry-code chrome   → browser ext / DevTools
```

## Dispatcher rules

1. Match the first arg against the nine leaves. Unknown leaf →
   ask the user to pick; do not guess.
2. If no arg but the prompt contains a framework keyword
   (`vue`, `vite`, `fastapi`, `node`, `css`, `h5`, `tauri`,
   `nginx`, `chrome`), route to that leaf.
3. Cross-cutting questions ("how do I test a Vue component?")
   hand off to `yry-test`; do not answer here.
4. Each leaf must expose a "test hints" section so `yry-test` can
   consume framework shape without re-asking.

## Leaf inventory

| Leaf | Domain | Test hints consumer |
|------|--------|---------------------|
| `vue` | Vue 3 reactivity / composition / slots | yry-test/fixture, yry-test/composable-wrapper |
| `vite` | build / plugins / splitting | yry-test/runner-choice |
| `fastapi` | Python backend / DI | — |
| `nodejs` | Node runtime / packages | yry-test/vitest-setup |
| `css` | cascade layers / tokens | yry-test/visual-regression |
| `h5` | mobile viewport / touch | yry-test/fixture |
| `tauri` | desktop IPC / shell | — |
| `nginx` | proxy / static host | — |
| `chrome` | ext manifest v3 / DevTools | — |

## Borders

| Boundary | Permission |
|----------|-----------|
| Each leaf `SKILL.md` | read |
| Each leaf `references/**` | read |
| Skill directory | read + write |
| Cross-leaf routing | read |
| Outside the skill directory | no automatic writes |

## Fallback

| Situation | Behavior |
|-----------|----------|
| Unknown leaf name | ask the user to pick from the nine |
| Prompt spans two leaves | route to the primary; mention the secondary |
| No framework keyword at all | hand off to `yry-test` if testing, else say "out of scope" |
