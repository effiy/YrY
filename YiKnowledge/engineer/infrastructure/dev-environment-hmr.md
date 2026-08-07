---
title: Dev environment HMR — three sub-projects' dev mode and hot-reload status
tags:
- devops
- hmr
- dev-server
- rsbuild
- uvicorn
- chrome-mv3
- yiai
- yivad
- yipet
category: engineer/infrastructure
created: 2026-08-05
updated: 2026-08-05
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: monthly
roles:
- devops
- engineer
- new-hire
benefit: New hires starting the dev environment find the toolchain and HMR status of all three sub-projects in one place, no longer mistaking YiPet for real HMR, no longer falsely trusting YiAi reload works
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../../../YiAi/main.py
- ../../../YiAi/config.yaml
- ../../../YiVad/package.json
- ../../../YiVad/rsbuild.config.ts
- ../../../YiPet/package.json
- ../README.md
tacit: false
---

# Dev environment HMR — three sub-projects' dev mode and hot-reload status

> **As a** devops,**I want to** a verified record of the three sub-projects' dev startup commands and hot-reload mechanisms,**so that** new hires no longer mistake YiPet's watch-rebuild for real HMR, and no longer falsely trust YiAi's `reload=True` works on macOS.

> The three sub-projects under the YrY repo (YiAi / YiVad / YiPet) have different toolchains and very different hot-reload mechanisms. This article verifies the current `main.py` / `package.json` / `rsbuild.config.ts` on 2026-08-05 and records it; it does not rely on old memory.

## Summary

| Project | Startup command | Tooling | Hot-reload mechanism | macOS limitation |
|---|---|---|---|---|
| YiAi | `python main.py` | uvicorn + FastAPI | `reload=True` (in `config.yaml`) | **reload does not actually work**, need manual restart after code changes |
| YiVad | `pnpm dev` = `rsbuild dev` | Rsbuild 1 | full HMR (browser side) | none |
| YiPet | `npm run dev` = 3 `rsbuild build --watch` in parallel | Rsbuild 1 + Chrome MV3 | watch-rebuild + extension-side `builtAt` timestamp driving auto-reload | none; but MV3 does not support real HMR |
| YiWeb | (not in this repo) | static CDN | no dev server | — |

## Core viewpoints

- **"HMR" is a misnomer for YiPet** — Chrome MV3 service worker restrictions do not allow WebSocket / ES module real hot replacement; YiPet uses `rsbuild build --mode development --watch` for incremental rebuild to `dist/`, and the extension side reads the `builtAt` timestamp in `dist/build-meta.json` to trigger `chrome.runtime.onInstalled` / reload. Behaviourally equivalent to "save → rebuild + reload", but it is not browser-side HMR; changing manifest / background scripts still requires manually clicking reload in `chrome://extensions`
- **YiAi `reload=True` is silently broken on macOS** — homebrew framework Python's `uvicorn --reload` depends on watchfiles/watchdog fs notify, but macOS FSEvents is broken on this machine (watchfiles & watchdog both silently drop events). `config.yaml` writing `reload: true` only takes effect inside Linux containers; on this machine after editing code you must Ctrl+C and restart `python main.py`. apscheduler polling is the fallback for local file-watching features
- **YiVad is the only true HMR end** — Rsbuild 1 dev server uses WebSocket + ES module real hot replacement; Vue 3.5 SFC changes take effect immediately, no restart or refresh needed
- **The three bundles' configs cannot be mixed** — YiPet `npm run dev` runs 3 Rsbuild configs in parallel (main / chat / bootstrap), each with independent output; YiVad single config; YiAi no build step (Python runs directly)

## Key information

### YiAi — FastAPI + uvicorn

**Entry**: `YiAi/main.py`
```python
uvicorn.run(
    app="YiAi.main:app",
    host=settings.server_host,
    port=settings.server_port,
    reload=settings.server_reload,  # True by default
)
```

**Config**: `YiAi/config.yaml`
```yaml
uvicorn:
  reload: true
  server_reload: true
```

**Local limitation**: `reload=True` on macOS depends on watchfiles/watchdog fs notify, but FSEvents is broken on this machine → reload silently fails. After code changes you must Ctrl+C + restart `python main.py`. Inside Linux containers reload works normally.

**Python interpreter trap**: must use the homebrew framework Python binary (`/Library/Frameworks/Python.framework/...`), not the regular homebrew Python; otherwise `uvicorn.run` startup has a `signal` module and event loop conflict and hangs directly.

### YiVad — Vue 3.5 + Rsbuild 1

**Startup**: `YiVad/package.json`
```json
"scripts": {
  "dev": "rsbuild dev",
  "serve": "rsbuild dev",
  "build": "rsbuild build",
  "build:dev": "rsbuild build --mode development"
}
```

**Config**: `YiVad/rsbuild.config.ts` — Rsbuild 1, migrated from Vite 8 on 2026-07-28. Env prefix `RSBUILD_ENV_*` (was `VITE_*` before migration). `svg-sprite` + `views-glob` custom plugins replicate dropped Vite features.

**HMR mechanism**: browser-side WebSocket + ES module real hot replacement. Editing `.vue` / `.ts` takes effect immediately, no restart or refresh needed; editing `rsbuild.config.ts` requires restarting `pnpm dev`.

**Port**: default `:8848`, frontend accesses `http://localhost:8848/#/...` (hash router).

### YiPet — Chrome MV3 + Rsbuild multi-bundle

**Startup**: `YiPet/package.json`
```json
"scripts": {
  "dev": "npm run build:cdn && (rsbuild build --mode development --watch & rsbuild build --mode production --watch --config rsbuild.config.chat.ts & rsbuild build --mode development --watch --config rsbuild.config.bootstrap.ts)"
}
```

Three Rsbuild configs running in parallel watch:
- main bundle (`rsbuild.config.ts`) — content scripts + popup + options
- chat bundle (`rsbuild.config.chat.ts`) — ChatSidebar React 18 + AntD 5 (production mode, due to `jsxDEV is not a function` trap, see `project_yipet_chat_jsxdev.md` memory)
- bootstrap bundle (`rsbuild.config.bootstrap.ts`) — service worker / background

**HMR mechanism**: Chrome MV3 does not support real HMR. watch-rebuild incrementally rebuilds to `dist/`, the `builtAt` timestamp in `dist/build-meta.json` changes and drives the extension side `chrome.runtime.onInstalled` to trigger auto reload.

**Manual reload scenarios**:
- Editing `manifest.json` (permissions / background entry / content_scripts matches)
- Editing service worker registration logic
- Clicking Reload in `chrome://extensions`

**Trap**: dev-mode React plugin + production `NODE_ENV` define incompatible → `jsxDEV is not a function`; chat bundle dev script switched to `--mode production` to avoid this.

### YiWeb — upstream static reference (not in this repo)

YiWeb is an upstream static CDN project, no `package.json` / dev server / HMR. Pages like aicr / aiChat were originally ported from YiWeb; this repo no longer has the YiWeb directory; editing YiWeb content just requires refreshing the page, no build involved.

## Anti-patterns (do not)

- **Do not assume YiAi code changes take effect automatically** — local reload is silently broken, not restarting after editing will have you debug stale code and waste time
- **Do not assume YiPet code changes take effect immediately** — MV3 limitation, extension side reloads via `builtAt` timestamp; editing manifest / service worker requires manually `chrome://extensions` reload
- **Do not call YiPet dev mode HMR** — it is watch-rebuild + auto-reload, not real HMR; distinguish this in docs and communication, to avoid new hire misjudgement
- **Do not mix env prefixes** — Rsbuild uses `RSBUILD_ENV_*`, Vite uses `VITE_*` (deprecated), Vue CLI uses `VUE_APP_*` (cleared); after migration must grep to clear old prefixes
- **Do not rely on fs notify for file watching on macOS** — FSEvents is broken, watchfiles / watchdog both silently drop events; use apscheduler polling as a fallback

## Action recommendations

When new hires start the dev environment:

1. **YiAi**: confirm using homebrew framework Python binary; start with `python main.py`; after code changes Ctrl+C + restart (`reload=True` does not work locally)
2. **YiVad**: `pnpm install && pnpm dev` starts `:8848`; editing `.vue` / `.ts` gets instant HMR; editing `rsbuild.config.ts` requires restart
3. **YiPet**: `npm install && npm run dev` starts 3 watches; Chrome `chrome://extensions` loads the `dist/` unpacked extension; after editing source wait for `builtAt` to change for auto reload; editing manifest requires manual extension reload
4. When developing on all three at once, each in its own terminal, do not chain them in one shell

## Related

- [devops/README.md](../README.md) — DevOps working directory
- [YiAi/main.py](../../../YiAi/main.py) — uvicorn entry, source of truth for this file
- [YiAi/config.yaml](../../../YiAi/config.yaml) — `reload: true` config item
- [YiVad/package.json](../../../YiVad/package.json) — `pnpm dev` script
- [YiVad/rsbuild.config.ts](../../../YiVad/rsbuild.config.ts) — Rsbuild config
- [YiPet/package.json](../../../YiPet/package.json) — three-bundle watch script
- [knowledge-curator/templates/knowledge-leaf.md](../../knowledge-curator/templates/knowledge-leaf.md) — leaf template
