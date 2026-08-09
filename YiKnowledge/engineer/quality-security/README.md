---
title: Security & Supply Chain
tags: [leaf, security, supply-chain, secrets, zero-trust, cve]
category: engineer/quality-security
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: monthly
roles: [engineer, tech-lead, oncall-sre]
benefit: "Engineers find security patterns, supply chain hardening, and vulnerability response procedures in one place"
acceptance_criteria:
  - "Supply chain hardening and dependency management documented"
  - "Secrets management and zero-trust patterns present"
  - "CVE response and vendor assessment procedures included"
related:
  - ../INDEX.md
  - ../../INDEX.md
  - ../SECURITY.md
  - ../quality-security/
  - ../../tech-lead/risk/
---

# Security & Supply Chain

> **As an** engineer, **I want to** find security patterns, supply chain hardening guides, and vulnerability response procedures, **so that** I can build and maintain secure systems.

## Supply chain

| File | Description |
|---|---|
| [harden-supply-chain.md](./harden-supply-chain.md) | Lockfile quartet, audit, min-release-age, allowlist |
| [adopt-a-new-dependency.md](./adopt-a-new-dependency.md) | Dependency adoption checklist |
| [handle-a-dependency-cve.md](./handle-a-dependency-cve.md) | CVE response workflow |
| [do-a-vendor-security-assessment.md](./do-a-vendor-security-assessment.md) | Vendor security evaluation |

## Application security

| File | Description |
|---|---|
| [handle-secrets-and-config.md](./handle-secrets-and-config.md) | Secrets and configuration security |
| [audit-logging.md](./audit-logging.md) | Audit log design |
| [whitelist-bypass-class.md](./whitelist-bypass-class.md) | Whitelist bypass detection |
| [zero-trust.md](./zero-trust.md) | Zero-trust architecture |

## Dashboard

| File | Description |
|---|---|
| [dashboard-security-posture.md](./dashboard-security-posture.md) | Security posture dashboard |

## Cross-references

- [../quality-security/do-a-threat-modeling.md](../quality-security/do-a-threat-modeling.md) — Threat modeling
- [../quality-security/quarterly-security-audit.md](../quality-security/quarterly-security-audit.md) — Security audit cadence
- [../../tech-lead/risk/](../../tech-lead/risk/) — Risk register and postmortems
- [../SECURITY.md](../SECURITY.md) — Security domain index