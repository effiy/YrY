---
title: YiAi list_departments / list_roles called _build_tree with parent_field=None,
  which short-circuits the tree-building and returns every doc as a flat root — the
  frontend's el-tree-select showed all nodes at the same level, ignoring parent
  hierarchy despite the seed data defining one
key: bug_2026_07_31_system_build_tree_parent_field_none
tags:
- backend
- yiai
- system
- departments
- roles
- tree
- regression
category: lessons/failures/bugs
created: '2026-07-31'
updated: '2026-07-31'
source: internal
type: bug
status: resolved
severity: major
priority: p1
project: YiAi
module: server/routes/system.py:list_departments + list_roles + _build_tree
iteration: 2026-S1
defectUrl: ''
assignee: claude
reporter: claude
environment: dev (YiAi FastAPI + Motor + MongoDB; seed data in src/data/seeds/)
affectedVersion: 1.0.0
fixedVersion: 1.0.0
frequency: always
contentPath: lessons/failures/bugs/bug_2026_07_31_system_build_tree_parent_field_none.md
resolvedAt: 1759402800000
closedAt: null
---

## Description
`YiAi/src/server/routes/system.py:list_departments` and `list_roles` both call `_build_tree(docs, parent_field=None)`. The `_build_tree` helper at the top of the same file is:

```python
def _build_tree(docs, parent_field="parent", id_field="id"):
    by_id = {d[id_field]: d for d in docs}
    roots = []
    for d in docs:
        parent = d.get(parent_field)
        if parent and parent in by_id:
            by_id[parent].setdefault("children", []).append(d)
        elif not parent:
            roots.append(d)
    return roots
```

When `parent_field=None`, `d.get(None)` returns `None` for every doc (no doc has a `None` key). The `if parent and parent in by_id` branch is False, so the `elif not parent` branch fires — every doc is appended to `roots`, and no doc is ever nested under a parent's `children`. The function returns a flat list while pretending to build a tree.

Both `departments.json` and `roles.json` seed data define a parent hierarchy:
- `departments.json`: `1-1` has `parent: "1"`, `1-1-1` has `parent: "1-1"`, etc. (21 nodes, 4 levels deep)
- `roles.json`: `1-1` has `parent: "1"`, etc. (17 nodes, 2 levels deep)

So the backend has clear hierarchical data and a tree-build helper, but the helper is invoked with `parent_field=None`, which disables the nesting. The frontend (`YiVad/src/views/system/departmentManage/index.vue` and `roleManage/index.vue`) renders an `el-tree-select` that walks `children` — with no `children` in the response, every department/role appears as a top-level option in the tree-select, regardless of its actual parent in the seed data.

The sibling `list_menus` route (same file) passes `parent_field="parent"` and `id_field="path"` — the correct invocation. So the bug is local to `list_departments` and `list_roles`. The author of these two routes likely passed `parent_field=None` thinking "no parent nesting needed here" without reading the helper, or copy-pasted a stub call and forgot to swap in the real field name.

## Steps to Reproduce
1. Start YiAi on port 10086. Seed MongoDB with `departments.json` (seeds have `1`, `1-1`, `1-1-1`, etc. with `parent` referencing the parent's `id`).
2. Hit `GET /system/departments`.
3. The response is a flat list: `[{id:"1", name:"R&D Center", parent:null, order:1}, {id:"1-1", name:"Frontend Group", parent:"1", order:1}, ...]` — none of the docs has a `children` field.
4. In YiVad, open `/system/departmentManage` and click "Add Department". The Parent `el-tree-select` shows every department as a top-level option, so `Frontend Group (1-1)` appears alongside `R&D Center (1)` — both at the same indentation. Picking a parent is meaningless because the hierarchy is flattened.
5. Repeat for roles at `/system/roleManage`.

## Expected Result
`_build_tree(docs, parent_field="parent", id_field="id")` builds a proper tree: top-level departments (`parent: null`) are in `roots`, children are nested under their parent's `children` field. The `el-tree-select` walks `children` and shows the indentation.

## Actual Result
`parent_field=None` disabled the tree-building entirely. Every department and role came back as a flat root with no `children`. The frontend's tree-select treated the flat list as "all roots", losing the parent/child structure that the seed data defines.

## Cause
Two contributing factors:

1. **Misuse of a helper** — the helper's signature defaults `parent_field="parent"`, but the two routes explicitly override to `None`, which is a *sentinel* value the helper treats as "no parent field". The author probably intended "disable nesting entirely for this resource" (in which case the correct call is to skip `_build_tree` and just return the flat `docs`), but they didn't read the helper and assumed `parent_field=None` meant "no parent nesting — return flat". The helper did return flat, but for a *different* reason than the author thought: it short-circuited because `d.get(None)` is always `None`, not because the helper had a "parent_field=None ⇒ return flat" branch.

2. **No test caught the gap** — the tree structure is invisible to a quick `curl`, because the response is still a JSON list of docs. A reviewer would need to compare against the seed data's parent links to spot that `children` is missing. There's no integration test that asserts "1-1 appears under 1's children".

## Solution
Pass the real parent field name to `_build_tree`:

```diff
 @router.get("/departments", operation_id="system_departments_list")
 async def list_departments():
     docs = await _list_collection("departments")
-    tree = _build_tree(docs, parent_field=None)
+    tree = _build_tree(docs, parent_field="parent", id_field="id")
     return success(data=tree)
```

```diff
 @router.get("/roles", operation_id="system_roles_list")
 async def list_roles():
     docs = await _list_collection("roles")
-    tree = _build_tree(docs, parent_field=None)
+    tree = _build_tree(docs, parent_field="parent", id_field="id")
     return success(data=tree)
```

After the fix, the response contains `children` arrays nesting child docs under their parents, matching the seed data hierarchy. The frontend's `el-tree-select` walks the `children` and shows the indentation.

Process follow-up: when a helper has a default parameter and a caller overrides the default, ask why. The default exists for a reason — overriding to a non-default value (especially `None`) is a smell that signals one of three things: (a) intentional special-case with a comment explaining it, (b) misunderstanding of the helper's contract, or (c) cargo-culted from another caller. If there's no comment explaining (a), treat it as (b) or (c) and verify the helper actually does what the caller thinks. In this case, `parent_field=None` looked like "return flat" but was actually "always return flat because `dict.get(None)` is `None` for every doc" — the difference between "I asked for flat" and "I broke the tree-builder" matters when the seed data and the frontend both expect a tree. Read the helper before overriding its defaults.
