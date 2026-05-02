---
paths:
  - "skills/observer/rules/reliability-contract.md"
  - "skills/observer/scripts/observer-client.js"
---

# Reliability Contract

> Component-level contracts and red lines for the `observer` agent harness performance system.

## 1. Memory Explosion Fix — TelemetryBuffer

### 1.1 Invariant

The observer MUST NOT hold unbounded telemetry in memory. The `TelemetryBuffer` is a **fixed-size circular buffer** (default 1000 records). When full, new records overwrite the oldest.

### 1.2 Tail Sampling

High-frequency tools (`delete_file`, `upload_file`) are sampled to reduce memory pressure:

| Tool | Sample Rate | Rationale |
|------|-------------|-----------|
| `read_file` | 1:1 | Low frequency, high diagnostic value |
| `write_file` | 1:1 | State change, must trace |
| `delete_file` | 1:5 | Bulk cleanup can flood buffer |
| `upload_file` | 1:2 | Binary data, large `size` field |
| `execute_module_*` | 1:1 | Side effects, must trace |
| `send_wework_message` | 1:1 | External notification, must trace |

### 1.3 Flush Discipline

- **Periodic**: every 30 seconds via timer.
- **On graceful exit**: `SIGINT`, `SIGTERM`, explicit `disconnect()`.
- **Never blocking**: flush failures are logged to stderr but do not throw.

## 2. Throttling — TokenBucket

### 2.1 Per-Tool-Category Limits

| Category | Rate (req/s) | Burst | Tools |
|----------|-------------|-------|-------|
| `read` | 20 | 40 | `read_file` |
| `write` | 5 | 10 | `write_file`, `delete_file`, `delete_folder`, `rename_file`, `rename_folder` |
| `execute` | 2 | 4 | `execute_module_get`, `execute_module_post` |
| `upload` | 3 | 6 | `upload_file`, `upload_image_to_oss`, `upload_image_to_oss_alt` |
| `message` | 5 | 10 | `send_wework_message` |
| `default` | 10 | 20 | — |

### 2.2 Behavior on Exhaustion

Throw `Error: Throttled: <tool> rate limit exceeded`. The caller is responsible for back-off. The observer does **not** queue or retry.

## 3. Sandbox Access Fix — SandboxValidator

### 3.1 Path Allowlist

All file-system-targeting parameters must resolve inside `allowedRoots` (default: `REPO_ROOT`):

- `target_file`, `target_dir`
- `old_path`, `new_path`
- `old_dir`, `new_dir`
- `directory`

Resolution uses `path.resolve()` then `path.relative()` — any `..` escape outside the root is rejected.

### 3.2 Module Execution Allowlist

`execute_module_get` / `execute_module_post`:

- `module_name` containing `..` is rejected.
- Absolute paths outside `allowedRoots` are rejected.

### 3.3 Failure Mode

Sandbox violations are **fatal** (throw). There is no degradation path — silent sandbox escape is unacceptable.

## 4. Lazy-Start — SseMcpTransport

### 4.1 Connection Lifecycle

1. **Construction**: no network activity.
2. **First `callTool()`**: `ObserverClient._ensureConnected()` triggers `transport.connect()`.
3. **Initialize handshake**: send `initialize`, then `notifications/initialized`.
4. **Idle**: connection stays alive for subsequent calls.
5. **Disconnect**: on `disconnect()`, SSE stream is destroyed and state reset.

### 4.2 Timeout

- **Connect timeout**: 10 seconds.
- **Call timeout**: 30 seconds.
- On timeout: reject with clear message, connection cleaned up.

## 5. Re-entrancy Guard — ReentrancyGuard

### 5.1 Depth Tracking

Per `sessionId`, increment depth on `enter()`, decrement on `exit()`. Max depth defaults to 3.

### 5.2 Recursive Lock

Same `(sessionId, toolName)` pair cannot be in-flight twice simultaneously. If detected, throw before the second call is sent.

### 5.3 Why 3?

- Depth 1: normal tool call.
- Depth 2: tool calls another tool via callback.
- Depth 3: emergency margin.
- Depth > 3: almost certainly an infinite loop or mis-designed orchestration.

## 6. Red Lines

1. **Never disable sandbox validation** in production, even for "trusted" tools.
2. **Never increase buffer size** without proportional disk flush frequency — the fix is the fixed size, not the number.
3. **Never swallow throttled errors** — callers must back off, not retry immediately in a tight loop.
4. **Never share `ObserverClient` across parallel orchestration branches** without separate `sessionId` — re-entrancy tracking would be meaningless.
5. **Never log full `args.content` or `result` bodies** to telemetry — only record `size` in bytes to prevent telemetry itself from leaking sensitive data.
