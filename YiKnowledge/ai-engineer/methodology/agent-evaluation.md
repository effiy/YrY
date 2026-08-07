---
title: "AI Agent Evaluation Framework: Tool Selection Accuracy, Task Completion Rate, Multi-Step Reasoning, and Agent-Specific Metrics"
aliases:
  - agent evaluation
  - AI agent evaluation
  - tool selection accuracy
  - task completion rate
  - agent metrics
  - multi-step reasoning evaluation
tags:
  - AI
  - methodology
  - agent
  - evaluation
  - tool-use
  - metrics
category: ai-engineer/methodology
created: 2026-08-07
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles:
  - ai-engineer
  - engineer
benefit: "Measure AI agent quality with metrics that go beyond text generation -- evaluate tool selection, multi-step planning, recovery from failure, and end-to-end task completion"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - agent-architecture-patterns.md
  - llm-evaluation-methods.md
  - run-a-two-loop-llm-evaluation.md
  - tune-prompts.md
  - prompt-engineering-guide.md
tacit: false
---

# AI Agent Evaluation Framework

> **As an** AI engineer, **I want to** evaluate AI agents with agent-specific metrics, **so that** I can measure and improve agent reliability, tool use accuracy, and multi-step task completion -- not just text generation quality.

> Agent evaluation is fundamentally different from LLM evaluation: agents make decisions, call tools, and execute multi-step plans. Their evaluation must measure the quality of actions, not just the quality of final text.

## Summary

- Agent evaluation measures the quality of an agent's behavior across four dimensions: task completion (did it achieve the goal?), tool use (did it call the right tools with the right parameters?), planning (did it decompose the task effectively?), and robustness (did it recover from failures?).
- Key metrics: task success rate (the most important), tool selection accuracy, tool argument accuracy, steps to completion, recovery rate (from mid-task failures), cost per task, and hallucination rate (fabricated tool names or parameters).
- Agent evaluation requires a task suite of 50-200 representative tasks, each with: a natural language description, the expected outcome (ground truth), the expected tool call sequence, and acceptance criteria.
- The evaluation loop must be automated: run the agent on each task, capture the full trace (thoughts, tool calls, observations, final answer), and score against the acceptance criteria.
- Agent evaluation is more expensive than LLM evaluation because each task requires multiple LLM calls (the agent loop); budget for 5-10x the cost of single-call evaluation.

## Core viewpoints

### 1. Task success rate is the North Star metric; all other metrics are diagnostic

The ultimate measure of an agent is whether it accomplishes the user's goal. Task success rate is binary: the task is either completed successfully or not. This metric should be the primary KPI for agent quality. All other metrics (tool selection accuracy, steps to completion, recovery rate) are diagnostic -- they help explain why the task success rate is what it is, but they are not substitutes. A focus on intermediate metrics at the expense of task success is a common failure mode.

### 2. Tool selection accuracy and tool argument accuracy must be measured separately

Tool selection accuracy measures whether the agent chose the right tool for the situation. Tool argument accuracy measures whether the parameters passed to the chosen tool were correct. These are separate failure modes: an agent can choose the right tool but pass wrong parameters (e.g., calling `search("wrong query")`), or it can choose the wrong tool entirely (e.g., calling `search` when it should call `database_query`). In practice, argument errors are 2-3x more common than selection errors, and they are harder to fix because they require more precise tool descriptions.

### 3. Multi-step reasoning evaluation requires trajectory-level scoring, not just final-output scoring

A single LLM evaluation (like "is the final answer correct?") is insufficient for agents. The agent's trajectory -- the sequence of thoughts, actions, and observations -- must be evaluated. Key trajectory-level checks: (a) did the agent take unnecessary steps? (b) did it get stuck in a loop? (c) did it call tools in the correct order? (d) did it skip a necessary step? (e) did it recover correctly from a tool failure? Trajectory evaluation requires human annotation of the "golden path" for each task, which is the most expensive part of building an agent evaluation suite.

### 4. Recovery rate is the most underrated metric and the best predictor of production reliability

In production, agents encounter unexpected situations: tool failures, ambiguous results, missing information, contradictory data. The recovery rate measures how often the agent successfully adapts to these failures and still completes the task. An agent with 90% task success rate but 20% recovery rate will fail catastrophically in production when conditions deviate from the training distribution. An agent with 85% task success rate but 70% recovery rate is more reliable in practice. Recovery rate is measured by injecting failures into the evaluation suite (simulated tool errors, missing data, ambiguous results) and measuring how often the agent recovers.

## Key info

### Agent evaluation metrics

| Metric | Definition | How to measure | Target |
|---|---|---|---|
| Task success rate | % of tasks completed successfully | Human or auto-eval per task | > 85% |
| Tool selection accuracy | % of tool calls where the correct tool was chosen | Compare to golden tool sequence | > 95% |
| Tool argument accuracy | % of tool calls where all parameters were correct | Compare to golden parameters | > 90% |
| Steps to completion | Average number of agent steps per task | Count thought-action-observation cycles | As low as possible |
| Recovery rate | % of failure-injected tasks where the agent recovered | Inject failures, measure recovery | > 60% |
| Loop rate | % of tasks where the agent entered a loop | Detect repeated thought-action pairs | < 2% |
| Hallucination rate | % of tool calls with fabricated tool names/params | Validate against tool schema | < 1% |
| Cost per task | Average token cost per task | Sum token usage across all steps | Budget-dependent |
| Time per task | Average wall-clock time per task | Measure end-to-end latency | SLA-dependent |

### Evaluation task suite design

A good agent evaluation suite should have:

| Task category | % of suite | Examples | Difficulty |
|---|---|---|---|
| Simple single-tool | 20% | "Search for X", "Get status of Y" | Easy |
| Multi-tool sequential | 30% | "Search X, then use result to query Y" | Medium |
| Conditional branching | 20% | "If X exists, do A; otherwise do B" | Medium |
| Error recovery | 15% | Tasks with injected tool failures | Hard |
| Open-ended | 10% | "Find the best option for..." | Hard |
| Edge cases | 5% | Empty results, very long results, ambiguous queries | Very hard |

### Golden trajectory annotation

For each task, annotate the expected trajectory:

```
Task: "Find the price of the most recent order for customer john@example.com"

Golden trajectory:
1. Thought: Need to find the customer ID for this email
   Tool: get_customer(email="john@example.com")
   Expected: {"id": "cust_123", "name": "John"}

2. Thought: Have customer ID, now get the most recent order
   Tool: get_orders(customer_id="cust_123", limit=1, sort="created_at desc")
   Expected: {"orders": [{"id": "ord_456", "total": 99.99, "created_at": "..."}]}

3. Thought: Have the order, answer the question
   Final answer: "The most recent order (ord_456) has a total of $99.99"
```

### Evaluation automation

The evaluation pipeline:

```
For each task in the suite:
  1. Reset agent state
  2. Submit task description
  3. For each agent step:
     a. Capture thought, tool call, tool parameters
     b. Execute tool call (or simulate for deterministic eval)
     c. Return observation to agent
     d. Check for loops, timeouts, budget exceeded
  4. Score final answer against expected outcome
  5. Score trajectory against golden path
  6. Record all metrics
```

### Cost of evaluation

| Task complexity | LLM calls per task | Cost per task (Sonnet) | For 100-task suite |
|---|---|---|---|
| Simple (1 tool) | 2-3 | $0.02-0.05 | $2-5 |
| Medium (3-5 tools) | 5-10 | $0.05-0.15 | $5-15 |
| Complex (5-10 tools) | 10-20 | $0.15-0.30 | $15-30 |
| Full suite | 2-10 avg | $0.05-0.10 avg | $5-10 per run |

## Action recommendations

1. Build a task suite of 50-200 representative tasks with golden trajectories. Start with 50 tasks and expand as you discover new failure modes.
2. Run the evaluation suite on every change: prompt update, model change, tool schema change, or agent architecture change. Treat it as the agent's CI/CD gate.
3. Track task success rate as the primary metric; use diagnostic metrics (tool accuracy, recovery rate) to investigate regressions.
4. Inject failures into 15% of evaluation tasks to measure recovery rate. This is the best predictor of production reliability.
5. Automate the evaluation using deterministic tool simulation. Mock tool outputs ensure reproducible results.
6. Budget 5-10% of your agent development cost for evaluation. The cost of evaluation is far less than the cost of production failures.
7. Review evaluation failures weekly with the team. Each failure is a signal for improving tool descriptions, prompts, or agent architecture.

## Anti-patterns

- **Evaluating only final output quality, not the trajectory**: an agent can produce the right answer for the wrong reasons (e.g., it guessed correctly). Trajectory evaluation catches this.
- **Using LLM-as-judge for agent evaluation without human validation**: LLM judges have blind spots for agent-specific failures (tool misuse, loops, inefficiency). Validate the judge on 20-30 human-annotated examples.
- **Task suite too small or too artificial**: a 10-task suite of toy problems does not represent production. Build the suite from real user tasks.
- **Not including failure-injection tasks**: an agent with 95% success rate on clean tasks may have 50% success rate in production where failures are common.
- **Not tracking cost per task**: an agent that achieves 95% success but costs 10x more than the baseline may not be a net improvement.
- **Evaluating only on happy-path tasks**: the agent's behavior on edge cases (empty results, very long inputs, ambiguous queries) is the real test of production readiness.
- **Not versioning the evaluation suite**: the suite should evolve with the agent. Use git to track changes and ensure reproducibility.

## Related

- Same category: [agent-architecture-patterns-summary.md](./agent-architecture-patterns.md) (the patterns being evaluated), [llm-evaluation-methods-summary.md](./llm-evaluation-methods.md) (general LLM evaluation, the foundation for agent evaluation), [run-a-two-loop-llm-evaluation-summary.md](./run-a-two-loop-llm-evaluation.md) (two-loop evaluation methodology)
- Upstream: [tune-prompts-summary.md](./tune-prompts.md), [prompt-engineering-guide-summary.md](./prompt-engineering-guide.md) (prompt tuning informed by evaluation)
- Platform: [../platform/dashboard-ai-agent-observability.md](../platform/dashboard-ai-agent-observability.md) (production monitoring of agent metrics)

## References

- Shinn et al., 2023 -- *Reflexion: Language Agents with Verbal Reinforcement Learning*
- Yao et al., 2022 -- *ReAct: Synergizing Reasoning and Acting in LLMs*
- AgentBench -- *Evaluating LLMs as Agents* (2023)
- SWE-Bench -- *Can Language Models Resolve Real-World GitHub Issues?* (2024)
- WebArena -- *A Realistic Web Environment for Building Autonomous Agents* (2024)