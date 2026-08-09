---
title: Onboard as a new engineer
aliases:
- i-want-to-onboard-as-a-new-engineer
- new-engineer-onboarding-journey
- new-hire-getting-started-entry
tags:
- journeys
- onboarding
- new-engineer
- first-day
- first-week
- first-month
category: new-hire/onboarding
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- new-hire
benefit: onboarding is smooth
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./handoff-project.md
- ../../engineer/process/run-iteration-meetings.md
- ../../executive/industry/README.md
- ../../engineer/projects/INDEX.md
review_cycle: quarterly
tacit: false
---

# I want to onboard as a new engineer

> **As a** new hire, **I want to** onboard as a new engineer, **so that** onboarding is smooth. 

> "How a new hire gets started on day one / first week / first month" reaches within 2 hops the onboarding template + Day-1 checklist + project card + development standards + first PR process. 

## Summary

- Day-1 follows `work/onboarding/onboarding-checklist.md`: environment setup / repo clone / permission request / first successful build
- First week follows `projects/{YiAi,YiVad,YiPet}/onboarding.md` 8 sections: positioning / architecture / functional modules / development standards / run locally / first PR / cross-project links / resource list
- First month follows `methodology/` + `lessons/` accumulation: mental models + engineering-patterns + gotchas + wins
- First PR: run [testing infrastructure](../../engineer/engineering/set-up-testing-infrastructure.md) + follow [supply-chain hardening](../../engineer/process/harden-supply-chain.md)

## Core viewpoints

**The first PR is the most important onboarding milestone, not the first day.** A new engineer who can set up their environment but cannot ship a change is not onboarded. The first PR should be small, meaningful, and merged within the first week. Speed to first PR is the single best predictor of long-term onboarding success.

**Reading code without running it is passive learning with diminishing returns.** The architecture summary and functional modules docs are maps, not the territory. The fastest way to build a mental model of the codebase is to set a breakpoint, trigger a feature, and trace the call stack end to end. One hour of debugging a real flow teaches more than a day of reading documentation.

**Onboarding is a two-way street.** The new engineer brings fresh eyes that can spot inconsistencies, outdated docs, and broken dev setups that the existing team has learned to work around. Every onboarding should produce at least one PR that fixes the onboarding documentation or the dev environment setup. If the new engineer struggled with something, the next one will too.

**The first month sets the trajectory for the first year.** Engineers who ship independently in month one build confidence and context that compounds. Engineers who spend month one reading without shipping fall into a passive consumption pattern that is hard to break. The onboarding checklist should be biased toward doing, not reading.

## Key info

- **Day-1 checklist**: (1) environment setup (clone repos, install dependencies, run `npm run dev` / `uvicorn` -- must succeed before end of day), (2) permissions (GitHub access, MongoDB connection, API keys, VPN if needed), (3) first build (produce a working artifact, even if no code changes), (4) meet the team (15-minute intro with each team member, learn who owns what), (5) read the architecture overview (one page, not the full docs). The day-1 checklist is non-negotiable: if the environment isn't working by end of day, the rest of the onboarding timeline slips.
- **First week timeline**: Day 1 (environment + first build), Day 2 (trace a full feature end-to-end with a debugger, understand the data flow), Day 3 (pick a small bug or improvement from the backlog, start coding), Day 4 (submit first PR, address review feedback), Day 5 (PR merged, ship to production). The timeline is aggressive but achievable: the first PR should be a 10-50 line change, not a feature. The goal is completing the full cycle (code → review → merge → deploy), not the size of the change.
- **First month milestones**: Week 1 (first PR shipped), Week 2 (second PR, larger scope, less guidance needed), Week 3 (own a small feature from spec to ship, attend design reviews), Week 4 (independently own a requirement, participate in oncall shadow rotation). The transition from "needs guidance" to "independent" should happen between weeks 2 and 3. If a new engineer still needs daily guidance in week 4, the onboarding process has a gap.
- **Onboarding buddy system**: assign a buddy (not the manager) who is available for questions, reviews the first PR, and checks in daily for the first week. The buddy should be a peer (not a senior engineer with competing priorities) who can answer "dumb questions" without judgment. The buddy's time commitment: 1-2 hours per day in week 1, 30 minutes per day in week 2, ad-hoc thereafter. The buddy is the single most important factor in onboarding success -- more important than documentation quality.
- **Onboarding feedback loop**: after each week, the new engineer writes 3 bullet points: what worked, what was confusing, what documentation was wrong. The buddy reviews and either fixes the issues directly or assigns them to the onboarding documentation owner. The feedback loop ensures that the onboarding process improves with each new hire. Without it, the same onboarding pain points persist across cohorts.

## Scenario description

New hire onboarding (experienced hire / campus hire / internal transfer), when needing to quickly get started on a project = Day-1 set up environment / first week submit first PR / first month independently own requirements. This entry aggregates the onboarding template, project card, development standards, first PR process into a 2-hop path, avoiding "no one cares on day 1 / can't read code in week 1 / can't take requirements in month 1". 

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/onboarding/` | [template.md](../../new-hire/onboarding/template.md) · [onboarding-checklist.md](../../new-hire/onboarding/onboarding-checklist.md) — Day-1 task list |
| `projects/YiAi/` | [onboarding.md](../../new-hire/onboarding/yiai--onboarding.md) · [architecture-summary.md](../../engineer/projects/yiai/architecture.md) · [functional-modules-summary.md](../../engineer/projects/yiai/functional-modules.md) · [dev-standards-summary.md](../../engineer/projects/yiai/dev-standards.md) · [project-management-summary.md](../../product-manager/projects/yiai--project-management.md) |
| `projects/YiVad/` | [onboarding.md](../../new-hire/onboarding/yivad--onboarding.md) · [architecture-summary.md](../../engineer/projects/yivad/architecture.md) · [functional-modules-summary.md](../../engineer/projects/yivad/functional-modules.md) · [dev-standards-summary.md](../../engineer/projects/yivad/dev-standards.md) · [rag-system-pages-reference.md](../../engineer/projects/yivad/rag-system-pages-reference.md) |
| `projects/YiPet/` | [onboarding.md](../../new-hire/onboarding/yipet--onboarding.md) · [architecture-summary.md](../../engineer/projects/yipet/architecture.md) · [functional-modules-summary.md](../../engineer/projects/yipet/functional-modules.md) · [dev-standards-summary.md](../../engineer/projects/yipet/dev-standards.md) |
| `methodology/` | [thinking/first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) · [engineering-patterns/README.md](../../README.md) — 9 patterns overview |
| `lessons/` | [gotchas/README.md](../../engineer/lessons/README.md) · [wins/README.md](../../engineer/lessons/README.md) — predecessor experience / pitfalls |
| `work/meetings/` | [iteration-pm-handbook-summary.md](../../engineer/process/iteration-pm-handbook.md) · [weekly-report-sample.md](../../product-manager/delivery/weekly-report.md) · [daily-report-sample.md](../../product-manager/delivery/daily-report.md) — iteration cadence |
| `work/tools/` | [claude-code-tips-summary.md](../../engineer/engineering/claude-code-tips.md) · [vllm-ollama-deployment-summary.md](../../engineer/engineering/vllm-ollama-deployment.md) — tool getting started |

## Action recommendations

1. **Day-1**: run `onboarding-checklist.md` (environment / repository / permission / first successful build) + project onboarding.md positioning + architecture overview. 
2. **First week**: read `architecture-summary.md` + `functional-modules-summary.md` + `dev-standards-summary.md` + run locally + first PR (small change + run tests + run lint).
3. **First PR**: run [testing infrastructure](../../engineer/engineering/set-up-testing-infrastructure.md) + follow [supply-chain hardening](../../engineer/process/harden-supply-chain.md) (skip hardening if no new deps introduced) + commitlint + PR description aligned. 
4. **First month**: independently own requirements = read stories / scenes + run [iteration meeting](../../engineer/process/run-iteration-meetings.md) + write weekly / daily report. 
5. **Persistent**: scan `methodology/thinking/` + `methodology/engineering-patterns/` + `lessons/gotchas/` + `lessons/wins/` to accumulate predecessor experience. 
6. **Cross-project links**: each week read [shared-client-vendor-rollout](../../engineer/engineering/shared-client-vendor-rollout.md) + [weekly report cross-project links](../../product-manager/delivery/weekly-report.md). 
7. **Mentor**: 1-on-1 follow [one-on-one-template.md](../../knowledge-curator/templates/one-on-one.md) quarterly growth tracking. 

## Anti-patterns

- **Waiting for permission to explore.** New engineers sometimes wait for someone to assign them a task before touching the codebase. The onboarding checklist is the permission slip. Clone the repo, run the build, break something, fix it, and ask questions. The team expects you to be proactive, not passive.

- **Skipping the dev environment setup because it looks complicated.** The dev environment is the foundation. If setup takes more than an hour, that is a bug in the onboarding documentation, not a reason to skip it. Flag the friction immediately; the team needs to know the onboarding doc is broken.

- **Reading everything before doing anything.** The knowledge base is deep and will take months to fully absorb. Do not attempt to read it all before writing code. Read enough to ship the first PR, then read more as needed. The knowledge base is a reference, not a prerequisite.

- **Not asking questions because you do not want to look uninformed.** The first month is the only time when every question is expected and encouraged. After six months, asking "what does this module do" is a red flag. In the first month, it is a sign of engagement. Ask every question that comes to mind.

- **Staying in one project for too long.** The Yi family has three projects (YiAi, YiVad, YiPet) with shared architecture patterns. Spending the entire first month in one project misses the cross-project perspective that makes the architecture coherent. Read the architecture summary of all three projects by the end of week two.

## Related

- Related journey: [./handoff-project.md](./handoff-project.md) — handoff-side perspective (mirror of newcomer perspective) 
- Related journey: [../../engineer/process/run-iteration-meetings.md](../../engineer/process/run-iteration-meetings.md) — first month run iteration meetings
- Related journey: [../../engineer/process/check-engineering-gotchas.md](../../engineer/process/check-engineering-gotchas.md) — predecessor pitfalls
- Upstream: [../../knowledge-curator/diagrams/user-journey.md](../../knowledge-curator/diagrams/user-journey.md) — journey design basis
