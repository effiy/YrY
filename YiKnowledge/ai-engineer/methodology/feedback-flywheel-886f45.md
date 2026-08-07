---
title: "Feedback Flywheel: Harvesting AI Session Learnings for Team Improvement"
tags: [feedback-loops, team-practices, ai-assisted-development, knowledge-management, continuous-improvement]
category: ai-engineer/methodology
created: '2026-08-05'
updated: 2026-08-07
source: https://martinfowler.com/articles/reduce-friction-ai/feedback-flywheel.html
source_name: Martin Fowler
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles: [ai-engineer, engineer]
benefit: "Implement a structured feedback practice that turns individual AI session experiences into shared team artifacts, compounding learning across the team."
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - ai-engineer/methodology/structured-prompt-driven-development-spdd-9c74e3.md
  - ai-engineer/methodology/fragments-may-5-5adc2f.md
---

# Feedback Flywheel: Harvesting AI Session Learnings for Team Improvement

> **As a** development team lead, **I want to** implement a structured feedback practice that captures learnings from individual AI coding sessions, **so that** the entire team benefits from each person's experience rather than each developer learning the same lessons in isolation.

## Summary

- Rahul Garg proposes a structured feedback practice that harvests learnings from AI-assisted development sessions and feeds them back into the team's shared artifacts.
- The practice turns individual experience into collective improvement, addressing the common problem where each developer independently discovers the same patterns and pitfalls.
- The feedback loop connects AI session outcomes to team guides, prompts, skills, and project configuration, creating a compounding knowledge base.
- The practice is part of a broader series on reducing friction in AI-assisted development.

## Core viewpoints

### 1. Individual AI learning is wasted if not shared
Every developer who uses AI coding tools accumulates session-specific knowledge: which prompts work, which patterns the AI misunderstands, which guardrails are needed. Without a structured feedback practice, this knowledge stays with the individual. The feedback flywheel is the mechanism for converting individual experience into team assets.

### 2. The flywheel feeds into shared artifacts, not just documentation
The feedback does not go into a wiki that nobody reads. It goes into the actual artifacts the AI uses: skills files, project configuration, prompt templates, and review checklists. This makes the feedback immediately actionable -- the next developer's AI session benefits from the previous developer's learnings.

### 3. The practice compounds over time
After a few feature cycles, the system is not applying generic rules but the team's specific rules, informed by the team's history. The feedback flywheel creates a virtuous cycle where each session makes future sessions better.

### 4. The flywheel must be scoped to the right granularity
Not every AI interaction warrants a feedback entry. The sweet spot is capturing lessons that are reusable across the team: patterns the AI consistently misunderstands, guardrails that prevented a specific class of error, or prompt structures that reliably produced better results. Capturing every minor observation dilutes the flywheel's signal and makes the review process unsustainable.

### 5. The feedback flywheel changes the economics of onboarding
When a new developer joins the team, their AI sessions benefit from months of accumulated feedback from the entire team. This means they produce higher-quality output from day one, and the team's AI harness encodes institutional knowledge that would otherwise take weeks to transfer. The flywheel is not just a productivity tool -- it is a knowledge preservation mechanism that survives team churn.

## Key info

- The feedback flywheel is part of a series on reducing friction in AI-assisted development.
- The practice connects to the Lattice framework (atoms, molecules, refiners) for operationalizing AI development patterns.
- Feedback targets include: guides, sensors, prompts, skills, and project configuration files.

## Action recommendations

1. After every significant AI coding session, capture what worked, what failed, and what guardrails were needed. Feed this into the team's shared AI configuration.
2. Create a structured template for AI session feedback: what task was attempted, what approach worked, what the AI misunderstood, and what should change in the harness.
3. Review and incorporate feedback into shared artifacts (skills, prompts, project config) on a regular cadence, not just when someone remembers.
4. Make the feedback practice visible: track how many session learnings were captured and how many led to harness improvements.

## Anti-patterns

- **Letting each developer build their own private collection of prompt....** Letting each developer build their own private collection of prompts and skills. This fragments knowledge and prevents compounding.

- **Treating feedback as documentation rather than actionable harness c....** Treating feedback as documentation rather than actionable harness changes. The output should be changes to the AI's working context, not a wiki page.

- **Collecting feedback without a regular review cadence.** Unreviewed feedback is just noise.

- **Capturing feedback at the wrong granularity.** Logging every minor observation creates an unmanageable backlog that nobody will review. The feedback template should enforce a bar: is this lesson reusable across the team, and will it change the harness? If the answer to both is no, skip it.

- **Failing to close the loop by making the feedback visible.** Developers need to see that their feedback led to a harness change. Without this visibility, the flywheel loses participation -- developers stop contributing because they do not see the impact. A public changelog of harness improvements driven by session feedback maintains the incentive to contribute.

## Related

- ai-engineer/methodology/structured-prompt-driven-development-spdd-9c74e3.md
- ai-engineer/methodology/fragments-may-5-5adc2f.md