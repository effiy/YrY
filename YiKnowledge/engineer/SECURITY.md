---
title: Security domain index
tags: [domain-index, security, supply-chain, risk, compliance]
category: root
created: 2026-08-06
updated: 2026-08-14
last_verified: 2026-08-14
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer, leader, srer, executiver]
benefit: "All security-relevant content reachable from a single index"
acceptance_criteria:
  - "Aggregates security directories from engineer/, leader/, srer/"
  - "Organized by subdomain: supply-chain, appsec, risk, incident-response, compliance"
related:
  - ./INDEX.md
  - ./README.md
---

# Security Domain Index

Cross-role aggregation of security, supply-chain, risk, and compliance content.

## Supply chain & application security

| Directory | Role | Description |
|---|---|---|
| [./quality-security/](./quality-security/) | engineer | Code quality, testing, security hardening, supply chain |

## Risk management

| Directory | Role | Description |
|---|---|---|
| [../leader/risk/](../leader/risk/) | leader | Risk register, outage communication, postmortem methodology |

## Incident response

| Directory | Role | Description |
|---|---|---|
| [../srer/incident-response/](../srer/incident-response/) | srer | Incident response procedures and postmortems |
| [../srer/observability/](../srer/observability/) | srer | Monitoring, alerting, observability patterns |
| [../srer/release/](../srer/release/) | srer | Release and rollback procedures |

## Cross-cutting references

- [../leader/decisions/](../leader/decisions/) — security-related ADRs
- [../executiver/strategy/](../executiver/strategy/) — compliance and regulatory strategy