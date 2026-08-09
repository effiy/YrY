---
title: Run a site survey
aliases: [i-want-to-run-a-site-survey, site-survey, discovery-report, data-landscape, delta-identification]
tags: [journey, process, site-survey, discovery-report, data-landscape, delta, quick-win]
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
benefit: "Site surveys produce actionable deployment plans by capturing infrastructure, constraints, and stakeholder requirements upfront"
acceptance_criteria:
  - "user story header defines who, what, and why"
  - "step-by-step guide is complete with prerequisites and expected outcome"
  - "cross-references to related journeys and patterns are present
related:
  - ./do-a-tech-stack-inventory.md
  - ../process/operate-as-a-forward-deployed-engineer.md
  - ../process/apply-consulting-frameworks.md
  - ../architecture-design/design-a-minimum-viable-architecture.md
  - ../../knowledge-curator/templates/thinking--first-principles.md
  - ../../knowledge-curator/templates/thinking--inversion.md
  - ../../knowledge-curator/templates/thinking--second-order-thinking.md
  - ../../knowledge-curator/templates/thinking--ockhams-razor.md
tacit: "Site Survey is not meeting minutes; it is landing documentation. 4 fixed sections: Data Landscape + Technical/Security Constraints + Delta + Quick Win; written in Week 1; not one-shot; versioned"
---

# I want to write a site discovery report

> **As an** engineer, **I want to** run a site survey, **so that** launch is safe.

## Summary

- Site Survey = Week 1 landing documentation; not meeting minutes
- 4 fixed sections: Data Landscape + Technical/Security Constraints + Delta + Quick Win
- Data Landscape: source systems + data gravity + known quality issues
- Technical/Security: identity + connectivity + exfiltration risks
- Delta: product gap + proposed glue
- Quick Win: Week 2 goal is falsifiable
- Distinction from discovery-call: call is a meeting; survey is landing documentation
- publicly queryable; periodic review
- First principles / inversion / second-order / Occam

## Scenario

Site Survey is not meeting minutes; it is landing documentation. This entry provides the site survey full path, covering 4 fixed sections + Week 1 time window + linkage with stakeholder-mapping + tech-stack-inventory + data-quality-audit + threat-modeling, and linkage with operate-as-a-forward-deployed-engineer + apply-consulting-frameworks + design-a-minimum-viable-architecture + write-a-statement-of-work + prepare-a-discovery-call-strategy, publicly queryable, periodic review, and links to fde-role / consulting-frameworks / mva / sow / discovery-call and other leaves.

## 2-hop reachability paths

| Hop count | Target | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | stakeholder-mapping | [./do-a-stakeholder-mapping.md](../process/do-a-stakeholder-mapping.md) |
| 1 hop | tech-stack-inventory | [./do-a-tech-stack-inventory.md](./do-a-tech-stack-inventory.md) |
| 2 hops | fde-role | [../strategies/operate-as-a-forward-deployed-engineer.md](../process/operate-as-a-forward-deployed-engineer.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking--first-principles.md](../../knowledge-curator/templates/thinking--first-principles.md) |

## Action recommendations

1. **Week 1 time window**: write within Week 1; do not delay
2. **4 fixed sections**: Data Landscape + Technical/Security Constraints + Delta + Quick Win; do not omit any section
3. **Data Landscape**: source systems (SQL Server / SAP HANA / Sharepoint) + data gravity (TB + growth rate + regional constraint) + known quality issues (missing timestamps / no primary key)
4. **Technical/Security Constraints**: identity (Okta OIDC + GCP IAM) + connectivity (no public internet / Interconnect + Private Google Access) + exfiltration risks (VPC SC / perimeter bridges)
5. **Delta identification**: product gap (does not support .xyz format) + proposed glue (GCF parser → Parquet)
6. **Quick Win**: Week 2 goal is falsifiable; e.g., Agent Search 90% recall
7. **Champion + Blocker**: internal champion + department blocker; do not omit
8. **Success Metric**: Lower Latency / Higher Accuracy / Headcount Reduction; not empty
9. **Classification**: PII / PHI / Secret; do not omit
10. **Ingestion**: Streaming (Pub/Sub) vs Batch (BigQuery transfer); do not omit
11. **Quotas**: GPU quota (A100 / H100) sufficient; do not omit
12. **Not documentation for documentation's sake**: each section connects to landing evidence
13. **Not sloganeering**: each section tagged with measurement
14. **Versioned**: survey has versions; evolution is traceable
15. **Link with stakeholder-mapping**: survey + stakeholder map co-built
16. **Link with tech-stack-inventory**: survey + tech-stack inventory co-built
17. **Link with data-quality-audit**: survey + data quality audit co-built
18. **Link with threat-modeling**: survey + threat modeling co-built
19. **Link with fde-role**: survey + FDE co-built
20. **Link with consulting-frameworks**: survey + MECE / Three Whys co-built
21. **Link with mva**: survey + minimum viable architecture co-built
22. **Link with sow**: survey + statement of work co-built
23. **Distinction from discovery-call**: call is a meeting; survey is landing documentation
24. **Toolchain**: Mermaid / Excalidraw / Miro / Notion / Linear / gcloud / Datastream / DLP
25. **publicly queryable**: survey accessible to everyone; not hidden
26. **periodic review**: evolution updates; not one-shot
27. **first principles**: why must survey; worst consequence of not doing (only discovering legacy blocking in Week 4)
28. **inversion thinking**: how much can verbal communication solve; does customer IT provide complete documentation
29. **second-order thinking**: second-order consequences after survey (sow accuracy / contract renewal / project survival)
30. **Occam**: the more focused the survey, the better; cut redundant sections

## Related

- stakeholder-mapping: [./do-a-stakeholder-mapping.md](../process/do-a-stakeholder-mapping.md) — stakeholder map co-built
- tech-stack-inventory: [./do-a-tech-stack-inventory.md](./do-a-tech-stack-inventory.md) — tech-stack inventory co-built
- data-quality-audit: [./do-a-data-quality-audit.md](../infrastructure/do-a-data-quality-audit.md) — data quality audit co-built
- threat-modeling: [./do-a-threat-modeling.md](../quality-security/do-a-threat-modeling.md) — threat modeling co-built
- fde-role: [../strategies/operate-as-a-forward-deployed-engineer.md](../process/operate-as-a-forward-deployed-engineer.md) — FDE co-built
- consulting-frameworks: [../strategies/apply-consulting-frameworks.md](../process/apply-consulting-frameworks.md) — consulting frameworks co-built
- mva: [../strategies/design-a-minimum-viable-architecture.md](../architecture-design/design-a-minimum-viable-architecture.md) — minimum viable architecture co-built
- sow: [./write-a-statement-of-work.md](../infrastructure/write-a-statement-of-work.md) — statement of work co-built
- discovery-call: [../strategies/prepare-a-discovery-call-strategy.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-discovery-call-strategy.md) — discovery call complementary
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking--first-principles.md) + [inversion](../../knowledge-curator/templates/thinking--inversion.md) + [second-order](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking--ockhams-razor.md)
