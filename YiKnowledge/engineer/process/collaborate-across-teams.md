---
title: Collaborate across teams
aliases:
- I want to collaborate across teams
- collaboration-journey
- raci-journey
- cross-team collaboration entry
tags:
- journeys
- collaboration
- raci
- async
- cross-timezone
- stakeholders
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
benefit: handoff is clean
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./run-iteration-meetings.md
- ../../new-hire/onboarding/onboard-as-a-new-engineer.md
- ../../engineer/process/README.md
review_cycle: quarterly
tacit: false
---

# I want to collaborate across teams

> **As an** engineer, **I want to** collaborate across teams, **so that** handoff is clean.

> Reach collaboration principles + cross-timezone + RACI + stakeholder map within 2 hops for "cross-team / async collaboration / cross-timezone / RACI / stakeholder management".

## Summary

- Collaboration principles: go [async-collaboration-principles-summary.md](async-collaboration-principles.md): async first / documentation first / decision traceable
- Cross-timezone: go [cross-timezone-collaboration-summary.md](cross-timezone-collaboration.md): overlap window / timezone rotation / documentation handoff
- Responsibility allocation: go [raci-matrix-summary.md](raci-matrix.md): R/A/C/I four roles
- Stakeholders: go [stakeholder-map.md](../../knowledge-curator/people/stakeholders--stakeholder-map.md) + [communication-cadence.md](../../knowledge-curator/people/stakeholders--communication-cadence.md)

## Core viewpoints

- **The most expensive cross-team failure mode is not conflict -- it is the responsibility vacuum where everyone assumes someone else is handling it.** Between teams, the default state is "not my problem." RACI is not a bureaucratic formality; it is a preemptive conflict-resolution mechanism that forces the question "who is Accountable?" before work begins. Without it, handoffs become ping-pong matches and deadlines slip because no single person can be held responsible.

- **Cross-team collaboration breaks down not at the technical interface but at the incentive interface.** Two teams with misaligned OKRs will always find technical reasons to block each other, because the real issue is that helping the other team hurts their own metrics. The first step of cross-team collaboration is not defining APIs -- it is aligning incentives so that both teams win when the collaboration succeeds.

- **Stakeholder mapping is a power tool that most engineers ignore because it feels political.** An engineer who sends a detailed technical update to the wrong stakeholder (or no stakeholder at all) is doing invisible work. The stakeholder map (impact x interest) is not about politics -- it is about ensuring that the people who can kill your project know what you are doing and why it matters, before they hear about it from someone else.

- **Verbal cross-team decisions are indistinguishable from decisions that were never made.** When two team leads agree on a scope boundary in a hallway conversation, and neither writes it down, both teams will later claim the other side agreed to something different. ADR or RFC documentation is the only durable currency of cross-team agreements -- if it is not written, it did not happen.

- **The async-first principle is most critical, and most frequently violated, in cross-team contexts.** Because cross-team meetings are harder to schedule, the temptation is to pack everything into a single synchronous session. But the teams that need async most are precisely the ones with the most scheduling friction. Documentation-first collaboration is not a nice-to-have for cross-team work; it is the only scalable approach.

## Key info

- **RACI matrix template and assignment rules**: For every cross-team task, define: R (Responsible — does the work, can be multiple people), A (Accountable — answers for the outcome, exactly one person, the "buck stops here" role), C (Consulted — provides input before the decision, two-way communication), I (Informed — notified after the decision, one-way communication). The most common RACI failure: shared Accountability (two A's) or vacant Accountability (no A). The rule: every task has exactly one A; if you can't identify the A, the task is not ready to start.
- **Async collaboration tool stack**: (1) Documentation — markdown files in the knowledge base (YiKnowledge) for decisions, designs, and processes; (2) Comments — async review on PRs, design docs, and ADRs; (3) Issue tracking — Jira/Linear for task status and blocking; (4) Chat — Slack/Teams for quick questions with a 2-hour expected response time; (5) Video — recorded walkthroughs (Loom) for complex explanations, watched async. The rule: if it takes more than 2 back-and-forth messages to resolve, escalate to a 15-minute sync call. The Yi-family projects use WeChat for chat and YiKnowledge for documentation.
- **Cross-timezone overlap window calculation**: For teams in China (UTC+8) and Europe (UTC+1), the overlap is 14:00-17:00 UTC+8 (08:00-11:00 UTC+1). For China and US West Coast (UTC-8), the overlap is 08:00-10:00 UTC+8 (16:00-18:00 UTC-8 previous day). The overlap window is only 2-3 hours per day, so it must be reserved for decisions that require real-time negotiation. Status updates, information sharing, and non-urgent questions belong in async channels. The Yi-family projects are primarily China-based with occasional Europe collaboration.
- **Stakeholder communication cadence by tier**: High-impact high-interest stakeholders (sponsor, key customer) — weekly 1:1 check-in, monthly formal review, real-time incident notification. High-impact low-interest stakeholders (legal, compliance) — monthly summary report, immediate notification for compliance-relevant changes. Low-impact high-interest stakeholders (adjacent teams) — biweekly update in shared channel, invite to monthly demo. Low-impact low-interest stakeholders (wider org) — quarterly all-hands update, no direct communication. The stakeholder map must be updated when organizations restructure or project scope changes.
- **Cross-team decision documentation format (ADR/RFC)**: Every cross-team decision must be documented with: (1) Title (decision name + date); (2) Context (why this decision is needed now); (3) Decision (what was decided, in one sentence); (4) Alternatives considered (what other options were evaluated and why rejected); (5) Consequences (what becomes easier, what becomes harder); (6) Deciders (names of people who made the decision); (7) Date of next review (when this decision should be re-evaluated). The Yi-family projects use ADRs in `tech-lead/decisions/` for cross-project decisions.
- **Cross-team failure modes by collaboration phase**: (1) Kickoff — no RACI established, tasks start with no owner → responsibility vacuum. (2) Execution — verbal agreements not documented, teams interpret scope differently → scope creep and rework. (3) Handoff — no knowledge transfer process, receiving team can't maintain the deliverable → abandoned features. (4) Post-mortem — no cross-team retrospective, the same coordination failures recur in the next project → systemic dysfunction. Each phase has a specific prevention mechanism: RACI for kickoff, ADR for execution, knowledge transfer for handoff, cross-team retrospective for post-mortem.

## Scenario

When cross-team projects / multi-end collaboration / cross-timezone teams / stakeholder reporting / unclear responsibilities, PM + Tech Lead + lead owner need to look up collaboration principles + cross-timezone plan + RACI + stakeholder map. This entry aggregates collaboration related 4 leaves, stakeholder management, cross-team process into a 2-hop path, avoiding "cross-team by word-of-mouth / responsibility vacuum / timezone blind spots / reporting disorder".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/collaboration/` | [async-collaboration-principles-summary.md](async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](cross-timezone-collaboration.md) · [raci-matrix-summary.md](raci-matrix.md) |
| `people/stakeholders--` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders--stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders--communication-cadence.md) |
| `people/team--` | [team-overview.md](../../knowledge-curator/people/team--team-overview.md) · [roster.md](../../knowledge-curator/people/team--roster.md) |
| `work/processes/` | [cross-team-collaboration-process.md](cross-team-collaboration.md) · [design-review-process.md](../../product-manager/delivery/design-review.md) · [tech-review-process.md](../../product-manager/delivery/tech-review.md) · [requirement-review-process.md](../../product-manager/delivery/requirement-review.md) · [project-handover-process.md](project-handover.md) · [knowledge-transfer-process.md](knowledge-transfer.md) |
| `work/meetings/` | [weekly-meeting-template.md](../../product-manager/delivery/weekly-meeting.md) · [review-meeting-template.md](../../product-manager/delivery/review-meeting.md) · [one-on-one-template.md](../../knowledge-curator/templates/one-on-one.md) |
| `methodology/thinking/` | [strong-opinions-loosely-held-summary.md](../../knowledge-curator/templates/thinking--strong-opinions-loosely-held.md) · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) — cross-team decision |
| `resources/templates/` | [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) · [one-on-one-template.md](../../knowledge-curator/templates/one-on-one.md) |
| `methodology/pm-frameworks/` | [dual-track-agile-summary.md](../../product-manager/frameworks/dual-track-agile.md) · [agile-product-management-summary.md](../../product-manager/frameworks/agile-product-management.md) — cross-team cadence |

## Action recommendations

1. **async first**: decisions go through documentation + comments rather than meetings; meetings only for discussing what cannot be resolved async; see [async-collaboration-principles-summary.md](async-collaboration-principles.md).
2. **RACI**: each task must clearly define R (Responsible) / A (Accountable, unique) / C (Consulted) / I (Informed); see [raci-matrix-summary.md](raci-matrix.md).
3. **cross-timezone**: find a 2-3h overlap window for sync meetings; non-overlap zones use documentation handoff + async comments; see [cross-timezone-collaboration-summary.md](cross-timezone-collaboration.md).
4. **stakeholder map**: first draw [stakeholder-map.md](../../knowledge-curator/people/stakeholders--stakeholder-map.md) by impact x interest; high-impact high-interest communicate heavily, high-impact low-interest keep baseline reporting.
5. **reporting cadence**: per [communication-cadence.md](../../knowledge-curator/people/stakeholders--communication-cadence.md) set: daily standup / weekly report / biweekly review / monthly alignment / quarterly planning.
6. **decision recording**: cross-team decisions must go through ADR or RFC, do not decide verbally; see [design-review-process.md](../../product-manager/delivery/design-review.md).
7. **handover**: project delivery goes through [project-handover-process.md](project-handover.md) + [knowledge-transfer-process.md](knowledge-transfer.md), documentation + screen recording + Q&A.
8. **conflict**: technical conflicts go to tech-review; priority conflicts go to [cross-team-collaboration-process.md](cross-team-collaboration.md); values conflicts escalate to sponsor.

## Anti-patterns

- **Starting cross-team work without a RACI matrix.** When no one is explicitly Accountable, every team assumes another team is driving, and the project drifts until a deadline forces a crisis. The RACI must be established before work begins, and every task must have exactly one "A" -- shared accountability is no accountability.

- **Using the stakeholder map as a one-time deliverable rather than a living document.** Stakeholders change when organizations restructure, when projects shift scope, and when sponsors leave. A stakeholder map created at kickoff and never updated becomes actively misleading, directing communication to people who no longer care while ignoring new stakeholders who can block the project.

- **Resolving cross-team technical conflicts without documentation.** When two teams disagree on an API contract and resolve it verbally, the losing side will "forget" the decision within weeks. Every cross-team technical decision must be captured as an ADR with the rationale, alternatives considered, and the names of the deciders -- not to assign blame, but to prevent re-litigation.

- **Relying on a single interface person between teams.** When all cross-team communication flows through one person, that person becomes both a bottleneck and a single point of failure. If they leave, get sick, or are overloaded, the collaboration stalls. Every cross-team relationship needs at least two points of contact on each side, with overlapping knowledge.

- **Treating the weekly sync meeting as the primary collaboration mechanism.** Cross-team weekly syncs that consist of status round-robins consume the most scarce resource (synchronous overlap time) for the lowest-value activity (information sharing that could be a document). These meetings should be reserved for decisions that require real-time negotiation; everything else belongs in async channels.

## Related

- same-class journey: [./run-iteration-meetings.md](./run-iteration-meetings.md) — collaboration meeting
- same-class journey: [../../new-hire/onboarding/onboard-as-a-new-engineer.md](../../new-hire/onboarding/onboard-as-a-new-engineer.md) — new hire collaboration onboarding
- same-class journey: [../../new-hire/onboarding/handoff-project.md](../../new-hire/onboarding/handoff-project.md) — project handover
- upstream: [../../engineer/process/README.md](../../README.md) — collaboration leaf entry
