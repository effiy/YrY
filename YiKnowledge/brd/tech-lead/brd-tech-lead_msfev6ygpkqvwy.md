---
title: ADR — YiAi introduces pytest test infrastructure
lifecycle: active
key: brd_brd-tech-lead_msfev6ygpkqvwy
tags:
- adr
- yi-ai
- pytest
- testing
adr_id: ADR-Pytest-Introduction
project: yiai
domain: Testing Infrastructure
decision_type: process
team_size: 4
status: accepted
owner: YiAi lead owner
review_cycle: quarterly
kb_path: tech-lead/decisions/yiai/pytest-introduction.md
context: 'YiAi lacks automated test infrastructure; dev-standards §lint gap + retrospective Try item "pytest + httpx integration
  test infrastructure" pending. Shared with multi-provider ADR #5 evaluation set via `tests/eval/`. '
decision: "Introduce pytest + httpx + pytest-asyncio + coverage as test infrastructure; directory `tests/{unit,integration,eval}`. Priority: unit"
  > integration > eval. Coverage threshold 80%.
alternatives: B. unittest standard library — no native async support; C. no test introduction — high regression risk. A selected.
risks: 1. async test fixture complexity — pytest-asyncio standardization; 2. httpx mock drift from real environment — shared contract
  test; 3. coverage blocking PRs — phased threshold increase (50% → 80%).
rollback: Test infrastructure exception → keep unittest compatibility + fix + re-enable (1 working day).
stakeholders: YiAi lead owner (decision); architecture team (review); CTO (approval); QA (test collaboration)
tacit: false
related: []
---

# ADR — YiAi introduces pytest test infrastructure

**ADR ID**: ADR-Pytest-Introduction  |  **Project**: yiai  |  **Domain**: Testing Infrastructure
**Decision Type**: process  |  **Team Size**: 4  |  **Status**: accepted  |  **Owner**: YiAi lead owner
**Review Cycle**: quarterly  |  **KB Source**: tech-lead/decisions/yiai/pytest-introduction.md

## Context
YiAi lacks automated test infrastructure; dev-standards §lint gap + retrospective Try item "pytest + httpx integration test infrastructure" pending. Shared with multi-provider ADR #5 evaluation set via `tests/eval/`.

## Decision
Introduce pytest + httpx + pytest-asyncio + coverage as test infrastructure; directory `tests/{unit,integration,eval}`. Priority: unit > integration > eval. Coverage threshold 80%.

## Alternatives
B. unittest standard library — no native async support; C. no test introduction — high regression risk. A selected.

## Risks & Mitigations
1. async test fixture complexity — pytest-asyncio standardization; 2. httpx mock drift from real environment — shared contract test; 3. coverage blocking PRs — phased threshold increase (50% → 80%).

## Rollback Plan
Test infrastructure exception → keep unittest compatibility + fix + re-enable (1 working day).

## Stakeholders
YiAi lead owner (decision); architecture team (review); CTO (approval); QA (test collaboration)

## References
- **KB Source**: `YiKnowledge/tech-lead/decisions/yiai/pytest-introduction.md`
