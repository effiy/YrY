---
title: "Compressed Cognition, Agentic Restructuring, NHS Open Source Retreat, and AI Regulation"
tags: [cognitive-load, agentic-programming, open-source, ai-regulation, legacy-code]
category: ai-engineer/methodology
created: '2026-08-05'
updated: 2026-08-07
source: https://martinfowler.com/fragments/2026-05-27.html
source_name: Martin Fowler
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles: [ai-engineer, engineer]
benefit: "Understand the cognitive cost of agentic programming, how to restructure legacy codebases for AI, and the policy landscape around open source and AI regulation."
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - ai-engineer/methodology/the-conductor-developer-9aa7f7.md
  - ai-engineer/methodology/fragments-may-14-c4c6eb.md
---

# Compressed Cognition, Agentic Restructuring, NHS Open Source Retreat, and AI Regulation

> **As an** AI engineer, **I want to** understand the cognitive costs of agentic programming and how to restructure legacy codebases for AI, **so that** I can sustain productivity without burning out and apply proven restructuring patterns.

## Summary

- Adam Tornhill identifies "compressed cognition" as the hidden cost of agentic coding: developers make more decisions in less time, leading to cognitive exhaustion after a couple of hours.
- Ian Johnson documented a real-world restructuring of a Laravel + React monolith over 3 months and 258 commits, showing the pattern: characterization tests, static analysis, architectural patterns, then let the agent do more work.
- The NHS closed nearly all open source repositories citing LLM security threats -- a move criticized by GDS as substituting security-by-obscurity for secure-by-design delivery.
- US AI regulation remains stalled: a voluntary executive order on AI and cybersecurity was canceled hours before the signing ceremony.
- Graduate employment is already showing AI impact: the most AI-exposed subjects saw a 6.6% employment drop vs. 1.5% for the least exposed.

## Core viewpoints

### 1. Agentic coding is mentally expensive -- plan for cognitive endurance
Tornhill's insight: "Agentic coding is mentally expensive." The pace is too intense to sustain for more than a couple of hours. The cause is increased decision density -- more decisions in less time. The response: keep agent tasks small, automate everything possible, accept not knowing every line of code if verification is in place, and deliberately limit parallel agents. Notably, Tornhill runs one long-running task and one focus task, rejecting the "twenty agents in parallel" hype.

### 2. The restructuring pattern: harness first, then trust the agent
Ian Johnson's journey: for the first two months, he used Claude Code with auto-approve off, reviewing every change. The results were good but he was doing most of the thinking. The breakthrough came after putting characterization tests, static analysis, and architectural patterns in place. With the harness built, he shifted from writer to curator: define patterns, review test specs, review output, update the harness, make strategic decisions.

### 3. Open source security through obscurity is a warning sign
GDS's position on the NHS open source retreat: "Moving code from public to private as a substitute for investment in secure-by-design delivery, ownership and remediation is a warning sign." Closing repos does not remove underlying weaknesses in running services. The correct response to LLM-augmented attackers is better security, not less transparency.

### 4. AI regulation by phone call is not regulation
The US federal government's approach to AI regulation is "voluntary" as the ceiling, not the floor. The canceled executive order was already modest -- voluntary, focused on government defenses, explicitly not a licensing regime. The alternative is "opaque and essentially lawless" government access through back channels with no stable rules.

### 5. The graduate employment data is an early warning, not a prediction
The 6.6% employment drop in the most AI-exposed subjects is a leading indicator of structural change in the labor market. But it is specifically about new graduates, who are the most substitutable workers. The data does not tell us what happens to experienced professionals, who may benefit from AI augmentation rather than displacement. The signal is real, but the extrapolation to the broader workforce requires caution.

## Key info

- "Compressed cognition" manifests as inability to sustain agentic coding for more than 2 hours.
- The restructuring pattern: characterization tests -> static analysis -> architectural patterns -> agent autonomy.
- "On-the-loop" vs. "in-the-loop" collaboration: the shift from micromanaging every agent action to defining patterns and reviewing output.
- Graduate employment impact: 6.6% drop in most AI-exposed subjects vs. 1.5% in least exposed.
- The NHS closed repos citing LLM security threats; GDS publicly disagreed.
- US AI executive order was canceled 3 hours before the signing ceremony.

## Action recommendations

1. Limit agentic coding sessions to 2-hour blocks with deliberate breaks. The cognitive load is real and cannot be sustained indefinitely.
2. Follow the restructuring pattern: build the harness (tests, static analysis, architecture) before giving the agent more autonomy.
3. Do not run 20 agents in parallel. Human attention does not scale that way. One or two focused tasks is the sustainable maximum.
4. Do not close open source repos as an AI security measure. Invest in secure-by-design delivery instead.
5. Track the cognitive cost of your AI tools. If you are making more decisions in less time, you are burning cognitive fuel faster.

## Anti-patterns

- **Running many agents in parallel thinking it scales productivity.** The human attention bottleneck is the limiting factor, not the number of agents.

- **Giving an agent autonomy before building the harness.** The harness (tests, static analysis, patterns) is what makes autonomy safe.

- **Closing open source repos as a response to LLM security threats.** This is security through obscurity and does not address the underlying weaknesses.

- **Ignoring the cognitive cost of agentic programming.** The "compressed cognition" effect is real and leads to burnout if not managed.

- **Assuming that the restructuring pattern is complete after the first pass.** The harness (tests, static analysis, patterns) is a living artifact. As the codebase evolves, new patterns emerge that the harness does not cover, and the agent's autonomy should be recalibrated accordingly. The restructuring is not a phase -- it is a continuous practice.

## Related

- ai-engineer/methodology/the-conductor-developer-9aa7f7.md
- ai-engineer/methodology/fragments-may-14-c4c6eb.md
- ai-engineer/methodology/fragments-june-2-4c5dec.md