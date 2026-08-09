---
title: Apply domain-driven design
aliases:
- I want to apply domain-driven design
- ddd-journey
- domain-driven-design-journey
- bounded-context-journey
- DDD entry
tags:
- journeys
- domain-driven-design
- ddd
- bounded-context
- aggregate
- ubiquitous-language
category: engineer/architecture-design
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- engineer
benefit: outcome is traceable
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../strategies/decompose-a-monolith.md
- ../../tech-lead/roadmap/prepare-an-event-driven-architecture-strategy.md
- ../strategies/prepare-an-api-contract.md
- ../../engineer/engineering/dual-world-boundary.md
review_cycle: quarterly
tacit: false
last_verified: 2026-08-07
---

# I want to apply domain-driven design

> **As an** engineer, **I want to** apply domain driven design, **so that** outcome is traceable.

> "Subdomain + bounded context + aggregate + entity + value object + ubiquitous language + quarterly audit" reachable within 2 hops across process + thinking + case study.

## Summary

- Process through [design-review.md](../../product-manager/delivery/design-review.md) + [tech-review.md](../../product-manager/delivery/tech-review.md) + [quarterly-tech-debt-process.md](../quality-security/quarterly-tech-debt.md)
- Thinking through [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md)
- Platform through [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md) + [contract-test-baseline-pattern.md](../quality-security/contract-test-baseline.md) + [ssot-view-layer-pattern.md](ssot-view-layer.md)
- Case study through [yivad-aicr-phase-port.md](../lessons/win-yivad-aicr-phase-port.md) + [incident-postmortem-summary.md](../lessons/failure-incident-postmortem.md)

## Core viewpoints

**Bounded contexts are not microservices -- they are the lines where language changes meaning.** The word "customer" means something different to the billing team than it does to the support team. A bounded context is the boundary within which a term has a single, unambiguous meaning. If you split microservices without aligning them to bounded contexts, you get services that share the same ambiguous language and fight over the same data.

**The ubiquitous language is not a glossary -- it is the code.** When the business says "order fulfillment" and the code says `OrderFulfillmentService`, the language is aligned. When the business says "order fulfillment" and the code says `ProcessOrder`, the language has drifted. The ubiquitous language must be visible in class names, method names, and database columns. A separate glossary document that no one reads is not a ubiquitous language.

**Aggregates are transactional consistency boundaries, not object graphs.** The rule is not "group related entities together." The rule is "group entities that must be consistent within a single transaction." If two entities can be eventually consistent, they belong in separate aggregates. Making aggregates too large creates contention and performance problems; making them too small creates invariants that cannot be enforced.

**DDD is for the core domain, not for everything.** The core domain is where your business differentiates itself. The supporting and generic subdomains can use simpler patterns (CRUD, transaction script). Applying the full DDD tactical patterns (aggregates, domain events, repositories) to a generic subdomain like authentication is over-investment that produces no competitive advantage.

**Event storming is a discovery tool, not a design tool.** The sticky notes on the wall capture what happens in the business, not what the code should look like. The output of event storming is a shared understanding of the domain, which then informs the bounded context design. Skipping event storming and jumping straight to drawing bounded contexts on a whiteboard produces contexts that match the team's existing assumptions, not the business reality.

## Key info

- **Domain classification**: Core domain (where you differentiate, high investment, bespoke software), Supporting subdomain (needed but not differentiating, moderate investment, customized off-the-shelf or bespoke), Generic subdomain (commodity, low investment, buy or adopt open source). The classification drives build-vs-buy decisions: core = build, supporting = customize, generic = buy. The most common mistake is classifying everything as core and building a custom authentication system.
- **Aggregate design rules**: (1) reference other aggregates by ID only, not by object reference; (2) one aggregate = one transaction (eventual consistency between aggregates); (3) the aggregate root is the single entry point for all modifications; (4) delete the aggregate root and all child entities are deleted. Rule (1) is the most frequently violated and the most impactful -- holding a reference to another aggregate creates a distributed transaction boundary violation.
- **Context mapping patterns**: Shared Kernel (two contexts share a subset of the model, high coupling, use sparingly), Customer-Supplier (one context defines, another consumes, upstream sets the contract), Conformist (consumer accepts the upstream model as-is, no translation), Anti-Corruption Layer (consumer translates upstream model to its own), Open Host Service (upstream provides a well-defined API for multiple consumers), Published Language (standardized interchange format, e.g., FHIR for healthcare). The mistake pattern is using Shared Kernel when Customer-Supplier or ACL would be more appropriate.
- **Event storming session structure**: (1) Domain Events (orange sticky notes, what happens in the business, past tense), (2) Commands (blue, what triggers the event, imperative), (3) Aggregates (yellow, what entity handles the command), (4) Policies (purple, "when X happens, trigger Y"), (5) Read Models (green, what data the user sees before acting), (6) External Systems (pink, integrations). A full session takes 2-3 days for a medium-sized domain. The output is a wall of sticky notes that becomes the input for bounded context design.
- **DDD investment by domain type**: Core domain: full tactical patterns (aggregates, domain events, repositories, factories, value objects), 40-60% of development effort. Supporting: simplified tactical (aggregates only, no domain events), 20-30% of effort. Generic: no DDD patterns, CRUD + transaction script, 10-15% of effort. The ROI calculation: DDD on core domain = 2-3x productivity gain from shared language + reduced rework; DDD on generic subdomain = negative ROI from over-engineering.

## Scenario

When applying domain-driven design / DDD / subdomain / bounded context / aggregate root / entity / value object / ubiquitous language / context mapping / event storming / anti-corruption layer / large-scale refactor / big-promotion architecture freeze / quarterly architecture audit / DDD retrospective, TL + architect + platform + PM + sponsor need to look up process + thinking + case study. This entry aggregates DDD-related process + thinking + case study into a 2-hop path, avoiding "subdomain hollow / boundary chaos / aggregate wrong / language scattered / context leaked / no quarterly audit."

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [design-review.md](../../product-manager/delivery/design-review.md) · [tech-review.md](../../product-manager/delivery/tech-review.md) · [quarterly-tech-debt-process.md](../quality-security/quarterly-tech-debt.md) · [requirement-review.md](../../product-manager/delivery/requirement-review.md) · [code-review.md](../quality-security/do-a-code-review.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) |
| `methodology/engineering-patterns/` | [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md) · [contract-test-baseline-pattern.md](../quality-security/contract-test-baseline.md) · [ssot-view-layer-pattern.md](ssot-view-layer.md) · [strangler-fig-pattern.md](strangler-fig.md) · [supply-chain-hardening-pattern.md](../process/harden-supply-chain.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) — DDD essence · [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) — invert to think about coupling · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md) |
| `methodology/pm-frameworks/` | [jobs-to-be-done-summary.md](../../product-manager/frameworks/jobs-to-be-done.md) · [product-discovery-summary.md](../../knowledge-curator/archive/strategies-legacy/product-manager/prepare-a-product-discovery-strategy.md) · [dual-track-agile-summary.md](../../product-manager/frameworks/dual-track-agile.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [code-review-prompt.md](../../ai-engineer/methodology/prompts--code-review.md) · [weekly-report-prompt.md](../../ai-engineer/methodology/prompts--weekly-report.md) · [brd-generation-prompt.md](../../ai-engineer/methodology/prompts--brd-generation.md) |
| `tech/data/` | [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [data-governance-summary.md](../../ai-engineer/data/data-governance.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../process/raci-matrix.md) · [async-collaboration-principles-summary.md](../process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../process/cross-timezone-collaboration.md) |
| `work/meetings/` | [review-meeting-template.md](../../product-manager/delivery/review-meeting.md) · [retrospective-sample.md](../../product-manager/delivery/retrospective.md) |
| `people/stakeholders--` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders--stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders--communication-cadence.md) — reporting |
| `people/team--` | [team-overview.md](../../knowledge-curator/people/team--team-overview.md) · [roster.md](../../knowledge-curator/people/team--roster.md) — team matrix |
| `product/strategy/` | [product-strategy-summary.md](../../knowledge-curator/archive/strategies-legacy/product-manager/prepare-a-product-strategy.md) · [now-next-later-roadmap-summary.md](../../executive/strategy/now-next-later-roadmap.md) |
| `lessons/wins/` | [yivad-aicr-phase-port.md](../lessons/win-yivad-aicr-phase-port.md) · [yiai-brd-agent-launch.md](../lessons/win-yiai-brd-agent-launch.md) |
| `lessons/failures/` | [incident-postmortem-summary.md](../lessons/failure-incident-postmortem.md) · [bugs/](../lessons) — architecture wreck archive |
| `lessons/gotchas/` | [no-lockfile-supply-chain-risk.md](../lessons/gotcha-no-lockfile-supply-chain-risk.md) · [macos-fsevents-silent-drop.md](../lessons/gotcha-macos-fsevents-silent-drop.md) |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `projects/` | each project `architecture-summary.md` §DDD + `adr-*` §architecture |
| `journeys/` | [../strategies/decompose-a-monolith.md](decompose-a-monolith.md) · [../../tech-lead/roadmap/prepare-an-event-driven-architecture-strategy.md](../../knowledge-curator/archive/strategies-legacy/tech-lead/prepare-an-event-driven-architecture-strategy.md) · [../strategies/prepare-an-api-contract.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-an-api-contract.md) · [../../tech-lead/roadmap/prepare-a-frontend-architecture-strategy.md](../../knowledge-curator/archive/strategies-legacy/tech-lead/prepare-a-frontend-architecture-strategy.md) |

## Action recommendations

1. **First principles**: first ask "what does DDD solve / what happens if not done / ROI / business impact"; do not do DDD for DDD's sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md).
2. **Inversion**: first think "DDD could go out of control (boundary chaos / aggregate wrong / language scattered / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md).
3. **Second-order effects**: one split → business changes → another split; go through [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md).
4. **Occam**: the simplest context that satisfies business wins; do not pile up aggregates; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md).
5. **Ubiquitous language**: must run ubiquitous language + must align business/engineering + avoid hardcoding.
6. **Event storming**: must run event storming + must have domain events + avoid closed-door work.
7. **Subdomain**: must run core / supporting / generic + must tier + avoid flat-equal.
8. **Bounded context**: must run bounded context + must have boundary + must be independent.
9. **Context mapping**: must run context map + must cooperate / customer-supplier / anti-corruption layer + avoid implicit coupling.
10. **Anti-corruption layer**: must run anti-corruption layer + must translate + avoid direct coupling; go through [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md).
11. **Aggregate root**: must run aggregate root + must have consistency boundary + must have transactions + avoid large transactions.
12. **Entity / value object**: must distinguish + must have identity / no identity + avoid confusion.
13. **Domain service**: must run domain service + must span aggregates + avoid anemic model.
14. **Domain event**: must run domain event + must decouple + avoid bidirectional dependency.
15. **CQRS**: must run CQRS + must separate read/write + avoid strong consistency.
16. **AI domain**: LLM must run [rag-design-patterns-summary.md](../../ai-engineer/methodology/rag-design-patterns.md) + must isolate prompts + must have domain tools.
17. **RACI**: must run [raci-matrix-summary.md](../process/raci-matrix.md); architect / platform / TL / sponsor owner.
18. **Freeze period**: during big promotions go through [release-freeze-process.md](../../oncall-sre/release/release-freeze.md); do not touch bounded context.
19. **Reporting**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders--communication-cadence.md) to report internally and externally.
20. **Retrospective**: after architecture wreck must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive [bugs/](../lessons).
21. **Quarterly audit**: go through [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan boundary whether still accurate + aggregate whether still reasonable.
22. **ADR**: DDD decisions must land in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
23. **Flywheel**: DDD good → decoupling strong → speed up → more business; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md).

## Anti-patterns

- **DDD for everything.** Applying the full tactical pattern suite (aggregates, value objects, domain events, repositories, domain services) to a CRUD form or a simple data pipeline is over-engineering. DDD is for the core domain where business complexity lives. Supporting and generic subdomains can use simpler patterns without guilt.

- **Anemic domain model.** A domain model where entities are bags of getters and setters with all business logic in services is not DDD -- it is procedural code wearing an object-oriented costume. The entity should enforce its own invariants. A service that reaches into an entity to change its state is violating the aggregate boundary.

- **Bounded context by technical layer, not by business capability.** A bounded context called "Database Layer" or "API Layer" is not a bounded context -- it is a technical tier. Bounded contexts are named after business capabilities: "Order Management," "Customer Billing," "Inventory Tracking." If the context name does not mean something to the business, it is wrong.

- **Ubiquitous language that exists only in a document.** A glossary page that the developers never read and the business stakeholders never reference is not a ubiquitous language. The language must be visible in the code: class names, method names, API endpoints, and database columns. If the code says `ProcessOrder` but the business says "order fulfillment," the language is not ubiquitous.

- **Event storming without the right people in the room.** An event storming session with only developers produces a model of what the developers think the business does. An event storming session with only business stakeholders produces a model of what the business wishes the system did. The session must include both, and the domain expert's voice must carry more weight than the architect's.

## Related

- Same-category journey: [../strategies/decompose-a-monolith.md](decompose-a-monolith.md) — decomposition
- Same-category journey: [../../tech-lead/roadmap/prepare-an-event-driven-architecture-strategy.md](../../knowledge-curator/archive/strategies-legacy/tech-lead/prepare-an-event-driven-architecture-strategy.md) — event-driven
- Same-category journey: [../strategies/prepare-an-api-contract.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-an-api-contract.md) — API contract
- Same-category journey: [../../tech-lead/roadmap/prepare-a-frontend-architecture-strategy.md](../../knowledge-curator/archive/strategies-legacy/tech-lead/prepare-a-frontend-architecture-strategy.md) — frontend architecture
- Upstream: [../../README.md](../../README.md) — patterns leaf entry
