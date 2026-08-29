---
title: Hotfix Release Procedure
aliases: [hotfix-release, emergency-release, hotfix-procedure]
tags: [sre, release, hotfix, emergency, incident-response]
category: srer/release
created: 2026-08-24
updated: 2026-08-24
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [srer, engineer]
benefit: "Teams ship hotfixes fast and safely — bypassing normal release process without bypassing safety"
acceptance_criteria:
  - "5 phases: assess, fix, review, deploy, post-hotfix"
  - "includes hotfix approval requirements and bypass limits"
  - "covers post-hotfix cleanup and root cause follow-up"
related:
  - ./release-procedure.md
  - ./canary-release.md
  - ./rollback-drill.md
  - ../incident-response/respond-to-an-incident.md
---

# Hotfix Release Procedure

> **When to use:** When a critical bug in production must be fixed immediately — a normal release cycle is too slow, and the impact justifies bypassing standard process.

## Hotfix Criteria

A hotfix is warranted when ALL of these are true:

- [ ] The bug affects the critical user journey (can't complete core action)
- [ ] The impact is ongoing (not a one-time event)
- [ ] A standard release would take too long (> 1 hour to fix)
- [ ] The fix is well-understood and low-risk

A hotfix is NOT warranted for:
- Non-critical bugs (cosmetic, edge case, workaround exists)
- Bugs that can wait for the next scheduled release
- Complex fixes that need design review

## Phase 1: Assess (5 min)

| Step | Who | Action |
|---|---|---|
| 1 | On-call | Confirm the bug meets hotfix criteria |
| 2 | On-call | Identify the exact commit that introduced the bug |
| 3 | Engineer | Draft the fix (one commit, minimal change) |
| 4 | On-call | Get hotfix approval from engineering manager |

### Hotfix Approval

Hotfixes require approval from:
- **Business hours:** Engineering manager or tech lead
- **After hours:** On-call engineer + secondary on-call (two-person rule)

## Phase 2: Fix (as fast as safely possible)

### Hotfix Branch

```bash
git checkout main
git pull
git checkout -b hotfix/<description>
# Make the fix — ONE commit, minimal change
git commit -m "hotfix: <description>"
git push
```

### Hotfix Rules

- **One commit** — the fix should be atomic and revertible
- **Minimal change** — fix only the bug; no refactoring, no "while I'm here"
- **Test the fix locally** — at minimum, verify the bug is fixed
- **No new features** — hotfix is not a shortcut for feature work

## Phase 3: Review (accelerated)

| Step | Who | Action |
|---|---|---|
| 1 | Author | Create PR with `[HOTFIX]` prefix |
| 2 | Reviewer | Review within 15 minutes — focus on correctness, not style |
| 3 | Reviewer | Approve or request changes |
| 4 | Author | Merge to main |

The review checks:
- [ ] Does the fix actually address the bug?
- [ ] Does it introduce any obvious new bugs?
- [ ] Is the change minimal (no unrelated changes)?
- [ ] Are there any data migration concerns?

## Phase 4: Deploy (accelerated)

### Deployment

1. **Build** the hotfix from main
2. **Deploy to staging** — run smoke tests (5 min)
3. **Deploy to production** — canary 10% → observe 5 min → 100%
4. **Monitor** for 15 minutes post-deploy

### Rollback Ready

Have the rollback command ready before deploying:

```bash
deploy rollback <service> --to <previous_version>
```

## Phase 5: Post-Hotfix (within 24 hours)

### Required Follow-ups

- [ ] Write a postmortem (see [respond-to-an-incident.md](../incident-response/respond-to-an-incident.md))
- [ ] Add a regression test for the bug
- [ ] Review why the bug wasn't caught in staging/CI
- [ ] If the hotfix was rushed, schedule a follow-up PR to clean up
- [ ] Update the runbook if the hotfix revealed a new failure mode

### Hotfix Log

| Date | Hotfix | Bug | Duration | Root cause |
|---|---|---|---|---|
| {{YYYY-MM-DD}} | {{commit}} | {{description}} | {{minutes}} | {{why it happened}} |

## Emergency Override

In extreme cases (security vulnerability, data loss), the two-person rule can be waived:

1. **Fix immediately** — stop the bleeding
2. **Notify after** — inform engineering manager as soon as possible
3. **Postmortem required** — emergency overrides always require a postmortem

## Anti-patterns

| Anti-pattern | Why it fails | What to do instead |
|---|---|---|
| Hotfix as a feature delivery shortcut | Undermines the release process; quality suffers | Hotfix is for critical bugs only; features go through normal release |
| Skipping review because "it's urgent" | Hotfix introduces a new bug; two incidents compound | Always get a second pair of eyes, even if accelerated |
| Hotfix without a postmortem | Root cause is never addressed; same bug recurs | Postmortem within 24 hours; regression test within 48 hours |
| Complex hotfix (multiple commits, refactoring) | High risk of making things worse during an incident | One commit, minimal change; refactor in a follow-up PR |