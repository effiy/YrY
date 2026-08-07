---

title: YiPet Collaboration Diagnosis 2026-08
lifecycle: active
status: stable
key: tl_org-diagnose_yipet_collab_2026_08
tags:
- org-diagnose
- yipet
- collaboration
team: YiPet extension team
dimension: collab
maturity_level: l2
type: summary
category: executive/roadmap
roles:
- executive
- tech-lead
benefit: roadmap informed
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
review_cycle: quarterly
created: 2026-08-01
updated: 2026-08-07
last_verified: 2026-08-07
tacit: false
related:
  - ./dashboard-strategic-roadmap.md
  - ../README.md
  - ../INDEX.md
---

# Org Diagnose — YiPet extension team / Collaboration — 2026-08

> **As an** executive, **I want to** tl_org diagnose_yipet_collab_2026_08, **so that** roadmap informed. 

## Summary

- YiPet extension team's collaboration maturity is assessed at L2 (Managed/Repeatable) with a cross-project PR ratio of ~30% against a goal of >50%
- The primary gap is contract SSOT drift: API contracts are documented in three places (CLAUDE.md, YiKnowledge, code comments) that diverge silently, causing cross-project integration failures like the fileService 422 incident
- Cross-project review is ad hoc rather than mandatory for interface-boundary PRs, meaning integration failures are caught in production rather than in review
- Lessons/wins accumulation exists but lacks automated cross-referencing, making organizational knowledge unfindable despite being documented
- Three improvement recommendations with dated owners: consolidate API contracts to OpenAPI SSOT, mandate cross-project review for interface-boundary PRs, and automate `related` field linting

## Assessment Context

- **Team: ** YiPet extension team
- **Dimension: ** Collaboration
- **Current maturity: ** L2 — Managed / Repeatable

## Observations

- Collaboration pattern with YiVad established: aicr port uses YiVad baseline + parity test. 
- Collaboration with YiAi: RPC envelope contract aligned. 
- Weakness: cross-project contract documentation is scattered (CLAUDE.md / YiKnowledge / code comments in three places), prone to drift. 
- Highlight: lessons/wins cross-project accumulation (yipet-stack-migration-win, yivad-aicr-phase-port-win, etc.). 

## Gap Analysis

| Capability | Current State | Desired State | Gap |
|------------|---------------|---------------|-----|
| Contract SSOT | Scattered | OpenAPI / schema in one place | 1 |
| Cross-project review | Ad hoc | Every PR has cross-project reviewer | 1 |
| Shared lessons index | Partial | Automated index | 0.5 |

## Improvement Recommendations

1. **Contract SSOT** — YiAi Pydantic schema export OpenAPI, frontend auto-generates types (see postmortem fileService 422 action 3). 
2. **Cross-project review SLA** — Every PR has at least one cross-project reviewer. 
3. **Lessons index** — YiKnowledge already built; need to add automatic lint related. 

## Core viewpoints

- **Contract SSOT drift is a collaboration tax that compounds with every cross-project integration.** When the API contract is documented in three places (CLAUDE.md, YiKnowledge, code comments), every change requires updating three sources. Inevitably, one source falls behind, and the next integration fails with a 422 error that takes hours to diagnose. The fix is not better discipline — it is eliminating the copies and establishing a single source of truth.

- **Cross-project review is not a nice-to-have — it is the only way to catch integration failures before they reach production.** When every PR is reviewed only by teammates on the same project, no one catches the RPC parameter mismatch that will break the other project's integration. A cross-project reviewer sees the change from the consumer's perspective, catching contract violations that are invisible to the producer.

- **Maturity model assessments are only useful when they produce dated action items.** "L2 — Managed" is a label, not a plan. The value of the maturity assessment is the gap analysis table that follows: what is the current state, what is the desired state, and what specific actions close the gap. Without a dated improvement recommendation, the maturity label is organizational theater.

- **Lessons/wins accumulation is an organizational learning mechanism that requires deliberate maintenance.** The win/loss entries in YiKnowledge are valuable only if they are indexed, searchable, and cross-referenced. Automated linting of the `related` field ensures that when someone reads about a fileService 422 error, they also find the postmortem and the contract SSOT recommendation. Without automated cross-referencing, the lessons exist but are unfindable.

- **Collaboration maturity is measured by the speed of cross-project diagnosis, not by the absence of conflicts.** A mature collaboration does not mean zero incidents — it means that when a cross-project incident occurs (e.g., an RPC contract mismatch), the diagnosis takes minutes rather than hours because the contract is in one place, the reviewer knows both codebases, and the lessons index points directly to the relevant postmortem.

## Action recommendations

1. **Consolidate API contracts into a single source of truth (OpenAPI schema exported from YiAi Pydantic models) and auto-generate frontend types from it.** The current contract is scattered across CLAUDE.md, YiKnowledge, and code comments -- three sources that diverge silently. The SSOT pattern eliminates the copies and makes contract drift a CI-detectable error rather than a runtime 422.

2. **Make cross-project review mandatory for every PR that touches an interface boundary (API surface, data format, RPC parameters).** The author is the worst person to judge whether a change is cross-project-impacting. A cross-project reviewer sees the change from the consumer's perspective, catching contract violations that are invisible to the producer. Target >50% cross-project PR ratio.

3. **Convert every maturity assessment gap into a dated action item with a single owner and success criteria.** "L2 -- Managed" is a label, not a plan. The output of an org diagnosis should be a list of recommendations with owners, due dates, and success criteria -- the same rigor expected of a postmortem action item. Without this, the maturity assessment is organizational theater.

4. **Automate cross-referencing of the `related` field in YiKnowledge lessons to ensure findability.** Lessons/wins files exist but are valuable only if they are indexed, searchable, and cross-referenced. Automated linting of the `related` field ensures that when someone reads about a fileService 422 error, they also find the postmortem and the contract SSOT recommendation.

5. **Measure collaboration maturity by diagnosis speed, not by the absence of conflicts.** A mature collaboration does not mean zero incidents -- it means that when a cross-project incident occurs (e.g., an RPC contract mismatch), the diagnosis takes minutes rather than hours because the contract is in one place, the reviewer knows both codebases, and the lessons index points directly to the relevant postmortem.

## Anti-patterns

- **Scattering contract documentation across multiple sources without a synchronization mechanism.** CLAUDE.md, YiKnowledge, and code comments each describe the same API contract, but they diverge silently. The fix is to designate one source as the SSOT and reference it from the others, not to copy the content.

- **Treating cross-project review as optional when the PR "only affects our project."** Every PR that changes an API surface, a data format, or an RPC parameter affects the other projects that consume it. The author is the worst person to judge whether a change is cross-project-impacting — the cross-project reviewer should be mandatory for every PR that touches an interface boundary.

- **Performing maturity assessments without producing dated, owned action items.** An assessment that produces a maturity level label but no improvement plan is a waste of time. The output of an org diagnosis should be a list of recommendations with owners, due dates, and success criteria — the same rigor expected of a postmortem action item.

- **Assuming that because lessons/wins files exist, organizational learning is happening.** Files in a directory are not learning — retrieval and application are learning. If engineers are not reading the relevant lessons before starting related work, the lessons are dead storage. Automated cross-referencing and "related reading" suggestions in PR templates are the mechanism that turns storage into learning.

- **Delaying contract SSOT consolidation because "it's not urgent."** Every sprint that passes without a single source of truth for API contracts is a sprint in which another cross-project integration will fail with a 422 error. The cost of consolidation is a one-time engineering investment; the cost of drift is paid in every future incident.

## Related Metrics

- Cross-project PR ratio: ~30% (goal >50%) 
- Contract drift incident: 1 (fileService 422, fixed) 
