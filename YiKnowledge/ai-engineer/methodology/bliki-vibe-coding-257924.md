---
title: "Vibe Coding: Definition, Risks, and When to Use It"
tags: [vibe-coding, agentic-programming, security, code-quality, prototyping]
category: ai-engineer/methodology
created: '2026-08-05'
updated: 2026-08-07
source: https://martinfowler.com/bliki/VibeCoding.html
source_name: Martin Fowler
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles: [ai-engineer, engineer]
benefit: "Understand the definition, risks, and appropriate use cases for vibe coding, and how it differs from agentic programming."
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - ai-engineer/methodology/the-vibesec-reckoning-5effcd.md
  - ai-engineer/methodology/fragments-july-21-db3e9f.md
---

# Vibe Coding: Definition, Risks, and When to Use It

> **As a** developer or technical leader, **I want to** understand what vibe coding is, its risks, and appropriate use cases, **so that** I can distinguish it from agentic programming and set appropriate guardrails for my team.

## Summary

- Vibe coding, coined by Andrej Karpathy in February 2025, is building software by prompting an LLM without looking at the generated code -- "forget that the code even exists."
- The key distinction from agentic programming: agentic programmers care about the code, review it, and pay attention to internal structure. Vibe coders explicitly do not.
- The term has suffered semantic diffusion -- many people use "vibe coding" to mean agentic programming, but the distinction matters because the risks and appropriate use cases are different.
- Vibe coding is best for disposable software used by the author or a close group, not for widely-used or security-sensitive applications.

## Core viewpoints

### 1. "Forget that the code even exists" is the defining characteristic
The critical phrase in Karpathy's original post is "forget that the code even exists." This is not about using AI to write code -- it is about explicitly not caring about the code. This is what makes vibe coding both useful (no programming skills needed, rapid prototyping) and dangerous (no quality control, no security review, no maintainability).

### 2. Vibe coding and agentic programming are different activities with different risk profiles
Martin Fowler argues for keeping the concepts separate despite semantic diffusion. Agentic programmers use LLMs to write all their code but still review it, care about structure, and apply engineering discipline. Vibe coders do not look at the code. The risks of vibe coding (security vulnerabilities, unmaintainable code, hidden errors) are much higher, and the appropriate use cases are much narrower.

### 3. The risks are real and compounded by LLM characteristics
Three key risks: security (LLMs provide a large attack surface, and vibe-coded apps can expose credentials), maintainability (vibe coding produces low-quality code that even LLMs struggle to modify later), and correctness (LLMs hallucinate and create software that behaves incorrectly in non-obvious ways). The non-determinism of LLMs means that even enhancements to existing vibe-coded software can introduce errors in unrelated parts.

### 4. The appropriate use case is narrow and specific
Vibe coding is best for: disposable software, prototypes, personal tools, and projects used by the author or a close group who understand the risks. It is not appropriate for: widely-used software, software with access to sensitive data, software with security implications, or software that needs to be maintained over time.

### 5. Vibe coding and agentic programming share a tool but diverge on discipline
Both use LLMs to generate code, but the similarity ends there. Agentic programming is a discipline that adds new practices (harness engineering, computational sensors, prompt versioning) to the existing engineering discipline. Vibe coding is the absence of discipline -- it is pure outcome orientation with no concern for process. The distinction is not about the tool but about the human's relationship to the code that the tool produces.

## Key info

- Term coined by Andrej Karpathy in February 2025: "There's a new kind of coding I call 'vibe coding,' where you fully give in to the vibes, embrace exponentials, and forget that the code even exists."
- The "Lethal Trifecta" of AI security is a risk even non-programmers need to be aware of.
- Vibe coding does not require programming skills, making it accessible to non-programmers.
- The distinction from agentic programming is important because the risks and appropriate use cases differ significantly.

## Action recommendations

1. Use "vibe coding" only for disposable software, prototypes, and personal tools. Do not use it for anything that will be widely used or has security implications.
2. Distinguish between vibe coding and agentic programming in your team's vocabulary. The distinction matters for risk assessment.
3. If you are vibe coding, be aware of the Lethal Trifecta: the combination of AI-generated code, internet access, and sensitive data access is especially dangerous.
4. For non-disposable software, use agentic programming with review, testing, and harness engineering -- not vibe coding.

## Anti-patterns

- **Using vibe coding for production software, widely-used tools, or sy....** Using vibe coding for production software, widely-used tools, or systems with access to sensitive data.

- **Using "vibe coding" as a synonym for agentic programming.** The distinction matters because the practices and risks are different.

- **Assuming that LLMs will be able to maintain vibe-coded spaghetti code.** Evidence suggests well-structured code helps LLMs too.

- **Vibe coding without understanding the Lethal Trifecta.** Even non-programmers need to understand the security risks.

- **Using vibe coding for anything that touches real user data.** The Lethal Trifecta is most dangerous when the software has access to real data, not test data. A vibe-coded prototype connected to a production database is a data breach waiting to happen, even if the developer intended it as a temporary tool.

## Related

- ai-engineer/methodology/the-vibesec-reckoning-5effcd.md
- ai-engineer/methodology/fragments-july-21-db3e9f.md
- ai-engineer/methodology/structured-prompt-driven-development-spdd-9c74e3.md