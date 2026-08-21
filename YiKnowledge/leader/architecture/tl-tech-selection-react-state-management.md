---
title: "Tech Selection: React State Management"
tags: [tech-selection, react, state-management, yipet]
category: leader/architecture
created: 2026-08-21
updated: 2026-08-21
source: internal
type: reference
status: stable
lifecycle: active
review_cycle: quarterly
roles: [leader]
benefit: "Criteria and rationale for React state management in YiPet"
related:
  - ../../../engineer/learn/projects/yipet/README.md
---

# Tech Selection: React State Management

> **Context**: YiPet's chat window and popup need state management. Selection criteria below.

## Decision: `useSyncExternalStore` + custom controller

YiPet uses React 18's `useSyncExternalStore` with a custom `ChatController` class rather than Redux, Zustand, or Context.

## Options considered

| Option | Pros | Cons |
|--------|------|------|
| `useSyncExternalStore` (chosen) | Zero dependencies; React 18 built-in; external store pattern | Manual subscription management |
| Redux | Ecosystem, middleware | Overkill for a Chrome extension popup |
| Zustand | Lightweight, simple API | New dependency; not needed for 2 views |
| React Context | Built-in, simple | Re-render cascades; not suitable for streaming state |

## Rationale

- YiPet has only 2 React views (popup + chat) — full state management library is overkill
- `useSyncExternalStore` is React 18 built-in — zero new dependencies
- `ChatController` owns streaming state, actions, and abort logic — clean separation
- MV3 CSP restricts dependencies — fewer npm packages is better

## YiVad divergence

YiVad uses Pinia 4 (Vue ecosystem). Cross-project state management divergence is accepted — each project uses the native solution for its framework.