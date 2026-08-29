---
title: RPC Parameter Name Mismatch — Silent Cross-Project Bugs
tags: [gotcha, rpc, cross-project, api, contract]
category: engineer/learn/lessons/gotchas
created: 2026-08-21
updated: 2026-08-21
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "Engineers avoid the most common cross-project bug pattern: silent RPC parameter name mismatches between YiVad/YiPet and YiAi"
acceptance_criteria:
  - "Two concrete bug examples with root cause and fix"
  - "Prevention strategy documented"
  - "Cross-reference to all affected codebases"
related:
  - ./README.md
  - ../INDEX.md
  - ../../../../YiVad/CLAUDE.md
  - ../../../../YiAi/CLAUDE.md
  - ../../../../YiPet/CLAUDE.md
  - ../../../../projects/yivad/bugs/2026-08-21/data/protable-search-param-mismatch.md
  - ../../../build/cross-project-rpc-protocol.md
---

# RPC Parameter Name Mismatch

> **The same bug pattern in different domains.** Both caused by the absence of automated contract testing between the frontend and backend codebases.

## The pattern

YiVad and YiPet communicate with YiAi through an RPC envelope:

```json
{
  "module_name": "services.database.data_service",
  "method_name": "query_documents",
  "parameters": { "cname": "menus", "filter": {}, "pageNum": 1 }
}
```

The `parameters` dict is passed directly to the backend method as `**kwargs`. If a parameter name doesn't match what the backend expects, the mismatch is **silent** — no type error, no lint warning, no build failure. The backend either ignores the parameter or returns a 422.

## Bug 1: `filter` vs `query` (2026-07-28)

**What happened**: YiPet's `SessionService.list()` and `SessionService.get()` were sending `query: {...}` in the parameters. YiAi's `_build_filter` reads the `filter` key, not `query`. The `query` key was silently ignored, and the backend returned ALL documents (or none) instead of the filtered subset.

**Impact**: List/get silently returned wrong results. No error was thrown.

**Fix**: Changed `query` → `filter` in `SessionService.list/get`. Renamed `QueryParams.query` → `QueryParams.filter` in the types file with a docstring noting the backend contract.

**Files affected**:
- `YiPet/src/api/services/sessions.ts`
- `YiPet/src/api/types.ts`

## Bug 2: `target_file` vs `path` (2026-07-28)

**What happened**: YiVad's `fileService.readFile()` and `fileService.writeFile()` were sending `{ path }` in the request body. YiAi's `/read-file` and `/write-file` endpoints use Pydantic models (`FileReadRequest`, `FileWriteRequest`) that require `target_file`, not `path`. Every call returned a 422.

**Impact**: All file read/write operations failed with 422. The error was visible (HTTP status) but the root cause was non-obvious because the parameter name looked correct.

**Fix**: Changed `path` → `target_file` in `fileService.readFile/writeFile`.

**Files affected**:
- `YiVad/src/api/modules/fileService.ts`

## Root cause

No automated contract testing exists between the frontend and backend codebases. Both sides are written in different languages (TypeScript vs Python) with different type systems. The RPC envelope is dynamically typed — parameters are passed as a dict, and the backend unpacks them with `**kwargs`. A mismatch in parameter names cannot be caught by static analysis on either side.

## Prevention

1. **Consult the cross-project protocol table** in the project CLAUDE.md before adding new API calls. Every parameter name is documented there.
2. **Add a contract test** that verifies the frontend's request shape against the backend's Pydantic model. A simple test that sends a known-good request and asserts the response shape would catch parameter name regressions.
3. **Monthly cross-project contract alignment check** — a 15-minute recurring check where one engineer from YiVad and one from YiAi review the protocol table for new parameters or changed field names.

## Detection

- **`filter`/`query`**: Hard to detect. The backend silently ignores unknown keys. Look for unexpected empty results or full-table returns.
- **`target_file`/`path`**: Easier to detect. The backend returns 422 for missing required fields. Check the Network tab for 422 responses.
- **General approach**: When a cross-project call behaves unexpectedly, check the request payload against the contract table in the project CLAUDE.md before debugging the backend.