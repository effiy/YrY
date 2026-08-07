---
title: Retrospective cadence and template
aliases: [retrospective-cadence-process, retrospective-process]
tags: [process, retrospective, cadence]
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
- ./weekly-report-cadence.md
  - ./daily-standup.md
  - ./sprint-retrospective.md
  - ./iteration-pm-handbook.md
  - ../../product-manager/delivery/retrospective.md
  - ../../product-manager/delivery/retrospective-meeting.md
  - ../../knowledge-curator/templates/retrospective.md
  - ../lessons/failure-incident-postmortem.md
tacit: Retrospective is not just a summary; it is a contract. Facts + analysis + responsibility + action + measurement five dimensions; business-value driven; not one-shot; measurable
---

# Retrospective cadence and template

> **As an** engineer, **I want to** retrospective cadence, **so that** process followed predictably.

## Summary

- Retrospective = contract; not just a summary
- Facts + analysis + responsibility + action + measurement five dimensions; no missing dimension
- Business-value driven; not by gut feel
- Cover sprint / incident / quarterly / project multiple types
- Link with weekly-report + daily-standup + iteration-pm-handbook
- Publicly queryable; not hidden
- Periodic review; evolution updates
- First principles / inversion / second-order / Occam
- Blameless culture first

## Problem

- Retrospective turns into a blame session — nobody dares tell the truth
- Retrospective turns into a summary meeting — only describes process, doesn't dig root cause
- Retrospective has no action items — same mistake next time
- Retrospective has no owner / no due — not trackable
- Retrospective has no measurement — don't know if it improved
- Retrospective has no template — new hires guess
- Retrospective disconnected from daily standup / weekly report — info stream breaks
- Retrospective only within one team not cross-team — collaboration breaks
- Retrospective has no archive — knowledge stream lost
- Retrospective turns into KPI — formalism

## Pattern

```python
from dataclasses import dataclass, field
from datetime import date
from enum import Enum
from typing import List, Optional


class RetroType(str, Enum):
    SPRINT = "sprint"
    INCIDENT = "incident"
    QUARTERLY = "quarterly"
    PROJECT = "project"
    POST_RELEASE = "post_release"


class RetroSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    SEVERE = "severe"


@dataclass
class RetroFact:
    """Fact item - timeline + data + evidence"""
    timestamp: str
    description: str
    evidence_link: Optional[str] = None
    owner: str = ""


@dataclass
class RetroRootCause:
    """Root cause - 5-why chain + system layer"""
    cause_id: str
    description: str
    five_why_chain: List[str] = field(default_factory=list)
    system_level: str = ""
    owner: str = ""


@dataclass
class RetroAction:
    """Action item - SMART + owner + due"""
    action_id: str
    description: str
    owner: str
    due_date: str
    success_metric: str = ""
    status: str = "open"


@dataclass
class Retrospective:
    """Retrospective contract"""
    retro_id: str
    retro_type: RetroType
    retro_date: date
    team: str
    severity: RetroSeverity = RetroSeverity.LOW
    facilitator: str = ""
    facts: List[RetroFact] = field(default_factory=list)
    root_causes: List[RetroRootCause] = field(default_factory=list)
    actions: List[RetroAction] = field(default_factory=list)
    participants: List[str] = field(default_factory=list)
    summary: str = ""
    lessons_learned: List[str] = field(default_factory=list)
    follow_up_retro_id: Optional[str] = None

    def to_markdown(self) -> str:
        """Export markdown - archive to wiki"""
        lines = [
            f"# Retrospective {self.retro_id} — {self.retro_type.value}",
            f"**Date**: {self.retro_date}",
            f"**Team**: {self.team}",
            f"**Severity**: {self.severity.value.upper()}",
            f"**Facilitator**: {self.facilitator}",
            f"**Participants**: {', '.join(self.participants)}",
        ]
        if self.summary:
            lines.append(f"\n## Summary\n{self.summary}")
        if self.facts:
            lines.append("\n## Fact timeline")
            for f in self.facts:
                lines.append(
                    f"- [{f.timestamp}] {f.description} — owner: {f.owner}"
                )
        if self.root_causes:
            lines.append("\n## Root cause analysis")
            for rc in self.root_causes:
                lines.append(f"- [{rc.cause_id}] {rc.description} (system layer: {rc.system_level}) ")
                for i, why in enumerate(rc.five_why_chain, start=1):
                    lines.append(f"  - Why {i}: {why}")
        if self.actions:
            lines.append("\n## Action items")
            for a in self.actions:
                lines.append(
                    f"- [{a.action_id}] {a.description} — owner: {a.owner}, due: {a.due_date}, status: {a.status}"
                )
        if self.lessons_learned:
            lines.append("\n## Lessons learned")
            lines.extend(f"- {x}" for x in self.lessons_learned)
        if self.follow_up_retro_id:
            lines.append(f"\n## Follow-up retrospective\n{self.follow_up_retro_id}")
        return "\n".join(lines)
```

## Applicable

- 5+ person collaboration team
- During key project — needs iterative improvement
- After incident / hotfix — must do
- End of quarter / project — must do
- Cross-team collaboration — needs coordinated retrospective

## Not applicable

- 1-2 person project — direct 1:1
- Fully autonomous open-source community — not enforced
- One-off ad-hoc task — use and discard
- Blame-first culture — won't be effective

## Landing checklist

- [ ] Template SSOT at `resources/templates/retrospective-template.md`
- [ ] Every sprint / incident / quarter / project must do
- [ ] Blameless first — don't blame individuals
- [ ] 5-why chain — dig at least to system layer
- [ ] Action items SMART — have owner + due + measurement
- [ ] Action items -> Jira/Linear auto-create ticket
- [ ] Retrospective archived to `lessons/retrospectives/{year}/`
- [ ] Follow-up retrospective — next time verify action item landing
- [ ] Link with daily-standup / weekly-report calibration
- [ ] Quarterly review template effectiveness — continuously optimize
- [ ] High-severity retrospective -> escalate to exec
- [ ] Retrospective data -> training-strategy + L&D feedback

## Anti-patterns

- Retrospective turns into a blame session — blame-first
- Retrospective only describes process without root cause — no 5-why
- Retrospective has no action items — same mistake next time
- Retrospective has no owner / no due — not trackable
- Retrospective has no measurement — don't know if it improved
- Retrospective has no template — new hires guess
- Retrospective disconnected from daily standup / weekly report — info stream breaks
- Retrospective only within one team not cross-team — collaboration breaks
- Retrospective has no archive — knowledge stream lost
- Retrospective turns into KPI — formalism
- Retrospective has no follow-up — action items sink to the bottom
- Retrospective only upward not downward — team can't see
- Retrospective has no facilitator — drags on
- Retrospective has no blameless culture — truth missing

## Related

- Weekly report: [./weekly-report-cadence.md](./weekly-report-cadence.md) — weekly report + retrospective co-build
- Daily standup: [./daily-standup.md](./daily-standup.md) — daily standup + retrospective co-build
- Retrospective template: [./sprint-retrospective.md](./sprint-retrospective.md) — template instance
- Iteration PM handbook: [./iteration-pm-handbook.md](./iteration-pm-handbook.md) — PM retrospective cadence
- Sample: [../../product-manager/delivery/retrospective.md](../../product-manager/delivery/retrospective.md) — instance
- Template: [../../product-manager/delivery/retrospective-meeting.md](../../product-manager/delivery/retrospective-meeting.md) — meeting template
- Resource: [../../knowledge-curator/templates/retrospective.md](../../knowledge-curator/templates/retrospective.md) — SSOT
- Incident retrospective: [../lessons/failures/incident-postmortem.md](../lessons/failure-incident-postmortem.md) — incident retrospective
- Thinking frameworks: [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) + [second-order-thinking](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [ockhams-razor](../../knowledge-curator/templates/thinking/ockhams-razor.md)
