---

doc_type: test
title: "OpenAI 兼容 API — 测试规格"
status: 待开始
priority: P1
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202608"
prd_task_id: "YA-08-11"
source_prds: ["09-需求-OpenAI兼容API"]
source_modules: ["09-prd-task-OpenAI兼容API"]
source_okr: [yiai-002]

type: test
---

# OpenAI 兼容 API — 测试规格

> 来源 PRD：[09-需求-OpenAI兼容API.md](../../prds/2026-08/09-需求-OpenAI兼容API.md)
> 开发方案：[09-prd-task-OpenAI兼容API.md](../../devs/2026-08/09-prd-task-OpenAI兼容API.md)
> 提取日期：2026-09-23

本文档定义**验证方式**——测什么、怎么测、通过标准是什么。覆盖 `/v1/chat/completions`、`/v1/models` 两个端点，包括流式/非流式、Provider 自动判定、Tool Calling 格式转换、SSE 帧格式。

---

## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 工具 | 环境依赖 | 执行时机 |
|------|------|---------|---------|
| L1 单元 | pytest | 无（mock ModelRuntime） | 每次提交 |
| L2 集成 | pytest + httpx | YiAi 服务 + stub LLM | 每次提交 |
| L4 端到端 | 手动 + curl | 真实 Ollama | 发布前 |

### 1.2 覆盖范围

| 编号 | 被测对象 | 层级 |
|------|---------|------|
| COV-1 | `POST /v1/chat/completions` 非流式请求 | L2 |
| COV-2 | `POST /v1/chat/completions` 流式 SSE | L2 |
| COV-3 | `GET /v1/models` 模型列表 | L2 |
| COV-4 | Provider 自动判定（model name → provider） | L1 |
| COV-5 | OpenAI 消息格式解析（`_parse_openai_messages`） | L1 |
| COV-6 | Tool Calling 格式转换（OpenAI ↔ Ollama） | L1 |
| COV-7 | SSE chunk 构建（`_build_sse_chunk`） | L1 |
| COV-8 | multimodal content 处理 | L1 |
| COV-9 | 错误响应格式 | L2 |

### 1.3 测试数据

| 夹具 | 数据 | 用途 |
|------|------|------|
| `openai_chat_request` | `{model: "qwen2.5", messages: [{role: "user", content: "hi"}]}` | 标准非流式请求 |
| `openai_stream_request` | 同上 + `{stream: true}` | 标准流式请求 |
| `openai_tool_request` | `{model: "gpt-4o", messages: [...], tools: [{type: "function", function: {...}}]}` | Tool Calling 请求 |
| `openai_multimodal_request` | 含 image_url content 的 messages | 多模态请求 |
| `deepseek_request` | `{model: "deepseek-chat", messages: [...]}` | DeepSeek Provider 判定 |

---

## 二、测试用例

### 2.1 `/v1/chat/completions` 非流式（COV-1 . L2）

> 自动化落点：`tests/api/test_openai_compat.py`（**待新增**）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-OAI-001 | 标准非流式聊天请求 | 1. POST `/v1/chat/completions` 带 `{model: "qwen2.5", messages: [...]}`；2. 检查响应 | 状态码 200，响应体包含 `{id, object: "chat.completion", created, model, choices: [{index, message: {role, content}, finish_reason}], usage}` | P0 | 待实现 |
| TC-OAI-002 | `id` 字段格式为 `chatcmpl-{uuid}` | 1. 发送请求；2. 检查 `response.id` | `id` 以 `chatcmpl-` 开头 | P0 | 待实现 |
| TC-OAI-003 | `choices[0].message.role` 为 `"assistant"` | 1. 发送请求；2. 检查 message.role | `role = "assistant"` | P0 | 待实现 |
| TC-OAI-004 | `choices[0].message.content` 非空 | 1. 发送 "hi" 消息；2. 检查 content | `content` 为非空字符串 | P0 | 待实现 |
| TC-OAI-005 | `usage` 包含 token 统计 | 1. 发送请求；2. 检查 `response.usage` | `usage` 包含 `prompt_tokens`、`completion_tokens`、`total_tokens` | P0 | 待实现 |
| TC-OAI-006 | `finish_reason` 为 `"stop"` | 1. 发送正常请求；2. 检查 `choices[0].finish_reason` | `finish_reason = "stop"`（正常完成） | P0 | 待实现 |
| TC-OAI-007 | 空 messages 数组 → 验证错误 | 1. 发送 `{model: "qwen2.5", messages: []}` | 返回 422 或 400 | P1 | 待实现 |
| TC-OAI-008 | 不存在的 model → 错误响应 | 1. 发送 `{model: "nonexistent-model", messages: [...]}` | 返回错误，不崩溃 | P1 | 待实现 |

### 2.2 `/v1/chat/completions` 流式 SSE（COV-2 . L2）

> 自动化落点：`tests/api/test_openai_compat.py`

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-OAI-009 | 流式请求返回 `text/event-stream` | 1. POST `/v1/chat/completions` 带 `stream: true`；2. 检查 Content-Type | `Content-Type: text/event-stream` | P0 | 待实现 |
| TC-OAI-010 | SSE 首帧包含 `delta.role: "assistant"` | 1. 请求流式；2. 读取第一个 SSE chunk | 首帧 `choices[0].delta.role = "assistant"`，`content = ""` | P0 | 待实现 |
| TC-OAI-011 | SSE 中间帧包含 `delta.content` | 1. 持续读取 SSE chunk；2. 检查 content 帧 | 存在至少一帧 `choices[0].delta.content` 非空 | P0 | 待实现 |
| TC-OAI-012 | SSE 末帧 `finish_reason = "stop"` | 1. 读取到最后一个非 [DONE] 的 chunk；2. 检查 finish_reason | `finish_reason = "stop"`，`delta = {}` | P0 | 待实现 |
| TC-OAI-013 | SSE 以 `data: [DONE]` 结束 | 1. 读取所有 SSE 帧 | 最后一行为 `data: [DONE]` | P0 | 待实现 |
| TC-OAI-014 | 每帧包含 `id` 和 `created` | 1. 检查每个 SSE chunk | 每帧 JSON 包含 `id` 和 `created` 字段 | P1 | 待实现 |
| TC-OAI-015 | 流式请求 mock LLM 超时 → 错误帧 | 1. Mock LLM 在 3 个 token 后超时；2. 检查 SSE 流 | 包含错误信息帧，连接正常关闭 | P1 | 待实现 |

### 2.3 `/v1/models` 模型列表（COV-3 . L2）

> 自动化落点：`tests/api/test_openai_compat.py`

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-OAI-016 | GET `/v1/models` 返回标准格式 | 1. GET `/v1/models` | 返回 `{object: "list", data: [{id, object: "model", created, owned_by}]}` | P0 | 待实现 |
| TC-OAI-017 | POST `/v1/models` 同样可用 | 1. POST `/v1/models` | 与 GET 返回格式一致 | P1 | 待实现 |
| TC-OAI-018 | Ollama 可用时返回其模型列表 | 1. Mock Ollama `/api/tags` 返回 5 个模型；2. 调用 `/v1/models` | `data` 数组包含 5 个模型对象 | P0 | 待实现 |
| TC-OAI-019 | Ollama 不可用时返回默认模型 | 1. Mock Ollama 不可用；2. 调用 `/v1/models` | `data` 数组包含至少 1 个默认模型 | P1 | 待实现 |

### 2.4 Provider 自动判定（COV-4 . L1）

> 自动化落点：`tests/unit/test_openai_compat.py`（**待新增**）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-OAI-020 | model 含 "gpt-" → provider="openai" | 1. 解析 `model: "gpt-4o"` | `provider = "openai"` | P0 | 待实现 |
| TC-OAI-021 | model 含 "o1"/"o3"/"o4" → provider="openai" | 1. 解析 `model: "o1-mini"` | `provider = "openai"` | P0 | 待实现 |
| TC-OAI-022 | model 含 "deepseek" → provider="openai" | 1. 解析 `model: "deepseek-chat"` | `provider = "openai"`（DeepSeek 兼容 OpenAI） | P0 | 待实现 |
| TC-OAI-023 | 其他 model → provider="ollama" | 1. 解析 `model: "qwen2.5"` | `provider = "ollama"` | P0 | 待实现 |
| TC-OAI-024 | 大小写不敏感匹配 | 1. 解析 `model: "GPT-4o"` | `provider = "openai"` | P1 | 待实现 |

### 2.5 消息格式解析与 Tool Calling（COV-5 + COV-6 . L1）

> 自动化落点：`tests/unit/test_openai_compat.py`

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-OAI-025 | 标准消息格式解析 | 1. 输入 `{messages: [{role: "user", content: "hello"}]}` | 解析为 `[{role: "user", content: "hello"}]` | P0 | 待实现 |
| TC-OAI-026 | system message 正确保留 | 1. 输入含 `{role: "system", content: "You are..."}` | system message 保留在消息列表中 | P0 | 待实现 |
| TC-OAI-027 | multimodal content 提取 text parts | 1. 输入 `content: [{type: "text", text: "describe"}, {type: "image_url", image_url: {...}}]` | 仅提取 `text = "describe"`，忽略 image_url | P0 | 待实现 |
| TC-OAI-028 | OpenAI Tool 格式 → Ollama 格式 | 1. 输入 OpenAI 格式 tools；2. 调用 `_openai_tool_to_ollama` | 转换为 Ollama 兼容的工具定义 | P0 | 待实现 |
| TC-OAI-029 | Ollama Tool Call → OpenAI 格式 | 1. 输入 Ollama 格式 tool_calls；2. 调用 `_openai_tool_call_to_ollama` | 转换为 OpenAI 兼容格式 | P0 | 待实现 |
| TC-OAI-030 | 无 tools 参数的请求正常处理 | 1. 输入不含 `tools` 字段的请求 | 不调用工具转换，正常返回 | P1 | 待实现 |

### 2.6 SSE chunk 构建（COV-7 . L1）

> 自动化落点：`tests/unit/test_openai_compat.py`

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-OAI-031 | `_build_sse_chunk` 格式正确 | 1. 调用 `_build_sse_chunk(delta={"content": "你好"}, ...)` | 返回 `data: {"id":"chatcmpl-...","object":"chat.completion.chunk","choices":[{"delta":{"content":"你好"}}]}\n\n` | P0 | 待实现 |
| TC-OAI-032 | 初始 chunk delta 包含 role | 1. 调用 `_build_sse_chunk(delta={"role": "assistant", "content": ""}, ...)` | delta 包含 `role: "assistant"` | P0 | 待实现 |
| TC-OAI-033 | 最终 chunk finish_reason 为 "stop" | 1. 调用 `_build_sse_chunk(delta={}, finish_reason="stop", ...)` | `finish_reason = "stop"`，delta 为空对象 | P0 | 待实现 |
| TC-OAI-034 | usage 在最后帧包含 | 1. 调用含 usage 参数的 `_build_sse_chunk` | usage 出现在 JSON 中 | P1 | 待实现 |

---

## 三、边缘场景用例

| 编号 | 场景 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-OAI-EDGE-001 | 超长消息（> 100KB） | 1. 发送 content 为 150KB 文本的请求 | 正常返回或返回明确的错误（非 500） | P1 | 待实现 |
| TC-OAI-EDGE-002 | 特殊 Unicode 字符（emoji、零宽字符） | 1. 发送含 emoji + 零宽连接符的消息 | 正常编码，SSE 帧不被截断 | P2 | 待实现 |
| TC-OAI-EDGE-003 | 仅含 system message 的请求 | 1. 发送 `messages: [{role: "system", content: "..."}]` | LLM 正常响应（或返回合理错误） | P1 | 待实现 |
| TC-OAI-EDGE-004 | temperature 和 max_tokens 参数传递 | 1. 发送 `{temperature: 0.1, max_tokens: 100}`；2. 检查 LLM 调用参数 | 参数正确传递给底层 ModelRuntime | P1 | 待实现 |
| TC-OAI-EDGE-005 | Tool Calling 空 tools 数组 | 1. 发送 `tools: []` | 正常处理，不抛异常 | P1 | 待实现 |
| TC-OAI-EDGE-006 | 流式请求客户端中途断开 | 1. 发起流式请求；2. 在收到 3 个 chunk 后断开连接 | 服务端正确处理，不抛异常，资源释放 | P1 | 待实现 |

---

## 四、回归用例

| 编号 | 关联缺陷 | 场景 | 当前预期（固化） | 修复后预期 | 优先级 | 状态 |
|------|---------|------|-----------------|-----------|--------|------|
| TC-OAI-REG-001 | 缺陷 1（YA-08-02）：`finish_reason: "length"` 误判为错误 | 发送 max_tokens=10 的短请求，模型返回 `finish_reason: "length"` | 正常返回，不触发降级 | 正常返回 | P0 | 待实现 |
| TC-OAI-REG-002 | 缺陷 4（YA-08-02）：空 choices 数组 → IndexError | Mock DeepSeek 返回 `{"choices": []}` | 妥善处理，返回空内容或错误 | 返回空内容，不抛 IndexError | P1 | 待实现 |
| TC-OAI-REG-003 | 缺陷 2（YA-08-01）：`/v1/chat/completions` 与 `POST /` RPC 路由冲突 | 同时注册两个路由后测试 | 两个端点均正常响应 | 路径分离，无冲突 | P0 | 待实现 |

---

## 五、追溯矩阵

| 需求项（PRD） | 验收标准 | 覆盖用例 |
|--------------|---------|---------|
| FR-01 POST /v1/chat/completions 非流式 | 返回 OpenAI 兼容格式 | TC-OAI-001 ~ 008 |
| FR-02 POST /v1/chat/completions 流式 SSE | SSE 帧符合 OpenAI 规范 | TC-OAI-009 ~ 015 |
| FR-03 GET /v1/models 模型列表 | OpenAI SDK 可解析 | TC-OAI-016 ~ 019 |
| FR-04 Provider 自动判定 | model name → provider 映射 | TC-OAI-020 ~ 024 |
| FR-05 消息格式解析 | multimodal + system + tool | TC-OAI-025 ~ 030 |
| FR-06 Tool Calling 格式转换 | OpenAI ↔ Ollama 双向 | TC-OAI-028 ~ 029 |
| FR-07 SSE chunk 构建 | OpenAI SSE 帧格式 | TC-OAI-031 ~ 034 |

---

## 六、覆盖缺口

| 编号 | 缺口 | 影响 | 建议 |
|------|------|------|------|
| G-1 | `/v1/embeddings` 端点未实现 | 需要 Embedding 的 OpenAI SDK 客户端无法使用 | 后续迭代实现 |
| G-2 | `/v1/completions`（旧版）未实现 | 使用旧版 Completions API 的客户端不可用 | 评估需求后决定是否实现 |
| G-3 | 真实 DeepSeek API 集成测试 | mock 测试无法捕获 DeepSeek API 特殊的错误响应 | 手动测试或使用 DeepSeek sandbox 环境 |
| G-4 | 多模态图片支持的完整测试 | 当前仅提取 text parts，图片被丢弃 | 待多模态模型支持后补充 |