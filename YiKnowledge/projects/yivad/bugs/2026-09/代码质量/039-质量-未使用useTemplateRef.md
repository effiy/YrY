---
title: useTemplateRef (Vue 3.5+) 未被采用仍使用字符串 ref
tags: [yivad, code-quality, vue-pattern]
category: projects/yivad/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiVad
type: bug
status: resolved
severity: trivial
priority: p3
benefit: "缺陷记录：质量-未使用useTemplateRef"
lifecycle: active
---

# useTemplateRef (Vue 3.5+) 未被采用仍使用字符串 ref

## 现象

YiVad 使用 Vue 3.5，但代码库中所有 template ref 仍使用 Vue 2 风格的字符串 ref：

```vue
<template>
  <div ref="containerRef" />
</template>

<script setup lang="ts">
const containerRef = ref<HTMLElement | null>(null);
</script>
```

Vue 3.5 引入了 `useTemplateRef()`，提供类型安全的 template ref 绑定，消除了变量名和 ref 属性名之间的隐式字符串耦合。

`auto-imports.d.ts` 中已有 `useTemplateRef` 的类型声明，但项目中无任何实际使用。

## 根因分析

- 代码库在 Vue 3.5 之前建立，team 习惯字符串 ref 模式
- 没有主动迁移到新 API 的计划
- `useTemplateRef` 的好处未在团队中传播

## 涉及文件

- 所有使用 `ref="..."` + `const ...Ref = ref()` 的组件

## 修复方案

逐步迁移到 `useTemplateRef`：
```vue
<template>
  <div :ref="containerRef" />
</template>

<script setup lang="ts">
const containerRef = useTemplateRef<HTMLElement>('containerRef');
</script>
```

## 预防措施

- 新组件使用 `useTemplateRef`，旧组件逐步迁移

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 经验教训

- **API 版本升级 ≠ API 采用**：Vue 升级到 3.5 后 `useTemplateRef` 自动可用（`auto-imports.d.ts` 包含其类型），但团队没有迁移计划。版本升级带来的新特性需要在团队中主动推广才能落地
- **字符串 ref 的隐式耦合**：`<div ref="containerRef">` 和 `const containerRef = ref()` 通过相同的变量名隐式绑定。拼写错误或重命名遗漏会导致 ref 为 null，且 TypeScript 无法检测这种字符串耦合

