---
title: Design a minimum viable architecture
aliases: [i-want-to-design-a-minimum-viable-architecture, mva, minimum-viable-architecture]
tags: [journey, methodology, mva, architecture, scoping, landing-zone, finops]
category: engineer/architecture-design
created: 2026-08-05
updated: 2026-08-05
last_verified: 2026-08-07
source: internal
type: summary
lifecycle: active
status: stable
review_cycle: quarterly
roles: [engineer]
benefit: "Projects start with just enough architecture to validate assumptions, avoiding over-engineering before product-market fit"
acceptance_criteria:
  - "user story header defines who, what, and why"
  - "step-by-step guide is complete with prerequisites and expected outcome"
  - "cross-references to related journeys and patterns are present
related:
  - ../infrastructure/write-a-statement-of-work.md
  - ../../knowledge-curator/templates/thinking--first-principles.md
  - ../../knowledge-curator/templates/thinking--inversion.md
  - ../../knowledge-curator/templates/thinking--second-order-thinking.md
  - ../../knowledge-curator/templates/thinking--ockhams-razor.md
tacit: MVA is not a stripped-down production; it is the simplest architecture that can be falsified in 30 days. Cloud Run + BigQuery first, not GKE; prove value first then scale; gold-plating is an anti-pattern; every component must be tied to business measurement
---

# I want to design a minimum viable architecture

> **As an** engineer, **I want to** design a minimum viable architecture, **so that** launch is safe.

## Summary

- MVA = the simplest architecture that proves value within 30 days; not a stripped-down production
- Cloud Run + BigQuery first; not GKE + a full data lake
- Prove value first; then scale; then gold-plate
- Every component must be tied to business measurement; do not pile up tech
- FinOps anchored: cost observable; not burning blindly
- Phased Delivery: MVP -> Scale -> Optimize
- Distinguished from edge-compute / deployment-strategy
- Publicly queryable; periodic review
- First principles / inversion / second-order / Occam

## Scenario

MVA is not a stripped-down production; it is the simplest architecture that can be falsified in 30 days. This entry provides the MVA full path, covering minimum component set + business measurement anchoring + Phased Delivery + FinOps, linking with operate-as-a-forward-deployed-engineer + apply-consulting-frameworks + deploy-to-an-air-gapped-environment + run-a-site-survey + write-a-statement-of-work + prepare-an-edge-compute-strategy + prepare-a-deployment-strategy, publicly queryable, periodic review, and links to fde-role / consulting-frameworks / air-gap / site-survey / sow / edge-compute / deployment and other leaves.

## 2-hop reachability paths

| Hop count | Target | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | fde-role | [./operate-as-a-forward-deployed-engineer.md](../process/operate-as-a-forward-deployed-engineer.md) |
| 1 hop | consulting-frameworks | [./apply-consulting-frameworks.md](../process/apply-consulting-frameworks.md) |
| 2 hops | air-gap | [./deploy-to-an-air-gapped-environment.md](../process/deploy-to-an-air-gapped-environment.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking--first-principles.md](../../knowledge-curator/templates/thinking--first-principles.md) |

## Action recommendations

1. **30-day anchoring**: prove value within 30 days; not 90 days
2. **Minimum component set**: Cloud Run + BigQuery; not GKE + data lake + streaming
3. **Prove value first**: MVP first; then scale; then gold-plate
4. **Business measurement anchoring**: every component ties to business measurement; do not pile up tech
5. **FinOps**: cost observable; not burning blindly
6. **Phased Delivery**: MVP (manual trigger + static export) -> Scale (auto trigger + streaming) -> Optimize
7. **Out of Scope explicit**: legacy AS400 integration deferred to Q3
8. **Landing Zone simplest**: 1 VPC + 1 project + 1 dataset; not a full micro-service stack
9. **No gold-plating**: complex features nobody asked for = do not build
10. **Not sloganeering**: every architecture decision marked ADR + business measurement
11. **Versioned**: architecture diagrams have versions; evolution is traceable
12. **Link with fde-role**: MVA + FDE co-build
13. **Link with consulting-frameworks**: MVA + MECE / 80-20 co-build
14. **Link with air-gap**: MVA + offline deployment co-build
15. **Link with site-survey**: MVA + on-site discovery co-build
16. **Link with sow**: MVA + statement of work co-build
17. **Distinguished from edge-compute**: this file leans toward 30-day value proof; the latter toward edge infrastructure
18. **Toolchain**: Mermaid / Excalidraw / Terraform / gcloud / BigQuery / Cloud Run / Cloud Storage
19. **Publicly queryable**: architecture everyone can look up; not hidden
20. **Periodic review**: evolution updates; not one-shot
21. **First principles**: why must MVA; worst consequence of not doing it (no value after 90 days -> contract not renewed)
22. **Inversion thinking**: see how much a full GKE start can solve; can cost / time / customer patience bear it
23. **Second-order thinking**: second-order consequences after MVA (customer renewal / scale path / FinOps controllable)
24. **Occam**: architecture the simpler the better; cut redundant components

## Related

- fde-role: [./operate-as-a-forward-deployed-engineer.md](../process/operate-as-a-forward-deployed-engineer.md) — FDE co-build
- consulting-frameworks: [./apply-consulting-frameworks.md](../process/apply-consulting-frameworks.md) — consulting frameworks co-build
- air-gap: [./deploy-to-an-air-gapped-environment.md](../process/deploy-to-an-air-gapped-environment.md) — offline deployment co-build
- site-survey: [../processes/run-a-site-survey.md](../engineering/run-a-site-survey.md) — on-site discovery co-build
- sow: [../processes/write-a-statement-of-work.md](../infrastructure/write-a-statement-of-work.md) — statement of work co-build
- edge-compute: [./prepare-an-edge-compute-strategy.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-an-edge-compute-strategy.md) — edge compute complement
- deployment-strategy: [./prepare-a-deployment-strategy.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-deployment-strategy.md) — deployment strategy complement
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking--first-principles.md) + [inversion](../../knowledge-curator/templates/thinking--inversion.md) + [second-order](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking--ockhams-razor.md)
