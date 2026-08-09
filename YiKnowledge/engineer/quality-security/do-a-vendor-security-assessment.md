---
title: Do a vendor security assessment
aliases: [i-want-to-do-a-vendor-security-assessment, vendor-security-assessment, third-party-risk, vendor-risk-assessment]
tags: [journey, methodology, security, vendor-management, third-party-risk, compliance, supply-chain]
category: engineer/quality-security
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
lifecycle: active
status: stable
review_cycle: quarterly
roles: [engineer]
benefit: "Engineers evaluate third-party vendors for security risks before integration, preventing supply chain breaches"
acceptance_criteria:
  - "user story header defines who, what, and why"
  - "step-by-step guide is complete with prerequisites and expected outcome"
  - cross-references to related journeys and patterns are present
related:
  - ../process/harden-supply-chain.md
  - ../../knowledge-curator/templates/thinking--first-principles.md
  - ../../knowledge-curator/templates/thinking--inversion.md
  - ../../knowledge-curator/templates/thinking--second-order-thinking.md
  - ../../knowledge-curator/templates/thinking--ockhams-razor.md
tacit: Vendor security assessment is not just a questionnaire; it is an admission contract. Data + access + compliance + audit + incident response; continuous monitoring; not one-shot
---

# I want to do a vendor security assessment

> **As an** engineer, **I want to** do a vendor security assessment, **so that** outcome is traceable. 

## Summary

- Vendor security assessment = admission contract; not just a questionnaire
- Data + access + compliance + audit + incident response; five dimensions
- Continuous monitoring; not one-shot
- SOC2 / ISO 27001 / security whitepaper; not vague
- Data flow diagrams must be tagged; not hidden
- Contracts must tag SLA + security clauses + audit rights + incident response
- Links with supply-chain hardening + dependency audit
- Links with threat modeling + compliance
- Tiered admission; by risk level
- Documentation + training; not oral
- Periodic review; architecture evolution updates
- First principles / inversion / second-order / Occam

## Scenario

Vendor security assessment is an admission contract; not just a questionnaire. This entry provides the vendor security assessment full path, covering data + access + compliance + audit + incident response five dimensions, continuous monitoring, SOC2 / ISO 27001 / security whitepaper, data flow diagrams must be tagged, contracts must tag SLA + security clauses + audit rights + incident response, linking with supply-chain hardening + dependency audit, linking with threat modeling + compliance, tiered admission, documentation + training, periodic review, and links to evaluate-a-vendor-saas / manage-a-vendor-relationship / harden-supply-chain / do-a-dependency-audit / prepare-a-license-compliance-review / do-a-threat-modeling and other leaves. 

## 2-hop reachability paths

| Hops | Target | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | vendor evaluation | [../strategies/evaluate-a-vendor-saas.md](../engineering/evaluate-a-vendor-saas.md) |
| 2 hops | vendor relationship | [./manage-a-vendor-relationship.md](../engineering/manage-a-vendor-relationship.md) |
| 2 hops | supply-chain hardening | [../strategies/harden-supply-chain.md](../process/harden-supply-chain.md) |
| 2 hops | dependency audit | [./do-a-dependency-audit.md](../engineering/do-a-dependency-audit.md) |
| 2 hops | license compliance | [../../executive/strategy/prepare-a-license-compliance-review.md](../../knowledge-curator/archive/strategies-legacy/executive/prepare-a-license-compliance-review.md) |
| 2 hops | threat modeling | [./do-a-threat-modeling.md](../quality-security/do-a-threat-modeling.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking--first-principles.md](../../knowledge-curator/templates/thinking--first-principles.md) |
| 2 hops | inversion | [../../knowledge-curator/templates/thinking--inversion.md](../../knowledge-curator/templates/thinking--inversion.md) |
| 2 hops | second-order | [../../knowledge-curator/templates/thinking--second-order-thinking.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) |
| 2 hops | ockhams | [../../knowledge-curator/templates/thinking--ockhams-razor.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) |

## Action recommendations

1. **Five dimensions**: data + access + compliance + audit + incident response; no missing dimension
2. **Data flow diagram**: each vendor's data flow direction; not vague
3. **Data classification**: tiered control by level; PII / commercial / security / compliance
4. **Access control**: least privilege + MFA + audit; do not leave open
5. **Compliance certification**: SOC2 / ISO 27001 / security whitepaper; not vague
6. **Contract clauses**: SLA + security clauses + audit rights + incident response; no missing items
7. **Audit rights**: periodic audit + on-site audit; do not give up
8. **Incident response**: vendor breach notification window + joint playbook; not vague
9. **Continuous monitoring**: not one-shot; periodic re-assess
10. **Tiered admission**: by risk level; high-risk strict review / low-risk simplified
11. **Questionnaire assessment**: standard questionnaire + evidence; not just filling forms
12. **Penetration test**: high-risk vendors must pentest; not oral
13. **Supply-chain hardening linkage**: lockfile + audit + min-release-age
14. **Dependency audit linkage**: direct + transitive dependencies must be scanned
15. **License compliance linkage**: GPL / AGPL / commercial review
16. **Threat modeling linkage**: trust boundary + attack path
17. **Exit plan**: termination + data migration + deletion; not locked in
18. **Documentation + training**: not oral; everyone knows
19. **Periodic review**: architecture evolution updates; not one-shot
20. **first principles**: why must assessment; worst consequence of not doing it
21. **inversion thinking**: how much can contract clauses solve; if solvable, do not introduce assessment
22. **second-order thinking**: second-order consequences after assessment (compliance consistency / trust / hiring / admission efficiency) 
23. **Occam**: assessment the simpler the better; cut redundant dimensions

## Related

- vendor evaluation: [../strategies/evaluate-a-vendor-saas.md](../engineering/evaluate-a-vendor-saas.md) — functional evaluation
- vendor relationship: [./manage-a-vendor-relationship.md](../engineering/manage-a-vendor-relationship.md) — relationship management
- supply-chain hardening: [../strategies/harden-supply-chain.md](../process/harden-supply-chain.md) — material supply chain
- dependency audit: [./do-a-dependency-audit.md](../engineering/do-a-dependency-audit.md) — code dependencies
- license compliance: [../../executive/strategy/prepare-a-license-compliance-review.md](../../knowledge-curator/archive/strategies-legacy/executive/prepare-a-license-compliance-review.md) — legal compliance
- threat modeling: [./do-a-threat-modeling.md](../quality-security/do-a-threat-modeling.md) — trust boundary
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking--first-principles.md) + [inversion](../../knowledge-curator/templates/thinking--inversion.md) + [second-order](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking--ockhams-razor.md)
