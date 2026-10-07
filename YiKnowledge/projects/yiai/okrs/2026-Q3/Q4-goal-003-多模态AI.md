---
type: okr-goal
id: yiai-q4-003
title: "多模态 AI 与智能推理优化"
status: planned
period: "2026 Q4"
owner: 陈铭
project: YiAi
project_id: yiai
progress: 5
updated: 2026-09-23
kr1: "多模态模型接入 — 图像理解 (GPT-4V/Claude Vision) + 音频转录 (Whisper)，从 text-only → 2 种模态"
kr1_completion: 0
kr2: "智能模型路由 — 基于任务复杂度/成本/延迟的自动模型选择 + fallback 链，决策准确率 >90%"
kr2_completion: 10
kr3: "成本优化引擎 — Token 用量追踪 + 模型推荐（性价比最优）+ 预算告警，调用成本降低 30%"
kr3_completion: 10
kr4: "Prompt 管理平台 — 模板版本管理 + A/B 测试 + 效果评估，Prompt 变更可追溯可回滚"
kr4_completion: 5
metric1_id: "yiai-q4-m07"
metric1_desc: "多模态支持能力数"
metric1_current: "0 (text-only)"
metric1_target: "2 (image + audio)"
metric2_id: "yiai-q4-m08"
metric2_desc: "LLM 调用成本降低"
metric2_current: "baseline"
metric2_target: "-30%"
metric3_id: "yiai-q4-m09"
metric3_desc: "模型路由决策准确率"
metric3_current: "N/A"
metric3_target: ">90%"
related_prds:
  - projects/yiai/prds/2026-Q4/03-需求-多模态AI.md
  - projects/yiai/prds/2026-09/160-需求-多模态支持-图像理解.md
  - projects/yiai/prds/2026-09/168-需求-音频转录与处理.md
  - projects/yiai/prds/2026-09/171-需求-意图分类与路由.md
  - projects/yiai/prds/2026-09/189-需求-多模型路由与fallback.md
  - projects/yiai/prds/2026-09/201-需求-成本优化引擎.md
  - projects/yiai/prds/2026-09/162-需求-Prompt压缩与优化服务.md
  - projects/yiai/prds/2026-09/19-需求-LLM-Prompt模板管理与版本控制.md
  - projects/yiai/prds/2026-09/230-需求-对话模板版本管理.md
---

# 多模态 AI 与智能推理优化

> Q4 AI 能力升级目标。在 Q3 LLM 统一架构（ModelRuntime 抽象层 + 4 Provider）的基础上，从纯文本扩展到多模态输入，建立智能模型路由和成本优化体系，从"能调用所有模型"到"为每个请求智能选择最优模型"。

---

## 背景

Q3 建立了 ModelRuntime 抽象层——Ollama、DeepSeek、OpenAI、Anthropic 四个 Provider 通过统一的 `astream()` 和 `astream_events()` 接口接入。但三个核心问题未解决：

**模态限制**：ModelRuntime 仅处理文本。产品截图分析、会议录音转录、设计稿评审等多模态场景无法覆盖。YiVad 的 Bug 提交流程中，用户粘贴截图只能以 `static_files` 存储，Agent 无法理解图片内容。

**模型选择靠人工**：5 个可用模型（Ollama qwen2.5、DeepSeek V3、GPT-4o、Claude Opus、Claude Haiku）各有不同的成本/质量/延迟特征。当前模型选择由前端传参决定——用户或开发者需要在发起请求时指定模型名。缺乏自动路由能力——简单问候用 Opus（60 tokens，过犹不及）、复杂代码生成用 Haiku（能力不足）是两种对称的浪费。

**成本不透明**：LLM 调用无成本追踪。无法回答"上个月 LLM 总花费多少？""哪个用户消耗最多 Token？""用 DeepSeek 替代 GPT-4o 能节省多少？"。Prompt 过长导致 Token 浪费无感知——Agent 复杂任务累积 12K tokens 上下文，其中 30% 是重复或冗余内容。

Q4 分三个轨道推进：输入模态扩展（多模态）、模型使用优化（智能路由 + 成本控制）、Prompt 工程系统化（版本管理 + A/B 测试）。

---

## 季度演进

### 十月 — 多模态接入 + 成本追踪

**多模态基础**（KR1）：
- 图像理解：扩展 ModelRuntime 接口增加 `images` 参数（`List[ImageContent]`），GPT-4V 和 Claude Vision 的请求格式适配
- 音频转录：Whisper API 集成（本地 Ollama Whisper 或 OpenAI Whisper API），`audio -> text` 管道

**成本追踪**（KR3）：
- Token 用量采集：在 `chat_service` 的 LLM 调用点注入 Token 计数（prompt_tokens + completion_tokens）
- 成本计算：Provider × Model × Token 单价的成本映射表（`src/services/ai/cost_tracker.py`）
- 预算告警：月度预算阈值（用户/全局），超 80% 企微预警，超 100% 调用降级为最廉价模型

### 十一月 — 智能路由 + Prompt 管理

**智能模型路由**（KR2）：
- 任务复杂度分类：简单问答（聊天、问候、简单知识查询）→ Haiku；中等推理（代码解释、数据分析）→ Sonnet/Qwen；复杂推理（架构设计、多步调试）→ Opus/GPT-4o
- 路由决策引擎：`src/services/ai/model_router.py` 根据任务分类 + 成本预算 + 延迟要求 + Provider 可用性做加权决策
- Fallback 链：Primary → Secondary → Ollama 兜底（确保服务不中断）

**Prompt 管理平台**（KR4）：
- 模板版本管理：`src/services/ai/prompts/` 下的 prompt 模板纳入 Git 版本控制，支持语义版本号
- A/B 测试框架：同一请求随机分配 Prompt 变体，采集完成率/延迟/Token 消耗，统计显著性检验
- Prompt 效果评估：`Template.evaluate()` 返回 score（完成率 + 响应质量 + Token 效率）

### 十二月 — 优化与集成

- **Prompt 压缩上线**（Q3 context compaction 的后续）：自动触发压缩（会话 >10 轮）、Embedding 相似度去重
- **成本优化闭环**：基于 2 个月的 Token 用量数据，自动推荐成本优化方案（如"会话 xxx 的 30% Token 是重复内容，启用压缩可节省 $12/月"）
- **YiPet 多模态集成**：宠物角色可识别用户发送的截图内容，提供上下文感知的回复

---

## 关键结果

| KR | 描述 | 完成度 |
|---|------|--------|
| KR1 | 多模态接入 — 图像理解 + 音频转录 | 0% |
| KR2 | 智能模型路由 — 自动选择 + fallback 链 | 10% |
| KR3 | 成本优化引擎 — Token 追踪 + 预算告警 + -30% 成本 | 10% |
| KR4 | Prompt 管理平台 — 版本管理 + A/B 测试 + 效果评估 | 5% |

---

## KR1 — 多模态接入

### 现状

ModelRuntime 的接口 `astream(messages: List[Message])` 仅支持 `content: str` 类型。图片处理路径为：`static_files` 存储 → 前端展示。Agent 无法读取图片内容。

### 方案

**ModelRuntime 接口扩展**（`src/services/ai/model_runtime.py`）：

```python
class ContentPart(TypedDict, total=False):
    type: Literal["text", "image_url", "image_base64"]
    text: str
    image_url: str  # HTTP URL
    image_base64: str  # base64 编码

class Message(TypedDict):
    role: Literal["system", "user", "assistant", "tool"]
    content: str | list[ContentPart]  # ← 扩展：支持多模态内容
```

**图像理解管道**：
```
用户上传图片 (YiVad/YiPet)
  → YiAi /write-file 存储到 static_files/
  → chat_service 构建 Message: content = [
       {"type": "text", "text": "分析这张产品截图中的 UI 布局问题"},
       {"type": "image_url", "image_url": "http://localhost:10086/static/xxx.png"}
    ]
  → ModelRouter 路由到 GPT-4V 或 Claude Vision
  → astream() 返回流式文本分析结果
```

**音频转录管道**：
```
用户上传音频 (mp3/wav/m4a)
  → /write-file 存储
  → Whisper API: POST /v1/audio/transcriptions (OpenAI 兼容)
  → 转录文本注入会话上下文
  → Agent 处理文本（摘要/提取/分类等）
```

**Provider 适配**：
- GPT-4V：`content: [{type: "text", text: ...}, {type: "image_url", image_url: {url: "..."}}]`
- Claude Vision：`content: [{type: "text", text: ...}, {type: "image", source: {type: "base64", data: "..."}}]`
- 格式转换在 ModelRuntime Provider 层处理，上层透明

### 验证

- 上传一张产品截图 + "分析这个页面的布局问题" → Agent 返回布局分析（含元素识别 + 改进建议）
- 上传一段 30s mp3 录音 → 转录为文字 → 存储到会话上下文
- 不支持的模型（Ollama qwen2.5）收到图片 → 返回明确错误码（`ErrorCode.MULTIMODAL_NOT_SUPPORTED`）

---

## KR2 — 智能模型路由

### 现状

5 个可用模型，选择由前端 `model` 参数决定。问题：
- 简单问候调用 Opus → 浪费（$15/1M tokens vs Haiku $0.25/1M tokens，60x 价格差）
- 复杂代码生成调用 Haiku → 结果不理想，重试 2-3 次，总成本反而更高
- Ollama 超时 → 前端白屏等待 → 无自动 fallback

### 方案

**路由决策引擎**（`src/services/ai/model_router.py`）：

```python
class ModelRouter:
    async def route(self, messages: list[Message], constraints: RouteConstraints) -> RouteDecision:
        """
        1. 任务分类（LLM few-shot）:
           - simple: 问候/闲聊/简单问答 → priority: cost > latency
           - moderate: 代码解释/数据分析/知识检索 → priority: quality > cost
           - complex: 架构设计/多步调试/长文档生成 → priority: quality > latency > cost

        2. 模型池过滤:
           - 多模态请求 → 仅 vision-capable 模型
           - 预算耗尽 → 仅免费/廉价模型
           - 超长上下文 (>128K) → 仅 200K 窗口模型

        3. 加权评分:
           score = quality_weight × quality_score + cost_weight × (1 - cost_score)
                 + latency_weight × (1 - latency_score)
        4. Fallback 链构建: 取 Top-3 模型，按优先级排序
        """
```

**Fallback 链**：
```
Primary (top score) → 超时/错误?
  → Secondary → 超时/错误?
    → Ollama 本地模型 (兜底, 保证不中断)
```

Fallback 触发条件：LLM 超时、Provider 5xx 错误、返回空响应。每次 Fallback 记录到 `model_route_log` 集合。

**路由决策日志**：每次路由决策记录 `{request_id, task_type, candidates, selected, reason, fallback_used}`，用于 A/B 测试和路由策略迭代。

### 验证

- "Hello" → 路由到 Haiku（simple 任务，成本优先）
- "Refactor this 500-line module to use dependency injection" → 路由到 Opus（complex 任务，质量优先）
- 含图片的消息 → 路由到 Claude Vision（vision-capable）
- 断开 DeepSeek API → 自动 Fallback 到 Ollama qwen2.5 → 路由日志记录 fallback

---

## KR3 — 成本优化引擎

### 现状

LLM 调用无成本追踪。ModelRuntime 的 `astream()` 不记录 Token 用量。

### 方案

**Token 用量采集**（`src/services/ai/cost_tracker.py`）：

```python
class CostTracker:
    USAGE_COLLECTION = "llm_usage"  # MongoDB 集合

    async def record(self, usage: UsageRecord):
        """记录单次 LLM 调用用量"""
        # usage: {request_id, user_id, session_id, provider, model,
        #         prompt_tokens, completion_tokens, duration_ms, cost_usd}

    async def get_user_usage(self, user_id: str, period: str) -> UsageSummary:
        """查询用户用量：today/week/month/custom"""

    async def get_model_stats(self, period: str) -> list[ModelStat]:
        """查询各模型的调用量/成本/Token 分布"""
```

**成本计算**（硬编码价格表 + 可配置覆盖）：

| Provider | Model | Input $/1M tokens | Output $/1M tokens |
|----------|-------|-------------------|--------------------|
| Ollama | qwen2.5 | $0 | $0 |
| DeepSeek | deepseek-chat | $0.14 | $0.28 |
| OpenAI | GPT-4o | $2.50 | $10.00 |
| OpenAI | GPT-4o-mini | $0.15 | $0.60 |
| Anthropic | Claude Opus 4 | $15.00 | $75.00 |
| Anthropic | Claude Haiku 3.5 | $0.25 | $1.25 |

**预算告警**（`src/services/ai/budget_alert.py`）：
- 用户级月度预算：默认 $20/用户，管理员可配置
- 全局月度预算：通过 `config.yaml` 的 `ai.budget.monthly_limit` 配置
- 告警阈值：80% → 企微预警（"本月已消耗 $16/$20"），100% → 调用降级为最廉价模型 + 企微通知

**成本优化建议**（定时任务，weekly）：
- 扫描 `llm_usage` 集合，识别高成本模式
- 规则示例：同一会话中 30% Token 为重复内容 → 建议启用上下文压缩
- 企微推送周报："本周 LLM 总花费 $42.30，Top 用户：user_a $15.20 (36%)，可优化：启用 prompt caching 节省 ~$8"

### 验证

- 调用 10 次 GPT-4o 聊天 → `llm_usage` 集合有 10 条记录 → Dashboard 可见 Token 用量曲线
- 设置用户月度预算 $1 → 第 5 次调用后超过 80% → 企微预警 → 预算耗尽后自动切换为 Haiku
- 周报推送 → 含模型用量分布饼图 + 成本优化建议

---

## KR4 — Prompt 管理平台

### 现状

Prompt 模板散落在代码各处：`chat_service.py` 的 system prompt、Agent 循环的 think prompt、工具调用的 few-shot 示例。修改 Prompt 需要改代码 → 提交 → 部署。无法 A/B 测试 Prompt 效果。

### 方案

**Prompt 模板系统**（`src/services/ai/prompts/`）：

```
src/services/ai/prompts/
├── __init__.py              # PromptRegistry: 模板注册中心
├── templates/
│   ├── chat_system.yaml     # 聊天 system prompt 模板
│   ├── agent_think.yaml     # Agent think 步骤 prompt
│   ├── rag_query.yaml       # RAG 查询改写 prompt
│   ├── code_review.yaml     # 代码审查 prompt
│   └── ...
├── versions/                # 历史版本快照（Git 管理即可）
└── evaluator.py             # 效果评估引擎
```

**模板格式**（YAML，支持 Jinja2 变量）：

```yaml
# chat_system.yaml
name: chat_system
version: 1.2.0
description: "聊天对话的 system prompt 模板"
model: default
variables:
  - name: role_name
    description: "AI 角色名称"
    default: "Yi"
  - name: knowledge_context
    description: "知识库检索上下文"
    default: ""
template: |
  You are {{ role_name }}, a helpful AI assistant.
  {% if knowledge_context %}
  Use the following context to answer questions:
  {{ knowledge_context }}
  {% endif %}
```

**A/B 测试框架**（`src/services/ai/prompts/evaluator.py`）：
- 为同一场景注册 A/B 两个 Prompt 变体
- 请求时随机选择 → 记录 variant_id
- 采集指标：任务完成率、响应延迟、Token 消耗、用户反馈（thumbs up/down）
- 统计检验：样本量 >100 后，t-test 判断显著差异

### 验证

- 修改 `chat_system.yaml` 的 system prompt → 重启服务后新会话使用新 prompt → 旧版本可从 Git 历史恢复
- A/B 测试启动 → Dashboard 显示 A/B 两个变体的完成率对比 → 统计显著性标记
- 评估引擎返回 score → Prompt 变更合并两阶段：开发验证（单元测试）→ 线上 A/B 测试（统计检验）

---

## 风险与缓解

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|---------|
| 图像理解质量不达预期（产品截图复杂） | 中 | 中 | 初期仅支持简单场景（UI 布局分析），复杂场景标注为实验性 |
| 模型路由决策错误（简单任务路由到 Opus） | 中 | 低 | Fallback 链保证服务可用；决策日志可审计；路由策略可热更新 |
| Prompt A/B 测试样本量不足 | 高 | 中 | 低流量场景（<100 次/天）跳过统计检验，仅定性评估 |
| Whisper 转录质量受中文口音影响 | 中 | 中 | 初期仅支持清晰普通话，非正式场景标注准确率预期 |
| Token 成本计算价格表过时 | 低 | 低 | 价格表存于 `config.yaml`，Provider 价格变更时仅需更新配置 |

---

## 交付里程碑

| 月份 | 里程碑 | 关键交付 |
|------|--------|---------|
| 10月第1周 | ModelRuntime 多模态接口扩展 | ContentPart 类型 + `images` 参数支持 |
| 10月第2周 | GPT-4V 图像理解接入 | Provider 适配 + 图片 → 文本管道 |
| 10月第3周 | Claude Vision 接入 + Whisper 音频转录 | 多 Provider Vision + 转录管道 |
| 10月第4周 | Token 用量 + 成本追踪上线 | `cost_tracker.py` + `llm_usage` 集合 + Dashboard |
| 11月第1周 | 智能模型路由 v1 | `model_router.py` + 任务分类 + 加权评分 |
| 11月第2周 | Fallback 链 + 路由日志 | 三级 Fallback + `model_route_log` 集合 |
| 11月第3周 | Prompt 模板系统 + 版本管理 | `prompts/` 目录 + YAML 模板 + 注册中心 |
| 11月第4周 | A/B 测试框架 + 效果评估 | `evaluator.py` + Dashboard A/B 对比视图 |
| 12月第1周 | 预算告警 + 成本优化建议 | 80%/100% 阈值告警 + weekly 优化报告 |
| 12月第2周 | Prompt 压缩上线（Q3 延续） | 自动触发 + Embedding 去重 |
| 12月第3周 | YiPet 多模态集成 | 宠物角色截图识别 + 上下文回复 |
| 12月第4周 | 季度回顾 + 路由策略调优 | 路由准确率评估 + 成本节省计算 |

---

## 影响

| 维度 | Q3 现状 | Q4 目标 |
|------|--------|--------|
| 输入模态 | 纯文本 | 文本 + 图像 + 音频 |
| 模型选择 | 前端手动指定 | 智能路由，决策准确率 >90% |
| 成本可见性 | 无追踪 | 按用户/会话/模型的实时 Token 统计 |
| LLM 调用成本 | baseline | -30%（路由 + 压缩 + 缓存） |
| Prompt 管理 | 代码中硬编码 | YAML 模板 + 版本管理 + A/B 测试 |
| 服务可用性 | 单模型故障 → 用户感知 | Fallback 链自动切换，无感知 |

---

## 未竟事项（Q1 2027 展望）

| 事项 | Q1 归属 |
|------|---------|
| 多模态输出（图片/图表生成） | 多模态能力扩展专项 |
| 模型微调（LoRA on 业务数据） | AI 基础设施专项 |
| 视频理解（会议录像分析） | 多模态 2.0 专项 |
| 跨模态检索（图片→知识库文本） | RAG 引擎扩展专项 |
| Prompt 社区市场（模板共享） | 平台生态专项 |