---
title: Reverse proxy patterns
aliases:
- reverse-proxy
- nginx-patterns
- envoy-patterns
- traefik-patterns
- load-balancing
tags:
- reverse-proxy
- nginx
- envoy
- traefik
- load-balancing
- tls
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
benefit: "operators can select and configure reverse proxies for load balancing, TLS termination, routing, and rate limiting"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./docker-kubernetes.md
- ./containerized-deployment.md
- ./observability-triad.md
- ../../engineer/architecture-design/api-gateway.md
- ../../engineer/infrastructure/health-check.md
tacit: false
---

# Reverse proxy patterns

> **As an** oncall SRE, **I want to** understand reverse proxy patterns and configurations, **so that** I can design reliable, secure, and performant traffic management for web services.

> A reverse proxy sits between clients and backend servers, handling TLS termination, load balancing, request routing, rate limiting, caching, and authentication. Choosing the right proxy and configuring it correctly is one of the highest-leverage infrastructure decisions.

## Summary

- Reverse proxies are the entry point for all external traffic; they are the most critical component in the request path.
- The three dominant reverse proxies serve different needs: Nginx for simplicity and performance, Traefik for Kubernetes-native dynamic configuration, Envoy for service mesh and advanced traffic management.
- All reverse proxies should handle TLS termination, load balancing, health checking, rate limiting, and access logging as a baseline.
- Reverse proxy configuration is security-critical: misconfigured TLS, missing rate limits, or overly permissive CORS can expose the entire backend.
- Observability of the reverse proxy itself is essential: request rate, error rate, latency, TLS handshake time, and upstream health.

## Core viewpoints

### 1. The reverse proxy is the single most critical infrastructure component

Every request passes through the reverse proxy. If it fails, everything fails. If it is misconfigured, it exposes the backend. If it is slow, the entire application is slow. Treat the reverse proxy as a tier-1 service: high availability (at least 2 replicas), health checks, and alerting. A reverse proxy should never be a single point of failure.

### 2. TLS termination at the proxy, not at the application

Terminate TLS at the reverse proxy and use HTTP (or mTLS) to the backend. This centralizes certificate management, offloads TLS overhead from application servers, and enables the proxy to inspect traffic for routing, rate limiting, and WAF. However, do not terminate TLS at the proxy in zero-trust environments -- use mTLS end-to-end or a service mesh.

### 3. Load balancing algorithm choice matters more than most people think

Round-robin is the default but rarely optimal. Least connections works better for heterogeneous workloads (some requests take longer). IP hash provides session affinity without cookies. Least response time (Nginx Plus / Envoy) adapts to backend performance dynamically. For WebSocket connections, use least connections or IP hash -- round-robin causes frequent reconnects.

### 4. Rate limiting is a reliability feature, not a security feature

Rate limiting prevents a single client from degrading service for others. It is a reliability mechanism first, security mechanism second (DDoS protection requires a separate layer). Configure rate limits per route, not globally: the login endpoint needs stricter limits than static assets. Always return rate limit headers (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset) so clients can self-regulate.

## Key info

### Proxy comparison

| Feature | Nginx | Traefik | Envoy |
|---|---|---|---|
| Configuration | Static file, reload for changes | Dynamic (Kubernetes CRDs) | Dynamic (xDS API) |
| Performance | Excellent (event-driven, C) | Good (Go) | Excellent (C++, async) |
| TLS termination | Yes | Yes (automatic with Let's Encrypt) | Yes |
| Load balancing | Round-robin, least-conn, ip-hash, least-time (Plus) | Round-robin, least-conn, sticky | Round-robin, least-request, ring-hash, random, maglev |
| Rate limiting | Basic (limit_req), advanced (Plus) | Rate limiting middleware | Advanced (global + local rate limit service) |
| Service mesh | No (requires Plus + njs) | No (Traefik Mesh is separate) | Yes (Istio, Consul Connect) |
| Best for | Simple deployments, static config | Kubernetes-native, auto-discovery | Service mesh, advanced traffic management |

### Essential configurations

**TLS best practices:**
- Minimum TLS 1.2, prefer TLS 1.3
- Only strong cipher suites (no RC4, 3DES, or export-grade ciphers)
- Enable HSTS (Strict-Transport-Security) with max-age >= 1 year
- Use Let's Encrypt for automatic certificate renewal (Traefik does this natively)
- Monitor certificate expiry and alert at 30 days

**Load balancing health checks:**
- Active health checks: proxy periodically probes backend health endpoint
- Passive health checks: proxy observes response status codes and marks unhealthy backends
- Use both: active catches slow failures, passive catches fast failures
- Health check endpoint should be lightweight (no database queries) and test the actual service path

**Rate limiting tiers:**
- Static assets: 1000 req/s
- API endpoints: 100 req/s per client
- Authentication endpoints: 5 req/s per client
- Admin endpoints: 10 req/s per client + IP whitelist

### Observability signals

- **Access logs**: Every request logged with timestamp, method, path, status, upstream, response time, client IP, user agent.
- **Error rate**: 4xx and 5xx rate by upstream service. Spikes indicate backend issues or attacks.
- **Latency**: Request time, upstream response time, and TLS handshake time. The proxy adds latency; monitor the delta.
- **Upstream health**: Number of healthy vs. unhealthy backends. When all backends are unhealthy, the proxy returns 502.
- **Rate limit hits**: Number of rate-limited requests. Spikes indicate abuse or misconfigured clients.

## Action recommendations

1. Choose the reverse proxy that matches your infrastructure: Nginx for simple deployments, Traefik for Kubernetes, Envoy for service mesh.
2. Terminate TLS at the reverse proxy with TLS 1.3, HSTS, and automatic certificate renewal.
3. Configure rate limiting per route with appropriate tiers; use consistent headers (X-RateLimit-*) for client self-regulation.
4. Implement both active and passive health checks for all upstream services.
5. Centralize access logs with structured format (JSON) and ship to the same log aggregation as application logs.
6. Set up alerts for: 5xx rate > 1%, upstream all unhealthy, certificate expiry < 30 days, rate limit hit rate spike.
7. Use the proxy's built-in metrics endpoint (Nginx stub_status, Traefik metrics, Envoy admin) and expose to Prometheus.

## Anti-patterns

- **TLS termination at the application** -- scatters certificate management, wastes application CPU, and prevents proxy-level traffic inspection.
- **No health checks** -- the proxy routes traffic to dead backends, causing 502 errors for end users.
- **Global rate limits** -- "100 req/s for all endpoints" means the login endpoint is as open as static assets. Rate limit per route.
- **No rate limit headers** -- clients retry aggressively, worsening the problem. Give them information to self-regulate.
- **Access logs disabled for performance** -- when an incident happens, you have no record of what requests were made. Use sampling or async logging instead.
- **Single reverse proxy instance** -- single point of failure. Always run at least 2 replicas behind a load balancer or floating IP.
- **Using the reverse proxy as a WAF** -- a reverse proxy is not a WAF. Use ModSecurity (Nginx) or a dedicated WAF for security filtering.

## Related

- Same category: [./docker-kubernetes.md](./docker-kubernetes.md) -- container observability
- Same category: [./containerized-deployment.md](./containerized-deployment.md) -- deployment strategies
- Same category: [./observability-triad.md](./observability-triad.md) -- logs, metrics, traces
- Upstream: [../../engineer/architecture-design/api-gateway.md](../../engineer/architecture-design/api-gateway.md) -- API gateway pattern
- Upstream: [../../engineer/infrastructure/health-check.md](../../engineer/infrastructure/health-check.md) -- health check patterns

## References

- Nginx -- official documentation and admin guide
- Traefik -- official documentation
- Envoy Proxy -- official documentation
- Mozilla SSL Configuration Generator