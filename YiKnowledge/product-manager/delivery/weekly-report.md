---
title: Yi family weekly report instance (2026 week 31)
aliases: [weekly-report-sample, weekly-report-example, yry-weekly-report]
tags: [weekly-report, instance, sample, yi-family, week-31]
category: product-manager/delivery
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: weekly
last_verified: 2026-08-07
tacit: false
roles: [product-manager, tech-lead]
benefit: "Weekly reports provide stakeholders with a clear picture of progress, risks, and decisions made"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified
related:
  - ./weekly-meeting.md
  - ./retrospective.md
  - ../../ai-engineer/methodology/prompts--weekly-report.md
  - ../projects/yiai--project-management.md
  - ../projects/yivad--project-management.md
  - ../projects/yipet--project-management.md
---

> **Status (2026-08-07)**: This file is a historical weekly report instance (W31 2026). Several claims in this report do not match the actual codebase state as of 2026-08-07: aicr page (`src/views/aicr/`), knowledge 28 leaf views (`src/views/knowledge/`), bug page (`src/views/bug/`), and story page (`src/views/story/`) do not exist on the YiVad master branch. The aiChat port, sidebar parity, and RSS offload are real and shipped. Treat this report as a historical snapshot, not a verified completion record.

# Yi family weekly report instance (2026 week 31)

> **As a** product manager, **I want to** weekly report, **so that** meeting effective.

> This file is a filled-in weekly report sample, serving as a run instance of [weekly-meeting-template.md](./weekly-meeting.md) and [weekly-report-prompt.md](../../ai-engineer/methodology/prompts--weekly-report.md). Each Friday by 16:00, project owners draft their sections; the PM aggregates and posts this file. A new report next week supersedes it.

## Summary

This week (2026-07-27 ~ 2026-08-02) all three Yi family projects advanced on iteration cadence. **YiAi** completed RAG + Knowledge dual-domain landing + `data/database.py` fixes; **YiVad** completed knowledge 28 leaf views + aicr / bug / story three pages + sidebar parity; **YiPet** completed YiPett shortcut + chat box port + React 18 + Ant Design 5.21 stack migration + Biome 2.5. Cross-project field name contract (`filter` / `target_file`) continues with no new violations.

## Core viewpoints

- **The weekly report is a decision document, not a status summary. It should answer: "what decisions do stakeholders need to make based on this week's progress?"** A weekly report that lists completed tasks without surfacing decisions is a journal entry, not a management tool. The most important content is not what was done but what needs a decision: a risk that requires mitigation, a trade-off that requires stakeholder input, a timeline that needs adjustment. The report should make it easy for a stakeholder to scan and identify the items that require their action.

- **The weekly report's "Risks and countermeasures" section is the most valuable section and the one most teams treat as a formality.** A risk that has been in the "medium" column for 4 consecutive weeks without escalation or mitigation is not being managed. Each risk should have a trend indicator (increasing, stable, decreasing) and a trigger condition: "if X happens, this risk escalates to high and we will take action Y." Without trend and trigger, the risk register is a list of anxieties, not a risk management tool.

- **The weekly report should be written for two distinct audiences: the team (who needs coordination) and stakeholders (who need confidence).** The team section should be detailed and specific: "completed the RAG hybrid retrieval, one integration test failing due to token limit." The stakeholder section should be high-level and decision-oriented: "RAG module on track, one technical issue being resolved, no timeline impact." The same report serves both audiences if the structure separates team-level detail from stakeholder-level summary.

- **The weekly report's "Next week plan" section creates a public commitment that is more effective than private goal-setting.** When the plan is visible to the entire team and to stakeholders, the social pressure to deliver creates accountability without managerial oversight. The key is specificity: "work on the model selector" is not a plan; "implement model selector dropdown with provider icons, connect to API endpoint, write 3 unit tests" is a plan that can be verified next week.

- **Cross-project coordination in the weekly report is the only visibility most stakeholders have into inter-team dependencies.** A dependency that is invisible to stakeholders becomes a surprise when it causes a delay. The weekly report should explicitly list every cross-team dependency: what Team A needs from Team B, when it is needed, and what the fallback is if it is not delivered on time. This visibility allows stakeholders to prioritize resources across teams before the dependency becomes a crisis.

## Key info

- **Weekly report structure (5 sections with decision orientation)**: (1) Executive Summary — 3 sentences: Are we on track? What is the biggest risk? What decision do you need from me?; (2) This week's landing — organized by project, not by person; each item states what was completed, not what was worked on; (3) Next week plan — specific verifiable commitments: "implement model selector dropdown with provider icons" not "work on model selector"; (4) Blockers and help — each blocker has an owner, a deadline, and a fallback if not resolved; (5) Risks and countermeasures — each risk has a trend indicator (↑ increasing, → stable, ↓ decreasing) and a trigger condition for escalation. The Yi-family weekly report follows this structure with the addition of a "Cross-project coordination" section (section 6) for inter-team dependencies.
- **Risk trend management protocol**: Each risk in the weekly report must have a trend indicator updated every week. A risk trending ↑ for 2 consecutive weeks triggers an escalation meeting with stakeholders. A risk that has been "Medium" for 4 consecutive weeks without any trend change is a risk that is not being actively managed (it should be either degrading → escalating, or being mitigated → trending down). The trigger condition defines the boundary: "If X happens, this risk escalates to High and we will take action Y." Without a trigger condition, the risk register is a list of anxieties, not a management tool.
- **Plan vs. Actual reconciliation (the accountability loop)**: Every Monday, the PM copies the previous week's "Next week plan" into a "Plan vs. Actual" column and marks each item as Done, Deferred (with reason), or Replaced (with what replaced it). This reconciliation reveals systematic patterns: If the team consistently delivers 60% of planned items, the planning process is over-optimistic and should reduce commitments by 40%. If the team consistently delivers 90% but replaces 30% of items with unplanned work, the planning process is not capturing the right priorities. The reconciliation is the feedback loop that improves planning accuracy over time.
- **Weekly report writing workflow (5-step process)**: (1) Daily bullet points — each team member maintains a running document, adding bullets as work is completed (not on Friday from memory); (2) Thursday draft — project owners draft their sections by Thursday 16:00; (3) Friday aggregation — PM aggregates all sections, reconciles Plan vs. Actual, writes executive summary; (4) Friday 16:00 publish — report is published and distributed to stakeholders; (5) Friday 16:30 stakeholder readout — 30-minute meeting where stakeholders ask questions about the report they have already read (not a presentation of the report). The report should be readable in 5 minutes by a stakeholder who needs only the executive summary, and in 15 minutes by a stakeholder who reads the full report.
- **Cross-project dependency register format**: Each dependency has a unique ID (DEP-YYYY-NNN), a requesting project, a providing project, a description, a deadline, a fallback plan, and a status (proposed, committed, at-risk, delivered, cancelled). The register is a living document linked from the weekly report. The Yi-family weekly report currently tracks dependencies in paragraph form; the recommendation is to upgrade to a structured register with unique IDs for traceability across weeks.
- **Yi-family weekly reporting practices (2026-08)**: The weekly report is produced every Friday by 16:00 covering all 3 Yi-family projects (YiAi, YiVad, YiPet). The report is the primary cross-project coordination mechanism. The report template is documented in `weekly-meeting.md` and the generation prompt is in `weekly-report-prompt.md`. The YiAi BRD Agent can generate a weekly report draft from project management data and git history. The report is archived in YiKnowledge as a running instance; each week's report supersedes the previous one. The "No-surprises" rule: any item in "This week's landing" must have been forecast in the previous week's "Next week plan" or flagged as an emergent priority.

## This week's landing

### YiAi

- **domain/rag/ + services/rag/** — RAG engine built on llama_index, hybrid retrieval (vector + BM25 via `QueryFusionRetriever`) + optional `LLMRerank` + inline citation `_NumberSourcesPostprocessor`. `config.yaml` adds a `rag:` section (embed/llm models, top_k, chunk_size, hybrid/retrieval/rerank/citations toggles). `server/routes/rag.py` registers the route.
- **domain/knowledge/ + services/knowledge/** — Knowledge scan `scanner.py` + apscheduler polling `watcher.py` (macOS FSEvents is broken, use poll) + `writer.py` write-back. MongoDB `knowledge_files` collection mirrors the markdown tree + frontmatter.
- **data/database.py fix** — Added `find_many` + `delete_one` (previously `domain/files/storage.py` called undefined wrappers → AttributeError).
- **Cross-project contract hygiene** — Documented `filter` not `query` contract (YiPet `SessionService.list/get` fix) + `target_file` not `path` contract (YiVad `fileService.readFile/writeFile` fix).

### YiVad

- **src/views/knowledge/** — 28 second-level leaves (industry/competitors, tech/ai-foundations, work/processes…) × `(index,detail).vue` = 56 thin wrappers; `leaves.ts` SSOT; `staticRouter.ts` 56 literal routes (not generated via `map`, for Rsbuild static analysis).
- **src/views/aicr/components/KnowledgeTree.vue** — aicr FileTree bridges YiKnowledge metadata, showing `story.md` / `lessons` / `methodology`.
- **src/views/story/** — Story detail page renders `story.md` (MarkdownView) + navigation to aicr review.
- **src/views/bug/** — Bug list + detail page (per `bug-logging-protocol.md` RPC shape) + MongoDB `bugs` collection.
- **src/api/modules/** — Added `knowledgeService.ts` + `ragService.ts` (RAG chat reuses SSE parser).
- **Sidebar parity** — ChatSidebar + aiChat ConversationSidebar + aicr FileTree all aligned to FileTree baseline (favorites + batch + hover action row + inline rename).
- **RSS offloaded to YiKnowledge** — RSS body → markdown in `YiKnowledge/{category}/`; MongoDB stores metadata only (`category_path` + `file_path`).

### YiPet

- **YiPett shortcut + chat box port** — `Esc` closes chat, `Ctrl+Shift+X` toggles, role system prompt wired, conversations persist. YiPett's full feature set remains out of scope.
- **Stack migration** — React 15 + Bootstrap → React 18.3 + Ant Design 5.21; ESLint → Biome 2.5; docs synced.
- **chat.js jsxDEV mismatch fix** — dev React plugin + production `NODE_ENV` define = `jsxDEV is not a function`; chat bundle dev script changed to `--mode production`.

## Next week plan

### YiAi

- Evaluate `pi-ai` / `llama_index.llms.*` multi-provider routing options, produce ADR (OpenAI / Anthropic / Google / Ollama route dispatch).
- Introduce `pytest` + `httpx` integration test scaffolding; prioritize RPC contract + `_build_filter` boundary + RAG recall.
- Borrow pi supply chain hardening checklist: `uv` / `pip-tools` lockfile + `pip-audit` + pre-commit blocking lockfile mis-submission.

### YiVad

- Add "ask RAG about this leaf" button, calling `/rag` with `scope=category/leaf/`.
- YiVad RAG chat page renders SSE source path as clickable link, jumping to Knowledge detail.
- Introduce Vitest (coverage pain has arrived; composable + store first).

### YiPet

- Evaluate adding `RagService` + `KnowledgeService` (YiAi endpoints ready, `ApiClient` supports SSE).
- Add model selector to chat UI (pending YiAi multi-provider API landing).
- Borrow `pi-tui` differential render idea for chat incremental render.

## Blockers and help

- **YiAi**: `ruff` / `pytest` introduction needs owner approval; request PM coordinate a time window.
- **YiVad**: YiAi multi-provider API not yet landed, YiVad model selector UI blocked; next week build UI skeleton first, integrate after backend API lands.
- **YiPet**: YiAi RAG endpoint ready but YiPet hasn't consumed it yet; request YiAi team to provide a scope naming convention document.

## Cross-project coordination

- **Field name contract**: no new violations this week; continue monthly alignment scan of CLAUDE.md contract tables + module boundary + `lessons/gotchas/`.
- **Shared client idea**: YiVad (Vue + TS) and YiPet (React + TS) could share an api-client base class (YiAi RPC envelope parsing + SSE parser); next week each side sends 1 person for a 1-hour design sync.
- **OSS tracking**: [llama_index evolution](../../ai-engineer/platform/llama-index-evolution.md) + [Pi Agent Harness evolution](../../engineer/engineering/pi-agent-harness-evolution.md) two tracking entries landed; monthly scan release notes for updates.

## Risks and countermeasures

| Risk | Impact | Countermeasure |
|---|---|---|
| YiAi has no lockfile | dependency drift / supply chain attack surface large | Borrow pi checklist: `uv` + `pip-audit` + min-release-age equivalent |
| YiVad has no tests | regression risk high | Introduce Vitest, composable + store first |
| Cross-project SSE half-message leak | user confusion | Fixed YiVad `aicr/chat.ts`; keep guarding `onDone` |
| macOS FSEvents silently drops events | knowledge base watcher not updating | Switched to apscheduler polling; not dependent on system events |
| YiAi RAG evaluation missing | recall not quantifiable | Introduce `llama-datasets` + `ragas` style evaluation (next week plan) |

## Action recommendations

1. **Add a "Plan vs. Actual" reconciliation section to the weekly report template starting next week.** Every Monday, the PM should copy the previous week's "Next week plan" into a new "Plan vs. Actual" column and mark each item as Done, Deferred, or Replaced. This single change closes the accountability loop between planning and execution and reveals whether the team is systematically over-planning or under-delivering.

2. **Assign a risk trend indicator (up/down/stable arrow) to every risk in the "Risks and countermeasures" section immediately.** A risk that has been "Medium" for 4 consecutive weeks without a trend indicator is a risk that is not being managed. The PM should add a trend column and require that any risk trending upward for 2 consecutive weeks triggers an escalation meeting with stakeholders.

3. **Schedule a 30-minute "stakeholder readout" meeting every Friday at 16:30, immediately after the weekly report is published.** The meeting is not for the team to present the report -- it is for stakeholders to ask questions about the report they have already read. The PM's job is to ensure the report is clear enough that stakeholders can read it in 5 minutes and arrive with questions, not with confusion.

4. **Create a "cross-project dependency register" as a living document linked from the weekly report within the next sprint.** The current "Cross-project coordination" section is a paragraph, not a register. Each dependency should have a unique ID, a requesting project, a providing project, a deadline, a fallback plan, and a status. This register becomes the single source of truth that stakeholders can scan to understand inter-team risk.

5. **Institute a "no-surprises" rule: any item that appears in the "This week's landing" section must have been forecast in the previous week's "Next week plan" or flagged as an emergent priority.** If a major deliverable lands without prior forecast, the PM should ask in the retrospective: "Why was this not forecast?" This rule prevents the weekly report from becoming a highlight reel of unplanned work that masks the team's true velocity.

## Anti-patterns

- **The weekly report that is written on Friday afternoon from memory rather than compiled from daily notes throughout the week.** A report written from memory is a highlight reel of what the writer remembers, not an accurate record of what happened. The small setbacks, the partial progress, and the near-misses are lost, creating a sanitized version of the week that is misleading to stakeholders. The discipline: maintain a running document throughout the week, adding bullet points as work is completed, and compile the report from the running document.

- **The weekly report that buries problems in the middle of a paragraph to make them less visible.** "The team made excellent progress on the RAG module, with one minor issue related to token limits that we are investigating" is a problem minimized. The more honest format: "RAG module: token limit issue discovered this week. Impact: hybrid retrieval returns incomplete results for queries longer than 2,000 tokens. Plan: implement chunking strategy, estimated 3 days. No timeline impact yet." The problem should be as visible as the progress.

- **The weekly report that becomes a competition for who accomplished the most.** When team members pad their sections with minor tasks to appear productive, the report becomes a performance theater. The PM should set the expectation that the report is for coordination, not evaluation, and that honest reporting of challenges and partial progress is more valuable than inflated accomplishments.

- **The weekly report with no connection to the previous week's "Next week plan."** When the "Next week plan" from the previous report promised 5 deliverables, and the "This week's landing" section reports 3 completely different deliverables, the planning process is broken. The report should explicitly reconcile the plan with the reality: "Planned: model selector UI. Actual: model selector UI deferred because API endpoint was delayed. Replaced with: sidebar parity work." This reconciliation is the feedback loop that improves planning accuracy.

- **The weekly report that stakeholders do not read because it is too long and too detailed.** A weekly report that exceeds 2 pages will not be read by executives. The solution is a layered structure: a 3-sentence executive summary at the top, followed by the detailed sections. The executive summary should answer: (1) Are we on track? (2) What is the biggest risk? (3) What decision do you need from me? Stakeholders who need more detail can read the full report; those who need only the summary can stop after 3 sentences.

## Related

- [Weekly meeting template](./weekly-meeting.md) · [Weekly report Prompt](../../ai-engineer/methodology/prompts--weekly-report.md)
- [Retrospective instance](./retrospective.md) (this iteration's retrospective)
- [YiAi project management](../projects/yiai--project-management.md) · [YiVad project management](../projects/yivad--project-management.md) · [YiPet project management](../projects/yipet--project-management.md)
- [YiAi architecture overview](../../engineer/projects/yiai/architecture.md) · [YiVad architecture overview](../../engineer/projects/yivad/architecture.md) · [YiPet architecture overview](../../engineer/projects/yipet/architecture.md)
- [YiAi CLAUDE.md Recent Changes](../../engineer/projects/yiai/engineering/claude.md#recent-changes) · [YiVad CLAUDE.md Recent Changes](../../engineer/projects/yivad/engineering/claude.md#recent-changes) · [YiPet CLAUDE.md Recent Changes](../../engineer/projects/yipet/engineering/claude.md#recent-changes)
