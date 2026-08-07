---
title: Tech Debt Inventory Template
lifecycle: active
tags:
- template
- tech-debt
- Tech Debt
- quarterly repayment
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

> **As an** oncall sre, **I want to** tech debt inventory, **so that** system observable.

> Usage: do a tech debt inventory per domain each quarter. Pairs with the qb-row "Tech debt inventory" one-click prompt: classify core debts by domain, assess interest, and prioritize quarterly repayment. This template produces a sortable debt table + quarterly repayment priority. Copy to `tech/infra/{quarter}-tech-debt-inventory.md`.

## 1. Basic info

| Field | Content |
|------|------|
| Inventory quarter |  (example: 2026 Q3)  |
| Inventory owner |  (example: architecture team)  |
| Participating domains | platform / middleware / business |
| Data sources | code scan + architecture review + team self-report |
| Last inventory | [link]\({previous quarter filepath}\) |
| Last quarter repayment rate |  (example: 35%)  |

## 2. Debt registry

| ID | Domain | Debt name | Type | Scale (person-days) | Interest (monthly) | Urgency | Impact scope | Owner | Status |
|---|---|---|---|---|---|---|---|---|---|
| TD-001 | Platform | Vite→Rsbuild migration | Framework | 12 | High | 🔴 High | All frontend | Frontend lead | ✅ Paid |
| TD-002 | Middleware | RabbitMQ→Kafka convergence | Middleware | 25 | Medium | 🟡 Medium | Backend 6 services | Middleware team | ⏳ In progress |
| TD-003 | Business | After-sales AI model card missing | Compliance | 8 | High | 🔴 High | Launch blocker | Model team | 🟡 At risk |
| TD-004 | Platform | No unit test infrastructure | Quality | 40 | High | 🟡 Medium | Whole project | QA | ⏸ Pending start |

> Type enum: Framework / Middleware / Compliance / Quality / Security / Performance / Documentation / Dependency

## 3. Interest and urgency assessment criteria

| Interest | Definition | Urgency determination |
|---|---|---|
| High | Blocks ≥ 1 launch or causes incident monthly | Impacts launch / compliance / security → 🔴 High |
| Medium | Impacts efficiency 1-2 times per quarter | Impacts efficiency but not blocking → 🟡 Medium |
| Low | Cognitive burden only, workaround exists | No impact → 🟢 Low |

## 4. Quarterly repayment priority Top 5

| Rank | Debt ID | Name | Suggested repayment window | Expected benefit | Risk |
|---|---|---|---|---|---|
| P1 | TD-003 | Model card filled | 2026-10 week 1 | Unblock overseas launch | Legal blocker |
| P2 | TD-002 | MQ convergence | 2026-11 | Reduce ops 35% | Data migration |
| P3 | TD-004 | Unit test infra | 2026 Q4 ongoing | CFR down 5pp | People squeeze |
| P4 | TD-005 | __ | __ | __ | __ |
| P5 | TD-006 | __ | __ | __ | __ |

## 5. Last quarter repayment retrospective

| ID | Last quarter goal | Actual repayment | Delay cause |
|---|---|---|---|
| TD-001 | Full migration | ✅ Complete | — |
| TD-007 | Old interface decommission | 50% | Dependents not aligned |

## 6. Debt type distribution

| Type | Count | Share | Average interest |
|---|---|---|---|
| Framework | 2 | 14% | Medium |
| Middleware | 3 | 21% | Medium |
| Compliance | 1 | 7% | High |
| Quality | 5 | 36% | Medium |
| Security | 2 | 14% | High |
| Documentation | 1 | 7% | Low |

## 7. New debt prevention measures

| Type | Measure | Owner |
|---|---|---|
| Process | ADR mandatory new debt registration | Architecture team |
| Code | Lint rule upgrade | Frontend lead |
| Review | Definition of Done adds "no new TD" | Each lead |

## 8. Action items

| ID | Action item | Owner | Due date | Status |
|---|---|---|---|---|
| 1 | TD-003 model card fill for 6 countries | Model team | 2026-10-07 | To do |
| 2 | TD-002 Kafka switch drill | Middleware team | 2026-10-20 | To do |
| 3 | TD-004 introduce Vitest infra PoC | QA | 2026-11-01 | To do |

## 9. Measurement metrics

| Metric | Last quarter | This quarter goal |
|---|---|---|
| Total debt | 18 | ≤ 15 |
| High-interest debt count | 6 | ≤ 3 |
| Repayment rate | 35% | ≥ 50% |
| New debt / repaid debt | 1.2 | ≤ 0.8 |
