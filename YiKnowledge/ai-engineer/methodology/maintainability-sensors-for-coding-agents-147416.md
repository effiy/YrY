---
title: "Maintainability Sensors for Coding Agents: Static Analysis as a First Line of Defense"
tags: [static-analysis, harness-engineering, code-quality, sensors, linting]
category: ai-engineer/methodology
created: '2026-08-05'
updated: 2026-08-07
source: https://martinfowler.com/articles/sensors-for-coding-agents.html
source_name: Martin Fowler
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles: [ai-engineer, engineer]
benefit: "Use static analysis as a computational sensor in your coding agent harness to catch maintainability issues before they reach human review."
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - ai-engineer/methodology/feedback-flywheel-886f45.md
  - ai-engineer/methodology/fragments-april-29-93711d.md
---

# Maintainability Sensors for Coding Agents: Static Analysis as a First Line of Defense

> **As a** developer using coding agents, **I want to** add static analysis as a computational sensor in my harness, **so that** maintainability issues are caught automatically before code reaches human review.

## Summary

- Birgitta Boeckeler extends her harness engineering framework by walking through practical experiences using sensors to keep a codebase maintainable when coding agents generate the code.
- The first installment focuses on static analysis and basic code linting as the initial layer of computational sensors.
- The key insight: agents are better than humans at addressing static analysis warnings because they do not slack off -- they address every warning systematically.
- Static analysis converts fuzzy, subjective code quality rules into objective, deterministic checks that can be verified automatically.

## Core viewpoints

### 1. Agents are more disciplined than humans at fixing warnings
Humans tend to ignore linting warnings, especially in legacy codebases where the volume is overwhelming. Agents, when configured to address every warning, will systematically fix them all. This means static analysis is more valuable in an agentic workflow than in a human-only workflow -- the sensors actually get used.

### 2. Static analysis is the entry point for computational sensors
Not every code quality rule can be captured by static analysis, but starting with what can be automated provides immediate value. The progression is: linting rules, then type checking, then more sophisticated static analysis, then property-based testing, then formal methods. Each layer adds deterministic verification that reduces the burden on human review.

### 3. Sensors should be part of the agent's self-correction loop
The most effective pattern is not "human runs static analysis and tells agent to fix issues" but "agent runs static analysis on its own output and fixes issues before presenting to human." This shifts the human role from finding problems to verifying that the self-correction worked.

### 4. The sensor hierarchy is a ladder of increasing confidence
Static analysis catches syntax and pattern violations, but it cannot verify correctness. Type checking catches type mismatches but not logic errors. Property-based testing catches edge cases that static analysis and types miss. Formal methods catch properties that are hard to express as tests. Each rung of the ladder increases confidence but also increases the cost of writing the sensor. The pragmatic approach is to climb the ladder incrementally, investing in the next rung only when the current one stops catching the errors you care about.

### 5. Sensors create a feedback loop that improves the agent's output quality over time
When an agent repeatedly fails the same sensor, the sensor's rule should be promoted into the agent's guide -- the instructions the agent reads before generating code. This closes the loop: the sensor finds a pattern of errors, the guide prevents those errors from being generated in the first place, and the sensor's job shifts from catching errors to verifying that the guide is working. This is the same pattern as the feedback flywheel, applied at the tool level.

## Key info

- Static analysis is particularly effective for coding agents because agents will address every warning, unlike humans who selectively ignore them.
- The sensor approach is part of the broader harness engineering framework of guides and sensors.
- The article series covers progressively more sophisticated sensors, starting with basic linting as the foundation.

## Action recommendations

1. Add static analysis (linting) as a mandatory step in your coding agent's workflow. Configure the agent to run linting on its own output and fix all warnings before presenting code for review.
2. Start with basic linting rules, then progressively add more sophisticated static analysis checks as your team's confidence in the sensor grows.
3. Treat every linting rule as a codified team standard. If a rule is not worth enforcing, remove it. If it is worth enforcing, the agent should never produce code that violates it.
4. Use the agent's systematic approach to static analysis as an opportunity to clean up legacy codebases. An agent can fix hundreds of warnings that humans have been ignoring for years.

## Anti-patterns

- **Adding linting rules without configuring the agent to fix them.** The value comes from the agent's self-correction loop, not from human review of lint output.

- **Having too many linting rules that are not consistently enforced.** If the rule is not enforced, it should not exist.

- **Relying on static analysis alone.** It is the first layer of sensors, not the only one. Progress to type checking, testing, and more sophisticated verification.

- **Configuring sensors that the agent cannot fix autonomously.** A sensor that flags issues requiring human judgment to resolve breaks the self-correction loop. The agent will either ignore the warning or ask the human for help, defeating the purpose. Sensors should be calibrated to catch issues the agent can fix independently.

- **Adding sensors without a corresponding guide update.** When a sensor repeatedly catches the same class of error, the root cause is a gap in the agent's instructions. Fix the guide first, then keep the sensor as a verification step. Without this pairing, the sensor will keep catching the same errors forever, wasting both agent time and human attention.

## Related

- ai-engineer/methodology/feedback-flywheel-886f45.md
- ai-engineer/methodology/fragments-april-29-93711d.md