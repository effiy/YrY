---

doc_type: test
title: "YA-10-03: 多模态 AI 与智能推理优化 — 测试规格"
status: 待开始
priority: P1
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-23
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202610"
prd_task_id: "YA-10-03"
source_prds: ["03-需求-多模态AI"]
source_modules: ["03-prd-task-多模态AI"]
source_okr: [yiai-q4-003]

type: test
---

# YA-10-03: 多模态 AI 与智能推理优化 — 测试规格

> 来源 PRD：[03-需求-多模态AI.md](../../prds/2026-Q4/03-需求-多模态AI.md)
> 开发方案：[03-prd-task-多模态AI.md](../../devs/2026-Q4/03-prd-task-多模态AI.md)
> 需求编号：YA-10-03 · 优先级：P1

> **文档职责**：本文档定义**怎么验证**（VERIFY）。覆盖多模态消息、视觉推理、语音转录、智能路由、成本追踪、预算告警、Prompt 管理和 A/B 测试 8 个功能域。

---

## 一、测试范围

| KR | 功能域 | 测试重点 | 用例数 |
|-----|--------|---------|--------|
| KR1 | 多模态消息 | ContentPart 类型构造、Provider 格式转换、不兼容模型报错 | 4 |
| KR1 | 语音转录 | 音频上传转写、格式校验、大文件分片 | 3 |
| KR2 | 智能路由 | 任务分类准确度、加权评分、Fallback 链、超时/异常降级 | 5 |
| KR3 | 成本追踪 | Token 计数、费用计算、多维度查询 | 3 |
| KR3 | 预算告警 | 80% WARNING、100% CRITICAL + 降级、冷却机制 | 3 |
| KR4 | Prompt 管理 | YAML 加载、Jinja2 渲染、版本回滚 | 3 |
| KR4 | A/B 测试 | 变体分配确定性、统计显著性检测 | 2 |

---

## 二、测试用例

### TC-MULTIMODAL-001：构造图片 ContentPart — ImageUrlPart

- **Given** 系统已加载 `provider_types.ContentPart` 类型定义
- **When** 构造 `MultimodalMessage(role="user", content=[TextPart(text="描述这张图"), ImageUrlPart(image_url="https://example.com/photo.png")])`
- **Then** `is_multimodal(message)` 返回 `True`
- **And** `has_images(message.content)` 返回 `True`
- **And** `has_audio(message.content)` 返回 `False`
- **And** `extract_text(message.content)` 返回 `"描述这张图"`

### TC-MULTIMODAL-002：GPT-4V Provider 请求格式转换

- **Given** `GPT4VisionRuntime` 已初始化（api_key="sk-test"）
- **When** 传入 `content_parts=[TextPart(text="描述图片"), ImageUrlPart(image_url="https://example.com/chart.png", detail="high")]`
- **Then** 构造的 OpenAI API 请求 messages 中最后一条 user 消息的 content 为：
  - `[{"type": "text", "text": "描述图片"}, {"type": "image_url", "image_url": {"url": "https://example.com/chart.png", "detail": "high"}}]`
- **And** model 参数包含在 VISION_MODELS 元组中

### TC-MULTIMODAL-003：Claude Vision Provider base64 格式转换

- **Given** `ClaudeVisionRuntime` 已初始化（api_key="sk-ant-test"）
- **When** 传入 `content_parts=[TextPart(text="分析图表"), ImageBase64Part(media_type="image/png", data="iVBORw0KGgo...")]`
- **Then** 构造的 Anthropic API 请求 messages 中 content 为：
  - `[{"type": "text", "text": "分析图表"}, {"type": "image", "source": {"type": "base64", "media_type": "image/png", "data": "iVBORw0KGgo..."}}]`
- **And** `data` 字段为纯 base64 字符串（不含 `data:image/...;base64,` 前缀）

### TC-MULTIMODAL-004：非视觉模型拒绝图片请求

- **Given** `OpenAIRuntime` 初始化（model="gpt-3.5-turbo"）
- **When** 传入 `content_parts=[ImageUrlPart(image_url="https://example.com/photo.png")]`
- **Then** 返回错误 `ErrorCode.AI_MODEL_UNSUPPORTED`（错误码 `2003`）
- **And** 错误消息包含 "does not support image input" 或类似描述
- **And** 没有实际的 API 调用发出

---

### TC-TRANSCRIBE-001：音频上传转录为文本

- **Given** `WhisperService` 已初始化（backend=LOCAL, model="tiny"）
- **When** 传入 5 秒中文 WAV 音频数据（包含 "你好世界" 语音）
- **Then** `transcribe()` 返回 `TranscriptionResult`
- **And** `TranscriptionResult.text` 包含 "你好" 或 "世界"（允许轻微转写误差）
- **And** `TranscriptionResult.language` 为 "zh"
- **And** `TranscriptionResult.backend` 为 "local"
- **And** `TranscriptionResult.duration_seconds` > 4.0 且 < 6.0

### TC-TRANSCRIBE-002：不支持的音频格式拒绝

- **Given** `WhisperService` 已初始化
- **When** 传入 `.exe` 文件数据，filename="malware.exe"
- **Then** `validate()` 返回 `(False, "不支持的文件格式: exe")` 或类似错误
- **And** 不调用任何转录后端

### TC-TRANSCRIBE-003：大文件分片转写

- **Given** `WhisperService` 已初始化（backend=LOCAL, model="tiny"）
- **When** 传入 120 秒音频文件（超过单次处理阈值）
- **Then** 音频被切分为多个片段（每段 30-60 秒）
- **And** 所有片段按顺序转写后进行拼接
- **And** 最终 `TranscriptionResult.text` 包含全部 120 秒的转写内容
- **And** `TranscriptionResult.segments` 包含至少 2 个片段

---

### TC-ROUTER-001：简单问候路由到低成本模型

- **Given** `ModelRouter` 已初始化（所有候选模型可用）
- **When** 路由 `messages=[{"role": "user", "content": "你好，今天天气怎么样？"}]`
- **Then** `TaskClassifier.classify()` 返回 `TaskComplexity.SIMPLE`
- **And** `RoutingDecision.primary.tier` 为 `ModelTier.CHEAP`
- **And** `RoutingDecision.primary.model_name` 为 haiku 或 qwen2.5 等低成本模型
- **And** `RoutingDecision.confidence` > 0.5

### TC-ROUTER-002：复杂代码请求路由到高端模型

- **Given** `ModelRouter` 已初始化
- **When** 路由 `messages=[{"role": "user", "content": "Implement a concurrent LRU cache in Python with TTL expiration and async eviction callbacks. Include thread safety and lock-free read path."}]`
- **Then** `TaskClassifier.classify()` 返回 `TaskComplexity.COMPLEX`
- **And** `RoutingDecision.primary.tier` 为 `ModelTier.PREMIUM`
- **And** `RoutingDecision.primary.model_name` 为 opus 或 gpt-4o 等高端模型
- **And** `RoutingDecision.confidence` > 0.5

### TC-ROUTER-003：多模态请求自动路由到视觉模型

- **Given** `ModelRouter` 已初始化
- **When** 路由 `has_images=True` 或 `TaskClassifier.classify()` 检测到图片
- **Then** 返回 `TaskComplexity.MULTIMODAL`
- **And** `RoutingDecision.primary.tier` 为 `ModelTier.VISION`
- **And** `RoutingDecision.primary.supports_vision` 为 `True`

### TC-ROUTER-004：主模型超时触发 Fallback

- **Given** `ModelRouter` 已初始化，`deepseek-chat` 模拟超时（30s 无响应）
- **When** 路由决策 primary 为 `deepseek-chat`，调用超时
- **Then** 自动触发 Fallback 到 `fallback_chain[0]`
- **And** 最终成功返回的 `UsageRecord.fallback_used` 为 `True`
- **And** 日志输出包含 WARNING 级别的 fallback 信息
- **And** 断路器记录一次失败

### TC-ROUTER-005：连续失败触发断路器打开

- **Given** `ModelRouter` 已初始化，`deepseek-chat` 连续 5 次调用失败
- **When** 第 6 次请求路由时
- **Then** 断路器 `allow()` 返回 `False`
- **And** `deepseek-chat` 从候选模型列表中移除
- **And** 路由结果不包含 `deepseek-chat`（包括 primary 和 fallback_chain）
- **And** 在冷却期（默认 60s）结束后，断路器恢复半开状态

---

### TC-COST-001：Token 计费准确性

- **Given** `CostTracker` 已初始化，`PriceTable` 包含 gpt-4o: $0.005/1K prompt + $0.015/1K completion
- **When** 记录一次调用：`prompt_tokens=1200, completion_tokens=350`
- **Then** `PriceTable.calculate_cost("gpt-4o", 1200, 350)` 返回约 `0.01125` USD
  - 公式：1200/1000 * 0.005 + 350/1000 * 0.015 = 0.006 + 0.00525 = 0.01125

### TC-COST-002：按用户和日期查询用量

- **Given** `llm_usage` 集合中有以下记录：
  - user_a, 2026-10-01, gpt-4o, cost=0.01
  - user_a, 2026-10-01, gpt-4o-mini, cost=0.001
  - user_b, 2026-10-01, claude-3-haiku, cost=0.002
  - user_a, 2026-10-02, gpt-4o, cost=0.02
- **When** 执行 `cost_tracker.query_usage(user_id="user_a", start_date=date(2026,10,1), end_date=date(2026,10,1), group_by="day")`
- **Then** 返回 `[{date: "2026-10-01", total_tokens: ..., total_cost: 0.011, call_count: 2}]`
- **And** user_b 的记录不在结果中

### TC-COST-003：Ollama 本地模型成本为 0

- **Given** `CostTracker` 已初始化
- **When** 记录一次 Ollama 调用：`model="qwen3.5", prompt_tokens=500, completion_tokens=200`
- **Then** `PriceTable.calculate_cost("qwen3.5", 500, 200)` 返回 `0.0`
- **And** `UsageRecord.cost_usd` 为 `0.0`
- **And** `UsageRecord.total_tokens` 仍为 `700`

---

### TC-BUDGET-001：80% 预算触发 WARNING 通知

- **Given** 月度预算 $50，当前累计费用 $40（80%）
- **When** `BudgetAlert.check()` 被调用
- **Then** 返回 `BudgetStatus.level == AlertLevel.WARNING`
- **And** `BudgetStatus.percentage` 约等于 `0.80`
- **And** 企业微信 webhook 被调用一次（发送 WARNING 消息）
- **And** `is_degraded` 仍为 `False`（未进入降级模式）

### TC-BUDGET-002：100% 预算触发 CRITICAL 降级

- **Given** 月度预算 $50，当前累计费用 $50.50（101%）
- **When** `BudgetAlert.check()` 被调用
- **Then** 返回 `BudgetStatus.level == AlertLevel.CRITICAL`
- **And** `is_degraded` 变为 `True`
- **And** `ModelRouter.get_model_router().is_degraded` 返回 `True`
- **And** 后续请求中 `ModelTier.PREMIUM` 的模型不可用
- **And** 企业微信 webhook 被调用（发送 CRITICAL 消息，包含降级通知）
- **And** `budget_alerts` 集合中写入一条 `degradation_active: true` 的记录

### TC-BUDGET-003：告警冷却机制

- **Given** 预算已触发 WARNING（80%），上一次 WARNING 通知在 30 分钟前
- **When** `BudgetAlert.check()` 再次被调用（预算仍在 80% 以上）
- **Then** WARNING 级别的 `_should_alert()` 返回 `False`（冷却期 60 分钟未到）
- **And** 企业微信 webhook 不被调用（避免重复轰炸）
- **And** `BudgetStatus.level` 仍为 `AlertLevel.WARNING`

---

### TC-PROMPT-001：YAML 模板加载和 Jinja2 渲染

- **Given** `prompts/templates/chat/default.yaml` 存在，system_template 包含 `{{ system_role }}` 和 `{% if extra_context %}{{ extra_context }}{% endif %}`
- **When** 调用 `registry.render("chat_default", system_role="编程助手", extra_context="用户偏好 Python 3.11")`
- **Then** 返回的 system prompt 包含 "你是 编程助手"
- **And** 包含 "用户偏好 Python 3.11"
- **And** 不包含 Jinja2 模板语法残留（`{{` 和 `{%` 已被渲染）

### TC-PROMPT-002：Jinja2 条件渲染

- **Given** 模板包含 `{% if extra_context %}...{% endif %}` 块
- **When** 调用 `registry.render("chat_default", system_role="助手", extra_context="")`
- **Then** 返回的 system prompt 不包含 `{% if extra_context %}` 块中的内容
- **When** 调用 `registry.render("chat_default", system_role="助手", extra_context="RAG 结果：Python 是...")`
- **Then** 返回的 system prompt 包含 "RAG 结果：Python 是..."

### TC-PROMPT-003：Prompt 版本回滚

- **Given** `chat_default` 有 v1.0.0（status=deprecated）、v2.0.0（status=active）、v2.1.0（status=active）
- **When** 执行 `registry.rollback("chat_default", "1.0.0")`
- **Then** v1.0.0 的 status 变为 "active"
- **And** v2.0.0 和 v2.1.0 的 status 变为 "deprecated"
- **And** `registry.get("chat_default")` 返回 v1.0.0 的模板（因为 status=active）
- **And** 日志记录回滚操作：包含模板名、目标版本、操作时间

---

### TC-ABTEST-001：HASH 分配确定性

- **Given** ABTest 实验 "chat-prompt-v2"，变体 ["chat_default@2.0.0", "chat_default@2.1.0"]，流量分配 [0.5, 0.5]
- **When** 同一 user_id "user-123" 连续 10 次调用 `ab_test_manager.get_variant("user-123", "chat_default")`
- **Then** 10 次返回的变体完全相同（要么全是 2.0.0，要么全是 2.1.0）
- **And** 同一个用户不会在不同请求间切换变体

### TC-ABTEST-002：统计显著性检测

- **Given** `StatisticalTester` 已初始化
- **When** 传入两组有明显差异的满意度数据：
  - 变体 A：[3.0, 3.2, 2.8, 3.1, 3.0, 3.3, 2.9, 3.1, 3.0, 3.0, ...]（100 条，均值约 3.0）
  - 变体 B：[4.0, 4.2, 3.8, 4.1, 4.0, 4.3, 3.9, 4.1, 4.0, 4.0, ...]（100 条，均值约 4.0）
- **Then** `run_ttest(data_a, data_b)` 返回：
  - `significant: True`
  - `p_value < 0.001`
  - `effect_size > 2.0`（大效应量）
- **And** `ABTestResult.verdict` 为 "变体 B 显著优于变体 A，建议推广"

### TC-ABTEST-003：样本量不足时的保护

- **Given** ABTest 实验 `min_sample_size=100`
- **When** 变体 A 仅有 30 条数据，变体 B 仅有 28 条
- **Then** `evaluate("chat-prompt-v2", "user_satisfaction_score")` 返回：
  - `significant: False`
  - `verdict` 包含 "样本量不足"
- **And** 不输出误导性的显著性结论

---

## 三、边界与异常测试

| 编号 | 场景 | 输入 | 预期行为 |
|------|------|------|----------|
| EDGE-01 | 空 content_parts 列表 | `content_parts=[]` | `has_images()` 返回 False，视为纯文本消息 |
| EDGE-02 | 超长文本截断 | user message 包含 100K 字符 | TaskClassifier 截取前 2K 字符进行分类，Router 正常工作 |
| EDGE-03 | 所有 Provider 不可用 | 断路器全部打开 | Router 返回最后一个可用 tier 的模型，或返回 `ErrorCode.AI_UNAVAILABLE` |
| EDGE-04 | 价格表缺少模型 | model="new-unknown-model" | `PriceTable.get_price()` 返回 None，CostTracker 使用默认价格 $0.001/1K 并记录 WARNING |
| EDGE-05 | YAML 模板语法错误 | `system_template: "{{ unclosed_variable"` | `registry.load_all()` 记录 ERROR 日志，跳过该文件，其他模板正常加载 |
| EDGE-06 | Jinja2 未定义变量 | `{{ undefined_var }}` 存在于模板中 | Jinja2 默认抛出 `UndefinedError`，捕获后使用 `strict_undefined=False` 渲染为空字符串 |
| EDGE-07 | Whisper 音频全静音 | 5 秒全静音 WAV | 本地 Whisper 返回空文本或 "[静音]"，不抛异常 |
| EDGE-08 | 预算为 0（未设置） | `monthly_budget_usd=0` | BudgetAlert 跳过检查，不触发告警，不进入降级模式 |
| EDGE-09 | 并发 flush 数据竞态 | 2 个协程同时调用 `CostTracker.record()` + `_flush()` | `asyncio.Lock` 保护，无重复写入，无数据丢失 |
| EDGE-10 | ImageUrlPart URL 不可达 | `image_url="https://invalid.example.com/404.png"` | Claude Vision 下载超时（10s），抛出明确的网络错误，不返回幻觉结果 |

---

## 四、集成测试

| 编号 | 场景 | 验证点 |
|------|------|--------|
| INT-01 | 端到端图文对话 | 用户上传图片 + 文字 "图中有什么？" → Whisper（无音频跳过）→ TaskClassifier（multimodal）→ Router（选 GPT-4V）→ GPT4VisionRuntime → 返回描述 → CostTracker 记录 |
| INT-02 | 端到端语音转写 + 问答 | 音频 "帮我写一个冒泡排序" → WhisperService → Router（simple→cheap）→ Runtime → CostTracker 记录两段（Whisper + LLM 各一条） |
| INT-03 | 预算耗尽全链路 | 模拟当月费用 $50 → Router 禁用 premium → 复杂任务路由到 balanced tier → 用户收到 balanced tier 质量的回复 |
| INT-04 | A/B 测试端到端 | user_a 分配到变体 A → 使用 v2.0.0 prompt → 对话结束记录满意度 → user_b 分配到变体 B → 使用 v2.1.0 prompt |

---

## 五、可追溯性矩阵

| 用例编号 | 对应 FR | 对应 AC | KR | 优先级 |
|----------|---------|---------|-----|--------|
| TC-MULTIMODAL-001 | FR-01 | AC-01-01 | KR1 | P0 |
| TC-MULTIMODAL-002 | FR-02 | AC-02-01 | KR1 | P0 |
| TC-MULTIMODAL-003 | FR-02 | AC-02-02 | KR1 | P0 |
| TC-MULTIMODAL-004 | FR-02 | AC-02-04 | KR1 | P1 |
| TC-TRANSCRIBE-001 | FR-03 | AC-03-02 | KR1 | P0 |
| TC-TRANSCRIBE-002 | FR-03 | AC-03-03 | KR1 | P1 |
| TC-TRANSCRIBE-003 | FR-03 | — | KR1 | P2 |
| TC-ROUTER-001 | FR-04 | AC-04-01 | KR2 | P0 |
| TC-ROUTER-002 | FR-04 | AC-04-03 | KR2 | P0 |
| TC-ROUTER-003 | FR-04 | AC-04-02 | KR2 | P0 |
| TC-ROUTER-004 | FR-04 | AC-04-04 | KR2 | P0 |
| TC-ROUTER-005 | FR-04 | AC-04-06 | KR2 | P1 |
| TC-COST-001 | FR-05 | AC-05-01 | KR3 | P0 |
| TC-COST-002 | FR-05 | AC-05-02 | KR3 | P0 |
| TC-COST-003 | FR-05 | AC-05-03 | KR3 | P1 |
| TC-BUDGET-001 | FR-06 | AC-06-01 | KR3 | P0 |
| TC-BUDGET-002 | FR-06 | AC-06-02 | KR3 | P0 |
| TC-BUDGET-003 | FR-06 | AC-06-05 | KR3 | P1 |
| TC-PROMPT-001 | FR-07 | AC-07-01 | KR4 | P0 |
| TC-PROMPT-002 | FR-07 | AC-07-05 | KR4 | P1 |
| TC-PROMPT-003 | FR-07 | AC-07-04 | KR4 | P1 |
| TC-ABTEST-001 | FR-08 | AC-08-01 | KR4 | P0 |
| TC-ABTEST-002 | FR-08 | AC-08-03 | KR4 | P0 |
| TC-ABTEST-003 | FR-08 | AC-08-04 | KR4 | P1 |

**优先级定义：**
- P0：核心功能，阻塞发布（13 条）
- P1：重要功能，Release 前需完成（6 条）
- P2：边界/增强，可延后（2 条）

---

## 六、缺陷分级

| 级别 | 定义 | 示例 |
|------|------|------|
| S0 — 阻断 | 纯文本聊天回归、服务无法启动 | Provider 初始化异常导致所有请求 500 |
| S1 — 严重 | 核心 KR 功能不可用 | 视觉模型返回空内容、路由器始终选择同一模型 |
| S2 — 一般 | 非核心功能异常 | Token 计数偏差 > 10%、A/B 测试分流不均 > 15% |
| S3 — 轻微 | 用户体验问题 | 预算告警冷却时间未生效、YAML 模板语法错误提示不明确 |

---

## 七、测试数据

### 图片测试数据

| 文件名 | 格式 | 大小 | 用途 |
|--------|------|------|------|
| `test_photo_800x600.png` | PNG | 200KB | 基础图片理解 |
| `test_chart_1600x1200.png` | PNG | 500KB | 图表分析（FR-02 detail=high） |
| `test_screenshot_chinese.png` | PNG | 1.2MB | 中文 OCR（FR-02 extract 任务） |
| `test_large_4096x3072.jpg` | JPEG | 14MB | 大图预处理/拒绝（FR-02 边界） |
| `test_invalid.exe` | EXE | 1MB | 格式校验拒绝（FR-03 边界） |

### 音频测试数据

| 文件名 | 格式 | 时长 | 语言 | 用途 |
|--------|------|------|------|------|
| `test_hello_cn.wav` | WAV | 3s | 中文 | 短音频转写（FR-03 basic） |
| `test_paragraph_en.mp3` | MP3 | 30s | 英文 | 中等长度转写 |
| `test_long_2min.wav` | WAV | 120s | 中文 | 大文件分片转写 |

### 路由基准测试数据

100 条混合请求（用于 `TC-ROUTER-004` 准确率验证）：
- 25 条 simple（问候、翻译、简单问答）
- 30 条 moderate（摘要、分类、概念解释）
- 30 条 complex（代码生成、数学推理、长文分析）
- 15 条 multimodal（图片描述、图表分析）
- 预期准确率 > 90%

---

## 八、测试环境要求

| 组件 | 要求 | 说明 |
|------|------|------|
| Python | 3.10+ | — |
| MongoDB | 7.0+ | 实际写入 `llm_usage`/`budget_alerts`/`ab_test_experiments` 集合 |
| OpenAI API Key | 有效 Key（集成测试） | GPT-4V 请求；单元测试可用 mock |
| Anthropic API Key | 有效 Key（集成测试） | Claude Vision 请求；单元测试可用 mock |
| Ollama | 运行中（含 qwen3.5:4b + llava:13b） | TaskClassifier + 本地视觉模型 |
| faster-whisper | pip install | 本地语音转录 |
| 测试框架 | pytest 8 + pytest-asyncio | 异步测试支持 |
| Mock 框架 | unittest.mock + respx | HTTP API mock |
| 企业微信 Webhook | 测试用 webhook URL | 验证告警通知发送 |

---

## 九、自动化现状

| 模块 | 状态 | 说明 |
|------|------|------|
| ContentPart 类型 | 待开发 | pytest 参数化：TextPart/ImageUrlPart/ImageBase64Part/AudioBase64Part |
| GPT4VisionRuntime | 待开发 | mock OpenAI API（respx），验证请求格式正确 |
| ClaudeVisionRuntime | 待开发 | mock Anthropic API（respx），验证 base64 编码和 content block 格式 |
| WhisperService | 待开发 | 本地 Whisper：真实模型，OpenAI Whisper：mock API |
| ModelRouter | 待开发 | mock LLM 分类器返回固定结果，验证 scorer 排序和 fallback 链构建 |
| CostTracker | 待开发 | 计算准确度用纯函数测试；MongoDB 读写用 mock |
| BudgetAlert | 待开发 | 模拟不同费用值，验证告警触发和冷却机制 |
| PromptRegistry | 待开发 | 临时 YAML 文件创建 + 清理，验证渲染和回滚 |
| ABTestManager | 待开发 | 固定 seed 验证 HASH 分配；生成正态分布数据验证 t-test |