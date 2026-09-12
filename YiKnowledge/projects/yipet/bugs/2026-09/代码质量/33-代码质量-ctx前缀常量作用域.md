---
title: chat/index.ts 重复设置了 `${CTX_PREFIX}` 常量
tags: [yipet, code-quality, constants]
category: projects/yipet/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiPet
type: bug
status: resolved
severity: trivial
priority: p3
---

# chat/index.ts 重复设置了 `${CTX_PREFIX}` 常量

## 现象

`src/chat/stores/chat.ts:76` 中定义了 `CTX_PREFIX` 常量：

```typescript
const CTX_PREFIX = 'ctx:';
```

但在 `src/chat/components/ContextFilesPanel/ContextFilesPanel.vue` 中也有类似的上下文文件前缀逻辑——两处使用相同的魔术字符串 `'ctx:'` 但未引用同一常量。

## 根因分析

- `CTX_PREFIX` 定义在 store 文件中，其他组件无法导入
- 应提取到 `src/chat/constants.ts` 中统一管理

## 涉及文件

- `src/chat/stores/chat.ts:76` — CTX_PREFIX 定义
- `src/chat/components/ContextFilesPanel/ContextFilesPanel.vue` — 使用相同魔术字符串

## 修复方案

将 `CTX_PREFIX` 移到 `src/chat/constants.ts`：
```typescript
export const CTX_PREFIX = 'ctx:';
```


## 影响范围

**影响模块**：使用 `ctx_` 前缀的内部常量定义。
**影响用户**：`ctx_` 前缀的常量可能被误认为是上下文相关的局部变量，而非全局常量。命名歧义增加代码阅读成本。
**影响范围**：所有使用 `ctx_` 前缀定义的常量和变量。
## 预防措施

| 层面 | 措施 | 责任人 |
|------|------|--------|
| 代码 | 内部常量使用 `_` 前缀（如 `_API_BASE`）或 `INTERNAL_` 前缀 | 开发者 |
| 代码 | 命名约定应在团队内统一，写入编码规范文档 | 开发者 |
| 工具 | ESLint 命名规则检查常量命名是否符合约定 | DevOps |


## 经验教训

命名约定的不一致是隐性的沟通成本。`ctx_` 前缀容易让人联想到"context"，但实际上可能只是"internal"的缩写。明确定义并团队共享命名约定，可以消除这类认知负担。
