# YiDoc Shared Infrastructure

Shared JavaScript modules and CSS design tokens consumed by YiDoc templates.
Each module is a vanilla JS/CSS file (no build step) — load via `<script src>` or `<link>`.

## Directory Layout

```
shared/
  README.md
  js/
    yry-kbd.js          — Keyboard shortcut manager (window.yryKbd)
    yry-vue-loader.js   — Standardized Vue 3 CDN loader (window.yryVueLoader, window.__vueLoadPromise)
    yry-clipboard.js    — Clipboard API wrapper with fallback (window.yryClipboard)
    yry-remediation.js  — Remediation queue factories (window.yryRemediation)
    yry-mount.js        — Standard Vue 3 mount helper (window.yryMount)
  css/
    yry-tokens.css      — Shared design tokens (--yry-* custom properties)
    yry-diagram-base.css — Shared arch/diagram page styles
```

## Naming Convention

- All modules use the `yry-` prefix
- Each module exposes exactly one namespace on `window` (e.g., `window.yryKbd`)
- No ES modules, no build step — loaded via `<script src>` or `<link rel="stylesheet">`
- All modules are self-contained IIFEs with `'use strict'`

## Path Depth Reference

Templates load shared modules with relative paths. The depth varies by location:

| Template Location | Path to `shared/` |
|---|---|
| `dashboard/index.html` | `../shared/` |
| `templates/<name>/index.html` | `../../shared/` |
| `templates/daily/report/index.html` | `../../../shared/` |

## Adding a New Template

1. Follow the four-file layout: `data.js` + `index.html` + `index.css` + `index.js`
2. Load shared infrastructure in `index.html` **before** template-specific files:

```html
<!-- ① Shared infrastructure -->
<script src="../../shared/js/yry-vue-loader.js"></script>
<script src="../../shared/js/yry-kbd.js"></script>
<link rel="stylesheet" href="../../shared/css/yry-tokens.css" />

<!-- ② Template-specific files -->
<link rel="stylesheet" href="index.css" />
<script src="data.js"></script>
<script src="index.js"></script>
```

3. Use `window.REPORT_DATA` for data and `window.REPORT_CONFIG` for labels/options (standard contract).
4. Use `?project=NAME` query parameter for dynamic data loading from `../../projects/<name>/<type>/data.js`.
