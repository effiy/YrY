---
title: _build_filter silently dropped $or/$regex/$ne dict values — bug list search
  returned all docs instead of filtered set
key: bug_2026_07_30_build_filter_drops_dict_values
tags:
- backend
- mongodb
- query
- filter
- silent-failure
- regression
category: lessons/failures/bugs
created: '2026-07-30'
updated: '2026-07-30'
source: internal
type: bug
status: resolved
severity: critical
priority: p0
project: YiAi
module: data/repository
iteration: 2026-S1
defectUrl: ''
assignee: claude
reporter: claude
environment: dev (localhost:10086, FastAPI + Motor)
affectedVersion: 1.0.0
fixedVersion: 1.0.0
frequency: always
---

## Description
`YiAi/src/data/repository.py:_build_filter` is the single funnel through which every `data_service.query_documents` filter is translated into a MongoDB query dict. It dispatches each `(key, value)` pair through a chain of handlers — `_handle_iso_date_filter` → `_handle_range_or_list_filter` → `_handle_string_search_filter` — with a final `isinstance(value, (int, float, bool))` fallback. None of these branches handle a **dict value**: `_handle_string_search_filter` returns False for non-str values, `_handle_range_or_list_filter` explicitly excludes dicts (`not isinstance(value, (str, bytes, dict))`), and the int/float/bool fallback skips dicts. The result: any field whose value is a Mongo operator dict (`{"$regex": "...", "$options": "i"}`, `{"$ne": "..."}`, `{"$gte": ..., "$lte": ...}`) was **silently dropped** from the filter.

Worse, for **list values at top-level logical-operator keys** like `$or`/`$and`/`$nor`, `_handle_range_or_list_filter` did enter (list is iterable and not str/bytes/dict) and converted the condition list into `{"$in": [...]}`. So `{"$or": [{title: {$regex: "login"}}, {module: {$regex: "login"}}]}` was rewritten as `{"$or": {"$in": [...]}}` — which MongoDB rejects with `$or must be an array` (BadValue code 2). Any caller sending an `$or` search got a 5001 error back; any caller sending a dict-valued field filter got the unfiltered full collection back.

The concrete impact on YiVad: `src/api/modules/bug.ts:getBugList` builds `filter.$or = [{title: {$regex: search}}, {module: {$regex: search}}]` for title/module search. Searching the bug list by title or module either 5001'd or returned every bug — never the filtered set. The user could not search the bug list.

## Steps to Reproduce
1. `POST http://localhost:10086/ body: {"module_name":"services.database.data_service","method_name":"query_documents","parameters":{"cname":"bugs","filter":{"$or":[{"title":{"$regex":"login","$options":"i"}},{"module":{"$regex":"login","$options":"i"}}]},"pageNum":1,"pageSize":5}}`
2. Response: `{"code":5001,"message":"Execution failed: $or must be an array ..."}`
3. Alternatively, send `{"filter":{"status":{"$ne":"resolved"}}}` — returns ALL bugs (the `$ne` dict is dropped, filter becomes empty).
4. Alternatively, send `{"filter":{"title":{"$regex":"login"}}}` — returns ALL bugs (the `$regex` dict is dropped).

## Expected Result
- `$or` with a list of condition dicts is passed through unchanged → MongoDB applies the OR.
- Field-level operator dicts (`$regex`, `$ne`, `$gte`, `$lte`, `$in`, `$exists`, …) are passed through unchanged → MongoDB applies the operator.
- Search filters built by `YiVad/src/api/modules/bug.ts` work: `bug.ts` builds `$or: [{title:{$regex:...}}, {module:{$regex:...}}]`, sends it via `queryDocuments({filter})`, and gets back the filtered set.

## Actual Result
- `$or` was rewritten to `{"$or": {"$in": [...]}}` → 5001 error.
- Dict-valued field filters were silently dropped → full collection returned.

## Cause
`_build_filter` was written before callers started sending raw Mongo operator dicts through the RPC envelope. The handler chain assumed every value was either a string (fuzzy search), a list of scalars (range/`$in`), an ISO date, or a primitive scalar. When YiVad's bug module started sending `{$regex: ..., $options: "i"}` and `{$or: [...]}` — which is valid Mongo syntax and the natural way to build OR queries — none of the branches handled it. The dispatch silently fell through.

Two compounding design choices made it worse:
1. The handler chain returns True/False to signal "I handled it" — but a False return just falls to the next handler, with no warning that a dict value was seen and skipped. Silent drop.
2. `_handle_range_or_list_filter` doesn't inspect the **key** at all — it only inspects the value. So a list value at key `$or` is treated identically to a list value at key `tags` and converted to `{$in: [...]}`. The key semantic (logical operator vs. field-name-with-`$in`) is lost.

## Solution
Added a pass-through branch at the top of the loop in `_build_filter`:

```python
if key.startswith('$') or isinstance(value, dict):
    filter_dict[key] = value
    continue
```

Any key starting with `$` (Mongo logical operators: `$or`, `$and`, `$nor`, `$not`) and any field with a dict value (field-level operators: `$regex`, `$ne`, `$gte`, `$lte`, `$in`, `$exists`, …) is now passed through untouched. The existing handler chain continues to handle string fuzzy-search, list-of-scalars range/`$in`, ISO dates, and primitive scalars as before.

Verified:
- `{"$or":[{"title":{"$regex":"login","$options":"i"}},{"module":{"$regex":"login","$options":"i"}}]}` → 1 result (LoginForm bug).
- `{"status":{"$ne":"resolved"}}` → 0 results (all 21 bugs are resolved).
- `{"status":"resolved"}` → 21 results (string equality still works).
- `{"title":{"$regex":"login"}}` → 1 result (field-level dict operator works).

Process follow-up: a query-filter dispatcher that silently drops unknown value shapes is a footgun. When the contract is "callers may send Mongo operators as dict values", the dispatcher must either (a) pass dict values through, or (b) raise on unsupported shapes. Silently dropping is the worst option — it returns "success" with wrong data. Always prefer loud failure over quiet corruption.
