---
title: Dual-Track Agile
aliases:
- Dual-Track Agile
- Discovery and Delivery
tags:
- PM
- methodology
- agile
- discovery
category: product-manager/frameworks
created: 2026-07-31
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: yearly
roles:
- product-manager
- executive
benefit: PMs can select and apply the right PM framework for their specific product challenge
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- agile-product-management.md
- product-discovery-framework.md
- jobs-to-be-done.md
- ../../README.md
tacit: false
---

# Dual-Track Agile

> **As a** product manager, **I want to** dual track agile, **so that** framework applied.

> Discovery and Delivery are not serial stages, but two parallel tracks; the discovery track "stocks ammunition" for the delivery track.

## Summary
- Promoted by Marty Cagan in *Inspired* / SVPG, originating from ThoughtWorks practice.
- Two tracks: Discovery (validate hypotheses, one validation per 2-4 weeks) + Delivery (deliver to launch, one iteration per 1-2 weeks).
- Capacity allocation: 20-30% Discovery, 70-80% Delivery; developers are not only in Delivery — they must join technical spikes on the discovery track.
- Six steps: allocate capacity → build opportunity funnel → Discovery weekly cadence → four-question opportunity assessment → validated enters Delivery → per-iteration retrospective.
- Anti-patterns: discovery track only produces documents, delivery track does not wait for discovery, Discovery done entirely by PM, no capacity allocation, funnel without priorities, no retrospective cadence.

## Core viewpoints

- **The 20-30% Discovery allocation is not a luxury — it is a quality investment that pays for itself.** Every hour of Discovery that kills a bad idea saves 10-50 hours of Delivery time. The ROI math is straightforward: if Discovery prevents one bad feature per quarter, it has already paid for the entire Discovery investment. Teams that see Discovery as "time taken away from building" are optimizing for output over outcome.

- **Dual-track requires dual-role thinking, not dual teams.** The anti-pattern is creating a "Discovery team" and a "Delivery team" that hand off to each other. The same people must do both, because the insights from Discovery live in the engineer's head, not in a document. When the engineer who interviewed the user is the same engineer who builds the feature, the quality of the implementation is measurably higher.

- **The Discovery track produces validated problems, not validated solutions.** The most common failure mode is Discovery producing a detailed feature spec that Delivery then implements. The correct handoff is: "here is the user problem we validated, here are the constraints, here is the evidence." The Delivery track owns the solution design, because the people building it understand the technical trade-offs better than the people researching it.

- **The monthly retrospective on track alignment is the heartbeat of the system.** Without it, the two tracks drift: Discovery validates things Delivery can't build, and Delivery builds things Discovery didn't validate. The retrospective should ask three questions: (1) Did Delivery build what Discovery validated? (2) Did Discovery validate what Delivery needs next? (3) Is the funnel depth healthy (2-3 iterations ahead)?

- **Dual-track is a scaling pattern, not a startup pattern.** For teams under 5 people, the overhead of maintaining two parallel tracks outweighs the benefit. The same person doing Discovery and Delivery sequentially is more efficient than the coordination overhead of dual-track. Introduce dual-track only when the team grows large enough that a single person cannot hold both the Discovery and Delivery context simultaneously.


- **Discovery and Delivery are parallel, not serial** — Waterfall is research→design→dev→test; dual-track runs simultaneously, discovery validates requirements for the next 1-2 iterations.
- **Developers must participate in Discovery** — Otherwise the validated solution may be infeasible; technical feasibility spikes are the developer's discovery-track responsibility.
3. **Capacity 20-30% for Discovery** — Without explicit allocation, Discovery gets squeezed to 0.
- **Entering Delivery requires Discovery endorsement** — Delivery not waiting for discovery means doing whatever you think up.
- **Monthly retrospective on whether the two tracks align** — Without retrospectives the two tracks gradually drift.

## Key information

### Framework origin

Promoted by Marty Cagan in *Inspired* and *SVPG*, originating from ThoughtWorks practice. Core proposition: **Discovery and Delivery are not serial stages, but two parallel tracks**.

Traditional waterfall: research → design → dev → test → release
Dual-track: discovery and delivery run simultaneously; discovery validates requirements for the next 1-2 iterations, delivery completes the current iteration.

### Responsibilities of the two tracks

| Track | Goal | Outputs | Cadence |
|---|---|---|---|
| Discovery | Validate problem and solution hypotheses | User interviews, prototypes, usability tests, opportunity assessments | Long cycle (one validation per 2-4 weeks) |
| Delivery | Deliver validated requirements to launch | Releasable features | Short cycle (one iteration per 1-2 weeks) |

The discovery track "stocks ammunition" for the delivery track; the delivery track does not wait for discovery to finish.

### Roles and division of labor

| Role | Discovery | Delivery |
|---|---|---|
| PM | Lead: interviews, opportunity assessment | Requirement clarification, prioritization |
| Design | Prototypes, usability tests | Visual specs, design acceptance |
| Dev | Technical feasibility probes | Implementation, technical review |
| QA | Testing methodology advice | Test execution |

Developers are not only in Delivery — they must participate in technical feasibility spikes on the discovery track, otherwise the validated solution may be infeasible.

### Implementation steps

1. **Allocate capacity per iteration**: Agree on 20-30% of team time on Discovery, 70-80% on Delivery
2. **Build an opportunity funnel**: Candidate opportunity list, criteria for entering Discovery (user pain / business value / technical feasibility)
3. **Discovery weekly cadence**: 1-2 user interviews per week, rapid prototype validation
4. **Opportunity assessment output**: Each opportunity has 4 answers
   - What problem to solve (Job)
   - For whom (user)
   - Business goal (metric)
   - Risks and dependencies
5. **Move validated opportunities into Delivery**: Enter next-iteration planning
6. **Per-iteration retrospective**: Are Discovery and Delivery aligned, is there buildup

### Input / output artifacts

| Track | Inputs | Outputs |
|---|---|---|
| Discovery | User interviews, data, competitors, tech probes | Opportunity assessments, prototypes, user stories |
| Delivery | Validated user stories, design specs | Launched features, monitoring metrics |

### Comparison with other frameworks

| Framework | Focus | Suited for |
|---|---|---|
| Dual-Track Agile | Discovery and delivery in parallel | Mid-sized teams |
| Design Thinking | Discovery-phase methodology | Exploration phase |
| Lean Startup | Hypothesis-validation loop | 0→1 |
| Shape Up | 6-week fixed cycle | Small teams |

Dual-Track is a cadence and organization pattern, stackable with the above methodologies.

### Applicable scenarios and boundaries

**Applicable**:

- Product has real users and market, needs continuous discovery
- Team ≥5 people, can support two parallel tracks
- PM and design are in the team

**Not applicable**:

- 0→1 stage (small team, same person doing discovery and delivery)
- Strong-contract B2B (requirements contracted, little room for discovery)
- Internal tools (user interviews simple, no need for dual-track)

## Action recommendations
1. Clarify capacity allocation: 20-30% Discovery, 70-80% Delivery, write it into the team working agreement.
2. Build an opportunity funnel: candidate opportunity list + criteria for entering Discovery (user pain / business value / technical feasibility).
3. Discovery weekly cadence: 1-2 real user interviews per week + rapid prototype validation.
4. Four-question assessment per opportunity: what Job / for whom / business metric / risks and dependencies.
5. Developers participate in Discovery for technical feasibility spikes; do not exclude them from the discovery track.
6. Validated opportunities enter Delivery; entering Delivery must have Discovery endorsement.
7. Monthly retrospective on whether the two tracks align and whether the Discovery funnel is backed up.

## Anti-patterns

- **Discovery as a pre-phase that ends before Delivery starts.** This is waterfall with a new label. The Discovery track never stops — it runs continuously alongside Delivery, always preparing validated opportunities for the next 1-2 iterations. When Discovery stops, the team is coding blind after the first iteration.

- **The PM owns Discovery, the engineers own Delivery.** This division creates a class system where PMs think and engineers type. The correct model is that everyone participates in both tracks, with the PM facilitating Discovery and the engineers leading technical feasibility. The PM is not the "Discovery person" — the team is.

- **The Discovery funnel is measured by volume, not by quality of rejection.** A funnel with 50 opportunities where none are rejected is a junk drawer. The health of Discovery is measured by how many ideas are rejected with evidence, not by how many are promoted to Delivery. If your Discovery funnel has a 100% promotion rate, you are not doing Discovery — you are pre-justifying what you already decided to build.

- **Delivery track starts building before Discovery finishes validating.** When the Delivery track runs ahead of Discovery, the team is building unvalidated features at full speed. The cost of this is invisible until the feature ships and nobody uses it. The rule: no feature enters Delivery without a Discovery endorsement that includes at least one user interview and one prototype test.

- **Dual-track applied to maintenance work.** Applying dual-track to bug fixes, tech debt, and minor improvements creates process overhead for work that has no Discovery uncertainty. Maintenance work should bypass the Discovery track and go directly to Delivery, with a simple triage step to verify it is genuinely maintenance rather than disguised feature work.


- **Discovery track only produces documents** — Design specs pile up without launching; mandate at least one prototype validation with users every 2 weeks.
- **Delivery track does not wait for discovery** — Doing whatever you think up; entering Delivery must have Discovery endorsement.
- **Discovery done entirely by PM** — Design and dev absent; cross-functional participation.
- **No capacity allocation** — Discovery squeezed to 0; explicit 20-30% time quota.
- **Funnel without priorities** — Many opportunities pile up; opportunity assessment + priority sorting.
- **No retrospective cadence** — Two tracks gradually drift; monthly retrospective.

## Related
- Similar: [agile-product-management-summary.md](./agile-product-management.md) (agile cadence container); [product-discovery-framework-summary.md](./product-discovery-framework.md) (Discovery methodology); [jobs-to-be-done-summary.md](./jobs-to-be-done.md) (Discovery uses JTBD to identify opportunities)
- Upstream: [../../README.md](../../README.md)
- Downstream: YiAi BRD team (dual-track structure + monthly funnel retrospective)

## References
- Marty Cagan — *Inspired* / *Empowered*
- ThoughtWorks — *Dual Track Agile* practice articles
- Jeff Gothelf — *Lean UX* (complementary with Dual-Track)
