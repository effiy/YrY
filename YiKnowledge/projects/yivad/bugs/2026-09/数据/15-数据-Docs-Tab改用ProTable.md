---
title: "项目详情页: Docs Tab 改用 ProTable"
key: docs-tab-use-protable-20260910
tags:
- ui-refinement
- protable
- docs
- project-detail
category: projects/yivad/bugs/data
created: "2026-09-10"
updated: 2026-09-10
source: internal
type: improvement
status: resolved
severity: minor
priority: p3
project: YiVad
module: views/project/components/DetailDocs.vue
reporter: Claude
environment: Chrome / macOS
affectedVersion: main
fixedVersion: main (post-fix 2026-09-10)
frequency: always
benefit: "缺陷记录：数据-Docs-Tab改用ProTable"
lifecycle: active
---

## Description

Docs Tab 原先使用原生 `el-table`，与项目其他列表页（Issue、Module）的 ProTable 风格不一致。改用 ProTable 统一表格组件体系。

### 变更内容

| 变更 | 说明 |
|------|------|
| `el-table` → `ProTable` | 统一表格组件，禁用分页（`:pagination="false"`） |
| 列定义改用 `ColumnProps[]` | 标准 ProTable 列配置格式，`computed` 包裹以响应 i18n |
| `data` 属性传静态数据 | 直接传 `filteredDocItems`，无需 `requestApi` |
| 模板 slot 命名调整 | `#title`/`#tag`/`#updatedAt`/`#path`（prop 名作为 slot 名） |
| 移除 `dd-table-wrap` 样式 | ProTable 自带表格样式 |

## Fix

### views/project/components/DetailDocs.vue

```diff
- <el-table :data="filteredDocItems" stripe size="small" style="width: 100%">
-   <el-table-column ... />
-   ...
- </el-table>
+ <ProTable
+   title=""
+   :columns="docColumns"
+   :data="filteredDocItems"
+   :pagination="false"
+ >
+   <template #title="scope">...</template>
+   <template #tag="scope">...</template>
+   <template #updatedAt="scope">...</template>
+   <template #path="scope">...</template>
+ </ProTable>
```

## Verification

- [ ] Docs Tab 表格正常显示，列排序可用
- [ ] 搜索和标签过滤功能正常
- [ ] CLAUDE.md 点击可正常加载预览
- [ ] 中英文切换后列标题正确更新
- [ ] 无分页器（数据量少）

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 预防措施

| 层面 | 措施 |
|------|------|
| 代码 | 新组件优先使用 ProTable 而非 el-table，在项目规范中明确：列表场景默认 ProTable |
| 流程 | 新增表格 UI 的 Code Review 检查项：「是否已使用 ProTable 替代 el-table」 |

## 经验教训

- **渐进式统一**：项目早期 Docs Tab 用 `el-table` 快速搭建，后续 Issue/Module 页面统一迁移到 ProTable 后 Docs 成为不一致的例外。统一组件体系需要主动审计，而非等待挨个发现
- **ProTable 的静态数据模式**：`:data="filteredDocItems"` + `:pagination="false"` 与常规 `requestApi` 模式不同，适用于数据量小、已在组件内完成过滤的场景

