---
doc_type: module
prd_task_id: "YV-09-27"
title: "YV-09-27: 通知中心 — 开发方案"
status: 已完成
priority: 中
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-15
project: YiVad
prd_month: "202609"
estimate_frontend: 1.5
source_prd: "10-prd-通知中心.md"
---

# YV-09-27: 通知中心 — 开发方案

> 需求编号：YV-09-27 · 人天：1.5d

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

## 源码索引

| 文件 | 说明 | 文件路径 |
|------|------|------|
| `src/hooks/useNotificationSSE.ts` | 通知 SSE hook | `YiVad/src/hooks/useNotificationSSE.ts` |
| `src/stores/modules/notification.ts` | 通知 Pinia store | `YiVad/src/stores/modules/notification.ts` |
| `src/api/modules/notificationService.ts` | 通知 API 服务 | `YiVad/src/api/modules/notificationService.ts` |
| `src/components/notification/NotificationPanel.vue` | 通知面板 | `YiVad/src/components/notification/NotificationPanel.vue` |
| `src/components/notification/NotificationItem.vue` | 通知条目 | `YiVad/src/components/notification/NotificationItem.vue` |
| `src/components/notification/NotificationFilter.vue` | 通知筛选 | `YiVad/src/components/notification/NotificationFilter.vue` |
| `src/components/NotificationBell.vue` | 通知铃铛 | `YiVad/src/components/NotificationBell.vue` |
| `src/views/settings/NotificationPreferences.vue` | 通知偏好设置 | `YiVad/src/views/settings/NotificationPreferences.vue` |

---

<a id="sec-1"></a>
## 一、方案概述

统一通知中心，聚合系统通知（Issue 分配、Bug 状态变更、模块更新），Bell 图标 + 未读 Badge，支持标记已读/全部已读。

### 通知类型

| 类型 | 触发事件 | 内容 |
|------|---------|------|
| issue_assigned | Issue 分配给用户 | 「{谁} 将 {Issue} 分配给你」 |
| bug_status | Bug 状态变更 | 「Bug {标题} 已 {状态}」 |
| module_update | 模块进度更新 | 「{模块} 进度 {N}%」 |
| mention | @提及 | 「{谁} 在 {页面} 提到了你」 |

### 数据模型


*(见源码索引)*


### 实施步骤

| 步骤 | 内容 | 人天 |
|------|------|------|
| 1 | Notification 组件（Bell + 下拉列表 + Badge） | 0.5 |
| 2 | notificationService API + Store | 0.5 |
| 3 | 标记已读/全部已读 + 30s 轮询 | 0.5 |

**合计：1.5d**

---

<a id="sec-2"></a>
## 二、完成定义（DoD）

- [ ] Bell 图标 + 未读数字 Badge
- [ ] 通知列表渲染 + 点击跳转
- [ ] 标记已读/全部已读
- [ ] 30s 轮询新通知

---

## 实现记录

> 复核日期：2026-09-15 · 状态：已完成

### 源码产出

| 分类 | 文件数 | 内容 |
|------|--------|------|
| Hooks | 1 | 核心逻辑 composable
| Stores | 1 | Pinia 状态管理
| API | 1 | RPC 服务封装
| 组件 | 4 | Vue UI 组件
| 页面 | 1 | 页面视图
| **源码合计** | **8** | |

### 测试覆盖

| 分类 | 文件数 | 说明 |
|------|--------|------|
| Hook 测试 | 0 | 待补
| 组件测试 | 0 | 待补
| 工具测试 | 0 | —
| **测试合计** | **0** | |

### 缺口

| 自动化测试 | ⚠️ 全部待补 | 模块已实现但无专项测试文件 |
| Hook 测试 | 待补 | |
| 组件测试 | 待补 | |


## 架构总览

### 通知系统分层

```
┌──────────────────────────────────────────┐
│  NotificationBell (UI 层)                 │
│  Bell 图标 + Badge + 下拉面板              │
├──────────────────────────────────────────┤
│  useNotificationSSE (Hook 层)             │
│  SSE 连接 + 自动重连 + 消息解析            │
├──────────────────────────────────────────┤
│  notification store (Store 层)             │
│  通知 CRUD / 已读 / 优先级排序 / 偏好管理   │
├──────────────────────────────────────────┤
│  notificationService (API 层)             │
│  通知列表 / 标记已读 RPC 封装              │
└──────────────────────────────────────────┘
```

### SSE 连接生命周期

```
组件挂载 → connect() → EventSource("/notification/stream?token=")
  → onopen: connected=true, error=null
  → onmessage: JSON.parse → store.addNotification
  → onerror: 关闭 + 重连 (5s 间隔, 最多 10 次)
  → 10 次失败后: error="通知服务连接失败"

组件卸载 → disconnect() → EventSource.close()
```


## 关键决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 推送协议 | SSE (EventSource) | 单向推送，比 WebSocket 轻量，浏览器原生支持自动重连 |
| 未读数 | Pinia computed 派生 | 无需额外状态管理，数据变更自动更新 |
| 通知上限 | 100 条 FIFO | 防止内存无限增长 |
| 免打扰 | 时间段 + 类型过滤 | 双重控制，用户粒度精细 |
| 浏览器通知 | Web Notification API + 页面可见性检测 | 仅页面不可见时弹出，避免打扰 |



---

<a id="sec-gap"></a>
## 已知缺口与技术债

> 状态：已完成

### 功能缺口

| # | 缺口 | 影响 | 建议 |
|---|------|------|------|
| — | 无 | — | — |

### 技术债

| # | 技术债 | 优先级 | 预计人天 | 说明 | 状态 |
|---|--------|--------|---------|------|------|
| — | 无 | — | — | — | — |
