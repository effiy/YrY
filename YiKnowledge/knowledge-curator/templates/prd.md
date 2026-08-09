---
title: PRD (Product Requirements Document) template
lifecycle: active
status: stable
tags:
- template
- PRD
- product-requirements
- documentation
category: knowledge-curator/templates
created: 2024-01-15
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
roles:
- knowledge-curator
- engineer
- product-manager
- tech-lead
- ai-engineer
- new-hire
benefit: template reusable
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
review_cycle: quarterly
tacit: false
related:
  - ./INDEX-resources.md
  - ./README-resources.md
  - ./README-templates.md
  - ../README.md
  - ../INDEX.md
---

# PRD template

> **As a** knowledge curator, **I want to** prd, **so that** template reusable. 

> Usage: PRD succeeds BRD, clarifies "what to do, how to do". This template covers functional, non-functional, data, API, instrumentation, gradual rollout. Copy this file to `resources/templates/{requirement-name}-prd.md`. 

## Summary

- A PRD is a contract between product, engineering, and design — every section answers a specific question from a specific stakeholder, and skipping a section creates ambiguity that will be resolved by the loudest voice rather than deliberate decision
- Non-goals are the most underrated section: scope creep happens not because people are undisciplined but because the boundary between "in scope" and "out of scope" was never drawn
- The data instrumentation section separates a PRD from a speculative document — without it, the team cannot answer "did this feature work?" after launch
- Gradual rollout (5% → 20% → 50% → 100%) is a risk management strategy, not a deployment strategy — each stage needs a defined judgment metric and rollback condition
- The PRD template is a thinking tool that surfaces unexamined assumptions, not a form to complete — writing "N/A" or "no risks" means the author has not thought through that dimension

## 1. Document information

| Field | Content |
|------|------|
| Document version | v1.0 |
| Author |  (e.g. Zhang San)  |
| Created |  (e.g. 2026-07-30)  |
| Last updated |  (e.g. 2026-07-30)  |
| Status | Draft / In review / Confirmed / Archived |
| Related BRD |  (e.g. BRD-2026-007)  |
| Related Story |  (e.g. story_1700000000000)  |
| Reviewers | Product / Design / Engineering / QA / Legal |

## 2. Background and goals

### 2.1 Background
 (Why do this requirement? Explain from user pain, business opportunity, technology driver) 

### 2.2 Goals
 (Expected business/user goals, quantified as much as possible) 
- Business goal: ______
- User goal: ______
- North-star metric change: ______ → ______

### 2.3 Non-goals (Out of Scope) 
 (Clarify what is not in scope this round, avoid scope creep) 

## 3. Users and scenarios

### 3.1 Target users
-  (e.g. After-sales business stakeholders, the NSC business owner who writes BRDs every day) 

### 3.2 User stories
- As (user role), I want (feature), so that (value) 

### 3.3 Core scenarios
| Scenario | Trigger | Expected result |
|------|---------|---------|
| Scenario 1 | | |
| Scenario 2 | | |

## 4. Functional requirements

| No. | Feature | Priority | Description | Acceptance criteria |
|------|------|--------|------|---------|
| F1 | | P0 | | |
| F2 | | P1 | | |
| F3 | | P2 | | |

 (Priority: P0 must / P1 important / P2 optional) 

## 5. Non-functional requirements

- **Performance**: First screen < ___ms; P95 latency < ___ms; concurrency ___ QPS
- **Availability**: SLA ___% (e.g. 99.9%) 
- **Security**: Auth, data encryption, PII handling
- **Compliance**: GDPR / Personal Information Protection Law / industry compliance
- **Compatibility**: Browsers / mobile / OS versions
- **Observability**: Logs, monitoring, alerts, tracing
- **Internationalization**: Supported language list

## 6. Data model

### 6.1 Core entities
| Entity | Field | Type | Index | Description |
|------|------|------|------|------|
| | | | | |

### 6.2 Data flow
 (Input source → processing → output destination) 

## 7. Interface design (API) 

| Interface | Method | Path | Request params | Response params | Auth |
|------|------|------|------|------|------|
| | | | | | |

## 8. Acceptance criteria

- [ ] Acceptance condition 1 (functional) 
- [ ] Acceptance condition 2 (performance) 
- [ ] Acceptance condition 3 (compatibility) 
- [ ] Acceptance condition 4 (security) 

## 9. Data instrumentation

| Event | Trigger timing | Parameters | Purpose |
|------|---------|------|------|
| | | | |

## 10. Gradual rollout and release

- Rollout strategy:  (e.g. 5% → 20% → 50% → 100%) 
- Rollout judgment metrics: ______
- Rollback conditions: ______
- Emergency circuit breaker: ______

## 11. Risks and dependencies

| Risk / Dependency | Impact | Mitigation | Owner |
|------------|------|---------|--------|
| | | | |

## 12. Milestones

| Milestone | Date | Owner | Status |
|--------|------|--------|------|
| Design finalized | | | |
| Development complete | | | |
| Integration complete | | | |
| QA passed | | | |
| Gradual rollout | | | |
| Full release | | | |

## Core viewpoints

- **A PRD is not a feature wishlist — it is a contract between product, engineering, and design.** Every section of the PRD exists to answer a specific question from a specific stakeholder. Engineering needs the data model and API design to estimate effort. Design needs the user scenarios to create mockups. QA needs the acceptance criteria to write test cases. legal needs the data instrumentation plan to review compliance. A PRD that skips a section is a contract with a missing clause, and the ambiguity will be resolved by the loudest voice in the room rather than by deliberate decision.

- **Non-goals are the most underrated section of a PRD.** Scope creep happens not because people are undisciplined, but because the boundary between "in scope" and "out of scope" was never drawn. The non-goals section is the fence that protects the team from well-intentioned additions during development. Every non-goal should be specific enough that when someone proposes adding it, the team can point to the PRD and say "that was explicitly excluded."

- **Gradual rollout is not a deployment strategy — it is a risk management strategy.** The 5% → 20% → 50% → 100% progression exists to limit the blast radius of a bad release. Each stage must have a defined judgment metric and a rollback condition. Without these, gradual rollout is just a slower way to deploy a broken feature to all users.

- **The data instrumentation section is what separates a PRD from a speculative document.** Without instrumentation, the team cannot answer "did this feature work?" after launch. The instrumentation plan defines what success looks like in measurable terms: which events fire, which metrics move, and which user behaviors change. A PRD without instrumentation is a bet placed without keeping score.

- **The PRD template is a thinking tool, not a paperwork requirement.** The value of filling out the template is not the document itself — it is the act of forcing the author to think through each section. The author who writes "N/A" in the data model section has not thought about data. The author who writes "no risks" in the risks section has not thought about what could go wrong. The template's job is to surface unexamined assumptions.

## Action recommendations

1. **Actively look for gaps in the BRD during the PRD writing process and escalate them, rather than papering over them.** The PRD's job is to translate business requirements into engineering specifications. A user story with no technical feasibility, a goal with no measurable metric, or a scenario that contradicts the data model should be flagged and escalated to the BRD author, not silently accepted.

2. **Make every non-functional requirement specific and testable: specify the workload, measurement method, and consequence of failure.** "Performance: < 200ms" is a guess. "P95 latency < 200ms under 100 concurrent users as measured by the API gateway; page blocks release if missed" is a requirement. Every NFR should be specific enough that a QA engineer can write an automated test without asking for clarification.

3. **Implement the data instrumentation plan before the feature reaches users, not after launch.** Instrumentation added after launch cannot establish a baseline, compare before/after, or detect the moment the feature started degrading. The instrumentation plan must be in place before the gradual rollout begins, or the launch is unmeasurable.

4. **Define explicit judgment metrics and rollback conditions for each stage of the gradual rollout (5% -> 20% -> 50% -> 100%).** Without these, gradual rollout is just a slower way to deploy a broken feature to all users. Each stage needs a metric threshold (e.g., "error rate < 0.1%") and a rollback trigger (e.g., "P95 latency > 500ms for 5 minutes").

5. **Treat the PRD template as a set of questions to answer, not a form to complete.** The value is not the document itself -- it is the act of forcing the author to think through each section. Writing "N/A" in the data model section means the author has not thought about data. Writing "no risks" means the author has not thought about what could go wrong. The template's job is to surface unexamined assumptions.

## Anti-patterns

- **Writing a PRD that validates the BRD rather than challenging it.** The PRD's job is to translate business requirements into engineering specifications. In the process, gaps in the BRD become visible: a user story that has no technical feasibility, a goal that has no measurable metric, a scenario that contradicts the data model. The PRD author should actively look for these gaps and escalate them, not paper over them.

- **Treating the non-functional requirements section as boilerplate.** "Performance: < 200ms" is not a requirement — it is a guess. A real performance requirement specifies the workload (concurrent users, data volume), the measurement method (P95 latency at the API gateway), and the consequence of missing it (page blocks release, rollback triggers). Without these specifics, the performance section is decorative.

- **Deferring the data instrumentation section to "after launch."** Instrumentation that is added after launch can only measure behavior after launch — it cannot establish a baseline, compare before/after, or detect the moment the feature started degrading. The instrumentation plan must be implemented before the feature reaches users, or the launch is unmeasurable.

- **Using the PRD template as a fill-in-the-blanks exercise without understanding the reasoning behind each section.** The PRD template is not a form to complete — it is a set of questions to answer. A PRD with every section filled but no substantive content in any of them is worse than no PRD, because it creates the illusion of planning.

- **Writing acceptance criteria that are vague or untestable.** "The feature should be fast" is not an acceptance criterion. "P95 latency < 200ms under 100 concurrent users as measured by the API gateway" is testable. Every acceptance criterion should be specific enough that a QA engineer can write an automated test for it without asking the PM for clarification.

## Related

- [./README-templates.md](./README-templates.md) — Templates directory overview with usage guidelines
- [./brd.md](./brd.md) — BRD template, the upstream document that feeds into PRD
- [../../product-manager/discovery/prd--](../../product-manager/discovery/prd--) — PRD examples and case studies
- [../../product-manager/frameworks/](../../product-manager/frameworks/) — Product management frameworks for prioritization and scoping
