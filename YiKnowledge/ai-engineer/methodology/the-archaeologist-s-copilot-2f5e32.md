---
title: "The Archaeologist's Copilot: AI-Assisted Legacy Modernization"
tags: [legacy-modernization, java, ai-assisted-refactoring, docker, evidence-based-development]
category: ai-engineer/methodology
created: '2026-08-05'
updated: 2026-08-07
source: https://martinfowler.com/articles/archaeologist-copilot.html
source_name: Martin Fowler
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles: [ai-engineer, engineer]
benefit: "Learn how to use AI for legacy modernization by grounding the process in evidence, stable environments, and gradual refactoring protected by tests."
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - ai-engineer/methodology/fragments-may-14-c4c6eb.md
---

# The Archaeologist's Copilot: AI-Assisted Legacy Modernization

> **As a** developer modernizing legacy systems, **I want to** use AI effectively to port and refactor old codebases, **so that** I can run decades-old software on modern hardware without getting lost in plausible-but-wrong AI suggestions.

## Summary

- Nik Malykhin needed to run a Java 1.5 codebase on modern hardware -- a legacy modernization challenge where the target was Java 8, not a modern framework.
- Early LLM usage gave plausible answers that did not hold up in the actual codebase, demonstrating the danger of AI-generated advice without evidence grounding.
- The breakthrough came from grounding the process in evidence: AI supported analysis, validation happened in a stable Docker environment, and refactoring was gradual and protected by tests.
- The core lesson: AI was most useful when constrained by evidence, clear roles, and a step-by-step modernization strategy.

## Core viewpoints

### 1. AI without evidence grounding produces plausible but wrong modernization advice
When Malykhin first asked LLMs about porting Java 1.5 to Java 8, the answers were plausible, well-structured, and wrong. They did not account for the specific quirks of the actual codebase. This is the fundamental risk of AI-assisted legacy work: the AI has general knowledge but not specific knowledge of your codebase's idiosyncrasies.

### 2. A stable, reproducible environment is the foundation
Using Docker to create a stable build and test environment was the critical enabler. It allowed deterministic validation of every change, making it possible to iterate rapidly without fear of breaking the build. Without this, the AI's suggestions would have been untestable.

### 3. Gradual refactoring protected by tests beats big-bang porting
The successful approach was not "port everything at once" but gradual, test-protected refactoring. Each small change was validated before proceeding. This is the same pattern that works for human-led refactoring, and it works even better when AI is generating the changes because the AI can produce many small, testable changes quickly.

### 4. The AI's role is analysis, not authority
When Malykhin asked the AI "what is the best way to port this codebase?", the answers were authoritative-sounding and wrong. When he shifted to asking "what does this specific file do, and why might it fail on Java 8?", the AI became a useful analysis tool. The lesson: treat the AI as a research assistant that can read and summarize code, not as an architect that can make decisions. The human makes every architectural decision; the AI provides the evidence.

### 5. Docker is the reproducibility layer that makes AI-assisted refactoring safe
The Docker environment is not just a convenience -- it is the control mechanism that prevents the AI's changes from corrupting the development environment. Every AI-generated change is tested in a clean container, and if the change breaks the build, the container is discarded. This isolation means the developer can experiment aggressively with AI-generated changes without fear of contaminating their working environment.

## Key info

- The codebase was Java 1.5 targeting Java 8 -- a modest version jump but with significant API and behavioral changes.
- Docker provided the reproducible build environment that made validation deterministic.
- The AI's role was analysis support and change generation, but human judgment and evidence-based validation drove every decision.

## Action recommendations

1. Before using AI on a legacy codebase, create a reproducible build and test environment (Docker is ideal) so every AI-generated change can be validated.
2. Ground AI suggestions in codebase evidence: ask the AI to reference specific files and line numbers, and verify those references before acting on the suggestion.
3. Use gradual, test-protected refactoring -- never let the AI make a large, untestable change. Each change should be small enough to validate independently.
4. Assign clear roles: AI does analysis and change generation, Docker handles validation, and the human handles strategy and evidence verification.

## Anti-patterns

- **Trusting AI's general knowledge about a language version migration ....** Trusting AI's general knowledge about a language version migration without verifying against the specific codebase. The AI knows Java, not your codebase.

- **Attempting a big-bang port.** The AI can generate large changes quickly, but validating them is impossible without gradual, test-protected steps.

- **Using AI without a reproducible environment.** Without Docker (or equivalent), every AI suggestion is a gamble.

- **Asking the AI for migration strategy instead of code analysis.** The AI is useful for understanding what specific code does; it is dangerous for making architectural decisions about a codebase it has never seen run. Keep the AI in the analysis role and reserve strategy decisions for the human who understands the system's context.

- **Letting the AI generate large changes without test coverage first.** The AI can produce hundreds of lines of plausible-looking code in seconds, but validating that code without tests is impossible. The rule: write the tests first, then let the AI generate the change that makes them pass.

## Related

- ai-engineer/methodology/fragments-may-14-c4c6eb.md
- ai-engineer/methodology/the-economic-benefit-of-refactoring-fbb741.md