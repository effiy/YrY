---
title: chrome.storage配额无检测机制—存储写满时静默丢失数据
tags: [yipet, storage, quota, reliability]
category: projects/yipet/bugs/2026-09/代码质量
created: 2026-09-23
updated: 2026-09-23
source: YiPet
type: bug
status: resolved
severity: medium
priority: p1
---

# chrome.storage 配额无检测机制导致存储写满时静默丢失数据

## 现象

所有 `chrome.storage.local.set()` 调用均使用 `try { ... } catch {}` 模式静默忽略写入失败。当配额用尽（10MB 默认上限），会话消息无法保存，用户无任何提示，重新打开浏览器发现最近的对话全部丢失。

## 根因分析

YiPet 大量使用 `chrome.storage.local` 存储聊天数据。估算 500+ 活跃会话可达 8MB。代码中无任何配额检测或用户通知机制——所有写入失败均静默丢弃。

## 涉及文件

- `YiPet/src/chat/stores/chat.ts` — `persistActive` 等 6+ 处存储写入
- `YiPet/src/content/state/persistence.ts` — `persistPetState`
- `YiPet/src/shared/storage/state.ts` — `setTabState`

## 修复方案

### Phase 1 (已实施)

新增 `src/shared/storage/quota.ts`——配额检测工具模块：

- `checkStorageQuota()` — 使用 `chrome.storage.local.getBytesInUse()` 获取实时使用量
- `warnIfQuotaLow(pct)` — 阈值 70% 时触发回调通知

在 `persistActive` 每次成功保存后异步检测配额。

### Phase 2–3 (planned)

IndexedDB 归档层 + 自动清理，见 PRD 116。

## 验证

- `npm run typecheck` ✓
- `npm test` ✓（138/138）
- `npm run build` ✓