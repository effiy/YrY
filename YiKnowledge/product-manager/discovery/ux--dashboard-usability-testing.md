---
title: usability testing and research quality dashboard
aliases:
- usability testing dashboard
- user testing dashboard
- research quality dashboard
- UX research quality dashboard
- moderated testing dashboard
tags:
- dashboard
- usability-testing
- user-testing
- research-quality
- ux-research
- task-completion
- heuristic-evaluation
- sus
category: product-manager/discovery/ux
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: dashboard
status: stable
lifecycle: active
review_cycle: weekly
roles:
- product-manager
- engineer
- tech-lead
benefit: usability testing quality, research rigor, and UX insight velocity visible at a glance
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
- test frequency, task completion, SUS scores, heuristic evaluation, research quality, and insight velocity defined
related:
- ./dashboard-ux-health.md
- ./dashboard-accessibility-compliance.md
- ./dashboard-design-system.md
- ../dashboard-user-research.md
- ../../metrics/dashboard-customer-feedback-satisfaction.md
tacit: false
---

# usability testing and research quality dashboard

> **As a** product manager, **I want to** track usability testing quality and research rigor, **so that** every design decision is grounded in observed user behavior, every usability issue is caught before launch, and UX research is a measured, systematic, and continuously improving practice — not a "looks good to me" design review.

> Usability testing is where design meets reality. This dashboard tracks test frequency, task completion, SUS scores, heuristic evaluation, research quality, and insight velocity — turning UX research from "we showed it to 3 people in the office" into a rigorous, evidence-based, and continuously improving user-centered design discipline.

## Summary

- 6 usability testing dimensions: test frequency, task completion, SUS scores, heuristic evaluation, research quality, insight velocity
- 185 usability tests/year; 1,250 participants; 4 products; 12 usability researchers/designers; 8 testing methods
- Test frequency: 185 tests/year (3.6/week); 72% moderated remote; 18% unmoderated; 8% in-person; 2% guerilla; 18 features launched without usability testing
- Task completion: 72% avg task completion rate; 85% first-click correctness; 2.8 avg errors per task; 5.5 min avg task time; 8 tasks with < 50% completion (critical)
- SUS scores: 74 avg SUS (industry avg 68); 82 YiVad (best); 68 YiAi (worst); 12 features below 60 SUS (failing); 8 features above 85 (excellent)
- Dashboard reviewed weekly; UX research quality review with design and product monthly

## Core viewpoints

- 5 users will find 85% of usability problems — Jakob Nielsen's rule holds: testing with 5 users per iteration finds most issues; testing with 0 users finds 0 issues; the ROI of the 6th user is marginal compared to the ROI of the 1st user on a different feature
- Task completion is the only honest usability metric — users will tell you they "like" a design (social desirability bias) but their actual behavior (task completion, errors, time) tells the truth; self-reported satisfaction without observed behavior is UX theater
- The SUS score is a thermometer, not a diagnosis — a SUS of 68 tells you the product is below average; it doesn't tell you why; SUS identifies that there's a problem, task-based testing identifies what the problem is
- Heuristic evaluation is a starting point, not a substitute — expert review finds 40-50% of usability issues; user testing finds the other 50-60% — and the issues users find are the ones that actually matter to users

## Key information

### 6-panel usability testing overview

```
┌──────────────────────────────────────────────────────────────────┐
│  TEST FREQUENCY                       │  TASK COMPLETION                       │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Tests/year: 185 (3.6/wk)│   │  │  Task completion: 72%    │   │
│  │  Moderated remote: 72%   │   │  │  First-click correct: 85%│   │
│  │  Unmoderated: 18%        │   │  │  Avg errors/task: 2.8    │   │
│  │  In-person: 8%           │   │  │  Avg task time: 5.5 min  │   │
│  │  Guerilla: 2%            │   │  │  Tasks < 50%: 8 (critical)│   │
│  │  Untested features: 18   │   │  │  Tasks > 90%: 35 (excel) │   │
│  │  Frequency score: B(78)  │   │  │  Task score: B- (72)    │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  SUS SCORES                           │  HEURISTIC EVALUATION                  │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Avg SUS: 74 (target 80) │   │  │  Heuristic evals: 42/yr │   │
│  │  YiVad: 82 (best)        │   │  │  Issues found: 285      │   │
│  │  YiWeb: 72               │   │  │  Severity: critical 12%, │   │
│  │  YiPet: 75               │   │  │  major 28%, minor 45%,   │   │
│  │  YiAi: 68 (worst)        │   │  │  cosmetic 15%            │   │
│  │  < 60 SUS: 12 features   │   │  │  Issues fixed: 62%       │   │
│  │  > 85 SUS: 8 features    │   │  │  Heuristic score: B(78)  │   │
│  │  SUS score: B (78)       │   │  │                           │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  RESEARCH QUALITY                     │  INSIGHT VELOCITY                      │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Research plans: 78%     │   │  │  Insights generated: 285 │   │
│  │  Screeners: 85% quality  │   │  │  Insights acted on: 58%  │   │
│  │  Moderation: 80% quality │   │  │  Insight→action: 12 days │   │
│  │  Analysis: 72% rigorous  │   │  │  Research waste: 22%     │   │
│  │  Participant diversity:  │   │  │  (insights not used)     │   │
│  │  65% representative      │   │  │  Research backlog: 15    │   │
│  │  Quality score: B- (72)  │   │  │  Velocity score: B- (72) │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Usability test frequency by product

| Product | Tests/year | Tests/feature | Moderated | Unmoderated | Untested features | Participants/year | Avg participants/test | Health |
|---|---|---|---|---|---|---|---|---|
| **YiVad** | 62 | 2.5 | 75% | 18% | 5 | 380 | 6.1 | A- (88) |
| **YiWeb** | 48 | 1.8 | 68% | 22% | 4 | 285 | 5.9 | B+ (82) |
| **YiPet** | 42 | 2.2 | 72% | 15% | 3 | 220 | 5.2 | B+ (85) |
| **YiAi** | 28 | 1.5 | 70% | 18% | 5 | 175 | 6.3 | B- (72) |
| **Marketing** | 5 | 0.5 | 80% | 20% | 1 | 30 | 6.0 | C (65) |
| **Overall** | **185** | **1.9** | **72%** | **18%** | **18** | **1,250** | **5.8** | **B (78)** |

### Task completion by feature type

| Feature type | Tasks tested | Completion rate | First-click correctness | Errors/task | Time/task | Critical issues (< 50%) | SUS impact |
|---|---|---|---|---|---|---|---|
| **Navigation/menu** | 42 | 78% | 82% | 1.8 | 3.2 min | 2 | High (navigation is foundation) |
| **Form/input** | 38 | 68% | 75% | 4.5 | 6.5 min | 3 | High (conversion, data quality) |
| **Search/filter** | 28 | 75% | 80% | 2.2 | 4.8 min | 1 | High (findability) |
| **Onboarding/setup** | 25 | 58% | 62% | 5.2 | 12.5 min | 4 | Critical (activation, retention) |
| **Dashboard/data viz** | 22 | 82% | 88% | 1.5 | 3.5 min | 0 | Medium (power users) |
| **Workflow/multi-step** | 18 | 62% | 70% | 3.8 | 8.5 min | 2 | High (completion, satisfaction) |
| **Mobile/responsive** | 12 | 70% | 78% | 3.2 | 5.5 min | 1 | Medium (mobile user base) |
| **Overall** | **185** | **72%** | **85%** | **2.8** | **5.5 min** | **8** | |

### SUS scores by product and version

| Product | Current SUS | Previous SUS | Trend | Industry benchmark | Grade | Top complaint | Best feature |
|---|---|---|---|---|---|---|---|
| **YiVad v2.5** | 82 | 78 | +4 | 68 (B2B SaaS avg) | A- | "Chat history hard to navigate" | "AI response quality" |
| **YiWeb v3.2** | 72 | 70 | +2 | 68 | B- | "Too many menus, cluttered" | "Dashboard customization" |
| **YiPet v2.0** | 75 | 72 | +3 | 68 | B | "Popup blocking site content" | "Quick-access shortcuts" |
| **YiAi v1.8** | 68 | 62 | +6 | 68 | C+ | "Agent configuration too complex" | "Agent performance insights" |
| **Mobile app** | 74 | 71 | +3 | 70 (mobile avg) | B | "Slow on older devices" | "Push notification relevance" |
| **Onboarding flow** | 58 | 55 | +3 | 68 | F | "Too many steps, confusing" | "Social login option" |
| **Overall** | **74** | **71** | **+3** | **68** | **B** | | |

### Heuristic evaluation findings

| Nielsen heuristic | Issues found | Critical | Major | Minor | Cosmetic | Fixed | Top violation pattern |
|---|---|---|---|---|---|---|---|
| **1. Visibility of system status** | 42 | 5 | 12 | 18 | 7 | 65% | Loading states missing, no feedback on actions |
| **2. Match between system and real world** | 38 | 3 | 10 | 15 | 10 | 58% | Technical jargon in UI, non-standard terminology |
| **3. User control and freedom** | 28 | 4 | 8 | 12 | 4 | 72% | No undo, can't exit modals, forced workflows |
| **4. Consistency and standards** | 45 | 6 | 15 | 18 | 6 | 55% | Inconsistent button placement, mixed patterns |
| **5. Error prevention** | 35 | 8 | 12 | 10 | 5 | 68% | Destructive actions without confirmation |
| **6. Recognition rather than recall** | 32 | 2 | 8 | 15 | 7 | 52% | Hidden features, no contextual help |
| **7. Flexibility and efficiency of use** | 22 | 1 | 5 | 12 | 4 | 48% | No keyboard shortcuts, no power user features |
| **8. Aesthetic and minimalist design** | 18 | 0 | 4 | 10 | 4 | 70% | Cluttered screens, irrelevant information |
| **9. Help users recognize, diagnose, recover** | 15 | 3 | 5 | 5 | 2 | 75% | Cryptic error messages, no recovery path |
| **10. Help and documentation** | 10 | 0 | 2 | 5 | 3 | 65% | No contextual help, outdated docs |
| **Overall** | **285** | **32 (12%)** | **81 (28%)** | **120 (42%)** | **52 (18%)** | **62%** | |

### Research quality by dimension

| Quality dimension | Standard | Compliance | Gap | Example issue | Action |
|---|---|---|---|---|---|
| **Research plan** (objectives, method, participants) | Every study has written plan | 78% | 22% | "We'll just talk to some users" | Require 1-page research plan before recruitment |
| **Participant screener** (targeted, unbiased) | Screener reviewed by 2nd researcher | 85% | 15% | Screening for "tech-savvy" users only | Add screener peer review, diversity check |
| **Moderation quality** (neutral, consistent) | Moderator trained, protocol followed | 80% | 20% | Leading questions, confirming own bias | Record sessions, peer review moderation |
| **Analysis rigor** (thematic, triangulated) | 2+ analysts, inter-rater reliability | 72% | 28% | Single analyst, cherry-picked quotes | Require 2 analysts, calculate inter-rater reliability |
| **Participant diversity** (representative) | Matches target user demographics | 65% | 35% | 80% male, 90% under 35, 95% US-based | Add diversity quotas, recruit globally |
| **Insight documentation** (searchable, shareable) | Insights in research repository | 75% | 25% | Insights in Slack threads, lost | Centralize in research repository, tag by feature |
| **Overall** | | **72%** | **28%** | | |

### Insight velocity and impact

| Product | Insights generated | Insights acted on | Action rate | Insight→action (days) | Research waste | Features changed by research | Research ROI |
|---|---|---|---|---|---|---|---|
| **YiVad** | 95 | 62 (65%) | 65% | 10 | 18% | 18 features | 4.5× (research cost savings vs rework) |
| **YiWeb** | 72 | 42 (58%) | 58% | 14 | 25% | 12 features | 3.2× |
| **YiPet** | 58 | 38 (65%) | 65% | 8 | 15% | 10 features | 5.0× |
| **YiAi** | 42 | 22 (52%) | 52% | 18 | 28% | 6 features | 2.8× |
| **Marketing** | 18 | 8 (44%) | 44% | 22 | 35% | 2 features | 1.5× |
| **Overall** | **285** | **172 (58%)** | **58%** | **12** | **22%** | **48 features** | **3.5×** |

## Action recommendations

1. **Onboarding usability crisis**: 58% task completion, 4 critical issues, 58 SUS (failing); redesign onboarding flow with progressive disclosure, reduce steps from 8 to 4, add skip option, target 75% completion and 70 SUS
2. **Untested feature elimination**: 18 features launched without usability testing; mandate usability test for all features > 2 weeks of engineering, add usability gate to definition of done, target 0 untested features
3. **Research quality improvement**: 72% analysis rigor, 65% participant diversity; require 2 analysts per study, implement diversity quotas for participants, add research quality checklist, target 85% across all dimensions
4. **Insight velocity acceleration**: 12 days insight-to-action, 22% research waste; implement research insights kanban, add weekly research share-out, link insights to Jira/epics, target < 7 days and < 10% waste
5. **YiAi usability improvement**: 68 SUS (worst), 28% research waste; dedicated UX researcher for YiAi, increase test frequency from 1.5 to 2.5 tests/feature, simplify agent configuration, target 75 SUS
6. **Heuristic fix acceleration**: 62% of heuristic issues fixed, 38% open (32 critical); prioritize critical heuristic fixes, add heuristic review to design sprint, target 90% fix rate for critical issues
7. **Form and input redesign**: 68% completion, 4.5 errors/task, 3 critical issues; standardize form patterns, add inline validation, reduce required fields, add smart defaults, target 80% completion
8. **Error prevention**: 8 critical issues, error messages fail heuristic #9; add confirmation dialogs for destructive actions, improve error messages with recovery paths, add undo for common actions
9. **Research repository centralization**: 25% of insights undocumented or scattered; implement research repository (Dovetail/Condens), tag all insights by feature/persona/heuristic, add searchable archive
10. **Weekly usability review**: review test frequency, task completion, SUS scores, heuristic evaluation, research quality, and insight velocity with design and product



- The "we tested it with the team" shortcut → using coworkers as usability test participants; your engineers know the product, understand the terminology, and have domain expertise — they are the least representative users possible, and testing with them finds 0% of the usability problems real users will encounter
- The SUS score obsession → optimizing for SUS score instead of task completion; you can increase SUS by making the UI prettier (aesthetic-usability effect) without making it more usable; a beautiful UI with 58% task completion is a beautiful failure
- The "5 users confirmed it's great" validation → running a usability test to confirm the design works, not to find problems; asking "was this easy?" instead of observing "can they complete the task?" — confirmation bias dressed as research
- The research report graveyard → conducting rigorous usability tests, writing detailed reports, and never having anyone read them; the 22% research waste means 63 studies/year produced insights that nobody acted on — the output of research is not a report, it's a design change
- The "we'll fix it in the next iteration" deferral → finding 32 critical heuristic issues and 8 tasks with < 50% completion but shipping anyway because of the deadline; launching a feature with known critical usability issues is not "MVP thinking" — it's knowingly shipping a broken experience

## Related

- Same class: [dashboard-ux-health](dashboard-ux-health.md) — UX health
- Same class: [dashboard-accessibility-compliance](dashboard-accessibility-compliance.md) — accessibility compliance
- Same class: [dashboard-design-system](dashboard-design-system.md) — design system health
- Same class: [dashboard-user-research](../dashboard-user-research.md) — user research ops
- Same class: [dashboard-customer-feedback-satisfaction](../../metrics/dashboard-customer-feedback-satisfaction.md) — customer feedback and satisfaction
- References: Jakob Nielsen — *Usability Engineering*; Jeff Sauro — *Quantifying the User Experience*; Steve Krug — *Don't Make Me Think*; NNGroup — *How to Conduct Usability Studies*; John Brooke — *SUS: A Quick and Dirty Usability Scale*; Tom Tullis — *Measuring the User Experience*; David Travis — *ISO 9241-11 Usability Standards*