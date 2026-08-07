---
title: Ship a release
aliases:
- I want to release a version
- release-journey
- canary-journey
- release-process-entry
tags:
- journeys
- release
- canary
- hotfix
- rollback
- release-freeze
category: engineer/infrastructure
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- engineer
benefit: launch is safe
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../../oncall-sre/incident-response/respond-to-an-incident.md
- ../strategies/harden-supply-chain.md
- ../../README.md
review_cycle: quarterly
last_verified: 2026-08-07
tacit: false
---

# I want to ship a release

> **As an** engineer, **I want to** ship a release, **so that** launch is safe.

> "Regular release / gradual rollout / hotfix / Rollback / Freeze period / data migration" reach within 2 hops release Process + canary + hotfix + rollback + release-freeze + data migration Process.

## Summary

- Regular release follows [release-process.md](../../oncall-sre/release/release.md): branch strategy / Review / build output / Launch checklist
- Gradual rollout follows [canary-release-process.md](../../oncall-sre/release/canary-release.md): small traffic -> observe -> full-volume
- Hotfix follows [hotfix-release-process.md](../../oncall-sre/release/hotfix-release.md): bypasses regular Process but still goes through review + test
- Rollback drill follows [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md): quarterly drill, not the first time during an incident
- Freeze period follows [release-freeze-process.md](../../oncall-sre/release/release-freeze.md): promotions / holidays / key nodes

## Core viewpoints

**The release is a process, not an event.** A release that is treated as a one-time event (push the button, hope for the best) is a release that will eventually cause an incident. The release process includes the pre-release checklist, the canary rollout, the observation period, the rollback drill, and the post-release retrospective. Skipping any of these steps because "this release is small" is the normalization of deviance that leads to the big incident.

**The canary is the release's immune system, and it must be given time to react.** A 1% canary that is observed for 5 minutes and then expanded to 100% is not a canary; it is a tiny blast radius with no time to detect the blast. Each canary tier must be observed for at least 1 day (covering a full business cycle) before expanding to the next tier. The canary catches the long-tail regressions that take hours to manifest (slow memory leaks, gradual error rate increases, user behavior changes).

**The post-release observation period is part of the release, not a separate activity.** The engineer who deploys the release must monitor the dashboards for at least 30 minutes after the deployment reaches 100%. Leaving immediately after the deploy button is pressed is abandoning the release. If the release causes an incident during the observation period, the engineer who deployed it is the best person to diagnose and roll back.

**The release freeze is not bureaucracy; it is risk management.** A release during a major promotion, a holiday, or a key business event has a higher blast radius if it fails, and the team is less available to respond. The release freeze is a recognition that the cost of a failed release during these periods is higher than the benefit of shipping the feature on time. The freeze is a business decision, not an engineering constraint.

**Every release must have a rollback plan that is faster than the rollout plan.** A rollout that takes 30 minutes (canary tiers, observation windows) and a rollback that also takes 30 minutes (reverse the canary tiers) means the system is degraded for 30 minutes even if the rollback is initiated immediately. The rollback must be instantaneous (feature flag off, traffic cut to previous version) and must be tested in a drill before the release.

## Key info

- **Release branch strategy comparison**: Trunk-based development (TBD) — all commits to main, feature flags guard incomplete features, release = tag on main, rollback = revert commit or deploy previous tag, best for CI/CD with fast automated tests, requires feature flag discipline. Git-flow — separate `develop` and `main` branches, `release/*` branches for stabilization, hotfix branches from `main`, best for scheduled releases with manual QA, higher branch management overhead. Release-branch — each release gets its own branch (`release/v1.2.3`), hotfixes cherry-picked to main, best for products with multiple supported versions. The Yi-family projects use trunk-based development: YiVad and YiPet deploy from main, YiAi deploys from main with feature flags for multi-provider routing.
- **Canary tier progression and observation windows**: Tier 1 (1% traffic, 1-hour observation) — check error rate, latency p50/p99, CPU/memory; Tier 2 (10% traffic, 4-hour observation) — check business metrics (conversion, engagement), user feedback; Tier 3 (50% traffic, 24-hour observation) — full business cycle, long-tail regressions (slow memory leaks, gradual error rate increase); Tier 4 (100% traffic, 30-minute post-release observation). Each tier must have a go/no-go decision by the release commander. The 1-hour minimum for Tier 1 is the most frequently violated: a 5-minute observation at 1% misses the long-tail regressions that are the entire point of canary deployment.
- **Release commander responsibilities and authority**: (1) Pre-release — verify all pre-release checklist items are complete (CI green, review approved, rollback plan documented, monitoring dashboards ready); (2) During canary — make go/no-go decision at each tier, with the authority to halt the rollout without consultation; (3) Post-release — monitor for 30 minutes after 100%, hand off to on-call engineer; (4) Incident — if the release causes an incident, the commander decides whether to roll back or roll forward (hotfix). The commander is a named individual, not "the team." The Yi-family projects currently have no formal release commander role.
- **Rollback mechanisms ranked by speed**: (1) Feature flag off — <1 second, no deployment, reversible by re-enabling the flag; (2) Traffic cut to previous version — <30 seconds, load balancer or reverse proxy config change, requires previous version to still be running; (3) Deploy previous tag — 5-15 minutes, CI/CD pipeline, requires database schema compatibility; (4) Database rollback — 30+ minutes, potentially data-lossy, last resort. The rollback mechanism must be tested in a quarterly drill; a rollback path that has never been tested is a rollback path that does not exist.
- **Release freeze calendar and exceptions**: Fixed freezes: major holidays (Chinese New Year, National Day — 7 days before + 3 days after), company-wide promotions (Double 11, 618 — 3 days before + 1 day after), quarter-end (last week of quarter for financial reporting stability). Exceptions: only P0/P1 hotfixes are allowed during freeze periods, must be approved by tech-lead + product owner, must include a post-freeze retrospective. The Yi-family projects currently have no formal release freeze policy.
- **Yi-family release cadence**: YiVad — weekly releases (Tuesday), canary 1%→10%→50%→100% over 24 hours, rollback via feature flag. YiPet — biweekly releases (Wednesday), Chrome Web Store review adds 1-3 day delay, canary not applicable (extension update is all-or-nothing), rollback via previous version upload. YiAi — continuous deployment from main, canary via multi-provider feature flag routing, rollback via `uv sync` to previous lockfile.

## Scenario description

Release / gradual rollout / hotfix / Rollback / data migration / promotion Freeze period — when releasing, engineers + primary owner need to follow standard Process to avoid incidents. This entry aggregates the 6 release-related Process items into a 2-hop path, avoiding "release by gut feel / gradual rollout without observation / hotfix skipping test / Rollback without drill / Freeze period mistaken release".

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [release-process.md](../../oncall-sre/release/release.md) · [canary-release-process.md](../../oncall-sre/release/canary-release.md) · [hotfix-release-process.md](../../oncall-sre/release/hotfix-release.md) · [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [data-migration-process.md](../infrastructure/data-migration.md) · [monitoring-governance-process.md](../process/monitoring-governance.md) |
| `lessons/wins/` | [yiai-supply-chain-hardening-win.md](../lessons/win-yiai-supply-chain-hardening.md) · [yipet-stack-migration-win.md](../lessons/win-yipet-stack-migration.md) · [yivad-aicr-phase-port.md](../lessons/win-yivad-aicr-phase-port.md) — release / migration success Case study |
| `lessons/failures/` | [ai-product-launch-lessons-summary.md](../lessons/failure-ai-product-launch-lessons.md) · [incident-postmortem-summary.md](../lessons/failure-incident-postmortem.md) — release incident Retrospective |
| `lessons/gotchas/` | [no-lockfile-supply-chain-risk.md](../lessons/gotcha-no-lockfile-supply-chain-risk.md) · [sse-ondone-guard.md](../lessons/gotcha-sse-ondone-guard.md) — common incidents during release |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) — capacity assessment before release · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) — whether to release with debt |
| `work/processes/` (Related) | [incident-response-process.md](../process/incident-response.md) — when release causes failure |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [tech-selection-evaluation-template.md](../../knowledge-curator/templates/tech-selection-evaluation.md) — design / selection before release |
| `projects/` | each project `project-management-summary.md` § release cadence + § Rollback contingency |

## Action recommendations

1. **Branch strategy**: trunk-based / git-flow / release-branch chosen by team size + release frequency; see [release-process.md](../../oncall-sre/release/release.md).
2. **Review**: all releases must do review + CI all green + at least 1 person approve; hotfix must do review, not allowed to skip.
3. **Gradual rollout**: first 1% -> 5% -> 25% -> 100%, observe 5-15 min per tier; during gradual rollout Monitoring core metric + error rate + latency.
4. **Rollback contingency**: before each release confirm Rollback path (Rollback to previous version / turn off feature flag / traffic cut to old version); quarterly drill [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md).
5. **Data migration**: follow [data-migration-process.md](../infrastructure/data-migration.md), must do dry-run + backup + Rollable + gradual rollout execution first.
6. **Freeze period**: promotions / holidays / key nodes follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md), only hotfix allowed.
7. **Hotfix**: follow [hotfix-release-process.md](../../oncall-sre/release/hotfix-release.md), bypasses regular branch strategy but still goes through review + automation test + gradual rollout.
8. **Post-release observation**: after release do not leave immediately, observe at least 30 min core metric + error rate + alert.
9. **Retrospective**: release-caused failure must do [incident-postmortem-template.md](../lessons/failure-incident-postmortem.md), Archive to [lessons/failures/bugs/](../lessons).

## Anti-patterns

- **Releasing on Friday afternoon.** A release at 4 PM on Friday means that any incident will be discovered over the weekend, when the team is at minimum staffing and response times are slowest. The release should be scheduled for early in the week (Tuesday or Wednesday) when the full team is available for the observation period and the following days.

- **Skipping the canary because "the change is too small to cause problems."** Every change, no matter how small, can cause a production incident. The canary is not proportional to the size of the change; it is proportional to the blast radius of a failure. A one-line configuration change that accidentally points production to a test database is a small change with a catastrophic blast radius.

- **Deploying multiple independent changes in a single release.** A release that contains 5 unrelated changes means that if one of them causes an incident, all 5 must be rolled back. The changes should be deployed independently, so that a rollback only affects the problematic change. If the release process is too slow to support independent deployments, the release process is the bottleneck that needs to be fixed.

- **Treating the hotfix process as a license to skip review and testing.** A hotfix that bypasses the normal release process is still a code change that can introduce new bugs. The hotfix must go through review (at least one reviewer) and must pass the CI pipeline. The only thing the hotfix bypasses is the canary tiers, and only because the cost of the current incident outweighs the risk of the hotfix.

- **Not having a designated release commander.** A release where everyone is watching the dashboards but no one is responsible for the go/no-go decision is a release with no decision-maker. The release commander is the single person who decides whether to proceed to the next canary tier, whether to roll back, and whether to escalate. The commander must be identified before the release starts.

## Related

- Related journey: [../../oncall-sre/incident-response/respond-to-an-incident.md](../../oncall-sre/incident-response/respond-to-an-incident.md) — release causes failure
- Related journey: [../strategies/harden-supply-chain.md](../process/harden-supply-chain.md) — release-period supply chain
- Related journey: [./roll-out-a-migration.md](./roll-out-a-migration.md) — release-period migration
- Upstream: [../../knowledge-curator/governance/governance.md](../../knowledge-curator/governance/governance.md) — release Process Quarterly audit
