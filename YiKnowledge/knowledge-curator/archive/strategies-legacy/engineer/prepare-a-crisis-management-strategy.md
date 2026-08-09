---
title: I want to prepare a Crisis Management strategy / Prepare a crisis management strategy
aliases: [i-want-to-prepare-a-crisis-management-strategy, crisis-management-strategy, cm-strategy]
tags: [journey, methodology, governance, crisis, planning]
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
 - "filename is descriptive verb-phrase, hyphens only, no underscores or digits"
 - "body contains user story header + 7 fixed-order sections"
related:
 - ./prepare-a-business-continuity-strategy.md
 - ../../oncall-sre/incident-response/prepare-an-incident-response-strategy.md
 - ./prepare-a-crisis-communications-strategy.md
 - ./prepare-a-risk-strategy.md
 - ./prepare-a-cybersecurity-strategy.md
 - ../../knowledge-curator/templates/thinking/first-principles.md
 - ../../knowledge-curator/templates/thinking/inversion.md
 - ../../knowledge-curator/templates/thinking/second-order-thinking.md
 - ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: Crisis Management is not just emergency response; it is a contract. Identify + respond + communicate + governance + measurement are five dimensions; business-value driven; not one-shot; measurable
status: deprecated
---

# I want to prepare a Crisis Management strategy

> **As an** engineer, **I want to** prepare a crisis management, **so that** launch is safe. 

## Summary

- Crisis Management = contract; not just emergency response
- Identify + respond + communicate + governance + measurement are five dimensions; no missing dimension
- Business-value driven; not by feel
- Cover PR / cyber / safety / financial / geopolitical multiple types
- Link with business-continuity + incident-response + crisis-communications + risk + cybersecurity
- Publicly accessible; not hidden
- Regular review; evolve and update
- First principles / inversion / second-order / Occam's razor

## Scenario description

Crisis Management is a contract; not just emergency response. This entry provides the full CM path, covering identify + respond + communicate + governance + measurement, business-value driven rather than by feel, covering PR / cyber / safety / financial / geopolitical multiple types, and links with prepare-a-business-continuity-strategy + prepare-an-incident-response-strategy + prepare-a-crisis-communications-strategy + prepare-a-risk-strategy + prepare-a-cybersecurity-strategy, publicly accessible, regular review, and links to BC / IR / Comms / risk / Cyber and other leaves.

## 2-hop reachability path

| Hops | Target | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | business-continuity | [./prepare-a-business-continuity-strategy.md](./prepare-a-business-continuity-strategy.md) |
| 1 hop | incident-response | [../../oncall-sre/incident-response/prepare-an-incident-response-strategy.md](../../oncall-sre/incident-response/prepare-an-incident-response-strategy.md) |
| 2 hops | crisis-communications | [./prepare-a-crisis-communications-strategy.md](./prepare-a-crisis-communications-strategy.md) |
| 2 hops | risk | [./prepare-a-risk-strategy.md](./prepare-a-risk-strategy.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |

## Action recommendations

1. **Five dimensions**: identify + respond + communicate + governance + measurement; no missing dimension
2. **Business-value driven**: prioritize by trust + resilience + speed + risk + cost; no empty slogans
3. **Identify**: scenario / signal / threshold / escalation / wartime; none missing
4. **Respond**: team / decision / actions / resource / closed loop; none missing
5. **Communicate**: internal / customer / media / regulator / public; none missing
6. **Governance**: owner / cadence / review / docs / drift; none missing
7. **Measure**: trust + resilience + speed + risk + cost; none missing
8. **Not one-shot**: from identify → respond → communicate → governance → measurement progressive; no skipping levels
9. **Not report-only**: reports are only the starting point; not the endpoint
10. **No empty slogans**: every principle must have landed evidence; no ambiguity
11. **Versioned**: strategy has versions; evolution is traceable
12. **Link with business-continuity**: CM + BC co-build
13. **Link with incident-response**: CM + IR co-build
14. **Link with crisis-communications**: CM + Comms co-build
15. **Link with risk**: CM + risk co-build
16. **Link with cybersecurity**: CM + Cyber co-build
17. **Toolchain**: Everbridge / Rave / OnSolve / CrisisGo / Noggin
18. **Publicly accessible**: strategy accessible to everyone; not hidden
19. **Regular review**: evolve and update; not one-shot
20. **First principles**: why CM is necessary; worst consequence of not doing it
21. **Inversion**: how much can be solved with ad-hoc command; if solvable, do not introduce a heavy strategy
22. **Second-order thinking**: second-order consequences after the strategy (trust / resilience / speed / risk)
23. **Occam**: simpler CM is better; cut redundant layers

## Related

- business-continuity: [./prepare-a-business-continuity-strategy.md](./prepare-a-business-continuity-strategy.md) — BC co-build
- incident-response: [../../oncall-sre/incident-response/prepare-an-incident-response-strategy.md](../../oncall-sre/incident-response/prepare-an-incident-response-strategy.md) — IR co-build
- crisis-communications: [./prepare-a-crisis-communications-strategy.md](./prepare-a-crisis-communications-strategy.md) — Comms co-build
- risk: [./prepare-a-risk-strategy.md](./prepare-a-risk-strategy.md) — Risk co-build
- cybersecurity: [./prepare-a-cybersecurity-strategy.md](./prepare-a-cybersecurity-strategy.md) — Cyber co-build
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
