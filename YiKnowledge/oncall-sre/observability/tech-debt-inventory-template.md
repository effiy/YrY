---
title: Tech Debt Inventory Template
lifecycle: active
tags:
- template
- tech-debt
- Tech Debt
- quarterly-repayment
category: oncall-sre/observability
created: 2026-07-30
updated: 2026-07-30
last_verified: 2026-08-07
source: internal
type: template
status: stable
roles:
- oncall-sre
- tech-lead
benefit: SREs can monitor system health and SLO compliance with clear observability patterns
acceptance_criteria:
  - "all placeholders are annotated with expected content type"
  - "field descriptions include required-vs-optional and format constraints"
  - "usage guidance explains when to use this template and common mistakes"
related:
- tech-debt-inventory.md
- capacity-and-cost-template.md
review_cycle: quarterly
tacit: false
---

# Tech Debt Inventory Template

> **As an** oncall sre, **I want to** tech debt inventory template, **so that** system observable.

> Usage method: run a tech debt inventory per domain once a quarter. Pairs with the qb-row "Tech debt inventory" one-click prompt: classify core debts by domain, assess interest, and prioritize quarterly repayment. This template produces a sortable debt table + quarterly repayment priorities. Copy to `tech/infra/{quarter}-tech-debt-inventory.md`.

## 1. Basic info

| Field | Content |
|------|------|
| Inventory quarter |  (example: 2026 Q3)  |
| Inventory owner |  (example: architecture team)  |
| Domains involved | platform / middleware / business |
| Data sources | code scanning + architecture review + team self-report |
| Last inventory | [link]\({previous-quarter-filepath}\) |
| Last quarter repayment rate |  (example: 35%)  |

## 2. Debt register

| No. | Domain | Debt name | type | Size (person-days) | Interest (monthly) | Urgency | impact scope | Owner | state |
|---|---|---|---|---|---|---|---|---|---|
| TD-001 | Platform | Vite→Rsbuild migration | framework | 12 | High | 🔴 High | all frontend | frontend lead | ✅ Repaid |
| TD-002 | Middleware | RabbitMQ→Kafka consolidation | middleware | 25 | Medium | 🟡 Medium | 6 backend services | middleware team | ⏳ In progress |
| TD-003 | Business | After-sales AI model card missing | compliance | 8 | High | 🔴 High | launch blocker | model team | 🟡 risk |
| TD-004 | Platform | No unit test infrastructure | quality | 40 | High | 🟡 Medium | all projects | QA | ⏸ Not started |

> type enum: framework / middleware / compliance / quality / security / performance / documentation / depends on

## 3. Interest and urgency assessment rubric

| Interest | Definition | Urgency criteria |
|---|---|---|
| High | Blocks ≥ 1 launch per month or causes incident | impact launch / compliance / security → 🔴 High |
| Medium | Impacts efficiency 1-2 times per quarter | impacts efficiency but not blocking → 🟡 Medium |
| Low | Cognitive load only, can be worked around | no impact → 🟢 Low |

## 4. Quarterly repayment priority Top 5

| Rank | Debt no. | name | Suggested repayment window | Estimated benefit | risk |
|---|---|---|---|---|---|
| P1 | TD-003 | Model card fill | 2026-10 week 1 | Unblocks overseas launch | Legal block |
| P2 | TD-002 | MQ consolidation | 2026-11 | -35% ops | data migration |
| P3 | TD-004 | Unit test infrastructure | 2026 Q4 ongoing | CFR -5pp | Personnel stretch |
| P4 | TD-005 | __ | __ | __ | __ |
| P5 | TD-006 | __ | __ | __ | __ |

## 5. Last quarter repayment retrospective

| No. | Last quarter goal | Actual repayment | Extension cause |
|---|---|---|---|
| TD-001 | Full migration | ✅ Complete | — |
| TD-007 | Old interface offline | 50% | depends on party not aligned |

## 6. Debt type distribution

| type | Count | Share | Average interest |
|---|---|---|---|
| framework | 2 | 14% | Medium |
| middleware | 3 | 21% | Medium |
| compliance | 1 | 7% | High |
| quality | 5 | 36% | Medium |
| security | 2 | 14% | High |
| documentation | 1 | 7% | Low |

## 7. Anti-new-debt measures

| type | Measure | Owner |
|---|---|---|
| process | ADR mandates new-debt registration | architecture team |
| code | lint rule upgrade | frontend lead |
| review | Definition of Done adds "no new TD" | each team lead |

## 8. Action items

| No. | Action item | Owner | Due date | state |
|---|---|---|---|---|
| 1 | TD-003 model card fill for 6 countries | model team | 2026-10-07 | todo |
| 2 | TD-002 Kafka switchover drill | middleware team | 2026-10-20 | todo |
| 3 | TD-004 introduce Vitest infrastructure PoC | QA | 2026-11-01 | todo |

## 9. Measurement metrics

| Metric | Last quarter | This quarter goal |
|---|---|---|
| Total debts | 18 | ≤ 15 |
| High-interest debt count | 6 | ≤ 3 |
| Repayment rate | 35% | ≥ 50% |
| New debts / repaid debts | 1.2 | ≤ 0.8 |
