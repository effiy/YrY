---
title: Review lessons and experiences
aliases:
- I want to see retrospectives and experiences
- retrospective experience entry
tags:
- journeys
- retrospective
- lessons
- wins
- failures
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
- ../../engineer/lessons/wins/README.md
- ../../engineer/lessons/failures/README.md
- ../../product-manager/delivery/README.md
- ../../executive/industry/reports/README.md
review_cycle: quarterly
tacit: false
---

# I want to review lessons and experiences

> **As an** engineer, **I want to** review lessons, **so that** context is reachable.

> "How was this done before / where are the successes and failures" reachable within 2 hops to wins, failures, retrospective templates, industry reports.

## Summary
- Internal team wins (aicr port, BRD agent launch) + failures (AI publish lessons, incident retrospectives) referenced both ways
- Engineering gotchas linked with retrospective meeting templates in a single line
- Quarterly industry reports provide external benchmarking

## Core viewpoints

- **The primary value of a lessons repository is not in documenting what happened -- it is in preventing the same mistake from being made by a different person in a different context.** A failure retrospective that is read only by the team that experienced the failure has a readership of 5. The same retrospective, indexed and discoverable by the next team attempting a similar project, has a readership of everyone who might repeat the mistake. The archive is not a memorial; it is a vaccine.

- **Success lessons (wins) are as important as failure lessons, and they are systematically under-documented.** Teams are motivated to write postmortems after incidents because the pain is fresh, but they rarely document why a project succeeded. The result is a knowledge base that teaches how to avoid failure but not how to replicate success. Wins must be documented with the same rigor as failures: what decisions were made, what alternatives were considered, and what conditions made the success possible.

- **Lessons degrade over time as the context that produced them changes, and `last_verified` is the mechanism that prevents this degradation.** A lesson about Vite migration from 2024 may be irrelevant in 2026 when the bundler ecosystem has evolved. The `last_verified` field is not a formality -- it is the expiration date on the lesson's applicability. A lesson with a `last_verified` date more than a year old should be treated as a historical artifact, not as current guidance.

- **The 24-hour post-incident retrospective window is not about speed -- it is about memory fidelity.** After 24 hours, the details of what happened begin to blur, the timeline becomes contested, and the retrospective shifts from "what happened" to "what people remember happening." The 24-hour window captures the event while the logs are still fresh and before the narrative has been reconstructed to protect reputations.

- **Cross-referencing internal lessons with external industry reports creates a calibration mechanism that prevents institutional echo chambers.** A team that only learns from its own failures develops blind spots that match its own blind spots. Comparing internal incident patterns with industry reports (e.g., "are we seeing the same AI deployment failures as the industry?") reveals whether the team's problems are unique (requiring specific fixes) or structural (requiring industry-standard solutions).

## Key info

- **Yi-family lessons archive catalog (2026-08)**: 4 categories with cross-referencing — (1) Wins (~30 files): yiVad aiChat port, yiAi BRD agent launch, yiPet stack migration, yiVad vitest phases 1-4, yiAi pytest phases 1-4, yiAi LLM phases 2-5, yiPet aicr phases 1-5, yiVad shared client vendor, yiAi RAG hybrid retrieval, yiAi knowledge watcher, yiAi supply chain hardening, yiVad leaf view leaves SSOT, yiRy vite-to-rsbuild migration; (2) Failures (4 files): AI product launch lessons, incident postmortem template, FDE air-gapped pipeline, FDE enterprise RAG pure semantic, FDE Day 2 without internal owner; (3) Gotchas (9 files): macOS FSEvents, React jsxDEV, Vite→Rsbuild, SSE onDone, no lockfile, ADK eval drift, Agents CLI alpha, air-gap first boot, discovery Three Whys skipped; (4) Bugs (2 files): bug topicdetail meta validation, bug metaschemas sed deletion.
- **Lessons freshness management protocol**: Each lesson file carries `last_verified` date and `review_cycle` field (quarterly/yearly). Lessons with `last_verified` > 1 year old are treated as historical artifacts, not current guidance. Quarterly review scans all lessons whose `last_verified` is > 6 months old, verifies whether the issue is still reproducible on current versions, and updates or archives. The Yi-family gotcha review is part of the quarterly tech debt review process.
- **24-hour post-incident retrospective window rationale**: After 24 hours, details begin to blur, timelines become contested, and the retrospective shifts from "what happened" to "what people remember happening." The 24-hour window captures the event while logs are still fresh and before the narrative has been reconstructed to protect reputations. The retrospective must be blameless (focus on process gaps, not individual errors) and produce action items with single owner + due date + measurable acceptance criterion.
- **Win documentation requirements (6 fields, same rigor as failures)**: (1) What decisions were made and why; (2) What alternatives were considered and rejected; (3) What conditions made the success possible (team composition, timeline, tooling); (4) What was the quantified outcome (metrics before/after); (5) What are the replicability conditions — under what circumstances would this approach work again; (6) What were the near-misses or things that almost went wrong. Wins are systematically under-documented because teams are motivated to write postmortems after incidents (pain is fresh) but rarely document why a project succeeded.
- **Lesson cross-linking requirements**: Every failure retrospective must check whether a corresponding gotcha already exists (or create one). Every win must link to the ADR that codified the approach. Every gotcha must link to the failure retrospective(s) where it was discovered. The lessons archive is the input; the gotcha index and knowledge base are the output. Without cross-linking, the lesson is learned by one team and forgotten by the organization.
- **Yi-family lessons review cadence (2026-08)**: Monthly — aggregate gotcha and bug trends for the month; Quarterly — re-verify archived lessons against current codebase/toolchain, calibrate against industry reports; Annual — comprehensive lessons audit, archive obsolete lessons. The `review-lessons.md` journey entry provides 2-hop access to all wins, failures, gotchas, and retrospective templates. Gap: no formal "> 2 hours to debug" gotcha enforcement; gotchas are written when someone remembers.

## Scenario

At iteration end, quarterly review, new project kickoff, or 24h retrospective of a major incident, you need to quickly pull up historical experience. This entry aggregates retrospective-related files from `lessons/wins/`, `lessons/failures/`, `lessons/gotchas/`, `../../product-manager/delivery/`, `resources/templates/`, and `industry/reports/` into a 2-hop path.

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `../../engineer/lessons/wins` | [yivad-aicr-phase-port.md](../lessons/win-yivad-aicr-phase-port.md) · [yiai-brd-agent-launch.md](../lessons/win-yiai-brd-agent-launch.md) |
| `../../engineer/lessons/failures` | [ai-product-launch-lessons-summary.md](../lessons/failure-ai-product-launch-lessons.md) · [incident-postmortem-summary.md](../lessons/failure-incident-postmortem.md) · [incident-postmortem-template.md](../lessons/failure-incident-postmortem.md) · [bugs/](../lessons) |
| `../../engineer/lessons/gotchas` | [macos-fsevents-silent-drop.md](../lessons/gotcha-macos-fsevents-silent-drop.md) · [vite-to-rsbuild-migration.md](../lessons/gotcha-vite-to-rsbuild-migration.md) · [react-jsxdev-mismatch.md](../lessons/gotcha-react-jsxdev-mismatch.md) |
| `../../product-manager/meetings` | [retrospective-meeting-template.md](../../product-manager/delivery/retrospective-meeting.md) · [review-meeting-template.md](../../product-manager/delivery/review-meeting.md) · [weekly-meeting-template.md](../../product-manager/delivery/weekly-meeting.md) |
| `../../knowledge-curator/templates` | [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) |
| `../../executive/industry/reports` | [ai-industry-report-summary.md](../../executive/industry/reports/ai-industry-report.md) |

## Action recommendations

1. First check whether `lessons/wins/` and `lessons/failures/` already have a retrospective for the same project category
2. Within 24h of a major incident, write a retrospective using `incident-postmortem-template.md` and archive under `lessons/failures/bugs/`
3. At the end of each iteration, run a sprint retrospective using `../../product-manager/delivery/retrospective-meeting.md`
4. Monthly retrospective meetings aggregate gotcha and bug trends for the month
5. Quarterly reviews calibrate against industry via `industry/reports/`
6. Feed new lessons back into the corresponding leaf; update frontmatter `updated` and `last_verified`

## Anti-patterns

- **Writing a failure retrospective that identifies the symptom but not the systemic cause.** "The deployment failed because the config was wrong" is a symptom. "The deployment failed because there is no automated config validation in the CI pipeline" is a systemic cause. The retrospective that stops at the symptom guarantees that the same class of failure will recur with a different proximate cause.

- **Archiving wins without identifying the conditions that made them replicable.** "The project succeeded because the team worked really hard" is not a lesson; it is a compliment. A win retrospective must identify the decisions, conditions, and constraints that enabled the success, so that the next team can evaluate whether those conditions apply to their context.

- **Treating the lessons archive as a write-only repository where files are added but never reviewed.** A lessons directory that grows without curation becomes a graveyard of outdated advice. The quarterly review cadence must re-verify that archived lessons are still accurate, still relevant, and still linked to the current codebase and toolchain.

- **Writing retrospectives that are too long to be read by anyone outside the immediate team.** A 20-page incident postmortem with detailed timelines and technical deep-dives is valuable for the team that experienced the incident, but it will never be read by a busy engineer looking for a quick answer. Every retrospective should have a 1-paragraph executive summary that answers: what happened, why, and what changed.

- **Failing to cross-link lessons with the gotcha index and the knowledge base.** A failure retrospective that identifies a deployment pipeline gap but does not check whether a corresponding gotcha already exists (or create one) breaks the feedback loop. The lessons archive is the input; the gotcha index and knowledge base are the output. Without cross-linking, the lesson is learned by one team and forgotten by the organization.

## Related

- Same-category journey: [../strategies/check-engineering-gotchas.md](./check-engineering-gotchas.md) — gotcha precipitation from retrospectives
- Same-category journey: [../lessons/learn-pm-frameworks.md](../lessons/learn-pm-frameworks.md) — retrospective methodology
- Upstream: [../../knowledge-curator/diagrams/user-journey.md](../../knowledge-curator/diagrams/user-journey.md) — journey design basis
- Downstream: [../../knowledge-curator/governance/review-log.md](../../knowledge-curator/governance/review-log.md) — retrospective review log
