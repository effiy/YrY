---
title: "Interrogatory LLM: Using AI to Interview Humans for Context Gathering"
tags: [llm-patterns, context-engineering, prompt-design, knowledge-extraction, agentic-workflows]
category: ai-engineer/methodology
created: '2026-08-05'
updated: 2026-08-07
source: https://martinfowler.com/bliki/InterrogatoryLLM.html
source_name: Martin Fowler
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles: [ai-engineer, engineer]
benefit: "Use LLMs to interview human experts and build context documents, replacing the bottleneck of expert-written specifications with structured dialogue."
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - ai-engineer/methodology/structured-prompt-driven-development-spdd-9c74e3.md
---

# Interrogatory LLM: Using AI to Interview Humans for Context Gathering

> **As a** developer or domain expert, **I want to** use an LLM to interview me and extract the context needed for complex tasks, **so that** I can produce high-quality specifications without the cognitive burden of writing them from scratch.

## Summary

- An "interrogatory LLM" is an LLM prompted to interview a human expert, asking questions to build up a comprehensive context document for a downstream task.
- The technique, popularized by Harper Reed, insists on one question at a time to maintain focus and prevent overwhelming the human.
- A second use case: give the LLM an existing document and have it interview a human expert to verify the document's accuracy -- an alternative to expert document review.
- The technique is especially valuable for people who find writing difficult but can articulate their knowledge conversationally.

## Core viewpoints

### 1. One question at a time is the critical constraint
Harper Reed's key insight is that the LLM must ask only one question at a time. This prevents cognitive overload, keeps the conversation focused, and forces the LLM to build context incrementally rather than attempting to gather everything at once. In practice, the LLM needs frequent reminders to maintain this constraint.

### 2. Interrogatory LLMs can serve as document reviewers, not just document creators
Instead of asking a human expert to read and critique a specification document (which people find tedious), an LLM can interview the expert about the document's contents. The conversation format is more engaging and often surfaces more issues than passive reading. This is a powerful pattern for specification validation.

### 3. The technique bridges the gap between "natural writers" and "natural talkers"
Martin Fowler observes that he is a "natural writer" -- he thinks through writing. But many people find writing extremely difficult. An interrogatory LLM lets them express their expertise through conversation, with the LLM handling the structuring and prose. The result may have "AI-writing tang" but it is better than no documentation at all or rushed, incomplete writing.

### 4. The quality of the interview depends on the quality of the interviewer prompt
The LLM is not naturally a good interviewer -- it must be explicitly prompted to ask follow-up questions, probe for contradictions, and push back on vague answers. A poorly designed interviewer prompt will accept the first answer and move on, missing the tacit knowledge that only emerges from sustained questioning. The prompt engineering effort should focus on teaching the LLM to be a good journalist, not just a stenographer.

### 5. Interrogatory LLMs invert the traditional knowledge transfer model
Historically, knowledge transfer has been a push model: the expert writes documentation, and consumers read it. The interrogatory LLM pattern creates a pull model: the LLM pulls knowledge from the expert through targeted questions, and the resulting document is a byproduct of the conversation, not the primary goal. This inversion is particularly powerful for domains where experts do not know what they know until they are asked.

## Key info

- The pattern can be used in series: one interrogatory LLM builds a document, another interrogatory LLM reviews it with a different expert.
- The technique extends beyond software -- it can help extract domain knowledge from any expert who struggles with writing.
- The approach is fundamentally different from simply prompting an LLM to generate a specification; it creates a structured dialogue that captures tacit knowledge.

## Action recommendations

1. When building a specification for an LLM to execute, use an interrogatory LLM to interview the domain expert rather than asking the expert to write the specification.
2. Enforce the "one question at a time" rule in the system prompt, and remind the LLM when it violates it.
3. Use the interview-then-review pattern: have one LLM session build the specification and another session interview a different expert to validate it.
4. For code review or specification validation, offer the interrogatory LLM approach as an alternative to asking experts to read documents -- the conversational format often yields better engagement.

## Anti-patterns

- **Allowing the LLM to ask multiple questions at once.** This overwhelms the human and produces shallow answers.

- **Using the interrogatory LLM to replace the human's judgment.** The LLM is gathering context, not making decisions -- the human remains the authority.

- **Assuming the LLM's synthesized document is complete without human v....** Assuming the LLM's synthesized document is complete without human verification. The interview extracts what the human knows, but the human may have blind spots.

- **Treating the interrogatory LLM as a one-shot tool.** The most valuable context often emerges in the second or third round of questioning, after the expert has had time to reflect on what the first round uncovered. A single interview pass captures surface knowledge but misses the deeper insights that surface only with iteration.

- **Using the interrogatory LLM without a clear downstream task specification.** The interview should be shaped by what the context will be used for. Without a concrete task framing the questions, the LLM will ask generic questions that produce generic context -- wasting the expert's time and the opportunity to capture task-specific nuance.

## Related

- ai-engineer/methodology/structured-prompt-driven-development-spdd-9c74e3.md
- ai-engineer/methodology/fragments-may-14-c4c6eb.md