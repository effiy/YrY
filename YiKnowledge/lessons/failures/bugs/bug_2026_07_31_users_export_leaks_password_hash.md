---
title: YiAi users_export endpoint leaked bcrypt password hashes in the CSV —
  query_documents doesn't auto-exclude password for the users collection, so the export
  column list contained the hash column and any admin downloading the file got a
  brute-forceable copy of every user's hash
key: bug_2026_07_31_users_export_leaks_password_hash
tags:
- backend
- yiai
- security
- users
- export
- bcrypt
- regression
category: lessons/failures/bugs
created: '2026-07-31'
updated: '2026-07-31'
source: internal
type: bug
status: resolved
severity: critical
priority: p0
project: YiAi
module: server/routes/users.py:export_users
iteration: 2026-S1
defectUrl: ''
assignee: claude
reporter: claude
environment: dev (YiAi FastAPI + Motor + bcrypt)
affectedVersion: 1.0.0
fixedVersion: 1.0.0
frequency: always
contentPath: lessons/failures/bugs/bug_2026_07_31_users_export_leaks_password_hash.md
resolvedAt: 1759399200000
closedAt: null
---

## Description
`YiAi/src/server/routes/users.py:export_users` exported all users in the `users` collection to CSV via `query_documents(params)`. The `params` dict never set `excludeFields`, and `data/repository.py:query_documents` only auto-excludes `pageContent` for the `sessions` collection — for `users`, it returns every field including the bcrypt `password` hash.

So the exported CSV had a `password` column populated with bcrypt hashes like `$2b$12$...`. Anyone with access to the admin UI's export button could download the entire user table with hashes intact. bcrypt is slow by design, but offline brute-force against a leaked hash is still feasible for weak passwords (`123456`, `password`) — and the seed users in `users.json` use exactly that class of password.

The sibling `tree_users` route projects `password` out at the Mongo layer (`db.db[_COLLECTION].find(filters, {"_id": 0, "password": 0})`), confirming that the rest of the codebase treats the hash as sensitive. The export path was the one place that didn't, and the leak was silent — no log, no warning, just a `password` column in the downloaded CSV.

Two compounding issues sat in the same function:

1. **The hash leak** — `query_documents` returns `password` for the users collection because no projection excludes it, and `export_users` didn't opt out via `excludeFields`.

2. **CSV DictWriter schema mismatch** — `csv.DictWriter(output, fieldnames=rows[0].keys())` uses the first row's keys as the header. Mongo is schema-less, so if any later row has a field that `rows[0]` lacks, `writerows` raises `ValueError: dict contains fields not in fieldnames 'x'`. The export would crash mid-stream on a heterogeneous user table.

## Steps to Reproduce
1. Start YiAi on port 10086. Create a few users via `POST /users` (each stores `bcrypt(plaintext)` in the `password` field).
2. From the admin UI, trigger the user export — `POST /users/export` with `{"pageNum":1, "pageSize":100000}`.
3. The endpoint returns a CSV attachment. Open it.
4. The CSV has a `password` column. Every row carries the bcrypt hash for that user.
5. Take the hash offline and run `hashcat -m 3200 hashes.txt wordlist.txt` — weak passwords crack in minutes on a GPU.

## Expected Result
The export never includes the `password` field. Either `query_documents` is called with `excludeFields="password"` (and the row is defensively re-stripped in case the exclusion is ignored), or the route projects `password: 0` at the Mongo layer (matching `tree_users`).

## Actual Result
The export CSV carried the bcrypt hash for every user. An attacker with admin access (or an XSS that calls the endpoint) could download and crack the hashes offline. Bcrypt's work factor slows the crack, but the seed users use `123456`-class passwords — those crack even against bcrypt in a few minutes per user.

## Cause
`export_users` was written as a thin wrapper that piped `query_documents` into a CSV writer. The author focused on the data flow (query → CSV → download) and didn't consider *which fields* the query returns. The Mongo projection is set up in `tree_users` (which projects `password:0` explicitly) but `export_users` went through the generic `query_documents` helper, which has no collection-specific knowledge that `password` is sensitive.

Compounding factor: `data/repository.py:query_documents` has a special-case projection for the `sessions` collection (excludes `pageContent`), which set the precedent that *sensitive fields per collection* are handled in the repository layer. The users' `password` should have had the same treatment, but didn't — and the export route didn't compensate.

The CSV DictWriter schema mismatch was a latent bug under the same code path. It wasn't the *cause* of the leak, but it meant the export would crash on a heterogeneous table before anyone noticed the hash column. The fix addresses both.

## Solution
Set `excludeFields: "password"` on the `params` dict, then defensively strip `password` from each row before writing (in case `excludeFields` is ignored or the column is renamed later). Also fix the DictWriter to accept the union of all row keys, with `extrasaction="ignore"` so heterogeneous rows don't crash the writer:

```diff
 @router.post("/export", operation_id="users_export")
 async def export_users(body: UserQuery):
     """Export all matching users as CSV."""
     params: dict[str, Any] = {
         "collection_name": _COLLECTION,
         "pageNum": 1,
         "pageSize": 100000,
+        # Exclude the bcrypt password hash from the export — the column
+        # would otherwise leak the hash to anyone downloading the CSV,
+        # enabling offline brute-force. tree_users projects password:0
+        # at the Mongo layer; the export path goes through query_documents
+        # and must opt out via excludeFields.
+        "excludeFields": "password",
     }
     if body.username:
         params["filter"] = {"username": body.username}
     result = await query_documents(params)
     rows = result.get("list", [])

+    # Defensive: strip any password field that slipped through (e.g. if
+    # query_documents ignored excludeFields or the column was renamed).
+    for r in rows:
+        r.pop("password", None)
+
     output = io.StringIO()
     if rows:
-        writer = csv.DictWriter(output, fieldnames=rows[0].keys())
+        # DictWriter requires every row's keys ⊆ fieldnames. Mongo is
+        # schema-less, so collect the union of all row keys first.
+        all_keys: list[str] = []
+        seen = set()
+        for r in rows:
+            for k in r.keys():
+                if k not in seen:
+                    seen.add(k)
+                    all_keys.append(k)
+        writer = csv.DictWriter(output, fieldnames=all_keys, extrasaction="ignore")
         writer.writeheader()
         writer.writerows(rows)
```

Process follow-up: every "export this collection" endpoint is a security-sensitive surface because it bypasses the normal read path (which usually has per-field projections in the business-logic layer) and dumps raw Mongo documents through a generic serializer. When adding an export route, list the sensitive fields that must never leave the server (passwords, tokens, secrets, PII) and either (a) project them out at the Mongo layer, or (b) pass `excludeFields` to the generic query helper, or (c) defensively strip them from each row before serialization. All three is better — defense in depth. Treat `password` as radioactive in any collection that stores auth credentials, regardless of whether the hash is bcrypt (which only slows the crack, doesn't prevent it). And when writing CSV from schema-less data, never use `rows[0].keys()` as the schema — collect the union and pass `extrasaction="ignore"`, otherwise the export crashes the first time a row has an extra field.
