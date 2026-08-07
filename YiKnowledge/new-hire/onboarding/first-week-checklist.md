---
title: First Week Checklist for New Engineers
aliases:
- first-week-checklist
- new-engineer-first-week
- day-one-checklist
tags:
- onboarding
- new-hire
- first-week
- checklist
- engineer
category: new-hire/onboarding
created: 2026-08-07
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles:
- new-hire
benefit: "New engineers have a clear, day-by-day checklist for their first week, reducing anxiety and accelerating productivity"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./onboard-as-a-new-engineer.md
- ./onboarding-checklist.md
- ./first-month-goals.md
- ./onboard-as-a-new-engineer.md
- ./development-environment.md
tacit: false
---

# First Week Checklist for New Engineers

> **As a** new hire, **I want to** follow a clear day-by-day checklist for my first week, **so that** I know exactly what to do, who to meet, and when I'm on track.

> The first week is about orientation, not output. The goal is to set up your environment, meet the team, understand the product, and ship one small change. Everything else is secondary.

## Summary

- Day 1: Environment setup, access, first build
- Day 2: Product walkthrough, codebase tour, team introductions
- Day 3: First code change (typo fix, documentation update, small bug)
- Day 4: Deep dive into one project, understand architecture
- Day 5: First PR submitted, retro with buddy, plan for week 2
- Key principle: Ship something every day, even if it's tiny. Momentum beats perfection.
- Your buddy is your lifeline — ask questions early and often. No question is too basic.

## Core viewpoints

### 1. Day 1 is about building, not reading

The most common onboarding mistake is spending day 1 reading documentation. You'll retain almost nothing. Instead, set up your environment, clone the repos, and get a successful build within the first 4 hours. This proves your environment works and gives you a quick win.

### 2. Ship something every day

Each day should end with a tangible output: a successful build, a running local instance, a merged typo fix, a PR in review. This builds momentum and confidence. It also surfaces environment issues early — if you can't build on day 1, you know something is wrong immediately rather than discovering it on day 5.

### 3. Your buddy is your most important relationship

Your onboarding buddy is assigned to answer questions, review your first PRs, and help you navigate. Meet with them daily in your first week. Ask everything — tooling questions, cultural norms, who to talk to about what. The buddy's job is to make your onboarding smooth; use them.

### 4. Documentation gaps are your first contribution opportunity

As a new person, you have a superpower: you can see what's confusing, missing, or outdated in the documentation. Every time you struggle to find something, note it. After your first week, submit a PR to improve the documentation. This is high-value contribution that only a new person can make.

## Key info

### Day-by-day checklist

**Day 1 — Environment & Access**
- [ ] Meet your buddy (30 min intro)
- [ ] Set up development environment (follow `development-environment.md`)
- [ ] Clone all relevant repositories
- [ ] Run the build successfully (all projects)
- [ ] Get access to: GitHub, Slack, email, project management tool, CI/CD, monitoring
- [ ] Read the team's CLAUDE.md or CONTRIBUTING.md
- [ ] Send a "Hello, I joined!" message in the team channel
- [ ] End of day: All repos cloned, build passing, access granted

**Day 2 — Product & People**
- [ ] Product walkthrough with PM or buddy (60 min)
- [ ] Codebase tour with buddy (60 min)
- [ ] Meet team members (15 min each, schedule with 3-4 people)
- [ ] Read project README and architecture documents
- [ ] Explore the product as a user (create an account, use core features)
- [ ] End of day: Understand what the product does, who builds what

**Day 3 — First Code Change**
- [ ] Find a small, well-defined task (typo fix, documentation update, trivial bug)
- [ ] Understand the code path for your change
- [ ] Make the change and test locally
- [ ] Submit a PR (buddy reviews)
- [ ] End of day: First PR submitted

**Day 4 — Deep Dive**
- [ ] Choose one project to deep-dive (read architecture docs, trace key code paths)
- [ ] Understand the data flow: frontend → API → database → external services
- [ ] Read 2-3 recent merged PRs to understand code review norms
- [ ] Attend one team meeting (standup, planning, or review)
- [ ] End of day: Can explain the architecture of one project

**Day 5 — Retro & Plan**
- [ ] Get first PR merged (address review feedback from day 3)
- [ ] Retro with buddy: what went well, what was confusing, what to improve
- [ ] Document 2-3 onboarding improvements (submit as issues or PRs)
- [ ] Plan week 2 goals with buddy/manager
- [ ] End of day: First PR merged, week 2 plan ready

### Who to meet in week 1

| Person | Why | When |
|---|---|---|
| Buddy | Your primary support, daily check-ins | Day 1, then daily |
| Manager | Expectations, team context, goals | Day 1 or 2 |
| PM | Product vision, current priorities | Day 2 |
| Tech Lead | Architecture, technical decisions | Day 2 or 3 |
| 2-3 teammates | Team culture, collaboration norms | Day 2-3 |
| Designer (if applicable) | UX philosophy, design system | Day 3-4 |

## Action recommendations

1. **Follow the checklist, don't improvise**: The checklist exists because it works. Deviate only if your buddy suggests it.
2. **Ask questions immediately**: Don't spend 30 minutes stuck on something your buddy can answer in 30 seconds. The 15-minute rule: if you're stuck for 15 minutes, ask.
3. **Document as you go**: Keep a running note of everything that was confusing, missing, or could be improved. This becomes your first contribution.
4. **Ship daily**: Each day should end with a tangible output. Even a typo fix PR counts. Momentum is everything.
5. **Be visible**: Send updates in the team channel. "Day 1: Environment set up, build passing!" Visibility builds trust and shows engagement.

## Anti-patterns

- **Reading-only day 1**: Spending the first day reading documentation without building anything. You won't retain it, and you'll feel unproductive.
- **Not asking questions**: Trying to figure everything out independently. Your buddy is paid to help you. Use them.
- **Skipping the product walkthrough**: Diving into code without understanding what the product does. You'll make wrong assumptions about user needs.
- **Too ambitious first task**: Picking a complex feature as your first contribution. Start with something trivial. Complexity comes later.
- **No daily check-in with buddy**: Assuming you're on track without validation. Daily check-ins catch issues early.
- **Isolation**: Not meeting team members, not joining meetings, not sending updates. Onboarding is social as much as technical.

## Related

- [Onboard as a New Engineer](./onboard-as-a-new-engineer.md) — Full onboarding journey entry point
- [Onboarding Checklist](./onboarding-checklist.md) — Day-1 task list
- [First Month Goals](./first-month-goals.md) — 30-60-90 day plan
- [Development Environment](./development-environment.md) — Local dev setup guide
- [Tools and Access](./onboard-as-a-new-engineer.md) — Tool account setup
- [Code Review Expectations](./code-review-expectations.md) — Code review norms