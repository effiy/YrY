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

- 此类问题属于常见开发疏忽，可通过静态分析和自动化检查提前发现
- 建议将典型问题模式记录到团队知识库，避免重复踩坑
- 代码审查应重点关注此类边界情况

