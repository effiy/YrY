---
title: Docker and Kubernetes observability
aliases:
- docker-kubernetes-observability
- container-observability
- k8s-observability
- container-monitoring
tags:
- observability
- docker
- kubernetes
- container
- monitoring
- logging
category: oncall-sre/observability
created: 2026-08-07
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles:
- oncall-sre
- engineer
- tech-lead
benefit: "operators can monitor containerized workloads end-to-end with a layered observability stack"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./observability-triad.md
- ./containerized-deployment.md
- ../set-up-observability.md
- ../../engineer/infrastructure/health-check.md
- ../../ai-engineer/platform/llm-observability-comparison.md
tacit: false
---

# Docker and Kubernetes observability

> **As an** oncall SRE, **I want to** monitor Docker and Kubernetes workloads end-to-end, **so that** container health, resource usage, and application behavior are visible at every layer of the stack.

> Container observability spans four layers: infrastructure (node), orchestration (cluster), workload (pod/container), and application (process). Each layer requires distinct metrics, logs, and traces with a unified correlation strategy.

## Summary

- Containerized environments introduce ephemeral workloads, dynamic IPs, and shared kernel resources, making traditional host-based monitoring insufficient.
- The four-layer model (infrastructure, orchestration, workload, application) provides a structured approach to observability in Kubernetes.
- Log aggregation must handle pod lifecycle events: container creation, crash loops, OOM kills, and evictions.
- Prometheus + Grafana is the de facto standard for metrics; Loki + Fluent Bit for logs; Jaeger or Tempo for traces.
- Kubernetes-native signals (probes, events, HPA metrics) should feed into the same observability pipeline as application signals.

## Core viewpoints

### 1. Monitor at four layers, not just the application

Infrastructure layer (node CPU, memory, disk, network, kernel), orchestration layer (API server latency, scheduler throughput, etcd health), workload layer (pod CPU/memory, restart count, OOM kills, evictions), and application layer (request latency, error rate, throughput). Without all four, you cannot distinguish between "application bug" and "node pressure causing eviction." The orchestration layer is the most frequently overlooked -- a slow API server cascades into scheduling delays that look like application timeouts.

### 2. Ephemeral workloads break traditional monitoring

Containers and pods are created and destroyed constantly. IP addresses change, hostnames are meaningless, and metrics by container ID are useless after the container is gone. All metrics must be tagged by Kubernetes metadata (namespace, deployment, pod label) rather than by host or container ID. Log aggregation must preserve these labels even after the pod is deleted.

### 3. Probes are your first line of defense, not an afterthought

Liveness probes prevent zombie containers, readiness probes control traffic routing, and startup probes handle slow-initializing applications. Misconfigured probes cause cascading failures: a readiness probe that is too aggressive removes a pod from service before it is ready; a liveness probe that is too lenient allows a stuck process to consume resources indefinitely. Probe configuration should be treated as a production reliability decision, not a copy-paste template.

### 4. Log aggregation is the foundation of container observability

Without centralized log aggregation, debugging a containerized system is nearly impossible. The stdout/stderr pattern (12-factor app) should be the default. Use a DaemonSet-based log collector (Fluent Bit) to ship logs to a centralized store (Loki, Elasticsearch). Always include pod labels, namespace, and container name in log metadata. Never log to files inside the container unless you have a sidecar to ship them.

## Key info

### The four-layer observability model

| Layer | What to monitor | Tools |
|---|---|---|
| Infrastructure | Node CPU, memory, disk I/O, network, kernel events | Node Exporter, kube-state-metrics |
| Orchestration | API server latency, scheduler queue depth, etcd leader changes, controller manager work queue | Kubernetes metrics-server, kube-state-metrics |
| Workload | Pod CPU/memory, restart count, OOM kills, evictions, image pull errors | cAdvisor (built into kubelet), kube-state-metrics |
| Application | Request latency, error rate, throughput, business metrics | OpenTelemetry SDK, Prometheus client libraries |

### Key Kubernetes signals

- **Pod phase transitions**: Pending -> Running -> Succeeded/Failed. Stuck in Pending = resource shortage or scheduling issue.
- **Restart count**: Increasing restarts = crash loop, likely due to OOM, unhandled exception, or probe failure.
- **OOM kill count**: Container memory limit exceeded. Check `resources.limits.memory` and actual usage.
- **Eviction count**: Node under pressure (disk, memory, PID). Pods get evicted by kubelet.
- **HPA metrics**: CPU/memory utilization vs. requests. If utilization is consistently >80%, scale or adjust requests.
- **Node conditions**: MemoryPressure, DiskPressure, PIDPressure, Ready. Any non-Ready condition is an incident.

### Essential alerts

1. **Pod CrashLoopBackOff**: Restart count > 3 in 5 minutes.
2. **Node NotReady**: Node condition Ready = False for > 2 minutes.
3. **High Pod Restart Rate**: Cluster-wide restart rate > 10/minute.
4. **OOM Kill Rate**: Cluster-wide OOM kills > 5/hour.
5. **Pending Pods**: Pods stuck in Pending for > 5 minutes.
6. **HPA at Capacity**: HPA current replicas = max replicas for > 10 minutes.
7. **Disk Pressure**: Node condition DiskPressure = True.

## Action recommendations

1. Deploy the Prometheus stack (kube-prometheus-stack) with kube-state-metrics and node-exporter as the baseline.
2. Implement a DaemonSet-based log collector (Fluent Bit) shipping to Loki with Kubernetes metadata enrichment.
3. Define liveness/readiness/startup probes for every workload; review probe thresholds during load testing, not in production.
4. Create dashboards that correlate all four layers: click a pod to see its node health, deployment status, and application metrics.
5. Set up OOM kill and eviction alerts with severity by namespace (production = critical, staging = warning).
6. Tag all metrics and logs with `namespace`, `deployment`, `pod_template_hash`, and `app` labels for drill-down.
7. Use OpenTelemetry SDK for application-level instrumentation; propagate trace context across service boundaries.

## Anti-patterns

- **Monitoring only application metrics** -- node pressure or API server latency can cause application failures with no application-level signal.
- **Logging to container filesystem** -- logs are lost when the pod is deleted; use stdout/stderr or a sidecar.
- **No resource limits** -- a container without limits can consume all node resources and trigger evictions of other pods.
- **Probe as health check** -- a liveness probe that checks an external dependency (database, API) causes cascading restarts when the dependency is slow.
- **Alerting on pod restarts without context** -- a rolling update naturally causes restarts; alert on crash loops, not all restarts.
- **Ignoring control plane metrics** -- etcd latency, API server request duration, and scheduler throughput directly impact workload scheduling.

## Related

- Same category: [./observability-triad.md](./observability-triad.md) -- logs, metrics, traces framework
- Same category: [./containerized-deployment.md](./containerized-deployment.md) -- deployment strategies
- Same category: [../set-up-observability.md](./set-up-observability.md) -- observability setup journey
- Upstream: [../../engineer/infrastructure/health-check.md](../../engineer/infrastructure/health-check.md) -- health check patterns
- Downstream: [../../ai-engineer/platform/llm-observability-comparison.md](../../ai-engineer/platform/llm-observability-comparison.md) -- LLM-specific observability

## References

- Kubernetes documentation: Monitor Node Health, Configure Liveness/Readiness/Startup Probes
- Prometheus Operator: kube-prometheus-stack
- Fluent Bit: Kubernetes log collection documentation
- Google SRE Book: Monitoring Distributed Systems chapter