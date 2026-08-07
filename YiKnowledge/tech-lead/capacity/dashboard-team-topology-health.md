---
title: team topology and org design dashboard
aliases:
- team topology dashboard
- org design dashboard
- team structure dashboard
- cognitive load dashboard
tags:
- dashboard
- team-topology
- org-design
- cognitive-load
- team-structure
- conways-law
- team-autonomy
- team-health
category: tech-lead/capacity
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: dashboard
status: stable
lifecycle: active
review_cycle: quarterly
roles:
- tech-lead
- executive
- engineer
benefit: team topology, cognitive load, and organizational design health visible at a glance
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
- team structure, cognitive load, interaction modes, Conway alignment, team autonomy, and org evolution defined
related:
- ./dashboard-engineering-capacity.md
- ./dashboard-talent-retention.md
- ../../engineer/process/dashboard-team-health-engagement.md
- ../../engineer/architecture-design/apply-team-topologies.md
- ../../engineer/architecture-design/apply-domain-driven-design.md
tacit: false
---

# team topology and org design dashboard

> **As a** tech lead, **I want to** track team topology and organizational design health, **so that** every team has clear boundaries, manageable cognitive load, well-defined interaction modes, and the autonomy to deliver independently — creating an organization that enables flow, not one that fights against it.

> Team topology is the architecture of how people work together. This dashboard tracks team structure, cognitive load, interaction modes, Conway's Law alignment, team autonomy, and organizational evolution — turning org design from a once-a-year reorg into a continuously measured, deliberately evolved sociotechnical system.

## Summary

- 6 topology dimensions: team structure, cognitive load, interaction modes, Conway alignment, team autonomy, org evolution
- 285 engineers across 22 teams; 8 domains; 4 team types: stream-aligned (15), platform (2), enabling (2), complicated subsystem (3)
- Team structure: 22 teams (15 stream-aligned, 2 platform, 2 enabling, 3 complicated subsystem); avg team size: 13 (target 5-9); 5 teams oversized (> 15)
- Cognitive load: 8 teams at "overloaded" (cognitive load score > 75); avg cognitive load: 62/100 (target < 50); 3 teams responsible for 12+ services each
- Interaction modes: 68% collaboration, 18% X-as-a-service, 14% facilitating; 22% of interactions are "unlabeled" (ad-hoc, unmanaged); 5 broken interaction patterns
- Conway alignment: 72% alignment between team boundaries and system architecture; 8 cross-team dependencies per team avg (target < 5); 6 "Conway violations" (team boundary cuts through domain)
- Dashboard reviewed quarterly; org design review biannual with engineering leadership and executive team

## Core viewpoints

- Conway's Law is not a suggestion — it's an inevitability; your system architecture will mirror your communication structure, whether you plan it or not; the only choice is whether you design the organization to produce the architecture you want
- Cognitive load is the constraint on team velocity — a team responsible for 12 services, 3 databases, and 2 frontend frameworks is not "full-stack," it's overwhelmed; the maximum cognitive load a team can handle is the limit on how fast they can go
- Team types are not status levels — platform teams are not "above" stream-aligned teams; complicated subsystem teams are not "elite"; each team type serves a different function, and the health of the organization depends on the right mix
- Interaction modes must be explicit — every team-to-team interaction should be a deliberate choice: collaboration (working together), X-as-a-service (consuming an API), or facilitating (helping another team help themselves); unlabeled interactions create confusion and bottlenecks

## Key information

### 6-panel team topology overview

```
┌──────────────────────────────────────────────────────────────────┐
│  TEAM STRUCTURE                     │  COGNITIVE LOAD                     │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Teams: 22 total         │   │  │  Avg cognitive load: 62  │   │
│  │  Stream-aligned: 15      │   │  │  Overloaded (>75): 8     │   │
│  │  Platform: 2             │   │  │  Optimal (30-50): 5      │   │
│  │  Enabling: 2             │   │  │  Underloaded (<30): 2    │   │
│  │  Complicated-subsystem: 3│   │  │  Services/team: 5.5 avg  │   │
│  │  Avg size: 13 (target 7) │   │  │  Domains/team: 2.4 avg   │   │
│  │  Oversized (>15): 5 teams│   │  │  Load score: C (62)      │   │
│  │  Structure score: B- (72)│   │  │                           │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  INTERACTION MODES                  │  CONWAY ALIGNMENT                   │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Collaboration: 68%      │   │  │  Conway alignment: 72%   │   │
│  │  X-as-a-service: 18%     │   │  │  X-team deps: 8 avg      │   │
│  │  Facilitating: 14%       │   │  │  Conway violations: 6    │   │
│  │  Unlabeled: 22%          │   │  │  Boundary mismatch: 8    │   │
│  │  Broken patterns: 5      │   │  │  Dependency hotspots: 4  │   │
│  │  Mode appropriateness:68%│   │  │  Inverse Conway: 3       │   │
│  │  Interaction score: C+   │   │  │  Alignment score: B- (72)│   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  TEAM AUTONOMY                      │  ORG EVOLUTION                      │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Autonomy score: 72/100  │   │  │  Teams < 1 year: 8      │   │
│  │  Full autonomy: 5 teams  │   │  │  Teams 1-2 years: 6     │   │
│  │  High autonomy: 8 teams  │   │  │  Teams > 2 years: 8     │   │
│  │  Partial autonomy: 6     │   │  │  Reorgs (12mo): 3       │   │
│  │  Low autonomy: 3 teams   │   │  │  Team splits needed: 4  │   │
│  │  Blocked deploys: 18%    │   │  │  Team merges needed: 3  │   │
│  │  Autonomy score: B- (72) │   │  │  Evolution score: B (78)│   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Team structure by type

| Team | Type | Size | Domain | Services owned | Engineer count | Seniority mix | Health |
|---|---|---|---|---|---|---|---|
| **YiVad Core** | Stream-aligned | 18 | Collaboration | 8 | 15 | 3 Sr, 8 Mid, 4 Jr | C (oversized) |
| **YiAi Agents** | Stream-aligned | 15 | AI/ML | 6 | 12 | 4 Sr, 5 Mid, 3 Jr | C+ (oversized) |
| **YiWeb Frontend** | Stream-aligned | 14 | Portal | 5 | 12 | 2 Sr, 7 Mid, 3 Jr | C+ (oversized) |
| **YiPet Desktop** | Stream-aligned | 8 | Desktop | 4 | 7 | 2 Sr, 3 Mid, 2 Jr | B+ (optimal) |
| **Auth & Identity** | Stream-aligned | 7 | IAM | 3 | 6 | 2 Sr, 3 Mid, 1 Jr | A- (optimal) |
| **Payments** | Stream-aligned | 6 | Billing | 2 | 5 | 2 Sr, 2 Mid, 1 Jr | A (optimal) |
| **Notifications** | Stream-aligned | 5 | Messaging | 2 | 4 | 1 Sr, 2 Mid, 1 Jr | A (optimal) |
| **Search** | Stream-aligned | 7 | Search | 3 | 6 | 2 Sr, 3 Mid, 1 Jr | B+ (optimal) |
| **Analytics** | Stream-aligned | 9 | Data | 5 | 8 | 2 Sr, 4 Mid, 2 Jr | B (slightly large) |
| **Integrations** | Stream-aligned | 6 | Platform | 4 | 5 | 1 Sr, 3 Mid, 1 Jr | B+ (optimal) |
| **Mobile** | Stream-aligned | 8 | Mobile | 3 | 7 | 2 Sr, 3 Mid, 2 Jr | B+ (optimal) |
| **API Gateway** | Stream-aligned | 5 | Infra | 2 | 4 | 2 Sr, 1 Mid, 1 Jr | A (optimal) |
| **CDN/Edge** | Stream-aligned | 4 | Infra | 3 | 3 | 1 Sr, 2 Mid | B+ (optimal) |
| **Developer Tools** | Stream-aligned | 6 | DevEx | 3 | 5 | 2 Sr, 2 Mid, 1 Jr | B+ (optimal) |
| **Security Ops** | Stream-aligned | 7 | Security | 3 | 6 | 3 Sr, 2 Mid, 1 Jr | B+ (optimal) |
| **Platform Infra** | Platform | 12 | Platform | 8 | 10 | 4 Sr, 4 Mid, 2 Jr | C+ (oversized) |
| **Data Platform** | Platform | 10 | Data | 6 | 8 | 3 Sr, 3 Mid, 2 Jr | B (slightly large) |
| **DevEx** | Enabling | 5 | DevEx | 2 | 4 | 2 Sr, 2 Mid | B+ (optimal) |
| **SRE** | Enabling | 6 | Infra | 2 | 5 | 3 Sr, 2 Mid | A- (optimal) |
| **ML Infrastructure** | Complicated-subsystem | 8 | AI/ML | 5 | 7 | 3 Sr, 3 Mid, 1 Jr | B+ (optimal) |
| **Video/Streaming** | Complicated-subsystem | 6 | Media | 3 | 5 | 2 Sr, 2 Mid, 1 Jr | B+ (optimal) |
| **Crypto/Security** | Complicated-subsystem | 5 | Security | 2 | 4 | 3 Sr, 1 Mid | A (optimal) |

### Cognitive load assessment

| Team | Services | Domains | DB schemas | Frontend surfaces | Languages/frameworks | Cognitive load | Risk |
|---|---|---|---|---|---|---|---|
| **YiVad Core** | 8 | 3 | 12 | 3 (web, desktop, mobile) | 4 (TS, Go, Rust, React) | 85 | **Overloaded** |
| **YiAi Agents** | 6 | 2 | 8 | 2 (web, API) | 3 (Python, TS, Go) | 78 | **Overloaded** |
| **YiWeb Frontend** | 5 | 2 | 6 | 2 (web, mobile web) | 3 (TS, React, CSS) | 72 | **Overloaded** |
| **Platform Infra** | 8 | 3 | 4 | 0 | 5 (Go, Terraform, Helm, Python, Shell) | 88 | **Overloaded** |
| **Data Platform** | 6 | 3 | 10 | 1 (dashboard) | 4 (Python, SQL, Go, Terraform) | 75 | **Overloaded** |
| **Analytics** | 5 | 2 | 8 | 1 (dashboard) | 3 (Python, SQL, TS) | 68 | High |
| **ML Infrastructure** | 5 | 2 | 3 | 0 | 3 (Python, Go, CUDA) | 65 | High |
| **Integrations** | 4 | 2 | 3 | 1 | 3 (Go, TS, Python) | 62 | Medium |
| **Security Ops** | 3 | 1 | 2 | 0 | 2 (Go, Python) | 45 | Optimal |
| **Auth & Identity** | 3 | 1 | 2 | 0 | 2 (Go, TS) | 42 | Optimal |
| **Payments** | 2 | 1 | 2 | 0 | 2 (Go, TS) | 38 | Optimal |
| **Notifications** | 2 | 1 | 1 | 0 | 2 (Go, TS) | 35 | Optimal |
| **API Gateway** | 2 | 1 | 1 | 0 | 1 (Go) | 28 | Underloaded |
| **CDN/Edge** | 3 | 1 | 0 | 0 | 2 (Go, Rust) | 32 | Optimal |
| **Crypto/Security** | 2 | 1 | 1 | 0 | 1 (Rust) | 25 | Underloaded |

### Cognitive load by dimension

| Team | Intrinsic (domain complexity) | Extraneous (tooling/task friction) | Germane (learning/problem-solving) | Total load | Target |
|---|---|---|---|---|---|
| **Platform Infra** | 35 | 28 | 25 | 88 | < 50 |
| **YiVad Core** | 32 | 25 | 28 | 85 | < 50 |
| **YiAi Agents** | 30 | 22 | 26 | 78 | < 50 |
| **Data Platform** | 28 | 22 | 25 | 75 | < 50 |
| **YiWeb Frontend** | 25 | 24 | 23 | 72 | < 50 |
| **Analytics** | 25 | 20 | 23 | 68 | < 50 |
| **ML Infrastructure** | 28 | 18 | 19 | 65 | < 50 |
| **Overall avg** | 22 | 18 | 22 | **62** | **< 50** |

### Interaction mode map

| From → To | YiVad | YiAi | YiWeb | Platform | Data | Auth | SRE | DevEx | ML Infra | Video | Security |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **YiVad** | — | Collab | Collab | XaaS | XaaS | XaaS | XaaS | Facil | Collab | Collab | XaaS |
| **YiAi** | Collab | — | Collab | XaaS | XaaS | XaaS | XaaS | Facil | Collab | — | XaaS |
| **YiWeb** | Collab | Collab | — | XaaS | XaaS | XaaS | XaaS | Facil | — | — | XaaS |
| **Platform** | XaaS | XaaS | XaaS | — | Collab | XaaS | Collab | Facil | XaaS | XaaS | XaaS |
| **Data** | XaaS | XaaS | XaaS | XaaS | — | — | XaaS | — | Collab | — | — |
| **Auth** | XaaS | XaaS | XaaS | XaaS | — | — | XaaS | — | — | — | Collab |
| **SRE** | Facil | Facil | Facil | Collab | Facil | Facil | — | Collab | Facil | Facil | Facil |
| **DevEx** | Facil | Facil | Facil | Facil | Facil | — | Collab | — | — | — | — |

### Broken interaction patterns

| Pattern | Teams involved | Symptom | Impact | Root cause | Fix |
|---|---|---|---|---|---|
| **Platform as bottleneck** | Platform → All stream-aligned | 8 teams waiting on Platform for infra changes, avg 5-day wait | 18% of sprint capacity blocked | Platform under-staffed for XaaS demand | Split Platform into 2 teams, increase XaaS maturity |
| **YiVad/YiAi overlap** | YiVad ↔ YiAi | Both teams modifying same agent orchestration code, 3 merge conflicts/week | 12% rework, duplicated effort | No clear ownership boundary for shared agent logic | Extract shared agent harness to ML Infra team |
| **SRE firefighting** | SRE → All | SRE spending 65% of time on ad-hoc requests, not enabling | SRE can't scale, teams don't learn | Facilitation mode not respected, teams treat SRE as ops | Formalize SRE engagement model, chargeback ad-hoc requests |
| **Data team dependency** | Analytics → Data Platform | Analytics blocked on Data Platform for every schema change, 3-week avg wait | Analytics velocity 40% below target | XaaS mode not mature, no self-service schema management | Self-service schema migration tooling |
| **Auth team isolation** | Auth ↔ Security | Auth and Security teams both implementing auth features without coordination | 2 conflicting MFA implementations | No defined interaction mode, both teams assume ownership | Clarify: Auth owns implementation, Security owns policy |

### Conway alignment assessment

| Domain | System boundary | Team boundary | Alignment | Gap | Action |
|---|---|---|---|---|---|
| **Collaboration (YiVad)** | 8 services, 1 bounded context | YiVad Core (18 ppl) | 75% | Team too large, 1 team owns 2 subdomains | Split into 2 stream-aligned teams |
| **AI/ML (YiAi)** | 6 services, 2 bounded contexts | YiAi Agents (15) + ML Infra (8) | 80% | Agent orchestration boundary unclear | Clarify agent harness ownership |
| **Portal (YiWeb)** | 5 services, 1 bounded context | YiWeb Frontend (14) | 85% | Team size, 1 subdomain could be separate | Consider splitting by user journey |
| **Desktop (YiPet)** | 4 services, 1 bounded context | YiPet Desktop (8) | 90% | Good alignment | Maintain |
| **Platform** | 8 services, 3 bounded contexts | Platform Infra (12) | 55% | 1 team owns 3 domains, severe mismatch | Split into 3 teams (Compute, Network, Storage) |
| **Data** | 6 services, 2 bounded contexts | Data Platform (10) + Analytics (9) | 65% | Analytics team also owns data pipeline | Split Analytics into pipeline + insights teams |
| **IAM** | 3 services, 1 bounded context | Auth (7) + Security Ops (7) | 75% | Auth features overlap with Security | Clarify: Auth implements, Security governs |
| **Edge/CDN** | 3 services, 1 bounded context | CDN/Edge (4) | 95% | Excellent alignment | Maintain |
| **Overall** | | | **72%** | | |

### Inverse Conway maneuvers (planned)

| Maneuver | Current state | Target state | Rationale | Timeline | Status |
|---|---|---|---|---|---|
| **Split YiVad Core** | 1 team of 18, 8 services | 2 teams: YiVad Core (collab) + YiVad Real-time (websocket/sync) | Reduce cognitive load, enable independent deploy | 2026-Q4 | Planning |
| **Split Platform Infra** | 1 team of 12, 8 services, 3 domains | 3 teams: Compute (K8s), Network (mesh/gateway), Storage (DB/cache) | Align team boundaries with domain boundaries | 2026-Q4 | Planning |
| **Create Developer Experience team** | DevEx is 1 team covering all developer tools | 2 teams: DevEx (CLI/CI) + Developer Portal (docs/discover) | Separate tooling from documentation/discovery | 2027-Q1 | Proposed |
| **Extract shared agent harness** | YiVad and YiAi both own agent orchestration | ML Infra owns agent harness as platform capability | Eliminate duplication, create clear XaaS boundary | 2026-Q3 | In progress |
| **Formalize SRE engagement** | SRE does ad-hoc firefighting for all teams | SRE operates as enabling team with defined engagement model | Enable teams to self-serve, reduce SRE burnout | 2026-Q4 | Proposed |

### Team autonomy scorecard

| Autonomy dimension | Full autonomy (5 teams) | High autonomy (8 teams) | Partial autonomy (6 teams) | Low autonomy (3 teams) | Target |
|---|---|---|---|---|---|
| **Deploy independently** | 5 (100%) | 7 (88%) | 3 (50%) | 0 (0%) | 80% |
| **Own roadmap** | 5 (100%) | 6 (75%) | 4 (67%) | 1 (33%) | 75% |
| **Choose tech stack** | 4 (80%) | 5 (63%) | 3 (50%) | 1 (33%) | 60% |
| **Own on-call** | 5 (100%) | 8 (100%) | 5 (83%) | 2 (67%) | 90% |
| **Self-service infra** | 3 (60%) | 5 (63%) | 2 (33%) | 0 (0%) | 70% |
| **No external approval** | 5 (100%) | 6 (75%) | 2 (33%) | 0 (0%) | 70% |
| **End-to-end ownership** | 5 (100%) | 7 (88%) | 4 (67%) | 1 (33%) | 80% |

### Dependency hotspots

| Hotspot team | Depended on by | Teams blocked | Avg wait time | Type of dependency | Resolution |
|---|---|---|---|---|---|
| **Platform Infra** | 15 teams | 8 (frequent) | 5.2 days | Infra provisioning, DB changes, K8s config | Split team, self-service tooling |
| **Data Platform** | 10 teams | 5 (frequent) | 3.5 days | Schema changes, pipeline creation, data access | Self-service schema migration |
| **Auth & Identity** | 18 teams | 3 (occasional) | 1.8 days | SSO config, permission changes, API key management | Self-service IAM portal |
| **SRE** | 20 teams | 6 (frequent) | 2.5 days | Incident response, monitoring setup, alert config | Enablement program, runbooks |

### Team evolution history

| Event | Date | Teams affected | Type | Trigger | Outcome |
|---|---|---|---|---|---|
| **YiVad/YiAi split** | 2026-03 | 2 teams created | Split | YiVad monolith too large (22 ppl) | Improved velocity, 15% fewer merge conflicts |
| **DevEx team creation** | 2026-01 | 1 team created | New team | Developer productivity survey at 52/100 | DX score improved to 68/100 |
| **Platform team consolidation** | 2025-09 | 3 teams → 1 | Merge | Overhead of 3 small platform teams coordinating | Reduced coordination overhead, but created bottleneck |
| **Mobile team spin-out** | 2025-06 | 1 team created | Split | Mobile growing too large within YiWeb | Faster mobile release cadence |
| **Security team creation** | 2025-03 | 1 team created | New team | SOC 2 compliance requirement | SOC 2 Type II achieved within 6 months |

### Team health correlation with topology

| Topology health | Teams | Avg velocity | Avg eNPS | Avg autonomy | Avg cognitive load | Incidents/quarter |
|---|---|---|---|---|---|---|
| **Optimal (score > 80)** | 7 | 42 pts/sprint | +35 | 85/100 | 38 | 2.5 |
| **Adequate (score 60-80)** | 10 | 35 pts/sprint | +22 | 68/100 | 55 | 4.2 |
| **Strained (score < 60)** | 5 | 22 pts/sprint | +8 | 45/100 | 78 | 8.5 |

## Action recommendations

1. **Split oversized teams**: 5 teams > 15 members; split YiVad Core (18→2 teams), YiAi Agents (15→2 teams), YiWeb Frontend (14→2 teams), Platform Infra (12→3 teams); target team size 5-9
2. **Cognitive load reduction for Platform**: Platform Infra at 88 (overloaded), 8 services, 3 domains; split into Compute, Network, and Storage teams; reduce cognitive load to < 50 per team
3. **Formalize unlabeled interactions**: 22% of team interactions are ad-hoc and unmanaged; label every team-to-team interaction as collaboration, X-as-a-service, or facilitating
4. **Platform X-as-a-service maturity**: Platform is bottleneck for 15 teams, 5-day avg wait; invest in self-service APIs, documentation, and SLAs for Platform services
5. **Fix broken interaction patterns**: 5 broken patterns causing 18% capacity block; resolve Platform bottleneck, YiVad/YiAi overlap, SRE firefighting, Data dependency, Auth/Security coordination
6. **Conway violation resolution**: 6 Conway violations where team boundaries don't match system boundaries; realign based on Inverse Conway maneuvers plan
7. **SRE enabling model**: SRE spending 65% time on ad-hoc requests; formalize engagement model, implement enabling rotation, create self-service runbooks
8. **Team autonomy improvement**: 3 teams at low autonomy, 18% of deploys blocked; implement self-service infrastructure, remove external approval gates, enable independent deploys
9. **Dependency hotspot elimination**: 4 dependency hotspots (Platform, Data, Auth, SRE); invest in self-service tooling, API maturity, and documentation for each hotspot
10. **Quarterly topology review**: review team structure, cognitive load, interaction modes, Conway alignment, team autonomy, and org evolution with engineering leadership and executive team



- The reorg as a solution → "we'll just reorg the teams and the problems will go away"; reorgs are expensive, disruptive, and rarely fix the underlying problem — they just rearrange the org chart; topology changes should be driven by system architecture changes, not the other way around
- The full-stack fantasy → expecting every team to be "full-stack" owning their own infrastructure, database, frontend, and operations; this maximizes cognitive load and minimizes expertise — teams should own a domain, not a tech stack
- Platform as a dumping ground → putting everything that doesn't fit in a stream-aligned team into "platform"; a platform team without a clear product mindset becomes a bottleneck, not an enabler
- Team topology as a static org chart → defining teams once and never revisiting; as the system evolves, teams must evolve — a team structure that was optimal 2 years ago is almost certainly suboptimal today
- Interaction mode ambiguity → "we'll figure out how to work together as we go"; undefined interaction modes create invisible bottlenecks, duplicated work, and coordination overhead that compounds over time

## Related

- Same class: [dashboard-engineering-capacity](dashboard-engineering-capacity.md) — engineering capacity
- Same class: [dashboard-talent-retention](dashboard-talent-retention.md) — talent retention
- Same class: [dashboard-team-health-engagement](../../engineer/process/dashboard-team-health-engagement.md) — team health and engagement
- Same class: [apply-team-topologies](../../engineer/architecture-design/apply-team-topologies.md) — team topologies guide
- Same class: [apply-domain-driven-design](../../engineer/architecture-design/apply-domain-driven-design.md) — domain-driven design
- References: Matthew Skelton, Manuel Pais — *Team Topologies*; Melvin Conway — *How Do Committees Invent?*; Ruth Malan — *Conway's Law and Sociotechnical Systems*; John Cutler — *Team Cognitive Load*; ThoughtWorks — *Team Topologies in Practice*; Daniel Pink — *Drive: The Surprising Truth About What Motivates Us*