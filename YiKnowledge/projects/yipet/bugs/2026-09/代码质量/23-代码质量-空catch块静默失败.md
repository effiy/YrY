---
title: 5 处 .catch(() => {}) 空回调吞没 Promise rejection
tags: [yipet, code-quality, error-handling]
category: projects/yipet/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiPet
type: bug
status: resolved
severity: trivial
priority: p3
---

# 5 处 .catch(() => {}) 空回调吞没 Promise rejection

## 现象

YiPet 中存在 5 处完全空的 `.catch(() => {})` 或 `.catch(() => {})` 回调，完全吞没 Promise rejection：

```typescript
// locale.ts:65 — storage 迁移静默失败
chrome.storage.local.set({ [STORAGE_KEY]: legacy }).catch(() => {});

// chat.ts:279 — 设置持久化静默失败
chrome.storage.local.set({ [key]: value }).catch(() => {});

// chat.ts:1230 — clipboard 静默失败
.catch(() => {});

// chat/utils.ts:173 — clipboard 静默失败
.catch(() => {});

// relay.ts:122 — IPFS token 存储静默失败
chrome.storage.session.set({ apiToken: token }).catch(() => {});
```

这些与 bug #11（配额超限）不同——这里的根本问题是没有任何形式的日志记录，使得运行时错误完全不可见。

## 根因分析

- 开发者认为这些操作是"尽力而为"（best-effort），失败也不需要通知用户
- 但连 `console.warn` 都没有，调试时无法发现错误
- Clipboard API 失败可能是权限问题，用户需要知道

## 涉及文件

- `src/shared/i18n/locale.ts:65`
- `src/chat/stores/chat.ts:279,1230`
- `src/chat/utils.ts:173`
- `src/content/ipc/relay.ts:122`

## 修复方案

所有 `catch` 块至少应包含 `console.warn`：
```typescript
chrome.storage.local.set({ [key]: value }).catch((e: unknown) => {
  console.warn('[YiPet] Failed to persist setting:', key, e);
});
```


## 影响范围

**影响模块**：多个文件中的空 `catch {}` 块。
**影响用户**：错误被静默吞没，用户无法感知操作失败，调试困难。
**影响范围**：所有异步操作（API 调用、存储读写、DOM 操作）的错误处理路径。
## 预防措施

| 层面 | 措施 | 责任人 |
|------|------|--------|
| 工具 | ESLint `no-empty` 规则检测空 catch 块 | DevOps |
| 代码 | catch 块中至少记录 `console.warn` 或使用统一错误上报 | 开发者 |
| 流程 | 代码审查时检查所有 catch 块是否有合理的错误处理 | Reviewer |


## 经验教训

空 catch 块是最常见的反模式之一。它让错误在用户毫无察觉的情况下发生，增加了调试成本。最低限度的处理是 `console.warn`——至少让开发者在控制台看到异常。更好的做法是实现统一的错误上报机制。
