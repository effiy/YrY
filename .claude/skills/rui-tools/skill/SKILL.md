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

> Create, evaluate, and iteratively improve Claude skills — from capturing
> user intent through drafting, testing, benchmarking, and packaging.

## What this skill does

- Guide users through creating a new skill: capture intent, interview,
  research, and draft the SKILL.md.
- Run test cases with parallel subagent execution (with-skill vs baseline).
- Evaluate results both qualitatively and quantitatively (benchmarking
  with assertions and grading).
- Iterate on skill improvements based on user feedback.
- Optimize skill descriptions for better triggering accuracy.
- Package finalized skills into distributable `.skill` files.
- Support blind A/B comparison between skill versions.

## What this skill does NOT do

- Does NOT write the skill automatically without user input and review.
- Does NOT bypass the eval viewer — always present results to the human
  before making changes.
- Does NOT replace the user's domain expertise.
- Does NOT guarantee perfect triggering.

## Workflow

```
Capture Intent → Draft Skill → Run Test Cases → Evaluate → Improve → Repeat
```

Key principles:
1. The user is always the decision-maker — present results before changes.
2. Always generate the eval viewer before evaluating inputs yourself.
3. Baseline comparison is essential for new skills and improvements.
4. Use parallel subagent execution for test cases.
5. Description optimization happens after the skill is finalized.

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
| 2 | Spawn with-skill and baseline runs in the same turn | Minimize wall-clock time and ensure fair comparison |
| 3 | Save timing data immediately when subagent notifications arrive | It's the only opportunity to capture `total_tokens` and `duration_ms` |
| 4 | Grading.json must use `text`/`passed`/`evidence` fields | The eval viewer depends on these exact field names |
| 5 | Skill descriptions should be slightly "pushy" — include specific trigger contexts | Claude tends to undertrigger skills; compensate in the description |
| 6 | Keep skill prompts lean — explain the why, not just rigid MUSTs | Today's LLMs perform better with reasoning than with constraints |

## Supporting resources

- [references/schemas.md](./references/schemas.md) — JSON schemas for `evals.json`, `grading.json`, `benchmark.json`, etc.
- [agents/](./agents/) — subagent prompts: `analyzer.md` (post-hoc analysis), `comparator.md` (blind A/B winner), `grader.md` (expectation grading).
- [commands/](./commands/) — workflow entry points: `create.md`, `eval.md`, `improve.md`, `optimize.md`, `package.md`.

## Fallback

| Situation | Behavior |
|-----------|----------|
| User doesn't want formal evals ("just vibe with me") | Skip eval workflow; iterate informally based on conversation feedback |
| Subagent timeouts during test runs | Fall back to running test prompts in series rather than parallel |
| No browser/display available (Cowork, headless) | Use static feedback via `feedback.json` download |
| On Claude.ai (no subagents) | Run test cases sequentially yourself; skip baselines and quantitative benchmarking |
| Description optimization fails (`claude -p` not available) | Skip optimization; the manual description in SKILL.md frontmatter is sufficient |
