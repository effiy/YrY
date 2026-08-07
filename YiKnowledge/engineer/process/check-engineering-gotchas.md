---
title: Check engineering gotchas
aliases:
- i-want-to-check-engineering-gotchas
- engineering-gotchas-entry
tags:
- journeys
- engineering
- gotcha
- tech-debt
- process
category: engineer/process
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- engineer
benefit: context is reachable
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../../engineer/lessons/gotchas/README.md
- ../../engineer/lessons/failures/README.md
- ../../oncall-sre/observability/README.md
- ../../README.md
review_cycle: quarterly
tacit: false
---

# I want to check engineering gotchas

> **As an** engineer, **I want to** check engineering gotchas, **so that** context is reachable.

> "Has anyone hit this trap before" — reach gotcha, failure retrospective, tech debt and process traps within 2 hops.

## Summary
- Implicit gotchas like macOS/Vite/React have been captured as searchable files
- Failure retrospective (incident retrospective, AI launch lessons, bug library) one-stop index
- Tech-debt inventory + engineering process traps + tool comparison triadic cross-reference

## Core viewpoints

- **The cost of a gotcha is not the bug itself -- it is the re-discovery cost multiplied by every engineer who hits it independently.** When a macOS FSEvents silent-drop bug costs one engineer four hours, and five more engineers each spend four hours debugging it from scratch, the true cost is 24 hours, not 4. A single searchable gotcha file converts that linear cost into a one-time lookup.

- **Gotcha files are worthless if they are not discoverable at the moment of need.** The engineer staring at a cryptic error message at 11 PM is not going to browse a knowledge base directory tree. The gotcha must be indexed by the exact error message, stack trace signature, or symptom description that appears in the terminal. Grep-ability is the primary design constraint.

- **Failure retrospectives and gotchas serve different purposes and must not be conflated.** A gotcha documents a reproducible technical trap with a known fix (e.g., "React jsxDEV mismatch in dev mode"). A failure retrospective documents a systemic breakdown with root causes (e.g., "AI product launch failed due to insufficient load testing"). Conflating them buries actionable fixes under narrative weight.

- **The tech-debt inventory is a map, not a to-do list -- its primary value is preventing uninformed decisions.** When a team chooses to build on a known-brittle module without checking the tech-debt inventory, they are making a decision with incomplete information. The inventory exists to answer "what are we betting against?" before the bet is placed.

- **Tool comparison is a one-time public good that prevents recurring private research costs.** Every engineer who independently evaluates Biome vs. ESLint vs. Prettier is duplicating work that someone else already did. A single comparison file with dated findings and a `last_verified` field converts private research into public infrastructure, and the `last_verified` field ensures staleness is visible.

## Key info

- **Gotcha file format specification (6 required fields)**: (1) Symptom — the exact error message, stack trace signature, or behavioral description that the engineer will see; this is the primary grep target; (2) Root cause — why the issue occurs, in technical terms; (3) Reproduction — minimum steps to trigger the issue; (4) Fix — the exact commands or code changes to resolve it; (5) Prevention — how to avoid this issue in the future (CI check, lint rule, documentation); (6) Applicable versions — the specific versions of tools/frameworks where this was observed. The Yi-family gotcha files follow this format: `gotcha-{topic}-{symptom}.md` in `engineer/lessons/gotchas/`.
- **Yi-family gotcha catalog (5 known gotchas)**: (1) macOS FSEvents silent drop — `watchfiles` and `watchdog` both silently miss file events on this Mac; fix: use apscheduler polling instead of filesystem events; prevention: CI check for watchfiles/watchdog dependency; (2) React jsxDEV mismatch — dev-mode React plugin + production `NODE_ENV` define = `jsxDEV is not a function`; fix: chat bundle dev script uses `--mode production`; prevention: CI check for NODE_ENV consistency; (3) Vite → Rsbuild migration — Vite plugins (svg-sprite, views-glob) have no direct Rsbuild equivalent; fix: write custom Rsbuild plugins; prevention: plugin compatibility audit before migration; (4) SSE onDone guard — streaming response `onDone` not firing consistently; fix: add guard in SSE parser; prevention: contract test for SSE frame ordering; (5) No lockfile supply chain risk — YiAi has no lockfile; fix: introduce `uv` + `pip-audit`; prevention: CI blocks commits without lockfile. Each gotcha has a corresponding file in `engineer/lessons/gotchas/`.
- **Gotcha discovery sources (5 channels)**: (1) Development incidents — bugs that took > 2 hours to debug; the threshold ensures only non-obvious issues are captured; (2) Production incidents — postmortems that identify a specific technical trap; (3) Onboarding friction — issues that new team members hit repeatedly; (4) Build/deploy failures — CI failures with non-obvious root causes; (5) Cross-project porting — issues that arise when porting code between projects (YiVad ↔ YiPet). The gotcha file is written within 24 hours of resolution, while the context is fresh. The Yi-family standard: any bug that takes > 2 hours to debug must produce a gotcha file or a justification for why not.
- **Gotcha vs. failure retrospective vs. bug report distinction**: Gotcha — reproducible technical trap, known fix, < 1 page, written for the next engineer who hits it; Failure retrospective — systemic breakdown, root cause analysis, 3-5 pages, written for the organization to learn from; Bug report — specific instance of incorrect behavior, may or may not have a known fix, written for tracking and resolution. The distinction matters because they serve different audiences and have different shelf lives. A gotcha is useful for years; a bug report is useful until the bug is fixed; a failure retrospective is useful for as long as the systemic conditions persist.
- **Gotcha maintenance and staleness management**: Each gotcha file has a `last_verified` date and `applicable_versions` field. Gotchas are reviewed quarterly: (1) Is the issue still reproducible on current versions? (2) Has the fix changed? (3) Is the prevention still valid? If a gotcha is no longer applicable (e.g., the tool version where it occurred is no longer in use), mark it as `status: resolved` and move to archive. If the issue is still applicable, update `last_verified`. The Yi-family gotcha review is part of the quarterly tech debt review.
- **Yi-family gotcha management state (2026-08)**: 5 gotcha files in `engineer/lessons/gotchas/`, all with `last_verified: 2026-08-07`. The gotcha catalog covers the most common issues across all 3 projects. Gap: no formal gotcha discovery process (the "> 2 hours to debug" rule is not enforced); gotchas are written when someone remembers to write them. The gotcha index (`check-engineering-gotchas.md`) provides 2-hop access to all gotchas, failures, and tech debt.

## Scenario

When coding hits weird behavior, doing risk scan before launch, or doing tech-debt inventory, engineers need to first check "have predecessors hit the same trap". This entry aggregates leaves related to engineering traps from `lessons/gotchas/`, `lessons/failures/`, `tech/infra/`, `work/processes/`, `work/tools/` into a 2-hop path.

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `../../engineer/lessons/gotchas` | [macos-fsevents-silent-drop.md](../lessons/gotcha-macos-fsevents-silent-drop.md) · [vite-to-rsbuild-migration.md](../lessons/gotcha-vite-to-rsbuild-migration.md) · [react-jsxdev-mismatch.md](../lessons/gotcha-react-jsxdev-mismatch.md) |
| `../../engineer/lessons/failures` | [incident-postmortem-summary.md](../lessons/failure-incident-postmortem.md) · [incident-postmortem-template.md](../lessons/failure-incident-postmortem.md) · [ai-product-launch-lessons-summary.md](../lessons/failure-ai-product-launch-lessons.md) · [bugs/](../lessons) |
| `../../oncall-sre/observability` | [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) · [tech-debt-inventory-template.md](../../oncall-sre/observability/tech-debt-inventory.md) · [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [capacity-and-cost-template.md](../../oncall-sre/observability/capacity-and-cost.md) |
| `../../engineer/processes` | [incident-response-process.md](../process/incident-response.md) · [hotfix-release-process.md](../../oncall-sre/release/hotfix-release.md) · [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md) · [dependency-upgrade-process.md](../engineering/dependency-upgrade.md) · [data-migration-process.md](../infrastructure/data-migration.md) · [disaster-recovery-drill-process.md](../infrastructure/disaster-recovery-drill.md) |
| `../../engineer/tools` | [biome-eslint-prettier-summary.md](../engineering/biome-eslint-prettier.md) · [claude-code-tips-summary.md](../engineering/claude-code-tips.md) · [vllm-ollama-deployment-summary.md](../engineering/vllm-ollama-deployment.md) |

## Action recommendations

1. First `grep` the key error message to see whether `lessons/gotchas/` already has a same-named gotcha
2. If hit, follow the gotcha file's solution; if not, write a new one, frontmatter `lifecycle: active` + `tacit: true`
3. For failure-class issues, first check `incident-postmortem-template.md`, fill the incident retrospective by template and archive to `lessons/failures/bugs/`
4. Tech-debt inventory via `tech-debt-inventory-template.md`, quantify interest and paydown priority
5. For tool selection, look at existing comparisons in `work/tools/` to avoid duplicate research
6. Monthly review: scan gotchas whose `last_verified` is over half a year, verify whether still reproducible

## Anti-patterns

- **Writing a gotcha file that describes the symptom without the root cause.** A gotcha that says "macOS file watching is broken" without explaining why (FSEvents silently drops events on this specific hardware/kernel combination) and how to verify (watchdog and watchfiles both fail) leaves the next engineer uncertain whether the issue applies to their context. The next person will re-debug it anyway.

- **Treating the gotcha directory as a write-only archive.** Teams that enthusiastically write gotchas during incidents but never review or update them end up with a graveyard of stale advice. A gotcha whose `last_verified` is two years old is worse than no gotcha, because it may recommend a solution that no longer works or describe a bug that was fixed three releases ago.

- **Skipping the tech-debt inventory because "we already know what's broken."** Tacit knowledge about tech debt is unreliable -- different team members have different mental lists, and the most painful debt is often invisible to the people who live with it daily. Without a written inventory with quantified interest and paydown priority, tech debt discussions devolve into whoever complains loudest.

- **Running a failure retrospective without linking it to the gotcha index.** An incident postmortem that identifies a root cause but does not check whether a corresponding gotcha already exists (or create one) misses the feedback loop. The same incident will recur because the knowledge was captured in narrative form but not indexed for discovery.

- **Using tool comparisons as permanent endorsements rather than timestamped snapshots.** A comparison that says "Biome is faster than ESLint" without a date and version number is misleading six months later when both tools have evolved. Tool comparisons must carry `last_verified` dates and specific version numbers, and must be treated as perishable -- stale comparisons are worse than none because they actively mislead.

## Related

- similar journey: [../processes/review-lessons.md](./review-lessons.md) — success experience and failure lessons
- similar journey: [../../new-hire/onboarding/handoff-project.md](../../new-hire/onboarding/handoff-project.md) — project-level engineering documentation
- upstream: [../../knowledge-curator/diagrams/user-journey.md](../../knowledge-curator/diagrams/user-journey.md) — journey design basis
- downstream: [../../knowledge-curator/governance/tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) — tacit knowledge sink queue
