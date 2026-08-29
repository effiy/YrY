---
title: "Tech Debt: YiVad No Test Framework"
tags: [tech-debt, yivad, testing, vitest]
category: leader/architecture
created: 2026-08-21
updated: 2026-08-21
source: internal
type: assessment
status: stable
lifecycle: active
review_cycle: quarterly
roles: [leader]
benefit: "Track YiVad test framework tech debt and mitigation plan"
related:
  - ../decisions/yivad/vitest-introduction.md
  - ../../../engineer/learn/projects/yivad/README.md
---

# Tech Debt: YiVad No Test Framework

> **Status**: Open — Vitest ADR accepted, not yet implemented

## Impact

- **Risk**: Every refactor carries unknown regression risk
- **Past incidents**: `filter`/`query` and `target_file`/`path` bugs would have been caught by contract tests
- **Most affected path**: ProTable `requestApi → callService → RequestHttp → YiAi` chain

## Mitigation plan

| Phase | Scope | Timeline |
|-------|-------|----------|
| 1 | Composable tests (useTable, useSelection, useAuthButtons) | Next sprint |
| 2 | RPC contract integration tests | After Phase 1 |
| 3 | Agent mode E2E tests | After Phase 2 |

## Related tech debt

| Project | Issue | ADR |
|---------|-------|-----|
| YiAi | Zero test coverage (partially resolved: 76 tests, 2026-08-21) | [pytest-introduction](../decisions/yiai/pytest-introduction.md) |
| YiPet | Zero integration tests for dual-world boundary | Not yet addressed |

## Review

Next review: 2026-09-21