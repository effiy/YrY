---
title: Do a dependency audit
aliases: [i-want-to-do-a-dependency-audit, dependency-audit, supply-chain-audit, dependency-review]
tags: [journey, methodology, dependency-audit, supply-chain, security, license, vulnerability, sbom]
category: engineer/engineering
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
lifecycle: active
status: stable
review_cycle: quarterly
roles: [engineer, tech-lead]
benefit: "review is structured"
acceptance_criteria:
  - "user story header defines who, what, and why"
  - "step-by-step guide is complete with prerequisites and expected outcome"
  - "cross-references to related journeys and patterns are present
related:
  - ../../oncall-sre/incident-response/handle-a-major-version-upgrade.md
  - ./handle-a-dependency-conflict.md
  - ../process/harden-supply-chain.md
  - ../../tech-lead/roadmap/deprecate-a-feature.md
  - ../../tech-lead/roadmap/manage-tech-debt.md
  - ../../knowledge-curator/templates/thinking--first-principles.md
  - ../../knowledge-curator/templates/thinking--inversion.md
  - ../../knowledge-curator/templates/thinking--second-order-thinking.md
  - ../../knowledge-curator/templates/thinking--ockhams-razor.md
tacit: dependency audit is not just CVE scanning; it is security + license + unused + version + supply chain + SBOM. Run periodically; not one-shot; linked with supply chain hardening
---

# I want to do a dependency audit

> **As an** engineer, **I want to** do a dependency audit, **so that** review is structured. 

## Summary

- dependency audit = security + license + unused + version + supply chain
- CVE scan is just one piece; not the whole
- Run periodically; not one-shot
- Linked with supply chain hardening
- SBOM bill of materials
- Unused dependency cleanup
- Version drift monitoring
- License compliance
- Direct + transitive dependencies
- Automation + CI gatekeeping
- LLM specifics: model + prompt + dataset dependencies
- first principles / inversion / second-order / Occam

## Scenario

Dependency audit is the core of supply chain; not just CVE scanning. This entry provides the dependency audit full path, covering security + license + unused + version + supply chain, run periodically, linked with supply chain hardening, SBOM bill of materials, unused dependency cleanup, version drift monitoring, license compliance, direct + transitive dependencies, automation + CI gatekeeping, LLM specifics, and links to handle-a-dependency-cve / handle-a-major-version-upgrade / handle-a-dependency-conflict / adopt-a-new-dependency / harden-supply-chain / deprecate-a-feature / manage-tech-debt and other leaves. 

## 2-hop reachability paths

| Hop count | goal | file |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | CVE | [./handle-a-dependency-cve.md](../quality-security/handle-a-dependency-cve.md) |
| 2 hops | major version upgrade | [../../oncall-sre/incident-response/handle-a-major-version-upgrade.md](../../oncall-sre/incident-response/handle-a-major-version-upgrade.md) |
| 2 hops | dependency conflict | [./handle-a-dependency-conflict.md](./handle-a-dependency-conflict.md) |
| 2 hops | adopt new dependency | [./i-want-to-adopt-a-new-dependency.md](../quality-security/adopt-a-new-dependency.md) |
| 2 hops | supply chain hardening | [../strategies/harden-supply-chain.md](../process/harden-supply-chain.md) |
| 2 hops | deprecate feature | [../../tech-lead/roadmap/deprecate-a-feature.md](../../tech-lead/roadmap/deprecate-a-feature.md) |
| 2 hops | tech debt | [../../tech-lead/roadmap/manage-tech-debt.md](../../tech-lead/roadmap/manage-tech-debt.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking--first-principles.md](../../knowledge-curator/templates/thinking--first-principles.md) |
| 2 hops | inversion | [../../knowledge-curator/templates/thinking--inversion.md](../../knowledge-curator/templates/thinking--inversion.md) |
| 2 hops | second-order | [../../knowledge-curator/templates/thinking--second-order-thinking.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) |
| 2 hops | ockhams | [../../knowledge-curator/templates/thinking--ockhams-razor.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) |

## Action recommendations

1. **five-dimension audit**: security CVE + license + unused + version + supply chain; no missing dimension
2. **CVE scan is just one piece**: not the whole; must add other dimensions
3. **run periodically**: monthly / quarterly + PR triggered; not one-shot
4. **link with supply chain hardening**: lockfile + audit + min-release-age + lifecycle allowlist
5. **SBOM bill of materials**: generate + archive; traceable
6. **unused dependency cleanup**: depcheck / pipreqs scan unused; do not pile up
7. **version drift monitoring**: dependency version drift alerts; not silent
8. **license compliance**: GPL / AGPL / commercial license review; do not leave compliance gaps
9. **direct + transitive dependencies**: transitive dependencies must be scanned; not only direct
10. **automation + CI gatekeeping**: CI blocks high-risk dependencies; do not rely on human review
11. **dependency replacement strategy**: high-risk / unmaintained / deprecated dependencies must be replaced
12. **dependency budget**: limit introducing new dependencies; do not pile up
13. **dependency owner**: each dependency must have a tagged owner; no orphans
14. **LLM specifics**: model version + prompt version + dataset version + tokenizer version + SDK version
15. **first principles**: why must dependency audit; worst consequence of not doing
16. **inversion thinking**: use lockfile + audit how much can be solved; if solvable, do not introduce audit
17. **second-order thinking**: second-order consequences after audit (supply chain resilience / hiring / compliance / security culture) 
18. **Occam**: audit the simpler the better; cut redundant dimensions

## Related

- CVE: [./handle-a-dependency-cve.md](../quality-security/handle-a-dependency-cve.md) — security dimension
- major version upgrade: [../../oncall-sre/incident-response/handle-a-major-version-upgrade.md](../../oncall-sre/incident-response/handle-a-major-version-upgrade.md) — version dimension
- dependency conflict: [./handle-a-dependency-conflict.md](./handle-a-dependency-conflict.md) — conflict dimension
- adopt new dependency: [./i-want-to-adopt-a-new-dependency.md](../quality-security/adopt-a-new-dependency.md) — adoption decision
- supply chain hardening: [../strategies/harden-supply-chain.md](../process/harden-supply-chain.md) — global hardening
- deprecate feature: [../../tech-lead/roadmap/deprecate-a-feature.md](../../tech-lead/roadmap/deprecate-a-feature.md) — dependency deprecation
- tech debt: [../../tech-lead/roadmap/manage-tech-debt.md](../../tech-lead/roadmap/manage-tech-debt.md) — dependency debt
- thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking--first-principles.md) + [inversion](../../knowledge-curator/templates/thinking--inversion.md) + [second-order](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking--ockhams-razor.md)
