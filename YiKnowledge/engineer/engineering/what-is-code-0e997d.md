---
title: What is Code
tags: [code, programming-languages, conceptual-model, LLM, agents, software-engineering, domain-modeling]
category: engineer/engineering
created: '2026-08-05'
updated: 2026-08-07
source: https://martinfowler.com/articles/what-is-code.html
source_name: Martin Fowler
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles: [engineer, tech-lead, ai-engineer]
benefit: "Reframe code as a dual-purpose artifact (machine instructions + conceptual model) to understand what we lose if LLMs entirely replace human-written source code."
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - ../../ai-engineer/methodology/bliki-vibe-coding-257924.md
  - ../../ai-engineer/methodology/structured-prompt-driven-development-spdd-9c74e3.md
  - ./the-orchestrator-s-tax-c5570a.md
---

# What is Code

> **As a** software engineer working with LLMs and coding agents, **I want to** understand what code truly is beyond its surface definition, **so that** I can evaluate what we gain and lose as LLMs take over more code generation.

## Summary

- Unmesh Joshi argues that code serves two distinct but intertwined purposes: instructions to a machine, and a conceptual model of the problem domain.
- The instruction purpose is what most people think of: code tells the computer what to do. The conceptual model purpose is subtler: code is a formal, shareable representation of how we understand a problem.
- Programming languages are thinking tools. They provide vocabulary to talk to the machine and structure to reason about problems. The language shapes how we think about the domain.
- As LLMs generate more code, the question becomes: will there still be source code in the future? If code is only instructions, maybe not. If code is a conceptual model, then losing it means losing our shared understanding of systems.
- The essay connects to the broader question of what happens when humans delegate writing code to agents -- not just the mechanics, but the epistemology of software.

## Core viewpoints

### 1. Code is not just instructions -- it is a model of the world

When a developer writes code, they are encoding their understanding of the problem domain. The code is a formal, executable specification of that understanding. This is why reading code is harder than writing it: you are reconstructing someone else's mental model.

### 2. Programming languages are thinking tools, not just communication tools

A programming language provides both vocabulary and structure. The choice of language shapes how you decompose problems. Functional languages encourage thinking in terms of data transformations; object-oriented languages encourage thinking in terms of interacting entities. The language is part of the thought process.

### 3. If LLMs replace source code, we lose the conceptual model

If code becomes purely generated artifacts that no human reads or maintains, we lose the shared understanding embedded in the source. The conceptual model -- the "why" behind the system -- may become inaccessible. This is the risk of treating code as merely instructions.

### 4. The readability of generated code is a maintenance requirement, not a preference

When coding agents generate code that is functionally correct but unreadable, the conceptual model is lost. Future maintainers cannot reconstruct the original understanding of the problem because the code does not encode it. Generated code must be held to the same readability standards as human-written code, not because of aesthetics but because readability is the vehicle for the conceptual model.

### 5. The choice of programming language is a design decision, not an implementation detail

A programming language provides the vocabulary and structure for reasoning about a problem. Choosing a functional language versus an object-oriented language changes how the team thinks about the domain. This is not a matter of syntax preference -- it is a decision about which conceptual frameworks will be available to the team. The language shapes the thought, not just the expression.

## Key info

- Two purposes of code: instructions to a machine, conceptual model of the problem domain.
- Programming languages are thinking tools: they shape problem decomposition and reasoning.
- The essay connects to the question of whether source code will exist in an LLM-dominated future.

## Action recommendations

1. When using coding agents, require that generated code is readable and well-structured -- not just functionally correct. The code must serve as a conceptual model for future maintainers.
2. Invest in building a shared vocabulary for your domain. This vocabulary should be reflected in code, not just in documentation.
3. Treat code review as a model review, not just a bug hunt. Ask: does this code accurately represent our understanding of the problem?

## Anti-patterns

- **Do not treat generated code as disposable. If no one reads or maintains it, you lose the conceptual model.**

- **Do not separate "code" from "design." The code IS the design. Documentation that diverges from code is worse than no documentation.**

- **Using LLM-generated code as a specification for the system.** Code is a formal specification of behavior, but LLM-generated code was not produced by reasoning about the problem domain. It was produced by statistical pattern matching. Treating generated code as the specification means treating pattern-matched output as the canonical description of what the system should do. This is a category error -- the specification must come from human understanding of the domain.

- **Separating documentation from code as if they are independent artifacts.** Documentation that describes the code is redundant with the code. Documentation that describes the conceptual model -- the "why" behind the code -- is essential but must be maintained alongside the code. When documentation and code diverge, developers trust the code, and the conceptual model is lost. The code and the conceptual model must be kept in the same artifact.

- **Assuming that more code generation means less need for code literacy.** The argument that "LLMs will write the code, so humans don't need to read it" is dangerous. Code review, debugging, and architectural decisions all require reading and understanding code. If LLMs generate code that humans cannot or do not read, the system becomes a black box. Code literacy remains essential even -- and especially -- when code is generated.

## Related

- ../../ai-engineer/methodology/bliki-vibe-coding-257924.md
- ../../ai-engineer/methodology/structured-prompt-driven-development-spdd-9c74e3.md
- ./the-orchestrator-s-tax-c5570a.md