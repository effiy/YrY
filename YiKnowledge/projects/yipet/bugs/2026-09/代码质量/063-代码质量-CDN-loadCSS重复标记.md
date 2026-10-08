---
title: CDN注入器loadCSS重复标记已加载导致onload成为死代码
tags: [yipet, code-quality, cdn, bug]
category: projects/yipet/bugs/2026-09/代码质量
created: 2026-09-23
updated: 2026-09-23
source: YiPet
type: bug
status: resolved
severity: minor
priority: p2
---

# CDN 注入器 loadCSS 重复标记已加载

## 现象

`src/content/cdn/injector.ts` 的 `loadCSS` 函数在 CSS 实际加载完成前就将资源标记为"已加载"，且 `onload` 回调成为死代码（因为标记已在 `onload` 触发前被设置）。

## 根因分析

```typescript
// 修复前：loaded.set 在两处都被调用
function loadCSS(path: string): boolean {
    if (loaded.has(path)) return false;
    const el = document.createElement('link');
    el.rel = 'stylesheet';
    el.href = resolveUrl(path);
    el.onload = () => {
      loaded.set(path, true);  // 死代码 — 永远不会是首次设置
    };
    (document.head || document.documentElement).appendChild(el);
    loaded.set(path, true);    // 同步执行，onload 之前
    return true;
  }
```

`loaded.set(path, true)` 在第 73 行同步执行，早于 `onload` 事件（第 69-71 行）。`onload` 回调中的 `loaded.set` 永远不会是首次设置该路径，因此成为死代码。

### 影响评估

- **低影响**：CSS 加载为异步非阻塞，标记为"已加载"仅用于防重复注入。同步标记不会导致功能问题。
- **代码质量问题**：死代码降低可维护性，可能误导未来的维护者。

## 涉及文件

- `YiPet/src/content/cdn/injector.ts:64-75` — `loadCSS` 函数

## 修复方案

移除死代码 `onload` 回调，保留同步标记：

```diff
  function loadCSS(path: string): boolean {
    if (loaded.has(path)) return false;
    const el = document.createElement('link');
    el.rel = 'stylesheet';
    el.href = resolveUrl(path);
-   el.onload = () => {
-     loaded.set(path, true);
-   };
    (document.head || document.documentElement).appendChild(el);
    loaded.set(path, true);
    return true;
  }
```

## 验证

- `npx tsc --noEmit` ✓
- `npm test` ✓（138/138）
- `npm run build` ✓