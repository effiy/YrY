---
title: Development Environment Setup Guide
aliases:
- development-environment
- dev-environment
- local-setup
- environment-setup
tags:
- onboarding
- development
- environment
- setup
- tools
category: new-hire/onboarding
created: 2026-08-07
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles:
- new-hire
- engineer
benefit: "New engineers can set up a working development environment for all projects within 4 hours"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./first-week-checklist.md
- ./onboard-as-a-new-engineer.md
- ./onboard-as-a-new-engineer.md
- ../yiai/onboarding.md
- ../yivad/onboarding.md
- ../yipet/onboarding.md
tacit: false
---

# Development Environment Setup Guide

> **As a** new engineer, **I want to** set up a working development environment for all projects, **so that** I can build, run, and test code locally within my first day.

> Environment setup is the #1 source of day-1 friction. A smooth setup means momentum. A broken setup means frustration and delayed productivity. This guide covers the common setup for all projects (YiAi, YiVad, YiPet) and project-specific configurations.

## Summary

- Prerequisites: macOS (primary), Homebrew, Git, Node.js 20+, Python 3.11+, VS Code
- Core projects: YiAi (Python/FastAPI backend), YiVad (Vue 3/Rsbuild frontend), YiPet (React/Chrome extension)
- Estimated setup time: 2-4 hours for all projects
- Common setup issues: Python version conflicts, Node.js version mismatches, FSEvents broken on this Mac (use polling instead)
- Key principle: Get one project building first, then the others. Don't try to set up everything in parallel.

## Core viewpoints

### 1. macOS FSEvents is broken on this machine — use polling

File watchers (watchfiles, watchdog) silently miss events on this Mac. For any file-watching features (hot reload, auto-restart), use APScheduler polling instead. This is a known issue documented in the project READMEs. Don't debug it — work around it.

### 2. Use Homebrew Python, not system Python

YiAi requires the Homebrew framework Python binary, not the macOS system Python or a virtualenv-managed Python. The uvicorn reload feature is also broken on macOS — manual restart is required after edits. These are known constraints.

### 3. Node.js version matters

Use the Node.js version specified in each project's `.nvmrc` or `package.json` engines field. YiVad uses Rsbuild 1 (migrated from Vite 8), YiPet uses a custom Webpack config build. Version mismatches cause subtle build failures.

### 4. One project at a time

Set up projects sequentially: YiVad first (simplest frontend setup), then YiAi (Python backend), then YiPet (Chrome extension with unique build requirements). Each successful build builds confidence for the next.

## Key info

### Prerequisites

```bash
# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install core tools
brew install git node@20 python@3.11

# Verify versions
node --version  # Should be 20.x
python3.11 --version  # Should be 3.11.x
git --version
```

### YiVad Setup (frontend, start here)

```bash
cd YiVad
npm install
npm run dev  # Starts Rsbuild dev server
# Verify: http://localhost:3000 shows the YiVad app
```

### YiAi Setup (backend)

```bash
cd YiAi
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
# Manual restart required after edits (uvicorn reload broken on macOS)
python main.py
# Verify: http://localhost:8000/docs shows FastAPI Swagger UI
```

### YiPet Setup (Chrome extension)

```bash
cd YiPet
npm install
# Chat bundle: must use --mode production to avoid jsxDEV mismatch
npm run build:chat -- --mode production
# Extension: load unpacked from chrome://extensions
npm run dev:ext
# Verify: Extension appears in Chrome, Ctrl+Shift+X toggles chat
```

### Common issues and solutions

| Issue | Symptom | Solution |
|---|---|---|
| FSEvents broken | File changes not detected | Use APScheduler polling, not file watchers |
| jsxDEV mismatch | `jsxDEV is not a function` error in chat | Build chat with `--mode production` |
| Python version conflict | Import errors, module not found | Use Homebrew Python 3.11, not system Python |
| Node version mismatch | Build errors, dependency issues | Use `nvm use` to match project's `.nvmrc` |
| Port conflict | Address already in use | Kill existing process: `lsof -i :3000` |
| Permission denied | Cannot clone repo | Check GitHub SSH keys: `ssh -T git@github.com` |

## Action recommendations

1. **Set up in this order**: YiVad → YiAi → YiPet. Each is simpler than the last and builds on common tooling.
2. **Time-box each project to 1 hour**: If a project doesn't build after 1 hour, ask your buddy. Don't burn half a day debugging.
3. **Verify each project**: Build + run + use one core feature. "It builds" is not enough — verify it actually works.
4. **Document your setup**: Note any deviations from this guide. Your experience is valuable for the next new hire.
5. **Update this guide**: If you find errors or missing steps, submit a PR to fix it. Documentation rot is real.

## Anti-patterns

- **Parallel setup**: Trying to set up all three projects simultaneously. Sequential is faster because you learn the common patterns.
- **Ignoring known issues**: Debugging FSEvents or uvicorn reload. These are documented constraints — work around them, don't fix them.
- **Wrong Python**: Using system Python or pyenv Python instead of Homebrew Python. YiAi is tested against Homebrew Python specifically.
- **Skipping verification**: "Build passes, I'm done." Verify the app actually runs and you can use a core feature.

## Related

- [First Week Checklist](./first-week-checklist.md) — Day-1 setup is step 1
- [Tools and Access](./onboard-as-a-new-engineer.md) — Tool accounts needed before setup
- [YiAi Onboarding](./yivad/onboarding.md) — YiAi project specifics
- [YiVad Onboarding](./yivad/onboarding.md) — YiVad project specifics
- [YiPet Onboarding](./yivad/onboarding.md) — YiPet project specifics