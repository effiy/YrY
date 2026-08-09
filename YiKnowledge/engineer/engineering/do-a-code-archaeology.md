---
title: Do a code archaeology
aliases:
- i-want-to-do-a-code-archaeology
- code-archaeology-journey
- legacy-code-understanding-journey
- code-archaeology-entry
tags:
- journeys
- code-archaeology
- legacy-code
- blame
- git-archaeology
- refactoring
category: engineer/engineering
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
benefit: outcome is traceable
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./troubleshoot-a-regression.md
- ../../tech-lead/roadmap/manage-tech-debt.md
- ./do-a-code-review.md
- ../../engineer/architecture-design/ssot-view-layer.md
review_cycle: quarterly
tacit: false
---

# I want to do a code archaeology

> **As an** engineer, **I want to** do a code archaeology, **so that** outcome is traceable.

> "Read history / blame / ADR / commit / PR / comment / test / documentation first, then modify" — patterns + thinking + cases reachable within 2 hops.

## Summary

- Patterns via [ssot-view-layer-pattern.md](../architecture-design/ssot-view-layer.md) + [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md) + [staged-port-methodology-pattern.md](../architecture-design/staged-port-methodology.md)
- Thinking via [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md)
- Cases via [yipet-stack-migration-win.md](../lessons/win-yipet-stack-migration.md) + [yry-vite-to-rsbuild-migration-win.md](../lessons/win-yry-vite-to-rsbuild-migration.md) + [yivad-aicr-phase-port.md](../lessons/win-yivad-aicr-phase-port.md)
- Templates via [adr-template.md](../../knowledge-curator/templates/adr.md) + [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) + [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md)

## Core viewpoints

- **Code archaeology is not about reading code — it is about reading decisions** — The most important artifact in a legacy codebase is not the code itself but the decisions that shaped it. ADRs, commit messages, PR descriptions, and issue comments explain why the code is the way it is. Reading the code without understanding the decisions leads to "this looks wrong, I'll fix it" followed by "oh, that was intentional for a reason I just rediscovered."

- **`git blame` is the most underutilized tool in code archaeology** — Every line of code has a commit, a date, and an author. `git blame` reveals when a change was made, who made it, and what commit message explains it. The author is the fastest path to understanding: a 5-minute conversation with the author can replace 2 hours of reading code. The author is not to assign blame; the author is to ask "what were you thinking?"

- **Tests are the most reliable form of documentation** — Comments and documentation can be outdated (the code changed, the comment didn't). Tests cannot be outdated: they either pass (and describe the current behavior) or they fail (and reveal that the behavior changed). Reading the test suite before reading the code tells you what the code is supposed to do, not just what it happens to do.

- **The absence of tests is itself an archaeological signal** — A module with no tests is a module that was either written quickly, considered low-risk, or whose author didn't know how to test it. Each of these signals has different implications for how carefully you should modify it. A module with no tests requires more archaeology before modification, not less.

- **Archaeology without a hypothesis is just reading** — Before diving into the code, form a hypothesis: "I think this module handles X by doing Y." Then use the code to confirm or reject the hypothesis. Archaeology without a hypothesis is passive reading; archaeology with a hypothesis is active investigation. The hypothesis is the compass that prevents getting lost in the code.

## Key info

- **Git archaeology command toolkit**: `git log --oneline -20 <file>` — recent change history, identify active periods and dormant periods; `git blame <file>` — line-by-line authorship, dates, and commit hashes, reveals when each line was last touched and by whom; `git log -S "<code_string>"` — search commit history for the introduction or removal of a specific string (the "pickaxe" search), finds when a function or variable was added/removed; `git log -L <start>,<end>:<file>` — trace the evolution of a specific line range over time; `git show <commit_hash>` — view the full diff and commit message of a specific change; `git diff <branch_a>..<branch_b> -- <file>` — compare a file across branches. The `git log -S` (pickaxe) is the most underutilized: it finds the exact commit that introduced a specific line of code, which is the entry point for understanding WHY it was introduced.
- **Archaeology information source reliability ranking**: (1) Tests — most reliable, describe current behavior by passing or failing, cannot be outdated; (2) Commit messages — second most reliable, capture the author's intent at the time of change, `git log` + `git blame` provide direct access; (3) ADRs — third most reliable, document architectural decisions and trade-offs, may be outdated if the decision was reversed; (4) PR descriptions and review comments — provide discussion context and alternatives considered; (5) Code comments — moderately reliable, can be outdated if the code changed but the comment didn't; (6) README and documentation — least reliable, most likely to be outdated. The rule: trust tests first, then commit messages, then ADRs; verify documentation against the code, not the other way around.
- **Author conversation protocol**: When `git blame` identifies the author of a confusing section: (1) Check if the author is still on the team (roster/team overview); (2) Prepare specific questions: "I see you added this logic in commit abc123 — what problem was it solving? Is that problem still relevant?"; (3) Respect the author's time: a 5-minute focused conversation, not an open-ended "explain this module"; (4) Record the answer: add a comment or knowledge leaf so the next person doesn't need to ask the same question. The author conversation is the fastest path to understanding, but only if the answers are recorded for posterity.
- **Archaeology output templates**: (1) Knowledge leaf — for discoveries that are reusable (module purpose, constraints, gotchas), published to YiKnowledge; (2) ADR supplement — for discoveries that explain or update an existing architectural decision; (3) Code comment — for discoveries that are local to a specific line or function (`// ARCHAEOLOGY: This order matters because...`); (4) Tacit knowledge entry — for unwritten rules and historical context that don't fit in code comments. The output must be written during archaeology, not after; the knowledge is freshest and most accurate at the moment of discovery.
- **Archaeology timeboxing**: (1) Small module (<500 lines, well-tested) — 1-2 hours; (2) Medium module (500-2000 lines, some tests) — 2-4 hours; (3) Large module (2000-5000 lines, few tests) — 4-8 hours, may need to split into sub-archaeology sessions; (4) Legacy system (>5000 lines, no tests) — 1-3 days, must be treated as a project with its own hypothesis, output, and retrospective. The timebox prevents archaeology from becoming an infinite reading session. When the timebox expires, the archaeologist must produce output (what was learned, what remains unknown, what the next steps are).
- **Yi-family archaeology examples**: YiPet stack migration (React 15 → React 18.3) — archaeology of the old chat.js module revealed the `jsxDEV` mismatch gotcha (dev-mode React plugin + production NODE_ENV define = runtime error). YiVad aicr port — archaeology of the YiWeb aicr page revealed the file tree, store architecture, and modal system that needed to be replicated. YiVad Vite → Rsbuild migration — archaeology of the Vite plugin system revealed the svg-sprite and views-glob plugins that needed Rsbuild equivalents. Each of these archaeology sessions produced knowledge leaves and gotchas that are now part of the YiKnowledge base.

## Scenario

When taking over legacy / cross-handoff / unfamiliar module / large unknown code / sudden bug fix / post-launch regression without context / uncertain refactor / "who wrote this", TL + engineer + platform need to do archaeology before acting. This entry aggregates code-archaeology-related patterns + thinking + cases into a 2-hop path, to avoid "blind changes / reinventing the wheel / breaking implicit constraints / refactor rollovers / introducing regressions / erasing ADR decisions".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../architecture-design/ssot-view-layer.md) · [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md) · [staged-port-methodology-pattern.md](../architecture-design/staged-port-methodology.md) · [one-to-one-mapping-migration-pattern.md](../architecture-design/one-to-one-mapping-migration.md) · [eval-driven](../engineering/evaluation-driven-development.md) · [contract-test-baseline-pattern.md](../quality-security/contract-test-baseline.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) — what this block solves · [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) — invert blind changes · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) — refactor chain reaction · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) — minimal modification wins |
| `methodology/ai-specific/` | [prompt-engineering-guide-summary.md](../../ai-engineer/methodology/prompt-engineering-guide.md) · [llm-evaluation-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md) — AI-assisted archaeology |
| `work/processes/` | [code-review-process.md](../../ai-engineer/methodology/prompts--code-review.md) · [tech-review.md](../../product-manager/delivery/tech-review.md) · [requirement-review.md](../../product-manager/delivery/requirement-review.md) · [knowledge-transfer-process.md](../process/knowledge-transfer.md) · [project-handover-process.md](../process/project-handover.md) · [quarterly-tech-debt-process.md](../quality-security/quarterly-tech-debt.md) |
| `resources/templates/` | [adr-template.md](../../knowledge-curator/templates/adr.md) · [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) |
| `resources/prompts/` | [code-review-prompt.md](../../ai-engineer/methodology/prompts--code-review.md) — AI-assisted archaeology · [rag-system-prompt.md](../../ai-engineer/methodology/prompts--rag-system.md) · [agent-tool-use-prompt.md](../../ai-engineer/methodology/prompts--agent-tool-use.md) |
| `lessons/wins/` | [yipet-stack-migration-win.md](../lessons/win-yipet-stack-migration.md) · [yry-vite-to-rsbuild-migration-win.md](../lessons/win-yry-vite-to-rsbuild-migration.md) · [yivad-aicr-phase-port.md](../lessons/win-yivad-aicr-phase-port.md) · [yivad-leaf-view-leaves-ssot-win.md](../lessons/win-yivad-leaf-view-leaves-ssot.md) · [yiai-brd-agent-launch.md](../lessons/win-yiai-brd-agent-launch.md) |
| `lessons/gotchas/` | [react-jsxdev-mismatch.md](../lessons/gotcha-react-jsxdev-mismatch.md) · [vite-to-rsbuild-migration.md](../lessons/gotcha-vite-to-rsbuild-migration.md) · [sse-ondone-guard.md](../lessons/gotcha-sse-ondone-guard.md) · [macos-fsevents-silent-drop.md](../lessons/gotcha-macos-fsevents-silent-drop.md) · [no-lockfile-supply-chain-risk.md](../lessons/gotcha-no-lockfile-supply-chain-risk.md) |
| `lessons/failures/` | [incident-postmortem-summary.md](../lessons/failure-incident-postmortem.md) · [ai-product-launch-lessons-summary.md](../lessons/failure-ai-product-launch-lessons.md) · [bugs/](../lessons) — missed-change archive |
| `tech/infra/` | [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) · [tech-debt-inventory-template.md](../../oncall-sre/observability/tech-debt-inventory.md) · [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) |
| `work/tools/` | [claude-code-tips.md](claude-code-tips.md) — AI archaeology · [pi-agent-harness-evolution.md](pi-agent-harness-evolution.md) |
| `lifecycle/` | [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) · [knowledge-map.md](../../knowledge-curator/diagrams/knowledge-map.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) |
| `work/meetings/` | [review-meeting-template.md](../../product-manager/delivery/review-meeting.md) · [weekly-meeting-template.md](../../product-manager/delivery/weekly-meeting.md) · [retrospective-sample.md](../../product-manager/delivery/retrospective.md) |
| `projects/` | each project's `architecture-summary.md` §history + `dev-standards-summary.md` §conventions + `adr-*` |
| `journeys/` | [./troubleshoot-a-regression.md](../quality-security/troubleshoot-a-regression.md) · [../../tech-lead/roadmap/manage-tech-debt.md](../../tech-lead/roadmap/manage-tech-debt.md) · [./do-a-code-review.md](../quality-security/do-a-code-review.md) · [./roll-out-a-migration.md](../infrastructure/roll-out-a-migration.md) |

## Action recommendations

1. **first principles**: first ask "what problem this code originally solved / is it still alive / ROI"; do not do archaeology for its own sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md).
2. **inversion**: first think "what blind changes could do (break implicit constraints / introduce regressions / erase ADR / erase predecessors' patches)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md).
3. **second-order effects**: change one spot → cascade through schema / interface / test / documentation; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md).
4. **Occam**: smallest modification that satisfies the fix wins; do not opportunistically refactor; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md).
5. **read history**: `git log` + `git blame` + `git log -S` + PR history + commit messages; see intent first.
6. **read ADR**: must scan `projects/*/adr-*` + `resources/templates/adr-template.md`; find that year's decisions.
7. **read documentation**: first `architecture-summary` + `dev-standards` + `knowledge-leaf` + `README`; do not dive straight into source.
8. **read tests**: tests are behavior contracts; via [contract-test-baseline-pattern.md](../quality-security/contract-test-baseline.md).
9. **read comments**: comments often carry constraints / workarounds / bug numbers; do not ignore `// XXX` `// FIXME` `// HACK`.
10. **read issues / bugs**: `lessons/failures/bugs/` + `lessons/gotchas/` for predecessors' traps.
11. **find predecessors**: must run [knowledge-transfer-process.md](../process/knowledge-transfer.md) + [project-handover-process.md](../process/project-handover.md); 30min talk beats 3h reading code.
12. **AI assistance**: use [code-review-prompt.md](../../ai-engineer/methodology/prompts--code-review.md) + [claude-code-tips.md](claude-code-tips.md) to have AI summarize module + find entries + find risks.
13. **draw diagrams**: must draw dependency graph / call graph / data flow; via [tech-design-template.md](../../knowledge-curator/templates/tech-design.md).
14. **scope**: archaeology ≠ change; read-only + record + assess; changes must follow [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md).
15. **test safety net**: before changes, must add [evaluation-driven-development-pattern.md](../engineering/evaluation-driven-development.md) as safety net; no tests, no action.
16. **small steps**: via [staged-port-methodology-pattern.md](../architecture-design/staged-port-methodology.md) + [one-to-one-mapping-migration-pattern.md](../architecture-design/one-to-one-mapping-migration.md); do not big-bang.
17. **tech debt**: archaeology-discovered debt must land in [tech-debt-inventory-template.md](../../oncall-sre/observability/tech-debt-inventory.md) + pay down quarterly; do not opportunistically change.
18. **tacit knowledge**: tacit knowledge surfaced by archaeology must land in [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) to make explicit.
19. **retrospective**: after archaeology, write a [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) and archive; do not do archaeology once and discard once.
20. **quarterly scan**: via [review-log.md](../../knowledge-curator/governance/review-log.md) scan whether legacy modules are still alive / can be retired.
21. **ADR**: archaeology conclusions must land in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
22. **flywheel**: archaeology → documentation grows → handover faster → refactor bolder; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md).

## Anti-patterns

- **Modifying code before understanding why it was written that way** — Every line of legacy code exists for a reason, even if that reason is no longer valid. Modifying code without understanding the reason breaks implicit constraints, reintroduces old bugs, and wastes time. The cost of archaeology (reading ADRs, `git blame`, tests) is always lower than the cost of fixing a regression caused by a blind change.

- **Starting archaeology without a hypothesis** — Without a hypothesis ("I think this module handles X by doing Y"), archaeology becomes passive reading. You read code without a goal and emerge with a vague understanding. A hypothesis is a compass: it tells you what to look for and when you've found it.

- **Trusting comments and documentation over tests** — Comments and documentation can be outdated (the code changed, the comment didn't). Tests cannot be outdated: they either pass (describing current behavior) or fail (revealing that behavior changed). Read the test suite before reading the code; it tells you what the code is supposed to do.

- **Ignoring the author as a resource** — `git blame` reveals the author of every line. A 5-minute conversation with the author can replace 2 hours of reading code. The author is not there to assign blame; the author is there to answer "what were you thinking?" The fastest path to understanding is through the person who wrote it.

- **Archaeology without documentation output** — The knowledge gained from archaeology is tacit and fragile: it lives in one person's head and disappears when they leave. The output of archaeology must be documentation (knowledge leaf, ADR, or updated README) that makes the tacit knowledge explicit. Archaeology without documentation output is archaeology that will need to be repeated.

## Related

- same-class journey: [./troubleshoot-a-regression.md](../quality-security/troubleshoot-a-regression.md) — regression investigation
- same-class journey: [../../tech-lead/roadmap/manage-tech-debt.md](../../tech-lead/roadmap/manage-tech-debt.md) — debt
- same-class journey: [./do-a-code-review.md](../quality-security/do-a-code-review.md) — code review
- same-class journey: [./roll-out-a-migration.md](../infrastructure/roll-out-a-migration.md) — migration
- upstream: [../../README.md](../../README.md) — engineering-patterns leaf entry
