---
name: rui-tools-skill
description: >
  Create new skills, modify and improve existing skills, and measure
  skill performance. Use this skill whenever the user wants to create a
  skill from scratch, edit or optimize an existing skill, run evals to
  test a skill, benchmark skill performance with variance analysis, or
  optimize a skill's description for better triggering accuracy.
  Trigger words: skill creator, create skill, new skill, improve skill,
  skill eval, skill benchmark, optimize description, package skill.
lifecycle: default-pipeline
user_invocable: true
---

# rui-tools-skill-creator

> Create, evaluate, and iteratively improve Claude skills — from capturing user intent through drafting, testing, benchmarking, and packaging.

## Quick Start

```
/rui-tools-skill-creator create    → Draft a new skill from scratch
/rui-tools-skill-creator eval      → Run test cases and evaluate results
/rui-tools-skill-creator improve   → Revise the skill based on feedback
/rui-tools-skill-creator optimize  → Optimize the description for better triggering
/rui-tools-skill-creator package   → Package the final skill for distribution
```

## What This Skill Does

- Guide users through creating a new skill: capture intent, interview, research, and draft the SKILL.md
- Run test cases with parallel subagent execution (with-skill vs baseline)
- Evaluate results both qualitatively (eval viewer) and quantitatively (benchmarking with assertions and grading)
- Iterate on skill improvements based on user feedback from the eval viewer
- Optimize skill descriptions for better triggering accuracy via automated loops
- Package finalized skills into distributable `.skill` files
- Support blind A/B comparison between skill versions for rigorous evaluation
- Adapt workflows for different environments: Claude Code (full subagents), Cowork (static viewer), and Claude.ai (simplified workflow)

## What This Skill Does NOT Do

- Does NOT write the skill automatically without user input and review — the user is the decision-maker throughout
- Does NOT bypass the eval viewer — always present results to the human before making changes
- Does NOT replace the user's domain expertise — the skill creator guides the process, the user provides the knowledge
- Does NOT guarantee perfect triggering — description optimization improves accuracy but needs good eval queries

## Workflow

The core loop for any skill project:

```
Capture Intent → Draft Skill → Run Test Cases → Evaluate (Viewer + Benchmark) → Improve → Repeat
```

Key principles:
1. The user is always the decision-maker — present results before making changes
2. Always generate the eval viewer before evaluating inputs yourself — get results in front of the human ASAP
3. Baseline comparison is essential for new skills (without_skill) and improvements (old_skill snapshot)
4. Use parallel subagent execution for test cases to minimize wall-clock time
5. Description optimization happens after the skill is finalized, not during active iteration

## Borders

| Boundary | Permission |
|----------|-----------|
| `<skill-path>/**` (skill being created/edited) | read + write |
| `<workspace>/**` (eval workspace, sibling to skill) | read + write |
| Installed skills outside the target path | read-only |
| System files outside workspace | no access |

## Rules

| # | Rule | Rationale |
|---|------|-----------|
| 1 | Present eval results to the user before making changes | Human judgment is essential for subjective quality |
| 2 | Always generate the eval viewer via `generate_review.py` after running tests | Consistent review experience; don't write custom HTML |
| 3 | Spawn with-skill and baseline runs in the same turn | Minimize wall-clock time and ensure fair comparison |
| 4 | Save timing data immediately when subagent notifications arrive | It's the only opportunity to capture `total_tokens` and `duration_ms` |
| 5 | Grading.json must use `text`/`passed`/`evidence` fields | The eval viewer depends on these exact field names |
| 6 | Never run `/skill-test` or other testing skills | Use the subagent workflow described in this skill |
| 7 | Skill descriptions should be slightly "pushy" — include specific trigger contexts | Claude tends to undertrigger skills; compensate in the description |
| 8 | Keep skill prompts lean — explain the why, not just rigid MUSTs | Today's LLMs perform better with reasoning than with constraints |
| 9 | Look for repeated work across test transcripts | If all subagents independently wrote the same helper, bundle it in `scripts/` |

## Commands

- [create.md](./commands/create.md) — Capture user intent, interview, research, and draft a new skill's SKILL.md.
- [eval.md](./commands/eval.md) — Run test cases with parallel subagents, grade results, aggregate benchmarks, and launch the eval viewer.
- [improve.md](./commands/improve.md) — Revise the skill based on feedback, rerun tests, and iterate until satisfied.
- [optimize.md](./commands/optimize.md) — Generate trigger eval queries and run the description optimization loop.
- [package.md](./commands/package.md) — Package the finalized skill into a distributable `.skill` file.

## Supporting Resources

- [agents/grader.md](./agents/grader.md) — Instructions for grading subagents: how to evaluate assertions against outputs.
- [agents/comparator.md](./agents/comparator.md) — Instructions for blind A/B comparison between two outputs.
- [agents/analyzer.md](./agents/analyzer.md) — Instructions for analyzing benchmark results and comparison outcomes.
- [references/schemas.md](./references/schemas.md) — JSON schemas for `evals.json`, `grading.json`, `benchmark.json`, etc.
- [assets/eval_review.html](./assets/eval_review.html) — HTML template for reviewing description optimization eval queries.
- [eval-viewer/generate_review.py](./eval-viewer/generate_review.py) — Script to generate the interactive eval review viewer.
- [scripts/](./scripts/) — Utility scripts for aggregation, benchmarking, packaging, and description optimization.

## Fallback

| Situation | Behavior |
|-----------|----------|
| User doesn't want formal evals ("just vibe with me") | Skip eval workflow; iterate informally based on conversation feedback |
| Subagent timeouts during test runs | Fall back to running test prompts in series rather than parallel |
| No browser/display available (Cowork, headless) | Use `--static` flag with `generate_review.py`; feedback comes via `feedback.json` download |
| No `present_files` tool available | Skip packaging step; direct user to the skill directory |
| On Claude.ai (no subagents) | Run test cases sequentially yourself; skip baselines and quantitative benchmarking; skip description optimization |
| Description optimization fails (`claude -p` not available) | Skip optimization; the manual description in SKILL.md frontmatter is sufficient |
| `package_skill.py` fails due to permissions | Stage in `/tmp/` first, then copy to target directory |
