---
title: create_document silently overwrote the caller-supplied key with a UUID,
  so bug.key (UUID) never matched the contentPath filename (bug_<ts>_<rand>.md)
key: bug_2026_07_30_create_document_overwrites_caller_key
tags:
- backend
- data-layer
- mongodb
- rpc
- regression
category: lessons/failures/bugs
created: '2026-07-30'
updated: '2026-07-30'
source: internal
type: bug
status: resolved
severity: major
priority: p1
project: YiAi
module: data/repository.py:create_document
iteration: 2026-S1
defectUrl: ''
assignee: claude
reporter: claude
environment: dev (YiAi backend on localhost:10086, MongoDB via Motor)
affectedVersion: 1.0.0
fixedVersion: 1.0.0
frequency: always
contentPath: lessons/failures/bugs/bug_2026_07_30_create_document_overwrites_caller_key.md
resolvedAt: 1759200000000
closedAt: null
---

## Description
`data/repository.py:create_document` unconditionally overwrote the caller-supplied `key` with a fresh `str(uuid.uuid4())` before insert. The YiVad bug module's `createBug` (and `bug.ts`'s `writeBugContent`) flow expects the `key` it passes (`bug_<timestamp>_<rand>`) to be the document's primary key, and writes the markdown body to `lessons/failures/bugs/<that_key>.md`. After the overwrite:

- `bug.key` in MongoDB = `<UUID>` (the auto-generated one)
- `bug.contentPath` in MongoDB = `lessons/failures/bugs/bug_<timestamp>_<rand>.md` (the caller-supplied path)

So `bug.detail.vue` displays `{{ bug.key }}` as a UUID instead of the readable `bug_<ts>_<rand>`. The URL becomes `/bug/detail/<UUID>` instead of `/bug/detail/bug_<ts>_<rand>`. Worse, the key no longer matches the content file name, so any future code that resolves the markdown path from the key (rather than from `contentPath`) would 404.

The bug existed since the original `create_document` was written; the YiVad bug module is the first caller that passes a meaningful `key`, so the symptom only surfaced once the bug page was wired up.

## Steps to Reproduce
1. `POST / {"module_name":"services.database.data_service","method_name":"create_document","parameters":{"cname":"bugs","data":{"key":"bug_test_caller_key_123","title":"Test","contentPath":"lessons/failures/bugs/bug_test_caller_key_123.md", ...}}}`
2. Response: `{"key":"<UUID>"}` — the caller's key was discarded.
3. `query_documents({"filter":{"key":"bug_test_caller_key_123"}})` → 0 results.
4. `query_documents({"filter":{"key":"<UUID>"}})` → the doc, but `contentPath` still points to `bug_test_caller_key_123.md`.
5. Visit `/bug/detail/<UUID>` in YiVad — the hero banner shows the UUID, not the readable key.

## Expected Result
When the caller provides `data.key`, `create_document` honors it as the primary key and only falls back to `str(uuid.uuid4())` when `key` is absent or empty.

## Actual Result
`create_document` always overwrote `key` with a fresh UUID, silently discarding the caller-supplied value. `contentPath` (a separate field) was preserved, so the document was internally inconsistent — `key` and `contentPath` referenced different naming schemes.

## Cause
The original `create_document` was written when all callers relied on the backend to mint keys, so it unconditionally assigned `str(uuid.uuid4())`. When YiVad's `bug.ts` started passing its own readable key (so the markdown filename and the Mongo key would match), the overwrite wasn't adjusted. I assumed from the response shape `{"key": "<uuid>"}` that `create_document` was echoing the caller's key back — it was actually returning the freshly-minted one.

## Solution
Changed `data/repository.py:create_document` to honor a caller-supplied key:

```python
if not data_copy.get('key'):
    data_copy['key'] = str(uuid.uuid4())
data_copy.setdefault('createdTime', current_time)
data_copy['updatedTime'] = current_time
```

Verified by creating a bug with `key: "bug_test_caller_key_456"` — response now returns `{"key":"bug_test_caller_key_456"}`, and `query_documents({"filter":{"key":"bug_test_caller_key_456"}})` finds the doc with that exact key. Cleaned up the test doc afterwards.

Process follow-up: when a backend function unconditionally assigns a field (key, timestamp, status), check whether callers ever supply that field themselves before deciding to overwrite. The pattern `data.update({'key': str(uuid.uuid4()), ...})` reads as "ensure key is set" but actually means "clobber caller's key" — `setdefault`/`if not data.get(...)` expresses the intent more honestly. Also: response envelopes that return the freshly-minted value should make clear whether they're echoing or generating — here `{"key": "<uuid>"}` looked like an echo but was a generation.
