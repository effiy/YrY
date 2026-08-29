---
title: tauri
name: tauri
description: >
  Tauri desktop application development — Rust backend, web frontend, plugin
  system, and cross-platform builds. Invoke when the user is scaffolding a Tauri
  project, configuring the Tauri builder, adding Rust commands, integrating
  plugins, debugging IPC between webview and Rust, or packaging for macOS/Windows/
  Linux. Trigger words: "Tauri", "tauri-app", "tauri.conf.json", "Rust backend",
  "Tauri command", "Tauri plugin", "Tauri IPC", "invoke", "webview", "desktop
  app", "Tauri build", "Tauri bundle", ".deb", ".dmg", ".msi", "Tauri window",
  "Tauri menu", "Tauri tray", "sidecar", "Tauri updater".
  Do NOT trigger for: Electron apps, Chrome Extensions, PWAs, or general Rust
  questions unrelated to Tauri.
lifecycle: active
user_invocable: true
status: stable
type: skill
source: internal
created: 2026-08-10
updated: 2026-08-10
category: aier/skills/tauri
review_cycle: quarterly
roles:
  - aier
tags:
  - skill
  - tauri
  - desktop
  - rust
  - frontend
chip: frontend
---
# Tauri

Desktop application development with a Rust backend and web frontend.

## Core Concepts

- **Architecture** — Rust core + webview UI, IPC bridge via `invoke`
- **Plugins** — filesystem, shell, dialog, notification, clipboard, and more
- **Commands** — `#[tauri::command]` Rust functions exposed to the frontend
- **Build System** — `tauri.conf.json`, cross-platform bundling
- **Security** — CSP configuration, capability permissions, scope restrictions

## Key Rules

1. Keep the Rust backend minimal — business logic, not UI
2. Use Tauri's plugin system over raw Rust bindings when available
3. Define explicit capabilities in `tauri.conf.json` — avoid `all: true`
4. Test on all target platforms before release
5. Use `tauri::Window` for window management, not raw webview APIs