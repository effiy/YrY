---
title: Pi Agent Harness evolution tracking and Yi family capability expansion
aliases: [pi-agent-harness-evolution, pi-tracking, earendil-pi, pi-coding-agent]
tags: [pi, agent-harness, multi-provider-llm, coding-agent, open-source, tracking, evolution, bun]
category: engineer/engineering
created: 2026-08-03
updated: 2026-08-07
source: https://github.com/earendil-works/pi
type: summary
status: stable
lifecycle: active
review_cycle: monthly
last_verified: 2026-08-07
tacit: false
roles: [engineer]
benefit: "tooling trustworthy"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified
related:
  - ../projects/yiai/architecture.md
  - ../projects/yivad/architecture.md
  - ../projects/yipet/architecture.md
  - ../../ai-engineer/platform/llama-index-evolution.md
  - ./claude-code-tips.md
  - ./vllm-ollama-deployment.md
---

# Pi Agent Harness evolution tracking and Yi family capability expansion

> **As an** engineer, **I want to** pi agent harness evolution, **so that** tooling trustworthy.

## Summary

[earendil-works/pi](https://github.com/earendil-works/pi) is a TypeScript + Bun monorepo, an AI agent toolset. Four core packages:

- **`@earendil-works/pi-ai`** — unified multi-provider LLM API (OpenAI / Anthropic / Google / …).
- **`@earendil-works/pi-agent-core`** — agent runtime + tool calling + state management.
- **`@earendil-works/pi-coding-agent`** — interactive coding agent CLI (self-extension).
- **`@earendil-works/pi-tui`** — terminal UI library (diff rendering).

Positioning: a self-hosted coding agent harness, in the same lane as Claude Code / Cursor. **No built-in permission system** — file / process / network / credential-level permissions must be handled by external containerization or sandbox. Three sandbox paths: Gondolin micro-VM, Plain Docker, OpenShell policy sandbox. Supply chain hardening is an explicit selling point: dependencies precisely pinned, `min-release-age=2`, shrinkwrap allowlist. This document tracks its evolution cadence and the architecture evolution and capability expansion surface for YiAi / YiVad / YiPet.

## Core viewpoints

- **Unified LLM provider abstraction is infrastructure** — `pi-ai` converges OpenAI / Anthropic / Google into one API; YiAi currently only self-hosts Ollama, and when it does multi-provider routing in the future, this is a ready-made pattern. It is a competing solution with `llama_index.llms.*`.
- **Agent runtime + state management is a YiAi gap** — YiAi `services/ai/chat_service.py` self-manages chat + SSE stream; it lacks tool calling + state machine + reentrancy protection. `pi-agent-core` provides a ready-made runtime.
- **Coding agent CLI ≠ business capability** — `pi-coding-agent` is a developer-side productivity tool; YiAi / YiVad / YiPet business backends should not consume it directly; but it can serve as a pattern reference for YiPet's "desktop coding agent" entry.
- **Supply chain hardening is worth borrowing** — YiAi currently has no pins in `requirements.txt`, no `min-release-age`, no lockfile audit; pi's hardening checklist is a directly reusable template.
- **Sandbox boundary is a deployment decision** — pi does not build in a permission system, pushing the boundary to containers / policy; when YiAi evaluates introducing a coding agent, it must select a sandbox path in sync.
- **OSS session data sharing is a community data flywheel** — pi encourages users to share coding-agent sessions to HuggingFace, feeding back into agent training and evaluation; if the Yi family adopts pi, consider contributing desensitized sessions.


- **The decision between pi-ai and llama_index is not about features — it's about language ecosystem alignment** — pi-ai is TypeScript-native with Bun performance; llama_index is Python-native with the full Python ML ecosystem. YiAi is Python, so llama_index is the natural choice for backend LLM abstraction. YiPet is TypeScript, so pi-ai could serve as a frontend-side LLM abstraction. The "winner" is not one tool but the tool that matches the project's language. Adopting pi-ai in YiAi would require maintaining a Bun runtime alongside Python, adding operational complexity.

- **Supply chain hardening is the most immediately actionable takeaway from pi** — Unlike agent runtime, multi-provider routing, or coding agent embedding (which require months of evaluation and implementation), pi's supply chain checklist (pin + min-release-age + shrinkwrap + audit) can be translated to Python equivalents (`uv` / `pip-tools` / `pip-audit`) and landed in a single sprint. The checklist is language-agnostic and directly reusable.

- **Sandbox selection is a pre-requisite, not a follow-up** — pi's lack of a built-in permission system means that running a coding agent without a sandbox is running untrusted code with the current user's permissions. The sandbox path (Gondolin / Docker / OpenShell) must be selected before evaluating the coding agent, not after. Starting with Plain Docker is the simplest path; OpenShell adds fine-grained policy control.

- **The coding agent CLI is a pattern reference, not a library** — `pi-coding-agent` is a developer-side productivity tool, not a business backend library. YiAi should not `import` it; instead, YiAi should study its architecture (tool registry, state machine, reentrancy guard) and implement equivalent patterns in Python. YiVad can visualize the agent's progress, but the agent runs on YiAi's backend.

- **Session sharing without desensitization is a data leak, not a community contribution** — Raw coding-agent sessions contain local paths, credentials, and business code. Contributing sessions to HuggingFace without a desensitization pipeline is a security incident. The pipeline must strip local paths, redact credentials, and anonymize business code before sharing.

## Key information

### Repository structure and package topology

```
pi/
├── packages/
│   ├── ai/              # pi-ai: unified multi-provider LLM API
│   ├── agent/           # pi-agent-core: agent runtime + tool calling + state
│   ├── coding-agent/    # pi-coding-agent: interactive coding agent CLI
│   └── tui/             # pi-tui: terminal UI library (diff rendering)
├── docs/                # includes containerization.md (three sandbox modes)
├── AGENTS.md            # project-level agent rules (humans and agents read together)
├── CONTRIBUTING.md      # new contributors' PRs auto-close by default; maintainers review daily
└── scripts/
    └── build-binaries.sh # single-file binary build (Bun compile)
```

### Evolution timeline (key nodes, inferred from repo README / RFC)

| Time | Event | Impact on Yi |
|---|---|---|
| 2024 | pi project kicked off (earendil-works org) | naming/positioning alignment |
| 2025-Q1 | `pi-ai` multi-provider abstraction stable | YiAi multi-provider routing candidate pattern |
| 2025-Q2 | `pi-agent-core` tool calling + state machine | YiAi agent runtime candidate |
| 2025-Q3 | `pi-coding-agent` CLI release | YiPet desktop agent pattern reference |
| 2025-Q4 | `pi-tui` diff rendering standalone | — |
| 2026-Q1 | supply chain hardening checklist finalized (pin + min-release-age + shrinkwrap) | YiAi `requirements.txt` upgrade template |
| 2026-Q2 | three sandbox modes documented (Gondolin / Docker / OpenShell) | must pick before YiAi introduces coding agent |
| 2026-Q3 | standalone binary build (Bun compile) | internal distribution simplified |

### Each package's public API (coarse-grained)

| Package | Public capability | Whether YiAi can consume |
|---|---|---|
| `pi-ai` | `chat` / `stream` / `embed` across providers; model metadata auto-sync | ✅ can replace YiAi's self-managed Ollama calls |
| `pi-agent-core` | agent loop, tool registry, state transitions, interrupt / resume | ✅ can serve as YiAi agent runtime base |
| `pi-coding-agent` | file read/write / shell / tool calling / self-extension tools | ⚠️ developer-side tool, business backend should not consume; pattern reference only |
| `pi-tui` | terminal diff rendering, keyboard events, component tree | ❌ YiVad/YiPet are web, not applicable |

### Sandbox and permissions

| Mode | Description | YiAi fit |
|---|---|---|
| Gondolin extension | host keeps pi + provider auth; built-in tools and `!` commands route to a local Linux micro-VM | medium (requires Gondolin) |
| Plain Docker | entire pi process runs in a local container | high (simplest) |
| OpenShell | entire pi process runs in a policy-controlled sandbox | high (fine-grained policy) |

### Supply chain hardening checklist

- External dependencies precisely pinned; internal workspace package versions scoped.
- `.npmrc` sets `save-exact=true` + `min-release-age=2` (avoid same-day dependency releases).
- `package-lock.json` is ground truth; pre-commit blocks accidental lockfile commits (unless `PI_ALLOW_LOCKFILE_CHANGE=1`).
- `npm run check` verifies pinned dependencies + native TS import compatibility + coding-agent shrinkwrap.
- Released CLI includes `npm-shrinkwrap.json`; pinned transitive dependencies.
- Release smoke test uses `npm run release:local` to set up an independent npm + Bun install outside the repo.
- `npm audit --omit=dev` + `npm audit signatures --omit=dev` on a periodic CI job.
- Shrinkwrap generation has a lifecycle-script allowlist; new lifecycle-script dependencies fail until reviewed.

### Impact on each project's architecture evolution and capability expansion

#### YiAi (most direct consumption candidate)

| Evolution direction | Current | Candidate capability expansion |
|---|---|---|
| Multi-provider LLM | only Ollama self-hosted | introduce `pi-ai` or `llama_index.llms.*`, route by model name to OpenAI / Anthropic / Google / Ollama; retain fallback |
| Agent runtime | `chat_service.py` self-managed SSE, no tool calling | replace with `pi-agent-core`, introduce tool registry (read_file / write_file / data_service / web_search) + state machine + reentrancy guard |
| Tool protocol | RPC envelope `{module_name, method_name, parameters}` | align with `pi-agent-core` tool calling: expose YiAi internal services as tools, agent picks and calls automatically |
| Coding agent embedding | none | YiAi deploy sidecar: embed `pi-coding-agent` + Gondolin micro-VM, let YiVad trigger code-modify tasks from the backend |
| Supply chain hardening | `requirements.txt` no pins | borrow pi checklist: `pip-compile` for lockfile + `pip-audit` + min-release-age equivalent strategy + pre-commit blocks lockfile mis-commits |
| Binary distribution | `uvicorn src.app:app` source run | borrow pi's Bun compile idea, use `pyinstaller` / `nuitka` for a standalone binary (simplified internal dev distribution) |
| Session sharing | none | selectively contribute desensitized agent sessions to HuggingFace, feed back community evaluation |

#### YiVad (indirect consumer + visualization layer)

| Evolution direction | Current | Candidate capability expansion |
|---|---|---|
| Agent backend | `aicr` code review, `bug` list, `aiChat` | add "Agent tasks" page: trigger YiAi embedded coding agent, visualize task progress / step / tool call |
| Multi-provider routing UI | none | via YiAi multi-provider API, YiVad adds a model selector (aligned with YiPet) |
| Tool call visualization | none | when agent calls a tool, YiVad shows in real time the tool name / parameters / result (ECharts timeline) |
| Sandbox mode switch | none | if YiAi deploy supports multiple sandbox modes, YiVad adds an ops page to switch Gondolin / Docker / OpenShell |
| Permission boundary display | none | YiVad system settings page shows "current agent permission boundary" to alert operators |

#### YiPet (frontend + desktop agent candidate carrier)

| Evolution direction | Current | Candidate capability expansion |
|---|---|---|
| Chat model selection | backend-fixed | YiPet adds a model selector in chat UI, calling YiAi multi-provider API |
| Desktop coding agent entry | popup + pet render | borrow `pi-coding-agent` CLI pattern, YiPet adds "Ask Pi to code" entry (triggers YiAi backend agent, result pushed back via SSE to pet) |
| Terminal UI borrowing | not applicable (YiPet is web) | `pi-tui` diff render idea can be borrowed in YiPet chat UI (incremental delta render) |
| Tool calling passthrough | none | when agent calls a tool, YiPet chat overlay shows a tool card (like Claude Code tool use) |
| Sandbox awareness | none | before YiPet triggers a coding agent, first check the backend sandbox mode; if not configured, refuse to execute |

## Action recommendations

1. **Monthly tracking** — at the start of each month scan `earendil-works/pi` release notes + RFC (`rfc.earendil.com/keyword/pi/`), update this timeline.
2. **Multi-provider selection window** — before 2026 Q3, evaluate `pi-ai` vs `llama_index.llms.*`, produce an ADR. Decision dimensions: ecosystem breadth (llama_index wins), TS-native (pi wins), Python isomorphism (llama_index wins), Bun performance (pi wins). YiAi is Python, leans llama_index; YiPet is TS, can consider a pi-ai shared client.
3. **Agent runtime evaluation window** — before 2026 Q4, evaluate whether `pi-agent-core` can replace YiAi's self-managed chat loop; focus on reentrancy, state persistence, tool protocol.
4. **Supply chain hardening can be done now** — translate pi's npm hardening checklist into Python equivalents (`uv` / `pip-tools` / `pip-audit` + `pre-commit`), land in YiAi.
5. **Sandbox mode pre-selection** — before YiAi introduces a coding agent, fix the sandbox path; recommend starting with Plain Docker, evolving to OpenShell.
6. **Coding agent entry** — before YiPet designs the "Ask Pi to code" entry, confirm the YiAi backend agent runtime has landed, to avoid the frontend going first without backend support.

## Anti-patterns

- **Evaluating pi-ai vs llama_index purely on feature comparison** — The features overlap significantly (both provide multi-provider LLM abstraction), but the integration cost is driven by language ecosystem mismatch. pi-ai in YiAi (Python) requires maintaining a Bun runtime alongside Python; llama_index in YiPet (TypeScript) is not natively supported. The evaluation must be per-project, not per-tool.

- **Deploying the coding agent without first selecting a sandbox** — pi has no built-in permission system. Running the coding agent bare means the LLM can access the file system, network, and credentials with the current user's permissions. The sandbox path must be selected and tested before the agent is deployed, not after the first incident.

- **Half-applying the supply chain hardening checklist** — Pinning dependencies without `min-release-age` still leaves the door open to same-day malicious releases. Running `pip-audit` without a pre-commit hook means audits are forgotten. The checklist is a system, not a checklist item; every item must be implemented with automation.

- **Designing the frontend agent UI before the backend agent runtime lands** — YiPet's "Ask Pi to code" entry and YiVad's "Agent tasks" visualization are UI layers. If the backend agent runtime (tool calling + state machine + reentrancy guard) is not in place, the frontend is building against a non-existent API. The backend must land first.

- **Adopting pi wholesale instead of cherry-picking** — The temptation is to adopt the entire pi ecosystem (pi-ai + pi-agent-core + pi-coding-agent + pi-tui), but each package has a different fit for the Yi family. pi-ai may be useful for YiPet (TypeScript) but not YiAi (Python); pi-agent-core is a pattern reference, not a drop-in; pi-tui is irrelevant for web apps. Cherry-pick per-project, not per-ecosystem.



- **Business backend directly imports `pi-coding-agent`** — it is a CLI tool, not a library; business backends should consume `pi-ai` / `pi-agent-core`.
- **Running the coding agent without a sandbox** — pi has no built-in permission system; running it bare means letting the LLM access the file system / network / credentials with current user permissions, high risk.
- **Multi-provider routing without evaluation** — switching providers directly can cause prompt behavior drift; YiAi must build an evaluation set before switching.
- **Half-applied supply chain hardening** — pinning without `min-release-age` can still be hit by same-day malicious dependencies.
- **Misusing `pi-tui` ideas** — it is a terminal UI; YiVad/YiPet are web, the diff-render idea can be borrowed but the API is not generally applicable.
- **Sharing sessions without desensitization** — contributing raw sessions can leak local paths / credentials / business code; a desensitization pipeline is required.

## Related

- [llama_index evolution tracking](../../ai-engineer/platform/llama-index-evolution.md) — another candidate path for multi-provider LLM abstraction
- [YiAi architecture overview](../projects/yiai/architecture.md) — most direct consumption candidate
- [YiVad architecture overview](../projects/yivad/architecture.md) — visualization layer
- [YiPet architecture overview](../projects/yipet/architecture.md) — desktop agent candidate carrier
- [Claude Code tips](./claude-code-tips.md) — another class of coding agent tool
- [vLLM / Ollama deployment](./vllm-ollama-deployment.md) — YiAi self-hosted inference background
- [Agent architecture patterns](../../ai-engineer/methodology/agent-architecture-patterns.md)
