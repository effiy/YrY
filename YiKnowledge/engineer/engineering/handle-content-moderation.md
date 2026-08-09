---
title: Handle content moderation
aliases: [i-want-to-handle-content-moderation, content-moderation, content-safety, moderation-policy]
tags: [journey, methodology, content-moderation, trust-safety, moderation, llm-safety]
category: engineer/engineering
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
lifecycle: active
status: stable
review_cycle: quarterly
roles: [engineer]
benefit: "AI-generated content is moderated systematically to prevent harmful, biased, or policy-violating outputs from reaching users"
acceptance_criteria:
  - "user story header defines who, what, and why"
  - "step-by-step guide is complete with prerequisites and expected outcome"
  - "cross-references to related journeys and patterns are present
related:
- ../../product-manager/frameworks/launch-an-ai-product.md
  - ../../oncall-sre/incident-response/handle-a-data-breach.md
  - ../../executive/strategy/handle-data-compliance.md
  - ../../ai-engineer/platform/evaluate-an-llm-app.md
  - ../../knowledge-curator/templates/thinking--first-principles.md
  - ../../knowledge-curator/templates/thinking--inversion.md
  - ../../knowledge-curator/templates/thinking--second-order-thinking.md
  - ../../knowledge-curator/templates/thinking--ockhams-razor.md
tacit: Content moderation is not just filtering; it is policy + automation + human + appeal + transparency; three-layer human-machine collaboration; false-positive controllable; regulation aligned
---

# I want to handle content moderation

> **As an** engineer, **I want to** handle content moderation, **so that** incident is contained.

## Summary

- Moderation four pieces: policy + automation + human + appeal
- Three-layer human-machine collaboration: model pre-review + human second review + user appeal
- Policy driven: clear forbidden + allowed + boundary
- False positives controllable: appeal must respond + false-positive-rate monitoring
- Regulation aligned: regional content regulations
- Transparent report: periodically publish moderation report
- No one-size-fits-all; tiered handling
- LLM moderation + LLM generation bidirectional

## Scenario

Content moderation is key infrastructure for UGC platforms + AI products; not simple filtering. This entry provides the content-moderation full path, covering the four pieces, human-machine collaboration, policy-driven, false-positive controllable, regulation-aligned, transparent report, tiered handling, LLM bidirectional, and links to launch-an-ai-product / handle-a-data-breach / handle-data-compliance / evaluate-an-llm-app / handle-customer-feedback / collaborate-across-teams and other leaves.

## 2-hop reachability paths

| Hops | Target | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | AI product launch | [../../product-manager/frameworks/launch-an-ai-product.md](../../product-manager/frameworks/launch-an-ai-product.md) |
| 2 hops | data breach | [../../oncall-sre/incident-response/handle-a-data-breach.md](../../oncall-sre/incident-response/handle-a-data-breach.md) |
| 2 hops | data compliance | [../../executive/strategy/handle-data-compliance.md](../../executive/strategy/handle-data-compliance.md) |
| 2 hops | LLM evaluation | [../../ai-engineer/platform/evaluate-an-llm-app.md](../../ai-engineer/platform/evaluate-an-llm-app.md) |
| 2 hops | customer feedback | [./handle-customer-feedback.md](../process/handle-customer-feedback.md) |
| 2 hops | cross-team | [./collaborate-across-teams.md](../process/collaborate-across-teams.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking--first-principles.md](../../knowledge-curator/templates/thinking--first-principles.md) |
| 2 hops | inversion | [../../knowledge-curator/templates/thinking--inversion.md](../../knowledge-curator/templates/thinking--inversion.md) |
| 2 hops | second-order | [../../knowledge-curator/templates/thinking--second-order-thinking.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) |
| 2 hops | ockhams | [../../knowledge-curator/templates/thinking--ockhams-razor.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) |

## Action recommendations

1. **Four pieces**: policy + automation + human + appeal; nothing missing
2. **Three-layer human-machine collaboration**: model pre-review + human second review + user appeal; not single-layer
3. **Policy driven**: clear forbidden + allowed + boundary; not vague
4. **False positives controllable**: appeal must respond + false-positive-rate monitoring; not silent
5. **Regulation aligned**: regional content regulations; strictest as baseline
6. **Transparent report**: periodically publish moderation report; do not hide mines
7. **Tiered handling**: P0 delete now / P1 time-limited / P2 tag / P3 ignore
8. **No one-size-fits-all**: by severity grading; do not false-positive
9. **LLM moderation input**: user UGC content moderation
10. **LLM moderation output**: LLM-generated content moderation (hallucination / harmful / bias)
11. **Moderation-quality measurement**: precision / recall / false-positive / false-negative rate
12. **Moderation-data closed loop**: mis-judge → annotate → retrain
13. **Moderation latency**: real-time + offline; not delayed
14. **Moderation cost**: automation first; human expensive
15. **First principles**: why must moderate; worst consequence of not moderating
16. **Inversion thinking**: how much can LLM + keywords solve; if solvable do not introduce complex moderation
17. **Second-order thinking**: second-order consequences after moderation (user trust / regulation / hiring / culture)
18. **Occam**: moderation plan the simpler the better; cut redundant layers

## Related

- AI product launch: [../../product-manager/frameworks/launch-an-ai-product.md](../../product-manager/frameworks/launch-an-ai-product.md) — LLM output moderation
- Data breach: [../../oncall-sre/incident-response/handle-a-data-breach.md](../../oncall-sre/incident-response/handle-a-data-breach.md) — user content leak
- Data compliance: [../../executive/strategy/handle-data-compliance.md](../../executive/strategy/handle-data-compliance.md) — regulation alignment
- LLM evaluation: [../../ai-engineer/platform/evaluate-an-llm-app.md](../../ai-engineer/platform/evaluate-an-llm-app.md) — hallucination gatekeeper
- Customer feedback: [./handle-customer-feedback.md](../process/handle-customer-feedback.md) — appeal channel
- Cross-team: [./collaborate-across-teams.md](../process/collaborate-across-teams.md) — legal / security / business collaboration
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking--first-principles.md) + [inversion](../../knowledge-curator/templates/thinking--inversion.md) + [second-order](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking--ockhams-razor.md)
