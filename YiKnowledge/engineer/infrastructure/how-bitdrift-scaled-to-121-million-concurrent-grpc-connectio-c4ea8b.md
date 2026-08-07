---
title: How bitdrift scaled to 121 million concurrent gRPC connections on Amazon CloudFront for live telemetry sporting events
tags: [gRPC, CloudFront, Route 53, DNS, multi-value-routing, scaling, NLB, persistent-connections]
category: engineer/infrastructure
created: '2026-08-05'
updated: 2026-08-07
source: https://aws.amazon.com/blogs/architecture/how-bitdrift-scaled-to-121-million-concurrent-grpc-connections-on-amazon-cloudfront-for-live-telemetry-sporting-events/
source_name: AWS Architecture
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles: [engineer, tech-lead, devops, sre]
benefit: "A single DNS routing policy change (Weighted to Multi-Value Answer) eliminated 99.96% of 5xx errors at 121M concurrent connections -- no code changes required."
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - ../quality-security/do-a-load-test.md
  - ./set-up-ci-cd.md
---

# How bitdrift scaled to 121 million concurrent gRPC connections on Amazon CloudFront

> **As an** SRE managing CloudFront distributions with persistent connections, **I want to** ensure origin load is evenly distributed across all NLBs, **so that** traffic surges do not create a thundering herd that overwhelms individual origins.

## Summary

- bitdrift, a mobile observability platform, faced 80% request failure rates during live T20 World Cup cricket matches when traffic surged from near-zero to 110K+ peak requests per second.
- Root cause: Route 53 Weighted routing returns a single IP per DNS response. All CloudFront edge nodes resolved to the same NLB for the duration of the TTL (60s), creating a thundering herd effect.
- Persistent gRPC connections amplify this problem: unlike short-lived HTTP requests, gRPC connections accumulate on whichever origin was resolved at connection time, making uneven distribution catastrophic.
- The fix: switch from Weighted to Multi-Value Answer routing, which returns up to 8 IPs per DNS response with built-in health checks. CloudFront edge nodes immediately spread connections across all origins.
- After the change: 121M unique devices, 110K+ peak req/s, zero server-side errors. Peak 5xx error rate dropped from 79.80% to 0.033% (2,418x improvement).

## Core viewpoints

### 1. DNS routing policy is a critical scaling decision at extreme scale

Weighted routing is appropriate for many use cases, but behind CloudFront with persistent connections, it creates a single-origin bottleneck. Multi-Value Answer routing is the correct choice when you have multiple origin load balancers and need immediate distribution from the first DNS resolution.

### 2. Persistent connections (gRPC, WebSocket) amplify DNS issues

A DNS misconfiguration that causes mild unevenness with stateless HTTP traffic causes catastrophic overload with persistent connections. The connections accumulate and never rebalance. This is a scaling trap that only manifests under production load.

### 3. Scaling more origins does not fix a routing problem

bitdrift scaled from 2 to 6 NLB IPs and saw no improvement because Weighted routing still returned a single IP per response. Adding more origins is useless if the routing policy funnels all traffic to one. Fix the routing, then scale.

### 4. The 100x surge from near-zero to peak is the real scaling challenge

bitdrift's traffic during live sporting events goes from near-zero to 110K+ req/s in seconds. This is not gradual scaling; it is a vertical wall. DNS-based routing with Multi-Value Answer handles this because it distributes connections at resolution time, before any traffic arrives. Autoscaling alone cannot react fast enough to a 100x surge -- the distribution mechanism must be correct from the first packet.

### 5. Elastic IPs on NLBs are a constraint that becomes a feature at scale

The requirement for static IPs forces explicit network design. Each NLB AZ endpoint gets a known, stable IP, which means CloudFront origin configuration is deterministic, health checks are targeted, and failover behavior is predictable. Dynamic IPs (as with ALBs) create hidden dependencies on DNS propagation that break at scale. What looks like a limitation -- "you must use Elastic IPs" -- is actually the property that makes the architecture debuggable under extreme load.

## Key info

- Before: Weighted routing, 79.80% peak 5xx error rate, 1.87% avg 5xx error rate, multiple origin failures.
- After: Multi-Value Answer routing, 0.033% peak 5xx, 0.003% avg 5xx, zero server-side outages.
- 121M unique devices, 110K+ peak req/s, 100x traffic surge (near-zero to peak in seconds).
- Multi-Value Answer routing requires Elastic IP addresses on NLBs (not ALBs, which lack static IPs) and health checks on each record.
- TTL recommendation: 60 seconds for faster failover on unhealthy origins.

## Action recommendations

1. Audit your CloudFront origin routing policy. If using Weighted routing with multiple NLBs and persistent connections, switch to Multi-Value Answer routing.
2. Assign Elastic IP addresses to each NLB Availability Zone before switching. ALBs are not compatible with this pattern.
3. Create health checks for each NLB (TCP on port 443, 10-second interval, failure threshold of 3).
4. Engage AWS service teams for pre-event capacity reviews before major traffic events.

## Anti-patterns

- **Using weighted routing behind CloudFront with multiple origin load balanc....** Do not use Weighted routing behind CloudFront with multiple origin load balancers and persistent connections. The single-IP-per-response behavior creates a thundering herd.

- **Using multi-Value Answer routing with ALBs.** Do not use Multi-Value Answer routing with ALBs. ALBs lack static IP addresses; only NLBs with Elastic IPs work.

- **Skipping health checks.** Do not skip health checks. Multi-Value Answer routing requires them to automatically remove unhealthy origins from DNS responses.

- **Assuming that adding more origins compensates for a routing problem.** Do not assume that adding more origins compensates for a routing problem. bitdrift scaled from 2 to 6 NLBs with zero improvement because all traffic still funneled to one IP. Fix the distribution mechanism first, then scale capacity.

- **Setting DNS TTLs too high for Multi-Value Answer routing.** Do not set DNS TTLs too high for Multi-Value Answer routing. The TTL controls how long CloudFront edge nodes cache the set of origin IPs. A 300-second TTL means a failed origin stays in the rotation for 5 minutes. Use 60-second TTLs for faster failover at the cost of slightly more DNS queries.

## Related

- ../quality-security/do-a-load-test.md
- ./set-up-ci-cd.md