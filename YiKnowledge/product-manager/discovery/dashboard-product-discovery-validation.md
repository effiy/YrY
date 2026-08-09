---
title: product discovery and validation dashboard
aliases:
- product discovery dashboard
- idea validation dashboard
- concept testing dashboard
- discovery velocity dashboard
- assumption testing dashboard
tags:
- dashboard
- product-discovery
- idea-validation
- concept-testing
- assumption-testing
- discovery-velocity
- prototyping
- lean-startup
category: product-manager/discovery
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: weekly
roles:
- product-manager
- executive
- engineer
- tech-lead
benefit: product discovery velocity, idea validation effectiveness, and assumption testing rigor visible at a glance
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
- discovery pipeline, idea validation, assumption testing, prototype velocity, discovery-to-delivery conversion, and discovery culture defined
related:
- ./dashboard-user-research.md
- ../metrics/dashboard-product-portfolio.md
- ../metrics/dashboard-feature-adoption.md
- ../strategy/dashboard-product-strategy.md
- ../strategy/dashboard-innovation-portfolio.md
tacit: false
---

# product discovery and validation dashboard

> **As a** product manager, **I want to** track product discovery velocity and validation rigor, **so that** every idea is tested before it's built, assumptions are validated with evidence, and discovery is a measured, systematic, and continuously improving practice — not a "the CEO had an idea" feature factory.

> Discovery is where product bets are won or lost — before a single line of code is written. This dashboard tracks discovery pipeline, idea validation, assumption testing, prototype velocity, discovery-to-delivery conversion, and discovery culture — turning product discovery from "trust me, users will love this" into a rigorous, evidence-based, and continuously improving product development discipline.

## Summary

- 6 discovery dimensions: discovery pipeline, idea validation, assumption testing, prototype velocity, discovery-to-delivery conversion, discovery culture
- 285 ideas/year; 85 discovery projects; 52 prototypes built; 38 user tests; 22 features shipped from discovery; 12 ideas killed by evidence
- Discovery pipeline: 285 ideas submitted; 185 triaged (65%); 85 explored (30%); 52 prototyped (18%); 38 tested (13%); 22 shipped (8%); 12 killed by evidence (4%)
- Idea validation: 38% of ideas validated with user evidence before building; 62% built on unvalidated assumptions; 8 features shipped with < 5 users tested; 3 major features built without any discovery
- Assumption testing: 285 assumptions tracked; 42% tested; 28% invalidated (killed idea); avg 12 assumptions per discovery project; 5.5 days avg assumption test cycle
- Dashboard reviewed weekly; discovery portfolio review with product leadership monthly

## Core viewpoints

- Discovery is the cheapest place to fail — killing an idea in discovery costs $2,500 (prototype + 5 user tests); killing it after launch costs $85,000 (engineering + design + lost opportunity + customer trust); the 12 ideas killed by evidence saved $1M+ in wasted development
- The most dangerous assumption is the one you don't know you're making — "users want this," "they'll pay for it," "they'll switch from their current tool" are all assumptions; every product decision is a hypothesis until it's tested with real users
- Prototypes are not MVPs — a prototype is a disposable instrument for learning (built in days, tested with 5-8 users, thrown away); an MVP is a minimal viable product (built in weeks, released to real users, supported indefinitely); confusing the two means you're either over-engineering prototypes or shipping prototypes as products
- Discovery velocity is a competitive advantage — the team that can go from idea to validated learning in 5 days will outlearn the team that takes 5 weeks; discovery velocity is not about moving fast, it's about learning fast

## Key information

### 6-panel discovery overview

```
┌──────────────────────────────────────────────────────────────────┐
│  DISCOVERY PIPELINE                   │  IDEA VALIDATION                       │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Ideas submitted: 285/yr │   │  │  Validated w/ evidence:  │   │
│  │  Triaged: 65% (185)      │   │  │  38% (before building)   │   │
│  │  Explored: 30% (85)      │   │  │  Unvalidated: 62%        │   │
│  │  Prototyped: 18% (52)    │   │  │  Tested w/ < 5 users: 8 │   │
│  │  Tested: 13% (38)        │   │  │  Zero discovery: 3       │   │
│  │  Shipped: 8% (22)        │   │  │  features (major)        │   │
│  │  Killed by evidence: 4%  │   │  │  Validation score: C+(68)│   │
│  │  Pipeline score: B (78)  │   │  │                           │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  ASSUMPTION TESTING                   │  PROTOTYPE VELOCITY                   │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Assumptions tracked: 285│   │  │  Prototypes built: 52    │   │
│  │  Tested: 42% (120)       │   │  │  Avg build time: 3.5 days│   │
│  │  Validated: 58% (70)     │   │  │  Fidelity: low 45%, med  │   │
│  │  Invalidated: 28% (34)   │   │  │  35%, high 20%           │   │
│  │  Untested: 58% (165)     │   │  │  Prototype→learn: 5.5 days│   │
│  │  12 assumptions/discovery│   │  │  Reusable: 25% of proto  │   │
│  │  Test cycle: 5.5 days    │   │  │  Proto velocity: B (78)  │   │
│  │  Assumption score: C+(68)│   │  │                           │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  DISCOVERY→DELIVERY CONVERSION        │  DISCOVERY CULTURE                     │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Discovery→delivery: 58%│   │  │  Teams doing discovery:  │   │
│  │  Evidence-based: 42%    │   │  │  8 of 12 (67%)           │   │
│  │  Shipped w/o discovery: │   │  │  PM:Eng ratio in disc:   │   │
│  │  62% of features         │   │  │  1:8 (target 1:6)       │   │
│  │  Post-launch surprise:   │   │  │  Discovery hours/wk: 8.5 │   │
│  │  28% of features (metric │   │  │  (target 15)             │   │
│  │  changed significantly)  │   │  │  Discovery debt: 18      │   │
│  │  Conversion score: C+(68)│   │  │  features (skipped disc) │   │
│  └─────────────────────────┘   │  │  Culture score: C+(68)   │   │
│                                │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Discovery pipeline funnel

| Stage | Ideas | Conversion | Drop-off reason | Time in stage | Cost/stage | Health |
|---|---|---|---|---|---|---|
| **1. Submitted** | 285 | 100% | — | 0 days | $0 | |
| **2. Triaged** | 185 | 65% (from submit) | Not aligned with strategy (40%), duplicate (25%), no clear user need (20%), resource constraint (15%) | 3 days | $150/idea | B+ |
| **3. Explored** (problem space) | 85 | 46% (from triage) | Problem not worth solving (35%), user need weaker than assumed (30%), market too small (20%), technical infeasibility (15%) | 8 days | $2,500/idea | B |
| **4. Prototyped** (solution space) | 52 | 61% (from explore) | Solution too complex (30%), no clear differentiator (25%), build cost too high (25%), team capacity (20%) | 5 days | $5,000/proto | B |
| **5. User tested** | 38 | 73% (from prototype) | Prototype not testable (40%), scheduling difficulties (35%), pivot to different approach (25%) | 8 days | $8,000/test | B- |
| **6. Shipped** | 22 | 58% (from test) | Failed validation (45%), deprioritized (30%), merged with other feature (25%) | 42 days (delivery) | $45,000/feature | C+ |
| **7. Killed by evidence** | 12 | 4% (from submit) | Validated NOT to build — success | N/A | $2,500 avg | A (ROI+) |

### Idea validation by product

| Product | Ideas submitted | Discovered (stages 2-5) | Shipped | Shipped w/ evidence | Shipped w/o evidence | Zero discovery | Post-launch surprise |
|---|---|---|---|---|---|---|---|
| **YiVad** | 85 | 28 | 8 | 5 (62%) | 3 (38%) | 1 | 2 (25%) |
| **YiWeb** | 72 | 22 | 6 | 3 (50%) | 3 (50%) | 1 | 3 (50%) |
| **YiPet** | 48 | 15 | 4 | 2 (50%) | 2 (50%) | 0 | 1 (25%) |
| **YiAi** | 35 | 12 | 3 | 2 (67%) | 1 (33%) | 0 | 1 (33%) |
| **Platform/Infra** | 28 | 5 | 1 | 0 (0%) | 1 (100%) | 1 | 1 (100%) |
| **Other** | 17 | 3 | 0 | 0 | 0 | 0 | 0 |
| **Overall** | **285** | **85** | **22** | **12 (55%)** | **10 (45%)** | **3** | **8 (36%)** |

### Assumption testing by type

| Assumption type | Tracked | Tested | Validated | Invalidated | Untested | Test method | Avg test cycle |
|---|---|---|---|---|---|---|---|
| **Desirability** (users want this) | 95 | 48 (51%) | 32 (67%) | 16 (33%) | 47 (49%) | User interview, concept test, smoke test, landing page | 4.5 days |
| **Usability** (users can use this) | 62 | 28 (45%) | 22 (79%) | 6 (21%) | 34 (55%) | Usability test, prototype walkthrough, first-click test | 5.0 days |
| **Viability** (business works) | 55 | 18 (33%) | 10 (56%) | 8 (44%) | 37 (67%) | Pricing test, willingness-to-pay, market sizing, cohort analysis | 8.0 days |
| **Feasibility** (we can build this) | 42 | 15 (36%) | 12 (80%) | 3 (20%) | 27 (64%) | Technical spike, architecture review, prototype build, 3rd-party eval | 6.5 days |
| **Ethical/safety** (should we build this) | 18 | 8 (44%) | 6 (75%) | 2 (25%) | 10 (56%) | Ethical review, bias audit, safety assessment, red team | 3.5 days |
| **Adoption/switch** (users will switch) | 13 | 3 (23%) | 1 (33%) | 2 (67%) | 10 (77%) | Competitive usability, switching cost analysis, migration test | 10.0 days |
| **Overall** | **285** | **120 (42%)** | **83 (69%)** | **37 (31%)** | **165 (58%)** | | **5.5 days** |

### Prototype velocity by fidelity

| Fidelity | Built | Avg build time | Users tested | Learnings generated | Cost | Reusable code | Best for |
|---|---|---|---|---|---|---|---|
| **Paper/concierge** (manual behind scenes) | 12 | 0.5 days | 8 | 3.5 avg | $200 | 0% | Desirability, problem validation |
| **Low-fidelity** (wireframes, Figma click-through) | 18 | 2 days | 6 | 5.2 avg | $1,500 | 10% | Usability, flow, navigation |
| **Medium-fidelity** (interactive, fake data, no backend) | 15 | 5 days | 5 | 6.8 avg | $5,000 | 25% | Interaction design, feature validation |
| **High-fidelity** (functional, real data, limited scale) | 7 | 8 days | 5 | 8.5 avg | $12,000 | 40% | Technical feasibility, performance, scale |
| **Overall** | **52** | **3.5 days** | **6.0 avg** | **5.8 avg** | **$3,800** | **25%** | |

### Discovery-to-delivery conversion

| Discovery outcome | Count | % of shipped | Evidence quality | Post-launch success | Example |
|---|---|---|---|---|---|
| **Strong validation** (3+ evidence types, > 8 users) | 8 | 36% | A | 88% meet success metrics | User interviews + prototype test + A/B test |
| **Moderate validation** (1-2 evidence types, 5-8 users) | 8 | 36% | B | 62% meet success metrics | User interviews + concept test |
| **Weak validation** (< 5 users, 1 evidence type) | 3 | 14% | C | 33% meet success metrics | 3 user interviews, no prototype |
| **No discovery** (built on assumption) | 3 | 14% | F | 0% meet success metrics | CEO idea, competitor-driven |
| **Overall** | **22** | **100%** | | **58% success rate** | |

### Discovery culture by team

| Team | PM:Eng ratio | Discovery hours/week | Discovery methods used | Ideas tested/mo | Discovery debt | Culture score |
|---|---|---|---|---|---|---|
| **YiVad** | 1:6 | 12 | 5 (interview, prototype, concept, usability, A/B) | 3.5 | 2 features | B+ (82) |
| **YiWeb** | 1:8 | 8 | 4 (interview, prototype, usability, concept) | 2.5 | 5 features | B (78) |
| **YiPet** | 1:5 | 10 | 4 (interview, prototype, usability, analytics) | 2.0 | 1 feature | B+ (85) |
| **YiAi** | 1:7 | 12 | 5 (interview, prototype, concept, technical spike, pricing) | 2.8 | 0 features | A- (88) |
| **Platform** | 1:12 | 4 | 2 (technical spike, architecture review) | 0.5 | 5 features | D (52) |
| **Data/AI** | 1:8 | 6 | 3 (data exploration, prototype, interview) | 1.2 | 3 features | C+ (68) |
| **SRE** | 0:8 (no PM) | 2 | 1 (technical spike) | 0.2 | 2 features | D (48) |
| **Other (5 teams)** | 1:10 | 5 | 2 | 1.0 | 0 features | C (65) |
| **Overall** | **1:8** | **8.5** | **3.5 avg** | **1.8** | **18 features** | **C+ (68)** |

## Action recommendations

1. **Discovery culture expansion**: 4 of 12 teams not doing systematic discovery; assign PM to Platform and SRE teams, train all PMs in discovery methods, target 100% team coverage, target 15 hrs/week discovery time
2. **Assumption testing rigor**: 58% of assumptions untested; implement assumption mapping at discovery kickoff, require 80% of critical assumptions tested before build, add assumption test to definition of ready
3. **Zero-discovery feature elimination**: 3 features shipped with zero discovery (0% success rate); implement discovery gate before engineering starts, require at least 5 user interviews for any feature > 2 weeks of work
4. **Post-launch surprise reduction**: 36% of features had significant metric changes post-launch (evidence of poor discovery); correlate surprise rate with discovery depth, add post-launch review to discovery feedback loop
5. **Prototype fidelity mix optimization**: 65% low-fidelity (good for learning, low cost), but 20% high-fidelity (expensive, only 40% reusable); shift to 60% low, 30% medium, 10% high — reduce high-fidelity protos that aren't graduating to delivery
6. **Discovery-to-delivery conversion**: 58% conversion, 42% of discovered ideas don't ship; analyze why 42% die (failed validation vs deprioritization), implement kill criteria for deprioritized ideas, increase discovery throughput
7. **Platform team discovery gap**: 1:12 PM ratio, 4 hrs/week discovery, 0.5 ideas tested/month; add dedicated platform PM, implement internal user discovery (dogfooding is not discovery), target 10 hrs/week
8. **SRE discovery gap**: no PM, 2 hrs/week discovery, 0.2 ideas tested/month; assign PM or train SRE lead in discovery, implement internal developer discovery, use SRE incidents as discovery input
9. **Discovery method diversity**: avg 3.5 methods per team, Platform and SRE use only 1-2; train teams in additional methods, add method playbook, incentivize method diversity
10. **Weekly discovery review**: review discovery pipeline, idea validation, assumption testing, prototype velocity, discovery-to-delivery conversion, and discovery culture with product leadership



- The "solution-first" discovery → starting with a solution ("we should build a chatbot") and doing discovery to justify it, not to validate it; discovery is not a sales pitch for your idea — it's an honest investigation into whether the idea is worth building
- The "5 users is enough" shortcut → doing 5 user interviews, hearing 3 positive responses, and declaring validation; 5 users can tell you if a problem exists, but they can't tell you if a solution works at scale — qualitative discovery informs, quantitative validation confirms
- The prototype-as-product trap → building a high-fidelity prototype, getting positive feedback, and shipping it as-is without engineering for scale, security, accessibility, edge cases; a prototype that impressed 5 users in a controlled test will crumble under 5,000 users in production
- The "we don't have time for discovery" excuse → skipping discovery because the deadline is tight; the 3 features shipped with zero discovery all failed to meet success metrics and required 2-3× more engineering time to fix post-launch — skipping discovery doesn't save time, it defers it at 3× cost
- The discovery theater → going through the motions of discovery (user interviews, prototypes, assumption maps) but ignoring the evidence when it contradicts the predetermined answer; if you're going to build it regardless of what discovery finds, you're not doing discovery — you're doing performance art

## Related

- Same class: [dashboard-user-research](dashboard-user-research.md) — user research ops
- Same class: [dashboard-product-portfolio](../metrics/dashboard-product-portfolio.md) — product portfolio
- Same class: [dashboard-feature-adoption](../metrics/dashboard-feature-adoption.md) — feature adoption
- Same class: [dashboard-product-strategy](../strategy/dashboard-product-strategy.md) — product strategy
- Same class: [dashboard-innovation-portfolio](../strategy/dashboard-innovation-portfolio.md) — innovation portfolio
- References: Teresa Torres — *Continuous Discovery Habits*; Marty Cagan — *Inspired*; Jeff Gothelf — *Lean UX*; Alberto Savoia — *The Right It*; Strategyzer — *Testing Business Ideas*; Laura Klein — *Build Better Products*; Melissa Perri — *Escaping the Build Trap*