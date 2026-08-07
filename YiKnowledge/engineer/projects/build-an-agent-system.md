---
title: Build an agent system
aliases:
- I want to build an Agent system
- agent-journey
- tool-use-journey
- Agent system entry
tags:
- journeys
- agent
- tool-use
- llm
- sse
- rpc-envelope
- dual-world
category: engineer/projects
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- engineer
- tech-lead
benefit: system is reproducible
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./build-a-rag-pipeline.md
- ../../ai-engineer/platform/pick-an-llm-provider.md
- ../../ai-engineer/platform/evaluate-an-llm-app.md
- ../../ai-engineer/methodology/agent-architecture-patterns.md
review_cycle: quarterly
tacit: false
---

# I want to build an agent system

> **As an** engineer, **I want to** build an agent system, **so that** system is reproducible. 

> "Agent architecture + tool invocation + multi-step reasoning + streaming feedback + security boundary" reach within 2 hops Agent patterns + prompts + RPC envelope + SSE + dual-world boundary + evaluation. 

## Summary

- Agent architecture goes [agent-architecture-patterns-summary.md](../../ai-engineer/methodology/agent-architecture-patterns.md): single/multi agent / planner-executor / reflection
- Tool invocation prompt goes [agent-tool-use-prompt.md](../../ai-engineer/methodology/prompts/agent-tool-use.md)
- Streaming goes [sse-streaming-pattern.md](../architecture-design/sse-streaming.md) + [rpc-envelope-pattern.md](../architecture-design/rpc-envelope.md)
- Security boundary goes [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md) + [prompt-injection-defense-summary.md](../../ai-engineer/methodology/prompt-injection-defense.md)
- Evaluation goes [llm-evaluation-methods-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md) + [evaluation-driven-development-pattern.md](../engineering/evaluation-driven-development.md)

## Core viewpoints

**Agent architecture should be the simplest that works; start with single-agent, not multi-agent.** Multi-agent systems (planner + executor, reflection loops) are tempting because they mirror how humans think, but they introduce coordination overhead, higher latency, higher cost, and more failure modes. A single agent with well-designed tools solves 80% of use cases. Add complexity only when the single-agent approach demonstrably fails.

**Tool design is the most underinvested part of agent systems.** The quality of an agent's output is determined more by the quality of its tools than by the quality of its prompt. Each tool needs an explicit name, a precise description, a JSON schema for parameters, error codes for every failure mode, and a timeout. A tool with a vague description will be misused by the LLM in ways that are hard to debug.

**Security is not a feature of agents; it is the container they run in.** An agent with access to a database, a file system, and an API is a powerful attack surface. The security boundary (tool allowlist, permission scope, read-only vs. read-write, dual-world boundary for write operations) must be enforced at the infrastructure level, not in the prompt. Prompt-level security is not security.

**Observability is non-negotiable for agents because debugging them is exponentially harder than debugging deterministic code.** A traditional service has a linear call stack. An agent has a branching tree of LLM calls, tool invocations, and reasoning steps. Without tracing (every LLM call, every tool invocation, every intermediate reasoning step), a failed agent task is a black box. The observability investment must happen before the first agent goes to production.

## Key info

- **Agent architecture selection decision tree (4 tiers, start simplest)**: (1) Single Agent with tools — one LLM, tool registry, loop until task complete; solves 80% of use cases; metrics: tool-call success rate, task completion rate, average steps per task; (2) Planner-Executor — planner agent decomposes task into steps, executor agent runs each step; adds coordination overhead (+50% latency, +30% cost); use when single agent fails on multi-step tasks; (3) Reflection/Self-Critique — agent evaluates its own output and retries; adds 1-3 extra LLM calls per task; use when output quality variance is high; (4) Multi-Agent Swarm — specialized agents collaborate; adds exponential complexity; use only when task requires distinct domain expertise that cannot fit in one system prompt. The Yi-family BRD Agent uses single-agent architecture with tool invocation.
- **Tool design specification (5 required fields per tool)**: (1) Name — unique, descriptive, snake_case (e.g., `search_knowledge_base`); (2) Description — 1-2 sentences explaining what the tool does, when to use it, and what it returns; this is the most important field because the LLM uses it to decide which tool to call; (3) JSON Schema — full parameter specification with types, descriptions, required fields, and default values; (4) Error codes — structured error response for every failure mode (error_code + human_readable_message + suggested_next_action); the LLM should never see a raw stack trace; (5) Timeout — maximum execution time in seconds, after which the tool returns a timeout error. A tool with a vague description will be misused by the LLM in ways that are hard to debug.
- **Agent security boundary enforcement (4 layers, enforced at infrastructure level, not in prompt)**: (1) Tool allowlist — explicit registry of permitted tools; agent cannot call any function not in the allowlist; (2) Permission scope — each tool declares read-only vs. read-write; write operations require explicit user confirmation or run in dual-world sandbox; (3) Input sanitization — all user input passes through prompt injection defense before reaching the agent; (4) Output validation — agent output is validated against expected schema before being returned to the user. Prompt-level security ("please don't do bad things") is not security — the infrastructure must enforce the boundary.
- **Agent observability requirements (5 must-have traces)**: (1) Every LLM call — model, prompt token count, completion token count, latency, cost; (2) Every tool invocation — tool name, parameters, result, latency, success/failure; (3) Every reasoning step — intermediate thoughts, decisions, and state transitions; (4) Task-level metrics — total steps, total tokens, total cost, total latency, task completion status; (5) Abort signals — when and why the user cancelled or the system timed out. Without these traces, debugging a failed agent task is a black box. The Yi-family standard: observability must be wired before the first agent goes to production, using the shared client RPC envelope for tracing.
- **Agent cost management strategy**: Agent tasks can consume hundreds of LLM calls per task. Cost varies dramatically by model choice (GPT-4o ~$5/1M input tokens vs. Claude Haiku ~$0.25/1M) and task complexity. Strategy: (1) Route simple tasks to cheap/fast models, complex tasks to flagship models (multi-provider routing); (2) Set per-task token budget — if task exceeds budget, escalate to user or degrade gracefully; (3) Track per-task cost from day one — token usage × model pricing = cost; (4) Monitor cost anomaly detection — if average cost per task increases > 50% week-over-week, investigate. YiAi BRD Agent uses multi-provider routing with 5-stage grayscale rollout.
- **Yi-family agent systems (2026-08)**: YiAi BRD Agent — single-agent architecture, tool invocation for knowledge base search + BRD generation, SSE streaming with RPC envelope, dual-world boundary for write operations, multi-provider LLM routing. YiVad aiChat Agent — single-agent with followUp queue, QueueMode, terminate flag, agent system prompt UI. Both use the shared client vendor for RPC/SSE, observability via basic FastAPI middleware (request count, error rate, latency). Tool-call success rate and task completion rate are tracked as internal KPIs. Full agent observability (per-call tracing, per-task cost) is not yet implemented.

## Scenario

When building tool-invocation Agent / multi-step reasoning Agent / RAG + tool hybrid Agent / task auto-execution Agent, architect + algorithm + engineer need to look up Agent architecture patterns + prompts + RPC/SSE + security boundary + evaluation. This entry aggregates Agent-related 6 leaves + RPC/SSE + dual-world boundary + landing cases into 2-hop paths, avoiding "choosing architecture by demo / tool invocation without envelope / streaming without degradation / no injection defense". 

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `methodology/ai-specific/` | [agent-architecture-patterns-summary.md](../../ai-engineer/methodology/agent-architecture-patterns.md) · [prompt-engineering-guide-summary.md](../../ai-engineer/methodology/prompt-engineering-guide.md) · [llm-evaluation-methods-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md) · [hallucination-mitigation-summary.md](../../ai-engineer/methodology/hallucination-mitigation.md) · [prompt-injection-defense-summary.md](../../ai-engineer/methodology/prompt-injection-defense.md) · [rag-design-patterns-summary.md](../../ai-engineer/methodology/rag-design-patterns.md) · [model-finetuning-decision-tree-summary.md](../../ai-engineer/methodology/model-finetuning-decision-tree.md) |
| `methodology/engineering-patterns/` | [rpc-envelope-pattern.md](../architecture-design/rpc-envelope.md) · [sse-streaming-pattern.md](../architecture-design/sse-streaming.md) · [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md) · [evaluation-driven-development-pattern.md](../engineering/evaluation-driven-development.md) · [inline-citation-rag-pattern.md](../engineering/inline-citation-rag.md) |
| `resources/prompts/` | [agent-tool-use-prompt.md](../../ai-engineer/methodology/prompts/agent-tool-use.md) · [rag-system-prompt.md](../../ai-engineer/methodology/prompts/rag-system.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [multilingual-translation-prompt.md](../../ai-engineer/methodology/prompts/multilingual-translation.md) — prompts usable as tools |
| `tech/ai-platform/` | [llm-comparison-summary.md](../../ai-engineer/platform/llm-comparison.md) · [inference-engine-comparison-summary.md](../../ai-engineer/platform/inference-engine-comparison.md) · [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) · [llama-index-evolution-summary.md](../../ai-engineer/platform/llama-index-evolution.md) · [ai-workbench-user-guide-summary.md](../../ai-engineer/platform/ai-workbench-user-guide.md) |
| `tech/ai-foundations/` | [transformer-architecture-summary.md](../../ai-engineer/foundations/transformer-architecture.md) · [kv-cache-inference-optimization-summary.md](../../ai-engineer/foundations/kv-cache-inference-optimization.md) · [long-context-techniques-summary.md](../../ai-engineer/foundations/long-context-techniques.md) — long context key for Agent |
| `product/ux/` | [ai-product-ux-patterns-summary.md](../../product-manager/discovery/ux/ai-product-ux-patterns.md) — Agent feedback UX (streaming / tool card / cancel / retry)  |
| `product/metrics/` | [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) — Agent business metrics (task completion rate / tool invocation accuracy / user reuse rate)  |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../lessons/win-yiai-brd-agent-launch.md) — BRD Agent landing · [yiai-rag-hybrid-retrieval-win.md](../lessons/win-yiai-rag-hybrid-retrieval.md) — RAG + Agent hybrid · [yiai-llm-phase-five-win.md](../lessons/win-yiai-llm-phase-five.md) |
| `lessons/gotchas/` | [sse-ondone-guard.md](../lessons/gotcha-sse-ondone-guard.md) — streaming onDone guard · [react-jsxdev-mismatch.md](../lessons/gotcha-react-jsxdev-mismatch.md) |
| `projects/YiAi/` | [adr-brd-agent-launch.md](../../tech-lead/decisions/yiai/brd-agent-launch.md) · [adr-multi-provider-llm-routing.md](../../tech-lead/decisions/yiai/route-llm-traffic-across-providers.md) · [adr-llm-multi-provider-rollout.md](../../tech-lead/decisions/yiai/llm-multi-provider-rollout.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) — Agent design documentation |

## Action recommendations

1. **Architecture selection**: single Agent (simple tool invocation) / multi Agent (planner + executor) / Reflection (self-eval retry) choose by complexity; see [agent-architecture-patterns-summary.md](../../ai-engineer/methodology/agent-architecture-patterns.md). 
2. **Tool design**: each tool explicit name + description + JSON schema + error code + timeout; do not let Agent guess parameters. 
3. **Streaming feedback**: must use SSE, streaming chunk + tool_call + tool_result return in stages; see [sse-streaming-pattern.md](../architecture-design/sse-streaming.md) + [sse-ondone-guard.md](../lessons/gotcha-sse-ondone-guard.md). 
4. **RPC envelope**: all tool invocations go unified RPC envelope (id + type + payload + error) ; see [rpc-envelope-pattern.md](../architecture-design/rpc-envelope.md). 
5. **Cancel + retry**: user can cancel + failure can retry + tool failure can degrade; frontend UX see [ai-product-ux-patterns-summary.md](../../product-manager/discovery/ux/ai-product-ux-patterns.md). 
6. **Security boundary**: Agent cannot directly touch production data / cannot bypass permission / tool allowlist; go [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md). 
7. **Injection defense**: user input may hijack Agent, go input hardening + output review + tool allowlist + refuse strategy; see [prompt-injection-defense-summary.md](../../ai-engineer/methodology/prompt-injection-defense.md). 
8. **Hallucination mitigation**: tool result must reference + reference must traceable; see [hallucination-mitigation-summary.md](../../ai-engineer/methodology/hallucination-mitigation.md) + [inline-citation-rag-pattern.md](../engineering/inline-citation-rag.md). 
9. **Evaluation**: build eval set covering tool selection accuracy + parameter filling + task completion rate + security; see [llm-evaluation-methods-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md). 
10. **Observability**: launch must monitor tool invocation success rate / average steps / task completion rate / single task cost; see [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md). 
11. **Multi provider**: Agent many steps high cost, route by task to cheap model / hard tasks to flagship; see [adr-multi-provider-llm-routing.md](../../tech-lead/decisions/yiai/route-llm-traffic-across-providers.md). 

## Anti-patterns

- **Starting with a multi-agent architecture for a simple task.** A single document Q&A agent does not need a planner agent, an executor agent, and a critic agent. Start with a single agent calling tools directly. Introduce multi-agent patterns only when the single agent cannot handle the task complexity, and only after measuring the single agent's failure modes.

- **Tools without error handling.** A tool that returns a raw exception stack trace to the LLM will cause the agent to hallucinate a fix or loop forever. Every tool must catch errors, return a structured error response (error code + human-readable message + suggested next action), and respect a timeout. The LLM should never see a stack trace.

- **No tool allowlist.** An agent that can call any function in the codebase is a security incident waiting to happen. The tool registry must be an explicit allowlist. Tools that perform write operations (delete, update, send) must require explicit user confirmation or run in a dual-world sandbox.

- **Agent without cancellation.** A long-running agent task that cannot be cancelled by the user is a hostage situation. Every agent loop must check an abort signal on each iteration. The SSE streaming protocol must support a stop frame from the client. The frontend must show a visible stop button that works immediately.

- **Deploying an agent without per-task cost tracking.** Agents can consume hundreds of LLM calls per task, and the cost varies dramatically by model choice and task complexity. Without per-task cost tracking, a single expensive agent task can blow the monthly LLM budget. Track token usage, model cost, and total cost per task from day one.

## Related

- Same-class journey: [./build-a-rag-pipeline.md](./build-a-rag-pipeline.md) — RAG and Agent complement each other
- Same-class journey: [../../ai-engineer/platform/pick-an-llm-provider.md](../../ai-engineer/platform/pick-an-llm-provider.md) — underlying model selection
- Same-class journey: [../../ai-engineer/platform/evaluate-an-llm-app.md](../../ai-engineer/platform/evaluate-an-llm-app.md) — Agent evaluation
- Same-class journey: [../tools/share-client-across-projects.md](../engineering/share-client-across-projects.md) — RPC + SSE shared
- Upstream: [../../ai-engineer/methodology/README.md](../../ai-engineer/methodology/README.md) — ai-specific leaf entry
