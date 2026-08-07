---
title: "The Orchard Retreat: LLM Porting, Interrogatory LLMs, Lift-and-Shift, and AI Chaos Monkey"
tags: [legacy-modernization, interrogatory-llm, porting, junior-developers, chaos-engineering]
category: ai-engineer/methodology
created: '2026-08-05'
updated: 2026-08-07
source: https://martinfowler.com/fragments/2026-05-14.html
source_name: Martin Fowler
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles: [ai-engineer, engineer]
benefit: "Understand how LLMs change legacy modernization strategy, including behavioral cloning, interrogatory LLMs for spec review, and the new case for lift-and-shift."
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - ai-engineer/methodology/the-archaeologist-s-copilot-2f5e32.md
  - ai-engineer/methodology/bliki-interrogatory-llm-614a7d.md
---

# The Orchard Retreat: LLM Porting, Interrogatory LLMs, Lift-and-Shift, and AI Chaos Monkey

> **As an** engineer working on legacy modernization, **I want to** understand how LLMs change the legacy modernization playbook, **so that** I can choose the right modernization strategy in the AI era.

## Summary

- A group of software practitioners convened at the Orchard Retreat to discuss the future of software development with agentic programming.
- Key findings: a behavioral clone of the GNU Cobol compiler was built in Rust in 3 days (70K lines), demonstrating LLMs' ability to port code to new platforms.
- Interrogatory LLMs can verify large specification documents by interviewing human experts, confirming correctness through conversation.
- The traditional wisdom against "lift and shift" legacy migration is being reconsidered: with LLMs, porting to a new platform may now be the right first step, enabling cheaper evolution afterward.
- The concept of an "AI Chaos Monkey" was proposed: deliberately introduce hallucinations to test whether sensors catch them.

## Core viewpoints

### 1. Lift-and-shift is no longer an anti-pattern
The traditional criticism of lift-and-shift (porting legacy systems while retaining feature parity) was that it missed the opportunity to rethink bloated features and processes. But with LLMs dramatically reducing the cost of porting, the calculus has changed. Getting to a modern platform quickly, even with feature parity, enables cheaper subsequent evolution. The new advice: lift-and-shift as the first step, then modernize.

### 2. Behavioral cloning is a viable porting strategy
The GNU Cobol-to-Rust example demonstrates that LLMs can clone the behavior of an existing system in a new language. The key enabler: good regression tests. If you have a comprehensive test suite for the original system, you can use it to validate the clone. If you do not have tests, you can potentially build a test suite from the existing implementation's behavior.

### 3. Change-control board guidelines are organizational scar tissue
One attendee's practice: the first thing to do when consulting is to read the change-control board guidelines. These are the "scar tissue of what has gone wrong in the past" -- a concentrated source of organizational history and pain points. Understanding them reveals why systems are the way they are.

### 4. Pair programming is the apprenticeship mechanism for the AI era
When senior developers work with AI agents, their value comes from judgment. Pair programming remains the best mechanism for transferring that judgment to junior developers. The senior agentic programmer passes on their judgment for software design and how to use the genie, while the junior often brings fresh perspectives and tricks.

### 5. AI may reverse the historical relationship between computers and chaos
Historically, we use computer systems to bring order to chaotic human processes. The question raised: is AI reversing that, bringing chaos to ordered systems?

## Key info

- GNU Cobol behavioral clone: 70K lines of Rust, built in 3 days.
- Interrogatory LLM for spec review: the LLM interviews a human expert to verify specification correctness.
- Financial industry challenge: products in multiple jurisdictions, each with different regulations. AI may enable building individual simpler systems per jurisdiction with LLM-ensured consistency.
- The "Chaos Monkey for AI" concept: deliberately introduce hallucinations to test sensor detection.
- The SPDD Q&A addressed whether the prompt/spec review can be automated: yes, but human review is preserved for learning.

## Action recommendations

1. Reconsider lift-and-shift for legacy modernization. With LLMs, the cost of porting to a modern platform may be low enough that it should be the first step, followed by incremental modernization.
2. Use behavioral cloning for porting when you have good regression tests. The tests validate the clone; the LLM generates the code.
3. Use interrogatory LLMs to verify large specification documents. The conversational format is more engaging than asking experts to read and critique documents.
4. Read the change-control board guidelines when joining a new organization. They are a concentrated source of organizational history.
5. Use pair programming as the primary mechanism for transferring agentic programming skills to junior developers.

## Anti-patterns

- **Dismissing lift-and-shift categorically.** The economics have changed with LLMs. It may now be the right first step.

- **Assuming that because LLMs can port code, they can also design the ....** Assuming that because LLMs can port code, they can also design the target architecture. The human still needs to choose the right patterns and structure.

- **Replacing pair programming with solo agentic work.** The skills transfer that happens in pairing is more important than ever.

- **Using behavioral cloning without a regression test suite.** The GNU Cobol-to-Rust example worked because the team had comprehensive tests to validate the clone. Without tests, behavioral cloning is just code generation with no verification. The test suite is the enabling constraint, not the LLM.

- **Treating AI as a replacement for domain expertise in legacy modernization.** LLMs can port code, but understanding why the legacy system behaves the way it does requires domain knowledge. The CCB guidelines as "scar tissue" insight only works if a human can interpret the organizational history encoded in them.

## Related

- ai-engineer/methodology/the-archaeologist-s-copilot-2f5e32.md
- ai-engineer/methodology/bliki-interrogatory-llm-614a7d.md
- ai-engineer/methodology/structured-prompt-driven-development-spdd-9c74e3.md