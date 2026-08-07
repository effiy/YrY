---
title: YiVad project management
aliases: [yivad-project-management, yivad-pm, yivad-iteration-cadence]
tags: [yivad, project-management, iteration, onboarding, handoff, weekly, retrospective, pro-table]
category: product-manager/projects/yivad
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
tacit: false
roles: [product-manager, tech-lead]
benefit: "YiVad project iterations are predictable and stakeholders have clear visibility into progress and blockers"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
 - ../../../engineer/projects/yivad/architecture.md
 - ../../../engineer/projects/yivad/functional-modules.md
 - ../../../engineer/projects/yivad/dev-standards.md
 - ../../../new-hire/onboarding/yivad/onboarding.md
 - ../../../engineer/projects/yivad/rag-system-pages-reference.md
 - ../../../engineer/projects/yivad/engineering/claude.md
 - ../../../engineer/process/iteration-pm-handbook.md
 - ../../../engineer/process/project-handover.md
 - ../../meetings/weekly-meeting.md
 - ../../meetings/retrospective-meeting.md
 - ../../meetings/weekly-report.md
 - ../../meetings/retrospective.md
 - ../../../ai-engineer/methodology/prompts/weekly-report.md
 - ../../../knowledge-curator/templates/retrospective.md
---

# YiVad project management

> **As a** product manager, **I want to** project management, **so that** project managed well.

## Summary

YiVad is the Yi family front-end control panel (Vue 3.5 + Rsbuild + Element Plus); iterations use "page-domain-driven + ProTable pattern + cross-project contract consumption" as the main axis. Each iteration cadence = one view domain landed + accompanying api module + store + routing registration. Current cadence: weekly meeting on Friday; daily report sync; iteration-end retrospective. New hires go through Day-1 setup + ProTable pattern + getting YiAi RPC working. Handoff follows three artifacts: onboarding + engineering mirror + current iteration view-domain checklist.

## Core viewpoints

- **Page-domain-driven iteration** — each iteration cadence focuses on one view domain landing (e.g. 2026-07-27 landed aiChat port from YiWeb sessionChat; 2026-07-29 landed sidebar parity across ChatSidebar/aiChat). The aicr page port is planned but not yet landed (see BRD-2026-080).
- **ProTable pattern is a hard constraint** — new list pages must use ProTable; new capabilities should first extend `@/components/ProTable/`, not start from scratch.
- **Cross-project contract consumer** — YiVad is a consumer of YiAi RPC contract; new calls into YiAi must first read CLAUDE.md "Cross-project protocol" table, by field-name contract (`filter` / `target_file`).
- **New hire Day-1 SPA run-through** — `pnpm dev` + open browser + get `/login` working + get one ProTable list running + one-shot `v-auth` QA.
- **SSE streaming guard** — new SSE chat pages must guard "`onDone` recheck `!aborted && !error` then auto-forward to WeCom" (see `aiChat.ts` 2026-07-28 fix).
- **Static routing for static analysis** — routes that need Rsbuild static analysis should be declared literally in `staticRouter.ts` (not generated via `map`); this pattern is used for the aiChat feature routes.

## Key information

### Iteration cadence

| Cadence | Frequency | Duration | Action |
|---|---|---|---|
| Daily report | Every day | 5 min | Bot pushes today's PRs + commits; self-report progress |
| Weekly meeting | Friday | 30 min | View-domain landing status walkthrough + cross-project contract plan + risks |
| Iteration end | After each domain lands | 1h | Retrospective + CLAUDE.md "Recent Changes" entry + CHANGELOG.md add item |
| Quarterly review | End of quarter | 2h | Scan all `views/` domain health + api modules / stores boundary drift review |

### Iteration deliverables

Each iteration cadence delivers:

| Output | Landing point |
|---|---|
| Page code | `src/views/<feature>/index.vue` + subcomponents + `columns.ts` |
| API module | `src/api/modules/<feature>.ts` |
| Store | `src/stores/modules/<feature>.ts` (if needed) |
| Shared component | `src/components/` extension (if needed) |
| Composable | `src/hooks/useXxx.ts` (if needed) |
| Routing | Static `src/routers/modules/staticRouter.ts` or dynamic from backend menu API |
| CLAUDE.md update | "Recent Changes" section add date + change summary + impact surface |
| CHANGELOG.md | add item |
| Mirror sync | `cp` to `YiKnowledge/engineer/projects/yivad/engineering/{claude,readme,changelog}.md` |
| Retrospective | `../../delivery/retrospective.md` pattern; result stored under `lessons/{wins,failures,gotchas}/` |

### New-hire onboarding process

1. **Day-1 setup** — `pnpm install` + `pnpm dev` + open browser + get `/login` working (default account in `.env`) + get one ProTable list running (e.g. `system/user`) + one-shot `v-auth` QA.
2. **Three high-frequency workflows** (see `onboarding.md`) — ① add one ProTable list page ② add one SSE chat page ③ add one knowledge leaf wrapper.
3. **New-hire pitfalls quick reference** — `filter` vs `query`, `target_file` vs `path`, SSE `onDone` guard, knowledge leaf literal routing, env prefix `RSBUILD_ENV_*`, etc.

### Handoff process

Follow [project-handover-process.md](../../../engineer/process/project-handover.md) three artifacts:

| Output | Path | Use |
|---|---|---|
| Onboarding | `projects/YiVad/onboarding.md` | New-hire Day-1 setup + workflow + pitfalls |
| Engineering mirror | `projects/YiVad/engineering/{claude,readme,changelog}.md` | Architecture + module boundaries + Recent Changes + CHANGELOG |
| Current iteration status | `YiVad/CLAUDE.md` "Recent Changes" + this file's iteration cadence table | Handoff-er can quickly locate "which view domain we are currently in" |

Handoff 3 steps: ① main owner updates onboarding.md owner / contact; ② cp latest CLAUDE.md / README.md / CHANGELOG.md to engineering/; ③ with the handoff-er do a 30-minute walkthrough + leave a 1on1 record.

### Weekly report cadence

Every Friday 16:00 submit this week's weekly report, follow `../../delivery/weekly-report.md` pattern. Include:

- This week's landing (view domain / api module / store / shared component / composable)
- Next week's plan (view domain / cross-project contract consumption / risks)
- Blockers and help needed
- Cross-project links (YiAi contract feedback, YiPet shared client thinking)

Use [weekly-report-prompt.md](../../../ai-engineer/methodology/prompts/weekly-report.md) to let AI draft + owner review then send.

### Daily report cadence

Every day before 18:00 bot pushes:

- Today's PR list + commit link
- Today completed / not completed
- Tomorrow's plan
- Blockers

Daily report is lightweight; no separate file; via bot + group pin.

### Retrospective cadence

After each view domain lands or after a cross-project bug fix, must run a retrospective ([retrospective-meeting-template.md](../../delivery/retrospective-meeting.md)). Result lands under `lessons/{wins,failures,gotchas}/`:

| Type | Landing point |
|---|---|
| Success case study | `lessons/wins/*.md` (e.g. [yiai-brd-agent-launch.md](../../../engineer/lessons/win-yiai-brd-agent-launch.md)) |
| Failure retrospective | `lessons/failures/*.md` |
| Engineering trap | `lessons/gotchas/*.md` (e.g. [vite-to-rsbuild-migration.md](../../../engineer/lessons/gotcha-vite-to-rsbuild-migration.md)) |

Retrospective instance pattern see [retrospective-sample.md](../../delivery/retrospective.md).

### Cross-project links

YiVad is a YiAi contract consumer. Each month do a cross-project contract alignment:

- Scan YiAi CLAUDE.md "Cross-project protocol" table; align field names + parameter shapes
- Scan YiAi CLAUDE.md "Module Boundaries" table; confirm YiVad caller doesn't bypass public API
- Scan `lessons/gotchas/`; confirm cross-project field-name pitfalls not re-introduced
- YiPet shared client thinking (YiPet is TS; YiVad is also TS; consider sharing api-client)

### Current main owner

| Role | Name | Contact |
|---|---|---|
| Project owner | TBD | TBD |
| Frontend architecture | TBD | TBD |
| ProTable / component library | TBD | TBD |
| Routing / permissions | TBD | TBD |
| Code review | TBD | TBD |

> Placeholder; please project owner fill in then delete this row.

## Action recommendations

1. **New iteration kickoff** — weekly meeting confirms this week's focus view domain + cross-project contract plan; register at CLAUDE.md "Recent Changes" beginning + CHANGELOG.md.
2. **New list page → ProTable** — forbidden bare `el-table`; columns + `requestApi` + `:selection` as needed.
3. **New button permission** — backend configures permission code + frontend `v-auth`; forbidden `v-if` based on permission.
4. **Cross-project call YiAi** — field names by contract: `filter` not `query`, `target_file` not `path`; before new calls first read YiAi CLAUDE.md contract table.
5. **SSE streaming** — `onDone` must guard `!aborted && !error` then auto-forward WeCom.
6. **Knowledge leaf add/remove** — sync `leaves.ts` + `{index,detail}.vue` + `staticRouter.ts` literal routing.
7. **New-hire onboarding** — follow `onboarding.md`; Day-1 SPA + ProTable + `v-auth`.
8. **Handoff** — follow `project-handover-process.md` three artifacts + 1on1 record.
9. **Weekly report** — Friday 16:00 use `weekly-report-prompt.md` to draft + review + send to `../../delivery/`.
10. **Retrospective** — after each domain lands or bug fix must run retrospective; result lands under `lessons/`.

## Anti-patterns

- **Bare `el-table`** — loses search / pagination / integration; new list must be ProTable.
- **`v-if` based on permission** — bypasses `v-auth`; permission scattered.
- **Direct import `axios`** — bypasses `RequestHttp`; loses interceptors.
- **Options API** — forbidden; only `<script setup>`.
- **Knowledge leaf `map`-generated routing** — Rsbuild static analysis fails; declare literally.
- **`query` calling `query_documents`** — silently drops filter.
- **`path` calling `/read-file` / `/write-file`** — 422.
- **SSE `onDone` not guarded** — half message forwarded to WeCom.
- **Env prefix `VITE_`** — migrated to `RSBUILD_ENV_*`; old prefix invalid.
- **New view domain not registered in Recent Changes / CHANGELOG** — history breaks.
- **New hire not running Day-1 task checklist** — first week pitfall probability 90%.
- **Handoff only drops code not onboarding** — handoff-er 1 week to run; must use three artifacts.


- **Adding a new view without registering the route in the static router** — the page is unreachable at runtime, and Rsbuild tree-shaking may strip the entire view module during production builds.
- **Using `ref` for the ProTable `requestApi` data source** — the reactivity chain breaks when the ref is reassigned; use `reactive` or `computed` for data that the ProTable needs to track.
- **Copying a ProTable page without adapting the `columns.ts` definitions** — stale column definitions produce wrong filters, broken search, and mismatched field names that fail silently at runtime.
- **Skipping the CHANGELOG.md entry for a view domain landing** — downstream consumers and stakeholders have no visibility into what changed without a changelog entry; every domain landing must include one.
- **Running `pnpm dev` without verifying the mock API layer against the real YiAi backend** — the frontend works in development but fails against real API responses with different field shapes, error formats, or missing endpoints.

## Related

- [YiVad architecture overview](../../../engineer/projects/yivad/architecture.md) — layers / data flow / degradation
- [YiVad functional module checklist](../../../engineer/projects/yivad/functional-modules.md) — views / api modules / stores map
- [YiVad dev standards](../../../engineer/projects/yivad/dev-standards.md) — SFC / ProTable / v-auth / SSE / env / lint
- [YiVad new-hire guide](../../../new-hire/onboarding/yivad/onboarding.md) — Day-1 setup + workflow + pitfalls
- [rag-system-pages-reference.md](../../../engineer/projects/yivad/rag-system-pages-reference.md) — RAG five-page menu
- [iteration PM handbook](../../../engineer/process/iteration-pm-handbook.md)
- [project handoff process](../../../engineer/process/project-handover.md)
- [weekly meeting template](../../delivery/weekly-meeting.md) · [retrospective meeting template](../../delivery/retrospective-meeting.md) · [review meeting template](../../delivery/review-meeting.md)
- [weekly report instance](../../delivery/weekly-report.md) · [retrospective instance](../../delivery/retrospective.md)
- [weekly report prompt](../../../ai-engineer/methodology/prompts/weekly-report.md) · [retrospective template](../../../knowledge-curator/templates/retrospective.md) · [1on1 template](../../../knowledge-curator/templates/one-on-one.md)
- [YiAi project management](../yiai/project-management.md) — contract provider
- [YiPet project management](../yipet/project-management.md) — same family extension
