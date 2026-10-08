---

doc_type: test
title: "YA-08-02: Multi-Provider LLM — 测试规格"
status: 已完成
priority: P1
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202608"
prd_task_id: "YA-08-02"
source_prds: ["02-需求-Multi-Provider-LLM"]
source_modules: ["02-prd-task-Multi-Provider-LLM"]
source_okr: [yiai-002]

type: test
---

# YA-08-02: Multi-Provider LLM — 测试规格

> 来源 PRD：[02-需求-Multi-Provider-LLM.md](../../prds/2026-08/02-需求-Multi-Provider-LLM.md)
> 开发方案：[02-prd-task-Multi-Provider-LLM.md](../../devs/2026-08/02-prd-task-Multi-Provider-LLM.md)
> 需求编号：YA-08-02 -- 优先级：P1

> **文档职责**：本文档定义**怎么验证**（VERIFY）。覆盖 Provider 抽象、Ollama/DeepSeek 双 Provider、配置切换、上下文压缩。

---

## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 工具 | 环境依赖 | 执行时机 |
|------|------|---------|---------|
| L1 单元 | pytest | 无（mock SDK） | 每次提交 |
| L2 集成 | pytest + httpx | 真实 Ollama（如可用） | PR 合并前 |
| L4 端到端 | 手动 + curl | 真实 Ollama + DeepSeek API | 发布前 |

### 1.2 覆盖范围

| 编号 | 被测对象 | 层级 |
|------|---------|------|
| COV-1 | LLMProvider ABC 接口契约 | L1 |
| COV-2 | OllamaProvider.chat() + embed() | L1 |
| COV-3 | DeepSeekProvider.chat() + SSE 解析 | L1 |
| COV-4 | LLMProviderRouter 配置驱动选择 | L1 |
| COV-5 | 自动降级（DeepSeek → Ollama） | L1 |
| COV-6 | Chat/Embedding Provider 独立配置 | L1 |
| COV-7 | 上下文压缩（token 预算管理） | L1 |
| COV-8 | Provider 健康检查 | L1 |

### 1.3 测试数据

| 夹具 | 数据 | 用途 |
|------|------|------|
| `sample_messages` | `[{role: "user", content: "hi"}]` | Chat 调用 |
| `sample_embed_text` | `"测试嵌入文本"` | Embedding 调用 |
| `mock_ollama_response` | `{"message": {"content": "你好"}, "prompt_eval_count": 10, "eval_count": 5}` | Ollama mock |
| `mock_deepseek_sse` | SSE 事件 `data: {"choices":[{"delta":{"content":"你好"}}]}` | DeepSeek SSE 解析 |
| `long_conversation` | 20 轮对话历史 | 上下文压缩测试 |

---

## 二、单元测试

### 2.1 Provider ABC 契约（COV-1 . L1）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| UT-MP-01 | ABC 不可直接实例化 | 1. `LLMProvider()` | 抛出 TypeError | P0 | 已完成 |
| UT-MP-02 | 子类未实现 chat() → TypeError | 1. Provider 仅实现 `chat_stream`，未实现 `chat` | TypeError（ABC 强制约束） | P0 | 已完成 |
| UT-MP-03 | 子类未实现 embed() → TypeError | 1. Provider 仅实现 `chat`，未实现 `embed` | TypeError | P0 | 待实现 |
| UT-MP-04 | provider_type 属性正确 | 1. `OllamaProvider().provider_type`；2. `DeepSeekProvider().provider_type` | 返回 `ProviderType.OLLAMA` / `ProviderType.DEEPSEEK` | P0 | 待实现 |
| UT-MP-05 | chat_model 属性正确 | 1. `OllamaProvider(chat_model="qwen2.5").chat_model` | 返回 `"qwen2.5"` | P1 | 待实现 |

### 2.2 OllamaProvider（COV-2 . L1）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| UT-MP-06 | `chat()` 调用 Ollama /api/chat | 1. Mock httpx.AsyncClient；2. `provider.chat(messages)` | POST 到 `/api/chat`，参数含 `model`、`messages`、`stream: false` | P0 | 已完成 |
| UT-MP-07 | `chat()` 返回 ChatResponse | 1. Mock Ollama 响应；2. `response = await provider.chat(messages)` | `response.content` 非空，`response.provider = "ollama"` | P0 | 待实现 |
| UT-MP-08 | `embed()` 调用 Ollama /api/embeddings | 1. Mock httpx；2. `provider.embed("test")` | POST 到 `/api/embeddings`，返回 float 数组 | P0 | 已完成 |
| UT-MP-09 | Ollama 不可用 → 异常 | 1. Mock httpx 抛出 `ConnectError` | 抛出异常（非裸 RuntimeError） | P0 | 已完成 |
| UT-MP-10 | Ollama 超时（120s）| 1. Mock httpx.TimeoutException | 正确抛出超时异常 | P1 | 待实现 |
| UT-MP-11 | Ollama 返回非 200 → 异常处理 | 1. Mock httpx 返回 500 | 正确解析错误 | P1 | 待实现 |

### 2.3 DeepSeekProvider（COV-3 . L1）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| UT-MP-12 | `chat()` 使用 OpenAI SDK | 1. Mock `openai.AsyncOpenAI`；2. `provider.chat(messages)` | 调用 `client.chat.completions.create(model, messages, ...)` | P0 | 已完成 |
| UT-MP-13 | `chat()` 返回 ChatResponse | 1. Mock OpenAI 响应；2. `response = await provider.chat(messages)` | `response.content` 非空，`response.provider = "deepseek"` | P0 | 待实现 |
| UT-MP-14 | DeepSeek SSE 解析 | 1. Mock SSE 事件 `data: {"choices":[{"delta":{"content":"你好"}}]}` | `chat_stream` yield `"你好"` | P0 | 已完成 |
| UT-MP-15 | DeepSeek API Key 从环境变量读取 | 1. `os.environ["DEEPSEEK_API_KEY"] = "sk-xxx"` | Provider 读取到正确的 API Key | P0 | 已完成 |
| UT-MP-16 | DeepSeek `finish_reason: "length"` → 正常终止 | 1. Mock 返回 `finish_reason: "length"` | 不触发降级，正常返回 | P0 | 待实现 |
| UT-MP-17 | DeepSeek 返回空 choices → 不报 IndexError | 1. Mock `{"choices": []}` | 返回空 content，不抛异常 | P0 | 待实现 |

### 2.4 LLMProviderRouter（COV-4 + COV-5 + COV-6 . L1）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| UT-MP-18 | 配置切换 ollama → deepseek | 1. 修改 `llm.chat_provider: "deepseek"`；2. 下一次请求 | 使用 DeepSeekProvider | P0 | 已完成 |
| UT-MP-19 | Chat/Embedding 独立配置 | 1. `chat_provider="deepseek"`, `embed_provider="ollama"` | Chat 走 DeepSeek, Embedding 走 Ollama | P0 | 待实现 |
| UT-MP-20 | DeepSeek 不可用 → 降级到 Ollama | 1. Mock DeepSeek 抛出异常；2. `router.chat_with_fallback(messages)` | 自动降级到 Ollama，WARNING 日志记录 | P0 | 已完成 |
| UT-MP-21 | 降级时 ChatResponse.provider 更新 | 1. 触发降级；2. 检查 response | `response.provider = "ollama"` | P0 | 待实现 |
| UT-MP-22 | Ollama 也不可用 → 抛出异常 | 1. Ollama 也不可用；2. 调用 | 不降级（无备选），抛出原始异常 | P0 | 待实现 |
| UT-MP-23 | DEEPSEEK_API_KEY 为空 → 跳过注册 | 1. 不设置 API Key | `router._providers` 仅含 Ollama | P0 | 待实现 |
| UT-MP-24 | `chat_with_fallback` 传递额外参数 | 1. `router.chat_with_fallback(messages, temperature=0.1)` | 参数透传给 Provider | P1 | 待实现 |
| UT-MP-25 | health_check 返回所有 Provider 状态 | 1. `router.health_check()` | 返回 `{"ollama": true, "deepseek": true/false}` | P1 | 待实现 |

### 2.5 上下文压缩（COV-7 . L1）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| UT-CP-01 | 上下文未超窗口 → 不触发压缩 | 1. token 数 < 80% 窗口 | 返回原消息列表不变 | P0 | 已完成 |
| UT-CP-02 | 上下文超窗口 → 触发压缩 | 1. token 数 > 80% 窗口 | 返回压缩后的消息列表（摘要替代早期消息） | P0 | 已完成 |
| UT-CP-03 | 压缩保留最近 N 条消息 | 1. 20 轮对话超窗口；2. 压缩 | 最近 `keep_last` 条消息未被压缩 | P1 | 待实现 |
| UT-CP-04 | 空消息列表 → 不压缩 | 1. `compaction(messages=[])` | 返回 `[]` | P1 | 待实现 |

---

## 三、集成测试

| 编号 | 场景 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| IT-MP-01 | OllamaProvider 端到端（真实 Ollama） | 1. 查询 "hello" | 返回非空响应 | P0 | 已完成 |
| IT-MP-02 | Provider 切换不中断进行中的流 | 1. 流式输出中切换配置 | 当前流不受影响，新请求使用新 Provider | P0 | 已完成 |
| IT-MP-03 | 长对话上下文压缩 | 1. 20 轮对话 → 超窗口 80% → 摘要 | 前 18 轮被摘要替代，最近 2 轮保留原文 | P0 | 已完成 |
| IT-MP-04 | 真实 DeepSeek API（如有 API Key） | 1. 发送请求到真实 DeepSeek | 返回非空 ChatResponse | P1 | 待实现 |

---

## 四、边缘场景用例

| 编号 | 场景 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-MP-EDGE-001 | LLMConfig 缺失 chat_provider 字段 | 1. 不配置 chat_provider | 默认使用 Ollama | P1 | 待实现 |
| TC-MP-EDGE-002 | 两个 Provider 配置相同的 chat_model | 1. Ollama 和 DeepSeek 都配 `qwen2.5` | 正常路由，不冲突 | P2 | 待实现 |
| TC-MP-EDGE-003 | 降级期间再次降级（死循环保护） | 1. DeepSeek 失败 → Ollama 也失败 | 直接抛出异常，不在两个 Provider 间反复重试 | P1 | 待实现 |
| TC-MP-EDGE-004 | API Key 格式校验（sk-xxx） | 1. 使用无效格式的 Key | 初始化时报错或跳过该 Provider | P2 | 待实现 |
| TC-MP-EDGE-005 | 并发请求同一 Provider | 1. 10 并发调用 `chat_with_fallback` | 全部正常返回（Provider 级线程安全） | P1 | 待实现 |
| TC-MP-EDGE-006 | Embedding 降级维度变化 | 1. DeepSeek embed (1536d) → 降级 Ollama (768d) | WARNING 日志提示维度变化 | P1 | 待实现 |

---

## 五、回归用例

| 编号 | 关联缺陷 | 场景 | 预期 | 优先级 | 状态 |
|------|---------|------|------|--------|------|
| TC-MP-REG-001 | 缺陷 3：kwargs 未透传给 Provider | RAGRuntime 需要 `knowledge_base_id` | `chat_with_fallback` 透传 provider_params | P0 | 待实现 |
| TC-MP-REG-002 | 缺陷 6：API Key 无效时模块导入失败 | 无效 Key → `AuthenticationError` | 懒初始化，首次调用时才报错 | P1 | 待实现 |
| TC-MP-REG-003 | 缺陷 7：降级后 token 计数差异导致截断 | DeepSeek → Ollama 降级时 max_tokens 不适用 | 动态调整 `max_tokens` | P1 | 待实现 |

---

## 六、性能测试

| 编号 | 场景 | 目标 | 状态 |
|------|------|------|------|
| PT-01 | Provider 实例化（不含模型加载） | < 1ms | 待实现 |
| PT-02 | 上下文压缩（20 轮 → 摘要） | < 3s | 待实现 |
| PT-03 | Router 选择 Provider | < 1ms | 待实现 |

---

## 七、追溯矩阵

| 需求项（PRD） | 验收标准 | 覆盖用例 |
|--------------|---------|---------|
| FR-01 LLMProvider ABC | 强制实现 chat/embed | UT-MP-01 ~ 05 |
| FR-02 OllamaProvider | Chat + Embedding 完整 | UT-MP-06 ~ 11 |
| FR-03 DeepSeekProvider | OpenAI SDK 集成 + SSE | UT-MP-12 ~ 17 |
| FR-04 Provider 路由 | 配置驱动 + 独立配置 | UT-MP-18 ~ 25 |
| FR-05 自动降级 | DeepSeek → Ollama | UT-MP-20 ~ 22 |
| FR-06 上下文压缩 | Token 预算管理 | UT-CP-01 ~ 04 |
| NFR 性能 | 实例化 < 1ms | PT-01 ~ 03 |

---

## 八、覆盖缺口

| 编号 | 缺口 | 影响 | 建议 |
|------|------|------|------|
| G-1 | AnthropicProvider 未实现 | 仅有 Ollama + DeepSeek | 后续迭代实现 |
| G-2 | 运行时 Provider 切换 API 未测试 | `POST /llm/switch-provider` 未实现 | 实现后补充测试 |
| G-3 | Token 用量监控未测试 | 无用量统计测试 | 实现用量统计后补充 |
| G-4 | Embedding Provider 独立抽象未测试 | 当前 ModelRuntime 无 embed() 抽象 | 重构后补充 |