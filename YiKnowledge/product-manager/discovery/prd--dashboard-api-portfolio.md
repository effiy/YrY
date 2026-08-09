---
title: api portfolio dashboard
aliases:
- API platform dashboard
- API lifecycle dashboard
- API governance dashboard
- API as product dashboard
tags:
- dashboard
- api
- api-portfolio
- api-governance
- api-lifecycle
- developer-platform
category: product-manager/discovery/prd
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: dashboard
status: stable
lifecycle: active
review_cycle: monthly
roles:
- product-manager
- tech-lead
- engineer
benefit: API portfolio health and lifecycle management visible at a glance
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"
related:
- ../metrics/dashboard-product-portfolio.md
- ../../delivery/dashboard-product-delivery.md
- ../../../engineer/architecture-design/dashboard-architecture-health.md
- ../../../tech-lead/decisions/dashboard-architecture-decisions.md
tacit: false
---

# api portfolio dashboard

> **As a** product manager, **I want to** track the API portfolio lifecycle and health, **so that** APIs are treated as first-class products with clear ownership, quality, and deprecation paths.

> APIs are products — they have consumers, SLAs, versions, and lifecycles. This dashboard tracks API inventory, lifecycle management, quality, adoption, and deprecation across the entire API portfolio.

## Summary

- 5 API dimensions: API inventory, lifecycle management, API quality, consumer adoption, deprecation & sunset
- APIs classified by type: public (external developers), partner (B2B), private (internal), system (service-to-service)
- Lifecycle tracked through 5 stages: design → beta → GA → deprecated → sunset
- Quality measured by spec compliance, breaking change rate, error rate, and documentation completeness
- Dashboard reviewed monthly; API portfolio review quarterly

## Core viewpoints

- API as product — every API has consumers, and those consumers deserve the same quality as UI users
- Versioning is a promise — breaking changes are a breach of trust; every API version is a contract
- Deprecation is planned, not discovered — APIs should have a deprecation date from the day they go GA
- API sprawl is technical debt — unmanaged APIs accumulate like unmaintained code; every API needs an owner

## Key information

### 5-panel API portfolio overview

```
┌──────────────────────────────────────────────────────────────────┐
│  API INVENTORY                    │  LIFECYCLE MANAGEMENT           │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Total:      42 APIs    │   │  │  Design:      5 (12%)   │   │
│  │  Public:      8 (19%)   │   │  │  Beta:        3 (7%)    │   │
│  │  Partner:     4 (10%)   │   │  │  GA:         28 (67%)   │   │
│  │  Private:    18 (43%)   │   │  │  Deprecated:   4 (10%)  │   │
│  │  System:     12 (29%)   │   │  │  Sunset:       2 (5%)   │   │
│  │  Endpoints: 215 total   │   │  │  Stale (>6mo): 3 APIs   │   │
│  │  Owners:     85% assigned│  │  │  Avg lifecycle: 18 mo   │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  API QUALITY                     │  CONSUMER ADOPTION              │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Spec compliance: 88%   │   │  │  Active consumers: 45   │   │
│  │  Breaking changes: 0/Q  │   │  │  Internal: 32 (71%)     │   │
│  │  Error rate:   0.8%     │   │  │  External:   8 (18%)    │   │
│  │  P95 latency:  180ms    │   │  │  Partner:    5 (11%)    │   │
│  │  Doc coverage: 82%      │   │  │  Top API:    chat/v1    │   │
│  │  OpenAPI 3.1:  72%      │   │  │  Churn risk:  3 APIs    │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### API inventory by domain

| Domain | Public | Partner | Private | System | Total | Endpoints | Owner |
|---|---|---|---|---|---|---|---|
| AI/Chat | 2 | 1 | 4 | 3 | 10 | 52 | AI Team |
| Code Review | 1 | 0 | 3 | 2 | 6 | 28 | AI Team |
| Knowledge Base | 1 | 1 | 3 | 2 | 7 | 35 | Platform |
| User & Auth | 1 | 1 | 2 | 2 | 6 | 30 | Platform |
| Billing & Usage | 1 | 0 | 2 | 1 | 4 | 18 | Platform |
| Notifications | 1 | 0 | 2 | 1 | 4 | 22 | Web |
| Admin & Config | 0 | 1 | 1 | 1 | 3 | 18 | Platform |
| Analytics | 1 | 0 | 1 | 0 | 2 | 12 | Data |
| **Total** | **8** | **4** | **18** | **12** | **42** | **215** | |

### API lifecycle stage by API

| API | Type | Version | Stage | GA date | Deprecation date | Days in stage | Owner |
|---|---|---|---|---|---|---|---|
| Chat API v1 | Public | v1.3 | GA | 2025-09 | — | 335 | AI Lead |
| Chat API v2 | Public | v2.0 | Beta | — | — | 45 | AI Lead |
| Code Review API v1 | Public | v1.2 | GA | 2025-11 | — | 280 | AI Lead |
| Code Review API v2 | Public | v2.0 | Design | — | — | 15 | AI Lead |
| Knowledge Search API | Public | v1.1 | GA | 2026-01 | — | 210 | Platform |
| Knowledge Write API | Private | v1.0 | GA | 2026-02 | — | 170 | Platform |
| Auth API v1 | Partner | v1.5 | GA | 2025-06 | 2026-09 | 425 | Platform |
| Auth API v2 | Partner | v2.0 | Beta | — | — | 60 | Platform |
| User Management API | Private | v1.2 | GA | 2025-08 | — | 365 | Platform |
| Billing API | Public | v1.1 | GA | 2026-03 | — | 150 | Platform |
| Usage Metering API | System | v1.0 | GA | 2026-01 | — | 210 | Platform |
| Notification API | Private | v1.0 | GA | 2026-04 | — | 120 | Web |
| Webhook API | Public | v1.0 | GA | 2026-05 | — | 90 | Web |
| Admin API | Private | v1.3 | GA | 2025-07 | — | 395 | Platform |
| Analytics API | Partner | v1.0 | GA | 2026-02 | — | 170 | Data |
| File Upload API | System | v1.1 | GA | 2025-10 | — | 300 | Platform |
| Search Index API | System | v1.0 | GA | 2025-11 | — | 270 | Platform |
| Model Inference API | System | v1.2 | GA | 2025-09 | 2026-09 | 335 | AI Lead |
| Legacy Chat API v0 | Private | v0.9 | Deprecated | 2024-06 | 2026-06 | 30 (past) | AI Lead |
| Legacy Auth v0 | System | v0.8 | Sunset | 2024-03 | 2026-03 | 150 (past) | Platform |
| Old Search API | Private | v0.7 | Deprecated | 2024-09 | 2026-08 | 30 | Platform |
| Old Notification API | Private | v0.6 | Sunset | 2024-01 | 2026-04 | 120 (past) | Web |

### API quality scorecard

| Quality dimension | Excellent (≥90%) | Good (80-89%) | Fair (70-79%) | Poor (<70%) | Overall |
|---|---|---|---|---|---|
| OpenAPI spec compliance | 18 APIs | 14 APIs | 7 APIs | 3 APIs | 88% |
| Error rate (< 1%) | 22 APIs | 12 APIs | 5 APIs | 3 APIs | 91% |
| P95 latency (< 200ms) | 20 APIs | 10 APIs | 8 APIs | 4 APIs | 85% |
| Documentation coverage | 15 APIs | 12 APIs | 10 APIs | 5 APIs | 82% |
| Versioning compliance | 28 APIs | 8 APIs | 4 APIs | 2 APIs | 92% |
| Rate limiting in place | 25 APIs | 8 APIs | 5 APIs | 4 APIs | 88% |
| Authentication/authorization | 35 APIs | 5 APIs | 2 APIs | 0 APIs | 96% |
| Error response standardization | 20 APIs | 10 APIs | 8 APIs | 4 APIs | 84% |
| **Overall quality** | | | | | **88%** |

### Breaking change log

| Date | API | Change | Impact | Consumers notified | Migration window | Status |
|---|---|---|---|---|---|---|
| 2026-07 | Chat API v1 | Response schema: `message` → `content` | 8 consumers | 30 days prior | 60 days | Resolved |
| 2026-05 | Auth API v1 | Token format: JWT → opaque | 5 consumers | 45 days prior | 90 days | In progress |
| 2026-03 | Knowledge Search | Query param: `q` → `query` | 3 consumers | 14 days prior | 30 days | Resolved |
| 2025-12 | Billing API | Rate limit: 100 → 50 req/s | 2 consumers | 7 days prior | 14 days | Resolved |

### Consumer adoption & usage

| API | Active consumers | Calls/day | Growth (30d) | Top consumer | Churn risk |
|---|---|---|---|---|---|
| Chat API v1 | 12 | 2.4M | +8% | YiVad (45%) | Low — v2 migration pending |
| Chat API v2 (beta) | 3 | 120K | +45% | YiVad (60%) | N/A — beta |
| Code Review API v1 | 8 | 850K | +5% | YiVad (55%) | Low |
| Knowledge Search API | 6 | 1.2M | +12% | YiVad (40%) | Low |
| Auth API v1 | 5 | 3.1M | +2% | All projects | **Medium — v2 migration** |
| Auth API v2 (beta) | 2 | 200K | +35% | YiVad (70%) | N/A — beta |
| Billing API | 2 | 50K | +3% | YiVad (80%) | Low |
| Webhook API | 4 | 180K | +18% | External (3) | Low |
| Analytics API | 3 | 95K | +8% | Executive dashboard | Low |
| Model Inference API | 4 | 1.8M | -5% | YiAi (70%) | **Medium — deprecated** |
| Legacy Chat API v0 | 2 | 45K | -60% | Legacy clients | **High — past sunset** |

### API deprecation pipeline

| API | Deprecation announced | Sunset date | Days remaining | Active consumers | Migration path | Risk |
|---|---|---|---|---|---|---|
| Model Inference API | 2026-03 | 2026-09-30 | 55 | 4 | Migrate to Chat API v2 | Medium |
| Legacy Chat API v0 | 2025-09 | 2026-06-30 | **Overdue** | 2 | Migrate to Chat API v1 | **High** |
| Old Search API | 2026-05 | 2026-08-31 | 25 | 1 | Migrate to Knowledge Search API | Low |
| Auth API v1 | 2026-06 | 2026-09-30 | 55 | 5 | Migrate to Auth API v2 | Medium |
| Old Notification API | 2025-10 | 2026-04-30 | **Overdue** | 0 | Migrate to Notification API | Low |

### API documentation health

| API | OpenAPI spec | Version | Interactive docs | Examples | Changelog | Score |
|---|---|---|---|---|---|---|
| Chat API v1 | 3.1 | v1.3 | Yes | 8 | Yes | 95% |
| Chat API v2 | 3.1 | v2.0-beta | Yes | 5 | Yes | 85% |
| Code Review API v1 | 3.0 | v1.2 | Yes | 6 | Yes | 90% |
| Knowledge Search API | 3.1 | v1.1 | Yes | 4 | No | 78% |
| Auth API v1 | 2.0 | v1.5 | No | 3 | Yes | 65% |
| Auth API v2 | 3.1 | v2.0-beta | Yes | 4 | Yes | 88% |
| Billing API | 3.0 | v1.1 | Yes | 5 | Yes | 85% |
| Webhook API | 3.1 | v1.0 | Yes | 8 | Yes | 92% |
| Legacy Chat API v0 | None | v0.9 | No | 2 | No | 20% |
| **Overall** | **72% on 3.1** | | | | | **82%** |

### API version policy compliance

| Policy | Compliant | Non-compliant | % |
|---|---|---|---|
| Semantic versioning (MAJOR.MINOR.PATCH) | 38 | 4 | 90% |
| Deprecation notice ≥ 90 days | 5 of 7 | 2 | 71% |
| Sunet date communicated at GA | 18 of 28 | 10 | 64% |
| Breaking change migration guide | 4 of 4 | 0 | 100% |
| Backward compatibility ≥ 2 versions | 35 | 7 | 83% |
| Version in URL path (not header) | 40 | 2 | 95% |
| **Overall policy compliance** | | | **84%** |

## Action recommendations

1. **Decommission overdue sunsets**: Legacy Chat API v0 (2 years past sunset) and Old Notification API; force-decommission within 30 days
2. **Auth API migration**: v1 → v2 has 5 consumers, 55 days remaining; accelerate migration, weekly check-ins with consuming teams
3. **Model Inference API deprecation**: -5% growth, 4 consumers, 55 days to sunset; migrate to Chat API v2, add inference endpoint
4. **OpenAPI 3.1 upgrade**: 72% on 3.1; migrate Auth API v1 (2.0), Code Review API v1 (3.0), and Billing API (3.0)
5. **Sunset-at-GA policy**: 64% compliance; mandate sunset date at GA for all new APIs, backfill for 10 existing GAs
6. **Documentation gaps**: 82% → 90%; add changelog to Knowledge Search, upgrade Auth API v1 docs, add examples to 5 APIs
7. **API owner assignment**: 85% assigned → 100%; 6 APIs without clear owners; assign within 2 weeks
8. **Rate limiting coverage**: 88% → 100%; 5 APIs without rate limits; add tiered rate limiting
9. **Monthly API portfolio review**: review lifecycle, deprecation progress, consumer health, and quality scores
10. **API consumer NPS survey**: survey top 10 API consumers; target NPS > 40



- API sprawl → creating a new API for every microservice without portfolio management; every API is a product with a lifecycle
- Versionless APIs → "we'll just keep adding to v1"; without versioning, every change is a potential breaking change
- Sunset without migration → deprecating an API without a clear migration path; deprecation = migration guide + tooling + timeline
- Internal API neglect → "it's internal, quality doesn't matter"; internal APIs become external when the team grows
- Documentation as afterthought → writing docs after the API is built; spec-first development ensures quality and consistency

## Related

- Same class: [dashboard-product-portfolio](../metrics/dashboard-product-portfolio.md) — product metrics
- Same class: [dashboard-product-delivery](../../delivery/dashboard-product-delivery.md) — delivery execution
- Same class: [dashboard-architecture-health](../../../engineer/architecture-design/dashboard-architecture-health.md) — architecture health
- References: Google — *API Design Guide*; Stripe — *API Versioning Best Practices*; Postman — *State of the API Report*; JSON:API; OpenAPI 3.1 Specification