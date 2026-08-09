---
title: Apply team topologies
aliases:
- i-want-to-apply-team-topologies
- team-topologies-journey
- stream-aligned-team-journey
- platform-team-journey
- team-topologies-entry
tags:
- journeys
- team-topologies
- organization-design
- stream-aligned
- platform-team
- enabling-team
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
- bootstrap-a-new-team.md
- ../../product-manager/frameworks/prepare-an-okr-cycle.md
- ../strategies/prepare-a-skip-level-1-on-1.md
- ../../engineer/process/raci-matrix.md
review_cycle: quarterly
tacit: false
last_verified: 2026-08-07
---

# I want to apply team topologies

> **As an** engineer, **I want to** apply team topologies, **so that** outcome is traceable. 

> Reach "stream-aligned + platform + enabling + complicated-subsystem + Conway's law + interaction modes + quarterly audit" within 2 hops via process + thinking + cases. 

## Summary

- Process: [quarterly-tech-debt-process.md](../quality-security/quarterly-tech-debt.md) + [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) + [cross-team-collaboration-process.md](../process/cross-team-collaboration.md)
- Thinking: [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md)
- Platform: [ssot-view-layer-pattern.md](ssot-view-layer.md) + [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md) + [contract-test-baseline-pattern.md](../quality-security/contract-test-baseline.md)
- Cases: [yiai-brd-agent-launch.md](../lessons/win-yiai-brd-agent-launch.md) + [incident-postmortem-summary.md](../lessons/failure-incident-postmortem.md)

## Core viewpoints

**Conway's law is not a metaphor -- it is a constraint that operates whether you acknowledge it or not.** If your architecture has four services but your organization has three teams, one team will own two services, and the boundary between those two services will blur. You can either design the organization to match the desired architecture (inverse Conway maneuver) or accept that the architecture will converge to match the organization.

**The platform team's primary metric is adoption, not output.** A platform team that builds tools no one uses is a cost center. The platform team succeeds when stream-aligned teams choose the platform over building their own. This means the platform must be self-service, well-documented, and genuinely easier than the alternative -- not mandated by policy.

**Cognitive load is the hard limit on team capacity, not headcount.** A team of 9 people responsible for one bounded context can operate effectively. A team of 5 people responsible for 4 bounded contexts cannot, regardless of how talented they are. Team topologies is fundamentally about matching team cognitive capacity to domain complexity, not about optimizing reporting lines.

**Enabling teams must have an exit strategy.** An enabling team that becomes a permanent dependency has failed. The goal is to embed, teach, and leave. If the same enabling team is still working with the same stream-aligned team after six months, they are not enabling -- they are a hidden dependency that the org chart does not show.

**Interaction modes must be explicit and reviewed.** "We collaborate" is not an interaction mode -- it is a vague aspiration. The three modes (collaboration, X-as-a-service, facilitating) define who initiates, who owns the outcome, and how long the interaction lasts. Teams that do not explicitly agree on their interaction mode develop implicit expectations that diverge and cause conflict.

## Key info

- **Four team types**: stream-aligned (owns a slice of business flow, primary delivery team, 5-9 people), platform (provides self-service tools, measured by adoption, 5-12 people), enabling (temporary specialists who embed, teach, and leave, 3-5 people, 3-6 month engagement), complicated-subsystem (owns a component requiring deep specialization, 3-7 people, only when a subsystem is too complex for a stream-aligned team to own). Most organizations only need the first two types; enabling and complicated-subsystem are situational.
- **Cognitive load budgeting**: a team can handle 2-3 "simple" domains (CRUD, standard patterns) or 1 "complicated" domain (multi-service, stateful, multi-stakeholder) or 0 "complex" domains (emergent, unpredictable, requires deep expertise). The three types of cognitive load: intrinsic (inherent to the domain, irreducible), extraneous (imposed by tooling, reducible), germane (learning investment, valuable). The goal is to minimize extraneous load so intrinsic + germane fit within team capacity.
- **Interaction mode definitions**: Collaboration (two teams work together on a shared goal, high trust, high ceremony, defined timebox, joint ownership during the period), X-as-a-Service (one team provides a service, another consumes it, low ceremony, clear API contract, consumer owns the outcome), Facilitating (one team helps another learn, temporary, measured by the learner's independence, ends when the learner no longer needs help). The most common failure mode is Collaboration mode with no exit criteria -- teams that "collaborate" indefinitely.
- **Inverse Conway maneuver**: define the desired architecture first, then structure teams to match. If you want four services with clear contracts, create four teams. If you want a monolith, keep one team. The maneuver is a one-time restructuring cost that pays off in architectural alignment. The counter-force is that organizational restructuring is politically expensive, so the maneuver is applied incrementally -- one team boundary at a time, not a big-bang reorg.
- **Team size limits**: Dunbar's number layers apply: 5-9 (stream-aligned team, everyone knows what everyone is working on), 15-25 (small org, trust-based coordination works), 50-80 (medium org, formal coordination needed), 150+ (Dunbar's limit, hierarchical coordination). A team over 9 people should split before it hits 12; a team of 15 has already lost the ability to coordinate informally and should have split at 9.

## Scenario

When applying team topologies / team topologies / stream-aligned / platform team / enabling team / complicated-subsystem / Conway's law / team interaction modes / team boundary / team cognitive load / team ownership / team evolution / cross-team collaboration / quarterly org audit / big-promo org adjustment, TL + architect + PMO + sponsor need to look up process + thinking + cases. This entry aggregates team-topology-related process + thinking + cases into a 2-hop path, avoiding "boundary chaos / cognitive overload / vague interaction / platform missing / enabling missing / no quarterly audit". 

## 2-hop reachability paths

| Hop 1 (category/leaf)  | Hop 2 (specific file)  |
|---|---|
| `work/processes/` | [quarterly-tech-debt-process.md](../quality-security/quarterly-tech-debt.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) · [cross-team-collaboration-process.md](../process/cross-team-collaboration.md) · [capacity-planning-process.md](../infrastructure/capacity-planning.md) · [requirement-review.md](../../product-manager/delivery/requirement-review.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../process/raci-matrix.md) · [async-collaboration-principles-summary.md](../process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../process/cross-timezone-collaboration.md) · [contract-negotiation-summary.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-contract-strategy.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) — topology essence · [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) — reverse-imagine going out of bounds · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md) |
| `methodology/pm-frameworks/` | [jobs-to-be-done-summary.md](../../product-manager/frameworks/jobs-to-be-done.md) · [rice-ice-prioritization-summary.md](../../product-manager/frameworks/rice-ice-prioritization.md) · [product-discovery-summary.md](../../knowledge-curator/archive/strategies-legacy/product-manager/prepare-a-product-discovery-strategy.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](ssot-view-layer.md) · [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md) · [contract-test-baseline-pattern.md](../quality-security/contract-test-baseline.md) · [supply-chain-hardening-pattern.md](../process/harden-supply-chain.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) |
| `resources/prompts/` | [weekly-report-prompt.md](../../ai-engineer/methodology/prompts--weekly-report.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts--code-review.md) |
| `work/meetings/` | [review-meeting-template.md](../../product-manager/delivery/review-meeting.md) · [weekly-meeting-template.md](../../product-manager/delivery/weekly-meeting.md) · [retrospective-sample.md](../../product-manager/delivery/retrospective.md) |
| `people/team--` | [team-overview.md](../../knowledge-curator/people/team--team-overview.md) · [roster.md](../../knowledge-curator/people/team--roster.md) — team matrix |
| `people/stakeholders--` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders--stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders--communication-cadence.md) — communication |
| `people/experts--` | [external-experts-roster.md](../../knowledge-curator/people/experts--external-experts-roster.md) — org consultant |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics--north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics--ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics--retention-and-churn.md) |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../lessons/win-yiai-brd-agent-launch.md) · [yivad-aicr-phase-port.md](../lessons/win-yivad-aicr-phase-port.md) |
| `lessons/failures/` | [incident-postmortem-summary.md](../lessons/failure-incident-postmortem.md) · [ai-product-launch-lessons-summary.md](../lessons/failure-ai-product-launch-lessons.md) · [bugs/](../lessons) — cross-team failure archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `projects/` | each project `architecture-summary.md` §team + `adr-*` §org |
| `journeys/` | [./i-want-to-bootstrap-a-new-team.md](../engineering/bootstrap-a-new-team.md) · [../../product-manager/frameworks/prepare-an-okr-cycle.md](../../knowledge-curator/archive/strategies-legacy/product-manager/prepare-an-okr-cycle.md) · [../strategies/prepare-a-skip-level-1-on-1.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-skip-level-1-on-1.md) · [../strategies/prepare-an-intern-program.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-an-intern-program.md) |

## Action recommendations

1. **First principles**: first ask "what does the topology solve / what happens if not adjusted / ROI / business impact"; do not adjust for the sake of adjusting; see [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md). 
2. **Inversion**: first imagine "topology going out of control (boundary chaos / cognitive overload / vague interaction / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md). 
3. **Second-order effects**: one adjustment -> process changes -> another adjustment; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md). 
4. **Occam**: the simplest topology that satisfies business wins; do not pile up teams; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md). 
5. **Conway**: must follow Conway's law + architecture must follow organization + must do inverse-Conway adjustment. 
6. **Stream-aligned**: must run value-stream teams + end-to-end + long-term. 
7. **Platform**: must run platform team + self-service + reduce cognitive load; see [ssot-view-layer-pattern.md](ssot-view-layer.md). 
8. **Enabling**: must run enabling team + short-term + coaching + must close out. 
9. **Complicated-subsystem**: must run expert team + independent + boundary. 
10. **Interaction modes**: must run collaboration / x-as-a-service / facilitating + must be explicit. 
11. **Cognitive load**: must keep team size 7 +/- 2 + single responsibility + SOA boundary. 
12. **Ownership**: must run [raci-matrix-summary.md](../process/raci-matrix.md) + code ownership + on-call. 
13. **Cross-team**: must run [cross-team-collaboration-process.md](../process/cross-team-collaboration.md) + API contract + joint retrospective. 
14. **AI team**: must run [llm-comparison-summary.md](../../ai-engineer/platform/llm-comparison.md) + prompt / eval / data division of labor. 
15. **Freeze period**: during big-promo follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md); do not move organization. 
16. **Communication**: must run [communication-cadence.md](../../knowledge-curator/people/stakeholders--communication-cadence.md) communicate internally and externally. 
17. **Retrospective**: after org adjustment must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective. 
18. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether topology is still accurate + boundary still reasonable. 
19. **ADR**: organization decisions must land ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md). 
20. **Flywheel**: good topology -> smooth collaboration -> higher speed -> more business; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md). 

## Anti-patterns

- **Reorganizing teams to solve technical problems.** Team topology changes are organizational changes, not architectural changes. If the problem is a monolith that is hard to split, reorganizing teams will not fix the monolith -- it will just give the new teams a different reporting structure while they all still work on the same codebase. Fix the architecture first, then align the teams to it.

- **Platform team as a dumping ground.** A platform team that is formed by moving the least-liked services and tools into a new team is not a platform team -- it is a garbage collection team. The platform must be designed as a product with clear value propositions, not assembled from unwanted leftovers.

- **Stream-aligned teams without end-to-end ownership.** A team that owns "the API layer" but not the database, or "the frontend" but not the backend, is not stream-aligned. Stream-aligned means the team can deliver a complete user value stream from idea to production without depending on another team's sprint.

- **Enabling team that never leaves.** An enabling team that embeds with a stream-aligned team and stays for 12 months is no longer enabling -- it is a hidden dependency. The enabling team's success metric is how quickly they can make themselves unnecessary.

- **Ignoring cognitive load when assigning work.** Adding a fourth domain to a team that already struggles with three will not make them faster -- it will make them slower across all four domains. Cognitive load is the bottleneck, not hours in the day. The solution is to reduce the number of domains, not to add more people.

## Related

- Same-category journey: [./i-want-to-bootstrap-a-new-team.md](../engineering/bootstrap-a-new-team.md) — new team
- Same-category journey: [../../product-manager/frameworks/prepare-an-okr-cycle.md](../../knowledge-curator/archive/strategies-legacy/product-manager/prepare-an-okr-cycle.md) — OKR
- Same-category journey: [../strategies/prepare-a-skip-level-1-on-1.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-skip-level-1-on-1.md) — skip-level 1:1
- Same-category journey: [../strategies/prepare-an-intern-program.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-an-intern-program.md) — intern program
- Upstream: [../../engineer/process/README.md](../../README.md) — collaboration leaf entry
