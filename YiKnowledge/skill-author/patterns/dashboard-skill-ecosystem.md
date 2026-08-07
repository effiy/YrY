---
title: skill ecosystem dashboard
aliases:
- skill authoring dashboard
- Claude Code skill dashboard
- skill quality dashboard
- skill family dashboard
tags:
- dashboard
- skill
- skill-author
- claude-code
- yry-skill
- patterns
category: skill-author/patterns
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: dashboard
status: stable
lifecycle: active
review_cycle: monthly
roles:
- skill-author
- engineer
- tech-lead
benefit: skill ecosystem health and quality visible at a glance
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"
related:
- ./yry-skill-family.md
- ../../engineer/engineering/dashboard-developer-experience.md
- ../../knowledge-curator/governance/dashboard-knowledge-health.md
tacit: false
---

# skill ecosystem dashboard

> **As a** skill author, **I want to** track the health, quality, and adoption of the YrY skill ecosystem, **so that** skills remain reliable, discoverable, and consistently effective for the teams that depend on them.

> Skills are the executable knowledge layer of YrY. This dashboard tracks skill inventory, quality, adoption, family coherence, and maintenance across the entire skill ecosystem.

## Summary

- 5 skill dimensions: skill inventory, quality & reliability, adoption & usage, family coherence, maintenance health
- Skills tracked by type: init (project scaffolding), workflow (multi-step automation), knowledge (context injection), tool (single-purpose utility)
- Quality measured by acceptance criteria compliance, error rate, user satisfaction, and documentation completeness
- Family coherence ensures skills within a family share conventions, patterns, and interaction contracts
- Dashboard reviewed monthly; skill ecosystem audit quarterly

## Core viewpoints

- Skills are software — they have users, bugs, versions, and maintenance burden; treat them like any other production artifact
- Family coherence beats individual brilliance — 10 consistent skills in a family are more valuable than 20 brilliant but inconsistent ones
- Adoption is the truth metric — a skill with 100% quality score but 0 users is a failure; a skill with 80% quality and daily use is a success
- Skill rot is real — every framework update, API change, or team restructure silently breaks skills; proactive maintenance is required

## Key information

### 5-panel skill ecosystem overview

```
┌──────────────────────────────────────────────────────────────────┐
│  SKILL INVENTORY                 │  QUALITY & RELIABILITY           │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Total:      28 skills  │   │  │  Quality:    82% ████   │   │
│  │  Init:        5 (18%)   │   │  │  Acceptance: 88% ████   │   │
│  │  Workflow:   12 (43%)   │   │  │  Error rate:  2.1%       │   │
│  │  Knowledge:   8 (29%)   │   │  │  Satisfaction: 4.1/5     │   │
│  │  Tool:        3 (11%)   │   │  │  Doc complete: 78% ███▌  │   │
│  │  Families:    6         │   │  │  Tested:      65% ███    │   │
│  │  Orphaned:    2         │   │  │  Drift:        3 skills  │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  ADOPTION & USAGE                │  FAMILY COHERENCE               │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Active users: 85% of eng│  │  │  Coherence:   78% ███▌   │   │
│  │  Daily invokes: 120/day  │   │  │  Convention:  85% ████   │   │
│  │  Top skill:   yry-init   │   │  │  Contract:    72% ███▌   │   │
│  │  Abandoned:   2 skills   │   │  │  Cross-ref:   80% ████   │   │
│  │  Discovery:   72% found  │   │  │  Naming:      88% ████   │   │
│  │  Onboarding:  85% use    │   │  │  Pattern reuse: 75% ███▌ │   │
│  │  Power users: 22% of eng │   │  │  Fragment:     2 skills  │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Skill inventory

| Skill | Family | Type | Version | Author | Users | Invokes/day | Status |
|---|---|---|---|---|---|---|---|
| yry-init | init | init | v2.3 | Tech Lead | 36 | 25 | Active |
| yry-init/rule | init | knowledge | v1.5 | Tech Lead | 36 | 30 | Active |
| yry-skill-family | patterns | knowledge | v1.0 | Skill Author | 5 | 3 | Active |
| yry-knowledge | knowledge | workflow | v1.8 | Knowledge Curator | 28 | 15 | Active |
| yry-knowledge/seed | knowledge | tool | v1.2 | Knowledge Curator | 12 | 5 | Active |
| yry-code-review | workflow | workflow | v2.1 | Engineer | 32 | 18 | Active |
| yry-code-review/diff | workflow | tool | v1.6 | Engineer | 32 | 22 | Active |
| yry-deploy | workflow | workflow | v1.4 | SRE | 15 | 8 | Active |
| yry-deploy/canary | workflow | tool | v1.1 | SRE | 8 | 3 | Active |
| yry-incident | workflow | workflow | v1.3 | SRE | 10 | 2 | Active |
| yry-incident/postmortem | workflow | knowledge | v1.0 | SRE | 8 | 1 | Active |
| yry-bug | workflow | workflow | v1.7 | Engineer | 25 | 12 | Active |
| yry-bug/triage | workflow | tool | v1.2 | Engineer | 15 | 5 | Active |
| yry-onboarding | workflow | workflow | v1.5 | New Hire | 8 | 4 | Active |
| yry-onboarding/checklist | workflow | knowledge | v1.1 | New Hire | 6 | 2 | Active |
| yry-release | workflow | workflow | v1.2 | SRE | 10 | 3 | Active |
| yry-release/notes | workflow | knowledge | v1.0 | SRE | 8 | 2 | Active |
| yry-architecture | workflow | workflow | v1.4 | Tech Lead | 12 | 5 | Active |
| yry-architecture/adr | workflow | knowledge | v1.2 | Tech Lead | 10 | 3 | Active |
| yry-test | workflow | workflow | v1.3 | Engineer | 20 | 8 | Active |
| yry-test/gen | workflow | tool | v1.0 | Engineer | 15 | 6 | Active |
| yry-brd | init | init | v1.6 | PM | 8 | 4 | Active |
| yry-brd/template | init | knowledge | v1.1 | PM | 8 | 5 | Active |
| yry-dashboard | init | init | v1.0 | PM | 3 | 1 | Active |
| yry-deprecated-old-init | init | init | v0.8 | — | 2 | 0.5 | **Orphaned** |
| yry-experimental-ai | workflow | workflow | v0.5 | — | 1 | 0.2 | **Orphaned** |
| yry-prd | init | init | v1.4 | PM | 6 | 3 | Active |
| yry-prd/review | workflow | knowledge | v1.0 | PM | 4 | 1 | Active |

### Skill quality audit

| Skill | Acceptance | Error rate | Satisfaction | Doc | Tested | Drift | Quality score |
|---|---|---|---|---|---|---|---|
| yry-init | 95% | 0.5% | 4.5/5 | 90% | Yes | No | 92% |
| yry-init/rule | 90% | 0.2% | 4.3/5 | 85% | Yes | No | 90% |
| yry-knowledge | 88% | 1.5% | 4.2/5 | 80% | Yes | No | 86% |
| yry-code-review | 92% | 2.0% | 4.4/5 | 85% | Yes | No | 89% |
| yry-code-review/diff | 90% | 2.5% | 4.0/5 | 75% | No | Minor | 78% |
| yry-deploy | 85% | 3.0% | 3.8/5 | 70% | No | Minor | 75% |
| yry-incident | 88% | 1.0% | 4.5/5 | 85% | Yes | No | 88% |
| yry-bug | 90% | 1.8% | 4.2/5 | 82% | Yes | No | 87% |
| yry-onboarding | 85% | 2.0% | 4.0/5 | 78% | No | No | 80% |
| yry-release | 82% | 4.5% | 3.5/5 | 65% | No | Yes | 68% |
| yry-architecture | 88% | 1.2% | 4.3/5 | 85% | Yes | No | 87% |
| yry-test | 86% | 2.8% | 3.8/5 | 72% | No | No | 76% |
| yry-brd | 90% | 1.0% | 4.2/5 | 88% | Yes | No | 88% |
| yry-dashboard | 75% | 8.0% | 3.0/5 | 55% | No | Yes | 62% |
| yry-deprecated-old-init | 40% | 15.0% | 2.0/5 | 30% | No | Yes | 35% |
| yry-experimental-ai | 50% | 12.0% | 2.5/5 | 40% | No | Yes | 42% |
| **Overall** | **88%** | **2.1%** | **4.1/5** | **78%** | **65%** | **3 skills** | **82%** |

### Skill error analysis (last 30 days)

| Error type | Count | % of errors | Top skill affected | Root cause |
|---|---|---|---|---|
| Context overflow | 28 | 42% | yry-code-review/diff | Diff too large, no chunking |
| Outdated reference | 15 | 22% | yry-deploy | K8s API version mismatch |
| Missing dependency | 10 | 15% | yry-dashboard | Template not found |
| Permission denied | 6 | 9% | yry-deploy | RBAC change not reflected |
| Invalid state | 5 | 7% | yry-release | Branch state mismatch |
| Other | 3 | 5% | Various | |

### Family coherence assessment

| Family | Skills | Convention adherence | Contract clarity | Cross-referencing | Naming consistency | Overall |
|---|---|---|---|---|---|---|
| init | 5 | 90% | 85% | 88% | 92% | 89% |
| knowledge | 3 | 85% | 70% | 82% | 88% | 81% |
| code-review | 2 | 88% | 80% | 85% | 90% | 86% |
| deploy | 2 | 80% | 65% | 75% | 85% | 76% |
| incident | 2 | 85% | 75% | 78% | 88% | 82% |
| bug | 2 | 88% | 78% | 82% | 90% | 85% |
| onboarding | 2 | 82% | 68% | 75% | 85% | 78% |
| release | 2 | 80% | 62% | 72% | 82% | 74% |
| architecture | 2 | 86% | 72% | 80% | 88% | 82% |
| test | 2 | 82% | 68% | 78% | 85% | 78% |
| brd | 2 | 88% | 75% | 82% | 90% | 84% |
| **Overall** | **2.3 avg** | **85%** | **72%** | **80%** | **88%** | **78%** |

### Family interaction contract — deploy family example

| Contract element | deploy | deploy/canary | Compliant? |
|---|---|---|---|
| Shared config schema | v1.2 | v1.2 | Yes |
| Error code convention | DEP-XXX | DEP-XXX | Yes |
| Output format (JSON) | Yes | Yes | Yes |
| Dry-run mode | Yes | No | **Missing** |
| Rollback hook | Yes | No | **Missing** |
| Notification channel | #deploy-notify | #deploy-notify | Yes |
| Log level consistency | INFO | DEBUG | **Drift** |

### Adoption funnel

| Stage | Engineers | % of 36 |
|---|---|---|
| Aware (know skill exists) | 34 | 94% |
| Tried (used at least once) | 32 | 89% |
| Regular (weekly use) | 28 | 78% |
| Power (daily use, contributes feedback) | 8 | 22% |
| Author (creates/maintains skills) | 5 | 14% |

### Skill discovery effectiveness

| Discovery channel | % found | Satisfaction |
|---|---|---|
| yry-init auto-suggest | 45% | 4.3/5 |
| Team onboarding | 25% | 4.0/5 |
| Peer recommendation | 15% | 4.5/5 |
| Skill index/search | 10% | 2.8/5 |
| Accidentally discovered | 5% | 3.0/5 |

### Maintenance backlog

| Skill | Issue | Priority | Effort | Age |
|---|---|---|---|---|
| yry-deploy | K8s API v1.29 migration | High | 3 days | 22 days |
| yry-release | Branch state race condition | High | 2 days | 15 days |
| yry-dashboard | Template path resolution broken | High | 1 day | 8 days |
| yry-code-review/diff | Add chunking for large diffs | Medium | 3 days | 18 days |
| yry-test | Add mutation testing support | Medium | 2 days | 12 days |
| yry-deploy/canary | Add dry-run mode | Medium | 1 day | 10 days |
| yry-onboarding/checklist | Update for new hire 30/60/90 | Low | 0.5 day | 5 days |
| yry-knowledge/seed | Add YiPet knowledge seeding | Low | 1 day | 3 days |

## Action recommendations

1. **Deprecate orphaned skills**: yry-deprecated-old-init (35% quality) and yry-experimental-ai (42%); archive or delete within 2 weeks
2. **Fix yry-dashboard quality**: 62% quality, 8% error rate, 55% docs; fix template path, add acceptance tests, write docs
3. **Stabilize yry-release**: 68% quality, 4.5% error rate; fix branch state race condition, add dry-run mode
4. **Improve family contracts**: 72% contract clarity; define mandatory contract elements for every family (config schema, error codes, output format)
5. **Reduce deploy family fragmentation**: 76% coherence; align log levels, add dry-run and rollback hooks to deploy/canary
6. **Improve skill discovery**: 10% find via index/search at 2.8/5 satisfaction; redesign skill index with use-case-based search
7. **Increase test coverage**: 65% tested; add automated tests for deploy, release, onboarding, and test skill families
8. **Address context overflow errors**: 42% of all errors; add chunking to code-review/diff, add context budget checks
9. **Grow author pool**: 14% of engineers are authors; create skill author mentorship program, target 25%
10. **Monthly skill quality review**: review error rates, satisfaction, and drift; rotate maintenance ownership



- Skill sprawl → creating a new skill for every tiny variation instead of parameterizing existing skills; one skill, many modes
- Abandoned skills → "I'll maintain it later" becomes "nobody knows how this works"; every skill needs an owner and a deprecation plan
- Inconsistent families → sibling skills with different conventions, config formats, and error handling; families must share contracts
- Skill as black box → users invoking skills without understanding what they do; every skill should explain its reasoning in output
- Versionless skills → changing skill behavior without versioning; breaking changes must be versioned and communicated

## Related

- Same class: [yry-skill-family](yry-skill-family.md) — skill family conventions
- Same class: [dashboard-developer-experience](../../engineer/engineering/dashboard-developer-experience.md) — DX metrics
- Same class: [dashboard-knowledge-health](../../knowledge-curator/governance/dashboard-knowledge-health.md) — knowledge governance
- References: Anthropic — *Claude Code Skills Documentation*; Google — *Software Engineering at Google* (Chapter 17: Build Tools); Team Topologies — *Platform as a Product*