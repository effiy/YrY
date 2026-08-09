---
title: Daily standup cadence and template
aliases: [daily-standup-process, daily-report-process]
tags: [process, reporting, cadence, daily]
category: engineer/process
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
lifecycle: active
status: stable
review_cycle: quarterly
roles: [engineer]
benefit: "process followed predictably"
acceptance_criteria:
  - "steps are ordered and each has a clear owner or role"
  - "prerequisites and inputs are listed before the first step"
  - outcome is measurable or verifiable
related:
  - ./weekly-report-cadence.md
  - ./sprint-retrospective.md
  - ./iteration-pm-handbook.md
  - ../../product-manager/delivery/daily-report.md
  - ./incident-response.md
  - ../../oncall-sre/release/hotfix-release.md
tacit: Daily standup is not just three sentences; it is a contract. Yesterday + today + blockers + risk + collaboration five dimensions; business-value driven; not one-shot; measurable
---

# Daily standup cadence and template

> **As an** engineer, **I want to** daily standup, **so that** process followed predictably.

## Summary

- Daily standup = contract; not just three sentences
- Yesterday + today + blockers + risk + collaboration five dimensions; no missing dimension
- Business-value driven; not by gut feel
- Covers sync / async / hybrid multiple modes
- Links with weekly-report + sprint-retrospective + iteration-pm-handbook
- Publicly queryable; not hidden
- Periodic review; evolution updates
- First principles / inversion / second-order / Occam

## Problem

- Daily standup becomes a laundry list — no decisions, no risk
- Daily standup becomes status theater — only good news
- Daily standup has no blocker tracking — risk becomes incident
- Daily standup has no owner / no due date — not trackable
- Daily standup exceeds 15 minutes — wastes time
- Daily standup has no async option — painful across time zones
- Daily standup disconnected from weekly report / retrospective — information lost
- Daily standup has no measurement — don't know if it's improving

## Pattern

```python
from dataclasses import dataclass, field
from datetime import date
from enum import Enum
from typing import List, Optional


class BlockLevel(str, Enum):
    NONE = "none"
    SOFT = "soft"
    HARD = "hard"


class SyncMode(str, Enum):
    SYNC = "sync"
    ASYNC = "async"
    HYBRID = "hybrid"


@dataclass
class DailyUpdate:
    """Daily standup entry"""
    author: str
    standup_date: date
    yesterday_done: List[str] = field(default_factory=list)
    today_plan: List[str] = field(default_factory=list)
    block_level: BlockLevel = BlockLevel.NONE
    blockers: List[str] = field(default_factory=list)
    help_needed: List[str] = field(default_factory=list)
    risk_flags: List[str] = field(default_factory=list)


@dataclass
class DailyStandup:
    """Daily standup contract"""
    standup_date: date
    mode: SyncMode
    team: str
    updates: List[DailyUpdate] = field(default_factory=list)
    facilitator: str = ""
    duration_minutes: int = 15
    decisions: List[str] = field(default_factory=list)
    action_items: List[str] = field(default_factory=list)

    def to_async_digest(self) -> str:
        """Export async digest — Slack/Teams channel"""
        lines = [f"# Daily standup {self.standup_date} — {self.team} ({self.mode.value}) \n"]
        for u in self.updates:
            lines.append(f"## {u.author}")
            lines.append(f"- Yesterday: {'; '.join(u.yesterday_done) if u.yesterday_done else '—'}")
            lines.append(f"- Today: {'; '.join(u.today_plan) if u.today_plan else '—'}")
            if u.block_level != BlockLevel.NONE:
                lines.append(f"- Blocker [{u.block_level.value}]: {'; '.join(u.blockers) if u.blockers else '—'}")
            if u.help_needed:
                lines.append(f"- Help needed: {'; '.join(u.help_needed)}")
            if u.risk_flags:
                lines.append(f"- Risk: {'; '.join(u.risk_flags)}")
        if self.decisions:
            lines.append("\n## Decisions")
            lines.extend(f"- {d}" for d in self.decisions)
        if self.action_items:
            lines.append("\n## Action items")
            lines.extend(f"- {a}" for a in self.action_items)
        return "\n".join(lines)
```

## Applicable

- 5+ person collaboration team
- During key projects — need daily alignment
- Cross-timezone, async collaboration teams
- During incidents / hotfixes — need daily sync

## Not applicable

- 1-2 person projects — direct 1:1
- Fully autonomous open-source communities — no mandatory daily standup
- One-off ad-hoc tasks — discard after use

## Landing checklist

- [ ] Template SSOT at `resources/templates/daily-standup-template.md`
- [ ] Daily async update before 9:30 — Slack/Teams channel
- [ ] 9:30-9:45 sync follow-up on blockers — only hard blockers
- [ ] Blockers → weekly report risk auto-escalation
- [ ] Action items → Jira/Linear auto-create ticket
- [ ] Daily standup archived to `work/reports/{year}/{month}/daily/`
- [ ] Daily standup ≤ 15 minutes — escalate if over
- [ ] Align with weekly-report / sprint-retrospective
- [ ] Quarterly review of template effectiveness — continuous optimization

## Anti-patterns

- Daily standup becomes a laundry list — no blockers, no risk
- Daily standup only good news — reports the good, hides the bad
- Daily standup no owner / no due date — not trackable
- Daily standup exceeds 15 minutes — wastes time
- Daily standup no async option — painful across time zones
- Daily standup becomes status theater — only the boss speaks
- Daily standup no escalation path — risk becomes incident
- Daily standup only within team, not cross-team — collaboration breaks
- Daily standup no archive — knowledge lost
- Daily standup becomes KPI — formalism
- Daily standup disconnected from weekly report / retrospective — information breaks
- Daily standup no measurement — don't know if it's improving
- Daily standup no facilitator — drags on
- Daily standup no action items — no results

## Related

- Weekly report: [./weekly-report-cadence.md](./weekly-report-cadence.md) — daily standup data feeds weekly report
- Retrospective: [./sprint-retrospective.md](./sprint-retrospective.md) — daily standup + retrospective co-build
- Iteration PM handbook: [./iteration-pm-handbook.md](./iteration-pm-handbook.md) — PM daily cadence
- Sample: [../../product-manager/delivery/daily-report.md](../../product-manager/delivery/daily-report.md) — instance
- Incident response: [./incident-response.md](./incident-response.md) — daily standup during incident
- Hotfix: [../../oncall-sre/release/hotfix-release.md](../../oncall-sre/release/hotfix-release.md) — daily standup during hotfix
- Thinking frameworks: [../../knowledge-curator/templates/thinking--first-principles.md](../../knowledge-curator/templates/thinking--first-principles.md) + [ockhams-razor](../../knowledge-curator/templates/thinking--ockhams-razor.md)
