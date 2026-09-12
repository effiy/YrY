---
title: MutationObserver 未在页面卸载时断开
tags: [yipet, code-quality, memory-leak]
category: projects/yipet/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiPet
type: bug
status: resolved
severity: trivial
priority: p3
---

# MutationObserver 未在页面卸载时断开

## 现象

`src/content/bootstrap.ts:96-106` 创建了一个 `MutationObserver` 用于检测宠物覆盖层是否被 SPA 路由切换移除，但**从未调用 `disconnect()`**：

```typescript
const _mo = new MutationObserver(() => {
  if (!document.getElementById('yipet-overlay')) {
    _scheduleIdle(() => {
      if (!document.getElementById('yipet-overlay')) {
        createPetOverlay(window, BASE, ...);
      }
    });
  }
});
_mo.observe(document.body, { childList: true, subtree: true });
```

`_mo` 是局部变量，不会被垃圾回收，因为 DOM 仍持有其引用（通过 `observe`）。在 SPA 应用中，用户可能在同一个标签页中停留数小时，MutationObserver 会持续触发回调。

## 根因分析

- 变量名使用 `_mo` 前缀（表示"一次性使用"），但实际从未断开
- 没有连接页面卸载事件（`pagehide`、`beforeunload`）来清理
- `childList: true, subtree: true` 的配置非常宽泛，DOM 的任何变更都会触发回调

## 涉及文件

- `src/content/bootstrap.ts:96-106` — MutationObserver 无 disconnect

## 修复方案

1. 添加 `window.addEventListener('pagehide', () => _mo.disconnect())`
2. 或使用 `weakRef` 模式：当覆盖层存在超过 N 秒后，减少检测频率
3. 缩小 `subtree` 范围，只监听直接相关的 DOM 区域


## 影响范围

**影响模块**：`src/content/bootstrap.ts` 中的 MutationObserver 实例。
**影响用户**：在 SPA 页面中长时间停留（数小时）后，未断开的 Observer 会导致内存泄漏和 CPU 占用增加，浏览器逐渐变慢。
**影响范围**：所有注入了 Content Script 的 SPA 页面。
## 预防措施

| 层面 | 措施 | 责任人 |
|------|------|--------|
| 代码 | 所有 Observer（Mutation/Intersection/Resize）必须在页面卸载时 disconnect | 开发者 |
| 代码 | `pagehide` 或 `beforeunload` 事件中清理所有 Observer | 开发者 |
| 代码 | 缩小 Observer 的监听范围，避免 `subtree: true` 在 `document.body` 级别 | 开发者 |
| 测试 | 编写长时间运行的内存泄漏测试 | QA |


## 经验教训

MutationObserver 是 Chrome 扩展中最容易泄漏的资源之一。`subtree: true` + `document.body` 的组合意味着页面上任何 DOM 变化都会触发回调，在 SPA 应用中尤为严重。始终在组件/页面卸载时断开 Observer 是基本的资源管理原则。
