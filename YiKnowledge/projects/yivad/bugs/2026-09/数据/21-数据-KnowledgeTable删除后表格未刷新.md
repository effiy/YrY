---
title: "KnowledgeTable 角色页面删除文件后 ProTable 表格未刷新"
tags: [yivad, bug, 数据, knowledge]
category: projects/yivad/bugs/数据
created: 2026-09-10
updated: 2026-09-10
source: YiVad
type: bug
status: resolved
severity: major
priority: p1
project: YiVad
module: src/views/knowledge/KnowledgeTable.vue
reporter: Chengliang.Yi
environment: Chrome / macOS
affected_version: latest
fixed_version: latest
frequency: always
---

# KnowledgeTable 角色页面删除文件后 ProTable 表格未刷新

## 现象

在 curator、engineer、aier 等角色知识页面（均使用 `KnowledgeTable.vue`）点击 Del 按钮删除文件后：
- 确认弹窗正常弹出
- API 调用成功（文件已从磁盘删除）
- 但 ProTable 表格仍显示已删除的文件行
- 需手动刷新浏览器页面才能看到更新后的列表

## 复现步骤

1. 访问 `http://localhost:8848/#/curator`
2. 点击任意文件的 Del 按钮
3. 在确认弹窗中点击 Confirm/Delete
4. 观察表格——已删除的文件行仍然存在
5. 刷新浏览器页面——文件行消失

## 预期行为

点击 Del → 确认 → API 调用成功 → 表格立即移除已删除的文件行，无需刷新页面。

## 实际行为

点击 Del → 确认 → API 调用成功（后端返回 `{ deleted: true }`）→ 表格未更新，仍显示已删除的文件行。

## 根因分析

**三项根因（`KnowledgeTable.vue:250-290`）：**

1. **不可靠的异步刷新依赖**：组件使用 `watch(allFiles, () => { proTable.value?.getTableList(); })` 依赖 Vue 3 异步 Watcher 在 `allFiles` 变更后触发 ProTable 刷新。但 `flush: 'pre'` 的微任务时序与 ProTable 内部 `requestAuto: true` 的同步 `getTableList()` 调用存在竞争——Watcher 可能在 ProTable 的 `onMounted` 之前触发，此时 `proTable.value` 为 null。

2. **初始加载时序问题**：`loadData()` 是异步的，但 ProTable 的 `requestAuto: true` 在 `onMounted` 时同步调用 `getTableList()`，此时 `allFiles` 仍为初始空数组 `[]`。`loadData()` 完成后仅依赖 watch 触发刷新，不可靠。

3. **确认弹窗缺少显式按钮文本**：`ElMessageBox.confirm` 未指定 `confirmButtonText`/`cancelButtonText`，在 Element Plus 2.14.5 中默认按钮文本与项目其他页面的"删除/取消"模式不一致。

## 修复方案

**三项修复（`KnowledgeTable.vue`）：**

1. 移除 `watch(allFiles, ...)` 隐式刷新依赖
2. `loadData()` 完成后使用 `await nextTick()` + `refreshTable()` 显式刷新
3. `handleDelete()` 删除成功后显式调用 `refreshTable()`
4. 确认弹窗增加 `confirmButtonText: "Delete"`、`cancelButtonText: "Cancel"`
5. 错误处理增加 `console.error` 日志

```diff
-import { ref, computed, onMounted, watch } from "vue";
+import { ref, computed, onMounted, nextTick } from "vue";

 async function handleDelete(file: KnowledgeFileEntry) {
   try {
-    await ElMessageBox.confirm(`Delete "${file.path}"?`, "Confirm Delete", { type: "warning" });
+    await ElMessageBox.confirm(
+      `Delete "${file.path}"? This action cannot be undone.`,
+      "Confirm Delete",
+      { confirmButtonText: "Delete", cancelButtonText: "Cancel", type: "warning" }
+    );
   } catch { return; }
   try {
     await deleteKnowledgeFile(file.path);
     allFiles.value = allFiles.value.filter(f => f.path !== file.path);
     ElMessage.success("File deleted");
     refreshTable();
-  } catch { ElMessage.error("Failed to delete file"); }
+  } catch (e) {
+    console.error("Delete failed:", e);
+    ElMessage.error("Failed to delete file");
+  }
 }

 async function loadData() {
   loading.value = true;
   try {
     const res = await scanKnowledge(props.category);
     const files = (res.categories?.flatMap(c => c.files) ?? []).filter(f => f.meta?.type !== "rss");
     allFiles.value = files.map(f => ({ ...f, _domain: getDomain(f) }));
+    await nextTick();
+    refreshTable();
-  } catch { allFiles.value = []; }
+  } catch (e) {
+    console.error("Load knowledge files failed:", e);
+    allFiles.value = [];
+  } finally { loading.value = false; }
 }

 onMounted(() => { loadData(); });
-watch(allFiles, () => { proTable.value?.getTableList(); });
```

## 影响范围

- **影响模块**：`src/views/knowledge/KnowledgeTable.vue`（所有 7 个角色页面：curator/engineer/aier/srer/leader/executiver/producter）
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（YiPet 不直接使用此组件）

## 验证方法

- [x] curator 页面点击 Del 删除文件，表格立即更新
- [x] engineer 页面点击 Del 删除文件，表格立即更新
- [x] 删除最后一页最后一项，表格正确回到前一页
- [x] `vue-tsc --noEmit` 无新增类型错误
- [ ] 手动回归测试 7 个角色页面删除功能全部通过

## 预防措施

| 层面 | 措施 |
|------|------|
| 代码 | ProTable + 客户端分页模式需显式调用 `refreshTable()` 而非依赖 watch 副作用 |
| 测试 | 为 `KnowledgeTable.vue` 添加 Vitest 组件测试覆盖删除流程 |
| 流程 | 新组件替换旧实现时，逐项对比旧实现的 UI 交互行为（删除后刷新、加载态、错误态） |

## 相关资源

- PR：—
- Commit：—
- 关联需求：[15-需求-知识库页面优化](../requirements/2026-09/15-需求-知识库页面优化.md)

## 经验教训

- 此类问题属于常见开发疏忽，可通过静态分析和自动化检查提前发现
- 建议将典型问题模式记录到团队知识库，避免重复踩坑
- 代码审查应重点关注此类边界情况

