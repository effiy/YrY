---
title: Run a bug bash
aliases:
- I want to run a bug bash
- bug-bash-journey
- bug-hunt-journey
- bug sweep entry
tags:
- journeys
- bug-bash
- bug-hunt
- testing
- quality
- red-team
category: engineer/process
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles:
- engineer
benefit: process is repeatable
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../strategies/prepare-a-test-strategy.md
- ../tools/set-up-testing-infrastructure.md
- ./do-a-code-review.md
- ../../engineer/engineering/evaluation-driven-development.md
review_cycle: quarterly
tacit: false
---

# I want to run a bug bash

> **As an** engineer, **I want to** run a bug bash, **so that** process is repeatable. 

> "Topic + scenario + team formation + run + reproduce + add tests + fix + Retrospective + Archive" reach within 2 hops Pattern + Process + Thinking + Case study. 

## Summary

- Pattern: [evaluation-driven-development-pattern.md](../engineering/evaluation-driven-development.md) + [contract-test-baseline-pattern.md](../quality-security/contract-test-baseline.md) + [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md)
- Process: [release-process.md](../../oncall-sre/release/release.md) + [code-review-process.md](../../ai-engineer/methodology/prompts--code-review.md) + [monitoring-governance-process.md](monitoring-governance.md)
- Thinking: [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md)
- Case study: [yivad-vitest-phase-{one,two,three,four}-win.md](../lessons) + [yipet-stack-migration-win.md](../lessons/win-yipet-stack-migration.md) + [yry-vite-to-rsbuild-migration-win.md](../lessons/win-yry-vite-to-rsbuild-migration.md)

## Core viewpoints

- **A bug bash is not a testing activity — it is a diversity-of-perspective activity** — The developers who built the feature have blind spots: they know how it's supposed to work, so they unconsciously avoid the paths that break it. A bug bash brings in people who have never seen the feature before and who have no assumptions about how it should work. The value is not in finding more bugs; it is in finding the bugs that the developers cannot see.

- **The bug bash topic must be narrow enough to be actionable** — A bug bash on "the entire product" produces a scattered list of low-priority bugs that nobody wants to fix. A bug bash on "the new RAG pipeline's scope filtering" (a single feature with a clear scope) produces a focused list of bugs that the team can fix in the next sprint. The topic is the most important decision in the bug bash.

- **Reproduction is the bottleneck, not discovery** — The most common failure mode is a bug bash that produces 50 bugs with no reproduction steps. A bug without reproduction steps is a rumor, not a bug. The bug bash must require every bug report to include specific reproduction steps, expected behavior, and actual behavior. The time spent on reproduction is the time that makes the bug fixable.

- **The retro after the bug bash is more important than the bug bash itself** — A bug bash that finds 50 bugs but produces no process improvements will find the same 50 bugs next time. The retro must answer: why did these bugs exist, what process gap allowed them, and what changes will prevent them in the future? The output of the bug bash is not the bug list; it is the process improvement.

- **Bug bash without test coverage is bug hunting without a safety net** — Fixing bugs discovered in a bug bash without adding tests guarantees that the bugs will recur. Every bug fix must include a test that reproduces the bug. The bug bash is the input; the test suite is the output.

## Key info

- **Bug bash topic scoping methodology (4-step process)**: (1) Define the bug class target — capability/performance/security/UX/AI hallucination; (2) Narrow to a single feature or module with clear scope (e.g., "the new RAG pipeline's scope filtering," not "the entire product"); (3) Write a scenario checklist covering boundary/exception/extreme values/cross-end/cross-language/cross-tenant; (4) Set a timebox (2-4 hours for the bash session, 1-2 days for fix follow-up). A bug bash on "the entire product" produces a scattered list of low-priority bugs that nobody wants to fix.
- **Bug bash team formation and roles (RACI-based, 5 roles)**: (1) Moderator — runs the session, keeps time, enforces reproduction requirements; (2) Recorder — documents every bug with reproduction steps in real time; (3) Fix owner — engineer assigned to fix bugs within the follow-up window; (4) Participants — cross-functional (engineering + QA + PM + design), people who have never seen the feature before (diversity of perspective is the primary value); (5) Sponsor — has authority to allocate fix time in the next sprint. Cross-team formation is encouraged; the developers who built the feature have blind spots that fresh eyes will catch.
- **Bug report minimum requirements (5 fields per bug)**: (1) Reproduction steps — specific, numbered steps that reliably reproduce the bug; (2) Expected behavior — what should have happened; (3) Actual behavior — what actually happened, with screenshots/video/logs; (4) Environment — tenant, time, browser/OS version, build version; (5) Severity — P0 (blocker, no workaround), P1 (critical, workaround exists), P2 (moderate, affects non-critical path), P3 (cosmetic). A bug without reproduction steps is a rumor, not a bug. The time spent on reproduction is the time that makes the bug fixable.
- **Bug bash follow-up workflow (5 stages)**: (1) Triage — within 24 hours, assign severity and fix owner for each bug; (2) Fix — P0/P1 within 48 hours, P2 within the sprint, P3 backlog; (3) Add tests — every bug fix must include a test that reproduces the bug (contract test baseline pattern); (4) Retrospective — answer: why did these bugs exist, what process gap allowed them, what changes prevent recurrence; (5) Archive — bug data desensitized, archived to `lessons/failures/bugs/`, re-pluggable for future bashes. The output of the bug bash is not the bug list; it is the process improvement.
- **AI-specific red team bug bash extensions**: AI-facing products must additionally run: (1) Prompt injection/jailbreak test set — adversarial inputs designed to bypass content filters; (2) Hallucination test set — queries designed to trigger fabrication, measure hallucination rate; (3) Boundary test set — 30% of test cases must be boundary/adversarial (not just happy paths); (4) Multi-language consistency tests — same query across supported languages, verify consistent quality; (5) Confidence distribution check — verify low-confidence outputs trigger graceful degradation, not confident wrong answers. Reference: [prompt-injection-defense-summary.md](../../ai-engineer/methodology/prompt-injection-defense.md) and [llm-evaluation-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md).
- **Yi-family bug bash practices (2026-08)**: No formal recurring bug bash process. The YiVad vitest migration (phases 1-4) and YiPet stack migration included focused bug-finding sessions as part of the migration verification. YiVad aiChat thumbs up/down feedback serves as continuous bug discovery. The bug bash framework (topic scoping + team formation + reproduction + test addition + retro + archive) is documented for when pre-release or quarterly sweep bug bashes are adopted. The `bug-logging-protocol.md` provides the bug report format standard.

## Scenario description

When running a bug bash / bug sweep / red team / joint-integration bug-finding / pre-promotion sweep / pre-release sweep / cross-team quality sprint / customer feedback reproduction, TL + QA + Platform + engineer + business owner need to look up Pattern + Process + Thinking + Case study. This entry aggregates bug-bash-related Pattern + Process + Thinking to a 2-hop path, avoiding "topic scattered / scenario missed / team-formation chaos / reproduction unclear / missing tests / fix delay / Retrospective missing / Archive blank". 

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `methodology/engineering-patterns/` | [evaluation-driven-development-pattern.md](../engineering/evaluation-driven-development.md) · [contract-test-baseline-pattern.md](../quality-security/contract-test-baseline.md) · [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md) · [supply-chain-hardening-pattern.md](../process/harden-supply-chain.md) · [ssot-view-layer-pattern.md](../architecture-design/ssot-view-layer.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) — bash intent · [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) — inversion thinking to find missing bugs · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md) · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) |
| `methodology/ai-specific/` | [llm-evaluation-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md) · [hallucination-mitigation-summary.md](../../ai-engineer/methodology/hallucination-mitigation.md) · [prompt-injection-defense-summary.md](../../ai-engineer/methodology/prompt-injection-defense.md) — AI red team |
| `work/processes/` | [release-process.md](../../oncall-sre/release/release.md) · [code-review-process.md](../../ai-engineer/methodology/prompts--code-review.md) · [hotfix-release-process.md](../../oncall-sre/release/hotfix-release.md) · [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [monitoring-governance-process.md](monitoring-governance.md) · [cross-team-collaboration-process.md](cross-team-collaboration.md) |
| `resources/templates/` | [bug-report-template.md](../../knowledge-curator/archive/strategies-legacy/executive/prepare-a-bug-report.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) · [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [code-review-prompt.md](../../ai-engineer/methodology/prompts--code-review.md) — AI assist to find bugs · [rag-system-prompt.md](../../ai-engineer/methodology/prompts--rag-system.md) · [agent-tool-use-prompt.md](../../ai-engineer/methodology/prompts--agent-tool-use.md) |
| `lessons/wins/` | [yivad-vitest-phase-{one,two,three,four}-win.md](../lessons) · [yipet-stack-migration-win.md](../lessons/win-yipet-stack-migration.md) · [yry-vite-to-rsbuild-migration-win.md](../lessons/win-yry-vite-to-rsbuild-migration.md) · [yivad-aicr-phase-port.md](../lessons/win-yivad-aicr-phase-port.md) |
| `lessons/gotchas/` | [sse-ondone-guard.md](../lessons/gotcha-sse-ondone-guard.md) · [react-jsxdev-mismatch.md](../lessons/gotcha-react-jsxdev-mismatch.md) · [vite-to-rsbuild-migration.md](../lessons/gotcha-vite-to-rsbuild-migration.md) · [macos-fsevents-silent-drop.md](../lessons/gotcha-macos-fsevents-silent-drop.md) · [no-lockfile-supply-chain-risk.md](../lessons/gotcha-no-lockfile-supply-chain-risk.md) |
| `lessons/failures/` | [incident-postmortem-summary.md](../lessons/failure-incident-postmortem.md) · [ai-product-launch-lessons-summary.md](../lessons/failure-ai-product-launch-lessons.md) · [bugs/](../lessons) — bash-found archive |
| `work/meetings/` | [review-meeting-template.md](../../product-manager/delivery/review-meeting.md) · [weekly-meeting-template.md](../../product-manager/delivery/weekly-meeting.md) · [retrospective-sample.md](../../product-manager/delivery/retrospective.md) |
| `work/collaboration/` | [raci-matrix-summary.md](raci-matrix.md) · [async-collaboration-principles-summary.md](async-collaboration-principles.md) |
| `people/team--` | [team-overview.md](../../knowledge-curator/people/team--team-overview.md) · [roster.md](../../knowledge-curator/people/team--roster.md) — team owner |
| `tech/infra/` | [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) · [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) |
| `product/ux/` | [ai-product-ux-patterns-summary.md](../../product-manager/discovery/ux--ai-product-ux-patterns.md) · [nielsen-heuristics-summary.md](../../product-manager/discovery/ux--nielsen-heuristics.md) — UX bug |
| `lifecycle/` | [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `projects/` | each project `dev-standards-summary.md` §bug Process + `adr-{pytest,vitest,biome}` |
| `journeys/` | [../strategies/prepare-a-test-strategy.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-test-strategy.md) · [../tools/set-up-testing-infrastructure.md](../engineering/set-up-testing-infrastructure.md) · [./do-a-code-review.md](../quality-security/do-a-code-review.md) · [../../executive/strategy/prepare-a-bug-report.md](../../knowledge-curator/archive/strategies-legacy/executive/prepare-a-bug-report.md) |

## Action recommendations

1. **First principles**: first ask "what class of bugs should the bug bash find (capability / performance / security / UX / AI hallucination) / what happens if not done / ROI"; do not run a bash just to run a bash; see [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md). 
2. **Inversion**: first imagine "bug bash could go out of control (false positives / reproduction chaos / fix delay / environment pollution / team fatigue)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md). 
3. **Second-order effects**: finding a pile of bugs -> fix-priority conflict -> team stress; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md). 
4. **Occam**: the simplest process to satisfy bug-finding wins; do not pile up tools; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md). 
5. **Topic**: must first fix the topic (core process / new capability / promotion / cross-module / security / AI hallucination); do not sweep broadly. 
6. **Scenario**: must list the scenario checklist + boundary / exception / extreme values / cross-end / cross-language / cross-tenant; see [evaluation-driven-development-pattern.md](../engineering/evaluation-driven-development.md). 
7. **Team formation**: must run [raci-matrix-summary.md](raci-matrix.md); cross-team formation + moderator + recorder + fix owner. 
8. **Environment**: must use pre-prod / independent tenant + must desensitize + must be resettable; do not pollute production; see [data-compliance-process.md](../infrastructure/data-compliance.md). 
9. **AI assist**: use [code-review-prompt.md](../../ai-engineer/methodology/prompts--code-review.md) to let AI find boundary + missing tests. 
10. **Reproduction**: bug must carry steps / screenshot / video / log / tenant / time; see [bug-report-template.md](../../knowledge-curator/archive/strategies-legacy/executive/prepare-a-bug-report.md). 
11. **Severity**: must P0 / P1 / P2 / P3; set by user impact + frequency + scope. 
12. **Add tests**: found bugs must add test cases + must enter regression set; see [contract-test-baseline-pattern.md](../quality-security/contract-test-baseline.md). 
13. **Fix**: must run [hotfix-release-process.md](../../oncall-sre/release/hotfix-release.md) + [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md); must be rollback-able. 
14. **AI red team**: AI-facing must run [prompt-injection-defense-summary.md](../../ai-engineer/methodology/prompt-injection-defense.md) + jailbreak set + hallucination set. 
15. **Data**: bug data must be desensitized + must be archived + must be re-pluggable; do not leak PII. 
16. **Freeze period**: during promotions use [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) — do not bash after release. 
17. **Monitoring**: after fix, follow [monitoring-governance-process.md](monitoring-governance.md) to monitor production error rate + missing-test metric. 
18. **Retrospective**: after bash, follow [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) to run retrospective + add scenarios + archive [bugs/](../lessons). 
19. **Quarterly sweep**: follow [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether bug classes found by bash are still covered. 
20. **ADR**: bash process decisions must land in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md). 
21. **Flywheel**: bash -> early discovery -> early fix -> quality up -> trust; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md). 

## Anti-patterns

- **Bug bash topic too broad** — A bug bash on "the entire product" produces a scattered list of low-priority bugs that nobody wants to fix. The topic must be narrow enough to be actionable ("the new RAG pipeline's scope filtering") and focused on a single feature with a clear scope.

- **Bugs without reproduction steps** — A bug report that says "the search is broken" without reproduction steps is a rumor, not a bug. Every bug report must include specific reproduction steps, expected behavior, and actual behavior. The time spent on reproduction is the time that makes the bug fixable.

- **Bug bash without a retro** — A bug bash that finds 50 bugs but produces no process improvements will find the same 50 bugs next time. The retro must answer: why did these bugs exist, what process gap allowed them, and what changes will prevent them in the future?

- **Fixing bugs without adding tests** — Fixing bugs discovered in a bug bash without adding tests guarantees that the bugs will recur. Every bug fix must include a test that reproduces the bug. The bug bash is the input; the test suite is the output.

- **Bug bash as a one-time event** — A bug bash that happens once before a release and never again is a fire drill. The bug bash should be a recurring event (quarterly sweep, pre-release, or continuous) with a growing test suite and a shrinking bug list. The metric is not "bugs found" but "bugs not found because they were already prevented."

## Related

- Related journey: [../strategies/prepare-a-test-strategy.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-test-strategy.md) — QA strategy
- Related journey: [../tools/set-up-testing-infrastructure.md](../engineering/set-up-testing-infrastructure.md) — QA infrastructure
- Related journey: [./do-a-code-review.md](../quality-security/do-a-code-review.md) — code review
- Related journey: [../../executive/strategy/prepare-a-bug-report.md](../../knowledge-curator/archive/strategies-legacy/executive/prepare-a-bug-report.md) — bug report
- Upstream: [../../README.md](../../README.md) — engineering-patterns leaf entry
