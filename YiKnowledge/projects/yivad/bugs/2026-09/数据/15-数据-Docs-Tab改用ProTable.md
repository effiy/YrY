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
---

## Description

Docs Tab 原先使用原生 `el-table`，与项目其他列表页（Issue、Module）的 ProTable 风格不一致。改用 ProTable 统一表格组件体系。

**补充说明**：此问题在常规开发和测试流程中未被及时发现，建议加强对应模块的自动化测试覆盖。
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
| 代码 | 加强代码审查，关注此类问题模式 |
| 测试 | 增加自动化测试覆盖对应场景 |
| 流程 | 将此类问题纳入检查清单 |

## 经验教训

- 此类问题属于常见开发疏忽，可通过静态分析和自动化检查提前发现
- 建议将典型问题模式记录到团队知识库，避免重复踩坑
- 代码审查应重点关注此类边界情况

