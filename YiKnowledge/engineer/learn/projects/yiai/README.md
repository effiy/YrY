---
title: YiAi project card
tags: [YiAi, project-card, backend, FastAPI]
category: engineer/learn/projects/yiai
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "Engineers find YiAi architecture, dev standards, and functional modules with project-specific context"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - anti-patterns or when-not-to-use are identified
related:
  - ./架构设计.md
  - ./功能模块.md
  - ./开发规范.md
  - ../../../producter/projects/yiai/project-management.md
  - ../../../leader/decisions/yiai/route-llm-traffic-across-providers.md
  - ../../../leader/decisions/yiai/llm-multi-provider-rollout.md
  - ../../../leader/decisions/yiai/pytest-introduction.md
  - ../../../leader/decisions/yiai/rag-evaluation-infra.md
  - ../../../leader/decisions/yiai/brd-agent-launch.md
  - ../../../leader/decisions/yiai/knowledge-watcher-deployment.md
  - ../../../run/onboarding/yiai/onboarding.md
  - ./engineering/claude.md
  - ./engineering/readme.md
  - ../INDEX.md
---

# YiAi

> **作为** engineer，**我希望**理解并应用 YiAi 项目卡片，**以便**理解每个代码库背后的上下文和决策。

> AI + BRD agent。FastAPI 后端，Yi 家族服务端。

## 核心观点

**YiAi 是所有 Yi 家族数据的唯一事实来源，这种集中化既是其优势也是其脆弱性所在。** 每个项目（YiPet、YiVad）都依赖 YiAi 进行聊天、文件存储、会话和知识库访问。这消除了数据重复并将业务逻辑保持在一处，但意味着 YiAi 宕机会导致整个 Yi 家族瘫痪。降级对策（MongoDB 不可用时快速失败、Ollama 不可用时返回 503）已有文档记录，但不足以满足生产可靠性要求。

**RPC 信封模式比任何单个功能都更有价值。** `{module_name, method_name, parameters}` 信封允许任何客户端调用任何后端方法，无需为每个端点配置路由。这就是为什么 YiPet 和 YiVad 可以共享同一个后端，无需重复 API 表面。代价是参数名契约必须在三个代码库中强制执行，单个不匹配（例如 `query` vs `filter`）会静默破坏功能。

**缺少测试覆盖是项目最大的技术债务项。** 架构分层清晰（domain/services/server），但零测试意味着每次重构都带有未知的回归风险。pytest ADR 存在但尚未实施。第一次由重构的领域函数导致的生产事故将比任何 ADR 更有力地证明测试的必要性。

**知识监听器的轮询回退是关于平台特定失败模式的经验教训。** macOS FSEvents 在此机器上静默丢弃事件，因此监听器使用 apscheduler 每 5 秒轮询。这提醒我们，平台级 API 并非普遍可靠，每个文件监听功能都需要轮询回退。轮询间隔是响应性和 CPU 使用之间的权衡。

**MongoDB 作为唯一持久化存储且无缓存层，是单点故障。** 当 MongoDB 不可达时，每个功能（聊天、文件、会话、知识库）都会失败。没有读缓存、没有写缓冲区，除了返回错误外没有优雅降级。为频繁访问的知识文件添加读穿透缓存将是最高 ROI 的可靠性改进。

## 项目卡片

| 字段 | 值 |
|---|---|
| 定位 | 业务 AI 助手 + BRD 自动化 agent |
| 主要技术栈 | 参见 [架构设计摘要](./架构设计.md) / `engineering/claude.md` |
| 当前主要负责人 | 参见 [项目管理摘要](../../../producter/projects/yiai/project-management.md) 当前主要负责人节 |
| 业务领域 | 海外服务领域、售后业务、BRD 审批流程 |

## 子目录

- [架构设计摘要](./架构设计.md) — 架构概览（技术栈 / 模块边界 / 数据流 / 降级 / 反模式）
- [功能模块摘要](./功能模块.md) — 功能模块列表（10 个领域 / 7 个服务 / 13 个路由 / 数据 / 共享 / 模型）
- [开发规范摘要](./开发规范.md) — 开发规范（命名 / 分层 / RPC 字段契约 / SSE / 配置 / 提交 / lint 差距）
- [项目管理摘要](../../../producter/projects/yiai/project-management.md) — 项目管理（迭代节奏 / 交付物 / onboarding / 交接 / 周报日报复盘 / 跨项目链接）
- [ADR：多供应商 LLM 路由](../../../leader/decisions/yiai/route-llm-traffic-across-providers.md) — ADR：多供应商 LLM 路由选择 `llama_index.llms.*`，不引入 `pi-ai`
- [ADR：LLM 多供应商逐步铺开](../../../leader/decisions/yiai/llm-multi-provider-rollout.md) — ADR（实施）：多供应商 5 阶段逐步铺开（供应链加固前置 + 路由器 + 配置逐步铺开 + RAG 生成侧 + 端点/前端模型选择器）
- [ADR：pytest 引入](../../../leader/decisions/yiai/pytest-introduction.md) — ADR：引入 pytest + httpx + pytest-asyncio + coverage，目录 `tests/{unit,integration,eval}`
- [ADR：RAG 评估基础设施](../../../leader/decisions/yiai/rag-evaluation-infra.md) — ADR：基于 llama-datasets + ragas 4 指标 + 50 文档双语评估集 + CI 召回率回退 > 5% 阻止
- [ADR：BRD agent 上线](../../../leader/decisions/yiai/brd-agent-launch.md) — ADR：BRD agent 5 阶段上线方法论（结构契约优先 + RAG > 长 prompt + 流式 + 可编辑流回传 + 逐步铺开 + 反馈闭环）
- [ADR：Knowledge Watcher 部署](../../../leader/decisions/yiai/knowledge-watcher-deployment.md) — ADR（实施）：Knowledge Watcher 实现（apscheduler 轮询 + 增量索引 + 防抖 + 失败重试 + 监控；绕过 macOS FSEvents 事件丢失）
- [onboarding.md](../../../run/onboarding/yiai/onboarding.md) — 新人 onboarding
- [stories/](./stories/) — 业务需求内容（Story/Scene + BRD 章节）
  - [ai-chat-function/](./stories/ai-chat-function/) — AI 聊天功能
    - [user-send-message/](./stories/ai-chat-function/user-send-message/) — 用户发送消息
    - [conversation-history-management/](./stories/ai-chat-function/conversation-history-management/) — 对话历史管理
  - [overseas-after-sales-ai-brd-agent/](./stories/overseas-after-sales-ai-brd-agent/) — AI BRD agent
    - [brd-draft-generation/](./stories/overseas-after-sales-ai-brd-agent/brd-draft-generation/) — BRD 草稿生成
    - [multilingual-brd/](./stories/overseas-after-sales-ai-brd-agent/multilingual-brd/) — 多语言 BRD
    - [brd-approval-flow/](./stories/overseas-after-sales-ai-brd-agent/brd-approval-flow/) — BRD 审批流程
- [engineering/](./engineering/) — 项目工程文档镜像
  - `claude.md` — 项目 CLAUDE.md 镜像
  - `readme.md` — 项目 README.md 镜像

## 反模式

- **依赖 RPC 信封进行每次跨项目调用，但不记录参数契约。** 信封是通用的，但参数名不是自文档化的。`filter` vs `query`、`target_file` vs `path`、`cname` vs `collection_name`——每个不匹配都导致了真实 bug。每次跨项目集成前必须查阅 `engineering/claude.md` 中的契约表。

- **部署 YiAi 时没有 MongoDB 连接的健康检查和监控。** MongoDB 不可用导致所有功能失败。`/health/observer` 端点存在，但在没有自动化健康检查和告警的情况下部署，意味着 MongoDB 故障将由用户发现，而非运维人员。降级对策记录了失败模式，但未自动化恢复。

- **直接在路由或服务中添加新的领域逻辑，而不创建专用的 `domain/` 子包。** 架构方向是模块化。新功能应落地在 `domain/<name>/` 中，具有清晰的 `__init__.py` 公共 API，然后由 `services/<name>/` 封装。将处理器分散到现有文件中会创建"上帝模块"反模式，使代码库逐渐难以导航。

- **创建新领域模块时跳过 `__init__.py` 公共 API 表面。** `domain/files/` 和 `domain/wework/` 中的 `__init__.py` 文件重新导出公共可调用契约。跳过此文件会强制调用者从内部实现文件导入，创建紧耦合并使未来的重构不可能。每个领域模块必须有定义其公共 API 的 `__init__.py`。

- **假设双写持久化模型提供可靠备份。** 双写模式（磁盘主、MongoDB 备）是尽力而为的，不是事务性的。MongoDB 备份可能滞后或静默失败。对于需要可靠持久化的功能（例如会话历史），双写模型提供回退但不提供保证。关键数据应有额外的备份或复制机制。

## 近期变更

### 2026-08-08 — aiChat agent 通用数据工具 + 确认门禁

- **`domain/ai/data_tools.py`**（新增）：通用数据工具——`db_list`（只读）、`db_schema`（返回集合 schema 作为 LLM 上下文）、`db_create`/`db_update`/`db_delete`（写入由 `_WRITABLE_COLLECTIONS` + 确认门控）。领域知识存在于 `_COLLECTION_SCHEMAS` 中；agent 基于集合推理，而非硬编码的按领域工具。
- **`domain/ai/agent.py`**：确认门禁——发出 `confirmation_required`，通过 `_wait_for_confirmation` 暂停（轮询内存决策存储，120 秒超时），仅在 `"approved"` 时执行。确认 id 按轮次唯一化（`t{turn_index}:{call.id}`）以防止过时决策冲突。
- **原生 Ollama 工具调用**：`OllamaRuntime.stream_chat` 接受 `tools` 并转发结构化的 `tool_calls`。`<tool_call>` XML 文本解析器保留作为不支持原生工具调用的模型的回退。
- **工具参数验证**：`_validate_arguments` 在执行前根据注册的 JSON schema 检查工具调用参数——缺失必填字段和类型不匹配返回模型可读的错误，使模型可以自我纠正。
- **长度截止工具调用失败**：当响应达到输出 token 限制时，其中的任何工具调用都以错误结果失败，而非执行可能乱码的参数。
- **LLM 重试及退避**：瞬时 Ollama 失败（连接重置、模型加载）自动重试，使用指数退避（最多 2 次重试）。仅在尚未流式传输任何内容时重试。
- **Schema 规则 + 孤儿守卫**：`menus` schema 携带 `rules` 块（菜单目录陷阱）。`db_delete` 使用通用 `parent_ref_field` 在删除前检查子项——存在子项时拒绝，报告数量 + 示例键，建议 `force: true`。
- **客户端断开连接中止**：`_watch_disconnect` 与 SSE 流并行运行——轮询原始 ASGI 接收通道，设置在轮次和工具调用之间检查的 `abort` 事件。中途关闭聊天立即停止循环。

### 2026-08-08 — Agent 韧性（守卫、升级、记忆、预算）

- **叙述并停止守卫**：当模型将计划流式输出为内容并在未调用工具的情况下停止时，无工具调用分支检查文本是否命名了任何已注册但未执行的工具，并注入 `[CONTINUE]` 提示。受 `max_turns` + `_MAX_NUDGES = 2` 限制。
- **无工具任务完成提示**：如果零工具被执行且最后一条用户消息是具体任务，在正常循环中断前注入一次 `[TASK]` 提示。每次运行限制一次。
- **基于失败的模型升级**：当提示守卫耗尽且模型仍在不执行的情况下叙述时，循环升级到更强的模型（配置 `agent_model_fallback`，默认 `["qwen3-coder"]`）。发出 `model_switch` 事件，注入 `[MODEL SWITCH]` 接管。每次运行限制一次升级。
- **无写入提示被忽略时升级**：如果无写入提示触发一次但模型忽略（仅侦察停滞），循环升级到回退模型并指明确切的失败原因。
- **工具调用 XML 解析错误回退**：在 Ollama 出现 `XML syntax error` 时，不带 `tools` 重试（纯文本），然后现有的 `_parse_tool_calls_from_text` 回退从文本流中提取 `<tool_call>` XML。XML 错误即使在内容已流式传输后也会重试。
- **拒绝记忆**：`_session_rejections` 按会话存储规范调用签名。重新发出相同的已拒绝调用会自动阻止，返回"已阻止：相同的调用先前已被拒绝"错误——无需第二次确认提示。限制为每个会话最近 20 条。
- **自动引导**：外部引导消息直接追加到 `agent_messages`（立即，无一轮延迟）。`_steering_consumed` 标志在设置时抑制所有任务完成检查点——人类指令是新的真实依据。
- **轮次预算感知**：`_budget_warning` 在距 `max_turns` 3 轮以内时注入 `[BUDGET]` 提示——告知模型压缩非必要步骤。每次运行一次。
- **重复观察自旋守卫**：检测 3 次连续相同的工具结果观察，并注入 `[TASK]` 提示以打破循环。仅叙述的轮次重置链；真正的进展（变化的数据）永远不会误触发。
- **限制超大工具结果**：`_bound_tool_result` 仅在 LLM 上下文中将工具结果限制为 6000 字符（持久化 + UI 保留完整内容）。保留头部（70%）+ 尾部（22%）+ 明确说明，使模型知道其余部分存在以及如何重新查询。
- **计数感知的部分完成检测**：`_parse_task_item_counts` 将明确的项数与写入动词关联（"创建 2 个菜单" → `(db_create, 2)`）。中断前检查点将 `_write_counts` 与需要的计数进行比较，并在差距上提示。
- **压缩后任务重新注入**：`_inject_mission_if_needed` 在当前压缩将任务从上下文中裁剪时，逐字重新注入原始任务。短运行（任务仍是最后一条用户消息）不受影响。
- **提示强化**：`_is_write_request` 使用子句边界扫描否定标记（`don't`/`forbidden`/`do not`）。`_write_executed` 仅跟踪成功的写入（无错误结果）；`_write_rejected` 标志防止重新激活已拒绝的写入。完整性检查点按名称命名缺失的工具。

### 2026-08-08 — 按会话恢复 + 诚实的 stop_reason

- **按会话恢复**：`save_session_history`/`load_session_history` 按 `session_id` 持久化每次运行的完整 `agent_messages`（含 `tool_result` 消息），内存中存储，1 小时 TTL。`resume: true` 恢复忠实轨迹——仅用户的继续内容在请求中传输。
- **恢复时的任务感知完整性检查**：当最后一条用户消息是续接（`continue`）时，检查针对原始 `task_text` 运行。每次运行的工具跟踪从恢复轨迹的 `tool_result` 中种子化。
- **诚实的 `agent_end` stop_reason**：`_natural_stop` 标志区分 `"completed"` 和 `"max_turns_reached"`。前端对后者显示"回复 'continue' 继续"提示。
- **展示被跳过的工具调用**：被拒绝/超时/自动阻止的确认门控调用现在发出 `tool_execution_start`+`tool_execution_end` 及错误信息——可见性了解为什么写入从未运行。

### 2026-07-31 — RAG + Knowledge 模块

- **`domain/rag/` + `services/rag/`**：基于 `llama_index` 构建的 RAG 模块。混合检索（向量 + BM25）、可选的 `LLMRerank`、行内引用编号。按文件和按文件夹范围的聊天/查询变体。持久化索引位于 `./data/rag_store`。
- **`domain/knowledge/` + `services/knowledge/`**：知识库管理。扫描器遍历 `../YiKnowledge` markdown 树，含 frontmatter 解析。监听器通过 apscheduler 轮询（macOS FSEvents 损坏）。写入器执行 markdown 回写，含元数据 upsert 到 MongoDB `knowledge_files`。