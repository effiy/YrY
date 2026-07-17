# review

> Anti-pattern review for a FastAPI codebase, based on
> [references/anti-patterns.md](../references/anti-patterns.md).

## When to use

The user said "review", "audit", "check this FastAPI code", or asked the
skill to flag anti-patterns in a path.

## Workflow

1. Resolve the target path. If the user passed a glob, expand it. Skip
   `__pycache__/`, `.venv/`, `node_modules/`, `dist/`, `build/`.
2. For every `.py` file in the target, run the grep list below. Each hit
   needs the surrounding 3 lines of context to decide if it is a real
   violation.
3. Produce a markdown report with one section per file. Each section
   lists findings as `- <rule>: <excerpt> — <fix>` with `file:line` cited.
4. Group findings by severity:
   - **Blocking**: blocks the event loop, security, or kills a worker.
   - **Should-fix**: deprecated API, contradicting constraint, etc.
   - **Nitpick**: style only.
5. End with a "not seen" line for each grep that had 0 hits, so the user
   knows what *was* checked.

## Grep list (run with the `Grep` tool)

| Pattern | Severity | Source |
|---------|----------|--------|
| `requests\.(get|post|put|delete|patch)\b` | blocking if inside `async def` | `references/anti-patterns.md` |
| `time\.sleep\(` | blocking if inside `async def` | `references/anti-patterns.md` |
| `from jose import` | blocking | `references/anti-patterns.md` |
| `import jose` | blocking | `references/anti-patterns.md` |
| `from async_asgi_testclient import` | blocking | `references/anti-patterns.md` |
| `json_encoders` | should-fix | `references/anti-patterns.md` |
| `Field\([^)]*default\s*=\s*None` (with constraints) | should-fix | `references/anti-patterns.md` |
| `= Depends\(` (default-arg form) | nitpick | `references/anti-patterns.md` |
| `from src\..* import \*` | blocking | `references/project-structure.md` |
| `from src\.\w+\.\w+\.\w+ import` (deep cross-domain) | should-fix | `references/project-structure.md` |
| `BackgroundTasks` | context-dependent | `references/background-tasks.md` |
| `mock.*[Dd]atabase` (in tests) | should-fix | `references/anti-patterns.md` |
| `BaseSettings` (a single global one) | should-fix | `references/pydantic.md` |
| `monkeypatch` (in tests, on internals) | nitpick | `references/testing.md` |

## Output template

```markdown
# FastAPI Anti-pattern Review

**Target:** <path>
**Files scanned:** <count>
**Findings:** <N> (blocking: <b>, should-fix: <s>, nitpick: <n>)

## <file.py>

- **L42 — blocking**: `time.sleep(10)` inside `async def` blocks the event loop.
  Fix: use `await asyncio.sleep(10)` or move the work to a `def` route (threadpool).
  See `references/async-routes.md`.

## Not seen

- `from jose import jwt` — clean
- `json_encoders` — clean
- ...
```
