---
doc_type: module
prd_task_id: "YV-07-02"
title: "YV-07-02: AI Chat 模块迁移 — CLI Ollama 直调 → RPC 信封 SSE 流式 — 开发任务"
status: 已完成
priority: P0
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202607"
estimate_frontend: 5.0
source_prd: "02-prd-AI聊天模块迁移.md"
---

# YV-07-02: AI Chat 模块迁移 — CLI Ollama 直调 → RPC 信封 SSE 流式 — 开发任务

> 来源 PRD：[02-prd-AI聊天模块迁移.md](../prds/2026-07/02-prd-AI聊天模块迁移.md)
> 需求编号：YV-07-02 · 优先级：P0 · 人天：5.0d

## 4.2 实施步骤

| 步骤 | 内容 | 验证方式 | 人天 |
|------|------|---------|------|
| 1 | SSE 解析器实现（`api/sse.ts`） | `parseSSEStream` 单元测试：`data:` 行解析、`[DONE]` 终止、非 JSON 行跳过、`event:` 字段分发、分片传输拼接 | 1.0 |
| 2 | useChatStore 状态管理（`stores/chat.ts`） | 会话 CRUD + 消息管理 + 持久化 + AbortController 生命周期 + IndexedDB 存储 | 1.0 |
| 3 | ChatMessageList + ChatMessage 组件 | 消息渲染 + Markdown + 代码高亮 + 复制按钮 + DOMPurify 清洗 + v-memo 优化 | 1.0 |
| 4 | ChatInput + SSE 流式集成 | 发送消息 → 流式渲染 AI 回复 + requestAnimationFrame 批量更新 + 停止生成 + IME 兼容 | 1.0 |
| 5 | ChatSidebar 会话管理 | 会话列表/新建/删除/重命名 + 搜索 + 持久化 + 跨标签页同步 | 1.0 |

**总计：5.0d**
