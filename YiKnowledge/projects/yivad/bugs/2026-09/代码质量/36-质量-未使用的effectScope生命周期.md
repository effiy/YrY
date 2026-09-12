---
title: 未使用 Vue 的 onScopeDispose 清理 composable 副作用
tags: [yivad, code-quality, lifecycle]
category: projects/yivad/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiVad
type: bug
status: resolved
severity: trivial
priority: p3
---

# 未使用 Vue 的 onScopeDispose 清理 composable 副作用

## 现象

Vue 3 提供了 `effectScope` / `getCurrentScope` / `onScopeDispose` API 用于管理响应式副作用的生命周期。但这些 API 在 YiVad 代码库中未被使用（仅存在于 `auto-imports.d.ts` 自动生成的类型声明中）。

多个 composable 在 `onMounted` 中注册的监听器和定时器仅依赖 `onUnmounted` 手动清理：

```typescript
// hooks/useSyncScroll.ts — 手动 onUnmounted 清理
onMounted(() => {
  editor.addEventListener('scroll', onEditorScroll);
  preview.addEventListener('scroll', onPreviewScroll);
});
onUnmounted(() => {
  editor.removeEventListener('scroll', onEditorScroll);
  preview.removeEventListener('scroll', onPreviewScroll);
});
```

如果 composable 在 `setup` 中被多次调用，或由于异常导致 `onUnmounted` 未执行，副作用会泄漏。

## 根因分析

- 团队不熟悉 `effectScope` API——这是 Vue 3.2+ 的高级特性
- `onUnmounted` 手动清理在简单场景下足够，但不够健壮
- 没有团队内部的 composable 编写规范

## 涉及文件

- `hooks/useSyncScroll.ts` — DOM 事件注册
- `hooks/useResizable.ts` — pointer 事件注册
- `hooks/useAiChatShortcuts.ts` — 键盘监听注册
- `views/aiChat/components/ChatToolbar/index.vue` — 全局键盘事件

## 修复方案

为复杂的 composable（多个 watcher + 事件 + 定时器）使用 `effectScope`：
```typescript
const scope = effectScope();
scope.run(() => {
  watch(source, fn);
  window.addEventListener('scroll', handler);
});
onScopeDispose(() => scope.stop());
```

## 预防措施

- composable 编写规范中推荐对复杂副作用使用 `effectScope`

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 经验教训

- 此类问题属于常见开发疏忽，可通过静态分析和自动化检查提前发现
- 建议将典型问题模式记录到团队知识库，避免重复踩坑
- 代码审查应重点关注此类边界情况

