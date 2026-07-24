# Daily Report · Unified Template

This directory is the **canonical source** for the daily CTO report template.

## Layout

```
reports/daily/
└── (shared shell index.html + per-date <YYYY-MM-DD>.js files)                      ← shared, byte-stable across all dates
│   ├── index.html                 ← thin shell (copies into each date dir)
│   ├── index.css                  ← shared styles
│   ├── index.js                   ← shared Vue 3 app
│   └── README.md                  ← this file
└── <YYYY-MM-DD>/                  ← one directory per day
    ├── index.html                 ← byte-identical copy of template/index.html
    └── data.js                    ← per-day data (the ONLY varying file)
```

## Contract

| File | Per-date variation |
|------|---------------------|
| `template/index.html`  | **none — canonical source** |
| `template/index.css`   | **none — canonical source** |
| `template/index.js`    | **none — canonical source** |
| `<date>/index.html`    | **none — byte-identical copy of `template/index.html`** |
| `<date>/data.js`       | **the ONLY file that differs per date** |

## Regenerating a report for a new date

1. **Create** `YiDoc/reports/daily/` directory.
2. **Copy** `template/index.html` into it verbatim — do not edit.
3. **Write** `data.js` containing `window.REPORT_DATA`:
   - `meta.title` (e.g. `"YrY · Daily CTO Report · 2026-07-23"`) drives `<title>` at runtime.
   - `meta.date`, `meta.window`, `meta.sinceDate`, `meta.untilDate` for the header.
   - `projects: [...]` array with per-project `summary`, `risk`, `health`, `people`.

The shell auto-populates `<title>` from `window.REPORT_DATA.meta.title` at load time — never hardcode the date in `index.html`.

## Why the thin shell?

The deployed `daily/<date>/index.html` is intentionally minimal:
- loads Vue 3 from the shared `YiPet/cdn` vendor copy
- loads `data.js` from the same directory (per-day)
- loads `index.css` and `index.js` from `../../templates/daily/` (shared)

This means adding a new date requires copying one file (`index.html`) and writing one file (`data.js`). The CSS and JS stay in `template/` and are never duplicated.

## If the template itself changes

If you modify `template/index.html`, `template/index.css`, or `template/index.js`:
1. The change applies immediately to all existing dates (they reference `../../templates/daily/*`).
2. Future dates copy the updated `template/index.html` verbatim.

No per-date sync needed — that's the point of the thin shell.
