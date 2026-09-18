---
doc_type: test
title: "YA-08-12: MCP 协议服务 — 测试规格"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-16
project: YiAi
project_id: yiai
prd_month: "202608"
prd_task_id: "YA-08-12"
source_prds: ["12-需求-MCP协议服务"]
source_modules: ["12-prd-task-MCP协议服务"]
source_okr: [yiai-003]
---

# YA-08-12: MCP 协议服务 — 测试规格

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-MCP-01 | 工具发现 `list_tools` | 返回已注册工具列表（含描述+参数 schema） |
| UT-MCP-02 | 工具调用 `call_tool` | RPC 方法被代理调用 → 返回结果 |
| UT-MCP-03 | SSE transport | 客户端通过 SSE 接收工具调用结果 |
| UT-MCP-04 | 未知工具→错误 | `call_tool("nonexistent")` → error |

---