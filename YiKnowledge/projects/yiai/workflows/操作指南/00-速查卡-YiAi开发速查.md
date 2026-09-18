---
title: YiAi 开发速查卡
tags: [yiai, cheatsheet, quickref, rpc, commands, error-codes]
category: projects/yiai/workflows
created: 2026-09-15
updated: 2026-09-15
source: internal
type: reference
status: stable
lifecycle: active
review_cycle: monthly
roles: [engineer]
benefit: "YiAi 日常开发最常用的命令、格式和参数速查——一页覆盖 80% 的开发场景"
---

# YiAi 开发速查卡

> **读完你将能够**：YiAi 日常开发最常用的命令、格式和参数速查——一页覆盖 80% 的开发场景

> 日常开发最常用的 RPC 格式、curl 命令、参数名和错误码。

## RPC 信封

```json
POST / {
  "module_name": "services.database.data_service",
  "method_name": "query_documents",
  "parameters": { "cname": "projects", "filter": {"status": "active"}, "pageNum": 1, "pageSize": 20 }
}
// → { "code": 0, "message": "ok", "data": { "list": [...], "total": N } }
```

## 关键参数名（写错会静默失败）

| 正确 | 错误 | 后果 |
|------|------|------|
| `filter` | `query` | 后端静默忽略，返回全部数据 |
| `target_file` | `path` | 后端返回 422 |
| `cname` | `collection_name` | 后端返回 422 |

## 常用 curl 命令

```bash
# 健康检查
curl http://localhost:10086/health

# 查询数据（RPC）
curl -X POST http://localhost:10086/ \
  -H "Content-Type: application/json" \
  -d '{"module_name":"services.database.data_service","method_name":"query_documents","parameters":{"cname":"projects","pageNum":1,"pageSize":10}}'

# 创建数据
curl -X POST http://localhost:10086/ \
  -H "Content-Type: application/json" \
  -d '{"module_name":"services.database.data_service","method_name":"create_document","parameters":{"cname":"projects","data":{"name":"test","status":"active"}}}'

# AI 聊天（SSE）
curl -N -X POST http://localhost:10086/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"hello"}],"session_id":"test"}'

# Agent 确认工具调用
curl -X POST http://localhost:10086/agent/confirm \
  -H "Content-Type: application/json" \
  -d '{"session_id":"...","confirmation_id":"t0:tool_1","approve":true}'

# RAG 检索
curl -X POST http://localhost:10086/rag-query \
  -H "Content-Type: application/json" \
  -d '{"query":"RPC协议","top_k":3}'

# 读取文件
curl -X POST http://localhost:10086/read-file \
  -H "Content-Type: application/json" \
  -d '{"target_file":"YiKnowledge/README.md"}'

# 查看 API 文档
open http://localhost:10086/docs
```

## 错误码速查

| code | 含义 | 常见原因 |
|------|------|---------|
| 0 | 成功 | — |
| 1001 | 参数验证失败 | 缺少必填字段、类型不匹配 |
| 1002 | 资源不存在 | 查询/更新不存在的 key |
| 2001 | AI 服务不可用 | Ollama 未启动或模型未加载 |
| 2002 | AI 推理超时 | LLM 调用超时 |
| 3001 | 文件读写失败 | 磁盘 I/O 错误、路径无效 |
| 4001 | 认证失败 | Token 无效或过期 |
| 5001 | 数据库错误 | MongoDB 连接失败 |

## 端口与服务

| 服务 | 端口 | 启动命令 |
|------|------|---------|
| YiAi | 10086 | `cd YiAi && python main.py` |
| YiVad | 8848 | `cd YiVad && pnpm dev` |
| MongoDB | 27017 | `mongod --dbpath ./data` |
| Ollama | 11434 | `ollama serve` |

## 开发检查清单

```bash
# 提交前必做
ruff check src/              # 代码检查
python -m pytest tests/ -v   # 测试
grep -rn '"query"' src/api/  # 前端参数名审查（应为 filter）

# 验证服务
curl http://localhost:10086/health
curl http://localhost:11434/api/tags  # Ollama
mongosh --eval "db.runCommand({ping:1})"  # MongoDB
```

## 新增模块步骤速记

```
domain/<name>/__init__.py + core.py  →  services/<name>_service.py  →  server/routes/<name>.py
       ↓                                      ↓                              ↓
  业务逻辑 + 数据访问                    参数校验 + 编排                   HTTP 路由 + 响应
```

## 常用 RPC 方法

| 方法 | 用途 |
|------|------|
| `data_service.query_documents` | 分页查询 |
| `data_service.create_document` | 创建文档 |
| `data_service.update_document` | 更新文档 |
| `data_service.delete_document` | 删除文档 |
| `chat_service.chat` | AI 聊天（SSE 流） |
| `rag_service.query` | RAG 检索 |
| `knowledge_service.write_entry_markdown` | 写入知识条目 |

## 文件操作

```bash
# 读文件（必须用 target_file，非 path）
curl -X POST http://localhost:10086/read-file \
  -d '{"target_file":"path/to/file.md"}'

# 写文件
curl -X POST http://localhost:10086/write-file \
  -d '{"target_file":"path/to/file.md","content":"# Title\n\ncontent"}'
```

## SSE 事件类型

| 事件 | 说明 |
|------|------|
| `turn_start` | 新一轮开始 |
| `tool_call` | LLM 发起工具调用 |
| `confirmation_required` | 写操作待确认（120s 超时自动拒绝） |
| `tool_execution_start/end` | 工具执行/完成 |
| `turn_end` | 本轮结束 |
| `agent_end` | Agent 终止（stop_reason: completed/max_turns/stopped/error） |

## 目录速查

| 目录 | 职责 |
|------|------|
| `src/server/routes/` | HTTP 路由 |
| `src/services/` | 业务编排 |
| `src/domain/` | 核心业务逻辑 |
| `src/data/` | MongoDB 操作 |
| `src/shared/` | 配置/响应/错误码 |
| `tests/` | pytest 测试 |