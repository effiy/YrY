---
title: 路由与 API
type: project-documentation
project: yiai
tag: architecture
order: 3
status: stable
created: 2026-08-25
source: internal
---
# 路由与 API

## 路由模块 (18 个)

| 路由 | 文件 | 说明 |
|------|------|------|
| \`/\` | 根路由 (app.py) | RPC 分发器 |
| \`/about\` | \`about.py\` | 服务信息 |
| \`/auth/*\` | \`auth.py\` | 认证 (登录/注册/Token) |
| \`/users/*\` | \`users.py\` | 用户管理 |
| \`/system/*\` | \`system.py\` | 系统信息 |
| \`/files/*\` | \`files.py\` | 文件上传/下载/管理 |
| \`/read-file\` | \`files.py\` | 文件读取 (target_file) |
| \`/write-file\` | \`files.py\` | 文件写入 (target_file, content) |
| \`/execution/*\` | \`execution.py\` | 模块执行 |
| \`/wework/*\` | \`wework.py\` | 企业微信消息 |
| \`/maintenance/*\` | \`maintenance.py\` | 维护操作 |
| \`/state/*\` | \`state.py\` | 状态存储 |
| \`/agent/*\` | \`agent.py\` | Agent 聊天/确认/steer |
| \`/health\` | \`health.py\` | 健康检查 |
| \`/knowledge/*\` | \`knowledge.py\` | 知识库扫描/读取/写入 |
| \`/rag/*\` | \`rag.py\` | RAG 检索/聊天/构建 |
| \`/search/*\` | \`search.py\` | 全局搜索 |
| \`/mcp/*\` | \`mcp.py\` | MCP 协议 |
| \`/dashboard/*\` | \`dashboard.py\` | 仪表盘数据 |
| \`/v1/*\` | \`openai_compat.py\` | OpenAI API 兼容 |

## RPC 协议

所有 YiVad/YiPet 请求使用统一信封：

\`\`\`json
POST / {
  "module_name": "services.database.data_service",
  "method_name": "query_documents",
  "parameters": {
    "cname": "projects",
    "filter": { "status": "active" },
    "pageNum": 1,
    "pageSize": 20
  }
}
\`\`\`

响应格式：
\`\`\`json
{ "code": 0, "message": "ok", "data": { "list": [...], "total": 100 } }
\`\`\`

## RPC 方法

| module_name | method_name | 说明 |
|-------------|-------------|------|
| \`services.database.data_service\` | \`query_documents\` | 查询文档 |
| \`services.database.data_service\` | \`create_document\` | 创建文档 |
| \`services.database.data_service\` | \`update_document\` | 更新文档 |
| \`services.database.data_service\` | \`delete_document\` | 删除文档 |
| \`services.ai.chat_service\` | \`chat\` | AI 聊天 (SSE) |
| \`services.ai.chat_service\` | \`chat_rag\` | RAG 增强聊天 |