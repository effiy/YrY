---
title: YiPet Functional Modules
tags: [yipet, modules, inventory, chrome-extension]
category: engineer/learn/projects/yipet
created: 2026-08-21
updated: 2026-08-21
source: internal
type: reference
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "Inventory of YiPet modules across popup, chat, content, and API layers"
related:
  - ./README.md
  - ./architecture.md
  - ./dev-standards.md
---

# YiPet Functional Modules

> Full module inventory in [README.md](./README.md). Quick reference below.

## Popup (`src/popup/`)

`App.tsx` (root), `index.tsx` (mount), `data.ts` (config adaptor), components for settings, role, theme, visibility.

## Chat (`src/chat/`)

`controller.ts` (state machine: streaming, actions, abort), `components/` (message list, input, sidebar, status bar), `types.ts`.

## Content (`src/content/`)

`bootstrap.ts` (dual-world self-injection), `cdn/catalog.ts` (80+ vendor libs), `cdn/injector.ts`, `ipc/messages.ts`, `rendering/overlay.ts`, `state/`.

## API services (`src/api/services/`)

`auth.ts`, `chat.ts`, `config.ts`, `database.ts`, `faq.ts`, `sessions.ts`, `knowledge.ts`, `rag.ts`.

## Shared (`src/shared/`)

`i18n/` (typed `t()` wrapper, 55+ keys), `theme/`, `roles.ts`, `locale/`, `timezone/`, `datetime/`, `env.ts`, `log.ts`, `state.ts`.

## Background (`src/background/`)

Service worker: command dispatch (`Ctrl+Shift+P`, `Ctrl+Shift+X`) + message routing.