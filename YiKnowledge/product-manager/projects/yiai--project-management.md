---
title: YiAi project management
aliases: [yiai-project-management, yiai-pm, yiai-iteration-cadence]
tags: [yiai, project-management, iteration, onboarding, handoff, weekly, retrospective]
category: product-manager/projects/yiai
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
benefit: "YiAi project iterations are predictable and stakeholders have clear visibility into progress and blockers"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - anti-patterns or when-not-to-use are identified
related:
  - ../../../engineer/projects/yiai/architecture.md
  - ../../../engineer/projects/yiai/functional-modules.md
  - ../../../engineer/projects/yiai/dev-standards.md
  - ../../../new-hire/onboarding/yiai--onboarding.md
  - ../../../engineer/projects/yiai/engineering/claude.md
  - ../../../engineer/process/iteration-pm-handbook.md
  - ../../../engineer/process/project-handover.md
  - ../../delivery/weekly-meeting.md
  - ../../delivery/retrospective-meeting.md
  - ../../delivery/weekly-report.md
  - ../../delivery/retrospective.md
  - ../../../ai-engineer/methodology/prompts--weekly-report.md
  - ../../../knowledge-curator/templates/retrospective.md
---

# YiAi project management

> **As a** product manager, **I want to** project management, **so that** project managed well.

## Summary

YiAi is the backend foundation of the Yi family, with iteration centered on "domain-driven + cross-project RPC contract driven" as the main axis. Each iteration cadence = one domain implementation + cross-project contract registration + one retrospective. Current cadence: weekly meeting once (Friday), daily report async (enterprise WeChat / DingTalk group), iteration ends with one retrospective. New hire: 30 minute setup + Day-1 task list. Handoff goes via `work/processes/project-handover-process.md` triad: onboarding + engineering mirror + story current status.

## Core viewpoints

- **Domain-driven iteration** — each iteration cadence focuses on one domain implementation (e.g. 2026-07-31 landed `domain/rag/` + `domain/knowledge/`, 2026-07-28 landed `data/database.py` patch); not scattered across multiple domains in parallel.
- **Cross-project contract first** — before adding a new RPC method, first register in CLAUDE.md "Cross-project protocol" table the parameter shape + common pitfalls, then write code; backend contract = frontend caller contract.
- **New hire 30 minute setup** — `onboarding.md` Day-1 run through `python main.py` + `/health/observer` + `/rag-build` + `/rag-query`; use curl to call `query_documents` once (note `filter` not `query`).
- **Daily report async / weekly meeting sync** — daily report goes through the group bot (bot pushes the day's PR + commits); Friday weekly meeting reviews this week's domain implementation status + next week's contract addition plan.
- **Iteration ends must Retrospective** — after implementing one domain / fixing one cross-project bug, must run a retrospective; Retrospective instance per [retrospective-sample.md](../../delivery/retrospective.md) paradigm.

## Key information

### Iteration cadence

| Cadence | Frequency | Duration | Action |
|---|---|---|---|
| Daily report | Daily | 5 min | Group bot pushes the day's PR + commits; self-report progress |
| Weekly meeting | Friday | 30 min | Domain implementation status review + cross-project contract addition plan + risk |
| Iteration end | After each domain implementation | 1h | Retrospective + CLAUDE.md "Recent Changes" registration |
| Quarterly review | End of quarter | 2h | Scan `domain/` full-domain health + contract table alignment + module boundary drift audit |

### Iteration deliverables

Each iteration cadence deliverables:

| Output | Landing point |
|---|---|
| Domain code | `src/domain/<name>/` + `src/services/<name>/` + `src/server/routes/<name>.py` |
| Public API convergence | `domain/<name>/__init__.py` or top-level module (`engine.py` / `scanner.py` etc.) |
| CLAUDE.md update | "Module Boundaries" table registers new domain public API + internal files |
| CLAUDE.md contract | "Cross-project protocol" table registers new RPC method parameters + common pitfalls |
| CLAUDE.md Recent Changes | Implementation date + change summary + impact surface |
| Mirror sync | `cp` to `YiKnowledge/engineer/projects/yiai/engineering/{claude,readme}.md` |
| Knowledge link | If adding RAG / Knowledge base capability, write `YiKnowledge/tech/ai-platform/*-summary.md` |
| Retrospective | `../../delivery/retrospective.md` paradigm, result filed under `lessons/wins/` or `lessons/failures/` |

### New hire onboarding process

1. **30 minute setup** (see `onboarding.md` §2) — Python 3.10+ venv + MongoDB + Ollama + `python main.py` + `/health/observer` validation.
2. **Day-1 task list** (see `onboarding.md` §6) — run through backend + call `query_documents` + add `/ping` endpoint + submit PR + find a colleague for 30 minute read-through.
3. **Three high-frequency workflows** (see `onboarding.md` §3) — 1) add RPC endpoint 2) add independent REST route 3) trigger RAG rebuild.
4. **New hire pitfall quick-lookup** (see `onboarding.md` §4 + §8) — `filter` vs `query`, `target_file` vs `path`, Ollama not running / index not built, etc.

### Handoff process

Via [project-handover-process.md](../../../engineer/process/project-handover.md) triad:

| Output | Path | Use |
|---|---|---|
| Onboarding | `projects/YiAi/onboarding.md` | New hire Day-1 setup + workflow + pitfall quick-lookup |
| Engineering mirror | `projects/YiAi/engineering/{claude,readme}.md` | Architecture + module boundary + Recent Changes |
| Current iteration status | `YiAi/CLAUDE.md` "Recent Changes" + this file's iteration cadence table | Handover receiver quickly positions "which domain is current" |

Handoff 3 steps: 1) primary owner updates onboarding.md §7 owner / contact table; 2) cp latest CLAUDE.md / README.md to engineering/; 3) and handover receiver 30 minute read-through + leave 1on1 record ([one-on-one-template.md](../../../knowledge-curator/templates/one-on-one.md)).

### Weekly report cadence

Submit this week's weekly report by Friday 16:00, per `../../delivery/weekly-report.md` paradigm. Package includes:

- This week's implementation (domain / cross-project contract / bug fix)
- Next week's plan (domain / contract addition / risk)
- Blockers and help requests
- Cross-project link (YiVad / YiPet caller feedback)

Use [weekly-report-prompt.md](../../../ai-engineer/methodology/prompts--weekly-report.md) to have AI auto-draft; primary owner corrects and sends.

### Daily report cadence

Group bot pushes by 18:00 daily:

- Today's PR list + commit links
- Today's completed / not completed
- Tomorrow's plan
- Blocker items

Daily report format is lightweight, no separate file built; follow group bot + group pinning.

### Retrospective cadence

After each domain implementation or each cross-project bug fix, must run a retrospective ([retrospective-meeting-template.md](../../delivery/retrospective-meeting.md)). Result:

| Type | Landing point |
|---|---|
| Success case study | `lessons/wins/*.md` (e.g. [yiai-brd-agent-launch.md](../../../engineer/lessons/win-yiai-brd-agent-launch.md)) |
| Failure retrospective | `lessons/failures/*.md` (e.g. [ai-product-launch-lessons-summary.md](../../../engineer/lessons/failure-ai-product-launch-lessons.md)) |
| Engineering pitfall | `lessons/gotchas/*.md` (e.g. [macos-fsevents-silent-drop.md](../../../engineer/lessons/gotcha-macos-fsevents-silent-drop.md)) |

Retrospective instance paradigm: [retrospective-sample.md](../../delivery/retrospective.md).

### Cross-project link

YiAi is the contract provider, YiVad / YiPet are consumers. Monthly cross-project contract alignment:

- Scan CLAUDE.md "Cross-project protocol" table, align field names + parameter shapes
- Scan CLAUDE.md "Module Boundaries" table, confirm YiVad / YiPet callers have not bypassed public API
- Scan `lessons/gotchas/`, confirm cross-project field name pitfalls (`filter` / `target_file` / `cname`) are not re-hit

### Current primary owner

| Role | Name | Contact |
|---|---|---|
| Project primary owner | TBD | TBD |
| Backend architecture | TBD | TBD |
| RAG / llama_index | TBD | TBD |
| MongoDB / ops | TBD | TBD |
| Code review | TBD | TBD |

> Placeholder fields, please fill in then delete this line.

## Action recommendations

1. **New iteration startup** — weekly meeting confirms this week's focus domain + cross-project contract addition plan; register at the top of CLAUDE.md "Recent Changes".
2. **Cross-project contract first** — before adding a new RPC method, first register parameters + common pitfalls in CLAUDE.md contract table, then write code.
3. **New hire onboarding** — via `onboarding.md` §1-§6; 30 minute setup + Day-1 task list + 30 minute read-through.
4. **Handoff** — via `project-handover-process.md` triad + 1on1 record.
5. **Weekly report** — by Friday 16:00 use `weekly-report-prompt.md` to draft + correct + send to `../../delivery/`.
6. **Retrospective** — after each domain implementation or bug fix, must run retrospective, result filed under `lessons/{wins,failures,gotchas}/`.
7. **Quarterly review** — scan `domain/` full-domain health + contract table alignment + module boundary drift audit.
8. **Cross-project contract monthly alignment** — monthly scan of CLAUDE.md contract table + module boundary + gotchas, confirm callers have not bypassed public API.

## Anti-patterns

- **New `/xxx` route instead of extending service** — routes bloat; prioritize RPC envelope service method extension.
- **Adding RPC method without registering contract table** — callers guess field names; will hit `filter` vs `query` class pitfalls.
- **New hire onboarding without running Day-1 task list** — first week hits `filter` / `target_file` class pitfalls at 90% probability.
- **Handoff drops code but not onboarding** — receiver takes 1 week to run through; must do triad.
- **Retrospective only success not failure** — failure lessons are more valuable; must land `lessons/failures/`.
- **Daily report / weekly report without writing blockers and help** — risk smolders; must write help items.
- **Quarterly review without scanning module boundary drift** — domain import server / route direct call to data etc. violations accumulate; must scan.
- **Cross-project contract only changes backend without notifying frontend** — YiVad / YiPet caller field names wrong; must align monthly.


- **Starting a new domain implementation without updating the CLAUDE.md module boundaries table first** — downstream consumers (YiVad, YiPet) build against stale boundaries and discover breakage only at integration time.
- **Pushing RPC contract changes without running the YiVad and YiPet integration smoke tests** — contract breakage is discovered only when frontend callers fail in production; a cross-project smoke test is mandatory for every contract change.
- **Skipping the retrospective after a small bug fix** — small fixes often hide process issues (missing validation, unclear contract) that will recur; every fix is a retrospective trigger regardless of size.
- **Running the quarterly review without auditing the domain import graph** — circular imports and cross-domain direct calls accumulate silently; a static import graph audit must be part of every quarterly review.
- **Delegating the weekly report entirely to AI without human review** — AI-drafted reports miss nuance, blocker severity, and cross-project context that requires human escalation judgment.

## Related

- [YiAi architecture overview](../../../engineer/projects/yiai/architecture.md) — layered / data stream / degradation
- [YiAi functional modules list](../../../engineer/projects/yiai/functional-modules.md) — domain / service / route mapping
- [YiAi development standards](../../../engineer/projects/yiai/dev-standards.md) — naming / layered / RPC field contract
- [YiAi new hire onboarding](../../../new-hire/onboarding/yiai--onboarding.md) — Day-1 setup + workflow + pitfall quick-lookup
- [Iteration PM handbook](../../../engineer/process/iteration-pm-handbook.md)
- [Project handoff process](../../../engineer/process/project-handover.md)
- [Weekly meeting template](../../delivery/weekly-meeting.md) · [Retrospective meeting template](../../delivery/retrospective-meeting.md) · [Review meeting template](../../delivery/review-meeting.md)
- [Weekly report instance](../../delivery/weekly-report.md) · [Retrospective instance](../../delivery/retrospective.md)
- [Weekly report prompt](../../../ai-engineer/methodology/prompts--weekly-report.md) · [Retrospective template](../../../knowledge-curator/templates/retrospective.md) · [1on1 template](../../../knowledge-curator/templates/one-on-one.md)
