---
title: Agile Product Management Framework
aliases:
- Agile Product Management
- Scrum Kanban DORA
tags:
- PM
- methodology
- agile
- scrum
category: product-manager/frameworks
created: 2024-03-10
updated: 2026-08-07
last_verified: 2026-08-07
source: https://example.com/agile-pm-framework
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
- dual-track-agile.md
- product-discovery-framework.md
- rice-ice-prioritization.md
- okr-design.md
- heart-aarrr-metrics.md
- ../../README.md
tacit: false
---

# Agile Product Management Framework

> **As a** product manager, **I want to** agile product management, **so that** framework applied.

> User-oriented + iterative delivery + data-driven + cross-functional collaboration + embracing change; Scrum / Kanban + DORA + DoD trio.

## Summary
- Five principles: user-oriented, iterative delivery, data-driven, cross-functional collaboration, embracing change.
- Scrum cadence: Sprint Planning / Daily Standup / Sprint Review / Retrospective; Kanban uses WIP + CFD, suited for operations-type work.
- DORA four metrics: deployment frequency, lead time for changes, change failure rate, MTTR; after 2024 Reliability added as the fifth dimension.
- DoD unifies the "done" standard: code review + test + documentation + staging + monitoring + business acceptance.
- AI era: coding assistants boost individual engineer output by 30-50%, but review and testing become bottlenecks; PR volume rises → enforce lint + AI review upfront.

## Core viewpoints

- **Agile is a risk-management framework, not a speed framework.** The core value of short iterations is not "delivering faster" but "detecting wrong turns earlier." A 2-week Sprint that produces the wrong thing is just as wasteful as a 2-month waterfall phase. The real win is that you only waste 2 weeks instead of 2 months before the course correction. Focus on the feedback loop, not the velocity number.

- **The Sprint Backlog is a forecast, not a commitment with consequences.** When teams treat the Sprint Backlog as a hard promise, they cut corners on quality to hit the number. The correct framing is: "based on what we know now, this is our best guess at what we can finish." If the forecast was wrong, the retrospective should investigate why the estimate was off, not who failed to deliver.

- **Kanban is not "Scrum without meetings."** Teams that adopt Kanban to avoid Sprint ceremonies are missing the point. Kanban requires continuous attention to flow metrics (cycle time, throughput, WIP aging) that are arguably harder to maintain than Scrum's fixed cadence. Choose Kanban only when work arrives unpredictably and cannot be batched into Sprints; otherwise, Scrum's rhythm provides more structure for learning.

- **The most important Scrum ceremony is the one teams skip most often: the Retrospective.** When time is tight, Retrospectives are the first to be cut, yet they are the only ceremony that improves the process itself. A team that cancels Retros for 3 Sprints in a row is on a trajectory toward process decay. The rule: cancel a Planning or Review before you cancel a Retro.

- **AI tools change who does the work, not how the work is organized.** AI coding assistants boost individual output, but the team-level bottleneck shifts from "writing code" to "reviewing and integrating code." Without adjusting PR review capacity, WIP limits, and the Definition of Done, the team simply produces more unreviewed work faster. The organizational response must match the productivity gain.


- **Velocity is not a performance metric** — only used for capacity planning; when used as KPI, teams inflate estimates.
- **DoD prevents "90% done forever 90%"** — "done" must have a unified, verifiable standard.
- **Spillover > 20% signals estimation or capacity issues** — more than 20% of tasks unfinished at Sprint end is a red signal.
- **Retrospectives must have action items + owners + due dates** — discussion without output is just ceremony.
- **Agile in the AI era** — individual engineer output rises but review becomes the bottleneck; smaller Story granularity (<2 days) reaches Done faster.

## Key information

### Core principles

1. **User-oriented**: every decision starts from user value
2. **Iterative delivery**: small steps, fast iterations, continuously delivering verifiable product increments
3. **Data-driven**: validate assumptions with data rather than relying on intuition
4. **Cross-functional collaboration**: product, design, and development work closely together
5. **Embrace change**: responding to change over following a plan, but with rhythm

### Requirements management

- **User Story**: As an X, I want Y, so that Z
- **INVEST principle**: Independent / Negotiable / Valuable / Estimable / Small / Testable
- **Priority sorting**: RICE (Reach × Impact × Confidence / Effort)
- **Healthy Backlog**: DEEP principle — Detailed appropriately / Emergent / Estimated / Prioritized

### Iteration cadence (Scrum)

- **Sprint Planning** (planning meeting): clarify goal + break down tasks + capacity estimation
- **Daily Standup** (daily standup): yesterday / today / blockers, within 15 minutes
- **Sprint Review** (review meeting): demo working software, gather feedback
- **Sprint Retrospective** (retrospective): Start / Stop / Continue, produce actionable improvement actions

### Kanban

- WIP limit: limit concurrent items per state column
- CFD (Cumulative Flow Diagram): visualize delivery rhythm and bottlenecks
- Suited for operations and support-type work; Scrum suited for product iteration

### Priority frameworks

| Framework | Applicable scenarios | Formula |
|------|---------|------|
| RICE | Quantitative feature sorting | Reach × Impact × Confidence / Effort |
| Kano | User satisfaction analysis | Basic / Expected / Excitement |
| MoSCoW | Release scope control | Must / Should / Could / Won't |
| ICE | Quick lightweight assessment | Impact × Confidence × Ease |
| WSJF | Weighted shortest job first | Cost of Delay / Job Size |

### Velocity and quality metrics

**Velocity**

- Rolling average over 3 Sprints to avoid single-point fluctuation
- Not a performance metric, only used for capacity planning

**DORA metrics (R&D efficiency)**

- **Deployment frequency**: high performers > daily
- **Lead time for changes**: < 1 day
- **Change failure rate**: < 15%
- **Mean time to recovery (MTTR)**: < 1 hour
- After 2024: Reliability added as the fifth dimension

**Flow Efficiency**

Actual working time / total cadence time; below 20% indicates extensive waiting.

### Definition of Done (DoD)

Unified "done" standard, to avoid "90% done, forever 90%":

- Code review passed
- Unit test coverage meets standard
- Documentation updated
- Deployed to staging and passed acceptance
- Monitoring alerts in place
- Business acceptance signed off

### Scaled agile

- **SAFe**: enterprise-grade scaling, suited for large traditional enterprises
- **LeSS**: lean scaling, emphasizes product teams over project teams
- **Spotify Model**: tribe / squad / chapter / guild, more impactful in concept than in practice
- Trend: moving from heavyweight frameworks to lightweight OKR + two-pizza teams

### Agile in the AI era

- AI coding assistants boost individual engineer output by 30-50%, but review and testing become bottlenecks
- PR volume growth → enforce lint + AI review upfront
- Smaller Story granularity (< 2 days), reaching Done faster
- Use AI Agents to automate Sprint reports, risk identification, retrospective summaries

### Common tools

- **Jira / Linear** (project management)
- **Notion / Confluence** (documentation collaboration)
- **Miro / FigJam** (whiteboard collaboration)
- **GitHub Projects / GitLab** (R&D integration)
- **Figma** (design and collaboration)

## Action recommendations
1. Write a DoD and make it public: code review + test + documentation + staging + monitoring + business acceptance; missing any one means not done.
2. Use rolling 3-Sprint average Velocity, only for capacity planning, not as KPI.
3. Four Sprint ceremonies: Planning + Daily + Review + Retrospective; retrospectives must have action items + owners + due dates.
4. Monitor DORA four metrics + Flow Efficiency; below 20% flow efficiency indicates extensive waiting.
5. Split Stories with granularity < 2 days to reach Done faster; check the INVEST principle.
6. AI era: enforce lint + AI review upfront so review doesn't become a bottleneck when PR volume is high.
7. Spillover > 20%: immediately investigate estimation or capacity issues; clean up zombie stories regularly.
8. Once the team is large enough, shift to lightweight OKR + two-pizza teams; avoid heavyweight SAFe frameworks.

## Anti-patterns

- **Sprint-zero-that-never-ends.** Teams that spend multiple Sprints on "infrastructure setup" and "architecture design" before delivering any user-facing increment are practicing waterfall with Scrum labels. The first Sprint must produce a potentially shippable increment, even if it is tiny. Architecture emerges from delivering real features, not from pre-committing to a design in a vacuum.

- **Story-point inflation as a safety buffer.** When teams routinely double their estimates to create slack, the metric loses all meaning for capacity planning. Worse, it creates a culture where the real work is hidden behind inflated numbers, making it impossible to diagnose actual bottlenecks. The fix is psychological safety: teams inflate estimates because they fear punishment for missing a forecast.

- **The Scrum Master as team secretary.** When the Scrum Master's role devolves into scheduling meetings and updating Jira, the team loses its process coach. The Scrum Master should spend 80% of their time on impediment removal, facilitation quality, and teaching agile practices, not on administrative tasks that a bot could handle.

- **Daily standup as status report to the manager.** When the standup becomes a round-robin where each person reports to the tech lead or PM, it shifts from team coordination to surveillance. The antidote: walk the board, not the people. Focus on work items that are blocked or at risk, not on justifying each person's time.

- **Agile-as-excuse for no documentation.** "Working software over comprehensive documentation" does not mean zero documentation. Architecture decisions, API contracts, and business rules that live only in Slack threads create a knowledge debt that compounds with every team member who leaves. The standard is "just enough documentation to onboard a new team member in under a week."


- **Spillover** — tasks unfinished at Sprint end > 20%, indicating estimation or capacity issues.
- **Zombie stories** — items in the Backlog that don't move for a long time; clean up regularly.
- **Daily standup turns into a reporting meeting** — keep within 15 minutes, only cover the three questions.
- **PO as translator** — PO only passes requirements along without making decisions; should have decision authority.
- **Velocity worship** — treating velocity as KPI; teams will inflate estimates.
- **Retrospectives with no output** — only discussion without action items; must have owners and due dates.
- **Parallel Sprints** — team supports multiple Sprint goals simultaneously; focus scatters, quality drops.

## Related
- Same category: [dual-track-agile-summary.md](./dual-track-agile.md) (dual-track agile is an extension of agile cadence); [product-discovery-framework-summary.md](./product-discovery-framework.md) (Discovery runs in parallel with agile Delivery); [rice-ice-prioritization-summary.md](./rice-ice-prioritization.md) (use RICE for iteration planning); [okr-design-summary.md](./okr-design.md) (OKR sets direction, agile iterations execute); [heart-aarrr-metrics-summary.md](./heart-aarrr-metrics.md) (agile metrics regression)
- Upstream: [../../README.md](../../README.md)
- Downstream: team iteration planning, DoD standard, DORA measurement

## References
- Scrum Guide: https://scrumguides.org
- DORA: https://dora.dev
- INVEST principle: Bill Wake, *INVEST in Good Stories* (2003)
