---
title: MessageKey类型联合中aboutFeatureI18n重复定义
tags: [yipet, code-quality, i18n, bug]
category: projects/yipet/bugs/2026-09/代码质量
created: 2026-09-23
updated: 2026-09-23
source: YiPet
type: bug
status: resolved
severity: minor
priority: p3
---

# MessageKey 类型联合中 aboutFeatureI18n 重复定义

## 现象

`src/shared/i18n/index.ts` 的 `MessageKey` 类型联合中 `aboutFeatureI18n` 被定义了两次：

```typescript
// 第 250 行
| 'aboutFeatureI18n'
// ...
// 第 254 行（重复）
| 'aboutFeatureI18n'
```

## 根因分析

在 `MessageKey` 类型联合中添加 About 功能相关键时，`aboutFeatureI18n` 被意外添加了两次。

TypeScript 不会对联合类型中的重复成员报错——`'A' | 'A'` 等同于 `'A'`。但重复定义降低了代码的维护性：
- 维护者可能认为第二处是 `aboutFeatureTranslations` 或类似的缺失键
- 降低了类型的可读性

## 涉及文件

- `YiPet/src/shared/i18n/index.ts:254` — 重复的 `'aboutFeatureI18n'`（已移除）

## 修复方案

移除重复定义：

```diff
  | 'aboutFeatureApi'
- | 'aboutFeatureI18n'  // 重复定义，第 250 行已有
  | 'aboutArchitectureTitle'
```

## 验证

- `npm run typecheck` ✓
- `npm test` ✓（138/138）
- `npm run build` ✓