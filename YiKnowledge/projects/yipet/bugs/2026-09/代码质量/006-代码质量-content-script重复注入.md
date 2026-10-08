---
title: 内容脚本注入缺少已存在性检查可能重复注入
tags: [yipet, code-quality, content-script]
category: projects/yipet/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiPet
type: bug
status: resolved
severity: trivial
priority: p3
---

# 内容脚本注入缺少已存在性检查可能重复注入

## 现象

`src/content/bootstrap.ts` 注册了路由变更事件监听但缺少对已注入元素的去重保护：

```typescript
window.addEventListener('yipet:routeChange', ensurePetOverlay);
window.addEventListener('popstate', ensurePetOverlay);
window.addEventListener('hashchange', ensurePetOverlay);
```

如果 SPA 路由快速切换（如用户快速点击导航），`ensurePetOverlay` 可能在上一轮 DOM 操作完成前被再次调用，导致：
- 多个宠物覆盖层同时渲染
- 动画状态不一致
- 事件监听器泄漏

## 根因分析

- `ensurePetOverlay` 无防抖/节流保护
- 无互斥锁机制防止并发执行
- SPA 框架（Vue Router、React Router）可能在短时间内触发多次路由变更事件

## 涉及文件

- `src/content/bootstrap.ts:92-94` — 路由事件监听
- `src/content/rendering/overlay.ts` — `ensurePetOverlay` 实现

## 修复方案

1. 在 `ensurePetOverlay` 中添加防抖（200ms）
2. 检查 DOM 中是否已存在 `#yipet-overlay` 元素，存在则跳过创建
3. 添加并发保护标志（`isInjecting` ref）
4. 利用 `requestAnimationFrame` 确保 DOM 操作在正确的帧执行


## 影响范围

**影响模块**：`src/content/bootstrap.ts` 注入逻辑。
**影响用户**：SPA 路由快速切换时可能出现多个宠物覆盖层叠加、动画状态不一致、内存泄漏。
**影响范围**：所有 SPA 页面的宠物注入流程，高频切换场景下影响显著。
## 预防措施

| 层面 | 措施 | 责任人 |
|------|------|--------|
| 代码 | 所有 DOM 操作函数需支持幂等调用——多次调用结果一致 | 开发者 |
| 代码 | 注入前检查 DOM 中是否已存在目标元素 | 开发者 |
| 代码 | 使用互斥锁（`isInjecting` flag）防止并发注入 | 开发者 |
| 测试 | 添加快速路由切换的压力测试 | QA |


## 经验教训

Content Script 的注入逻辑天然是非幂等的——每次调用都会创建新的 DOM 元素。在 SPA 路由快速切换场景下，防抖/节流和互斥锁是必需的防护措施。假设注入逻辑只会被调用一次是错误的，应始终假设可能被多次触发。
