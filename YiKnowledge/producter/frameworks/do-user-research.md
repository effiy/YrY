---
title: Do User Research
aliases: [user-research, user-interviews, ux-research, customer-discovery]
tags: [producter, frameworks, user-research, discovery, interviews]
category: producter/frameworks
created: 2026-08-24
updated: 2026-08-24
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [producter]
benefit: "Producters run effective user research that produces actionable insights, not just interesting anecdotes"
acceptance_criteria:
  - "covers 5 research methods with when-to-use guidance"
  - "includes interview guide template and synthesis process"
  - "warns against common research biases"
related:
  - ./jobs-to-be-done-summary.md
  - ./rice-ice-prioritization.md
  - ../discovery/write-a-prd.md
  - ../../curator/templates/user-research-interview.md
---

# Do User Research

> **When to use:** Before writing a PRD, when you're unsure about user needs, or when a feature isn't getting adoption. User research replaces assumptions with evidence.

## Research Methods

| Method | Time | Cost | Best for | Sample size |
|---|---|---|---|---|
| **User interview** | 1-2 weeks | Low | Understanding needs, pain points, context | 5-8 per segment |
| **Usability test** | 1-2 weeks | Low-Med | Evaluating a specific design | 5 users (Nielsen) |
| **Survey** | 1-3 weeks | Low | Quantifying known behaviors, satisfaction | 100+ |
| **Analytics review** | 1-3 days | Low | What users actually do (vs. what they say) | All users |
| **Field observation** | 2-4 weeks | High | Deep context, workflow understanding | 3-5 |

### When to Use Each

```
What do you need to learn?
├─ User needs, pain points, motivations? ──→ User interviews
├─ Is this design usable? ──→ Usability test
├─ How many users have this problem? ──→ Survey
├─ What are users actually doing? ──→ Analytics review
└─ How do users work in their real environment? ──→ Field observation
```

## User Interview Process

### 1. Recruit (3-5 days)

Find 5-8 participants per user segment. Sources:

- Existing users (reach out via email or in-app prompt)
- User research platforms (UserInterviews.com, Respondent.io)
- Internal stakeholders (for internal tools)
- "Friends and family" (only for early-stage discovery)

**Compensation:** $50-100 gift card for 30-45 min interviews.

### 2. Prepare the Interview Guide

Use the [user research interview template](../../curator/templates/user-research-interview.md). Key rules:

- **Start broad, end specific** — "Tell me about your workflow" → "Walk me through the last time you did X"
- **Ask about behavior, not opinion** — "When was the last time you..." not "Do you think you would..."
- **Never ask leading questions** — "What frustrates you about X?" not "Don't you hate it when X?"
- **Follow the silence** — after they answer, wait 3 seconds; they'll often add the most valuable insight

### 3. Conduct the Interview (30-45 min each)

| Phase | Duration | Focus |
|---|---|---|
| Introduction | 5 min | Build rapport; explain purpose; get consent |
| Context | 5 min | Understand their role and environment |
| Deep dive | 15-20 min | Core questions about behavior and needs |
| Wrap-up | 5 min | "Anything else?"; ask for referrals |

### 4. Synthesize (1-2 days)

After all interviews, look for patterns:

1. **Transcribe** key quotes (don't transcribe everything)
2. **Tag** quotes by theme (pain points, needs, workarounds, wishes)
3. **Group** tags into insights (3-5 key findings)
4. **Prioritize** by frequency and impact

### Synthesis Template

| Insight | Evidence (quotes) | Frequency | Impact |
|---|---|---|---|
| Users can't find the export button | "I spent 10 min looking for it" (P3, P5, P7) | 3/8 | High — blocks key workflow |
| Dark mode is a must-have for night users | "I use dev tools to inject dark CSS" (P2, P4, P8) | 3/8 | Medium — workaround exists but painful |

## Analytics Review (Quick Win)

Before recruiting users, check what you already know:

1. **Funnel analysis** — where do users drop off?
2. **Feature adoption** — which features are used? Which are ignored?
3. **Error logs** — what's breaking for users?
4. **Support tickets** — what are users complaining about?

YiVad and YiPet both have access to YiAi data — query the `sessions`, `bugs`, and usage collections.

## Research Biases to Avoid

| Bias | What it is | How to avoid |
|---|---|---|
| **Confirmation bias** | Looking for evidence that confirms your hypothesis | Write down your hypothesis before the research; actively look for disconfirming evidence |
| **Recency bias** | Overweighting the last interview | Take notes during each interview; review all notes before synthesizing |
| **Selection bias** | Only interviewing power users or friends | Recruit a mix: new users, casual users, power users |
| **Leading questions** | "Don't you think X would help?" | Ask open-ended questions; never suggest answers |
| **Hawthorne effect** | Users behave differently because they're being observed | Observe in their natural environment when possible |

## Anti-patterns

| Anti-pattern | Why it fails | What to do instead |
|---|---|---|
| Research as validation (not discovery) | You only hear what you want to hear | Research before forming a solution; test the problem, not your idea |
| "Our users are unique" (skipping research) | You build the wrong thing; waste months of engineering | Even 3 interviews are better than 0 |
| Research without synthesis | Raw notes are not insights; no one acts on them | Synthesize within 24 hours; share insights as a 1-page doc |
| One-and-done research | User needs change; product evolves | Research continuously: 1-2 interviews per week, not a batch once a quarter |