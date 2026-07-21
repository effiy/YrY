---
name: yry-code-fastapi
description: >
  FastAPI best practices guidance distilled from the official best-practices
  guide (and its companion AGENTS.md). Use this skill whenever the user writes,
  reviews, refactors, scaffolds, or migrates a FastAPI service, or asks about
  FastAPI conventions, async patterns, Pydantic models, dependencies, JWT auth,
  SQLAlchemy 2.0 async, Alembic migrations, BackgroundTasks, or FastAPI
  testing. The skill enforces a domain-based src/ layout, Annotated[T, Depends(...)],
  PyJWT over python-jose, httpx.AsyncClient + ASGITransport for tests, SQLAlchemy
  async sessions, ruff, and an opinionated anti-pattern checklist. Trigger on
  any of: "FastAPI", "fastapi", "Pydantic v2", "async def route", "SQLAlchemy
  async", "Alembic", "JWT in FastAPI", "BackgroundTasks", "FastAPI structure",
  "FastAPI scaffold", "review this FastAPI code", "FastAPI testing", "FastAPI project structure".
lifecycle: default-pipeline
user_invocable: true
---

# yry-code-fastapi

> Opinionated FastAPI conventions (README + AGENTS.md). Use this skill to
> write, scaffold, and review FastAPI services that match what production
> teams actually ship.

## What this skill does

1. **Reference the best-practices ruleset.** Inlines the most relevant rules
   from the source repo (project structure, async, Pydantic, dependencies,
   JWT, DB, testing, migrations, docs, background work) so the model follows
   them without fetching the upstream repo at runtime.
2. **Scaffold a new project.** Generates a domain-based `src/` layout, async
   `database.py`, per-domain `config.py` and `exceptions.py`, alembic init
   templates, and an async test fixture.
3. **Review existing code for anti-patterns.** Scans for documented
   anti-patterns (sync I/O in async routes, `from jose import jwt`,
   `ConfigDict(json_encoders=...)`, `Field(ge=18, default=None)`, default-arg
   `Depends(...)`, `async_asgi_testclient`, `BackgroundTasks` for critical
   work, shared `BaseSettings`, deep cross-domain imports, mock-the-DB tests)
   and outputs file:line citations with a fix for each.
4. **Version-aware defaults.** Pins the compatibility matrix (AGENTS.md):
   Python 3.11+, FastAPI 0.115+, Pydantic 2.7+, SQLAlchemy 2.0 async,
   pydantic-settings 2.4+, alembic 1.13+, httpx 0.27+, PyJWT 2.9+, ruff 0.6+.

## What this skill does NOT do

- Does NOT invent rules — every guideline traces back to a section in the
  source repo (cited inline). If something isn't in the repo, says "not
  covered" rather than guessing.
- Does NOT run or test the user's code. Produces files and reviews; the
  user runs the code.
- Does NOT handle non-FastAPI Python web frameworks (Flask, Django, etc.).
- Does NOT replace the official FastAPI docs for general API design questions.

## Workflow

1. **Identify intent** (scaffold | review | refactor).
2. **Load rules** from `references/` — only the ones relevant to the task.
3. **Produce output that cites the rule per change.**
   - For review: scan for the documented anti-patterns and report file:line.
   - For scaffold: emit the `src/{domain}/` tree and verify.
   - For refactor: propose `Annotated[T, Depends(...)]`-style idiomatic rewrites.
4. **Cite** every change with the `references/` file (or upstream section) it
   traces back to.

Key principles: cite the rule; default to the modern idiomatic form
(`Annotated[T, Depends(...)]`, `async def` + `await`, `httpx.AsyncClient` +
`ASGITransport`, SQLAlchemy 2.0 async); use a domain-based layout, not
file-type layout; async is not free — CPU-bound work goes to a worker
process (Celery/Arq/RQ), not threads or `asyncio`.

## Borders

| Boundary | Permission |
|----------|-----------|
| `.claude/skills/yry-code/fastapi/**` (this skill) | read + write |
| Project directory the user is working in (scaffold target, review target) | read + write within scope declared in the user's request |
| `~/.cache/pip`, `node_modules/`, `.venv/`, `__pycache__/` | no access — skip during scans |
| Installed skills outside this path | read-only |

## Supporting resources

- [references/project-structure.md](./references/project-structure.md) — domain-based `src/` layout.
- [references/async-routes.md](./references/async-routes.md) — when to use `async def` vs `def` vs `run_in_threadpool` vs Celery.
- [references/pydantic.md](./references/pydantic.md) — built-in validators, custom base model, BaseSettings splitting.
- [references/dependencies.md](./references/dependencies.md) — `Annotated[T, Depends(...)]`, chaining, caching.
- [references/authentication.md](./references/authentication.md) — JWT with PyJWT, dependency patterns.
- [references/database.md](./references/database.md) — SQLAlchemy 2.0 async, naming conventions, SQL-first.
- [references/testing.md](./references/testing.md) — httpx.AsyncClient + ASGITransport, dependency_overrides.
- [references/migrations.md](./references/migrations.md) — Alembic async template, filename convention.
- [references/documentation.md](./references/documentation.md) — hiding docs in prod, documenting endpoints.
- [references/background-tasks.md](./references/background-tasks.md) — BackgroundTasks vs Celery/Arq/RQ.
- [references/anti-patterns.md](./references/anti-patterns.md) — the full anti-pattern table from AGENTS.md.
- [references/quick-reference.md](./references/quick-reference.md) — decision table for the most common scenarios.
- [commands/](./commands/) — workflow entry points: `scaffold.md` (new project), `review.md` (anti-pattern scan), `refactor.md` (idiomatic rewrites).

## Fallback

| Situation | Behavior |
|-----------|----------|
| User is on Pydantic v1 / FastAPI < 0.95 / SQLAlchemy 1.x | Note the version mismatch, propose the modern form, but keep legacy compatibility if the user asks. |
| User wants Flask / Django / Litestar / Starlette advice | Say "not in scope" and point at the relevant framework's skill if one is installed. |
| User asks for performance tuning beyond async/CPU splitting | Recommend FastAPI's own concurrency doc and a profiler; do not invent rules. |
| User runs `scaffold` into a non-empty directory | Refuse unless `--force` is passed; show the conflicting files. |
| User runs `review` on a non-Python or non-FastAPI path | Report 0 findings and tell them the scanner only checks FastAPI Python files. |
| User asks in a language other than English | Respond in the user's language; keep resource titles in original language. |
