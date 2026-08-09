---
title: ADR — YiAi introduces pytest test infrastructure
aliases: [adr-pytest-introduction, yi-ai-pytest-adr, testing-infra-adr]
tags: [adr, yi-ai, pytest, httpx, testing, infrastructure, architecture-decision]
category: tech-lead/decisions/yiai
created: 2026-08-03
updated: 2026-08-03
source: internal
type: summary
status: draft
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-03
tacit: false
roles: [tech-lead, engineer]
benefit: "YiAi pytest adoption decision is documented with trade-offs, enabling consistent Python testing strategy"
acceptance_criteria:
  - "context, decision, and rationale are clearly documented"
  - "options considered with trade-offs are enumerated"
  - consequences and reversal path are stated
related:
  - ../../../engineer/projects/yiai/architecture.md
  - ../../../engineer/projects/yiai/dev-standards.md
  - ./route-llm-traffic-across-providers.md
  - ../../../product-manager/projects/yiai--project-management.md
  - ../../../product-manager/delivery/retrospective.md
  - ../../../product-manager/delivery/weekly-report.md
  - ../../../knowledge-curator/templates/adr.md
  - ../../../knowledge-curator/templates/adr.md
---

# ADR — YiAi introduces pytest test infrastructure

> **As a** tech lead, **I want to** pytest introduction, **so that** decision documented and reversible.

> Decision: YiAi introduces pytest + httpx + pytest-asyncio + coverage as the test infrastructure, with directory `tests/{unit,integration,eval}`. This lands the [retrospective Try item](../../../product-manager/delivery/retrospective.md) "`pytest` + `httpx` integrated test infrastructure" and the [dev-standards §lint gap](../../../engineer/projects/yiai/dev-standards.md). The evaluation set is shared with [ADR multi-provider LLM routing](./route-llm-traffic-across-providers.md) #5 in the `tests/eval/` directory.

## 1. Basic info

| Field | Content |
|---|---|
| ADR number | ADR-Pytest-Introduction |
| Title | YiAi introduces pytest test infrastructure |
| Status | Accepted |
| Date | 2026-08-03 |
| Decision maker | YiAi lead owner + architecture team |
| Reviewer | CTO, QA |
| Related project | YiAi |
| Related PR/Issue | To be opened (YiAi `chore(test): pytest + httpx + coverage scaffold`)  |
| Supersedes | — |
| Superseded by | — |
| Review trigger | Quarterly review / signals: coverage < 60% / key bug slips through / `httpx` vs FastAPI TestClient behavior difference breaks tests |

## 2. background (Context)

- **Current state**: YiAi `src/` has 0 tests; regression relies on manual curl + Postman. A single line change to `services/ai/chat_service.py` SSE stream can break the `onDone` guard ([lessons/gotchas/sse-onDone-guard](../../../engineer/lessons/gotcha-sse-ondone-guard.md)).
- **Pain point quantification**:
  - Key path regression relies on manual testing, averaging 30 min/time; 12 manual test scripts must run before release = 6 person-hours/week.
  - `data/database.py` `find_many` / `delete_one` wrappers discovered missing only after addition ([weekly report #33](../../../product-manager/delivery/weekly-report.md)); the explanation contract drift needs tests to guard.
  - `domain/rag/engine.py` recall rate is not quantified ([ADR multi-provider](./route-llm-traffic-across-providers.md) §risk #2).
- **Triggering event**: retrospective Try item + weekly report next-week plan YiAi item 2 + [ADR multi-provider #5](./route-llm-traffic-across-providers.md) evaluation set prerequisite.
- **External constraints**: FastAPI native `TestClient` is based on `httpx`; `pytest-asyncio` works maturely with Motor (async MongoDB); `pytest-cov` integrates stably with `pytest-asyncio`.

## 3. decision (Decision)

YiAi picks pytest as the test runner, httpx to drive the FastAPI TestClient for HTTP integration, pytest-asyncio for Motor async paths, and pytest-cov for coverage. The directory is split into three layers: unit / integration / eval.

landing checklist:

| # | Change | impact scope | launch strategy |
|---|---|---|---|
| 1 | `pyproject.toml` `[tool.pytest.ini_options]` + `asyncio_mode=auto` + `[tool.coverage]` config | YiAi root | one-shot |
| 2 | `tests/conftest.py`: `TestClient` fixture + `mongodb_test` fixture (independent db) + SSE parse helper | YiAi `tests/` | one-shot |
| 3 | `tests/unit/` — domain pure-function unit tests (rag engine sub-functions, knowledge scanner parsing, wework sign)  | Priority P0 | progressive, starting from P0 domains |
| 4 | `tests/integration/` — `TestClient` runs 13 routes + SSE streaming assertions + RPC envelope field contract | Priority P0 | follows #3 |
| 5 | `tests/eval/` — RAG recall evaluation set (shared with [ADR multi-provider #5](./route-llm-traffic-across-providers.md))  | Priority P1 | must land before multi-provider switch |
| 6 | CI `pre-commit` + `pytest --cov --cov-fail-under=60` gate | GitHub Actions | follows #1 |
| 7 | CLAUDE.md "Test" section add "run `pytest -q`" + "coverage report location" | documentation | one-shot |

## 4. Alternative options (Options Considered)

| Alternative | description | pros | cons | conclusion |
|---|---|---|---|---|
| A. pytest + httpx + pytest-asyncio + pytest-cov | Industry standard Python test stack | Mature ecosystem; native FastAPI compatibility; works well with llama_index / Motor async | Heavier config | ✅ selected |
| B. unittest + requests + coverage | Standard library built-in | No dependencies | Poor async support; SSE assertions need hand-rolled parser; narrow ecosystem | ❌ |
| C. Integration-only (no unit)  | Only run TestClient | Fast start | Lacks contract protection; refactor breaks easily | ❌ (must layer)  |
| D. Do not introduce | Keep manual testing | Zero cost | Regression relies on humans; release window perpetually blocked | ❌ |

## 5. Evaluation dimensions

| Dimension | A. pytest | B. unittest | C. Integration-only | D. Do not introduce |
|---|---|---|---|---|
| Async support | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | — |
| FastAPI compatibility | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | — |
| SSE assertions | ⭐⭐⭐⭐⭐ (httpx)  | ⭐⭐ | ⭐⭐⭐⭐ | — |
| Coverage gate | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | — |
| Startup cost | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Long-term maintenance | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐ |

## 6. risk (Risks)

| risk | probability | impact | mitigation |
|---|---|---|---|
| Motor async test false positives/negatives | Medium | High | `pytest-asyncio` `asyncio_mode=auto` + independent test db + drop each run |
| SSE streaming assertions fragile | Medium | Medium | conftest extracts `parse_sse_stream` helper; assertions only check `data:` frames + terminal `done: true` |
| Coverage gate too strict blocks PR | High | Medium | First version `--cov-fail-under=60`, raise at quarterly review; P0 domains reach bar first |
| Test data pollutes production db | Low | High | `mongodb_test` fixture forces db name `yiai_test_*`; CI env injects `MONGO_DB=yiai_test` |
| `httpx` vs FastAPI TestClient behavior difference | Low | Medium | Integration tests use `TestClient` (based on httpx); external E2E only uses real `httpx.AsyncClient` |
| Evaluation set strongly coupled with ADR multi-provider | Medium | Medium | `tests/eval/` directory independent; run baseline before multi-provider switch, same cadence as [ADR multi-provider #5](./route-llm-traffic-across-providers.md) |

## 7. rollback plan (Rollback Plan)

| Trigger condition | rollback action | owner | estimated recovery time |
|---|---|---|---|
| CI `pytest --cov` blocks release window | Temporarily lower `--cov-fail-under` to 40 or remove gate | YiAi lead owner | 15 min |
| `pytest-asyncio` regression with Motor | Switch to `anyio` backend + reduce async tests, keep sync tests | YiAi lead owner | 1 h |
| Test db pollutes production | Immediately stop CI + clean `yiai_test_*` db + audit `MONGO_DB` env injection | Ops + YiAi lead owner | 2 h |
| Evaluation set blocks multi-provider switch | Evaluation set on independent branch; multi-provider does not block on unit/integration | Architecture team | 1 business day |

> Rollback must be executable within 1 h; test infrastructure rollback does not impact production deploy.

## 8. Implementation plan

| Phase | Content | Completion date | Owner |
|---|---|---|---|
| Phase 1 | `pyproject.toml` + `conftest.py` + CI gate landing (#1 #2 #6)  | 2026-08-05 | YiAi lead owner |
| Phase 2 | `tests/unit/` P0 domains: rag engine / knowledge scanner / data wrappers (#3)  | 2026-08-08 | YiAi lead owner |
| Phase 3 | `tests/integration/` P0: 13 routes + SSE + RPC envelope contract (#4)  | 2026-08-12 | YiAi lead owner + QA |
| Phase 4 | `tests/eval/` baseline: 50 document evaluation set (#5, co-built with [ADR multi-provider #5](./route-llm-traffic-across-providers.md))  | 2026-08-15 | YiAi lead owner |
| Phase 5 | Raise coverage to 70% + quarterly review | 2026-09-01 | Architecture team |

## 9. Follow-up tracking metrics

| Metric | Before launch | goal | actual |
|---|---|---|---|
| Test file count | 0 | ≥ 20 | — |
| Coverage (P0 domains)  | 0% | ≥ 60% Phase 2 / ≥ 70% Phase 5 | — |
| Integration test SSE assertion count | 0 | ≥ 5 (chat / rag-chat-stream / rag-file-chat-stream)  | — |
| Pre-release manual test time | 6 person-hours/week | ≤ 1 person-hour/week | — |
| Evaluation set baseline recall | — | Quantified (co-built with ADR multi-provider)  | — |

## 10. References

- [YiAi architecture overview](../../../engineer/projects/yiai/architecture.md) — test infrastructure coverage of 13 routes + SSE + dual-write
- [YiAi dev standards](../../../engineer/projects/yiai/dev-standards.md) — §lint gap + §SSE guard contract
- [ADR multi-provider LLM routing](./route-llm-traffic-across-providers.md) — `tests/eval/` co-build prerequisite
- [retrospective instance](../../../product-manager/delivery/retrospective.md) — Try item trigger
- [ADR template](../../../knowledge-curator/templates/adr.md) / [ADR summary](../../../knowledge-curator/templates/adr.md)
