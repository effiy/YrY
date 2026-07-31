---
title: updateBug payload omitted key, but backend update_document requires data.key
key: bug_2026_07_30_updatebug_missing_key_in_payload
tags:
- rpc
- api-contract
- update-document
category: lessons/failures/bugs
created: '2026-07-30'
updated: '2026-07-30'
source: internal
type: bug
status: resolved
severity: critical
priority: p0
project: YiVad
module: api/modules/bug
iteration: ''
defectUrl: ''
assignee: claude
reporter: claude
environment: dev (localhost:8848/10086)
affectedVersion: 1.0.0
fixedVersion: 1.0.0
frequency: always
---

## Description
src/api/modules/bug.ts::updateBug built the update payload as {...meta, updatedAt: now} and called updateDocument(CNAME, key, payload). The frontend dataService spreads that into { cname, key, data: payload } for the RPC. But the backend data/repository.py::update_document reads the query key from data.get('key') (line 375), NOT from the top-level params.key. Because payloadFromDrawer destructures key out of the drawer row (so meta has no key), the data dict sent to the backend had no `key` field. Every Edit-via-drawer on the /bug page would return HTTP 500 'Update data must contain key field'. The story.ts/system.ts/user.ts modules sidestep this by spreading key into the data dict explicitly; bug.ts did not.

## Steps to Reproduce
1. Open /bug/list in YiVad.
2. Click Edit on any bug row, modify a field, save.
3. Frontend calls updateBug(key, meta, content) → updateDocument('bugs', key, payload) where payload has no key.
4. Backend update_document raises ValueError('Update data must contain key field') → HTTP 500.
5. Drawer shows 'Save failed' toast; row never updates.

## Expected Result
Edit-via-drawer persists the update and the list re-fetches with the new values.

## Actual Result
HTTP 500 'Update data must contain key field' on every Edit save; drawer reports save failure.

## Cause
`payloadFromDrawer` destructured `key` out of the drawer row before constructing `meta`, so `meta` never contained `key`. `updateBug` then built the payload as `{ ...meta, updatedAt: now }` — no `key` field. The backend `data/repository.py::update_document` reads the query key from `data.get('key')` (not from the top-level `params.key`), so when `data` lacks `key` it raises `ValueError('Update data must contain key field')`. Other modules (`story.ts`, `system.ts`, `user.ts`) sidestep this by spreading `key` into the data dict explicitly; `bug.ts` didn't, because the `payloadFromDrawer` destructuring pattern hid the gap.

## Solution
Explicitly inject `key` into the payload in `updateBug`: `payload = { ...meta, key, updatedAt: now }`. The backend now sees `data.key` and the filter matches. Added a code comment on `updateBug` documenting that `update_document` reads the key from `data.key`, so future edits must preserve `key` in the payload.
