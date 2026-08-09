---
title: content design and UX writing dashboard
aliases:
- UX writing dashboard
- content design dashboard
- content quality dashboard
- microcopy dashboard
tags:
- dashboard
- content-design
- ux-writing
- voice-tone
- readability
- localization
- microcopy
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
benefit: content design quality and UX writing effectiveness visible at a glance
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
- voice/tone consistency, readability, localization, microcopy effectiveness, and content ops defined
related:
- ./dashboard-ux-health.md
- ./dashboard-design-system.md
- ./dashboard-information-architecture.md
- ../dashboard-user-research.md
- ../../metrics/dashboard-feature-adoption.md
tacit: false
---

# content design and UX writing dashboard

> **As a** product manager, **I want to** track content design and UX writing quality, **so that** every word in the product is clear, consistent, on-brand, accessible, and helps users succeed — not confuse them.

> Words are the most-used UI component. This dashboard tracks voice and tone consistency, readability, localization coverage, microcopy effectiveness, content operations, and accessibility of written content — turning UX writing from "someone writes the strings before launch" into a measurable product quality discipline.

## Summary

- 6 content design dimensions: voice/tone consistency, readability, localization, microcopy effectiveness, content operations, content accessibility
- 28,500 UI strings across web + mobile; 8 content types; 15 supported languages; 12 content designers
- Voice/tone consistency score: 78/100 (target > 85); 22% of strings flagged as off-brand; 850 strings with inconsistent terminology
- Average readability: Grade 9.2 (target Grade 8); 35% of error messages above Grade 10; 12% of CTAs use jargon
- Localization: 92% translation coverage; 8 languages below 90% coverage; 18% of strings have localization bugs (truncation, missing, hardcoded)
- Microcopy A/B tests: 45 tests/year; average conversion lift from copy optimization: +12%; 28 error messages rewritten with 35% fewer support tickets
- Dashboard reviewed monthly; content design review quarterly with UX, product, and localization

## Core viewpoints

- Words are UI — every button label, error message, and empty state is a conversation with the user; bad copy is a bug, not a preference
- Consistency is clarity — when the same action is labeled "Save," "Submit," "Apply," and "OK" in different places, users learn that words don't mean anything; consistent terminology is an accessibility issue
- Readability is inclusion — if your content requires a post-graduate reading level, you're excluding users; Grade 8 is the target for consumer products, Grade 10 for professional tools
- Localization is not translation — it's content design for another culture; a string that works in English may truncate in German, offend in Japanese, or confuse in Arabic — localization without design is broken UX

## Key information

### 6-panel content design overview

```
┌──────────────────────────────────────────────────────────────────┐
│  VOICE & TONE                      │  READABILITY                        │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Consistency: 78/100     │   │  │  Avg grade level: 9.2    │   │
│  │  On-brand: 78%           │   │  │  Target: Grade 8          │   │
│  │  Off-brand: 22%          │   │  │  Grade < 8: 42%           │   │
│  │  Inconsistent terms: 850 │   │  │  Grade 8-10: 36%          │   │
│  │  Voice guide coverage:88%│   │  │  Grade > 10: 22%          │   │
│  │  Tone calibration: B+    │   │  │  Error msg > Grade 10:35% │   │
│  │  Brand voice score: B    │   │  │  CTA jargon: 12%          │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  LOCALIZATION                      │  MICROCOPY EFFECTIVENESS            │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Languages: 15 supported │   │  │  Copy tests/yr: 45       │   │
│  │  Coverage: 92%           │   │  │  Avg conversion lift:12% │   │
│  │  Langs < 90%: 8          │   │  │  Error msg rewritten: 28 │   │
│  │  Truncation bugs: 12%    │   │  │  Support ticket ↓: 35%   │   │
│  │  Hardcoded strings: 5%   │   │  │  Empty state tested: 18  │   │
│  │  Translation latency: 8d │   │  │  Onboarding copy: B+     │   │
│  │  Localization score: B   │   │  │  Microcopy score: B+     │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  CONTENT OPERATIONS                │  CONTENT ACCESSIBILITY              │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  UI strings: 28,500      │   │  │  Alt text: 82% coverage   │   │
│  │  String velocity: 320/mo │   │  │  Link text: 78% descriptive│  │
│  │  Content debt: 1,250     │   │  │  Heading hierarchy: 88%   │   │
│  │  Review cycle: 65% on    │   │  │  Screen reader: B+        │   │
│  │  Content reuse: 45%      │   │  │  Plain language: 72%      │   │
│  │  Figma-Code sync: 82%    │   │  │  Inclusive language: 85%  │   │
│  │  Content ops: B-         │   │  │  A11y score: B (80)      │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Voice and tone consistency

| Content attribute | Current | Target | Gap | Notes |
|---|---|---|---|---|
| **Overall voice consistency** | 78/100 | > 85 | -7 pts | 22% of strings deviate from voice guide |
| **Brand voice adherence** | 78% | > 90% | -12% | Measured by automated + manual audit |
| **Tone calibration** (context-appropriate) | 82/100 | > 85 | -3 pts | Error tone too formal, success too casual |
| **Terminology consistency** | 850 inconsistencies | 0 | +850 | Same concept with 3+ different labels |
| **Voice guide coverage** | 88% of components | 100% | -12% | 35 components without voice documentation |
| **New string voice review** | 72% reviewed | 100% | -28% | 28% of new strings go live without review |
| **Brand voice training** | 65% of writers | 100% | -35% | 35% of content contributors not trained |
| **Overall voice score** | **B (78)** | **A (88)** | | |

### Terminology inconsistency — top offenders

| Concept | Variant 1 | Variant 2 | Variant 3 | Occurrences | Recommended | Action |
|---|---|---|---|---|---|---|
| User account removal | "Delete account" | "Remove account" | "Close account" | 42 | "Delete account" | Standardize |
| Project group | "Workspace" | "Project" | "Team space" | 85 | "Workspace" | Standardize |
| Save action | "Save" | "Submit" | "Apply changes" | 128 | "Save" (context-dependent) | Standardize with context rules |
| Payment method | "Billing" | "Payment" | "Subscription" | 65 | "Billing" | Standardize |
| User authentication | "Sign in" | "Log in" | "Login" | 95 | "Sign in" (verb), "Sign-in" (adj) | Standardize |
| Notification preferences | "Alerts" | "Notifications" | "Updates" | 52 | "Notifications" | Standardize |
| Data export | "Export" | "Download" | "Extract" | 38 | "Export" | Standardize |
| Team member role | "Admin" | "Owner" | "Manager" | 45 | "Admin" (system), "Owner" (resource) | Clarify context |

### Readability by content type

| Content type | Strings | Avg grade level | Target grade | Below target | Above target | Flesch score | Health |
|---|---|---|---|---|---|---|---|
| **Button labels/CTAs** | 1,850 | 7.2 | 6 | 82% | 12% (jargon) | 72 | B+ (85) |
| **Error messages** | 1,250 | 10.5 | 8 | 28% | 35% | 48 | C (65) |
| **Empty states** | 520 | 8.8 | 8 | 45% | 18% | 62 | B (78) |
| **Onboarding flows** | 850 | 8.5 | 7 | 52% | 22% | 58 | B (76) |
| **Settings labels** | 2,200 | 9.2 | 8 | 38% | 28% | 55 | B- (72) |
| **Tooltips/help text** | 1,800 | 9.8 | 8 | 32% | 30% | 52 | C+ (68) |
| **Confirmation dialogs** | 680 | 8.2 | 7 | 55% | 15% | 65 | B (80) |
| **Notification copy** | 950 | 7.8 | 7 | 68% | 10% | 68 | B+ (84) |
| **Form field labels** | 3,200 | 8.5 | 8 | 48% | 20% | 60 | B (78) |
| **Marketing/product pages** | 380 | 9.5 | 8 | 35% | 25% | 55 | B- (72) |
| **Overall** | **28,500** | **9.2** | **8** | **42%** | **22%** | **58** | **B (76)** |

### Error message readability audit

| Error pattern | Occurrences | Avg grade | Before rewrite | After rewrite | Ticket reduction | Status |
|---|---|---|---|---|---|---|
| "An unexpected error occurred" | 85 | 12.0 | "An unexpected error occurred. Please try again." | "We couldn't save your changes. Check your connection and try again." | — | Rewriting |
| "Invalid input" | 120 | 11.5 | "Invalid input." | "Enter a valid email address, like name@example.com" | -42% | Done |
| "Access denied" | 65 | 10.8 | "Access denied. You do not have permission." | "You don't have access to this project. Contact your admin to request access." | -38% | Done |
| "Request failed with status 500" | 42 | 14.0 | "Request failed with status 500" | "Something went wrong on our end. We're on it — try again in a few minutes." | -55% | Done |
| "Quota exceeded" | 35 | 13.2 | "Quota exceeded. Upgrade your plan." | "You've used all 1,000 API calls this month. Upgrade to increase your limit." | -28% | Done |
| "Timeout" | 28 | 12.5 | "Request timeout." | "This is taking longer than expected. We'll keep trying in the background." | -45% | Done |
| "Validation error" (generic) | 180 | 11.0 | "Validation error. Check your input." | Per-field: "Password must be at least 8 characters and include a number." | -52% | In progress |

### Localization coverage

| Language | UI strings | Translated | Coverage | Missing | Machine-translated | Reviewed | Quality score |
|---|---|---|---|---|---|---|---|
| **English** (source) | 28,500 | 28,500 | 100% | 0 | 0% | 100% | A (95) |
| **Spanish** (es-ES) | 28,500 | 27,200 | 95% | 1,300 | 5% | 88% | B+ (85) |
| **French** (fr-FR) | 28,500 | 26,800 | 94% | 1,700 | 8% | 85% | B+ (84) |
| **German** (de-DE) | 28,500 | 26,500 | 93% | 2,000 | 10% | 82% | B (80) |
| **Japanese** (ja-JP) | 28,500 | 25,800 | 91% | 2,700 | 12% | 78% | B (78) |
| **Chinese Simplified** (zh-CN) | 28,500 | 26,200 | 92% | 2,300 | 8% | 82% | B (80) |
| **Korean** (ko-KR) | 28,500 | 24,500 | 86% | 4,000 | 15% | 72% | C+ (68) |
| **Portuguese** (pt-BR) | 28,500 | 25,500 | 89% | 3,000 | 12% | 75% | B- (72) |
| **Arabic** (ar-SA) | 28,500 | 23,800 | 84% | 4,700 | 18% | 68% | C+ (65) |
| **Russian** (ru-RU) | 28,500 | 24,200 | 85% | 4,300 | 15% | 70% | C+ (68) |
| **Italian** (it-IT) | 28,500 | 25,000 | 88% | 3,500 | 12% | 74% | B- (72) |
| **Dutch** (nl-NL) | 28,500 | 24,800 | 87% | 3,700 | 14% | 72% | C+ (68) |
| **Turkish** (tr-TR) | 28,500 | 23,200 | 81% | 5,300 | 20% | 65% | C (62) |
| **Polish** (pl-PL) | 28,500 | 22,800 | 80% | 5,700 | 22% | 62% | C (60) |
| **Thai** (th-TH) | 28,500 | 21,500 | 75% | 7,000 | 25% | 58% | D (52) |
| **Overall** | **427,500** | **392,100** | **92%** | | **12%** | **78%** | **B (76)** |

### Localization quality issues

| Issue type | Occurrences | % of strings | Languages affected | Severity | Example |
|---|---|---|---|---|---|
| **Text truncation** (UI overflow) | 3,420 | 12% | All non-English | High | German "Abbrechen" vs button width for "Cancel" |
| **Hardcoded English strings** | 1,425 | 5% | All non-English | Critical | Error messages in English on localized pages |
| **Missing translations** (empty) | 2,850 | 10% | Low-coverage languages | Critical | Empty button labels in Thai, Turkish |
| **Placeholder/format errors** | 1,850 | 6.5% | All non-English | Medium | "{{count}} items" broken in Arabic plural |
| **Date/number format mismatch** | 980 | 3.4% | Locale-specific | Medium | US date format in European locales |
| **RTL layout issues** | 650 | 8% (of Arabic) | Arabic | High | LTR text alignment in RTL interface |
| **Concatenation fragments** | 520 | 1.8% | All non-English | Medium | "You have" + count + " items" (word order varies) |
| **Cultural insensitivity** | 45 | 0.2% | Various | Medium | Hand gestures, colors, metaphors |

### Microcopy effectiveness

| Microcopy type | Strings tested | Tests run | Win rate | Avg lift | Best performer | Worst performer |
|---|---|---|---|---|---|---|
| **CTA buttons** | 85 | 18 | 72% | +14% | "Start free trial" > "Try for free" (+22%) | "Get started" (no change) |
| **Error messages** | 65 | 12 | 92% | -35% tickets | Actionable + empathetic > technical | — |
| **Empty states** | 42 | 8 | 75% | +18% engagement | "Create your first project →" (+28%) | No CTA in empty state |
| **Onboarding steps** | 35 | 5 | 80% | +15% completion | Benefit-focused > feature-focused (+19%) | — |
| **Pricing page** | 22 | 4 | 50% | +8% conversion | "Per seat/month" > "Per user/month" (+12%) | — |
| **Notification copy** | 48 | 6 | 67% | +10% CTR | Action-oriented > informative (+15%) | — |
| **Overall** | **297** | **45** | **71%** | **+12%** | | |

### Empty state copy audit

| Empty state | Current copy | Grade | Has CTA | CTA clarity | Suggested rewrite | Status |
|---|---|---|---|---|---|---|
| No projects | "No projects yet" | 6.0 | No | N/A | "You don't have any projects yet. Create your first project to get started." + CTA | Rewriting |
| No search results | "No results found" | 7.0 | No | N/A | "No results for '[query]'. Try a different search term or browse categories." + browse CTA | Done |
| No notifications | "You're all caught up!" | 5.5 | No | N/A | "No new notifications. We'll let you know when something needs your attention." | Done |
| Empty dashboard | "No data to display" | 8.5 | No | N/A | "Your dashboard is empty. Connect your first data source to see insights here." + CTA | Rewriting |
| No team members | "No members" | 6.0 | Yes | Weak | "You're the only member. Invite your team to collaborate on projects." + prominent CTA | Done |
| Empty file list | "This folder is empty" | 6.0 | No | N/A | "Nothing here yet. Upload files or drag and drop to get started." + upload CTA | Rewriting |

### Content operations

| Operations metric | Current | Target | Notes |
|---|---|---|---|
| **Total UI strings** | 28,500 | — | Growing 320/mo |
| **String velocity** (new/mo) | 320 | — | 3.8K new strings/year |
| **Content debt** (strings needing review) | 1,250 | < 200 | 4.4% of total strings |
| **Content review cycle** | 65% on schedule | > 90% | 35% of reviews delayed |
| **Content reuse rate** | 45% | > 60% | 55% of strings are unique (not from shared components) |
| **Figma-to-code sync** | 82% | > 95% | 18% of strings in code differ from Figma |
| **String freeze compliance** | 88% | > 95% | 12% of strings changed after localization freeze |
| **Content designer-to-engineer ratio** | 1:24 | 1:15 | 12 content designers for 285 engineers |
| **Time from draft to live** | 8.5 days | < 5 days | Review, translation, and implementation |
| **Overall content ops score** | **B- (72)** | **B+ (85)** | |

### Content accessibility

| Accessibility metric | Current | Target | WCAG level | Notes |
|---|---|---|---|---|
| **Alt text coverage** (images) | 82% | 100% | A | 450 images without alt text |
| **Descriptive link text** | 78% | 100% | A | 22% of links say "click here" or "learn more" |
| **Heading hierarchy** (sequential) | 88% | 100% | AA | 12% of pages skip heading levels |
| **Screen reader compatibility** | 82/100 | > 90 | AA | ARIA labels, live regions, announcements |
| **Plain language** (< Grade 8) | 72% | > 85% | AAA | 28% of content above Grade 8 |
| **Inclusive language** | 85% | > 95% | Best practice | 15% of strings flagged for inclusive review |
| **Readable font sizing** | 92% | 100% | AA | 8% of strings below 14px equivalent |
| **Color contrast for text** | 88% | 100% | AA | 12% of text elements below 4.5:1 contrast |
| **Overall content a11y** | **B (80)** | **A (90)** | | |

### Inclusive language audit

| Category | Flagged strings | % | Examples | Status |
|---|---|---|---|---|
| **Gendered language** | 285 | 37% | "guys," "he/she," "manpower" | 220 fixed |
| **Ableist language** | 180 | 23% | "crazy," "blind spot," "insane performance" | 145 fixed |
| **Age-biased language** | 65 | 8% | "digital native," "tech-savvy" | 52 fixed |
| **Culture-specific metaphors** | 120 | 15% | "home run," "touchdown," "knock it out of the park" | 85 fixed |
| **Violent language** | 85 | 11% | "kill the process," "trigger a build," "execute" | 70 fixed |
| **Other** | 45 | 6% | Various | 30 fixed |
| **Total** | **780** | | | **602 fixed (77%)** |

## Action recommendations

1. **Error message readability overhaul**: 35% of error messages above Grade 10; rewrite all error messages to Grade 8 or below, using the actionable + empathetic pattern
2. **Terminology standardization**: 850 inconsistent terms, 8 major conflicts; establish single source of truth terminology, implement automated consistency checking in CI/CD
3. **Low-coverage localization**: Thai (75%), Polish (80%), Turkish (81%), Arabic (84%); prioritize translation for these languages, target 90% minimum for all
4. **Hardcoded string elimination**: 5% of strings hardcoded in English; extract all strings to i18n framework, add lint rule to prevent hardcoded strings
5. **Content debt reduction**: 1,250 strings in backlog; triage into critical (user-facing), medium (internal), low (legacy), clear within 2 quarters
6. **Alt text completion**: 82% coverage, 450 missing; complete alt text for all images, add accessibility lint rule for new images
7. **Figma-code sync**: 18% drift between design and code; implement design-to-code string pipeline, add string audit to PR review
8. **Truncation prevention**: 12% of strings truncated in non-English locales; implement pseudolocalization testing, add 30% text expansion buffer for all UI components
9. **Inclusive language audit completion**: 178 remaining flagged strings; complete inclusive language update, add inclusive language lint rules
10. **Monthly content design review**: review voice consistency, readability, localization coverage, microcopy test results, and content operations with UX, product, and localization



- Lorem ipsum in production → "we'll write the real copy later"; placeholder text that ships to users is a broken window — it signals that nobody cares about the words
- Error messages written by the developer who wrote the bug → "Error: NullPointerException at line 342"; error messages are for users, not for developers — the user needs to know what happened and what to do next
- Voice guide as a PDF nobody reads → creating a beautiful voice and tone guide that sits in a shared drive; a voice guide without enforcement is a suggestion — implement automated voice checks or don't bother
- Translation as the last step → "the feature is built, now translate it"; localization is content design, not a post-processing step — strings designed for English will break in German, confuse in Japanese, and offend in Arabic
- Consistency as a style preference → "I prefer 'Log in' over 'Sign in'"; terminology consistency is not a preference — it's an accessibility and usability requirement, and it should be enforced by tooling, not taste

## Related

- Same class: [dashboard-ux-health](dashboard-ux-health.md) — UX health and usability
- Same class: [dashboard-design-system](dashboard-design-system.md) — design system health
- Same class: [dashboard-information-architecture](dashboard-information-architecture.md) — information architecture
- Same class: [dashboard-user-research](../dashboard-user-research.md) — user research operations
- Same class: [dashboard-feature-adoption](../../metrics/dashboard-feature-adoption.md) — feature adoption
- References: Google — *Material Design Writing Guidelines*; Microsoft — *Microsoft Style Guide*; W3C — *WCAG 2.2 (Content Accessibility)*; Hemingway App — *Readability Metrics*; 18F — *Content Guide*; Mailchimp — *Content Style Guide*; Intuit — *Content Design Manifesto*