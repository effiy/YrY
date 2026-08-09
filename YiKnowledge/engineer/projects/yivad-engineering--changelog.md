---
title: YiVad Engineering — Changelog
lifecycle: active
status: stable
type: summary
category: engineer/projects/yivad/engineering
tags: []
created: 2026-08-03
updated: 2026-08-07
source: internal
last_verified: 2026-08-07
roles: [engineer]
benefit: "Engineers track YiVad changelog entries for release notes and version history"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
---


# Changelog — YiVad

> **As an** engineer, **I want to** see project history, **so that** context is preserved across sessions.

The canonical changelog lives in [`claude.md`](./claude.md) under `## Recent Changes`. This file is the index pointer — full entries are kept there to avoid drift between two sources of truth.

## Core viewpoints

**Changelog entries should be cross-referenced, not duplicated.** The STALE entries in this file (aicr port, knowledge leaf view folders) demonstrate why: when a claim is copied to multiple files without verification, it becomes a liability. The "single source of truth" pattern (details in claude.md, pointers here) prevents drift but requires discipline to maintain.

**STALE markers are a lightweight alternative to deletion.** Rather than removing incorrect entries, marking them as STALE with the audit date and evidence preserves institutional memory. Future readers can see what was claimed, when it was audited, and why it was disproven. This is more valuable than a clean changelog that hides past mistakes.

**Per-message actions in a chat UI are a feature category that tests the entire stack.** Regenerate, retry, resend, delete, and edit each touch the SSE streaming layer, the session persistence layer, and the UI state machine. A bug in any one of these layers breaks the action. The `aborted` flag and `streamingType` were added specifically because these actions exposed edge cases in the streaming pipeline.

**The `filter`/`query` and `target_file`/`path` bugs are the same bug pattern in different domains.** Both are RPC parameter name mismatches between YiVad and YiAi. Both are silent (no error, wrong results or 422). Both were fixed in the same week (2026-07-28). The root cause is the absence of automated contract testing between the two codebases. Until that exists, every new RPC integration is a potential repeat.

**The Vite to Rsbuild migration was a necessary architectural realignment, not a cosmetic upgrade.** The env prefix change (`VITE_` to `RSBUILD_ENV_`) and the custom plugins (`svg-sprite`, `views-glob`) to replicate dropped Vite features are symptoms of a deeper issue: build tool lock-in. The migration was done once, but the custom plugins create a new form of lock-in. The next migration will require similar effort.

## Recent entry pointers

- **2026-08-06** — Knowledge preview dialog local LLM chat: model selector added to `KnowledgeChatPanel` toolbar; per-file model persistence via `kchat:model:<filePath>`; reuses `store.availableModels` + `store.fetchModels()` from aiChat store. See [knowledge-preview-local-chat.md](../knowledge-preview-local-chat.md).
- **2026-08-05** — Frontmatter-loss fix in `KnowledgePreviewDialog.save()`; STALE aicr/Knowledge-leaf cleanup across `CLAUDE.md` + 4 YiKnowledge mirror copies; 77 broken `related:` frontmatter entries removed across 70 files.
- **2026-07-31** — Knowledge + RAG api modules (`knowledgeService.ts`, `ragService.ts`) + `knowledge` / `knowledgeTree` / `rag` / `story` / `bug` Pinia stores + `KnowledgePreviewDialog.vue` knowledge detail dialog.
- **2026-07-30** — Sidebar parity (ChatSidebar + ConversationSidebar + ConversationSessionSidebar under `aiChat/components/`) + RSS body content offloaded to `YiKnowledge/{category}` markdown (MongoDB stores metadata only).
- **2026-07-28** — Bug fixes: `fileService` `path`→`target_file` 422 fix; SSE `onDone` abort guard in `aiChat.ts` before auto-forwarding to WeCom.
- **2026-07-28** — Vite → Rsbuild 1 migration; env prefix now `RSBUILD_ENV_*`.
- **2026-07-27** — aiChat port (from YiWeb `sessionChat`). Per-message actions (regenerate / retry / resend / delete / edit), `streamingType`, `aborted` flag, `scrollTick` throttle.

## STALE — never landed

- **2026-07-27 — aicr port (from YiWeb)**: claimed end-to-end port (9 Pinia stores + 8 modal components). Audited 2026-08-04: `src/views/aicr/` + `src/stores/modules/aicr/` do not exist on master; 0 aicr-specific commits. Functionality subsumed into aiChat components (`ConversationSidebar.vue`, `KnowledgeChatPanel.vue`, `LlamaIndexPanel.vue`, etc.).
- **2026-07-31 — Knowledge leaf view folders**: claimed 28 leaf folders + `leaves.ts` SSOT + `KnowledgeLeafList/Detail` + 56 literal routes. Audited 2026-08-04: none exist on master. Knowledge browsing lives in `KnowledgePreviewDialog.vue` (embedded in aiChat), not standalone routes.

## Action recommendations

1. **Add a changelog verification step to the PR checklist:** Every changelog entry that claims a feature was shipped must be verified against the actual code on the default branch before being merged. The verification step is: (1) check out the branch, (2) verify that the claimed files exist on disk, (3) verify that the claimed routes are registered, (4) verify that the claimed stores are instantiated. This is a 5-minute step that prevents the STALE entry problem documented in this file. The aicr port and knowledge leaf view folders claims would have been caught by this verification step.

2. **Automate the STALE audit with a quarterly script:** Create a script that reads the changelog, extracts all claims that reference specific files or directories, and checks whether those files exist on master. The script should flag any claim where the referenced files do not exist and output a report with the date, the claim, and the missing files. Run this script quarterly. The current manual audit (2026-08-04) found two STALE claims; a quarterly automated audit would catch new STALE claims within 3 months instead of letting them persist indefinitely.

3. **Consolidate the changelog into a single source of truth:** The current setup has details in `claude.md` under `## Recent Changes` and index pointers in this file. This two-file pattern creates maintenance burden and drift risk. Choose one of two paths: (A) make `claude.md` the single source of truth and delete the index pointers in this file, or (B) move the full changelog into this file and have `claude.md` reference it. Path A is simpler and reduces the number of files that need to be updated. The cost is that `claude.md` becomes longer, but the benefit of a single source of truth outweighs the cost.

4. **Add a "How to verify" section to each changelog entry:** Each entry should include a verification command that proves the claim is true. For example: "`ls src/views/aiChat/components/KnowledgePreviewDialog.vue` should exist" or "`curl http://localhost:8848/rag` should return a 200." This is a lightweight addition (one line per entry) that makes the changelog self-verifying. Any future reader can run the verification command and confirm that the claimed feature still exists on the current branch, without needing to manually audit like the 2026-08-04 audit.

5. **Create a changelog entry template with required fields:** The current "How to add an entry" section is a 3-step process. Expand it into a template with required fields: date, summary, files changed (with paths), verification command, and cross-reference (links to related PRs, issues, or knowledge base files). The template should be a comment block at the top of this file that can be copied and filled in. This standardizes the changelog format and ensures that every entry includes the information needed for future verification.

## Anti-patterns

- **Copying the full changelog detail into multiple files.** The changelog body lives in `claude.md` under `## Recent Changes`. This file is for index pointers only. Duplicating full entries here creates drift: one file gets updated, the other does not, and readers see conflicting information. The STALE entries are evidence of this anti-pattern in action.

- **Deleting STALE entries instead of marking them.** When a claimed feature (aicr port, knowledge leaf view folders) is found to not exist on master, the instinct is to delete the incorrect entry. But deletion erases institutional memory. Marking entries as STALE with audit date and evidence preserves the history for future readers who might otherwise repeat the same incorrect claim.

- **Claiming features as shipped without verifying them on master.** The aicr port claim (9 Pinia stores, 8 modal components) and the knowledge leaf view folders claim (28 folders, 56 routes) were both written as if they existed on master. Neither did. The lesson: every changelog entry that claims a feature was shipped must be verified against the actual code on the default branch before being recorded.

- **Using `query` instead of `filter` or `path` instead of `target_file` in RPC calls.** Both parameter name mismatches have caused real bugs. The backend silently ignores `query` (returning all documents or none) and returns 422 for `path`. Always use the contract names as documented in the cross-project protocol table.

- **Skipping the `!aborted && !error` guard before auto-forwarding SSE results to WeCom.** The 2026-07-28 fix in `aiChat.ts` prevents partial or aborted chat content from being auto-forwarded to WeCom robots. Without this guard, users who abort mid-stream would have incomplete content sent to external channels. Every SSE `onDone` handler that forwards data externally must include this guard.

## How to add an entry

1. Append a new bullet under `## Recent entry pointers` with date + brief summary.
2. Full detail goes in [`claude.md`](./claude.md) `## Recent Changes` section.
3. Keep this file as an index — body content stays minimal to avoid drift.

## Related

- [YiVad engineering CLAUDE.md](./claude.md) — canonical source for full changelog entries under `## Recent Changes`
- [YiVad engineering README](./readme.md) — project overview, architecture, data flow, and domain language
- [YiVad architecture](../architecture.md) — tech stack, layer boundaries, and degradation strategy
- [YiVad development standards](../dev-standards.md) — coding conventions, ProTable, SSE, and RPC field contract
- [YiVad functional modules](../functional-modules.md) — 20 view domains, 18 API modules, 11 stores inventory
