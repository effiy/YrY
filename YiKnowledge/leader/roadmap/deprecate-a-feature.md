---
title: Deprecate a Feature
aliases: [deprecation, feature-removal, sunset]
tags: [roadmap, deprecation, lifecycle, leader]
category: leader/roadmap
created: 2026-08-18
updated: 2026-08-18
last_verified: 2026-08-18
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: quarterly
roles: [leader, producter]
benefit: "Safely deprecate and remove features with a structured process that minimizes user disruption and clearly communicates timelines"
related:
  - ./decommission-a-service.md
  - ./manage-tech-debt.md
  - ./plan-tech-roadmap.md
  - ../README.md
  - ../INDEX.md
---

# Deprecate a Feature

> **As a** tech lead, **I want to** safely deprecate and remove a feature, **so that** the product stays clean, maintenance burden is reduced, and users are smoothly transitioned.

## Definition

Feature deprecation is the process of removing a feature from a product. It has three phases: announce, warn, remove.

```
Announce ──► Warn (grace period) ──► Remove
   │              │                      │
Users told      Users see              Feature is
feature is      deprecation            gone; code
going away      notices in-app         is removed
```

## Trigger condition

- Feature has near-zero usage but costs significant maintenance effort
- Feature is being replaced by a better alternative
- Feature no longer aligns with product strategy
- Feature is causing security or compliance issues
- Feature was an experiment that didn't validate

## Step-by-step walkthrough

### Step 1: Assess the impact

Before deciding to deprecate, understand:

| Question | How to answer |
|---|---|
| **Who uses it?** | Analytics: DAU/MAU, feature usage, segment breakdown |
| **How much do they depend on it?** | Is it core to their workflow or peripheral? |
| **What's the alternative?** | Is there a migration path? Is it self-serve or manual? |
| **What's the maintenance cost?** | Person-weeks per quarter, incident count, tech debt |
| **What are the risks?** | Churn risk, reputational risk, contractual risk |

### Step 2: Make the deprecation decision

| If... | Then... |
|---|---|
| Usage < 1% of users AND low dependency | **Deprecate** with short timeline (30 days) |
| Usage < 5% of users AND migration path exists | **Deprecate** with standard timeline (90 days) |
| Usage > 5% of users OR high dependency | **Reconsider** — can you improve instead of remove? |
| Enterprise customers with contracts | **Check contracts** — you may have obligations |

### Step 3: Define the deprecation timeline

| Phase | Duration | Actions |
|---|---|---|
| **Announce** | Day 0 | Blog post, email to affected users, in-app notification, documentation update |
| **Warn** | 30–90 days | In-app deprecation banners, migration guides, support ready for questions |
| **Remove** | End of timeline | Feature removed, code deleted, documentation archived |

For enterprise customers: add a 30–60 day extension period with direct outreach from account managers.

### Step 4: Build the migration path

| Migration type | Example |
|---|---|
| **Self-serve** | "Click here to migrate your data to the new feature" |
| **Export** | "Export your data before [date] in CSV/JSON format" |
| **Manual with guide** | Step-by-step migration guide with screenshots |
| **Assisted** | Support team helps with migration (for enterprise) |

### Step 5: Communicate

Communication plan:

| Audience | Channel | Timing | Content |
|---|---|---|---|
| **All users** | Email, in-app, changelog | Day 0 (announce) | What's changing, why, when, what to do |
| **Active users** | Email, in-app | Day 30, Day 60 | Reminder + migration guide |
| **Enterprise** | Account manager | Day 0 | Personal outreach; extended timeline |
| **Internal** | Slack, meeting | Day -7 (pre-announce) | Support team briefed; FAQ prepared |

### Step 6: Execute the removal

Checklist before removing:

- [ ] All users have been notified at least 3 times
- [ ] Migration path is available and tested
- [ ] Support team has a runbook for migration issues
- [ ] Analytics confirm usage is declining
- [ ] Feature flag is ready to turn off (can be re-enabled if needed)

After removal:

- [ ] Remove feature code and tests
- [ ] Remove feature-specific infrastructure
- [ ] Archive documentation
- [ ] Update [tech debt register](./manage-tech-debt.md) — remove related items
- [ ] Post-removal monitoring: any unexpected errors or user complaints?

## Decision points and branching

| Decision point | Options | Guidance |
|---|---|---|
| Users are protesting the deprecation | Extend timeline / Improve migration / Reconsider | Extend if migration is hard; reconsider if usage is higher than estimated |
| Deprecation might cause churn | Accept the risk / Delay / Cancel | Accept if maintenance cost > churn risk; delay if churn risk is high |
| Feature is used by one large customer | Negotiate / Extend only for them / Build custom migration | Don't hold the product hostage to one customer; negotiate a transition |
| Migration path is expensive to build | Export-only / Manual migration / Extend timeline | Export-only is acceptable if the data is the main value |

## Key deliverables at each stage

| Stage | Deliverable |
|---|---|
| Assessment | Usage analysis, impact assessment, deprecation recommendation |
| Planning | Deprecation timeline, migration path, communication plan |
| Announce | Blog post, email, in-app notification, documentation |
| Warn | Migration guide, support runbook, monitoring setup |
| Remove | Code removal, infra cleanup, post-removal validation |

## Anti-patterns and common pitfalls

| Anti-pattern | Why it fails | Fix |
|---|---|---|
| Removing without warning | Users are surprised and angry | Minimum 30 days notice; 90 days for significant features |
| Deprecation with no migration path | Users are stranded | Always provide an export at minimum |
| "We'll just hide it" | Code is still there, still needs maintenance | Remove the code; hidden features are tech debt |
| Ignoring enterprise customers | Large customers have different expectations and contracts | Separate communication track; extended timelines |
| No internal communication | Support team blindsided by user questions | Brief support before public announcement |

## This product's landing instance

*To be filled in with the most recent feature deprecation. Include the feature name, the deprecation timeline, the migration path, and the outcome.*