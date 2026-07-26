# CLAUDE.md — YiAi

## Foundational beliefs

- **Trust the model** — When the model produces a reasonable response, do not second-guess it with redundant validation unless the outcome is destructive.
- **Value attention** — Be aware of context-window economics. Prefer concise code and avoid verbose scaffolding. Every token spent on boilerplate is a token not spent on the problem.
- **Verify reality** — The code on disk is the only truth. Do not assume a module exists or behaves a certain way without reading it.
- **Think Before Coding** — Don't assume, surface tradeoffs. State assumptions explicitly; if multiple interpretations exist, present them; if a simpler approach exists, say so.

## Iron laws

1. **Simplicity First** — Minimum code, nothing speculative. No features beyond what was asked; no abstractions for single-use code; no error handling for impossible scenes.
2. **Surgical Changes** — Touch only what you must. Don't "improve" adjacent code; match existing style; every changed line traces to the user's request.
3. **Goal-Driven Execution** — Define success criteria, loop until verified. Transform tasks into verifiable goals; for multi-step tasks, state a brief plan with verify checks per step.
4. **No silent writes** — Read the file before editing it. Use existing conventions (snake_case, FastAPI patterns, dual-write model). Do not introduce new patterns without explicit reason.

## Architecture direction

**Backend project → Modularization axis.**

YiAi is a FastAPI backend server. The direction is toward tighter module boundaries: each domain sub-package (`domain/ai/`, `domain/files/`, `domain/rss/`, `domain/wework/`, `domain/execution/`) owns its logic; the `services/` layer wraps them for routes. Going forward, new features should land in named domain modules with a clear public API surface (an `__init__.py` exporting the callable contract), rather than scattering handlers across existing files.

See also: [../../rules/architecture-direction.md](../../rules/architecture-direction.md)

## Project profile

| Dimension | Value |
|-----------|-------|
| Name | YiAi |
| Type | backend |
| Version | 1.0.0 |
| Architecture | single (one src/ tree, no nested packages) |
| Ecosystem | Python / FastAPI |
| Runtime | uvicorn (ASGI), port 10086 |
| Database | MongoDB via motor (async) |
| Self-hosted | Ollama (LLM inference), OSS (object storage) |

## Project constraints

| Category | Constraint |
|----------|------------|
| Entry point | `main.py` (dev) or `uvicorn src.app:app` (prod) |
| Configuration | `config.yaml` + pydantic-settings (flat YAML keys mapped via `YamlConfigSettingsSource`) |
| Language | Python 3 (no async/sync mix — prefer async throughout) |
| File naming | snake_case |
| Auth model | Optional X-Token header verification (disabled by default) |
| File persistence | Dual-write model: disk (primary) + MongoDB (backup, best-effort upsert) |
| Static files | Served at `/static`, base dir configurable via `static.base_dir` |
| API response | Unified envelope: `{ "code": int, "message": str, "data": any }` |
| Degradation | MongoDB unavailable → writes fail; auth disabled → no gate; observer disabled → no runtime guard |
| Self-constraints | No test framework configured; add `pytest` + `httpx` for integration testing. No linting or formatting enforcement configured |

## Guidance

Use this file as a baseline for every assistant session when working on YiAi. For navigation:

| Resource | Location |
|----------|----------|
| Project README | `README.md` |
| Server config | `config.yaml` |
| Route definitions | `src/server/routes/` |
| Domain logic | `src/domain/` |
| Service layer | `src/services/` |
| Data access | `src/data/` |
| Shared utilities | `src/shared/` |
| Data models | `src/models/` |
