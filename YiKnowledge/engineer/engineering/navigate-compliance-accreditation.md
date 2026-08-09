---
title: Navigate compliance accreditation
aliases: [i-want-to-navigate-compliance-accreditation, ato, fedramp, stig, cmmc, nist-800-171, itar, dod-il, rmf]
tags: [journey, process, compliance, accreditation, ato, fedramp, stig, cmmc, nist-800-171, itar, dod-il, rmf]
category: engineer/engineering
created: 2026-08-05
updated: 2026-08-05
last_verified: 2026-08-07
source: internal
type: summary
lifecycle: active
status: stable
review_cycle: quarterly
roles: [engineer]
benefit: "Compliance requirements are met systematically with audit-ready documentation, avoiding last-minute certification scrambles"
acceptance_criteria:
  - "user story header defines who, what, and why"
  - "step-by-step guide is complete with prerequisites and expected outcome"
  - "cross-references to related journeys and patterns are present
related:
  - ../process/deploy-to-an-air-gapped-environment.md
  - ../process/harden-supply-chain.md
  - ../../knowledge-curator/templates/thinking--first-principles.md
  - ../../knowledge-curator/templates/thinking--inversion.md
  - ../../knowledge-curator/templates/thinking--second-order-thinking.md
  - ../../knowledge-curator/templates/thinking--ockhams-razor.md
tacit: Compliance accreditation is not a checklist; it is an architecture choice. ATO / FedRAMP / STIG / CMMC / ITAR / DoD IL determine where cloud / network / image / model weights can go; raise it in the discovery call; do not discover in Week 12
---

# I want to navigate compliance accreditation

> **As an** engineer, **I want to** navigate compliance accreditation, **so that** launch is safe.

## Summary

- Compliance accreditation = architecture choice; not a checklist
- ATO: Authority to Operate; NIST RMF; 6-18 months
- DoD IL2 / IL4 / IL5 / IL6: determines cloud / network / image boundary
- FedRAMP High vs Moderate: most Gen AI only Moderate; government hard block
- STIG: DISA hardening checklist; CI must produce STIG-compliant artifact
- ITAR / EAR: weights themselves are controlled; cannot ship to non-US persons
- CMMC 2.0: DoD contractor certification; Level 2 = NIST SP 800-171 Rev.2 (110 items); Rev.3 (97 items) pending 2027
- Distinction from compliance-framework: this file leans toward defense / government accreditation path
- publicly queryable; periodic review
- first principles / inversion / second-order / Occam

## Scenario

Compliance accreditation is not a checklist; it is an architecture choice. This entry provides the accreditation navigation full path, covering ATO + DoD IL2-6 + FedRAMP + STIG + ITAR / EAR + CMMC 2.0 + NIST SP 800-171 + NIST RMF, linked with data-compliance + do-a-threat-modeling + do-a-vendor-security-assessment + quarterly-security-audit + prepare-a-compliance-framework + prepare-an-ai-compliance-strategy + deploy-to-an-air-gapped-environment + harden-supply-chain, publicly queryable, periodic review, and links to data-compliance / threat-modeling / vendor-security / security-audit / compliance-framework / ai-compliance / air-gap / supply-chain and other leaves.

## 2-hop reachability paths

| Hops | goal | file |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | data-compliance | [./data-compliance.md](../infrastructure/data-compliance.md) |
| 1 hop | threat-modeling | [./do-a-threat-modeling.md](../quality-security/do-a-threat-modeling.md) |
| 2 hops | compliance-framework | [../strategies/prepare-a-compliance-framework.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-compliance-framework.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking--first-principles.md](../../knowledge-curator/templates/thinking--first-principles.md) |

## Action recommendations

1. **Accreditation anchoring**: compliance = architecture choice; not an after-the-fact checklist
2. **ATO path**: NIST RMF; 6-18 months; raise it in discovery call
3. **DoD Impact Levels**: IL2 (public non-key) + IL4 (CUI) + IL5 (high-sensitivity CUI + mission key) + IL6 (Secret)
4. **FedRAMP**: High vs Moderate; most Gen AI only Moderate = government hard block
5. **FedRAMP Marketplace verification**: check marketplace before promising capability
6. **STIG**: DISA hardening checklist; CI must produce STIG-compliant artifact; otherwise ATO bounce
7. **ITAR / EAR**: weights trained on ITAR data = weights themselves controlled; do not ship to non-US persons
8. **CMMC 2.0**: Level 2 = NIST SP 800-171 Rev.2 (110 items); Rev.3 (97 items) published 2024-05 but not baseline; rulemaking ~2027
9. **NIST SP 800-171**: 110 items / 97 items; CMMC Level 2 actual assessment baseline
10. **NIST RMF**: Risk Management Framework; ATO standard path
11. **Network segmentation**: NIPRNet (unclassified) + SIPRNet (classified); IL determines which can be connected
12. **Cloud choice**: GCC High / AWS GovCloud / Azure Government; not commercial cloud
13. **Iron Bank**: DoD centralized hardened image repo; not in Iron Bank = cannot get on Platform One
14. **Day 1 assumption**: no internet + no public API; always the first assumption
15. **Do not accredit for accreditation's sake**: each item tied to a landing scenario and architecture decision
16. **Not sloganeering**: each item tagged with ADR + compliance basis
17. **Versioned**: accreditation state has versions; evolution is traceable
18. **Link with data-compliance**: accreditation + data compliance co-build
19. **Link with threat-modeling**: accreditation + threat modeling co-build
20. **Link with vendor-security**: accreditation + vendor security co-build
21. **Link with security-audit**: accreditation + quarterly security audit co-build
22. **Distinction from compliance-framework**: this file leans toward defense / government accreditation path; latter leans toward general compliance
23. **Link with ai-compliance**: accreditation + AI compliance co-build
24. **Link with air-gap**: accreditation + offline deploy co-build
25. **Link with supply-chain**: accreditation + image hardening co-build
26. **Toolchain**: Iron Bank / STIG Viewer / Nessus / Trivy / Grype / Kyverno / OPA Gatekeeper / Cosign / Terraform
27. **Publicly queryable**: accreditation path anyone can look up; not hidden
28. **Periodic review**: evolution updates; not one-shot (FedRAMP / CMMC standards change yearly)
29. **First principles**: why must accredit; worst consequence of not doing (ATO revoked / contract cancelled / criminal)
30. **Inversion thinking**: how much can be solved by relying on commercial cloud; does customer compliance allow it
31. **Second-order thinking**: second-order consequences after accreditation (architecture constraint / cost / time to market)
32. **Occam**: accreditation path — the simpler the better; cut redundant accreditations

## Related

- data-compliance: [./data-compliance.md](../infrastructure/data-compliance.md) — data compliance co-build
- threat-modeling: [./do-a-threat-modeling.md](../quality-security/do-a-threat-modeling.md) — threat modeling co-build
- vendor-security: [./do-a-vendor-security-assessment.md](../quality-security/do-a-vendor-security-assessment.md) — vendor security co-build
- security-audit: [./quarterly-security-audit.md](../quality-security/quarterly-security-audit.md) — quarterly security audit co-build
- compliance-framework: [../strategies/prepare-a-compliance-framework.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-compliance-framework.md) — general compliance framework complement
- ai-compliance: [../strategies/prepare-an-ai-compliance-strategy.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-an-ai-compliance-strategy.md) — AI compliance co-build
- air-gap: [../strategies/deploy-to-an-air-gapped-environment.md](../process/deploy-to-an-air-gapped-environment.md) — offline deploy co-build
- supply-chain: [../strategies/harden-supply-chain.md](../process/harden-supply-chain.md) — supply chain hardening co-build
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking--first-principles.md) + [inversion](../../knowledge-curator/templates/thinking--inversion.md) + [second-order](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking--ockhams-razor.md)
