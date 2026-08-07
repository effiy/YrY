---
aliases:
- Quarterly Security Audit Process
title: Quarterly security audit process
tags:
- process
- security-audit
- compliance
- quarterly
- SOP
category: engineer/quality-security
created: 2026-07-30
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: process
status: stable
lifecycle: active
review_cycle: quarterly
roles:
- engineer
benefit: process followed predictably
acceptance_criteria:
  - "steps are ordered and each has a clear owner or role"
  - "prerequisites and inputs are listed before the first step"
  - "outcome is measurable or verifiable"
related:
- ./dependency-upgrade.md
- ./data-compliance.md
- ./incident-response.md
- ../../oncall-sre/release/hotfix-release.md
tacit: false
---

# Quarterly security audit process

> **As an** engineer, **I want to** quarterly security audit, **so that** process followed predictably.

## 1. Purpose and scope

Periodically inventory code, dependencies, infrastructure, and data access security risks; detect early and govern early; meet compliance and regulatory requirements.

Applicable to: all production projects and infrastructure; business with compliance requirements covering finance / data / privacy.

## 2. Roles and responsibilities

| Role | Responsibility |
|---|---|
| Security owner (R) | Organizes audit; consolidates risk list |
| Tech owner (A) | Decides governance priority and scheduling |
| Project owner (C) | Cooperates on remediation; fixes risks in project |
| Iteration PM (C) | Coordinates scheduling and tracks closed loop |
| Compliance / Legal (I) | Interprets regulations and endorses |

## 3. Audit dimensions

| Dimension | Check content |
|---|---|
| Code | Static scanning (SAST); secret leakage; injection risk; permission checks |
| Dependencies | CVE scanning; outdated dependencies; license compliance |
| Infrastructure | Attack surface; ports; permissions; secret management; log retention |
| Data | Sensitive data access audit; masking coverage; privilege escalation |
| Third-party | API authentication; callback security; supply chain risk |
| Operations | SSH access; bastion host; change audit; emergency access |

## 4. Step breakdown

```
Preparation → Scan & inspect → Risk consolidation → Priority review → Governance scheduling → Closed-loop validation → Archive
```

| Step | Key actions | Exit criteria |
|---|---|---|
| 1. Preparation | Define audit scope; align tools and baseline | Scope list complete |
| 2. Scan & inspect | SAST/SCA/pentest/config scan; manual spot check | Scan report produced |
| 3. Risk consolidation | Consolidate risk items; classify (high/medium/low); related fix plans | Risk list complete |
| 4. Priority review | Security + tech owner review; high-risk immediate governance | Review conclusion sent |
| 5. Governance scheduling | High-risk 24h~1 week; medium-risk within 1 month; low-risk within quarter | Schedule table complete |
| 6. Closed-loop validation | Re-scan to verify fixes; un-closed escalate | Closed-loop rate meets target |
| 7. Archive | Audit report archived; notify business and compliance | Archive complete |

## 5. Measurement metrics

- Number of discovered risks and distribution by severity
- Average remediation time for high-risk (goal ≤ 7 days)
- Closed-loop rate (goal ≥ 95%)
- Number of recurring risks (same problem recurs in quarter)

## 6. Exception handling and escalation path

| Scenario | Handling |
|---|---|
| Discovered high-risk exploited in the wild | Immediately handle via [hotfix process](../../oncall-sre/release/hotfix-release.md) |
| Project owner delays | Iteration PM follows up; escalate to upper level if needed |
| Governance impacts business rhythm | Business + security + tech three parties decide tradeoff |
| Involves external notification | Compliance leads; notify per regulatory requirements |
| Governance plan not feasible | Escalate to tech owner; evaluate alternative controls |

## 7. Notes

- **Audit is not nitpicking** — it is early governance to avoid incidents
- High-risk must have a deadline; cannot be "scheduled for later"
- Combine scanning tools + manual spot check; do not solely trust tools
- Link with [dependency-upgrade-process](../engineering/dependency-upgrade.md) and [data-compliance-process](../infrastructure/data-compliance.md)
- Audit report archived as compliance evidence; retain at least 1 year
- After governance completes, must re-scan to verify; closed loop is then complete
