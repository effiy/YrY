---
title: Quarterly Planning Process
aliases:
  - Quarterly planning
  - Q-planning
  - Team planning
  - Capacity planning
tags:
  - meeting
  - planning
  - quarterly
  - strategy
  - capacity
  - roadmap
category: product-manager/delivery
created: 2026-08-07
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles:
  - product-manager
  - tech-lead
  - executive
benefit: PMs can run a structured quarterly planning process that aligns the team on priorities, manages dependencies, and balances commitment with forecast
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - weekly-meeting.md
  - review-meeting.md
  - retrospective.md
  - ../frameworks/okr-design.md
  - ../frameworks/prioritize-a-backlog.md
  - ../../executive/strategy/README.md
tacit: false
---

# Quarterly Planning Process

> **As a** product manager, **I want to** run a structured quarterly planning process, **so that** the team aligns on priorities, manages cross-team dependencies, and commits to achievable outcomes for the quarter.

> Quarterly planning is the bridge between strategy and execution. Strategy says "where are we going?" Quarterly planning says "what are we doing about it in the next 90 days?" The output is not a detailed project plan; it is a set of committed outcomes, a capacity-constrained scope, and a dependency map.

## Summary

- Quarterly planning translates the annual/strategic roadmap into a 90-day execution plan. It answers: what are we committing to deliver? What is our capacity? What dependencies do we have on other teams?
- The planning process consists of three phases: pre-planning (strategy alignment, capacity calculation, backlog preparation), planning event (team alignment, scope negotiation, dependency resolution), and post-planning (commitment documentation, communication, kickoff).
- Capacity planning is the most important and most neglected step. Without a realistic capacity calculation, the quarterly plan is a wish list. The formula: Available person-weeks = (team size x 13 weeks) - (PTO, holidays, on-call, interviews, meetings, 20% buffer).
- Commitment vs. forecast: commit to the items the team has high confidence in delivering (80%+). Forecast the items the team plans to work on if capacity allows. Commitments are promises; forecasts are intentions. Stakeholders must understand the difference.
- The quarterly plan is a living document. It is updated mid-quarter based on what is learned. A plan that is never updated is a plan that is not being used.

## Core viewpoints

- **Capacity is the constraint that makes planning real** -- without a capacity calculation, quarterly planning is fantasy. The team will commit to more than they can deliver, and the quarter will end with disappointment. Calculate capacity first, then fill it.
- **Commitment vs. forecast is the most important distinction** -- stakeholders hear "we are planning to do X" as "we will do X." The PM must explicitly label each item as a commitment (80%+ confidence, will be delivered) or a forecast (lower confidence, will be worked on if capacity allows). This distinction prevents the end-of-quarter "you promised X" conversation.
- **Dependencies are the primary source of risk** -- a team that has no cross-team dependencies can plan independently. A team that depends on 3 other teams for critical path items has a plan that is only as reliable as the weakest dependency. Resolve or de-risk dependencies during planning, not during execution.
- **The plan is a hypothesis, not a contract** -- the quarter will not go exactly as planned. New information will emerge, priorities will shift, and the plan will need to adapt. The plan is the starting point, not the ending point. Update it mid-quarter.
- **No plan survives contact with the first sprint** -- but that does not mean planning is useless. The value of planning is not the plan; it is the shared understanding, the alignment, and the explicit trade-off decisions made during the planning process.

## Key information

### The quarterly planning timeline

**Week -3: Pre-planning kickoff**
- Strategy context: review the annual roadmap, company OKRs, and any strategic shifts. What is the "big bet" for this quarter?
- Capacity calculation: calculate available person-weeks for the team. See formula below.
- Backlog grooming: ensure the top of the backlog is well-defined (user stories, acceptance criteria, estimates).

**Week -2: Draft plan**
- PM drafts the proposed scope for the quarter: commitments, forecasts, and stretch goals.
- Identify dependencies: for each item, does it depend on another team? Does another team depend on it?
- Schedule dependency resolution meetings with dependent teams.

**Week -1: Planning event**
- Team reviews the draft plan in a 2-4 hour planning session.
- Discussion: does the scope match the capacity? Are the right things prioritized? Are dependencies manageable?
- Each item is classified: commitment, forecast, or parking lot.
- Scope is adjusted to fit within capacity. Hard decisions are made: what is NOT being done this quarter?

**Week 1: Post-planning**
- PM documents the final plan: commitments, forecasts, dependencies, risks, assumptions.
- Plan is communicated to stakeholders: "Here is what we are committing to deliver this quarter. Here is what we are forecasting. Here is what we are NOT doing."
- Kickoff: the team starts the first sprint of the quarter.

**Week 6-7: Mid-quarter check-in**
- Review progress against commitments. Are we on track?
- If commitments are at risk, renegotiate scope or request additional capacity.
- Update the forecast based on what has been learned.

**Week 13: Quarter-end retrospective**
- Review: what commitments were delivered? What forecasts were completed? What was not done?
- Retrospective: what went well in the planning process? What can be improved for next quarter?

### Capacity calculation formula

```
Available person-weeks = (Team size × 13 weeks)
  - PTO (vacation, sick days)       [~1-2 weeks per person]
  - Holidays                         [~0.5 weeks per person]
  - On-call rotation                 [~1 week per person on rotation]
  - Interviews (if hiring)           [~0.5 weeks per interviewer]
  - Recurring meetings (standup, etc.) [~2 weeks per person]
  - 20% buffer (unplanned work, surprises) [~2.5 weeks per person]
  ─────────────────────────────────────────────────
  = Net available person-weeks
```

Example: 6-person team = 78 person-weeks gross. After deductions: ~45-50 person-weeks net. This is roughly 60% of gross capacity. Teams that plan at 100% capacity will miss their commitments.

### Commitment classification

| Classification | Confidence | Definition | Stakeholder expectation |
|---|---|---|---|
| Commitment | 80%+ | Will be delivered this quarter | Safe to plan dependent work on this |
| Forecast | 50-80% | Planned to be worked on; may or may not be completed | Do not plan dependent work on this |
| Stretch goal | < 50% | Will be started if all commitments are on track | Nice to have; no expectation of delivery |
| Parking lot | 0% | Explicitly NOT doing this quarter | Do not ask about it until next quarter |

### Dependency management

**Dependency types:**

| Type | Example | Risk level | Mitigation |
|---|---|---|---|
| Hard dependency (blocking) | Our feature requires an API from another team | High | Confirm commitment from the other team during planning; schedule integration checkpoints |
| Soft dependency (nice to have) | Our feature would be better with design from another team | Medium | Design the feature to work without the dependency; add the dependency as an enhancement |
| Reverse dependency (they depend on us) | Another team's feature requires our API | Medium | Confirm the commitment in our plan; communicate clearly if it slips |

**Dependency resolution checklist:**
- [ ] For each hard dependency, is the other team aware? Have they committed to the timeline?
- [ ] For each dependency, is there a named owner on both sides?
- [ ] For each dependency, are there integration checkpoints scheduled (not just "we will sync when it's ready")?
- [ ] For each dependency, what is the fallback plan if the dependency is not delivered on time?

### Planning anti-portfolio (what we are NOT doing)

The most important output of quarterly planning is the list of things the team is NOT doing. This list:
- Prevents stakeholders from asking "why aren't you working on X?" (It is on the anti-portfolio list.)
- Forces the team to make explicit trade-offs. "If we do A, we cannot do B. Which is more important?"
- Creates a backlog for the next quarter's planning.

The anti-portfolio list should be shared with stakeholders alongside the commitments. "Here is what we are doing, and here is what we are explicitly NOT doing this quarter."

### Quarterly planning for different team sizes

| Team size | Planning format | Duration | Key considerations |
|---|---|---|---|
| 1-3 people | Lightweight: PM + team draft plan in 1 hour, async review | 1-2 hours | Few dependencies; focus on capacity and priorities |
| 4-8 people | Standard: team planning session, 2-4 hours | Half day | Dependencies within the team; cross-team dependencies |
| 9-15 people | Structured: pre-read + planning session + breakout sessions | Full day | Cross-team dependencies require coordination; consider Big Room Planning |
| 15+ (multiple teams) | Big Room Planning: all teams plan together in one room | 2 days | Cross-team dependency resolution is the primary activity |

## Action recommendations

1. Start the quarterly planning process at least 3 weeks before the quarter begins. Late planning produces rushed commitments.
2. Calculate capacity first. Use the formula above. Be realistic about deductions. Teams consistently overestimate capacity by 20-30%.
3. Draft the proposed scope. Classify each item as commitment, forecast, stretch goal, or parking lot. Be explicit about confidence levels.
4. Identify and resolve dependencies during planning, not during execution. For each hard dependency, confirm the other team's commitment and schedule integration checkpoints.
5. Run the planning event with the full team. The team must agree on the commitments. Do not commit the team to something they did not agree to.
6. Document and communicate the plan. Share the commitments, forecasts, and anti-portfolio list with stakeholders.
7. Schedule a mid-quarter check-in at week 6-7. Review progress against commitments. Renegotiate if necessary.
8. Run a quarter-end retrospective. What was delivered? What was not? What can be improved in the planning process?

## Anti-patterns

- **Planning without capacity calculation** -- committing to more work than the team can deliver. The quarter ends with missed commitments and team burnout. Calculate capacity first.
- **No distinction between commitment and forecast** -- stakeholders treat everything as a promise. Every missed forecast becomes a "broken promise." Explicitly label each item.
- **Dependencies discovered during execution** -- "we didn't realize we needed the API team for this." Discover and resolve dependencies during planning.
- **The plan as a fixed contract** -- refusing to adapt the plan when new information emerges. The plan is a hypothesis. Update it mid-quarter based on what is learned.
- **No anti-portfolio** -- not explicitly saying what the team is NOT doing. Stakeholders keep asking for things that were implicitly deprioritized. Make the trade-offs explicit.
- **Planning in a vacuum** -- the PM drafts the plan alone and presents it to the team. The team does not feel ownership because they were not involved. The team must participate in the planning event.

## Related

- Same class: [weekly-meeting.md](./weekly-meeting.md) -- weekly meeting is the cadence for tracking quarterly plan progress
- Same class: [review-meeting.md](./review-meeting.md) -- quarterly review meeting to assess progress against the plan
- Same class: [retrospective.md](./retrospective.md) -- quarter-end retrospective on the planning process and outcomes
- Upstream: [../frameworks/okr-design.md](../frameworks/okr-design.md) -- OKRs set the strategic direction for quarterly planning
- Upstream: [../frameworks/prioritize-a-backlog.md](../frameworks/prioritize-a-backlog.md) -- backlog prioritization feeds into quarterly planning
- Upstream: [../../executive/strategy/README.md](../../executive/strategy/README.md) -- strategy alignment for quarterly planning
- References: Marty Cagan -- *Inspired* (product planning); Janna Bastow -- *Now/Next/Later Roadmap*; SAFe -- *PI Planning*; Basecamp -- *Shape Up* (six-week cycles)