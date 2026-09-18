---
doc_type: module
prd_task_id: "YP-08-03"
title: "YP-08-03: IPC 通信架构增强 — 开发方案"
status: 已完成
priority: P0
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiPet
project_id: yipet
prd_month: "202608"
source_prd: "07-架构设计-IPC通信架构.md"
---

# YP-08-03: IPC 通信架构增强 — 开发方案

> 需求编号：YP-08-03 · 优先级：P0

---

## 一、方案概述

增强 ISOLATED↔MAIN↔Service Worker 三向 IPC 通信：消息类型安全、超时重试、心跳保活。

```mermaid
flowchart LR
  MAIN["MAIN World"] -->|"postMessage<br/>IPC_SECRET"| ISO["ISOLATED World"]
  ISO -->|"chrome.runtime.sendMessage"| SW["Service Worker"]
  SW -->|"chrome.tabs.sendMessage"| ISO
  ISO -->|"CustomEvent"| MAIN
```

### 增强项

| 增强 | 说明 |
|------|------|
| 消息类型安全 | TypeScript 联合类型约束 action+payload |
| 超时重试 | sendMessage 3s 超时→重试 3 次 |
| 心跳保活 | SW 每 20s ping 防止空闲终止 |
| 消息队列 | SW 休眠期间消息排队，唤醒后批量发送 |

### 实施步骤

| 步骤 | 内容 |
|------|------|
| 1 | 消息类型系统 (TypeScript 联合类型) |
| 2 | 超时重试 + 心跳保活 |
| 3 | 消息队列 + SW 唤醒恢复 |