---
title: Prepare a data classification
aliases: [i-want-to-prepare-a-data-classification, data-classification, data-tiers, data-sensitivity]
tags: [journey, methodology, data-classification, data-governance, security, compliance, pii, sensitive-data]
category: engineer/strategies
created: 2026-08-03
updated: 2026-08-03
source: internal
type: journey
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "launch is safe"
acceptance_criteria:
  - "frontmatter roles + benefit + acceptance_criteria present"
  - "descriptive verb-phrase filename, hyphens only, underscores and digits forbidden"
  - "body contains user-story header + 7 fixed-order sections"
related:
  - ../../executive/strategy/handle-data-compliance.md
  - ../../executive/strategy/prepare-a-data-retention-policy.md
  - ../../oncall-sre/incident-response/handle-a-data-breach.md
  - ./handle-secrets-and-config.md
  - ../processes/do-a-threat-modeling.md
  - ../../oncall-sre/incident-response/do-a-security-audit.md
  - ./prepare-a-business-continuity-plan.md
  - ../../knowledge-curator/templates/thinking/first-principles.md
  - ../../knowledge-curator/templates/thinking/inversion.md
  - ../../knowledge-curator/templates/thinking/second-order-thinking.md
  - ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: "Data classification is not a tag; it is a governance contract. Four tiers: public + internal + confidential + restricted; tiered controls; encryption + access + audit + retention; not vague"
status: deprecated
---

# Prepare a data classification

> **As an** engineer, **I want to** prepare a data classification, **so that** launch is safe.

## Summary

- Data classification = governance contract; not a tag
- Four tiers: public + internal + confidential + restricted
- Tiered controls; not vague
- Encryption + access + audit + retention; configured per tier
- PII / commercial / security / compliance with special handling
- Linked with data retention + data breach + compliance
- Automation + tooling + CI gates
- Documented + training; not by word of mouth
- Periodic review; architecture evolution must update
- First principles / inversion / second-order / Occam

## Scenario

Data classification is a data governance contract; not a tag. This entry provides the data classification full path, covering four tiers public + internal + confidential + restricted, tiered controls, encryption + access + audit + retention, PII / commercial / security / compliance special handling, linked with data retention + data breach + compliance, automation + tooling + CI gates, documentation + training, periodic review, and links to handle-data-compliance / prepare-a-data-retention-policy / handle-a-data-breach / handle-secrets-and-config / do-a-threat-modeling / do-a-security-audit / prepare-a-business-continuity-plan and other leaves.

## 2-hop reachability paths

| Hop | Goal | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | data compliance | [../../executive/strategy/handle-data-compliance.md](../../executive/strategy/handle-data-compliance.md) |
| 2 hop | data retention | [../../executive/strategy/prepare-a-data-retention-policy.md](../../executive/strategy/prepare-a-data-retention-policy.md) |
| 2 hop | data breach | [../../oncall-sre/incident-response/handle-a-data-breach.md](../../oncall-sre/incident-response/handle-a-data-breach.md) |
| 2 hop | secrets & config | [./handle-secrets-and-config.md](./handle-secrets-and-config.md) |
| 2 hop | threat modeling | [../processes/do-a-threat-modeling.md](../processes/do-a-threat-modeling.md) |
| 2 hop | security audit | [../../oncall-sre/incident-response/do-a-security-audit.md](../../oncall-sre/incident-response/do-a-security-audit.md) |
| 2 hop | BCP | [./prepare-a-business-continuity-plan.md](./prepare-a-business-continuity-plan.md) |
| 2 hop | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |
| 2 hop | inversion | [../../knowledge-curator/templates/thinking/inversion.md](../../knowledge-curator/templates/thinking/inversion.md) |
| 2 hop | second-order | [../../knowledge-curator/templates/thinking/second-order-thinking.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) |
| 2 hop | ockhams | [../../knowledge-curator/templates/thinking/ockhams-razor.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) |

## Action recommendations

1. **Four-tier classification**: public + internal + confidential + restricted; no missing tier
2. **Tiered controls**: encryption + access + audit + retention configured per tier; not vague
3. **PII special**: identity data masking + anonymization + encryption
4. **Commercial special**: trade secret access audited
5. **Security special**: keys / certificates / credentials managed independently
6. **Compliance special**: regulatory alignment + retention + audit
7. **Link with data retention**: retain per tier + delete per tier
8. **Link with data breach**: respond per tier
9. **Link with compliance**: align regulations per tier
10. **Automation + tooling**: scanners auto-label tiers
11. **CI gates**: high-risk data blocked by CI before storage
12. **Documentation + training**: not by word of mouth; everyone knows
13. **Periodic review**: architecture evolution updates; not one-shot
14. **Data flow diagram**: per-tier data flow direction; not vague
15. **First principles**: why classification is needed; worst consequence of not doing it
16. **Inversion thinking**: how much access control alone can solve; if solvable do not introduce tiers
17. **Second-order thinking**: second-order consequences after classification (governance consistency / hiring / compliance / trust)
18. **Occam**: classification the simpler the better; cut redundant tiers

## Related

- data compliance: [../../executive/strategy/handle-data-compliance.md](../../executive/strategy/handle-data-compliance.md) — regulatory alignment
- data retention: [../../executive/strategy/prepare-a-data-retention-policy.md](../../executive/strategy/prepare-a-data-retention-policy.md) — retain/delete per tier
- data breach: [../../oncall-sre/incident-response/handle-a-data-breach.md](../../oncall-sre/incident-response/handle-a-data-breach.md) — per-tier response
- secrets & config: [./handle-secrets-and-config.md](./handle-secrets-and-config.md) — security tier
- threat modeling: [../processes/do-a-threat-modeling.md](../processes/do-a-threat-modeling.md) — trust boundary
- security audit: [../../oncall-sre/incident-response/do-a-security-audit.md](../../oncall-sre/incident-response/do-a-security-audit.md) — global audit
- BCP: [./prepare-a-business-continuity-plan.md](./prepare-a-business-continuity-plan.md) — data dimension
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
