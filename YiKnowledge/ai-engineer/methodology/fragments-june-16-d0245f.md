---
title: "Conversation Registers, AI Enthusiasts vs. Skeptics, and the Enshittification of the Internet"
tags: [llm-interaction, context-management, ai-ethics, decentralization, prompt-engineering]
category: ai-engineer/methodology
created: '2026-08-05'
updated: 2026-08-07
source: https://martinfowler.com/fragments/2026-06-16.html
source_name: Martin Fowler
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles: [ai-engineer, engineer]
benefit: "Learn Chelsea Troy's four conversation registers for LLM sessions, the growing divide between AI enthusiasts and skeptics, and why decentralization is the antidote to enshittification."
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - ai-engineer/methodology/fragments-july-6-e27df0.md
  - ai-engineer/methodology/fragments-june-2-4c5dec.md
---

# Conversation Registers, AI Enthusiasts vs. Skeptics, and the Enshittification of the Internet

> **As an** AI engineer, **I want to** manage LLM conversations effectively using distinct registers and understand the growing divide between AI enthusiasts and skeptics, **so that** I can use AI productively without falling into either extreme.

## Summary

- Chelsea Troy identified four conversation registers for LLM sessions: Exploring, Brainstorming, Deciding, and Implementing. The key rule: change register, start a new conversation with fresh context.
- Charity Majors warns of a "crevasse" forming between AI enthusiasts (who see real productivity leaps) and AI skeptics (who see degrading reliability and evaporating institutional knowledge). Both are correct, and the lack of common feedback between them is dangerous.
- The April 2026 inflection point: AI coding tools found product-market fit, with enterprise pricing increases reflecting real revenue implications.
- Mike Masnick traces the internet's failed promise of decentralization through enshittification and argues that ease of exit (user control over data) is the key to cognitive liberty in the AI era.

## Core viewpoints

### 1. Conversation registers are the missing discipline in LLM interaction
Chelsea Troy's four registers (Exploring, Brainstorming, Deciding, Implementing) address a fundamental problem: LLM conversations mix modes, leading to confused context and degraded output. The discipline is simple but powerful: when you change register, start a new conversation. The LLM's context window should contain only one register at a time.

### 2. Both AI enthusiasts and skeptics are right, and both are missing the full picture
Enthusiasts see real productivity gains but underreport the costs (reliability degradation, knowledge evaporation, on-call burnout). Skeptics see real risks but miss the existential threat of being outcompeted. The missing piece is common feedback connecting the two groups. The solution: tell the whole story, treat AI as an engineering problem, and avoid maximalist stances.

### 3. AI is an amplifier of current practices, not a replacement
Charity Majors' key observation: engineering discipline is becoming more important, not less. AI amplifies whatever practices exist -- good practices produce better results, bad practices produce worse results faster. The teams that will succeed are those with strong engineering discipline, not those that adopt AI the fastest.

### 4. Decentralization and ease of exit are the structural antidotes to AI's concentration of power
Masnick's analysis of the internet's enshittification cycle applies directly to AI: centralized platforms create lock-in, lock-in enables exploitation. The key to avoiding this in the AI era is user control over data with easy exit from one service to another. Ease of exit promotes competition, and competition pushes back against centralized control.

### 5. The April 2026 inflection point is about revenue, not technology
The significance of April 2026 is not that AI coding tools became better -- they have been steadily improving for years. The significance is that enterprise pricing increased, signaling that the vendors have enough conviction in their product-market fit to charge real money. This is a market signal, not a technical signal, and it changes the calculus for organizations that have been treating AI coding tools as experimental. The experiment is over; the tools are now a line item in the budget.

## Key info

- The four conversation registers: Exploring (understand before touching), Brainstorming (generate options, evaluate separately), Deciding (recommendation with rationale), Implementing (decision is made, help build).
- April 2026 identified as an inflection point where AI coding tools' revenue implications became real.
- Anthropic and OpenAI increased enterprise pricing, signaling product-market fit for coding agents.
- The internet's enshittification cycle: centralized control creates lock-in, lock-in enables exploitation, exploitation drives users away but exit is hard.
- The antidote: user-controlled data, easy exit, competition through decentralization.

## Action recommendations

1. Adopt Chelsea Troy's four registers for all LLM sessions. Start a new conversation whenever you change register.
2. When evaluating AI adoption, tell the whole story: capture both the productivity gains and the reliability costs. Do not just report the wins.
3. Treat AI as an engineering problem: do not assume code can or cannot ship without review -- ask what would make it possible to reduce review effort.
4. Design your AI tooling with exit in mind. Avoid vendor lock-in; maintain control over your data and the ability to switch tools.

## Anti-patterns

- **Mixing conversation registers in a single LLM session.** A brainstorming session that drifts into implementation will produce confused output.

- **Reporting only AI wins without the costs.** This creates an unrealistic picture that widens the enthusiast-skeptic divide.

- **Maximalist stances on AI adoption.** Both "AI will replace everything" and "AI is useless" are wrong and unproductive.

- **Building AI systems that create lock-in.** The ease of exit is the structural defense against enshittification.

- **Using the same conversation for all four registers because starting a new one is inconvenient.** The discipline of starting a new conversation when changing registers is simple but easy to skip. The cost of skipping it is degraded output quality that compounds over the session, as the LLM's context becomes polluted with mixed-mode instructions.

## Related

- ai-engineer/methodology/fragments-july-6-e27df0.md
- ai-engineer/methodology/fragments-june-2-4c5dec.md
- ai-engineer/methodology/why-i-m-writing-rachel-s-ramblings-e562da.md