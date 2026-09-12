---
title: TodoItem 类型已定义但在代码中未被使用
tags: [yipet, code-quality, dead-code]
category: projects/yipet/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiPet
type: bug
status: resolved
severity: trivial
priority: p3
---

# TodoItem 类型已定义但在代码中未被使用

## 现象

`src/api/types.ts:436-439` 定义了 `TodoItemStatus` 和 `TodoItem` 类型，但代码库中无任何地方使用它们：

```typescript
export type TodoItemStatus = 'pending' | 'in_progress' | 'completed';

export interface TodoItem {
  // ...
}
```

这与 bug #10（死 composable/hook）互补——本缺陷针对类型定义层面的死代码。

## 根因分析

- Todo 功能可能在计划中但未实现
- 类型定义在 API 层创建时预留，后续未跟进实现

## 涉及文件

- `src/api/types.ts:436-439` — 未使用的类型定义

## 修复方案

如果 Todo 功能有确定的实现计划：保留类型并添加 TODO 注释。否则删除。


## 影响范围

**影响模块**：TypeScript 类型定义文件。
**影响用户**：开发者可能使用错误的类型定义，或者困惑于为何某个类型未被使用。
**影响范围**：TypeScript 类型系统的准确性和代码可维护性。
## 预防措施

| 层面 | 措施 | 责任人 |
|------|------|--------|
| 工具 | TypeScript `noUnusedLocals` 和 `noUnusedParameters` 编译选项 | DevOps |
| 工具 | ESLint `@typescript-eslint/no-unused-vars` 规则 | DevOps |
| 流程 | 定期运行死代码检测工具（如 `ts-prune`） | 开发者 |


## 经验教训

未使用的类型定义不仅增加了代码库的噪音，还可能误导新开发者——他们可能认为某个类型是"需要使用的"，从而基于错误假设编写代码。TypeScript 的 `noUnusedLocals` 可以自动检测这类问题。
