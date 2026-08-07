---
title: Code Review Prompt
lifecycle: active
status: stable
tags:
- Prompt
- code-review
- dev-tool
- AI
- Claude
- GPT-5
category: ai-engineer/methodology/prompts
created: 2024-06-01
updated: 2026-08-07
source: internal
type: summary
roles:
- ai-engineer
- product-manager
benefit: ai methodology sound
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
review_cycle: quarterly
last_verified: 2026-08-07
tacit: false
related:
  - ./agent-tool-use.md
  - ./brd-generation.md
  - ./multilingual-translation.md
  - ../README.md
---

# Code Review Prompt

> **As an** ai engineer, **I want to** code review, **so that** ai methodology sound.

> Compatible with Claude Opus 4.7 / Sonnet 4.6, GPT-5, Gemini 2.5 Pro. Recommendation: enable prompt caching: put "Role + rule" at the front, and the code under review at the end.

## Summary

- AI code review's value is in design-level reasoning (abstraction quality, error-handling consistency, API coupling), not in finding bugs that static analysis tools catch with near-perfect precision
- The prompt is a configuration file for the reviewer's attention budget — focusing on 3-5 critical dimensions produces deeper reviews than checking 20 dimensions shallowly
- Language-specific prompts (Go goroutine leaks, Vue reactive destructuring, Python N+1 queries) produce actionable advice; generic prompts produce noise
- The code review prompt should evolve from the team's actual bug database — every production bug that could have been caught in review becomes a new prompt dimension
- Prompt caching reduces input cost by 90% for repetitive reviews; batch reviews at 300-500 lines per chunk; human calibration of severity ratings is essential for reliability

## Key info

- **Model compatibility**: Claude Opus 4.7 / Sonnet 4.6, GPT-5, Gemini 2.5 Pro. Prompt caching is the highest-ROI optimization: put static content (role, rules, examples) at the front as cacheable prefix, code under review at the end as variable suffix.

- **Severity classification**: Four levels — Blocker (must fix before merge, security/correctness issues), Major (should fix, performance/architecture issues), Minor (nice to fix, readability/maintainability), Nit (style preference). The model's severity assessment is a heuristic; human calibration is required until the override rate stabilizes below 10%.

- **Batch size constraints**: Reviews of PRs larger than 500 lines produce lower-quality results due to attention dilution. Split PRs into logical chunks of 300-500 lines each. For PRs larger than 2000 lines, the PR itself should be split — the review quality ceiling is set by the PR granularity, not the prompt quality.

- **Thinking budget**: Code review does not need extended reasoning. A thinking budget of 2000 tokens is sufficient for most reviews. Increasing the budget beyond this does not improve review quality and increases latency.

- **Language-specific failure modes**: Go (goroutine leaks, context propagation, error wrapping), Vue 3 (reactive destructuring, computed/watch tracking, shallowRef usage), Python/FastAPI (blocking IO in async, N+1 queries, Pydantic model coverage). Each language's prompt should encode the top 5-7 failure modes observed in the team's production incidents.

- **Output format options**: Markdown table (human-readable, good for PR comments), JSON with `response_format: json_schema` (machine-readable, good for CI integration). Few-shot examples (1-2 good reviews) stabilize output style more than format instructions alone.

## Core viewpoints

**The value of AI code review is not in finding bugs that static analysis would find -- it is in finding design-level issues that require reasoning about intent.** Static analysis tools (ESLint, Ruff, Clippy) catch syntax errors, style violations, and known anti-patterns with near-perfect precision. The AI's comparative advantage is in higher-level reasoning: does this abstraction make sense, is this error-handling strategy consistent, does this API design have hidden coupling. The AI review should focus on the questions that static analysis cannot answer, not on the questions it can answer more reliably.

**The code review prompt is a configuration file for the reviewer's attention budget.** The prompt determines what the model looks for, and the model's context window is limited. A prompt that asks the model to check 20 different dimensions will result in shallow checking of all 20. A prompt that focuses on 3-5 critical dimensions will result in deep checking of those dimensions. The prompt should prioritize the dimensions that cause the most production incidents in your codebase, not the dimensions that are most comprehensive.

**The reviewer's output quality is a function of the prompt quality, not the model quality.** The difference between a good code review and a bad one is not the model (Opus vs Sonnet vs GPT-5) -- it is the prompt. A well-structured prompt with a good model produces a better review than a poorly structured prompt with the best model. The prompt engineering investment (defining dimensions, severity levels, output format) returns more value than the model selection investment.

**Code review prompts should be language-specific, not generic.** A generic prompt ("review this code for bugs") produces generic advice that is mostly noise. A language-specific prompt ("check for goroutine leaks, context propagation, and error wrapping in Go") produces advice that is actionable. The prompt should be tailored to the language's specific failure modes, idioms, and best practices.

**The code review prompt is a living document that should evolve with the team's bug database.** Every production bug that could have been caught in code review should be added to the review prompt as a new dimension. If a bug was caused by a missing timeout, add "check for context.WithTimeout" to the Go prompt. If a bug was caused by a reactive destructuring issue, add "check for loss of reactivity via destructuring" to the Vue prompt. The prompt evolves from the team's actual failures, not from a generic checklist.

## 1. Basic version (general)

```
You are a senior software engineer. Please review the following code:

Requirements:
1. Check whether the code logic is correct
2. Find potential performance issues
3. Point out security vulnerabilities (OWASP Top 10)
4. Evaluate code readability and maintainability
5. Give concrete improvement suggestions and code examples

For each issue provide: severity (high/medium/low), explanation, fix suggestion, fix code snippet.

Code:
```{paste code here}```
```

## 2. Enhanced version (per-dimension review)

```
You are a [language/framework] expert. Please review the code along the following dimensions:

- Functional correctness
- Error handling (boundary, exception, timeout)
- Performance and resources (time/space complexity, memory leaks)
- Security risks (injection, XSS, CSRF, auth, secret leakage)
- Test coverage and testability
- Readability and naming
- Architecture soundness (coupling, cohesion, SOLID)

For each issue provide: severity (Blocker / Major / Minor / Nit), explanation, fix suggestion, fix code.
Finally output a summary table: dimension | Blocker | Major | Minor.
```

## 3. PR review (Git workflow)

```
Please review the following PR changes, focusing on:
1. Whether the changes implement the intended functionality
2. Whether there are breaking changes (API, DB schema, config)
3. Whether any test cases are missing
4. Whether code style matches the project (ESLint / Biome / Ruff / gofmt)
5. Whether new dependencies are introduced and whether they are safe (vulnerabilities, license)

Output format:
- Summary (1-2 sentences)
- Blocker issues (must fix)
- Suggested improvements (optional)
- Pass / Fail conclusion

Change diff:
```{paste diff}```
```

## 4. Language / framework-specific variants

### 4.1 Vue 3 + TypeScript

```
You are a Vue 3 + TypeScript expert (Composition API, Pinia, Vitest).
Focus on:
- Whether reactive/ref is used correctly (avoid losing reactivity via destructuring)
- Whether computed and watch dependency tracking is correct
- Whether props types and defineEmits are complete
- Whether there is unnecessary any, whether type guards are missing
- Whether the component is too large in a single file (>300 lines warning)
- Whether shallowRef / markRaw is used correctly to avoid deep reactivity
- Whether async components, Suspense, Teleport are used reasonably

Code:
```{code}```
```

### 4.2 Python / FastAPI

```
You are a FastAPI + Pydantic expert.
Focus on:
- Whether blocking IO exists in async functions (use run_in_executor / async libs)
- Whether Pydantic models cover inputs and outputs, avoid passing raw dicts
- Whether dependency injection (Depends) is reasonable, whether there are circular dependencies
- Whether N+1 queries exist (SQLAlchemy selectinload / joinedload)
- Whether exception handling is unified (@app.exception_handler)
- Security: SQL injection, SSRF, deserialization, file upload validation
- Idempotency of async tasks (Celery / ARQ)

Code:
```{code}```
```

### 4.3 Go

```
You are a Go expert.
Focus on:
- Goroutine leaks (context not propagated, channel not closed)
- Whether error handling uses wrapping (fmt.Errorf %w) and sentinel comparison
- Whether concurrency primitives (mutex, atomic, sync.Map) are used correctly
- Defer order, resource closing
- Whether interface abstraction is premature (accepts interfaces, returns structs)
- Performance: slice pre-allocation, string concatenation (strings.Builder), map reuse
- Whether context.WithTimeout is set

Code:
```{code}```
```

## 5. Output format example

```
| Dimension | Blocker | Major | Minor | Nit |
|------|---------|-------|-------|-----|
| Correctness | 0 | 1 | 0 | 0 |
| Security | 1 | 0 | 0 | 0 |
| Performance | 0 | 2 | 1 | 0 |

## Blocker

### B1. SQL concatenation has injection risk
- File: src/api/users.py:42
- Explanation: directly concatenates user input into SQL string
- Fix: use parameterized query
```python
# Before
cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")

# After
cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
```
```

## 6. Prompt engineering tips

- **Enable prompt caching**: put "Role + rule + example" at the front, code under review at the end
- **Limit thinking budget**: code review does not need long thinking, budget = 2000 is enough
- **Few-shot**: provide 1-2 good review examples, output style will be more stable
- **Structured output**: request JSON output for CI integration (response_format: json_schema)
- **Batch review**: when a single PR > 1000 lines, batch it; each batch < 500 lines works better

## Action recommendations

1. **Create a language-specific code review prompt for each language in your stack:** The generic prompts in sections 1-3 are a starting point, not a finished product. For each language in your codebase (Python, TypeScript/Vue, Go), create a dedicated prompt file that includes the language-specific failure modes documented in section 4 plus any additional patterns from your team's bug database. Store these prompts in version control alongside the code so they evolve with the codebase. A Go developer should never use the generic prompt; they should use the Go-specific prompt that checks for goroutine leaks, context propagation, and error wrapping.

2. **Build a bug-to-prompt feedback loop:** Every production bug that could have been caught in code review should be added to the relevant language-specific prompt as a new dimension within one week of the postmortem. Create a lightweight process: (1) during the postmortem, identify whether the bug could have been caught in code review, (2) if yes, draft a one-line addition to the code review prompt, (3) add it to the prompt in the same PR that closes the postmortem action items. This turns the prompt into a living document that reflects the team's actual failure modes, not a generic checklist.

3. **Implement prompt caching for all code review requests:** The role description, rules, and examples in the code review prompt are static content that the model re-processes for every review. Without prompt caching, you pay the full input token cost for every review. With prompt caching, you pay the full cost once for the static prefix and only the incremental cost for the code under review. This is a 90% cost reduction for repetitive reviews. The implementation is simple: put the static content (role, rules, example format) at the beginning of the prompt, mark it as cacheable, and put the code under review at the end.

4. **Set a hard limit of 500 lines per review batch:** Reviews of PRs larger than 500 lines produce lower-quality results because the model's attention is diluted across the entire diff. Implement a batch review workflow: (1) split the PR into logical chunks of 300-500 lines each, (2) review each chunk independently with the full prompt, (3) compile the results into a single review comment. The cost of running 3 reviews of 400 lines each is higher than 1 review of 1200 lines, but the quality improvement justifies the cost. For PRs larger than 2000 lines, the PR itself is the problem -- the author should split it into smaller PRs.

5. **Calibrate the model's severity ratings with a human override step:** The model's severity assessment (Blocker/Major/Minor/Nit) is a heuristic, not a guarantee. Implement a post-review calibration step: after the model produces its review, a human reviewer spends 2 minutes scanning the severity ratings and reclassifying any that are obviously wrong. Track the calibration rate (how many severity ratings were changed) over time. If the calibration rate stabilizes below 10%, the model's severity assessment is reliable enough to reduce the calibration to a spot check. If it stays above 20%, the prompt needs more examples of correct severity classification.

## Anti-patterns

- **Using a generic code review prompt for all languages.** A generic prompt produces generic advice. The model's ability to find language-specific issues (goroutine leaks in Go, reactive destructuring in Vue, N+1 queries in Python) depends on the prompt explicitly asking for them. The prompt should be tailored to the language's specific failure modes and idioms.

- **Reviewing a PR with more than 500 lines of changes in a single request.** The model's attention is diluted across the entire diff, and it will miss issues in the middle of large changes. Split the PR into logical chunks of 300-500 lines each, and review each chunk independently. The review of each chunk is more thorough than a single review of the entire PR.

- **Treating the model's severity ratings as ground truth.** The model's severity assessment (Blocker/Major/Minor/Nit) is a heuristic, not a guarantee. The model may flag a style preference as a Blocker and miss a real security vulnerability. The human reviewer must calibrate the model's severity ratings -- the model finds the issues, the human decides the severity.

- **Not enabling prompt caching for repetitive code review tasks.** The role, rules, and examples in the code review prompt are the same for every review. Without prompt caching, the model re-processes this static content for every review, wasting latency and cost. With prompt caching, the static content is processed once and reused, reducing input cost by 90%.

- **Using a code review prompt without providing examples of good reviews.** The model's output style is strongly influenced by the examples in the prompt. Without examples, the model may produce reviews that are too verbose, too brief, or in the wrong format. Providing 1-2 examples of good reviews (with the right level of detail, severity classification, and output format) stabilizes the output style.

## Related

- [./agent-tool-use.md](./agent-tool-use.md) — Agent tool use prompt, another prompt engineering artifact
- [./brd-generation.md](./brd-generation.md) — BRD generation prompt, another structured output prompt
- [./multilingual-translation.md](./multilingual-translation.md) — Multilingual translation prompt, another language-specific prompt
- [../README.md](../README.md) — AI methodology README with prompt engineering overview
- [../../../engineer/quality-security/bug-logging-protocol.md](../../../engineer/quality-security/bug-logging-protocol.md) — Recurring bug patterns that code review prompts should catch
