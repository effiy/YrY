---
title: User Research Interview Template
aliases: [user-research-template, user-interview-template]
tags: [template, user-research, interview, discovery, producter]
category: curator/templates
created: 2026-08-24
updated: 2026-08-24
source: internal
type: template
status: stable
lifecycle: active
review_cycle: quarterly
roles: [producter]
benefit: "Producters run consistent, unbiased user interviews that produce actionable insights"
acceptance_criteria:
  - "semi-structured format: core questions + follow-up probes"
  - "includes pre-interview setup and post-interview synthesis"
  - "warns against leading questions and confirmation bias"
related:
  - ./README.md
  - ./knowledge-leaf.md
  - ./usability-test-report.md
  - ../../producter/frameworks/do-user-research.md
---

# User Research Interview Template

> **When to use:** For semi-structured interviews to understand user needs, pain points, and behaviors. Not for usability testing (→ usability-test-report template).

## 1. Interview Setup

### Research Goal

{{What do we want to learn? One sentence.}}

### Participant Profile

- **Role:** {{job title, experience level}}
- **Context:** {{how they use the product, frequency, environment}}
- **Recruitment:** {{how we found them}}

### Logistics

- **Date:** {{YYYY-MM-DD}}
- **Duration:** {{typically 30-45 min}}
- **Interviewer:** {{name}}
- **Note-taker:** {{name}}
- **Recording:** {{yes/no — get consent}}

## 2. Interview Guide

### Introduction (5 min)

> Build rapport, set expectations, get consent.

1. Introduce yourself and the purpose: "We're trying to understand how you {{do X}}. There are no right or wrong answers."
2. Ask for consent to record.
3. "Do you have any questions before we start?"

### Warm-up (5 min)

> Understand context without leading.

- "Tell me about your role and what you do day-to-day."
- "How does {{product/domain}} fit into your workflow?"

### Core Questions (15-20 min)

> Open-ended, behavioral. Avoid leading questions.

| Topic | Question | Probes |
|---|---|---|
| Current behavior | "Walk me through the last time you {{did X}}." | "What happened next?" "Why did you do that?" |
| Pain points | "What's the most frustrating part of {{process}}?" | "How do you work around that?" "How much time does that cost you?" |
| Needs & goals | "If you could wave a magic wand, what would {{ideal solution}} look like?" | "Why is that important?" "What would that enable?" |
| Alternatives | "What else have you tried to solve this?" | "Why did you stop using that?" "What was missing?" |

### Wrap-up (5 min)

- "Is there anything else you'd like to share?"
- "Would you be open to a follow-up conversation if we have more questions?"
- Thank the participant.

## 3. Post-Interview Synthesis

> Complete within 24 hours while memory is fresh.

### Key Insights

1. {{Insight — a pattern, not a raw quote}}
2. {{Insight}}
3. {{Insight}}

### Surprising Findings

- {{Something we didn't expect}}
- {{Something that contradicts our assumptions}}

### User Quotes

> Verbatim quotes that capture the insight vividly.

- "{{quote}}" — context: {{when/why they said this}}

### Action Items

| Action | Owner | Priority |
|---|---|---|
| {{Follow-up, design change, further research}} | {{name}} | P0/P1/P2 |

## Anti-patterns

| Anti-pattern | Why it fails | What to do instead |
|---|---|---|
| Leading questions ("Don't you think X would help?") | User agrees to be polite; data is biased | Ask open-ended questions: "Tell me about the last time you..." |
| Selling the product during the interview | User stops giving honest feedback; becomes a demo | You're there to learn, not to pitch |
| No note-taker | Interviewer can't listen well while typing | Always have a dedicated note-taker, or record (with consent) |
| Interviewing only power users | Results are skewed toward edge cases; miss mainstream needs | Recruit a mix: new, casual, and power users |