---
title: Release Freeze Management
aliases: [release-freeze, code-freeze, deployment-freeze, change-freeze]
tags: [sre, release, freeze, governance, risk]
category: srer/release
created: 2026-08-24
updated: 2026-08-24
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [srer, leader, engineer]
benefit: "Teams manage release freezes effectively — knowing what's frozen, what's exempt, and how to handle exceptions"
acceptance_criteria:
  - "defines freeze types, scope, and exceptions"
  - "includes freeze calendar and communication template"
  - "covers emergency override procedure"
related:
  - ./release-procedure.md
  - ./canary-release.md
  - ./hotfix-release.md
  - ../incident-response/respond-to-an-incident.md
---

# Release Freeze Management

> **When to use:** Before major events (holidays, conferences, quarter-end), during critical business periods, or when the system is unstable.

## Freeze Types

| Type | What's frozen | Typical duration | When |
|---|---|---|---|
| **Hard freeze** | No deployments at all | 1-7 days | Major holidays, critical business events |
| **Soft freeze** | Only bug fixes and hotfixes | 1-2 weeks | Before quarter-end, before conferences |
| **Code freeze** | No new code; config changes allowed | 1-3 days | Before a major release |

## Freeze Calendar (Example)

| Period | Type | Reason |
|---|---|---|
| Dec 20 — Jan 2 | Hard freeze | Holiday season — minimal staffing |
| Last week of quarter | Soft freeze | Quarter-end — protect revenue recognition |
| 2 days before major launch | Code freeze | Stabilize before the launch |
| Chinese New Year | Hard freeze | Holiday — minimal staffing |

## What's Frozen (and What's Not)

### Hard Freeze

| Frozen | Not Frozen |
|---|---|
| Feature deployments | Emergency hotfixes (P1 only) |
| Infrastructure changes | Security patches (critical CVEs) |
| Database migrations | Config toggles (feature flags off) |
| Dependency updates | Data fixes (no schema change) |

### Soft Freeze

| Frozen | Not Frozen |
|---|---|
| New features | Bug fixes |
| Major refactoring | Hotfixes |
| Infrastructure changes | Dependency patches (security) |
| New services | Performance improvements (low risk) |

## Freeze Communication

### Announcement (1 Week Before)

```
Subject: Release Freeze — {{dates}} ({{type}})

A release freeze is in effect from {{start}} to {{end}}.

During this period:
- {{what's frozen}}
- {{what's exempt}}

Exceptions require approval from {{approver}}.

The freeze calendar is at {{link}}.
```

### Reminder (1 Day Before)

```
Subject: REMINDER: Release freeze starts tomorrow

Release freeze: {{start}} — {{end}}
Last chance to deploy non-critical changes: today.
```

## Exception Process

### Emergency Exception (P1 Only)

1. **On-call** identifies a critical issue that requires a deployment during freeze
2. **Commander** (or engineering manager) approves the exception
3. **Deploy** with heightened monitoring (2x the normal observation period)
4. **Post-freeze review** — was the exception justified?

### Exception Request Template

```
Exception Request: {{title}}

Freeze period: {{dates}}
Change: {{what needs to be deployed}}
Risk: {{what could go wrong}}
Rollback plan: {{how to undo}}
Why now: {{why can't this wait until after the freeze?}}

Approver: {{name}} — Approved / Denied
```

## Freeze Best Practices

| Practice | Why |
|---|---|
| **Announce 1 week before** | Teams can plan their work around the freeze |
| **Define exceptions clearly** | No ambiguity about what's allowed |
| **One approver** | Clear accountability; no "I thought X approved it" |
| **Post-freeze review** | Learn from exceptions; improve the freeze policy |
| **Don't freeze too often** | > 25% of the year in freeze = process problem, not a safety measure |

## YrY Freeze Policy

| Policy | Detail |
|---|---|
| Hard freeze | Chinese New Year (7 days), National Holiday (7 days) |
| Soft freeze | Last week of each quarter |
| Code freeze | None currently — CI/CD is manual |
| Exception approver | Ruiyi (engineering lead) |

## Anti-patterns

| Anti-pattern | Why it fails | Fix |
|---|---|---|
| Freeze with no exceptions | Critical bug found; team is paralyzed | Define clear exception criteria and an approval process |
| Freeze with no communication | Teams don't know; deploy anyway | Announce 1 week before, remind 1 day before |
| Permanent freeze (> 25% of the year) | Velocity is crippled; freeze is a process smell | Review why you need so many freezes; fix the underlying instability |
| Emergency exception for non-emergency | "It's just a small change" during freeze | Exceptions are for P1 incidents only; everything else waits |