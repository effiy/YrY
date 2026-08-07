---
title: Health Check Pattern
aliases: [health-check-pattern, liveness-readiness-pattern, health-probe-pattern]
tags: [pattern, engineering patterns, health-check, probe, SRE]
category: engineer/infrastructure
created: 2026-08-03
updated: 2026-08-03
source: internal
type: pattern
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-03
tacit: false
roles: [engineer, tech-lead, oncall-sre]
benefit: "Service health is monitored through standardized endpoints, enabling automated failover and load balancer decisions"
acceptance_criteria:
  - "pattern name, problem statement, and solution approach are all described"
  - "trade-offs and when-not-to-use-this-pattern are explicitly stated"
  - "at least one concrete example or code snippet is provided
related:
  - ./blue-green-deployment.md
  - ./canary-deployment.md
  - ../../oncall-sre/observability/set-up-observability.md
---

# Health Check Pattern

> **As an** engineer, **I want to** health check, **so that** pattern applied consistently.

## Summary

Three tiers — liveness / readiness / startup — plus active probes + passive reporting + upstream-derived assertions + end-to-end synthetic probes; do not rely on timeouts to judge liveness; links with circuit-breaker / graceful-degradation / blue-green / canary; suitable for long-running services + K8s / Mesh / multi-downstream orchestration; not suitable for single-machine / minimal stateless.

## Problem

- **Judge liveness by timeout**: client passively waits for connection timeout; downstream slow-death discovered only after 30s; user gets 504.
- **No liveness vs readiness distinction**: service gets cut off during startup; slow startup killed in a loop; OOM jitter triggers restart flooding.
- **Health endpoint pretends**: returns 200 OK but DB / cache / downstream all down; fake green.
- **No recursive downstream health**: A healthy but B down; A still reports healthy; upstream unaware; cascading failure.
- **No orchestrator linkage**: probe results only on dashboard; no auto traffic cut + no restart; manual firefighting.
- **Synthetic probe not run**: probes only every 5 minutes; failure discovered 5 minutes later; SLO budget half burned.
- **Health endpoint exposes internals**: unauthenticated + attackers can enumerate downstream; info leak.

## Pattern

**Core**: three tiers — liveness + readiness + startup; active probes + passive metrics + upstream-derived assertions; end-to-end synthetic probes; do not rely on timeouts; link with orchestrator for traffic cut + restart + circuit breaking.

**Three-tier probe matrix**:

| Tier | Responsibility | Failure consequence | Triggered by |
|---|---|---|---|
| Liveness | Is the process alive | Restart | orchestrator |
| Readiness | Can it take traffic | Traffic cut | orchestrator + LB |
| Startup | Protect slow-starting processes | No kill during startup | orchestrator |
| Shutdown | Graceful exit | Reject new requests | LB + orchestrator |

**Key code**:

```python
class HealthProbe:
    """Health probe; liveness + readiness + startup three-tier split."""
    def __init__(self, deps, startup_deadline_s=180):
        self.deps = deps  # db, cache, downstream, queue
        self._started_at = time.monotonic()
        self._startup_deadline = startup_deadline_s

    def liveness(self):
        # Is the process alive; lightweight + no downstream check; restart on timeout
        return {"status": "alive", "uptime_s": time.monotonic() - self._started_at}

    def readiness(self):
        # Can it take traffic; check local state + key downstream; cut traffic on timeout
        checks = {}
        for name, dep in self.deps.items():
            checks[name] = self._probe(dep, timeout_ms=200)
        status = "ready" if all(v == "ok" for v in checks.values()) else "not_ready"
        return {"status": status, "checks": checks}

    def startup(self):
        # Startup protection; slow startup not killed by liveness
        elapsed = time.monotonic() - self._started_at
        if elapsed < self._startup_deadline:
            return {"status": "starting", "elapsed_s": elapsed, "deadline_s": self._startup_deadline}
        # Past deadline, switch to normal liveness
        return self.liveness()

    def shutdown(self):
        # Graceful exit; reject new requests + drain in-flight
        return {"status": "draining", "in_flight": self._in_flight_count()}


class DeepHealthAggregator:
    """Recursive downstream health aggregation; not just the local endpoint."""
    def __init__(self, deps_health_urls):
        self.urls = deps_health_urls  # {"db": "http://db/health", "downstream": "http://d/health"}

    async def deep_check(self, timeout_ms=200):
        # Parallel query each downstream + aggregate + any down → not_ready
        async def one(name, url):
            try:
                r = await httpx.get(url, timeout=timeout_ms / 1000)
                return name, r.json().get("status") if r.status_code == 200 else "down"
            except Exception:
                return name, "down"
        results = await asyncio.gather(*[one(n, u) for n, u in self.urls.items()])
        return dict(results)


class SyntheticProber:
    """End-to-end synthetic probe; not just endpoint 200."""
    def __init__(self, scenario, schedule_s=60):
        self.scenario = scenario  # {"login": "/api/login", "query": "/api/search?q=ai"}
        self.schedule = schedule_s

    async def probe(self):
        # Run full user journeys; not just ping /health
        for step_name, path in self.scenario.items():
            t0 = time.monotonic()
            try:
                r = await httpx.get(path)
                latency_ms = (time.monotonic() - t0) * 1000
                if r.status_code != 200:
                    return {"status": "fail", "step": step_name, "code": r.status_code}
                if latency_ms > 2000:
                    return {"status": "slow", "step": step_name, "latency_ms": latency_ms}
            except Exception as e:
                return {"status": "error", "step": step_name, "error": str(e)}
        return {"status": "ok"}
```

## Applicable

- Long-running services (HTTP / RPC / worker / scheduler)
- K8s / Nomad / Service Mesh orchestration (livenessProbe / readinessProbe / startupProbe)
- Multi-downstream orchestration (API gateway / BFF / aggregator / saga orchestrator)
- Blue-green + canary + gray (cut traffic only when healthy)
- Auto scaling (HPA based on readiness and latency)
- Failover (multi-region / multi-provider)
- Oncall alerts (health failure → SLO burn → alert)

## Not applicable

- Single-machine scripts / one-shot tasks (exit code is health)
- Minimal stateless services (LB health check suffices)
- Strongly consistent real-time transactions (health ≠ consistency; use saga state machine)
- Client without orchestrator (use client retry + timeout)
- Offline batch processing (no long-term traffic; use monitoring / alerting)

## Landing checklist

1. **Three tiers**: liveness + readiness + startup; do not mix; split by responsibility into paths `/health/live` + `/health/ready` + `/health/startup`.
2. **Liveness lightweight**: in-process state; no downstream check; 1s timeout; restart only on failure.
3. **Readiness checks downstream**: local + key downstream; 200ms timeout; cut traffic not restart on failure.
4. **Startup protection**: protect slow-starting processes (JVM warmup / model load); deadline 180s+; past deadline switch to liveness.
5. **Shutdown drain**: SIGTERM → reject new requests + drain in-flight + close connection pool; do not exit immediately.
6. **Recursive downstream health**: aggregate downstream health; any down → not_ready; not just local 200.
7. **Timeout + retry**: downstream probe timeout 200ms + 1 retry; do not block the main process.
8. **Synthetic probe**: run key user journeys (login / search / checkout); not just ping /health; once per minute.
9. **Metric reporting**: health state + latency + failure count + downstream state + report metric; not only on endpoint.
10. **Orchestrator linkage**: K8s livenessProbe → restart + readinessProbe → Service traffic cut + startupProbe → startup protection.
11. **LB / gateway linkage**: Nginx / Envoy / Kong actively probe + cut traffic on failure + do not route to not_ready.
12. **Circuit-breaking linkage**: probe failure → circuit breaker open → upstream fallback; do not probe a dead downstream infinitely.
13. **Alert linkage**: N consecutive failures → alert; not just a single jitter alert.
14. **Auth protection**: health endpoints internal + no PII exposed + no downstream enumeration; external via LB on a separate path.
15. **CI gate**: health endpoints must have contract tests; changing field names + changing state values must block via baseline diff.
16. **Degradation linkage**: readiness not_ready → graceful-degradation fallback; not a 500 full page.
17. **Multi-region probe**: probe across regions; region not_ready → DNS traffic cut; not just local probe.
18. **Observability**: probe success rate + latency + traffic-cut count + restart count; observe per service dimension.



- **Judge liveness by timeout**: discovered dead after 30s; fix: probes + active probe.
- **Liveness checks downstream**: downstream jitter → liveness failure → restart flooding; fix: liveness only checks process + readiness checks downstream.
- **Health endpoint pretends**: always 200; downstream all down unknown; fix: readiness checks downstream + recursive aggregation.
- **No recursive downstream**: A reports health but B down; upstream unaware; fix: DeepHealthAggregator aggregation.
- **No synthetic probe**: ping once every 5 minutes; failure discovered 5 minutes later; fix: synthetic run of user journeys every minute.
- **No orchestrator linkage**: probes only on dashboard; no traffic cut + no restart; fix: probes → K8s / LB linkage.
- **Killed during startup**: livenessProbe probes during startup; slow startup killed in a loop; fix: startupProbe protection.
- **Shutdown does not drain**: SIGTERM exits immediately; in-flight 504; fix: drain + close connection pool + graceful exit.
- **Health endpoint exposes PII**: returns internal details + downstream list; fix: internal-only + no PII returned.
- **No auth protection**: open on public network; attackers enumerate downstream; fix: LB restricted to internal + separate path.
- **No circuit-breaking linkage**: probe failure + no circuit break + upstream probes a dead downstream infinitely; fix: probe failure → circuit breaker open.
- **Single jitter alert**: alert on one failure; oncall fatigue; fix: alert only after N consecutive failures.

## Related

- [circuit-breaker-pattern](../architecture-design/circuit-breaker.md) — probe failure → circuit breaker open co-build
- [graceful-degradation-pattern](../architecture-design/graceful-degradation.md) — not_ready → degradation co-build
- [observability-pattern](../engineering/observability.md) — health + latency + failure rate reporting co-build
- [rate-limiting-pattern](../engineering/rate-limiting.md) — health endpoint rate-limit to prevent abuse co-build
- [api-gateway-pattern](../architecture-design/api-gateway.md) — gateway active probe + traffic cut on failure co-build
- [blue-green-deployment-pattern](./blue-green-deployment.md) — cut traffic only when healthy co-build
- [canary-deployment-pattern](./canary-deployment.md) — release traffic only when healthy co-build
- [timeout-budget-pattern](../infrastructure/timeout-budget.md) — probe timeout short and independent co-build
- [bulkhead-pattern](../architecture-design/bulkhead.md) — probe + per-downstream isolated pool co-build
- [distributed-tracing-pattern](../engineering/distributed-tracing.md) — health link trace co-build
- Landing cases: pending landing of YiAi multi-provider health probes + YiVad aicr health aggregation
- Upstream: [../strategies/prepare-an-sre-strategy.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-an-sre-strategy.md)
- Upstream: [../../oncall-sre/observability/set-up-observability.md](../../oncall-sre/observability/set-up-observability.md)
- Downstream: [../lessons/gotchas/README.md](../lessons/README.md)
