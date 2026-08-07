---
title: "FOSE Europe Retreat: Harness Engineering, Self-Hosting, and the Unit of Work Debate"
tags: [harness-engineering, self-hosted-models, agentic-programming, ai-governance, token-costs]
category: ai-engineer/methodology
created: '2026-08-05'
updated: 2026-08-07
source: https://martinfowler.com/fragments/2026-07-13.html
source_name: Martin Fowler
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles: [ai-engineer, engineer]
benefit: "Understand the key debates from the second FOSE retreat: harness engineering as a discipline, self-hosting economics, the 'unit of work' for agents, and managing by objective vs. method."
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - ai-engineer/methodology/fragments-july-6-e27df0.md
  - ai-engineer/methodology/fragments-july-21-db3e9f.md
---

# FOSE Europe Retreat: Harness Engineering, Self-Hosting, and the Unit of Work Debate

> **As an** AI engineer, **I want to** understand the emerging consensus from the second FOSE retreat on harness engineering, self-hosting, and managing agents, **so that** I can align my team's practices with where the industry is heading.

## Summary

- The second FOSE retreat showed a shift from "there might be something here" to "the evidence is in" -- agentic programming is real, shipping in production, and the debate has moved to how, not whether.
- Harness engineering (not even a term at the first retreat) dominated discussions, with emphasis on keeping context small (under 200 lines for agents.md) and using computational sensors like static analysis.
- Kief Morris identified the unifying theme: every session was about "the unit of work you are prepared to hand to an agent" -- how big, how checked, what guardrails surround it.
- Self-hosting models gained attention due to rising token costs, model sovereignty concerns, and data security requirements.
- The "Bring Me a Rock" anti-pattern was reframed as a defensible workflow when AI can iterate rapidly, and managing LLMs by objective (not method) emerged as the key skill.

## Core viewpoints

### 1. The unit of work is the fundamental design decision for agentic systems
Kief Morris's synthesis: every debate about code review, operations, agent autonomy, and citizen development was actually about the same decision -- what unit of work you are prepared to hand to an agent. The size, scope, preparation, verification, and guardrails vary by context, but the decision framework is the same. This is the central abstraction for designing agentic workflows.

### 2. "Bring Me a Rock" becomes defensible when iteration is cheap
The management anti-pattern of serial rejection without explanation becomes a viable workflow when the "underlings" are tireless machines that return new results in minutes. The key insight from Sam Ruby: a non-engineer steering an LLM is not picking up a tool -- they are making a hire. The question becomes whether they can manage by objective rather than by method, which is a teachable skill.

### 3. Self-hosting economics hinge on talent, not just hardware
The hard part of self-hosting is not GPU costs but the talent to efficiently use them. Managing an inference data center is not a widely available skill. The question of whether self-hosting becomes a "half-arsed private cloud" depends on whether it is simpler to host a model than a cloud, and whether the interaction protocol is simple enough.

### 4. Unstated objectives are the real danger of managing by objective
When you tell an agent "build me an app that examines my emails and forms a todo list," you are leaving a thicket of unstated assumptions: the agent should not delete emails, should not send private data to external addresses, and should not include undesired functionality. Conformance tests (sensors) are more valuable than specifications (guides), but it is hard to imagine all the conformance tests for what should not happen.

### 5. Computational sensors are shifting language preferences toward stronger type systems
The retreat surfaced a trend: teams are gravitating toward languages with stronger compile-time guarantees (Rust, TypeScript strict mode) because these languages provide more computational sensors out of the box. The choice of programming language is increasingly driven by how many errors the compiler can catch before the AI's output reaches human review. This is a reversal of the historical trend toward dynamic languages for developer productivity.

## Key info

- Context management: keep agents.md under 200 lines; models only focus on part of the context.
- Computational sensors: shifting to languages with greater controls (Rust) and leveling up validation (property-based testing, formal methods).
- Token costs: using weaker models reduces costs; a model could act as a broker to route tasks to the right model tier.
- Fine-tuning may become more common for self-hosted models, reducing token consumption and reasoning needs.
- Qwen 3.6 identified as the current sweet spot for local agentic programming.

## Action recommendations

1. Define your team's "unit of work" for agents explicitly: what size, what preparation is required, how output is verified, and what guardrails surround it.
2. Keep your agents.md or equivalent context file under 200 lines. Models attend to only part of the context, so smaller is often better.
3. When non-engineers use LLMs to build software, teach them to manage by objective (what to achieve) rather than by method (how to achieve it).
4. Evaluate self-hosting not just on hardware costs but on the availability of inference management talent in your organization.

## Anti-patterns

- **Speculating about what LLMs will be capable of in the future instea....** Speculating about what LLMs will be capable of in the future instead of developing mechanical sympathy for what they can do now.

- **Letting context windows grow unbounded.** More context does not mean better attention -- models focus on parts, not the whole.

- **Managing agents by method (step-by-step instructions) when managing....** Managing agents by method (step-by-step instructions) when managing by objective (clear goals with acceptance criteria) would be more effective.

- **Assuming that managing by objective means no constraints.** Managing by objective still requires explicit negative constraints: what the agent must not do, what data it must not access, what side effects are forbidden. The objective defines the target; the constraints define the boundaries.

- **Choosing a programming language for agentic development based on historical preference rather than sensor density.** Languages with stronger type systems and better static analysis tooling provide more computational sensors that catch AI-generated errors before human review. The language choice should be re-evaluated in light of the agentic workflow.

## Related

- ai-engineer/methodology/fragments-july-6-e27df0.md
- ai-engineer/methodology/fragments-july-21-db3e9f.md
- ai-engineer/methodology/viability-of-local-models-for-coding-f769de.md