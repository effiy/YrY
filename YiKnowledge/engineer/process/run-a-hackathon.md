---
title: Run a hackathon
aliases:
- i-want-to-run-a-hackathon
- hackathon-journey
- innovation-journey
- hackathon-entry
tags:
- journeys
- hackathon
- innovation
- competition
- prototype
- demo
category: engineer/process
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- engineer
benefit: process is repeatable
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../../tech-lead/roadmap/do-a-proof-of-concept.md
- ../strategies/prepare-a-tech-talk.md
- ../../ai-engineer/platform/evaluate-an-llm-app.md
- ../../engineer/process/iteration-pm-handbook.md
review_cycle: quarterly
tacit: false
---

# I want to run a hackathon

> **As an** engineer, **I want to** run a hackathon, **so that** process is repeatable. 

> "Theme + team formation + prototype + demo + review + landing + retrospective" reaches thinking + template + case + team within 2 hops. 

## Summary

- Thinking follows [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md)
- POC follows [i-want-to-do-a-proof-of-concept.md](../../tech-lead/roadmap/do-a-proof-of-concept.md) + [evaluation-driven-development-pattern.md](../engineering/evaluation-driven-development.md)
- Demo follows [i-want-to-prepare-a-tech-talk.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-tech-talk.md) + [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md)
- Review follows [review-meeting-template.md](../../product-manager/delivery/review-meeting.md) + [retrospective-sample.md](../../product-manager/delivery/retrospective.md)

## Core viewpoints

- **A hackathon's primary output is not the winning prototype -- it is the organizational permission to explore ideas that do not fit into the sprint backlog.** The best hackathon projects are the ones that would never survive a prioritization meeting: they are too speculative, too cross-functional, or too far from the current roadmap. The hackathon creates a temporary space where the normal ROI calculation is suspended, and the value is in the exploration, not the outcome.

- **The theme is the most important design decision of a hackathon, and it must be specific enough to focus creativity but broad enough to allow surprise.** A theme like "make the product better" produces scattered, incremental improvements. A theme like "what would our product look like if it were voice-first?" channels creativity toward a coherent exploration. The theme is a constraint that enables creativity, not a limitation that restricts it.

- **The prototype-to-production gap is where most hackathon value is destroyed, and it must be planned for before the hackathon starts.** A winning prototype that is never shipped is a morale loss, not a win. The hackathon process must include a landing phase with staged migration from prototype to production, allocated engineering time, and a sponsor who is accountable for the outcome. Without this, the hackathon trains the organization that innovation is a hobby, not a business activity.

- **Judging criteria must be transparent and multi-dimensional, because a single "best project" award optimizes for the most polished demo, not the most valuable idea.** Criteria should include innovation (is this a new approach?), feasibility (can this be built?), value (does this solve a real problem?), and landing speed (how fast can this reach users?). Multiple awards (best technical, best user impact, most audacious) create multiple paths to recognition and prevent the hackathon from converging on a single type of project.

- **The innovation flywheel only works if the organization learns from failures as much as from successes.** A hackathon where only the winners are celebrated and the other projects are forgotten teaches the organization that innovation requires winning. A hackathon where every project's retrospective is archived (what did we learn? what would we do differently?) teaches the organization that innovation is a process of experimentation, and experiments sometimes fail -- which is the point.

## Key info

- **Hackathon design parameters (6 decisions to make before announcing)**: (1) Theme — must be specific enough to focus creativity but broad enough to allow surprise; "make something cool with AI" produces a dozen indistinguishable chatbots; "Redesign onboarding assuming the user has never used a computer" channels creativity toward a specific, valuable problem; use JTBD to identify business pain points as theme candidates; (2) Duration — 24-72 hours; shorter = more focused prototypes, longer = risk of pursuing production-grade quality instead of validated concepts; (3) Team size — 3-5 people per team, cross-functional (engineering + PM + design + business); (4) Cadence — quarterly or annual; monthly exhausts the team and creates resentment among engineers who feel pressure to participate on top of sprint commitments; (5) Resources — must provide engineering support + compute + data access + sponsor announcement before the event; (6) Landing path — allocated engineering time, a sponsor, and a staged migration plan must be committed before the hackathon begins.
- **Hackathon judging framework (4 dimensions with explicit weights)**: (1) Innovation (25%) — is this a new approach or a novel combination of existing ideas? (2) Feasibility (25%) — can this be built with available resources within a reasonable timeline? (3) Value (25%) — does this solve a real problem for a defined user segment? (4) Landing speed (25%) — how fast can this reach users? Multiple awards (best technical, best user impact, most audacious) create multiple paths to recognition and prevent convergence on a single project type. Judging panel must include cross-functional judges (engineering + PM + design + business); external judges from [external-experts-roster](../../knowledge-curator/people/experts--external-experts-roster.md) add credibility.
- **Prototype-to-production landing pipeline (4 stages)**: (1) Demo — pre-recorded video + live fallback, follow [prepare-a-tech-talk](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-tech-talk.md); (2) Review — RICE scoring (innovation/feasibility/value/landing speed), review meeting with sponsor; (3) Landing — staged port methodology (prototype → MVP → production), dual-world boundary pattern (new system runs parallel to existing), allocated engineering time in the next 1-2 sprints; (4) Retrospective — every project (not just winners) archives what was learned, what would be done differently. A winning prototype that is never shipped is a morale loss, not a win — it trains the organization that innovation is a hobby.
- **Hackathon anti-pattern metrics (5 signals of a failing hackathon)**: (1) Theme divergence — projects are scattered across unrelated domains, no coherent exploration; (2) Demo-only polish — winning projects have beautiful Figma prototypes but no working code; (3) Zero landing rate — no projects from the last hackathon made it to production; (4) Engineering-only participation — PMs, designers, and business stakeholders excluded, prototypes solve problems no customer has; (5) Team exhaustion — participation is mandatory, cadence is too frequent, resentment builds. The metric is not "how many projects were demoed" but "how many projects landed in production within 2 quarters."
- **Innovation flywheel mechanics**: Hackathon → validated prototypes → landing in production → business outcomes → organizational confidence → bolder themes for next hackathon → higher-quality prototypes. The flywheel stalls when: prototypes don't land (no business outcomes), retrospectives aren't archived (no organizational learning), or themes don't evolve (repetition instead of progression). Each hackathon cycle should produce a public "Innovation Report" summarizing: what was explored, what landed, what was learned from failures, and what the next theme will be.
- **Yi-family hackathon practices (2026-08)**: No formal hackathon process. The YiAi BRD Agent launch and YiVad aiChat port followed a prototype→MVP→production pattern similar to hackathon landing, but without the competitive/exploratory framing. The hackathon framework is documented for when the team grows beyond 5 engineers and cross-functional innovation events become valuable. The POC process ([do-a-proof-of-concept.md](../../tech-lead/roadmap/do-a-proof-of-concept.md)) serves as the current lightweight alternative for exploring new ideas.

## Scenario

When running a hackathon / innovation week / internal competition / prototype day / demo day / judging + landing, TL + platform + business owner + PMO need to look up thinking + template + process + cases. This entry aggregates hackathon-related thinking + template + process into a 2-hop path, avoiding "theme divergence / prototype not landable / demo flop / subjective review / landing gap / no innovation flywheel". 

## 2-hop reachability paths

| Hop 1 (category/leaf)  | Hop 2 (specific file)  |
|---|---|
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) — theme first principles · [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) — invert imagined flop · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md) — innovation flywheel · [strong-opinions-loosely-held-summary.md](../../knowledge-curator/templates/thinking--strong-opinions-loosely-held.md) |
| `methodology/engineering-patterns/` | [evaluation-driven-development-pattern.md](../engineering/evaluation-driven-development.md) · [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md) · [staged-port-methodology-pattern.md](../architecture-design/staged-port-methodology.md) · [ssot-view-layer-pattern.md](../architecture-design/ssot-view-layer.md) |
| `methodology/pm-frameworks/` | [jobs-to-be-done-summary.md](../../product-manager/frameworks/jobs-to-be-done.md) — theme selection · [rice-ice-prioritization-summary.md](../../product-manager/frameworks/rice-ice-prioritization.md) — scoring · [product-discovery-summary.md](../../knowledge-curator/archive/strategies-legacy/product-manager/prepare-a-product-discovery-strategy.md) · [kano-model-summary.md](../../product-manager/frameworks/kano-model.md) |
| `work/processes/` | [iteration-pm-handbook-summary.md](iteration-pm-handbook.md) · [cross-team-collaboration-process.md](cross-team-collaboration.md) · [requirement-review-process.md](../../product-manager/delivery/requirement-review.md) · [design-review-process.md](../../product-manager/delivery/design-review.md) · [tech-roadmap-review-summary.md](tech-roadmap-review.md) |
| `work/meetings/` | [review-meeting-template.md](../../product-manager/delivery/review-meeting.md) — review · [weekly-meeting-template.md](../../product-manager/delivery/weekly-meeting.md) · [retrospective-sample.md](../../product-manager/delivery/retrospective.md) |
| `resources/templates/` | [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) · [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [prd-template.md](../../knowledge-curator/templates/prd.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) |
| `methodology/ai-specific/` | [agent-architecture-patterns-summary.md](../../ai-engineer/methodology/agent-architecture-patterns.md) · [rag-design-patterns-summary.md](../../ai-engineer/methodology/rag-design-patterns.md) · [prompt-engineering-guide-summary.md](../../ai-engineer/methodology/prompt-engineering-guide.md) — AI theme |
| `tech/ai-platform/` | [llm-comparison-summary.md](../../ai-engineer/platform/llm-comparison.md) · [inference-engine-comparison-summary.md](../../ai-engineer/platform/inference-engine-comparison.md) · [vector-db-comparison-summary.md](../../ai-engineer/platform/vector-db-comparison.md) · [embedding-model-selection-summary.md](../../ai-engineer/platform/embedding-model-selection.md) — AI tool stack |
| `product/strategy/` | [product-strategy-summary.md](../../knowledge-curator/archive/strategies-legacy/product-manager/prepare-a-product-strategy.md) · [now-next-later-roadmap-summary.md](../../executive/strategy/now-next-later-roadmap.md) · [second-curve-summary.md](../../executive/strategy/second-curve.md) — second curve |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics--north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics--ai-product-metrics.md) — review metrics |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../lessons/win-yiai-brd-agent-launch.md) — innovation landing · [yivad-aicr-phase-port.md](../lessons/win-yivad-aicr-phase-port.md) · [yry-vite-to-rsbuild-migration-win.md](../lessons/win-yry-vite-to-rsbuild-migration.md) |
| `lessons/failures/` | [ai-product-launch-lessons-summary.md](../lessons/failure-ai-product-launch-lessons.md) · [incident-postmortem-summary.md](../lessons/failure-incident-postmortem.md) |
| `lessons/gotchas/` | [sse-ondone-guard.md](../lessons/gotcha-sse-ondone-guard.md) · [react-jsxdev-mismatch.md](../lessons/gotcha-react-jsxdev-mismatch.md) · [vite-to-rsbuild-migration.md](../lessons/gotcha-vite-to-rsbuild-migration.md) |
| `people/team--` | [team-overview.md](../../knowledge-curator/people/team--team-overview.md) · [roster.md](../../knowledge-curator/people/team--roster.md) — team formation |
| `people/experts--` | [external-experts-roster.md](../../knowledge-curator/people/experts--external-experts-roster.md) — external judges |
| `people/stakeholders--` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders--stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders--communication-cadence.md) — sponsor |
| `industry/use-cases/` | [ai-after-sales-use-cases.md](../../product-manager/strategy) · [ai-customer-service-use-cases.md](../../product-manager/strategy) · [case-study-template.md](../../product-manager/strategy/case-study.md) — theme inspiration |
| `journeys/` | [../../tech-lead/roadmap/do-a-proof-of-concept.md](../../tech-lead/roadmap/do-a-proof-of-concept.md) · [../strategies/prepare-a-tech-talk.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-tech-talk.md) · [./run-an-experiment.md](../quality-security/run-an-experiment.md) · [../../product-manager/frameworks/launch-an-ai-product.md](../../product-manager/frameworks/launch-an-ai-product.md) |
| `lifecycle/` | [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) |

## Action recommendations

1. **First principles**: First ask "what does the hackathon solve / business pain point / innovation direction / landing path"; do not run for the sake of running; see [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md). 
2. **Inversion**: First imagine "how can it flop (theme divergence / demo flop / subjective review / landing gap / team exhaustion) " then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md). 
3. **Second-order effects**: Running once will make the team more or less tolerant of "failure"; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md). 
4. **Theme**: Must run [jobs-to-be-done-summary.md](../../product-manager/frameworks/jobs-to-be-done.md) + [product-discovery-summary.md](../../knowledge-curator/archive/strategies-legacy/product-manager/prepare-a-product-discovery-strategy.md); theme = business pain point + innovation direction; do not diverge. 
5. **Team formation**: Cross-functional (engineering + PM + design + business) ; encourage cross-team formation; follow [cross-team-collaboration-process.md](cross-team-collaboration.md). 
6. **Prototype**: Must run [i-want-to-do-a-proof-of-concept.md](../../tech-lead/roadmap/do-a-proof-of-concept.md); time-box 24-72h; do not pursue production grade. 
7. **Demo**: Must pre-record + fallback; follow [i-want-to-prepare-a-tech-talk.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-tech-talk.md). 
8. **Review**: Must run [rice-ice-prioritization-summary.md](../../product-manager/frameworks/rice-ice-prioritization.md) + [review-meeting-template.md](../../product-manager/delivery/review-meeting.md); scoring dimensions (innovation / feasibility / value / landing speed) + multiple judges. 
9. **Metrics**: Must run [north-star-metric-summary.md](../../product-manager/discovery/metrics--north-star-metric.md) + [ai-product-metrics-summary.md](../../product-manager/discovery/metrics--ai-product-metrics.md); do not just look at pretty demos. 
10. **Landing**: Winning projects must run [staged-port-methodology-pattern.md](../architecture-design/staged-port-methodology.md) + [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md); migration is mandatory from prototype to production. 
11. **Resources**: Must provide engineering support + compute + data access + sponsor announcement; follow [stakeholder-map.md](../../knowledge-curator/people/stakeholders--stakeholder-map.md). 
12. **Cadence**: Quarterly or annual; do not run monthly and exhaust the team; follow [iteration-pm-handbook-summary.md](iteration-pm-handbook.md). 
13. **AI tools**: Must provide [llm-comparison-summary.md](../../ai-engineer/platform/llm-comparison.md) + [vector-db-comparison-summary.md](../../ai-engineer/platform/vector-db-comparison.md) + [inference-engine-comparison-summary.md](../../ai-engineer/platform/inference-engine-comparison.md) as selection references. 
14. **Retrospective**: After running, must run [i-want-to-run-a-retrospective.md](./run-a-retrospective.md) + [retrospective-sample.md](../../product-manager/delivery/retrospective.md). 
15. **Flywheel**: Innovation → landing → business outcomes → bolder innovation; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md). 
16. **Archive**: Winning projects + retrospective archived under [lessons/wins/](../lessons) + [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md).

## Anti-patterns

- **Running a hackathon without a defined landing path for winning projects.** When the winning team gets a trophy and a "we'll figure out how to ship this later" promise that never materializes, the hackathon trains the organization that innovation is a performance, not a product activity. The landing path -- allocated engineering time, a sponsor, a staged migration plan -- must be committed before the hackathon begins.

- **Choosing a theme so broad that it provides no creative constraint.** "Make something cool with AI" produces a dozen chatbots that are indistinguishable from each other and from existing products. A good theme is a constraint that forces creativity: "Redesign the onboarding experience assuming the user has never used a computer before" channels creativity toward a specific, valuable problem.

- **Judging based on demo polish rather than idea quality and feasibility.** A team with a designer who builds a beautiful Figma prototype wins over a team with a working-but-ugly prototype that solves a real problem. Multi-dimensional judging criteria (innovation, feasibility, value, landing speed) with explicit weights prevents the hackathon from becoming a design competition.

- **Running hackathons so frequently that they become a distraction from core work.** Monthly hackathons exhaust the team, produce diminishing returns, and create resentment among engineers who feel pressure to participate on top of their sprint commitments. Quarterly or annual cadence is the sweet spot: frequent enough to sustain the innovation flywheel, infrequent enough to feel like a special event.

- **Allowing the hackathon to become an exclusive event for the engineering team.** When PMs, designers, and business stakeholders are excluded, the prototypes that emerge are technically impressive but solve problems that no customer has. Cross-functional teams (engineering + PM + design + business) produce prototypes that are more likely to be landable because they incorporate business context and user needs from the start. 

## Related

- Same-category journey: [../../tech-lead/roadmap/do-a-proof-of-concept.md](../../tech-lead/roadmap/do-a-proof-of-concept.md) — prototype
- Same-category journey: [../strategies/prepare-a-tech-talk.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-tech-talk.md) — demo
- Same-category journey: [./run-an-experiment.md](../quality-security/run-an-experiment.md) — experiment
- Same-category journey: [../../product-manager/frameworks/launch-an-ai-product.md](../../product-manager/frameworks/launch-an-ai-product.md) — landing
- Upstream: [../../README.md](../../README.md) — processes leaf entry
