---
title: YiAi Onboarding — Day 1 Quick Start
tags: [onboarding, yiai, setup, quick-start]
category: engineer/run/onboarding
created: 2026-08-21
updated: 2026-09-10
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "New YiAi engineers set up their dev environment and understand the backend architecture within the first day"
acceptance_criteria:
  - "Setup steps verified working"
  - "Key architectural concepts explained"
  - "Common gotchas documented"
  - "Day-1 task checklist included"
related:
  - ./README.md
  - ./03-入职-YiVad入职.md
  - ../../../../YiAi/CLAUDE.md
  - ../../learn/projects/yiai/README.md
---

# YiAi 入职指南 —— 第一天快速上手

> **目标**：在第一天结束时，你能够本地运行 YiAi、理解架构分层、追踪从 RPC 信封到 MongoDB 的完整请求链路。

## 前置条件

- Python 3.10+（推荐使用 pyenv 管理版本）
- MongoDB（本地安装或 Docker：`docker run -d -p 27017:27017 mongo`）
- Ollama（用于 LLM 推理，如果使用云 API 则可选）
- pip（Python 包管理器）

## 环境搭建（预计 30 分钟）

```bash
cd YiAi

# 安装 Python 依赖
pip install -r requirements.txt

# 确保 MongoDB 运行在 localhost:27017
# macOS: brew services start mongodb-community
# Docker: docker run -d --name mongo -p 27017:27017 mongo

# 确保 Ollama 运行（如需本地 AI 功能）
# ollama serve

# 启动 YiAi 开发服务器
python main.py
# 服务启动在 http://localhost:10086
```

### 验证环境是否正常

```bash
# 检查服务是否响应
curl http://localhost:10086/health/observer
# 预期输出: {"status": "ok", "mongodb": "connected", "ollama": "available"}

# 测试 RPC 端点
curl -X POST http://localhost:10086/ \
  -H "Content-Type: application/json" \
  -d '{"module_name": "services.database.data_service", "method_name": "query_documents", "parameters": {"cname": "menus", "pageSize": 5}}'
# 预期输出: {"code": 0, "message": "ok", "data": {"list": [...], "total": N}}
```

### 常见启动问题排查

| 问题 | 原因 | 解决方案 |
|---|---|---|
| `ModuleNotFoundError: No module named 'xxx'` | 依赖未安装或版本不匹配 | 重新运行 `pip install -r requirements.txt` |
| `pymongo.errors.ServerSelectionTimeoutError` | MongoDB 未运行 | 启动 MongoDB：`brew services start mongodb-community`（macOS）或 `docker start mongo` |
| `ollama._types.ResponseError: model not found` | Ollama 模型未下载 | 运行 `ollama pull qwen3.5:4b` 下载模型 |
| `Address already in use: 10086` | 端口被占用 | 检查是否有其他 YiAi 实例在运行，或修改 `config.yaml` 中的端口 |
| 启动后 RPC 返回空结果 | 种子数据未导入 | 首次启动会自动导入种子数据（`src/data/seeds/`）。重启 YiAi 等待 seeds 导入完成 |
| macOS FSEvents 问题 | 知识库监听器使用轮询替代 FSEvents（已知问题，无需处理） | 正常行为：YiAi 使用 apscheduler 每 60 秒轮询 YiKnowledge 目录 |

## 架构概览

先阅读项目 [YiAi/CLAUDE.md](../../../../YiAi/CLAUDE.md)。以下是关键概念：

| 概念 | 是什么 | 在哪里 |
|---|---|---|
| Domain 层 | 业务逻辑——每个 domain 拥有自己的逻辑，与传输层无关 | `src/domain/{ai,files,knowledge,rag,rss,state,wework,execution,auth}/` |
| Service 层 | 封装 domain 供 routes 调用——routes 不能直接访问 data/ | `src/services/{ai,database,execution,knowledge,rag,rss,storage}/` |
| Data 层 | MongoDB 单例（Motor 异步客户端）+ Repository | `src/data/database.py`、`src/data/repository.py` |
| RPC 信封 | 跨项目统一协议：`{module_name, method_name, parameters}` | `src/app.py` 根路由处理器 |
| 知识库监听器 | apscheduler 轮询 YiKnowledge 目录树 → MongoDB + RAG 索引 | `src/domain/knowledge/watcher.py` |
| RAG 引擎 | llama_index 混合检索（向量 + BM25）+ LLM 重排序 | `src/domain/rag/engine.py` |
| Agent 循环 | 多轮工具调用 Agent，带确认门控和模型切换 | `src/domain/ai/agent.py` |

### 分层数据流

```
YiVad/YiPet POST / → body: {module_name, method_name, parameters}
  ↓
FastAPI 根路由处理器 (src/app.py)
  ↓
解析 module_name → Python 模块路径
  ↓
解析 method_name → 可调用对象
  ↓
service.<domain>.<service>.<method>(**parameters)
  ↓
domain 业务逻辑层
  ↓
data/repository.py → MongoDB (Motor async)
  ↓
响应: {code: 0, message: "ok", data: <any>}
```

## 模块边界

Domain 包外部的每个调用者只依赖公开的 API 面：

| 模块 | 公开 API | 内部文件（禁止导入） |
|---|---|---|
| `domain/ai/` | `chat.py`、`agent.py`、`data_tools.py`、`tools.py` | — |
| `domain/files/` | `__init__.py` re-export `read_file`、`write_file` 等 | `local.py`、`storage.py`、`paths.py` |
| `domain/knowledge/` | `scanner.py`、`watcher.py`、`writer.py` | — |
| `domain/rag/` | `engine.py`、`indexer.py`、`settings.py` | — |

## 关键陷阱

1. **`_build_filter` 读取的是 `filter` 而非 `query`** —— 调用方在 parameters 中使用 `query` 时会被**静默忽略**。始终使用 `filter`。这是 YrY 中最常见的跨项目 Bug 模式。
2. **Pydantic 模型要求 `target_file` 而非 `path`** —— `FileReadRequest` 和 `FileWriteRequest` 的字段名是 `target_file`。使用 `path` 返回 HTTP 422。
3. **macOS FSEvents 在此机器上静默丢弃事件** —— 知识库监听器使用 apscheduler 轮询（60 秒间隔），而非 FSEvents。不要用 watchdog 替换它。
4. **Routes 不能直接调用 `data/`** —— 必须通过 `services/` 层。Domain 包不能导入 `server/`。这是分层的铁律。
5. **MongoDB 是唯一的故障单点** —— 当 MongoDB 不可达时，所有功能不可用。没有缓存层。降级策略文档已记录此情况但没有自动化恢复。

## 第一天任务清单

- [ ] 运行 `python main.py` 并验证 `http://localhost:10086/health/observer` 正常响应
- [ ] 阅读 `YiAi/CLAUDE.md`（约 30 分钟）——理解模块边界、约束和近期变更
- [ ] 打开 `src/app.py`，追踪根路由处理器（RPC 信封的 module_name/method_name 解析逻辑）
- [ ] 打开 `src/data/database.py`，理解 MongoDB 单例模式（Motor async 客户端）
- [ ] 打开 `src/domain/ai/chat.py`，理解聊天流式结构（SSE 生成器）
- [ ] 打开 `src/domain/knowledge/watcher.py`，理解 apscheduler 轮询循环
- [ ] 做一个小改动：在任意 route handler 中添加一行 `logger.info("Hello YiAi")`，重启后验证日志中出现该行
- [ ] 阅读跨项目 RPC 协议：`YiKnowledge/engineer/build/cross-project-rpc-protocol.md`
- [ ] 运行测试：`python -m pytest tests/ -v` 确保全部通过

## 后续学习

- [YiAi 工程文档](../../learn/projects/yiai/01-项目-架构设计.md) —— 深层架构、反模式、操作建议
- [YiAi CLAUDE.md](../../../../YiAi/CLAUDE.md) —— 模块边界、约束、近期变更的权威参考
- [跨项目 RPC 协议](../../build/cross-project-rpc-protocol.md) —— 完整的 API 契约