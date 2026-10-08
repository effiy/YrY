---
title: "code-quality: OkrRecommendTable ColumnFilters Prop 被直接修改"
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
module: src/components/OkrRecommend/components/OkrRecommendTable.vue
reporter: Claude
environment: development
affected_version: 1.0.0
fixed_version: 1.0.0
frequency: always
benefit: "缺陷记录：质量-OkrRecommendTable-columnFilters属性直接修改"
lifecycle: active
---

# code-quality: OkrRecommendTable ColumnFilters Prop 被直接修改

## 现象

ESLint 报 4 个 `vue/no-mutating-props` 错误：
```
src/components/OkrRecommend/components/OkrRecommendTable.vue
  49:30  error  Unexpected mutation of "columnFilters" prop
  66:30  error  Unexpected mutation of "columnFilters" prop
  77:30  error  Unexpected mutation of "columnFilters" prop
  89:30  error  Unexpected mutation of "columnFilters" prop
```

## 复现步骤

1. 运行 `cd YiVad && npx eslint src/`
2. 观察 `vue/no-mutating-props` 错误

## 预期行为

子组件不应直接修改父组件传入的 prop，应通过 `defineModel` 或 emit 事件实现双向绑定

## 实际行为

`columnFilters` 以普通 prop 形式定义，但模板中通过 `v-model="columnFilters.title"` 等直接修改了 prop 对象的属性

## 根因分析

`defineProps` 将 `columnFilters` 定义为只读 prop，但 `v-model` 在模板中直接修改了其属性。Vue 3.4+ 提供了 `defineModel` 宏来正确处理可写 prop 的双向绑定。

## 修复方案

将 `columnFilters` 从 `defineProps` 移至 `defineModel`：

```diff
 defineProps<{
   items: TableRow[];
-  columnFilters: Record<string, string>;
   apiGoals: Record<string, any>;
   ...
 }>();
+const columnFilters = defineModel<Record<string, string>>('columnFilters', { required: true });
```

## 影响范围

- **影响模块**：src/components/OkrRecommend/components/OkrRecommendTable.vue
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

- **`defineModel` vs `defineProps` 的选择**：当 prop 需要双向绑定时（子组件通过 `v-model` 修改），应使用 Vue 3.4+ 的 `defineModel` 而非 `defineProps`。`defineProps` 定义的 prop 是只读的，直接修改会触发 ESLint `vue/no-mutating-props` 错误
- **Props 向下，Events 向上**：这是 Vue 单向数据流的核心原则。`columnFilters` 作为 prop 传入后，子组件不应直接修改其属性，而应通过 emit 通知父组件更新

