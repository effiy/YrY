---
title: Bug-logging protocol — YiVad /code-review/bugs page RPC shape + recurring patterns
tags:
- qa
- bug
- rpc
- protocol
- yivad
- yiai
- loop
category: engineer/quality-security
created: 2026-08-05
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: monthly
last_verified: 2026-08-07
roles:
- qa-engineer
- engineer
- oncall-sre
benefit: When /loop auto-hunts or a human logs a bug, the RPC shape and recurring patterns are in one place — no re-derivation each time
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../../../YiVad/src/api/modules/bug.ts
- ../README.md
tacit: false
---

# Bug-logging protocol — YiVad `/code-review/bugs` page RPC shape + recurring patterns

> **As a** qa-engineer, **I want to** a `/code-review/bugs` page backend RPC shape and a list of recurring bug patterns, **so that** `/loop` auto-hunting or manual logging doesn't re-derive field names, and recurring patterns are covered on every regression pass.

> The YiVad `/code-review/bugs` page (`http://localhost:8848/#/code-review/bugs`) is the project-level bug list. Backend YiAi (`:10086`) stores metadata in MongoDB `bugs` collection, body markdown at `~/YiKnowledge/lessons/failures/bugs/<key>.md`. `/loop` runs a scan-fix-log loop every 10 minutes.

## Summary

- **Dual storage**: metadata → MongoDB `bugs` (cheap queries); body → markdown files (scannable by knowledge base, hand-editable)
- **6-section fixed body**: Description / Steps to Reproduce / Expected / Actual / Cause / Solution; `buildMarkdownBody` strictly outputs in this order
- **Two-step bug write**: `write_entry_markdown` (write markdown body + frontmatter) → `create_document` (write metadata to `bugs` collection); both RPCs go through the `POST /` envelope
- **`update_document` reads key from `data.key`** — not `parameters.key` (CLAUDE.md is slightly inaccurate)
- **5 recurring bug pattern categories**: BASE_API double-slash / SSE-abort-then-onDone race / field-name traps (`target_file` vs `path`, `filter` vs `query`) / legacy `VITE_` env remnants / stale computed bindings

## Core viewpoints

- **Dual storage reuses the RSS pattern** — metadata in DB helps queries, pagination, filtering; body markdown in YiKnowledge helps knowledge-base scanning, AI recall, manual editing. Better than DB-only or file-only
- **Placeholder stripping is essential** — Empty sections use placeholders like `_No description provided._` to preserve markdown structure; they must be stripped on parse-back, otherwise they backfill form inputs as if they were real content, polluting data
- **Section splitting uses line scanning, not `m`-flag** — The regex `^##\s+(.+?)\s*$` paired with `$` under `m`-flag matches each line end and truncates multi-line descriptions; a line-based state machine (current header + buf[]) is stable
- **The value of `/loop` hunting lies in recurring patterns** — A single discovery/fix has limited value; each scan covering the 5 recurring pattern categories surfaces cross-platform races / field-name traps / env remnants ahead of time, multiplying the value
- **`update_document`'s key location is a trap** — CLAUDE.md says `parameters: { cname, key, data }`, but `data_service.update_document` actually reads key from `data.key`, not `parameters.key`

## Key information

### RPC envelope (all YiVad ↔ YiAi calls)

```
POST http://localhost:10086/
body: {
  "module_name": "services.<domain>.<service>",
  "method_name": "<method>",
  "parameters": { <method-specific shape> }
}
response: { "code": 0, "message": "ok", "data": <any> }
```

### Two-step RPC for writing a bug

**Step 1 — write markdown body + frontmatter**

```
module_name: "services.knowledge.knowledge_service"
method_name: "write_entry_markdown"
parameters: {
  rel_path: "lessons/failures/bugs/<key>.md",
  content: "<6-section body>",
  meta: { <frontmatter fields> }
}
```

The body `buildMarkdownBody(content)` strictly outputs in 6 sections:

```markdown
## Description
<description or _No description provided._>

## Steps to Reproduce
1. <step 1>
2. <step 2>
_No steps recorded._ (when empty)

## Expected Result
<expected or _Not specified._>

## Actual Result
<actual or _Not specified._>

## Cause
<cause or _Root cause not yet recorded._>

## Solution
<solution or _Solution not yet recorded._>
```

**Step 2 — write metadata to `bugs` collection**

```
module_name: "services.database.data_service"
method_name: "create_document"
parameters: { cname: "bugs", data: { ...BugDocument } }
```

`BugDocument` key fields (see `YiVad/src/api/modules/bug.ts`):
- Identity: `key` / `title` / `project` / `module`
- Sync: `iteration?` / `defectUrl?` (carried over from agile-platform sync)
- Classification: `severity` (critical/major/minor/trivial) / `priority` (p0-p3) / `status` (open/in_progress/resolved/closed/rejected/reopened) / `type` (functional/performance/ui/security/compatibility/regression/data/other) / `frequency` (always/sometimes/rarely/once/unable)
- Link: `contentPath` points to `lessons/failures/bugs/<key>.md`
- Audit: `createdAt` / `updatedAt` / `reporter` / `assignee`

### `update_document` field trap

CLAUDE.md says: `update_document` parameters are `{ cname, key, data }`. **Actual**: server reads key from `data.key`, not `parameters.key`. So call:

```ts
updateDocument({
  cname: "bugs",
  data: { key: "<bug-key>", ...patchFields }  // key must be inside data
})
```

Not `updateDocument({ cname: "bugs", key: "<bug-key>", data: {...} })`.

### Recurring bug patterns (must check on every `/loop` regression)

1. **BASE_API double-slash URL** — `RSBUILD_ENV_API_URL` ending with `/` plus module path starting with `/` joins to `//`; some proxies/gateways 404. Check: when `BASE_API.endsWith("/") && path.startsWith("/")`, strip one
2. **SSE-abort-then-onDone race** — `streamPetReply` / `streamChat`'s `onDone` still fires after `AbortController.abort()`; without a `!aborted && !error` guard, partial content auto-forwards to WeCom or persists empty messages. Fixed (`aicr/chat.ts`, `aiChat.ts`); on regression, verify guards are still in place
3. **Field-name traps** — `data_service.query_documents` uses **`filter`** (not `query`, which is silently ignored); `/read-file` / `/write-file` use **`target_file`** (not `path`, returns 422); `/delete-file` vs `/delete-folder` use `target_file` vs `target_dir`; rename uses `old_path`/`new_path` (file) vs `old_dir`/`new_dir` (folder). On regression grep for `path:` / `query:` and similar wrong field names
4. **Legacy `VITE_` / `VUE_APP_` env remnants** — After Rsbuild migration, env prefix became `RSBUILD_ENV_*`; Vue-CLI-era `VUE_APP_*` and Vite-era `VITE_*` should be zero in code grep
5. **Stale computed bindings** — `v-model` binding to a read-only computed (`store.panelVisible` is `computed(() => selectedStory.value !== null)`) silently fails to write; `<el-drawer v-model="store.panelVisible">` should switch to `:model-value=` one-way + `@close` toggling state

## Anti-patterns

- **Do not stuff the entire bug body into MongoDB** — A single large markdown field is poor for DB queries, hard to edit, and cannot be scanned by the knowledge base; body belongs in markdown files
- **Do not change the 6-section body structure** — `buildMarkdownBody` / `parseMarkdownBody` are duals; changing section headers or order breaks back-reading of existing bug files
- **Do not use regex `m`-flag to split sections** — `$` under `m`-flag matches each line end and truncates multi-line descriptions; use a line-based state machine
- **Do not omit placeholders** — Empty sections without placeholders break markdown structure (headers run together); placeholders must be registered in the `PLACEHOLDERS` set to be stripped during parse
- **Do not locate in-flight messages by `msgs.length - 1`** — Cross-platform stream races / switching races locate the wrong one; use timestamp identity

## Action recommendations

When manually logging or `/loop` auto-hunting finds a bug:

1. Pick a `key` (kebab-case, e.g. `2026-08-05-sse-abort-forward-leak`)
2. Write the markdown body + frontmatter via `write_entry_markdown` (`rel_path=lessons/failures/bugs/<key>.md`)
3. Write metadata via `create_document` (`cname=bugs`, `data={...BugDocument, key}`)
4. On regression, prioritize the 5 recurring pattern categories; add newly discovered patterns to the "Recurring bug patterns" section of this file
5. When a bug escalates to an incident (production failure, user impact), sync to `oncall-sre/incident-response/` and follow the hotfix path


- **Stuffing the entire bug body into MongoDB as a single text field** — a large markdown body in a DB document is expensive to query, hard to hand-edit, and invisible to the YiKnowledge file scanner. The dual-storage pattern (metadata in DB, body as markdown file) keeps queries cheap and content discoverable.
- **Changing the 6-section body structure or header order** — `buildMarkdownBody` and `parseMarkdownBody` are strict duals; renaming a section header (e.g., "Cause" to "Root Cause") or reordering the sections breaks the parse-back of every existing bug file. The structure is a contract.
- **Using regex with the `m`-flag to split markdown sections** — the `$` anchor under multiline mode matches each line end, which truncates multi-line descriptions and silently corrupts the parsed content. A line-based state machine with a current header tracker and a buffer is the correct and stable approach.
- **Omitting placeholders for empty sections** — without placeholders like `_No description provided._`, empty sections cause adjacent markdown headers to run together, breaking the structure. Placeholders must be registered in the `PLACEHOLDERS` set so they are stripped during parse-back and do not pollute form inputs.
- **Locating in-flight streaming messages by array index (`msgs.length - 1`)** — cross-platform stream races and session-switching races can cause the last element to be the wrong message. Messages must be identified by timestamp identity (`m.timestamp === petTimestamp`), not by position in the array.

- [qa-engineer/README.md](../README.md) — QA working directory
- [YiVad/src/api/modules/bug.ts](../../../YiVad/src/api/modules/bug.ts) — bug module RPC implementation, source of truth for this file
- [YiVad/src/views/code-review/bugs/](../../../YiVad/src/views/code-review/bugs/) — `/code-review/bugs` page UI (list `index.vue` + detail `detail.vue` + `BugDrawer.vue` component)
- [oncall-sre/incident-response/README.md](../README.md) — path when a bug escalates to an incident
- [knowledge-curator/templates/knowledge-leaf.md](../../knowledge-curator/templates/knowledge-leaf.md) — leaf template

## Related

- [Iterative self-check](./iterative-self-check.md) — code review self-check pattern covering bug detection
- [MongoDB query filter contract](../infrastructure/mongodb-query-filter-contract.md) — field name contract (filter vs query) as recurring bug pattern
- [SSE onDone guard gotcha](../lessons/gotcha-sse-ondone-guard.md) — SSE abort+onDone race recurring bug
- [Incident response process](../process/incident-response.md) — escalation path when a bug becomes an incident
- [No-lockfile postmortem](../../oncall-sre/incident-response/tl-postmortem-no-lockfile-supply-chain-2026-07.md) — postmortem with similar dual-storage pattern
