---
title: "ADR: YiVad Agent Mode (pi Agent Loop)"
tags: [adr, yivad, agent, ai, sse, pi-agent, tool-calling]
category: leader/decisions/yivad
created: 2026-08-24
updated: 2026-08-24
source: internal
type: decision
status: accepted
lifecycle: implemented
review_cycle: quarterly
roles: [leader, engineer]
benefit: "Understand the agent mode architecture decision — confirmation gates, auto-steer, resume-by-session, and chat-based permission"
related:
  - ../../../engineer/learn/projects/yivad/README.md
  - ../../yiai/brd-agent-launch.md
  - ../../yiai/llm-multi-provider-rollout.md
---

# ADR: YiVad Agent Mode (π Loop)

> 来源：YiVad 八月迭代 PRD 任务 #5
> 菜单路径：AI Chat → Agent 模式
> 涉及仓库：YiVad（前端）+ YiAi（后端 `/agent/*`）
> 状态：Accepted (2026-08-08) — implemented

## 接口协议

Agent 模式复用 YiAi 的标准 RPC 信封，核心接口：

| 接口 | 方法 | 说明 |
|------|------|------|
| `/agent/chat` | POST (SSE) | Agent 循环主入口，入参 `{model, messages, system?, max_turns?, resume?, model_fallback?}`，返回 SSE 事件流 |
| `/agent/confirm` | POST | 工具确认，入参 `{session_id, confirmation_id, approve: boolean}` |
| `/agent/steer` | POST | 运行时重定向，入参 `{session_id, message}` |
| `/agent/follow-up` | POST | 排队后续指令，入参 `{session_id, message}` |
| `/agent/tools` | POST | 服务端工具/技能目录，返回 `{tools, skills}` |

### SSE 事件类型

| 事件 | 含义 | payload |
|------|------|---------|
| `agent_start` | 循环开始 | `{max_turns}` |
| `turn_start` | 新一轮开始 | `{turn_index}` |
| `message_start` | 模型开始输出 | `{}` |
| `message_delta` | 文本增量 | `{content}` |
| `message_end` | 模型输出结束 | `{message: {role, content}}` |
| `tool_execution_start` | 工具开始执行 | `{tool_name, tool_args, confirmation_id?}` |
| `tool_execution_update` | 工具执行进度 | `{partial_result}` |
| `tool_execution_end` | 工具执行完成 | `{tool_name, result?, error?}` |
| `confirmation_required` | 需要用户确认 | `{confirmation_id, tool_name, tool_args}` |
| `model_switch` | 模型自动升级 | `{from, to}` |
| `turn_end` | 本轮结束 | `{turn_index, tool_calls[]}` |
| `agent_end` | 循环结束 | `{stop_reason: "completed" \| "max_turns_reached" \| "stopped"}` |

## Context

YiVad 的 aiChat 原本仅支持单轮对话（用户提问 → AI 回复），无法完成多步骤任务（如"分析菜单结构 → 创建缺失菜单 → 验证结果"）。YiAi 后端引入了 π-inspired agent loop，具备 generic data tools（`db_list`、`db_schema`、`db_create`、`db_update`、`db_delete`）、写入操作确认门控和自然语言 steering 能力。前端需要将这些能力完整呈现：工具确认 UI、实时轮次进度、模型切换可见性、以及从聊天中 steer/continue 运行中 agent 的能力。

## Decision

**在 aiChat 中实现完整的 agent 模式 UI，包含四个关键协议：确认门控、自动 steer、resume-by-session 和基于聊天的权限应答。**

### 架构

```
aiChat store (Pinia)
  ├── sendMessage ──→ POST /agent/chat (agent mode)
  │                   POST /agent/steer (mid-run correction)
  │                   POST /agent/confirm (approve/reject tool)
  │                   POST /agent/follow-up (queue after completion)
  ├── runStream ────→ SSE event loop
  │   ├── tool_execution_start/end → AgentTimeline (live tool lifecycle)
  │   ├── confirmation_required → MessageList banner (Approve/Reject)
  │   ├── model_switch → surfacing in streamed message
  │   └── agent_end → stop_reason handling (completed vs max_turns_reached)
  └── agentTurnProgress → el-progress bar (current/max/nearLimit)
```

### 关键设计决策

#### 1. 确认门控 UI（Confirmation Gate）

写入操作（`db_create`/`db_update`/`db_delete`）触发确认横幅，含 Approve/Reject 按钮。120s 后自动拒绝，匹配后端超时。确认 ID 按轮次唯一（`t{turn}:{call.id}`），防止过期决策冲突。

| 元素 | 说明 |
|------|------|
| 工具名称 | 展示待确认的工具名（如 `db_create`） |
| 参数摘要 | 展示工具参数 JSON（截断长文本） |
| Approve 按钮 | `POST /agent/confirm` approve=true |
| Reject 按钮 | `POST /agent/confirm` approve=false |
| 超时自动拒绝 | 120s 后自动 reject |
| 提示文案 | "或直接在输入框回复 — 可以/好/yes 批准，不要/取消/no 拒绝" |

#### 2. 基于聊天的权限应答（Chat-based Permission）

`confirmationAnswerFor(text)` 将聊天消息分类为确认操作 — 用户输入 `可以`/`yes` 批准，`不要`/`no` 拒绝。拒绝附带额外文本时同时拒绝并 steer 修正指令。单测 51/51。

| 输入 | 行为 |
|------|------|
| `可以` / `好` / `yes` / `ok` / `同意` | 批准当前待确认工具 |
| `不要` / `不行` / `取消` / `拒绝` / `no` | 拒绝当前待确认工具 |
| 拒绝 + 额外文本（如 `不要删除，改成更新 title`） | 拒绝 + steer 修正指令 |

#### 3. 运行时自动 Steer（Auto-Steer）

Agent 循环运行期间，普通聊天消息不再被静默丢弃 — 自动通过 `POST /agent/steer` 转发。steer 消息以 user bubble 展示。斜杠命令保持原有行为。

| 输入类型 | 行为 |
|------|------|
| 普通文本 | `POST /agent/steer` → user bubble + toast |
| `/steer <msg>` | 同普通文本 |
| `/followup <msg>` | `POST /agent/follow-up` → followup bubble，Agent 空闲时执行 |
| `/stop` | 中止当前循环 |
| 图片 | 保持旧行为（丢弃） |

#### 4. Resume-by-Session 续接（Continue）

`max_turns_reached` 后，下一次发送若是真正的续接（`继续`/`continue`），仅发送用户消息并带 `resume: true`。后端恢复持久化的工具轨迹。max_turns 后的新任务走全新流程。`isContinuationMessage(text)` 与后端 `_is_continuation` 严格对齐 — 一致性至关重要。单测 21/21。

| 场景 | 机制 |
|------|------|
| 续接消息 | `resume: true`，仅发送用户续接指令，后端恢复轨迹 |
| 新任务 | `resume: false`，完整历史，全新流程 |
| 判断标准 | `isContinuationMessage(text)` — 必须与后端 `_is_continuation` 一致 |

#### 5. 实时轮次进度指示器（Live Turn Progress）

`agentTurnProgress` computed 展示 current/max 轮次，配合 `el-progress` 进度条。距 max_turns ≤ 2 轮时变为 warning 色，用户可感知预算即将耗尽。

| 元素 | 说明 |
|------|------|
| 文案 | `Agent 运行中 · 第 X / N 轮` |
| 进度条 | `el-progress`，`current / max` |
| 警告阈值 | 距 max_turns ≤ 2 轮时变 warning 色 |
| 数据源 | `agentTurnSummaries` + `agentMaxTurns` + `streamingPhase` |

#### 6. 模型切换可见性（Model Switch Surfacing）

`model_switch` 事件在流式消息中追加 `⚙️ 模型自动切换：from → to`，使升级恢复过程对用户可见。

| 触发条件 | 模型连续多轮未产出有效工具调用 |
|------|------|
| 前端展示 | `> ⚙️ 模型自动切换：from → to` |
| 配置 | `model_fallback` — 省略用服务端默认，`[]` 禁用 |

#### 7. 排队 /followup 消息（Queued Follow-ups）

`/followup` 消息以 `followup` 类型 bubble 渲染在 user 侧，带 "Follow-up queued" 药丸标签。排除在请求历史之外，确保已消费的 followup 不会被重复发送。

## 改动总览

| 改动点 | 类型 | 涉及文件 |
|--------|------|---------|
| 工具确认横幅 + 自然语言确认 | 新增 | `MessageList.vue`, `aiChat.ts`, `confirmationAnswer.ts` |
| 工具生命周期（start/update/end） | 新增 | `aiChat.ts` (onEvent), `MessageBubble.vue` (AgentTimeline) |
| 模型切换 + 自动升级展示 | 新增 | `ChatToolbar.vue`, `aiChat.ts`, `agentService.ts` |
| 轮次预算进度条 | 新增 | `aiChat.ts` (`agentTurnProgress`), `MessageBubble.vue` |
| 运行时 auto-steer | 新增 | `aiChat.ts` (`sendMessage`) |
| /followup 排队 + 展示 | 新增 | `aiChat.ts`, `MessageBubble.vue`, `yiweb.ts` (type) |
| 会话恢复 + resume 模式 | 新增 | `aiChat.ts` (`runStream`), `continuation.ts` |
| 跳过工具可见性 | 修复 | `aiChat.ts` (`tool_execution_end` 处理) |
| 不完整任务提示 | 新增 | `aiChat.ts` + `KnowledgeChatPanel.vue` |
| KnowledgeChatPanel Agent 模式 | 新增 | `KnowledgeChatPanel.vue`, `agentService.ts` |

## 涉及文件

```
src/
├── api/modules/agentService.ts          # Agent 接口（chat/confirm/steer/follow-up/tools）
├── api/interface/yiweb.ts               # ChatMessage.type 扩展 "followup"
├── stores/modules/aiChat.ts             # Agent 状态管理、SSE 事件处理、runStream
├── utils/confirmationAnswer.ts          # 自然语言确认词分类（纯函数，51 单测）
├── utils/continuation.ts                # 续接消息判断（纯函数，21 单测）
├── views/aiChat/
│   ├── index.vue                        # 页面入口
│   ├── types.ts                         # AiChatStreamingType 等
│   ├── constants.ts                     # DEFAULT_MODEL, QuickButtons
│   └── components/
│       ├── MessageList.vue              # 确认横幅（Approve/Reject 按钮 + 提示文案）
│       ├── MessageBubble.vue            # AgentTimeline、轮次进度条、followup 标签
│       ├── ChatToolbar.vue              # 模型选择器、Agent 开关、max_turns 配置
│       ├── ChatInput.vue                # Agent 模式 placeholder
│       └── KnowledgeChatPanel.vue       # 知识文件 Agent 模式（独立 agent 循环）
```

## 接口依赖

| # | 接口 | 说明 |
|---|------|------|
| 1 | `POST /agent/chat` (SSE) | Agent 循环主入口 |
| 2 | `POST /agent/confirm` | 工具确认 |
| 3 | `POST /agent/steer` | 运行时重定向 |
| 4 | `POST /agent/follow-up` | 排队后续指令 |
| 5 | `POST /agent/tools` | 工具/技能目录 |

## 验收标准

| # | 验收项 | 验证方式 |
|---|--------|---------|
| 1 | 工具确认横幅正常展示，Approve/Reject 功能正常 | 发送需写库的任务，观察确认横幅 |
| 2 | 自然语言确认等效于点击按钮 | 确认横幅显示时聊天输入确认词 |
| 3 | 工具生命周期状态实时更新（pending→executing→completed/failed） | 观察 AgentTimeline 中工具状态变化 |
| 4 | 被拒绝/超时的工具在时间线中可见（含跳过原因） | 拒绝确认或等待 120s 超时 |
| 5 | 模型手动切换生效 | 切换模型后发送消息 |
| 6 | 模型自动升级时展示切换提示 | 使用弱模型触发 stall |
| 7 | 轮次进度条正确显示，接近上限变 warning 色 | 设置 max_turns=3，观察进度条 |
| 8 | 达到 max_turns 后展示不完整任务提示 + `继续` 可续接 | 设 max_turns=2 执行多步任务 |
| 9 | 续接时不会重复执行已完成的工具调用 | 继续后检查无重复 db_create |
| 10 | 运行时输入普通文本自动 steer | Agent 运行中发送修正指令 |
| 11 | /followup 消息排队并在 Agent 空闲后执行 | Agent 运行中发送 /followup |
| 12 | 页面刷新后可通过 session_key 恢复会话 | 刷新页面 → URL 带 session 参数 |

## 实现注意事项

- **前端/后端 `isContinuationMessage` 一致性至关重要** — 任何偏差都会导致重复工具执行或轨迹丢失。前端 `src/utils/continuation.ts` 必须与后端 `YiAi/src/domain/ai/agent.py::_is_continuation` 保持严格一致。
- **确认 ID 按轮次唯一**（`t{turn}:{call.id}`），防止轮次间确认 ID 冲突。
- **`pendingConfirmation` 在 `tool_execution_end` 匹配时立即清除** — 确保被拒绝/超时的确认横幅不残留（此前会挂起至 120s 前端定时器到期）。
- **followup 类型消息排除在 `runStream` 的 `aiMessages` 过滤之外** — 确保已消费的 followup 不会被重新发送，否则会重新执行已完成任务。

## Alternatives Considered

1. **仅斜杠命令控制 Agent** — 拒绝。要求用户记住 `/steer` 语法进行运行时修正不直观且容易遗忘。
2. **独立 Agent 页面** — 拒绝。Agent 模式是 aiChat 的自然扩展，非独立功能；纳入 aiChat 组件避免重复聊天基础设施。
3. **无确认门控（自动执行写入）** — 拒绝。确认门控是 LLM 与破坏性数据操作之间的唯一屏障，不安全。

## Consequences

- **正面**：用户可从聊天中运行多轮工具调用任务；确认门控防止意外写入；auto-steer 无需斜杠命令即可自然修正；resume-by-session 支持跨 turn 限制的长时间运行任务。
- **负面**：复杂状态机 — `pendingConfirmation`、`agentTurnSummaries`、`lastAgentInterrupt`、`steering_consumed` 标志必须与后端状态保持同步。
- **风险**：前端/后端 `isContinuationMessage` 一致性至关重要 — 偏差会导致重复工具执行或轨迹丢失。