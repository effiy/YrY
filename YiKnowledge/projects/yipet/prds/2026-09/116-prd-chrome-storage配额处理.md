---

doc_type: module
prd_id: "YP-09-116"
title: "YP-09-116: chrome.storage 配额超限优雅降级 — 静默失败改为用户可感知的降级策略"
status: in_progress
priority: P1
owner: unassigned
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"
tags: [storage, quota, reliability, planned]
related_tasks: ["116-prd-task-storage配额处理.md"]
related_tests: ["116-prd-test-storage配额处理.md"]
related_modules: ["chat/stores/chat.ts", "content/state/persistence.ts", "shared/storage/state.ts"]

type: 需求
---

# YP-09-116: chrome.storage 配额超限优雅降级

> **PRD 版本**：v1.0 · **状态**：planned（待排期）

---

## 1. 背景

YiPet 大量使用 `chrome.storage.local` 持久化聊天会话（含消息、页面内容、上下文文件）。`chrome.storage.local` 有 10MB 配额限制（unlimited 权限可扩展至浏览器磁盘空间的 10%）。当前代码在存储写入失败时静默忽略错误（`catch { /* ignore */ }`），无用户提示、无降级策略、无清理机制。

## 2. 涉及模块

```
chat/stores/chat.ts           — persistActive (会话消息), _persistSetting (用户设置)
content/state/persistence.ts  — persistPetState (宠物状态)
shared/storage/state.ts       — setTabState (标签页状态)
```

所有模块的存储写入均使用 `try { await chrome.storage.local.set(...) } catch {}` 模式——写入失败时用户无感知。

## 3. 用户问题

- **目标用户**：长期使用 + 大量会话的用户（>100 个会话）
- **问题陈述**：存储配额用尽时，新消息无法保存，但用户毫不知情。下次打开浏览器发现最近的对话全部丢失
- **证据**：中证据 — 代码审查确认所有存储写入无配额检查；低流量项目暂无用户报告

### 数据量估算

| 数据类型 | 单条大小 | 100 会话 | 500 会话 |
|----------|---------|---------|---------|
| 会话元数据 | ~1KB | 100KB | 500KB |
| 消息内容 | ~10KB/会话 | 1MB | 5MB |
| 页面上下文 | ~5KB/会话 | 500KB | 2.5MB |
| **合计** | | **~1.6MB** | **~8MB** |

默认 10MB 配额下，约 500–600 个活跃会话会触发配额超限。

## 4. 解决方案

### 4.1 配额检测

```typescript
async function checkQuota(): Promise<{ used: number; available: number }> {
  const bytes = await chrome.storage.local.getBytesInUse();
  return { used: bytes, available: chrome.storage.local.QUOTA_BYTES - bytes };
}
```

### 4.2 三级降级策略

| 级别 | 触发阈值 | 措施 |
|------|---------|------|
| 1. 通知 | 使用 > 70% | `notify('Storage 70% full')`，建议清理旧会话 |
| 2. 自动清理 | 使用 > 90% | 自动归档最旧 20% 会话到 IndexedDB，chrome.storage 仅保留元数据 |
| 3. 硬限制 | 写入失败 | 通知用户 + 拒绝新会话创建 + 提供导出选项 |

### 4.3 存储分层

```
chrome.storage.local (快速，10MB)
  └── 最近 50 个会话的完整消息

IndexedDB (大容量，磁盘)
  └── 归档会话（消息 + 页面内容）
```

## 5. 成功标准

| 指标 | 目标 |
|------|------|
| 配额检测 | `getBytesInUse()` 在所有写操作前调用 |
| 用户感知 | 配额 >70% 时弹出通知 |
| 自动清理 | 归档会话可在侧边栏恢复 |
| 类型检查 | 0 error |
| 回归测试 | 138/138 |

## 6. 工作量

| 阶段 | 工作量 | 内容 |
|------|--------|------|
| 配额检测 + 通知 | 0.5d | `checkQuota` + `notify` |
| IndexedDB 归档层 | 1d | 读写 + 迁移 + 恢复 UI |
| 测试 | 0.5d | 配额 mock + 集成测试 |
| **总计** | **2d** | |