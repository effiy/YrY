---
title: Design an architecture decision
aliases:
- I want to do Architecture Decision
- Architecture Decision entry
- adr-journey
tags:
- journeys
- architecture
- adr
- decision
- methodology
category: tech-lead/architecture
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
benefit: decision is documented and reversible
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../../engineer/projects/INDEX.md
- ../../README.md
- ../../knowledge-curator/templates/thinking--README.md
- ../../knowledge-curator/templates/adr.md
review_cycle: quarterly
tacit: false
---

# I want to design an architecture decision

> **As a** tech lead, **I want to** design architecture decision, **so that** decision is documented and reversible.

> "This decision needs an ADR / how to write / which related items" reach within 2 hops ADR Template, 12-section structure, 9 patterns, 3 project ADRs, cross-project coupling relationships.

## Summary

- Before deciding, first check `methodology/thinking/` (inversion / second-order / Occam's razor / SOLH) + `methodology/engineering-patterns/` (9 already-landed patterns)
- Write ADR following `resources/templates/adr-summary.md` 12-section structure (basic info / background / Decision / alternatives / assessment / risk / rollback / implementation plan / metrics / reusable properties / coupling / references)
- Land the decision by establishing an instance implementation ADR track rollout (like [LLM rollout](../../tech-lead/decisions/yiai--llm-multi-provider-rollout.md) / [Vitest rollout](../../tech-lead/decisions/yivad--vitest-rollout.md) / [aicr port rollout](../../tech-lead/decisions/yipet--aicr-port-rollout.md))
- Cross-project decisions follow [shared-client-design](../../engineer/engineering/shared-client-design.md) + [vendor rollout](../../engineer/engineering/shared-client-vendor-rollout.md)

## Core viewpoints

**An ADR is not about the decision -- it is about the decision context.** The most valuable part of an ADR is not the chosen option but the documentation of what was considered, what constraints were in play, and why alternatives were rejected. Future readers need the context to know whether the decision still holds, not just what was decided.

**Decisions are reversible until they are not.** Most architecture decisions are two-way doors -- they can be changed later with manageable cost. The ADR should explicitly state whether the decision is a one-way or two-way door, and if two-way, what the reversal trigger and cost would be. Treating every decision as irreversible leads to analysis paralysis.

**The best ADR is the one that prevents a future re-derivation.** If someone reads the ADR two years later and can immediately understand why the decision was made and whether the context has changed, the ADR succeeded. If they have to re-derive the rationale from scratch, the ADR failed.

**Patterns over principles.** When writing an ADR, reference concrete engineering patterns that have been proven in this codebase rather than abstract principles. "We chose the RPC envelope pattern because it solved the same serialization problem in YiAi" is more actionable than "we value separation of concerns."

**ADR status is a lifecycle, not a label.** Proposed, Accepted, Deprecated, Superseded are stages in a decision's life. An ADR that stays "Accepted" forever without re-validation is a liability. Quarterly re-audit of ADRs whose `last_verified` exceeds six months is a minimum hygiene practice.

## Key info

- **ADR 12-section structure**: (1) Basic info (title, status, date, author, stakeholders), (2) Background (context, problem statement, constraints), (3) Decision (what we decided, in one sentence), (4) Alternatives (each option with pros/cons and why rejected), (5) Assessment (how we evaluated, criteria used), (6) Risk (what could go wrong, mitigation), (7) Rollback (how to reverse, cost, trigger), (8) Implementation plan (phases, owners, timeline), (9) Metrics (how to measure success), (10) Reusable properties (what other teams can learn), (11) Coupling (what other decisions depend on this), (12) References (related ADRs, code, documents). The most frequently skipped section: Rollback (section 7). Without a rollback plan, the decision is treated as irreversible by default.
- **One-way vs two-way door**: One-way door (irreversible or very expensive to reverse): choosing a programming language, choosing a primary database, choosing a cloud provider. Two-way door (reversible with manageable cost): choosing a library within the same category, choosing a monitoring tool, choosing a CI configuration. The decision-making process should be calibrated to the door type: one-way doors require deeper analysis, more stakeholders, and a formal review; two-way doors can be made by the team that will own the implementation. The most common anti-pattern: treating two-way doors as one-way and spending weeks in analysis.
- **Yi-family ADR inventory**: YiAi (9 ADRs: pytest introduction, knowledge watcher deployment, RAG evaluation infra, LLM multi-provider rollout, route LLM traffic, RAG evaluation, knowledge watcher, knowledge leaf integration, LLM provider integration), YiVad (6 ADRs: Vitest introduction, aicr phase port, knowledge leaf integration, RAG evaluation infra, Vitest rollout, Vitest component testing), YiPet (1 ADR: Biome lint/format). The ADR pattern is consistent across projects: decision + alternatives + rollback + implementation plan. The gap: no ADR for the RPC envelope contract (the most important architectural decision in the Yi family), no ADR for the dual-world boundary (the most important constraint in YiPet).
- **ADR review cadence**: quarterly re-audit of all ADRs with `last_verified > 6 months`. The audit checks: (1) is the decision still in effect? (2) has the context changed (new tools, new constraints, team changes)? (3) are the metrics being tracked? (4) has the rollback plan been tested? ADRs that fail the audit are updated or marked as Superseded. An ADR that is Superseded must reference the ADR that supersedes it, creating a decision lineage.
- **Decision quality metric**: the number of times a decision is re-litigated without new information. A decision that is re-discussed 3 times in the same quarter without new data is a sign that the ADR did not capture the rationale well enough, or that the decision was made without proper stakeholder buy-in. The metric should be tracked per ADR and reviewed during the quarterly audit.

## Scenario description

When new requirements arrive / tech selection / refactor direction / introducing new dependencies, the architect + main owner need to make decisions and document them. This entry aggregates the ADR Template, decision methodology, already-landed ADRs, implementation-track ADRs, and cross-project coupling relationships to a 2-hop path, avoiding "decisions by intuition + no documentation + no way to trace afterward".

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `resources/templates/` | [adr-summary.md](../../knowledge-curator/templates/adr.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [tech-selection-evaluation-summary.md](../../knowledge-curator/templates/tech-selection-evaluation.md) · [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) · [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) · [strong-opinions-loosely-held-summary.md](../../knowledge-curator/templates/thinking--strong-opinions-loosely-held.md) |
| `methodology/engineering-patterns/` | [rpc-envelope-pattern.md](../../engineer/architecture-design/rpc-envelope.md) · [sse-streaming-pattern.md](../../engineer/architecture-design/sse-streaming.md) · [supply-chain-hardening-pattern.md](../../engineer/process/harden-supply-chain.md) · [evaluation-driven-development-pattern.md](../../engineer/engineering/evaluation-driven-development.md) · [one-to-one-mapping-migration-pattern.md](../../engineer/architecture-design/one-to-one-mapping-migration.md) · [staged-port-methodology-pattern.md](../../engineer/architecture-design/staged-port-methodology.md) |
| `projects/YiAi/` | [adr-multi-provider-llm-routing.md](../../tech-lead/decisions/yiai--route-llm-traffic-across-providers.md) · [adr-llm-multi-provider-rollout.md](../../tech-lead/decisions/yiai--llm-multi-provider-rollout.md) · [adr-pytest-introduction.md](../../tech-lead/decisions/yiai--pytest-introduction.md) · [adr-rag-evaluation-infra.md](../../tech-lead/decisions/yiai--rag-evaluation-infra.md) · [adr-brd-agent-launch.md](../../tech-lead/decisions/yiai--brd-agent-launch.md) · [adr-knowledge-watcher-deployment.md](../../tech-lead/decisions/yiai--knowledge-watcher-deployment.md) |
| `projects/YiVad/` | [adr-vitest-introduction.md](../../tech-lead/decisions/yivad--vitest-introduction.md) · [adr-vitest-rollout.md](../../tech-lead/decisions/yivad--vitest-rollout.md) · [adr-aicr-phase-port.md](../../tech-lead/decisions/yivad--aicr-phase-port.md) |
| `projects/YiPet/` | [adr-biome-lint-format.md](../../tech-lead/decisions/yipet--biome-lint-format.md) · [adr-chrome-manifest-dual-world-boundary.md](../../tech-lead/decisions/yipet--chrome-manifest-dual-world-boundary.md) · [adr-aicr-port-rollout.md](../../tech-lead/decisions/yipet--aicr-port-rollout.md) |
| `work/processes/` | [shared-client-design-summary.md](../../engineer/engineering/shared-client-design.md) · [shared-client-vendor-rollout.md](../../engineer/engineering/shared-client-vendor-rollout.md) |
| `projects/INDEX.md` | [INDEX.md](../../engineer/projects/INDEX.md) — all ADR overview + coupling relationships |

## Action recommendations

1. Before deciding, first check `methodology/thinking/` (inversion / second-order / Occam's razor) to do alternatives assessment
2. Check `methodology/engineering-patterns/` whether there are already reusable patterns (avoid re-inventing)
3. Write decision ADR following `resources/templates/adr-summary.md` 12-section structure, state `Proposed` → `Accepted`
4. Land decision by establishing instance implementation ADR track rollout (state `InProgress` → `Implemented`), each stage has an independent gate
5. Cross-project decisions must run `work/processes/shared-client-design-summary.md` + 12-section §11 coupling relationship column fully
6. Quarterly re-audit: scan ADRs where `last_verified` exceeds half a year, validate whether decisions still hold

## Anti-patterns

- **Deciding by intuition without written rationale.** Making architecture decisions based on gut feel or seniority without documenting the alternatives considered, constraints, and trade-offs. Undocumented decisions get re-litigated every time context changes or a new senior engineer joins.

- **Writing the ADR after implementation.** Using the ADR as a post-hoc justification for a decision already made and implemented. The ADR should be written before implementation, while alternatives are still genuinely being evaluated. A post-hoc ADR is a rationalization, not a decision record.

- **Treating every decision as a one-way door.** Applying the same heavyweight process to a reversible library choice as to an irreversible data model decision. The ADR process should scale with the reversibility and impact of the decision. Two-way doors need lighter documentation.

- **Never deprecating or superseding old ADRs.** Letting ADRs accumulate without ever marking them as Deprecated or Superseded. An ADR graveyard of outdated decisions is worse than no ADRs at all because it actively misleads new team members.

- **ADR as a solo exercise.** Writing the ADR in isolation without soliciting input from affected teams, downstream consumers, or operators. The ADR process is a collaboration and alignment tool, not just a documentation format. A decision without buy-in from affected parties is a decision that will be undermined.

## Related

- Related journey: [../../engineer/infrastructure/roll-out-a-migration.md](../../engineer/infrastructure/roll-out-a-migration.md) — implement ADR landing
- Related journey: [../../engineer/process/check-engineering-gotchas.md](../../engineer/process/check-engineering-gotchas.md) — decision anti-pattern checklist
- Upstream: [../../knowledge-curator/diagrams/directory-blueprint.md](../../knowledge-curator/diagrams/directory-blueprint.md) — directory structure diagram
- Downstream: [../../knowledge-curator/governance/tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) — tacit decision documentation backlog
