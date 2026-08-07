---
title: "Structured-Prompt-Driven Development (SPDD): Prompts as First-Class Artifacts"
tags: [prompt-engineering, development-workflow, agentic-programming, version-control, team-practices]
category: ai-engineer/methodology
created: '2026-08-05'
updated: 2026-08-07
source: https://martinfowler.com/articles/structured-prompt-driven/
source_name: Martin Fowler
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles: [ai-engineer, engineer]
benefit: "Adopt a team-level workflow that treats prompts as version-controlled artifacts, aligning AI-generated code with business needs through structured review."
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - ai-engineer/methodology/bliki-interrogatory-llm-614a7d.md
  - ai-engineer/methodology/feedback-flywheel-886f45.md
---

# Structured-Prompt-Driven Development (SPDD): Prompts as First-Class Artifacts

> **As a** development team lead, **I want to** adopt a structured workflow where prompts are version-controlled alongside code, **so that** AI-generated code stays aligned with business needs and the team builds collective prompt-engineering skill.

## Summary

- SPDD is a team-level method developed by Thoughtworks' internal IT organization for using LLM programming assistants at scale.
- Prompts are treated as first-class artifacts, kept with the code in version control, and used to align development with business needs.
- Three key developer skills for SPDD effectiveness: alignment (connecting prompts to business goals), abstraction-first thinking (defining what before how), and iterative review (treating prompt output as a draft to refine).
- The workflow includes a structured canvas (REASONS) that captures the rationale, edge cases, assumptions, scope, and non-goals before code generation begins.

## Core viewpoints

### 1. Prompts are the new unit of specification
In SPDD, the prompt is not a throwaway input -- it is a durable artifact that captures design intent. Like code, it is versioned, reviewed, and evolved. This shifts the developer's role from writing implementation to writing precise specifications that the LLM executes. The prompt becomes the bridge between business requirements and generated code.

### 2. Human review of AI output is where learning happens
The SPDD authors explicitly keep human review in the loop even when automated review is possible. The reason: reviewing AI-generated code is where humans learn from the AI's choices -- patterns, trade-offs, and options they had not considered. Removing humans from review speeds things up but blocks the long-term skill growth that SPDD is designed to protect.

### 3. Abstraction-first is the counter to implementation-first thinking
The traditional development flow starts with implementation details. SPDD demands abstraction-first: define what the system should do, the boundaries, the edge cases, and the non-goals before any code is generated. This is the skill that most developers need to deliberately cultivate.

### 4. The REASONS canvas is a forcing function, not a template
The value of the REASONS canvas is not in the specific fields (Rationale, Edge cases, Assumptions, Scope, Non-goals, Success criteria) but in the fact that it forces the developer to think about each of these dimensions before generating code. A team that fills in the canvas mechanically, treating it as a compliance exercise, will get the same results as a team that does not use it. The canvas works only when the developer genuinely engages with each question.

### 5. SPDD changes the social dynamics of code review
When the prompt is reviewed alongside the code, the review conversation shifts from "why did you write it this way?" to "why did you specify it this way?" This is a higher-leverage conversation because it addresses intent before implementation. Poor code generated from a good prompt is a signal that the prompt needs refinement; poor code generated from a poor prompt is a signal that the developer needs to think more carefully about what they are asking for.

## Key info

- The REASONS canvas captures: Rationale, Edge cases, Assumptions, Scope, Non-goals, and Success criteria.
- The workflow integrates with existing version control and CI/CD pipelines.
- A FAQ addresses common questions including whether the review itself can be automated (answer: partially, but human review is preserved for learning).
- The method was developed for team use, not individual developer use, and the social practices around prompt review are as important as the technical practices.

## Action recommendations

1. Start treating prompts as code: version them alongside your source, review them in pull requests, and evolve them over time.
2. Adopt the REASONS canvas (or an equivalent structured template) to force abstraction-first thinking before any code generation.
3. Keep human review of AI-generated code as a deliberate practice for skill development, even as you add automated verification.
4. Use SPDD at the team level, not just individually -- the shared prompt artifacts become a collective knowledge base of design decisions.

## Anti-patterns

- **Automating the review step entirely.** While faster, this removes the learning opportunity that SPDD is designed to create.

- **Treating prompts as disposable.** The value compounds when prompts are maintained and evolved alongside the codebase.

- **Using SPDD for trivial changes where the overhead of structured pro....** Using SPDD for trivial changes where the overhead of structured prompting exceeds the benefit. Reserve it for feature-level work where design intent matters.

- **Treating the REASONS canvas as a fill-in-the-blanks exercise.** The canvas is a thinking tool, not a compliance checklist. Filling it in without genuine engagement with each question produces prompts that look thorough but are substantively shallow -- and the generated code will reflect that shallowness.

- **Reviewing code without reviewing the prompt that generated it.** If the prompt is wrong, the code will be wrong, and no amount of code review will fix the root cause. The prompt review must happen before the code review, and a rejected prompt should block code generation entirely.

## Related

- ai-engineer/methodology/bliki-interrogatory-llm-614a7d.md
- ai-engineer/methodology/feedback-flywheel-886f45.md
- ai-engineer/methodology/fragments-may-5-5adc2f.md