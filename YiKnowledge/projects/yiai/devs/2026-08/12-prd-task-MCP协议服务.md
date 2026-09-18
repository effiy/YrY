---
doc_type: module
prd_task_id: "YA-08-12"
title: "YA-08-12: MCP 协议服务 — FastMCP 工具代理 + Claude Code 集成 — 开发方案"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiAi
project_id: yiai
prd_month: "202608"
estimate_frontend: 1.0
source_prd: "12-需求-MCP协议服务.md"
source_okr: [yiai-003]
related_tests: ["12-prd-test-MCP协议服务"]
---

# YA-08-12: MCP 协议服务 — FastMCP 工具代理 + Claude Code 集成 — 开发方案

> 来源 PRD：[12-需求-MCP协议服务.md](../../prds/2026-08/12-需求-MCP协议服务.md)
> 需求编号：YA-08-12 · 优先级：P2 · 人天：1.0d
> 类型：功能 · 状态：已完成

---

## 一、方案概述

通过 MCP (Model Context Protocol) 将 YiAi 的 RPC 方法暴露为外部 AI 工具。Claude Code 等客户端通过 MCP 协议调用 YiAi 的数据查询、文件操作、知识检索等能力。

```mermaid
flowchart LR
  CC["Claude Code"] -->|"MCP 协议"| MCP["server/mcp_server.py<br/>FastMCP 服务器"]
  MCP -->|"代理"| RPC["现有 RPC 方法"]
  RPC --> SVC["服务层"]
```

### 职责

| 组件 | 文件 | 职责 |
|------|------|------|
| MCP 服务器 | `server/mcp_server.py` | FastMCP 实例化 + 工具注册 |
| MCP 路由 | `server/routes/mcp.py` | REST 端点（SSE transport） |
| 挂载 | `app.py` | 在 StaticFiles 之前挂载，避免路由冲突 |

---

## 二、实施步骤

| 步骤 | 内容 | 验证 | 人天 |
|------|------|------|------|
| 1 | FastMCP 服务器初始化 + 工具注册 | MCP 工具发现成功 | 0.5 |
| 2 | SSE transport + 路由挂载 | Claude Code 可调用工具 | 0.25 |
| 3 | 测试 | MCP 工具列表 + 调用验证 | 0.25 |

**合计：1.0d**。

---

## 三、关联模块

- 代理：[YA-07-04 AI 聊天服务](../2026-07/04-prd-task-AI聊天服务.md)
- 代理：[YA-07-01 混合检索引擎](../2026-07/01-prd-task-混合检索引擎.md)
- 消费：[YA-08-13 Agent 工具系统](./13-prd-task-Agent工具系统.md)——MCP 工具发现