---
name: yry-reports
description: >
  Artifact generation dispatcher. Routes a report request to one
  of five leaf skills: apis, daily, diagram, files, test. Use when
  the user wants to produce a daily CTO report, an API inventory,
  a file/asset report, a test coverage report, or a mermaid diagram
  artifact, all as self-contained HTML / data.js pairs. Triggers:
  "daily report", "CTO report", "API inventory", "file report",
  "test report", "diagram artifact". Do NOT trigger for: live
  querying of daily.dev (see yry-reports/daily ask mode — but that
  is the only network-bearing leaf), framework code patterns (see
  yry-code), or tooling ops (see yry-tools).
lifecycle: default-pipeline
user_invocable: true
---

# yry-reports

> One skill, five leaves. Each leaf produces one artifact type.
> This file dispatches. Manual entry: `/yry-reports <leaf>`.

## Quick Start

```
/yry-reports daily    → CTO daily report / planning checklist
/yry-reports apis     → API inventory report
/yry-reports files    → file / asset report
/yry-reports test     → test coverage report
/yry-reports diagram  → mermaid diagram artifact
```

## Template & output contract

**Single source of truth for templates:** `YiDoc/templates/<leaf>/`.
Each leaf skill used to ship its own `templates/` copy — those have
been consolidated into `YiDoc/templates/<leaf>/` and removed from
the skill directories. Layout drift between a skill and
`YiDoc/templates/<leaf>/` is now a verify failure.

**Per-project output:** each leaf writes only `data.js` (the
regenerated content) into `YiDoc/projects/<project>/<leaf>/`. The
page shell (`index.html`) is a path-adjusted byte-copy of
`YiDoc/templates/<leaf>/index.html` maintained in each project's
`<leaf>/` dir (byte-identical across all 7 projects); css/js/app
assets are served from `YiDoc/templates/<leaf>/` via relative paths.
Per-project shells are manually maintained — propagate template
changes by applying the depth-3 → depth-4 path substitution to
each project's shell.

| Leaf | Template source | Output path |
|------|-----------------|-------------|
| `daily` | `YiDoc/templates/daily/` (shell: `index.html`/`index.css`/`index.js`/`data.js`) + `YiDoc/templates/daily/report/` (REPORT-mode schema in `data.js`; `index.html` there is a per-date-dir shape reference, not the project shell) | `YiDoc/projects/<project>/daily/<YYYY-MM-DD>.js` |
| `apis` | `YiDoc/templates/apis/` | `YiDoc/projects/<project>/apis/data.js` |
| `files` | `YiDoc/templates/files/` | `YiDoc/projects/<project>/files/data.js` |
| `test` | `YiDoc/templates/test/` | `YiDoc/projects/<project>/test/data.js` |
| `diagram` | `YiDoc/templates/diagram/` | `YiDoc/projects/<project>/diagram/data.js` |

This contract is what `yry-init/steps/03-generate` relies on to
discover and link reports in `docs/data.js §3`.

## Dispatcher rules

1. Match the first arg against the five leaves. Unknown leaf → ask.
2. If no arg but the prompt contains "report" + a domain keyword,
   route to the matching leaf.
3. `daily` has four sub-modes (`ask` / `api` / `report` / `plan`) —
   only `report` mode writes a `data.js` per project per date.
   `ask` and `api` are network-bearing and do not write artifact
   files.
4. Every leaf that writes a `data.js` must pass its schema
   validation before writing; schema failure → exit 2, no partial
   write.
5. Feedback / gaps discovered during report generation are written
   to `yry-reports/feedback/<YYYY-MM-DD>.md` so the next `yry-init`
   `01-detect` can consume them.

## Leaf inventory

| Leaf | Modes | Network | Output |
|------|-------|---------|--------|
| `daily` | ask / api / report / plan | ask+api only | `YiDoc/projects/<project>/daily/<YYYY-MM-DD>.js` |
| `apis` | report | no | `YiDoc/projects/<project>/apis/data.js` |
| `files` | report | no | `YiDoc/projects/<project>/files/data.js` |
| `test` | report | no | `YiDoc/projects/<project>/test/data.js` |
| `diagram` | generate | no | `YiDoc/projects/<project>/diagram/data.js` |

## Borders

| Boundary | Permission |
|----------|-----------|
| Each leaf `SKILL.md` + `references/**` + `rules/**` | read |
| `YiDoc/templates/<leaf>/**` | read (template source) |
| `YiDoc/projects/<project>/<leaf>/**` | read + write (`data.js` only) |
| `yry-reports/feedback/**` | read + write |
| Network to `api.daily.dev` (daily ask/api only) | via Bash + curl |
| Outside the above | no automatic writes |

## Fallback

| Situation | Behavior |
|-----------|----------|
| Unknown leaf name | ask the user to pick from the five |
| Schema validation fails | refuse write; exit 2 |
| `YiDoc/templates/<leaf>/` missing | surface error; skill is half-installed — re-run consolidation |
| `daily` mode ambiguous | ask the user to pick (see leaf SKILL.md) |
| Network required but offline | refuse `ask` / `api`; `report` / `plan` still work |
