---
title: I want to prepare a tech radar strategy / Prepare a tech radar strategy
aliases: [i-want-to-prepare-a-tech-radar-strategy, tech-radar-strategy, tech-radar]
tags: [journey, methodology, tech-radar, tech-stack, engineering-management, planning]
category: tech-lead/roadmap
created: 2026-08-03
updated: 2026-08-03
source: internal
type: journey
lifecycle: active
review_cycle: quarterly
roles: [tech-lead, engineer]
benefit: "launch is safe"
acceptance_criteria:
 - "frontmatter roles + benefit + acceptance_criteria present"
 - "filename is descriptive verb-phrase, hyphens only, no underscores or digits"
 - "body contains user story header + 7 fixed-order sections"
related:
 - ./do-a-tech-selection.md
 - ../../engineer/processes/do-a-tech-stack-inventory.md
 - ../../engineer/patterns/adopt-a-new-dependency.md
 - ../../engineer/strategies/prepare-a-coding-style-guide.md
 - ../../engineer/processes/do-a-dependency-audit.md
 - ../../executive/strategy/prepare-a-technical-vision.md
 - ./manage-tech-debt.md
 - ../../engineer/strategies/prepare-a-refactoring-strategy.md
 - ../../knowledge-curator/templates/thinking/first-principles.md
 - ../../knowledge-curator/templates/thinking/inversion.md
 - ../../knowledge-curator/templates/thinking/second-order-thinking.md
 - ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: Tech radar is not just a checklist; it is a contract. Adopt + trial + assess + hold four quadrants; business-value driven; not one-shot; measurable
status: deprecated
---

# I want to prepare a tech radar strategy

> **As a** tech lead, **I want to** prepare a tech radar, **so that** launch is safe. 

## Summary

- Tech radar = contract; not just a checklist
- Adopt + trial + assess + hold four quadrants; no missing dimension
- Business-value driven; not by feel
- Cover language + framework + tool + platform + method many domains
- Linked with tech-selection + tech-stack-inventory + adopt-dependency + coding-style + dependency-audit + technical-vision + tech-debt + refactoring
- Publicly accessible; not hidden
- Regular review; Evolve and update
- First principles / inversion / second-order / Occam's razor

## Scenario description

Tech radar is contract; not just a checklist. This entry provides the full tech radar path, covering adopt + trial + assess + hold four quadrants, business-value driven not by feel, covering language + framework + tool + platform + method many domains, and linked with do-a-tech-selection + do-a-tech-stack-inventory + adopt-a-new-dependency + prepare-a-coding-style-guide + do-a-dependency-audit + prepare-a-technical-vision + manage-tech-debt + prepare-a-refactoring-strategy, publicly accessible, regular review, and links to do-a-tech-selection / do-a-tech-stack-inventory / adopt-a-new-dependency / prepare-a-coding-style-guide / do-a-dependency-audit / prepare-a-technical-vision / manage-tech-debt / prepare-a-refactoring-strategy and other leaves. 

## 2-hop reachability path

| Hops | Target | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | tech-selection | [./do-a-tech-selection.md](./do-a-tech-selection.md) |
| 1 hop | tech-stack-inventory | [../../engineer/processes/do-a-tech-stack-inventory.md](../../engineer/processes/do-a-tech-stack-inventory.md) |
| 2 hops | adopt-dependency | [./i-want-to-adopt-a-new-dependency.md](../../engineer/patterns/adopt-a-new-dependency.md) |
| 2 hops | dependency-audit | [../../engineer/processes/do-a-dependency-audit.md](../../engineer/processes/do-a-dependency-audit.md) |
| 2 hops | technical-vision | [../../executive/strategy/prepare-a-technical-vision.md](../../executive/strategy/prepare-a-technical-vision.md) |
| 2 hops | refactoring | [../../engineer/strategies/prepare-a-refactoring-strategy.md](../../engineer/strategies/prepare-a-refactoring-strategy.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |

## Action recommendations

1. **Four quadrants**: Adopt + trial + assess + hold; no missing dimension
2. **Business-value driven**: Set priority by scenario + frequency + risk + ROI; no empty slogans
3. **Adopt**: Standard + default + recommendation + docs + template; none missing
4. **Trial**: Pilot + assess + 1-2 projects + feedback; none missing
5. **Assess**: Research + PoC + evaluate + decision; none missing
6. **Hold**: Stop new use + migration plan + retirement timetable; none missing
7. **Many domains**: Language + framework + tool + platform + method; none missing
8. **Not one-shot**: From checklist -> assess -> four quadrants -> all governance progressive; no skipping levels
9. **Not report-only**: Reports are only the starting point; not the endpoint
10. **No empty slogans**: Every principle must have landed evidence; no ambiguity
11. **Versioned**: The radar has versions; evolution is traceable
12. **Linked with tech-selection**: Radar + selection-type co-build
13. **Linked with tech-stack-inventory**: Radar + inventory co-build
14. **Linked with adopt-dependency**: Radar + introduction co-build
15. **Linked with dependency-audit**: Radar + audit co-build
16. **Linked with technical-vision**: Radar + vision co-build
17. **Linked with tech-debt**: Radar + debt co-build
18. **Toolchain**: ThoughtWorks Tech Radar / Zalando Tech Radar / AXA Tech Radar / Self-built
19. **Publicly accessible**: Radar accessible to everyone; not hidden
20. **Regular review**: Evolve and update; not one-shot
21. **First principles**: Why must there be a tech radar; worst consequence of not doing it
22. **Inversion**: How much can a checklist solve; if solvable, don't introduce a heavy strategy
23. **Second-order thinking**: Second-order consequences after the strategy (cost / complexity / consistency / business) 
24. **Occam**: Tech radar the simpler the better; cut redundant steps

## Related

- tech-selection: [./do-a-tech-selection.md](./do-a-tech-selection.md) — selection-type co-build
- tech-stack-inventory: [../../engineer/processes/do-a-tech-stack-inventory.md](../../engineer/processes/do-a-tech-stack-inventory.md) — inventory co-build
- adopt-dependency: [./i-want-to-adopt-a-new-dependency.md](../../engineer/patterns/adopt-a-new-dependency.md) — introduction co-build
- dependency-audit: [../../engineer/processes/do-a-dependency-audit.md](../../engineer/processes/do-a-dependency-audit.md) — audit co-build
- technical-vision: [../../executive/strategy/prepare-a-technical-vision.md](../../executive/strategy/prepare-a-technical-vision.md) — vision co-build
- refactoring: [../../engineer/strategies/prepare-a-refactoring-strategy.md](../../engineer/strategies/prepare-a-refactoring-strategy.md) — refactoring co-build
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
