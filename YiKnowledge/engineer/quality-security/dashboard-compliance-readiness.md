---
title: compliance readiness dashboard
aliases:
- audit readiness dashboard
- compliance audit dashboard
- regulatory compliance dashboard
- GRC dashboard
tags:
- dashboard
- compliance
- audit
- soc2
- iso27001
- gdpr
- regulatory
category: engineer/quality-security
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: monthly
roles:
- engineer
- tech-lead
- executive
benefit: compliance and audit readiness visible at a glance
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"
related:
- ./dashboard-security-posture.md
- ../../tech-lead/risk/dashboard-risk-management.md
- ../../tech-lead/risk/dashboard-vendor-management.md
- ../../oncall-sre/observability/dashboard-business-continuity.md
tacit: false
---

# compliance readiness dashboard

> **As a** tech lead, **I want to** track compliance and audit readiness, **so that** the organization is always prepared for audits and regulatory requirements are continuously met.

> Compliance is not a once-a-year fire drill — it's continuous operational discipline. This dashboard tracks control effectiveness, audit readiness, evidence collection, policy attestation, and regulatory compliance across frameworks.

## Summary

- 5 compliance dimensions: control effectiveness, audit readiness, evidence collection, policy attestation, regulatory coverage
- Compliance frameworks tracked: SOC 2 Type II, ISO 27001, GDPR, CCPA, PCI DSS (where applicable), CIS Controls
- Controls tested continuously with automated evidence collection; manual testing for judgment-based controls
- Policy attestation tracked by employee acknowledgment rate and policy freshness
- Dashboard reviewed monthly; external audit readiness assessed quarterly

## Core viewpoints

- Compliance is continuous, not point-in-time — audit readiness is a daily practice, not a pre-audit scramble
- Controls are hypotheses — every control is a hypothesis that "we are secure/compliant in this area"; evidence proves or disproves it
- Automation is the only way to scale — manual evidence collection for 200+ controls is unsustainable; automate every testable control
- Policy without attestation is wishful thinking — a policy that employees haven't read and acknowledged is a document, not a control

## Key information

### 5-panel compliance overview

```
┌──────────────────────────────────────────────────────────────────┐
│  CONTROL EFFECTIVENESS           │  AUDIT READINESS                 │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Controls:    218 total │   │  │  Overall:     82% ████  │   │
│  │  Effective:   185 (85%) │   │  │  SOC 2:       85% ████  │   │
│  │  Partial:      22 (10%) │   │  │  ISO 27001:   78% ███▌  │   │
│  │  Ineffective:  11 (5%)  │   │  │  GDPR:        82% ████  │   │
│  │  Automated:   142 (65%) │   │  │  CIS:         88% ████  │   │
│  │  Evidence:    88% ready │   │  │  Evidence:    88% ████  │   │
│  │  Exceptions:   8 open   │   │  │  Last audit:  45 days   │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  EVIDENCE COLLECTION             │  POLICY ATTESTATION              │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Automated:   142 (65%) │   │  │  Policies:    28 total   │   │
│  │  Manual:       76 (35%) │   │  │  Acknowledged: 85% ████ │   │
│  │  Fresh (<30d): 78%      │   │  │  Overdue:      12%      │   │
│  │  Stale (30-90d): 15%    │   │  │  Expired:        3%     │   │
│  │  Expired (>90d): 7%     │   │  │  Policy age:   45 days  │   │
│  │  Collection:   2.5 days │   │  │  Reviewed:     82%      │   │
│  │  Gaps:         15 items │   │  │  Training:     78% done │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Control effectiveness by framework

| Framework | Total controls | Effective | Partial | Ineffective | Automated % | Evidence ready |
|---|---|---|---|---|---|---|
| **SOC 2 Type II** | 85 | 72 (85%) | 9 (11%) | 4 (5%) | 62% | 88% |
| — Security (CC1-CC9) | 52 | 45 (87%) | 5 (10%) | 2 (4%) | 65% | 90% |
| — Availability (A1-A3) | 18 | 15 (83%) | 2 (11%) | 1 (6%) | 58% | 85% |
| — Confidentiality (C1-C2) | 15 | 12 (80%) | 2 (13%) | 1 (7%) | 55% | 82% |
| **ISO 27001** | 72 | 56 (78%) | 10 (14%) | 6 (8%) | 58% | 85% |
| — Annex A.9 (Access Control) | 14 | 12 (86%) | 1 (7%) | 1 (7%) | 65% | 88% |
| — Annex A.12 (Operations) | 18 | 15 (83%) | 2 (11%) | 1 (6%) | 60% | 82% |
| — Annex A.14 (Development) | 16 | 12 (75%) | 3 (19%) | 1 (6%) | 55% | 80% |
| — Annex A.15 (Supplier) | 12 | 8 (67%) | 2 (17%) | 2 (17%) | 45% | 78% |
| — Other annexes | 12 | 9 (75%) | 2 (17%) | 1 (8%) | 50% | 82% |
| **GDPR** | 35 | 29 (83%) | 4 (11%) | 2 (6%) | 60% | 85% |
| **CIS Controls** | 26 | 23 (88%) | 2 (8%) | 1 (4%) | 72% | 90% |
| **Total** | **218** | **185 (85%)** | **22 (10%)** | **11 (5%)** | **65%** | **88%** |

### Ineffective controls — remediation register

| Control ID | Framework | Control description | Status | Risk | Owner | Remediation | Due |
|---|---|---|---|---|---|---|---|
| A.15.2.1 | ISO 27001 | Supplier security monitoring | Ineffective | High | Security Lead | Implement continuous vendor monitoring | Aug 30 |
| A.14.1.2 | ISO 27001 | Change management approval | Ineffective | High | Platform Lead | Enforce required approvals in CI/CD | Aug 15 |
| C1.2 | SOC 2 | Data classification enforcement | Ineffective | Medium | Data Lead | Automated classification tooling | Sep 15 |
| A.12.6.1 | ISO 27001 | Vulnerability management timeliness | Ineffective | High | Security Lead | Reduce SLA to 48 hrs, automate scanning | Aug 30 |
| CC6.1 | SOC 2 | Logical access review cadence | Ineffective | Medium | Platform Lead | Implement quarterly access review automation | Sep 30 |
| A.9.2.5 | ISO 27001 | Access rights review | Ineffective | Medium | Platform Lead | Automated access review dashboard | Sep 30 |
| C1.1 | SOC 2 | Confidential data inventory | Ineffective | Medium | Data Lead | Complete data discovery and classification | Oct 15 |
| A.15.1.1 | ISO 27001 | Supplier risk assessment | Ineffective | Medium | Security Lead | Vendor risk assessment framework | Sep 30 |

### Evidence collection health

| Evidence type | Total items | Automated | Fresh (<30d) | Stale (30-90d) | Expired (>90d) | Collection gap |
|---|---|---|---|---|---|---|
| Access logs | 28 | 28 (100%) | 26 (93%) | 2 (7%) | 0 | 0 |
| Change records | 22 | 18 (82%) | 20 (91%) | 2 (9%) | 0 | 0 |
| Vulnerability scans | 18 | 18 (100%) | 18 (100%) | 0 | 0 | 0 |
| Backup verification | 15 | 12 (80%) | 13 (87%) | 2 (13%) | 0 | 0 |
| Incident reports | 12 | 8 (67%) | 10 (83%) | 1 (8%) | 1 (8%) | 1 |
| Training records | 20 | 2 (10%) | 15 (75%) | 3 (15%) | 2 (10%) | 3 |
| Policy attestations | 28 | 5 (18%) | 22 (79%) | 4 (14%) | 2 (7%) | 2 |
| Risk assessments | 15 | 3 (20%) | 10 (67%) | 3 (20%) | 2 (13%) | 2 |
| Penetration test results | 8 | 5 (63%) | 6 (75%) | 1 (13%) | 1 (13%) | 1 |
| DR test results | 10 | 6 (60%) | 7 (70%) | 2 (20%) | 1 (10%) | 1 |
| Third-party assessments | 22 | 8 (36%) | 16 (73%) | 4 (18%) | 2 (9%) | 3 |
| Code review records | 20 | 18 (90%) | 18 (90%) | 2 (10%) | 0 | 0 |
| **Total** | **218** | **142 (65%)** | **181 (78%)** | **26 (15%)** | **11 (7%)** | **15** |

### Audit readiness by framework

| Framework | Last audit | Next audit | Controls tested | Evidence ready | Gaps | Readiness score | Auditor |
|---|---|---|---|---|---|---|---|
| SOC 2 Type II | 2026-05 | 2026-11 | 85 | 88% | 12 | 85% | External (Big 4) |
| ISO 27001 | 2025-12 | 2026-12 | 72 | 85% | 18 | 78% | External (BSI) |
| GDPR | 2026-03 | 2027-03 | 35 | 85% | 8 | 82% | Internal + External |
| CIS Controls | 2026-06 | 2026-12 | 26 | 90% | 4 | 88% | Self-assessment |
| **Overall** | | | **218** | **88%** | **42** | **82%** | |

### Upcoming audit calendar

| Audit | Type | Date | Duration | Scope | Preparations needed | Status |
|---|---|---|---|---|---|---|
| SOC 2 Interim Review | Internal | Sep 15 | 2 days | Controls design review | Evidence refresh, gap closure | In progress |
| Penetration Test | External | Oct 1 | 5 days | All production systems | Scope definition, environment prep | Planned |
| SOC 2 Type II | External | Nov 15 | 2 weeks | Full SOC 2 scope | All evidence < 90 days fresh | Preparing |
| ISO 27001 Surveillance | External | Dec 1 | 1 week | Full ISO scope | Close 18 gaps, evidence refresh | Preparing |
| CIS Controls | Self-assessment | Dec 15 | 1 week | All 26 controls | Evidence refresh | Preparing |

### Policy attestation health

| Policy | Version | Last updated | Employees acknowledged | Overdue | Expired | Owner |
|---|---|---|---|---|---|---|
| Information Security Policy | v3.2 | 2026-06 | 34/36 (94%) | 2 (6%) | 0 | CISO |
| Acceptable Use Policy | v2.8 | 2026-04 | 32/36 (89%) | 3 (8%) | 1 (3%) | CISO |
| Data Classification Policy | v2.1 | 2026-05 | 30/36 (83%) | 5 (14%) | 1 (3%) | Data Lead |
| Access Control Policy | v2.5 | 2026-07 | 33/36 (92%) | 3 (8%) | 0 | Security Lead |
| Incident Response Policy | v3.0 | 2026-06 | 31/36 (86%) | 4 (11%) | 1 (3%) | SRE Lead |
| Vendor Management Policy | v1.8 | 2026-03 | 28/36 (78%) | 6 (17%) | 2 (6%) | Procurement |
| Business Continuity Policy | v2.2 | 2026-04 | 29/36 (81%) | 5 (14%) | 2 (6%) | SRE Lead |
| Data Retention Policy | v2.0 | 2026-05 | 30/36 (83%) | 4 (11%) | 2 (6%) | Data Lead |
| Privacy Policy (Internal) | v2.4 | 2026-06 | 31/36 (86%) | 4 (11%) | 1 (3%) | Legal |
| Code of Conduct | v3.1 | 2026-01 | 33/36 (92%) | 3 (8%) | 0 | HR |
| **Overall** | | | **85%** | **12%** | **3%** | |

### Compliance training completion

| Training | Required for | Frequency | Completed | Overdue | Exemptions |
|---|---|---|---|---|---|
| Security awareness | All employees | Annual | 33/36 (92%) | 3 (8%) | 0 |
| Data privacy (GDPR) | All employees | Annual | 30/36 (83%) | 6 (17%) | 0 |
| Secure coding (OWASP Top 10) | Engineers | Annual | 26/30 (87%) | 4 (13%) | 0 |
| Incident response | SRE, TL | Biannual | 14/16 (88%) | 2 (12%) | 0 |
| PCI compliance | Billing, Platform | Annual | 6/8 (75%) | 2 (25%) | 0 |
| Code of conduct | All employees | On hire + annual | 34/36 (94%) | 2 (6%) | 0 |
| Anti-harassment | All employees | Annual | 32/36 (89%) | 4 (11%) | 0 |
| **Overall** | | | **88%** | **12%** | |

### Exception management

| Exception ID | Type | Control | Requested by | Approved by | Expiry | Risk | Status |
|---|---|---|---|---|---|---|---|
| EXC-012 | Access | MFA not enforced for CI/CD service account | Platform Lead | CISO | 2026-09-30 | Medium | Active |
| EXC-011 | Retention | Extended log retention for AI training data | AI Lead | Data Lead | 2026-12-31 | Low | Active |
| EXC-010 | Encryption | Legacy service without TLS 1.3 | Platform Lead | CISO | 2026-08-31 | Medium | **Expiring** |
| EXC-009 | Vendor | Emergency vendor without full assessment | SRE Lead | CISO | 2026-08-15 | High | **Expiring** |
| EXC-008 | Access | Elevated access for contractor | Web Lead | CISO | 2026-07-31 | Medium | **Expired** |
| EXC-007 | Change | Emergency change without CAB approval | SRE Lead | VP Eng | 2026-07-15 | Low | Expired |

### Regulatory change monitor

| Regulation | Jurisdiction | Change | Effective date | Impact | Readiness |
|---|---|---|---|---|---|
| EU AI Act | EU | High-risk AI system requirements | 2027-01 | Chat, Code Review classification | Assessment in progress |
| NIS2 Directive | EU | Expanded cybersecurity requirements | 2027-04 | Broader incident reporting | Early assessment |
| CCPA Amendment | California | Automated decision-making opt-out | 2026-12 | AI features disclosure | Preparing |
| PCI DSS 4.0.1 | Global | New requirements for SAQ | 2027-03 | Billing system updates | Planned |
| SEC Cybersecurity Rules | US | Material incident disclosure | 2026-12 | 4-day disclosure timeline | Preparing |

## Action recommendations

1. **Close ineffective controls**: 11 controls ineffective, 5 high risk; prioritize A.15.2.1 (vendor monitoring), A.14.1.2 (change approval), A.12.6.1 (vuln management)
2. **Evidence freshness sprint**: 7% evidence expired, 15% stale; refresh all evidence older than 30 days, automate collection for top 10 manual items
3. **Policy attestation campaign**: 12% overdue, 3% expired; send reminders, escalate to managers, set auto-reminders for policy reviews
4. **Exception cleanup**: 3 expired/expiring exceptions; review EXC-008 (contractor access), EXC-009 (emergency vendor), EXC-010 (legacy TLS)
5. **SOC 2 interim review prep**: Sep 15 deadline; close 12 evidence gaps, test controls, update control descriptions
6. **Vendor risk automation**: 67% control effectiveness, 45% automated; implement continuous vendor monitoring, automated risk assessments
7. **Compliance training enforcement**: 12% overdue; mandate completion, link to access provisioning
8. **EU AI Act readiness**: 2027-01 effective date; complete AI system classification, gap analysis, and remediation plan
9. **Automation acceleration**: 65% automated → 80%; automate access reviews, policy attestations, and vendor assessments
10. **Monthly compliance review**: review control effectiveness, audit readiness, exceptions, and regulatory changes



- Audit as annual fire drill → scrambling for evidence two weeks before the auditor arrives; audit readiness is continuous, evidence is collected daily
- Controls as checkbox → implementing controls because "the auditor requires it" without understanding the risk they mitigate; controls exist to reduce risk, not to pass audits
- Policy shelfware → writing policies that nobody reads, acknowledges, or follows; a policy is only effective if it's known and practiced
- Exception permanence → "temporary" exceptions that become permanent; every exception needs an expiry date and a remediation plan
- Compliance as security → believing that compliance equals security; compliance is a baseline, security goes beyond compliance

## Related

- Same class: [dashboard-security-posture](dashboard-security-posture.md) — security posture and CVEs
- Same class: [dashboard-risk-management](../../tech-lead/risk/dashboard-risk-management.md) — risk management
- Same class: [dashboard-vendor-management](../../tech-lead/risk/dashboard-vendor-management.md) — vendor risk
- Same class: [dashboard-business-continuity](../../oncall-sre/observability/dashboard-business-continuity.md) — BC/DR
- References: AICPA — *SOC 2 Trust Services Criteria*; ISO 27001:2022 — *Information Security Management*; CIS — *Critical Security Controls v8*; GDPR — *Articles 5, 25, 30, 32*; NIST — *Cybersecurity Framework*