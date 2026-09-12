---
title: 未使用 onErrorCaptured 全局错误边界处理组件渲染错误
tags: [yivad, code-quality, error-boundary]
category: projects/yivad/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiVad
type: bug
status: resolved
severity: minor
priority: p2
resolution: |
  layouts/index.vue: 添加 onErrorCaptured 钩子，捕获子组件渲染错误并通过
  ElNotification 通知用户，阻止错误继续传播导致白屏
---

# 未使用 onErrorCaptured 全局错误边界处理组件渲染错误

## 现象

`auto-imports.d.ts` 中声明了 `onErrorCaptured` 但代码库中无任何组件使用它。整个 YiVad 管理后台缺少 Vue 错误边界——子组件渲染时的异常会直接导致白屏：

```typescript
// 无组件使用 onErrorCaptured
// 子组件抛出的异常会冒泡到 Vue 根实例 → 整个应用崩溃
```

## 根因分析

- `onErrorCaptured` 是 Vue 3 提供的错误边界钩子，允许父组件捕获子组件的渲染错误
- 项目所有组件使用 `<script setup>` 但未在顶层布局组件中注册错误钩子
- ECharts、Mermaid 等第三方组件是渲染错误的常见来源

## 涉及文件

- `layouts/` — 未注册 `onErrorCaptured`
- 所有 15+ 个视图模块 — 无错误边界

## 修复方案

在布局组件中注册全局错误边界：
```vue
<script setup>
import { onErrorCaptured } from 'vue';

onErrorCaptured((err, instance, info) => {
  console.error('[YiVad] Component error:', err, info);
  ElNotification({ title: 'Error', message: err.message, type: 'error' });
  return false; // 阻止错误继续传播
});
</script>
```

## 预防措施

- 顶层布局组件必须注册 `onErrorCaptured`

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 经验教训

- 此类问题属于常见开发疏忽，可通过静态分析和自动化检查提前发现
- 建议将典型问题模式记录到团队知识库，避免重复踩坑
- 代码审查应重点关注此类边界情况

