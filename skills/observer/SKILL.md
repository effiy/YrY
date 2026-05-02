---
name: observer
description: |
  Agent harness performance observer for external MCP endpoints.
  Wraps api.effiy.cn/mcp with throttling, tail-sampled telemetry,
  sandbox validation, lazy-start SSE transport, and re-entrancy guards.
  Explicitly framed as an agent harness performance system.
user_invocable: true
lifecycle: default-pipeline
agents:
  required: []
  optional: []
contracts:
  output: shared/agent-output-contract.md
---

# observer

## Positioning

`observer` is the **agent harness performance system** for external MCP integration. It does not replace the Claude Code MCP harness; it **wraps** direct MCP tool invocations from scripts and agents with reliability controls that prevent cascading failures.

### Why it exists

- **Memory explosion**: Unbounded telemetry accumulation during long orchestration sessions.
- **Thundering herd**: Multiple agents calling `execute_module_post` simultaneously.
- **Sandbox escape**: The YiAi MCP exposes `write_file`, `delete_file`, `execute_module_*` — path traversal or module abuse can corrupt the workspace.
- **Re-entrancy deadlock**: An agent calling a tool that triggers a callback into the same agent.
- **Connection waste**: Keeping SSE alive when no tools are used burns file descriptors.

### When to use

- Any script or agent that directly calls `api.effiy.cn/mcp` tools (`read_file`, `write_file`, `execute_module_*`, `send_wework_message`, etc.).
- When orchestration stages run in tight loops (e.g., `collect-weekly-kpi.js` polling).

### When NOT to use

- When Claude Code's built-in MCP tool use is sufficient (the harness already manages SSE). Observer is for **programmatic** MCP access.

## Commands

### Call a tool through the observer

```
node skills/observer/scripts/observer-client.js --call read_file --args '{"target_file":"README.md"}'
```

### Health check

```
node skills/observer/scripts/observer-client.js --health
```

### Flush telemetry to disk

```
node skills/observer/scripts/observer-client.js --flush
```

## Architecture

```
Agent / Script
      |
  [ObserverClient]
      |
  +------------------+------------------+------------------+
  | ReentrancyGuard  | SandboxValidator | TokenBucket      |
  +------------------+------------------+------------------+
      |
  [SseMcpTransport]  <-- lazy connect
      |
  api.effiy.cn/mcp
```

### Components

| Component | Responsibility | Blast radius if absent |
|-----------|---------------|----------------------|
| `TokenBucket` | Rate-limit per tool category | Server overload, local CPU spikes |
| `TelemetryBuffer` | Circular buffer + tail sampling | Memory exhaustion, OOM kills |
| `SandboxValidator` | Restrict paths and module names | Workspace corruption, data loss |
| `ReentrancyGuard` | Track call depth, block recursion | Infinite loops, stack overflow |
| `SseMcpTransport` | Lazy SSE connect with timeouts | File-descriptor leaks, zombie connections |

## Configuration

```javascript
const { ObserverClient } = require('./skills/observer/scripts/observer-client.js');

const client = new ObserverClient({
  baseUrl: 'https://api.effiy.cn/mcp',
  allowedRoots: [process.cwd()],      // sandbox roots
  bufferSize: 1000,                   // telemetry ring buffer capacity
  maxDepth: 3,                        // re-entrancy limit
});
```

## Stop Conditions

- Sandbox validation fails → throw immediately (do not degrade, security is P0).
- Re-entrancy depth exceeded → throw immediately.
- Throttle exceeded → throw immediately (caller must back off).
- SSE connect timeout → throw, allowing fallback to local tools per `shared/mcp-fallback-contract.md`.

## Telemetry

Sampled events are flushed to `docs/.memory/observer-telemetry.jsonl` every 30 seconds. Each line:

```json
{"ts":1714723200000,"tool":"read_file","depth":1,"latency":45,"error":null,"size":1234}
```

## Supporting Files

```
.claude/skills/observer/
├── SKILL.md                    # Entry + manifest (this file)
├── README.md                   # Quick start
├── rules/
│   └── reliability-contract.md # Component contracts and red lines
└── scripts/
    └── observer-client.js      # Main observer implementation
```