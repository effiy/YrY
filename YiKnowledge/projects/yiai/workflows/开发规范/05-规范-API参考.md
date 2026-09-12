---
title: API 参考
tags: [yiai, api, reference, routes, endpoints, rest, rpc]
category: projects/yiai/specs
created: 2026-09-08
updated: 2026-09-10
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: monthly
roles: [engineer]
benefit: 完整 API 端点参考——16 个路由模块、REST + RPC 端点、配置参考
---

# YiAi API Reference

> 完整的 API 端点参考——16 个路由模块，RPC 信封 + REST 端点。

## 路由模块总览

| 模块 | 路由文件 | 用途 |
|------|----------|------|
| About | `routes/about.py` | 服务信息 |
| Auth | `routes/auth.py` | 认证（登录/登出） |
| Dashboard | `routes/dashboard.py` | 仪表盘数据 |
| Execution | `routes/execution.py` | 通用 RPC 信封执行（`POST /`） |
| Files | `routes/files.py` | 文件读写/上传/删除/重命名 |
| Health | `routes/health.py` | 健康检查 |
| Knowledge | `routes/knowledge.py` | 知识库扫描/读取/写入 |
| MCP | `routes/mcp.py` | MCP 协议端点 |
| Maintenance | `routes/maintenance.py` | 系统维护 |
| OpenAI Compat | `routes/openai_compat.py` | OpenAI API 兼容端点 |
| RAG | `routes/rag.py` | RAG 检索增强生成 |
| Search | `routes/search.py` | 全局搜索 |
| State | `routes/state.py` | 状态存储 CRUD |
| System | `routes/system.py` | 系统管理 |
| Users | `routes/users.py` | 用户管理 |
| WeWork | `routes/wework.py` | 企业微信消息推送 |

## RPC 信封（通用入口）

所有 `services.*` 调用通过 `POST /` 路由：

```
POST /  Content-Type: application/json
{
  "module_name": "services.<domain>.<service>",
  "method_name": "<method>",
  "parameters": { ... }
}
```

### 已注册的服务方法

| 模块路径 | 方法 | 说明 |
|----------|------|------|
| `services.database.data_service` | `query_documents` | 查询文档（分页/排序/过滤） |
| | `get_document_detail` | 获取单个文档详情 |
| | `count_documents` | 统计文档数（支持分组聚合） |
| | `create_document` | 创建文档 |
| | `update_document` | 更新文档 |
| | `upsert_document` | 创建或更新文档（upsert） |
| | `delete_document` | 删除文档 |
| `services.ai.chat_service` | `chat` | AI 聊天（SSE 流式） |
| `services.knowledge.knowledge_service` | `write_entry_markdown` | 写入知识条目 markdown |
| | `delete_entry_markdown` | 删除知识条目 |
| | `entry_exists` | 检查条目是否存在 |
| | `list_bugs` | 列出缺陷报告 |
| | `read_bug` | 读取缺陷报告 |
| | `list_stories` | 列出故事 |
| | `read_story` | 读取故事 |
| `services.rag.rag_service` | `query` | RAG 检索查询 |
| | `status` | 获取 RAG 索引状态 |
| | `rebuild` | 重建 RAG 索引 |
| `services.audit.audit_service` | `query_audit_logs` | 查询审计日志 |
| `services.code_health_service` | `analyze` | 代码健康分析 |
| `services.rss.feed_service` | `*` | RSS 订阅管理 |

## REST 端点

### Files（`/read-file`, `/write-file`, ...）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/read-file` | 读取文件（`target_file`） |
| POST | `/write-file` | 写入文件（`target_file`, `content`, `is_base64?`） |
| POST | `/delete-file` | 删除文件 |
| POST | `/delete-folder` | 删除文件夹 |
| POST | `/rename-file` | 重命名文件 |
| POST | `/rename-folder` | 重命名文件夹 |
| POST | `/read-project-file` | 读取项目文件 |
| POST | `/write-project-file` | 写入项目文件 |
| POST | `/delete-project-folder` | 删除项目文件夹 |
| POST | `/rename-project-folder` | 重命名项目文件夹 |
| POST | `/upload` | 上传文件 |
| POST | `/upload-image-to-oss` | 上传图片到 OSS（`data_url`, `filename`, `directory`） |

### Knowledge（`/knowledge-*`）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/knowledge-scan` | 扫描知识库目录树 |
| POST | `/knowledge-read` | 读取知识文件内容 |
| POST | `/knowledge-stories` | 列出入门故事 |
| POST | `/knowledge-story-read` | 读取故事内容 |
| POST | `/knowledge-bugs` | 列出缺陷报告 |
| POST | `/knowledge-bug-read` | 读取缺陷报告内容 |
| POST | `/knowledge-files` | 列出知识文件 |
| POST | `/knowledge-sync` | 同步知识库 |
| POST | `/knowledge-write` | 写入知识文件 |
| POST | `/knowledge-delete` | 删除知识文件 |
| POST | `/knowledge-search` | 搜索知识文件 |
| POST | `/knowledge-export` | 导出知识文件 |

### RAG（`/rag-*`）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/rag-query` | RAG 检索查询 |
| POST | `/rag-status` | 获取 RAG 索引状态 |
| POST | `/rag-build` | 构建/重建 RAG 索引 |
| POST | `/rag-categories` | 获取知识类别 |
| POST | `/rag-chat` | RAG 对话（SSE 流式） |
| POST | `/rag-decompose` | 子问题分解 |
| POST | `/rag-file-query` | 文件级 RAG 检索 |
| POST | `/rag-file-chat` | 文件级 RAG 对话（SSE 流式） |
| POST | `/rag-history` | 获取 RAG 检索历史 |
| POST | `/rag-history-clear` | 清除 RAG 检索历史 |
| POST | `/rag-chat-history` | 获取 RAG 对话历史 |
| POST | `/rag-chat-history-clear` | 清除 RAG 对话历史 |
| POST | `/chat-sessions` | 列出聊天会话 |
| POST | `/chat-session-load` | 加载聊天会话 |
| POST | `/chat-session-delete` | 删除聊天会话 |

### Auth & Users

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/login` | 用户登录 |
| POST | `/logout` | 用户登出 |
| GET | `/menu/list` | 获取菜单列表 |
| GET | `/buttons` | 获取按钮权限映射 |

### Users

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/users/list` | 用户列表（分页） |
| POST | `/users/tree` | 用户树 |
| POST | `/users` | 创建用户 |
| PUT | `/users/{key}` | 更新用户 |
| DELETE | `/users/{key}` | 删除用户 |

### State Store

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/state/records` | 列出状态记录 |
| GET | `/state/records/{key}` | 获取单个状态记录 |
| POST | `/state/records` | 创建状态记录 |
| PUT | `/state/records/{key}` | 更新状态记录 |
| DELETE | `/state/records/{key}` | 删除状态记录 |

### System

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/system/menus` | 列出菜单 |
| POST | `/system/menus` | 创建菜单 |
| PUT | `/system/menus/{key}` | 更新菜单 |
| DELETE | `/system/menus/{key}` | 删除菜单 |
| GET | `/system/scheduler` | 调度器状态 |

### WeWork

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/wework/send-message` | 发送企业微信消息 |

### 其他

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/health` | 健康检查 |
| GET | `/about` | 服务信息 |
| GET | `/mcp/*` | MCP 协议端点 |
| GET | `/search` | 全局搜索 |
| GET | `/dashboard/*` | 仪表盘数据 |
| POST | `/maintenance/*` | 系统维护 |
| POST | `/v1/chat/completions` | OpenAI 兼容聊天端点 |

## 配置参考（config.yaml）

| 配置段 | 关键字段 | 默认值 |
|--------|----------|--------|
| `server` | `host`, `port`, `reload` | `0.0.0.0:10086` |
| `mongodb` | `url`, `db_name`, `pool_size` | `localhost:27017/ruiyi` |
| `ollama` | `url`, `chat_timeout` | `localhost:11434, 600s` |
| `deepseek` | `api_key`, `base_url`, `default_model` | `deepseek-chat` |
| `llm` | `chat_provider`, `embed_provider` | ollama |
| `rag` | `embed_model`, `top_k`, `chunk_size`, `hybrid_retrieval_enabled` | nomic-embed-text, 3, 512 |
| `knowledge` | `base_dir`, `watcher_enabled`, `watcher_poll_seconds` | `../YiKnowledge, true, 60` |
| `middleware` | `auth_enabled`, `auth_token` | false |
| `jwt` | `secret`, `expire_minutes` | 1440min |
| `observer` | `enabled`, `throttle_enabled`, `sampler_enabled` | false |
| `audit` | `enabled`, `retention_days` | true, 90d |

## 种子数据集合

启动时从 `src/data/seeds/` 自动填充的集合：

| 集合 | 种子文件 | 唯一键 |
|------|----------|--------|
| `menus` | `menus.json` | `path` |
| `users` | `users.json` | `key` |
| `dict_status` | `dict_status.json` | `key` |
| `dict_gender` | `dict_gender.json` | `key` |
| `dict_department` | `dict_department.json` | `key` |
| `dict_role` | `dict_role.json` | `key` |
| `projects` | `projects.json` | `key` |
| `issues` | `issues.json` | `key` |
| `cycles` | `cycles.json` | `key` |
| `releases` | `releases.json` | `key` |
| `modules` | `modules.json` | `key` |
| `pages` | `pages.json` | `key` |
| `labels` | `labels.json` | `key` |
| `bugs` | `bugs.json` | `key` |