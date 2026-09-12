---
title: content/state/persistence.ts 中 chrome.storage API 调用无错误恢复
tags: [yipet, code-quality, error-handling]
category: projects/yipet/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiPet
type: bug
status: resolved
severity: minor
priority: p2
---

# content/state/persistence.ts 中 chrome.storage API 调用无错误恢复

## 现象

`src/content/state/persistence.ts` 中 3 处 `chrome.storage.local` 调用使用裸 `catch {}` 吞没所有错误：

```typescript
// persistence.ts:33
try {
  const result = await chrome.storage.local.get(keys);
  // ...
} catch { /* 完全吞没 */ }

// persistence.ts:93
try {
  await chrome.storage.local.set({ [key]: value });
} catch { /* 完全吞没 */ }

// persistence.ts:106, 119
try { await chrome.storage.local.remove(key); } catch { }
```

当存储 API 失败时（配额超限、扩展上下文失效、存储损坏），状态持久化静默丢失，用户无法感知数据损坏。

## 根因分析

- Chrome 扩展的 `chrome.storage` API 在 Service Worker 被终止后恢复时可能短暂不可用
- 开发者假设存储 API 总是可用，忽略了错误场景
- 与 `chat/stores/chat.ts` 中类似但更严重——persistence 模块是底层基础设施

## 涉及文件

- `src/content/state/persistence.ts:33,93,106,119` — 4 处裸 `catch {}`

## 修复方案

1. 在 catch 块中至少记录 `console.warn` 以便调试
2. 实现重试逻辑（最多 3 次，指数退避）
3. 对于关键状态（用户偏好），在内存中保留备份
4. 对 `QUOTA_BYTES` 错误做特殊处理——提示用户清理数据


## 影响范围

**影响模块**：`src/content/state/persistence.ts`，所有依赖 chrome.storage.local 进行状态持久化的功能。
**影响用户**：当存储 API 静默失败时，用户的宠物位置、颜色主题、角色偏好等设置可能丢失且无任何提示。
**影响范围**：Content Script 持久化层的所有读写操作，间接影响 Popup 和 Chat Window 的状态恢复。
## 预防措施

| 层面 | 措施 | 责任人 |
|------|------|--------|
| 代码 | 创建 `safeStorage` 包装工具统一错误处理和重试，所有 storage 调用必须通过该工具 | 开发者 |
| 代码 | 禁止在 storage 调用中使用裸 `catch {}` | 开发者 |
| 工具 | ESLint 规则检测空的 catch 块 | DevOps |
| 测试 | 为 storage 操作编写集成测试，模拟配额超限和上下文失效场景 | QA |


## 经验教训

底层基础设施的错误处理决定了整个系统的可靠性。`chrome.storage` 虽然通常可靠，但在 Service Worker 重启、配额超限等边界场景下可能失败。裸 `catch {}` 是最危险的错误处理模式——它让系统在用户毫无察觉的情况下进入不一致状态。
