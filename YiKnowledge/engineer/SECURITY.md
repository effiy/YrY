---
title: Security domain index
tags: [domain-index, security, supply-chain, risk, compliance]
category: root
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer, tech-lead, oncall-sre, executive]
benefit: "All security-relevant content reachable from a single index"
acceptance_criteria:
  - "Aggregates security files from engineer/, tech-lead/, oncall-sre/, executive/"
  - "Organized by subdomain: supply-chain, appsec, risk, incident-response, compliance"
related:
  - ./INDEX.md
  - ./README.md
---

# Security Domain Index

Cross-role aggregation of all security, supply-chain, risk, and compliance content.

## Supply chain & dependency security

| File | Role | Description |
|---|---|---|
| [harden-supply-chain.md](./quality-security/harden-supply-chain.md) | engineer | Lockfile quartet, audit, min-release-age, allowlist |
| [adopt-a-new-dependency.md](./quality-security/adopt-a-new-dependency.md) | engineer | Dependency adoption checklist and risk assessment |
| [handle-a-dependency-cve.md](./quality-security/handle-a-dependency-cve.md) | engineer | CVE response workflow and mitigation |
| [do-a-vendor-security-assessment.md](./quality-security/do-a-vendor-security-assessment.md) | engineer | Vendor security evaluation framework |

## Application security

| File | Role | Description |
|---|---|---|
| [zero-trust.md](./quality-security/zero-trust.md) | engineer | Zero-trust architecture patterns |
| [audit-logging.md](./quality-security/audit-logging.md) | engineer | Audit log design and implementation |
| [handle-secrets-and-config.md](./quality-security/handle-secrets-and-config.md) | engineer | Secrets management and configuration security |
| [whitelist-bypass-class.md](./quality-security/whitelist-bypass-class.md) | engineer | Whitelist bypass detection and prevention patterns |

## Risk management

| File | Role | Description |
|---|---|---|
| [tl-risk-register-single-provider-llm-lock-in.md](../tech-lead/risk/tl-risk-register-single-provider-llm-lock-in.md) | tech-lead | Single LLM provider lock-in risk |
| [write-a-postmortem.md](../tech-lead/risk/write-a-postmortem.md) | tech-lead | Postmortem writing methodology |
| [handle-an-outage-communication.md](../tech-lead/risk/handle-an-outage-communication.md) | tech-lead | Outage communication strategy |

## Incident response

| File | Role | Description |
|---|---|---|
| [incident-response/](./oncall-sre/incident-response/) | oncall-sre | 23 incident response procedures and postmortems |
| [observability/](./oncall-sre/observability/) | oncall-sre | Monitoring, alerting, observability patterns |
| [release/](./oncall-sre/release/) | oncall-sre | Release and rollback procedures |

## Cross-cutting references

- [engineer/quality-security/do-a-threat-modeling.md](./quality-security/do-a-threat-modeling.md) — threat modeling process
- [engineer/quality-security/quarterly-security-audit.md](./quality-security/quarterly-security-audit.md) — quarterly security audit cadence
- [tech-lead/decisions/](../tech-lead/decisions/) — security-related ADRs (fde/ air-gap, zero-trust)
- [executive/strategy/](./executive/strategy/) — compliance and regulatory strategy files
