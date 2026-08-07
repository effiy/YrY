---
aliases:
- Data Compliance Process
title: data compliance and masking process
tags:
- process
- data compliance
- masking
- privacy
- SOP
category: engineer/infrastructure
created: 2026-07-30
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: process
status: stable
lifecycle: active
review_cycle: yearly
roles:
- engineer
benefit: process followed predictably
acceptance_criteria:
  - "steps are ordered and each has a clear owner or role"
  - "prerequisites and inputs are listed before the first step"
  - "outcome is measurable or verifiable"
related:
- ./data-migration.md
- ./quarterly-security-audit.md
- ./incident-response.md
tacit: false
---

# data compliance and masking process

> **As an** engineer, **I want to** data compliance, **so that** process followed predictably. 

## 1. Purpose and scope

Standardize the collection, storage, use, sharing, and destruction of sensitive data; satisfy privacy regulations (GDPR / Personal Information Protection Law) and company compliance requirements; avoid data leaks and compliance penalties. 

Applies to: all scenarios involving personally identifiable information (PII) , financial, order, health, and other sensitive data. 

## 2. Roles and responsibilities

| Role | Responsibility |
|---|---|
| Data owner (R)  | Identify sensitive fields; perform masking; maintain access control |
| Tech owner (A)  | Review masking scheme; decide technical implementation |
| Security / Compliance (C)  | Assess compliance risk; review scheme |
| Business (I)  | Confirm business necessity |
| Legal (C, when needed)  | Regulatory interpretation and scheme endorsement |

## 3. Step breakdown

```
Data classification → Masking scheme → Implementation review → Launch → Access audit → Destruction
```

| Step | Key action | Exit criteria |
|---|---|---|
| 1. Data classification | Identify PII / sensitive fields; tag sensitivity level | Classification list produced |
| 2. Masking scheme | Define masking rules (mask / hash / encrypt / replace) ; clarify usage scenarios | Scheme documentation complete |
| 3. Implementation review | Tech + security + compliance three-party review; record conclusion | Scheme approved |
| 4. Launch | Apply masking; configure access control and audit logs; monitoring alerts | Launch complete |
| 5. Access audit | Periodically audit access logs; alert on exception access | Audit report archived |
| 6. Destruction | Destroy data after expiry or business stop; record destruction action | Destruction record archived |

## 4. Masking rule reference

| Sensitive type | Recommended strategy |
|---|---|
| Phone number | Mask (138****1234)  |
| ID card | Mask or hash; only restore when necessary |
| Email | Mask (a***@example.com)  |
| Bank card / payment | Encrypt at rest; display masked; no plaintext logs |
| Address | Display on demand; export masked |
| Health / ethnicity / religion | Highly sensitive; in principle do not collect or store |

## 5. Measurement metrics

- Sensitive field coverage (proportion masked) 
- Exception access alert count and handling rate
- Compliance audit pass rate
- Data leak incidents (goal 0) 

## 6. Exception handling and escalation path

| Scenario | Handling |
|---|---|
| Plaintext leaks to logs | Clean immediately; fix code; escalate per [incident response process](../process/incident-response.md) |
| Privilege escalation access | Revoke permission immediately; audit scope; security bulletin |
| Third party requests sensitive data | Must have legal + compliance dual sign; minimize provision |
| Business requires plaintext | Reject; on-demand approval + operation audit + one-time token |
| Regulatory change | Security / compliance lead re-review; adjust masking rules |
| Historical data unmasked | Dedicated governance; batch migration masking |

## 7. Notes

- **Minimize collection principle** — if you can avoid collecting, don't; if you can collect less, collect less
- Masking must complete before data enters the system; do not "store plaintext first, process later"
- Logs are a leak hotspot — no printing sensitive fields
- Access control + audit logs must come together; neither can be missing
- Third-party data sharing must have a written agreement and minimization principle
- Link with [data-migration-process](./data-migration.md): during migration sensitive fields must remain masked
