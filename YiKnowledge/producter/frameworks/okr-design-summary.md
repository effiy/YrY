---
title: OKR Design Guide
tags: [framework, okr, goals, producter]
category: producter/frameworks
created: 2026-08-21
updated: 2026-08-21
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [producter, executiver, leader]
benefit: "PMs and leaders design effective OKRs that drive outcomes, not just track activity"
related:
  - ./README.md
  - ../../../okr/README.md
  - ../../../okr/2026-Q3/goals/
---

# OKR Design Guide

> **OKRs (Objectives and Key Results) align teams around measurable outcomes.** Good OKRs tell you what to achieve and how to know you've achieved it.

## Structure

| Component | Definition | Example |
|-----------|-----------|---------|
| **Objective** (O) | A qualitative goal — inspiring, memorable, directional | "YiKnowledge becomes the single source of truth for all project decisions" |
| **Key Results** (KR) | 3-5 measurable outcomes that prove the objective is achieved | "KR1: 0 broken cross-references in project README links" |

## Good vs bad KRs

| Bad KR | Why it's bad | Good KR |
|--------|-------------|---------|
| "Improve documentation" | Not measurable | "Documentation coverage reaches 80% (from 49%)" |
| "Write 10 ADRs" | Activity, not outcome | "All YiAi architectural decisions have formal ADRs" |
| "Make the app faster" | No baseline, no target | "BRD generation time reduced from 4h to 15min" |
| "Launch BRD agent" | Binary — already done or not | "BRD agent handles 80% of drafts without human edits" |

## KR types

| Type | Measures | Example |
|------|----------|---------|
| **Outcome** | User behavior change | "70% of after-sales engineers use BRD agent weekly" |
| **Output** | What was built | "BRD agent launched with 5 BRD sections" |
| **Quality** | How well it works | "BRD drafts require ≤2 edits before approval" |

> Prefer outcome KRs. Output KRs track activity, not impact.

## OKR anti-patterns

- **KRs are tasks, not results.** "Write tests" is a task. "Test coverage reaches 60%" is a result.
- **Objectives are bland.** "Improve quality" means nothing. "Every refactor is safe — zero regression bugs from code changes" is specific and inspiring.
- **Too many OKRs.** 3-5 objectives with 3-5 KRs each is the max. More than that and nothing gets done.
- **Set and forget.** OKRs should be reviewed weekly. If a KR is no longer relevant, replace it.
- **100% achievement is the goal.** If you hit all KRs, you aimed too low. 70% achievement is a stretch goal well-pursued.