---
title: "Gotcha: YiPet Chat Bundle Requires --mode production to Avoid jsxDEV"
tags: [gotcha, yipet, rsbuild, react, jsx, build]
category: engineer/learn/lessons/gotchas
created: 2026-08-24
updated: 2026-08-24
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "Engineers avoid the jsxDEV is not a function runtime error when building the YiPet chat bundle"
acceptance_criteria:
  - "Bug scenario described with root cause"
  - "Fix pattern documented"
  - "Applicable to all Rsbuild multi-entry React builds"
related:
  - ./README.md
  - ../../../projects/yipet/README.md
  - ../../../leader/decisions/yipet/react-18-antd-migration.md
---

# Gotcha: YiPet Chat Bundle Requires `--mode production`

## Symptom

When running the YiPet chat bundle in dev mode, the browser console shows:

```
Uncaught TypeError: jsxDEV is not a function
```

The chat window fails to render. The popup and other bundles work fine.

## Root cause

YiPet has four separate Rsbuild configs (popup, chat, CDN utils, bootstrap). The chat bundle uses React 18.3's JSX transform. In development mode, Rsbuild uses React's `jsxDEV` function for JSX compilation, which includes extra dev-only checks and warnings. However, the chat bundle's build configuration had `NODE_ENV=production` defined (to match the CDN-loaded React production build), creating a mismatch:

- **Rsbuild JSX transform**: Uses `jsxDEV` (dev mode)  
- **CDN-loaded React**: Production build (no `jsxDEV` export)

The `jsxDEV` function doesn't exist in the production React build loaded from the CDN catalog.

## Fix

The chat bundle dev script must run with `--mode production`:

```json
// package.json
"dev:chat": "rsbuild dev --config rsbuild.config.chat.ts --mode production"
```

This tells Rsbuild to use the production JSX transform (`jsx` / `jsxs`) instead of `jsxDEV`, matching the CDN-loaded production React build.

## Prevention

- **Any new Rsbuild entry that uses React must use `--mode production`** — the CDN catalog always loads production React builds
- **Test new entries with both `npm run dev` and `npm run build`** — the `jsxDEV` error only appears in dev mode
- **Consider consolidating the four Rsbuild configs into a single multi-entry config** — this would eliminate per-entry build script differences