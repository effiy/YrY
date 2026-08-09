---
title: MongoDB query / filter contract — _build_filter field name contract + collection naming + index strategy
tags:
- mongodb
- motor
- query-contract
- filter
- target_file
- cname
- indexing
- sessions
- dual-write
category: engineer/infrastructure
created: 2026-08-05
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles:
- engineer
- backend-engineer
- ai-engineer
benefit: access MongoDB with a lookup of field name contract + collection naming + index strategy, so that callers do not silently pitfall over `query` vs `filter` / `path` vs `target_file`
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../README.md
- ../../../YiAi/src/data/repository.py
- ../../../YiAi/src/data/database.py
- ../../../YiAi/src/models/collections.py
- ../../../YiAi/config.yaml
- ../../../YiAi/CLAUDE.md
tacit: false
---

# MongoDB query / filter contract — _build_filter field name contract + collection naming + index strategy

> **As an** engineer, **I want to** a YiAi MongoDB access field name contract, collection naming, index strategy, sessions special handling record, **so that** callers use the correct field name (`filter` not `query` / `target_file` not `path` / `cname` or `collection_name`), avoiding silently pitfall.

> YiAi backend uses Motor async to access MongoDB; `data/repository.py`'s `_build_filter` is the query entry; CLAUDE.md lists the field name contract under "Self-Constraints". This document is the de-facto contract documentation; 2026-07-28 fixed two rounds of bugs (`find_many`/`delete_one` missing / `_handle_range_or_list_filter` 2-element string list silently dropping the filter).

## Summary

- **field name contract is load-bearing** — `filter` (not `query`) / `target_file` (not `path`) / `cname` or `collection_name` (`brd_<topic>` uses `cname`); if callers use the wrong name: `query` is silently ignored, `path` returns 422
- **collection naming = `<domain>_<entity>` or `brd_<topic>`** — 11 fixed collections + `brd_<topic>` dynamic per role; domain prefix avoids cross-domain name collision
- **unique index covers external identity** — `rss.link` / `static_files.target_file` / `knowledge_files.path`; `_ensure_unique_index` created in the background at startup
- **sessions is a special collection** — `repository.py` has 8 special-cases; new collections go through the general path, do not mimic sessions
- **dual-write is not strongly consistent** — after disk write succeeds, best-effort upsert to Mongo; read fallback = disk first, Mongo backup
- **`update_document` reads `data.key`, not `parameters.key`** — CLAUDE.md diverges slightly, code is authoritative (`project_update_document_key_in_data.md` memory)

## Core viewpoints

- **field name is a hard contract** — `_build_filter` parameter names (`filter` / `target_file` / `cname`) are not convention, they are hard constraints; CLAUDE.md "Self-Constraints" explicitly states "Past bugs have come from callers using the wrong name"; in 2026-07 YiPet `SessionService` used `query:` and got empty results, YiVad `fileService` used `path:` and got 422
- **`query` is silently ignored** — `query` is not in `_build_filter`'s known field list, so it is skipped by `_build_filter`; callers get an empty list and wrongly assume data is missing, while in reality the filter did not take effect; Bug-logging protocol lists this as one of 5 recurring bug types
- **`_handle_range_or_list_filter` 2-element string list fixed** — before 2026-07-28 `tags: ["work", "personal"]` returned ALL docs (because 2 string items were not treated as date/number, function returned True without setting filter_dict); fixed to fall through to `{'$in': value_list}`
- **sessions is a legacy-laden collection** — 8 special-cases: query default project fields / sort rules / `file_path` as query key / `pageContent` default exclude / update uses `key` rather than `_id` / `_handle_range_or_list_filter` checks sessions field first; new collections should not reuse the sessions path
- **unique index = external identity field** — URL / path / filepath are "unique identifiers given by external systems" and only those get a unique index; `_id` is already unique, internal IDs do not need an extra index; created in the background at startup and does not block
- **dual-write strategy = disk primary + Mongo backup** — `domain/files/local.py` writes to disk first (failure returns immediately), then best-effort upsert to `static_files` collection; OSS unreachable degrades to single write; CLAUDE.md "File persistence" section states this explicitly

## Key information

### Field name contract (_build_filter hard contract entry)

`data_service.query_documents`'s `parameters` accepts the following field names:

| field name | type | purpose | anti-pattern (silently ignored or 422) |
|---|---|---|---|
| `filter` | `dict` | MongoDB query filter | `query` → silently ignored, returns ALL docs |
| `cname` / `collection_name` | `str` | collection name | `collection` → KeyError |
| `target_file` | `str` | filepath (for `read-file` / `write-file`) | `path` → 422 |
| `pageNum` / `pageSize` / `limit` | `int` | pagination | `page` / `size` → silently uses default |
| `fields` / `excludeFields` | `list[str]` | projection | `projection` → silently ignored |
| `orderBy` / `orderType` | `str` | sort field + direction | `sort` / `sortOrder` → silently ignored |

**`update_document` special contract** (`project_update_document_key_in_data.md` memory):
- `parameters: { cname, key, data }` — but `data_service.update_document` actually reads key from `data.key`, not from `parameters.key`
- CLAUDE.md writes `parameters: { cname, key, data }`, and code diverges slightly; code is authoritative

### Collection naming (`YiAi/src/models/collections.py` + `config.yaml`)

```python
# YiAi/src/models/collections.py
SESSIONS = "sessions"
RSS = "rss"
CHAT_RECORDS = "chat_records"
PET_DATA_SYNC = "pet_data_sync"
SEEDS = "seeds"
OSS_FILE_TAGS = "oss_file_tags"
OSS_FILE_INFO = "oss_file_info"
STATE_RECORDS = "state_records"
AI_CODING_HISTORY = "ai_coding_history"
```

`config.yaml` also defines:
- `collection.sessions: "sessions"` (same as collections.py)
- `collection.knowledge_files: "knowledge_files"`
- `collection.static_files: "static_files"`
- `collection.bugs: "bugs"` (bug page memory, in `project_bug_loop_protocol.md`)

**naming rules**:
1. `<domain>_<entity>` — `static_files` / `knowledge_files` / `chat_records` / `state_records` / `oss_file_tags`
2. single-entity collection without prefix — `sessions` / `rss` / `seeds` / `bugs`
3. BRD data has **no Mongo collection**: it was previously stored as markdown and watched into `knowledge_files` + the RAG index by the knowledge watcher. (The old `brd_<topic>` collections and their seed script were removed — the knowledge base is the source of truth.)

### Index strategy (`data/database.py` `_ensure_indexes`)

runs at startup:
```python
await self._ensure_unique_index(settings.collection_rss, 'link')
await self._ensure_unique_index(settings.collection_static_files, 'target_file')
await self._ensure_unique_index(settings.collection_knowledge_files, 'path')
```

`_ensure_unique_index` implementation:
```python
async def _ensure_unique_index(self, collection_name: str, field: str):
    collection = self.db[collection_name]
    await collection.create_index([(field, 1)], unique=True, background=True)
```

**index design principles**:
1. **external identity field gets unique index** — URL (`rss.link`) / path (`static_files.target_file` / `knowledge_files.path`)
2. **`background=True`** — does not block startup, production-friendly
3. **do not build internal ID unique index** — `_id` is already unique, do not duplicate
4. **do not build composite index unless there is a query pattern** — do not speculatively build indexes; `MongoDB` singleton wrappers only grow when callers need them (CLAUDE.md "Self-Constraints")

### sessions special handling (`repository.py` 8 places)

| line (reference) | special behavior | reason |
|---|---|---|
| L242 | query default project-specific fields | legacy frontend expects flat shape |
| L252 | `pageContent` default exclude | field too large, list view does not need it |
| L257 | sort rules special | legacy frontend expects |
| L301 | update uses `key` rather than `_id` | frontend does not pass `_id`, passes `key` |
| L340-348 | `data.key` takes priority over `parameters.key` (update_document) | slightly inconsistent with documentation, code is authoritative |
| L390-391 | `file_path` can be used as query key | legacy aicr path positioning |
| L412 | during create sessions special field | history field |
| L458 | during delete sessions special field | history field |

**new collections should not reuse the sessions path**: go through the general `query_documents` / `create_document` / `update_document` / `delete_document`, do not add new special-cases to `repository.py`.

### dual-write persistence (`domain/files/local.py` + `static_files` collection)

```python
# domain/files/local.py simplified pseudocode
async def write_file(target_file: str, content: str):
    # 1. disk primary
    try:
        path.write_text(content)
    except Exception as e:
        return failure  # disk failure returns failure immediately

    # 2. Mongo backup (best-effort)
    try:
        await mongo_db[STATIC_FILES].update_one(
            {"target_file": target_file},
            {"$set": {"target_file": target_file, "content": content, "updated_at": now}},
            upsert=True
        )
    except Exception:
        pass  # best-effort, does not block return

    return success
```

**degradation behavior** (CLAUDE.md "Degradation Countermeasures"):
- MongoDB unreachable → writes fail fast; reads return empty results (no cache layer)
- OSS bucket unreachable → file storage falls back to local disk only (dual-write degrades to single write)

### `_handle_range_or_list_filter` fix (2026-07-28)

```python
# before fix (L234 before):
def _handle_range_or_list_filter(key, value, filter_dict):
    if isinstance(value, list) and len(value) == 2:
        start, end = value
        if _is_date(start) or _is_date(end):
            filter_dict[key] = {"$gte": start, "$lte": end}
            return True
        if _is_number(start) or _is_number(end):
            filter_dict[key] = {"$gte": start, "$lte": end}
            return True
        return True  # BUG: when 2 strings are neither date/number, returns True without setting filter_dict
# after fix:
        # fall through to $in
    if isinstance(value, list):
        filter_dict[key] = {"$in": value}
```

**Lesson**: `tags: ["work", "personal"]` previously returned ALL docs (filter_dict did not set `tags.$in`), making callers wrongly assume "no filter is also correct". After fix it falls through to `$in`.

### `find_many` / `delete_one` missing fix (2026-07-28)

`domain/files/storage.py`'s `delete_oss_file` / `delete_file_tags` / `get_all_tags` call `MongoDB.find_many` / `MongoDB.delete_one`, but the singleton does not define them → `AttributeError` at runtime. fix: add `find_many` and `delete_one` wrappers.

**Lesson**: MongoDB singleton wrappers only grow when callers need them (CLAUDE.md "Self-Constraints"); when a new pattern appears in callers, the singleton needs to sync-add a wrapper, do not let callers bypass the singleton and directly use `self.db[cname]`.

## Anti-patterns

- **do not use `query` field name** — silently ignored, returns ALL docs; CLAUDE.md "Self-Constraints" states explicitly
- **do not use `path` field name** — 422; `target_file` is the contract
- **do not use `collection` field name** — KeyError; use `cname` or `collection_name`
- **do not let new collections reuse sessions special path** — sessions is legacy-laden; new collections go through general `repository.py`
- **do not add new special-cases in `repository.py` for new collections** — let collections go through the general path; special-cases only decrease, never increase
- **do not speculatively build indexes** — `MongoDB` singleton wrappers only grow when callers need them; build only when there is a query pattern
- **do not falsely assume dual-write is strongly consistent** — disk primary, Mongo backup best-effort; read fallback = disk first
- **do not let callers directly use `self.db[cname]` bypassing the singleton** — when new patterns appear, add a wrapper, do not let callers bypass
- **do not falsely assume `_handle_range_or_list_filter` 2-element lists are all ranges** — string lists should fall through to `$in`, not silently drop the filter

## Action recommendations

When launching a new collection:

1. add `CONST_NAME = "<cname>"` to `models/collections.py`
2. add an alias to the `collection:` section of `config.yaml`
3. add a unique index in `data/database.py` `_ensure_indexes` (if an external identity field exists)
4. let callers call through the general API in `services/database/data_service.py`, **do not** add special-cases in `repository.py`
5. write frontmatter schema to `YiKnowledge/knowledge-curator/templates/` or this directory's patterns
6. run a self-check once: call with `query` field name → should return ALL docs (if not silently ignored, `_build_filter` was fixed); call with `filter` field name → should return only matching docs

When onboarding callers to MongoDB:

1. run grep to confirm field names: `grep -E "query:|path:|collection:" src/` — should be 0 hits
2. run grep to confirm collection names: compare `models/collections.py` and `config.yaml`
3. run type-check to confirm `data_service` call parameter names are correct
4. run manual smoke: call with wrong field name (`query:` / `path:`), confirm behavior (silently ignored / 422); call with correct field name to confirm normal

When upgrading existing collections:

1. run grep for `collection_name == 'sessions'` in `repository.py` for all hits, confirm whether special-case needs to be kept
2. run grep for `await self.db\[` in `domain/` and `services/`, confirm all Mongo access goes through the singleton
3. run `db.<cname>.getIndexes()` in mongo shell, confirm unique index exists
4. write schema migration script to `YiAi/scripts/`


- **Using `query` as the filter field name** — `query` is not in `_build_filter`'s known field list, so it is silently skipped and the query returns all documents with no error. Callers see an empty or full result set and wrongly assume the filter is working, when in reality the filter never took effect.
- **Using `path` instead of `target_file` for file operations** — the `/read-file` and `/write-file` endpoints strictly expect `target_file`, and passing `path` triggers a hard 422 validation error. The field name contract is load-bearing and this mistake has caused production bugs in both YiVad and YiPet.
- **Adding new special-cases to `repository.py` for new collections** — the sessions collection has 8 legacy special-cases, but new collections must go through the general `query_documents`/`create_document`/`update_document`/`delete_document` path. Adding new special-cases makes the repository layer progressively harder to reason about.
- **Letting callers bypass the MongoDB singleton and use `self.db[cname]` directly** — when a new query pattern emerges (e.g., `find_many`, `delete_one`), adding a wrapper to the singleton keeps all MongoDB access centralized. Direct access by callers creates invisible coupling and makes it impossible to audit or change the data layer.
- **Speculatively building indexes without a query pattern** — indexes consume disk space and slow down writes, and building them without a confirmed query pattern wastes both. The MongoDB singleton only grows when callers demonstrate a real need; indexes follow the same rule.

- [engineer/README.md](../README.md) — Engineer working directory
- [YiAi/src/data/repository.py](../../../YiAi/src/data/repository.py) — de-facto source of `_build_filter` / sessions special-case
- [YiAi/src/data/database.py](../../../YiAi/src/data/database.py) — de-facto source of MongoDB singleton / `_ensure_unique_index`
- [YiAi/src/models/collections.py](../../../YiAi/src/models/collections.py) — collection name constants
- [YiAi/config.yaml](../../../YiAi/config.yaml) — `collection:` section aliases
- [YiAi/CLAUDE.md](../../../YiAi/CLAUDE.md) — YiAi backend contract (`_build_filter` / dual-write / module boundaries / Self-Constraints)
- **update_document key-in-data memory** (Claude memory: `project_update_document_key_in_data.md`) — record of `data.key` priority over `parameters.key`
- **Bug-logging protocol memory** (Claude memory: `project_bug_loop_protocol.md`) — `query` vs `filter` listed as one of 5 recurring bug types
- [knowledge-curator/templates/knowledge-leaf.md](../../knowledge-curator/templates/knowledge-leaf.md) — leaf template

## Related

- [Bug-logging protocol](../quality-security/bug-logging-protocol.md) — recurring bug pattern: filter vs query field name trap
- [SSE onDone guard gotcha](../lessons/gotcha-sse-ondone-guard.md) — same cross-project contract enforcement pattern
- [Supply chain hardening](../process/harden-supply-chain.md) — process-level hardening with the same load-bearing contract lesson
- [YiAi architecture](../projects/yiai/architecture.md) — YiAi backend architecture with data layer details
- [YiAi dev standards](../projects/yiai/dev-standards.md) — YiAi dev standards with RPC field name contract
