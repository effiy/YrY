---
prd_task_id: "YV-09-46"
title: "YV-09-46: 实时协作光标与状态 — 开发方案"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiVad
prd_month: "202609"
estimate_frontend: 0
source_prd: "21-prd-实时协作光标与状态.md"
type: task
category: projects/yivad/devs
source: YiVad
tags: [yivad, dev, 实时协作光标与状态]
benefit: "开发方案：task-实时协作光标与状态"
lifecycle: active
---

# YV-09-46: 实时协作光标与状态 — 开发方案

> 需求编号：YV-09-46 · 状态：待开始 · 此功能为未来规划

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

<a id="sec-1"></a>
## 一、方案概述

多用户同时在线时，显示其他用户的编辑光标位置和在线状态（类似 Google Docs/Notion）。

### 核心技术

| 技术 | 用途 |
|------|------|
| WebSocket | 实时广播光标位置和编辑操作 |
| Presence 状态 | 在线/离线/正在编辑 |
| 光标渲染 | 远程用户在文档中的位置指示 |

### 实施前置条件

- [ ] YiAi 后端 WebSocket 服务部署
- [ ] Presence 服务实现
- [ ] 并发编辑 OT/CRDT 算法选型

> 当前阶段：待后端基础设施就绪后启动开发。

### 架构方案

**技术路线**：WebSocket 连接管理封装为 `usePresence` composable，光标位置和编辑状态通过 YiAi WebSocket 端点广播

**数据模型**：
```
WebSocket 消息格式：
  type: 'presence' | 'cursor_move' | 'edit_start' | 'edit_end'
  payload: { user: { id, name, avatar }, position?: { line, col }, file_path }
```

**组件树**：
```
CollabPresence.vue (全局 Provider)
├── RemoteCursor.vue (远程光标渲染 — 绝对定位的彩色光标标签)
├── PresenceAvatars.vue (在线用户头像列表)
└── usePresence.ts (WebSocket 连接 + 心跳 + 状态管理)
```

**关键决策**：
- 光标同步频率：本地每 100ms 节流发送一次光标位置，减少 WebSocket 消息量
- 连接断开重连：指数退避（1s → 2s → 4s → 最大 30s），重连后全量同步 Presence 状态
- 本地光标 vs 远程光标：本地光标使用浏览器原生 caret，远程光标渲染为彩色标签（绝对定位 + user color）

---

<a id="sec-gap"></a>
## 已知缺口与技术债

> 状态：待开始

### 功能缺口

> 功能尚未进入实现阶段，详细缺口将在开发启动时评估和记录。

### 技术债

> 技术债将在首次实现时识别和记录。
