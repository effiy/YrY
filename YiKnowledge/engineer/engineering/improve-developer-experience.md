---
title: Improve developer experience
aliases:
- I want to improve developer experience
- dx-journey
- devex-journey
- developer experience entry
tags:
- journeys
- dx
- devex
- productivity
- tooling
- automation
category: engineer/engineering
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- engineer
benefit: optimization is measured
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./diagnose-org-productivity.md
- ../tools/set-up-testing-infrastructure.md
- ../../oncall-sre/observability/set-up-observability.md
- ../../engineer/tools/README.md
review_cycle: quarterly
last_verified: 2026-08-07
tacit: false
---

# I want to improve developer experience

> **As an** engineer, **I want to** improve developer experience, **so that** optimization is measured.

> "Local dev / toolchain / automation / documentation / test feedback / wait time / cognitive load" within 2 hops reach tools + measurement + thinking + patterns + cases.

## Summary

- Tools: `work/tools/`: [vllm-ollama-deployment-summary.md](vllm-ollama-deployment.md) · [claude-code-tips-summary.md](claude-code-tips.md) · [pi-agent-harness-evolution-summary.md](pi-agent-harness-evolution.md)
- Measurement: [engineering-productivity-metrics-summary.md](../process/engineering-productivity-metrics.md) + [org-productivity-diagnosis-summary.md](../process/org-productivity-diagnosis.md)
- Thinking: [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Patterns: [ssot-view-layer-pattern.md](../architecture-design/ssot-view-layer.md) + [evaluation-driven-development-pattern.md](../engineering/evaluation-driven-development.md)
- Cases: [yivad-leaf-view-leaves-ssot-win.md](../lessons/win-yivad-leaf-view-leaves-ssot.md) + [yry-vite-to-rsbuild-migration-win.md](../lessons/win-yry-vite-to-rsbuild-migration.md)

## Core viewpoints

**Developer experience is a measurable business metric, not a vague feeling.** Build time, test feedback latency, deploy time, documentation lookup time, and onboarding time-to-first-PR are concrete numbers that can be baselined, tracked, and improved. Treating DX as a qualitative "vibe" leads to misallocated investment. The first act of DX improvement must be measurement, not tooling.

**The feedback loop is the atomic unit of developer experience.** Every second of waiting between making a change and seeing the result is a second of context loss. The goal is not to make developers happy in the abstract; it is to shorten every feedback loop (build, test, deploy, documentation lookup) to sub-second or single-digit-second territory. Long feedback loops are the root cause of context switching, which is the root cause of bugs.

**Tooling fragmentation is a larger DX tax than tooling absence.** Having five different testing frameworks, three build systems, and two documentation platforms across a small team imposes a cognitive switching cost that exceeds the benefit of having "the right tool for each job." Standardization is a DX feature. The best tool is the one the team already knows, unless the gap is so large that the migration cost is justified.

**Onboarding is the ultimate DX stress test.** If a new engineer cannot run the project locally on day one and submit a PR within the first week, the DX is broken regardless of what the metrics say about existing team members. The onboarding experience exposes every implicit assumption, every undocumented step, and every fragile setup script. Fixing onboarding pain points improves DX for everyone, not just new hires.

**DX improvement must be a flywheel, not a project.** Time saved by DX improvements must be reinvested into further DX improvements. A one-time DX sprint that produces a faster build but then stops produces a one-time productivity bump that erodes as the codebase grows. The flywheel (improve, measure, reinvest) is what sustains the gains over years. Without the reinvestment loop, DX regresses to the mean.

## Key info

- **DX metrics framework (the 5 key measurements)**: (1) Build time — time from `npm run dev` / `uvicorn` to first successful hot reload, target <10 seconds for incremental, <60 seconds for clean build; (2) Test feedback latency — time from saving a file to test results, target <30 seconds for subset, <3 minutes for full suite; (3) Deploy time — time from PR merge to production, target <30 minutes for standard, <5 minutes for hotfix; (4) Documentation lookup time — time from question to answer found in knowledge base, target <30 seconds via 2-hop reachability; (5) Time-to-first-PR — time from new hire Day 1 to first merged PR, target <5 business days. These 5 metrics are the minimum set for data-driven DX improvement.
- **Feedback loop hierarchy (optimize in this order)**: (1) Build/HMR loop — the most frequent loop (hundreds of times per day), every second saved here is multiplied by hundreds; (2) Test loop — the second most frequent (tens of times per day), sub-second incremental tests keep developers in flow; (3) Code review loop — PR review turnaround time, target <4 hours for small PRs (<200 lines), <24 hours for medium PRs; (4) Deploy loop — CI/CD pipeline duration, target <15 minutes for standard deploy; (5) Documentation loop — knowledge base search time, improved by 2-hop reachability and AI-powered search. The Yi-family projects: YiVad build time ~3 seconds (Rsbuild HMR), YiPet build time ~8 seconds (watch rebuild), YiAi restart time ~5 seconds (no HMR, manual uvicorn restart).
- **Tooling standardization vs. fragmentation cost**: Each additional tool in the stack adds: (1) learning curve for new team members (2-4 hours per tool), (2) context switching cost (cognitive load of remembering which tool for which task), (3) maintenance burden (upgrades, configuration, CI integration). The Yi-family standardization: linting → Biome (YiVad + YiPet), Ruff (YiAi); formatting → Biome (YiVad + YiPet), Ruff (YiAi); testing → Vitest (YiVad + YiPet), pytest (YiAi); build → Rsbuild (YiVad), Webpack (YiPet), FastAPI (YiAi). The rule: introduce a new tool only when the gap between the current tool and the needed capability is >2x in productivity.
- **Onboarding as the DX stress test — specific failure signals**: (1) Environment setup takes >1 hour → README or setup script is broken; (2) First build fails → dependency installation instructions are incomplete; (3) New hire can't find documentation → knowledge base navigation is unclear; (4) First PR takes >5 business days → code review process is too slow or onboarding task is too large; (5) New hire asks the same question multiple times → answer is not documented. Each of these failure signals is a DX bug that affects existing team members too, just less visibly.
- **DX reinvestment flywheel mechanics**: (1) Measure baseline (5 metrics above); (2) Identify the single biggest bottleneck (not the most annoying, the most time-consuming); (3) Implement the improvement; (4) Measure the time saved (e.g., build time reduced from 30s to 5s saves 25s × 100 builds/day = 42 minutes/day); (5) Reinvest 50% of the saved time into the next DX improvement. The flywheel stalls when: (a) time saved is not measured, (b) time saved is absorbed by scope creep instead of reinvested, (c) the team stops after one improvement.
- **Yi-family DX state**: YiVad — Rsbuild HMR (3s incremental), Vitest watch mode, Biome format-on-save, Claude Code integration, SSOT view layer (leaf-view-leaves). YiPet — Webpack watch rebuild (8s), Vitest, Biome, Claude Code, dual-world boundary (service worker + content script). YiAi — no HMR (manual uvicorn restart, 5s), pytest, Ruff, uv.lock, Claude Code. Common gap: macOS FSEvents silently drops file events, requiring polling-based file watchers on all projects.

## Scenario

When improving local dev experience / shortening feedback loops / reducing wait / automating repetition / reducing cognitive load / lifting engineering satisfaction, TL + platform + engineering productivity need to look up tools + measurement + thinking + patterns + cases. This entry aggregates DX-related 3 leaf + measurement + thinking into a 2-hop path, avoiding "improving DX by gut feel / measurement missing / tools fragmented / no retrospective after improvement".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/tools/` | [vllm-ollama-deployment-summary.md](vllm-ollama-deployment.md) · [claude-code-tips-summary.md](claude-code-tips.md) · [pi-agent-harness-evolution-summary.md](pi-agent-harness-evolution.md) |
| `work/processes/` | [engineering-productivity-metrics-summary.md](../process/engineering-productivity-metrics.md) · [engineering-productivity-metrics-template.md](../process/engineering-productivity-metrics.md) · [org-productivity-diagnosis-summary.md](../process/org-productivity-diagnosis.md) · [org-productivity-diagnosis-template.md](../process/org-productivity-diagnosis.md) · [capacity-planning-process.md](../infrastructure/capacity-planning.md) · [iteration-pm-handbook-summary.md](../process/iteration-pm-handbook.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) · [strong-opinions-loosely-held-summary.md](../../knowledge-curator/templates/thinking/strong-opinions-loosely-held.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../architecture-design/ssot-view-layer.md) · [evaluation-driven-development-pattern.md](../engineering/evaluation-driven-development.md) · [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md) · [staged-port-methodology-pattern.md](../architecture-design/staged-port-methodology.md) · [supply-chain-hardening-pattern.md](../process/harden-supply-chain.md) |
| `methodology/pm-frameworks/` | [dual-track-agile-summary.md](../../product-manager/frameworks/dual-track-agile.md) · [agile-product-management-summary.md](../../product-manager/frameworks/agile-product-management.md) — cadence optimization |
| `work/collaboration/` | [async-collaboration-principles-summary.md](../process/async-collaboration-principles.md) · [raci-matrix-summary.md](../process/raci-matrix.md) — collaboration toolchain |
| `work/meetings/` | [weekly-meeting-template.md](../../product-manager/delivery/weekly-meeting.md) · [review-meeting-template.md](../../product-manager/delivery/review-meeting.md) · [retrospective-sample.md](../../product-manager/delivery/retrospective.md) — reduce ineffective meetings |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) — DX debt |
| `resources/templates/` | [one-on-one-template.md](../../knowledge-curator/templates/one-on-one.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) |
| `resources/prompts/` | [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [weekly-report-prompt.md](../../ai-engineer/methodology/prompts/weekly-report.md) — AI-assisted DX |
| `lessons/wins/` | [yivad-leaf-view-leaves-ssot-win.md](../lessons/win-yivad-leaf-view-leaves-ssot.md) — SSOT view layer DX boost · [yry-vite-to-rsbuild-migration-win.md](../lessons/win-yry-vite-to-rsbuild-migration.md) — build tool DX · [yipet-stack-migration-win.md](../lessons/win-yipet-stack-migration.md) · [yivad-vitest-phase-{one,two,three,four}-win.md](../lessons) — test feedback loop · [yiai-supply-chain-hardening-win.md](../lessons/win-yiai-supply-chain-hardening.md) |
| `lessons/gotchas/` | [macos-fsevents-silent-drop.md](../lessons/gotcha-macos-fsevents-silent-drop.md) — HMR failure · [react-jsxdev-mismatch.md](../lessons/gotcha-react-jsxdev-mismatch.md) · [sse-ondone-guard.md](../lessons/gotcha-sse-ondone-guard.md) · [vite-to-rsbuild-migration.md](../lessons/gotcha-vite-to-rsbuild-migration.md) |
| `lifecycle/` | [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) — make DX tacit knowledge explicit · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [governance.md](../../knowledge-curator/governance/governance.md) |
| `projects/` | Each project `dev-standards-summary.md` + `onboarding.md` — DX landing |

## Action recommendations

1. **First principles**: first ask "what is the DX pain point / how much time engineers spend daily on waiting / repeating / finding documentation"; do not go by gut feel; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md).
2. **Measurement**: establish baseline (build time / test feedback time / deploy time / documentation lookup time / weekly bug fixes / engineering satisfaction); see [engineering-productivity-metrics-summary.md](../process/engineering-productivity-metrics.md).
3. **Inversion**: first imagine "how DX can go bad (over-automation / tools fragmented / learning cost)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md).
4. **Occam**: the simplest tool that meets need wins; do not introduce complex toolchain for DX; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md).
5. **Feedback loop**: build / test / deploy / documentation lookup must be seconds-level feedback; long feedback must be optimized first.
6. **HMR + watch**: local dev must have true HMR; see [yry-vite-to-rsbuild-migration-win.md](../lessons/win-yry-vite-to-rsbuild-migration.md) + [macos-fsevents-silent-drop.md](../lessons/gotcha-macos-fsevents-silent-drop.md).
7. **AI assistance**: Claude Code / Cursor / Copilot integration; prompts sink to `resources/prompts/`; see [claude-code-tips-summary.md](claude-code-tips.md) + [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md).
8. **SSOT + view layer**: reduce duplication / drift / maintenance burden; see [ssot-view-layer-pattern.md](../architecture-design/ssot-view-layer.md) + [yivad-leaf-view-leaves-ssot-win.md](../lessons/win-yivad-leaf-view-leaves-ssot.md).
9. **Test feedback**: vitest / pytest must be seconds-level + incremental + watch mode; see [yivad-vitest-phase-{one,two,three,four}-win.md](../lessons).
10. **Documentation findable**: knowledge base SSOT + 2-hop reach + AI recall; see [../INDEX.md](../INDEX.md) + [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md).
11. **Onboarding**: a new engineer can run local on day 1 + submit PR within a week; see [../../new-hire/onboarding](../../new-hire/onboarding) + project `onboarding.md`.
12. **1:1**: regularly listen to engineer venting + sort pain points + improve; see [one-on-one-template.md](../../knowledge-curator/templates/one-on-one.md).
13. **Flywheel**: time saved by DX improvement reinvested into further DX -> flywheel; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).
14. **Retrospective**: DX improvement via [org-productivity-diagnosis-summary.md](../process/org-productivity-diagnosis.md) quarterly retrospective + archive [lessons/wins/](../lessons).

## Anti-patterns

- **Improving DX by gut feel without measurement.** Adding a new tool, rewriting a script, or changing a workflow because "it feels slow" without baselining and tracking the metric means there is no way to know whether the improvement worked. The most common outcome is that the DX change makes things worse but no one can prove it because there is no baseline. Measurement must precede action.

- **Over-automating workflows that are not yet stable.** Automating a build, deploy, or test process that is still changing frequently produces brittle automation that breaks more often than the manual process it replaced. Automation amplifies the quality of the underlying process: automating a broken process produces broken automation. The process must be stable before it is automated.

- **Introducing tooling that the team cannot maintain.** Adopting a complex build system, monitoring stack, or CI pipeline that requires a dedicated expert to maintain creates a single point of failure. When that expert leaves, the tooling becomes a liability. The maintainability of the tooling by the average team member is a first-class DX constraint.

- **Measuring DX exclusively through surveys.** Developer satisfaction surveys capture sentiment but not behavior. A developer may report being satisfied while spending 40% of their day waiting for builds. Surveys must be paired with objective metrics (build time, test time, deploy time, PR cycle time). Sentiment without metrics is self-deception.

- **Treating DX as a platform team's responsibility.** When DX is owned by a separate platform team and not by the developers who use the tools, the platform team builds what they think developers need, not what developers actually need. The gap between the platform team's roadmap and the developers' pain points grows over time. DX must be a shared responsibility with direct feedback loops between tool builders and tool users.

## Related

- Same-class journey: [./diagnose-org-productivity.md](../process/diagnose-org-productivity.md) — team productivity
- Same-class journey: [../tools/set-up-testing-infrastructure.md](set-up-testing-infrastructure.md) — test feedback
- Same-class journey: [../../oncall-sre/observability/set-up-observability.md](../../oncall-sre/observability/set-up-observability.md) — observability
- Same-class journey: [../../new-hire/onboarding/onboard-as-a-new-engineer.md](../../new-hire/onboarding/onboard-as-a-new-engineer.md) — new hire experience
- Upstream: [../../engineer/tools/README.md](../../README.md) — tools leaf entry
