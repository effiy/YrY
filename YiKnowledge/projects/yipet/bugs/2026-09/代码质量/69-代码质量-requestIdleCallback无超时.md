---
title: bootstrap.ts中requestIdleCallback未设置timeout导致宠物注入可能无限期延迟
tags: [yipet, code-quality, performance]
category: projects/yipet/bugs/2026-09/代码质量
created: 2026-09-23
updated: 2026-09-23
source: YiPet
type: bug
status: resolved
severity: minor
priority: p2
---

# requestIdleCallback 未设置 timeout 导致宠物注入延迟

## 现象

在内容密集型页面（持续动画、密集 DOM 操作），`requestIdleCallback` 注册的宠物覆盖层恢复回调被无限期推迟。用户刷新页面后可能等待数秒甚至数十秒才看到宠物。

## 根因分析

`src/content/bootstrap.ts:65` 调用 `requestIdleCallback(fn)` 未传递 `timeout` 参数。根据 MDN 文档，无超时时浏览器可能在页面持续繁忙期间永远不执行回调。Polyfill 回退 `setTimeout(fn, 0)` 同样不可靠。

## 涉及文件

- `YiPet/src/content/bootstrap.ts:64-66`

## 修复方案

```diff
- ? (fn: () => void) => requestIdleCallback(fn)
+ ? (fn: () => void) => requestIdleCallback(fn, { timeout: 2000 })

- : (fn: () => void) => setTimeout(fn, 0);
+ : (fn: () => void) => setTimeout(fn, 50);
```

## 验证

- `npm run typecheck` ✓
- `npm test` ✓（138/138）
- `npm run build` ✓