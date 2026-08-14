---
title: tmux
name: tmux
description: >
  Tmux terminal multiplexer — session management, window/pane navigation,
  scripting, plugins, and configuration. Invoke when the user is setting up
  tmux, managing sessions, scripting tmux workflows, configuring tmux.conf,
  or debugging terminal issues. Trigger words: "tmux", "tmux session",
  "tmux window", "tmux pane", "tmux.conf", "tmux plugin", "tmux resurrect",
  "tmux continuum", "tmux copy mode", "tmux key binding", "prefix key",
  "tmux split", "tmux attach", "tmux detach", "tmux new", "tmux kill",
  "tmux list", "tmux rename", "tmux send-keys", "tmux capture-pane",
  "tmux buffer", "tmux clipboard", "tmux status bar", "tmux powerline".
  Do NOT trigger for: screen (GNU Screen), zellij, byobu, iTerm2 splits,
  or general terminal/CLI questions unrelated to tmux.
lifecycle: active
user_invocable: true
status: stable
type: skill
source: internal
created: 2026-08-10
updated: 2026-08-10
category: aier/skills/tmux
review_cycle: quarterly
roles:
  - aier
tags:
  - skill
  - tmux
  - terminal
  - productivity
chip: platform
---
# Tmux

Terminal multiplexer for persistent sessions and efficient workflows.

## Core Concepts

- **Sessions** — persistent terminal environments that survive disconnects
- **Windows & Panes** — organize work into logical groups and splits
- **Configuration** — `tmux.conf` for key bindings, status bar, and plugins
- **Scripting** — `tmux send-keys`, `capture-pane`, `send-prefix` for automation
- **Plugins** — tpm (Tmux Plugin Manager), resurrect, continuum, and more

## Key Rules

1. Remap prefix to something comfortable — `C-a` or `C-s` are popular
2. Use `tmux resurrect` to survive system reboots
3. Set `set -g mouse on` for mouse support
4. Use named sessions (`tmux new -s <name>`) — never leave them numbered
5. Script repetitive workflows with `tmux send-keys` instead of manual typing