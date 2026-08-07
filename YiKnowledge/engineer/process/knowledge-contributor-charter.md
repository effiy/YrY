---
title: Knowledge Contributor Charter / Knowledge Contributor Charter
aliases:
- knowledge-contributor-charter
- knowledge-roles
tags:
- process
- knowledge base
- role
- charter
- operations
- owner
category: engineer/process
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: "internal + reference <knowledge base catalog design: 90% of companies get the first step wrong>"
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles:
- engineer
benefit: process followed predictably
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./knowledge-review.md
- ./knowledge-deprecation-policy.md
- ../../knowledge-curator/governance/governance.md
- ../../MEMORY.md
tacit: false
---

# Knowledge Contributor Charter / Knowledge Contributor Charter

> **As an** engineer, **I want to** knowledge contributor charter, **so that** process followed predictably. 

> Landing operations process diagram (the fourth of 4 diagrams) — 4-role responsibility charter. 

## Summary

- 4 roles: Owner (strategy direction + cross-category coordination + final decision) / Operations (content review + frontmatter maintenance + reachability analysis) / Knowledge Steward (accuracy and timeliness of this leaf) / Knowledge Contributor (writes documentation + gives feedback). 
- Time investment: Owner 1h per week / Operations 4h per week / Steward 2h per month / Contributor ad hoc. 
- Assessment: Owner looks at overall kb health (coverage / activity / dead-link rate) / Operations looks at weekly review completion rate + frontmatter completeness / Steward looks at quarterly rotation review completion rate / Contributor looks at monthly submission count + sedimentation rate. 
- Owner responsibilities: draft and revise MEMORY.md, cross-category coordination, annual planning and budget, final decision, select annual high-value sedimentation. 
- Operations responsibilities: weekly clean Inbox + frontmatter inspection + link reachability; monthly push triage + external content timeliness + content governance day + data retrospective; maintain review-log. 
- Knowledge Steward responsibilities: quarterly rotation review (active / needs update / deprecated), new content review, cross-leaf collaboration related:; reassign each quarter to avoid single point. 
- Reward mechanism: quarterly + annual selection of high-value sedimentation (frontmatter `featured: true`), honor marks take priority over material rewards. 

## Core viewpoints

- **The "everyone contributes" model fails not because people are unwilling, but because contribution is an unfunded mandate.** When knowledge contribution is an implicit expectation with no allocated time, no visible reward, and no accountability, it will always lose to explicit expectations like sprint deadlines and oncall rotations. The 4-role charter succeeds because it makes contribution legible: each role has a time budget, a specific responsibility, and a measurable assessment criterion.

- **The Knowledge Steward role is the keystone of the entire system.** Without stewards, the knowledge base is a commons that everyone uses and no one maintains. The steward is the person who feels the pain when a file goes stale, because their name is on it. The quarterly rotation prevents both burnout and single-point-of-failure, but the steward's existence is what converts the knowledge base from a write-only archive into a maintained asset.

- **Operations is the most underappreciated role, and the most likely to burn out.** The 4h/week estimate for operations is a baseline that assumes everything is working. When a backlog of un-reviewed content accumulates, or a major directory restructuring happens, the operations role becomes a full-time job. The Owner must actively monitor operations workload and either reduce scope or increase support -- an overwhelmed operations person is the canary in the knowledge base coal mine.

- **Honor-driven rewards work in knowledge systems where material rewards fail, because the output is public and the attribution is permanent.** A bonus is spent and forgotten; a `featured: true` tag on a file that is referenced by every new hire for years is a permanent signal of value. The honor system works because the knowledge base is inherently a public good within the organization -- contributions are visible to everyone, and the attribution survives long after the contributor has moved on.

- **The 4-role charter is not a static org chart -- it is a dynamic system that must be rebalanced as the knowledge base grows.** When the knowledge base has 50 files, a single operations person can handle it. When it has 500 files, the operations role needs tooling (automated stale detection, dead-link scanners) and the steward role needs to be subdivided. The charter must be reviewed annually not just for compliance, but for whether the role definitions still match the scale of the system. 


- Do not rely on "everyone's self-awareness" — people are utility-driven; without clear role, cadence, and feedback, knowledge contribution stays a slogan. 
- Replace "everyone's self-awareness" with "knowledge steward + periodic review" — every high-read file has a steward confirming its state. 
- Replace "fill content by feel" with "search-data-driven content supplementation" — data-driven reaches real blind spots. 
- Operations cannot fight alone — Owner must participate in strategy decisions; cannot let operations decide direction alone. 
- Honor marks take priority over material rewards — the key is honor, not money. 

## Key information

### 4-role responsibilities

| Role | Who | Responsibilities | Time investment | Assessment |
|---|---|---|---|---|
| **Owner** | ruiyi | strategy direction, cross-category coordination, final decision | 1h/week | overall kb health (coverage / activity / dead-link rate) |
| **Operations** | ruiyi part-time | content review, frontmatter maintenance, search/link reachability analysis | 4h/week | weekly review completion rate, frontmatter completeness |
| **Knowledge Steward** | each leaf's high-frequency contributor | accuracy and timeliness of this leaf's documentation | 2h/month | quarterly rotation review completion rate |
| **Knowledge Contributor** | everyone (future team members) | write documentation, give feedback | ad hoc | monthly submission count + sedimentation rate |

### Owner responsibilities

- Draft and revise the [MEMORY.md](../../MEMORY.md) rules manual
- Cross-category coordination (e.g. aligning `journeys/` entry with semantic leaves) 
- Annual planning and budget (e.g. introducing new tools) 
- Final decision (e.g. architecture adjustments, archive cleanup) 
- Select annual high-value sedimentation

### Operations responsibilities

- Weekly clean [lifecycle/inbox.md](../../knowledge-curator/governance/inbox.md) (see [knowledge-review-process.md](./knowledge-review.md) W1) 
- Weekly scan frontmatter completeness (W2) 
- Weekly scan link reachability (W3) 
- Monthly push triage summary (M1) 
- Monthly scan external content timeliness (M2) 
- Monthly content governance day (M3) 
- Monthly data retrospective (M4) 
- Maintain [lifecycle/review-log.md](../../knowledge-curator/governance/review-log.md)

### Knowledge Steward responsibilities

- Quarterly rotation review: confirm `active / needs update / deprecated` for high-read files in this leaf
- New content review: content accuracy of new files in this leaf
- Cross-leaf collaboration: coordinate `related:` with neighbor leaf stewards

### Steward rotation

- Reassign stewards each quarter (avoid single point) 
- Immediate handover on resignation / transfer

### Knowledge Contributor responsibilities

- Write documentation: add gotcha within 24h of a pitfall, write retrospective after project delivery
- Give feedback: report dead links / outdated content / missing content
- Tacit knowledge participation: respond to [tacit backlog](../../knowledge-curator/governance/tacit-knowledge-backlog.md) interview invitations

### Core ideas (from the reference article) 

> Do not rely on "everyone's self-awareness". People are utility-driven; without clear role, cadence, and feedback, knowledge contribution stays a slogan. 
>
> Replace "everyone's self-awareness" with "knowledge steward + periodic review"; replace "fill content by feel" with "search-data-driven content supplementation". 

### Reward mechanism

- Quarterly: select "quarterly high-value sedimentation" (frontmatter `featured: true`) 
- Annual: select "annual high-value sedimentation", highlighted in [INDEX.md](../../INDEX.md)
- Honor marks take priority over material rewards (key is honor) 

### Applicable scenarios

- Landing the knowledge base operations mechanism
- Defining 4-role division and assessment
- Quarterly + annual selection of high-value sedimentation
- Steward rotation to avoid single point

## Action recommendations

1. Clear 4-role division: write down who + responsibilities + time investment + assessment, four pieces
2. Owner: 1h/week on strategy direction + cross-category coordination + final decision
3. Operations: 4h/week on content review + frontmatter maintenance + reachability analysis
4. Knowledge Steward: 2h/month on accuracy and timeliness of this leaf
5. Knowledge Contributor: ad hoc writing of documentation + giving feedback
6. Reassign stewards each quarter to avoid single point; immediate handover on resignation / transfer
7. Quarterly + annual selection of high-value sedimentation; frontmatter `featured: true`
8. Honor marks take priority over material rewards; key is honor



- "Hope everyone contributes actively" — saying it equals not saying it; should specify role + cadence + assessment
- "Fill content by feel" — should use search logs / dead-link stats / feedback data to drive
- Operations fighting alone — Owner must participate in strategy decisions; cannot let operations decide direction alone
- Steward unchanged for long periods — single-point risk; reassign each quarter
- Material rewards first — honor marks first; key is honor

## Anti-patterns

- **Assigning the operations role to the most junior team member as a "learning opportunity."** Operations is a role that requires judgment about content quality, architectural decisions about directory structure, and diplomatic skills to chase stewards for reviews. Delegating it to a junior member who lacks the organizational authority to say "this file is wrong, please fix it" guarantees that the review process becomes a rubber stamp.

- **Measuring knowledge base health by file count.** A knowledge base with 500 files of which 200 are stale, 50 are duplicates, and 30 have dead links is less healthy than a knowledge base with 100 files that are all accurate and maintained. File count is a vanity metric for knowledge bases -- the real metrics are coverage (are the right topics covered?), freshness (are the files current?), and reachability (can people find what they need in 2 hops?).

- **Treating the steward rotation as an administrative formality rather than a knowledge transfer event.** When a steward rotates out, their knowledge of which files are fragile, which links are tenuous, and which sections need updating must be transferred to the incoming steward. A rotation that consists of changing a name in the roster without a handover conversation is a knowledge loss event disguised as a governance practice.

- **Using "honor marks" as a substitute for allocating real time to knowledge work.** A `featured: true` tag on a quarterly winner's file is meaningful, but if the winner had to write that file on weekends because their sprint schedule had no room for knowledge work, the honor is compensation for exploitation, not recognition for contribution. The charter must include a time budget, and the time budget must be respected in sprint planning.

- **Allowing the Owner role to become a title without action.** When the Owner stops reviewing the MEMORY.md, attending governance reviews, and making final decisions on architecture changes, the entire 4-role system drifts. The Owner is the final accountability point -- if the Owner is absent, the system has no one to resolve disputes, approve structural changes, or protect the operations budget. The Owner's 1h/week is the minimum; if it cannot be met, the role must be reassigned.

## Related

- Same class: [knowledge base cadence review SOP](./knowledge-review.md), [knowledge base deprecation strategy](./knowledge-deprecation-policy.md)
- Upstream: [lifecycle/governance.md](../../knowledge-curator/governance/governance.md) (the third of 4 diagrams) 
- Downstream: [MEMORY.md](../../MEMORY.md) (rules manual), [lifecycle/review-log.md](../../knowledge-curator/governance/review-log.md) (operations maintain), [lifecycle/inbox.md](../../knowledge-curator/governance/inbox.md) (operations clean), [lifecycle/tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) (contributors respond to interviews), [INDEX.md](../../INDEX.md) (annual highlights) 
