---
title: North Star Metric — Define and Track
aliases: [north-star-metric, nsm, key-metric, product-metric]
tags: [producter, discovery, metrics, north-star, kpi]
category: producter/discovery/metrics
created: 2026-08-24
updated: 2026-08-24
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [producter, executiver, leader]
benefit: "Producters define a single north star metric that aligns the team on what success looks like"
acceptance_criteria:
  - "explains what a north star metric is and how to define one"
  - "provides a framework for choosing and validating a north star"
  - "includes YrY project examples"
related:
  - ./README.md
  - ../../frameworks/rice-ice-prioritization.md
  - ../../discovery/write-a-prd.md
  - ../../../executiver/strategy/
---

# North Star Metric

> **When to use:** When a product needs a single metric that captures the core value delivered to users. The north star aligns the entire team — product, engineering, design, and business.

## What is a North Star Metric?

A north star metric (NSM) is the **one metric** that best captures the core value your product delivers to users. It's not a revenue metric (that's a result, not the cause) — it's a measure of user behavior that drives business outcomes.

| Is a north star | Is NOT a north star |
|---|---|
| Daily active users | Revenue |
| Messages sent per day | Profit margin |
| Files processed per week | Stock price |
| Tasks completed per session | Page views (vanity metric) |

## How to Define a North Star

### 1. State your product's core value

One sentence: "Our product helps {{user}} achieve {{outcome}}."

**YiVad:** "YiVad helps admins manage projects and knowledge efficiently."
**YiAi:** "YiAi helps developers access AI capabilities through a unified API."
**YiPet:** "YiPet helps users get AI assistance while browsing any page."

### 2. Identify the action that captures this value

What user action best indicates they're getting value?

| Product | User action | Why this captures value |
|---|---|---|
| YiVad | Projects actively managed per week | A project being used = the admin is getting value |
| YiAi | Chat requests completed per day | Completed chats = the AI is serving requests |
| YiPet | Grounded chat sessions per day | Sessions with knowledge grounding = deep value |

### 3. Make it measurable

The metric must be:
- **Measurable** — you can track it with existing data
- **Actionable** — you can influence it with product changes
- **Understandable** — everyone on the team knows what it means
- **Leading** — it predicts business outcomes, not just reports them

### 4. Validate with data

Before committing to a north star, check:

- [ ] Can we measure it today? (If not, what instrumentation is needed?)
- [ ] Does it correlate with retention? (Users with high NSM should retain better)
- [ ] Does it correlate with revenue? (If applicable)
- [ ] Is it hard to game? (Can't be inflated by bots or spam)

## Input Metrics (The Levers)

The north star is the destination. Input metrics are the levers you pull to move it:

| North star | Input metrics |
|---|---|
| YiVad: Projects actively managed/week | New projects created, project return rate, features used per project |
| YiAi: Chat requests completed/day | API uptime, avg response time, chat success rate |
| YiPet: Grounded chat sessions/day | Knowledge tree coverage, RAG index freshness, scope selection rate |

## YiVad North Star Example

**North Star:** Projects actively managed per week

**Definition:** A project is "actively managed" if it has ≥ 1 issue update or cycle change in the past 7 days.

**Current baseline:** {{N}} projects/week (measure from `projects` collection, filter by `updated_at` within 7 days)

**Target:** 2x in 6 months

**Input metrics to track:**
1. New projects created per week
2. % of projects that survive past week 1 (not abandoned)
3. Average issues per project (more issues = more engagement)
4. Demo → real project conversion rate

## Anti-patterns

| Anti-pattern | Why it fails | What to do instead |
|---|---|---|
| Revenue as north star | Revenue is a lagging indicator; you can't directly improve it with product changes | Use a user-behavior metric that drives revenue |
| Multiple north stars | "3 north stars" = no north star; team can't prioritize | Pick ONE metric; everything else is an input metric |
| Vanity metric as north star | "Page views" is easy to inflate and doesn't capture value | Pick a metric that correlates with user value and retention |
| North star without baseline | Can't tell if you're improving | Measure the baseline before setting a target |