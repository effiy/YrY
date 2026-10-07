---

doc_type: test
title: "YA-09-234: RAG 聊天流模型参数支持 — 测试规格"
status: 待开始
priority: P1
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-22
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-234"
source_prds: ["87-需求-RAG聊天模型参数传递"]
source_modules: ["234-prd-task-RAG聊天流模型参数支持"]
source_okr: [yiai-001]

type: test
---

# YA-09-234: RAG 聊天流模型参数支持 — 测试规格

> 来源 PRD：[87-需求-RAG聊天模型参数传递.md](../../prds/2026-09/87-需求-RAG聊天模型参数传递.md)
> 开发方案：[234-prd-task-RAG聊天流模型参数支持.md](../../devs/2026-09/234-prd-task-RAG聊天流模型参数支持.md)
> 需求编号：YA-09-234 · 优先级：P1

> **文档职责**：本文档定义**怎么验证**（VERIFY），覆盖 RAG 聊天流 model 参数传递、默认模型回退、无效模型处理、前后端联调、SSE 流格式兼容、回退链完整。

---

<a id="sec-1"></a>
## 一、测试范围与策略

| 层级 | 框架 | 覆盖内容 | 占比 |
|------|------|---------|------|
| 单元测试 | pytest | RagChatRequest schema 验证、rag_chat_stream model 参数解析、默认模型回退逻辑 | 40% |
| 集成测试 | pytest + httpx | RPC 信封调用（带/不带 model）、SSE 流格式验证、无效模型错误码 | 40% |
| E2E 测试 | 手动/自动化 | YiVad 前端 RAG 页面模型选择器联调 | 20% |

**测试目标**：不传 model 行为与现有逻辑一致（零回归）、传 model 时正确替换、无效模型返回错误码 2001、SSE 响应头不变、前后端联调通过。

---

<a id="sec-2"></a>
## 二、测试数据与前置条件

**测试环境**：

| 项目 | 值 |
|------|-----|
| 后端 | YiAi FastAPI :10086 |
| 模型 | Ollama 本地实例（至少 2 个模型已加载，如 qwen2.5:3b + qwen2.5:7b） |
| 配置 | `config.yaml` 中 `rag.rag_llm_model` 已设置 |
| 前端（联调） | YiVad :8848 RAG 聊天页面 |

---

<a id="sec-3"></a>
## 三、测试用例

| # | 场景 | 输入 | 步骤 | 预期结果 | 优先级 |
|---|------|------|------|----------|--------|
| 1 | `rag_chat_stream` 不传 `model` 参数 | `model=None` | RPC 调用 | 使用 `settings.rag_llm_model` 作为默认模型，行为与之前完全一致 | P0 |
| 2 | `rag_chat_stream` 传指定 `model` | `model="qwen2.5:7b"` | RPC 调用 | 使用 `qwen2.5:7b` 而非 `settings.rag_llm_model` | P0 |
| 3 | `rag_chat_stream` 传无效 `model` | `model="nonexistent"` | RPC 调用 | 返回模型不可用错误（错误码 2001），含可读错误信息 | P0 |
| 4 | 通过 RPC 信封调用带自定义模型 | `parameters: { query, model: "llama3.1:8b" }` | RPC 调用 | SSE 流正常返回，使用指定模型 | P0 |
| 5 | 通过 RPC 信封调用不带模型 | `parameters: { query }` | RPC 调用 | SSE 流正常返回，使用默认模型 | P0 |
| 6 | `settings.rag_llm_model` 未配置且不传 `model` | `model=None`, `settings.rag_llm_model=None` | RPC 调用 | 返回配置错误（错误码 2001） | P0 |
| 7 | `RagChatRequest` schema 验证 | model 字段为 `Optional[str]` | Pydantic 校验 | model 缺失不报错，传入非 str 类型报错 1001 | P1 |
| 8 | SSE 响应格式兼容性 | 带/不带 model 参数 | 检查 SSE 消息格式 | `data: {...}` 格式不变，响应头 `Content-Type: text/event-stream` 不变 | P0 |
| 9 | 前端 YiVad RAG 页面模型选择器 | 选择非默认模型后发送查询 | 端到端流程 | 后端使用所选模型生成回答，响应正常显示 | P1 |
| 10 | 模型参数不影响非 RAG 聊天 | 普通聊天（非 RAG）传 model | 普通 chat | model 参数被忽略或正确传递（取决于实现范围） | P1 |

---

<a id="sec-4"></a>
## 四、边界与异常测试

| # | 场景 | 输入 | 预期结果 |
|---|------|------|----------|
| E1 | model 参数为空字符串 | `model=""` | 等同于 model=None，使用默认模型 |
| E2 | model 参数大小写敏感 | `model="Qwen2.5:7B"` vs ollama list 显示 "qwen2.5:7b" | 应做大小写不敏感匹配或返回明确错误 |
| E3 | 模型在 Ollama 中存在但未加载 | `model="qwen2.5:14b"` (已 pull 但未 load) | Ollama 自动加载（有延迟），最终正常响应 |
| E4 | 并发请求不同模型 | 同时请求 model A 和 model B | 两个请求分别使用各自指定的模型，不互相干扰 |

---

<a id="sec-5"></a>
## 五、回归测试

| # | 场景 | 验证方法 |
|---|------|----------|
| R1 | 不传 model 时行为与旧版本完全一致 | 对比旧版本（无 model 参数）的输出结果，验证一致性 |
| R2 | 现有 RAG 测试用例全部通过 | 运行 `tests/` 下所有 RAG 相关测试，确保零回归 |

---

<a id="sec-6"></a>
## 六、可追溯性矩阵

| 测试用例 | 覆盖 PRD 验收标准 |
|----------|-------------------|
| TC-1, TC-5 | 不传 model 行为一致（零回归） |
| TC-2, TC-4 | 传 model 时正确替换 settings.rag_llm_model |
| TC-3, TC-6 | 无效模型名返回可读错误（错误码 2001），不崩溃 |
| TC-7 | `RagChatRequest` schema 包含可选 `model: Optional[str]` 字段 |
| TC-8 | SSE 流响应头/格式不变 |
| TC-9 | 前后端联调通过（YiVad RAG 页面模型选择器） |
| TC-10 | 非 RAG 场景不受影响 |

---

<a id="sec-7"></a>
## 七、覆盖率缺口

| 缺口 | 原因 | 优先级 |
|------|------|--------|
| 所有 Ollama 可用模型的全面测试 | 需实际加载多个模型，GPU 显存有限 | P2 |
| 模型切换对长对话上下文的影响 | 需构造长对话场景 | P3 |
| YiPet 扩展的 RAG 模型选择联调 | 跨项目联调，优先级较低 | P3 |