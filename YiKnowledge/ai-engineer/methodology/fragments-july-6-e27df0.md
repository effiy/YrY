---
title: "FOSE Europe: Architecture in the Agentic Age, AI Ethics, and Token Cost Crisis"
tags: [software-architecture, agentic-programming, token-costs, ai-ethics, code-quality]
category: ai-engineer/methodology
created: '2026-08-05'
updated: 2026-08-07
source: https://martinfowler.com/fragments/2026-07-06.html
source_name: Martin Fowler
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles: [ai-engineer, engineer]
benefit: "Understand the key debates from FOSE Europe: whether architecture still matters in the agentic age, the ethics of AI engagement, and the emerging token cost crisis."
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - ai-engineer/methodology/fragments-july-13-d3002f.md
  - ai-engineer/methodology/fragments-july-21-db3e9f.md
---

# FOSE Europe: Architecture in the Agentic Age, AI Ethics, and Token Cost Crisis

> **As an** AI engineer, **I want to** understand whether software architecture still matters when agents write the code, **so that** I can invest my design effort where it has the highest leverage.

## Summary

- The second FOSE retreat showed a marked shift from the first: hesitancy was replaced by confidence. Everyone was shipping agentic systems in production, not presenting slides.
- The central debate: does architecture still matter? One camp argues the "Galaxy Brain" of LLMs will handle any spaghetti code. The other, championed by Laura Tacho, argues "the Venn Diagram of Developer Experience and Agent Experience is a circle" -- good design helps agents as much as humans.
- Token costs are exploding: one company's bill rose from $5M to $15M monthly, on track for $120M/year. Companies are throttling employee AI use and even telling models to "speak like cavemen" to reduce tokens.
- The ethics debate: Charity Majors argues that purity (renouncing AI) is not useful; engagement and shaping the technology is the ethical path.
- Code quality matters more than ever because LLMs amplify existing patterns -- both good and bad.

## Core viewpoints

### 1. Architecture quality can be measured by token costs
A novel metric: if the same change requires fewer tokens, that indicates better architecture. This is the first time in history that computers care about code quality, and it provides a quantifiable economic incentive for good design. Token cost becomes a proxy for architectural complexity.

### 2. LLMs amplify existing code patterns -- good and bad
If a codebase has duplication, LLMs will generate more duplication. If it mixes concerns, LLMs will continue mixing them. LLMs look at existing code and see precedent, not technical debt. This means technical debt in an AI-assisted codebase compounds faster than in a human-only codebase. The corollary: good code becomes even more valuable as a teaching example for the AI.

### 3. "Generative debt" is a new category of technical debt
Pavel Voronin's concept: generative debt accumulates when a codebase contains confused concepts that models are likely to reproduce. This is distinct from cognitive debt (what the team does not understand) -- it is about what the model is now likely to reproduce. A clean codebase is not just for humans anymore; it is the training data for every future AI interaction.

### 4. The token cost crisis is real and accelerating
The "tokenpocalypse" is here: companies are seeing exponential token cost increases. The biggest culprit is not agentic programming but staff using AI for document transformation (PDFs to slides). Companies that spent years urging AI adoption are now offering services to control AI costs. The response includes using weaker models, restricting frontier model access, and even "caveman speak" plugins.

### 5. Engagement beats purity on AI ethics
Charity Majors' argument: there is no ethical gain from renouncing AI and castigating users. The way to drive change is to engage, to get "down in the muck and build it." Purity provides little practical help with a technology that is powerful and useful. The ethical path is to shape how AI is used, not to withdraw from using it.

## Key info

- Token cost trajectory: $5M (Aug 2025) to $15M (May 2026), on track for $120M/year at one company.
- Companies are cutting off frontier model access and urging use of less powerful models.
- "Caveman speak" -- a plugin that reduces token usage by simplifying language -- is being adopted as a cost-cutting measure.
- Mozilla used AI to identify and fix 423 security bugs in Firefox in April 2026, up from 17-31 per month in 2025.
- 404 Media's investigation: token costs are "getting out of control" across the industry.
- Abstract design patterns from the retreat: story from backlog, talk with agent, create ADR, generate task list, agent completes.

## Action recommendations

1. Measure your architecture quality by token costs for common changes. If the same change costs more tokens over time, your architecture is degrading.
2. Invest in codebase quality as an AI teaching tool. Clean code is the training data for every future AI interaction with your codebase.
3. Track token costs by use case, not just in aggregate. Distinguish between high-value agentic programming and low-value document transformation.
4. Implement tiered model access: use frontier models only for complex tasks, weaker models for routine work.
5. Engage with AI rather than renouncing it. The ethical path is to shape how AI is used in your organization, not to withdraw.

## Anti-patterns

- **Assuming architecture does not matter because LLMs are smart enough.** Evidence suggests good design helps agents, and bad design compounds through AI amplification.

- **Treating all token consumption equally.** Document transformation "chewing tokens" is a different problem from agentic programming token usage.

- **Using AI for writing without verification.** The "LLM voice" is increasingly detectable and discredits content.

- **Speculating about future LLM capabilities instead of developing mec....** Speculating about future LLM capabilities instead of developing mechanical sympathy for current models.

- **Renouncing AI entirely as an ethical stance rather than engaging to shape it.** Charity Majors' argument applies: purity provides little practical help with a technology that is powerful and useful. The ethical path is to shape how AI is used in your organization, not to withdraw from using it.

## Related

- ai-engineer/methodology/fragments-july-13-d3002f.md
- ai-engineer/methodology/fragments-july-21-db3e9f.md
- ai-engineer/methodology/fragments-june-2-4c5dec.md