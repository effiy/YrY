---
title: chrome
name: chrome
description: >
  Chrome Extension development navigator — Manifest V3, DevTools API,
  service workers, content scripts, and Chrome APIs. Invoke when the user
  wants to: create a Chrome extension (popup, content script, service worker),
  configure manifest.json (MV3), use Chrome APIs (storage, runtime, tabs,
  notifications, alarms, bookmarks, downloads, webRequest, scripting),
  debug extensions (DevTools, chrome://extensions, service worker console),
  publish to Chrome Web Store, or integrate with external services (OAuth,
  messaging). Trigger words: "chrome extension", "manifest v3", "DevTools",
  "content script", "service worker", "chrome.storage", "chrome.runtime",
  "chrome.tabs", "chrome extension debug", "chrome web store", "MV3",
  "browser extension chrome".
  Do NOT trigger for: Firefox/Safari/Edge-specific extension APIs without
  Chrome context, general browser DevTools usage, or PWAs.
lifecycle: active
user_invocable: true
status: stable
type: skill
source: internal
created: 2026-08-10
updated: 2026-08-10
category: aier/skills/chrome
review_cycle: quarterly
roles:
  - aier
tags:
  - skill
  - frontend
  - chrome-extension
  - mv3
chip: ai-methodology
---
# chrome — Chrome Extension MV3 & DevTools

> Manifest V3 extensions, Chrome APIs, DevTools integration — from scaffold to publish.

## What this skill does

1. **Manifest V3** — `manifest.json` structure: `action` (popup), `background.service_worker`, `content_scripts`, `permissions`, `host_permissions`, `web_accessible_resources`, `externally_connectable`.
2. **Service workers** — replacing MV2 background pages, lifecycle (`install`/`activate`/`fetch` events), `chrome.alarms` for periodic tasks, `chrome.storage.session` for in-memory state.
3. **Content scripts** — injection via `content_scripts` manifest or `chrome.scripting.executeScript`, isolated world (`MAIN` vs `ISOLATED`), message passing to service worker/popup.
4. **Chrome APIs** — `chrome.storage` (local/sync/session), `chrome.runtime` (messaging, lifecycle), `chrome.tabs` (query, create, update), `chrome.notifications`, `chrome.alarms`, `chrome.bookmarks`, `chrome.downloads`, `chrome.webRequest`.
5. **DevTools extensions** — `devtools_page`, panels, `chrome.devtools.inspectedWindow`, `chrome.devtools.network`, `chrome.devtools.panels`.
6. **Debugging** — `chrome://extensions` (reload, errors, views), service worker console, content script DevTools console, `chrome.runtime.lastError`.
7. **Publishing** — Chrome Web Store Developer Dashboard, package `.zip`, store listing, versioning, review process.

## What this skill does NOT do

- Does NOT cover Firefox/Safari/Edge-specific extension APIs unless noting cross-browser differences.
- Does NOT cover general web development (HTML/CSS/JS) — assume the user knows web basics.
- Does NOT cover Chrome browser internals or V8 engine specifics.
- Does NOT auto-generate extension scaffolding — recommend tools and patterns instead.

## Workflow

1. **Identify the extension type** — popup-only / content script heavy / DevTools panel / service-worker-driven.
2. **Check permissions** — list only what's needed; `host_permissions` for content script injection targets.
3. **Scaffold** — `manifest.json` → service worker → content scripts → popup → icons.
4. **Develop** — load unpacked at `chrome://extensions`, refresh on changes.
5. **Debug** — service worker console (chrome://extensions → "service worker" link), content script console (right-click → inspect on target page).
6. **Test** — test on multiple Chrome channels (Stable/Beta/Canary), test permission prompts, test offline/service worker wake-up.

## Borders

| Boundary | Permission |
|----------|-----------|
| `manifest.json` | read + write |
| Extension source files | read + write |
| `chrome://extensions` | browser interaction |
| Chrome Web Store | read (publishing via web UI) |
| Skill directory | read + write |
| Outside the project | no automatic writes |

## Fallback

| Situation | Behavior |
|-----------|----------|
| User asks about Firefox/Safari extension | Note cross-browser differences; recommend `webextension-polyfill` for Firefox parity. |
| User asks about MV2 migration | Point to Google's MV2→MV3 migration guide; note service worker vs background page differences. |
| Chrome API not available in MV3 | State the API's status; suggest alternatives (e.g., `chrome.webRequest` blocking → `declarativeNetRequest`). |
| Extension fails silently | Guide to `chrome.runtime.lastError`, service worker console, and `chrome.management.getSelf()`. |
| User asks in a language other than English | Respond in the user's language; keep API names in original. |
