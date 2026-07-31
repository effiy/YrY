---
title: YiVad dictManage page + system.ts dict API targeted a non-existent "dicts"
  MongoDB collection with a dictName discriminator, and used field names
  (userLabel/userValue/genderLabel/genderValue) that don't exist in the seed
  data — the page could neither list, create, edit, nor delete dict items
key: bug_2026_07_31_dict_manage_wrong_collection_and_field_names
tags:
- frontend
- yivad
- dict-manage
- data-mismatch
- regression
category: lessons/failures/bugs
created: '2026-07-31'
updated: '2026-07-31'
source: internal
type: bug
status: resolved
severity: critical
priority: p0
project: YiVad
module: views/system/dictManage/index.vue + api/modules/system.ts
iteration: 2026-S1
defectUrl: ''
assignee: claude
reporter: claude
environment: dev (YiVad Vue 3.5 + Rsbuild 1, Element Plus 2.14; YiAi data_service RPC on port 10086; seeds: status_dict.json, gender_dict.json)
affectedVersion: 1.0.0
fixedVersion: 1.0.0
frequency: always
contentPath: lessons/failures/bugs/bug_2026_07_31_dict_manage_wrong_collection_and_field_names.md
resolvedAt: 1759407600000
closedAt: null
---

## Description
`YiVad/src/views/system/dictManage/index.vue` renders a ProTable of dictionary items and supports Add/Edit/Delete. The page switches between `status_dict` and `gender_dict` tabs via `el-tabs`. The `YiVad/src/api/modules/system.ts` module exposes four dict functions:

```ts
export async function getDictItems(name: string) {
  const res = await queryDocuments({ cname: "dicts", filter: { dictName: name }, ... });
  return res.data?.list ?? [];
}
export function createDictItem(name: string, params: Record<string, any>) {
  return createDocument("dicts", { ...params, dictName: name, ... });
}
export function updateDictItem(name: string, key: string, params: Record<string, any>) {
  return updateDocument("dicts", key, { ...params, dictName: name, ... });
}
export function deleteDictItem(name: string, key: string) {
  return deleteDocument("dicts", key);
}
```

All four target a single MongoDB collection called `dicts` and use a `dictName` field as the discriminator. **No such collection exists.** The actual backend data model — visible in `YiAi/src/server/routes/system.py:list_dicts` — uses `status_dict` and `gender_dict` as **two separate MongoDB collections**:

```python
@router.get("/dicts", operation_id="system_dicts_list")
async def list_dicts():
    dict_collections = ["status_dict", "gender_dict"]
    result: dict[str, list] = {}
    for cname in dict_collections:
        docs = await db.db[cname].find({}, {"_id": 0}).to_list(length=None)
        result[cname] = docs
    return success(data=result)
```

And the seed files confirm it — `YiAi/src/data/seeds/status_dict.json` seeds the `status_dict` collection with `{key, label, value, tag_type}` shape:

```json
[
  { "key": "status_dict_1", "label": "Active", "value": "1", "tag_type": "success" },
  { "key": "status_dict_2", "label": "Pending Training", "value": "2", "tag_type": "warning" },
  ...
]
```

`gender_dict.json` seeds the `gender_dict` collection with the same shape. The `dicts` collection is never seeded; it doesn't exist.

On top of the wrong-collection bug, the `dictManage` page itself used invented field names:

```ts
const fieldMap: Record<string, { label: string; value: string }> = {
  status_dict: { label: "userLabel", value: "userValue" },
  gender_dict: { label: "genderLabel", value: "genderValue" }
};
```

Neither `userLabel`/`userValue` (for status) nor `genderLabel`/`genderValue` (for gender) appears anywhere in the seed data or the backend `DictItem` schema (`YiAi/src/server/routes/system.py`):

```python
class DictItem(BaseModel):
    label: str
    value: str
    tag_type: str = ""
```

The actual fields are plain `label` / `value` / `tag_type`. The frontend's `fieldMap` was a fiction — even if the `dicts` collection existed and the `dictName` filter worked, the page would still show empty rows because `row.userLabel` is `undefined` for every doc.

So the `dictManage` page had **two compounding bugs**:
1. Wrong collection name (`dicts` instead of `status_dict`/`gender_dict`) — every `getDictItems` call returned an empty list because the collection doesn't exist; every `createDictItem` call inserted into a phantom collection invisible to the backend's `list_dicts`; every `updateDictItem`/`deleteDictItem` failed with `DATA_NOT_FOUND`.
2. Wrong field names (`userLabel`/`userValue`/`genderLabel`/`genderValue` instead of `label`/`value`) — even if the collection were correct, columns would be empty and the Add/Edit form would persist docs with `userLabel: "..."` while the seed data uses `label: "..."`. A user-added item would look different from a seeded item, and neither would render in the table.

## Steps to Reproduce
1. Start YiAi (port 10086) and seed MongoDB with `status_dict.json` and `gender_dict.json`.
2. Open `/system/dictManage`. The table shows **no rows** despite the seed data having 5 status entries and 3 gender entries.
3. Click "Add Item", fill in label and value, confirm. A success toast appears, but the table still shows no rows — the new item was inserted into the `dicts` collection (which the backend's `list_dicts` doesn't read), so it's invisible.
4. Switch to Gender tab — same empty table.
5. Try to edit/delete a seeded item: impossible — the table is empty, so there's nothing to click. If you knew the key, calling `updateDictItem(name, key, ...)` would hit `updateDocument("dicts", key, ...)` and return `DATA_NOT_FOUND` (no doc with that key in the phantom `dicts` collection).

## Expected Result
The `dictManage` page lists seeded dict items, allows adding new ones, and supports edit/delete — operations land on the correct MongoDB collection (`status_dict` or `gender_dict`) using the real field names (`label`/`value`/`tag_type`).

## Actual Result
The page was non-functional: empty table, no items to edit or delete. New items were silently misrouted into a `dicts` collection that the backend never reads. The whole dictionary management UX was dead code.

## Cause
The frontend author invented a data model (`dicts` collection + `dictName` discriminator + per-dict field names) that doesn't match the backend. No cross-check against (a) the seed files (`status_dict.json`/`gender_dict.json` clearly show separate collections with `label`/`value`/`tag_type` shape), (b) the backend's `list_dicts` route (which iterates `["status_dict", "gender_dict"]` as collection names), or (c) the backend's `DictItem` Pydantic schema (which uses `label`/`value`/`tag_type`). The author likely assumed "dicts go in a `dicts` collection with a `dictName` field" — a reasonable default, but verifiably wrong in this codebase.

The `fieldMap` per-dict field names (`userLabel`/`genderLabel`/...) look like they were cargo-culted from another system where each dict type has its own field namespace. But the YiAi backend uses a unified `label`/`value`/`tag_type` shape across all dict types — there's no per-dict field name. This should have been caught by a 30-second look at the seed file.

## Solution
Two fixes that together make the page work:

```diff
// YiVad/src/api/modules/system.ts — drop the "dicts" + dictName model, use `name` as cname
 export async function getDictItems(name: string) {
   const res = await queryDocuments({
-    cname: "dicts",
-    filter: { dictName: name },
+    cname: name,
     limit: 1000,
     orderBy: "sort",
     orderType: "asc"
   });
   return res.data?.list ?? [];
 }
 export function createDictItem(name: string, params: Record<string, any>) {
-  return createDocument("dicts", { ...params, dictName: name, ... });
+  return createDocument(name, { ...params, ... });
 }
 export function updateDictItem(name: string, key: string, params: Record<string, any>) {
-  return updateDocument("dicts", key, { ...params, dictName: name, ... });
+  return updateDocument(name, key, { ...params, ... });
 }
 export function deleteDictItem(name: string, key: string) {
-  return deleteDocument("dicts", key);
+  return deleteDocument(name, key);
 }
```

```diff
// YiVad/src/views/system/dictManage/index.vue — drop fieldMap, use plain label/value/tag_type
-const fieldMap: Record<string, { label: string; value: string }> = {
-  status_dict: { label: "userLabel", value: "userValue" },
-  gender_dict: { label: "genderLabel", value: "genderValue" }
-};
-const columns = computed<ColumnProps[]>(() => [
-  { prop: fieldMap[activeDict.value]?.label || "label", label: "Label", align: "left" },
-  { prop: fieldMap[activeDict.value]?.value || "value", label: "Value", width: 120 },
-  { prop: "operation", label: "Actions", width: 200, fixed: "right" }
-]);
+const columns: ColumnProps[] = [
+  { prop: "label", label: "Label", align: "left" },
+  { prop: "value", label: "Value", width: 120 },
+  { prop: "tag_type", label: "Tag Type", width: 140 },
+  { prop: "operation", label: "Actions", width: 200, fixed: "right" }
+];
```

The form was also simplified to use `label`/`value`/`tag_type` directly (with a `SelectIcon`-style el-select for the tag_type enum: `""`, `primary`, `success`, `info`, `warning`, `danger`). Value field changed from `el-input-number` to `el-input` because the seed data uses string values like `"1"`, `"2"`, not numbers.

Process follow-up: when a frontend CRUD page targets a MongoDB collection via the YiAi data-service RPC, the `cname` MUST be the actual MongoDB collection name — never an invented discriminator collection. The seed files (`YiAi/src/data/seeds/<cname>.json`) and the backend's `list_*` route are the source of truth for (a) which collections exist and (b) each collection's document shape. A 30-second check of `head status_dict.json` would have shown `label`/`value`/`tag_type` — the invented `userLabel`/`userValue`/`genderLabel`/`genderValue` never had a chance. When the field names start with the resource type (`userLabel`, `genderLabel`), it's a smell that the author was thinking in terms of per-namespace fields — but the backend uses a single `DictItem` schema for all dict types. Match the backend schema, not an invented one.
