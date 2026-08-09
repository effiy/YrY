---
title: Weekly report cadence and template / Weekly report cadence and template
aliases: [weekly-report-cadence-process, weekly-report-process]
tags: [process, reporting, cadence, weekly]
category: engineer/process
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: process
lifecycle: active
status: stable
review_cycle: quarterly
roles: [engineer]
benefit: "process followed predictably"
acceptance_criteria:
  - "steps are ordered and each has a clear owner or role"
  - "prerequisites and inputs are listed before the first step"
  - "outcome is measurable or verifiable
related:
  - ./daily-standup.md
  - ./sprint-retrospective.md
  - ./iteration-pm-handbook.md
  - ../../product-manager/delivery/weekly-report.md
  - ../../product-manager/delivery/weekly-meeting.md
  - ../../ai-engineer/methodology/prompts--weekly-report.md
  - ../../knowledge-curator/templates/retrospective.md
tacit: Weekly report is not just status reporting; it is a contract. Goal + progress + risk + decision + next week three dimensions; business-value driven; not one-shot; measurable
---

# Weekly report cadence and template

> **As an** engineer, **I want to** weekly report cadence, **so that** process followed predictably.

## Summary

- Weekly report = contract; not just status reporting
- Goal + progress + risk + decision + next week three dimensions; no missing dimension
- Business-value driven; not by gut feel
- Covers team / dept / exec multiple levels
- Links with daily-standup + sprint-retrospective + iteration-pm-handbook
- Publicly queryable; not hidden
- Periodic review; evolution updates
- First principles / inversion / second-order / Occam

## Problem

- Team members write weekly reports from memory; risks get missed
- Each team has a different format; managers struggle to aggregate
- Weekly reports become running logs; no decisions and no next steps
- Weekly reports are disconnected from daily standups / monthly retrospectives; the information stream is broken
- Weekly reports have no template; newcomers guess

## Pattern

```python
from dataclasses import dataclass, field
from enum import Enum
from typing import List, Optional


class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    BLOCKING = "blocking"


class DecisionStatus(str, Enum):
    PROPOSED = "proposed"
    IN_REVIEW = "in_review"
    DECIDED = "decided"
    DEFERRED = "deferred"


@dataclass
class WeeklyGoal:
    """Weekly goal — SMART + north star mapping"""
    goal_id: str
    description: str
    north_star_link: Optional[str] = None
    owner: str = ""
    success_metric: str = ""


@dataclass
class WeeklyProgress:
    """Progress bar — done / in-progress / blocked three states"""
    goal_id: str
    done: List[str] = field(default_factory=list)
    in_progress: List[str] = field(default_factory=list)
    blocked: List[str] = field(default_factory=list)


@dataclass
class WeeklyRisk:
    """Risk item — level + owner + deadline"""
    risk_id: str
    level: RiskLevel
    description: str
    owner: str
    due_date: str
    mitigation: str = ""


@dataclass
class WeeklyDecision:
    """Decision request — status + options + recommendation"""
    decision_id: str
    status: DecisionStatus
    context: str
    options: List[str] = field(default_factory=list)
    recommendation: str = ""
    owner: str = ""
    needed_by: str = ""


@dataclass
class WeeklyReport:
    """Weekly report contract"""
    week_of: str
    author: str
    team: str
    goals: List[WeeklyGoal]
    progress: List[WeeklyProgress]
    risks: List[WeeklyRisk] = field(default_factory=list)
    decisions: List[WeeklyDecision] = field(default_factory=list)
    next_week_plan: List[str] = field(default_factory=list)
    highlights: List[str] = field(default_factory=list)
    lowlights: List[str] = field(default_factory=list)

    def to_markdown(self) -> str:
        """Export markdown — paste directly into PR / wiki"""
        lines = [f"# Weekly report {self.week_of} — {self.author} ({self.team})\n"]
        lines.append("## This week's goals")
        for g in self.goals:
            lines.append(f"- [{g.goal_id}] {g.description} (owner: {g.owner}) ")
        lines.append("\n## Progress")
        for p in self.progress:
            lines.append(f"\n### {p.goal_id}")
            if p.done:
                lines.append("- ✅ Done:")
                lines.extend(f"  - {x}" for x in p.done)
            if p.in_progress:
                lines.append("- 🚧 In-progress:")
                lines.extend(f"  - {x}" for x in p.in_progress)
            if p.blocked:
                lines.append("- ⛔ Blocked:")
                lines.extend(f"  - {x}" for x in p.blocked)
        if self.risks:
            lines.append("\n## Risks")
            for r in self.risks:
                lines.append(
                    f"- [{r.level.value.upper()}] {r.description} — owner: {r.owner}, due: {r.due_date}"
                )
        if self.decisions:
            lines.append("\n## Decision requests")
            for d in self.decisions:
                lines.append(f"- [{d.status.value}] {d.context} — owner: {d.owner}")
        if self.highlights:
            lines.append("\n## Highlights")
            lines.extend(f"- {x}" for x in self.highlights)
        if self.lowlights:
            lines.append("\n## Lowlights")
            lines.extend(f"- {x}" for x in self.lowlights)
        if self.next_week_plan:
            lines.append("\n## Next week's plan")
            lines.extend(f"- {x}" for x in self.next_week_plan)
        return "\n".join(lines)
```

## Applicable

- Multi-team collaboration, 30+ person organizations needing weekly alignment
- Cross-timezone, async collaboration teams
- Key projects needing exec visibility
- PMO / EPMO aggregating multi-team status

## Not applicable

- Small teams of 5 or fewer — daily standup + instant messaging is enough
- Fully autonomous open-source communities — no mandatory weekly report
- One-off projects — use a retro instead

## Landing checklist

- [ ] Template SSOT at `resources/templates/weekly-report-template.md`
- [ ] Submit before Friday 17:00 each week — Slack/Email dual channel
- [ ] Manager publishes team digest by Sunday 22:00
- [ ] Exec reviews aggregation Monday 9:00 AM
- [ ] Weekly reports archived to `work/reports/{year}/{week}/`
- [ ] Risk -> decision request auto-escalation
- [ ] Calibrate with daily-standup / sprint-retrospective
- [ ] Quarterly review of template effectiveness — continuous optimization

## Anti-patterns

- Weekly report becomes running log — no decisions, no risks
- Weekly report only writes done, not blocked — reporting only good news
- Weekly report has no goal mapping — disconnected from strategy
- Weekly report has no owner / no due — untrackable
- Weekly report too long — over 1 page no one reads
- Weekly report has no template — newcomers guess
- Weekly report becomes a KPI — formalism
- Weekly report not archived — knowledge stream lost
- Weekly report disconnected from daily standup / monthly retrospective — information stream broken
- Weekly report has no escalation path — risk becomes incident
- Weekly report only upward, not downward — team can't see it
- Weekly report only own team, not cross-team — collaboration broken
- Weekly report has no measurement — no idea whether things improved

## Related

- Daily standup: [./daily-standup.md](./daily-standup.md) — daily standup data feeds the weekly report
- Retrospective: [./sprint-retrospective.md](./sprint-retrospective.md) — weekly report + retrospective co-build
- Iteration PM handbook: [./iteration-pm-handbook.md](./iteration-pm-handbook.md) — PM weekly cadence
- Sample: [../../product-manager/delivery/weekly-report.md](../../product-manager/delivery/weekly-report.md) — instance
- Template: [../../product-manager/delivery/weekly-meeting.md](../../product-manager/delivery/weekly-meeting.md) — weekly meeting template
- Prompt: [../../ai-engineer/methodology/prompts--weekly-report.md](../../ai-engineer/methodology/prompts--weekly-report.md) — AI-assisted generation
- Thinking frameworks: [../../knowledge-curator/templates/thinking--first-principles.md](../../knowledge-curator/templates/thinking--first-principles.md) + [ockhams-razor](../../knowledge-curator/templates/thinking--ockhams-razor.md)
