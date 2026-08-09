---
title: Do a pair programming
aliases: [i-want-to-do-a-pair-programming, pair-programming, pair-programming-session, mob-programming]
tags: [journey, methodology, pair-programming, collaboration, knowledge-transfer, code-quality]
category: engineer/process
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: journey
lifecycle: active
status: stable
review_cycle: quarterly
roles: [engineer]
benefit: "Engineers use pair programming to share knowledge, improve code quality, and reduce defects through real-time collaboration"
acceptance_criteria:
  - "user story header defines who, what, and why"
  - "step-by-step guide is complete with prerequisites and expected outcome"
  - "cross-references to related journeys and patterns are present
related:
  - ../../new-hire/onboarding/onboard-as-a-new-engineer.md
  - ./mentor-and-grow-engineers.md
  - ../process/collaborate-across-teams.md
  - ../../product-manager/frameworks/write-a-spec-or-prd.md
  - ../../knowledge-curator/templates/thinking--first-principles.md
  - ../../knowledge-curator/templates/thinking--ockhams-razor.md
  - ../../knowledge-curator/templates/thinking--second-order-thinking.md
  - ../../knowledge-curator/templates/thinking--inversion.md
tacit: Pair programming is not watching someone type; it is driver + navigator; rotate every 15-25 minutes; only pair on high complexity; knowledge transfer; do not pair all day
---

# I want to do pair programming

> **As an** engineer, **I want to** do a pair programming, **so that** outcome is traceable. 

## Summary

- Pair programming has two roles: driver + navigator; not watching someone type
- Rotate every 15-25 minutes; do not pair all day
- Only pair on high complexity: key algorithms / security / cross-team / before launch
- Knowledge transfer: tacit knowledge transfer; not a documentation substitute
- 4-person mob: complex decisions; do not pile up people
- No-pairing scenarios: simple CRUD / documentation / exploration
- Strong-weak pairing: the weak types more; the strong navigates more
- Remote pairing: screen sharing + voice; not asynchronous

## Scenario

Pair programming is a knowledge transfer + quality improvement method; not watching someone type. This entry provides the pair programming full path, covering two roles, rotation, only pair on high complexity, knowledge transfer, mob programming, no-pairing scenarios, strong-weak pairing, remote pairing, and links to do-a-code-review / onboard-as-a-new-engineer / mentor-and-grow-engineers / collaborate-across-teams / write-a-spec-or-prd / prepare-a-1-on-1 and other leaves. 

## 2-hop reachability paths

| Hops | goal | file |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | code review | [./do-a-code-review.md](../quality-security/do-a-code-review.md) |
| 2 hops | new hire onboarding | [../../new-hire/onboarding/onboard-as-a-new-engineer.md](../../new-hire/onboarding/onboard-as-a-new-engineer.md) |
| 2 hops | mentor and grow | [./mentor-and-grow-engineers.md](./mentor-and-grow-engineers.md) |
| 2 hops | cross-team collaboration | [../strategies/collaborate-across-teams.md](collaborate-across-teams.md) |
| 2 hops | PRD | [../../product-manager/frameworks/write-a-spec-or-prd.md](../../product-manager/frameworks/write-a-spec-or-prd.md) |
| 2 hops | 1on1 | [../strategies/prepare-a-1-on-1.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-1-on-1.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking--first-principles.md](../../knowledge-curator/templates/thinking--first-principles.md) |
| 2 hops | ockhams | [../../knowledge-curator/templates/thinking--ockhams-razor.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) |
| 2 hops | second-order | [../../knowledge-curator/templates/thinking--second-order-thinking.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) |
| 2 hops | inversion | [../../knowledge-curator/templates/thinking--inversion.md](../../knowledge-curator/templates/thinking--inversion.md) |

## Action recommendations

1. **Two roles**: driver types + navigator thinks; not watching someone type
2. **15-25 minute rotation**: do not pair all day; prevent fatigue
3. **Only pair on high complexity**: key algorithms / security / cross-team / before launch / hard bugs
4. **Knowledge transfer**: tacit knowledge transfer; not a documentation substitute
5. **4-person mob**: complex decisions; do not pile up people; 3-4 people is optimal
6. **No-pairing scenarios**: simple CRUD / documentation / exploration; do not waste
7. **Strong-weak pairing**: the weak types more; the strong navigates more
8. **Remote pairing**: screen sharing + voice; not asynchronous
9. **Keyboard stream handoff**: use tools (tmux / VS Code Live Share); do not crowd one keyboard
10. **think aloud**: driver talks while typing; navigator listens and thinks
11. **Do not criticize people**: criticize the code; do not criticize the person
12. **Breaks**: pomodoro; do not work non-stop
13. **Pairing goal**: clear goal; do not pair for the sake of pairing
14. **Pairing notes**: after pairing, record key decisions; do not lose them
15. **First principles**: why must pair; worst consequence of not pairing
16. **Inversion thinking**: how much can be solved with code review + documentation; if solvable, do not pair
17. **Second-order thinking**: second-order consequences after pairing (cost / quality / confidence / hiring) 
18. **Occam**: the simpler the pairing scenario the better; cut redundant pairings

## Related

- code review: [./do-a-code-review.md](../quality-security/do-a-code-review.md) — review vs pairing
- new hire onboarding: [../../new-hire/onboarding/onboard-as-a-new-engineer.md](../../new-hire/onboarding/onboard-as-a-new-engineer.md) — new hire pairing
- mentor and grow: [./mentor-and-grow-engineers.md](./mentor-and-grow-engineers.md) — growth method
- cross-team: [../strategies/collaborate-across-teams.md](collaborate-across-teams.md) — cross-team pairing
- PRD: [../../product-manager/frameworks/write-a-spec-or-prd.md](../../product-manager/frameworks/write-a-spec-or-prd.md) — requirements alignment
- 1on1: [../strategies/prepare-a-1-on-1.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-1-on-1.md) — personal growth
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking--first-principles.md) + [ockhams](../../knowledge-curator/templates/thinking--ockhams-razor.md) + [second-order](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [inversion](../../knowledge-curator/templates/thinking--inversion.md)
