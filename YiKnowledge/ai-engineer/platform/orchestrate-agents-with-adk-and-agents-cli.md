---
title: Orchestrate agents with ADK and Agents CLI
aliases: [I want to orchestrate agents with ADK and Agents CLI, adk-journey, agents-cli-journey, agent-development-kit, multi-agent-orchestration]
tags: [journeys, adk, agents-cli, multi-agent, a2a, agent-runtime, gemini-enterprise, scaffolding, lifecycle]
category: ai-engineer/platform
created: 2026-08-05
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles: [ai-engineer, engineer]
benefit: "Multi-agent systems are orchestrated with Google ADK and Agents CLI, enabling scalable agent deployment with A2A protocol"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - anti-patterns or when-not-to-use are identified
related:
  - ../../ai-engineer/methodology/run-a-two-loop-llm-evaluation.md
  - ./evaluate-an-llm-app.md
  - ./llama-index-evolution.md
  - ./llm-observability-comparison.md
  - ./pick-an-llm-provider.md
  - ../../engineer/process/operate-as-a-forward-deployed-engineer.md
  - ../../knowledge-curator/templates/thinking--first-principles.md
  - ../../knowledge-curator/templates/thinking--inversion.md
  - ../../knowledge-curator/templates/thinking--second-order-thinking.md
  - ../../knowledge-curator/templates/thinking--ockhams-razor.md
tacit: "ADK is not just another framework; it is a software-engineered Agent stack. scaffold → eval → deploy → publish → observe five-stage lifecycle; Agents CLI 7 skills turn any coding agent into an ADK expert; distinct from multi-agent-strategy: the latter focuses on architecture principles, this file focuses on the GCP tool stack"
---

# I want to orchestrate agents with ADK and Agents CLI

> **As an** ai engineer, **I want to** orchestrate agents with ADK and Agents CLI, **so that** launch is safe.

## Summary

- ADK = Agent Development Kit; Google open-source code-first multi-agent framework
- Software-engineered: modularity + hierarchy + deterministic control
- Multi-Agent by design: Manager → Researcher + Coder hierarchy
- A2A Protocol: cross-system agent discovery + communication
- LiteLLM model-agnostic: Gemini first, also supports GPT-4o / Claude / Mistral
- Agents CLI: 2026-04-22 Alpha; 7 skill packs; turn coding agents into ADK experts
- Five-stage lifecycle: scaffold → eval → deploy → publish → observe
- Deploy targets: Agent Runtime / Cloud Run / GKE
- Distinct from multi-agent-strategy: this file focuses on the GCP tool stack
- Publicly queryable; periodic review
- First principles / inversion / second-order / Occam

## Core viewpoints

**ADK is not "yet another agent framework" -- it is a software engineering discipline applied to agents.** The key differentiator is that ADK treats agents as software artifacts with a defined lifecycle: scaffold, eval, deploy, publish, observe. This is fundamentally different from frameworks that treat agents as prompt wrappers or chain-of-thought templates. The lifecycle means that every agent has a DESIGN_SPEC.md, automated tests, evaluation sets, deployment artifacts, and observability -- the same rigor expected of a microservice. This is the prerequisite for enterprise deployment of agent systems.

**The A2A (Agent-to-Agent) protocol is the most important architectural decision in ADK, not the framework itself.** A2A is an open standard for cross-system agent discovery and communication. It means that agents built with ADK can communicate with agents built with other frameworks, and agents can be deployed across different systems and still interoperate. The protocol is the escape hatch from vendor lock-in: if you adopt ADK for the framework but rely on A2A for communication, you can replace the framework without replacing the protocol.

**The five-stage lifecycle is a constraint that enables velocity, not a process that slows it down.** Scaffold -> eval -> deploy -> publish -> observe may seem like heavyweight process, but skipping any stage creates a different class of failure. Skipping scaffold means no DESIGN_SPEC, which means no shared understanding of what the agent does. Skipping eval means no automated quality gate, which means every change is a leap of faith. Skipping deploy means no infrastructure-as-code, which means manual deployment errors. The lifecycle is not optional ceremony -- it is the minimum viable software engineering discipline for agents.

**Agents CLI is a force multiplier for coding agents, not a replacement for developer expertise.** The 7 skill packs (workflow, scaffold, adk-code, eval, deploy, publish, observability) are designed to turn any coding agent (Claude Code, Gemini CLI, Codex, Antigravity) into an ADK expert. This means the developer does not need to memorize ADK commands -- they describe the task, and the coding agent uses the skill packs to execute it. But the developer still needs to understand the architecture, review the DESIGN_SPEC, and validate the evaluation results. Agents CLI amplifies expertise; it does not replace it.

**The "software-engineered" philosophy means deterministic control, not LLM-driven planning, as the default for workflow orchestration.** SequentialAgent, ParallelAgent, and LoopAgent provide deterministic control flow. This is intentionally different from frameworks that rely on LLM planning to decide the next step. The LLM is used for reasoning within a step, not for deciding which step to take next. This tradeoff prioritizes reliability and debuggability over flexibility, which is the right choice for enterprise deployments where unpredictable behavior is a liability.

## Key info

- **ADK agent primitives (4 types with use cases)**: (1) LlmAgent — single LLM-powered agent with tools, memory, and instructions; the basic building block; (2) SequentialAgent — executes child agents in a fixed sequence, each receiving the output of the previous; use case: extract → analyze → summarize pipelines; (3) ParallelAgent — executes child agents concurrently and merges results; use case: multi-perspective analysis, independent subtasks; (4) LoopAgent — executes child agents in a loop until a termination condition is met; use case: iterative refinement, self-correction, research loops. The key design principle: use deterministic agents (Sequential, Parallel, Loop) for workflow control, use LlmAgent only for reasoning steps within the workflow. This is the opposite of frameworks like LangGraph that use LLM planning for workflow decisions.
- **Agents CLI 7 skill packs and their functions**: (1) workflow — defines the agent's task flow and orchestration pattern; (2) scaffold — `agents-cli create` generates DESIGN_SPEC.md, project structure, tests, and eval sets; (3) adk-code — generates ADK-compliant agent code with proper lifecycle hooks; (4) eval — `agents-cli eval run` runs evaluation against golden dataset, `eval compare` compares against baseline; (5) deploy — provisions Agent Runtime, Cloud Run, or GKE with service accounts, secrets, and networking; (6) publish — registers agent with Gemini Enterprise or Agent Registry for A2A discovery; (7) observability — Cloud Trace (on by default) + BigQuery Agent Analytics + AgentOps/Phoenix/MLflow integration. The 7 skills are auto-discovered by coding agents (Claude Code, Gemini CLI, Codex, Antigravity) so the developer describes the task and the coding agent executes it.
- **A2A (Agent-to-Agent) protocol specification**: Open standard for cross-system agent discovery and communication. Components: Agent Card — JSON metadata describing the agent's capabilities, inputs, outputs, and endpoint; Task — a unit of work sent between agents with a unique ID, status, and result; HTTP/JSON transport — agents communicate via standard HTTP requests with JSON payloads. A2A enables: agents built with different frameworks to interoperate, agents deployed on different systems to discover each other, and agent capabilities to be published and consumed like APIs. The protocol is the escape hatch from vendor lock-in: adopt ADK for the framework, rely on A2A for communication, and you can replace the framework without replacing the protocol.
- **ADK five-stage lifecycle with stage gates**: (1) Scaffold — produces DESIGN_SPEC.md (agent purpose, inputs, outputs, tools, eval criteria), project structure, initial tests; gate: DESIGN_SPEC reviewed and approved; (2) Eval — produces evaluation results against golden dataset, comparison against baseline; gate: all eval metrics meet thresholds; (3) Deploy — produces running agent on target infrastructure (Agent Runtime/Cloud Run/GKE); gate: health checks pass, canary 1% traffic validated; (4) Publish — produces registered agent in Gemini Enterprise/Agent Registry; gate: agent discoverable via A2A, can be invoked by other agents; (5) Observe — produces monitoring dashboards, alerts, cost tracking; gate: P95 latency, error rate, and cost within budget. Each stage has a defined gate; the next stage does not start until the current gate passes.
- **Deploy target comparison (Agent Runtime vs. Cloud Run vs. GKE)**: Agent Runtime — fully managed, zero-infrastructure, designed specifically for ADK agents, best for teams that don't want to manage infrastructure; Cloud Run — serverless container platform, auto-scaling to zero, best for event-driven agents with variable load; GKE — Kubernetes-based, full control over infrastructure, best for teams already on GKE with high-scale or GPU requirements. The trade-off: Agent Runtime has the lowest operational burden but the least flexibility; GKE has the highest operational burden but the most flexibility. The Yi-family projects have not adopted ADK; the primary agent framework is llama_index for RAG and Pi Agent Harness for evaluation.
- **ADK vs. alternative agent frameworks (LangGraph, CrewAI, AutoGen)**: ADK differentiator — software-engineered lifecycle (scaffold → eval → deploy → publish → observe) vs. prompt-wrapper approach; deterministic control flow (Sequential/Parallel/Loop) vs. LLM-driven planning; A2A open protocol vs. proprietary communication; Gemini-first with LiteLLM multi-model support vs. OpenAI-first. LangGraph differentiator — graph-based agent workflows with flexible routing, Python-native, large community; CrewAI differentiator — role-based agent design, simpler API, faster prototyping; AutoGen differentiator — multi-agent conversations, Microsoft ecosystem. The choice depends on: need for lifecycle discipline (ADK), need for flexible graph workflows (LangGraph), need for rapid prototyping (CrewAI), or need for Microsoft integration (AutoGen).

## Scenario

ADK is not just another framework; it is a software-engineered Agent stack. This entry provides the ADK + Agents CLI full path, covering core primitives + A2A + LiteLLM + 7 skills + five-stage lifecycle + three deploy targets, linked with prepare-a-multi-agent-strategy + run-a-two-loop-llm-evaluation + evaluate-an-llm-app + llama-index-evolution + llm-observability-comparison + pick-an-llm-provider + operate-as-a-forward-deployed-engineer, publicly queryable, periodic review, and links to multi-agent-strategy / two-loop-eval / llm-eval / llama-index / llm-observability / llm-provider / fde-role and other leaves.

## 2-hop reachability paths

| Hops | Goal | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | multi-agent-strategy | [../foundations/prepare-a-multi-agent-strategy.md](../../knowledge-curator/archive/strategies-legacy/ai-engineer/prepare-a-multi-agent-strategy.md) |
| 1 hop | two-loop-eval | [../methodology/run-a-two-loop-llm-evaluation.md](../methodology/run-a-two-loop-llm-evaluation.md) |
| 2 hops | fde-role | [../../engineer/process/operate-as-a-forward-deployed-engineer.md](../../engineer/process/operate-as-a-forward-deployed-engineer.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking--first-principles.md](../../knowledge-curator/templates/thinking--first-principles.md) |

## Action recommendations

1. **Anchor on software engineering**: ADK treats Agents as software; not prompt toys
2. **Core primitives**: Multi-Agent by design + hierarchy + deterministic control
3. **A2A Protocol**: open standard; cross-system agent discovery + HTTP interface
4. **LiteLLM model-agnostic**: Gemini first; also connects GPT-4o / Claude / Mistral
5. **Workflow Agents**: SequentialAgent + ParallelAgent + LoopAgent; no reliance on LLM planning
6. **Agents CLI install**: `uvx google-agents-cli setup`; Python 3.11+ / uv / Node.js
7. **7 skill packs**: workflow + scaffold + adk-code + eval + deploy + publish + observability
8. **scaffold**: `agents-cli create`; produces DESIGN_SPEC.md + tests + eval sets
9. **eval**: `agents-cli eval run` + `eval compare`; golden dataset + LLM-as-judge
10. **deploy**: Agent Runtime / Cloud Run / GKE; service accounts + secrets + rollback
11. **publish**: Gemini Enterprise / Agent Registry; ADK or A2A mode
12. **observe**: Cloud Trace on by default; BigQuery Agent Analytics + AgentOps / Phoenix / MLflow
13. **Coding Agent stream**: Claude Code / Gemini CLI / Codex / Antigravity auto-discover 7 skills
14. **Standalone stream**: terminal `agents-cli create` → `eval run` → `infra` → `deploy` → `publish`
15. **WSL 2**: macOS / Linux / Windows WSL 2; no native Windows
16. **Not tools for tools' sake**: each stage connects to landing scenarios and business measurement
17. **Not sloganeering**: each stage labeled with commands and outputs
18. **Versioned**: agent spec has versions; evolution is traceable
19. **Linked with multi-agent-strategy**: ADK + multi-agent principles co-built
20. **Linked with two-loop-eval**: ADK + two-loop evaluation co-built
21. **Linked with llm-eval**: ADK + LLM evaluation co-built
22. **Linked with llama-index**: ADK + LlamaIndex evolution co-built
23. **Linked with llm-observability**: ADK + observability co-built
24. **Linked with llm-provider**: ADK + provider selection co-built
25. **Linked with fde-role**: ADK + FDE co-built
26. **Distinct from multi-agent-strategy**: this file focuses on GCP tool stack; the latter on architecture principles
27. **Toolchain**: uvx / uv / Python 3.11+ / Node.js / Terraform / gcloud / Cloud Trace / BigQuery / LangSmith
28. **Publicly queryable**: lifecycle everyone can look up; not hidden
29. **Periodic review**: evolution updates; not one-shot (Agents CLI Alpha stage changes fast)
30. **First principles**: why ADK is needed; worst consequence of not doing it (prototypes can't ship / customers don't trust)
31. **Inversion thinking**: how much can be solved by self-building with LangGraph; can ops cost be borne
32. **Second-order thinking**: second-order consequences after ADK (vendor lock-in / team learning curve / deploy consistency)
33. **Occam**: lifecycle, the simpler the better; cut redundant stages

## Anti-patterns

- **Adopting ADK because it is "Google's framework" without evaluating whether the lifecycle discipline fits your team.** ADK's value is in the lifecycle discipline, not in the framework primitives. If your team is not prepared to write DESIGN_SPEC.md, maintain evaluation sets, and deploy with infrastructure-as-code, ADK will feel like unnecessary overhead. The framework choice should follow from the engineering discipline, not the other way around.

- **Building agents without a DESIGN_SPEC, then using scaffold as a documentation afterthought.** The scaffold command produces a DESIGN_SPEC.md that defines the agent's purpose, inputs, outputs, tools, and evaluation criteria. Running scaffold after the agent is built and then backfilling the DESIGN_SPEC defeats the purpose. The DESIGN_SPEC is the contract that the agent must fulfill, and the evaluation set is the test of that contract. Without the contract, the evaluation is testing against an undefined target.

- **Treating the Agents CLI as a "one-click deploy" tool without understanding the infrastructure it provisions.** The deploy command provisions Agent Runtime, Cloud Run, or GKE resources with service accounts, secrets, and networking. Blindly deploying without understanding the infrastructure creates security risks (overly permissive service accounts), cost risks (unmonitored resource usage), and operational risks (no rollback plan). The developer must understand what the deploy command does, not just that it works.

- **Skipping the publish stage because "the agent is running, so it's done."** The publish stage registers the agent with Gemini Enterprise or the Agent Registry, making it discoverable and accessible to other agents and users. An agent that is running but not published is an agent that cannot be discovered, reused, or composed with other agents. This undermines the core value of the A2A protocol.

- **Using LLM-driven planning for workflow orchestration when the task structure is known in advance.** If you know the sequence of steps (e.g., extract data, analyze, generate report), use SequentialAgent/ParallelAgent/LoopAgent, not an LLM planner. LLM-driven planning adds latency, unpredictability, and cost, and should only be used when the task structure genuinely cannot be determined in advance. The default should be deterministic control flow, with LLM planning as the exception.

## Related

- multi-agent-strategy: [../foundations/prepare-a-multi-agent-strategy.md](../../knowledge-curator/archive/strategies-legacy/ai-engineer/prepare-a-multi-agent-strategy.md) — multi-agent principles co-built
- two-loop-eval: [../methodology/run-a-two-loop-llm-evaluation.md](../methodology/run-a-two-loop-llm-evaluation.md) — two-loop evaluation co-built
- llm-eval: [./evaluate-an-llm-app.md](./evaluate-an-llm-app.md) — LLM evaluation co-built
- llama-index: [./llama-index-evolution.md](./llama-index-evolution.md) — LlamaIndex evolution co-built
- llm-observability: [./llm-observability-comparison.md](./llm-observability-comparison.md) — observability co-built
- llm-provider: [./pick-an-llm-provider.md](./pick-an-llm-provider.md) — provider selection co-built
- fde-role: [../../engineer/process/operate-as-a-forward-deployed-engineer.md](../../engineer/process/operate-as-a-forward-deployed-engineer.md) — FDE co-built
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking--first-principles.md) + [inversion](../../knowledge-curator/templates/thinking--inversion.md) + [second-order](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking--ockhams-razor.md)
