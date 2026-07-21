---
name: skill-creator-eval
description: >
  Run test cases and evaluate skill performance — parallel subagent
  execution with baseline comparison, assertion grading, benchmark
  aggregation, and interactive eval viewer for human review.
---

# Skill Creator — Running & Evaluating Test Cases

Run the skill against test prompts with parallel subagent execution, grade results quantitatively, aggregate benchmarks, and launch the interactive eval viewer for human review.

## Available Tools

| Tool | Purpose |
|------|---------|
| `Task` (subagent) | Parallel test execution with/without skill |
| `RunCommand` | Aggregate benchmarks, launch viewer |
| `Read` | Read feedback.json, agent instructions |
| `Write` | Save timing.json, grading.json, eval_metadata.json |

## Prerequisites

- SKILL.md is drafted and test cases exist in `evals/evals.json`
- Workspace directory exists: `<skill-name>-workspace/` as a sibling to the skill directory

This section is one continuous sequence — don't stop partway through. Do NOT use `/skill-test` or any other testing skill.

## Workspace Layout

```
<skill-name>-workspace/
├── iteration-1/
│   ├── eval-<descriptive-name>/
│   │   ├── with_skill/outputs/
│   │   ├── without_skill/outputs/   (or old_skill/outputs/)
│   │   ├── eval_metadata.json
│   │   ├── timing.json
│   │   └── grading.json
│   └── benchmark.json
├── iteration-2/
│   └── ...
└── feedback.json
```

Create directories as you go — don't create everything upfront.

## Step 1: Spawn All Runs in the Same Turn

For each test case, spawn two subagents simultaneously — one with the skill, one without. Do NOT spawn with-skill runs first and baselines later; launch everything at once.

**With-skill run:**

```
Execute this task:
- Skill path: <path-to-skill>
- Task: <eval prompt>
- Input files: <eval files if any, or "none">
- Save outputs to: <workspace>/iteration-<N>/eval-<ID>/with_skill/outputs/
- Outputs to save: <what the user cares about>
```

**Baseline run** (depends on context):
- **Creating a new skill**: no skill at all. Same prompt, no skill path, save to `without_skill/outputs/`.
- **Improving an existing skill**: the old version. Before editing, snapshot the skill: `cp -r <skill-path> <workspace>/skill-snapshot/`, then point the baseline subagent at the snapshot. Save to `old_skill/outputs/`.

Write an `eval_metadata.json` for each test case (assertions can be empty for now). Give each eval a descriptive name based on what it's testing — not just "eval-0". Use this name for the directory too.

```json
{
  "eval_id": 0,
  "eval_name": "descriptive-name-here",
  "prompt": "The user's task prompt",
  "assertions": []
}
```

## Step 2: While Runs Are in Progress, Draft Assertions

Don't just wait — draft quantitative assertions for each test case and explain them to the user. If assertions already exist in `evals/evals.json`, review them and explain what they check.

Good assertions are objectively verifiable with descriptive names — they should read clearly in the benchmark viewer. Subjective skills (writing style, design quality) are better evaluated qualitatively — don't force assertions onto things that need human judgment.

Update the `eval_metadata.json` files and `evals/evals.json` with the assertions once drafted. Explain to the user what they'll see in the viewer — both the qualitative outputs and the quantitative benchmark.

## Step 3: As Runs Complete, Capture Timing Data

When each subagent task completes, save timing data immediately to `timing.json` in the run directory:

```json
{
  "total_tokens": 84852,
  "duration_ms": 23332,
  "total_duration_seconds": 23.3
}
```

This is the only opportunity to capture this data — it comes through the task notification and isn't persisted elsewhere. Process each notification as it arrives.

## Step 4: Grade, Aggregate, and Launch the Viewer

Once all runs are done:

1. **Grade each run** — spawn a grader subagent (or grade inline) that reads `../agents/grader.md` and evaluates each assertion against the outputs. Save results to `grading.json` in each run directory. The grading.json expectations array must use the fields `text`, `passed`, and `evidence` (not `name`/`met`/`details`). For assertions checkable programmatically, write and run a script — it's faster, more reliable, and reusable.

2. **Aggregate into benchmark** — from the skill-creator directory:
   ```bash
   python -m scripts.aggregate_benchmark <workspace>/iteration-N --skill-name <name>
   ```
   Produces `benchmark.json` and `benchmark.md`. Put each with_skill version before its baseline counterpart. For manual benchmark.json generation, see `../references/schemas.md`.

3. **Do an analyst pass** — read the benchmark data and surface patterns. See `../agents/analyzer.md` ("Analyzing Benchmark Results") for what to look for: non-discriminating assertions, high-variance evals, time/token tradeoffs.

4. **Launch the viewer**:
   ```bash
   nohup python <skill-creator-path>/eval-viewer/generate_review.py \
     <workspace>/iteration-N \
     --skill-name "my-skill" \
     --benchmark <workspace>/iteration-N/benchmark.json \
     > /dev/null 2>&1 &
   VIEWER_PID=$!
   ```
   For iteration 2+, also pass `--previous-workspace <workspace>/iteration-<N-1>`.

   **Cowork / headless**: Use `--static <output_path>` to write a standalone HTML file. Feedback downloads as `feedback.json` when the user clicks "Submit All Reviews". Copy `feedback.json` into the workspace for the next iteration.

5. **Tell the user**: "I've opened the results in your browser. There are two tabs — 'Outputs' lets you click through each test case and leave feedback, 'Benchmark' shows the quantitative comparison. When you're done, come back here and let me know."

### What the User Sees in the Viewer

**Outputs tab** (one test case at a time):
- **Prompt**: the task that was given
- **Output**: files the skill produced, rendered inline where possible
- **Previous Output** (iteration 2+): collapsed section showing last iteration's output
- **Formal Grades** (if grading was run): collapsed section showing assertion pass/fail
- **Feedback**: auto-saving textbox
- **Previous Feedback** (iteration 2+): comments from last time

**Benchmark tab**: pass rates, timing, and token usage for each configuration, with per-eval breakdowns and analyst observations.

Navigation: prev/next buttons or arrow keys. "Submit All Reviews" saves all feedback to `feedback.json`.

## Step 5: Read the Feedback

When the user says they're done, read `feedback.json`:

```json
{
  "reviews": [
    {"run_id": "eval-0-with_skill", "feedback": "the chart is missing axis labels", "timestamp": "..."},
    {"run_id": "eval-1-with_skill", "feedback": "", "timestamp": "..."}
  ],
  "status": "complete"
}
```

Empty feedback means the user was satisfied. Focus improvements on test cases with specific complaints.

Kill the viewer server when done:
```bash
kill $VIEWER_PID 2>/dev/null
```

## Environment-Specific Adaptations

### Claude.ai (No Subagents)

- Run test cases sequentially yourself (read SKILL.md, follow instructions, complete the task)
- Skip baseline runs
- Skip quantitative benchmarking
- Present results directly in conversation instead of the browser viewer

### Cowork (No Browser)

- Use `--static <output_path>` for the viewer
- `generate_review.py` before evaluating inputs yourself
- Feedback comes via downloaded `feedback.json`

## Fallback

| Situation | Behavior |
|-----------|----------|
| Subagent timeouts | Run test prompts in series rather than parallel |
| No browser/display | Use `--static` flag; feedback via `feedback.json` download |
| Claude.ai environment | Run sequentially; skip baselines, benchmarking, description optimization |
| Evaluation viewer fails to start | Present results inline in conversation |
| Grading script errors | Grade manually; document evidence for each assertion |
