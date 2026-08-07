---
title: "Agentic Programming Guide, Harness Engineering, Function Length, and Software Brain"
tags: [agentic-programming, harness-engineering, code-quality, ai-ethics, writing]
category: ai-engineer/methodology
created: '2026-08-05'
updated: 2026-08-07
source: https://martinfowler.com/fragments/2026-04-29.html
source_name: Martin Fowler
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles: [ai-engineer, engineer]
benefit: "A curated set of insights on agentic programming best practices, harness engineering, function design for AI, and the cultural critique of 'software brain' thinking."
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - ai-engineer/methodology/fragments-may-5-5adc2f.md
  - ai-engineer/methodology/structured-prompt-driven-development-spdd-9c74e3.md
---

# Agentic Programming Guide, Harness Engineering, Function Length, and Software Brain

> **As a** developer adopting agentic programming, **I want to** understand the evolving best practices for AI-assisted development, **so that** I can shift from being a code reviewer to a harness builder and avoid the pitfalls of "software brain" thinking.

## Summary

- Chris Parsons updated his guide on coding with AI: keep changes small, build guardrails, document ruthlessly, verify everything. The key shift: "verified" used to mean "read by you" -- now it means "checked by tests, type checkers, automated gates."
- The game is no longer "how fast can we build" but "how fast can we tell whether this is right." Investment should shift to better review surfaces, not better prompts.
- Birgitta Boeckeler's harness engineering video discussion with Chris Ford emphasizes that computational sensors (static analysis, tests) convert fuzzy LLM rules into deterministic verification.
- Nilay Patel's "software brain" critique: viewing the world as databases to be controlled alienates people and explains widespread AI backlash.
- The senior engineer's role is shifting from approving diffs to training the AI so diffs are right the first time -- a role that compounds in value.

## Core viewpoints

### 1. Verification speed is the new competitive advantage
Chris Parsons' key insight: a team that can generate five approaches and verify all five in an afternoon will outpace a team that generates one and waits a week for feedback. The bottleneck is verification, not generation. Investment should go to better review surfaces, automated verification, and making feedback instant.

### 2. The senior engineer's role is now harness builder, not diff approver
The career path for senior engineers: train the AI so diffs are right the first time, make yourself the person who shapes the harness, and make that work the visible thing you are measured on. This role compounds in a way that reviewing never will. The skill is not writing better prompts -- it is building better verification systems.

### 3. Computational sensors are more valuable than guide documents
Once a rule is objective, converting it to a formal, unambiguous, deterministic format (static analysis, tests) provides more assurance than keeping it in natural language guides. LLMs are great for exploratory and fuzzy rules, but deterministic sensors are better for known constraints. Agents are especially good at addressing every warning -- they do not slack off like humans.

### 4. "Software brain" is the fundamental reason people hate AI
Patel's concept: software people see the world as databases to be controlled. AI extends this by demanding that everything be made legible to machines. People do not want to be databases, and they resent being surveilled and categorized. This is why AI adoption faces cultural resistance beyond the technical challenges.

### 5. Precise, consistent definitions are the foundation of effective AI communication
The hardest problem with internal data is precise, consistent definitions -- a problem that predates AI by decades. This is even more critical when communicating with LLMs. Conceptual modeling will be a key skill for agentic programming, and the definitions need to grow in conversation and be tended over time.

## Key info

- The fundamentals of agentic programming: keep changes small, build guardrails, document ruthlessly, verify everything.
- Static analysis is more useful with agents because agents actually address every warning, unlike humans.
- Function design matters for AI: good naming and structure help LLMs understand code as much as they help humans.
- "Making yourself legible to AI" is the new Silicon Valley obsession -- dumping all email, notes, and documents into AI-readable formats.
- Writing is for thinking: Fowler warns against using AI to write for you, as writing is how you refine your own understanding.

## Action recommendations

1. Shift investment from prompt engineering to verification engineering: build better review surfaces, automated gates, and fast feedback loops.
2. Convert known, objective rules into computational sensors (static analysis, tests) rather than keeping them in natural language guides.
3. Design functions around the separation of intention and implementation. If you have to look at code to figure out what it is doing, extract it into a named function.
4. As a senior engineer, make harness building your primary visible output, not diff approval. This is the role that compounds.
5. When writing, do not use AI to write for you. Writing is a thinking tool; outsourcing it to AI cripples your own understanding.

## Anti-patterns

- **Focusing on prompt quality while neglecting verification speed.** The bottleneck is verification, not generation.

- **Treating "verified" as meaning "I read it." With agent throughput, ....** Treating "verified" as meaning "I read it." With agent throughput, verification must be automated.

- **Accepting LLM-suggested prose improvements without scrutiny.** The LLM voice is increasingly detectable and discredits writing.

- **Assuming internal data is clean enough for AI without precise, cons....** Assuming internal data is clean enough for AI without precise, consistent definitions. This is the oldest problem in computing, and AI makes it more visible, not less.

- **Using AI to write for you as a substitute for thinking through ideas.** Writing is a thinking tool. Fowler explicitly warns against outsourcing writing to AI, as the act of writing refines your own understanding. Using AI to generate prose shortcuts the thinking process, not just the typing.

## Related

- ai-engineer/methodology/fragments-may-5-5adc2f.md
- ai-engineer/methodology/structured-prompt-driven-development-spdd-9c74e3.md
- ai-engineer/methodology/maintainability-sensors-for-coding-agents-147416.md