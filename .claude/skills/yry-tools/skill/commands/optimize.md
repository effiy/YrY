---
name: skill-creator-optimize
description: >
  Optimize a skill's description for better triggering accuracy —
  generate trigger eval queries, run the automated optimization loop,
  and apply the best-performing description to the SKILL.md frontmatter.
---

# Skill Creator — Description Optimization

Optimize the description field in SKILL.md frontmatter — the primary mechanism that determines whether Claude invokes a skill.

## Available Tools

| Tool | Purpose |
|------|---------|
| `Read` / `Write` | Read HTML template, write review file |
| `RunCommand` | Open review HTML, run optimization loop, run eval |
| `Task` (subagent) | Background monitoring of optimization loop |

## Prerequisites

- Skill is finalized (improvement loop is done)
- `claude -p` CLI tool is available (requires Claude Code; skip on Claude.ai)

Offer to optimize after the skill is done, not during active iteration.

## Step 1: Generate Trigger Eval Queries

Create 20 eval queries — a mix of should-trigger (8-10) and should-not-trigger (8-10). Save as JSON:

```json
[
  {"query": "the user prompt", "should_trigger": true},
  {"query": "another prompt", "should_trigger": false}
]
```

### Writing Good Queries

Queries must be realistic — what a Claude Code or Claude.ai user would actually type. Include file paths, personal context, column names, company names, URLs, backstory. Mix of lengths, some lowercase with abbreviations or typos, casual speech. Focus on edge cases.

Good: `"ok so my boss just sent me this xlsx file (its in my downloads, called something like 'Q4 sales final FINAL v2.xlsx') and she wants me to add a column that shows the profit margin as a percentage. The revenue is in column C and costs are in column D i think"`

Bad: `"Format this data"`, `"Extract text from PDF"`, `"Create a chart"`

**Should-trigger queries**: Different phrasings of the same intent — formal and casual. Include cases where the user doesn't explicitly name the skill but clearly needs it. Include uncommon use cases and cases where this skill competes with another but should win.

**Should-not-trigger queries**: Near-misses — queries that share keywords but need something different. Adjacent domains, ambiguous phrasing where a naive keyword match would trigger but shouldn't. Don't make them obviously irrelevant — "Write a fibonacci function" as a negative test for a PDF skill is too easy.

### How Skill Triggering Works

Skills appear in Claude's `available_skills` list with name + description. Claude only consults skills for tasks it can't easily handle on its own — simple one-step queries may not trigger skills even if the description matches. Complex, multi-step, or specialized queries reliably trigger skills. So eval queries should be substantive enough that Claude would actually benefit from consulting a skill.

## Step 2: Review with User

Present the eval set using the HTML template:

1. Read the template from `../assets/eval_review.html`
2. Replace placeholders:
   - `__EVAL_DATA_PLACEHOLDER__` → the JSON array (no quotes around it — it's a JS variable assignment)
   - `__SKILL_NAME_PLACEHOLDER__` → the skill's name
   - `__SKILL_DESCRIPTION_PLACEHOLDER__` → the skill's current description
3. Write to `/tmp/eval_review_<skill-name>.html` and open it: `open /tmp/eval_review_<skill-name>.html`
4. User can edit queries, toggle should-trigger, add/remove entries, then click "Export Eval Set"
5. The file downloads to `~/Downloads/eval_set.json` — check for the most recent version (e.g., `eval_set (1).json`)

This step matters — bad eval queries lead to bad descriptions.

## Step 3: Run the Optimization Loop

Tell the user: "This will take some time — I'll run the optimization loop in the background and check on it periodically."

Save the eval set to the workspace, then run in the background:

```bash
python -m scripts.run_loop \
  --eval-set <path-to-trigger-eval.json> \
  --skill-path <path-to-skill> \
  --model <model-id-powering-this-session> \
  --max-iterations 5 \
  --verbose
```

Use the model ID from the system prompt (the one powering the current session) so the triggering test matches what the user actually experiences.

Periodically tail the output to give the user updates on iteration progress and scores.

The loop splits the eval set into 60% train / 40% held-out test, evaluates the current description (running each query 3 times for reliable trigger rate), then calls Claude to propose improvements based on what failed. It re-evaluates each new description on both train and test, iterating up to 5 times. When done, it opens an HTML report in the browser showing results per iteration and returns JSON with `best_description` — selected by test score rather than train score to avoid overfitting.

## Step 4: Apply the Result

Take `best_description` from the JSON output and update the skill's SKILL.md frontmatter. Show the user before/after and report the scores.

## Fallback

| Situation | Behavior |
|-----------|----------|
| `claude -p` not available (Claude.ai) | Skip optimization; the manual description is sufficient |
| User doesn't want optimization | Skip; the manual description in SKILL.md is sufficient |
| Eval set file not found in Downloads | Check for `eval_set (1).json` or similar variants |
| Optimization loop fails mid-run | Use the best description from completed iterations |
