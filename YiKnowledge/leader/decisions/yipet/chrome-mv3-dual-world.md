---
title: "ADR: YiPet Chrome MV3 Dual-World Boundary"
tags: [adr, yipet, chrome-extension, mv3, architecture]
category: leader/decisions/yipet
created: 2026-08-21
updated: 2026-08-21
source: internal
type: decision
status: accepted
lifecycle: implemented
review_cycle: quarterly
roles: [leader, engineer]
benefit: "Understand the dual-world architecture decision for Chrome MV3"
related:
  - ../../../engineer/learn/projects/yipet/README.md
  - ../../../engineer/learn/projects/yipet/architecture.md
---

# ADR: YiPet Chrome MV3 Dual-World Boundary

> **Status**: Accepted — implemented via bootstrap self-injection pattern

## Context

Chrome MV3 requires content scripts to run in the ISOLATED world by default. This means content scripts share the page DOM but not JavaScript globals. The pet companion needs access to page-context APIs (DOM manipulation, window globals) AND Chrome extension APIs (`chrome.runtime`, `chrome.storage`), which are only available in different execution contexts.

## Decision

**Use a dual-world architecture with a bootstrap self-injection pattern:**

1. **ISOLATED world** (`src/content/index.ts`): Declared in `manifest.json`. Has `chrome.runtime.*` APIs. Receives messages from popup via `chrome.tabs.sendMessage`. Relays to MAIN world via `CustomEvent`.
2. **MAIN world** (`src/content/bootstrap.ts`): Self-injected via `<script>` element. Has page-context globals. Hosts `window.YiPet` API. Loads CDN resources. Renders pet DOM.

### Boundary rules

- `chrome.runtime.*` ONLY in ISOLATED world — calling from MAIN silently fails
- Page globals ONLY in MAIN world — not visible in ISOLATED
- Communication: ISOLATED → MAIN via `CustomEvent`; MAIN → ISOLATED via `window.postMessage`

## Rationale

- MV3's ISOLATED world is the default and cannot be opted out of
- Self-injection is the only way to access page-context globals
- Two-way event bridge enables popup → content script → MAIN world communication
- The boundary is absolute — every line of code must respect which APIs are available in which world

## Consequences

- Debugging is harder: errors surface in a different execution context than the source code
- CDN resources must be loaded in MAIN world via `chrome-extension://` URLs
- All 80+ vendor libraries must be in `web_accessible_resources`