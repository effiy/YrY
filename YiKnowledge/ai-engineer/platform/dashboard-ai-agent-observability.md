---
title: ai agent observability dashboard
aliases:
- agent observability dashboard
- agent monitoring dashboard
- multi-agent dashboard
- agent ops dashboard
tags:
- dashboard
- ai-agent
- agent-observability
- multi-agent
- tool-use
- agent-orchestration
- agent-evaluation
category: ai-engineer/platform
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: weekly
roles:
- ai-engineer
- tech-lead
- oncall-sre
benefit: AI agent performance, tool use reliability, and multi-agent coordination visible at a glance
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
- agent success rate, tool call reliability, orchestration health, latency, cost efficiency, and safety compliance defined
related:
- ./dashboard-ai-performance.md
- ./dashboard-llm-cost.md
- ./dashboard-vector-database-health.md
- ../methodology/dashboard-rag-quality.md
- ../foundations/dashboard-ai-safety.md
tacit: false
---

# ai agent observability dashboard

> **As an** AI engineer, **I want to** track AI agent performance and reliability, **so that** every agent completes its tasks successfully, tool calls are reliable, multi-agent coordination is efficient, and agent behavior is safe, auditable, and cost-effective — turning autonomous agents from unpredictable black boxes into measured, trusted, and continuously improving digital workers.

> AI agents are autonomous decision-makers that interact with tools, APIs, and each other. This dashboard tracks agent success rate, tool call reliability, orchestration health, agent latency, cost efficiency, and safety compliance — turning agent operations from "did it work?" guesswork into a measured, optimized, and trustworthy agent platform.

## Summary

- 6 agent observability dimensions: agent success rate, tool call reliability, orchestration health, agent latency, cost efficiency, safety compliance
- 34 AI agents across 5 agent types: conversational (8), task-execution (12), RAG-research (6), code-generation (5), multi-modal (3); 1.2M agent runs/day
- Agent success rate: 87.5% task completion (target 95%); 8.5% partial completion; 4.0% failure; 12% require human escalation
- Tool call reliability: 94% tool call success rate; 3.2% tool timeout; 2.8% tool error; 28 tools registered; avg 4.2 tool calls per agent run
- Orchestration health: 8 multi-agent workflows; 92% workflow completion; 3 agent handoff failures/day; 1.8 avg agents per workflow
- Agent latency: 8.5s avg agent run (target < 10s); 28s P95; 45s P99; 2.5 tool calls in critical path avg
- Dashboard reviewed weekly; agent optimization sprint biweekly with AI engineering

## Core viewpoints

- Agent success is not model accuracy — a model can produce perfect outputs but the agent can still fail if tool calls time out, the wrong tool is selected, or the orchestration logic has a bug; agent success is an end-to-end system property, not a model property
- Tool calls are the weakest link — every external dependency (API, database, search index) is a failure point; a 99% reliable tool called 5 times per agent run gives you a 95% agent success rate before you even consider the model
- Multi-agent systems amplify failures — if agent A has a 95% success rate and hands off to agent B with a 95% success rate, the workflow success rate is 90%; with 3 agents it's 86%; the more agents in a chain, the more critical each agent's reliability becomes
- Cost compounds with agent loops — a single agent run that iterates 8 times with 4 tool calls each costs 32× the LLM tokens of a single completion; agent cost optimization is the highest-leverage AI cost work

## Key information

### 6-panel agent observability overview

```
┌──────────────────────────────────────────────────────────────────┐
│  AGENT SUCCESS RATE                  │  TOOL CALL RELIABILITY               │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Task completion: 87.5%  │   │  │  Tool success: 94.0%     │   │
│  │  Partial: 8.5%           │   │  │  Tool timeout: 3.2%      │   │
│  │  Failure: 4.0%           │   │  │  Tool error: 2.8%        │   │
│  │  Human escalation: 12%   │   │  │  Tools registered: 28    │   │
│  │  Runs/day: 1.2M          │   │  │  Avg calls/run: 4.2      │   │
│  │  Retry rate: 18%         │   │  │  Tool latency P50: 1.2s  │   │
│  │  Success score: B (78)   │   │  │  Tool score: B+ (82)     │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  ORCHESTRATION HEALTH                │  AGENT LATENCY                       │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Workflows: 8 active     │   │  │  P50: 8.5s              │   │
│  │  Completion rate: 92%    │   │  │  P95: 28s               │   │
│  │  Handoff failures: 3/day │   │  │  P99: 45s               │   │
│  │  Avg agents/workflow:1.8 │   │  │  TTFA (time to first    │   │
│  │  Max depth: 4 agents     │   │  │  action): 2.8s          │   │
│  │  Deadlock events: 5/mo   │   │  │  Tool chain depth: 2.5  │   │
│  │  Orchestration: B- (72)  │   │  │  Latency score: B (80)  │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  COST EFFICIENCY                     │  SAFETY COMPLIANCE                   │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Avg cost/run: $0.042    │   │  │  Guardrail triggers:2.8% │   │
│  │  Tokens/run: 8,500 avg   │   │  │  Blocked actions: 1.2%   │   │
│  │  Waste (retries): 18%    │   │  │  Unsafe tool calls: 0.8% │   │
│  │  Tool call cost: 35%     │   │  │  Hallucinated tools: 2.5%│   │
│  │  Caching hit rate: 22%   │   │  │  Human review: 5.5%      │   │
│  │  Daily cost: $50,400     │   │  │  Policy violations: 0.3% │   │
│  │  Cost score: B- (72)     │   │  │  Safety score: B (78)    │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Agent success rate by type

| Agent type | Count | Runs/day | Success | Partial | Failure | Escalation | Retry rate | Avg steps |
|---|---|---|---|---|---|---|---|---|
| **Conversational** (customer support, FAQ) | 8 | 520K | 92.0% | 5.5% | 2.5% | 8% | 12% | 3.2 |
| **Task-execution** (data processing, API orchestration) | 12 | 380K | 85.0% | 10.0% | 5.0% | 15% | 22% | 5.8 |
| **RAG-research** (knowledge retrieval, synthesis) | 6 | 180K | 88.0% | 8.0% | 4.0% | 10% | 18% | 4.5 |
| **Code-generation** (code review, bug fix, refactor) | 5 | 85K | 82.0% | 12.0% | 6.0% | 18% | 25% | 6.2 |
| **Multi-modal** (image, audio, video analysis) | 3 | 35K | 84.0% | 10.5% | 5.5% | 14% | 20% | 4.8 |
| **Overall** | **34** | **1.2M** | **87.5%** | **8.5%** | **4.0%** | **12%** | **18%** | **4.2** |

### Agent failure analysis (last 30 days)

| Failure category | % of failures | Occurrences/day | Example | Root cause | Mitigation |
|---|---|---|---|---|---|
| **Tool timeout** | 28% | 13,440 | Search API > 30s timeout | External dependency slow, no circuit breaker | Add circuit breaker, set tool timeout per tool |
| **Wrong tool selection** | 22% | 10,560 | Agent calls `get_user` instead of `search_users` | Ambiguous tool descriptions, similar names | Improve tool descriptions, add tool selection validation |
| **Hallucinated tool parameters** | 18% | 8,640 | Agent invents `user_id: "abc"` that doesn't exist | Model hallucination, no parameter validation | Validate parameters before execution, add enum constraints |
| **Max steps exceeded** | 15% | 7,200 | Agent loops: search → refine → search → refine... | No convergence criteria, unbounded loops | Add max steps, convergence detection, early termination |
| **Context overflow** | 10% | 4,800 | Tool results exceed context window | Large tool outputs (entire documents) | Truncate tool outputs, summarize, paginate |
| **Permission denied** | 5% | 2,400 | Agent tries to call admin API without permission | Missing RBAC, tool not in agent's scope | Per-agent tool allowlists, RBAC for tools |
| **Other** | 2% | 960 | Various | — | — |

### Tool call reliability by tool

| Tool | Calls/day | Success rate | Timeout rate | Error rate | P50 latency | P95 latency | Dependencies | Health |
|---|---|---|---|---|---|---|---|---|
| **search_knowledge_base** | 380K | 96.5% | 2.0% | 1.5% | 0.8s | 3.2s | Vector DB, Embedding API | A- (90) |
| **query_database** | 280K | 94.0% | 3.5% | 2.5% | 1.2s | 5.5s | PostgreSQL, Read replicas | B+ (82) |
| **call_api** | 250K | 92.5% | 4.0% | 3.5% | 1.5s | 6.8s | Various external APIs | B (78) |
| **read_document** | 180K | 97.0% | 1.5% | 1.5% | 0.5s | 2.0s | Document store, S3 | A- (90) |
| **send_email** | 120K | 98.5% | 0.5% | 1.0% | 0.8s | 2.5s | Email API (SendGrid) | A (92) |
| **create_ticket** | 85K | 97.5% | 1.0% | 1.5% | 1.0s | 3.0s | Jira/Linear API | A- (88) |
| **run_code** | 72K | 88.0% | 5.0% | 7.0% | 3.5s | 12.0s | Sandbox, Python runtime | B- (72) |
| **fetch_web_page** | 65K | 91.0% | 6.0% | 3.0% | 2.5s | 8.5s | Internet, proxy | B (78) |
| **generate_image** | 28K | 93.0% | 4.5% | 2.5% | 4.5s | 15.0s | DALL-E/Stable Diffusion API | B (80) |
| **transcribe_audio** | 15K | 95.0% | 3.0% | 2.0% | 3.0s | 10.0s | Whisper API | B+ (85) |
| **Other (18 tools)** | 245K | 94.5% | 3.0% | 2.5% | 1.5s | 5.0s | Various | B+ (82) |

### Multi-agent workflow health

| Workflow | Agents | Runs/day | Completion | Handoff failures | Avg duration | Deadlock risk | Critical path |
|---|---|---|---|---|---|---|---|
| **Customer support triage** | Triage → Research → Response | 18K | 94% | 2/day | 12s | Low | Response agent depends on Research |
| **Code review pipeline** | Analyze → Review → Fix → Verify | 5K | 88% | 0.5/day | 45s | Medium | Fix depends on Review, Verify depends on Fix |
| **Data pipeline orchestration** | Extract → Transform → Validate → Load | 3K | 90% | 0.3/day | 35s | Low | Sequential, each depends on previous |
| **RAG research pipeline** | Query → Retrieve → Synthesize → Fact-check | 22K | 92% | 1/day | 18s | Low | Fact-check depends on Synthesize |
| **Incident response** | Detect → Diagnose → Remediate → Verify | 0.5K | 82% | 0.1/day | 60s | High | Diagnose and Remediate may loop |
| **Content generation** | Outline → Draft → Review → Publish | 2K | 91% | 0.05/day | 28s | Medium | Review may reject, loop back to Draft |
| **Multi-modal analysis** | Vision → OCR → Summarize → Index | 1.5K | 89% | 0.02/day | 22s | Low | Sequential pipeline |
| **Scheduled report generation** | Collect → Analyze → Visualize → Distribute | 1K | 93% | 0.01/day | 38s | Low | Distribute waits for Visualize |

### Agent latency breakdown

| Agent type | TTFA | Thinking time | Tool execution | Post-processing | Total P50 | Total P95 | Total P99 |
|---|---|---|---|---|---|---|---|
| **Conversational** | 1.2s | 2.5s | 3.0s (2.5 calls) | 0.8s | 7.5s | 18s | 28s |
| **Task-execution** | 2.0s | 3.8s | 8.5s (5.8 calls) | 1.5s | 15.8s | 42s | 68s |
| **RAG-research** | 1.8s | 3.2s | 5.5s (4.5 calls) | 1.2s | 11.7s | 28s | 45s |
| **Code-generation** | 2.5s | 5.0s | 12.0s (6.2 calls) | 2.0s | 21.5s | 55s | 85s |
| **Multi-modal** | 3.0s | 4.5s | 8.0s (4.8 calls) | 1.8s | 17.3s | 38s | 58s |
| **Overall** | **1.8s** | **3.2s** | **5.8s (4.2 calls)** | **1.2s** | **8.5s** | **28s** | **45s** |

### Agent cost efficiency

| Agent type | Avg tokens/run | Input tokens | Output tokens | LLM cost/run | Tool cost/run | Total cost/run | Cost/day | Waste % |
|---|---|---|---|---|---|---|---|---|
| **Conversational** | 4,200 | 2,800 | 1,400 | $0.018 | $0.005 | $0.023 | $11,960 | 12% |
| **Task-execution** | 12,500 | 8,000 | 4,500 | $0.052 | $0.018 | $0.070 | $26,600 | 22% |
| **RAG-research** | 9,800 | 6,500 | 3,300 | $0.038 | $0.012 | $0.050 | $9,000 | 18% |
| **Code-generation** | 15,200 | 9,500 | 5,700 | $0.065 | $0.022 | $0.087 | $7,395 | 25% |
| **Multi-modal** | 8,500 | 5,500 | 3,000 | $0.042 | $0.025 | $0.067 | $2,345 | 20% |
| **Overall** | **8,500** | **5,500** | **3,000** | **$0.035** | **$0.007** | **$0.042** | **$50,400** | **18%** |

### Safety and guardrail compliance

| Guardrail | Checks/day | Trigger rate | Block rate | False positive rate | Override rate | Action |
|---|---|---|---|---|---|---|
| **Tool call authorization** | 5.0M | 2.8% | 1.2% | 0.3% | 0.5% | Block unauthorized tool calls |
| **PII/sensitive data detection** | 1.2M | 1.5% | 0.8% | 0.2% | 0.1% | Redact PII before tool input |
| **Harmful content filter** | 1.2M | 0.8% | 0.5% | 0.1% | 0.05% | Block harmful agent outputs |
| **Hallucination detection** | 0.5M | 3.5% | 2.5% | 0.8% | 0.3% | Flag for human review |
| **Rate limit enforcement** | 1.2M | 1.0% | 0.8% | 0.1% | 0.0% | Queue or reject excess calls |
| **Permission boundary check** | 5.0M | 0.5% | 0.3% | 0.05% | 0.02% | Deny out-of-scope tool calls |
| **Bias and fairness check** | 0.3M | 2.0% | 0.5% | 1.2% | 0.3% | Flag biased outputs for review |
| **Overall** | **14.4M** | **2.8%** | **1.2%** | **0.2%** | **0.2%** | |

### Agent performance by model

| Model | Agent count | Success rate | Avg latency | Cost/run | Tool accuracy | Hallucination rate | Best for |
|---|---|---|---|---|---|---|---|
| **Claude Opus 4** | 8 | 91.5% | 10.2s | $0.068 | 95.5% | 1.8% | Complex reasoning, code-gen, multi-step |
| **Claude Sonnet 4** | 12 | 88.0% | 7.8s | $0.032 | 94.0% | 2.2% | Balanced cost/perf, task execution |
| **GPT-4o** | 6 | 86.5% | 8.5s | $0.045 | 93.0% | 2.8% | Multi-modal, vision tasks |
| **GPT-4o-mini** | 5 | 82.0% | 5.5s | $0.008 | 91.0% | 3.5% | Simple conversational, high volume |
| **Gemini 2.5 Pro** | 3 | 87.0% | 9.0s | $0.038 | 93.5% | 2.5% | Long context, research tasks |

## Action recommendations

1. **Task-execution success improvement**: 85% success, 5% failure; add circuit breakers for external tool calls, implement retry with exponential backoff, target 90% success
2. **Tool timeout reduction**: 28% of failures from tool timeouts; set per-tool timeouts based on P95, add degraded mode (stale cache fallback), target timeout failures < 15% of total
3. **Hallucinated tool parameters**: 18% of failures; add parameter validation with JSON Schema, enforce enum constraints, validate entity IDs before calling, target < 10%
4. **Code-generation agent reliability**: 82% success, highest failure rate; add sandbox pre-warming, improve error feedback loop, add code validation before execution
5. **Multi-agent deadlock prevention**: 5 deadlocks/month; add circuit breaker for agent handoffs, implement timeout-based deadlock detection, add workflow health dashboard
6. **Retry cost optimization**: 18% waste from retries ($9,072/day); implement smarter retry (only retry on transient errors), add retry budget per agent, target waste < 10%
7. **Tool description quality**: 22% of failures from wrong tool selection; audit and rewrite all 28 tool descriptions, add usage examples, implement tool selection confidence scoring
8. **Context overflow handling**: 10% of failures; implement tool output truncation (max 8K tokens), add summarization for large results, paginate large datasets
9. **Agent latency optimization**: P95 at 28s; add streaming for long-running agents, parallelize independent tool calls, pre-warm tool connections, target P95 < 20s
10. **Weekly agent observability review**: review agent success rate, tool reliability, orchestration health, cost efficiency, and safety compliance with AI engineering



- The "just add more tools" fallacy → giving agents 50+ tools and expecting them to choose correctly; every additional tool increases the selection error rate — a tool that's rarely used should be removed, not kept "just in case"
- Tool calls as a proxy for quality → measuring agent quality by how many tools it calls; more tool calls usually means the agent is struggling, not succeeding — the best agents accomplish the task with the fewest steps
- The infinite loop trap → agents that can call tools whose results feed back into the same decision loop without convergence criteria; a research agent that searches → reads → searches → reads forever is a money incinerator
- Agent handoff without contract → passing data between agents via unstructured text; agent A outputs "the user seems angry about billing" and agent B has to re-discover the account number — structured handoff schemas prevent information loss
- Observability as an afterthought → deploying agents without tracing each step, tool call, and decision; when an agent fails on step 7 of 12, you need to know exactly what happened at steps 1-6 to debug it

## Related

- Same class: [dashboard-ai-performance](dashboard-ai-performance.md) — AI model performance
- Same class: [dashboard-llm-cost](dashboard-llm-cost.md) — LLM cost and efficiency
- Same class: [dashboard-vector-database-health](dashboard-vector-database-health.md) — vector database health
- Same class: [dashboard-rag-quality](../methodology/dashboard-rag-quality.md) — RAG quality
- Same class: [dashboard-ai-safety](../foundations/dashboard-ai-safety.md) — AI safety and guardrails
- References: Anthropic — *Building Effective Agents*; LangChain — *Agent Observability with LangSmith*; OpenAI — *Assistants API Best Practices*; Google — *ADK Agent Development Kit*; Arize — *Agent Evaluation and Monitoring*; Shunyu Yao — *ReAct and Tool-Use Patterns*