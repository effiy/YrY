---
title: Zero trust pattern
aliases: [zero-trust-pattern, zero-trust, never-trust-always-verify, ztna]
tags: [methodology, engineering-patterns, security, zero-trust, authentication, network-segmentation, micro-segmentation]
category: engineer/quality-security
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: pattern
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer, tech-lead, oncall-sre]
benefit: "Every request is authenticated and authorized regardless of network origin, eliminating implicit trust zones"
acceptance_criteria:
  - "pattern name, problem statement, and solution approach are all described"
  - "trade-offs and when-not-to-use-this-pattern are explicitly stated"
  - "at least one concrete example or code snippet is provided
related:
  - ../../ai-engineer/methodology/prompt-injection-defense.md
  - ../../tech-lead/decisions/yiai--route-llm-traffic-across-providers.md
tacit: Zero trust is not just a slogan; it is a contract. Never trust + always verify + least privilege + explicit authorization + continuous verification; not one-shot; defense in depth
---

# Zero trust pattern

> **As an** engineer, **I want to** zero trust, **so that** pattern applied consistently.

## Question

The traditional boundary trust model (internal network trusted / external untrusted) is no longer valid — internal lateral movement / VPN credential leaks / insider threats / cloud-native no boundary. Each request must verify identity + device + context, never trust based on network location, least privilege + explicit authorization + continuous verification.

## Pattern

- **Never trust**: internal / external equally untrusted; not based on location
- **Always verify**: each request verifies identity + device + context; no cached trust
- **Least privilege**: default deny + explicit allow + time-boxed; not open
- **Continuous verification**: trust is not one-shot; regular + trigger-based re-auth; not one-shot
- **Identity SSOT**: identity is the policy core; not IP-centric
- **Device posture**: device compliance + health + encryption + patching; not bare devices
- **Context**: location / time / behavior / risk scoring; not static
- **Micro-segmentation**: minimal authorization between services + explicit allow; not open interconnection
- **mTLS**: mutual TLS between services; not one-way
- **Short credentials**: short-lived tokens + frequent rotation; not long-term credentials
- **Audit every request**: each access must be audited; no leakage
- **Policy engine**: centralized policy + distributed enforcement; not scattered
- **Defense in depth**: multiple layers not a single point; no dependency on one layer
- **Fail-secure**: policy failure denies not allows; not fail-open

## Applicable

- Multi-tenant SaaS (each tenant independent trust domain)
- LLM inference service (per-request verification + multi provider traffic steering)
- Multi-cloud + hybrid cloud (no boundary)
- Remote work (device posture)
- Internal service-to-service (mTLS + explicit authorization)

## Not applicable

- Monolith internal calls (overhead exceeds benefit)
- Fully public content (no sensitive data)
- Offline / local tools (no network)

## Implementation checklist

- [ ] Identity SSOT: identity is the policy core; not IP-centric
- [ ] Device posture: compliance + health + encryption + patching; not bare devices
- [ ] Context collection: location + time + behavior + risk scoring; not static
- [ ] Policy engine: OPA / Cedar / self-built; centralized policy + distributed enforcement
- [ ] Per-request verification: identity + device + context; no cached trust
- [ ] Least privilege: default deny + explicit allow + time-boxed; not open
- [ ] Continuous verification: regular re-auth + trigger-based (sensitive operations); not one-shot
- [ ] Micro-segmentation: minimal authorization between services; not open interconnection
- [ ] mTLS: mutual TLS between services; not one-way
- [ ] Short credentials: short-lived tokens + frequent rotation; not long-term
- [ ] Audit every request: each access must be audited; no leakage
- [ ] Link with observability: each denial must produce observability + alert
- [ ] Link with tracing: identity + device + context into trace baggage
- [ ] Link with API gateway: gateway as policy enforcement point
- [ ] Link with bulkhead: each tenant independent trust domain
- [ ] Link with rate limiting: identity + context-driven rate limiting
- [ ] Link with graceful degradation: policy engine failure fail-closed
- [ ] Fail-secure: policy failure denies not allows
- [ ] LLM scenario: each prompt verifies + model permission + tool permission + data permission
- [ ] LLM prompt injection defense: identity + context verification prevents injection
- [ ] Multi-provider traffic steering: identity + context-driven provider selection
- [ ] Toolchain: SPIFFE / OPA / Cedar / BeyondCorp / self-built
- [ ] Drills: chaos + game day verify policy + fail-closed + traffic switching
- [ ] Audit retention: audit log retention per compliance period; no leakage

## Anti-patterns

- Internal network trust — boundary trust invalid
- Cached trust — trust expired without verification
- IP-centric — identity SSOT invalid
- Default open — violates least privilege
- Long-term credentials — leaked credentials cannot rotate
- No device posture — bare device = credential + device two-factor invalid
- No context — static policy does not defend against dynamic threats
- No micro-segmentation — internal lateral movement
- One-way TLS — no mutual verification between services
- Policy failure allows — fail-open violates zero trust
- Policy scattered across services — config SSOT invalid
- No audit — no traceability
- No defense in depth — single point invalid kills all
- LLM without prompt injection defense — injection bypasses identity
- No drills relying on real failure to verify — only real failure tells whether zero trust works
