---
title: Manage a vendor relationship
aliases:
- i-want-to-manage-a-vendor-relationship
- vendor-journey
- supplier-journey
- vendor-management-entry
tags:
- journeys
- vendor
- supplier
- contract
- sla
- procurement
category: engineer/engineering
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
- ../../tech-lead/roadmap/do-a-tech-selection.md
- ../patterns/adopt-a-new-dependency.md
- ../strategies/harden-supply-chain.md
- shared-client-vendor-rollout.md
review_cycle: quarterly
last_verified: 2026-08-07
tacit: false
---

# I want to manage a vendor relationship

> **As an** engineer, **I want to** manage a vendor relationship, **so that** outcome is traceable. 

> "Selection + contract + SLA + monitoring + evaluation + renewal + exit + multi-provider" reaches processes + thinking frameworks + cases within 2 hops. 

## Summary

- Selection follows [tech-selection-evaluation-template.md](../../knowledge-curator/templates/tech-selection-evaluation.md) + [i-want-to-do-a-tech-selection.md](../../tech-lead/roadmap/do-a-tech-selection.md)
- Processes follow [shared-client-vendor-rollout-process.md](./shared-client-vendor-rollout.md) + [quarterly-security-audit-process.md](../quality-security/quarterly-security-audit.md)
- Thinking follows [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md)
- Multi-provider follows [adr-multi-provider-llm-routing.md](../../tech-lead/decisions/yiai--route-llm-traffic-across-providers.md) + [llm-vendor-landscape-summary.md](../../executive/industry/competitors--llm-vendor-landscape.md)

## Core viewpoints

**Multi-provider is not a luxury; it is the minimum viable vendor strategy.** A single-vendor dependency means the vendor's outage is your outage, the vendor's price hike is your cost increase, and the vendor's deprecation is your migration crisis. Multi-provider routing with a self-hosted fallback is the only structure that preserves negotiating power and operational resilience. The cost of maintaining multi-provider support is a fraction of the cost of a single-vendor failure.

**Passive renewal is the most expensive vendor management mistake.** Renewing a vendor contract without re-evaluating alternatives, renegotiating terms, and running a competitive comparison means paying last year's prices for last year's service level while the market has improved. The 90-day pre-renewal evaluation window is not a suggestion; it is the minimum time required to run a proper competitive assessment and negotiate from a position of strength.

**The vendor abstraction layer is the exit plan.** A vendor abstraction layer (adapter/facade pattern) that makes the vendor replaceable is not an architectural nicety; it is the operational embodiment of the exit plan. If the abstraction layer does not exist, the exit plan is theoretical. The abstraction layer must be tested by actually swapping vendors during the POC phase, not by assuming it will work.

**Quarterly vendor evaluation must be data-driven, not relationship-driven.** A vendor evaluation based on the account manager's responsiveness and the team's comfort level is a relationship evaluation, not a vendor evaluation. The quarterly review must be driven by data: SLA actuals, error rates, latency percentiles, cost trends, and competitive benchmarks. A vendor with a great relationship and declining metrics is still a declining vendor.

**The contract is the least important part of the vendor relationship.** A contract defines what happens when things go wrong; it does not prevent things from going wrong. The operational safeguards (monitoring, fallback, multi-provider, abstraction layer) are what actually protect the business. Negotiating a great contract and then skipping the operational safeguards is the vendor management equivalent of buying insurance and then setting the house on fire.

## Key info

- **Vendor selection evaluation matrix (8 criteria)**: (1) Functional fit — does the vendor solve the specific problem, scored 1-5; (2) Reliability — historical uptime, SLA terms, outage communication quality; (3) Performance — latency p95, throughput, scalability ceiling; (4) Security — certifications (SOC 2, ISO 27001), data handling practices, breach history; (5) Cost — current pricing, projected cost at 2x/5x/10x scale, hidden costs (egress, support, overages); (6) Vendor stability — years in business, funding, market share, recent layoffs or acquisitions; (7) Ecosystem — community size, SDK/API quality, documentation, third-party integrations; (8) Exit feasibility — data export capability, API compatibility with alternatives, estimated migration effort in person-weeks. Each criterion is weighted by importance to the business; total score determines the shortlist. The Yi-family projects use this matrix for LLM provider and database selection.
- **Vendor abstraction layer (adapter pattern) implementation cost-benefit**: Cost: ~100-300 lines of interface definition + adapter per vendor, plus ongoing maintenance when vendor APIs change. Benefit: switching vendors requires changing 1 file (the adapter) instead of N files (every call site). The benefit is realized when: (a) the vendor has an outage and you need to fail over to a backup, (b) the vendor raises prices and you need to negotiate or switch, (c) the vendor deprecates an API version and you need to migrate. The abstraction layer must be tested by actually swapping vendors during the POC phase; an untested abstraction layer is a theoretical abstraction layer. The YiAi project has a working abstraction layer for LLM providers (Anthropic ↔ OpenAI swap tested).
- **Quarterly vendor evaluation scorecard**: (1) SLA actuals vs. committed — uptime, latency, support response time; (2) Error rate trend — is the vendor's reliability improving or declining; (3) Cost trend — is the per-unit cost increasing, stable, or decreasing; (4) Competitive benchmark — how does the vendor compare to the top 2 alternatives on the same criteria; (5) Integration health — how many incidents in the past quarter were caused by the vendor; (6) Relationship health — account manager responsiveness, feature request responsiveness, contract flexibility. A vendor whose SLA actuals are below committed for 2 consecutive quarters is a vendor that should be re-evaluated for replacement.
- **90-day pre-renewal evaluation process**: Day 90-60: competitive landscape assessment — evaluate top 2 alternatives against the selection matrix, run POC if feasible; Day 60-30: negotiate with incumbent — share competitive findings (without naming competitors), request improved terms, set a decision deadline; Day 30-14: final comparison — incumbent's best offer vs. best alternative, include migration cost in the comparison; Day 14: decision — renew, switch, or dual-source (add a second vendor, reduce incumbent's share). The 90-day window is the minimum; complex migrations (database, cloud provider) need 6-12 months. The Yi-family projects have no formal renewal process (current vendors are on monthly/usage-based billing with no long-term contracts).
- **Multi-provider routing architecture**: (1) Primary provider — handles 80-100% of traffic under normal conditions; (2) Secondary provider — on standby, receives 0-20% of traffic for diversity, takes over if primary fails; (3) Fallback provider — self-hosted or low-cost option, handles traffic when both primary and secondary fail; (4) Routing logic — based on: provider health (error rate < threshold), cost (cheapest that meets quality bar), latency (fastest that meets quality bar), feature (provider-specific capabilities). The routing decision is made per request, not per session. The YiAi project uses multi-provider routing for LLM calls with Anthropic as primary, OpenAI as secondary, and no self-hosted fallback (below break-even volume).
- **Yi-family vendor relationships**: MongoDB Atlas — database for all 3 projects, M0 free tier (development), M10+ for production, no formal SLA (free tier), abstraction layer exists (Motor driver, standard MongoDB protocol, replaceable with any MongoDB-compatible service). Anthropic — primary LLM provider for YiAi, Claude API, usage-based billing, abstraction layer exists (multi-provider routing). OpenAI — secondary LLM provider for YiAi, GPT API, usage-based billing, same abstraction layer. GitHub — source control + CI for all projects, free tier. No other paid vendors. The vendor risk is concentrated in MongoDB Atlas (single database for all 3 projects) and Anthropic (primary LLM provider).

## Scenario

When managing vendor relationships / selection evaluation / contract negotiation / SLA monitoring / quarterly evaluation / renewal / multi-provider routing / exit planning, architects + platform + procurement + business owners need to look up processes + thinking + cases. This entry aggregates vendor-management-related processes + thinking + cases into a 2-hop path, avoiding "locked-in / SLA untracked / passive renewal / no exit plan / multi-provider not switched / no fallback when vendor fails". 

## 2-hop reachability paths

| Hop 1 (class/leaf)  | Hop 2 (specific file)  |
|---|---|
| `work/processes/` | [shared-client-vendor-rollout-process.md](./shared-client-vendor-rollout.md) · [quarterly-security-audit-process.md](../quality-security/quarterly-security-audit.md) · [dependency-upgrade-process.md](dependency-upgrade.md) · [incident-response-process.md](../process/incident-response.md) · [monitoring-governance-process.md](../process/monitoring-governance.md) · [capacity-planning-process.md](../infrastructure/capacity-planning.md) · [data-compliance-process.md](../infrastructure/data-compliance.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) · [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) — reverse-think vendor failure · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) · [strong-opinions-loosely-held-summary.md](../../knowledge-curator/templates/thinking--strong-opinions-loosely-held.md) |
| `methodology/engineering-patterns/` | [supply-chain-hardening-pattern.md](../process/harden-supply-chain.md) · [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md) · [one-to-one-mapping-migration-pattern.md](../architecture-design/one-to-one-mapping-migration.md) · [evaluation-driven-development-pattern.md](../engineering/evaluation-driven-development.md) |
| `industry/competitors--` | [llm-vendor-landscape-summary.md](../../executive/industry/competitors--llm-vendor-landscape.md) · [competitor-analysis-template.md](../../executive/industry/competitors--competitor-analysis.md) — vendor comparison |
| `industry/reports--` | [ai-industry-report.md](../../executive/industry/reports--ai-industry-report.md) · [market-trends/](../../executive/industry/market-trends) — industry baseline |
| `tech/ai-platform/` | [llm-comparison-summary.md](../../ai-engineer/platform/llm-comparison.md) · [inference-engine-comparison-summary.md](../../ai-engineer/platform/inference-engine-comparison.md) · [vector-db-comparison-summary.md](../../ai-engineer/platform/vector-db-comparison.md) · [embedding-model-selection-summary.md](../../ai-engineer/platform/embedding-model-selection.md) · [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [capacity-and-cost-template.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `lessons/wins/` | [yiai-llm-phase-{two,three,four,five}-win.md](../lessons) — multi-provider landing · [yiai-supply-chain-hardening-win.md](../lessons/win-yiai-supply-chain-hardening.md) · [yiai-brd-agent-launch.md](../lessons/win-yiai-brd-agent-launch.md) |
| `lessons/gotchas/` | [no-lockfile-supply-chain-risk.md](../lessons/gotcha-no-lockfile-supply-chain-risk.md) · [macos-fsevents-silent-drop.md](../lessons/gotcha-macos-fsevents-silent-drop.md) |
| `lessons/failures/` | [incident-postmortem-summary.md](../lessons/failure-incident-postmortem.md) · [ai-product-launch-lessons-summary.md](../lessons/failure-ai-product-launch-lessons.md) |
| `resources/templates/` | [tech-selection-evaluation-template.md](../../knowledge-curator/templates/tech-selection-evaluation.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) |
| `people/stakeholders--` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders--stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders--communication-cadence.md) — vendor cadence |
| `people/experts--` | [external-experts-roster.md](../../knowledge-curator/people/experts--external-experts-roster.md) — external expert opinions |
| `work/collaboration/` | [raci-matrix-summary.md](../process/raci-matrix.md) · [contract-negotiation-summary.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-contract-strategy.md) — vendor RACI |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) — vendor quarterly audit |
| `projects/` | [adr-multi-provider-llm-routing.md](../../tech-lead/decisions/yiai--route-llm-traffic-across-providers.md) · [adr-llm-multi-provider-rollout.md](../../tech-lead/decisions/yiai--llm-multi-provider-rollout.md) · each project `adr-*-vendor-*` |

## Action recommendations

1. **First principles**: first ask "what does this vendor solve / what happens if not chosen / alternatives / ROI / exit cost"; do not select for the sake of selecting; see [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md). 
2. **Inversion**: first think "how the vendor might fail (outage / price hike / data leak / runs away / compliance change / performance degradation)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md). 
3. **Second-order effects**: lock-in -> weak bargaining -> passive upgrades -> team knowledge gap; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md). 
4. **Occam**: if you can build it yourself + maintenance cost is controllable, do not use a vendor; the simplest dependency that meets the need wins; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md). 
5. **Selection**: must run [tech-selection-evaluation-template.md](../../knowledge-curator/templates/tech-selection-evaluation.md); at least 2 candidates + scoring matrix + POC. 
6. **POC**: follow [i-want-to-do-a-proof-of-concept.md](../../tech-lead/roadmap/do-a-proof-of-concept.md); must test real load + boundary scenarios + exit. 
7. **Contract**: SLA (availability / latency / support / compensation) + data terms (ownership / cross-border / deletion) + termination clauses + price lock. 
8. **Multi-provider**: must run [adr-multi-provider-llm-routing.md](../../tech-lead/decisions/yiai--route-llm-traffic-across-providers.md); multi-provider routing + fallback + self-hosted vLLM; do not single-vendor. 
9. **Abstraction layer**: must build an abstraction layer (adapter / facade) so vendors are replaceable; see [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md) + [one-to-one-mapping-migration-pattern.md](../architecture-design/one-to-one-mapping-migration.md). 
10. **Monitoring**: must monitor vendor SLA actual values / error rate / latency / cost / quota; follow [monitoring-governance-process.md](../process/monitoring-governance.md). 
11. **Quarterly evaluation**: follow [quarterly-security-audit-process.md](../quality-security/quarterly-security-audit.md); scan whether vendor is still optimal + SLA met + compliance changed. 
12. **Renewal**: start evaluation 90 days ahead; must run competitor comparison + negotiation; do not passively renew. 
13. **Exit plan**: must land exit steps + data migration + traffic cutover + rollback; see [shared-client-vendor-rollout-process.md](./shared-client-vendor-rollout.md). 
14. **Compliance**: cross-border follow [data-compliance-process.md](../infrastructure/data-compliance.md). 
15. **RACI**: vendor engagement must run [raci-matrix-summary.md](../process/raci-matrix.md); do not have multiple people engaged without an owner. 
16. **Notification**: when vendor fails must run [i-want-to-handle-outage-communication.md](../process/handle-outage-communication.md). 
17. **Retrospective**: after renewal / exit / incident follow [incident-postmortem-template.md](../lessons/failure-incident-postmortem.md) retrospective + archive into [lessons/](../../engineer/lessons). 
18. **ADR**: vendor decisions must land in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md). 

## Anti-patterns

- **Single-vendor dependency without a fallback.** Relying on one vendor for a critical capability means the business inherits that vendor's outage schedule, pricing model, and product roadmap. When the vendor has an outage, the business has an outage. When the vendor raises prices, the business pays more. Multi-provider routing with a self-hosted fallback is the minimum acceptable risk posture for any critical vendor dependency.

- **Renewing without competitive evaluation.** Automatically renewing a vendor contract because "the team is used to it" or "migration is too hard" means the business is paying for inertia. The renewal process must include a competitive evaluation with at least two alternatives, a cost-benefit analysis of migration, and a negotiation based on current market rates. Passive renewal is a signal that the abstraction layer is insufficient.

- **Evaluating vendors on features instead of operational reliability.** A vendor with every feature on the checklist but a history of outages, slow support, and opaque pricing is a worse choice than a vendor with 80% of the features and rock-solid reliability. The evaluation matrix must weight operational reliability (uptime, support responsiveness, upgrade smoothness) at least as heavily as feature completeness.

- **Delegating vendor management entirely to procurement.** Procurement negotiates the contract; engineering lives with the vendor. When the vendor relationship is managed exclusively by procurement without engineering input on operational reality, the contract optimizes for cost while the team optimizes for reliability. Vendor management must be a shared responsibility between procurement and engineering.

- **Skipping the exit drill.** An exit plan that exists only on paper is not an exit plan. The exit drill (switching traffic to an alternative provider, exporting data, validating the fallback) must be run at least once before the integration goes live and then annually thereafter. An exit plan that has never been tested is a plan that will fail when it is needed.

## Related

- Same-class journey: [../../tech-lead/roadmap/do-a-tech-selection.md](../../tech-lead/roadmap/do-a-tech-selection.md) — selection
- Same-class journey: [./i-want-to-adopt-a-new-dependency.md](../quality-security/adopt-a-new-dependency.md) — dependency integration
- Same-class journey: [../strategies/harden-supply-chain.md](../process/harden-supply-chain.md) — supply chain
- Same-class journey: [../../ai-engineer/platform/pick-an-llm-provider.md](../../ai-engineer/platform/pick-an-llm-provider.md) — LLM provider
- Upstream: [../../README.md](../../README.md) — processes leaf entry
