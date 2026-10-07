---
title: "code-quality: RoleTableView Filters Prop 被直接修改"
tags: [yivad, bug, code-quality, vue]
category: projects/yivad/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiVad
type: bug
status: closed
severity: minor
priority: p2
project: YiVad
module: src/views/knowledge/components/RoleTableView.vue
reporter: Claude
environment: development
affected_version: 1.0.0
fixed_version: 1.0.0
frequency: always
benefit: "缺陷记录：质量-RoleTableView-filters属性直接修改"
lifecycle: active
---

# code-quality: RoleTableView Filters Prop 被直接修改

## 现象

ESLint 报 6 个 `vue/no-mutating-props` 错误：
```
src/views/knowledge/components/RoleTableView.vue
   8:32  error  Unexpected mutation of "filters" prop
  25:32  error  Unexpected mutation of "filters" prop
  39:32  error  Unexpected mutation of "filters" prop
  50:32  error  Unexpected mutation of "filters" prop
  61:32  error  Unexpected mutation of "filters" prop
  72:32  error  Unexpected mutation of "filters" prop
```

## 复现步骤

1. 运行 `cd YiVad && npx eslint src/`
2. 观察 `vue/no-mutating-props` 错误

## 预期行为

子组件不应直接修改父组件传入的 prop，应通过 `defineModel` 实现双向绑定

## 实际行为

`filters` 以普通 prop 形式定义，但模板中 6 个 `<el-input v-model="filters.title">` 等直接修改了 prop 对象的属性（title, domainText, type, status, lifecycle, review）

## 根因分析

`defineProps` 将 `filters` 定义为只读 prop，但 `v-model` 在模板中直接修改了其属性。Vue 3.4+ 的 `defineModel` 宏提供了正确的双向绑定方式。

## 修复方案

将 `filters` 从 `defineProps` 移至 `defineModel`：

```diff
+const filters = defineModel<TableFilters>('filters', { required: true });
+
 defineProps<{
   files: FileRow[];
   totalCount: number;
-  filters: TableFilters;
   category: string;
 }>();
```

## 影响范围

- **影响模块**：src/views/knowledge/components/RoleTableView.vue
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否

## 验证方法

- [x] `npx eslint` 0 错误
- [x] `vue-tsc --noEmit` 通过
- [x] `pnpm test` 通过（17 文件，156 测试）

## 预防措施

| 层面 | 措施 |
|------|------|
| 代码 | 使用 `defineModel` 而非 `defineProps` 处理需双向绑定的 prop |
| 测试 | ESLint `vue/no-mutating-props` 规则已启用 |
| 流程 | CI 中 ESLint 阻断构建 |

## 经验教训

- **同一反模式在同一批次中重复出现**：此 bug 与 #10（OkrRecommendTable columnFilters）是同一问题模式——`defineProps` 的 prop 被 `v-model` 直接修改。这说明 ESLint `vue/no-mutating-props` 规则被启用后能批量发现之前未检测到的问题，体现 lint 规则作为「安全网」的价值
- **批量修复的效率**：同一类问题（prop mutation）在多个组件中存在，使用 `defineModel` 的迁移模式可以模板化处理

