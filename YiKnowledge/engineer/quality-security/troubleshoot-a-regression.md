---
title: Troubleshoot a regression
aliases:
- I want to troubleshoot a regression
- regression-journey
- bug-triage-journey
- Regression troubleshooting entry
tags:
- journeys
- regression
- bug-triage
- root-cause
- postmortem
- oncall
category: engineer/quality-security
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- engineer
benefit: outcome is traceable
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../../oncall-sre/incident-response/respond-to-an-incident.md
- ../strategies/check-engineering-gotchas.md
- ./run-a-retrospective.md
review_cycle: quarterly
last_verified: 2026-08-07
tacit: false
---

# I want to troubleshoot a regression

> **As an** engineer, **I want to** troubleshoot a regression, **so that** outcome is traceable.

> "Production regression / performance degradation / recall rate drop / latency spike / intermittent bug" reach troubleshooting + gotcha reference + incident response + retrospective template + tech debt within 2 hops.

## Summary

- Troubleshooting process follows [incident-response-process.md](../process/incident-response.md): stop bleeding → investigate → fix → retrospective
- Gotcha reference follows [lessons/gotchas/](../lessons): 5 root cause files
- Retrospective follows [incident-postmortem-template.md](../lessons/failure-incident-postmortem.md) + [sprint-retrospective-template.md](../process/sprint-retrospective.md)
- Tech debt reference follows [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md)

## Core viewpoints

**Stop the bleeding before you diagnose the wound.** The first action in any regression is to restore service, not to find the root cause. Rollback, feature-flag off, or traffic shift must happen in the first 5 minutes. The investigation happens after users are no longer impacted. A team that debugs for 30 minutes while the outage continues has inverted the priority.

**The root cause is never where you first look.** The initial symptom (high latency, error spike, missing data) is almost always a downstream effect of a change that happened earlier. The most productive first question is "what changed in the last deploy" rather than "what is the error message." Git bisect on the deployment history finds the introducing change faster than reading stack traces.

**A regression without a regression test is a regression waiting to happen again.** The fix is not complete until a test exists that would have caught the regression before it reached production. This test must be added to the CI pipeline, not just written in a notebook. The cost of the test is the insurance premium against the same incident recurring.

**The gotcha library is the first thing to check, not the last.** Common regressions (SSE race conditions, FSEvents silent drops, lockfile drift, jsxDEV mismatches) have known signatures and known fixes. Checking the gotcha library before starting a deep investigation saves hours of reinventing the diagnosis. The gotcha that matches the symptom pattern is the right place to start.

**5 Whys must go past the human error to the process gap.** The first "why" is almost always a human mistake ("the engineer forgot to check the lockfile"). The fifth "why" should reveal a process gap ("the CI pipeline did not block merges without a lockfile audit"). If the root cause is attributed to human error and the investigation stops there, the same regression will happen with a different human next quarter.

## Key info

- **Regression response time SLA framework (4 severity tiers)**: P0 (Critical) — complete service outage, data loss, security breach; restore service within 5 minutes (rollback, feature-flag off, or traffic shift); P1 (Major) — core feature broken for > 50% of users; restore within 1 hour; P2 (Minor) — non-core feature degraded, workaround exists; fix within 24 hours; P3 (Cosmetic) — visual glitch, no functional impact; fix in next sprint. The first action in any regression is to restore service, not to find the root cause. The investigation happens after users are no longer impacted. The Yi-family standard: rollback takes priority over debugging — a team that debugs for 30 minutes while the outage continues has inverted the priority.
- **Regression root cause diagnostic toolkit (5 methods, ordered by speed)**: (1) Git bisect — binary search through deployment history to find the introducing commit; faster than reading stack traces for most regressions; (2) Differential diagnosis — compare metrics between affected and unaffected users/regions/time windows to isolate the change; (3) Gotcha library check — check `lessons/gotchas/` for known signatures (SSE race conditions, FSEvents silent drops, lockfile drift, jsxDEV mismatches); the gotcha that matches the symptom pattern is the right place to start; (4) Log diffing — compare error logs from before and after the regression onset; (5) Traffic replay — replay production traffic against the previous version to confirm the regression is in the new code. The most productive first question is "what changed in the last deploy" rather than "what is the error message."
- **Regression test requirement protocol (3 mandatory tests per regression)**: (1) Reproduction test — a test that fails on the buggy version and passes on the fixed version; this is the minimum viable regression test; (2) Boundary test — test the edge conditions that triggered the regression (null inputs, empty arrays, concurrent requests, timeout conditions); (3) Integration/contract test — if the regression crossed service boundaries, add a contract test that would catch the interaction failure. The fix is not complete until a test exists that would have caught the regression before it reached production. This test must be added to the CI pipeline, not just written in a notebook. The cost of the test is the insurance premium against the same incident recurring.
- **5-Whys regression analysis template (must terminate at process gap, not human error)**: Why 1: What was the symptom? → Why 2: What was the proximate cause? → Why 3: Why wasn't this caught earlier? → Why 4: What process gap allowed this? → Why 5: What systemic condition created this gap? Example: Why 1: SSE streaming stopped → Why 2: onDone not firing → Why 3: No contract test for SSE frame ordering → Why 4: SSE testing not in CI pipeline → Why 5: No mandatory streaming contract test requirement in the definition of done. If the chain terminates at human error, the same regression will happen with a different human next quarter. Root cause types: process gap, code defect, configuration error, insufficient capacity, monitoring gap, third-party dependency.
- **Regression prevention mechanisms (4 gates)**: (1) CI gate — regression test added to PR pipeline, blocks merge on failure; (2) Canary deployment — deploy to 5% of users, monitor error rate and latency for 30 minutes before full rollout; (3) Feature flags — all new features behind flags, instant rollback by turning flag off (no redeploy needed); (4) Monitoring alerts — alert on metric regression (error rate > baseline × 2, latency P95 > baseline × 1.5) with pager notification. The gotcha library is a prevention mechanism — after every regression, check if a corresponding gotcha exists; if not, create one. The regression fix is the input; the gotcha, test, and alert are the output.
- **Yi-family regression history and practices (2026-08)**: Known regressions documented in gotcha library: (1) macOS FSEvents silent drop — `watchfiles`/`watchdog` miss file events; fix: apscheduler polling; (2) React jsxDEV mismatch — dev-mode React + production NODE_ENV; fix: `--mode production`; (3) SSE onDone guard — streaming response onDone not firing consistently; fix: guard in SSE parser; (4) No lockfile supply chain risk — YiAi had no lockfile; fix: `uv` + `pip-audit`; (5) Vite→Rsbuild migration — plugins had no direct equivalent; fix: custom Rsbuild plugins. Gotcha review cycle: quarterly, verify whether each issue is still reproducible on current versions. Gap: no formal regression test requirement in CI; regression tests are added ad-hoc.

## Scenario

When production regression / intermittent failure / performance degradation / recall rate drop / latency spike occurs, oncall + main owner + engineer need to quickly stop bleeding + investigate root cause + fix + retrospective. This entry aggregates troubleshooting process + gotcha root cause reference + incident response + retrospective template + tech debt into 2-hop paths, avoiding "investigating by intuition / repeatedly stepping on gotchas / retrospective missing template / tech debt ignored".

## 2-hop reachability paths

| Hop 1 (category/leaf)  | Hop 2 (specific file)  |
|---|---|
| `work/processes/` | [incident-response-process.md](../process/incident-response.md) · [hotfix-release-process.md](../../oncall-sre/release/hotfix-release.md) · [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md) · [monitoring-governance-process.md](../process/monitoring-governance.md) · [oncall-rotation-process.md](../process/oncall-rotation.md) · [chaos-engineering-process.md](chaos-engineering.md) |
| `lessons/gotchas/` | [sse-ondone-guard.md](../lessons/gotcha-sse-ondone-guard.md) · [react-jsxdev-mismatch.md](../lessons/gotcha-react-jsxdev-mismatch.md) · [macos-fsevents-silent-drop.md](../lessons/gotcha-macos-fsevents-silent-drop.md) · [no-lockfile-supply-chain-risk.md](../lessons/gotcha-no-lockfile-supply-chain-risk.md) · [vite-to-rsbuild-migration.md](../lessons/gotcha-vite-to-rsbuild-migration.md) |
| `lessons/failures/` | [incident-postmortem-summary.md](../lessons/failure-incident-postmortem.md) · [incident-postmortem-template.md](../lessons/failure-incident-postmortem.md) · [ai-product-launch-lessons-summary.md](../lessons/failure-ai-product-launch-lessons.md) · [bugs/](../lessons) — historical regression archive |
| `lessons/wins/` | [yiai-rag-hybrid-retrieval-win.md](../lessons/win-yiai-rag-hybrid-retrieval.md) · [yivad-vitest-phase-{one,two,three,four}-win.md](../lessons) — test coverage preventing regression cases |
| `tech/infra/` | [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) · [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) — regression may be triggered by debt / capacity |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) — root cause thinking tools |
| `methodology/engineering-patterns/` | [evaluation-driven-development-pattern.md](../engineering/evaluation-driven-development.md) · [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md) — anti-regression patterns |
| `work/meetings/` | [review-meeting-template.md](../../product-manager/delivery/review-meeting.md) · [retrospective-sample.md](../../product-manager/delivery/retrospective.md) — retrospective meetings |
| `resources/templates/` | [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) · [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) |
| `resources/prompts/` | [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [agent-tool-use-prompt.md](../../ai-engineer/methodology/prompts/agent-tool-use.md) — troubleshooting aids |
| `projects/` | Each project's `project-management-summary.md` §risk + §rollback plan |

## Action recommendations

1. **Stop bleeding first**: rollback / grayscale switchback / rate limit / degradation / feature flag off; do not investigate root cause first; see [incident-response-process.md](../process/incident-response.md).
2. **Triage**: P0 (all users blocked) / P1 (some users) / P2 (experience degraded) / P3 (potential hidden issue); determines response level + notification scope.
3. **Binary search locating**: use git bisect / feature flag to binary search the introducing commit / config change / data change.
4. **Gotcha reference**: first scan [lessons/gotchas/](../lessons) 5 files to see whether to reproduce historical root causes; common ones: sse-ondone / jsxdev / fsevents / no-lockfile / vite-rsbuild.
5. **Monitoring**: check logs + traces + metrics + user feedback; do not conclude from a single signal; see [monitoring-governance-process.md](../process/monitoring-governance.md).
6. **Retrospective**: hold retrospective meeting within 24h, following [incident-postmortem-template.md](../lessons/failure-incident-postmortem.md), archive to [lessons/failures/bugs/](../lessons); principles: focus on the issue not the person / 5-whys root cause / improvements land in process.
7. **5 whys**: ask 5 consecutive whys to chase root cause; do not stop at the first symptom layer.
8. **Regression test**: after fix, must add regression test cases covering the bug; see [evaluation-driven-development-pattern.md](../engineering/evaluation-driven-development.md).
9. **Tech debt**: if root cause is tech debt, register in [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) and follow [quarterly-tech-debt-process.md](quarterly-tech-debt.md) to pay down.
10. **Drill**: quarterly run [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md) + [chaos-engineering-process.md](chaos-engineering.md) to prevent "rollback can't be used / failure scope expands".

## Anti-patterns

- **Investigating the root cause before rolling back.** The team spends 30 minutes reading logs and tracing code paths while users are still experiencing the regression. The rollback must happen in the first 5 minutes. The investigation happens after the service is restored.

- **Ending the investigation at the first plausible explanation.** The first hypothesis that fits the symptoms is often wrong because it ignores the timing. A regression that started at 14:32 was caused by something that deployed at or before 14:32. If the proposed root cause does not align with the timeline, it is not the root cause.

- **Fixing the symptom instead of the root cause.** Restarting the server, clearing the cache, or adding a retry band-aid suppresses the symptom without addressing the underlying bug. The regression will recur, and the next time it may be worse. The symptom fix is acceptable as a temporary stop-bleeding measure, but it must be followed by a root cause fix within the same sprint.

- **Skipping the retrospective because "it was a small regression."** Small regressions teach the same lessons as large ones, and the retrospective process is the mechanism that turns a regression into a process improvement. A regression without a retrospective is a missed learning opportunity. The retrospective should happen within 24 hours, not next sprint.

- **Blaming the engineer instead of the process.** A retrospective that concludes "the engineer should have been more careful" is a failed retrospective. The correct conclusion identifies the process gap that allowed the error to reach production (missing CI check, insufficient code review, inadequate test coverage) and assigns an action item to close that gap.

## Related

- Same category journey: [../../oncall-sre/incident-response/respond-to-an-incident.md](../../oncall-sre/incident-response/respond-to-an-incident.md) — incident response main entry
- Same category journey: [../strategies/check-engineering-gotchas.md](../process/check-engineering-gotchas.md) — gotcha reference
- Same category journey: [./run-a-retrospective.md](../process/run-a-retrospective.md) — retrospective
- Same category journey: [../tools/set-up-testing-infrastructure.md](../engineering/set-up-testing-infrastructure.md) — anti-regression tests
- Upstream: [../../engineer/lessons/gotchas/README.md](../lessons/README.md) — gotcha leaf entry
