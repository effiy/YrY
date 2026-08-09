---
title: design system health dashboard
aliases:
- design system operations dashboard
- design system adoption dashboard
- component library health dashboard
- design token compliance dashboard
tags:
- dashboard
- design-system
- component-library
- design-tokens
- accessibility
- design-ops
category: product-manager/discovery/ux
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: monthly
roles:
- product-manager
- engineer
- tech-lead
benefit: design system health and adoption visible at a glance
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
- component adoption, token compliance, accessibility coverage, versioning, and contribution health defined
related:
- ./dashboard-ux-health.md
- ../../metrics/dashboard-product-portfolio.md
- ../../discovery/dashboard-user-research.md
- ../../../engineer/engineering/dashboard-developer-experience.md
- ../../../engineer/quality-security/dashboard-quality-metrics.md
tacit: false
---

# design system health dashboard

> **As a** design system team lead, **I want to** track component library health and adoption, **so that** the design system is consistent, adopted, and accelerates product development instead of becoming a bottleneck.

> A design system is a product — its users are developers and designers. This dashboard tracks component adoption, design token compliance, accessibility coverage, versioning and release health, and contribution velocity across all consuming teams.

## Summary

- 5 design system dimensions: component adoption, token compliance, accessibility coverage, versioning & releases, contribution health
- 285 components across 12 packages (core, charts, forms, data-display, nav, feedback, layout, utils, icons, themes, a11y, patterns)
- 8 consuming teams: Web Frontend, Mobile, Admin Dashboard, Design System, Platform, AI/ML UI, Growth, Integrations
- Design token system: 480 tokens across 6 categories (color, typography, spacing, shadows, motion, breakpoints)
- Dashboard reviewed monthly; design system health review quarterly with design and engineering leadership

## Core viewpoints

- A design system is a product, not a project — it has users (developers, designers), a roadmap, SLAs, and a support model; run it like an internal product
- Adoption is the only metric that matters — a beautiful component that nobody uses is dead code; track adoption per team, per component, and act on the gaps
- Token compliance is a quality signal — hardcoded colors, spacing, and typography are design debt; every hardcoded value is a future inconsistency
- Contribution velocity is a health indicator — a design system that only the design system team contributes to is a bottleneck; healthy systems have broad contribution patterns

## Key information

### 5-panel design system overview

```
┌──────────────────────────────────────────────────────────────────┐
│  COMPONENT ADOPTION               │  TOKEN COMPLIANCE                 │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Components: 285        │   │  │  Tokens: 480             │   │
│  │  Adopted >80%: 198 (69%)│   │  │  Color compliance: 88%   │   │
│  │  Adopted 50-80%: 52 (18%)│  │  │  Spacing compliance: 82% │   │
│  │  Adopted <50%: 25 (9%)  │   │  │  Typography compliance:78%│   │
│  │  Unused:       10 (4%)  │   │  │  Shadow compliance: 92%   │   │
│  │  Adoption rate: 82%     │   │  │  Motion compliance: 85%   │   │
│  │  Custom overrides: 12%  │   │  │  Hardcoded values: 1,250  │   │
│  │  Design-code drift: 8%  │   │  │  Token drift rate: 3.2%/mo│   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  ACCESSIBILITY COVERAGE           │  VERSIONING & RELEASES             │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  WCAG 2.2 AA: 82%       │   │  │  Latest:  v4.8.2         │   │
│  │  WCAG 2.2 AAA: 58%      │   │  │  Releases: 26/yr (2/mo)  │   │
│  │  Keyboard: 88%           │   │  │  Breaking: 2/yr (8%)     │   │
│  │  Screen reader: 85%      │   │  │  Minor:     16/yr (62%)  │   │
│  │  Color contrast: 92%     │   │  │  Patch:     8/yr (30%)   │   │
│  │  Focus mgmt: 78%         │   │  │  Adoption lag: 3.2 weeks │   │
│  │  A11y score: 81/100      │   │  │  Deprecation: 12 comps   │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Component adoption by team

| Team | Components used | Adoption rate | Custom overrides | Design-code drift | Top missing component | Health |
|---|---|---|---|---|---|---|
| Web Frontend | 245/285 | 86% | 8% | 5% | Advanced data grid | A (92) |
| Mobile | 195/285 | 68% | 18% | 12% | Bottom sheet patterns | B (75) |
| Admin Dashboard | 210/285 | 74% | 10% | 7% | Bulk action toolbar | B+ (82) |
| AI/ML UI | 165/285 | 58% | 22% | 15% | Streaming text display | C (65) |
| Platform | 180/285 | 63% | 14% | 8% | Permission matrix | B- (72) |
| Growth | 155/285 | 54% | 25% | 18% | A/B test variant wrapper | C (62) |
| Integrations | 140/285 | 49% | 28% | 20% | OAuth connection card | C- (55) |
| Design System (dogfood) | 285/285 | 100% | 0% | 0% | — | A+ (98) |
| **Overall** | **198 avg** | **82%** | **12%** | **8%** | | **B+ (82)** |

### Component inventory by category

| Category | Components | Adopted | Adoption % | Deprecated | Needs update | A11y score | Health |
|---|---|---|---|---|---|---|---|
| **Core** (Button, Input, Select, etc.) | 45 | 43 | 96% | 2 | 5 | 88/100 | A |
| **Data Display** (Table, Card, List, etc.) | 52 | 42 | 81% | 3 | 8 | 82/100 | B+ |
| **Forms** (Form, Checkbox, DatePicker, etc.) | 38 | 32 | 84% | 1 | 6 | 85/100 | B+ |
| **Navigation** (Menu, Tabs, Breadcrumb, etc.) | 28 | 24 | 86% | 0 | 3 | 80/100 | B+ |
| **Feedback** (Toast, Modal, Alert, etc.) | 24 | 22 | 92% | 0 | 2 | 78/100 | A- |
| **Layout** (Grid, Container, Split, etc.) | 20 | 18 | 90% | 0 | 1 | 92/100 | A |
| **Charts** (Line, Bar, Pie, etc.) | 32 | 18 | 56% | 2 | 12 | 65/100 | C |
| **Utils** (Portal, FocusTrap, etc.) | 18 | 14 | 78% | 0 | 4 | 85/100 | B |
| **Icons** | 12 | 10 | 83% | 0 | 2 | 95/100 | A |
| **Themes** (Light, Dark, High-contrast) | 8 | 6 | 75% | 0 | 2 | 90/100 | B+ |
| **Patterns** (Auth flow, Onboarding, etc.) | 8 | 4 | 50% | 4 | 4 | 72/100 | C- |
| **Total** | **285** | **233** | **82%** | **12** | **49** | **81/100** | **B+** |

### Design token compliance

| Token category | Token count | Compliance rate | Hardcoded violations | Top offender team | Most violated token | Trend |
|---|---|---|---|---|---|---|
| **Color** | 180 | 88% | 420 | Growth (145) | `gray-500` → `#6b7280` | ↓ 2% |
| **Typography** | 95 | 78% | 285 | Integrations (82) | `font-size-14` → `14px` | ↓ 3% |
| **Spacing** | 85 | 82% | 250 | AI/ML UI (68) | `spacing-4` → `16px` | → |
| **Shadows** | 35 | 92% | 68 | Mobile (25) | `shadow-md` → custom | ↑ 1% |
| **Motion** | 40 | 85% | 95 | Growth (30) | `duration-200` → `0.2s` | → |
| **Breakpoints** | 25 | 90% | 52 | Admin Dashboard (18) | `breakpoint-md` → `768px` | ↑ 2% |
| **Border radius** | 12 | 95% | 28 | Mobile (8) | `radius-md` → `6px` | → |
| **Z-index** | 8 | 88% | 52 | All teams | `z-modal` → `9999` | ↓ 1% |
| **Total** | **480** | **86%** | **1,250** | | | **↓ 1.5%** |

### Accessibility compliance

| WCAG criterion | Level | Components compliant | Compliance % | Automated tests | Manual audit | Critical gaps |
|---|---|---|---|---|---|---|
| **1.1.1 Non-text Content** | A | 265/285 | 93% | Yes | Partial | Chart alt text missing |
| **1.3.1 Info and Relationships** | A | 248/285 | 87% | Yes | Yes | Table header associations |
| **1.4.1 Use of Color** | A | 258/285 | 91% | Yes | Yes | Chart color-only indicators |
| **1.4.3 Contrast (Minimum)** | AA | 262/285 | 92% | Yes | Yes | Disabled state contrast |
| **2.1.1 Keyboard** | A | 251/285 | 88% | Yes | Partial | Dropdown keyboard nav |
| **2.4.3 Focus Order** | A | 245/285 | 86% | Yes | Partial | Modal focus trapping |
| **2.4.7 Focus Visible** | AA | 222/285 | 78% | Yes | Yes | Custom focus indicators |
| **3.3.2 Labels or Instructions** | A | 248/285 | 87% | Yes | Yes | Complex form labels |
| **4.1.1 Parsing** | A | 270/285 | 95% | Yes | Yes | Minimal issues |
| **4.1.2 Name, Role, Value** | A | 242/285 | 85% | Yes | Yes | ARIA on custom widgets |
| **4.1.3 Status Messages** | AA | 195/285 | 68% | No | Partial | Toast/alert role missing |
| **Overall WCAG 2.2 AA** | | | **82%** | | | |
| **Overall WCAG 2.2 AAA** | | | **58%** | | | |

### Versioning and release health

| Version | Release date | Type | Components changed | Breaking changes | Migration guide | Adoption (4 weeks) | Issues |
|---|---|---|---|---|---|---|---|
| v4.8.2 | 2026-08-01 | Patch | 3 (Button, Input, Toast) | 0 | N/A | 65% | None |
| v4.8.1 | 2026-07-22 | Patch | 5 (Table, Modal, Select) | 0 | N/A | 82% | None |
| v4.8.0 | 2026-07-08 | Minor | 18 (Charts, DataGrid, Forms) | 0 | Yes | 58% | Chart API changed |
| v4.7.1 | 2026-06-25 | Patch | 2 (DatePicker, Menu) | 0 | N/A | 88% | None |
| v4.7.0 | 2026-06-10 | Minor | 12 (Navigation, Layout) | 1 | Yes | 45% | Breadcrumb API breaking |
| v4.6.0 | 2026-05-15 | Minor | 15 (Forms, Feedback) | 0 | Yes | 72% | None |
| v4.5.0 | 2026-04-20 | Major | 42 (Theme, Icons, Core) | 8 | Yes | 28% | **Theme v2 migration slow** |
| v4.4.2 | 2026-04-05 | Patch | 4 (Core) | 0 | N/A | 85% | None |

### Deprecation pipeline

| Component | Deprecated | Removal target | Replacement | Migration effort | Teams still using | Migration status |
|---|---|---|---|---|---|---|
| `LegacyTable` | v4.5.0 (2026-04) | v5.0.0 (2026-10) | `DataGrid` | Medium | 4 teams (28 instances) | 45% migrated |
| `OldButton` | v4.3.0 (2026-02) | v4.9.0 (2026-09) | `Button` v2 | Low | 2 teams (42 instances) | 62% migrated |
| `Panel` | v4.4.0 (2026-03) | v4.9.0 (2026-09) | `Card` | Low | 1 team (12 instances) | 78% migrated |
| `Dropdown (classic)` | v4.5.0 (2026-04) | v5.0.0 (2026-10) | `Select` | Medium | 3 teams (35 instances) | 38% migrated |
| `Tabs (old API)` | v4.2.0 (2026-01) | v4.8.0 (2026-08) | `Tabs` v2 | Low | 1 team (8 instances) | 85% migrated |
| `Modal (imperative)` | v4.0.0 (2025-11) | v4.7.0 (2026-07) | `Modal` (declarative) | High | 2 teams (18 instances) | 72% migrated |
| `Chart (legacy)` | v4.5.0 (2026-04) | v5.0.0 (2026-10) | `Chart` v2 | High | 5 teams (65 instances) | 22% migrated |
| **Total** | | | | | **12 components, 208 instances** | **48% avg** |

### Contribution health

| Contribution metric | Current | 3 months ago | 6 months ago | Target | Trend |
|---|---|---|---|---|---|
| Contributors (monthly) | 18 | 15 | 12 | 25 | ↑ |
| Design system team | 5 (28%) | 5 (33%) | 5 (42%) | < 30% | ↓ |
| External contributors | 13 (72%) | 10 (67%) | 7 (58%) | > 70% | ↑ |
| PRs opened/month | 32 | 28 | 22 | 40 | ↑ |
| PRs merged/month | 24 | 20 | 15 | 30 | ↑ |
| PR review time (external) | 3.5 days | 4.8 days | 7.2 days | < 2 days | ↓ |
| New component proposals | 8/month | 6/month | 4/month | 10/month | ↑ |
| Bug reports | 12/month | 15/month | 18/month | < 10/month | ↓ |
| Contribution satisfaction | 72/100 | 65/100 | 58/100 | > 80 | ↑ |

### Contribution pipeline

| Stage | Count | Avg duration | Bottleneck |
|---|---|---|---|
| **Proposal** (RFC submitted) | 8 | 5 days | Stakeholder review |
| **Design review** (UX approved) | 5 | 8 days | Design capacity |
| **Implementation** (PR open) | 6 | 12 days | Engineering review |
| **Accessibility audit** | 3 | 4 days | A11y specialist availability |
| **Documentation** | 2 | 3 days | Writer review |
| **Released** | 24/year | 32 days total | |

### Design system NPS and satisfaction

| Metric | Score | Target | Trend | Top complaint |
|---|---|---|---|---|
| **Overall NPS** | 32 | > 50 | ↑ 8 pts | Documentation gaps |
| **Developer satisfaction** | 68/100 | > 80 | ↑ 5 pts | Breaking changes too frequent |
| **Designer satisfaction** | 74/100 | > 80 | ↑ 3 pts | Figma-code sync lag |
| **Component quality** | 78/100 | > 85 | ↑ 2 pts | Edge cases in complex components |
| **Documentation quality** | 62/100 | > 80 | ↑ 8 pts | Missing interactive examples |
| **Migration support** | 55/100 | > 75 | → | Migration guides incomplete |
| **Support responsiveness** | 70/100 | > 85 | ↑ 6 pts | Slack response time (4h avg) |

### Design-code sync health

| Metric | Current | Target | Gap |
|---|---|---|---|
| Figma components with code equivalents | 245/285 (86%) | 95% | 40 components |
| Figma properties synced to code props | 78% | 95% | Naming inconsistencies |
| Design token parity (Figma ↔ code) | 82% | 98% | 86 tokens out of sync |
| Time from Figma update to code release | 8.5 days | < 5 days | Process bottleneck |
| Visual regression test coverage | 185/285 (65%) | 90% | 100 components uncovered |
| Storybook stories per component | 2.2 avg | 3+ | Interactive states missing |

## Action recommendations

1. **Chart component overhaul**: 56% adoption, 65/100 a11y; the Charts category is the weakest link — redesign with accessibility-first approach, add screen reader descriptions
2. **Token compliance automation**: 1,250 hardcoded values; implement stylelint plugin + CI gate to block hardcoded design tokens, target 95% compliance
3. **Migration support for v4.5.0 Theme v2**: 28% adoption after 3 months; create automated codemod, per-team migration office hours, target 80% by v4.9.0
4. **Deprecation acceleration**: 12 deprecated components, 48% avg migration; prioritize `Modal (imperative)` removal (overdue), `Chart (legacy)` (22% migrated)
5. **External contribution velocity**: 3.5 days PR review; add dedicated design system reviewer rotation, target < 2 days review time
6. **Documentation quality**: 62/100 satisfaction, top complaint; add interactive Storybook playgrounds, copy-paste code snippets, per-component design rationale
7. **Accessibility gap closure**: 82% WCAG 2.2 AA; focus on focus management (78%), status messages (68%), keyboard navigation (88%)
8. **Design-code sync**: 78% Figma-code parity; implement design token automation pipeline, auto-generate token JSON from Figma → publish to npm
9. **Breaking change reduction**: 2 major releases/year; implement 6-month deprecation window, automated migration codemods, breaking change impact assessment
10. **Monthly design system review**: review adoption, token compliance, a11y, contribution health, and NPS with design and engineering leadership



- The "one more component" trap → building new components instead of improving adoption of existing ones; a design system with 300 components at 50% adoption is worse than one with 200 at 90%
- Hardcoded values as "just this once" → every hardcoded color, spacing, or font size is a future inconsistency; "just this once" becomes "just this 1,250 times"
- Breaking changes without migration paths → shipping a breaking change without a codemod or migration guide; every breaking change without a migration path is a betrayal of trust
- Design system as a gatekeeper → requiring design system team approval for every component change; this creates a bottleneck — the team should be a platform, not a gate
- Figma-first, code-second → designing components in Figma without considering code implementation; the source of truth is the code, Figma is a design tool — sync must be bidirectional

## Related

- Same class: [dashboard-ux-health](dashboard-ux-health.md) — UX and usability health
- Same class: [dashboard-product-portfolio](../metrics/dashboard-product-portfolio.md) — product portfolio health
- Same class: [dashboard-user-research](../discovery/dashboard-user-research.md) — user research operations
- Same class: [dashboard-developer-experience](../../../engineer/engineering/dashboard-developer-experience.md) — developer experience
- Same class: [dashboard-quality-metrics](../../../engineer/quality-security/dashboard-quality-metrics.md) — code quality and testing
- References: Brad Frost — *Atomic Design*; Nathan Curtis — *Design System Maturity Model*; Diana Mounter — *Design Systems at GitHub*; Shopify — *Polaris Design System*; Material Design 3 — *Design Token Architecture*; W3C — *WCAG 2.2*