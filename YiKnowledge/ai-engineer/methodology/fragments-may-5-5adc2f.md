---
title: "Lattice Framework, SPDD FAQ, Double Feedback Loops, and the Genie Tarpit"
tags: [agentic-programming, framework, feedback-loops, ai-infrastructure, code-quality]
category: ai-engineer/methodology
created: '2026-08-05'
updated: 2026-08-07
source: https://martinfowler.com/fragments/2026-05-05.html
source_name: Martin Fowler
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles: [ai-engineer, engineer]
benefit: "Understand the Lattice framework for AI coding discipline, double feedback loops in agentic development, and the debate over whether internal code quality still matters."
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - ai-engineer/methodology/structured-prompt-driven-development-spdd-9c74e3.md
  - ai-engineer/methodology/feedback-flywheel-886f45.md
---

# Lattice Framework, SPDD FAQ, Double Feedback Loops, and the Genie Tarpit

> **As an** AI engineer, **I want to** understand the Lattice framework for AI coding discipline and the debate over whether internal code quality matters, **so that** I can build effective harnesses and avoid the "Genie Tarpit" of unmaintainable AI-generated code.

## Summary

- Rahul Garg released Lattice, an open-source framework that operationalizes AI-assisted development patterns with composable skills in three tiers: atoms, molecules, and refiners.
- Lattice embeds engineering disciplines (Clean Architecture, DDD, design-first, secure coding) into the AI's working context, with a living `.lattice/` folder that accumulates project standards.
- Kent Beck's "Genie Tarpit" warns that LLMs naturally produce code with poor internal quality, and the fundamental question is whether internal quality matters in the agentic age.
- The double feedback loop concept: developers are changing both the thing they are building AND the tools they use to build it -- a rediscovery of "Internal Reprogrammability."
- Apple's strategy of betting on local models (spending ~10% of revenue on AI infrastructure vs. 50-75% for competitors) may prove prescient if local models become Good Enough.

## Core viewpoints

### 1. Lattice operationalizes the "harness as code" concept
Lattice is not documentation -- it is installable infrastructure that changes how AI coding agents behave. The three-tier architecture (atoms for single actions, molecules for workflows, refiners for output quality) is composable, so teams can adopt incrementally. The living context layer means the system gets smarter with use, applying your rules informed by your history.

### 2. The Genie Tarpit is the central question of agentic programming
Kent Beck's framing: Fred Brooks described large-system programming as a tar pit where complexity accumulates until even the strongest teams sink. LLMs "naturally live down and to the left of muddling" -- they claim success even when code does not work, and complexity piles on complexity until even the genie cannot make progress. The question is whether LLMs can escape the tar pit, or whether internal quality remains the only way out.

### 3. Internal Reprogrammability is being rediscovered
The joy of molding your development environment to fit your problem -- a central feature of Smalltalk and Lisp communities that was lost with complex IDEs -- is being rediscovered through AI agents. When AI makes software change superfast, changing your tools to make debugging easier pays off immediately. This is a meta-level feedback loop: improving the system that improves the system.

### 4. Apple's contrarian AI strategy deserves attention
While competitors spend 50-75% of revenue on AI infrastructure, Apple spends closer to 10%. If local, open models become Good Enough, Apple's bet on on-device AI looks wise. The historical parallel: the Apple II put less capable compute into homes and offices, enabling spreadsheets and desktop publishing that mainframes could not. The same pattern may play out with local AI models.

### 5. The double feedback loop is the meta-skill that separates AI-augmented developers
The developers who improve fastest with AI are not the ones who write the best prompts -- they are the ones who systematically improve their tools after every session. The double feedback loop (improve the code AND improve the tools) compounds: a 1% improvement in the harness per session, over hundreds of sessions, produces a harness that is qualitatively different from the starting point. This is the skill that cannot be automated because it requires meta-cognition about the development process itself.

## Key info

- Lattice can be installed as a Claude Code plugin or downloaded for any AI tool.
- The SPDD article added a Q&A section answering a dozen common questions.
- Local models are crossing the "good enough for daily work" threshold, with sandboxing (Nono) recommended even for cloud models.
- Big tech AI infrastructure spending: over $100 billion total; Amazon, Alphabet, Microsoft spending over 50% of revenues; Meta and Oracle at 75%+.
- The "Genie Tarpit" concept: LLMs have "plausible deniability" task orientation, claiming success even when code does not work.

## Action recommendations

1. Evaluate Lattice or similar frameworks that embed engineering discipline into the AI's working context, rather than relying on ad-hoc prompts.
2. Implement the double feedback loop: after each AI session, ask both "did the code improve?" and "could the tools be improved?"
3. Treat internal code quality as an investment in AI effectiveness. Clean code is the context the AI learns from.
4. Monitor Apple's local-model strategy as a potential indicator of where the industry is heading. The economics of on-device AI may shift faster than expected.

## Anti-patterns

- **Using skills files as a "junk drawer" for everything.** Skills should be for deliberate, infrequent workflows; the rest should be computational sensors.

- **Assuming the AI will handle spaghetti code.** The Genie Tarpit is real -- complexity accumulates until even the AI cannot make progress.

- **Ignoring the double feedback loop.** The most productive developers are those who improve their tools as they work.

- **Adopting a framework like Lattice without customizing it to your team's specific patterns.** The framework provides a starting point, but the value comes from the living context layer that accumulates your team's specific rules and history. A generic Lattice installation without customization is just another set of generic rules.

- **Treating the Genie Tarpit as a reason to avoid AI-assisted development.** The tar pit is real, but the response is not avoidance -- it is investment in internal quality. The same discipline that has always kept complexity manageable (clean code, testing, refactoring) is what keeps the AI from sinking into the tar pit. AI amplifies the consequences of code quality decisions; it does not change the fundamental dynamics.

## Related

- ai-engineer/methodology/structured-prompt-driven-development-spdd-9c74e3.md
- ai-engineer/methodology/feedback-flywheel-886f45.md
- ai-engineer/methodology/viability-of-local-models-for-coding-f769de.md