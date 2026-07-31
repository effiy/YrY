---
title: YiVad accountManage/index.vue toggleStatus/resetPass/handleDelete passed
  row.id to the user API, but addUser stored id="" for users created via this
  page's Add button — the three row operations silently failed on newly-created
  users (empty-string key can't match a Mongo doc)
key: bug_2026_07_31_account_manage_row_id_empty_for_new_users
tags:
- frontend
- yivad
- account-manage
- user-crud
- regression
category: lessons/failures/bugs
created: '2026-07-31'
updated: '2026-07-31'
source: internal
type: bug
status: resolved
severity: major
priority: p1
project: YiVad
module: views/system/accountManage/index.vue + api/modules/user.ts
iteration: 2026-S1
defectUrl: ''
assignee: claude
reporter: claude
environment: dev (YiVad Vue 3.5 + Rsbuild 1, Element Plus 2.14; YiAi data_service RPC on port 10086)
affectedVersion: 1.0.0
fixedVersion: 1.0.0
frequency: always
contentPath: lessons/failures/bugs/bug_2026_07_31_account_manage_row_id_empty_for_new_users.md
resolvedAt: 1759407000000
closedAt: null
---

## Description
`YiVad/src/views/system/accountManage/index.vue` renders a ProTable of users. Each row has Edit / Reset / Delete buttons:

```vue
<el-button type="primary" link :icon="EditPen" @click="openDialog(scope.row)">Edit</el-button>
<el-button type="primary" link :icon="Refresh" @click="resetPass(scope.row)">Reset</el-button>
<el-button type="primary" link :icon="Delete" @click="handleDelete(scope.row)">Delete</el-button>
```

And a status `el-switch` that calls `toggleStatus`. All three row-level handlers pass `row.id` as the identifier:

```ts
const toggleStatus = async (row: any) => {
  await useHandleData(changeUserStatus, { id: row.id, status: row.status === 1 ? 0 : 1 }, ...);
};
const resetPass = async (row: any) => {
  await useHandleData(resetUserPassWord, { id: row.id }, ...);
};
const handleDelete = async (row: any) => {
  await useHandleData(deleteUser, { id: [row.id] }, ...);
};
```

But `YiVad/src/api/modules/user.ts` `addUser` — invoked by this same page's "Add Account" button — was:

```ts
export async function addUser(params: Record<string, any>): Promise<YiAiEnvelope> {
  const doc: UserDocument = {
    key: params.key || newKey(),
    id: params.id || params.key || "",   // ← empty string when caller passes neither
    ...
  };
}
```

The `accountManage` "Add Account" form never sends `id` or `key`:

```ts
await addUser({
  username: form.username,
  password: form.password,
  email: form.email,
  gender: form.gender,
  status: form.status
});
```

So `params.id` is `undefined`, `params.key` is `undefined`, and `doc.id = ""`. The stored user has `id: ""`. (The seed data `users.json` sets `id` equal to `key` for every seeded user — so seeded users like `user_seed_001` have `id: "user_seed_001"` and the three operations work on them. Only users created via this page are affected.)

When the user then clicks Reset / Delete / Toggle status on a *newly-created* account, the API call sends `id: ""` → `updateDocument("users", "")` → `{"key": ""}` lookup in `repository.update_document` → no match → `BusinessException(DATA_NOT_FOUND)`. The user sees a "not found" error for an account that's literally in front of them.

The sibling `editUser` API falls back from `id` to `key` (`const key = params.key || params.id`), and `accountManage`'s edit flow sets `form.key = row.key` — so the *Edit* button works. But the three row operations don't have that fallback, and they pass `row.id` (empty), not `row.key`.

## Steps to Reproduce
1. Start YiAi (port 10086) and YiVad (port 8848). Seed MongoDB with `users.json`.
2. Open `/system/accountManage` and click "Add Account". Fill in username/password/email and confirm. The new account appears in the table.
3. Click the new account's "Reset" button. The YiAi backend returns `DATA_NOT_FOUND` because `id: ""` matches no document.
4. Click the new account's status switch. Same `DATA_NOT_FOUND` error.
5. Click the new account's "Delete" button. Same error — the account cannot be deleted.
6. Edit still works (uses `form.key = row.key` + `editUser`'s fallback). So you can edit your way out, but you can't reset password, toggle status, or delete the account.
7. Seeded accounts (which have `id` populated) work fine for all three operations.

## Expected Result
The three row operations (`toggleStatus`, `resetPass`, `handleDelete`) should work on every account in the table, whether seeded or created via "Add Account". The identifier used should be one that's always set — `row.key` is set for every user (`addUser` always generates `key` via `newKey()` even when caller passes nothing).

## Actual Result
`row.id` was passed to the three operations. `addUser` set `id: ""` when the caller supplied neither `id` nor `key`, so newly-created users had `id: ""`. The three operations sent empty string as the lookup key to `updateDocument` / `deleteDocument`, which returned `DATA_NOT_FOUND`. The user-facing symptom: "Reset password / Toggle status / Delete account" failed on every account created via the Add button, with a misleading "not found" error.

## Cause
Two compounding issues:

1. **`addUser` stored an inconsistent `id`**. The `users` collection's data model has both `id` and `key` (unusual — most YiAi collections use only `key`). Seed data keeps them equal. But `addUser` only generated `key`, leaving `id: ""` when the caller didn't pass one. No invariant kept them in sync.

2. **The three row operations used `row.id` instead of `row.key`**. The page's edit flow correctly sets `form.key = row.key` (line 110) and passes `form.key` to `editUser` — so the edit button was fine. But the three row-button handlers copy-pasted the `id: row.id` shape from a sibling page (departmentManage / roleManage — whose data model legitimately has only `id` and no `key`). That pattern doesn't translate to the `users` collection where `id` can be empty.

The author of `accountManage` likely copied the row-button shape from `departmentManage` (which works because departments have `id` always set) without checking that `users.id` is guaranteed populated. The users seed file shows `id = key` for every row, so a quick check during copy-paste would have suggested using `row.key` (always set) rather than `row.id` (sometimes empty).

## Solution
Three changes that together close the hole:

```diff
// YiVad/src/api/modules/user.ts — make addUser keep id consistent with key
 export async function addUser(params: Record<string, any>): Promise<YiAiEnvelope> {
   const now = Date.now();
+  const key = params.key || newKey();
   const doc: UserDocument = {
-    key: params.key || newKey(),
-    id: params.id || params.key || "",
+    key,
+    id: params.id || key,
     username: params.username ?? "",
     ...
   };
 }
```

```diff
// YiVad/src/api/modules/user.ts — defensive fallback to key in all row operations
-export async function changeUserStatus(params: { id: string; status: number }) {
-  return updateDocument(CNAME, String(params.id), ...);
-}
-export async function resetUserPassWord(params: { id: string }) {
-  return updateDocument(CNAME, String(params.id), ...);
-}
-export async function deleteUser(params: { id: string[] }) {
-  const target = params.id?.[0];
-  return deleteDocument(CNAME, String(target));
-}
+export async function changeUserStatus(params: { id: string; status: number }) {
+  const key = params.id || (params as any).key;
+  if (!key) throw new Error("changeUserStatus: missing id");
+  return updateDocument(CNAME, String(key), ...);
+}
+export async function resetUserPassWord(params: { id: string }) {
+  const key = params.id || (params as any).key;
+  if (!key) throw new Error("resetUserPassWord: missing id");
+  return updateDocument(CNAME, String(key), ...);
+}
+export async function deleteUser(params: { id: string[] }) {
+  const target = params.id?.[0] || (params as any).key;
+  if (!target) throw new Error("deleteUser: missing id");
+  return deleteDocument(CNAME, String(target));
+}
```

```diff
// YiVad/src/views/system/accountManage/index.vue — use row.key (always set)
-  await useHandleData(changeUserStatus, { id: row.id, ... });
-  await useHandleData(resetUserPassWord, { id: row.id }, ...);
-  await useHandleData(deleteUser, { id: [row.id] }, ...);
+  await useHandleData(changeUserStatus, { id: row.key, ... });
+  await useHandleData(resetUserPassWord, { id: row.key }, ...);
+  await useHandleData(deleteUser, { id: [row.key] }, ...);
```

The first change prevents future empty-id users. The second change is defensive — if a caller passes `key` instead of `id`, the API still works (mirrors `editUser`'s fallback pattern). The third change ensures existing empty-id users (created before the fix) remain operable.

Process follow-up: when a collection has both `id` and `key` fields (unusual — most YiAi collections use only `key`), pick one as the canonical identifier and use it everywhere. The seed file is the source of truth — if `users.json` sets `id = key` for every row, treat them as intentionally equal and don't write code paths that let them diverge. When copy-pasting row-button handlers from a sibling page (departmentManage → accountManage), check whether the data model's identifier field is *guaranteed populated* — if not, use the field that is (`key`, which `addUser` always generates via `newKey()`).
