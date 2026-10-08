---
title: promptHistory存储键名不一致导致跨会话历史丢失
tags: [yipet, code-quality, storage, bug]
category: projects/yipet/bugs/code-quality
created: 2026-09-23
updated: 2026-09-23
source: YiPet
type: bug
status: resolved
severity: medium
priority: p1
---

# promptHistory 存储键名不一致导致跨会话历史丢失

## 现象

提示词历史（prompt history）在浏览器重启后无法恢复，每次启动扩展历史列表为空。用户通过 ArrowUp 无法回溯上次会话的提示词。

## 复现步骤

1. 打开 YiPet 聊天，发送几条消息
2. 在 Chrome 扩展管理页刷新扩展，或完全重启浏览器
3. 重新打开聊天，按 ArrowUp — 提示词历史为空

## 根因分析

两个独立 bug 共同导致提示词历史无法持久化：

### Bug 2a：存储键名前缀不匹配

`_persistSetting('promptHistory', ...)` 将数据写入 `chrome.storage.local` 的键 `yipet:promptHistory`（自动添加 `yipet:` 前缀）。

但 `_loadPersistedState()` 从 `chrome.storage.local` 读取键 `promptHistory`（无前缀）：

```typescript
// _persistSetting (line 361): 写入键 yipet:promptHistory
chrome.storage.local.set({ [`yipet:${key}`]: value });

// _loadPersistedState (line 376, 修复前): 读取键 promptHistory
chrome.storage.local.get(['promptHistory', ...])
```

读键与写键不匹配 → 永远读不到数据 → 每次启动都从空数组开始。

### Bug 2b：pushPromptHistory 双重序列化

`pushPromptHistory()` 对数组调用 `JSON.stringify()` 后再传给 `_persistSetting`：

```typescript
_persistSetting('promptHistory', JSON.stringify(arr));
```

`_persistSetting` 对非字符串值会自动 `JSON.stringify`。传入已序列化的字符串后：
- localStorage 路径：直接存储字符串（正确，恰好抵消）
- chrome.storage 路径：存储字符串而非数组

加载时 `Array.isArray(result[key])` 对字符串返回 false，导致历史无法恢复。

## 涉及文件

- `YiPet/src/chat/stores/chat.ts`:
  - `_loadPersistedState()` — 第 376 行：读键 `promptHistory` 应为 `yipet:promptHistory`
  - `pushPromptHistory()` — 第 1077 行：`JSON.stringify(arr)` 应为 `arr`

## 修复方案

**修复 2a**：将 `_loadPersistedState` 中的读键从 `'promptHistory'` 改为 `'yipet:promptHistory'`。

**修复 2b**：`pushPromptHistory` 传递原始数组给 `_persistSetting`，由其内部统一序列化：

```diff
- _persistSetting('promptHistory', JSON.stringify(arr));
+ _persistSetting('promptHistory', arr);
```

## Side Effects

- `removePromptHistoryAt` 和 `clearPromptHistory` 不受影响 — 它们传递的是数组，存储路径一致
- 修复后，已存在于 `yipet:promptHistory`（JSON 字符串格式）的旧数据可能因 `Array.isArray` 检查失败而无法加载。影响极小——旧数据本就是损坏的

## 验证

- `npm run typecheck` ✓
- `npm test` ✓（138/138）
- `npm run build` ✓