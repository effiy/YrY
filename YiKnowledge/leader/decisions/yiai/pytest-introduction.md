---
title: "ADR: Introduce Pytest Test Framework"
tags: [adr, yiai, testing, pytest, quality]
category: leader/decisions/yiai
created: 2026-08-03
updated: 2026-08-21
last_verified: 2026-08-21
source: internal
type: decision
status: accepted
lifecycle: implemented
review_cycle: quarterly
roles: [leader, engineer]
benefit: "Understand the pytest testing strategy and directory structure for YiAi"
acceptance_criteria:
  - "test framework, directory structure, and coverage targets are defined"
related:
  - ../../../engineer/learn/projects/yiai/README.md
---

# ADR: Introduce Pytest Test Framework

> **Status**: Accepted (2026-08-03) — implemented (2026-08-21)

## Context

YiAi has zero test coverage. The architecture is cleanly layered (domain/services/server), but every refactor carries unknown regression risk. The absence of tests is the project's largest technical debt item.

## Decision

**Introduce pytest 8 + httpx + pytest-asyncio + pytest-cov with a structured test directory.**

Directory structure: `tests/{unit,integration,eval}/`

- `unit/` — Pure function tests, no I/O
- `integration/` — Tests that hit real MongoDB, Ollama, or HTTP endpoints
- `eval/` — RAG evaluation tests (quality metrics, not pass/fail)

## Implementation (2026-08-21)

- **Config**: `pyproject.toml` with `pythonpath = ["src"]`, `testpaths = ["tests"]`, `--cov=src`
- **Fixtures**: `tests/conftest.py` with shared fixtures
- **Initial coverage**: 5 test suites, 76 tests — `test_utils.py`, `test_error_codes.py`, `test_response.py`, `test_exceptions.py`, `test_config.py`
- **Coverage results**: shared/error_codes.py 100%, shared/exceptions.py 100%, shared/response.py 100%, shared/utils.py 93%, shared/config.py 92%

## Rationale

- pytest is the Python ecosystem standard
- pytest-asyncio handles FastAPI's async nature
- httpx provides async HTTP client for endpoint testing
- Structured directories prevent test sprawl

## Consequences

- All new domain logic should have corresponding tests
- CI should run `python -m pytest tests/ -v` on every PR
- Coverage targets: 80%+ for shared/, 60%+ for domain/