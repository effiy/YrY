---
title: content/ipc/relay.ts 中持久化 petRole 使用无限制的 set
tags: [yipet, code-quality, storage-management]
category: projects/yipet/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiPet
type: bug
status: resolved
severity: trivial
priority: p3
---

# content/ipc/relay.ts 中持久化 petRole 使用无限制的 set

## 现象

`content/ipc/relay.ts:183,194` 在每次角色或颜色主题变更时直接写入 `chrome.storage.local`，无去重检查：

```typescript
// relay.ts:183 — 每次角色变更都写入
chrome.storage.local.set({ petRole: _petRole }).catch(...);

// relay.ts:194 — 每次颜色变更都写入
chrome.storage.local.set({ petColorTheme: _petColor }).catch(...);
```

如果用户快速切换颜色主题（连续点击色块），会触发多次 `chrome.storage.local.set` 调用。虽然 Chrome 会将连续的 set 合并，但无去重意味着不必要的 IPC 开销。

## 根因分析

- 全局状态变更直接写入 storage，无防抖或去重
- `_petColor` 和 `_petRole` 是全局变量，变更频率低但无保护

## 涉及文件

- `src/content/ipc/relay.ts:183,194` — 无去重的 storage 写入

## 修复方案

添加去重检查：仅在值变化时写入：
```typescript
if (_petRole !== lastPersistedRole) {
  chrome.storage.local.set({ petRole: _petRole }).catch(...);
  lastPersistedRole = _petRole;
}
```


## 影响范围

**影响模块**：`chrome.storage.local.set()` 的调用逻辑。
**影响用户**：短时间内多次写入相同的值会消耗不必要的存储配额和 I/O，在频繁状态切换场景下（如拖拽调整宠物大小）可能触发 Chrome 的写入速率限制。
**影响范围**：所有通过 `chrome.storage.local` 进行状态持久化的模块。
## 预防措施

| 层面 | 措施 | 责任人 |
|------|------|--------|
| 代码 | 写入前检查值是否真的发生了变化（与缓存值比较） | 开发者 |
| 代码 | 高频写入场景（如拖拽）使用防抖，操作结束后一次性写入 | 开发者 |
| 代码 | 实现 dirty flag 模式——仅在值确实改变时才标记需要持久化 | 开发者 |
| 性能 | 监控 `chrome.storage.local.set()` 的调用频率 | DevOps |


## 经验教训

Chrome 对 `storage.local.set()` 有写入速率限制（MAX_WRITE_OPERATIONS_PER_HOUR）。在高频操作场景下（如拖拽、滚动），每次微小变化都写入存储是不必要的——应使用防抖或脏标记模式，在操作结束后一次性写入。
