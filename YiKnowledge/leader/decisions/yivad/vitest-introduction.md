---
title: "ADR: YiVad Vitest Introduction and Rollout"
tags: [adr, yivad, vitest, testing, quality]
category: leader/decisions/yivad
created: 2026-08-21
updated: 2026-08-21
source: internal
type: decision
status: accepted
lifecycle: planned
review_cycle: quarterly
roles: [leader, engineer]
benefit: "Understand the Vitest testing strategy for YiVad"
related:
  - ../../../engineer/learn/projects/yivad/README.md
  - ../../yiai/pytest-introduction.md
---

# ADR: YiVad Vitest Introduction and Rollout

> **Status**: Accepted — planned, not yet implemented

## Context

YiVad has zero test coverage. The ProTable data-fetching pipeline (`requestApi → callService → RequestHttp → YiAi`) is the most frequently modified code path. The `filter`/`query` and `target_file`/`path` parameter-name bugs would have been caught by even basic contract tests. The agent mode (2026-08-08) introduced a complex multi-turn protocol with confirmation gates, steering, followup, and resume-by-session — all untested.

## Decision

**Introduce Vitest for YiVad with a phased rollout:**

### Phase 1: Composable tests (highest ROI)
- `useTable` — table config, pagination, search
- `useSelection` — row selection state
- `useAuthButtons` — permission resolution

### Phase 2: Integration tests
- Verify `query_documents` call sends `filter` (not `query`)
- Verify `fileService.readFile/writeFile` sends `target_file` (not `path`)

### Phase 3: Agent mode E2E tests
- Pure-util tests for `confirmationAnswerFor` (51 tests) and `isContinuationMessage` (21 tests) — already done
- Store-level integration tests for `runStream` with mocked SSE events
- Full lifecycle: create → confirm → steer → followup → max_turns → resume

## Rationale

- Vitest is the natural choice for Vite/Rsbuild projects (native ESM, fast)
- Composable tests give the highest coverage-to-effort ratio
- Contract tests catch the most common bug pattern (parameter name mismatches)
- Agent mode tests prevent regressions in the most complex state machine