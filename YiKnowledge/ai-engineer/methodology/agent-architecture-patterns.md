---
title: Agent Architecture Patterns (ReAct / Plan-Execute / Reflexion / Tool Use)
aliases:
- Agent Architecture Patterns
- LLM Agent
tags:
- AI
- methodology
- agent
- tool-use
category: ai-engineer/methodology
created: 2026-07-31
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: yearly
roles:
- ai-engineer
- engineer
benefit: ai methodology sound
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- rag-design-patterns.md
- prompt-engineering-guide.md
- llm-evaluation-methods.md
- prompt-injection-defense.md
- ../platform/inference-engine-comparison.md
- ../../engineer/projects/yiai/README.md
tacit: false
---

# Agent Architecture Patterns

> **As an** ai engineer, **I want to** agent architecture patterns, **so that** ai methodology sound.

> Treat the LLM as the inference and decision core, combined with tool calling + memory + planning + reflection, to complete multi-step tasks.

## Summary
- An LLM Agent = LLM + tool calling + memory + planning + reflection, used for multi-step inference and external capability invocation.
- Four mainstream patterns: ReAct (Thought → Action → Observation loop), Plan-Execute (plan then execute), Reflexion (reflect on failure and retry), Multi-Agent (multiple roles divide the work).
- Engineering essentials: strict tool schemas, detailed descriptions, error feedback, parameter validation up front, tool count ≤ 10.
- Anti-patterns: loops that do not exit, vague tool descriptions, over-granular planning, no memory, multiple agents agreeing with each other, no timeouts, no cost limits.

## Core viewpoints
- **Agent value lies in multi-step inference + external calls** — a single Q&A does not need an agent; introduce one only when the task is decomposable and needs tools.
- **The tool description is part of the prompt** — write clearly "when to use, when not to use, input/output format"; this is more important than the schema.
- **Each step going through the LLM is costly** — ReAct suits few tools and few steps; tasks that can be pre-decomposed prioritize Plan-Execute to reduce round trips.
- **Failures must be recoverable** — add max_steps, consecutive-repeat detection, hard timeout, failure retry caps; otherwise the agent gets stuck forever.
- **Do not adopt Multi-Agent when coordination cost > benefit** — at the current scale, coordination overhead is large; a single agent with sub-tasks is sufficient.

## Key information

### Concept breakdown

| Term | Meaning |
|---|---|
| Tool / Function calling | the LLM outputs structured JSON to call external functions |
| ReAct | alternating Reason + Act loop (Thought → Action → Observation) |
| Plan-Execute | decompose the task into sub-tasks first, then execute |
| Reflexion | reflect after execution failure, update the next attempt |
| Tree of Thoughts | expand multiple reasoning branches as a tree, self-evaluate and prune |
| ReWOO | decouple planning from execution; planning generates all steps at once, execution runs in batch |
| Multi-Agent | multiple agents divide the work (CrewAI / AutoGen / LangGraph) |
| Memory | short-term = context window; long-term = vector store / summary |
| Guardrails | input/output security constraints + tool allowlist |
| Tool schema | OpenAI function calling / Anthropic tool use / JSON schema |

### Mainstream pattern comparison

**ReAct**

```
Thought: I need to search first
Action: search("...")
Observation: <result>
Thought: now I know...
Action: <next tool>
...
Final Answer: ...
```

- Pros: explainable, easy to debug, mature ecosystem
- Cons: each step goes through the LLM, high token and latency cost; hard to recover mid-way drift
- Applicable: tool count ≤ 5, step count ≤ 5

**Plan-Execute**

```
Plan: [step1, step2, step3]   ← LLM plans once
Execute: run in sequence (can parallelize)
Replan (optional): results do not match → re-plan
```

- Pros: reduces LLM round trips, can parallelize; more stable execution trajectory
- Cons: after decoupling planning from execution, hard to respond to mid-stream changes
- Applicable: tasks that can be pre-decomposed (e.g. multi-source data aggregation)

**Reflexion**

```
Attempt → Evaluate → Critique → Update memory → Retry
```

- Pros: self-correction; effective for code generation / math problems
- Cons: multi-round cost is high; if the evaluator is weak, feedback misleads
- Applicable: tasks whose correctness can be auto-evaluated (unit test run-through)

**Multi-Agent**

- Each agent has a different role (planner / coder / reviewer / executor)
- Pros: clear division of labor; each prompt specializes
- Cons: large coordination overhead, complex debugging, easy to fall into "agreeing but not progressing"

### Tool use engineering essentials

1. **Strict schema**: parameter types, required/optional, enum values listed explicitly; the LLM is bad at guessing.
2. **Detailed descriptions**: each tool's description is part of the prompt; write "when to use, when not to use, input format, output format".
3. **Error feedback**: on tool failure, return the error message explicitly to the LLM so it can decide retry / switch tool / give up.
4. **Parallel vs sequential**: independent tools can be parallelized (return multiple tool calls at once); dependent ones must be sequential.
5. **Upfront parameter validation**: schema-validate before calling the real function; on failure, feedback immediately.
6. **Tool count ceiling**: >10 tools significantly lowers selection accuracy; use RAG to retrieve tool descriptions and then select.

### Evaluation metrics

| Metric | Meaning |
|---|---|
| Task success rate | task completion rate |
| Steps to complete | average steps to completion |
| Tool selection accuracy | correct tool selection rate |
| Tool argument accuracy | parameter correctness rate |
| Cost per task | token consumption and dollar cost |
| Hallucination rate | ratio of fabricated tool names / parameters |
| Recovery rate | whether mid-stream failure can be recovered |

### Applicable scenarios

- Tasks that need multi-step inference, not single Q&A
- Need to call external capabilities (search, SQL, API, code execution)
- Need intermediate state feedback (execution result determines next step)

## Action recommendations
1. Pick a pattern: ReAct for tool ≤ 5 step ≤ 5; Plan-Execute for pre-decomposable tasks; Reflexion for auto-evaluable correctness; Multi-Agent for multi-role collaboration.
2. Write tool schemas fully: required/optional, enum values, detailed descriptions (including "when not to use"), add 3-5 few-shots.
3. Add guardrails: max_steps=8, consecutive-repeat detection, per-tool hard timeout, failure retry cap.
4. Upfront parameter validation: schema-validate before calling the real function; on failure, feedback to the LLM immediately.
5. Tool count >10: vectorize tool descriptions, retrieve top-5 tool descriptions per query and inject into the prompt.
6. Memory design: short-term via context window, long-term via summary + vector store; add summary nodes for long tasks.
7. Evaluation: build a task set (50-200 items), run task success rate + tool selection accuracy, regression-test on every prompt / model change.

## Anti-patterns
- **Agent loop does not exit** — repeatedly calls the same tool; add max_steps and "consecutive-repeat detection".
- **Vague tool description** — the LLM picks the wrong tool or wrong parameter; write detailed descriptions + few-shots.
- **Over-granular planning** — plan breaks into dozens of steps, each entering the LLM; coarse-grained planning + inline sub-steps.
- **No memory** — long tasks lose context; externalize summary + long-term memory.
- **Multiple agents agreeing with each other** — reflection is not real, progress stalls; force the reviewer to raise objections.
- **No timeout** — a tool hangs and the agent waits forever; per-tool hard timeout + failure retry cap.
- **No cost limit** — a single task burns tens of dollars; set max_tokens / max_tool_calls.


- **Using ReAct for tasks with more than 10 tool calls** — each step incurs a full LLM round-trip; cost and latency explode. Switch to Plan-Execute for tasks that can be pre-decomposed.
- **Hard-coding tool names and descriptions in the system prompt** — tool APIs change, and the prompt becomes stale. Use dynamic tool injection from a registry so descriptions stay in sync with implementations.
- **Returning raw tool output without truncation** — a single large tool response (e.g. a 50KB search result) fills the context window, crowding out reasoning space. Truncate or summarize tool outputs before feeding back.
- **Implementing reflection without a verifiable evaluation signal** — self-reflection without ground truth (e.g. unit test pass/fail) produces hallucinated self-praise. Only use Reflexion when correctness can be automatically checked.
- **Re-planning after every single execution step in Plan-Execute** — defeats the purpose of decoupling planning from execution. Only trigger re-planning on significant deviation from the expected outcome.

## Related
- Same category: [rag-design-patterns-summary.md](./rag-design-patterns.md) (Agentic RAG treats retrieval as a tool); [prompt-engineering-guide-summary.md](./prompt-engineering-guide.md) (tool description is part of the prompt); [prompt-injection-defense-summary.md](./prompt-injection-defense.md) (tool hijack defense)
- Upstream: [../platform/inference-engine-comparison.md](../platform/inference-engine-comparison.md)
- Downstream: [../../engineer/projects/yiai/README.md](../../engineer/projects/yiai/README.md) (YiAi BRD agent Plan-Execute implementation)

## References
- Yao et al., 2022 — *ReAct: Synergizing Reasoning and Acting in LLMs*
- Shinn et al., 2023 — *Reflexion: Language Agents with Verbal Reinforcement Learning*
- Wang et al., 2023 — *Plan-and-Solve Prompting*
- LangGraph: https://github.com/langchain-ai/langgraph
- OpenAI function calling guide
