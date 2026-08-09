---
title: API security dashboard
aliases:
- API security posture dashboard
- API threat protection dashboard
- OWASP API security dashboard
tags:
- dashboard
- api-security
- owasp-api
- authentication
- authorization
- rate-limiting
- waf
- token-security
category: engineer/quality-security
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: dashboard
status: stable
lifecycle: active
review_cycle: weekly
roles:
- security-engineer
- tech-lead
- engineer
benefit: API security posture and threat protection visible at a glance
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
- API inventory, authn/z, rate limiting, WAF, token security, and OWASP API Top 10 compliance defined
related:
- ./dashboard-security-posture.md
- ./dashboard-vulnerability-management.md
- ./dashboard-identity-access-management.md
- ../../oncall-sre/observability/dashboard-network-health.md
- ../../product-manager/discovery/prd--dashboard-api-portfolio.md
tacit: false
---

# API security dashboard

> **As a** security engineer, **I want to** track API security posture across all internal and external APIs, **so that** every API endpoint is authenticated, authorized, rate-limited, and protected against the OWASP API Top 10 threats.

> APIs are the front door to your data — and the #1 attack surface in modern applications. This dashboard tracks API inventory, authentication and authorization coverage, rate limiting effectiveness, WAF protection, token security, and OWASP API Top 10 compliance — turning API security from a reactive patching exercise into a continuously measured security capability.

## Summary

- 6 API security dimensions: API inventory, authentication/authorization, rate limiting, WAF protection, token security, OWASP API Top 10 posture
- 285 API endpoints across 42 services: 128 external (public/partner), 157 internal; 18 deprecated but still active
- Authentication coverage: 96% (274/285); 11 unauthenticated endpoints (5 legacy, 3 health checks, 3 undocumented)
- Rate limiting: 82% of external endpoints protected; 15 rate-limit bypass incidents in last 6 months; 3 API keys with no rate limit
- WAF coverage: 92% of external endpoints; 45,000 attacks blocked/month; 12 WAF bypass incidents in 6 months
- 8 active API tokens with excessive scope; 32 tokens not rotated in > 365 days; 0 API security incidents requiring disclosure in last 12 months
- Dashboard reviewed weekly; API security deep-dive monthly with security and platform teams

## Core viewpoints

- APIs are the new perimeter — the network firewall is irrelevant when your data is accessible through REST, GraphQL, and gRPC endpoints; every API endpoint is a potential breach point
- Authentication is not authorization — proving who you are is not the same as proving you should access this resource; broken object-level authorization (BOLA) is the #1 API vulnerability
- Rate limiting is a security control, not a performance control — rate limiting protects against brute force, credential stuffing, scraping, and DoS; an API without rate limiting is an API inviting abuse
- Token security is credential security — API keys, JWTs, and OAuth tokens are credentials; they need the same lifecycle management as passwords: rotation, revocation, and least-privilege scope

## Key information

### 6-panel API security overview

```
┌──────────────────────────────────────────────────────────────────┐
│  API INVENTORY                     │  AUTHENTICATION & AUTHORIZATION      │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Endpoints: 285 total    │   │  │  Auth coverage: 96%      │   │
│  │  External: 128 (45%)     │   │  │  Unauthenticated: 11     │   │
│  │  Internal: 157 (55%)     │   │  │  OAuth 2.0: 185 (65%)    │   │
│  │  Deprecated: 18 active   │   │  │  API Key: 72 (25%)       │   │
│  │  Shadow/undocumented: 8  │   │  │  mTLS: 18 (6%)           │   │
│  │  Avg endpoints/service: 6.8│  │  │  No auth: 11 (4%)        │   │
│  │  API discovery: 92%      │   │  │  BOLA findings: 15 (6mo) │   │
│  │  Inventory score: B+     │   │  │  Auth score: B+ (84)     │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  RATE LIMITING                     │  WAF PROTECTION                     │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Ext endpoints w/RL: 82%│   │  │  WAF coverage: 92% ext    │   │
│  │  Bypass incidents: 15    │   │  │  Attacks blocked: 45K/mo │   │
│  │  No rate limit: 3 keys   │   │  │  WAF bypass: 12 (6mo)    │   │
│  │  Rate limit hits: 28K/day│   │  │  False positives: 0.8%   │   │
│  │  Throttling events: 850/d│   │  │  Rule coverage: 78%      │   │
│  │  Abuse reports: 22/mo    │   │  │  Custom rules: 45         │   │
│  │  Rate limit score: B     │   │  │  WAF score: B (80)       │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  TOKEN SECURITY                    │  OWASP API TOP 10                   │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Active tokens: 1,850    │   │  │  Compliant: 72%          │   │
│  │  Excessive scope: 8      │   │  │  Partial: 20%            │   │
│  │  Not rotated >365d: 32   │   │  │  Non-compliant: 8%       │   │
│  │  JWT expiry: 88% < 1hr   │   │  │  BOLA/IDOR risk: 12 APIs │   │
│  │  Revoked: 45 (last 30d)  │   │  │  Mass assignment: 8 APIs │   │
│  │  Leaked tokens: 3 (6mo)  │   │  │  Injection risk: 5 APIs  │   │
│  │  Token health: B- (72)   │   │  │  OWASP score: B (78)     │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### API inventory

| API category | Endpoints | Services | External | Internal | Deprecated | Undocumented | Avg age |
|---|---|---|---|---|---|---|---|
| **Core business APIs** | 85 | 12 | 52 | 33 | 5 | 2 | 18 months |
| **Partner/integration APIs** | 48 | 8 | 42 | 6 | 3 | 1 | 22 months |
| **Internal service APIs** | 72 | 10 | 0 | 72 | 4 | 0 | 14 months |
| **Admin/management APIs** | 35 | 5 | 12 | 23 | 2 | 3 | 28 months |
| **Webhook callbacks** | 22 | 4 | 22 | 0 | 0 | 0 | 10 months |
| **Mobile-specific APIs** | 18 | 2 | 0 | 18 | 2 | 0 | 16 months |
| **Legacy/v1 APIs** | 5 | 1 | 0 | 5 | 2 | 2 | 42 months |
| **Total** | **285** | **42** | **128** | **157** | **18** | **8** | |

### Shadow and undocumented API detection

| Endpoint | Service | Discovered | Traffic/day | Auth | Exposure | Risk | Action |
|---|---|---|---|---|---|---|---|
| /api/v1/internal/export/all | Legacy export | 2026-07-15 | 850 | No auth | Internal | Critical | Add auth or decommission |
| /admin/debug/config | Admin panel | 2026-06-20 | 120 | Weak (shared key) | Internal | High | Migrate to OAuth, restrict IP |
| /graphql (unregistered) | Experimentation | 2026-06-10 | 2,200 | No auth | Internal | Critical | Register in gateway, add auth |
| /api/health/detailed | Monitoring | 2026-05-28 | 45,000 | No auth | Internal | Medium | Add internal-only auth |
| /v1/users/bulk (legacy) | User service | 2026-05-15 | 350 | API key (no scope) | Internal | High | Add scope, rate limit |
| /internal/metrics/raw | Observability | 2026-04-22 | 85,000 | No auth | Internal | Medium | Add service-account auth |
| /partner/sync/legacy | Partner API | 2026-04-10 | 180 | Expired API key | External | High | Update auth, notify partner |
| /backup/config/download | DevOps tools | 2026-03-05 | 25 | No auth | Internal | Critical | Immediate decommission |

### Authentication and authorization coverage

| Auth method | Endpoints | % | External | Internal | Config issues | Score |
|---|---|---|---|---|---|---|
| **OAuth 2.0 + JWT** (Bearer) | 185 | 65% | 95 | 90 | 8 (scope too broad) | B+ (85) |
| **API Key** (header) | 72 | 25% | 28 | 44 | 12 (no rotation) | B (78) |
| **mTLS** (certificate) | 18 | 6% | 5 | 13 | 2 (expiring certs) | A- (88) |
| **No authentication** | 11 | 4% | 1 | 10 | 11 (all) | F (25) |
| **Total** | **285** | | **128** | **157** | | **B+ (84)** |

### Unauthenticated endpoints — risk assessment

| Endpoint | Service | Auth missing | Exposure | Data exposed | Risk | Justification | Action |
|---|---|---|---|---|---|---|---|
| /api/health | API Gateway | None | External | None | Low | Valid (health check) | Keep, monitor |
| /api/health/ready | All services | None | Internal | None | Low | Valid (k8s readiness) | Keep, monitor |
| /api/status | Status page | None | External | Service status | Low | Valid (public status) | Keep, IP rate limit |
| /api/v1/config/public | Config service | None | External | Feature flags | Medium | Should be auth'd | Add OAuth, review data |
| /legacy/export/csv | Legacy export | None | Internal | All user data | Critical | Legacy, forgotten | Add auth immediately |
| /graphql (unregistered) | Experimentation | None | Internal | User behavior data | Critical | Shadow API | Register, add auth, audit |
| /admin/debug/logs | Admin panel | Shared key | Internal | Debug logs with PII | High | Weak shared key | Migrate to OAuth + IP whitelist |
| /internal/metrics/raw | Observability | None | Internal | System metrics | Medium | Intended internal-only | Add service account auth |
| /backup/config/download | DevOps tools | None | Internal | Config with secrets | Critical | Mistake | Immediate decommission |
| /v1/health/detailed | Legacy monolith | None | Internal | Server details | Medium | Legacy | Add internal auth or deprecate |
| /api/events/ingest | Event pipeline | None | External | Event data | High | Partner API, missed | Add API key + signature verification |

### Authorization — BOLA/IDOR findings

| API | Finding | Severity | Discovery | Status | Objects affected | Remediation |
|---|---|---|---|---|---|---|
| GET /api/users/{id}/profile | IDOR — access any user profile | Critical | Pen test | Fixed | 285K users | Object-level ownership check |
| GET /api/orders/{id} | BOLA — view any order | Critical | Bug bounty | Fixed | 1.2M orders | Order ownership verification |
| PATCH /api/teams/{id}/members | BOLA — modify any team | High | Internal audit | Fixed | 85 teams | Team membership check |
| DELETE /api/files/{id} | IDOR — delete any file | Critical | Pen test | Fixed | 450K files | File ownership + soft delete |
| GET /api/reports/{id}/export | BOLA — export any report | High | Code review | In progress | 28K reports | Add report ACL check |
| POST /api/projects/{id}/invite | BOLA — invite to any project | High | Bug bounty | Fixed | 850 projects | Project membership check |
| GET /api/invoices/{id}/pdf | IDOR — view any invoice | Critical | Internal audit | In progress | 85K invoices | Invoice ownership + audit log |
| GET /api/analytics/{org}/data | BOLA — view any org analytics | Critical | Pen test | Fixed | 1,500 orgs | Org-level access control |

### Rate limiting coverage

| API group | Endpoints | Rate limited | Limit type | Limit value | Bypass incidents | Abuse rate | Health |
|---|---|---|---|---|---|---|---|
| **Public API** | 52 | 48 (92%) | Per-key + IP | 100 req/s | 3 | 2.5% | B+ (85) |
| **Partner API** | 42 | 38 (90%) | Per-partner | 500 req/s | 2 | 1.8% | B+ (84) |
| **Mobile API** | 18 | 15 (83%) | Per-device | 50 req/s | 4 | 4.2% | B (78) |
| **Webhook receivers** | 22 | 0 (0%) | None | N/A | 0 | 0% | C (65) |
| **Internal service** | 72 | 55 (76%) | Per-service | 1000 req/s | 6 | 1.2% | B (76) |
| **Admin API** | 23 | 12 (52%) | Per-user + IP | 20 req/s | 0 | 0.5% | C (62) |
| **GraphQL** | 8 | 5 (63%) | Query complexity | 1000 pts/call | 3 | 5.5% | C (60) |
| **Overall** | **237** | **173 (82%)** | | | **15** | **2.2%** | **B (78)** |

### Rate limit bypass incidents (last 6 months)

| Incident | API | Date | Method | Requests | Impact | Root cause | Fix |
|---|---|---|---|---|---|---|---|
| IP rotation bypass | Public API | 2026-07-22 | 500+ IPs | 850K | Credential stuffing attempt | IP-based limit only | Add per-key rate limit |
| GraphQL query complexity | GraphQL | 2026-07-10 | Deep nested query | 120K | DB CPU spike | No query depth limit | Add query complexity scoring |
| Batch endpoint abuse | Public API | 2026-06-28 | Batch of 50 | 200K | Resource exhaustion | Batch endpoint not rate limited | Add batch rate limit |
| Token farming | Partner API | 2026-06-15 | 25 API keys | 450K | Data scraping | Partner created 25 keys | Per-partner aggregate limit |
| Header spoofing | Internal API | 2026-05-20 | Spoofed X-Forwarded-For | 85K | Internal service overload | Trusted header from internal | mTLS for internal rate limiting |
| Slowloris on API | Mobile API | 2026-05-05 | Slow connections | N/A | Connection pool exhaustion | No connection timeout | Add connection rate limit |
| WebSocket upgrade | Public API | 2026-04-18 | WebSocket floods | 500K | Gateway memory spike | WebSocket not rate limited | Add WebSocket rate limiting |
| Retry amplification | Internal API | 2026-04-02 | 5× retry per request | 350K | Cascade failure | No retry budget | Add per-service retry budget |

### WAF protection

| WAF metric | Current | 3 months ago | Target | Notes |
|---|---|---|---|---|
| **External endpoint coverage** | 92% (118/128) | 88% | 100% | 10 endpoints not behind WAF |
| **Attacks blocked** (30-day) | 45,000 | 38,000 | — | 92% block rate, 8% allowed |
| **WAF bypass incidents** (6 mo) | 12 | 8 | 0 | 4 were SQL injection, 3 XSS, 5 others |
| **False positive rate** | 0.8% | 1.2% | < 0.5% | 360 legitimate requests blocked/day |
| **OWASP Core Rule Set coverage** | 78% | 75% | > 90% | CRS 3.3.2, need custom rules |
| **Custom rules deployed** | 45 | 38 | — | Business logic, API-specific |
| **WAF rule update latency** | 48 hours | 72 hours | < 24 hours | After new CVE or attack pattern |
| **WAF in blocking mode** | 85% | 80% | 95% | 15% still in detection-only |
| **Overall WAF health** | **B (80)** | **B- (78)** | **A (90)** | |

### WAF bypass incidents

| Date | Attack type | API affected | Bypass method | Impact | WAF mode | Fix |
|---|---|---|---|---|---|---|
| 2026-07-28 | SQL injection (blind) | /api/search | Unicode encoding bypass | 0 (caught by app) | Blocking | Add Unicode normalization rule |
| 2026-07-15 | XSS (stored) | /api/comments | JSON payload encoding | 3 users affected | Detection-only | Switched to blocking, add JSON rules |
| 2026-06-30 | Path traversal | /api/files/download | Double URL encoding | 0 (caught by app) | Blocking | Add recursive decoding rule |
| 2026-06-18 | XML external entity | /api/import | XML parser bypass | 0 (XXE disabled) | Blocking | Disable XML endpoints, add rule |
| 2026-05-22 | JWT none algorithm | /api/auth/refresh | JWT alg=none | 0 (JWT lib fixed) | Detection-only | Switched to blocking, JWT validation |
| 2026-05-10 | GraphQL introspection | /graphql | Introspection not blocked | Schema leaked | Detection-only | Block introspection in production |
| 2026-04-28 | Mass assignment | /api/users/update | Missing field whitelist | 12 users' roles changed | Detection-only | Added field whitelist, WAF rule |
| 2026-04-15 | SSRF via webhook | /api/webhooks/test | Internal IP in webhook URL | Internal metadata accessed | Detection-only | Block internal IPs in webhook URLs |

### Token security

| Token type | Active | Excessive scope | No rotation > 365d | No expiry | Revoked (30d) | Leaked (6mo) | Health |
|---|---|---|---|---|---|---|---|
| **OAuth access tokens** | 850 | 2 (0.2%) | 0 (auto-expire) | 0 | 25 | 1 | A- (88) |
| **OAuth refresh tokens** | 320 | 0 | 8 (2.5%) | 2 | 8 | 0 | B+ (85) |
| **API keys** (external) | 280 | 3 (1.1%) | 12 (4.3%) | 5 | 5 | 1 | B (78) |
| **API keys** (internal) | 195 | 1 (0.5%) | 8 (4.1%) | 3 | 4 | 0 | B (78) |
| **Service account tokens** | 125 | 2 (1.6%) | 4 (3.2%) | 1 | 3 | 1 | B- (72) |
| **Webhook signing secrets** | 48 | 0 | 0 (auto-rotate) | 0 | 0 | 0 | A (92) |
| **Legacy tokens** (pre-OAuth) | 32 | 0 | 0 | 32 (100%) | 0 | 0 | D (35) |
| **Total** | **1,850** | **8 (0.4%)** | **32 (1.7%)** | **43 (2.3%)** | **45** | **3** | **B- (72)** |

### Token security incidents

| Incident | Token type | Date | Leak vector | Scope | Data exposed | Revocation time | Prevented by |
|---|---|---|---|---|---|---|---|
| API key in client-side code | API key | 2026-07-18 | JavaScript bundle | Read all user data | 0 (rate limited) | 45 min | CI/CD secret scanning |
| Service account token in logs | Service account | 2026-06-12 | Log aggregation | DB read access | 0 (IP restricted) | 2 hours | Log redaction rules |
| OAuth token in URL parameter | OAuth | 2026-03-28 | Referrer header | Single user account | 1 user's data | 15 min | Implicit flow deprecation |
| Total leaked tokens (6 mo) | | | | | | | |

### OWASP API Top 10 compliance

| OWASP API risk | Severity | Compliant APIs | Partial | Non-compliant | Findings (6mo) | Trend |
|---|---|---|---|---|---|---|
| **API1: Broken Object Level Auth** | Critical | 78% | 14% | 8% | 8 BOLA/IDOR | ↓ |
| **API2: Broken Authentication** | Critical | 82% | 12% | 6% | 3 auth bypass | ↓ |
| **API3: Broken Object Property Level Auth** | High | 74% | 18% | 8% | 5 mass assignment | → |
| **API4: Unrestricted Resource Consumption** | High | 72% | 20% | 8% | 15 rate limit bypass | ↑ |
| **API5: Broken Function Level Auth** | Critical | 76% | 15% | 9% | 6 admin function access | → |
| **API6: Unrestricted Access to Sensitive Business Flows** | High | 70% | 18% | 12% | 4 automated abuse | ↑ |
| **API7: Server-Side Request Forgery** | High | 82% | 14% | 4% | 2 SSRF | → |
| **API8: Security Misconfiguration** | Medium | 75% | 16% | 9% | 12 WAF bypass | ↑ |
| **API9: Improper Inventory Management** | Medium | 68% | 22% | 10% | 8 shadow APIs, 18 deprecated | ↑ |
| **API10: Unsafe Consumption of APIs** | Medium | 72% | 20% | 8% | 5 3rd-party API issues | → |
| **Overall** | | **72%** | **20%** | **8%** | **68 findings** | |

### API security testing coverage

| Test type | Frequency | Coverage | Last run | Findings | Critical | Remediated |
|---|---|---|---|---|---|---|
| **SAST** (static analysis) | Every PR | 95% of code | Continuous | 45 | 2 | 40 (89%) |
| **DAST** (dynamic scanning) | Weekly | 85% of endpoints | 2026-08-03 | 28 | 5 | 22 (79%) |
| **API fuzzing** | Bi-weekly | 60% of endpoints | 2026-07-28 | 35 | 3 | 28 (80%) |
| **Penetration testing** | Quarterly | 100% ext APIs | 2026-06-15 | 18 | 8 | 15 (83%) |
| **Bug bounty program** | Continuous | All external APIs | Ongoing | 22 | 4 | 18 (82%) |
| **Dependency scanning** | Daily | 100% | Continuous | 12 | 2 | 10 (83%) |
| **Schema validation** | Every deploy | 92% | Continuous | 8 | 0 | 8 (100%) |
| **Overall** | | | | **168** | **24** | **141 (84%)** |

## Action recommendations

1. **Shadow API remediation**: 8 undocumented endpoints, 3 critical; register all shadow APIs in gateway, add proper authentication, audit data access
2. **Unauthenticated endpoint reduction**: 11 endpoints without auth, 5 high/critical; add auth to all except health checks, decommission 2 legacy endpoints
3. **GraphQL security hardening**: 63% rate limit, 5.5% abuse, introspection enabled; add query complexity scoring, disable introspection in production, add persisted queries
4. **WAF detection-only to blocking**: 15% of endpoints still in detection-only; switch to blocking mode, starting with low false-positive endpoints
5. **Token rotation enforcement**: 32 tokens not rotated > 365 days, 43 with no expiry; enforce 90-day rotation for all API keys, add expiry to all tokens
6. **Legacy token migration**: 32 legacy tokens (pre-OAuth) with no expiry; migrate to OAuth 2.0, decommission legacy token system
7. **API inventory automation**: 92% discovery rate, 18 deprecated endpoints active; automated API discovery in CI/CD, decommission deprecated endpoints on schedule
8. **Rate limit GraphQL and webhooks**: 0% webhook rate limiting, 63% GraphQL; add rate limiting for webhook receivers, implement query complexity for GraphQL
9. **OWASP API9 (inventory) improvement**: 68% compliance, 8 shadow APIs; reach 95% API discovery, implement API lifecycle management
10. **Weekly API security review**: review new endpoints, auth coverage, rate limit events, WAF incidents, token health, and OWASP compliance with security and platform teams



- API key as the only security → "it has an API key, so it's secure"; an API key proves identity, not authorization — without scoping and rotation, it's a password written on a sticky note
- Rate limiting as an afterthought → "we'll add rate limiting if we get abused"; rate limiting is not a reaction to abuse — it's a precondition for offering an API
- WAF as a substitute for secure code → "the WAF will block SQL injection"; WAF is a safety net, not a substitute — it catches what your code missed, but your code should still be secure
- API versioning as security → "the old API is deprecated, so nobody uses it"; deprecated APIs are the most vulnerable because they're no longer maintained but still accessible — deprecation without decommission is not a security strategy
- Token lifetime as infinite → "the token still works, why rotate it"; every long-lived token is a credential waiting to be leaked — shorter lifetimes + rotation = smaller blast radius

## Related

- Same class: [dashboard-security-posture](dashboard-security-posture.md) — security posture and compliance
- Same class: [dashboard-vulnerability-management](dashboard-vulnerability-management.md) — vulnerability management
- Same class: [dashboard-identity-access-management](dashboard-identity-access-management.md) — identity and access management
- Same class: [dashboard-network-health](../../oncall-sre/observability/dashboard-network-health.md) — network health
- Same class: [dashboard-api-portfolio](../../product-manager/discovery/prd--dashboard-api-portfolio.md) — API portfolio management
- References: OWASP — *API Security Top 10 (2023)*; OWASP — *API Security Cheat Sheet*; NIST — *SP 800-204 (API Security)*; Cloudflare — *API Security Best Practices*; Salt Security — *State of API Security Report*; OAuth 2.0 — *RFC 6749 + Security BCP*