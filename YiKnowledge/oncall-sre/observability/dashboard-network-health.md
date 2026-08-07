---
title: network health dashboard
aliases:
- network performance dashboard
- network monitoring dashboard
- connectivity health dashboard
- network operations dashboard
tags:
- dashboard
- network
- latency
- bandwidth
- dns
- cdn
- connectivity
- topology
category: oncall-sre/observability
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: dashboard
status: stable
lifecycle: active
review_cycle: weekly
roles:
- oncall-sre
- tech-lead
- engineer
benefit: network health, latency, and connectivity visible at a glance
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
- latency, bandwidth, DNS, CDN, connectivity, and topology health defined
related:
- ./dashboard-system-health.md
- ./dashboard-observability-coverage.md
- ./dashboard-capacity-planning.md
- ./dashboard-chaos-engineering.md
- ../incident-response/dashboard-incident-trends.md
tacit: false
---

# network health dashboard

> **As an** SRE, **I want to** track network health, latency, and connectivity across all environments, **so that** packets flow reliably, DNS resolves correctly, CDN delivers content at the edge, and every service can reach every dependency.

> The network is the circulatory system of the platform. This dashboard tracks latency, bandwidth utilization, DNS health, CDN performance, connectivity maps, and topology health — turning the network from a "someone else's problem" into a measurable, observable, SRE-owned reliability layer.

## Summary

- 6 network dimensions: latency, bandwidth, DNS health, CDN performance, connectivity, topology health
- 350+ endpoints across 8 regions, 5 cloud providers, 3 on-premise data centers; 1,850 inter-service connections
- Average cross-region latency: 85ms (target < 100ms); average intra-region latency: 4.2ms (target < 5ms)
- 99.97% network availability (target 99.99%); 12 network incidents in last 12 months; 3 were DNS-related
- 2.5 Tbps total provisioned bandwidth; 62% average utilization; 4 links at > 80% utilization (congestion risk)
- 8 CDN configurations, 95% cache hit rate, 28ms average edge latency; 85% of traffic served from CDN
- Dashboard reviewed weekly; network health deep-dive monthly with SRE and infrastructure teams

## Core viewpoints

- The network is not a black box — it's a measurable system with latency, bandwidth, DNS, and connectivity as its vital signs; if you can't measure it, you can't make it reliable
- DNS is the single point of failure that nobody thinks about — every service discovery, every API call, every CDN request starts with a DNS query; DNS failures are the hardest incidents to debug because they look like application failures
- Bandwidth is not free — every 1% of bandwidth utilization above 80% increases latency by 15% and packet loss by 8%; the network degrades before it fails
- CDN is the cheapest performance optimization — moving content from 85ms away (origin) to 28ms away (edge) is a 3× latency improvement; but CDN misconfiguration is the #1 cause of subtle, hard-to-detect outages

## Key information

### 6-panel network overview

```
┌──────────────────────────────────────────────────────────────────┐
│  LATENCY                           │  BANDWIDTH                          │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Intra-region: 4.2ms    │   │  │  Provisioned: 2.5 Tbps   │   │
│  │  Cross-region: 85ms     │   │  │  Avg utilization: 62%    │   │
│  │  Inter-cloud: 28ms      │   │  │  Peak utilization: 78%   │   │
│  │  P99 intra: 12ms        │   │  │  Links > 80%: 4 (of 52) │   │
│  │  P99 cross: 180ms       │   │  │  Packet loss: 0.08%      │   │
│  │  Jitter (avg): 2.5ms    │   │  │  Jitter: 2.5ms           │   │
│  │  Latency budget: 82%    │   │  │  Bandwidth headroom: 38% │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  DNS HEALTH                        │  CDN PERFORMANCE                    │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Queries/day: 850M       │   │  │  CDNs: 8 configurations  │   │
│  │  Resolution: 99.98%      │   │  │  Cache hit: 95%           │   │
│  │  P99 latency: 45ms       │   │  │  Edge latency: 28ms       │   │
│  │  TTL compliance: 92%     │   │  │  Origin offload: 85%      │   │
│  │  DNSSEC: 78% zones       │   │  │  Purge latency: 2.5s     │   │
│  │  Stale records: 42       │   │  │  SSL termination: 98%     │   │
│  │  DNS providers: 3        │   │  │  CDN availability: 99.99%│   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  CONNECTIVITY                      │  TOPOLOGY HEALTH                    │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Service mesh: 1,850 links│  │  │  Regions: 8              │   │
│  │  Connectivity: 99.97%    │   │  │  AZs: 24                 │   │
│  │  Failed health checks: 0.03%│ │  │  Providers: 5 clouds     │   │
│  │  Circuit breakers: 8 open│   │  │  On-prem DCs: 3          │   │
│  │  Retry storms: 2 events  │   │  │  Redundant paths: 88%    │   │
│  │  TLS handshake: 99.95%   │   │  │  Single-point-of-failure: 6│  │
│  │  Connection pool: 85%    │   │  │  Topology score: B+ (82) │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Latency by path

| Path type | Count | Avg latency | P50 | P95 | P99 | Jitter | SLA target | SLA met |
|---|---|---|---|---|---|---|---|---|
| **Intra-AZ** (same DC) | 580 | 0.8ms | 0.5ms | 2.0ms | 4.5ms | 0.2ms | < 2ms | 98% |
| **Intra-region** (cross-AZ) | 420 | 4.2ms | 3.5ms | 8.5ms | 12ms | 1.5ms | < 5ms | 94% |
| **Cross-region** (same cloud) | 185 | 52ms | 48ms | 95ms | 140ms | 8.0ms | < 80ms | 92% |
| **Cross-region** (different cloud) | 95 | 85ms | 78ms | 150ms | 220ms | 12ms | < 120ms | 88% |
| **Cloud-to-on-prem** | 28 | 35ms | 32ms | 65ms | 95ms | 5.0ms | < 50ms | 90% |
| **Internet ingress** | 12 | 45ms | 40ms | 120ms | 180ms | 18ms | < 100ms | 85% |
| **Internet egress** | 8 | 55ms | 48ms | 140ms | 200ms | 20ms | < 100ms | 82% |
| **CDN edge → origin** | 24 | 28ms | 25ms | 55ms | 80ms | 4.0ms | < 50ms | 95% |
| **Overall** | **1,352** | **4.2ms** | **3.5ms** | **12ms** | **180ms** | **2.5ms** | | **92%** |

### Latency by region pair

| Region pair | Avg latency | P95 | P99 | Jitter | Packet loss | Bandwidth | Health |
|---|---|---|---|---|---|---|---|
| us-east-1 ↔ us-west-2 | 62ms | 105ms | 145ms | 6ms | 0.02% | 10 Gbps | A (90) |
| us-east-1 ↔ eu-west-1 | 82ms | 140ms | 195ms | 10ms | 0.05% | 5 Gbps | B+ (85) |
| us-east-1 ↔ ap-southeast-1 | 195ms | 320ms | 420ms | 22ms | 0.12% | 2.5 Gbps | C+ (68) |
| eu-west-1 ↔ ap-southeast-1 | 165ms | 280ms | 380ms | 18ms | 0.10% | 2.5 Gbps | B- (72) |
| us-east-1 ↔ eu-central-1 | 88ms | 150ms | 210ms | 12ms | 0.04% | 5 Gbps | B+ (84) |
| ap-southeast-1 ↔ ap-northeast-1 | 72ms | 120ms | 165ms | 8ms | 0.03% | 5 Gbps | B+ (85) |
| us-east-1 ↔ on-prem (NY) | 15ms | 35ms | 55ms | 3ms | 0.01% | 10 Gbps | A (92) |
| eu-west-1 ↔ on-prem (Frankfurt) | 12ms | 28ms | 45ms | 2ms | 0.01% | 10 Gbps | A (94) |
| ap-southeast-1 ↔ on-prem (SG) | 8ms | 18ms | 30ms | 1.5ms | 0.01% | 10 Gbps | A (95) |

### Bandwidth utilization

| Link | Provisioned | Avg utilization | Peak utilization | P95 utilization | Headroom | Congestion risk | Trend |
|---|---|---|---|---|---|---|---|
| us-east-1 → internet | 100 Gbps | 58% | 82% | 78% | 42% | Medium | ↑ |
| us-west-2 → internet | 50 Gbps | 45% | 68% | 62% | 55% | Low | → |
| eu-west-1 → internet | 50 Gbps | 52% | 75% | 70% | 48% | Medium | ↑ |
| ap-southeast-1 → internet | 25 Gbps | 72% | 92% | 88% | 28% | **High** | ↑ |
| us-east-1 ↔ us-west-2 (backbone) | 10 Gbps | 62% | 85% | 80% | 38% | **High** | ↑ |
| us-east-1 ↔ eu-west-1 (backbone) | 5 Gbps | 58% | 78% | 72% | 42% | Medium | → |
| Cloud ↔ on-prem (NY) | 10 Gbps | 48% | 72% | 65% | 52% | Medium | → |
| Cloud ↔ on-prem (Frankfurt) | 10 Gbps | 42% | 65% | 58% | 58% | Low | → |
| Cloud ↔ on-prem (Singapore) | 10 Gbps | 55% | 78% | 72% | 45% | Medium | ↑ |
| us-east-1 → CDN origin | 20 Gbps | 68% | 88% | 82% | 32% | **High** | ↑ |
| eu-west-1 → CDN origin | 10 Gbps | 55% | 75% | 70% | 45% | Medium | → |
| ap-southeast-1 → CDN origin | 5 Gbps | 78% | 95% | 90% | 22% | **Critical** | ↑↑ |
| **Overall** | **2.5 Tbps** | **62%** | **78%** | **72%** | **38%** | | |

### Bandwidth congestion alerts

| Link | Current utilization | Threshold | Peak time | Impact | Mitigation | ETA |
|---|---|---|---|---|---|---|
| ap-southeast-1 CDN origin | 78% (peaks 95%) | 80% | 12:00-18:00 UTC | CDN cache miss latency | Upgrade to 10 Gbps | Q4 2026 |
| us-east-1 ↔ us-west-2 backbone | 62% (peaks 85%) | 80% | 14:00-22:00 UTC | Cross-region replication lag | Add 5 Gbps secondary link | Q3 2026 |
| us-east-1 CDN origin | 68% (peaks 88%) | 80% | 16:00-00:00 UTC | Asset delivery slowdown | Traffic shaping, upgrade to 40 Gbps | Q4 2026 |
| ap-southeast-1 internet | 72% (peaks 92%) | 80% | 08:00-14:00 UTC | APAC customer latency | Add secondary internet link | Q3 2026 |

### DNS health

| DNS metric | Current | Target | 3 months ago | Notes |
|---|---|---|---|---|
| **Query volume** | 850M/day | — | 720M/day | Growing 18% QoQ |
| **Resolution success rate** | 99.98% | 99.99% | 99.97% | 170K failed queries/day |
| **P50 resolution latency** | 12ms | < 10ms | 14ms | Improving |
| **P99 resolution latency** | 45ms | < 30ms | 52ms | CDN DNS slow in APAC |
| **TTL compliance** | 92% | > 98% | 88% | 8% of records with incorrect TTL |
| **DNSSEC coverage** | 78% | > 95% | 72% | 6 of 27 zones not signed |
| **Stale DNS records** | 42 | 0 | 58 | Cleaning up, but still too many |
| **DNS provider diversity** | 3 providers | 3 | 2 | Added Route53 as tertiary |
| **DNS cache hit rate** | 88% | > 90% | 85% | TTL tuning needed |
| **Overall DNS health** | **B+ (84)** | **A (92)** | **B (78)** | |

### DNS zones health

| Zone | Provider | Records | DNSSEC | TTL compliance | Stale records | Resolution % | Latency (P99) |
|---|---|---|---|---|---|---|---|
| example.com | Route53 | 285 | Yes | 94% | 8 | 99.99% | 28ms |
| internal.example.com | Route53 (private) | 420 | No | 90% | 12 | 99.98% | 8ms |
| api.example.com | Cloudflare | 65 | Yes | 96% | 2 | 99.99% | 22ms |
| cdn.example.com | Cloudflare | 32 | Yes | 98% | 0 | 99.99% | 18ms |
| staging.example.com | Route53 | 180 | No | 85% | 8 | 99.95% | 35ms |
| dev.example.com | Route53 | 220 | No | 82% | 15 | 99.92% | 42ms |
| service-mesh.internal | Consul DNS | 1,850 | No | 95% | 5 | 99.99% | 5ms |
| k8s-cluster.local | CoreDNS | 3,200 | No | 92% | 0 | 99.99% | 3ms |
| monitoring.internal | Route53 (private) | 45 | No | 88% | 3 | 99.97% | 10ms |
| **Overall** | | **6,297** | **78%** | **92%** | **42** | **99.98%** | **45ms** |

### CDN performance by configuration

| CDN config | Provider | Traffic share | Cache hit | Edge latency | Origin latency | Offload % | SSL term | Availability |
|---|---|---|---|---|---|---|---|---|
| Static assets (JS/CSS/img) | Cloudflare | 42% | 98% | 15ms | 85ms | 98% | 100% | 99.99% |
| API responses (cacheable) | Cloudflare | 18% | 88% | 22ms | 120ms | 88% | 100% | 99.99% |
| User-generated content | CloudFront | 15% | 92% | 28ms | 95ms | 92% | 100% | 99.99% |
| Video streaming | Fastly | 12% | 96% | 35ms | 180ms | 96% | 98% | 99.98% |
| Images (transformed) | CloudFront + Lambda@Edge | 8% | 85% | 42ms | 150ms | 85% | 100% | 99.97% |
| API gateway cache | Cloudflare Workers | 3% | 78% | 18ms | 95ms | 78% | 100% | 99.99% |
| Internal CDN (staging) | CloudFront | 1% | 72% | 32ms | 110ms | 72% | 95% | 99.95% |
| Edge redirects | Cloudflare | 1% | 99% | 8ms | 80ms | 99% | 100% | 99.99% |
| **Overall** | | **100%** | **95%** | **28ms** | **85ms** | **85%** | **98%** | **99.99%** |

### CDN cache efficiency

| Cache tier | Hit rate | TTL | Purge frequency | Purge latency | Stale serving | Optimization |
|---|---|---|---|---|---|---|
| **Static assets** (versioned) | 98% | 365 days | 5/day | 1.2s | 0.01% | Immutable URLs |
| **Static assets** (non-versioned) | 92% | 7 days | 12/day | 2.5s | 0.5% | Move to versioned URLs |
| **API responses** (GET) | 88% | 5 min | 0 (TTL-based) | N/A | 0.2% | TTL tuning per endpoint |
| **API responses** (POST cache) | 45% | 30 sec | 0 (TTL-based) | N/A | 1.5% | Selective POST caching |
| **User content** (images) | 92% | 30 days | 20/day | 3.5s | 0.8% | Optimize purge batch |
| **User content** (video) | 96% | 90 days | 2/day | 5.0s | 0.1% | Good |
| **Edge compute** (KV store) | 99.5% | Managed | Managed | < 100ms | 0.001% | Excellent |
| **Overall** | **95%** | | | **2.5s** | **0.3%** | |

### Connectivity health

| Connectivity metric | Current | Target | 3 months ago | Notes |
|---|---|---|---|---|
| **Service mesh links** | 1,850 | — | 1,620 | Growing with service count |
| **Overall connectivity** | 99.97% | 99.99% | 99.96% | 2.6 hours downtime/year |
| **Failed health checks** | 0.03% | < 0.01% | 0.04% | 1,530 failed checks/day |
| **Open circuit breakers** | 8 | < 2 | 5 | 6 are for known-bad dependencies |
| **Retry storms** (last 30 days) | 2 events | 0 | 3 events | DB connection pool exhaustion |
| **TLS handshake success** | 99.95% | 99.99% | 99.94% | Certificate expiry was 1 case |
| **Connection pool utilization** | 85% | < 70% | 82% | 3 pools at > 95% at peak |
| **mTLS coverage** | 72% | > 90% | 65% | Rolling out across mesh |
| **Overall connectivity** | **B+ (82)** | **A (92)** | **B (78)** | |

### Service dependency health

| Dependency | From | To | Latency | Health checks | Failure rate | Circuit breaker | Health |
|---|---|---|---|---|---|---|---|
| API → DB primary | API GW | RDS | 2.5ms | 99.99% | 0.001% | Closed | A (94) |
| API → Redis cache | API GW | ElastiCache | 1.2ms | 99.99% | 0.002% | Closed | A (95) |
| API → Auth service | API GW | Auth | 8.5ms | 99.97% | 0.05% | Closed | B+ (85) |
| Auth → LDAP | Auth | LDAP | 45ms | 99.95% | 0.12% | Half-open (2/hr) | B (78) |
| API → Payment processor | API GW | Stripe | 120ms | 99.92% | 0.25% | Closed | B (75) |
| Worker → Message queue | Workers | SQS | 5.0ms | 99.98% | 0.01% | Closed | A (90) |
| Worker → 3rd-party email | Workers | SendGrid | 85ms | 99.85% | 0.8% | Open (rate limit) | C (62) |
| Worker → Object storage | Workers | S3 | 15ms | 99.99% | 0.001% | Closed | A (92) |
| API → Search service | API GW | Elasticsearch | 22ms | 99.96% | 0.08% | Closed | B+ (82) |
| Monitoring → Metrics store | Prometheus | Thanos | 8.0ms | 99.98% | 0.02% | Closed | A (88) |

### Open circuit breakers

| Circuit | State | Opened | Failure rate | Reason | Impact | Action |
|---|---|---|---|---|---|---|
| Worker → SendGrid | Open | 2026-08-05 14:22 | 0.8% (5-min) | Rate limit exceeded | Email delivery delayed | Contact SendGrid, increase quota |
| API → Legacy billing | Open | 2026-08-04 09:15 | 2.5% (5-min) | Timeout from legacy system | Billing page degraded | Migration to new billing in progress |
| Worker → 3rd-party CRM | Half-open | 2026-08-03 16:45 | 1.8% (5-min) | Intermittent 503 | CRM sync delayed | Probe every 30s, contact vendor |
| API → Recommendation engine | Half-open | 2026-08-02 11:30 | 1.2% (5-min) | GPU memory pressure | Recs degraded (fallback) | GPU cluster scaling in progress |
| Auth → LDAP (backup) | Half-open | 2026-08-01 08:00 | 0.5% (5-min) | Slow response > 1s | Auth latency increase | LDAP server upgrade scheduled |
| API → File conversion | Half-open | 2026-07-30 22:15 | 3.0% (5-min) | Queue depth > 10K | File conversion delayed | Add worker instances |
| API → GeoIP service | Half-open | 2026-07-28 14:00 | 2.2% (5-min) | 3rd-party API unstable | GeoIP fallback to default | Switch to local GeoIP DB |
| API → Notification push | Half-open | 2026-07-25 09:30 | 1.5% (5-min) | FCM/APNs intermittent | Push delayed | Multi-provider failover |

### Network incident history

| Incident | Date | Duration | Impact | Root cause | Category | Prevention |
|---|---|---|---|---|---|---|
| CDN cache poisoning | 2026-07-28 | 45 min | 22% of users served stale content | Purge pipeline race condition | CDN | Purge verification step |
| DNS resolution failure | 2026-07-15 | 18 min | 15% API timeout | Route53 health check misconfiguration | DNS | DNS change review process |
| Cross-region link saturation | 2026-06-22 | 2.5 hrs | APAC→US replication lag 45 min | Unexpected traffic spike | Bandwidth | Auto-scaling for inter-region links |
| BGP route leak (cloud provider) | 2026-06-10 | 65 min | EU traffic routed via APAC | Cloud provider BGP misconfiguration | External | Multi-cloud traffic engineering |
| TLS certificate expiry | 2026-05-18 | 8 min | 5% API connection failures | Auto-renewal failure | Certificate | Certificate expiry alerting |
| DNS DDoS amplification | 2026-05-02 | 35 min | DNS resolution slowed to 2s+ | Open DNS resolver exploited | DNS | Rate limiting, anycast distribution |
| Service mesh control plane | 2026-04-12 | 28 min | New sidecars couldn't register | Consul leader election failure | Service mesh | Control plane redundancy |
| CDN origin shield failure | 2026-03-28 | 55 min | Origin overloaded, CDN bypassed | Origin shield misconfiguration | CDN | Origin shield health check |
| Cross-AZ network partition | 2026-03-05 | 42 min | us-east-1a isolated | AWS networking issue | Cloud provider | Multi-AZ stateless design |
| Retry storm → DB overload | 2026-02-18 | 3.2 hrs | Full API outage | No circuit breaker on DB calls | Connectivity | Circuit breaker + retry budget |
| DNS cache poisoning | 2026-01-25 | 22 min | Users redirected to wrong IP | Stale DNS record propagation | DNS | DNSSEC + record audit |
| Fiber cut (on-prem) | 2026-01-08 | 8 hrs | NY office disconnected | Construction accident | Physical | Redundant fiber paths |

### Topology health

| Region | Availability zones | Services deployed | Redundant paths | SPOF count | Cross-region failover | Topology score |
|---|---|---|---|---|---|---|
| us-east-1 | 6 | 142 | 95% | 1 (legacy DB) | Yes (to us-west-2) | A (90) |
| us-west-2 | 3 | 85 | 88% | 2 (cache, queue) | Yes (to us-east-1) | B+ (84) |
| eu-west-1 | 3 | 78 | 90% | 1 (auth) | Yes (to eu-central-1) | B+ (86) |
| eu-central-1 | 3 | 52 | 85% | 2 (auth, config) | Yes (to eu-west-1) | B (80) |
| ap-southeast-1 | 3 | 65 | 82% | 3 (DB, cache, CDN) | Partial (to ap-northeast-1) | B- (72) |
| ap-northeast-1 | 2 | 38 | 78% | 3 (DB, CDN, queue) | Partial (to ap-southeast-1) | C+ (68) |
| on-prem (NY) | 2 (DC) | 28 | 92% | 1 (tape backup) | No | B (78) |
| on-prem (Frankfurt) | 2 (DC) | 22 | 88% | 1 (HSM) | No | B (78) |
| on-prem (Singapore) | 1 (DC) | 12 | 65% | 4 (all critical) | No | D (52) |
| **Overall** | **24 AZs** | **522 services** | **88%** | **6 SPOFs** | | **B+ (82)** |

### Single points of failure

| SPOF | Location | Services affected | Risk | Impact if failed | Mitigation | ETA |
|---|---|---|---|---|---|---|
| Legacy DB (us-east-1) | us-east-1 | 12 services | Critical | 12 service degradation | Multi-region DB (in progress) | Q4 2026 |
| Cache cluster (us-west-2) | us-west-2 | 8 services | High | Performance degradation | Multi-AZ cache cluster | Q3 2026 |
| Message queue (us-west-2) | us-west-2 | 15 services | High | Async processing halt | Cross-region queue mirroring | Q3 2026 |
| Auth service (eu-west-1) | eu-west-1 | All EU services | Critical | Complete EU auth failure | Active-active auth across EU regions | Q4 2026 |
| Singapore on-prem DC | Singapore | All SG on-prem | Critical | SG office + local processing | Cloud failover for critical services | Q3 2026 |
| Tape backup (NY on-prem) | NY | Archive data | Medium | Long-term archive unavailable | Cloud backup replication | Q4 2026 |

## Action recommendations

1. **APAC bandwidth upgrade**: ap-southeast-1 CDN origin at 78% (peaks 95%), internet link at 72% (peaks 92%); upgrade CDN origin to 10 Gbps and add secondary internet link by Q3 2026
2. **Singapore on-prem SPOF**: 4 critical SPOFs in single-DC Singapore; implement cloud failover for critical services, add secondary DC or migrate to cloud
3. **DNS stale record cleanup**: 42 stale records, 8% TTL non-compliance; implement automated DNS record audit, remove stale records, enforce TTL standards
4. **SendGrid circuit breaker**: email delivery degraded since Aug 5; increase SendGrid quota, implement exponential backoff, or add backup email provider
5. **DNSSEC rollout**: 78% zone coverage, 6 zones unsigned; sign all remaining zones, target 100% DNSSEC coverage by Q4 2026
6. **Retry storm prevention**: 2 retry storm events in 30 days; implement per-service retry budgets, circuit breakers on all DB connections, retry amplification monitoring
7. **mTLS mesh expansion**: 72% mTLS coverage; accelerate service mesh mTLS rollout, target 90% by Q4 2026
8. **Connection pool tuning**: 3 pools at > 95% at peak; right-size connection pools, implement connection pool monitoring and auto-scaling
9. **CDN purge pipeline hardening**: 45-min cache poisoning incident; add purge verification step, canary purge before global purge, rollback capability
10. **Weekly network review**: review latency, bandwidth, DNS, CDN, connectivity, and topology health with SRE and infrastructure teams



- The network is someone else's problem → "the cloud provider handles the network"; the cloud provider handles the physical network, but you own the logical network — DNS, CDN, service mesh, TLS, and connectivity are all yours
- Bandwidth as infinite → provisioning for average utilization and being surprised by peaks; networks degrade before they fail — 80% utilization is the new 100%
- DNS as set-and-forget → adding DNS records and never cleaning them up; stale DNS records are landmines — they cause incidents that look like application failures
- CDN as a magic cache → "just put it behind the CDN"; CDN misconfiguration is the #1 cause of subtle, hard-to-detect outages — cache poisoning, stale content, origin shield bypass
- Circuit breaker as a set-and-forget → opening a circuit breaker and never investigating why; a circuit breaker is a symptom, not a solution — every open circuit has a root cause that needs fixing

## Related

- Same class: [dashboard-system-health](dashboard-system-health.md) — system SLO and health
- Same class: [dashboard-observability-coverage](dashboard-observability-coverage.md) — observability coverage
- Same class: [dashboard-capacity-planning](dashboard-capacity-planning.md) — capacity planning
- Same class: [dashboard-chaos-engineering](dashboard-chaos-engineering.md) — chaos engineering
- Same class: [dashboard-incident-trends](../incident-response/dashboard-incident-trends.md) — incident trends
- References: Google SRE — *Chapter 8: Networking*; Cloudflare — *Network Performance Monitoring*; AWS — *Well-Architected Framework (Reliability Pillar)*; Kentik — *Network Observability*; ThousandEyes — *Internet Health Report*; IETF — *DNS and DNSSEC Best Current Practices*