---
title: 多个视图文件中 v-if 和 v-for 在同一元素上
tags: [yivad, code-quality, vue-best-practice]
category: projects/yivad/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiVad
type: bug
status: resolved
severity: trivial
priority: p3
benefit: "缺陷记录：质量-v-if与v-for在同一元素"
lifecycle: active
---

# 多个视图文件中 v-if 和 v-for 在同一元素上

## 现象

Vue 3 的 ESLint 规则 `vue/no-use-v-if-with-v-for` 禁止在同一元素上同时使用 `v-if` 和 `v-for`（`v-if` 优先级高于 `v-for`，导致 `v-if` 无法访问 `v-for` 的变量）。

`views/knowledge/skills/index.vue`、`views/module/index.vue`、`views/issue/index.vue` 和 `views/bug/index.vue` 等多个视图在筛选标签区域使用了此模式：

```vue
<!-- 常见模式：遍历标签并在满足条件时渲染 -->
<el-tag v-for="p in activePills" :key="p.id" v-if="p.visible" ...>
```

虽然此处的 `v-if` 检查的是 `v-for` 变量 `p.visible`（在 Vue 3 中合法），但 ESLint 规则仍然会告警。而项目的 ESLint 配置可能已禁用或忽略了这条规则。

## 根因分析

- Vue 3 中 `v-if` 和 `v-for` 可在同一元素上共存（与 Vue 2 不同），但 ESLint 规则默认禁止
- 项目可能未启用此规则或使用了 `vue/no-use-v-if-with-v-for: off`
- 当两者共存时，渲染顺序为 `v-if` → `v-for`，可能不符合开发者预期

## 涉及文件

- `views/knowledge/skills/index.vue` — 标签筛选
- `views/module/index.vue` — 标签筛选
- `views/issue/index.vue` — 问题筛选标签
- `views/bug/index.vue` — 缺陷筛选标签

## 修复方案

使用 `<template>` 标签包裹 `v-for`，将 `v-if` 放在子元素上：
```vue
<template v-for="p in activePills" :key="p.id">
  <el-tag v-if="p.visible" ...>{{ p.label }}</el-tag>
</template>
```

或使用 computed 预过滤 `activePills.filter(p => p.visible)`。

## 预防措施

- 启用 `vue/no-use-v-if-with-v-for: warn` 规则
- 新组件使用 `<template>` 包裹模式

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 经验教训

- **ESLint 规则的价值**：如果项目启用了 `vue/no-use-v-if-with-v-for: warn`，这 4 处违规会在开发阶段就被捕获。关闭或忽略 ESLint 规则会导致已知的反模式在代码库中积累
- **computed 过滤优于模板内过滤**：`activePills.filter(p => p.visible)` 在 computed 中完成过滤，模板中只做渲染，比在模板中用 `v-if` 过滤更清晰且可测试

