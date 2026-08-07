---
title: identity and access management dashboard
aliases:
- IAM dashboard
- access management dashboard
- identity governance dashboard
- user lifecycle dashboard
tags:
- dashboard
- identity
- access-management
- iam
- mfa
- rbac
- privilege
- user-lifecycle
category: engineer/quality-security
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: dashboard
status: stable
lifecycle: active
review_cycle: weekly
roles:
- security-engineer
- tech-lead
- oncall-sre
benefit: identity and access management health visible at a glance
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
- user lifecycle, role health, access reviews, MFA coverage, and privilege creep defined
related:
- ./dashboard-security-posture.md
- ./dashboard-vulnerability-management.md
- ./dashboard-compliance-readiness.md
- ../../oncall-sre/observability/dashboard-certificate-secret-management.md
- ../../tech-lead/risk/dashboard-risk-management.md
tacit: false
---

# identity and access management dashboard

> **As a** security engineer, **I want to** track identity and access management health, **so that** every identity is verified, every access is authorized, and no privilege goes unchecked.

> Identity is the new perimeter. This dashboard tracks user lifecycle, role health, access reviews, MFA coverage, and privilege creep — turning IAM from a reactive helpdesk function into a proactive security capability.

## Summary

- 5 IAM dimensions: user lifecycle, role health, access reviews, MFA coverage, privilege creep
- 1,850 human identities (employee + contractor), 320 service accounts, 42 machine identities across 8 systems
- 85 roles defined across 4 role models (RBAC for internal, ABAC for customer data, ReBAC for content, custom for admin)
- MFA enrollment: 94% (human), 0% (service accounts — target 100% for Tier 0); 12 accounts with no MFA, 8 of them privileged
- 480 access review items per quarter; 82% on-time completion; 28 excessive privileges found in last review cycle
- Dashboard reviewed weekly; IAM governance review monthly with security and compliance

## Core viewpoints

- Identity is the new perimeter — the network boundary is porous; the only thing standing between an attacker and your data is the identity and access control system
- Access reviews are not a checkbox — they are the only systematic defense against privilege creep; every unreviewed access is a potential breach vector
- MFA is the cheapest, highest-impact security control — it blocks 99.9% of account takeover attacks; the cost of one breach dwarfs the cost of MFA deployment
- Least privilege is a journey, not a destination — every quarter, access should be slightly more constrained than the quarter before; if privilege isn't decreasing, it's creeping

## Key information

### 5-panel IAM overview

```
┌──────────────────────────────────────────────────────────────────┐
│  USER LIFECYCLE                   │  ROLE HEALTH                      │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Users: 1,850 human     │   │  │  Roles: 85 defined       │   │
│  │  Service accounts: 320  │   │  │  RBAC: 52 (61%)          │   │
│  │  Machine identities: 42 │   │  │  ABAC: 18 (21%)          │   │
│  │  Onboarded: 28/mo       │   │  │  ReBAC: 8 (9%)           │   │
│  │  Offboarded: 22/mo      │   │  │  Custom: 7 (8%)          │   │
│  │  Orphaned: 8 (0.4%)     │   │  │  Role-permission ratio:1:8│   │
│  │  Deprovision SLA: 98%   │   │  │  Role mining needed: 12%  │   │
│  │  Ghost accounts: 3      │   │  │  Orphaned roles: 5 (6%)  │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  ACCESS REVIEWS                   │  MFA COVERAGE                     │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Reviews: 480/quarter   │   │  │  MFA enrolled: 94% (human)│  │
│  │  Completed: 394 (82%)   │   │  │  MFA enforced: 88%        │   │
│  │  Overdue: 86 (18%)      │   │  │  FIDO2/WebAuthn: 42%     │   │
│  │  Excessive priv: 28     │   │  │  TOTP: 38%               │   │
│  │  Revoked: 25 (89%)      │   │  │  SMS: 14% (↓ target 0%) │   │
│  │  Exception: 3 (11%)     │   │  │  No MFA: 12 accounts     │   │
│  │  Review SLA: 78%        │   │  │  Privileged + no MFA: 8  │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### User lifecycle metrics

| Lifecycle stage | Count (monthly) | Automation | SLA | SLA met | Issues |
|---|---|---|---|---|---|
| **Onboarding** (new hire) | 28 | Auto (HRIS → IDP) | 24 hours before start | 96% | 2 late — IT ticket delayed |
| **Onboarding** (contractor) | 12 | Semi-auto (manager approval) | 48 hours | 88% | 3 manual steps remain |
| **Role change** (promotion) | 18 | Manual (manager request) | 5 business days | 72% | Slow — 5-day avg |
| **Role change** (team transfer) | 8 | Manual (dual manager approval) | 5 business days | 68% | Old team access not always removed |
| **Offboarding** (voluntary) | 15 | Auto (HRIS trigger) | 24 hours | 99% | 1 failure — contractor offboarding |
| **Offboarding** (involuntary) | 5 | Auto (HRIS trigger) | 4 hours | 100% | None |
| **Offboarding** (contractor expiry) | 6 | Auto (contract end date) | 24 hours | 85% | 2 contract extensions not updated |
| **Leave of absence** | 4 | Manual | 48 hours | 75% | Access suspension not automated |
| **Rehire** | 3 | Manual | 5 business days | 65% | Previous access not always reviewed |

### Orphaned and ghost accounts

| Account type | Count | Last activity | Risk | Owner | Action |
|---|---|---|---|---|---|
| **Ghost account** (never logged in) | 3 | Never | High | Unknown | Investigate, disable |
| **Orphaned — departed employee** | 5 | 30-90 days ago | Critical | Former manager | Immediate disable |
| **Orphaned — expired contractor** | 2 | 45-60 days ago | Critical | Vendor manager | Immediate disable |
| **Orphaned — service account** | 8 | 60-180 days ago | High | Unknown | Audit, disable if unused |
| **Dormant** (90+ days inactive) | 42 | 90-365 days | Medium | Various | Review, disable if not needed |
| **Total requiring action** | **60** | | | | |

### Role inventory

| Role model | Roles | Permissions per role | Role assignments | Over-permissioned | Under-permissioned | Health |
|---|---|---|---|---|---|---|
| **RBAC (employee)** | 52 | 8.5 avg | 1,720 | 18 (35%) | 5 (10%) | B (78) |
| **ABAC (customer data)** | 18 | 12.2 avg | 580 | 6 (33%) | 2 (11%) | B+ (82) |
| **ReBAC (content)** | 8 | 5.8 avg | 320 | 2 (25%) | 1 (13%) | B+ (84) |
| **Custom (admin)** | 7 | 18.5 avg | 28 | 4 (57%) | 0 (0%) | C (65) |
| **Total** | **85** | **8.5 avg** | **2,648** | **30 (35%)** | **8 (9%)** | **B (78)** |

### Role health analysis

| Role | Users | Permissions | Permissions used | Over-permissioned | Last reviewed | Health |
|---|---|---|---|---|---|---|
| **Platform Admin** | 5 | 42 | 28 (67%) | 14 (33%) | 2026-07 | C (65) |
| **Database Admin** | 3 | 28 | 18 (64%) | 10 (36%) | 2026-06 | C (62) |
| **Senior Engineer** | 85 | 22 | 18 (82%) | 4 (18%) | 2026-07 | B+ (82) |
| **Engineer** | 180 | 15 | 12 (80%) | 3 (20%) | 2026-08 | B+ (85) |
| **Junior Engineer** | 55 | 10 | 8 (80%) | 2 (20%) | 2026-08 | B+ (84) |
| **SRE** | 22 | 25 | 20 (80%) | 5 (20%) | 2026-07 | B (78) |
| **Product Manager** | 18 | 12 | 9 (75%) | 3 (25%) | 2026-06 | B (75) |
| **Designer** | 12 | 8 | 6 (75%) | 2 (25%) | 2026-05 | C+ (68) |
| **Data Scientist** | 28 | 14 | 10 (71%) | 4 (29%) | 2026-07 | B (75) |
| **Customer Support** | 35 | 6 | 4 (67%) | 2 (33%) | 2026-04 | C (65) |
| **Contractor (generic)** | 45 | 18 | 8 (44%) | 10 (56%) | 2026-03 | D (42) |
| **Overall** | | | | | | **B (78)** |

### Access review campaign

| Quarter | Review items | Completed | Overdue | Excessive privileges | Revoked | Exception | SLA met |
|---|---|---|---|---|---|---|---|
| **Q3 2026** (current) | 480 | 285 (59%) | 195 (41%) | 18 (so far) | 15 | 3 | In progress |
| **Q2 2026** | 450 | 395 (88%) | 55 (12%) | 28 | 25 | 3 | 88% |
| **Q1 2026** | 420 | 380 (90%) | 40 (10%) | 22 | 20 | 2 | 90% |
| **Q4 2025** | 400 | 340 (85%) | 60 (15%) | 32 | 28 | 4 | 85% |
| **Overall** | **1,750** | **1,400 (80%)** | **350 (20%)** | **100** | **88** | **12** | **82%** |

### MFA coverage by user type

| User type | Total | MFA enrolled | MFA enforced | FIDO2/WebAuthn | TOTP | SMS | No MFA | Target |
|---|---|---|---|---|---|---|---|---|
| **Employee — privileged** | 65 | 62 (95%) | 60 (92%) | 38 (58%) | 22 (34%) | 2 (3%) | 3 (5%) | 100% |
| **Employee — standard** | 280 | 268 (96%) | 260 (93%) | 142 (51%) | 112 (40%) | 14 (5%) | 12 (4%) | 98% |
| **Employee — limited** | 120 | 108 (90%) | 100 (83%) | 38 (32%) | 52 (43%) | 18 (15%) | 12 (10%) | 95% |
| **Contractor** | 85 | 72 (85%) | 68 (80%) | 18 (21%) | 38 (45%) | 16 (19%) | 13 (15%) | 95% |
| **Service account** | 320 | 0 (0%) | 0 (0%) | 0 (0%) | 0 (0%) | 0 (0%) | 320 (100%) | Workload identity |
| **Machine identity** | 42 | 0 (0%) | 0 (0%) | 0 (0%) | 0 (0%) | 0 (0%) | 42 (100%) | mTLS/SPIFFE |
| **Overall (human)** | **550** | **510 (94%)** | **488 (88%)** | **236 (42%)** | **224 (38%)** | **50 (14%)** | **40 (6%)** | **98%** |

### Privileged access management

| Privileged group | Accounts | MFA | Just-in-time | Session recording | Approval required | Access review | Risk |
|---|---|---|---|---|---|---|---|
| **AWS/Azure/GCP Admin** | 8 | 8 (100%) | 5 (63%) | 5 (63%) | 8 (100%) | Monthly | Medium |
| **Database Admin** | 5 | 5 (100%) | 0 (0%) | 0 (0%) | 5 (100%) | Monthly | **High** |
| **Kubernetes Cluster Admin** | 6 | 6 (100%) | 4 (67%) | 4 (67%) | 6 (100%) | Monthly | Medium |
| **CI/CD Pipeline Admin** | 4 | 4 (100%) | 0 (0%) | 0 (0%) | 3 (75%) | Quarterly | **High** |
| **VPN/Network Admin** | 3 | 3 (100%) | 0 (0%) | 0 (0%) | 3 (100%) | Quarterly | Medium |
| **GitHub Org Admin** | 4 | 4 (100%) | 0 (0%) | 0 (0%) | 4 (100%) | Quarterly | Medium |
| **IDP Admin** | 3 | 3 (100%) | 2 (67%) | 3 (100%) | 3 (100%) | Monthly | Medium |
| **Secrets Manager Admin** | 3 | 3 (100%) | 2 (67%) | 3 (100%) | 3 (100%) | Monthly | Medium |
| **Overall** | **36** | **36 (100%)** | **13 (36%)** | **15 (42%)** | **35 (97%)** | | |

### Privilege creep detection

| Creep type | Count (Q2 2026) | Trend | Top cause | Automated detection | Example |
|---|---|---|---|---|---|
| **Role accumulation** (permissions from old roles) | 15 | ↑ | Team transfer without role cleanup | Yes | Engineer → Manager, kept engineer permissions |
| **Temporary access not revoked** | 8 | → | Break-glass access not time-bound | Partial | DB admin for migration, not revoked after 90 days |
| **Permission inheritance bloat** | 12 | ↑ | Parent role changes not cascaded | No | Platform team role gained 3 new permissions |
| **Cross-system privilege mismatch** | 10 | → | Different systems, different access levels | No | Read in AWS, write in GCP for same data |
| **Total** | **45** | **↑** | | | |

### Service account health

| Service account type | Count | Rotated < 90 days | Least privilege | Scope limited | Last used < 30 days | Unused | Health |
|---|---|---|---|---|---|---|---|
| **CI/CD pipeline** | 85 | 72 (85%) | 65 (76%) | 78 (92%) | 82 (96%) | 3 (4%) | B+ (84) |
| **Monitoring/observability** | 55 | 42 (76%) | 38 (69%) | 45 (82%) | 52 (95%) | 3 (5%) | B (78) |
| **Backup/DR** | 28 | 18 (64%) | 20 (71%) | 22 (79%) | 22 (79%) | 6 (21%) | C (65) |
| **Integration/webhook** | 62 | 45 (73%) | 42 (68%) | 48 (77%) | 55 (89%) | 7 (11%) | B- (72) |
| **Database access** | 35 | 22 (63%) | 18 (51%) | 25 (71%) | 30 (86%) | 5 (14%) | C (62) |
| **Internal API** | 42 | 28 (67%) | 30 (71%) | 35 (83%) | 38 (90%) | 4 (10%) | B- (72) |
| **Legacy/unclassified** | 13 | 3 (23%) | 5 (38%) | 5 (38%) | 5 (38%) | 8 (62%) | D (32) |
| **Total** | **320** | **230 (72%)** | **218 (68%)** | **258 (81%)** | **284 (89%)** | **36 (11%)** | **B- (70)** |

### Identity provider health

| IDP | Type | Users | Uptime | Auth requests/day | Avg latency | MFA integration | Last incident |
|---|---|---|---|---|---|---|---|
| **Okta** | Primary (employee) | 550 | 99.99% | 12,500 | 85ms | Yes (FIDO2, TOTP) | None (2026) |
| **Auth0** | Customer | 85,000 | 99.95% | 450,000 | 120ms | Yes (TOTP, SMS) | 2026-05 (15 min) |
| **AWS IAM** | Cloud | 42 roles | 99.99% | N/A (RBAC) | N/A | Yes (virtual MFA) | None |
| **GCP IAM** | Cloud | 28 roles | 99.99% | N/A (RBAC) | N/A | Yes (Titan) | None |
| **Kubernetes RBAC** | Cluster | 85 roles | 99.95% | N/A | N/A | Via IDP | None |
| **GitHub SSO** | VCS | 285 | 99.99% | 8,500 | 65ms | Via Okta | None |

## Action recommendations

1. **Privileged accounts without MFA**: 8 accounts; enforce MFA immediately for all privileged accounts, target 100% within 48 hours
2. **Platform Admin and Database Admin role cleanup**: 33-36% over-permissioned; role mining to right-size, implement just-in-time access for DB admin
3. **Contractor generic role**: 56% over-permissioned, 42/100 health; split into role-specific contractor roles, add time-bound access
4. **Service account cleanup**: 36 unused service accounts, 13 legacy unclassified; disable unused accounts, classify and right-size legacy accounts
5. **Ghost and orphaned account remediation**: 3 ghost + 5 orphaned + 2 expired contractor; immediate disable, implement automated inactivity detection
6. **Access review SLA**: 82% completion, 18% overdue; automate review reminders, escalate to managers after 7 days overdue, target 95%
7. **Just-in-time access expansion**: 36% JIT coverage for privileged access; implement JIT for DB admin, CI/CD admin, and network admin
8. **SMS MFA deprecation**: 14% still on SMS (50 accounts); migrate to TOTP or FIDO2, target 0% SMS by Q4 2026
9. **Privilege creep automation**: 45 instances detected; implement automated privilege creep detection with quarterly clean-up
10. **Weekly IAM review**: review new accounts, deprovisioned accounts, MFA coverage, access review progress, and privilege changes with security team



- Admin by default → giving every engineer broad admin access "because they might need it"; this is the #1 cause of privilege creep — start with zero, grant on demand
- Access review as rubber stamp → managers approving all access without review because "I trust my team"; trust is not a security control — every access must be justified
- MFA as optional → "MFA is inconvenient for some users"; the inconvenience of MFA is measured in seconds, the inconvenience of a breach is measured in months
- Shared accounts → "the team shares the admin account"; shared accounts break audit trails and make offboarding impossible — every action must be attributable to an individual
- Service accounts as second-class citizens → securing human accounts with MFA but leaving service accounts with long-lived static credentials; service accounts often have more access than humans

## Related

- Same class: [dashboard-security-posture](dashboard-security-posture.md) — security posture and compliance
- Same class: [dashboard-vulnerability-management](dashboard-vulnerability-management.md) — vulnerability management
- Same class: [dashboard-compliance-readiness](dashboard-compliance-readiness.md) — compliance and audit readiness
- Same class: [dashboard-certificate-secret-management](../../oncall-sre/observability/dashboard-certificate-secret-management.md) — certificate and secret management
- Same class: [dashboard-risk-management](../../tech-lead/risk/dashboard-risk-management.md) — risk management
- References: NIST — *SP 800-63 (Digital Identity Guidelines)*; OWASP — *IAM Best Practices*; Google — *BeyondCorp (Zero Trust)*; AWS — *IAM Best Practices*; Okta — *Identity Maturity Model*; CSA — *Cloud Controls Matrix (IAM domain)*