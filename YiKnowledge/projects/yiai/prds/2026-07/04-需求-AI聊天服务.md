---
title: "YA-07-04: AI 聊天服务 — Ollama LLM 集成 + SSE 流式响应 + Multi-Provider 路由"
tags: [需求文档, AI聊天, LLM, Ollama, SSE, 流式响应, Multi-Provider, 后端]
category: 项目/后端/需求
created: 2026-07-20
updated: 2026-09-16
source: 内部
type: 需求
status: 已完成
priority: P0
project: YiAi
project_id: yiai
owner: 陈铭
prd_month: "202607"
prd_task_id: YA-07-04
estimate_backend: 4.0
review_status: 已评审
issue_type: 功能
roles: [engineer]
source_okr: [yiai-002]
related_modules: [04-prd-task-AI聊天服务]
related_tests: [04-prd-test-AI聊天服务]
---

# YA-07-04: AI 聊天服务

> 需求编号：YA-07-04 · 优先级：P0 · 人天：4.0d · 状态：已完成
> 依赖：YA-07-03（RPC 信封协议）
> 关联：YA-07-02（Multi-Provider LLM）、YA-09-13（上下文压缩）

---

## 一、背景与问题

### 1.1 业务定位

YiAi 是 YrY 单体仓库的唯一后端，需为 YiVad（管理后台）和 YiPet（Chrome 扩展）提供统一的 AI 聊天能力。两个前端通过 RPC 信封 `{ services.ai.chat_service, chat }` 调用，后端通过 Multi-Provider 路由层（`LLMProviderRouter`）调度到 Ollama 本地推理或 DeepSeek 云端 API。

### 1.2 核心挑战

| 挑战 | 影响 | 应对 |
|------|------|------|
| Ollama 无内置会话管理 | 需自建会话存储、消息历史、上下文窗口 | MongoDB `sessions` 集合 + `data/sessions.py` |
| SSE 连接易中断 | 代理超时（Nginx 60s）、网络波动 | SSE 心跳保活 + `X-Accel-Buffering: no` 头 |
| 多 Provider 路由 | Ollama/DeepSeek 接口差异 | `LLMProviderRouter` 统一抽象 |
| 图片多模态 | base64/HTTP URL 两种来源 | `_resolve_images()` 管线（并发获取 + 大小限制） |
| 并发控制 | 多用户同时聊天，Ollama 单模型 OOM 风险 | Provider 级别控制 |

---

## 二、用户故事

| ID | 作为 | 我想要 | 以便 | 优先级 |
|----|------|--------|------|--------|
| US-01 | 前端开发者 | 通过 RPC 信封调用聊天接口，获得 SSE 流式响应 | 在 YiVad/YiPet 中实现流式 AI 对话 | **P0** |
| US-02 | 前端开发者 | 获取可用模型列表 | 在 UI 中展示模型选择器 | P1 |
| US-03 | 终端用户 | 多轮对话保持上下文记忆 | 进行连贯的多轮对话 | **P0** |
| US-04 | 终端用户 | 刷新页面后恢复历史会话 | 继续之前的对话 | **P0** |
| US-05 | 终端用户 | 对话被中断时获得部分回复 | 保留已接收内容 | P1 |

---

## 三、功能需求

### FR-01：SSE 流式聊天

| 属性 | 描述 |
|------|------|
| RPC 方法 | `services.ai.chat_service.chat` |
| 输入 | `{ messages: [{ type, message, timestamp }], model?, stream: true, images?, system? }` |
| 输出 | `StreamingResponse(text/event-stream)`，逐 token SSE 帧 |
| Provider 路由 | `LLMProviderRouter` 根据 model 自动选择 Ollama/DeepSeek |
| 错误处理 | Provider 不可用 → SSE 错误帧 `{"done":true,"error":"..."}` |
| 中断 | 客户端断开 → `request.is_disconnected()` 检测 → 停止生成 |

### FR-02：Multi-Provider 模型路由

| 属性 | 描述 |
|------|------|
| 实现 | `services/ai/llm_provider.py` — `LLMProviderRouter` |
| Provider | `OllamaProvider`（本地）、`DeepSeekProvider`（云端） |
| 路由策略 | 根据 `model` 参数自动选择 Provider |
| 模型列表 | `list_ollama_models()` + `LLMProviderRouter.list_models()` |
| 模型信息 | `get_model_info(model)` 返回模型详情 |

### FR-03：会话管理

| 属性 | 描述 |
|------|------|
| 存储 | MongoDB `sessions` 集合，通过 `data/sessions.py` 访问 |
| 创建 | 首次对话自动生成 `session_key` → SSE 首帧返回 |
| 恢复 | 后续请求携带 `session_key` → 从 MongoDB 加载历史 |
| 上下文窗口 | 最近 N 轮对话（可配置），超出部分滑动窗口截断 |
| 删除 | `delete_session(key)` → MongoDB 删除 |

### FR-04：图片多模态

| 属性 | 描述 |
|------|------|
| 来源 | base64 data URL（前端粘贴/选择）、HTTP URL（从网页获取） |
| 管线 | `_resolve_images()` → 并发获取 HTTP URL → 解码 base64 → bytes[] |
| 约束 | HTTP 并发 4（`_IMAGE_FETCH_SEMAPHORE`）、单张 10MB、15s 超时 |

### FR-05：SSE 工具层

| 属性 | 描述 |
|------|------|
| 实现 | `shared/sse_utils.py` — `format_sse()`、`stream_async()`、`stream_sync()` |
| 格式 | `data: {"data":{"message":"..."}}\n\n`，异常帧 `{"done":true,"error":"..."}` |
| 心跳 | 可配置间隔的 SSE 注释行 `: heartbeat\n\n` |

---

## 四、非功能需求

### NFR-01：性能

| 指标 | 目标 | 测量方法 |
|------|------|----------|
| SSE 首 Token 延迟 | < 5s（P95，模型冷启动 < 180s） | `time.perf_counter()` |
| 会话加载延迟 | < 100ms | MongoDB `find_one({key})` |
| 会话保存延迟 | < 500ms（异步，不阻塞 SSE） | `update_one` 执行时间 |
| 并发聊天请求 | ≥ 3（Ollama 本地）/ ≥ 20（DeepSeek 云端） | Provider 级别限制 |

### NFR-02：可靠性

| 要求 | 实现 |
|------|------|
| Ollama 重试 | `tenacity` 指数退避，最多 2 次重试 |
| Provider 降级 | Ollama 不可达 → 返回 `ErrorCode.AI_UNAVAILABLE` |
| 异常帧 | `stream_async` 捕获异常 → SSE error 帧 + 关闭 |
| 优雅关闭 | uvicorn `lifespan` 正确清理 Provider 连接池 |

### NFR-03：安全

| 要求 | 实现 |
|------|------|
| 会话隔离 | `session_key` 隔离，前端仅访问自己的会话 |
| Prompt 注入防护 | 用户输入通过 `messages` 数组传递，不拼接到 system prompt |
| 日志脱敏 | 聊天内容不写完整日志，仅记录 token 数和耗时 |
| Ollama 网络 | 仅监听 `127.0.0.1:11434`，不暴露公网 |

---

## 五、验收标准

| # | Given | When | Then |
|---|-------|------|------|
| AC-01 | 有效 RPC 请求 `{messages, model, stream:true}` | POST / | 返回 `text/event-stream` + 逐 token SSE 帧 + `done:true` 结束 |
| AC-02 | RPC 请求包含 `session_key` | POST / | 从 MongoDB 加载历史 + 新消息追加 + SSE 返回 `session_key` |
| AC-03 | RPC 请求无 `session_key` | 首次 POST / | 自动生成 UUID → SSE 首帧返回 `session_key` |
| AC-04 | Ollama 不可达 | POST / | SSE error 帧 `{"done":true,"error":"AI unavailable"}` |
| AC-05 | 消息含 base64 图片 | POST / | 解码成功 → 传递给 Ollama vision API |
| AC-06 | 消息含 HTTP 图片 URL | POST / | 异步获取 → 非 image 类型跳过 → 超时 15s 跳过 |
| AC-07 | 客户端断开 | `request.is_disconnected()` | 停止 Ollama 推理 → 释放资源 |

---

## 六、不做（Out of Scope）

| 项目 | 后续 PRD |
|------|----------|
| 自动会话标题生成 | P2 技术债务 |
| 上下文摘要压缩 | YA-09-13 |
| Token 计数与计费 | YA-09-170 |
| 速率限制 | YA-09-105 |
| Agent 工具系统 | YA-08-13 |

---

*关联文档：[开发方案](../../devs/2026-07/04-prd-task-AI聊天服务.md) · [测试规格](../../tests/2026-07/04-prd-test-AI聊天服务.md)*