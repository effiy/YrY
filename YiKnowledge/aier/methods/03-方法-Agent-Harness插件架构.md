---
title: Agent Harness 插件架构
tags: [agent, harness, plugin, cordis, capability-seam, event-driven, tool-use]
category: aier/methods
created: 2026-08-15
updated: 2026-09-10
last_verified: 2026-09-10
source: https://github.com/deepseek-ai/deepseek-harness
type: summary
status: evolving
lifecycle: reference
review_cycle: quarterly
roles: [aier, engineer]
benefit: "区分何时在插件化 Harness 上构建 Agent、何时手写循环，并理解 YiAi Agent 循环如何映射到 deepseek-harness 插件模型"
acceptance_criteria:
  - "定义清晰：plugin、seam、event 三个核心概念及其区别"
  - "明确 Harness vs 手写循环的决策规则"
  - "每个 deepseek-harness 概念映射到 YiAi agent.py 的具体实现"
related:
  - ./01-方法-Agent架构模式.md
  - ./04-LLM评估.md
  - ../platform/02-平台-LLM对比.md
  - ../../engineer/learn/projects/yiai/
---

# Agent Harness 插件架构

> **概述：** *Agent Harness* 是围绕 LLM 的模型无关执行骨架——它将模型输出转化为工具调用、将结果反馈给模型、并执行安全策略的循环引擎。[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（`dsh`）是一个参考实现，其中**一切都是插件**：模型适配器、工具注册中心、会话日志和 Agent 循环本身都是向共享上下文贡献服务的插件，在启动时组合在一起。本文提炼该架构的核心思想，并将每个概念映射到 YiAi 的 `domain/ai/agent.py` 实现。

## 适用场景判断

**选用插件化 Harness** 当满足以下条件时：

- 需要在不重写循环的前提下**替换模型提供商、沙箱环境或文件系统**
- 多个产品（Web 应用、无头运行器、CLI）需要**共享相同的 Agent 语义**
- 必须在不修改核心循环的前提下**附加策略**（审批、遥测、护栏）

**选手写循环** 当满足以下条件时：

- Agent 是单一固定工作流（一个提供商、一个工具、无策略变化）
- 学习插件框架的成本超过它带来的灵活性收益

**YiAi 的定位：** 介于两者之间。它手写了循环，但已经有机地生长出了 Harness 风格的接缝（tool registry、confirmation gate、model fallback）——下面的映射表详细展示了每个对应关系。

## 核心概念

### 1. 一切皆插件（Cordis 框架）

[Cordis](https://github.com/cordiverse/cordis) 是 `dsh` 的底层框架：插件向共享上下文贡献**服务**、**类型化事件**和**可逆副作用**。**不存在需要打补丁的特权核心**——通过将插件挂载到其他插件旁边来扩展 Harness，每个注册都是在其插件卸载时可撤销的副作用。

> **推论：** 模型适配器、工具注册中心、会话日志和 Agent 循环都可以从配置中替换。"改变整个产品" = "替换一个 Provider"。

### 2. Profiles 与 Bundles（组合层）

运行中的 Harness 是在启动时从有序层组合而成的**插件树**：

- **Profile** 是命名的组合（存储在 harness home 中）：它包含堆叠的 bundles、安装的外部插件和用户的 `cordis.patch.yml`
- **Bundle** 是配置行 + 对应代码的分发格式。`web` 和 `headless` 作为模板 profile 提供
- **Patch** 通过 `id` 定位配置行，替换其全部配置或插入新行。`--dump-config` 打印当前机器启动时的完整配置树

这是"配置即代码"的实践方案——**"如何交付定制化 Agent"的答案是：交付 profile + patch，而非 fork 一份代码。**

### 3. Capability Seams（能力接缝）

**Seam** 是具有三种角色的可替换能力：

1. **服务定义** — 声明接口
2. **服务提供者** — 实现接口
3. **消费者** — 使用接口（通常是模型可调用的工具）

Seam 是"替换一个 Provider 改变整个产品"的关键：文件系统和子进程 Provider 共享同一个执行世界，因此将它们指向远程沙箱可以同时移动 Bash、PTY 和 LSP——**无需 fork Provider 代码**。

### 4. Events 作为扩展点

三种事件域，选择正确的事件域是设计的关键：

| 事件域 | 形态 | 使用时机 |
|---|---|---|
| **Session Events** | 持久化事实，追加到日志中，通过 `session/event` 广播 | 事实必须在重载后存活（消息、工具结果、轮次边界） |
| **Agent Events** (`agent/*`) | 携带活跃 `Agent` 的实时事件（inbox、step、status、request、validation） | 观察或拦截**正在进行中的工作** |
| **Capability Events** (`tools/*`, `fs/*`, `telemetry/*`) | Seam 上的策略/适配器挂载点 | 在不导入循环代码的前提下附加策略 |

**瀑布事件**（`agent/pre-step`、`agent/request`、`llm/stream`、`tools/*`）要求监听器调用 `next()` 来委托；`agent/turn-stopping` 是串行的，没有 `next()`。

### 5. Turn Flow（Step ⊂ Turn）

- **Step** = 一次模型请求 + 它调用的工具
- **Turn** = 零个或多个 Step；Turn 在其第一个输入被认领之前打开，在所有应完成的工作完成后关闭

`agent/pre-step` 决定模型看到什么——监听器可以重写已认领的消息，也可以**直接拒绝**它们；被拒绝的首次认领仍然会关闭一个持久化的 Turn，确保日志记录了这次尝试。

### 6. "模型可见即已记录"

会话日志是**模型所看到上下文的唯一数据源**：`deriveMessages()` 从日志中投影模型历史，原始的 `assistant/chunk` 事件保留了回放和 UI 的保真度。**任何到达模型请求的内容必须可以从日志中重建**——运行时断言强制此约束。新的模型可见输入 ⇒ 新的 Session Event。

## 模式分解

```
boot          profile + bundles + patches → plugin tree
extension     新行为挂载到已文档化的事件/接缝上（从不直接修改循环）
turn/step     pre-step (rewrite/reject) → request → stream → tool/* → post-execute → owe-another?
context       session log = 唯一的模型可见上下文；fork/resume/transcript 全部从中派生
```

## YiAi 实现对照

YiAi 手写了 Agent 循环，但已经有机地生长出了与 Harness 对应的接缝：

| deepseek-harness 概念 | YiAi 对应实现 (`domain/ai/agent.py`) |
|---|---|
| `ctx.tools` 工具注册中心 + 受保护执行 | `get_tool_registry()` → `ToolRegistry.execute` + `_validate_arguments` 参数校验 |
| 审批策略（sandbox/approval） | 确认门机制 — `_wait_for_confirmation` + 拒绝记忆（`_session_rejections`） |
| 模型适配器 Seam（`ctx.llm`） | `OllamaRuntime.stream_chat` + `model_fallback` 升级链（Thinker → Doer） |
| 会话日志（持久化、可回放） | `save_session_history` / `load_session_history`（1 小时 TTL，完整 `tool_result` 轨迹） |
| Turn / Step 预算 | `max_turns` + 轮次预算警告（`_budget_warning`，距上限 3 轮时注入） |
| `agent/pre-step` 重写/拒绝 | 任务重注入（`_inject_mission_if_needed`）+ steer drain（`agent_messages`） |
| 能力事件（Seam 上的策略） | `on_event` / `AgentEvent` 事件面（confirmation、tool start/end、model switch） |
| 扩展点（不修改循环添加行为） | Nudge/escalation 检查点，以 `[TASK]`/`[CONTINUE]`/`[MODEL SWITCH]` 消息形式注入 |

**YiAi 与完整 Harness 的分歧：** 策略仍然**内嵌在循环内部**（confirmation、escalation、nudge guards 是 `if` 分支），且没有 Cordis 风格的可逆插件树。向 Harness 对齐的下一步是将这些 `if` 分支提取为事件监听器——接缝已经存在，组合层还不存在。

## 反模式

| 反模式 | 为什么失败 | 正确做法 |
|---|---|---|
| 将策略硬编码到循环中而非接缝上 | 审批、遥测和护栏应作为事件/接缝存在，而非驱动循环中的 `if` 块 | 策略作为事件监听器挂载，循环保持模型无关 |
| 将持久化事实写入实时 Agent 事件 | 必须跨重载存活的事实应存入会话日志，而非 `agent/*` 事件 | 持久化事实：Session Events；实时拦截：Agent Events |
| 非幂等的插件树 | 如果注册不是可逆副作用，重载无法干净撤销，日志无法回放 | 每个注册应包含对应的卸载逻辑 |
| 打补丁核心而非挂载插件 | Harness 没有特权核心；fork 是缺少接缝的信号 | 需要修改核心行为时，优先考虑添加 Seam 而非修改循环 |
| 事件域混淆 | Session Event 和 Agent Event 的边界模糊导致重载后状态不一致 | 按生命周期选择事件域：持久化 → Session，实时 → Agent，策略附加 → Capability |

## 评估指标

- **Provider 替换成本** — 替换模型/沙箱/文件系统需要修改多少个文件。良好设计的 Seam ⇒ 仅修改一个配置行
- **日志可回放性** — 能否仅从会话日志中逐字节重建完整的对话记录
- **事件域正确性** — 审计每个事实是否存在于正确的事件域中（持久化 vs 实时 vs 能力）

## 相关资源

- [./01-方法-Agent架构模式.md](./01-方法-Agent架构模式.md) — ReAct / Plan-Execute / Reflexion 等 Agent 模式层
- [./04-LLM评估.md](./04-LLM评估.md) — 循环建成后的 Agent 评估方法
- [../platform/02-平台-LLM对比.md](../platform/02-平台-LLM对比.md) — 模型服务与推理平台
- [../../engineer/learn/projects/yiai/](../../engineer/learn/projects/yiai/) — YiAi 实现细节