---
title: "Quarterly Tech Debt Review"
aliases: [quarterly-tech-debt, tech-debt, debt-review]
tags: [engineer, ship, tech-debt, quality, review]
category: engineer/ship
created: 2026-08-24
updated: 2026-08-24
source: internal
type: summary
status: draft
lifecycle: active
review_cycle: quarterly
roles: [engineer, leader]
benefit: "Engineers track and prioritize tech debt across Yi family projects"
related:
  - ./README.md
  - ../../leader/roadmap/manage-tech-debt.md
  - ../../leader/架构/tl-tech-debt-yivad-no-test-framework.md
---

# Quarterly Tech Debt Review

> Track and prioritize tech debt across all Yi family projects.

## Current tech debt inventory

| Item | Project | Severity | Effort | ADR |
|------|---------|----------|--------|-----|
| No test coverage | YiAi | High | Large | [pytest ADR](../../leader/decisions/yiai/pytest-introduction.md) |
| No test coverage | YiVad | High | Large | [Vitest ADR](../../leader/decisions/yivad/vitest-introduction.md) |
| No cache layer | YiAi | Medium | Medium | — |
| 4 Rsbuild configs | YiPet | Low | Small | — |
| No contract testing | All | Medium | Medium | — |
| macOS FSEvents unreliable | YiAi | Low | — | Mitigated (polling) |

## Review cadence

1. **Quarterly**: Update this inventory, re-prioritize
2. **Per ADR**: When a tech debt ADR is written, add it here
3. **Before major refactors**: Review debt that would be affected

## Decision framework

| Severity × Effort | Small | Medium | Large |
|-------------------|-------|--------|-------|
| High | Fix now | Schedule this quarter | Plan next quarter |
| Medium | Fix when touching | Schedule | Backlog |
| Low | Opportunistic | Backlog | Ignore |