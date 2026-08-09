---
title: traffic management and load balancing dashboard
aliases:
- traffic management dashboard
- load balancing dashboard
- traffic routing dashboard
- ingress health dashboard
- CDN health dashboard
tags:
- dashboard
- traffic-management
- load-balancing
- cdn
- ingress
- rate-limiting
- traffic-shaping
category: oncall-sre/observability
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: weekly
roles:
- oncall-sre
- engineer
- tech-lead
benefit: traffic management, load balancing health, and CDN performance visible at a glance
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
- load balancer health, CDN performance, traffic routing, rate limiting, ingress health, and global traffic distribution defined
related:
- ./dashboard-network-health.md
- ./dashboard-system-health.md
- ./dashboard-service-mesh-health.md
- ./dashboard-slo-error-budget.md
- ./dashboard-capacity-planning.md
tacit: false
---

# traffic management and load balancing dashboard

> **As an** SRE, **I want to** track traffic management and load balancing health, **so that** every request is routed efficiently, load is balanced across infrastructure, CDN delivers content fast globally, rate limiting protects services, and traffic management is a measured, optimized, and continuously improving practice — not a mystery when traffic spikes take down a service.

> Traffic management is the circulatory system of the platform. This dashboard tracks load balancer health, CDN performance, traffic routing, rate limiting, ingress health, and global traffic distribution — turning traffic from "requests are flowing... somewhere" into a precisely measured, routed, and protected resource.

## Summary

- 6 traffic management dimensions: load balancer health, CDN performance, traffic routing, rate limiting, ingress health, global traffic distribution
- 8 load balancers across 3 environments; 4 CDN distributions (CloudFront primary, Cloudflare secondary); 2.5M requests/min peak; 850 Gbps peak throughput
- Load balancer health: 99.98% availability; 12ms avg backend latency; 0.05% 5xx rate; 2.5M concurrent connections peak; 3 load balancers near capacity (85%+)
- CDN performance: 98.5% cache hit rate; 28ms P50 global latency; 85ms P95; 99.95% availability; 5.2 TB/day served; $0.008/GB avg cost
- Traffic routing: 85 routing rules; 12 weighted routing groups; 8 geo-routing rules; 5 latency-based routing policies; 3 failover routing configurations
- Dashboard reviewed weekly; traffic optimization review with SRE and platform engineering biweekly

## Core viewpoints

- The load balancer is the first and last line of defense — every request hits the load balancer before it hits your application; if the load balancer is misconfigured, the application is unreachable no matter how healthy it is
- CDN is not just for static assets — a well-configured CDN can cache API responses, GraphQL queries, and even authenticated content; every byte served from the edge is a byte that doesn't hit your origin, doesn't consume your compute, and doesn't add to your latency
- Rate limiting is a reliability feature, not a security feature — rate limiting protects your services from traffic spikes (legitimate or malicious); a service without rate limiting is one viral tweet away from an outage
- Traffic routing is topology-aware — routing traffic to the nearest healthy backend is not enough; you need to route based on backend capacity, current load, and health — a "healthy" backend at 95% CPU is worse than a "degraded" backend at 40%

## Key information

### 6-panel traffic management overview

```
┌──────────────────────────────────────────────────────────────────┐
│  LOAD BALANCER HEALTH                │  CDN PERFORMANCE                     │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  LBs: 8 (4 ALB, 3 NLB,  │   │  │  Cache hit rate: 98.5%   │   │
│  │  1 Global Accelerator)   │   │  │  P50 global: 28ms        │   │
│  │  Availability: 99.98%    │   │  │  P95 global: 85ms        │   │
│  │  5xx rate: 0.05%         │   │  │  Availability: 99.95%    │   │
│  │  Backend latency: 12ms   │   │  │  Data served: 5.2 TB/day │   │
│  │  Concurrent conns: 2.5M  │   │  │  Origin offload: 88%     │   │
│  │  Near capacity: 3 LBs    │   │  │  CDN score: A- (88)      │   │
│  │  LB score: B+ (82)       │   │  │                           │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  TRAFFIC ROUTING                     │  RATE LIMITING                       │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Routing rules: 85       │   │  │  Rate limit rules: 42    │   │
│  │  Weighted groups: 12     │   │  │  Requests limited/day:   │   │
│  │  Geo-routing: 8 rules    │   │  │  2.8M (0.8% of traffic) │   │
│  │  Latency-based: 5        │   │  │  False positives: 0.2%   │   │
│  │  Failover configs: 3     │   │  │  Services protected: 28  │   │
│  │  Routing errors: 0.02%   │   │  │  Token bucket: 65% of    │   │
│  │  Routing score: B+ (82)  │   │  │  rules, sliding window:  │   │
│  └─────────────────────────┘   │  │  35% of rules            │   │
│                                │  │  Rate limit score: B(78) │   │
│                                │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  INGRESS HEALTH                      │  GLOBAL TRAFFIC DISTRIBUTION         │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Ingress controllers: 6  │   │  │  Regions: 6 active       │   │
│  │  TLS certs: 28 (0 exp)  │   │  │  NA: 42% (1.05M rpm)    │   │
│  │  Ingress rules: 185      │   │  │  EU: 28% (700K rpm)     │   │
│  │  Hostname collisions: 2  │   │  │  APAC: 22% (550K rpm)   │   │
│  │  WebSocket conns: 85K    │   │  │  LATAM: 5% (125K rpm)   │   │
│  │  gRPC streams: 12K       │   │  │  Cross-region: 2.5% of  │   │
│  │  Ingress score: B+ (82)  │   │  │  traffic (latency cost) │   │
│  └─────────────────────────┘   │  │  Global score: B (80)    │   │
│                                │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Load balancer health by instance

| Load balancer | Type | Environment | Availability | Requests/min | 5xx rate | Backend latency | Conn count | Capacity | Health |
|---|---|---|---|---|---|---|---|---|---|
| **prod-web-alb-1** | ALB | prod | 99.99% | 520K | 0.03% | 10ms | 680K | 72% | A- (90) |
| **prod-web-alb-2** | ALB | prod | 99.99% | 480K | 0.04% | 12ms | 620K | 68% | A- (88) |
| **prod-api-alb** | ALB | prod | 99.98% | 850K | 0.05% | 15ms | 850K | 88% | B (78) |
| **prod-grpc-nlb** | NLB | prod | 99.97% | 320K | 0.02% | 8ms | 180K | 55% | B+ (85) |
| **prod-internal-nlb** | NLB | prod | 99.99% | 180K | 0.01% | 5ms | 85K | 42% | A (92) |
| **staging-alb** | ALB | staging | 99.95% | 85K | 0.08% | 18ms | 42K | 35% | B (80) |
| **preprod-alb** | ALB | pre-prod | 99.90% | 28K | 0.12% | 22ms | 15K | 28% | B- (72) |
| **global-accelerator** | GA | prod | 99.99% | 2.5M | 0.01% | 5ms | 2.5M | 85% | A- (88) |

### CDN performance by distribution

| Distribution | Region | Cache hit rate | P50 latency | P95 latency | Origin requests | Data served/day | Cost/day | Availability |
|---|---|---|---|---|---|---|---|---|
| **CloudFront (primary)** | Global | 98.8% | 22ms | 72ms | 1.2M (1.2%) | 3.8 TB | $28.50 | 99.97% |
| **Cloudflare (secondary)** | Global | 97.5% | 28ms | 85ms | 2.5M (2.5%) | 1.2 TB | $12.00 | 99.95% |
| **CloudFront (assets)** | Global | 99.5% | 18ms | 55ms | 0.3M (0.5%) | 0.8 TB | $5.80 | 99.99% |
| **CloudFront (API cache)** | Global | 92.0% | 35ms | 110ms | 8.5M (8.0%) | 0.4 TB | $4.20 | 99.95% |
| **Overall** | | **98.5%** | **28ms** | **85ms** | **12.5M (1.5%)** | **5.2 TB** | **$50.50** | **99.95%** |

### CDN cache efficiency

| Content type | Cache hit rate | TTL | Invalidation rate | Stale served | Origin offload | Optimization |
|---|---|---|---|---|---|---|
| **Static assets** (JS, CSS, images) | 99.5% | 1 year (versioned) | 0.1% (new deploys) | 0.01% | 99.5% | Excellent |
| **Fonts** | 99.8% | 1 year | 0% | 0% | 99.8% | Excellent |
| **API responses** (GET, cacheable) | 92.0% | 5 min — 1 hour | 5% (data updates) | 2.5% | 92.0% | Increase TTL for stable data |
| **GraphQL queries** (GET) | 85.0% | 1 min — 15 min | 8% (real-time data) | 5.0% | 85.0% | Add query-level cache keys |
| **User avatars** | 98.0% | 7 days | 2% (user uploads) | 1.0% | 98.0% | Good |
| **Product images** | 99.2% | 30 days | 1% (catalog updates) | 0.5% | 99.2% | Excellent |
| **Overall** | **98.5%** | | | | **88.0%** | |

### Traffic routing rules

| Routing rule | Type | Traffic % | Destinations | Priority | Health check | Failover | Status |
|---|---|---|---|---|---|---|---|
| **prod-web-primary** | Weighted | 80% | prod-web-alb-1, prod-web-alb-2 | 1 | 10s HTTP 200 | → prod-web-secondary | Active |
| **prod-web-secondary** | Weighted | 20% | prod-web-alb-1 (standby) | 2 | 10s HTTP 200 | → prod-dr | Standby |
| **api-geo-NA** | Geo | 42% | us-east-1, us-west-2 | 1 | 5s HTTP 200 | → api-geo-EU | Active |
| **api-geo-EU** | Geo | 28% | eu-west-1, eu-central-1 | 1 | 5s HTTP 200 | → api-geo-NA | Active |
| **api-geo-APAC** | Geo | 22% | ap-southeast-1, ap-northeast-1 | 1 | 5s HTTP 200 | → api-geo-NA | Active |
| **api-geo-LATAM** | Geo | 5% | sa-east-1 | 1 | 5s HTTP 200 | → api-geo-NA | Active |
| **grpc-internal** | Latency | 100% | 3 NLB (lowest latency) | 1 | gRPC health check | → grpc-fallback | Active |
| **cdn-failover** | Failover | 100% | CloudFront → Cloudflare | 3 | HTTP 200 from origin | Automatic | Active |

### Rate limiting effectiveness

| Service | Limit type | Threshold | Window | Requests limited/day | False positive | Limit exhausted | Action |
|---|---|---|---|---|---|---|---|
| **API Gateway (global)** | Token bucket | 10,000 req/min/IP | 1 min | 1.2M | 0.1% | 12 times/day | Burst handling, increase during known peaks |
| **Auth Service** | Sliding window | 20 req/min/IP | 1 min | 85K | 0.05% | 3 times/day | Brute force protection, working well |
| **YiAi Agents** | Concurrency | 50 concurrent/org | — | 120K | 0.5% | 18 times/day | Queue instead of reject, add backpressure |
| **Search Service** | Token bucket | 500 req/min/user | 1 min | 45K | 0.2% | 5 times/day | Working well |
| **Payment API** | Sliding window | 100 req/min/merchant | 1 min | 8K | 0.01% | 0 times/day | Strict limit, no issues |
| **File Upload** | Token bucket | 50 uploads/min/user | 1 min | 22K | 0.3% | 2 times/day | Add size-based rate limiting |
| **WebSocket** | Concurrent conn | 500 conns/IP | — | 85K | 0.8% | 8 times/day | Review limit, add gradual degradation |
| **Overall** | | | | **2.8M/day** | **0.2%** | | |

### Ingress health

| Ingress controller | Cluster | Rules | TLS certs | Hostnames | WebSocket conns | gRPC streams | Reload time | Errors | Health |
|---|---|---|---|---|---|---|---|---|---|
| **prod-ingress-1** | eks-prod | 65 | 12 | 28 | 32K | 5K | 2.5s | 0.01% | A- (88) |
| **prod-ingress-2** | eks-prod | 58 | 10 | 22 | 28K | 4K | 2.2s | 0.01% | A- (88) |
| **prod-ingress-3** | eks-prod | 62 | 8 | 18 | 25K | 3K | 2.8s | 0.02% | B+ (85) |
| **staging-ingress** | eks-staging | 28 | 5 | 12 | 5K | 1K | 1.5s | 0.05% | B (80) |
| **preprod-ingress** | eks-preprod | 15 | 3 | 8 | 2K | 0.5K | 1.2s | 0.08% | B- (72) |
| **tools-ingress** | eks-tools | 8 | 2 | 5 | 0.5K | 0 | 0.8s | 0.1% | B- (70) |

### Global traffic distribution

| Region | Requests/min | % of global | P50 latency | P95 latency | Origins | CDN offload | Capacity | Failover tested |
|---|---|---|---|---|---|---|---|---|
| **North America** (us-east-1, us-west-2) | 1.05M | 42% | 18ms | 55ms | 9 | 90% | 65% | Yes (quarterly) |
| **Europe** (eu-west-1, eu-central-1) | 700K | 28% | 22ms | 68ms | 6 | 88% | 58% | Yes (quarterly) |
| **APAC** (ap-southeast-1, ap-northeast-1) | 550K | 22% | 35ms | 95ms | 5 | 85% | 52% | Yes (quarterly) |
| **LATAM** (sa-east-1) | 125K | 5% | 55ms | 145ms | 2 | 82% | 45% | Yes (quarterly) |
| **Middle East** (me-central-1) | 52K | 2% | 68ms | 180ms | 2 | 80% | 38% | No — schedule Q3 |
| **Africa** (af-south-1) | 23K | 1% | 85ms | 220ms | 1 | 78% | 32% | No — schedule Q4 |

## Action recommendations

1. **Load balancer capacity planning**: 3 LBs at 85%+ capacity (prod-api-alb 88%, global-accelerator 85%); add 2 additional ALB nodes, pre-scale before peak, target < 70% capacity
2. **API cache hit rate improvement**: 92% cache hit rate for API responses; increase TTL for stable data, add cache warming for popular queries, implement stale-while-revalidate, target 95%
3. **Rate limit false positive reduction**: 0.2% false positive rate (5,600 requests/day incorrectly limited); add rate limit headers (X-RateLimit-Remaining), implement client-side backoff, add allowlist for known good clients
4. **YiAi Agents concurrency limit**: 18/day limit exhaustion, 0.5% false positive; implement request queuing instead of rejection, add backpressure signaling, increase limit during batch operations
5. **Global latency improvement**: LATAM (55ms P50), Middle East (68ms), Africa (85ms); add edge locations in lagging regions, enable CDN for dynamic content, evaluate regional origins
6. **Cross-region traffic reduction**: 2.5% of traffic crosses regions (higher latency, higher cost); optimize geo-routing rules, fix DNS misconfiguration causing NA→EU routing, target < 1%
7. **Failover testing**: Middle East and Africa regions not failover tested; schedule quarterly failover drills for all regions, automate failover testing, add to chaos engineering program
8. **Ingress TLS certificate automation**: 28 certs, 0 expiring; maintain 100% automation, add certificate transparency monitoring, implement automatic renewal alerting
9. **WebSocket connection management**: 85K connections, 0.8% rate limit false positive; review connection limits, add connection draining, implement graceful degradation for connection limits
10. **Weekly traffic management review**: review load balancer health, CDN performance, traffic routing, rate limiting, ingress health, and global traffic distribution with SRE and platform engineering



- The "just add another load balancer" fix → throwing more load balancers at a traffic problem without investigating the root cause; if backend latency is 12ms but P95 is 85ms, the problem is backend capacity, not load balancer capacity — adding LBs masks the symptom, doesn't cure the disease
- CDN as a static asset bucket → using CDN only for JS, CSS, and images while serving all API traffic from origin; API responses that are the same for all users (product catalogs, configuration, reference data) are perfect CDN candidates — every cached API response is 100% origin offload
- Rate limiting everything equally → applying the same rate limit (10,000 req/min) to all endpoints regardless of cost; a lightweight health check endpoint and a heavyweight report generation endpoint should have different limits — rate limiting should be proportional to resource consumption
- The "set and forget" routing rule → configuring geo-routing once and never reviewing it; traffic patterns shift, new regions grow, and a routing rule that was optimal last year sends 22% of your traffic to the wrong region today
- Ingress as a simple proxy → treating the ingress controller as just a pass-through; modern ingress controllers can handle authentication, rate limiting, circuit breaking, canary routing, and A/B testing — using ingress only for TLS termination is leaving 80% of the value on the table

## Related

- Same class: [dashboard-network-health](dashboard-network-health.md) — network health
- Same class: [dashboard-system-health](dashboard-system-health.md) — system health
- Same class: [dashboard-service-mesh-health](dashboard-service-mesh-health.md) — service mesh health
- Same class: [dashboard-slo-error-budget](dashboard-slo-error-budget.md) — SLO error budget
- Same class: [dashboard-capacity-planning](dashboard-capacity-planning.md) — capacity planning
- References: AWS — *Elastic Load Balancing Best Practices*; Cloudflare — *CDN Performance Guide*; NGINX — *Rate Limiting Guide*; Google — *Global Load Balancing Design*; Envoy — *Traffic Management Guide*; CloudFront — *Cache Optimization*; Tyler McMullen — *Fastly Rate Limiting Architecture*