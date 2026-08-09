---
title: api design quality dashboard
aliases:
- API design dashboard
- API quality dashboard
- API governance dashboard
- API consistency dashboard
tags:
- dashboard
- api-design
- api-governance
- api-quality
- rest-api
- graphql
- grpc
- breaking-changes
category: engineer/architecture-design
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: dashboard
status: stable
lifecycle: active
review_cycle: weekly
roles:
- engineer
- tech-lead
- product-manager
benefit: API design quality, consistency, and governance visible at a glance
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
- design consistency, breaking changes, versioning health, documentation quality, performance, and security posture defined
related:
- ./dashboard-architecture-health.md
- ../quality-security/dashboard-api-security.md
- ../quality-security/dashboard-code-quality.md
- ../process/dashboard-code-review-health.md
- ../../product-manager/discovery/prd--dashboard-api-portfolio.md
tacit: false
---

# api design quality dashboard

> **As an** engineer, **I want to** track API design quality across all services, **so that** every API is consistent, well-documented, backward-compatible, performant, and secure — turning API design from "every team does their own thing" into a governed, measured, and continuously improving API platform.

> APIs are the contracts between services and teams. This dashboard tracks design consistency, breaking changes, versioning health, documentation quality, API performance, and security posture — turning API quality from a subjective code review opinion into an objective, enforced, and continuously improving engineering discipline.

## Summary

- 6 API design dimensions: design consistency, breaking changes, versioning health, documentation quality, API performance, security posture
- 285 API endpoints across 22 services; 3 API styles: REST (185), GraphQL (45), gRPC (55); 8 API versions in active use
- Design consistency: 78% adherence to API design guidelines; 285 linter rules; 52 guideline violations; 12 naming inconsistencies; 8 inconsistent error formats
- Breaking changes: 85 breaking changes detected in last 90 days; 12 unintentional (14%); 3 production incidents caused by breaking changes; 28 deprecated but not removed
- Documentation quality: 82% of endpoints documented; 65% with examples; 45% with error codes; 8 undocumented endpoints in production; OpenAPI 3.1 coverage: 72%
- Dashboard reviewed weekly; API design review with tech leads biweekly

## Core viewpoints

- API design is a team sport, not an individual art — every API decision (naming, pagination, error format, versioning) affects every consumer; consistency across APIs is more important than any individual API's "perfect" design
- Breaking changes are the most expensive bugs — a breaking change to a public API can break every mobile app, every third-party integration, and every internal service that depends on it; the cost of a breaking change is not the code change, it's the cascading failures
- Documentation is part of the API contract — an undocumented API is a private API, regardless of whether it's technically accessible; if consumers can't discover, understand, and test an API, it doesn't exist
- API versioning is a promise, not a version number — every active API version is a commitment to maintain, patch, and support; the goal is not to have many versions, it's to have as few as possible while maintaining backward compatibility

## Key information

### 6-panel API design quality overview

```
┌──────────────────────────────────────────────────────────────────┐
│  DESIGN CONSISTENCY                  │  BREAKING CHANGES                    │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Guideline adherence:78% │   │  │  Breaking changes: 85    │   │
│  │  Linter rules: 285       │   │  │  Unintentional: 12 (14%) │   │
│  │  Violations: 52          │   │  │  Incidents caused: 3     │   │
│  │  Naming inconsistencies: │   │  │  Deprecated not removed: │   │
│  │  12 (5 services)         │   │  │  28 endpoints (tech debt)│   │
│  │  Error format issues: 8  │   │  │  Breaking change review: │   │
│  │  Pagination style: 3     │   │  │  72% caught pre-merge    │   │
│  │  different patterns      │   │  │  Breaking score: C+ (68) │   │
│  │  Consistency score: B(78)│   │  │                           │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  VERSIONING HEALTH                   │  DOCUMENTATION QUALITY               │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Active versions: 8      │   │  │  Documented: 82% (234)  │   │
│  │  Deprecated: 5 versions  │   │  │  With examples: 65%     │   │
│  │  Sunset planned: 3       │   │  │  With error codes: 45%  │   │
│  │  Avg endpoints/version:  │   │  │  OpenAPI 3.1: 72% cov   │   │
│  │  35.6 (too many)         │   │  │  Undocumented: 8 (prod) │   │
│  │  Version sprawl: 2.5×    │   │  │  Doc freshness: 85%     │   │
│  │  Versioning score: B(78) │   │  │  Doc score: C+ (68)     │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  API PERFORMANCE                     │  API SECURITY POSTURE                │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  P50 latency: 85ms       │   │  │  Auth coverage: 96%      │   │
│  │  P95 latency: 320ms      │   │  │  Rate limited: 78%       │   │
│  │  P99 latency: 850ms      │   │  │  Input validation: 92%   │   │
│  │  Error rate: 0.8%        │   │  │  OWASP API Top 10: 85%  │   │
│  │  Timeout rate: 1.2%      │   │  │  Token expiry: 85% conf  │   │
│  │  N+1 queries: 18 APIs    │   │  │  Sensitive data exposure:│   │
│  │  Performance: B (78)     │   │  │  5 endpoints flagged     │   │
│  └─────────────────────────┘   │  │  Security score: B+ (82) │   │
│                                │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### API design consistency by service

| Service | Endpoints | Guideline score | Naming issues | Error format | Pagination | HTTP method usage | Overall |
|---|---|---|---|---|---|---|---|
| **YiVad Core** | 42 | 85% | 2 | Standard | Cursor-based | RESTful (correct) | A- (88) |
| **YiAi Agents** | 28 | 72% | 3 | Custom (non-standard) | Offset-based | Mixed (some POST for GET) | C+ (68) |
| **YiWeb API** | 35 | 80% | 1 | Standard | Cursor-based | RESTful (correct) | B+ (85) |
| **Auth Service** | 8 | 95% | 0 | Standard | N/A | RESTful (correct) | A (92) |
| **Payment Service** | 12 | 78% | 2 | Standard | Offset-based | RESTful (correct) | B (80) |
| **Notification** | 15 | 65% | 3 | 3 different formats | Mixed | Inconsistent (RPC-style) | D (58) |
| **Search Service** | 10 | 88% | 0 | Standard | Cursor-based | RESTful (correct) | A- (90) |
| **Data Pipeline** | 18 | 55% | 4 | Custom + 2 legacy | 2 patterns | RPC-style throughout | D (55) |
| **API Gateway** | 52 | 90% | 1 | Standard | Cursor-based | RESTful (correct) | A- (88) |
| **Other (13 services)** | 65 | 72% | 4 | Mixed | Mixed | Mixed | B- (72) |

### Top API design violations

| Violation | Services affected | Severity | Consumer impact | Fix effort | Action |
|---|---|---|---|---|---|
| **Inconsistent error response format** | 8 services | High | Consumers need 8 different error parsers | 2 weeks | Adopt RFC 7807 Problem Details |
| **POST for read operations** | 5 services | Medium | Caching impossible, violates HTTP semantics | 1 week | Convert to GET with query params |
| **Mixed pagination styles** | 6 services | Medium | Consumers implement 3 pagination patterns | 2 weeks | Standardize on cursor-based pagination |
| **Inconsistent field naming** (snake_case vs camelCase) | 4 services | Medium | Confusion, data mapping errors | 3 days | Adopt camelCase, add snake_case alias |
| **No request ID in response** | 12 services | High | Distributed tracing broken | 1 week | Add X-Request-ID header to all responses |
| **Missing rate limit headers** | 15 services | Medium | Consumers can't implement backoff | 1 week | Add X-RateLimit-* headers |
| **Nested resources > 3 levels deep** | 3 services | Low | Complex client code, hard to cache | 1 week | Flatten or use GraphQL for deep queries |
| **Boolean query params as strings** ("true") | 6 services | Low | Type confusion in strongly-typed clients | 2 days | Accept boolean literals |

### Breaking change detection

| Change type | Total (90d) | Unintentional | Caught pre-merge | Incidents | Example | Prevention |
|---|---|---|---|---|---|---|
| **Field removal** | 28 | 5 | 78% | 2 | `user.name` removed from GET /users response | Schema diff in CI, deprecation first |
| **Field type change** | 18 | 3 | 82% | 1 | `price` changed from string to number | Type contract testing, OpenAPI diff |
| **Endpoint removal** | 8 | 0 | 100% | 0 | DELETE /api/v1/search removed | Deprecation window, sunset header |
| **Auth requirement change** | 12 | 2 | 85% | 0 | Endpoint now requires admin scope | Security review, auth contract test |
| **Response structure change** | 10 | 1 | 90% | 0 | Response wrapped in `{data: ...}` envelope | Response schema testing |
| **Rate limit change** | 5 | 1 | 60% | 0 | Rate limit reduced from 1000 to 100/min | Communicate to consumers, gradual rollout |
| **Default value change** | 4 | 0 | 100% | 0 | Default `page_size` changed from 20 to 50 | Document defaults, version bump |
| **Overall** | **85** | **12 (14%)** | **72%** | **3** | | |

### Versioning health

| API version | Endpoints | Status | Age | Consumers | Deprecation date | Sunset date | Migration progress |
|---|---|---|---|---|---|---|---|
| **v1** (legacy REST) | 42 | Deprecated | 4.5 years | 85 (declining) | 2025-06-01 | 2026-12-31 | 62% migrated to v2 |
| **v2** (current REST) | 85 | Active | 2 years | 185 (growing) | — | — | N/A |
| **v3** (next REST) | 12 | Beta | 3 months | 8 (early adopters) | — | — | N/A |
| **GraphQL v1** | 45 | Active | 1.5 years | 42 (growing) | — | — | N/A |
| **gRPC v1** (internal) | 55 | Active | 2 years | 22 services | — | — | N/A |
| **gRPC v2** (internal) | 18 | Active | 6 months | 5 services | — | — | N/A |
| **Mobile API v1** | 28 | **Deprecated** | 3 years | 12 (forcing sunset) | 2026-01-01 | 2026-09-30 | 85% migrated |
| **Webhook API v1** | 15 | Active | 1 year | 28 | — | — | N/A |

### Documentation quality

| Documentation metric | Current | Target | Gap | Action |
|---|---|---|---|---|
| **OpenAPI/Swagger coverage** | 72% (205/285) | 95% | 80 endpoints | Generate from code annotations, add to CI |
| **Endpoints with examples** | 65% (185/285) | 90% | 100 endpoints | Add request/response examples to all endpoints |
| **Error codes documented** | 45% (128/285) | 85% | 157 endpoints | Document all possible error responses |
| **Authentication documented** | 88% (251/285) | 100% | 34 endpoints | Add auth requirements to every endpoint |
| **Rate limits documented** | 52% (148/285) | 90% | 137 endpoints | Add rate limit info to OpenAPI spec |
| **Deprecation notices** | 75% (21/28 deprecated) | 100% | 7 endpoints | Add Sunset header, deprecation notice |
| **Documentation freshness** | 85% (updated < 30 days) | 95% | Stale docs | Add doc freshness check to CI |
| **Undocumented endpoints** | 8 in production | 0 | 8 endpoints | Document or remove, add enforcement |

### API performance by endpoint pattern

| Pattern | Endpoints | P50 | P95 | P99 | Error rate | Timeout rate | N+1 risk | DB queries avg |
|---|---|---|---|---|---|---|---|---|
| **Simple CRUD** (GET by ID) | 85 | 25ms | 85ms | 180ms | 0.2% | 0.1% | Low | 1.2 |
| **List with filters** | 52 | 65ms | 220ms | 550ms | 0.5% | 0.8% | Medium | 3.5 |
| **Nested resource** (parent/child) | 28 | 95ms | 380ms | 1.2s | 1.2% | 2.0% | High | 8.5 |
| **Search/query** | 18 | 125ms | 520ms | 1.8s | 1.5% | 2.5% | Medium | 12.0 |
| **Batch/bulk** | 22 | 280ms | 1.2s | 3.5s | 2.0% | 3.5% | High | 25.0 |
| **Aggregation/report** | 15 | 450ms | 2.5s | 6.0s | 2.5% | 4.0% | High | 35.0 |
| **Real-time/streaming** | 12 | 15ms | 55ms | 120ms | 0.3% | 0.5% | Low | 2.0 |
| **Webhook callback** | 8 | 85ms | 320ms | 850ms | 0.8% | 1.0% | Low | 3.0 |

### API security posture

| Security control | Coverage | Endpoints missing | Risk | Action |
|---|---|---|---|---|
| **Authentication required** | 96% (274/285) | 11 (health checks, public) | Low | Review public endpoints, add auth where needed |
| **Authorization (RBAC)** | 88% (251/285) | 34 (coarse-grained) | Medium | Implement fine-grained RBAC, add scope checks |
| **Rate limiting** | 78% (222/285) | 63 (no rate limit) | High | Add rate limiting to all authenticated endpoints |
| **Input validation** | 92% (262/285) | 23 (trusting client input) | High | Add JSON Schema validation, sanitize inputs |
| **Output filtering** | 72% (205/285) | 80 (returning all fields) | Medium | Implement field-level access control, sparse fieldsets |
| **HTTPS only** | 100% (285/285) | 0 | — | Excellent |
| **Token expiry < 24h** | 85% (242/285) | 43 (long-lived tokens) | Medium | Shorten token TTL, implement refresh tokens |
| **OWASP API Top 10 2023** | 85% compliant | 42 findings | High | Fix top 10 findings, add security linting to CI |

## Action recommendations

1. **Breaking change prevention**: 14% unintentional breaking changes, 3 incidents; add OpenAPI diff to CI, block breaking changes without deprecation, target 0 unintentional breaking changes
2. **Error format standardization**: 8 services with different error formats; adopt RFC 7807 Problem Details across all services, add linting rule for error format, target 100% compliance
3. **Pagination standardization**: 3 different pagination patterns; standardize on cursor-based pagination, add pagination linter, migrate offset-based APIs over 6 months
4. **Documentation gap closure**: 82% documented, 8 undocumented in production; add OpenAPI generation to CI, block deploy without documentation, target 95% documentation coverage
5. **Undocumented endpoint elimination**: 8 undocumented endpoints in production; audit all endpoints, document or remove, add endpoint discovery and documentation enforcement
6. **API version cleanup**: 5 deprecated versions, 3 with sunset dates; accelerate v1 migration (62%→100%), enforce sunset dates, target 2 active REST versions max
7. **N+1 query elimination**: 18 APIs with N+1 risk; add eager loading, DataLoader for GraphQL, batch endpoints, query complexity analysis, target < 5 N+1 APIs
8. **Rate limit coverage**: 78% rate limited; add rate limiting to all endpoints, implement standard rate limit headers, add consumer-specific rate limits
9. **API design review process**: currently ad-hoc; implement API design review before implementation, add API linting to pre-commit, create API change advisory board
10. **Weekly API quality review**: review design consistency, breaking changes, versioning, documentation, performance, and security with engineering leads



- The "we'll document it later" trap → shipping an API without documentation and promising to document it later; "later" never comes, and 6 months later the original author has left and nobody knows what the `status` field's possible values are
- Versioning as a fix for bad design → creating a new API version instead of designing backward-compatible changes; v1, v2, v3, v4 — each with slight differences — is version sprawl, not versioning; every version is a maintenance burden forever
- The internal API double standard → applying strict design standards to public APIs but letting internal APIs be "whatever works"; internal APIs become public APIs when the company grows, and the mess you made internally becomes the mess your customers inherit
- POST-as-everything → using POST for every operation because "it's simpler"; POST /getUser, POST /updateUser, POST /deleteUser — this is RPC over HTTP, not REST, and it breaks every HTTP caching layer, CDN, and monitoring tool
- Success response with error body → returning HTTP 200 with `{"error": "something went wrong"}` in the body; HTTP status codes exist for a reason — monitoring tools, load balancers, and CDNs can't parse JSON bodies to determine if a request succeeded

## Related

- Same class: [dashboard-architecture-health](dashboard-architecture-health.md) — architecture health
- Same class: [dashboard-api-security](../quality-security/dashboard-api-security.md) — API security
- Same class: [dashboard-code-quality](../quality-security/dashboard-code-quality.md) — code quality
- Same class: [dashboard-code-review-health](../process/dashboard-code-review-health.md) — code review health
- Same class: [dashboard-api-portfolio](../../product-manager/discovery/prd--dashboard-api-portfolio.md) — API portfolio
- References: Google — *API Design Guide*; Microsoft — *REST API Guidelines*; Stripe — *API Design Standards*; Zalando — *RESTful API Guidelines*; JSON:API — *Specification*; OpenAPI — *3.1 Specification*; Phil Sturgeon — *Build APIs You Won't Hate*