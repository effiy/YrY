---
title: Tech Debt Inventory
aliases: [tech-debt-inventory, tech-debt-tracking, technical-debt]
tags: [sre, observability, tech-debt, maintenance, quality]
category: srer/observability
created: 2026-08-24
updated: 2026-08-24
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [srer, engineer, leader]
benefit: "Teams track and prioritize tech debt systematically — not just 'we should fix this someday'"
acceptance_criteria:
  - "tech debt classification framework (4 types)"
  - "inventory template with severity and effort scoring"
  - "prioritization framework for debt repayment"
related:
  - ./README.md
  - ../../leader/roadmap/manage-tech-debt.md
  - ../../engineer/learn/lessons/
---

# Tech Debt Inventory

> **When to use:** Quarterly, or when the team feels velocity is slowing down due to accumulated tech debt. An inventory makes debt visible, measurable, and prioritizable.

## Tech Debt Classification

| Type | Definition | Example | Cost of delay |
|---|---|---|---|
| **Deliberate** | Chose speed over quality knowingly | "Ship v1 without tests; add tests next sprint" | Compounds if not paid back |
| **Accidental** | Code quality degraded over time | "This function grew from 20 to 200 lines" | Grows with every change |
| **Bit rot** | Dependency or platform rot | "Python 3.8 is EOL; we're on 3.10 but should be on 3.12" | Sudden (security, EOL) |
| **Architectural** | Wrong abstraction or pattern | "The monolith should have been split into services 6 months ago" | High — blocks feature velocity |

## Inventory Template

| # | Item | Type | Location | Severity | Effort | Score | Owner |
|---|---|---|---|---|---|---|---|
| 1 | {{What's the debt?}} | {{Type}} | {{File/service}} | 1-5 | S/M/L/XL | {{S×E}} | {{name}} |
| 2 | YiVad: no test framework | Accidental | YiVad/src/ | 4 | L | 16 | — |
| 3 | YiAi: Python 3.10 → 3.12 | Bit rot | YiAi/ | 2 | M | 4 | — |
| 4 | YiPet: dual-world coupling | Architectural | YiPet/src/content/ | 3 | XL | 12 | — |

### Severity Scale

| Score | Definition |
|---|---|
| 1 | Cosmetic — no impact on development or users |
| 2 | Minor — slows down development slightly |
| 3 | Moderate — regularly causes bugs or slows features |
| 4 | Major — blocks certain features or causes incidents |
| 5 | Critical — active incidents, security risk, or blocks releases |

### Effort Scale

| Size | Person-days | Example |
|---|---|---|
| S | 1-3 | Upgrade a dependency, add a few tests |
| M | 1-2 weeks | Add test framework to a module |
| L | 2-4 weeks | Split a monolith service |
| XL | 1-3 months | Rewrite a core module, migrate database |

## Prioritization

Sort by `Score = Severity × Effort` (descending). High severity + low effort = quick wins.

| Priority | Score range | Action |
|---|---|---|
| P0 | ≥ 15 | Fix this sprint — actively hurting the team |
| P1 | 10-14 | Fix this quarter — allocate 20% of capacity |
| P2 | 5-9 | Fix when touching the area — opportunistic |
| P3 | < 5 | Track — fix when convenient |

### Debt Repayment Strategy

Allocate a fixed percentage of each sprint to tech debt:

| Debt level | Allocation |
|---|---|
| Low (score sum < 30) | 10% of sprint capacity |
| Medium (30-60) | 20% of sprint capacity |
| High (> 60) | 30% — schedule a dedicated "fix-it" sprint |

## YiVad Tech Debt Snapshot

| Item | Type | Severity | Effort | Score |
|---|---|---|---|---|
| No frontend test framework | Accidental | 4 | L | 16 |
| No vue-tsc in CI | Accidental | 3 | S | 3 |
| ProTable coupling to YiAi API shape | Architectural | 3 | M | 6 |

## YiAi Tech Debt Snapshot

| Item | Type | Severity | Effort | Score |
|---|---|---|---|---|
| Python 3.10 → 3.12 upgrade | Bit rot | 2 | M | 4 |
| No structured logging | Accidental | 3 | M | 6 |
| No distributed tracing | Deliberate | 2 | L | 8 |

## YiPet Tech Debt Snapshot

| Item | Type | Severity | Effort | Score |
|---|---|---|---|---|
| Dual-world boundary coupling | Architectural | 3 | XL | 12 |
| No E2E tests | Deliberate | 3 | L | 12 |
| CDN version drift (manual sync) | Bit rot | 2 | M | 4 |

## Anti-patterns

| Anti-pattern | Why it fails | What to do instead |
|---|---|---|
| "We'll fix it later" without tracking | Later never comes; debt accumulates silently | Track every debt item in the inventory; review quarterly |
| 100% feature work, 0% debt repayment | Velocity drops; team burns out | Allocate 10-20% of every sprint to debt repayment |
| Technical debt as a dumping ground | Everything is "tech debt"; nothing is prioritized | Classify by type and severity; only track items that affect velocity or quality |
| Debt inventory that's never updated | Inventory rots; becomes another form of debt | Review and update the inventory quarterly |