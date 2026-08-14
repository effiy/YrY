---
title: Ship — Quality, Security, Data & Reliability
tags: [leaf, ship, quality, security, data, reliability, testing, resilience, observability]
category: engineer/ship
created: 2026-08-06
updated: 2026-08-14
last_verified: 2026-08-14
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: monthly
roles: [engineer, leader, srer]
benefit: "Engineers find quality, security, data, and reliability patterns"
acceptance_criteria:
  - "SHIP phase scope clearly bounded"
  - "Cross-references to related phases and roles are present"
related:
  - ../INDEX.md
  - ../../INDEX.md
  - ../SECURITY.md
  - ../build/
  - ../run/
  - ../learn/
---

# Ship — Quality, Security, Data & Reliability

> **As an** engineer, **I want to** find quality, security, data, and reliability patterns, **so that** I can ship robust, secure, and resilient systems.

SHIP is the second phase of the engineer pipeline — ensure the system is safe, tested, and production-ready before deployment.

## What belongs here

- Supply chain security and dependency hardening
- Application security (secrets, audit logging, zero-trust)
- Database migration and data persistence patterns
- Resilience patterns (retry, timeout, circuit breaker, backpressure)
- Observability and distributed tracing
- Traffic management (rate limiting, load shedding, scaling)

## Cross-references

- [../build/](../build/) — Architecture and design patterns
- [../run/](../run/) — Team workflows and onboarding
- [../learn/](../learn/) — Lessons learned and project-specific docs
- [../SECURITY.md](../SECURITY.md) — Cross-role security domain index
- [../../leader/risk/](../../leader/risk/) — Risk register and postmortems
- [../../srer/observability/](../../srer/observability/) — Monitoring, alerting, SLO