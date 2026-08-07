---
title: chaos engineering dashboard
aliases:
- resilience testing dashboard
- chaos experiment dashboard
- failure injection dashboard
- game day dashboard
tags:
- dashboard
- chaos-engineering
- resilience
- fault-injection
- game-day
- blast-radius
- reliability
category: oncall-sre/observability
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: dashboard
status: stable
lifecycle: active
review_cycle: monthly
roles:
- oncall-sre
- tech-lead
- engineer
benefit: chaos engineering program health and resilience posture visible at a glance
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
- experiment coverage, failure injection, resilience scoring, game days, and blast radius control defined
related:
- ./dashboard-system-health.md
- ./dashboard-observability-coverage.md
- ./dashboard-business-continuity.md
- ../incident-response/dashboard-incident-trends.md
- ../../engineer/infrastructure/dashboard-deployment-safety.md
tacit: false
---

# chaos engineering dashboard

> **As an** SRE, **I want to** track chaos engineering experiments and resilience posture, **so that** every critical failure mode is tested, every service degrades gracefully, and the system's resilience is proven, not assumed.

> Chaos engineering is not about breaking things — it's about surfacing the unknown-unknowns in complex systems. This dashboard tracks experiment coverage, failure injection methods, resilience scoring, game day execution, and blast radius control across all critical services.

## Summary

- 5 chaos engineering dimensions: experiment coverage, failure injection, resilience scoring, game days, blast radius control
- 85 chaos experiments defined across 42 services; 62 executed (73%); 58 passed (94% pass rate); 4 failed (6% failure rate)
- Failure injection methods: resource exhaustion (CPU/memory/disk), network disruption (latency/packet loss/partition), dependency failure, state corruption, region failure
- Game days conducted quarterly: 4 game days/year, 85% participation rate, average 12 engineers per game day
- Dashboard reviewed monthly; chaos engineering review quarterly with SRE and platform teams

## Core viewpoints

- Resilience is not a property you can assert — it's a property you must prove; the only way to know if your system tolerates a failure mode is to test it in production
- Start small, grow intentionally — chaos engineering begins with a single experiment on a single service in a controlled environment; expand scope as confidence grows
- Blast radius is the first design constraint — every experiment must have a defined blast radius, a kill switch, and a rollback plan before it starts
- Game days are organizational learning events — the goal is not to break things but to learn how the system and the team respond; every finding is a gift

## Key information

### 5-panel chaos engineering overview

```
┌──────────────────────────────────────────────────────────────────┐
│  EXPERIMENT COVERAGE              │  FAILURE INJECTION                │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Experiments: 85 total  │   │  │  Resource exhaustion: 28 │   │
│  │  Executed:    62 (73%)  │   │  │  Network disruption: 22  │   │
│  │  Passed:      58 (94%)  │   │  │  Dependency failure: 18  │   │
│  │  Failed:       4 (6%)   │   │  │  State corruption: 10    │   │
│  │  Not executed: 23 (27%) │   │  │  Region failure:   7     │   │
│  │  Coverage:    62%       │   │  │  Auto-injection:  28 (33%)│   │
│  │  Auto-pass:   48%       │   │  │  Manual injection: 57    │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  RESILIENCE SCORING               │  GAME DAYS                        │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Overall:   72/100       │   │  │  Game days: 4/yr         │   │
│  │  Tier 0:    78/100       │   │  │  Participation: 85%      │   │
│  │  Tier 1:    70/100       │   │  │  Avg participants: 12    │   │
│  │  Tier 2:    62/100       │   │  │  Findings:    28/yr      │   │
│  │  Auto-recovery: 68%      │   │  │  Fixed:       24 (86%)   │   │
│  │  Graceful deg: 75%       │   │  │  Open:         4 (14%)   │   │
│  │  Time to detect: 2.8 min │   │  │  Next:     Q4 2026       │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Experiment inventory

| Experiment ID | Service | Failure mode | Injection method | Status | Last run | Result | Recovery time | Findings |
|---|---|---|---|---|---|---|---|---|
| CHAOS-001 | API Gateway | Node failure | Terminate 50% pods | Passed | 2026-08-01 | Auto-recovered | 45s | Load balancer rebalance: OK |
| CHAOS-002 | API Gateway | Network latency | 500ms inject to DB | Passed | 2026-07-28 | Auto-recovered | 0s | Circuit breaker opened correctly |
| CHAOS-003 | Auth Service | Redis cache failure | Terminate Redis pods | Passed | 2026-07-25 | Degraded (2s latency) | 30s | Fallback to DB auth: OK, latency ↑ |
| CHAOS-004 | Auth Service | Token signing key rotation | Manual key rotation | Failed | 2026-07-15 | Partial outage | 8 min | **Token invalidation race condition** |
| CHAOS-005 | Chat Inference | GPU node failure | Terminate 50% GPU pods | Passed | 2026-07-30 | Auto-recovered | 90s | Model reload time: acceptable |
| CHAOS-006 | Chat Inference | GPU memory exhaustion | Fill GPU memory to 95% | Passed | 2026-07-22 | Degraded | 0s | Request queuing: OK, OOM prevented |
| CHAOS-007 | Knowledge Search | Elasticsearch node failure | Terminate 33% ES nodes | Passed | 2026-07-20 | Auto-recovered | 120s | Shard rebalancing: OK |
| CHAOS-008 | Knowledge Search | Index corruption | Corrupt 1 shard replica | Passed | 2026-07-18 | Auto-recovered | 45s | Replica promotion: OK |
| CHAOS-009 | Database Primary | Primary DB failure | Force failover | Passed | 2026-07-10 | Auto-recovered | 180s | **Failover time exceeds SLO (180s vs 120s target)** |
| CHAOS-010 | Database Primary | Connection pool exhaustion | Open 500 idle connections | Failed | 2026-07-05 | Partial outage | 12 min | **No connection pool circuit breaker** |
| CHAOS-011 | Payment Service | Downstream acquirer timeout | 30s delay on /charge | Passed | 2026-07-15 | Degraded | 0s | Retry with exponential backoff: OK |
| CHAOS-012 | Payment Service | Idempotency key collision | Duplicate idempotency keys | Passed | 2026-07-08 | Normal | 0s | Idempotency guard: OK |
| CHAOS-013 | Message Queue | Broker partition | Network partition 1/3 brokers | Passed | 2026-07-12 | Auto-recovered | 60s | ISR re-election: OK |
| CHAOS-014 | Message Queue | Consumer group stall | Stop all consumers for 5 min | Passed | 2026-07-05 | Degraded | 300s | Backlog cleared in 8 min after restore |
| CHAOS-015 | File Storage | Disk fill | Fill disk to 95% | Passed | 2026-06-28 | Auto-recovered | 0s | Disk pressure eviction: OK |
| CHAOS-016 | CDN | Origin failure | Simulate origin 503 | Not executed | — | — | — | Scheduled Q4 2026 |
| CHAOS-017 | Notification Service | Provider outage | Simulate FCM/APNs failure | Not executed | — | — | — | Scheduled Q4 2026 |
| CHAOS-018 | Full stack | Region failure | Simulate us-east-1 outage | Not executed | — | — | — | Game day Q4 2026 |

### Experiment coverage by service tier

| Tier | Services | Experiments defined | Experiments executed | Coverage % | Pass rate | Auto-recovery % | Resilience score |
|---|---|---|---|---|---|---|---|
| **Tier 0 (critical)** | 6 | 38 | 32 | 84% | 91% | 72% | 78/100 |
| **Tier 1 (business)** | 12 | 28 | 20 | 71% | 95% | 68% | 70/100 |
| **Tier 2 (internal)** | 14 | 14 | 8 | 57% | 100% | 62% | 62/100 |
| **Tier 3 (dev/test)** | 10 | 5 | 2 | 40% | 100% | 75% | 55/100 |
| **Total** | **42** | **85** | **62** | **73%** | **94%** | **68%** | **72/100** |

### Failure injection catalog

| Injection type | Experiments | Passed | Failed | Not executed | Avg recovery time | Top finding |
|---|---|---|---|---|---|---|
| **CPU exhaustion** | 12 | 11 | 0 | 1 | 0s (throttled) | CPU throttling protects neighboring pods |
| **Memory exhaustion** | 10 | 9 | 1 | 0 | 45s (OOM kill + restart) | 1 service lacks memory limits |
| **Disk exhaustion** | 6 | 6 | 0 | 0 | 0s (eviction) | Disk pressure eviction works across all nodes |
| **Network latency** | 10 | 10 | 0 | 0 | 0s (circuit breaker) | Circuit breaker thresholds well-tuned |
| **Network packet loss** | 6 | 5 | 0 | 1 | 15s (retry) | 5% loss tolerable, 10% degrades UX |
| **Network partition** | 6 | 5 | 1 | 0 | 180s (partition heal) | Split-brain in 1 stateful service |
| **Dependency failure** | 12 | 10 | 1 | 1 | 30s (fallback) | 2 services have no graceful fallback |
| **Dependency slowdown** | 6 | 6 | 0 | 0 | 0s (timeout) | Timeout values appropriate |
| **State corruption** | 5 | 4 | 1 | 0 | 120s (rebuild) | 1 service can't detect corrupted state |
| **Data loss (simulated)** | 5 | 5 | 0 | 0 | 60s (restore) | Backup restoration within RPO |
| **Region failure** | 4 | 0 | 0 | 4 | — | 3/4 not yet executed |
| **AZ failure** | 3 | 2 | 0 | 1 | 90s (cross-AZ failover) | Multi-AZ failover: OK |
| **Total** | **85** | **73** | **4** | **8** | | |

### Resilience scoring framework

| Service | Fault tolerance | Auto-recovery | Graceful degradation | Time to detect | Time to recover | Redundancy | Overall score |
|---|---|---|---|---|---|---|---|
| API Gateway | 18/20 | 16/20 | 15/20 | 16/20 | 15/20 | 18/20 | **82/100** |
| Auth Service | 16/20 | 14/20 | 14/20 | 14/20 | 12/20 | 16/20 | **72/100** |
| Chat Inference | 14/20 | 13/20 | 13/20 | 15/20 | 13/20 | 14/20 | **68/100** |
| Knowledge Search | 16/20 | 15/20 | 14/20 | 15/20 | 14/20 | 16/20 | **75/100** |
| Database Primary | 14/20 | 12/20 | 12/20 | 12/20 | 10/20 | 14/20 | **62/100** |
| Message Queue | 15/20 | 14/20 | 13/20 | 14/20 | 14/20 | 15/20 | **71/100** |
| Payment Service | 17/20 | 15/20 | 15/20 | 16/20 | 14/20 | 16/20 | **78/100** |
| Code Review | 13/20 | 12/20 | 12/20 | 13/20 | 12/20 | 13/20 | **65/100** |
| File Storage | 14/20 | 13/20 | 12/20 | 13/20 | 12/20 | 14/20 | **68/100** |
| Notification Service | 12/20 | 11/20 | 11/20 | 12/20 | 10/20 | 12/20 | **58/100** |
| **Overall** | | | | | | | **72/100** |

### Game day calendar and outcomes

| Game day | Date | Scenario | Participants | Duration | Findings | Critical | Fixed | Open |
|---|---|---|---|---|---|---|---|---|
| **Q3 2026** | 2026-08-15 | Payment system cascade failure | 14 | 4 hours | 8 | 2 | 5 | 3 |
| **Q2 2026** | 2026-05-20 | Region-wide network partition | 12 | 4 hours | 7 | 1 | 6 | 1 |
| **Q1 2026** | 2026-02-18 | Database primary multi-failure | 10 | 3 hours | 6 | 2 | 6 | 0 |
| **Q4 2025** | 2025-11-12 | DDoS + credential stuffing | 12 | 4 hours | 7 | 1 | 7 | 0 |
| **Total** | | | **48** | **15 hours** | **28** | **6** | **24** | **4** |

### Game day findings register

| ID | Game day | Finding | Severity | Service | Status | Fix | Owner |
|---|---|---|---|---|---|---|---|
| GD-2026-Q3-01 | Q3 2026 | Payment retry storm when acquirer slow | Critical | Payment | Open | Circuit breaker + retry budget | Payment Lead |
| GD-2026-Q3-02 | Q3 2026 | Order idempotency breaks under partition | Critical | Payment | Open | Distributed idempotency store | Platform Lead |
| GD-2026-Q2-01 | Q2 2026 | Split-brain in session store during partition | High | Auth | Fixed | Raft consensus for session replication | Auth Lead |
| GD-2026-Q2-02 | Q2 2026 | Cache stampede on partition heal | Medium | Knowledge Search | Fixed | Cache warming with jitter | Search Lead |
| GD-2026-Q1-01 | Q1 2026 | DB failover > SLO (180s vs 120s) | High | Database | Open | Connection pool failover optimization | SRE Lead |
| GD-2026-Q1-02 | Q1 2026 | Read replica lag spikes during failover | Medium | Database | Fixed | Replica lag-aware routing | SRE Lead |
| GD-2025-Q4-01 | Q4 2025 | Rate limiter not effective under DDoS | Critical | API Gateway | Fixed | Adaptive rate limiting with ML | Platform Lead |
| GD-2025-Q4-02 | Q4 2025 | Credential stuffing undetected for 15 min | High | Auth | Fixed | Anomaly detection on login patterns | Auth Lead |

### Blast radius control

| Experiment | Scope | Radius | Containment | Kill switch | Monitoring | Rollback | Risk level |
|---|---|---|---|---|---|---|---|
| Node failure | Single pod → 50% pods | Service-level | PodAntiAffinity | `kubectl scale --replicas=N` | Pod health, error rate, latency | Restore replicas | Low |
| Network latency | 1% → 10% → 50% traffic | Traffic % | Istio VirtualService | `kubectl delete -f fault.yaml` | Latency p50/p90/p99, error rate | Remove fault injection | Low |
| Dependency failure | Single dependency | Service + downstream | Circuit breaker | Remove fault injection | Error rate, circuit state | Dependency restore | Medium |
| AZ failure | Single AZ | Multi-service in AZ | AZ isolation | Traffic shift away from AZ | Cross-AZ latency, error rate | Restore AZ | High |
| Region failure | Simulated region outage | Multi-region | Region isolation | DNS failover | Cross-region latency, consistency | DNS failback | Critical |
| DB primary failover | Single DB instance | DB + all writers | Read replica promotion | `pg_ctl promote` | Replication lag, write availability | Failback to original | High |

### Chaos engineering maturity

| Maturity level | Description | Current | Target |
|---|---|---|---|
| **L1: Ad-hoc** | Manual experiments, no formal process | — | — |
| **L2: Planned** | Documented experiments, scheduled game days | — | — |
| **L3: Automated** | Auto-injection in staging, game days quarterly | ← We are here (3.2) | — |
| **L4: Continuous** | Automated production experiments, CI/CD integrated | — | Q2 2027 |
| **L5: Adaptive** | ML-driven experiment selection, self-healing verification | — | Q4 2027 |

### Chaos engineering tooling

| Tool | Purpose | Status | Coverage | Issues |
|---|---|---|---|---|
| **Chaos Mesh** | Kubernetes-native chaos | Active | 38/42 services | Limited network partition scenarios |
| **LitmusChaos** | Declarative chaos workflows | Active | 28/42 services | Hub integration incomplete |
| **Gremlin** | Managed chaos platform | Evaluating | — | Cost evaluation for 42 services |
| **AWS Fault Injection Simulator** | AWS service chaos | Active | 12 AWS services | Not all services in AWS |
| **Custom scripts** | Service-specific injection | Active | 8 services | Maintenance burden |
| **Chaos Dashboard** | Experiment management UI | Active | All experiments | UI refresh needed |

## Action recommendations

1. **Database resilience improvement**: 62/100 resilience score, 2 failed experiments; implement connection pool circuit breaker, optimize failover time (180s→120s)
2. **Region failure game day**: 4 region failure experiments not executed; schedule Q4 2026 game day, simulate full us-east-1 outage, validate cross-region failover
3. **Auto-injection in CI/CD**: 33% auto-injection; integrate chaos experiments into post-deployment pipeline for all Tier 0 services
4. **Notification service resilience**: 58/100 score, no experiments executed; design and execute 5 experiments for Notification Service
5. **Failed experiment follow-up**: CHAOS-004 (token race condition), CHAOS-010 (connection pool); fix and re-execute within 30 days
6. **Game day finding closure**: 4 open findings from game days; prioritize GD-2026-Q3-01 (payment retry storm) and GD-2026-Q1-01 (DB failover)
7. **Blast radius standardization**: inconsistent blast radius definitions; create blast radius tiers (1 pod → 10% → 50% → AZ → Region) with standard kill switches
8. **Chaos engineering training**: 85% participation in game days; train 20 more engineers on chaos experiment design, target 100% participation
9. **Gremlin evaluation**: complete Gremlin PoC by Q4 2026, evaluate against Chaos Mesh + Litmus for managed chaos
10. **Monthly chaos review**: review experiment coverage, failed experiments, game day findings, and resilience scores with SRE and platform teams



- Chaos without observability → running experiments without monitoring in place; if you can't see the impact, you're not learning, you're just breaking things
- Friday afternoon chaos → running experiments before a weekend or holiday; chaos experiments should be run when the full team is available to respond
- Blast radius creep → starting with a small experiment and expanding without re-evaluating risk; every expansion of scope requires a new risk assessment
- Pass-only culture → celebrating only passing experiments; a failed experiment is a success — it found a vulnerability before production did
- Chaos as a checkbox → running the same experiments every quarter without adding new scenarios; the system changes, the experiments must evolve

## Related

- Same class: [dashboard-system-health](dashboard-system-health.md) — system SLO and health
- Same class: [dashboard-observability-coverage](dashboard-observability-coverage.md) — observability and monitoring coverage
- Same class: [dashboard-business-continuity](dashboard-business-continuity.md) — BC/DR planning
- Same class: [dashboard-incident-trends](../incident-response/dashboard-incident-trends.md) — incident trends and analysis
- Same class: [dashboard-deployment-safety](../../engineer/infrastructure/dashboard-deployment-safety.md) — deployment safety
- References: Netflix — *Chaos Engineering* (Principles of Chaos Engineering); Casey Rosenthal & Nora Jones — *Chaos Engineering: Building Confidence in System Behavior*; AWS — *Well-Architected Reliability Pillar*; Gremlin — *Chaos Engineering Maturity Model*; CNCF — *Chaos Mesh & LitmusChaos*