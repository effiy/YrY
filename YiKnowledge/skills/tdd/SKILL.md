---
title: tdd
name: tdd
description: >
  Test-driven development with a red-green-refactor loop. Use this skill when
  implementing new features, fixing bugs, or refactoring code with test coverage.
  Write a failing test first (red), implement the minimum code to pass (green),
  then refactor while keeping tests green. The skill provides language-specific
  testing guidance for the YrY stack: YiVad (Vitest + Vue Test Utils), YiPet
  (Vitest + jsdom), YiAi (pytest + httpx). Trigger words: tdd, test-driven,
  test first, 测试驱动, 先写测试, red green refactor, add tests, write test,
  加测试, 写单测.
  Do NOT trigger for: configuration changes, documentation-only changes, or
  when the user explicitly says "no tests."
lifecycle: active
user_invocable: true
status: stable
type: skill
source: internal
created: 2026-08-21
updated: 2026-08-21
category: aier/skills/tdd
review_cycle: quarterly
roles:
  - engineer
  - aier
tags:
  - skill
  - ai
  - testing
  - tdd
  - quality
chip: ai-engineering
---

# tdd

> Red-Green-Refactor cycle for the YrY stack. Inspired by superpowers'
> test-driven-development and mattpocock's tdd — adapted for each project's
> testing reality.

## What this skill does

- Guide test-first development: write a failing test → make it pass → refactor.
- Provide project-specific testing setup and patterns for YiVad, YiPet, and YiAi.
- Enforce testing discipline: no implementation code before the test exists.
- Help distinguish good tests from bad tests (see testing anti-patterns).

## What this skill does NOT do

- Does NOT require 100% test coverage — test the critical path and edge cases.
- Does NOT test framework internals or third-party libraries.
- Does NOT replace the existing build verification (type-check, build) — tests
  are an additional layer, not a replacement.
- Does NOT force tests on every change — use judgment; a one-line config fix
  doesn't need a new test suite.

## Workflow

```
Red:   Write a minimal failing test that describes the expected behavior
       → Verify it fails for the RIGHT reason (not a syntax error)
Green: Write the minimum code to make the test pass
       → Verify ALL tests pass (not just the new one)
Refactor: Clean up the code while keeping tests green
       → Remove duplication, improve names, simplify
       → Verify tests still pass
```

### Testing anti-patterns (avoid these)

| Anti-pattern | Why it's bad | Better approach |
|-------------|-------------|-----------------|
| Testing implementation details | Test breaks on refactor | Test behavior, not internals |
| Mocking everything | Tests pass but code fails in prod | Only mock external boundaries |
| Testing the framework | Wasted effort | Trust the framework; test YOUR logic |
| One assertion per test | Under-specified behavior | Multiple related assertions are fine |
| No edge case tests | Bugs hide at boundaries | Test empty, null, max, min, boundary |
| Slow tests | Devs skip them | Keep unit tests < 100ms each |

## Project-specific guidance

### YiVad (Vitest + Vue Test Utils)

```typescript
// RED: Write a failing test
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import MyComponent from './MyComponent.vue';

describe('MyComponent', () => {
  it('renders the title prop', () => {
    const wrapper = mount(MyComponent, { props: { title: 'Hello' } });
    expect(wrapper.text()).toContain('Hello');
  });
});
```

Setup: `pnpm add -D vitest @vue/test-utils jsdom` (already configured in YiVad).

### YiPet (Vitest + jsdom)

```typescript
// RED: Write a failing test
import { describe, it, expect } from 'vitest';

describe('ChatController', () => {
  it('creates a session with correct tags', () => {
    const state = createInitialState();
    expect(state.sessions).toHaveLength(0);
  });
});
```

YiPet already has Vitest 2 + jsdom 29 configured. Tests live in `tests/`.

### YiAi (pytest + httpx)

```python
# RED: Write a failing test
import pytest
from httpx import AsyncClient, ASGITransport
from src.app import app

@pytest.mark.asyncio
async def test_query_documents_returns_list():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/", json={
            "module_name": "services.database.data_service",
            "method_name": "query_documents",
            "parameters": {"cname": "test_collection", "pageSize": 10}
        })
    assert response.status_code == 200
    data = response.json()
    assert data["code"] == 0
    assert "list" in data["data"]
```

Setup: `pip install pytest pytest-asyncio httpx` (already configured in YiAi via pyproject.toml).

## Rules

| # | Rule | Rationale |
|---|------|-----------|
| 1 | Test must fail first for the right reason | A syntax error is not a meaningful failure |
| 2 | Minimum code to pass | Don't write more than the test demands |
| 3 | All tests must pass before refactoring | Refactoring with failing tests hides bugs |
| 4 | Test behavior, not implementation | Tests should survive refactoring |
| 5 | One describe block per component/module | Clear organization |
| 6 | Test edge cases explicitly | Empty, null, boundary, error states |
| 7 | No test for the test's sake | Every test must catch a real potential bug |

## Borders

| Boundary | Permission |
|----------|-----------|
| Project source files | read + write |
| Test files | read + write |
| Build config (adding test deps) | read + write (with user approval) |
| CLAUDE.md files | read |

## Supporting resources

- [YiPet/tests/](../../../YiPet/tests/) — existing YiPet test patterns
- [YiPet/vitest.config.ts](../../../YiPet/vitest.config.ts) — YiPet test configuration
- [YiVad/CLAUDE.md](../../../YiVad/CLAUDE.md) — test framework: Vitest 2 + jsdom 29 + @vue/test-utils, 7 suites, 90 tests
- [YiAi/CLAUDE.md](../../../YiAi/CLAUDE.md) — test framework: pytest 8 + pytest-asyncio + httpx + pytest-cov, 5 suites, 76 tests

## Fallback

| Situation | Behavior |
|-----------|----------|
| Test framework not installed | Guide the user through `pnpm add -D` or `pip install` |
| Test fails for unexpected reason | Diagnose before writing implementation code |
| Refactoring breaks tests | Revert the refactoring; re-apply in smaller steps |