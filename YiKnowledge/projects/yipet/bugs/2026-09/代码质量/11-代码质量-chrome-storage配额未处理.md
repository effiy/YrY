---
title: chrome.storage.local 写入未处理配额超限
tags: [yipet, code-quality, code-smell, chrome-api, storage]
category: projects/yipet/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiPet
type: bug
status: resolved
severity: minor
priority: p2
---

# chrome.storage.local 写入未处理配额超限

## 现象

整个代码库中的 `chrome.storage.local.set()` 调用在写入失败时要么静默忽略错误，要么捕获错误但不检查 Chrome 存储配额超限（`chrome.storage.QUOTA_BYTES_PER_ITEM` / 总配额）。当用户大量使用聊天时（长会话、多个标签页、RAG 索引元数据），存储可能会超出配额，导致静默的数据丢失。

## 根因分析

`chrome.storage.local` 有以下限制：
- 每项最大 10 MB（自 Chrome 114+ 起，之前为 10 MB）
- manifest 中需要 `"unlimitedStorage"` 权限才能解除限制

YiPet 的 `manifest.json` 未声明 `"unlimitedStorage"` 权限。当存储满时，`chrome.storage.local.set()` 会因 `"QUOTA_BYTES_PER_ITEM quota exceeded"` 或 `"This exceeds the MAX_WRITE_OPERATIONS_PER_HOUR limit"` 错误而失败。

当前代码中 `.catch(() => {})` 模式（见下方文件列表）会静默丢弃配额错误，对用户没有任何反馈。

## 涉及文件

每次 `chrome.storage.local.set()` 调用 __没有__ 检查配额错误：

- `src/chat/stores/chat.ts:279` — `_persistSetting` 使用 `.catch(() => {})` 静默丢弃所有错误
- `src/content/state/persistence.ts:30` — `persistPetState` 使用 `.catch(() => {})`
- `src/content/ipc/relay.ts:183-184` — `setRole` 和 `setColor` 持久化使用 `.catch(() => {})`  
- `src/content/ipc/relay.ts:194` — `setColor` 持久化使用 `.catch(() => {})`
- `src/shared/i18n/locale.ts:65` — 区域设置持久化使用 `.catch(() => {})`

## 修复方案

1. **在 manifest.json 中添加 `"unlimitedStorage"` 权限** — 与其他扩展权限一同添加。这消除了配额限制。
2. **实现存储饱满检测** — 在关键写入路径上，捕获 `chrome.runtime.lastError` 并检查错误消息中是否包含 `"quota"` 或 `"QUOTA"`：

```typescript
function persistSetting(key: string, value: unknown) {
  chrome.storage.local.set({ [key]: value }, () => {
    const err = chrome.runtime.lastError;
    if (err?.message) {
      if (err.message.includes('quota') || err.message.includes('QUOTA')) {
        console.warn('[YiPet] Storage quota exceeded — consider adding unlimitedStorage permission');
        // Optionally trigger cleanup of old per-URL states
      }
    }
  });
}
```

3. **实现基于 LRU 的逐出策略**，清理 `pet_state_by_url` 中的旧 URL 状态条目（最可能堆积的数据）。


## 影响范围

**影响模块**：5 个文件中的 `chrome.storage.local.set()` 调用。
**影响用户**：当存储配额超限时，用户偏好（角色、颜色主题、宠物大小）可能静默丢失。长期使用（积累大量会话元数据、URL 状态）的用户风险更高。
**影响范围**：所有依赖 `chrome.storage.local` 持久化的用户设置和状态。
## 预防措施

| 层面 | 措施 | 责任人 |
|------|------|--------|
| 代码 | 在 `manifest.json` 中添加 `unlimitedStorage` 权限 | 开发者 |
| 代码 | 创建 `safeStorage` 包装函数，集中处理配额错误和重试 | 开发者 |
| 代码 | 实现 LRU 淘汰策略，清理 `pet_state_by_url` 中的过期条目 | 开发者 |
| 监控 | 记录存储写入失败次数和原因 | DevOps |


## 经验教训

Chrome 扩展的存储配额限制（每项 10MB）在正常使用中通常足够，但应用应考虑极端场景——用户可能在数百个页面使用宠物，每个页面的状态累积可能超出配额。`unlimitedStorage` 权限是合理的请求，但即使有了无限配额，优雅的错误处理仍然是必需的。
