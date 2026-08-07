---
title: I want to build a Zabbix strategy / Prepare a Zabbix strategy
aliases: [i-want-to-prepare-a-zabbix-strategy, zabbix-strategy]
tags: [journey, methodology, observability, zabbix, planning]
category: engineer/strategies
created: 2026-08-04
updated: 2026-08-04
source: internal
type: journey
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "launch is safe"
acceptance_criteria:
  - "frontmatter roles + benefit + acceptance_criteria present"
  - "Filename is descriptive verb-phrase, hyphens only, no underscores or digits"
  - "body contains user-story header + 7 fixed-order sections"
related:
  - ./prepare-a-nagios-strategy.md
  - ./prepare-a-prometheus-strategy.md
  - ../../oncall-sre/incident-response/prepare-an-observability-strategy.md
  - ./prepare-an-alerting-strategy.md
  - ../../oncall-sre/incident-response/prepare-an-incident-management-strategy.md
  - ../../knowledge-curator/templates/thinking/first-principles.md
  - ../../knowledge-curator/templates/thinking/inversion.md
  - ../../knowledge-curator/templates/thinking/second-order-thinking.md
  - ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: Zabbix is not just monitoring; it is a contract. collect + trigger + alert + governance + measurement five dimensions; Business-value driven; not one-shot; measurable
---

# I want to build a Zabbix strategy

> **As an** engineer, **I want to** prepare a zabbix, **so that** launch is safe. 

## Summary

- Zabbix = contract; not just monitoring
- collect + trigger + alert + governance + measurement five dimensions; no missing dimension
- Business-value driven; not by gut feel
- cover host / item / trigger / template / action multiple types
- linked with nagios + prometheus + observability + alerting + incident-management
- Publicly queryable; not hidden
- Periodic review; evolution updates
- First principles / inversion / second-order / Occam

## Scenario

Zabbix is a contract; not just monitoring. This entry gives the Zabbix full path, covering collect + trigger + alert + governance + measurement, Business-value driven not by gut feel, covering host / item / trigger / template / action multiple types, linked with prepare-a-nagios + prepare-a-prometheus + prepare-an-observability + prepare-an-alerting + prepare-an-incident-management, publicly queryable, periodic review, and links to Nagios / Prometheus / Observability / Alerting / IncidentManagement and other leaves. 

## 2-hop reachability paths

| Hop count | Target | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | nagios | [./prepare-a-nagios-strategy.md](./prepare-a-nagios-strategy.md) |
| 1 hop | prometheus | [./prepare-a-prometheus-strategy.md](./prepare-a-prometheus-strategy.md) |
| 2 hops | observability | [../../oncall-sre/incident-response/prepare-an-observability-strategy.md](../../oncall-sre/incident-response/prepare-an-observability-strategy.md) |
| 2 hops | alerting | [./prepare-an-alerting-strategy.md](./prepare-an-alerting-strategy.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |

## Action recommendations

1. **Five dimensions**: collect + trigger + alert + governance + measurement; no missing dimension
2. **Business-value driven**: prioritize by efficiency + trust + speed + risk + cost; not sloganeering
3. **collect Collect**: agent / snmp / jmx; do not omit
4. **trigger Trigger**: expression / severity / dependency; do not omit
5. **alert Action**: media / escalation / recovery; do not omit
6. **Governance**: owner / cadence / review / documentation / drift; do not omit
7. **Measurement**: efficiency + trust + speed + risk + cost; do not omit
8. **not one-shot**: progressive from collect → trigger → alert → governance → measurement; no skipping
9. **not report-ized**: trigger count only the start; not the end
10. **Not sloganeering**: every principle must have landing evidence; not vague
11. **Versioned**: strategy has versions; evolution is traceable
12. **link with nagios**: Zabbix + Nagios co-built
13. **link with prometheus**: Zabbix + Prometheus co-built
14. **link with observability**: Zabbix + Observability co-built
15. **link with alerting**: Zabbix + Alerting co-built
16. **link with incident-management**: Zabbix + IncidentManagement co-built
17. **Toolchain**: Zabbix Server / Zabbix Proxy / Zabbix Agent / Zabbix API / Zabbix Templates
18. **Publicly queryable**: strategy everyone can look up; not hidden
19. **Periodic review**: evolution updates; not one-shot
20. **first principles**: why must Zabbix; worst consequence of not doing
21. **inversion thinking**: how much can Prometheus Node Exporter solve; if solvable do not introduce heavy strategy
22. **Second-order thinking**: second-order consequences after strategy (efficiency / trust / speed / risk)
23. **Occam**: Zabbix the simpler the better; cut redundant layers

## Related

- nagios: [./prepare-a-nagios-strategy.md](./prepare-a-nagios-strategy.md) — Nagios co-built
- prometheus: [./prepare-a-prometheus-strategy.md](./prepare-a-prometheus-strategy.md) — Prometheus co-built
- observability: [../../oncall-sre/incident-response/prepare-an-observability-strategy.md](../../oncall-sre/incident-response/prepare-an-observability-strategy.md) — Observability co-built
- alerting: [./prepare-an-alerting-strategy.md](./prepare-an-alerting-strategy.md) — Alerting co-built
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
