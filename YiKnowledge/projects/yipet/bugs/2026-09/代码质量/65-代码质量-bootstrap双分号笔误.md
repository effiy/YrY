---
title: bootstrap.ts中3处双分号笔误
tags: [yipet, code-quality, minor]
category: projects/yipet/bugs/2026-09/代码质量
created: 2026-09-23
updated: 2026-09-23
source: YiPet
type: bug
status: resolved
severity: minor
priority: p3
---

# bootstrap.ts 中 3 处双分号笔误

## 现象

`src/content/bootstrap.ts` 中有 3 处函数调用末尾出现双分号 `;;`：

```typescript
createPetOverlay(window, BASE, _injectedColor, _injectedRole, _injectedVisible, _injectedIpcSecret);;
```

分布在：
- 第 58 行：MAIN 世界初始化
- 第 72 行：`ensurePetOverlay` 内的恢复逻辑
- 第 101 行：`MutationObserver` 回调内的恢复逻辑

## 根因分析

纯粹的笔误。第二个分号被解析为空语句，TypeScript 和 JavaScript 都允许这种行为，无运行时影响。但降低了代码的专业性。

## 涉及文件

- `YiPet/src/content/bootstrap.ts:58,72,101` — 三处双分号

## 修复方案

移除多余分号：

```diff
- createPetOverlay(window, BASE, ...);;
+ createPetOverlay(window, BASE, ...);
```

## 验证

- `npx tsc --noEmit` ✓
- `npm test` ✓（138/138）
- `npm run build` ✓