---
title: Iterative self-check — aicr chat.ts 25+ rounds of self-check failure patterns and fix paths
tags:
- code-review
- self-check
- iterative
- aicr
- chat
- yivad
- race
- stale
- unawaited
category: engineer/quality-security
created: 2026-08-05
updated: 2026-08-05
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles:
- code-reviewer
- engineer
- tech-lead
benefit: during self-check, finding one issue triggers 25+ rounds of repeated scanning that surface failure patterns and fix paths; new components no longer leak the same class of traps
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../../engineer/quality-security/bug-logging-protocol.md
- ../README.md
tacit: false
---

# Iterative self-check — aicr chat.ts 25+ rounds of self-check failure patterns and fix paths

> **As a** code-reviewer, **I want to** record the 25+ rounds of self-check on aicr chat.ts that surfaced failure patterns and fix paths, **so that** during self-check we no longer leak the same class of traps, and new-component reviews have a standard checklist.

> On 2026-07-29, during the sidebar parity work, the `YiVad/src/stores/modules/aiChat.ts` (and related chat components) ran 25+ rounds of self-check; each round targeted one class of failure pattern. This file records the traps and fix paths by epoch, as a standard checklist for self-check.

## Summary

- **25+ rounds of self-check is not over-doing it — it is the necessary cost of coverage** — a one-shot scan of 5 trap classes will miss things; each round only stares at one class; 25+ rounds then covers everything
- **5 major failure-pattern classes**: race (stream switching / abort after onDone) / stale (activeSession / fileTree cache) / unawaited (batch delete / loadFileTree concurrent) / collision (timestamp / pet identity) / field name (target_file vs path / filter vs query)
- **Each round is one-shot, targeting one class** — grep + state walkthrough; do not mix; mixing lets the "edge cases" of every class slip through
- **Reviewer stance: do not fix for the author** — self-check is also a reviewer stance; fixing code loses independence, and later traps get masked by "I wrote this myself, it can't be wrong"
- **CLAUDE.md "Verify reality" is the master principle of self-check** — at the end of every round run `pnpm type:check && pnpm build:dev`; assertion over confidence

## Core viewpoints

- **The value of self-check lies in "edge cases"** — the main path is mostly fine; edge cases (in-flight stream during batch delete / empty message persisted on session switch / user content wiped on rename) are the review must-scan zone
- **25+ rounds is not redundancy, it is coverage** — Round 1 finds timestamp collision and fixes it; Round 18 finds a variant of timestamp collision (sendMessage double Date.now() same millisecond) and fixes it; the same class of trap has different variants in different functions; many rounds are needed to cover them
- **Reviewer does not modify code** — in self-check, author = reviewer; but keep the reviewer stance: discover traps and raise issues, but do not read-and-fix; fixing code loses independence, and later reads get masked by "I fixed this myself, it can't be wrong"
- **Every round must end with an assertion** — `pnpm type:check` + `pnpm build:dev`; not running them means substituting confidence for assertion, which CLAUDE.md explicitly calls the fastest way to be wrong
- **Failure patterns can be grouped into 5 major classes** — race / stale / unawaited / collision / field name; when self-checking a new component, scan by these 5 classes, at least one round per class

## Key information

### Failure patterns from 25+ rounds of self-check (grouped by epoch)

#### Race class (stream switching / abort after onDone)

- **Round 2 — cross-session stream-corruption** — `streamPetReply` uses positional `petIdx = msgs.length - 1` to locate the in-flight pet; `selectSession` does not abort before swapping `activeSession.value`, and the chunk callback writes into the new session. Fix: timestamp identity + `selectSession` aborts first
- **Round 4 — aiChat.ts selectConversation stream leak** — sister bug of Round 2, `aiChat.ts` `selectConversation(key)` does not abort before swapping. Fix: same as Round 2
- **Round 5 — YiPet controller.ts session-switch stream leak** — same class on the YiPet side; `selectSession` / `createSession` do not abort. Fix: add `stopSending()` guard
- **Round 10 — YiPet SSE AbortError identity lost** — `stream()` catch wraps `AbortError` into a plain `Error`, losing `name: 'AbortError'`, and the controller misjudges it as a real error. Fix: when catch detects `name === 'AbortError'`, re-throw without yielding
- **Round 21 — onDone autoForward locates wrong pet** — `[...messages].reverse().find(m => m.type === "pet")` finds another old pet, and autoForward already deletes the pet's isolated content. Fix: use `petTimestamp` (closure capture) to locate the in-flight pet
- **Round 22 — onDone skipped upsertSession when AI replied empty** — `if (activeSession.value && streamed)` gates both persist and autoForward; an empty reply gives `streamed=""` → persist skipped → user message lost. Fix: split persist and autoForward apart; persist always runs

#### Stale class (activeSession / fileTree cache)

- **Round 8 — SessionEditDialog stale activeSession** — `save()` calls `updateSession` without syncing `chatStore.activeSession`; the welcome card shows the old title/url. Fix: patch then reassign `chatStore.activeSession = {...activeSession, ...patch}`
- **Round 11 — FileTreeCards description staleness** — sister of Round 8; `saveDescription` does not sync. Fix: same as Round 8
- **Round 13 — TagManager bulk-update activeSession staleness** — `confirmRename` / `removeTag` call `updateSession` on every session but do not sync active. Fix: check if active.tags contains the old name, then patch
- **Round 17 — toggleFavorite stale in file tree views** — `toggleFavorite` only calls `updateSession` (refresh list), but `fileTreeStore.flatFiles` caches the session doc during `loadFileTree`; FileTreeNode / FileTreeCards read `flatFiles`. Fix: `toggleFavorite` calls `fileTreeStore.loadFileTree()` afterwards

#### Unawaited class (batch / concurrent)

- **Round 20 — FileTree.vue batchDelete unawaited** — `batchDelete` fires unawaited parallel `deleteNode` in a `for` loop, and does not clear `selectedKeys`. Fix: `async` + `await Promise.all(keys.map(...))` + `toggleBatchMode()`

#### Collision class (timestamp / pet identity)

- **Round 18 — aicr sendMessage timestamp collision** — `Date.now()` twice on the same tick; user and pet timestamps collide to the same millisecond; `findIndex(m => m.timestamp === petTimestamp)` matches the user. Fix: capture `const now = Date.now()` once; user uses `now`, pet uses `now + 1`
- **Round 19 — abortSend robustness** — `msgs[msgs.length - 1]` locates the in-flight pet; if the user moves / deletes a message during streaming it goes wrong. Fix: capture `streamingTargetTimestamp` + `findIndex(m => m.timestamp === targetTs)`

#### Field-name class (target_file vs path / filter vs query)

- **Round 24 — story.ts / user.ts `search` parameter silently ignored** — `getStoryList` passes `search` / `tags` to `queryDocuments`, but `QueryDocumentsParams` docs say the backend only honors `filter`; `search` / `tags` are silently ignored. Fix: push `search` into `filter` using `$or` + `$regex`, and `tags` into `filter.tags.$in`

#### Data loss / spurious session class

- **Round 14 — fileTree.renameNode session data loss** — `renameNode` uses `sessionFieldsFromPath(nextPath)` to rebuild the session, only keeping `messages` + `isFavorite`; `url` is regenerated as a random ID, `pageDescription` is reset, and `pageContent` / `pageTitle` / `createdAt` are lost. Fix: `pathDerivedFields(path)` only returns `key` / `file_path` / `title` / `tags`; the rest is spread from the existing session
- **Round 16 — sessionStore.createSession wipes existing session data** — `createSession` always passes `messages ?? []` / `tags ?? []` / `createdAt ?? now`; when `upsertSession` routes to `updateSession` the defaults wipe the existing data. Fix: `createSession` first calls `getSession(data.key)`; if it exists, only patch
- **Round 23 — folder rename/delete created spurious session for the folder node** — `renameNode` (folder path) iterates `flatFiles.value.filter(f => f.key === oldKey || f.key.startsWith(oldKey + "/"))`; the folder node `session: undefined` also gets upserted → creates a spurious session. Fix: filter `f.type === "file"`

#### Stream control / guard class

- **Round 25 — aicr sendMessage had no `sending` guard** — `sendMessage` top has no `if (sending.value) return`. The FaqManager "Send First" button uses `:disabled="filtered.length === 0"` to gate `sending`; a mid-stream click starts a second stream. Fix: add `if (sending.value) return;` at the top

### Self-check standard checklist (new component must scan)

Scan by the 5 major classes, at least one round per class:

1. **Race class** — stream switching / abort after onDone / cross-session writes / cross-end stream identity whether timestamp-based
2. **Stale class** — after `updateSession` whether syncs `chatStore.activeSession` / `fileTreeStore.flatFiles` cache
3. **Unawaited class** — batch operations in `for` loop whether `await Promise.all` / `loadFileTree(true)` concurrent whether race
4. **Collision class** — `Date.now()` on the same tick whether reused / in-flight identity whether timestamp-based rather than positional
5. **Field-name class** — backend field names whether use contract names (`filter` not `query`, `target_file` not `path`)
6. **Data-loss class** — rename / create / upsert whether keeps existing fields / whether filters `type === "file"` to skip folders
7. **Stream-control guard class** — `sendMessage` top whether `if (sending.value) return` / batch delete whether `await` + clear `selectedKeys`

## Anti-patterns (don't)

- **Don't one-shot scan 5 classes of traps** — mixing lets the "edge cases" of every class slip through; each round targets one class
- **Don't read-and-fix during self-check** — fixing loses independence; raise issues into a checklist, fix in another round
- **Don't skip assertions** — `pnpm type:check` + `pnpm build:dev` + manual regression, none can be missing; CLAUDE.md "Verify reality" is the master principle
- **Don't assume the main path is fine and let it go** — the main path is mostly fine; edge cases (race / stale / collision) are the review must-scan zone
- **Don't treat 25 rounds as redundancy** — the same class of trap has different variants in different functions; coverage requires the cost
- **Don't use timestamp as positional identity** — `msgs.length - 1` locates the wrong one during streaming when moving / deleting / switching; use a timestamp closure capture

## Action recommendations

When self-checking a new component:

1. Scan by the "self-check standard checklist" 7 classes, at least one round per class; do 7+ rounds
2. Each round targets one class; grep + state walkthrough; do not mix
3. At the end of every round run `pnpm type:check` + `pnpm build:dev`; do not commit if they fail
4. When a new failure pattern is discovered → add it to the "Failure patterns from 25+ rounds of self-check" section above under the right class
5. Reviewer stance: raise issues, do not fix for the author; fix in another round

When escalating an existing component:

1. Run grep for `msgs.length - 1` / `Date.now()` / `findIndex(m => m.timestamp` etc. to locate patterns; confirm timestamp identity rather than positional
2. Run grep for `updateSession(` call sites; confirm every call site syncs `chatStore.activeSession` and related caches
3. Run grep for `for.*await` / `Promise.all` / `loadFileTree(true)`; confirm batch operations are awaited + cache refreshed
4. Run grep for `Date.now()` called multiple times in the same function; confirm a single capture is reused
5. Run grep for `filter:` / `target_file:` etc. field names; confirm contract names are used

## Related

- [code-reviewer/README.md](../README.md) — Code Reviewer workspace directory
- `YiVad/src/stores/modules/aiChat.ts` — factual source of 25+ rounds of self-check
- **sidebar_parity memory** (Claude memory: `project_sidebar_parity.md`) — complete record of the self-check epoch (38 Round/self-check citations)
- [bug-logging-protocol](./bug-logging-protocol.md) — `/loop` recurring bug pattern checklist (input to self-check)
- [knowledge-curator/templates/knowledge-leaf.md](../../knowledge-curator/templates/knowledge-leaf.md) — leaf template
