---
title: "DSLs Enable Reliable Use of LLMs: Tickloom as a Case Study"
tags: [dsl, domain-modeling, llm-reliability, conceptual-modeling, code-generation]
category: ai-engineer/methodology
created: '2026-08-05'
updated: 2026-08-07
source: https://martinfowler.com/articles/llm-and-dsls.html
source_name: Martin Fowler
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles: [ai-engineer, engineer]
benefit: "Use Domain-Specific Languages as a harness for LLMs to generate reliable, bounded code and serve as the single source of truth for system behavior."
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - ai-engineer/methodology/structured-prompt-driven-development-spdd-9c74e3.md
  - ai-engineer/methodology/fragments-july-21-db3e9f.md
---

# DSLs Enable Reliable Use of LLMs: Tickloom as a Case Study

> **As a** software architect, **I want to** use Domain-Specific Languages to constrain LLM output into reliable, bounded code, **so that** AI-generated code stays within well-defined boundaries and the DSL serves as the system's source of truth.

## Summary

- Unmesh Joshi demonstrates how DSLs provide a strong harness for LLMs, using Tickloom -- a domain model and DSL for illustrating distributed system behavior -- as a case study.
- LLMs can be used as partners to iteratively build a DSL and as natural language interfaces to use it, creating a bidirectional relationship between the model and the language.
- A DSL acts as the key source of truth for software systems in the world of LLMs, providing clear boundaries that guide generation from the start.
- DSLs are particularly effective with LLMs because they are token-efficient, enforce hard security boundaries, and translate high-level intent into deterministic code.

## Core viewpoints

### 1. Abstractions and DSLs are the harness, not just the output
LLMs generate code incredibly fast, but without clear boundaries, they generate whatever is plausible. A DSL defines the boundaries upfront, constraining the LLM to operate within a well-defined semantic space. The DSL is not just another artifact the LLM produces -- it is the harness that guides what the LLM can produce.

### 2. LLMs make DSLs more practical by reducing the parser-building barrier
One of the biggest historical barriers to DSL adoption, particularly external DSLs, has been building parsers and tooling. LLMs dramatically reduce this barrier -- they can generate parsers and are very good at learning and working with DSLs from minimal documentation. A small bit of documentation is generally enough to get an LLM producing valid DSL expressions.

### 3. The semantic model matters more than the DSL syntax
The DSL is a projection of the underlying semantic model. LLMs may help explore new ways to project that model, possibly beyond traditional textual DSLs. The real value is in the conceptual model that the DSL encodes, not in the syntax itself.

### 4. DSLs create a natural audit trail that free-form code generation cannot
When a system's behavior is derived from DSL expressions, every generated artifact can be traced back to a specific, human-readable DSL statement. This creates an audit trail that is impossible with free-form code generation, where the LLM's reasoning is opaque and unreproducible. In regulated or safety-critical domains, the DSL becomes the explainability layer -- you can point to the exact DSL expression that produced a given behavior and verify it independently.

### 5. The DSL authoring process itself benefits from LLM assistance
The bidirectional relationship between LLMs and DSLs is underappreciated: LLMs can help design the DSL itself by proposing abstractions, identifying inconsistencies, and generating test cases that stress the DSL's expressiveness. The DSL author can use the LLM as a design partner, iterating on the language definition until it captures the domain cleanly. This collapses the traditional DSL design cycle from months to days.

## Key info

- LLMs can learn and use DSLs effectively from minimal documentation and reasonable error messages.
- DSLs are token-efficient compared to natural language specifications, reducing both cost and ambiguity.
- The pattern works for both internal DSLs (embedded in a host language) and external DSLs (with custom syntax).
- Spencer Nelson reported similar findings: DSLs hit sweet spots for LLMs by being token-efficient, security-bounded, and translating high-level intent into deterministic code.

## Action recommendations

1. When building LLM-powered systems that generate code, define a DSL first to constrain the output space. The DSL is your harness.
2. Use the LLM iteratively to help design and refine the DSL itself -- the LLM can be both the DSL builder and the DSL consumer.
3. Treat the DSL as the single source of truth for system behavior. Generated code should be derived from DSL expressions, not the other way around.
4. Focus on the semantic model underlying the DSL. The syntax is secondary; the concepts and their relationships are what matter.

## Anti-patterns

- **Letting the LLM generate arbitrary code without a DSL boundary.** The harness is what makes the output reliable.

- **Building a DSL without a clear semantic model.** The DSL is a projection of the model; without the model, the DSL is just syntax.

- **Treating DSLs as a human-only tool.** LLMs are language models -- they are excellent at learning and using DSLs, often better than humans at following syntax rules precisely.

- **Designing the DSL for human readability at the expense of LLM token efficiency.** In the LLM era, the DSL's primary consumer may be the AI, not the human. A DSL optimized for human reading may waste tokens on verbose syntax that the LLM processes but does not need. The sweet spot is a syntax that is both human-readable and token-efficient.

- **Using the DSL as a crutch to avoid understanding the domain.** The DSL encodes the domain model, but someone must understand the domain well enough to define the model correctly. An LLM-generated DSL without domain expert validation will encode the LLM's plausible-but-wrong understanding of the domain, producing reliably wrong code at scale.

## Related

- ai-engineer/methodology/structured-prompt-driven-development-spdd-9c74e3.md
- ai-engineer/methodology/fragments-july-21-db3e9f.md
- ai-engineer/methodology/fragments-april-29-93711d.md