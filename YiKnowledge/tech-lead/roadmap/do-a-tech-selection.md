---
title: Do a tech selection
aliases:
- I want to do a tech selection
- tech-selection-journey
- vendor-selection-journey
- tech selection entry
tags:
- journeys
- tech-selection
- vendor
- evaluation
- rfc
- decision
category: tech-lead/roadmap
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- tech-lead
- engineer
benefit: Tech leads can trace the rationale and outcome of this decision, preventing repeated re-derivation
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../architecture/design-architecture-decision.md
- ../../ai-engineer/platform/pick-an-llm-provider.md
- ../../ai-engineer/platform/pick-a-vector-database.md
- ../../knowledge-curator/templates/tech-selection-evaluation.md
review_cycle: quarterly
tacit: false
---

# I want to do a tech selection

> **As a** tech lead, **I want to** do a tech selection, **so that** outcome is traceable.

> "Framework / library / SaaS / DB / model / tool selection + evaluation template + thinking tools + vendor comparison + cost + security audit" reachable within 2 hops: evaluation template + thinking + vendor comparison + review process.

## Summary

- Evaluation template: [tech-selection-evaluation-template.md](../../knowledge-curator/templates/tech-selection-evaluation.md) + [tech-selection-evaluation-summary.md](../../knowledge-curator/templates/tech-selection-evaluation.md)
- Thinking tools: [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md)
- Review: [design-review-process.md](../../product-manager/delivery/design-review.md) + [tech-review-process.md](../../product-manager/delivery/tech-review.md) + [requirement-review-process.md](../../product-manager/delivery/requirement-review.md)
- Security: [quarterly-security-audit-process.md](../../engineer/quality-security/quarterly-security-audit.md) + [dependency-upgrade-process.md](../../engineer/engineering/dependency-upgrade.md)
- Cost: [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) + [capacity-and-cost-template.md](../../oncall-sre/observability/capacity-and-cost.md)

## Core viewpoints

**The best tech selection is the one you do not have to make.** Before evaluating candidates, ask whether the problem can be solved without introducing a new dependency. Every new technology adds to the maintenance surface area permanently. The default answer should be "use what we already have" unless there is a compelling, documented reason not to.

**Team familiarity outweighs technical superiority in most cases.** A mediocre technology the team knows well will deliver faster and more reliably than a superior technology the team has to learn from scratch. The exception is when the superior technology delivers a ten-times improvement in a critical dimension -- cost, performance, or scalability -- that directly impacts the business.

**Exit cost is the most underweighted evaluation dimension.** Everyone evaluates adoption cost. Almost nobody evaluates the cost of switching away. The exit cost -- data migration, retraining, contract termination, abstraction layer rebuild -- should be estimated upfront and treated as a first-class evaluation dimension alongside functionality and performance.

**The PoC should try to break the candidate, not validate it.** The purpose of a proof-of-concept is to find the failure modes, not to confirm that the happy path works. Design the PoC to stress the candidate at its claimed limits and at the edges of your specific use case. A PoC that finds no problems was not rigorous enough.

**A tech selection without an ADR is not a decision -- it is a preference.** Without a written record of the alternatives considered, the evaluation criteria, and the rationale for the choice, the decision will be re-litigated every time someone new joins the team or a problem arises. The ADR is the institutional memory that prevents repeated re-derivation.

## Key info

- **Tech selection evaluation dimensions (8 dimensions with weights)**: (1) Functional fit (25%) — does it solve the specific problem, scored 1-5 against requirements checklist; (2) Team familiarity (20%) — how many team members have production experience with it, learning curve in weeks; (3) Community and ecosystem (15%) — GitHub stars, contributors, Stack Overflow questions, plugin/library availability; (4) Performance (15%) — benchmarks against your specific workload, not generic benchmarks; (5) Maintenance activity (10%) — last release date, commit frequency, issue response time, bus factor (number of maintainers); (6) Exit cost (10%) — estimated person-weeks to migrate away, data export capability, API compatibility with alternatives; (7) Security (3%) — CVE history, mean time to patch, security policy; (8) License (2%) — compatibility with project license, no restrictive clauses. The weights are adjustable by project context; the key is having explicit weights before evaluating candidates to prevent post-hoc rationalization.
- **PoC design principles (try to break it)**: (1) Test at claimed limits — if the vendor claims 1000 req/s, test at 1000 req/s for 1 hour, not 10 req/s for 1 minute; (2) Test edge cases specific to your use case — large payloads, concurrent writes, schema migrations, network interruptions; (3) Test failure modes — kill the dependency, introduce latency, corrupt the data, and observe the recovery behavior; (4) Test the exit — export data, switch to an alternative, measure the cost; (5) Timebox the PoC — 1-2 weeks for a library, 2-4 weeks for a framework/database, 4-8 weeks for a platform migration. A PoC that finds no problems was not rigorous enough; a PoC that finds 5+ problems has validated its purpose.
- **Selection decision types and ADR templates**: (1) New technology introduction — ADR includes: context, decision, alternatives (with scoring), consequences, risk assessment, exit plan, review date; (2) Technology replacement — ADR includes: why the current technology is insufficient, migration plan, dual-run strategy, rollback plan; (3) Technology removal — ADR includes: why the technology is no longer needed, what replaces it, impact on dependent systems, decommissioning timeline. The ADR is archived to `tech-lead/decisions/<project>/`. The Yi-family projects have ADRs for: pytest introduction, Vitest introduction, Vitest rollout, LLM multi-provider routing, Biome lint/format, Chrome manifest dual-world boundary, AICR port rollout.
- **Team familiarity vs. technical superiority decision framework**: If the superior technology offers <2x improvement in the critical dimension (cost, performance, scalability), choose the familiar technology. If the superior technology offers 2-5x improvement, the decision depends on team capacity to learn (do we have 2-4 weeks of learning budget?). If the superior technology offers >5x improvement, the decision favors the superior technology regardless of familiarity, because the scale of improvement justifies the learning cost. The Yi-family examples: choosing Vitest over Jest (3x faster, but team already knew Jest → Vitest learning curve was 1 week), choosing Rsbuild over Vite (2x faster builds, but migration cost was 2 weeks).
- **Cost estimation for tech selection (TCO over 3 years)**: (1) Adoption cost — initial integration, training, configuration, estimated in person-weeks; (2) Operational cost — hosting, licensing, support, per-year; (3) Maintenance cost — upgrades, bug fixes, compatibility patches, person-weeks per year; (4) Exit cost — migration to alternative, estimated in person-weeks; (5) Risk cost — probability of vendor sunset/discontinuation × exit cost. Total 3-year TCO = adoption + (operational × 3) + (maintenance × 3) + (risk-adjusted exit cost). The Yi-family projects' primary cost is LLM API calls (usage-based); infrastructure costs are minimal (free tiers).
- **Yi-family tech selection history and rationale**: pytest (Python testing) — chosen for YiAi, familiar to Python ecosystem, pytest-asyncio for async support, free. Vitest (TypeScript testing) — chosen for YiVad and YiPet over Jest, 3x faster, native ESM support, vite-native transforms, free. Biome (linting/formatting) — chosen for YiVad and YiPet over ESLint+Prettier, 10x faster, single tool for both, free. Rsbuild (build tool) — chosen for YiVad over Vite, 2x faster builds, better static analysis support, free. MongoDB Atlas (database) — chosen for all 3 projects, document model fits YiKnowledge markdown structure, M0 free tier for development, managed service reduces ops burden.

## Scenario description

When selecting a framework / library / SaaS / DB / LLM / inference engine / vector database / embedding / data platform, architects + tech leads + primary owners need to look up the evaluation template + thinking tools + vendor comparison + review process + cost + security. This entry aggregates selection-related templates + thinking + vendor comparison + review into a 2-hop path, avoiding "selection by word-of-mouth / missing cost / missing security / review as a rubber stamp".

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `resources/templates/` | [tech-selection-evaluation-template.md](../../knowledge-curator/templates/tech-selection-evaluation.md) · [tech-selection-evaluation-summary.md](../../knowledge-curator/templates/tech-selection-evaluation.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [adr-summary.md](../../knowledge-curator/templates/adr.md) · [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) · [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) · [strong-opinions-loosely-held-summary.md](../../knowledge-curator/templates/thinking--strong-opinions-loosely-held.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md) |
| `methodology/engineering-patterns/` | [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md) · [supply-chain-hardening-pattern.md](../../engineer/process/harden-supply-chain.md) · [evaluation-driven-development-pattern.md](../../engineer/engineering/evaluation-driven-development.md) · [one-to-one-mapping-migration-pattern.md](../../engineer/architecture-design/one-to-one-mapping-migration.md) — switch contingency |
| `work/processes/` | [design-review-process.md](../../product-manager/delivery/design-review.md) · [tech-review-process.md](../../product-manager/delivery/tech-review.md) · [requirement-review-process.md](../../product-manager/delivery/requirement-review.md) · [dependency-upgrade-process.md](../../engineer/engineering/dependency-upgrade.md) · [quarterly-security-audit-process.md](../../engineer/quality-security/quarterly-security-audit.md) · [capacity-planning-process.md](../../engineer/infrastructure/capacity-planning.md) · [shared-client-vendor-rollout.md](../../engineer/engineering/shared-client-vendor-rollout.md) |
| `tech/ai-platform/` | [llm-comparison-summary.md](../../ai-engineer/platform/llm-comparison.md) · [inference-engine-comparison-summary.md](../../ai-engineer/platform/inference-engine-comparison.md) · [vector-db-comparison-summary.md](../../ai-engineer/platform/vector-db-comparison.md) · [embedding-model-selection-summary.md](../../ai-engineer/platform/embedding-model-selection.md) · [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [lakehouse-architecture-summary.md](../../ai-engineer/data/lakehouse-architecture.md) · [mongodb-indexing-summary.md](../../ai-engineer/data/mongodb-indexing.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [capacity-and-cost-template.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) · [tech-debt-inventory-template.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `industry/{competitors,reports,market-trends}/` | [llm-vendor-landscape-summary.md](../../executive/industry/competitors--llm-vendor-landscape.md) · [competitor-analysis-template.md](../../executive/industry/competitors--competitor-analysis.md) · [ai-industry-report-summary.md](../../executive/industry/reports--ai-industry-report.md) · [ai-market-trend-first-half.md](../../executive/industry/market-trends--ai-market-trend-first-half.md) · [regional-market-observation.md](../../executive/industry/market-trends--regional-market-observation.md) |
| `industry/use-cases/` | [ai-after-sales-cases.md](../../product-manager/strategy/ai-after-sales-cases.md) · [ai-customer-service-cases.md](../../product-manager/strategy/ai-customer-service-cases.md) · [case-study-template.md](../../product-manager/strategy/case-study.md) |
| `work/tools/` | [vllm-ollama-deployment-summary.md](../../engineer/engineering/vllm-ollama-deployment.md) · [claude-code-tips-summary.md](../../engineer/engineering/claude-code-tips.md) · [pi-agent-harness-evolution-summary.md](../../engineer/engineering/pi-agent-harness-evolution.md) |
| `lessons/wins/` | [yiai-supply-chain-hardening-win.md](../../engineer/lessons/win-yiai-supply-chain-hardening.md) · [yipet-stack-migration-win.md](../../engineer/lessons/win-yipet-stack-migration.md) · [yry-vite-to-rsbuild-migration-win.md](../../engineer/lessons/win-yry-vite-to-rsbuild-migration.md) — selection + switch case study |
| `lessons/gotchas/` | [no-lockfile-supply-chain-risk.md](../../engineer/lessons/gotcha-no-lockfile-supply-chain-risk.md) · [vite-to-rsbuild-migration.md](../../engineer/lessons/gotcha-vite-to-rsbuild-migration.md) — selection incident |
| `people/experts--` | [external-experts-roster.md](../../knowledge-curator/people/experts--external-experts-roster.md) — external expert consultation |

## Action recommendations

1. **First principles**: first ask "why select / what happens if not selected / what is the core constraint"; do not jump to listing candidates; see [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md).
2. **Inversion thinking**: first imagine "how selecting this item could fail"; list failure patterns then work backward to derive the conditions that must hold; see [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md).
3. **Occam's razor**: the simplest solution that meets the requirement wins; do not pick a complex solution for hypothetical future needs; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md).
4. **Three candidates**: do not exceed 5 items; 2-3 items are enough for comparison.
5. **Evaluation dimensions**: functionality / performance / cost / security / compliance / ecosystem / team familiarity / switching cost / long-term maintenance; follow [tech-selection-evaluation-template.md](../../knowledge-curator/templates/tech-selection-evaluation.md).
6. **PoC**: a PoC must verify core assumptions (performance / compatibility / data migration); see [evaluation-driven-development-pattern.md](../../engineer/engineering/evaluation-driven-development.md).
7. **Cost**: direct cost (license / API) + indirect cost (ops / learning / switch) + exit cost; follow [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md).
8. **Security + compliance**: dependency vulnerabilities / supply chain / cross-border data transfer / license (GPL / AGPL risk); follow [quarterly-security-audit-process.md](../../engineer/quality-security/quarterly-security-audit.md).
9. **Switch contingency**: must be able to switch (abstraction layer / standard interface / dual-world boundary); see [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md).
10. **Review**: follow [tech-review-process.md](../../product-manager/delivery/tech-review.md) and capture the decision in an ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
11. **Second-order effects**: how will selecting this item change the team / architecture / cost structure? See [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md).
12. **Implementation**: follow [shared-client-vendor-rollout.md](../../engineer/engineering/shared-client-vendor-rollout.md) (multi-project shared) or [dependency-upgrade-process.md](../../engineer/engineering/dependency-upgrade.md) (single project).

## Anti-patterns

- **Selection by word-of-mouth or social media hype.** Picking a technology because "everyone is using it" or it trended on Hacker News, without evaluating it against your specific constraints, requirements, and team context. Popularity is a weak proxy for fitness.

- **Evaluating only the happy path.** Testing the candidate only on the ideal use case without probing edge cases, failure modes, scale limits, or integration pain points. The happy path always works in a demo. The edges are where selections fail in production.

- **Too many candidates with shallow evaluation.** Evaluating six or more candidates spreads analysis thin and leads to surface-level comparisons. Limit to two or three candidates with deep evaluation. Adding more candidates beyond three has sharply diminishing returns.

- **Ignoring ecosystem and community health.** Focusing only on the technology's features while ignoring whether it has active maintainers, a healthy plugin ecosystem, responsive issue resolution, and a viable bus factor. A technically superior project with one maintainer is a future migration waiting to happen.

- **Deferring security and compliance review to after selection.** Discovering during implementation that the selected technology violates a compliance requirement -- GDPR, data residency, license restriction -- is a selection failure. Security and compliance must be evaluated before the decision is made, not after.

## Related

- Related journey: [../architecture/design-architecture-decision.md](../architecture/design-architecture-decision.md) — ADR implementation
- Related journey: [../../ai-engineer/platform/pick-an-llm-provider.md](../../ai-engineer/platform/pick-an-llm-provider.md) — LLM vendor
- Related journey: [../../ai-engineer/platform/pick-a-vector-database.md](../../ai-engineer/platform/pick-a-vector-database.md) — vector database
- Related journey: [../../engineer/process/harden-supply-chain.md](../../engineer/process/harden-supply-chain.md) — supply chain
- Upstream: [../../knowledge-curator/templates/README.md](../../knowledge-curator/templates/README.md) — templates leaf entry
