---
title: accessibility compliance dashboard
aliases:
- a11y dashboard
- accessibility audit dashboard
- WCAG compliance dashboard
- inclusive design dashboard
- digital accessibility dashboard
tags:
- dashboard
- accessibility
- a11y
- wcag
- inclusive-design
- ada-compliance
- vpat
- screen-reader
category: product-manager/discovery/ux
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: dashboard
status: stable
lifecycle: active
review_cycle: weekly
roles:
- product-manager
- engineer
- tech-lead
- executive
benefit: accessibility compliance, WCAG conformance, and inclusive design quality visible at a glance
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
- WCAG compliance, screen reader compatibility, keyboard navigation, color contrast, assistive technology, and legal risk defined
related:
- ./dashboard-ux-health.md
- ./dashboard-design-system.md
- ./dashboard-content-design.md
- ./dashboard-information-architecture.md
- ../../metrics/dashboard-customer-feedback-satisfaction.md
tacit: false
---

# accessibility compliance dashboard

> **As a** product manager, **I want to** track accessibility compliance across all products, **so that** every user — regardless of ability — can perceive, operate, understand, and interact with our products, and accessibility is a measured, continuously improving practice, not a last-minute remediation sprint before a lawsuit.

> Accessibility is not a feature — it's a fundamental quality of the product. This dashboard tracks WCAG conformance, screen reader compatibility, keyboard navigation, color contrast, assistive technology support, and legal/compliance risk — turning accessibility from "we'll fix it later" into a governed, measured, and continuously improving engineering discipline.

## Summary

- 6 accessibility dimensions: WCAG conformance, screen reader compatibility, keyboard navigation, color contrast, assistive technology support, legal/compliance risk
- 4 products (YiVad, YiWeb, YiPet, YiAi); 285 pages/screens; 12,850 accessibility checks/month; 3 active VPATs
- WCAG 2.2 conformance: 82% AA compliance; 58% AAA compliance; 285 known issues (42 critical, 88 serious, 155 moderate); avg issue resolution: 28 days
- Screen reader compatibility: 78% of pages tested with NVDA/JAWS/VoiceOver; 185 issues; 42 critical (missing labels, broken landmarks); 8 pages completely inaccessible
- Keyboard navigation: 85% of interactive elements keyboard-accessible; 125 focus order issues; 22 keyboard traps; 18 custom widgets without ARIA patterns
- Dashboard reviewed weekly; accessibility audit with product and engineering monthly

## Core viewpoints

- Accessibility is a design constraint, not a feature — if you design for accessibility from the start, you get better UX for everyone (keyboard shortcuts, clear labels, high contrast); if you bolt it on later, you get a disjointed experience that satisfies neither disabled nor non-disabled users
- Screen readers are not the only assistive technology — voice control, switch devices, screen magnifiers, braille displays, and eye-tracking all rely on the same semantic HTML and ARIA that screen readers need; testing with only one AT means you're testing 20% of your accessibility
- The POUR principles are the constitution of accessibility — Perceivable (can users sense it?), Operable (can users interact with it?), Understandable (can users comprehend it?), Robust (can assistive technologies parse it?); every accessibility issue maps to a POUR violation
- Accessibility debt compounds faster than technical debt — a new page without accessibility is 10-20 new issues; a redesign without accessibility is 50-100 new issues; every sprint without accessibility review adds 2-3 weeks of remediation later

## Key information

### 6-panel accessibility compliance overview

```
┌──────────────────────────────────────────────────────────────────┐
│  WCAG CONFORMANCE                    │  SCREEN READER COMPATIBILITY         │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  AA compliance: 82%      │   │  │  Pages tested: 78% (222) │   │
│  │  AAA compliance: 58%     │   │  │  NVDA: 82% pass rate     │   │
│  │  Critical issues: 42     │   │  │  JAWS: 78% pass rate     │   │
│  │  Serious issues: 88      │   │  │  VoiceOver: 85% pass     │   │
│  │  Moderate issues: 155    │   │  │  Critical SR issues: 42  │   │
│  │  Avg fix time: 28 days   │   │  │  Inaccessible pages: 8   │   │
│  │  WCAG score: B- (72)     │   │  │  Screen reader: B- (72)  │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  KEYBOARD NAVIGATION                  │  COLOR CONTRAST                      │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Keyboard accessible:85% │   │  │  Text contrast AA: 88%  │   │
│  │  Focus order issues: 125 │   │  │  Non-text contrast: 75% │   │
│  │  Keyboard traps: 22      │   │  │  Focus indicator: 82%   │   │
│  │  Skip links: 68% present │   │  │  Color-only indicators: │   │
│  │  Custom widgets w/o ARIA:│   │  │  45 instances (critical)│   │
│  │  18 (all critical)       │   │  │  Dark mode contrast: 72%│   │
│  │  Keyboard score: B- (72) │   │  │  Contrast score: B (78) │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  ASSISTIVE TECHNOLOGY                 │  LEGAL & COMPLIANCE RISK             │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Voice control: 62%      │   │  │  ADA Title III risk: Med│   │
│  │  Switch device: 45%      │   │  │  Section 508: 78%       │   │
│  │  Screen magnifier: 72%   │   │  │  EN 301 549: 72%        │   │
│  │  Braille display: 55%    │   │  │  VPATs current: 3 of 4  │   │
│  │  Motion reduction: 85%   │   │  │  Demand letters: 0      │   │
│  │  AT tested pages: 52%    │   │  │  Legal complaints: 0    │   │
│  │  AT score: C+ (65)       │   │  │  Compliance score: B(78)│   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### WCAG 2.2 conformance by product

| Product | Pages | AA compliance | AAA compliance | Critical | Serious | Moderate | Total issues | Trend |
|---|---|---|---|---|---|---|---|---|
| **YiVad** (AI chat) | 85 | 85% | 62% | 12 | 28 | 48 | 88 | +3% |
| **YiWeb** (dashboard) | 72 | 80% | 55% | 15 | 32 | 52 | 99 | +1% |
| **YiPet** (browser ext) | 58 | 78% | 52% | 8 | 18 | 35 | 61 | +2% |
| **YiAi** (agent platform) | 42 | 85% | 60% | 5 | 8 | 15 | 28 | +5% |
| **Marketing site** | 18 | 92% | 75% | 1 | 2 | 3 | 6 | +1% |
| **Documentation** | 10 | 88% | 68% | 1 | 0 | 2 | 3 | +2% |
| **Overall** | **285** | **82%** | **58%** | **42** | **88** | **155** | **285** | **+2%** |

### WCAG violation by principle (POUR)

| POUR principle | Violations | % of total | Critical | Most common issue | User impact | Fix complexity |
|---|---|---|---|---|---|---|
| **Perceivable** (1.x) | 95 | 33% | 18 | Missing alt text (1.1.1), low contrast (1.4.3), missing captions (1.2.2) | Blind users miss images, low-vision users can't read text, deaf users miss video content | Medium |
| **Operable** (2.x) | 105 | 37% | 15 | Keyboard traps (2.1.2), missing skip links (2.4.1), ambiguous link text (2.4.4), timeout (2.2.1) | Keyboard users trapped, screen reader users lost, cognitive disabilities overwhelmed | High |
| **Understandable** (3.x) | 52 | 18% | 5 | Missing language attr (3.1.1), inconsistent navigation (3.2.3), missing error suggestions (3.3.3) | Screen reader mispronunciation, form errors unexplained, unpredictable UI | Low-Medium |
| **Robust** (4.x) | 33 | 12% | 4 | Invalid ARIA (4.1.1), broken name/role/value (4.1.2), duplicate IDs | AT can't parse components, custom widgets invisible to screen readers | Medium |
| **Overall** | **285** | **100%** | **42** | | | |

### Screen reader compatibility by screen reader

| Screen reader | Browser | Pages tested | Pass rate | Critical issues | Common failures | User base |
|---|---|---|---|---|---|---|
| **NVDA** (Windows) | Chrome | 185 | 82% | 15 | Missing form labels, broken landmarks, aria-hidden on focusable elements | 42% of SR users |
| **NVDA** (Windows) | Firefox | 165 | 80% | 12 | Dynamic content not announced (aria-live missing), modal focus trapping | 15% of SR users |
| **JAWS** (Windows) | Chrome | 178 | 78% | 18 | Table headers missing, complex widgets without ARIA pattern, broken heading hierarchy | 28% of SR users |
| **VoiceOver** (macOS) | Safari | 195 | 85% | 8 | Custom checkboxes/radios, SVG without role, iframe without title | 18% of SR users |
| **VoiceOver** (iOS) | Safari | 142 | 82% | 5 | Touch targets < 44px, swipe gestures not announced, dynamic type breakage | 12% of SR users |
| **TalkBack** (Android) | Chrome | 128 | 75% | 8 | Focus order broken, content clipped at 200% zoom, custom sliders | 8% of SR users |
| **Overall** | | **222 (78%)** | **80%** | **42** | | |

### Keyboard navigation audit

| Product | Interactive elements | Keyboard accessible | Focus order issues | Keyboard traps | Skip link | Focus indicator visible | Tab order logical |
|---|---|---|---|---|---|---|---|
| **YiVad** | 1,250 | 88% (1,100) | 28 | 5 | Present | 85% | 82% |
| **YiWeb** | 1,850 | 82% (1,517) | 42 | 8 | Present | 78% | 75% |
| **YiPet** | 680 | 85% (578) | 22 | 4 | Missing | 82% | 80% |
| **YiAi** | 520 | 90% (468) | 12 | 2 | Present | 88% | 85% |
| **Marketing** | 320 | 92% (294) | 8 | 1 | Present | 90% | 88% |
| **Documentation** | 180 | 88% (158) | 13 | 2 | Missing | 75% | 72% |
| **Overall** | **4,800** | **85% (4,115)** | **125** | **22** | **68%** | **82%** | **79%** |

### Color contrast and visual accessibility

| Product | Text contrast AA (4.5:1) | Large text AA (3:1) | Non-text contrast (3:1) | Focus indicator (3:1) | Color-only indicators | Dark mode compliant | Sunburst/light mode |
|---|---|---|---|---|---|---|---|
| **YiVad** | 90% | 92% | 78% | 85% | 12 instances | 75% | 88% |
| **YiWeb** | 85% | 88% | 72% | 78% | 18 instances | 68% | 82% |
| **YiPet** | 88% | 90% | 75% | 82% | 8 instances | 72% | 85% |
| **YiAi** | 92% | 94% | 82% | 88% | 5 instances | 80% | 90% |
| **Marketing** | 95% | 96% | 88% | 90% | 2 instances | 85% | 92% |
| **Overall** | **88%** | **90%** | **75%** | **82%** | **45** | **72%** | **85%** |

### Legal and compliance risk

| Regulation | Scope | Requirement | Compliance | Gap | Risk level | Deadline |
|---|---|---|---|---|---|---|
| **ADA Title III** | US — public accommodations | WCAG 2.1 AA equivalent | 82% AA | 18% gap → 285 issues | Medium | Ongoing (DOJ active enforcement) |
| **Section 508** | US — federal procurement | WCAG 2.0 AA | 78% | 22% gap | Low (not selling to govt) | N/A |
| **EN 301 549** | EU — public sector + EAA | WCAG 2.1 AA | 72% | 28% gap | Medium-High | EAA: June 2025 (overdue) |
| **AODA** | Canada — Ontario | WCAG 2.0 AA | 80% | 20% gap | Low | Ongoing |
| **UK Equality Act** | UK | Reasonable adjustment | 78% | Assessed case-by-case | Low-Medium | Ongoing |
| **VPAT** | Procurement requirement | WCAG 2.1 AA conformance | 3 of 4 products have current VPAT | YiPet missing VPAT | Medium | YiPet VPAT: Q3 2026 |
| **Accessibility statement** | Best practice | Public statement on each product | 2 of 4 products | YiPet, YiAi missing | Low | Q3 2026 |

### Accessibility testing coverage

| Testing method | Frequency | Coverage | Issues found/month | Automation | Tools |
|---|---|---|---|---|---|
| **Automated (axe-core)** | Per PR | 100% of new code | 45 | 100% automated in CI | axe-core, eslint-plugin-jsx-a11y |
| **Automated (Lighthouse)** | Weekly | 100% of pages | 28 | 100% automated | Lighthouse CI |
| **Manual keyboard audit** | Monthly | 25% of pages (rotating) | 18 | 0% | Manual |
| **Screen reader audit** | Monthly | 15% of pages (rotating) | 22 | 0% | NVDA, JAWS, VoiceOver |
| **Color contrast scan** | Per PR | 100% of new UI | 12 | 100% automated | contrast-ratio, axe |
| **Accessibility user testing** | Quarterly | 5% of pages (critical flows) | 35 | 0% | Fable, Access Works |
| **VPAT/ACR review** | Annually | Per product | 8 | 0% | Manual |
| **Overall** | | | **168** | **52% automated** | |

## Action recommendations

1. **Critical issue remediation sprint**: 42 critical issues (screen reader, keyboard traps); prioritize 42 critical fixes, target 0 critical issues within 60 days, block release on critical a11y regressions
2. **Keyboard trap elimination**: 22 keyboard traps (users can't escape modals, dropdowns, date pickers); audit all modal/dropdown/overlay components, add ESC to close, focus trapping, target 0 traps
3. **Screen reader testing expansion**: only 78% of pages tested with screen readers, 8 pages completely inaccessible; test 100% of pages with at least 2 screen readers, add screen reader test to definition of done
4. **Assistive technology coverage**: 52% of pages tested with non-screen-reader AT (voice control, switch, braille); expand AT testing to 80%, partner with AT users for quarterly testing
5. **Dark mode contrast**: 72% dark mode contrast compliance; audit all dark mode themes, ensure 4.5:1 contrast ratio in dark mode, add dark mode to automated contrast checks
6. **Color-only indicators**: 45 instances of color-only information (graphs, status badges, error states); add patterns/icons/text labels alongside color, target 0 color-only indicators
7. **European Accessibility Act readiness**: EAA already in effect (June 2025), 72% EN 301 549 compliance; accelerate EU compliance to 90%+, prepare conformity assessment documentation
8. **YiPet VPAT completion**: YiPet missing VPAT; complete VPAT 2.4 for YiPet, publish accessibility statement, target completion Q3 2026
9. **Automated a11y testing CI enforcement**: 52% automated testing; add axe-core to all PR checks, block merge on critical a11y violations, add Lighthouse a11y score to CI dashboard
10. **Weekly accessibility review**: review WCAG conformance, screen reader compatibility, keyboard navigation, color contrast, AT support, and legal risk with product and engineering



- The "accessibility overlay" shortcut → buying a one-line JavaScript widget that claims to "make your site accessible"; overlays address < 15% of accessibility issues, introduce new barriers for AT users, and do not protect against lawsuits — there is no substitute for building accessibly
- The "we'll fix it in the next redesign" deferral → accumulating accessibility debt with the promise of a future redesign; the redesign will have its own accessibility issues, and the current inaccessible product is excluding users right now — fix what exists before rebuilding
- Color as the only differentiator → using red/green to indicate success/error, or color-coded charts without patterns; 8% of men and 0.5% of women have color vision deficiency — that's 1 in 12 users who can't see your color-only indicators
- The aria-label band-aid → sprinkling `aria-label` on every div instead of using semantic HTML; `<button>` is infinitely more accessible than `<div role="button" aria-label="submit" tabindex="0">` — ARIA should be a last resort, not a first choice
- Accessibility as a separate "track" → having an accessibility team that audits and files tickets while the main team ships inaccessible features; accessibility must be embedded in every team's definition of done — separate-track accessibility is always playing catch-up

## Related

- Same class: [dashboard-ux-health](dashboard-ux-health.md) — UX health
- Same class: [dashboard-design-system](dashboard-design-system.md) — design system health
- Same class: [dashboard-content-design](dashboard-content-design.md) — content design and UX writing
- Same class: [dashboard-information-architecture](dashboard-information-architecture.md) — information architecture
- Same class: [dashboard-customer-feedback-satisfaction](../metrics/dashboard-customer-feedback-satisfaction.md) — customer feedback and satisfaction
- References: W3C — *WCAG 2.2 Specification*; WebAIM — *Screen Reader User Survey*; Deque — *axe-core Accessibility Testing*; UK Government — *Accessibility Regulations*; European Commission — *European Accessibility Act (EAA)*; Inclusive Design Research Centre — *Inclusive Design Guide*; Sheri Byrne-Haber — *Giving a Damn About Accessibility*