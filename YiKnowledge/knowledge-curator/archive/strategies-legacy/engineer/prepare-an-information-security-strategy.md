---
title: I want to prepare an Information Security strategy / Prepare an information security strategy
aliases: [i-want-to-prepare-an-information-security-strategy, information-security-strategy, infosec-strategy]
tags: [journey, methodology, security, infosec, planning]
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
 - "filename is descriptive verb-phrase, hyphens only, no underscores or digits"
 - "body contains user story header + 7 fixed-order sections"
related:
 - ./prepare-a-compliance-strategy.md
 - ./prepare-a-risk-strategy.md
 - ./prepare-a-data-privacy-strategy.md
 - ../../oncall-sre/incident-response/prepare-a-disaster-recovery-strategy.md
 - ./prepare-a-business-continuity-strategy.md
 - ../../knowledge-curator/templates/thinking/first-principles.md
 - ../../knowledge-curator/templates/thinking/inversion.md
 - ../../knowledge-curator/templates/thinking/second-order-thinking.md
 - ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: Information Security is not just firewalls; it is a contract. CIA + Process + tool + Governance + Measurement five dimensions; Business-value driven; Not one-shot; measurable
status: deprecated
---

# I want to prepare an Information Security strategy

> **As an** engineer, **I want to** prepare an information security, **so that** launch is safe. 

## Summary

- Information Security = contract; not just firewalls
- CIA + Process + tool + Governance + Measurement five dimensions; no missing dimension
- Business-value driven; not by feel
- covers identity / network / endpoint / data / cloud multiple domains
- links with compliance + risk + data-privacy + disaster-recovery + business-continuity
- Publicly accessible; not hidden
- Regular review; Evolve and update
- First principles / inversion / second-order / Occam's razor

## Scenario description

Information Security is a contract; not just firewalls. This entry provides the Information Security full path, covering CIA + Process + tool + Governance + Measurement, Business-value driven not by feel, covering identity / network / endpoint / data / cloud multiple domains, linking with prepare-a-compliance-strategy + prepare-a-risk-strategy + prepare-a-data-privacy-strategy + prepare-a-disaster-recovery-strategy + prepare-a-business-continuity-strategy, Publicly accessible, Regular review, and linking to compliance / risk / data-privacy / disaster-recovery / business-continuity and other leaves. 

## 2-hop reachability path

| Hops | Target | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | compliance | [./prepare-a-compliance-strategy.md](./prepare-a-compliance-strategy.md) |
| 1 hop | risk | [./prepare-a-risk-strategy.md](./prepare-a-risk-strategy.md) |
| 2 hops | data-privacy | [./prepare-a-data-privacy-strategy.md](./prepare-a-data-privacy-strategy.md) |
| 2 hops | disaster-recovery | [../../oncall-sre/incident-response/prepare-a-disaster-recovery-strategy.md](../../oncall-sre/incident-response/prepare-a-disaster-recovery-strategy.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |

## Action recommendations

1. **Five dimensions**: CIA + Process + tool + Governance + Measurement; no missing dimension
2. **Business-value driven**: prioritize by risk + compliance + trust + speed + cost; no empty slogans
3. **CIA**: Confidentiality / Integrity / Availability; none missing
4. **Process**: identify / protect / detect / respond / recover; none missing
5. **tool Tool**: IAM / SIEM / EDR / DLP / CSPM; none missing
6. **Governance**: owner / cadence / review / docs / drift; none missing
7. **Measure**: risk + compliance + trust + speed + cost; none missing
8. **Not one-shot**: progressive from CIA -> Process -> tool -> Governance -> Measurement; no skipping levels
9. **Not report-only**: reports are only the starting point; not the endpoint
10. **No empty slogans**: every principle must have landed evidence; no ambiguity
11. **Versioned**: strategy has versions; evolution is traceable
12. **links with compliance**: InfoSec + Compliance co-build
13. **links with risk**: InfoSec + risk co-build
14. **and data-privacy links**: InfoSec + Privacy co-build
15. **and disaster-recovery links**: InfoSec + DR co-build
16. **and business-continuity links**: InfoSec + BCP co-build
17. **Toolchain**: Okta / CrowdStrike / Splunk / Wiz / Microsoft Defender
18. **Publicly accessible**: strategy accessible to everyone; not hidden
19. **Regular review**: Evolve and update; Not one-shot
20. **First principles**: why must InfoSec; worst consequence of not doing it
21. **Inversion**: how much can be solved by relying on firewalls alone; if solvable, don't introduce a heavy strategy
22. **Second-order thinking**: second-order consequences after the strategy (cost / risk / trust / speed) 
23. **Occam**: InfoSec the simpler the better; cut redundant tools

## Related

- compliance: [./prepare-a-compliance-strategy.md](./prepare-a-compliance-strategy.md) — Compliance co-build
- risk: [./prepare-a-risk-strategy.md](./prepare-a-risk-strategy.md) — Risk co-build
- data-privacy: [./prepare-a-data-privacy-strategy.md](./prepare-a-data-privacy-strategy.md) — Privacy co-build
- disaster-recovery: [../../oncall-sre/incident-response/prepare-a-disaster-recovery-strategy.md](../../oncall-sre/incident-response/prepare-a-disaster-recovery-strategy.md) — DR co-build
- business-continuity: [./prepare-a-business-continuity-strategy.md](./prepare-a-business-continuity-strategy.md) — BCP co-build
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
