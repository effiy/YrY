---
title: Rollback Drill Procedure
aliases: [rollback-drill, rollback-procedure, rollback-practice]
tags: [sre, release, rollback, drill, reliability]
category: srer/release
created: 2026-08-24
updated: 2026-08-24
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [srer, engineer]
benefit: "Teams practice rollbacks regularly so that when a real rollback is needed, it's a routine operation, not a panic"
acceptance_criteria:
  - "step-by-step rollback procedure with roles and timing"
  - "includes pre-rollback checklist and post-rollback validation"
  - "covers both automated and manual rollback paths"
related:
  - ./release-procedure.md
  - ./README.md
  - ../incident-response/respond-to-an-incident.md
---

# Rollback Drill Procedure

> **When to use:** Practice rollbacks monthly. A rollback that takes 2 minutes in a drill takes 20 minutes in a panic. Drills turn panic into muscle memory.

## Drill cadence

- **Frequency:** Monthly (schedule on the team calendar)
- **Duration:** 30 minutes
- **Participants:** On-call engineer + one other engineer (buddy system)
- **Environment:** Staging first, then production (after staging is clean)

## When to rollback (decision triggers)

A rollback is warranted when:

- [ ] Error rate exceeds 5x baseline for > 2 minutes
- [ ] P99 latency exceeds 3x baseline for > 2 minutes
- [ ] Critical user journey is broken (cannot complete core action)
- [ ] Data corruption or loss is detected
- [ ] Security vulnerability is discovered in the new release

**Do NOT rollback if:** the issue is minor, has a quick forward-fix, and doesn't affect the critical user journey. Forward-fix is always preferred when safe.

## Rollback procedure

### Phase 1: Decide (2 min)

| Step | Who | Action |
|---|---|---|
| 1 | On-call | Acknowledge the alert/issue |
| 2 | On-call | Assess severity against decision triggers above |
| 3 | On-call | Announce decision in `#incidents` channel: "Rolling back {{service}} {{version}} due to {{reason}}" |

### Phase 2: Execute (5 min)

| Step | Who | Action |
|---|---|---|
| 1 | On-call | Run rollback command: `deploy rollback {{service}} --to {{previous_version}}` |
| 2 | On-call | Verify deployment status: `deploy status {{service}}` |
| 3 | Buddy | Monitor dashboards during rollback for anomalies |

### Phase 3: Validate (5 min)

| Step | Who | Action |
|---|---|---|
| 1 | On-call | Run smoke tests against the rolled-back version |
| 2 | On-call | Verify error rate, latency, and throughput return to baseline |
| 3 | Buddy | Confirm critical user journey is functional |
| 4 | On-call | Announce completion in `#incidents`: "Rollback complete. {{service}} now at {{previous_version}}. Monitoring." |

### Phase 4: Post-rollback (ongoing)

| Step | Who | Action |
|---|---|---|
| 1 | On-call | Monitor for 15 minutes post-rollback |
| 2 | On-call | Create a bug ticket for the issue that caused the rollback |
| 3 | Team | Postmortem within 24 hours (see [respond-to-an-incident](../incident-response/respond-to-an-incident.md)) |

## Manual rollback (fallback)

If the automated rollback fails:

1. **Database:** Run the reverse migration: `migrate down {{service}} --to {{previous_version}}`
2. **Infrastructure:** Revert the infrastructure change: `infra apply --revision {{previous_revision}}`
3. **Application:** Deploy the previous artifact: `deploy {{service}} --version {{previous_version}}`

## Drill success criteria

A drill is successful when:

- [ ] Rollback completed within 10 minutes of the decision
- [ ] No data loss occurred
- [ ] All smoke tests passed after rollback
- [ ] Both on-call and buddy participated
- [ ] Post-drill notes captured any friction points

## Post-drill review

| Question | Answer |
|---|---|
| How long did the rollback take? | {{minutes}} |
| What slowed us down? | {{friction points}} |
| Did the automated rollback work? | {{yes/no — if no, why?}} |
| Were dashboards clear during the rollback? | {{yes/no}} |
| What should we improve before next month's drill? | {{action items}} |

## Anti-patterns

| Anti-pattern | Why it fails | What to do instead |
|---|---|---|
| Only practicing in staging | Production has different config, scale, and pressure | Practice in production with a low-risk change |
| "We'll figure it out when we need to" | First real rollback takes 30+ minutes of panic | Monthly drills make rollback a 5-minute routine |
| No buddy system | On-call is alone under pressure; mistakes compound | Always have a second person during rollback |
| Skipping post-drill review | Friction points are forgotten; same problems next month | Document every friction point and fix before the next drill |