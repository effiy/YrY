---
title: Prepare a privacy impact assessment / Prepare a privacy impact assessment
aliases: [i-want-to-prepare-a-privacy-impact-assessment, pia, privacy-impact-assessment, dpia]
tags: [journey, methodology, privacy, compliance, pii, data-governance, gdpr, dpia]
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
  - ./prepare-a-data-classification.md
  - ../../executive/strategy/handle-data-compliance.md
  - ../../executive/strategy/prepare-a-data-retention-policy.md
  - ../../oncall-sre/incident-response/handle-a-data-breach.md
  - ../processes/do-a-threat-modeling.md
  - ../../executive/strategy/handle-a-regulatory-change.md
  - ../../knowledge-curator/templates/thinking/first-principles.md
  - ../../knowledge-curator/templates/thinking/inversion.md
  - ../../knowledge-curator/templates/thinking/second-order-thinking.md
  - ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: A PIA is not just a compliance form; it is a privacy contract. Collection + purpose + sharing + retention + deletion + user rights; default to minimization; not vague
---

# Prepare a privacy impact assessment

> **As an** engineer, **I want to** prepare a privacy impact assessment, **so that** launch is safe.

## Summary

- PIA = privacy contract; not just a compliance form.
- Collection + purpose + sharing + retention + deletion; the full lifecycle.
- Default to minimization; do not over-collect.
- User rights: access + correction + deletion + portability + objection.
- Links with data classification + compliance + data breach.
- Links with threat modeling.
- Regulatory alignment with GDPR / CCPA / Personal Information Protection Law.
- Documentation + training; not by word of mouth.
- Periodic review; architecture evolution updates.
- First principles / inversion / second-order / Occam.

## Scenario

A privacy impact assessment is a privacy contract; not just a compliance form. This entry provides the full PIA path, covering collection + purpose + sharing + retention + deletion across the full lifecycle, default to minimization, user rights, linking with data classification + compliance + data breach, linking with threat modeling, regulatory alignment with GDPR / CCPA / Personal Information Protection Law, documentation + training, periodic review, and links to prepare-a-data-classification / handle-data-compliance / prepare-a-data-retention-policy / handle-a-data-breach / do-a-threat-modeling / handle-a-regulatory-change and other leaves.

## 2-hop reachability paths

| Hops | Goal | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | data classification | [./prepare-a-data-classification.md](./prepare-a-data-classification.md) |
| 2 hops | data compliance | [../../executive/strategy/handle-data-compliance.md](../../executive/strategy/handle-data-compliance.md) |
| 2 hops | data retention | [../../executive/strategy/prepare-a-data-retention-policy.md](../../executive/strategy/prepare-a-data-retention-policy.md) |
| 2 hops | data breach | [../../oncall-sre/incident-response/handle-a-data-breach.md](../../oncall-sre/incident-response/handle-a-data-breach.md) |
| 2 hops | threat modeling | [../processes/do-a-threat-modeling.md](../processes/do-a-threat-modeling.md) |
| 2 hops | regulatory change | [../../executive/strategy/handle-a-regulatory-change.md](../../executive/strategy/handle-a-regulatory-change.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |
| 2 hops | inversion | [../../knowledge-curator/templates/thinking/inversion.md](../../knowledge-curator/templates/thinking/inversion.md) |
| 2 hops | second-order | [../../knowledge-curator/templates/thinking/second-order-thinking.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) |
| 2 hops | ockhams | [../../knowledge-curator/templates/thinking/ockhams-razor.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) |

## Action recommendations

1. **Data flow diagram**: flow of every PII field; not vague.
2. **Collection minimization**: default to minimization; do not over-collect.
3. **Explicit purpose**: every field must tag a purpose; not vague.
4. **Sharing inventory**: third-party sharing must be tagged + contracted; not hidden.
5. **Retention period**: every field must tag a retention period; not indefinite.
6. **Deletion mechanism**: auto-delete on expiry; do not hoard.
7. **User rights**: access + correction + deletion + portability + objection; no missing item.
8. **Privacy by default**: default privacy settings; not public by default.
9. **Anonymization + desensitization**: use anonymization instead of plaintext where possible.
10. **Encryption**: in transit + at rest; no bare transmission.
11. **Access control**: least privilege; not open.
12. **Audit**: access to PII must be audited; do not omit.
13. **Link with data classification**: PII must be classified confidential / restricted.
14. **Link with data compliance**: regulatory alignment.
15. **Link with data retention**: align retention periods.
16. **Link with data breach**: breach response plan.
17. **Link with threat modeling**: privacy threats via STRIDE.
18. **Regulatory alignment**: GDPR / CCPA / Personal Information Protection Law; no missing regulation.
19. **Documentation + training**: not by word of mouth; everyone knows.
20. **Periodic review**: architecture evolution updates; not one-shot.
21. **First principles**: why we must do PIA; the worst consequence of not doing it.
22. **Inversion thinking**: how much can access control solve; if solvable, do not introduce a PIA.
23. **Second-order thinking**: second-order consequences after the PIA (compliance consistency / trust / recruiting / retention).
24. **Occam**: simpler PIA is better; cut redundant fields.

## Related

- data classification: [./prepare-a-data-classification.md](./prepare-a-data-classification.md) — PII classification
- data compliance: [../../executive/strategy/handle-data-compliance.md](../../executive/strategy/handle-data-compliance.md) — regulatory alignment
- data retention: [../../executive/strategy/prepare-a-data-retention-policy.md](../../executive/strategy/prepare-a-data-retention-policy.md) — retention period
- data breach: [../../oncall-sre/incident-response/handle-a-data-breach.md](../../oncall-sre/incident-response/handle-a-data-breach.md) — breach response
- threat modeling: [../processes/do-a-threat-modeling.md](../processes/do-a-threat-modeling.md) — privacy threats
- regulatory change: [../../executive/strategy/handle-a-regulatory-change.md](../../executive/strategy/handle-a-regulatory-change.md) — regulatory evolution
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
