---
title: wayfinder
name: wayfinder
description: >
  Plan a large piece of work that's too big for a single agent session.
  Use this skill when the user describes a task that spans multiple projects,
  multiple sessions, or weeks of work. The skill creates a shared map of
  decision tickets — each a self-contained question that must be resolved
  before the path forward is clear. Work through them one at a time until
  the way to the destination is visible. Trigger words: wayfinder, 路线图,
  大型规划, roadmap, 长期任务, 多阶段, multi-session, 分阶段, 大项目规划,
  big project, 工期评估, 范围太大.
  Do NOT trigger for: tasks that fit in one session, or when a simple
  `/write-plan` would suffice.
lifecycle: active
user_invocable: true
status: stable
type: skill
source: internal
created: 2026-08-21
updated: 2026-08-21
category: aier/skills/wayfinder
review_cycle: quarterly
roles:
  - engineer
  - leader
  - aier
tags:
  - skill
  - ai
  - planning
  - roadmap
  - wayfinder
chip: ai-workflow
---

# wayfinder

> Plan work larger than one session. Inspired by mattpocock's wayfinder —
> adapted for the YrY monorepo where large work spans three projects and
> a knowledge base.

## What this skill does

- Take a large, ambiguous goal and break it into decision tickets — each
  a self-contained question that must be resolved.
- Work through decision tickets one at a time, each resolution narrowing
  the uncertainty.
- Produce a phased roadmap with clear decision gates between phases.
- Surface cross-project dependencies and risks early.
- Output a wayfinder map that can be handed off between sessions.

## What this skill does NOT do

- Does NOT execute any work — it only plans.
- Does NOT create detailed implementation plans for each phase (that's
  `/write-plan`'s job, once a phase is ready).
- Does NOT estimate time — it identifies decisions and dependencies,
  not person-days.
- Does NOT replace project management tools — it's an agent planning
  tool, not a Gantt chart.

## Workflow

```
Large goal stated
  → Phase 1: Map the territory
      Identify all unknowns, cross-project touchpoints, and risks
  → Phase 2: Create decision tickets
      Each unknown becomes a decision ticket
      Each ticket is a self-contained question
  → Phase 3: Resolve tickets
      Work through tickets one at a time
      Each resolution reduces uncertainty
  → Phase 4: Draft the roadmap
      Phased plan with decision gates
      Each phase is small enough for one session
  → Phase 5: Handoff
      The wayfinder map is a living document
      Next session picks up where this one left off
```

### Decision ticket template

```markdown
## DT-00X: [Question]

### Context
[What we know so far]

### What we need to decide
[The specific question]

### Options
| Option | Pros | Cons |
|--------|------|------|
| A | ... | ... |
| B | ... | ... |

### Cross-project impact
- YiVad: [affected? how?]
- YiAi: [affected? how?]
- YiPet: [affected? how?]

### Blocker for
- [What can't proceed until this is resolved]

### Resolution
[Filled in when decided]
**Decision**: [What we chose]
**Rationale**: [Why]
**Date**: YYYY-MM-DD
```

### YrY-specific wayfinding rules

1. **Cross-project decisions first**: Any decision that affects the RPC
   envelope, SSE contract, or shared field names must be resolved before
   per-project decisions.
2. **Backend decisions before frontend**: YiAi decisions (API shape, data
   model) precede YiVad/YiPet decisions (UI, state management).
3. **YiKnowledge impact**: Does the work create new knowledge entries?
   Update existing ones? Change the KB structure?
4. **Degradation decisions**: Every new API dependency needs a degradation
   decision — what happens when it's unavailable?
5. **CLAUDE.md updates**: Large work often changes project conventions.
   Plan for CLAUDE.md updates as part of the roadmap.

### Roadmap template

```markdown
## Wayfinder Map: [Goal]

### Status
- Decision tickets: N resolved / M total
- Last updated: YYYY-MM-DD
- Next session: [what to work on next]

### Decision tickets
| ID | Question | Status | Blocks |
|----|----------|--------|--------|
| DT-001 | [question] | resolved | Phase 2 |
| DT-002 | [question] | open | Phase 1 |
| DT-003 | [question] | open | — |

### Phases
| Phase | Scope | Decision gate | Est. sessions |
|-------|-------|---------------|---------------|
| 1 | [scope] | DT-001, DT-002 resolved | 1-2 |
| 2 | [scope] | DT-003 resolved | 2-3 |
| 3 | [scope] | All decisions resolved | 1-2 |

### Cross-project dependency graph
```
YiAi (Phase 1) ──→ YiVad (Phase 2) ──→ YiPet (Phase 2)
                 └─→ YiKnowledge (Phase 3)
```

### Risk register
| Risk | Impact | Mitigation |
|------|--------|------------|
| ... | low/med/high | ... |
```

## Rules

| # | Rule | Rationale |
|---|------|-----------|
| 1 | Every unknown is a decision ticket | If it's not written down, it's not being tracked |
| 2 | One question per ticket | Compound questions can't be resolved cleanly |
| 3 | Resolve blocking tickets first | Don't work on Phase 2 until Phase 1's decisions are made |
| 4 | Cross-project decisions before per-project | The contract must be stable before consumers build on it |
| 5 | Each phase fits in one session | If a phase is too big, split it |
| 6 | The map is a living document | Update it as decisions are made and new unknowns emerge |
| 7 | Don't estimate time | Wayfinding is about decisions, not deadlines |

## Borders

| Boundary | Permission |
|----------|-----------|
| Project source files | read |
| CLAUDE.md files | read |
| YiKnowledge/** | read |
| Wayfinder map output | write to conversation or file (user's choice) |

## Supporting resources

- [brainstorm/SKILL.md](../brainstorm/SKILL.md) — for resolving individual decision tickets
- [write-plan/SKILL.md](../write-plan/SKILL.md) — for detailed planning once a phase is ready
- [handoff/SKILL.md](../handoff/SKILL.md) — for handing off between wayfinding sessions
- [YiVad/CLAUDE.md](../../../YiVad/CLAUDE.md) — project constraints
- [YiAi/CLAUDE.md](../../../YiAi/CLAUDE.md) — project constraints
- [YiPet/CLAUDE.md](../../../YiPet/CLAUDE.md) — project constraints

## Fallback

| Situation | Behavior |
|-----------|----------|
| Goal is too vague to map | Run `/brainstorm` first to clarify the goal |
| User wants a quick estimate, not a full map | Give a rough outline; don't force the full wayfinder process |
| Decision ticket is unresolvable without external input | Flag it; suggest who needs to be consulted |
| Work is actually small enough for one session | Downgrade to `/write-plan`; don't over-engineer the planning |