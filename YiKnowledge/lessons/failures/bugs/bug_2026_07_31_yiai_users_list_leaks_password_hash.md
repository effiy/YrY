---
title: YiAi /users/list endpoint leaked bcrypt password hashes — the export_users
  fix in a2d8196 missed the list_users route, and query_documents had no per-collection
  default to exclude password for the users collection
key: bug_2026_07_31_yiai_users_list_leaks_password_hash
tags:
- yiai
- security
- password
- bcrypt
- users
- list
- regression
- repository
category: lessons/failures/bugs
created: '2026-07-31'
updated: '2026-07-31'
source: internal
type: bug
status: resolved
severity: critical
priority: p0
project: YiAi
module: src/server/routes/users.py:list_users
iteration: 2026-S2
assignee: claude
reporter: claude
environment: dev (YiAi FastAPI + Motor + bcrypt, auth disabled by default)
affectedVersion: 1.0.0
fixedVersion: 1.0.0
frequency: always
---

## Description
`YiAi`'s `/users/list` endpoint (`src/server/routes/users.py:list_users`) called `query_documents(params)` without setting `excludeFields: "password"`. The repository layer's `query_documents` only auto-excludes `pageContent` for the `sessions` collection — no equivalent special-case existed for `password` on the `users` collection. As a result, every paginated user-list response included the full bcrypt `password` hash column for every user returned.

This is the same class of leak documented in `bug_2026_07_31_users_export_leaks_password_hash.md` (which fixed `export_users` in commit `a2d8196`) — but `list_users` was missed when that fix landed. The `tree_users` route already projected `password:0` at the Mongo layer directly (`db.db[_COLLECTION].find(filters, {"_id": 0, "password": 0})`), and `export_users` strips it both via `excludeFields` and a defensive `r.pop("password", None)` — but `list_users` had neither guard.

Auth is optional in dev (`src/domain/auth/` disabled by default), so the leak is reachable without any credentials at all in the default dev deployment.

## Steps to Reproduce
1. Start YiAi locally (`python main.py` or `uvicorn src.app:app`).
2. `curl -X POST http://localhost:10086/users/list -H 'Content-Type: application/json' -d '{"pageNum": 1, "pageSize": 10}'`.
3. Inspect the response — every user object in `data.list` contains a `password` field holding the bcrypt hash string.

## Expected Result
The `/users/list` response should never include the `password` field. Bcrypt hashes are brute-forceable offline; even though bcrypt is slow, the column should be treated as radioactive and excluded at the Mongo projection layer.

## Actual Result
Every row in `data.list` contained `"password": "$2b$..."` — the full bcrypt hash. Any caller of `/users/list` (which, in dev, is anyone — no auth required) could harvest every user's hash.

## Cause
The bug_2026_07_31_users_export_leaks_password_hash fix added `excludeFields: "password"` to `export_users` only. The same pattern should have been applied to `list_users` (and ideally to `query_documents` itself as a per-collection default). The repository layer's `query_documents` already had a per-collection special-case for `sessions` → exclude `pageContent` (lines 250, 253-254 of `repository.py`); the precedent for sensitive-field projection at the repository layer was right there, but `users` → `password` was never added.

Defense-in-depth was missing: the route didn't opt out, and the repository didn't have a per-collection default. Either layer catching it would have prevented the leak; neither did.

## Solution
Two-layer fix:

**Route-layer fix** (`src/server/routes/users.py:list_users`) — mirror the `export_users` fix by adding `excludeFields: "password"` to the params dict:

```diff
 @router.post("/list", operation_id="users_list")
 async def list_users(body: UserQuery):
     """Paginated user query."""
     params: dict[str, Any] = {
         "collection_name": _COLLECTION,
         "pageNum": body.pageNum,
         "pageSize": body.pageSize,
+        # Exclude the bcrypt password hash from list responses — the
+        # column would otherwise leak the hash to every user-list call
+        # (anyone with a token, since auth is optional in dev), enabling
+        # offline brute-force. tree_users already projects password:0;
+        # export_users was fixed in a2d8196 but list_users was missed.
+        "excludeFields": "password",
     }
```

**Repository-layer fix** (`src/data/repository.py:query_documents` + `get_document_detail`) — add a per-collection default that excludes `password` for the `users` collection, mirroring the existing `sessions` → `pageContent` pattern. Three branches updated (fields_param, exclude_fields_param, default):

```diff
     if fields_param:
         fields = [f.strip() for f in str(fields_param).split(',') if f.strip()]
         if 'key' not in fields:
             fields.append('key')
         if collection_name == 'sessions':
             fields = [f for f in fields if f != 'pageContent']
+        if collection_name == 'users':
+            fields = [f for f in fields if f != 'password']
         projection = {'_id': 0, **{f: 1 for f in fields}}
     elif exclude_fields_param:
         exclude_fields = [f.strip() for f in str(exclude_fields_param).split(',') if f.strip()]
         if 'key' in exclude_fields:
             exclude_fields.remove('key')
         if collection_name == 'sessions' and 'pageContent' not in exclude_fields:
             exclude_fields.append('pageContent')
+        if collection_name == 'users' and 'password' not in exclude_fields:
+            exclude_fields.append('password')
         projection = {'_id': 0, **{f: 0 for f in exclude_fields}}
     elif collection_name == 'sessions':
         projection = {'_id': 0, 'pageContent': 0}
+    elif collection_name == 'users':
+        projection = {'_id': 0, 'password': 0}
```

And `get_document_detail`:

```diff
     projection = {'_id': 0}
     if collection_name == 'sessions':
         projection['pageContent'] = 0
+    if collection_name == 'users':
+        projection['password'] = 0
     document = await collection.find_one({'key': doc_id}, projection)
```

Process follow-up: the per-collection projection table in `query_documents` is the right place for sensitive-field defaults. Treat any collection storing auth credentials (`password`, `secret`, `token`, `refreshToken`, `apiKey`) the same way — add a per-collection default that strips the field at the Mongo layer. Route-layer `excludeFields` is a useful belt; repository-layer default is the suspenders. When fixing a sensitive-field leak, grep every endpoint that reads the collection — `export_users` was fixed but `list_users` / `tree_users` / `get_user_detail` should all be checked in the same pass. The bug doc for the export leak even called out that `tree_users` had the right pattern; that hint should have triggered an audit of every `users` route, not just the export.
