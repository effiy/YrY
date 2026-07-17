---
name: rui-code-chrome
description: >
  Best-practices reference for building Chrome browser extensions on
  Manifest V3. Invoke when the user is creating a new extension,
  reviewing existing code, debugging a service worker, tightening
  permissions, designing a popup / side panel / options page,
  preparing a Chrome Web Store release, or asking about MV3 APIs
  (action, service worker, host_permissions, declarativeNetRequest,
  storage, scripting, alarms, offscreen, userScripts, sidePanel).
  Trigger words: chrome extension, MV3, manifest v3, service worker,
  chrome.action, chrome.scripting, chrome.storage, user scripts,
  declarativeNetRequest, chrome.webstore, content script, popup,
  options page, side panel, offscreen document, extension review.
lifecycle: default-pipeline
user_invocable: true
---

# Chrome Extensions — Best Practices (Manifest V3)

> A reference skill. Read the relevant section, copy the pattern, and
> adapt it to your extension. Encodes the *why* and the *shape* of an
> idiomatic MV3 extension.

## What this skill does

1. **Encodes MV3 conventions** — service-worker-first design, the
   `chrome.action` API (not `chrome.browserAction`), no remote code,
   strict default CSP.
2. **Recommends the smallest permission set** that still does the job,
   explaining when `host_permissions` vs `optional_host_permissions`
   vs `activeTab` is appropriate.
3. **Maps each Chrome API to its lifecycle constraints** — which APIs
   wake the service worker, which are dropped after ~30s idle, which
   need an `offscreen` document.
4. **Provides UI patterns** for popups, side panels, and options pages
   that respect keyboard, screen-reader, and RTL/i18n expectations.
5. **Covers less-common MV3 surfaces** — `chrome.sidePanel`,
   `chrome.userScripts`, `chrome.scripting` — that trip up developers
   porting from MV2 userscripts or building panel-first UIs.
6. **Outlines the engineering pipeline** (TypeScript, Vite/webpack,
   Playwright with the `chromium` channel, `chrome --load-extension`)
   and the Chrome Web Store review checklist.

## What this skill does NOT do

- Does NOT scaffold a new project or run a build. Use your normal
  framework (`npm create vite`, `wxt`, `plasmo`, or your own setup).
- Does NOT execute tests, lint, or publish commands. Recommend
  `vitest`/`@playwright/test` and a CI workflow, but do not run them.
- Does NOT cover Firefox / Safari extensions in depth. MV3 in Firefox
  diverges on `browser.*` namespaces, background scripts, and
  `host_permissions`. Point at MDN's WebExtension docs and the
  `browser.*` polyfill for a Firefox port.
- Does NOT replace the official docs at
  [developer.chrome.com/docs/extensions](https://developer.chrome.com/docs/extensions).
  When in doubt, the official reference wins; this skill captures
  judgment, not API signatures.

## Workflow

1. **Identify the change** — manifest field? permission/CSP/secret?
   worker/alarms/storage? inject code? side panel? user scripts?
   build/publish?
2. **Open the matching reference doc** in `references/`.
3. **Apply the pattern**, then re-check the "Common Mistakes" list in
   the relevant file before committing.

Key principles: service workers are event-driven, not persistent;
permissions are forever in the user's eye (prefer
`optional_permissions` + `chrome.permissions.request(...)` or
`activeTab`); local state ≠ server state (use `chrome.storage.local`,
not module-level variables); popups must feel fast (measure
time-to-first-paint); pick the right surface (popup / side panel /
options page — two is fine, four is too many); the Web Store review
is part of the design, not last-mile polish.

## Borders

| Boundary | Permission |
|---|---|
| `references/**` (this skill's reference files) | read |
| The user's extension project (any path the user names) | read + write (with user confirmation) |
| Other installed skills | read-only |

## Supporting resources

- [references/manifest.md](./references/manifest.md) — `manifest.json` field reference, icons, i18n, content scripts, web-accessible resources.
- [references/security.md](./references/security.md) — CSP, permissions model, `activeTab` vs `host_permissions`, `optional_permissions`, message-passing safety, secret handling.
- [references/performance.md](./references/performance.md) — service-worker lifecycle, alarms, offscreen documents, storage trade-offs, lazy loading in popups.
- [references/scripting.md](./references/scripting.md) — `chrome.scripting.executeScript`, `insertCSS`, dynamic content scripts, target spec, return values, permission requirements.
- [references/side-panel.md](./references/side-panel.md) — `chrome.sidePanel` API: `setOptions`, `open`, `setPanelBehavior`, per-tab configurations.
- [references/user-scripts.md](./references/user-scripts.md) — `chrome.userScripts` API for Tampermonkey-style MV3 extensions: registration, `USER_SCRIPT` world, `@match` patterns.
- [references/engineering.md](./references/engineering.md) — TypeScript + Vite, testing with Playwright on Chromium, CI, versioning, Chrome Web Store review checklist.

## Fallback

| Situation | Behavior |
|---|---|
| User asks about Firefox / Safari | Note that MV3 in Firefox differs on `browser.*`, background scripts, and some host-permission rules; refer them to MDN's WebExtension docs. |
| User mentions Manifest V2 | Recommend a migration to V3 — Chrome no longer accepts V2 submissions and warns users on existing V2 installs. |
| User asks for an API signature or exact event payload | Link to [developer.chrome.com/docs/extensions/reference/api](https://developer.chrome.com/docs/extensions/reference/api); this skill encodes judgment, not the API reference. |
| User is debugging a runtime error | Suggest the Chrome extension issue tracker, the `chrome://extensions` service-worker "Inspect views" link, and a minimal reproduction. |
| User wants code generated for a specific feature | Hand off to the general coding workflow; this skill provides the *pattern*, the user writes the *instance*. |
| User asks in a language other than English | Respond in the user's language; keep resource titles in original language. |
