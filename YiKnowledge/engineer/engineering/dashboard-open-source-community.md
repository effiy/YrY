---
title: open source and community health dashboard
aliases:
- open source dashboard
- OSS health dashboard
- community health dashboard
- developer community dashboard
- GitHub health dashboard
- open source program dashboard
tags:
- dashboard
- open-source
- community
- github
- contributors
- maintainer
- developer-relations
- OSPO
category: engineer/engineering
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: dashboard
status: stable
lifecycle: active
review_cycle: weekly
roles:
- engineer
- tech-lead
- executive
benefit: open source project health, community growth, contributor experience, and OSS impact visible at a glance
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
- project health, contributor community, issue/PR metrics, maintainer health, OSS impact, and license compliance defined
related:
- ./dashboard-developer-experience.md
- ./dashboard-platform-engineering.md
- ../infrastructure/dashboard-dora-metrics.md
- ../quality-security/dashboard-dependency-management.md
- ../quality-security/dashboard-security-posture.md
tacit: false
---

# open source and community health dashboard

> **As an** engineer, **I want to** track open source and community health, **so that** every OSS project is healthy, every contributor is welcomed, every dependency decision is informed, and open source engagement is a measured, strategic, and continuously improving practice — not a "we threw it on GitHub and hope someone uses it" afterthought.

> Open source is the backbone of modern software. This dashboard tracks project health, contributor community, issue/PR metrics, maintainer health, OSS impact, and license compliance — turning open source engagement from a side project into a strategic, measured, and continuously improving engineering discipline.

## Summary

- 6 open source dimensions: project health, contributor community, issue/PR metrics, maintainer health, OSS impact, license compliance
- 28 open source projects; 15 maintained by the company; 8 contributed to; 5 forked; 1,850 GitHub stars across all repos; 285 contributors; 12 core maintainers
- Project health: 68% of projects have recent commits (< 30 days); 22% have no commits in 6 months; 8 projects with > 50 open issues; avg release cadence: 45 days
- Contributor community: 285 total contributors; 42% external (non-employee); 12 core maintainers; 28 first-time contributors/month; 35% contributor retention (return contributors)
- Issue/PR metrics: 850 open issues across all repos; avg issue response time 3.5 days (target < 2); avg PR review time 4.2 days (target < 2); 18% of PRs from external contributors
- Dashboard reviewed monthly; OSS program review with engineering leadership quarterly

## Core viewpoints

- Stars are vanity, contributors are sanity — a project with 10,000 stars and 2 maintainers is a burnout time bomb; a project with 500 stars and 25 active contributors is a sustainable community; the metric that matters is not attention, it's participation
- The first contribution experience is the most important 48 hours in a contributor's journey — if a first-time contributor's PR sits unreviewed for 5 days, there's a 60% chance they never contribute again; the 35% contributor retention rate is a direct reflection of the contributor experience
- Abandoned open source projects are a liability, not an asset — 22% of projects with no commits in 6 months are still listed as "active" on the website; unmaintained OSS projects accumulate security vulnerabilities, create dependency confusion, and damage the company's reputation as a reliable OSS steward
- Internal consumption of external OSS is an invisible dependency — the company depends on 850+ open source packages; 8% of those are unmaintained, 5% have known vulnerabilities, and 12% have no clear license — every one of those is a supply chain risk that's sitting in the dependency tree

## Key information

### 6-panel OSS overview

```
┌──────────────────────────────────────────────────────────────────┐
│  PROJECT HEALTH                        │  CONTRIBUTOR COMMUNITY                  │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Projects: 28 total      │   │  │  Contributors: 285 total  │   │
│  │  Active (< 30d): 68%     │   │  │  External: 42% (120)      │   │
│  │  Stale (6mo): 22%        │   │  │  Internal: 58% (165)      │   │
│  │  Dead (> 12mo): 5%       │   │  │  Core maintainers: 12     │   │
│  │  Avg release: 45 days    │   │  │  First-time/mo: 28        │   │
│  │  > 50 open issues: 8     │   │  │  Retention rate: 35%      │   │
│  │  projects                │   │  │  (return contributors)    │   │
│  │  Project score: B- (72)  │   │  │  Community score: C+(68) │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  ISSUE & PR METRICS                    │  MAINTAINER HEALTH                     │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Open issues: 850        │   │  │  Core maintainers: 12    │   │
│  │  Avg issue response:     │   │  │  Bus factor < 2: 8       │   │
│  │  3.5 days (target < 2)   │   │  │  projects (critical)     │   │
│  │  Avg PR review: 4.2 days │   │  │  Maintainer burnout: 3   │   │
│  │  External PRs: 18%        │   │  │  (at risk)               │   │
│  │  Stale issues (> 90d):   │   │  │  Avg issues/maintainer:  │   │
│  │  28%                     │   │  │  71 (target < 50)        │   │
│  │  Issue score: C+ (68)    │   │  │  Maintainer score: C(65) │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  OSS IMPACT                            │  LICENSE & COMPLIANCE                   │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Total stars: 1,850      │   │  │  Licensed projects: 92%  │   │
│  │  Total forks: 420        │   │  │  License compliance: 85% │   │
│  │  External dependents:    │   │  │  CLA/DCO: 62% of repos   │   │
│  │  285 projects             │   │  │  Security policy: 48%    │   │
│  │  Downloads: 2.5M/mo      │   │  │  Dependency audit: 55%   │   │
│  │  Adoption in top 100: 8% │   │  │  Internal OSS usage: 850 │   │
│  │  Impact score: B- (72)   │   │  │  packages                │   │
│  │                           │   │  │  Compliance score: C+(68)│   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Project health by repository

| Repository | Stars | Forks | Last commit | Release cadence | Open issues | Open PRs | Contributors | Maintainers | Health |
|---|---|---|---|---|---|---|---|---|---|
| **yi-knowledge** | 520 | 85 | 2 days ago | 7 days | 28 | 5 | 22 | 3 | A- (88) |
| **yi-agent-sdk** | 380 | 72 | 5 days ago | 14 days | 35 | 8 | 18 | 2 | B+ (82) |
| **yi-rag-engine** | 285 | 48 | 12 days ago | 30 days | 42 | 6 | 15 | 2 | B (78) |
| **yi-cli-tools** | 210 | 35 | 3 days ago | 14 days | 18 | 3 | 12 | 2 | A- (88) |
| **yi-model-eval** | 175 | 42 | 28 days ago | 45 days | 25 | 4 | 14 | 2 | B- (72) |
| **yi-data-pipeline** | 120 | 28 | 45 days ago | 60 days | 32 | 7 | 10 | 1 | C+ (65) |
| **yi-ui-components** | 95 | 22 | 8 days ago | 21 days | 15 | 2 | 8 | 2 | B+ (82) |
| **yi-api-gateway** | 65 | 18 | 90 days ago | 90 days | 22 | 5 | 6 | 1 | C (62) |
| **8 stale projects** (6+ months) | 180 | 55 | 180+ days | None | 185 | 35 | 15 | 0 | D (45) |
| **5 external contributed** | 420 | 95 | N/A | N/A | N/A | N/A | 28 | N/A | N/A |
| **Overall** | **1,850** | **420** | | **45 days avg** | **850** | **128** | **285** | **12** | **B- (72)** |

### Contributor community analysis

| Contributor segment | Count | % of total | Contributions/mo | Avg PRs/contributor | Retention rate | Top motivation | Top barrier |
|---|---|---|---|---|---|---|---|
| **Core maintainers** (employees) | 12 | 4% | 85 | 7.1 | 95% | Job responsibility | Workload, burnout (3 at risk) |
| **Regular internal** (employees) | 42 | 15% | 125 | 3.0 | 85% | Feature needs, internal tools | Competing priorities |
| **Casual internal** (employees) | 111 | 39% | 85 | 0.8 | 45% | Bug fixes, documentation | Time, unclear contribution path |
| **Regular external** (community) | 28 | 10% | 95 | 3.4 | 68% | Use the project, build reputation | Slow PR review, unresponsive maintainers |
| **Casual external** (community) | 72 | 25% | 65 | 0.9 | 22% | Bug fix, feature request | Slow review, steep learning curve |
| **First-time** (this month) | 28 | 10% | 28 | 1.0 | N/A | Documentation, good first issues | Unclear CONTRIBUTING.md, slow response |
| **Overall** | **285** | **100%** | **483** | **1.7** | **35%** | | |

### Issue and PR health

| Metric | Current | Target | Benchmark (healthy OSS) | Issue | Action |
|---|---|---|---|---|---|
| **Open issues** | 850 | < 500 | < 200 | 185 issues on stale/dead projects | Triage, close stale issues, archive dead projects |
| **Issue response time** (first response) | 3.5 days | < 2 days | < 24 hours | Maintainer overload, no SLA | Add issue bot, auto-label, triage rotation |
| **Issue resolution time** | 28 days | < 14 days | < 14 days | Complex issues linger, no prioritization | Add issue priority labels, regular triage meetings |
| **Stale issues** (> 90 days) | 238 (28%) | < 10% | < 10% | Issues accumulate on low-activity repos | Auto-close stale issues, add "needs info" bot |
| **PR review time** (first review) | 4.2 days | < 2 days | < 48 hours | External PRs wait 2× longer than internal | Prioritize external PRs, add CODEOWNERS |
| **PR merge time** (open to merge) | 8.5 days | < 5 days | < 5 days | Review cycles, CI slowness | Speed up CI, add auto-merge for trivial changes |
| **External PR share** | 18% | 30% | 25-40% | Contributor experience friction | Improve CONTRIBUTING.md, add good-first-issues |
| **Overall** | **C+ (68)** | | | | |

### Maintainer health and sustainability

| Maintainer metric | Current | Target | Risk | Action |
|---|---|---|---|---|
| **Core maintainers** | 12 | 15 | 8 projects have bus factor < 2 | Recruit co-maintainers for critical projects, add succession plan |
| **Avg issues per maintainer** | 71 | < 50 | 3 maintainers show burnout signals | Reduce maintainer load, add triage maintainers |
| **Maintainer burnout risk** | 3 at risk (25%) | 0 | Reduced responsiveness, irritability in issues | Mandatory maintainer rotation, sabbatical, load reduction |
| **Maintainer diversity** | 100% employees | > 50% external | Single-company dependency, community fragility | Recruit external maintainers, add governance model |
| **Maintainer succession** | 2 projects have plan | 100% | 8 projects with bus factor < 2 have no succession | Document maintainer succession for all projects |
| **Maintainer time allocation** | 35% of work time (avg) | 50% | Maintainers report OSS work is "after hours" | Formalize OSS contribution as part of job responsibilities |
| **Overall** | **C (65)** | | | |

### OSS impact and adoption

| Impact metric | Current | Target | Benchmark | Measurement | Action |
|---|---|---|---|---|---|
| **GitHub stars** (all repos) | 1,850 | 5,000 | 2,000-10,000 (category) | GitHub API | Improve visibility, content marketing, conference talks |
| **Monthly downloads** (npm/pypi/cargo) | 2.5M | 5M | 2M-10M (category) | Package registry APIs | Improve documentation, add use cases, cross-promote |
| **External dependents** (projects using) | 285 | 500 | 200-1,000 (category) | GitHub dependency graph | Improve API stability, add migration guides |
| **Adoption in top 100** (by stars in category) | 8% | 15% | 10-20% | GitHub rankings, ossinsight | Focus on 2-3 flagship projects, improve quality |
| **Conference talks/blog posts** | 18/yr | 30 | 20-50 (active OSS) | Manual tracking | Increase conference presence, write technical blog posts |
| **Commercial adoption** (known companies) | 42 | 80 | 50-100 (category) | Manual tracking, logos | Create adopters list, case studies, testimonial program |
| **Overall** | **B- (72)** | | | | |

### License compliance and dependency health

| Compliance metric | Current | Target | Issue | Action |
|---|---|---|---|---|
| **Projects with clear license** | 92% (26/28) | 100% | 2 projects have no license (default: all rights reserved) | Add MIT/Apache 2.0 license to all projects |
| **CLA/DCO enforcement** | 62% (17/28) | 100% | 11 projects accept contributions without CLA/DCO | Implement DCO bot, add CLA for corporate projects |
| **Security policy** (SECURITY.md) | 48% (13/28) | 100% | 15 projects have no security reporting process | Add SECURITY.md with responsible disclosure process |
| **Dependency audit** (internal OSS usage) | 55% audited | 100% | 45% of 850 internal OSS dependencies not audited | Audit all OSS dependencies, create dependency inventory |
| **Unmaintained dependencies** (internal use) | 8% (68 packages) | < 3% | 68 packages are unmaintained upstream | Find alternatives, fork and maintain, accept risk |
| **Vulnerable dependencies** (known CVEs) | 5% (42 packages) | 0% | 42 packages have known vulnerabilities | Update, patch, or replace vulnerable dependencies |
| **License conflicts** (internal use) | 3% (25 packages) | 0% | 25 packages have GPL/AGPL or unclear licenses | Replace with permissive alternatives, legal review |
| **Overall** | **C+ (68)** | | | |

## Action recommendations

1. **Stale project revival or archival**: 8 projects (22%) with no commits in 6 months; for each stale project, decide: revive (assign maintainer), archive (mark as unmaintained), or merge (consolidate into active project), target 0 stale projects
2. **Contributor experience improvement**: 35% retention rate, 4.2-day PR review; implement contributor SLA (< 2 days first review), add good-first-issue labels, improve CONTRIBUTING.md, add contributor recognition program, target 50% retention
3. **Maintainer burnout prevention**: 3 maintainers at risk, 71 issues/maintainer; implement maintainer rotation, add triage maintainers, formalize OSS time allocation (50% work time), target 0 burnout and < 50 issues/maintainer
4. **Bus factor reduction**: 8 projects with bus factor < 2; recruit co-maintainers for critical projects, document maintainer succession, add external maintainers, target bus factor ≥ 3 for all critical projects
5. **License compliance completion**: 92% licensed, 62% CLA/DCO; add MIT/Apache 2.0 to unlicensed projects, implement DCO bot on all repos, add SECURITY.md to all projects, target 100% compliance
6. **Internal dependency audit**: 45% of 850 OSS dependencies not audited; complete dependency audit, identify unmaintained (68) and vulnerable (42) packages, create remediation plan, target 100% audited
7. **Issue backlog reduction**: 850 open issues, 28% stale; implement triage sprint, auto-close stale issues, add issue prioritization, target < 500 open issues and < 10% stale
8. **External PR prioritization**: External PRs wait 2× longer; implement external PR priority queue, add CODEOWNERS for faster routing, add automated PR welcome bot, target < 2 days for external PRs
9. **OSS impact growth**: 1,850 stars, 2.5M downloads; focus on 2-3 flagship projects, increase conference presence, write technical blog posts, create case studies, target 5,000 stars and 5M downloads
10. **Monthly OSS review**: review project health, contributor community, issue/PR metrics, maintainer health, OSS impact, and license compliance with engineering leadership and OSPO



- The "throw it over the wall" open source → publishing internal code to GitHub without documentation, governance, or maintainer commitment; 8 stale projects with no commits in 6 months are the result — open source is not a dumping ground for code you don't want to maintain anymore
- The maintainer-as-martyr → one person maintaining 3 critical projects, answering issues on weekends, and burning out; the bus factor of 1 is not a badge of honor — it's a single point of failure that will become a crisis when that person takes vacation, changes jobs, or burns out
- The star-count vanity metric → optimizing for GitHub stars as a measure of OSS success; stars are a bookmark, not a user — a project with 10,000 stars and 2 contributors is a museum, not a community
- The CLA-as-barrier → requiring a complex Contributor License Agreement that takes legal 2 weeks to approve; the 62% CLA enforcement means 38% of projects have unclear IP provenance — but the alternative is not "no CLA," it's the Developer Certificate of Origin (DCO), which takes 2 seconds to sign
- The "good first issue" bait-and-switch → labeling issues as "good first issue" that require deep domain knowledge, 3 weeks of setup, and understanding of the entire codebase; 28 first-time contributors/month but 35% retention means 18 of those 28 never come back — the "good first issue" label is a promise, and broken promises lose contributors

## Related

- Same class: [dashboard-developer-experience](dashboard-developer-experience.md) — developer experience
- Same class: [dashboard-platform-engineering](dashboard-platform-engineering.md) — platform engineering
- Same class: [dashboard-dora-metrics](../infrastructure/dashboard-dora-metrics.md) — DORA metrics
- Same class: [dashboard-dependency-management](../quality-security/dashboard-dependency-management.md) — dependency management
- Same class: [dashboard-security-posture](../quality-security/dashboard-security-posture.md) — security posture
- References: GitHub — *Open Source Guides*; TODO Group — *OSPO guides*; CHAOSS — *Community Health Analytics*; Nadia Eghbal — *Working in Public*; Linux Foundation — *Open Source Program Office*; GitHub — *Octoverse Report*; Google — *Open Source Sustainability*