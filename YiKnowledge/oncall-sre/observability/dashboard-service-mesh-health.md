---
title: service mesh health dashboard
aliases:
- mesh health dashboard
- service mesh monitoring dashboard
- sidecar health dashboard
- traffic management dashboard
tags:
- dashboard
- service-mesh
- istio
- linkerd
- envoy
- sidecar
- mTLS
- traffic-policy
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
benefit: service mesh health, traffic management, and security posture visible at a glance
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
- sidecar health, mTLS coverage, traffic policy, mesh performance, fault injection, and mesh topology defined
related:
- ./dashboard-system-health.md
- ./dashboard-network-health.md
- ./dashboard-observability-coverage.md
- ./dashboard-chaos-engineering.md
- ../../engineer/architecture-design/dashboard-architecture-health.md
tacit: false
---

# service mesh health dashboard

> **As an** SRE, **I want to** track service mesh health and traffic management, **so that** every service-to-service communication is secure (mTLS), observable (tracing), and controllable (traffic policy), the mesh itself is transparent overhead, and service communication is a solved problem — not a daily source of fires.

> The service mesh is the nervous system of microservices. This dashboard tracks sidecar health, mTLS coverage, traffic policy compliance, mesh performance, fault injection, and topology health — turning the service mesh from an invisible black box into a measured, trusted, and optimized communication layer.

## Summary

- 6 service mesh dimensions: sidecar health, mTLS coverage, traffic policy, mesh performance, fault injection, topology health
- Mesh: Istio 1.22 across 3 Kubernetes clusters (prod, staging, pre-prod); 42 services; 850 sidecar proxies; 1,200+ endpoints
- Sidecar health: 96.5% sidecar ready rate; 3.5% sidecars in degraded state; 12 sidecar crash loops/month; 85 MB avg sidecar memory (target < 100 MB)
- mTLS coverage: 94% of inter-service traffic encrypted (target 100%); 6% plaintext (legacy services, health checks); 28 certificates expiring in 30 days
- Traffic policy: 85 routing rules; 42 destination rules; 18 virtual services; 8 policy violations detected; 15% of traffic under canary routing
- Mesh performance: 2.5ms P50 sidecar latency overhead; 8ms P95; 1.2% CPU overhead per sidecar; 0.8% total mesh overhead
- Dashboard reviewed weekly; mesh optimization sprint monthly with platform and SRE

## Core viewpoints

- The mesh is infrastructure, not magic — sidecars consume CPU, memory, and add latency; every service mesh feature you enable has a cost — measure it, don't assume it's free
- mTLS is the bare minimum, not the goal — encrypting service-to-service traffic is table stakes; the real value of the mesh is traffic control (canary, retry, circuit breaking) and observability (distributed tracing, metrics)
- Traffic policy is code — routing rules, retry policies, and circuit breakers are infrastructure code that should be versioned, tested, and reviewed; a misconfigured retry policy can turn a 500ms hiccup into a retry storm
- The mesh topology is a map of dependencies — understanding which services call which, at what volume, with what latency, is the foundation of capacity planning, incident response, and architecture decisions

## Key information

### 6-panel service mesh overview

```
┌──────────────────────────────────────────────────────────────────┐
│  SIDECAR HEALTH                     │  mTLS COVERAGE                       │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Sidecars: 850 total     │   │  │  mTLS coverage: 94%       │   │
│  │  Ready: 96.5% (820)      │   │  │  Plaintext: 6% (legacy,   │   │
│  │  Degraded: 3.5% (30)     │   │  │  health checks, internal) │   │
│  │  Crash loops: 12/mo      │   │  │  Certs expiring: 28       │   │
│  │  Memory: 85 MB avg       │   │  │  Cert rotation: auto 78% │   │
│  │  CPU: 0.15 core avg      │   │  │  SPIFFE compliance: 92%  │   │
│  │  Restart time: 8s avg    │   │  │  TLS version: 1.3 (95%)  │   │
│  │  Sidecar score: B+ (82)  │   │  │  mTLS score: B+ (85)     │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  TRAFFIC POLICY                     │  MESH PERFORMANCE                   │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Virtual services: 18    │   │  │  P50 overhead: 2.5ms     │   │
│  │  Destination rules: 42   │   │  │  P95 overhead: 8ms       │   │
│  │  Routing rules: 85       │   │  │  P99 overhead: 22ms      │   │
│  │  Policy violations: 8    │   │  │  CPU overhead: 1.2%      │   │
│  │  Canary traffic: 15%     │   │  │  Memory overhead: 85 MB  │   │
│  │  Circuit breakers: 22    │   │  │  Total mesh overhead:0.8%│   │
│  │  Policy score: B (78)    │   │  │  Performance: B+ (85)    │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  FAULT INJECTION                    │  MESH TOPOLOGY                      │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Fault tests/mo: 18      │   │  │  Nodes: 42 services      │   │
│  │  Delay injection: 55%    │   │  │  Edges: 285 connections   │   │
│  │  Abort injection: 45%    │   │  │  Avg degree: 6.8          │   │
│  │  Fault success rate: 92% │   │  │  Critical path: 12 nodes │   │
│  │  Discovered via faults:  │   │  │  Orphaned services: 3    │   │
│  │  5 resilience gaps       │   │  │  Circular deps: 2        │   │
│  │  Fault score: B+ (82)    │   │  │  Topology: B (78)        │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Sidecar health by cluster

| Cluster | Services | Sidecars | Ready | Degraded | Crash loops | Restart time | Memory avg | CPU avg |
|---|---|---|---|---|---|---|---|---|
| **prod** (eks-prod) | 42 | 520 | 98.5% | 1.5% (8) | 3/mo | 6s | 88 MB | 0.18 core |
| **staging** (eks-staging) | 38 | 210 | 94.0% | 6.0% (13) | 5/mo | 10s | 82 MB | 0.14 core |
| **pre-prod** (eks-preprod) | 20 | 120 | 92.5% | 7.5% (9) | 4/mo | 12s | 78 MB | 0.12 core |
| **Overall** | | **850** | **96.5%** | **3.5% (30)** | **12/mo** | **8s** | **85 MB** | **0.15 core** |

### Sidecar crash loop analysis

| Service | Cluster | Crash loops/mo | Root cause | Memory at crash | Resolution |
|---|---|---|---|---|---|
| **YiVad real-time** | prod | 3 | OOM: WebSocket connection tracking exhausts memory | 512 MB (limit) | Increase sidecar memory limit to 768 MB |
| **Data pipeline** | staging | 2 | Envoy config reload race condition | 180 MB | Upgrade to Istio 1.22.3, fix config reload |
| **YiAi agent-orchestrator** | prod | 2 | High traffic causes listener overflow | 420 MB | Increase listener limit, connection pooling |
| **Notification service** | staging | 1 | DNS resolution failure in sidecar | 95 MB | Fix DNS proxy config, add retry |
| **File processor** | pre-prod | 1 | Init container timeout, sidecar not ready | 0 MB | Increase init container timeout |
| **Other** | all | 3 | Various | — | — |

### mTLS coverage by service

| Service | mTLS % | Plaintext reason | Cert expiry | SPIFFE ID | TLS version | Action |
|---|---|---|---|---|---|---|
| **YiVad Core** | 98% | Health checks (2%) | 2026-09-15 | Valid | 1.3 | Enable mTLS for health checks |
| **YiAi Agents** | 96% | gRPC health probes (4%) | 2026-09-20 | Valid | 1.3 | mTLS for gRPC probes |
| **YiWeb** | 92% | Legacy internal API (8%) | 2026-08-30 | Valid | 1.3 | Migrate legacy API to mTLS |
| **YiPet** | 88% | WebSocket upgrade (12%) | 2026-09-10 | Valid | 1.3 | mTLS for WebSocket connections |
| **Auth service** | 99% | Health check (1%) | 2026-09-05 | Valid | 1.3 | Complete |
| **API Gateway** | 95% | External health check (5%) | 2026-08-25 | Valid | 1.3 | mTLS for external checks |
| **Database proxy** | 90% | DB wire protocol (10%) | 2026-09-01 | Valid | 1.3 | Evaluate DB-native TLS |
| **Legacy notification** | 45% | No sidecar (55%) | N/A | Missing | N/A | Inject sidecar, enable mTLS |
| **Other (34 services)** | 96% avg | Various | Various | 92% compliant | 1.3 (95%) | |

### Certificate management

| Certificate type | Count | Auto-rotated | Expiring < 30 days | Expiring < 7 days | Rotation failures | Notes |
|---|---|---|---|---|---|---|
| **Workload certs** (SPIFFE) | 850 | 92% | 28 | 5 | 2% | Istio Citadel auto-rotation |
| **Gateway certs** (ingress) | 8 | 75% | 3 | 1 | 0% | Manual rotation for 2 |
| **CA root cert** | 1 | No | 365 days | — | N/A | Manual rotation annually |
| **Intermediate CA** | 3 | No | 180 days | — | N/A | Manual rotation |
| **External TLS** (public) | 12 | 100% | 0 | 0 | 0% | cert-manager auto-rotation |

### Traffic policy inventory

| Policy type | Count | Active | Testing | Violations | Last audit | Health |
|---|---|---|---|---|---|---|
| **Virtual services** | 18 | 16 | 2 | 2 | 2026-07-15 | B (78) |
| **Destination rules** | 42 | 38 | 4 | 3 | 2026-07-20 | B (78) |
| **Request routing** | 85 | 80 | 5 | 2 | 2026-07-18 | B+ (82) |
| **Retry policies** | 28 | 26 | 2 | 1 | 2026-07-10 | B (80) |
| **Circuit breakers** | 22 | 20 | 2 | 0 | 2026-07-22 | B+ (85) |
| **Rate limiting** | 15 | 14 | 1 | 0 | 2026-07-08 | B+ (82) |
| **Fault injection** | 8 | 6 | 2 | 0 | 2026-07-25 | B (78) |
| **Traffic shifting** | 12 | 10 | 2 | 0 | 2026-07-12 | B+ (82) |

### Top traffic policy violations

| Policy | Service | Violation | Impact | Detected | Action |
|---|---|---|---|---|---|
| **Retry storm** | YiVad → YiAi | Retry policy: 3 retries with 100ms backoff, but 500ms timeout | 3× traffic amplification during degradation | 2026-08-02 | Fix: timeout > retry budget |
| **No circuit breaker** | YiWeb → Payment | No circuit breaker defined for payment dependency | Cascading failure risk | 2026-08-01 | Add circuit breaker with 50% error threshold |
| **Wildcard routing** | API Gateway | Virtual service routes /* to all backends | No traffic isolation, security risk | 2026-07-28 | Define explicit route per service |
| **Conflicting retry** | YiAi → LLM | Both client and mesh retry enabled (double retry) | 9× amplification (3×3) | 2026-07-25 | Disable client retry, mesh-only |
| **Missing timeout** | YiVad → WebSocket | No request timeout configured | Connection leaks, resource exhaustion | 2026-07-20 | Add 30s request timeout |
| **mTLS disabled** | Legacy → Auth | Destination rule has mTLS mode: DISABLE | Plaintext auth traffic | 2026-07-15 | Enable STRICT mTLS |
| **Insecure TLS version** | Old service → DB | TLS 1.2 only, no 1.3 | Compliance gap | 2026-07-10 | Upgrade to TLS 1.3 |
| **Overly aggressive LB** | YiVad → Real-time | Least request LB causing hot spots | Uneven pod load | 2026-07-05 | Use LEAST_CONN with warmup |

### Mesh performance overhead

| Metric | Without mesh | With mesh | Overhead | Target | Notes |
|---|---|---|---|---|---|
| **P50 latency** | 12ms | 14.5ms | +2.5ms (20.8%) | < 3ms | Acceptable, within target |
| **P95 latency** | 45ms | 53ms | +8ms (17.8%) | < 12ms | Acceptable |
| **P99 latency** | 120ms | 142ms | +22ms (18.3%) | < 30ms | Acceptable but borderline |
| **CPU per pod** | 0.80 core | 0.95 core | +0.15 core (18.8%) | < 0.2 core | Acceptable |
| **Memory per pod** | 450 MB | 535 MB | +85 MB (18.9%) | < 100 MB | Acceptable |
| **Network throughput** | 850 Mbps | 858 Mbps | +8 Mbps (0.9%) | < 1% | Excellent |
| **Connection overhead** | 0 | 2 conn/svc (sidecar→app) | 84 total connections | < 200 | Excellent |
| **Total mesh overhead** | | | **0.8% of cluster resources** | < 2% | Excellent |

### Circuit breaker status

| Circuit breaker | Service | Threshold | Current state | Tripped (24h) | Last trip | Recovery time |
|---|---|---|---|---|---|---|
| **Payment service CB** | YiWeb→Payment | 50% error, 5s window | Closed | 0 | 2026-07-28 | 30s (auto) |
| **LLM API CB** | YiAi→LLM | 30% error, 10s window | Half-open | 2 | 2026-08-05 | 60s (auto) |
| **Search CB** | YiVad→Search | 40% error, 5s window | Closed | 0 | 2026-07-15 | 30s (auto) |
| **Notification CB** | All→Notification | 20% error, 10s window | Closed | 1 | 2026-08-03 | 45s (auto) |
| **Database CB** | All→DB proxy | 10% error, 15s window | Closed | 0 | — | 60s (auto) |
| **Auth CB** | All→Auth | 5% error, 10s window | Closed | 0 | — | 30s (auto) |
| **CDN CB** | YiWeb→CDN | 30% error, 5s window | **Open** | 3 | 2026-08-05 | 120s (auto) |

### Canary deployment traffic

| Canary | Service | Traffic % | Duration | Success criteria | Status | Rollback trigger |
|---|---|---|---|---|---|---|
| **YiVad v2.8.3** | YiVad Core | 15% → 50% → 100% | 4 hours | Error rate < baseline + 5% | In progress (50%) | Error rate > +10% |
| **YiAi v3.1.2** | YiAi Agents | 10% → 30% → 100% | 6 hours | P95 latency < baseline + 20% | Completed | P95 latency > +30% |
| **API Gateway v4.0** | API Gateway | 5% → 20% → 100% | 8 hours | 5xx rate < 0.1% | In progress (20%) | 5xx rate > 0.5% |
| **Auth v2.5.0** | Auth service | 50% → 100% | 2 hours | No auth failures | Completed | Auth failure rate > 0.01% |

### Fault injection results (last 30 days)

| Fault test | Service | Type | Injected | Detected | Resilience | Gap found | Action |
|---|---|---|---|---|---|---|---|
| **YiVad→Search delay** | YiVad | 5s delay | 10% traffic | 100% | Circuit breaker tripped after 3s | Retry timeout too short (2s) | Increase retry budget to 8s |
| **YiAi→LLM abort** | YiAi | 503 abort | 5% traffic | 100% | Retry succeeded, fallback used | Fallback response quality poor | Improve fallback prompt |
| **Payment timeout** | YiWeb | 10s delay | 5% traffic | 85% | Circuit breaker tripped | 15% of requests hung (no CB on old path) | Add CB to legacy payment path |
| **Auth service failure** | All | 500 error | 1% traffic | 100% | All services handled gracefully | None | Resilience confirmed |
| **Database connection loss** | DB proxy | TCP reset | 5% traffic | 95% | Connection pool recovered | 5% leaked connections | Fix connection pool leak detection |

### Service dependency graph

| Service | Inbound from | Outbound to | Connections | Critical path | Circular deps |
|---|---|---|---|---|---|
| **API Gateway** | External (ingress) | 12 services | 12 | Yes (entry point) | No |
| **YiVad Core** | API Gateway, YiWeb | 8 services | 8 | Yes | No |
| **YiAi Agents** | YiVad, API Gateway | 5 services | 5 | Yes | No |
| **Auth service** | 18 services | DB, LDAP, Cache | 3 | Yes | No |
| **Payment service** | YiWeb, YiVad | 4 services | 4 | Yes | No |
| **Database proxy** | 22 services | DB primary, DB replica | 2 | Yes | No |
| **Notification** | 8 services | Email, Push, SMS | 3 | No | No |
| **Search** | YiVad, YiWeb, YiAi | Elasticsearch | 1 | No | No |
| **Cache (Redis)** | 15 services | — | 0 | No | No |
| **YiWeb** | API Gateway | 6 services | 6 | Yes | No |
| **Legacy notification** | YiWeb | Notification (new) | 1 | No | Yes (circular with new) |
| **Analytics pipeline** | 5 services | Data warehouse | 1 | No | Yes (self-referencing) |

### Mesh topology health

| Topology metric | Current | Target | Notes |
|---|---|---|---|
| **Total services** (nodes) | 42 | — | Across 3 clusters |
| **Total connections** (edges) | 285 | — | Inter-service communication paths |
| **Average degree** (connections per service) | 6.8 | < 8 | Healthy, within target |
| **Highest degree** | 22 (DB proxy) | < 15 | DB proxy is a dependency hotspot |
| **Orphaned services** (no inbound) | 3 | 0 | Legacy export tool, old migration service, test service |
| **Orphaned services** (no outbound) | 2 | 0 | Cache (Redis), CDN (outbound-only) |
| **Circular dependencies** | 2 | 0 | Legacy→Notification circular, Analytics self-ref |
| **Critical path services** | 12 | — | Services on the user-facing critical path |
| **Single points of failure** | 4 | < 3 | API Gateway, Auth, DB proxy, Payment |

## Action recommendations

1. **Plaintext elimination**: 6% plaintext traffic; enable mTLS for health checks, migrate legacy notification to sidecar, target 99% mTLS coverage
2. **Certificate expiry monitoring**: 28 certs expiring in 30 days; implement automated alerting at 45/30/14/7 days, auto-rotate all workload certs
3. **Policy violation remediation**: 8 active policy violations; fix retry storm (YiVad→YiAi), add circuit breakers (YiWeb→Payment), fix conflicting retries (YiAi→LLM)
4. **Sidecar stability improvement**: 12 crash loops/month; increase memory limits for YiVad real-time, upgrade Istio for config reload race condition, fix listener overflow
5. **Circular dependency elimination**: 2 circular deps; break Legacy↔Notification circular dependency, fix Analytics self-referencing pipeline
6. **Orphaned service cleanup**: 3 orphaned services; decommission legacy export tool, migrate or delete old migration service, remove test service
7. **Dependency hotspot reduction**: DB proxy at 22 connections (target < 15); evaluate connection pooling, read replicas, or caching layer to reduce direct DB proxy connections
8. **Auto-containment expansion**: 22% auto-containment for security; implement automated circuit breaker trip for 5xx > 50%, auto-retry with exponential backoff
9. **Canary analysis automation**: manual canary analysis; implement automated canary analysis with pre-defined success criteria, auto-rollback on failure
10. **Weekly mesh review**: review sidecar health, mTLS coverage, traffic policy, mesh performance, fault injection results, and topology with SRE and platform engineering



- The mesh as a magic fix → deploying a service mesh and assuming it automatically solves reliability, security, and observability; the mesh provides the primitives (mTLS, retry, circuit breaking) but you still need to configure, test, and tune them
- Default everywhere → using default retry policies, default timeouts, and default circuit breakers without understanding the service's actual behavior; a 2-retry default on a 500ms service creates 3× amplification — defaults are starting points, not solutions
- Sidecar resource starvation → setting sidecar memory limits too low (128 MB) for high-traffic services; a sidecar OOM kills the pod just as effectively as an application OOM; sidecar resources should scale with traffic
- The mesh as a observability replacement → assuming the mesh provides all the observability you need and skipping application-level instrumentation; the mesh sees traffic, not intent — you still need application metrics, logs, and traces
- mTLS theater → enabling mTLS but not verifying certificate identity or SPIFFE compliance; mTLS without identity verification is just encryption, not authentication; the "m" in mTLS matters

## Related

- Same class: [dashboard-system-health](dashboard-system-health.md) — system SLO and health
- Same class: [dashboard-network-health](dashboard-network-health.md) — network health
- Same class: [dashboard-observability-coverage](dashboard-observability-coverage.md) — observability coverage
- Same class: [dashboard-chaos-engineering](dashboard-chaos-engineering.md) — chaos engineering
- Same class: [dashboard-architecture-health](../../engineer/architecture-design/dashboard-architecture-health.md) — architecture health
- References: Istio — *Service Mesh Best Practices*; Linkerd — *Service Mesh Benchmarking*; Envoy — *Proxy Performance Guide*; Google — *Istio in Production*; Buoyant — *Service Mesh Ultimate Guide*; CNCF — *Service Mesh Interface (SMI) Specification*; Christian Posta — *Istio in Action*