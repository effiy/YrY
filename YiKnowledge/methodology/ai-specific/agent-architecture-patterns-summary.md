---
title: Agent 架构模式（ReAct / Plan-Execute / Reflexion / Tool Use）
tags: [AI, 方法论, Agent, 工具调用]
category: methodology/ai-specific
created: 2026-07-31
updated: 2026-07-31
source: internal
type: summary
status: stable
---

# Agent 架构模式

## 1. 方法论定义与适用场景

LLM Agent：把 LLM 当推理与决策核心，配合工具调用（function/tool use）+ 短期记忆（context）+ 长期记忆（向量库 / KV store）+ 规划（plan）+ 反思（reflect），完成多步骤任务。

适用场景：

- 任务需多步推理，非单次问答
- 需要调用外部能力（搜索、SQL、API、代码执行）
- 需要中间状态反馈（执行结果决定下一步）

## 2. 关键概念

| 术语 | 含义 |
|---|---|
| Tool / Function calling | LLM 输出结构化 JSON，调外部函数 |
| ReAct | Reason + Act 交替循环（Thought → Action → Observation） |
| Plan-Execute | 先分解任务成子任务，再执行 |
| Reflexion | 执行失败后反思，更新下一次尝试 |
| Tree of Thoughts | 树状展开多条思路，自评剪枝 |
| ReWOO | 把规划与执行解耦，规划一次生成全部步骤，执行批量 |
| Multi-Agent | 多个 agent 分工（CrewAI / AutoGen / LangGraph） |
| Memory | 短期 = context window；长期 = 向量库 / summary |
| Guardrails | 输入/输出安全约束 + 工具白名单 |
| Tool schema | OpenAI function calling / Anthropic tool use / JSON schema |

## 3. 主流模式对比

### ReAct

```
Thought: 我需要先搜索
Action: search("...")
Observation: <结果>
Thought: 现在我知道...
Action: <next tool>
...
Final Answer: ...
```

- 优点：可解释、易调试、生态成熟
- 缺点：每步都过 LLM，token 与延迟成本高；中途走偏难纠回
- 适用：工具数 ≤ 5、步骤 ≤ 5

### Plan-Execute

```
Plan: [step1, step2, step3]   ← LLM 一次规划
Execute: 依次执行（可并行）
Replan（可选）: 执行结果不符 → 重新规划
```

- 优点：减少 LLM 往返，可并行；执行轨迹更稳定
- 缺点：规划与执行解耦后难以响应中途变化
- 适用：任务可预先分解（如多源数据汇总）

### Reflexion

```
Attempt → Evaluate → Critique → Update memory → Retry
```

- 优点：自我纠错，对代码生成 / 数学题有效
- 缺点：多轮成本高；反馈若来自弱评估器反而误导
- 适用：可自动评估正确性的任务（unit test 跑通）

### Multi-Agent

- 各 agent 不同角色（planner / coder / reviewer / executor）
- 优点：分工清晰、prompt 各自专精
- 缺点：协调开销大、调试复杂、易陷入「互相赞同但不前进」

## 4. Tool Use 工程要点

1. **Schema 严格**：参数类型、必填/选填、枚举值显式列出；LLM 不擅长猜
2. **描述要详尽**：每个工具的 description 是 prompt 的一部分，写清「什么时候用、什么时候不用、输入格式、输出格式」
3. **错误回写**：工具失败要把错误 message 明确回给 LLM，让它决定重试 / 换工具 / 放弃
4. **并行 vs 串行**：独立工具可并行（一次返回多个 tool call）；有依赖要串行
5. **参数校验前置**：在调真实函数前 schema 校验，失败立即反馈
6. **工具数量上限**：>10 个工具显著降低选择准确率，用 RAG 把工具描述检索出来再选

## 5. 反模式与陷阱

| 反模式 | 现象 | 修复 |
|---|---|---|
| Agent 循环不退出 | 反复调同一工具 | 加 max_steps 与「连续重复检测」 |
| 工具描述模糊 | LLM 选错工具或参数错 | 写详细 description + few-shot |
| 规划过细 | 计划碎成几十步，每步都进 LLM | 粗粒度规划 + 单步内联 |
| 无 memory | 长任务上下文丢失 | summary + 长期记忆外置 |
| 多 Agent 互相赞同 | 反思不真实，进展停滞 | 强制 reviewer 必须提出反对意见 |
| 无超时 | 工具卡死 agent 永远等 | 每工具硬超时 + 失败重试次数 |
| 不限成本 | 单任务烧数十刀 | 设 max_tokens / max_tool_calls |

## 6. 评估指标

| 指标 | 含义 |
|---|---|
| Task success rate | 任务完成率 |
| Steps to complete | 平均完成步数 |
| Tool selection accuracy | 工具选择正确率 |
| Tool argument accuracy | 参数正确率 |
| Cost per task | token 消耗与金额 |
| Hallucination rate | 编造工具名 / 参数比例 |
| Recovery rate | 中途失败后能否纠回 |

## 7. 本团队落地案例

- YiAi BRD 智能体：Plan-Execute 模式，先规划章节，每章节独立执行生成
- 评估中：YiVad aicr 引入 Agent 做跨知识库检索 + 工具调用，用 ReAct + max_steps=8
- 暂不采用：Multi-Agent（当前规模协调成本 > 收益）

## 8. 参考资料

- Yao et al., 2022 — *ReAct: Synergizing Reasoning and Acting in LLMs*
- Shinn et al., 2023 — *Reflexion: Language Agents with Verbal Reinforcement Learning*
- Wang et al., 2023 — *Plan-and-Solve Prompting*
- LangGraph: https://github.com/langchain-ai/langgraph
- OpenAI function calling 指南
