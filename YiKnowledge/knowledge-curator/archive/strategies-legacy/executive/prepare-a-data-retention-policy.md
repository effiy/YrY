---
title: I want to prepare a data retention policy / Prepare a data retention policy
aliases: [i-want-to-prepare-a-data-retention-policy, data-retention-policy, retention-rules]
tags: [journey, methodology, data-governance, compliance, retention, gdpr, soc2]
category: executive/strategy
created: 2026-08-03
updated: 2026-08-03
source: internal
type: journey
lifecycle: active
review_cycle: quarterly
roles: [executive]
benefit: "launch is safe"
acceptance_criteria:
  - "frontmatter roles + benefit + acceptance_criteria present"
  - "filename is a descriptive verb-phrase, hyphens only, no underscores or digits"
  - "body contains user-story header + 7 fixed-order sections"
related:
  - ./handle-data-compliance.md
  - ../../oncall-sre/incident-response/handle-a-data-breach.md
  - ../../engineer/strategies/handle-secrets-and-config.md
  - ../../engineer/processes/migrate-a-database.md
  - ../../engineer/tools/set-up-a-staging-environment.md
  - ../../engineer/process/collaborate-across-teams.md
  - ../../knowledge-curator/templates/thinking/first-principles.md
  - ../../knowledge-curator/templates/thinking/inversion.md
  - ../../knowledge-curator/templates/thinking/second-order-thinking.md
  - ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: Data retention is not "longer is better"; classification + cycle + deletion policy; compliance-driven; data minimization
status: deprecated
---

# I want to prepare a data retention policy

> **As an** executive,**I want to** prepare a data retention policy,**so that** launch is safe.

## Summary

- Data classification: personal data / business data / logs / monitoring / audit
- Retention cycle: compliance-driven + business needs; not "longer is better"
- Deletion policy: hard delete / anonymization / archive
- Compliance alignment: GDPR / SOC2 / regional regulations
- Backup cycle: aligned with retention cycle
- Data minimization: first-principles; do not store what is not needed
- Cross-region regulatory differences; strictest regulation as baseline
- Data migration impact; retention policy follows migration

## Scenario description

Data retention policy is a balance between compliance and cost; not "longer is better". This entry provides the full data retention path, covering classification, retention cycle, deletion policy, compliance alignment, backup cycle, data minimization, cross-region regulatory differences, data migration impact, and links to handle-data-compliance / handle-a-data-breach / handle-secrets-and-config / migrate-a-database / set-up-a-staging-environment / collaborate-across-teams leaves.

## 2-hop reach paths

| Hops | Target | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | Data compliance | [./handle-data-compliance.md](./handle-data-compliance.md) |
| 2 hops | Data breach | [../../oncall-sre/incident-response/handle-a-data-breach.md](../../oncall-sre/incident-response/handle-a-data-breach.md) |
| 2 hops | Secrets and config | [../../engineer/strategies/handle-secrets-and-config.md](../../engineer/strategies/handle-secrets-and-config.md) |
| 2 hops | Database migration | [../../engineer/processes/migrate-a-database.md](../../engineer/processes/migrate-a-database.md) |
| 2 hops | Staging environment | [../../engineer/tools/set-up-a-staging-environment.md](../../engineer/tools/set-up-a-staging-environment.md) |
| 2 hops | Cross-team collaboration | [../../engineer/process/collaborate-across-teams.md](../../engineer/process/collaborate-across-teams.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |
| 2 hops | inversion | [../../knowledge-curator/templates/thinking/inversion.md](../../knowledge-curator/templates/thinking/inversion.md) |
| 2 hops | second-order | [../../knowledge-curator/templates/thinking/second-order-thinking.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) |
| 2 hops | ockhams | [../../knowledge-curator/templates/thinking/ockhams-razor.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) |

## Action recommendations

1. **Data classification**: personal data / business data / logs / monitoring / audit; classification drives retention cycle
2. **Retention cycle**: compliance-driven + business needs; not "longer is better"; personal data minimized
3. **Deletion policy**: hard delete / anonymization / archive; not a simple DROP
4. **Compliance alignment**: GDPR / SOC2 / regional regulations; strictest regulation as baseline
5. **Backup cycle**: aligned with retention cycle; backups also cleaned by cycle
6. **Data minimization**: first-principles; do not store what is not needed; review at collection
7. **Cross-region regulatory differences**: EU / US / CN / etc.; strictest as baseline
8. **Data migration impact**: retention policy follows migration; migration does not extend retention
9. **Personal data special handling**: PII minimized; user deletion requests must be supported
10. **Log tiered retention**: DEBUG short / INFO medium / ERROR long; do not mix
11. **Monitoring data retention**: high-cardinality metrics short / sampled traces short / logs long
12. **Audit log retention**: audit logs long retention ≥ 1 year; compliance requirement
13. **Deletion executable**: deletion policy must be executable; cannot define but not delete
14. **Anonymization standard**: anonymization irreversible; hash / masking / aggregation
15. **First principles**: why must retain / delete; worst consequence of not doing
16. **Reverse thinking**: how much can minimum retention + anonymization solve; if solvable, do not keep all
17. **Second-order thinking**: second-order consequences of retention (cost / compliance / risk / migration)
18. **Occam**: simpler retention policy is better; cut redundant classifications

## Related

- Data compliance: [./handle-data-compliance.md](./handle-data-compliance.md) — regulation alignment
- Data breach: [../../oncall-sre/incident-response/handle-a-data-breach.md](../../oncall-sre/incident-response/handle-a-data-breach.md) — retention policy review after breach
- Secrets and config: [../../engineer/strategies/handle-secrets-and-config.md](../../engineer/strategies/handle-secrets-and-config.md) — secret retention cycle
- Database migration: [../../engineer/processes/migrate-a-database.md](../../engineer/processes/migrate-a-database.md) — migration retention alignment
- Staging environment: [../../engineer/tools/set-up-a-staging-environment.md](../../engineer/tools/set-up-a-staging-environment.md) — masking + retention
- Cross-team: [../../engineer/process/collaborate-across-teams.md](../../engineer/process/collaborate-across-teams.md) — legal / compliance collaboration
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
