---
name: skill-creator-improve
description: >
  Improve a skill based on user feedback — analyze eval results, revise
  the SKILL.md, rerun test cases, and iterate until the skill meets
  quality expectations.
---

# Skill Creator — Improving the Skill

Iterate on a skill based on user feedback from the eval viewer. This is the heart of the skill creator loop — the process that makes skills general and robust.

## Available Tools

| Tool | Purpose |
|------|---------|
| `Read` | Read feedback.json, eval outputs, transcripts |
| `SearchReplace` / `Write` | Edit the skill's SKILL.md |
| `RunCommand` | Snapshot skills, rerun evals |
| `Task` (subagent) | Rerun test cases in parallel |

## Core Loop

```
Read Feedback → Analyze Patterns → Revise Skill → Rerun Tests → Evaluate → Repeat
```

## How to Think About Improvements

1. **Generalize from the feedback.** The goal is skills that work across a million different prompts, not just the few test cases. If a skill works only for the test examples, it's useless. Rather than fiddly overfitty changes or oppressively constrictive MUSTs, try different metaphors or recommend alternative patterns of working. It's relatively cheap to experiment.

2. **Keep the prompt lean.** Remove things that aren't pulling their weight. Read the transcripts, not just the final outputs — if the skill is making the model waste time on unproductive tasks, remove those parts and see what happens.

3. **Explain the why.** Today's LLMs are smart. They have good theory of mind and when given a good harness can go beyond rote instructions. Transmit understanding into the instructions. If you find yourself writing ALWAYS or NEVER in all caps or using super rigid structures, that's a yellow flag — reframe and explain the reasoning so the model understands why the thing matters. This is more humane, powerful, and effective.

4. **Look for repeated work across test cases.** Read the transcripts and notice if subagents all independently wrote similar helper scripts or took the same multi-step approach. If all 3 test cases resulted in writing a `create_docx.py` or `build_chart.py`, that's a strong signal the skill should bundle that script. Write it once, put it in `scripts/`, and tell the skill to use it.

## The Iteration Loop

After reading feedback from the eval viewer:

1. Identify which test cases have specific complaints (non-empty feedback)
2. Analyze transcripts to understand what went wrong
3. Apply improvements to the skill's SKILL.md
4. Rerun all test cases into a new `iteration-<N+1>/` directory, including baseline runs
   - New skill: baseline is always `without_skill` (no skill) — stays the same across iterations
   - Improving existing skill: use judgment on baseline — original version or previous iteration
5. Launch the reviewer with `--previous-workspace` pointing at the previous iteration
6. Wait for the user to review and tell you they're done
7. Read the new feedback, improve again, repeat

## Stopping Criteria

Stop iterating when:
- The user says they're happy
- The feedback is all empty (everything looks good)
- You're not making meaningful progress

## Blind Comparison (Advanced)

For rigorous comparison between two skill versions (e.g., "is the new version actually better?"), there's a blind comparison system. Read `../agents/comparator.md` and `../agents/analyzer.md` for the details. The basic idea: give two outputs to an independent agent without telling it which is which, and let it judge quality. Then analyze why the winner won.

This is optional, requires subagents, and most users won't need it. The human review loop is usually sufficient.

## Fallback

| Situation | Behavior |
|-----------|----------|
| Feedback is all empty | Skill is done; proceed to optimization or packaging |
| User says "just try something" | Make your best judgment and rerun; iterate from there |
| Transcripts show subagents all writing the same helper | Bundle that helper into `scripts/` |
| Stubborn issue across multiple iterations | Try different metaphors or patterns rather than more constraints |
| Claude.ai (no subagents) | Run test cases sequentially; present results in conversation |
