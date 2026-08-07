---
title: I want to prepare a jailbreak strategy
aliases: [i-want-to-prepare-a-jailbreak-strategy, jailbreak-strategy]
tags: [journey, methodology, jailbreak, safety, planning]
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
  - ../../ai-engineer/foundations/prepare-a-prompt-injection-strategy.md
  - ../../ai-engineer/foundations/prepare-an-ai-safety-strategy.md
  - ./prepare-an-ai-red-team-strategy.md
  - ./prepare-an-ai-content-moderation-strategy.md
  - ./prepare-an-ai-alignment-strategy.md
  - ../../knowledge-curator/templates/thinking/first-principles.md
  - ../../knowledge-curator/templates/thinking/inversion.md
  - ../../knowledge-curator/templates/thinking/second-order-thinking.md
  - ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: Jailbreak is not just attack; it is a contract. Detection + defense + response + Governance + Measurement five dimensions; business-value driven; not one-shot; measurable
---

# I want to prepare a jailbreak strategy

> **As an** engineer, **I want to** prepare a jailbreak, **so that** launch is safe.

## Summary

- Jailbreak = contract; not just attack
- Detection + defense + response + Governance + Measurement five dimensions; no missing dimension
- Business-value driven; not by gut feel
- Covers role / encoding / multi-step / multilingual / multi-modal multiple types
- Links with prompt-injection + ai-safety + ai-red-team + ai-content-moderation + ai-alignment
- Publicly discoverable; not hidden
- Regular review; Evolve and update
- First principles / inversion / second-order / Occam's razor

## Scenario description

Jailbreak is a contract; not just attack. This entry provides the jailbreak full path, covering detection + defense + response + Governance + Measurement, business-value driven not by gut feel, covering role / encoding / multi-step / multilingual / multi-modal multiple types, linking with prepare-a-prompt-injection + prepare-an-ai-safety + prepare-an-ai-red-team + prepare-an-ai-content-moderation + prepare-an-ai-alignment, publicly discoverable, regular review, and links to PromptInjection / AISafety / AIRedTeam / AIContentModeration / AIAlignment and other leaves.

## 2-hop reachability path

| Hop | Target | file |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | prompt-injection | [../../ai-engineer/foundations/prepare-a-prompt-injection-strategy.md](../../ai-engineer/foundations/prepare-a-prompt-injection-strategy.md) |
| 1 hop | ai-safety | [../../ai-engineer/foundations/prepare-an-ai-safety-strategy.md](../../ai-engineer/foundations/prepare-an-ai-safety-strategy.md) |
| 2 hops | ai-red-team | [./prepare-an-ai-red-team-strategy.md](./prepare-an-ai-red-team-strategy.md) |
| 2 hops | ai-content-moderation | [./prepare-an-ai-content-moderation-strategy.md](./prepare-an-ai-content-moderation-strategy.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |

## Action recommendations

1. **Five dimensions**: detection + defense + response + Governance + Measurement; no missing dimension
2. **Business-value driven**: prioritize by efficiency + trust + speed + risk + cost; no empty slogans
3. **Detection**: rule / model / behavior; no leakage
4. **Defense**: system / input / output; no leakage
5. **Response**: alert / block / Retrospective; no leakage
6. **Governance**: owner / cadence / review / documentation / drift; no leakage
7. **Measure**: detection rate + false positive + cost + risk + satisfaction; no leakage
8. **Not one-shot**: progress from detection -> defense -> response -> Governance -> Measurement; no skipping levels
9. **No report-ism**: use cases are only the start; not the end
10. **No empty slogans**: every principle must mark implementation evidence; no vagueness
11. **Versioned**: strategy is versioned; evolution is traceable
12. **Link with prompt-injection**: Jailbreak + prompt injection co-build
13. **Link with ai-safety**: Jailbreak + AI security co-build
14. **Link with ai-red-team**: Jailbreak + AI red team co-build
15. **Link with ai-content-moderation**: Jailbreak + AI content moderation co-build
16. **Link with ai-alignment**: Jailbreak + AI alignment co-build
17. **Toolchain**: Lakera Guard / Promptfoo / Garak / NeMo Guardrails / Llama Guard
18. **Publicly discoverable**: strategy is publicly discoverable; not hidden
19. **Regular review**: Evolve and update; not one-shot
20. **First principles**: why must jailbreak strategy; worst consequence of not doing
21. **Inversion**: how much can defaults solve; if solvable, do not introduce heavy strategy
22. **Second-order thinking**: second-order consequence after strategy (efficiency / trust / speed / risk)
23. **Occam's razor**: Jailbreak simpler is better; cut redundant layers

## Related

- prompt-injection: [../../ai-engineer/foundations/prepare-a-prompt-injection-strategy.md](../../ai-engineer/foundations/prepare-a-prompt-injection-strategy.md) — PromptInjection co-build
- ai-safety: [../../ai-engineer/foundations/prepare-an-ai-safety-strategy.md](../../ai-engineer/foundations/prepare-an-ai-safety-strategy.md) — AISafety co-build
- ai-red-team: [./prepare-an-ai-red-team-strategy.md](./prepare-an-ai-red-team-strategy.md) — AIRedTeam co-build
- ai-content-moderation: [./prepare-an-ai-content-moderation-strategy.md](./prepare-an-ai-content-moderation-strategy.md) — AIContentModeration co-build
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
