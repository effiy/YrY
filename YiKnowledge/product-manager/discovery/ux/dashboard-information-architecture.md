---
title: information architecture dashboard
aliases:
- IA health dashboard
- navigation health dashboard
- content structure dashboard
- findability dashboard
tags:
- dashboard
- information-architecture
- ia
- navigation
- search
- findability
- taxonomy
- content-structure
category: product-manager/discovery/ux
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: dashboard
status: stable
lifecycle: active
review_cycle: monthly
roles:
- product-manager
- engineer
benefit: information architecture and findability health visible at a glance
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
- navigation, search, content structure, findability, taxonomy, and sitemap health defined
related:
- ./dashboard-ux-health.md
- ./dashboard-design-system.md
- ../dashboard-user-research.md
- ../../metrics/dashboard-feature-adoption.md
- ../../metrics/dashboard-product-portfolio.md
tacit: false
---

# information architecture dashboard

> **As a** product manager, **I want to** track information architecture and findability health, **so that** every user can find what they need in 3 clicks or less, navigation is intuitive, search delivers relevant results, and content structure scales with the product.

> Information architecture is the skeleton of the user experience. This dashboard tracks navigation efficiency, search effectiveness, content structure health, findability metrics, taxonomy quality, and sitemap coverage — turning IA from a one-time design exercise into a continuously measured product capability.

## Summary

- 6 IA dimensions: navigation efficiency, search effectiveness, content structure, findability, taxonomy quality, sitemap coverage
- 2,850 pages/screens across web + mobile; 42 top-level nav items; 8 content types; 3,200 taxonomy terms
- Average task completion rate: 72% (target 85%); average clicks to destination: 3.8 (target < 3); search success rate: 68%
- 85 orphaned pages (no inbound nav); 12 broken breadcrumbs; 28% of content has no taxonomy tags
- 5 navigation redesigns in last 18 months; IA debt: 142 items backlog; tree-testing conducted quarterly
- Dashboard reviewed monthly; IA review quarterly with UX, product, and engineering

## Core viewpoints

- Findability is the silent conversion killer — if users can't find it, it doesn't exist; every click beyond the third doubles the abandonment rate
- Navigation is a conversation — the IA is a promise to the user about where things live; broken navigation breaks trust, not just task completion
- Search is not a substitute for good IA — if users are searching for things that should be findable through navigation, your IA is failing; search is a symptom, not a solution
- IA debt compounds silently — every new feature that gets "temporarily" placed in the wrong section creates a future navigation crisis; IA is a garden, not a building

## Key information

### 6-panel IA overview

```
┌──────────────────────────────────────────────────────────────────┐
│  NAVIGATION EFFICIENCY             │  SEARCH EFFECTIVENESS              │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Pages/screens: 2,850    │   │  │  Searches/day: 12,500    │   │
│  │  Nav items: 42 top-level │   │  │  Success rate: 68%        │   │
│  │  Avg clicks: 3.8/task    │   │  │  Zero-results: 8.5%       │   │
│  │  Task completion: 72%    │   │  │  Click-through: 62%       │   │
│  │  Nav depth: 3.2 levels   │   │  │  Reformulation: 28%       │   │
│  │  Back-button rate: 18%   │   │  │  Avg position clicked: 2.8│   │
│  │  Nav score: B (78)       │   │  │  Search quality: B (75)   │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  CONTENT STRUCTURE                 │  FINDAHILITY                       │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Content types: 8        │   │  │  Orphaned pages: 85      │   │
│  │  Pages per type: 356 avg │   │  │  Broken links: 142        │   │
│  │  Content depth: 4.2      │   │  │  Missing breadcrumbs: 12  │   │
│  │  Duplicate content: 3.2% │   │  │  ROT content: 15%         │   │
│  │  Content age: 18mo avg   │   │  │  Entry from search: 42%   │   │
│  │  Outdated (>2yr): 22%    │   │  │  Entry from nav: 38%      │   │
│  │  Structure health: B-    │   │  │  Findability score: C+    │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  TAXONOMY HEALTH                   │  SITEMAP COVERAGE                  │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Terms: 3,200 total      │   │  │  Pages in sitemap: 2,765 │  │
│  │  Unused terms: 280 (9%)  │   │  │  Coverage: 97%            │   │
│  │  Untagged content: 28%   │   │  │  XML sitemap: 100%        │   │
│  │  Avg tags/page: 3.2      │   │  │  HTML sitemap: 85%        │   │
│  │  Tag consistency: 78%    │   │  │  Visual sitemap: 62%      │   │
│  │  Synonym coverage: 65%   │   │  │  Last crawl: 2026-08-05   │   │
│  │  Taxonomy score: B- (72) │   │  │  Sitemap health: A- (88)  │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Navigation efficiency by section

| Navigation section | Pages | Avg depth | Clicks to destination | Task completion | Back-button rate | Exit rate | Health |
|---|---|---|---|---|---|---|---|
| **Dashboard/Home** | 12 | 1.5 | 1.2 | 95% | 2% | 3% | A (92) |
| **Projects** | 450 | 3.2 | 3.5 | 78% | 12% | 8% | B+ (82) |
| **Settings** | 180 | 4.5 | 5.2 | 62% | 22% | 15% | C (65) |
| **Reports** | 85 | 3.0 | 3.2 | 75% | 15% | 10% | B (78) |
| **Admin** | 120 | 4.8 | 5.5 | 58% | 25% | 18% | D (55) |
| **Knowledge Base** | 680 | 3.8 | 4.2 | 68% | 18% | 12% | B- (72) |
| **User Profile** | 35 | 2.2 | 2.5 | 88% | 8% | 5% | A (90) |
| **Billing** | 28 | 2.8 | 3.0 | 82% | 10% | 7% | B+ (85) |
| **API Docs** | 320 | 2.5 | 2.8 | 85% | 8% | 5% | A (88) |
| **Integrations** | 95 | 3.5 | 4.0 | 70% | 16% | 11% | B- (70) |
| **Overall** | **2,850** | **3.2** | **3.8** | **72%** | **18%** | **10%** | **B (78)** |

### Search effectiveness

| Search metric | Current | 3 months ago | 6 months ago | Target | Trend |
|---|---|---|---|---|---|
| **Search success rate** (clicked result) | 68% | 65% | 62% | > 80% | ↑ |
| **Zero-results rate** | 8.5% | 10% | 12% | < 5% | ↓ |
| **Query reformulation rate** | 28% | 30% | 32% | < 20% | ↓ |
| **Average position clicked** | 2.8 | 3.1 | 3.5 | < 2.0 | ↓ |
| **Click-through rate** (SERP) | 62% | 58% | 55% | > 75% | ↑ |
| **Search exit rate** (no click) | 18% | 20% | 22% | < 10% | ↓ |
| **Pogo-sticking** (return to SERP) | 15% | 17% | 18% | < 8% | ↓ |
| **Search refinement usage** | 22% | 18% | 15% | > 35% | ↑ |
| **Typo/autocorrect rate** | 12% | 14% | 15% | < 8% | ↓ |
| **Overall search quality** | **B (75)** | **B- (72)** | **C+ (68)** | **B+ (85)** | ↑ |

### Top zero-result search queries

| Query | Frequency/mo | User intent | Missing content | Action |
|---|---|---|---|---|
| "delete account" | 1,850 | Self-service account deletion | No self-service deletion flow | Add deletion flow, surface in settings |
| "export data" | 1,420 | Data export/portability | Export hidden in settings → privacy | Surface in main settings, improve search indexing |
| "change email" | 980 | Email change | Feature exists but not indexed | Add to search index, improve metadata |
| "team permissions" | 850 | RBAC/permission management | Docs exist but use different terminology | Add "team permissions" as synonym |
| "api key rotate" | 720 | API key rotation | Feature exists as "regenerate key" | Add synonym mapping |
| "dark mode" | 680 | Appearance preference | Feature exists in settings → appearance | Surface in search, improve metadata |
| "billing history" | 620 | Invoice history | Feature exists as "invoices" | Add synonym "billing history" |
| "webhook setup" | 580 | Webhook configuration | Docs buried in integrations → developer | Improve IA placement, synonym |
| "sso configuration" | 520 | SSO/SAML setup | Enterprise-only, not indexed for self-serve | Tag as enterprise, add conditional index |
| "2fa setup" | 480 | Two-factor authentication | Feature exists as "MFA" | Add "2FA" as synonym across all content |

### Content structure audit

| Content type | Pages | Avg depth | Templates | Consistent layout | Duplicate rate | ROT risk | Quality |
|---|---|---|---|---|---|---|---|
| **Dashboard views** | 45 | 1.5 | 3 templates | 92% | 0.5% | Low | A (90) |
| **Project pages** | 450 | 3.2 | 2 templates | 85% | 2.8% | Medium | B+ (82) |
| **Documentation** | 680 | 3.8 | 4 templates | 78% | 4.5% | Medium | B (78) |
| **Settings panels** | 180 | 4.5 | 1 template | 72% | 1.2% | Low | B- (70) |
| **Reports** | 85 | 3.0 | 5 templates | 65% | 2.0% | High | C+ (68) |
| **Admin tools** | 120 | 4.8 | 3 templates | 58% | 1.5% | High | C (65) |
| **Marketing pages** | 95 | 2.2 | 8 templates | 55% | 6.5% | High | C (62) |
| **Blog/articles** | 320 | 1.8 | 2 templates | 88% | 3.5% | Medium | B+ (84) |
| **API documentation** | 320 | 2.5 | 1 template | 95% | 1.0% | Low | A (92) |
| **Legal/policy** | 28 | 1.5 | 1 template | 98% | 0.5% | Low | A (95) |
| **Overall** | **2,850** | | | **78%** | **3.2%** | | **B (78)** |

### ROT (Redundant, Outdated, Trivial) content analysis

| ROT category | Pages | % of total | Traffic (last 90d) | Last updated | Risk | Action |
|---|---|---|---|---|---|---|
| **Redundant** (duplicate) | 92 | 3.2% | 1,200 views | Various | Medium | Consolidate, redirect |
| **Outdated** (> 2 years) | 625 | 22% | 8,500 views | 2023 avg | **High** | Audit, update, or archive |
| **Trivial** (< 50 views/year) | 285 | 10% | 1,800 views | Various | Low | Archive or delete |
| **Redundant + Outdated** | 45 | 1.6% | 320 views | 2022 avg | **High** | Delete, redirect |
| **Outdated + Trivial** | 120 | 4.2% | 450 views | 2021 avg | Medium | Archive |
| **Total ROT** | **1,167** | **41%** | | | | |

### Content age distribution

| Age bucket | Pages | % | Avg views/mo | Update status | Risk |
|---|---|---|---|---|---|
| **0-3 months** (fresh) | 580 | 20% | 5,200 | Current | Low |
| **3-6 months** (recent) | 520 | 18% | 3,800 | Reviewed | Low |
| **6-12 months** (aging) | 650 | 23% | 2,100 | Needs review | Medium |
| **12-24 months** (stale) | 475 | 17% | 850 | Overdue review | **High** |
| **24+ months** (outdated) | 625 | 22% | 420 | Abandoned | **Critical** |
| **Total** | **2,850** | | | | |

### Findability audit

| Findability metric | Current | Target | Gap | Notes |
|---|---|---|---|---|
| **Orphaned pages** (no inbound nav) | 85 (3%) | 0% | +85 | 85 pages reachable only via direct link or search |
| **Broken internal links** | 142 | 0 | +142 | 142 links lead to 404 or wrong page |
| **Missing breadcrumbs** | 12 (0.4%) | 0% | +12 | 12 pages without breadcrumb trail |
| **Deep pages** (> 4 clicks) | 485 (17%) | < 5% | +12% | 485 pages require 5+ clicks from home |
| **Entry from search** | 42% | < 30% | +12% | Users can't navigate; rely on search |
| **Entry from direct link** | 20% | < 15% | +5% | Users bookmark or share links; navigation failed |
| **Entry from navigation** | 38% | > 55% | -17% | Navigation is the primary discovery method |
| **Overall findability** | **C+ (68)** | **B+ (85)** | **-17 pts** | |

### Orphaned pages — top offenders

| Page | Section | Views/mo | Last updated | Orphaned since | How users find it |
|---|---|---|---|---|---|
| Legacy export tool | Settings | 850 | 2024-03 | 2024-06 | Direct link, bookmarks |
| Team billing report | Reports | 620 | 2024-08 | 2024-12 | Search, email links |
| Old API v1 migration guide | API Docs | 480 | 2023-12 | 2024-03 | Search, external links |
| Beta feature request form | Home | 350 | 2024-05 | 2024-09 | Direct link, support |
| Onboarding checklist v2 | Dashboard | 280 | 2024-02 | 2024-04 | Search, direct link |
| Incident postmortem archive | Admin | 220 | 2024-11 | 2025-01 | Email links, search |
| Custom dashboard builder | Projects | 180 | 2024-07 | 2024-10 | Direct link, bookmarks |
| Data export scheduler | Settings | 150 | 2024-04 | 2024-08 | Search, support tickets |

### Taxonomy quality

| Taxonomy facet | Terms | Hierarchical | Used in content | Unused terms | Synonym coverage | Health |
|---|---|---|---|---|---|---|
| **Product features** | 450 | Yes (3 levels) | 72% | 126 (28%) | 58% | C+ (68) |
| **User roles** | 85 | Yes (2 levels) | 88% | 10 (12%) | 72% | B (78) |
| **Industries** | 180 | Yes (2 levels) | 75% | 45 (25%) | 65% | B- (70) |
| **Content types** | 32 | No (flat) | 92% | 3 (9%) | 85% | A- (88) |
| **Use cases** | 220 | Yes (3 levels) | 68% | 70 (32%) | 55% | C (65) |
| **Technologies** | 350 | Yes (2 levels) | 78% | 77 (22%) | 68% | B- (72) |
| **Business units** | 28 | Yes (2 levels) | 95% | 1 (4%) | 90% | A (92) |
| **Regions** | 18 | No (flat) | 98% | 0 (0%) | 95% | A (95) |
| **Overall** | **3,200** | | **78%** | **280 (9%)** | **65%** | **B- (72)** |

### Tree-testing results (Q3 2026)

| Task | Success rate | Directness | Time to complete | Path deviation | Rating |
|---|---|---|---|---|---|
| "Find the billing settings" | 85% | 72% | 12s | 1.8 steps | Good |
| "Change your notification preferences" | 62% | 48% | 28s | 3.5 steps | Poor |
| "View team member permissions" | 58% | 42% | 32s | 4.2 steps | Poor |
| "Export project data" | 78% | 65% | 18s | 2.2 steps | Adequate |
| "Find the API documentation" | 88% | 78% | 10s | 1.5 steps | Good |
| "Submit a support ticket" | 72% | 55% | 22s | 2.8 steps | Adequate |
| "View security audit logs" | 45% | 35% | 38s | 4.8 steps | Critical |
| "Update billing credit card" | 82% | 68% | 14s | 2.0 steps | Good |
| "Find the SSO configuration" | 52% | 38% | 35s | 4.5 steps | Poor |
| "Access the onboarding guide" | 75% | 62% | 16s | 2.5 steps | Adequate |
| **Overall** | **70%** | **56%** | **22.5s** | **3.0 steps** | **B- (72)** |

### IA debt backlog

| Debt type | Items | Priority | Effort | Impact | Avg age |
|---|---|---|---|---|---|
| **Orphaned pages** | 85 | High | Medium | Medium | 14 months |
| **Broken links** | 142 | High | Low | Medium | 8 months |
| **Missing redirects** | 68 | Medium | Low | Medium | 6 months |
| **Nav inconsistency** | 45 | Medium | High | High | 12 months |
| **Taxonomy cleanup** | 280 terms | Medium | High | Medium | 18 months |
| **Content reorganization** | 35 sections | Low | High | High | 24 months |
| **Breadcrumb fixes** | 12 | High | Low | Low | 5 months |
| **Search index gaps** | 95 | Medium | Medium | High | 8 months |
| **Total** | **762** | | | | |

## Action recommendations

1. **Settings IA redesign**: 5.2 clicks avg, 62% task completion, D health score; restructure settings into 3 flat groups (Account, Workspace, Billing), target 2.5 clicks
2. **Admin section consolidation**: 5.5 clicks, 58% completion, D health score; consolidate admin tools under 3 top-level items, eliminate 2 nesting levels
3. **Orphaned page cleanup**: 85 orphaned pages; triage into delete (no traffic), integrate (add nav), or archive (low traffic, keep for reference)
4. **Search zero-result reduction**: 8.5% zero-result rate; add top 10 zero-result queries as synonyms or create missing content, target < 5%
5. **ROT content purge**: 41% of content is ROT; audit all 625 outdated pages, archive/delete 285 trivial pages, consolidate 92 duplicates
6. **Taxonomy synonym expansion**: 65% synonym coverage, 280 unused terms; map top 100 zero-result queries to existing terms, remove 200 unused terms
7. **Tree-testing critical fixes**: 3 tasks below 60% success; redesign navigation paths for permissions, audit logs, and SSO configuration
8. **Breadcrumb completeness**: 12 missing breadcrumbs; add breadcrumbs to all pages, enforce in design system
9. **Broken link remediation**: 142 broken internal links; automated link checker in CI/CD, fix all broken links within 30 days
10. **Monthly IA review**: review navigation metrics, search effectiveness, content structure, findability, and taxonomy health with UX, product, and engineering



- Navigation by org chart → structuring the IA to mirror the company's internal teams instead of the user's mental model; users don't know (or care) which team owns which feature
- The "one more nav item" trap → adding every new feature as a top-level nav item because "it's important"; IA is a zero-sum game — every new item makes every existing item harder to find
- Taxonomy as a documentation exercise → creating a beautiful, complete taxonomy in a spreadsheet that nobody uses to tag content; a taxonomy that isn't applied to content is a work of fiction
- Search as a band-aid → "users can just search for it" as an excuse to skip IA work; search is a fallback, not a strategy — if users consistently search for something, it belongs in the navigation
- IA as a one-time project → designing the IA once at launch and never revisiting it; IA is a living structure — it needs pruning, reorganizing, and maintenance as the product grows

## Related

- Same class: [dashboard-ux-health](dashboard-ux-health.md) — UX health and usability
- Same class: [dashboard-design-system](dashboard-design-system.md) — design system health
- Same class: [dashboard-user-research](../dashboard-user-research.md) — user research operations
- Same class: [dashboard-feature-adoption](../../metrics/dashboard-feature-adoption.md) — feature adoption
- Same class: [dashboard-product-portfolio](../../metrics/dashboard-product-portfolio.md) — product portfolio
- References: Peter Morville — *Information Architecture for the World Wide Web*; Abby Covert — *How to Make Sense of Any Mess*; NNGroup — *IA and Navigation Research*; Donna Spencer — *A Practical Guide to Information Architecture*; Jorge Arango — *Living in Information*