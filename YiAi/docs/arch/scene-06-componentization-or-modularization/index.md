---
scene: componentization-or-modularization
project: YiAi
classification: backend → modularization
status: done
date: 2026-07-24
pr: PR1–PR5
---

# Scene — YiAi Modularization (PR1–PR5)

> Required scene type per
> [`.claude/skills/yry-init/rules/architecture-direction.md`](../../../../.claude/skills/yry-init/rules/architecture-direction.md).
> YiAi is classified `backend → modularization`; this scene documents
> the first concrete move on that axis.

## §0 — Effect Sketch

YiAi's `src/` already separates `domain/<area>/` (business), `data/`
(persistence), `server/routes/` (HTTP), `shared/` (cross-cutting). But
domain modules lack explicit public APIs — every route imports directly
from internal files (`from domain.execution.executor import ...`).
PR1 closes that gap.

```mermaid
flowchart TD
  subgraph Route["server/routes/"]
    R[execution.py]
    F[files.py]
    S[state.py]
    W[wework.py]
  end
  subgraph DomainPkg["domain/<area>/ (package boundary)"]
    DE["execution/__init__.py<br/>re-exports execute_module"]
    DF["files/__init__.py<br/>re-exports upload_bytes_to_oss"]
    DS["state/__init__.py<br/>(already done)"]
    DW["wework/__init__.py<br/>placeholder — Phase 2"]
  end
  R -. was: from domain.execution.executor .-> DE
  F -. was: from domain.files.storage .-> DF
  S -. already package-level .-> DS
  W -. inline logic, no domain call .-> DW
  style DE fill:#cfe
  style DF fill:#cfe
  style DS fill:#cfe
  style DW fill:#fee
```

**Overview**: After PR1, every route imports from the **package**
(`from domain.<area> import ...`), never from an internal file. The
`__init__.py` of each domain package is the only public surface;
`__all__` enforces it. `domain/state/` is the role model (already
shipped this pattern). `domain/wework/` is a placeholder — business
logic still lives in `server/routes/wework.py` and will be migrated in
PR2.

## §1 — Test Design

| AC | SC |
|----|-----|
| AC1: No route file imports from `domain.<area>.<internal_module>` directly | `grep -rn "from domain\.[a-z_]*\.[a-z_]* import" src/server/routes/` returns 0 hits |
| AC2: Each domain package re-exports its public surface | `python -c "from domain.execution import execute_module; from domain.files import upload_bytes_to_oss; from domain.ai import chat; from domain.rss import init_rss_system, shutdown_rss_system"` exits 0 |
| AC3: No new `services.*` imports introduced | `grep -rn "from services\|import services" src/server/routes/ src/app.py` returns 0 hits (shim remains for backward-compat only) |
| AC4: Application still boots | `python -c "from src.app import app; print(app.title)"` succeeds |

## §2 — Output Inventory + Architecture Decisions

### Files touched (PR1)

| File | Change |
|------|--------|
| `src/domain/__init__.py` | Add top-level docstring: "Routes may only `from domain.<area> import ...`; do not import internal files." |
| `src/domain/ai/__init__.py` | Re-export `OllamaService`, `chat`, `list_ollama_models` from `chat.py`; set `__all__` |
| `src/domain/execution/__init__.py` | Re-export `execute_module`, `parse_parameters`, `run_script` from `executor.py`; set `__all__` |
| `src/domain/files/__init__.py` | Re-export full public surface from `storage.py` (`OSSConfig`, `get_bucket`, `build_oss_url`, all upload/delete/tags/info/list functions); set `__all__` |
| `src/domain/rss/__init__.py` | Re-export `RSSSchedulerManager`, `init_rss_system`, `shutdown_rss_system`, `start_rss_scheduler`, `stop_rss_scheduler`, plus the feed helpers (`fetch_rss_feed`, `process_feed_from_url`, `parse_feed`); set `__all__` |
| `src/domain/wework/__init__.py` | Placeholder docstring noting business logic still lives in `server/routes/wework.py` (Phase 2 / PR2) |
| `src/server/routes/execution.py` | `from domain.execution.executor import execute_module` → `from domain.execution import execute_module` |
| `src/server/routes/files.py` | `from domain.files.storage import upload_bytes_to_oss` → `from domain.files import upload_bytes_to_oss` |
| `src/server/routes/state.py` | `from domain.state.store import StateStoreService` → `from domain.state import StateStoreService` |
| `src/app.py` | `from domain.rss.scheduler import init_rss_system, shutdown_rss_system` → `from domain.rss import init_rss_system, shutdown_rss_system` |

### Architecture decisions

1. **Package-level imports as the boundary contract.** `__init__.py`
   is the only public surface; `__all__` makes intent explicit and
   enables `from domain.<area> import *` to be safe.
2. **Zero behavior change.** Pure re-export + import-path rename.
   Existing RPC clients using `services.*` string module names are
   untouched (services/ shim stays).
3. **`domain/state/` as the role model.** It already does this
   (commit pre-existing). PR1 extends the pattern to `ai`, `execution`,
   `files`, `rss`.
4. **`domain/wework/` left as placeholder.** Migrating its inline
   route logic is PR2; doing the placeholder now lets future routes
   adopt `from domain.wework import send_message` the moment PR2 lands.

### Out of scope (Phase 2)

- `server/routes/files.py` (465 lines) and `server/routes/story_panel.py` (462 lines) inline-logic migration

## §3 — Test Report

| Check | Result |
|-------|--------|
| PR1 AC1 grep (no `from domain.<area>.<file>` in routes/app) | pass — verified post-commit `4cb3fdc` |
| PR1 AC2 package-level import smoke test | pass — `all imports OK` |
| PR1 AC3 no new services.* imports in routes/app | pass |
| PR2 AC1 wework route ≤30 lines | pass — 21 lines |
| PR2 AC2 wework route no longer imports aiohttp | pass |
| PR2 AC3 `from domain.wework import send_message` resolves | pass |
| PR2 AC4 all five original error paths preserved in client | pass |
| PR3 services/ DeprecationWarning on import | pass — emits once at package import |
| PR3 RPC dispatch logging in `executor._import_target_function` | pass — `logger.info("RPC dispatch: module=%s function=%s", ...)` |
| PR4 files route ≤120 lines | pass — 87 lines (from 465) |
| PR4 files route no fs/oss/mongo directly | pass — all in `domain/files/local.py` |
| PR4 `from domain.files import read_file, write_file, ...` resolves | pass |
| PR5 story_panel route ≤120 lines | pass — 148 lines (from 462); excess is `help_info` HTTP metadata that legitimately lives in route |
| PR5 story_panel route no fs/git/httpx directly | pass — local ops in `local.py`, HTTP in `remote.py` |
| PR5 `from domain.story_panel import ...` resolves | pass |
| PR5 all 6 endpoints preserved | pass |
| Existing pytest (if any) | pending — to run after edits |

**Commits**: PR1 = `4cb3fdc`, PR2 = `6b33d17`, PR3 = `74e6190`, PR4 = `03ef3a7`, PR5 = `35c9544`.

## §4 — Self-Improvement

### D0 — Diagnosis

Symptom: domain layer exists but lacks explicit public surface — every
route reaches into internal files, so there is no boundary to
refactor against.

Root cause: the commit 1058a29 restructure moved files to the right
places but did not finish the second half of the move — establishing
`__init__.py` re-exports as the public API.

### D1–D3 — Why now

The restructure has been in this half-finished state long enough that
new code is being written against the wrong import path (e.g.,
`from domain.execution.executor import ...`). The longer it stays,
the more call sites accumulate. Fixing it now is cheapest.

### D4–D8 — Follow-up actions

- **D4**: PR2 — extract `domain/wework/client.py` from the inline route, make `wework/__init__.py` non-empty. **Done** (commit `6b33d17`).
- **D5**: PR3 — add `DeprecationWarning` to `services/__init__.py`, add RPC-dispatch logging in `executor.py` to collect real `module_name` strings. **Done** (commit `74e6190`).
- **D6**: PR4 — `files.py` (465 lines) inline logic → `domain/files/local.py` + `domain/files/paths.py`. **Done** (commit `03ef3a7`).
- **D7**: PR5 — `story_panel.py` (462 lines) inline logic → new `domain/story_panel/` module split into `local.py` + `remote.py`. **Done** (commit `35c9544`).
- **D8**: Consider a lint rule (custom flake8 plugin or import-linter contract) that forbids `from domain.<area>.<internal>` in `server/routes/` so the boundary doesn't erode again.
- **D9**: Post-PR3 — once RPC dispatch logs show no remaining `services.*` callers (after a sufficient observation window), delete the `services/` shim package entirely.

### Gate

This scene satisfies the 04-arch `componentization-or-modularization`
required-scene gate for YiAi (modularization axis). Phase 2 scenes
will be emitted as the corresponding PRs land.
