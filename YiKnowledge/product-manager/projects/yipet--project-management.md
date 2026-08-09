---
title: YiPet project management
aliases: [yipet-project-management, yipet-pm, yipet-iteration-cadence]
tags: [yipet, project-management, iteration, onboarding, handoff, weekly, retrospective, mv3]
category: product-manager/projects/yipet
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
benefit: "YiPet project iterations are predictable and stakeholders have clear visibility into progress and blockers"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
 - ../../../engineer/projects/yipet/architecture.md
 - ../../../engineer/projects/yipet/functional-modules.md
 - ../../../engineer/projects/yipet/dev-standards.md
 - ../../../new-hire/onboarding/yipet/onboarding.md
 - ../../../engineer/projects/yipet/engineering/claude.md
 - ../../../engineer/process/iteration-pm-handbook.md
 - ../../../engineer/process/project-handover.md
 - ../../meetings/weekly-meeting.md
 - ../../meetings/retrospective-meeting.md
 - ../../meetings/weekly-report.md
 - ../../meetings/retrospective.md
 - ../../../ai-engineer/methodology/prompts/weekly-report.md
 - ../../../knowledge-curator/templates/retrospective.md
---

# YiPet project management

> **As a** product manager, **I want to** project management, **so that** project managed well.

## Summary

YiPet is the Yi family browser extension (Chrome MV3 + React 18 + Ant Design 5 + Rsbuild + Biome + Vitest); iteration centers on "popup / chat component-driven + API four-tier + MV3 dual-world boundary" as the main axis. Each iteration cadence = one group of popup / chat component landed + accompanying api service + i18n key sync. Current cadence: weekly meeting once (Friday), daily report progress, iteration-end retrospective. New hires go through Day-1 setup + MV3 dual-world concept + bring up YiAi RPC. Handoff uses a three-piece set: onboarding + engineering mirror + current iteration component checklist.

## Core viewpoints

- **Component-driven iteration** — each iteration cadence focuses on landing one group of popup / chat component (e.g. chat 19 components + popup 4 components + controller.ts; 2026-07-27 landed YiPett shortcut + chat box).
- **API four-tier no skipping** — new services must run `client.ts → endpoints.ts → types.ts → services/*.ts` end-to-end; no skipping layers.
- **MV3 dual-world boundary is core reality** — new content script capability must clearly state "ISOLATED or MAIN"; no mixing.
- **i18n key strong sync** — new keys must sync `messages.json` + `MessageKey` type union; missing sync TS does not error but falls back at runtime to the key itself.
- **New hire Day-1 bring up extension** — `pnpm install` + `pnpm build` + Chrome `chrome://extensions` load `dist/` + popup + chat + one-shot `chrome.tabs.sendMessage` IPC.
- **Supply chain hardening borrowing pi** — current `pnpm-lock.yaml` is ground truth; can later borrow pi's `min-release-age` + shrinkwrap allowlist.

## Key information

### Iteration cadence

| Cadence | Frequency | Duration | Action |
|---|---|---|---|
| Daily report | Every day | 5 min | Group bot pushes today's PR + commit; self-report progress |
| Weekly meeting | Friday | 30 min | Component landing status walkthrough + API service new plan + cross-project contract consumption plan |
| Iteration end | After each group of components lands | 1h | Retrospective + CLAUDE.md "Recent Changes" registration |
| Quarterly review | Quarter end | 2h | Scan all `src/` directories for health + API four-tier boundary drift review + MV3 CSP compliance review |

### Iteration deliverables

Each iteration cadence delivers:

| Output | Location |
|---|---|
| Component code | `src/popup/components/<Name>/` or `src/chat/components/<Name>/` (TSX + CSS colocated + barrel) |
| API service | `src/api/services/<name>.ts` (constructor injects `ApiClient`) + `index.ts` aggregate |
| Types | `src/api/types.ts` add interface |
| Endpoints | `src/api/endpoints.ts` add path constant |
| i18n key | `public/_locales/{en,zh_CN}/messages.json` + `src/shared/i18n/index.ts` `MessageKey` sync |
| Background routing | `src/background/` (if a new message type is needed) |
| Content script | `src/content/` (if a new dual-world capability is needed) |
| CLAUDE.md update | "Recent Changes" section add date + change summary |
| Mirror sync | `cp` to `YiKnowledge/engineer/projects/yipet/engineering/{claude,readme}.md` |
| Retrospective | `../../delivery/retrospective.md` template; results stored in `lessons/{wins,failures,gotchas}/` |

### New hire onboarding process

1. **Day-1 setup** — `pnpm install` + `pnpm build` + Chrome `chrome://extensions` enable "developer mode" + "load unpacked extension" select `dist/` + verify popup + verify chat (`Ctrl+Shift+X` invoke) + one-shot `chrome.tabs.sendMessage` IPC bring-up.
2. **Three high-frequency workflows** (see `onboarding.md`) — ① add a popup component ② add a chat component + controller state ③ add an api service.
3. **New hire pitfall quick reference** — MV3 dual-world boundary, CSP compliance, `filter` vs `query`, `target_file` vs `path`, i18n key missing sync, `jsxDEV is not a function`, etc.

### Handoff process

Follow [project-handover-process.md](../../../engineer/process/project-handover.md) three-piece set:

| Output | Path | Use |
|---|---|---|
| Onboarding | `projects/YiPet/onboarding.md` | New hire Day-1 setup + workflow + pitfall quick reference |
| Engineering mirror | `projects/YiPet/engineering/{claude,readme}.md` | Architecture + module boundaries + Recent Changes |
| Current iteration state | `YiPet/CLAUDE.md` "Recent Changes" + this file's iteration cadence table | Successor quickly locates "which component group we're currently in" |

Handoff 3 steps: ① main owner updates onboarding.md owner / contact; ② cp latest CLAUDE.md / README.md to engineering/; ③ walk through with successor 30 minutes reading (must include dual-world boundary demo) + leave 1on1 record.

### Weekly report cadence

Every Friday before 16:00 submit this week's weekly report, following `../../delivery/weekly-report.md` template. Includes:

- This week landed (popup component / chat component / api service / i18n key / background routing / content capability)
- Next week plan (component group / api service / cross-project contract consumption / risk)
- Blockers and help
- Cross-project links (YiAi contract change feedback, YiVad shared client approach)

Use [weekly-report-prompt.md](../../../ai-engineer/methodology/prompts/weekly-report.md) to let AI draft + main owner verify then send.

### Daily report cadence

Every day before 18:00 push to group bot:

- Today's PR list + commit links
- Today completed / not completed
- Tomorrow's plan
- Blocker items

### Retrospective cadence

After each group of components lands or after a cross-project bug fix, must run a retrospective ([retrospective-meeting-template.md](../../delivery/retrospective-meeting.md)). Results land in `lessons/{wins,failures,gotchas}/`:

| Type | Location |
|---|---|
| Success case study | `lessons/wins/*.md` |
| Failure retrospective | `lessons/failures/*.md` |
| Engineering pitfalls | `lessons/gotchas/*.md` (e.g. [react-jsxdev-mismatch.md](../../../engineer/lessons/gotcha-react-jsxdev-mismatch.md)) |

Retrospective instance template see [retrospective-sample.md](../../delivery/retrospective.md).

### Cross-project links

YiPet is a YiAi contract consumer (same as YiVad). Every month run a cross-project contract alignment:

- Scan YiAi CLAUDE.md "Cross-project protocol" table, align field names + parameter shapes
- Scan YiAi CLAUDE.md "Module Boundaries" table
- Scan `lessons/gotchas/`, confirm `filter` / `target_file` class pitfalls not re-introduced
- YiVad shared client approach (YiVad is Vue + TS, YiPet is React + TS; can consider sharing api-client base class)
- YiAi future RAG / Knowledge endpoint consumption window (`ApiClient` already supports SSE, pending add `RagService` + `KnowledgeService`)

### Current main owner

| Role | Name | Contact |
|---|---|---|
| Project owner | TBD | TBD |
| Extension architecture | TBD | TBD |
| React / Ant Design | TBD | TBD |
| MV3 / CSP | TBD | TBD |
| Code review | TBD | TBD |

> Placeholder fields, please have project owner fill in then delete this row.

## Action recommendations

1. **New iteration kickoff** — weekly meeting confirms this week's focused component group + api service plan; register at the top of CLAUDE.md "Recent Changes".
2. **New component → `src/popup/components/` or `src/chat/components/`** — one component one directory, TSX + CSS colocated + barrel.
3. **New api service** — four-tier complete: `client.ts` wrapper + `endpoints.ts` path + `types.ts` interface + `services/*.ts` class; `index.ts` aggregate.
4. **i18n new key** — `messages.json` + `MessageKey` sync add; missing sync runtime falls back to key itself.
5. **New CDN resource** — add to `src/content/cdn/catalog.ts`; do not write directly to manifest.
6. **Cross-project call to YiAi** — field names by contract: `filter` not `query`, `target_file` not `path`.
7. **New dual-world capability** — clearly state ISOLATED or MAIN; do not mix `chrome.runtime.*` with page globals.
8. **Must run before submit** — `npm run typecheck && npm run build`; type error / build failure must not submit.
9. **chat bundle dev modification** — keep `--mode production`, avoid `jsxDEV is not a function`.
10. **New hire onboarding** — follow `onboarding.md`; Day-1 bring up extension + popup + chat + IPC.
11. **Handoff** — follow `project-handover-process.md` three-piece set + 1on1 record (must include dual-world boundary demo).
12. **Weekly report** — Friday before 16:00 use `weekly-report-prompt.md` to draft + verify + send to `../../delivery/`.
13. **Retrospective** — after each group of components lands or after bug fix must run retrospective, results land in `lessons/`.

## Anti-patterns

- **API tier skipping** — types import services, client import services, service skips client and directly calls `fetch`: violates four-tier.
- **MV3 CSP violation** — remote code / eval / inline script; vendor not local.
- **`query` calls `data_service.query_documents`** — silently drops filter.
- **MAIN world calls `chrome.runtime.*`** — unusable; only callable in ISOLATED.
- **Dev mode chat bundle without `--mode production`** — `jsxDEV is not a function`.
- **Cross-component shared state not via `useSyncExternalStore`** — direct mutate global loses reactivity.
- **i18n key only changes one side** — `messages.json` and `MessageKey` out of sync.
- **New CDN resource written directly to manifest** — bypasses catalog; injection mechanism fails.
- **`Date.toLocaleString()` directly called** — loses timezone; use `Intl.DateTimeFormat` + explicit timezone.
- **Class component** — forbidden; function component + hooks only.
- **New component not registered in Recent Changes** — history breaks.
- **New hire not running Day-1 task checklist** — first week pitfall probability 90%.
- **Handoff only hands off code not onboarding** — successor takes 1 week to bring up; must run three-piece set.


- **Adding new permissions to manifest.json without testing the install-time permission warning UX** — Chrome shows a prominent warning dialog for new permissions; excessive or unclear permissions drive user uninstalls.
- **Using `window.localStorage` in content scripts** — content scripts share the page's origin; stored data may collide with or be read by the host page, creating a security and data integrity risk.
- **Bundling large dependencies into the extension without tree-shaking** — MV3 enforces a package size limit; unused imports from large libraries silently inflate the bundle and risk rejection from the Chrome Web Store.
- **Testing only in Chrome, skipping Firefox and Safari** — MV3 APIs have subtle cross-browser differences (e.g. `chrome.*` vs `browser.*`, service worker lifecycle); test on all target browsers before release.
- **Skipping extension update testing from the previous release version** — users on old versions may experience data migration issues, broken storage schemas, or stale service workers; test the update path explicitly.

## Related

- [YiPet Architecture overview](../../../engineer/projects/yipet/architecture.md) — dual-world boundary / API four-tier / data flow / downgrade
- [YiPet functional module checklist](../../../engineer/projects/yipet/functional-modules.md) — module map
- [YiPet development spec](../../../engineer/projects/yipet/dev-standards.md) — TSX structure / API four-tier / MV3 / i18n / time / CSP
- [YiPet new hire guide](../../../new-hire/onboarding/yipet/onboarding.md) — Day-1 setup + workflow + pitfall quick reference
- [Iteration PM handbook](../../../engineer/process/iteration-pm-handbook.md)
- [Project handover process](../../../engineer/process/project-handover.md)
- [Weekly meeting template](../../delivery/weekly-meeting.md) · [Retrospective meeting template](../../delivery/retrospective-meeting.md) · [Review meeting template](../../delivery/review-meeting.md)
- [Weekly report instance](../../delivery/weekly-report.md) · [Retrospective instance](../../delivery/retrospective.md)
- [Weekly report prompt](../../../ai-engineer/methodology/prompts/weekly-report.md) · [Retrospective template](../../../knowledge-curator/templates/retrospective.md) · [1on1 template](../../../knowledge-curator/templates/one-on-one.md)
- [Pi Agent Harness evolution tracking](../../../engineer/engineering/pi-agent-harness-evolution.md) — TS multi-provider + supply chain hardening reference template
- [YiAi project management](../yiai/project-management.md) — contract provider
- [YiVad project management](../yivad/project-management.md) — same-family front-end reference
