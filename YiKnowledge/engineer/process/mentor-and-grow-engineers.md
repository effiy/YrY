---
title: Mentor and grow engineers
aliases:
- I want to mentor and grow engineers
- mentor-journey
- 1on1 entry
- growth path entry
tags:
- journeys
- mentor
- 1on1
- growth
- performance-review
- tacit-knowledge
category: engineer/process
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles:
- engineer
benefit: kb stays curated
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../../new-hire/onboarding/onboard-as-a-new-engineer.md
- ../strategies/run-iteration-meetings.md
- ../../knowledge-curator/templates/one-on-one.md
- ../../knowledge-curator/governance/tacit-knowledge-backlog.md
review_cycle: quarterly
tacit: false
---

# I want to mentor and grow engineers

> **As an** engineer, **I want to** mentor and grow engineers, **so that** kb stays curated.

> "How to lead new hires + how to run 1on1 + how to plan growth paths + how to sediment tacit knowledge" reaches the 1on1 template + growth path + tacit-knowledge + thinking frameworks within 2 hops.

## Summary

- 1on1 follows [one-on-one-template.md](../../knowledge-curator/templates/one-on-one.md): quarterly growth tracking + two-way feedback
- New hire onboarding follows [i-want-to-onboard-as-a-new-engineer](../../new-hire/onboarding/onboard-as-a-new-engineer.md): Day-1 / first week / first month
- tacit knowledge sediment follows [tacit-knowledge-backlog](../../knowledge-curator/governance/tacit-knowledge-backlog.md): make predecessors' experience explicit
- growth path follows [first-principles](../../knowledge-curator/templates/thinking--first-principles.md) + [flywheel-effect](../../knowledge-curator/templates/thinking--flywheel-effect.md): set up skeleton first then fill details + flywheel effect

## Core viewpoints

- **1on1s are not status updates — they are growth conversations** — The most common failure mode is turning 1on1s into a second weekly report. The 1on1 is the only meeting where the conversation is about the engineer's growth, not the project's progress. The agenda should be: what are you learning, what are you struggling with, what do you want to do next? Status updates belong in the weekly report.

- **Tacit knowledge is the most expensive form of knowledge to lose** — When a senior engineer leaves, the knowledge that leaves with them is not the code (which is documented in comments and tests) but the unwritten rules: "don't deploy on Fridays," "this module is fragile because of X," "the reason we chose Y over Z was..." The tacit-knowledge backlog is the mechanism that captures this knowledge before it walks out the door.

- **Growth paths must be skeleton-first, then fill details** — A growth path that lists 20 skills to learn is overwhelming and unactionable. The skeleton (3-5 key areas) gives the engineer a framework to organize their learning. The details (specific skills, projects, and timelines) fill in the skeleton over time. Without the skeleton, the details are a list; with the skeleton, the details are a plan.

- **The flywheel effect in mentoring is: teach once, benefit forever** — A mentor who teaches a junior engineer how to write a good ADR has created a capability that the junior will use for the rest of their career. The mentor's investment compounds: the junior writes better ADRs, the team benefits from better decisions, and the junior eventually teaches the next hire. The 1-hour investment in teaching creates a lifetime of returns.

- **New hire onboarding is the single highest-leverage mentoring activity** — A new hire who can run the project locally on Day 1 and submit a PR within the first week is productive within a month. A new hire who spends the first week setting up their environment is frustrated and demoralized. The onboarding documentation (CLAUDE.md, README.md, dev-standards.md) is the mentor's leverage: write it once, onboard every new hire.

## Key info

- **1on1 template structure (5 segments)**: (1) Check-in (5 min) — how are you feeling, any personal updates affecting work; (2) Growth review (15 min) — progress against quarterly goals, skills developed, skills to develop next; (3) Project health (10 min) — what's going well, what's frustrating, what needs to change; (4) Two-way feedback (10 min) — mentor to mentee (specific, actionable, forward-looking) AND mentee to mentor (what can the mentor do differently); (5) Action items (5 min) — what will each person do before the next 1on1. The 1on1 should be 45 minutes, weekly for new hires (first 3 months), biweekly thereafter. The Yi-family projects currently have no formal 1on1 cadence.
- **Growth path stages and timelines**: (1) Backbone engineer (0-2 years) — can independently own a requirement, write clean code, participate in code review; (2) Senior engineer (2-5 years) — can design a feature end-to-end, mentor juniors, write ADRs; (3) Architect (5-8 years) — can design cross-project systems, set technical direction, lead design reviews; (4) Tech lead (8+ years) — can manage a team's technical output, align with product strategy, represent engineering to stakeholders. Each stage requires demonstrated capability in the previous stage's responsibilities, not just time served.
- **Tacit knowledge capture rate**: The goal is one tacit-knowledge entry per senior engineer per quarter. Tacit knowledge includes: (1) unwritten rules ("don't deploy on Fridays because the CI queue is 3x slower"), (2) historical context ("we chose MongoDB over PostgreSQL because of X limitation in 2024"), (3) fragile areas ("the YiVad aiChat SSE parser is sensitive to frame ordering"), (4) workarounds ("the macOS FSEvents bug means we use polling for file watching"). The tacit-knowledge backlog is the mechanism that captures this before it walks out the door. The Yi-family projects currently have 4 tacit-knowledge entries in the backlog.
- **Mentoring time allocation rule of thumb**: For a tech lead mentoring 3-5 engineers: 20% of weekly time on 1on1s (45 min × 5 engineers = ~4 hours), 10% on code review and PR mentoring (teaching through review comments, not just approving), 10% on documentation and onboarding material maintenance (keeping CLAUDE.md and dev-standards.md current), 5% on growth path planning (quarterly goals, promotion packets). Total: ~45% of a tech lead's time should be on people development; the remaining 55% is on technical leadership (architecture, design review, incident response).
- **Mentoring anti-pattern detection**: (1) 1on1 has become a status update — the mentee only discusses project progress, never growth topics; fix: ban project status from 1on1, redirect to weekly report. (2) Mentee has stopped asking questions — either the mentee has plateaued (no growth) or feels unsafe asking; fix: ask "what's the dumbest question you have right now?" (3) Mentee's PRs are always approved without comments — the mentor is rubber-stamping, not teaching; fix: require at least one substantive comment per PR review. (4) Mentee's growth path hasn't been updated in 6 months — the path is a document, not a living plan; fix: review and update growth path at every quarterly 1on1.
- **Predecessor experience as mentoring material**: Every mentoring session should reference at least one archived lesson from `lessons/wins/`, `lessons/gotchas/`, or `lessons/failures/`. The mentor is the conduit, not the source. Example: when mentoring on SSE implementation, reference `gotcha-sse-ondone-guard.md` (the `done: true` guard bug); when mentoring on supply chain, reference `gotcha-no-lockfile-supply-chain-risk.md`. The Yi-family knowledge base contains 40+ archived lessons that are directly usable as mentoring material.

## Scenario

When leading new hires / cultivating backbone / quarterly performance / 1on1 / transfer / promotion, mentor + tech lead need to plan growth paths + run 1on1 + sediment tacit knowledge. This entry aggregates 1on1 template, new-hire onboarding, tacit-knowledge backlog, and thinking frameworks into a 2-hop path, avoiding "leading by gut / 1on1 running account / tacit knowledge gap".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `resources/templates/` | [one-on-one-template.md](../../knowledge-curator/templates/one-on-one.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) |
| `journeys/` | [../../new-hire/onboarding/onboard-as-a-new-engineer.md](../../new-hire/onboarding/onboard-as-a-new-engineer.md) — new-hire perspective (mentor perspective mirror) · [../../new-hire/onboarding/handoff-project.md](../../new-hire/onboarding/handoff-project.md) — handoff perspective |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md) · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) · [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) |
| `methodology/engineering-patterns/` | [staged-port-methodology-pattern.md](../architecture-design/staged-port-methodology.md) · [evaluation-driven-development-pattern.md](../engineering/evaluation-driven-development.md) — engineering patterns mentoring |
| `lifecycle/` | [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) · [user-journey.md](../../knowledge-curator/diagrams/user-journey.md) · [governance.md](../../knowledge-curator/governance/governance.md) — tacit knowledge sediment cadence |
| `work/meetings/` | [weekly-report-sample.md](../../product-manager/delivery/weekly-report.md) · [daily-report-sample.md](../../product-manager/delivery/daily-report.md) · [retrospective-sample.md](../../product-manager/delivery/retrospective.md) — weekly/daily/retrospective mentoring |
| `lessons/` | [wins/README.md](../lessons/README.md) · [gotchas/README.md](../lessons/README.md) · [failures/README.md](../lessons/README.md) — predecessor experience reference |
| `work/tools/` | [claude-code-tips-summary.md](../engineering/claude-code-tips.md) — AI tool mentoring |
| `projects/` | each project `onboarding.md` + `project-management-summary.md` — project mentoring material |

## Action recommendations

1. **Quarterly 1on1**: follow [one-on-one-template](../../knowledge-curator/templates/one-on-one.md), two-way feedback (mentor -> mentee + mentee -> mentor), not a running account.
2. **New hire Day-1 / first week / first month**: follow [i-want-to-onboard-as-a-new-engineer](../../new-hire/onboarding/onboard-as-a-new-engineer.md), milestone-style tracking.
3. **First independent requirement**: assign small change -> medium requirement -> independent module; co-write ADR / retrospective at each stage.
4. **tacit knowledge sediment**: discover tacit knowledge (the "why do it this way" judgment) -> write into [tacit-knowledge-backlog](../../knowledge-curator/governance/tacit-knowledge-backlog.md) -> make explicit as a leaf.
5. **thinking frameworks mentoring**: [first-principles](../../knowledge-curator/templates/thinking--first-principles.md) set skeleton + [flywheel-effect](../../knowledge-curator/templates/thinking--flywheel-effect.md) find flywheel + [second-order-thinking](../../knowledge-curator/templates/thinking--second-order-thinking.md) second-order effects + [inversion](../../knowledge-curator/templates/thinking--inversion.md) reverse reasoning.
6. **engineering patterns mentoring**: scan [engineering-patterns/](../architecture-design) 9 patterns + [staged-port](../architecture-design/staged-port-methodology.md) staged + [eval-driven](../engineering/evaluation-driven-development.md) evaluation-driven.
7. **predecessor experience**: scan [lessons/wins](../lessons/README.md) + [lessons/gotchas](../lessons/README.md) + [lessons/failures](../lessons/README.md) for mentoring.
8. **promotion path**: backbone -> senior engineer -> architect -> tech lead; write ADR / win / gotcha sediment at each stage.

## Anti-patterns

- **Turning 1on1s into status updates** — The 1on1 is the only meeting where the conversation is about the engineer's growth, not the project's progress. Using it to discuss project status wastes the one opportunity for growth-focused conversation. Status updates belong in the weekly report; 1on1s belong to the engineer's development.

- **Growth path without a skeleton** — A list of 20 skills to learn is overwhelming and unactionable. The skeleton (3-5 key areas) gives the engineer a framework to organize their learning. Without the skeleton, the details are a list; with the skeleton, the details are a plan.

- **Tacit knowledge leaving with the senior engineer** — When a senior engineer leaves, the unwritten rules ("don't deploy on Fridays," "this module is fragile because...") leave with them. The tacit-knowledge backlog must be populated before the departure, not after. Every senior engineer should contribute at least one tacit-knowledge entry per quarter.

- **New hire onboarding without a Day-1 working environment** — A new hire who spends the first week setting up their environment is frustrated and demoralized. The onboarding documentation (CLAUDE.md, README.md, dev-standards.md) must enable a new hire to run the project locally on Day 1 and submit a PR within the first week.

- **Mentoring without precedent** — A mentor who teaches by intuition alone misses the institutional knowledge captured in `lessons/wins/`, `lessons/gotchas/`, and `lessons/failures/`. Every mentoring session should reference at least one archived lesson. The mentor is the conduit, not the source.

## Related

- similar journey: [../../new-hire/onboarding/onboard-as-a-new-engineer.md](../../new-hire/onboarding/onboard-as-a-new-engineer.md) — new-hire perspective
- similar journey: [../../new-hire/onboarding/handoff-project.md](../../new-hire/onboarding/handoff-project.md) — handoff perspective
- similar journey: [../strategies/run-iteration-meetings.md](run-iteration-meetings.md) — 1on1 + retrospective co-built
- upstream: [../../knowledge-curator/governance/tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) — tacit knowledge cadence
