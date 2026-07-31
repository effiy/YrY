---
title: YiVad menuMange/index.vue el-tree-select used label:"title" but menu data has
  meta.title (nested) — parent picker showed empty labels for every menu, users couldn't
  tell which menu was which when picking a parent
key: bug_2026_07_31_menu_manage_parent_tree_select_wrong_label
tags:
- frontend
- yivad
- menu-manage
- element-plus
- tree-select
- regression
category: lessons/failures/bugs
created: '2026-07-31'
updated: '2026-07-31'
source: internal
type: bug
status: resolved
severity: minor
priority: p2
project: YiVad
module: views/system/menuMange/index.vue:el-tree-select
iteration: 2026-S1
defectUrl: ''
assignee: claude
reporter: claude
environment: dev (YiVad Vue 3.5 + Rsbuild 1, Element Plus 2.14)
affectedVersion: 1.0.0
fixedVersion: 1.0.0
frequency: always
contentPath: lessons/failures/bugs/bug_2026_07_31_menu_manage_parent_tree_select_wrong_label.md
resolvedAt: 1759406400000
closedAt: null
---

## Description
`YiVad/src/views/system/menuMange/index.vue` renders an `el-tree-select` for picking a menu's parent:

```vue
<el-tree-select
  v-model="form.parent"
  :data="parentOptions"
  node-key="path"
  :props="{ label: 'title', children: 'children' }"
  placeholder="None (top-level)"
  ...
/>
```

But menus don't have a top-level `title` field — the title lives at `meta.title`:

```json
{
  "path": "/home/index",
  "name": "home",
  "component": "/home/index",
  "meta": { "icon": "HomeFilled", "title": "Home", ... },
  "parent": null,
  "order": 0
}
```

So `props.label = "title"` tells Element Plus to look for `data.title` — which is `undefined` for every menu. The tree-select dropdown renders each node with no visible label: an empty string or `undefined`. Users opening the parent-picker see a tree of blank entries; they can expand/collapse by guessing at the indentation but can't tell which menu is which.

The sibling pages `departmentManage/index.vue` and `roleManage/index.vue` use `label: "name"` because their data has a top-level `name` field — that works. But menus put their human-readable label under `meta`, so the same prop shape doesn't work.

## Steps to Reproduce
1. Start YiAi (port 10086) and YiVad (port 8848). Seed MongoDB with `menus.json`.
2. Open `/system/menuMange` and click "Add Menu".
3. The Parent `el-tree-select` opens with a tree of menu nodes.
4. Every node's label is empty (or `undefined`) — there's no visible text, just indentation.
5. Try to pick a parent — you can click on a node, but you have no idea which menu it is.

## Expected Result
Each node's label shows its `meta.title` (or, as a fallback, its `name` for menus where `meta.title` is missing). Users see "Home", "Data Screen", "Ai Chat", etc. in the parent picker.

## Actual Result
Labels were `undefined` — the tree-select showed empty/blank rows. Users couldn't visually distinguish one menu from another when picking a parent.

## Cause
The author copy-pasted the `el-tree-select` shape from the sibling `departmentManage`/`roleManage` pages (where `label: "name"` works because `name` is top-level), then swapped the prop value to `"title"` thinking menus have a top-level `title`. They never verified by reading the menu data shape (which puts `title` under `meta`). Element Plus's `props.label` accepts a string OR a function — when given a string, it does a direct field lookup (`data[label]`), with no dot-path support. So `"meta.title"` as a string would not have worked either; the only fix is a function.

## Solution
Use a function for `props.label` that walks the nested path with a fallback:

```diff
 <el-tree-select
   v-model="form.parent"
   :data="parentOptions"
   node-key="path"
-  :props="{ label: 'title', children: 'children' }"
+  :props="{ label: (data: any) => data?.meta?.title || data?.name || '', children: 'children' }"
   placeholder="None (top-level)"
   clearable
   check-strictly
   style="width: 100%"
 />
```

The `|| data?.name || ''` fallback handles edge cases where a menu is missing `meta` entirely (e.g. a freshly-created menu before its `meta` block is filled) — at least the route name shows up rather than an empty string.

Process follow-up: Element Plus's `el-tree-select` / `el-tree` `props.label` accepts a string field name or a function `(data, node) => string`, but **not** a dot-path. When the label lives in a nested object (`meta.title`, `user.name`, `record.meta.label`), the prop *must* be a function — there's no string shorthand. The sibling-page pattern `label: "name"` works only when the label is top-level. When copying the tree-select shape across pages, check the data shape for *this* resource: if the label field is nested, swap the string for a function; if it's top-level, the string works. A quick check: `grep` for the data's shape in the seed file (e.g. `menus.json` shows `"meta": { "title": ... }`) before copying the prop shape.
