---
title: "Bug 列表批量选择后批量删除完全无效"
key: bug-list-batch-delete-no-effect-20260908
tags:
- bug-list
- batch-delete
- row-key
- protable
- selection
- skip-confirm
category: projects/yivad/bugs/data
created: "2026-09-08"
updated: 2026-09-10
source: internal
type: bug
status: resolved
severity: major
priority: p1
project: YiVad
module: views/bug/index.vue, stores/modules/bug.ts
reporter: Claude
environment: Chrome / macOS
affectedVersion: main (pre-fix)
fixedVersion: main (post-fix 2026-09-08)
frequency: always
---

## Summary

Bug 列表页面的「Delete Selected」批量删除按钮点击后，确认对话框弹出但实际删除操作完全无效，所有选中的 Bug 保留在列表中。问题由两个独立缺陷叠加导致：ProTable 行键配置错误使选中 ID 全部为 `undefined`，以及 `batchDelete` 向 store 传递了伪造的 `BugDocument` 对象。

## Data Flow

```
el-table 勾选行
  → @selection-change → useSelection.selectionChange(rowArr)
    → selectedListIds = computed(() => selectedList.map(item => item[rowKey]))
      → batchDelete(selectedListIds)                    ← 问题 1: rowKey="id" 但 BugDocument 无 id 字段
        → store.handleDelete({ key: id } as BugDocument) ← 问题 2: 伪造对象，title 为 undefined
          → ElMessageBox.confirm(`Delete bug "${bug.title}"?`)  ← 显示 "Delete bug 'undefined'?"
          → deleteBug(bug.key)                                   ← bug.key 为 undefined，静默失败
```

## Root Cause

### 问题 1：ProTable `rowKey` 与 `BugDocument` 主键字段不匹配

- ProTable 的 `rowKey` prop 默认值为 `"id"`（`components/ProTable/index.vue:156`），该值透传给 `useSelection` hook（`:181`）
- `useSelection` 的 `selectedListIds` 计算属性通过 `item[rowKey]` 提取每行的标识值（`hooks/useSelection.ts:14`）
- `BugDocument` 接口的主键字段为 `key`，不存在 `id` 字段（`api/modules/bug.ts:192-234`）
- 因此 `selectedListIds` 数组中每个元素均为 `undefined`，`batchDelete` 收到 `[undefined, undefined, ...]`

### 问题 2：`batchDelete` 向 store 传递不完整的伪造对象

- `batchDelete` 原实现构造 `{ key: id } as BugDocument` 传给 `store.handleDelete()`（`views/bug/index.vue:693`，修复前）
- `handleDelete` 内部无条件弹出二次确认对话框，消息模板引用 `bug.title`（`stores/modules/bug.ts:222`，修复前）
- 由于伪造对象仅有 `key` 字段，`bug.title` 为 `undefined`，用户看到 `Delete bug "undefined"?`
- 批量操作已有整体确认对话框，逐项二次确认属于冗余交互

### 调用链终端行为

`deleteBug(key)` 在 `key` 为 `undefined` 时调用 `getBug(undefined)` 查询不到匹配文档，跳过 markdown 文件清理后调用 `deleteDocument("bugs", undefined)`（`api/modules/bug.ts:635-644`），后端 `delete_document` 因 key 无效而无法匹配任何记录，整个删除链路静默失败。

## Fix

### 1. `YiVad/src/views/bug/index.vue` — ProTable 添加 `row-key="key"`

使 `useSelection` 通过 `item["key"]` 正确提取 `BugDocument.key` 作为选中行标识：

```diff
  <ProTable
    ref="proTable"
    title="Bugs"
    :columns="columns"
    :request-api="fetchBugs"
    :pagination="true"
+   row-key="key"
  >
```

### 2. `YiVad/src/views/bug/index.vue` — `batchDelete` 从 `allBugs` 查找真实 `BugDocument`

用 `allBugs.value.find()` 按 key 定位完整 `BugDocument` 对象，确保 `handleDelete` 能访问 `title` 等字段进行状态清理（如 `selectedBug` 匹配判断）：

```diff
  function batchDelete(ids: string[]) {
    if (!ids.length) return;
    ElMessageBox.confirm(`Delete ${ids.length} selected bugs?`, "Batch Delete", { type: "warning" })
      .then(async () => {
-       for (const id of ids) await store.handleDelete({ key: id } as BugDocument);
+       for (const id of ids) {
+         const bug = allBugs.value.find(b => b.key === id);
+         if (bug) await store.handleDelete(bug, true);
+       }
        ElMessage.success(`Deleted ${ids.length} bugs`);
        proTable.value?.getTableList();
      })
      .catch(() => {});
  }
```

### 3. `YiVad/src/stores/modules/bug.ts` — `handleDelete` 新增 `skipConfirm` 参数

批量删除已有整体确认，逐项二次确认是多余的。新增可选参数，调用方按需跳过：

```diff
- async function handleDelete(bug: BugDocument) {
-   try {
-     await ElMessageBox.confirm(`Delete bug "${bug.title}"?`, "Confirm", { type: "warning" });
-   } catch (e: any) {
-     if (e === "cancel" || e === "close") return;
-     throw e;
-   }
+ async function handleDelete(bug: BugDocument, skipConfirm = false) {
+   if (!skipConfirm) {
+     try {
+       await ElMessageBox.confirm(`Delete bug "${bug.title}"?`, "Confirm", { type: "warning" });
+     } catch (e: any) {
+       if (e === "cancel" || e === "close") return;
+       throw e;
+     }
+   }
```

单条删除（操作列 Delete 按钮）行为不变，仍走 `skipConfirm = false` 默认路径，保留逐项确认。

## Steps to Reproduce

1. 打开 `http://localhost:8848/#/project/yivad`
2. 切换到「Bugs」Tab
3. 勾选 2 个以上 Bug 行的 checkbox
4. 点击「Delete Selected」按钮
5. 在批量确认对话框中点击确认
6. 观察页面：列表未刷新，选中的 Bug 仍然存在

## Expected Behavior

批量确认后，选中的 Bug 被逐一删除（包括 MongoDB 文档和对应的 YiKnowledge markdown 文件），列表自动刷新，不再显示已删除项。

## Actual Behavior

批量确认后页面无任何变化。调用链终端 `delete_document("bugs", undefined)` 因 key 无效无法匹配任何记录，后端静默返回成功但实际未删除任何数据。

## Impact

- **数据完整性**：无影响（删除操作未执行，数据未被破坏）
- **用户体验**：批量删除功能完全不可用，用户只能逐条删除，在需要清理大量 Bug 时效率极低
- **影响范围**：Bug 列表页（`/bugs` 和 `/project/:key` 的 Bugs Tab）的批量删除功能

## Verification

1. 在 Bug 列表页勾选 2 个 Bug，点击「Delete Selected」
2. 确认仅弹出一次批量确认对话框，不再弹出逐项 `Delete bug "xxx"?` 对话框
3. 确认后列表刷新，选中的 Bug 消失
4. 单条删除（操作列 Delete 按钮）行为不变，仍弹出逐项确认

## Related Files

| 文件 | 行号 | 变更 |
|------|------|------|
| `YiVad/src/views/bug/index.vue` | 155 | 添加 `row-key="key"` 到 ProTable |
| `YiVad/src/views/bug/index.vue` | 689-701 | `batchDelete` 从 `allBugs` 查找真实 `BugDocument`，传递 `skipConfirm=true` |
| `YiVad/src/stores/modules/bug.ts` | 220 | `handleDelete` 新增 `skipConfirm` 参数 |
| `YiVad/src/hooks/useSelection.ts` | 12-16 | `selectedListIds` 通过 `item[rowKey]` 提取标识（未修改，根因引用） |
| `YiVad/src/components/ProTable/index.vue` | 156, 181 | `rowKey` 默认 `"id"`，透传给 `useSelection`（未修改，根因引用） |
| `YiVad/src/api/modules/bug.ts` | 635-644 | `deleteBug` 调用链（未修改，终端行为引用） |

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 预防措施

| 层面 | 措施 |
|------|------|
| 代码 | 加强代码审查，关注此类问题模式 |
| 测试 | 增加自动化测试覆盖对应场景 |
| 流程 | 将此类问题纳入检查清单 |

## 经验教训

- 此类问题属于常见开发疏忽，可通过静态分析和自动化检查提前发现
- 建议将典型问题模式记录到团队知识库，避免重复踩坑
- 代码审查应重点关注此类边界情况

