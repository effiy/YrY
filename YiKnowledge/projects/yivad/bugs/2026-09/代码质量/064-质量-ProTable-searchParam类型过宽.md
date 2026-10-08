---
title: ProTable 列配置中 searchParam 类型过于宽泛
tags: [yivad, code-quality, types]
category: projects/yivad/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiVad
type: bug
status: resolved
severity: trivial
priority: p3
benefit: "缺陷记录：质量-ProTable-searchParam类型过宽"
lifecycle: active
---

# ProTable 列配置中 searchParam 类型过于宽泛

## 现象

`components/ProTable/interface/index.ts` 中 `searchParam` 和通用字典类型使用 `{ [key: string]: any }`：

```typescript
searchParam: { [key: string]: any };
```

## 涉及文件

- `src/components/ProTable/interface/index.ts`

## 修复方案

为 searchParam 定义精确的泛型类型：

```typescript
searchParam: Record<string, string | number | boolean | null>;
```

## 预防措施

避免 `{ [key: string]: any }` 泛化字典类型。

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 经验教训

- **`{ [key: string]: any }` 是类型安全的黑洞**：这种类型允许任意键/任意值，调用方可以传入不存在的字段、错误的值类型，而 TypeScript 不会告警。应使用 `Record<string, string | number | boolean | null>` 明确限定值类型

