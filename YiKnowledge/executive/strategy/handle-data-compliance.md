---
title: Handle data compliance
aliases:
- I want tohandledatacompliance
- compliance-journey
- pii-journey
- datacomplianceentry
tags:
- journeys
- compliance
- pii
- data-governance
- security-audit
- cross-border
category: executive/strategy
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
last_verified: 2026-08-07
roles:
- executive
benefit: incident is contained
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../../engineer/process/harden-supply-chain.md
- ../../oncall-sre/incident-response/respond-to-an-incident.md
- ../../engineer/infrastructure/data-compliance.md
review_cycle: quarterly
tacit: false
---

# I want to handle data compliance

> **As an** executive, **I want to** handle data compliance, **so that** incident is contained.

> "PII / cross-border data transfer / cross-border compliance / data governance / security audit / injection defense" reach within 2 hops — compliance process + data governance + security audit + cross-cultural UX + injection defense.

## Summary

- Compliance process: see [data-compliance-process.md](../../engineer/infrastructure/data-compliance.md): classification / cross-border transfer / audit trail / audit
- Data governance: see [data-governance-summary.md](../../ai-engineer/data/data-governance.md) + [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md)
- Security audit: see [quarterly-security-audit-process.md](../../engineer/quality-security/quarterly-security-audit.md) + [incident-response-process.md](../../engineer/process/incident-response.md)
- Injection defense: see [prompt-injection-defense-summary.md](../../ai-engineer/methodology/prompt-injection-defense.md)

## Core viewpoints

**PII is a liability, not an asset.** Every piece of personally identifiable information your system stores is a future breach surface, a regulatory obligation, and a deletion request waiting to happen. The business value of retained PII rarely justifies the compliance cost. The default posture should be: do not collect it, do not store it, and if you must store it, delete it on a schedule. "We might need it later" is the most expensive sentence in data compliance.

**Data classification must precede all compliance work.** You cannot protect what you have not classified. Teams that jump straight to encryption or access control without first mapping every data store, labeling every field (public/internal/confidential/PII/sensitive-PII), and identifying cross-border flows will build controls that miss entire categories of data. Classification is tedious but non-negotiable: no audit passes without it.

**AI applications create novel compliance surfaces that traditional frameworks miss.** User prompts sent to third-party LLM APIs may contain PII. Embedding vectors derived from user data may be reversible. Conversation histories stored for model improvement may violate retention policies. Standard data compliance checklists do not cover these surfaces. AI-specific compliance requires: prompt sanitization pipelines, embedding access controls, and training-data exclusion flags.

**Audit trails are your only defense in an investigation.** When a regulator or customer asks "who accessed this data and when," the answer cannot be "we do not log that." Tamper-proof audit trails with immutable storage and retention-period-aligned deletion are the difference between a defensible position and an indefensible one. The audit trail itself must survive the data it audits -- if you delete the PII but also delete the log that proves you deleted it, you have no evidence of compliance.

**Compliance is continuous, not event-driven.** A point-in-time compliance certification is a snapshot, not a guarantee. Systems change, data flows evolve, new third parties are integrated, and regulations are updated. Without continuous monitoring of data access patterns, automated classification scanning, and quarterly audit cycles, a system that was compliant in January may be non-compliant by March.

## Key info

- **Data classification taxonomy**: Public (safe for open access, no restrictions), Internal (within the organization, limited external sharing), Confidential (business-sensitive, NDAs required, e.g., financials, roadmaps, customer lists), PII (personally identifiable, e.g., name, email, phone, IP address -- requires access controls, retention limits, deletion capability), Sensitive PII (PII + sensitive attributes, e.g., health data, biometrics, financial account numbers, government IDs -- requires encryption at rest, access logging, and data residency controls). The jump from PII to Sensitive PII carries the largest compliance cost increase; most systems should avoid collecting Sensitive PII unless the business model requires it.
- **Cross-border data transfer frameworks**: China PIPL (Personal Information Protection Law, requires security assessment for cross-border transfers of >1M individuals' data, standard contract for smaller volumes, data localization for CII operators), EU GDPR (adequacy decisions, Standard Contractual Clauses, Binding Corporate Rules), US (state-level patchwork: CCPA/CPRA in California, no federal comprehensive law). The key operational constraint: data collected in China must be stored in China unless a security assessment approves the transfer. This means Chinese-market services need China-hosted infrastructure.
- **AI-specific compliance surfaces**: (1) User prompts to third-party LLM APIs may contain PII -- prompts must be sanitized before leaving your infrastructure. (2) Embedding vectors derived from user data may be reversible (inversion attacks can reconstruct training data from embeddings) -- embeddings of PII are PII. (3) Conversation histories stored for model improvement may violate retention policies -- users must be able to opt out and request deletion. (4) RAG systems that index internal documents may expose PII through retrieval -- the index must be access-controlled and PII-aware.
- **Audit trail requirements**: (1) immutable storage (append-only, no modification or deletion, e.g., AWS CloudTrail with S3 Object Lock), (2) complete coverage (who, what, when, source IP, result for every data access), (3) retention aligned with data retention (if PII is retained for 7 years, the audit log for that PII must also be retained for 7 years), (4) tamper-evident (hash chain, digital signatures, or blockchain-backed). The most common audit gap: deletion operations are logged but the log of what was deleted is itself deleted when the data retention period expires.
- **Compliance certification landscape**: ISO 27001 (information security management, international, 12-18 months to achieve, ~$15K-50K audit cost), SOC 2 Type II (service organization controls, US-focused, 6-12 months, ~$20K-80K), GDPR compliance (no certification, self-attestation, ongoing), PIPL (China-specific, security assessment required for cross-border, 3-6 months). For a China-based startup serving both domestic and international customers, PIPL + GDPR is the minimum compliance foundation; ISO 27001 and SOC 2 are competitive differentiators for enterprise sales.

## Scenario description

Handle PII / cross-border data transfer / cross-border business / security audit / AI application data compliance / user data requests / regulatory checks — when PM + legal + engineering + security need to look up compliance process + data governance + security audit + cross-cultural UX + injection defense. This entry aggregates the 6 compliance-related leaf entries + data governance + security audit into a 2-hop path, avoiding "compliance only relies on legal sign-off / data has no classification / audit has no contingency / AI injection has no defense".

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [data-compliance-process.md](../../engineer/infrastructure/data-compliance.md) · [quarterly-security-audit-process.md](../../engineer/quality-security/quarterly-security-audit.md) · [data-migration-process.md](../../engineer/infrastructure/data-migration.md) · [incident-response-process.md](../../engineer/process/incident-response.md) · [monitoring-governance-process.md](../../engineer/process/monitoring-governance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [dependency-upgrade-process.md](../../engineer/engineering/dependency-upgrade.md) |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) · [lakehouse-architecture-summary.md](../../ai-engineer/data/lakehouse-architecture.md) · [mongodb-indexing-summary.md](../../ai-engineer/data/mongodb-indexing.md) |
| `methodology/ai-specific/` | [prompt-injection-defense-summary.md](../../ai-engineer/methodology/prompt-injection-defense.md) · [hallucination-mitigation-summary.md](../../ai-engineer/methodology/hallucination-mitigation.md) · [llm-evaluation-methods-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md) |
| `methodology/engineering-patterns/` | [supply-chain-hardening-pattern.md](../../engineer/process/harden-supply-chain.md) · [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md) · [evaluation-driven-development-pattern.md](../../engineer/engineering/evaluation-driven-development.md) |
| `product/ux/` | [cross-cultural-ux-summary.md](../../product-manager/discovery/ux/cross-cultural-ux.md) — cross-cultural / cross-border UX · [nielsen-heuristics-summary.md](../../product-manager/discovery/ux/nielsen-heuristics.md) |
| `lessons/gotchas/` | [no-lockfile-supply-chain-risk.md](../../engineer/lessons/gotcha-no-lockfile-supply-chain-risk.md) — supply chain risk · [macos-fsevents-silent-drop.md](../../engineer/lessons/gotcha-macos-fsevents-silent-drop.md) — lost events break compliance audit trail |
| `lessons/failures/` | [ai-product-launch-lessons-summary.md](../../engineer/lessons/failure-ai-product-launch-lessons.md) · [incident-postmortem-summary.md](../../engineer/lessons/failure-incident-postmortem.md) — compliance incident retrospective |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — legal / security / business stakeholders |
| `work/collaboration/` | [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/process/cross-timezone-collaboration.md) — cross-border collaboration |
| `resources/templates/` | [tech-selection-evaluation-template.md](../../knowledge-curator/templates/tech-selection-evaluation.md) · [tech-selection-evaluation-summary.md](../../knowledge-curator/templates/tech-selection-evaluation.md) — compliance assessment |

## Action recommendations

1. **Data classification**: public / internal / confidential / PII / sensitive PII; classification determines storage + encryption + access + audit trail strategy; see [data-governance-summary.md](../../ai-engineer/data/data-governance.md).
2. **Cross-border transfer compliance**: PII / cross-border data requires compliance assessment + data masking + cross-border transfer list + user authorization; see [data-compliance-process.md](../../engineer/infrastructure/data-compliance.md).
3. **Storage encryption**: encryption at rest + encryption in transit + field-level encryption (sensitive fields); key management via KMS.
4. **Access control**: least privilege + role separation + operation audit trail + regular audit; see [quarterly-security-audit-process.md](../../engineer/quality-security/quarterly-security-audit.md).
5. **AI applications**: user input may contain PII → data masking + not written to training + not streamed back to upstream provider; see [prompt-injection-defense-summary.md](../../ai-engineer/methodology/prompt-injection-defense.md).
6. **Cross-border UX**: copy / privacy terms / cookie prompt / data authorization adapted by region; see [cross-cultural-ux-summary.md](../../product-manager/discovery/ux/cross-cultural-ux.md).
7. **User data requests**: GDPR / personal information protection law — "query / export / delete" requests must be responded to; follow [data-compliance-process.md](../../engineer/infrastructure/data-compliance.md).
8. **Audit trail**: all sensitive operations must land in logs + be tamper-proof + retention-period compliant (typically 6 months – 3 years).
9. **Incident response**: compliance incident — see [incident-response-process.md](../../engineer/process/incident-response.md) + communicate with regulators within 24h + notify impacted users.
10. **Third-party dependencies**: supply-chain compliance — see [supply-chain-hardening-pattern.md](../../engineer/process/harden-supply-chain.md) + [dependency-upgrade-process.md](../../engineer/engineering/dependency-upgrade.md).

## Anti-patterns

- **Storing PII in logs, backups, and analytics pipelines without the same controls as the primary data store.** Developers routinely log request bodies containing PII for debugging, backup systems retain data long after the primary store deletes it, and analytics pipelines copy PII into data warehouses without classification. Each copy is a separate compliance surface. The most common breach vector is not the production database -- it is the unsecured Elasticsearch cluster of debug logs.

- **Treating encryption as a compliance silver bullet.** Encryption at rest and in transit is necessary but insufficient. It does not address access control (who can decrypt), retention (when to delete), or lawful basis (why you have it). A fully encrypted database that retains PII indefinitely with broad internal access is still non-compliant. Encryption is one layer; it is not the whole program.

- **Skipping third-party compliance due diligence.** Every SaaS vendor, API provider, and cloud service that touches your data inherits your compliance obligations. A vendor's SOC 2 report does not mean they are GDPR-compliant for your specific use case. Without a Data Processing Agreement (DPA) and a documented review of the vendor's sub-processors, your compliance posture is only as strong as your weakest vendor.

- **Granting broad access "just in case" instead of least-privilege from day one.** The pattern of giving every engineer production database access because "they might need to debug something" creates an audit nightmare. Every person with access is a potential breach vector and must be accounted for in access reviews. Implement role-based access with just-in-time elevation: nobody has standing access to PII, and temporary access requires justification and automatic expiry.

- **Assuming the cloud provider handles all compliance.** Cloud providers operate on a shared responsibility model. They secure the infrastructure; you secure what you put on it. Misconfigured S3 buckets, open Elasticsearch clusters, and unencrypted RDS snapshots are customer-responsibility failures that the provider's compliance certifications do not cover.

## Related

- Related journey: [../../engineer/process/harden-supply-chain.md](../../engineer/process/harden-supply-chain.md) — supply-chain compliance
- Related journey: [../../oncall-sre/incident-response/respond-to-an-incident.md](../../oncall-sre/incident-response/respond-to-an-incident.md) — compliance incident response
- Related journey: [../../engineer/process/collaborate-across-teams.md](../../engineer/process/collaborate-across-teams.md) — cross-border team collaboration
- Related journey: [../../ai-engineer/platform/evaluate-an-llm-app.md](../../ai-engineer/platform/evaluate-an-llm-app.md) — AI application injection defense
- Upstream: [../../README.md](../../README.md) — processes leaf entry
