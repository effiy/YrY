---

doc_type: test
title: "ModelRuntime 抽象层 — 测试规格"
status: 已完成
priority: P1
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202608"
prd_task_id: "YA-08-14"
source_prds: ["14-需求-ModelRuntime抽象层"]
source_modules: ["14-prd-task-ModelRuntime抽象层"]
source_okr: [yiai-002]

type: test
---

# ModelRuntime 抽象层 — 测试规格

> 来源 PRD：[14-需求-ModelRuntime抽象层.md](../../prds/2026-08/14-需求-ModelRuntime抽象层.md)
> 开发方案：[14-prd-task-ModelRuntime抽象层.md](../../devs/2026-08/14-prd-task-ModelRuntime抽象层.md)
> 提取日期：2026-09-23

本文档定义**验证方式**——测什么、怎么测、通过标准是什么。覆盖 `ModelRuntime` ABC、`OllamaRuntime`、`OpenAIRuntime`、`RAGRuntime` 三种实现，以及 `get_runtime()` 工厂函数。

---

## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 工具 | 环境依赖 | 执行时机 |
|------|------|---------|---------|
| L1 单元 | pytest | 无（mock 外部 SDK） | 每次提交 |
| L2 集成 | pytest | 真实 Ollama（如可用）或 stub | PR 合并前 |

### 1.2 覆盖范围

| 编号 | 被测对象 | 层级 |
|------|---------|------|
| COV-1 | `ModelRuntime` ABC 抽象约束 | L1 |
| COV-2 | `OllamaRuntime.stream_chat()` 流式输出 | L1 |
| COV-3 | `OllamaRuntime.complete()` 非流式 | L1 |
| COV-4 | `OllamaRuntime` 心跳保活（15s） | L1 |
| COV-5 | `OllamaRuntime` 超时控制（300s） | L1 |
| COV-6 | `OpenAIRuntime.stream_chat()` SSE 流式 | L1 |
| COV-7 | `OpenAIRuntime.complete()` + 重试 | L1 |
| COV-8 | `RAGRuntime.stream_chat()` RAG 增强 | L1 |
| COV-9 | `RAGRuntime` 降级到 OllamaRuntime | L1 |
| COV-10 | `get_runtime()` 工厂函数 | L1 |
| COV-11 | `model_name()` 属性 | L1 |
| COV-12 | `_b64()` 图片编码工具 | L1 |

### 1.3 测试数据

| 夹具 | 数据 | 用途 |
|------|------|------|
| `sample_messages` | `[{role: "user", content: "你好"}]` | 标准聊天消息 |
| `mock_ollama_client` | `unittest.mock.MagicMock` 模拟 ollama.Client | OllamaRuntime 测试 |
| `mock_openai_client` | `unittest.mock.AsyncMock` 模拟 openai.AsyncOpenAI | OpenAIRuntime 测试 |
| `mock_rag_engine` | `unittest.mock.AsyncMock` 模拟 RAG engine | RAGRuntime 测试 |
| `stream_chunks` | `[{"message": {"content": "你"}}, {"message": {"content": "好"}}]` | 流式输出模拟 |

---

## 二、测试用例

### 2.1 ModelRuntime ABC 抽象约束（COV-1 . L1）

> 自动化落点：`tests/unit/services/test_model_runtime.py`（已存在，需扩展）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-MR-001 | ABC 不可直接实例化 | 1. `ModelRuntime()` | 抛出 `TypeError` | P0 | 待实现 |
| TC-MR-002 | 子类未实现 `stream_chat` → 不可实例化 | 1. 创建仅实现 `complete` 的子类；2. 实例化 | 抛出 `TypeError` | P0 | 待实现 |
| TC-MR-003 | 子类未实现 `complete` → 不可实例化 | 1. 创建仅实现 `stream_chat` 的子类；2. 实例化 | 抛出 `TypeError` | P0 | 待实现 |
| TC-MR-004 | `model_name()` 返回类属性 | 1. `OllamaRuntime(model="qwen2.5").model_name()` | 返回 `"qwen2.5"` | P0 | 待实现 |
| TC-MR-005 | `_b64()` 正确编码 bytes | 1. `runtime._b64(b"hello")` | 返回 `"aGVsbG8="` | P1 | 待实现 |

### 2.2 OllamaRuntime（COV-2 ~ COV-5 . L1）

> 自动化落点：`tests/unit/services/test_model_runtime.py`

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-MR-006 | `stream_chat` 流式输出 token | 1. Mock ollama.Client.chat 返回 `stream_chunks`；2. 遍历 `stream_chat(messages)` | async for 逐 token yield `{"data": {"message": "你"}}`, `{"data": {"message": "好"}}` | P0 | 待实现 |
| TC-MR-007 | `stream_chat` 使用 `asyncio.to_thread` | 1. Mock `asyncio.to_thread`；2. 调用 `stream_chat` | `asyncio.to_thread` 被调用（同步 Ollama SDK 在线程池执行） | P0 | 待实现 |
| TC-MR-008 | `stream_chat` 通过 `asyncio.Queue` 传递结果 | 1. Mock ollama.Client 在线程中调用 queue.put；2. 读取 queue | 主协程通过 queue.get 获取 token，无阻塞 | P1 | 待实现 |
| TC-MR-009 | `complete` 非流式返回完整响应 | 1. Mock ollama.Client.chat 返回完整响应；2. 调用 `complete(messages)` | 返回 `{content: "...", model: "qwen2.5", ...}` | P0 | 待实现 |
| TC-MR-010 | 心跳保活 15s 间隔 | 1. Mock 模型推理耗时 45s；2. 遍历 stream_chat | 至少包含 2 个 `{"data": {"phase": "thinking"}}` 心跳帧（在 15s 和 30s） | P1 | 待实现 |
| TC-MR-011 | 超时控制（默认 300s） | 1. Mock 模型推理耗时 400s；2. 调用 `stream_chat(timeout=300)` | 300s 后抛出超时异常或连接关闭 | P1 | 待实现 |
| TC-MR-012 | 线程安全：dict/object 两种返回格式兼容 | 1. Mock ollama.Client 返回 object（非 dict）格式；2. 调用 `stream_chat` | 使用 `hasattr`/`getattr` 安全获取属性，不抛 `KeyError` | P0 | 待实现 |
| TC-MR-013 | Ollama 连接失败 → 错误 chunk | 1. Mock ollama.Client.chat 抛出 `ConnectionError`；2. 调用 `stream_chat` | 返回 `{"error": "Ollama request failed: ..."}` chunk | P0 | 待实现 |

### 2.3 OpenAIRuntime（COV-6 + COV-7 . L1）

> 自动化落点：`tests/unit/services/test_model_runtime.py`

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-MR-014 | `stream_chat` 使用 OpenAI SDK 流式 | 1. Mock `openai.AsyncOpenAI.chat.completions.create` 返回 async iterator；2. 遍历 `stream_chat` | 流式返回 SSE chunk（`choices[0].delta.content`） | P0 | 待实现 |
| TC-MR-015 | `stream_chat` 透传 usage 统计 | 1. Mock 最后 chunk 含 usage 信息；2. 读取到最后 | 最后帧包含 `{"data": {"usage": {...}}}` | P1 | 待实现 |
| TC-MR-016 | `complete` 调用 `chat.completions.create` | 1. Mock OpenAI SDK；2. 调用 `complete(messages)` | 返回 `{content, model, usage}` 字典 | P0 | 待实现 |
| TC-MR-017 | `complete` 指数退避重试 | 1. Mock OpenAI SDK 前 2 次抛出 `RateLimitError`，第 3 次成功；2. 调用 `complete(messages, max_retries=3)` | 第 3 次重试成功，总尝试 3 次 | P0 | 待实现 |
| TC-MR-018 | Vision 多模态 base64 图片编码 | 1. 传入 `images=[b"fake_image_data"]`；2. 调用 `stream_chat` | 图片以 base64 data URL 形式出现在消息中 | P1 | 待实现 |
| TC-MR-019 | OpenAI API 认证失败 → 错误 | 1. Mock OpenAI SDK 抛出 `AuthenticationError`；2. 调用 `stream_chat` | 返回明确错误（非裸 500） | P0 | 待实现 |

### 2.4 RAGRuntime（COV-8 + COV-9 . L1）

> 自动化落点：`tests/unit/services/test_model_runtime.py`

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-MR-020 | `stream_chat` 包装 RAG 引擎流式 | 1. Mock `rag_chat_stream` 返回 chunk 迭代器；2. 遍历 | 流式返回检索增强的响应 | P0 | 待实现 |
| TC-MR-021 | scope 自动计算（从 system prompt 提取） | 1. 传入 `system: "ctx: YiKnowledge/engineer/"`；2. 调用 `stream_chat` | scope 被提取为 `["YiKnowledge/engineer/"]` | P1 | 待实现 |
| TC-MR-022 | RAG 失败 → 降级到 OllamaRuntime | 1. Mock `rag_chat_stream` 抛出异常；2. 调用 `stream_chat` | 自动回退到 `OllamaRuntime.stream_chat()` | P0 | 待实现 |
| TC-MR-023 | `complete` 委托给 OllamaRuntime | 1. 调用 `RAGRuntime.complete(messages)` | 内部调用 `OllamaRuntime.complete(messages)`（RAG 引擎仅支持流式） | P0 | 待实现 |
| TC-MR-024 | RAG 降级时记录 WARNING 日志 | 1. RAG 失败触发降级；2. 检查日志 | 包含 `"RAG degraded to Ollama"` 的 WARNING 日志 | P1 | 待实现 |

### 2.5 工厂函数（COV-10 + COV-11 . L1）

> 自动化落点：`tests/unit/services/test_model_runtime.py`

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-MR-025 | `get_runtime("ollama")` → OllamaRuntime | 1. 调用 `get_runtime("ollama")` | 返回 `OllamaRuntime` 实例 | P0 | 待实现 |
| TC-MR-026 | `get_runtime("openai")` → OpenAIRuntime | 1. 调用 `get_runtime("openai")` | 返回 `OpenAIRuntime` 实例 | P0 | 待实现 |
| TC-MR-027 | `get_runtime("deepseek")` → OpenAIRuntime | 1. 调用 `get_runtime("deepseek")` | 返回 `OpenAIRuntime` 实例（DeepSeek 兼容 OpenAI） | P0 | 待实现 |
| TC-MR-028 | `get_runtime("rag")` → RAGRuntime | 1. 调用 `get_runtime("rag")` | 返回 `RAGRuntime` 实例 | P0 | 待实现 |
| TC-MR-029 | `get_runtime("unknown")` → 默认 OllamaRuntime | 1. 调用 `get_runtime("unknown_provider")` | 返回 `OllamaRuntime` 实例（默认降级） | P1 | 待实现 |
| TC-MR-030 | 传入 `**kwargs` 透传给 Runtime 构造函数 | 1. `get_runtime("ollama", model="custom-model")` | Runtime 的 model 为 `"custom-model"` | P1 | 待实现 |

---

## 三、边缘场景用例

| 编号 | 场景 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-MR-EDGE-001 | 空 messages 列表 → 错误 | 1. `stream_chat([])` | 返回错误 chunk 或空流 | P1 | 待实现 |
| TC-MR-EDGE-002 | 超长消息（> 10K tokens） | 1. 发送 15K token 的 messages | 正常处理或返回明确的上下文超限错误 | P1 | 待实现 |
| TC-MR-EDGE-003 | 流式中断后恢复 | 1. 流式传输中模拟网络中断；2. 检查行为 | 连接关闭，不泄露资源 | P1 | 待实现 |
| TC-MR-EDGE-004 | 多个 stream_chat 并发调用 | 1. 创建 5 个并发 stream_chat | 各流独立，不互相干扰 | P2 | 待实现 |
| TC-MR-EDGE-005 | RAG → Ollama 降级链耗尽 | 1. RAG 失败 → Ollama 也失败 | 返回错误信息，不无限循环 | P1 | 待实现 |
| TC-MR-EDGE-006 | complete 重试耗尽 | 1. Mock OpenAI 始终返回 `RateLimitError`，max_retries=3；2. 调用 complete | 3 次重试后抛出最终错误 | P1 | 待实现 |

---

## 四、回归用例

| 编号 | 关联缺陷 | 场景 | 预期 | 优先级 | 状态 |
|------|---------|------|------|--------|------|
| TC-MR-REG-001 | 缺陷 1（YA-08-02）：`finish_reason: "length"` 误判 | OpenAI 返回 `finish_reason: "length"` | 正常返回，不触发降级 | P0 | 待实现 |
| TC-MR-REG-002 | 缺陷 2（YA-08-02）：OpenAiruntime 异常捕获不完整 | `APIError` 非 `APITimeoutError` 子类 | 捕获 `APIError` 基类，正确降级 | P0 | 待实现 |
| TC-MR-REG-003 | 缺陷 5（YA-08-02）：Ollama done_reason="load" 时成本计算 NPE | done_reason="load" 的 chunk | 跳过成本计算，等待下一个 "stop" chunk | P1 | 待实现 |

---

## 五、追溯矩阵

| 需求项（PRD） | 验收标准 | 覆盖用例 |
|--------------|---------|---------|
| FR-01 ModelRuntime ABC | 抽象方法强制实现 | TC-MR-001 ~ 005 |
| FR-02 OllamaRuntime 流式 | to_thread + Queue + 心跳 | TC-MR-006 ~ 013 |
| FR-03 OpenAIRuntime 流式 | OpenAI SDK + Vision + 重试 | TC-MR-014 ~ 019 |
| FR-04 RAGRuntime | RAG 引擎 + 自动降级 | TC-MR-020 ~ 024 |
| FR-05 get_runtime 工厂 | mode 驱动创建 | TC-MR-025 ~ 030 |
| FR-06 统一流式契约 | 所有 Runtime 相同接口 | TC-MR-006/014/020 |

---

## 六、覆盖缺口

| 编号 | 缺口 | 影响 | 建议 |
|------|------|------|------|
| G-1 | 真实 Ollama 集成测试 | mock 无法验证 ollama.Client 真实行为 | 手动运行 `pytest -m "ollama"` |
| G-2 | 真实 OpenAI/DeepSeek API 测试 | mock 无法验证 API 格式兼容性 | 使用 sandbox 环境手动验证 |
| G-3 | 线程安全压力测试 | `asyncio.to_thread` 在多线程下的稳定性 | pytest-benchmark 长时间运行 |
| G-4 | Heartbeat 与超时的交互 | 心跳可能影响超时判断 | 边缘场景补充 |