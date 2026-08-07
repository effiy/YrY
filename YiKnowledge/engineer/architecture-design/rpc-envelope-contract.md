---
title: RPC envelope contract — module_name+method_name resolution + SSE shape + allowlist
  boundary
tags:
- api
- rpc
- envelope
- fastapi
- execute-module
- sse
- allowlist
- observer
- sandbox
- reentrancy
category: engineer/architecture-design
created: 2026-08-05
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles:
- api-designer
- backend-engineer
- frontend-engineer
- ai-engineer
- code-reviewer
benefit: When calling YiAi cross-end, find the RPC envelope shape + execute_module resolution
  process + SSE shape in one place, instead of 422 due to wrong module_name path or
  wrong SSE chunk shape
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../README.md
- ../../engineer/infrastructure/mongodb-query-filter-contract.md
- ../../../YiAi/src/domain/execution/executor.py
- ../../../YiAi/src/models/schemas.py
- ../../../YiAi/src/shared/error_codes.py
- ../../../YiAi/src/shared/response.py
- ../../../YiAi/src/server/errors.py
- ../../../YiAi/config.yaml
- ../../../YiAi/CLAUDE.md
tacit: false
---

# RPC envelope contract — module_name+method_name resolution + SSE shape + allowlist boundary

> **As an** api-designer,**I want to** a single YiAi RPC envelope shape, `execute_module` dynamic resolution process, SSE stream shape and allowlist boundary documented,**so that** when adding a new RPC endpoint there is a standard pattern, callers use the correct module_name full path and SSE chunk shape, and 422 or wrong chunk routing is avoided.

> YiAi backend uses a single `POST /` root route to receive all RPC; `execute_module` in `domain/execution/executor.py` dynamically `importlib.import_module` + `getattr`; CLAUDE.md "Cross-project protocol" section is the contract documentation. This article is the expansion of the contract; 2026-07-31 went through the same process again when adding RAG / knowledge modules.

## Summary

- **RPC envelope = `{module_name, method_name, parameters}`** — POST body;`module_name` is the full dotted path (`services.database.data_service`);`method_name` is the function name;`parameters` is a dict or JSON string
- **`execute_module` 4 steps** — `_check_whitelist` → `parse_parameters` → `_import_target_function` → dispatch (4 types: async gen / sync gen / coroutine / sync)
- **`EXEC_ALLOWLIST` default `["*"]` wildcard** — `config.yaml: module.allowlist`;in production, tighten to explicit `module_path:function_name`;`allow_key` format uses a colon
- **SSE chunk shape = `data: {"data": <chunk>}\n\n`** — closing chunk = `data: {"done": true}\n\n`;async gen functions go SSE,sync return is wrapped as a single chunk `{"data": <result>}`
- **Unified response envelope = `{code, message, data}`** — `code=0` success;`BusinessException(ErrorCode.X)` is raised then wrapped by `server/errors.py`
- **Observer off by default** — when `observer.enabled: false` the reentrancy guard returns None, no sandbox;do not assume production has sandbox / reentrancy protection

## Core viewpoints

**A single POST route is not laziness -- it is a deliberate trade that eliminates an entire class of bugs.** With 13 REST endpoints, you have 13 places where field names can drift, 13 places where auth can be missed, and 13 places where error handling can be inconsistent. The single-envelope design forces every call through the same validation, auth, and error-normalization pipeline. The cost is that the envelope adds one level of indirection; the benefit is that you never debug "why does this one endpoint return 422 when the other 12 work."

**The `module_name` full dotted path is not a convention -- it is the import system.** `importlib.import_module("services.database.data_service")` must resolve to an actual Python module. Short names like `data_service` will fail at runtime with a `ModuleNotFoundError` that the caller sees as a generic 500. The module name is not a label; it is a filesystem path expressed in Python dotted notation.

**The allowlist is a safety net that defaults to wide open.** In development, `EXEC_ALLOWLIST: ["*"]` is convenient. In production, it means any caller who can reach the server can execute any function in any module. Tightening the allowlist is not an optimization task for later -- it is a security boundary that must be in place before the first external caller connects.

**SSE chunks and JSON responses share the same envelope, and that is deliberate.** The frontend's `rpcCall<T>` base layer handles both: if the response is JSON, it deserializes and checks `code`; if it is SSE, it parses `data:` frames. The caller does not need to know which transport the backend chose. This uniformity means backend developers can switch a function from sync to streaming without changing any frontend code.

**The `code` segment protocol is the contract between backend and frontend error handling.** `code=0` means success, `1xx` means the caller made a mistake, `5xx` means the server is broken. The frontend base layer maps these segments to UX behaviors (toast, redirect, retry, error page) without the feature developer writing a single `if (code !== 0)` check. This is not a naming convention; it is the mechanism that prevents scattered error handling.


- **A single root route is simplification, not REST** — YiAi uses `POST /` + body envelope to receive all RPC,not multi-endpoint REST;simple but needs `module_allowlist` as a safety net;new RPC endpoints do not open a new route,add a `services.<domain>.<service>` module + function
- **`module_name` must be full dotted path** — `services.database.data_service` (complete);not `data_service` (module not found);not `database.data_service` (missing the `services` prefix);CLAUDE.md "Cross-project protocol" table makes it explicit
- **`allow_key = f"{module_path}:{function_name}"`** — note colon separator, not dot;`EXEC_ALLOWLIST` uses `{"services.database.data_service:query_documents", ...}`;wildcard `*` skips the check
- **SSE uses async generator, not return** — `inspect.isasyncgenfunction` path directly `target_function(parameters_dict)` returns an async gen;consumed by `StreamingResponse`;sync return is wrapped as a single chunk `{"data": <result>}`
- **All 4 dispatch types go through `execute_module`** — async gen / sync gen / coroutine / sync function all enter the same entry;sync function runs in a thread pool via `_run_function`,does not block the event loop
- **Unified response envelope is a caller-facing hard contract** — whether success or `BusinessException`,the frontend sees `{code, message, data}`;when `code != 0` `data` may be None or error details;`server/errors.py` is the wrapper
- **`ErrorCode` enum is single source** — adding a new error code goes to `src/shared/error_codes.py` enum;do not write magic numbers in route handlers (`code: 500` is an anti-pattern)

## Key information

### RPC envelope shape

```http
POST / HTTP/1.1
Content-Type: application/json

{
  "module_name": "services.database.data_service",
  "method_name": "query_documents",
  "parameters": {
    "cname": "sessions",
    "filter": { "tags": { "$in": ["work"] } },
    "pageNum": 1,
    "pageSize": 20
  }
}
```

**Response**:
```json
{
  "code": 0,
  "message": "ok",
  "data": { "list": [...], "total": 100, "pageNum": 1, "pageSize": 20, "totalPages": 5 }
}
```

**Pydantic schema**(`src/models/schemas.py`):
```python
class ExecutionRequest(BaseModel):
    module_name: str = Field(default="", description="Full path of the target module")
    method_name: str = Field(default="", description="Target function name")
    parameters: Union[Dict[str, Any], str] = Field(default_factory=dict)
```

### `execute_module` 4-step process

```python
# src/domain/execution/executor.py (simplified pseudocode)
async def execute_module(module_path, function_name, parameters):
    token = _acquire_guard()                          # 1. reentrancy guard (None when observer.enabled=False)
    try:
        _check_whitelist(module_path, function_name)  # 2. allowlist check
        parameters_dict = parse_parameters(parameters) # 3. parse (dict or JSON str)
        target_function = _import_target_function(module_path, function_name)  # 4. importlib + getattr

        if inspect.isasyncgenfunction(target_function):
            result = target_function(parameters_dict)        # async gen, SSE
        elif inspect.isgeneratorfunction(target_function):
            result = target_function(parameters_dict)         # sync gen
        elif asyncio.iscoroutinefunction(target_function):
            result = await _run_function(target_function, parameters_dict)
        else:
            result = await _run_function(target_function, parameters_dict)  # sync in thread pool
        return result
    finally:
        _release_guard(token)
```

**`_check_whitelist` implementation**:
```python
def _check_whitelist(module_path: str, function_name: str) -> None:
    if not module_path or not function_name:
        raise BusinessException(ErrorCode.INVALID_PARAMS, message="Module path and function name required")
    allow_key = f"{module_path}:{function_name}"
    if "*" not in EXEC_ALLOWLIST and allow_key not in EXEC_ALLOWLIST:
        raise BusinessException(ErrorCode.PERMISSION_DENIED, message=f"Execution forbidden: {allow_key}")
```

**`_import_target_function` implementation**:
```python
def _import_target_function(module_path: str, function_name: str):
    module = importlib.import_module(module_path)  # services.database.data_service
    return getattr(module, function_name)           # query_documents
```

### `EXEC_ALLOWLIST` configuration

`config.yaml`:
```yaml
module:
  allowlist:
    - "*"
```

`src/domain/execution/executor.py`:
```python
allowlist = settings.module_allowlist
if isinstance(allowlist, str):
    allowlist = [x.strip() for x in allowlist.split(',') if x.strip()]
EXEC_ALLOWLIST = set(allowlist)
```

**Tightening strategy**(production):
```yaml
module:
  allowlist:
    - "services.database.data_service:query_documents"
    - "services.database.data_service:create_document"
    - "services.database.data_service:update_document"
    - "services.database.data_service:delete_document"
    - "services.knowledge.knowledge_service:*"   # whole-module wildcard
    - "services.ai.chat_service:chat"
    # ... etc
```

note `allow_key` is in `module_path:function_name` format (colon-separated, not dot).

### SSE stream shape(chat / RAG)

```http
POST / HTTP/1.1
Content-Type: application/json

{
  "module_name": "services.ai.chat_service",
  "method_name": "chat",
  "parameters": { "message": "hello", "stream": true }
}
```

**Response**(`text/event-stream`):
```
data: {"data": {"message": "hel"}}

data: {"data": {"message": "lo"}}

data: {"data": {"message": "!"}}

data: {"done": true}

```

**FastAPI-side implementation**:
```python
from fastapi.responses import StreamingResponse

async def chat_stream(...):
    async def event_generator():
        async for chunk in async_gen_function(parameters):
            yield f"data: {json.dumps({'data': {'message': chunk}})}\n\n"
        yield f"data: {json.dumps({'done': True})}\n\n"
    return StreamingResponse(event_generator(), media_type="text/event-stream")
```

**Caller side**(YiVad / YiPet):
```typescript
const res = await fetch('/', { method: 'POST', body: JSON.stringify({ module_name, method_name, parameters }) });
const reader = res.body.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  // parse `data: {...}\n\n` chunks
}
```

**SSE boundary**:
- use `text/event-stream` media type
- each chunk starts with `data: ` and ends with `\n\n`
- closing chunk = `data: {"done": true}\n\n`
- caller must handle SSE framing(`data: ` + `\n\n`, not a JSON stream

### Differences between the 4 dispatch types

| Function type | dispatch path | return value | use case |
|---|---|---|---|
| `inspect.isasyncgenfunction` | `target_function(parameters_dict)` directly | async generator | SSE stream(chat / RAG / execution stream) |
| `inspect.isgeneratorfunction` | `target_function(parameters_dict)` directly | sync generator | rarely used;no await |
| `asyncio.iscoroutinefunction` | `await _run_function(...)` | await result | ordinary async function |
| other sync | `await _run_function(...)` | await result(run in thread pool) | sync function,does not block event loop |

**Why sync also goes through `_run_function`**:to prevent sync function blocking the event loop;`_run_function` internally uses `anyio.to_thread.run_sync` or similar mechanism to throw the sync function into a thread pool.

### Observer / sandbox / reentrancy guard

`config.yaml`:
```yaml
observer:
  enabled: false              # off by default
  throttle_enabled: false
  sandbox_enabled: false
  sandbox_fs_allowlist: "/tmp,/var/www/YiKnowledge/static"
  sandbox_network_allowlist: ""
```

**When off by default**:
- `_acquire_guard` returns None(`_get_guard()` returns None),no reentrancy depth limit
- no sandbox(`observer.enabled: false` does not enter sandbox path)
- no throttle / sampler

**When on**:
- `_acquire_guard` uses `_reentrancy_depth` ContextVar to limit depth(`guard.max_depth`),raises `SERVER_ERROR` if exceeded
- `_release_guard` resets the token
- sandbox checks fs/network allowlist

**Semantics of enabling reentrancy guard**:recursive calls to `execute_module` within the same event loop task (e.g. RAG internally calls chat_service) exceeding the depth limit will be blocked;prevents infinite recursion.

### Unified response envelope and errors

`src/shared/response.py`:
```python
def success(data: Any) -> dict:
    return {"code": 0, "message": "ok", "data": data}

def error(code: int, message: str, data: Any = None) -> dict:
    return {"code": code, "message": message, "data": data}
```

`src/server/errors.py`(simplified):
```python
@app.exception_handler(BusinessException)
async def business_exception_handler(request, exc):
    return JSONResponse(
        status_code=200,  # HTTP 200,business error in body.code
        content={"code": exc.code.value, "message": exc.message, "data": None}
    )
```

**`ErrorCode` enum**(`src/shared/error_codes.py`):
```python
class ErrorCode(Enum):
    SUCCESS = 0
    INVALID_PARAMS = 1001
    PERMISSION_DENIED = 1003
    AI_UNAVAILABLE = 2001
    INTERNAL_ERROR = 5000
    # ...
```

**Anti-pattern**:
- ❌ directly `return {"code": 500, ...}` in route handler (magic number)
- ✅ `raise BusinessException(ErrorCode.INTERNAL_ERROR, message="...")`

## anti-patterns(do not do)

- **do not use short module_name** — `data_service` module not found;must use `services.database.data_service` full dotted path
- **do not use dot separator in `EXEC_ALLOWLIST`** — `allow_key` is `module_path:function_name` colon-separated;`{"services.database.data_service.query_documents"}` is an anti-pattern
- **do not use JSON stream in SSE chunk** — must `data: {...}\n\n` framing;JSON stream(parsing a continuous JSON) is an anti-pattern
- **do not let SSE omit the `data: {"done": true}\n\n` closing chunk** — caller will hang;must explicitly send closing
- **do not write magic number code in route handler** — use `BusinessException(ErrorCode.X)`;error codes centralized in `error_codes.py`
- **do not let sync function directly call and block the event loop** — sync function must go through `_run_function`(thread pool);only `asyncio.iscoroutinefunction` can `await` directly
- **do not assume production has sandbox / reentrancy protection** — `observer.enabled` default `false`;caller cannot depend on server-side throttle / sandbox
- **do not add new REST endpoint to replace RPC envelope** — single root route is by design;new features add `services.<domain>.<service>` module,no new route
- **do not use `*` in `EXEC_ALLOWLIST` and forget** — default `["*"]` is for dev convenience;production must tighten to explicit list

## Action recommendations

When adding a new RPC endpoint:

1. **Add module**:write the function in `src/services/<domain>/<service>.py`;prefer `async def`,use `async yield` for generators
2. **Add error code**:add `ErrorCode.X = <int>` in `src/shared/error_codes.py`
3. **Add allowlist**:if production has been tightened,add `"services.<domain>.<service>:<method>"` in `config.yaml: module.allowlist`
4. **Write schema**:add a Pydantic schema for `parameters` in `src/models/schemas.py`
5. **Write doc**:add a GET /?module_name=...&method_name=...&parameters=... example in the function docstring in `services/<domain>/<service>.py`(see `domain/files/storage.py` pattern)
6. **Write frontmatter schema** to `YiKnowledge/knowledge-curator/templates/` or this directory
7. **Run manual smoke**:from the caller side use `fetch POST /` + body to call once;from the SSE side use `EventSource` or a hand-written `reader` to call once

When the caller integrates RPC:

1. run grep `module_name:` in frontend code,confirm full dotted path(`services.<domain>.<service>`,not short name)
2. run grep `data:` in SSE handler,confirm chunk framing is `data: {...}\n\n`
3. run manual smoke:wrong module_name(short name)→ should 422 or `ModuleNotFoundError`;wrong method_name → `AttributeError` wrapped as `INTERNAL_ERROR`;correct call → `code: 0`
4. SSE side manual smoke:wrong framing(no `\n\n`)→ caller hangs;missing `done: true` → caller waits forever

When upgrading an existing RPC endpoint:

1. run grep `module_name:` to find all callers,confirm full dotted path
2. when changing function signature,run type:check to confirm all callers use the correct parameter name(`filter` not `query` / `target_file` not `path` / `cname` or `collection_name`)
3. add error codes to the `ErrorCode` enum,do not reuse magic numbers
4. when changing SSE shape(`data: {...}` → other shape)must update callers in sync;do not assume callers auto-adapt

## Anti-patterns

- **Using the RPC envelope for public APIs.** The single `POST /` entry with `module_name` + `method_name` dispatch is designed for internal systems where the frontend and backend are developed by the same team. Public APIs consumed by third parties should use RESTful resource paths that are self-documenting and cacheable.

- **Hardcoding `module_name` strings across the frontend.** If 50 frontend files each contain the string `"services.database.data_service"`, a module rename becomes a 50-file change. The frontend should have a centralized API module that exports typed functions (`queryDocuments(filter)`) and hides the `module_name` string behind a single constant.

- **Adding modules without adding to the allowlist.** In development, `EXEC_ALLOWLIST: ["*"]` hides the missing allowlist entry. In production, the call fails with `PERMISSION_DENIED` and the oncall engineer has no idea why. The allowlist entry must be part of the module's definition of done, not an afterthought.

- **Using `module_name` for service discovery.** The `module_name` field is a Python import path, not a service name. If you need to route to different backends, use a separate routing layer (API gateway, service mesh). Overloading `module_name` with routing semantics breaks the clean separation between dispatch and deployment.

- **SSE framing without testing the full lifecycle.** A developer tests the happy path (stream starts, chunks arrive, `done: true` closes) and ships. The first time a user cancels mid-stream, the frontend crashes because `AbortError` was not handled. The first time the backend crashes, the frontend hangs forever because `done: true` never arrives. Every SSE integration must test: normal completion, user cancellation, backend crash, network drop, and empty stream.

## Related

- [api-designer/README.md](../README.md) — API Designer working directory
- [engineer/infrastructure/mongodb-query-filter-contract.md](../infrastructure/mongodb-query-filter-contract.md) — `data_service` internal field-name contract (RPC entry is the big customer)
- [YiAi/src/domain/execution/executor.py](../../../YiAi/src/domain/execution/executor.py) — source of truth for the `execute_module` 4-step process
- [YiAi/src/models/schemas.py](../../../YiAi/src/models/schemas.py) — `ExecutionRequest` Pydantic schema
- [YiAi/src/shared/error_codes.py](../../../YiAi/src/shared/error_codes.py) — `ErrorCode` enum single source
- [YiAi/src/shared/response.py](../../../YiAi/src/shared/response.py) — unified response envelope `success()` / `error()`
- [YiAi/src/server/errors.py](../../../YiAi/src/server/errors.py) — `BusinessException` handler
- [YiAi/config.yaml](../../../YiAi/config.yaml) — `module.allowlist` / `observer.*` configuration
- [YiAi/CLAUDE.md](../../../YiAi/CLAUDE.md) — Cross-project protocol / RPC envelope / SSE streaming contract documentation
- [knowledge-curator/templates/knowledge-leaf.md](../../knowledge-curator/templates/knowledge-leaf.md) — leaf template
