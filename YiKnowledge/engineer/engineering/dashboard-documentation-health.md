---
title: documentation health dashboard
aliases:
- docs health dashboard
- documentation quality dashboard
- technical writing dashboard
- developer documentation dashboard
- API documentation dashboard
- docs-as-code dashboard
tags:
- dashboard
- documentation
- technical-writing
- docs-as-code
- developer-portal
- api-docs
- content-quality
- information-architecture
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
- product-manager
benefit: documentation coverage, quality, freshness, and discoverability visible at a glance
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
- coverage, quality, freshness, discoverability, API docs, and contribution health defined
related:
- ./dashboard-developer-experience.md
- ./dashboard-platform-engineering.md
- ../infrastructure/dashboard-dora-metrics.md
- ../../product-manager/discovery/ux/dashboard-content-design.md
- ../../product-manager/discovery/ux/dashboard-information-architecture.md
- ../../knowledge-curator/governance/dashboard-knowledge-health.md
tacit: false
---

# documentation health dashboard

> **As an** engineer, **I want to** track documentation health, **so that** every system is documented, every doc is accurate, every developer finds answers in < 2 minutes, and documentation is a measured, maintained, and continuously improving engineering practice — not a "we'll document it after launch" graveyard of outdated READMEs.

> Documentation is the UI for your code. This dashboard tracks coverage, quality, freshness, discoverability, API documentation, and contribution health — turning documentation from a neglected afterthought into a first-class engineering discipline that reduces support burden, accelerates onboarding, and prevents tribal knowledge.

## Summary

- 6 documentation dimensions: coverage, quality, freshness, discoverability, API documentation, contribution health
- 1,850 documentation pages; 42 repositories; 285 API endpoints; 18 documentation contributors; 95,000 monthly page views
- Coverage: 68% of systems documented (target 85%); 42% of repos have ARCHITECTURE.md; 28% of APIs have OpenAPI spec; 15 critical systems with zero documentation
- Quality: 58% docs rated "helpful" by readers; 22% docs with readability score < 50 (too complex); 12% docs contain broken links; 8% docs have code samples that don't compile
- Freshness: 35% of docs > 12 months since last update; 18% flagged as "possibly outdated" by readers; 5% docs reference deprecated APIs; avg doc age: 14 months
- Dashboard reviewed monthly; documentation health review with engineering leadership quarterly

## Core viewpoints

- Documentation is a feature of the product, not a description of the product — if a developer can't find the answer in 2 minutes, they'll either ask someone (interrupting flow), guess (introducing bugs), or give up (slowing velocity); the cost of bad documentation is measured in engineering hours, not pages
- The "docs after launch" promise is a lie — 85% of software projects never get documentation after launch; the only time documentation gets written is when it's part of the definition of done; documentation that ships with the feature exists, documentation that's "coming soon" never will
- Every broken code sample is a broken promise — 8% of code samples don't compile; when a developer copies a code sample and it fails, they lose trust in the entire documentation; it's better to have no code sample than a broken one
- Documentation freshness is a search problem — 35% of docs > 12 months old; the solution is not a manual audit, it's automated staleness detection (last commit to related code, API version changes, reader feedback) that flags docs for review

## Key information

### 6-panel documentation overview

```
┌──────────────────────────────────────────────────────────────────┐
│  COVERAGE                              │  QUALITY                                │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Systems documented: 68% │   │  │  Helpful rating: 58%     │   │
│  │  ARCHITECTURE.md: 42%    │   │  │  Readability > 50: 78%   │   │
│  │  OpenAPI spec: 28%       │   │  │  Broken links: 12%       │   │
│  │  README coverage: 88%    │   │  │  Broken code samples: 8% │   │
│  │  Zero docs: 15 systems   │   │  │  "Was this helpful?"     │   │
│  │  (critical gap)          │   │  │  response rate: 3.2%     │   │
│  │  Coverage score: C+(68)  │   │  │  Quality score: C+(68)  │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  FRESHNESS                             │  DISCOVERABILITY                       │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Avg doc age: 14 months  │   │  │  Search success: 62%     │   │
│  │  > 12 months: 35%        │   │  │  Time-to-answer: 3.5 min │   │
│  │  "Possibly outdated": 18%│   │  │  (target < 2 min)        │   │
│  │  Deprecated API refs: 5% │   │  │  Bounce rate: 45%        │   │
│  │  Docs updated/mo: 85     │   │  │  Zero-result searches:   │   │
│  │  Staleness alerts: 42    │   │  │  12%                     │   │
│  │  (open)                  │   │  │  IA tree depth: 4.2      │   │
│  │  Freshness score: C(65)  │   │  │  Discoverability: C+(68)│   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  API DOCUMENTATION                     │  CONTRIBUTION HEALTH                   │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  OpenAPI coverage: 28%   │   │  │  Contributors: 18        │   │
│  │  Interactive docs: 22%   │   │  │  Docs PRs/mo: 45         │   │
│  │  Code samples: 58% of    │   │  │  Docs-as-code adoption:  │   │
│  │  endpoints               │   │  │  65% (markdown in repo)  │   │
│  │  SDK docs: 4 languages   │   │  │  Docs review time: 3.5   │   │
│  │  Changelog: 85% coverage │   │  │  days (target 1 day)     │   │
│  │  API docs score: C(65)   │   │  │  Docs ownership: 45% of  │   │
│  │                           │   │  │  repos have doc owner    │   │
│  │                           │   │  │  Contribution: C+(68)   │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Documentation coverage by system

| System | README | ARCHITECTURE.md | API docs | Runbook | Onboarding guide | Troubleshooting | Overall | Gap |
|---|---|---|---|---|---|---|---|---|
| **YiVad** | ✓ | ✓ | ✓ (85%) | ✓ | ✓ | ✓ | 92% | User-facing docs for new features |
| **YiWeb** | ✓ | ✓ | ✓ (72%) | ✓ | ✓ | Partial | 85% | API docs for internal endpoints |
| **YiPet** | ✓ | ✓ | Partial (45%) | ✓ | ✓ | ✗ | 78% | API docs, troubleshooting |
| **YiAi** | ✓ | ✗ | Partial (35%) | ✗ | ✓ | ✗ | 55% | Architecture, API docs, runbooks |
| **Shared services** | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | 28% | Everything — critical gap |
| **Data pipelines** | Partial | ✗ | ✗ | Partial | ✗ | ✗ | 22% | Architecture, data lineage, runbooks |
| **Infrastructure** | ✓ | ✓ | N/A | ✓ | Partial | Partial | 75% | Onboarding, troubleshooting |
| **ML platform** | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | 18% | Everything — critical gap |
| **Legacy systems** | Partial | ✗ | ✗ | ✗ | ✗ | ✗ | 8% | Everything — deprecation plan vs document |
| **Overall** | **88%** | **42%** | **28%** | **55%** | **48%** | **32%** | **68%** | |

### Documentation quality metrics

| Quality dimension | Measurement method | Current | Target | Worst offenders | Root cause | Action |
|---|---|---|---|---|---|---|
| **Reader helpfulness** | "Was this helpful?" thumbs up/down | 58% yes | 80% | API reference (42%), tutorial (52%) | Missing context, assumes prior knowledge | Add prerequisites, use cases, examples |
| **Readability** | Flesch-Kincaid score | 62 avg | > 60 | Architecture docs (38), API docs (45) | Too much jargon, passive voice, long sentences | Plain language review, active voice, chunking |
| **Broken links** | Automated link checker | 12% of docs | < 2% | Cross-repo links, external links | Repo renames, external docs moved | Automated link checking in CI, relative links |
| **Code sample validity** | Automated test runner | 92% compile | 100% | SDK examples, API quickstart | API changes, sample not in CI | Test code samples in CI, version-pinned samples |
| **Completeness** | Required sections checklist | 62% complete | 90% | Troubleshooting (32%), examples (45%) | No template, no required sections | Standardized doc templates, section checklist |
| **Visual clarity** | Diagrams, screenshots | 38% have visuals | 60% | Architecture docs, tutorials | Diagram-as-afterthought, no tooling | Mermaid in markdown, screenshot automation |
| **Overall** | | **C+ (68)** | | | | |

### Documentation freshness

| Age bucket | Pages | % of total | Page views | % of traffic | "Possibly outdated" flags | Update priority |
|---|---|---|---|---|---|---|
| **< 3 months** | 285 | 15% | 42% | High | 2% | Low — actively maintained |
| **3-6 months** | 320 | 17% | 28% | Medium | 5% | Low — recently reviewed |
| **6-12 months** | 620 | 33% | 18% | Low | 12% | Medium — schedule review |
| **12-24 months** | 385 | 20% | 8% | Low | 28% | High — likely outdated |
| **> 24 months** | 240 | 13% | 4% | Very low | 42% | Critical — verify or archive |
| **Unknown** | 50 | 3% | 0% | None | N/A | Archive — no metadata |
| **Overall** | **1,850** | **100%** | **100%** | | **18%** | |

### Discoverability and search effectiveness

| Search metric | Current | Target | Benchmark | Issue | Action |
|---|---|---|---|---|---|
| **Search success rate** (click-through) | 62% | 80% | 75% (industry) | Poor relevance ranking, missing synonyms | Improve search index, add synonyms |
| **Time-to-answer** (search → find) | 3.5 min | < 2 min | 2 min (Stripe, Twilio) | Too many results, poor ranking | Faceted search, curated results |
| **Zero-result searches** | 12% | < 5% | 5% (industry) | Missing content, terminology gap | Zero-result analysis, content gap fill |
| **Bounce rate** (1 page, no action) | 45% | < 30% | 35% (industry) | Landing on wrong page, content not helpful | Improve IA, add related content |
| **IA tree depth** (clicks to content) | 4.2 | < 3 | 3 (industry) | Deep nesting, too many categories | Flatten IA, consolidate categories |
| **In-app help effectiveness** | 28% resolution | 50% | 45% (Intercom, Zendesk) | Context-insensitive, generic | Context-aware help, in-app guides |
| **Overall** | **C+ (68)** | | | | |

### API documentation quality

| API | Endpoints | OpenAPI spec | Interactive docs | Code samples | SDK coverage | Changelog | Authentication docs | Error docs | Score |
|---|---|---|---|---|---|---|---|---|---|
| **YiVad API** | 85 | ✓ (full) | ✓ (Swagger) | 72% | 4 languages | ✓ | ✓ | ✓ | A- (88) |
| **YiWeb API** | 72 | ✓ (partial) | ✓ (Swagger) | 58% | 3 languages | ✓ | ✓ | Partial | B (78) |
| **YiPet API** | 45 | ✓ (partial) | ✗ | 35% | 2 languages | Partial | ✓ | ✗ | C+ (65) |
| **YiAi API** | 52 | ✗ | ✗ | 22% | 1 language | ✗ | Partial | ✗ | D (45) |
| **Internal/Admin** | 31 | ✗ | ✗ | 8% | 0 | ✗ | ✗ | ✗ | F (22) |
| **Overall** | **285** | **28%** | **22%** | **58%** | **4 languages** | **85%** | **72%** | **42%** | **C (65)** |

### Documentation contribution health

| Contribution metric | Current | Target | Issue | Action |
|---|---|---|---|---|
| **Active contributors** (last 30 days) | 18 | 30 | Only 15% of engineers contribute to docs | Add docs contribution to performance review, recognize docs contributors |
| **Docs PRs/month** | 45 | 80 | Docs PRs are 5% of total PRs (should be 10%) | Require docs with feature PRs, add docs checklist to PR template |
| **Docs-as-code adoption** | 65% | 90% | 35% of docs still in wiki/Confluence/Google Docs | Migrate wikis to markdown in repo, add docs CI/CD |
| **Docs review time** | 3.5 days | < 1 day | Docs PRs treated as low priority | Add docs owners, add docs review SLA |
| **Docs ownership** | 45% of repos | 100% | 55% of repos have no documentation owner | Assign doc owners per repo, add to CODEOWNERS |
| **Docs in definition of done** | 35% of teams | 80% | Most teams don't include docs in DoD | Add documentation to team DoD, add docs gate to release |
| **Overall** | **C+ (68)** | | | |

## Action recommendations

1. **Critical system documentation gap**: 15 systems with zero documentation (shared services, ML platform, legacy); assign doc owners, create minimum viable docs (README + ARCHITECTURE.md + API docs), target 0 zero-doc systems
2. **API documentation standardization**: 28% OpenAPI coverage; implement OpenAPI spec for all APIs, add interactive docs (Swagger/Stoplight), generate SDK docs from specs, target 80% coverage
3. **Documentation freshness automation**: 35% of docs > 12 months old; implement automated staleness detection (code-doc diff, API version check), add "last reviewed" metadata, archive outdated docs, target < 15% stale
4. **Code sample testing in CI**: 8% of code samples don't compile; add code sample testing to CI pipeline, version-pin all code samples, add language-specific test runners, target 100% compile rate
5. **Search and discoverability**: 62% search success, 3.5 min time-to-answer; implement Algolia/Typesense search, add faceted search, improve IA (flatten to < 3 levels), target 80% search success and < 2 min time-to-answer
6. **Docs-as-code completion**: 65% docs-as-code adoption; migrate remaining wiki/Confluence docs to markdown in repo, add docs linting and link checking in CI, add docs preview for PRs, target 90% adoption
7. **Documentation ownership**: 45% of repos have doc owners; assign documentation owners for all repos, add to CODEOWNERS, add docs review SLA, target 100% ownership
8. **Documentation in definition of done**: 35% of teams include docs in DoD; make documentation part of every team's definition of done, add docs gate to release checklist, target 80% adoption
9. **Reader feedback loop**: 3.2% "was this helpful" response rate; add prominent feedback widget, implement feedback→ticket automation, review feedback monthly, target 10% response rate
10. **Monthly documentation review**: review coverage, quality, freshness, discoverability, API documentation, and contribution health with engineering leadership



- The wiki-as-documentation graveyard → maintaining documentation in a wiki that nobody reads, updates, or owns; wikis have no review process, no version control, and no ownership — 35% of docs still in wikis are the 35% that are most outdated
- The "self-documenting code" fantasy → claiming that clean code doesn't need documentation; clean code documents WHAT and HOW, not WHY — the architecture decision, the trade-off, the context that led to this implementation are invisible in code and only exist in documentation (or in someone's head, until they leave)
- The README-as-documentation → a README with setup instructions is not documentation; it's a starting point — documentation includes architecture, API reference, runbooks, troubleshooting, onboarding guides, and decision records
- The documentation sprint → scheduling a "documentation week" once a year to catch up; documentation written in a sprint is documentation written without context, often by people who didn't build the system — the result is surface-level docs that miss the nuance and become outdated within 3 months
- The "it's obvious" bias → the engineer who built the system assumes users have the same mental model; documentation written by the builder without user testing is documentation that only the builder can understand — the 58% helpfulness rating is the proof

## Related

- Same class: [dashboard-developer-experience](dashboard-developer-experience.md) — developer experience
- Same class: [dashboard-platform-engineering](dashboard-platform-engineering.md) — platform engineering
- Same class: [dashboard-dora-metrics](../infrastructure/dashboard-dora-metrics.md) — DORA metrics
- Same class: [dashboard-content-design](../../product-manager/discovery/ux/dashboard-content-design.md) — content design and UX writing
- Same class: [dashboard-information-architecture](../../product-manager/discovery/ux/dashboard-information-architecture.md) — information architecture
- Same class: [dashboard-knowledge-health](../../knowledge-curator/governance/dashboard-knowledge-health.md) — knowledge base health
- References: Write the Docs — *Documentation Handbook*; Google — *Technical Writing Courses*; Stripe — *API Documentation Standards*; Divio — *Documentation System*; Diátaxis — *Documentation Framework*; Tom Johnson — *I'd Rather Be Writing*; Kubernetes — *Documentation Style Guide*