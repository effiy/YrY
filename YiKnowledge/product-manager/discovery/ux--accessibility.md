---
title: Web Accessibility Standards (WCAG 2.1/2.2)
aliases:
  - Accessibility
  - A11y
  - WCAG
  - Web Content Accessibility Guidelines
tags:
  - UX
  - accessibility
  - a11y
  - WCAG
  - compliance
  - inclusive-design
category: product-manager/discovery/ux
created: 2026-08-07
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles:
  - product-manager
  - engineer
benefit: PMs can ensure products are usable by people with disabilities, meeting legal compliance requirements and expanding the addressable user base
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - nielsen-heuristics.md
  - mobile-usability.md
  - ./dashboard-accessibility-compliance.md
  - ../../frameworks/README.md
tacit: false
---

# Web Accessibility Standards (WCAG 2.1/2.2)

> **As a** product manager, **I want to** understand and apply WCAG 2.1/2.2 accessibility standards, **so that** our products are usable by people with diverse abilities and meet legal compliance requirements.

> Accessibility is not a feature; it is a quality attribute of the product. A product that is inaccessible to 15% of the world's population (over 1 billion people with disabilities) is a broken product. WCAG conformance is the minimum bar, not the ceiling.

## Summary

- WCAG (Web Content Accessibility Guidelines) is the global standard, organized around four principles (POUR): Perceivable, Operable, Understandable, Robust. Each principle has guidelines, and each guideline has testable success criteria at three levels (A, AA, AAA).
- WCAG 2.1 (2018) added 17 criteria focused on mobile, low vision, and cognitive disabilities. WCAG 2.2 (2023) added 9 criteria focused on focus appearance, dragging, and consistent help.
- The practical target for most products is WCAG 2.1 Level AA, which is the legal standard in many jurisdictions (Section 508 in the US, EN 301 549 in the EU).
- Accessibility is not just about screen readers. It covers keyboard navigation, color contrast, focus management, semantic HTML, motion sensitivity, and cognitive load.
- Retrofitting accessibility is 10-30x more expensive than building it in from the start. Every sprint should include accessibility acceptance criteria.

## Core viewpoints

- **Accessibility is a quality attribute, not a feature** -- just as you would not ship a product with broken authentication, you should not ship a product with broken accessibility. It is part of the definition of done.
- **WCAG AA is the minimum, not the goal** -- Level AA conformance means the product is not actively excluding people with disabilities. It does not mean the product is delightful to use. Treat AA as the floor, and continuously improve beyond it.
- **Keyboard accessibility is the foundation** -- if a product is not fully keyboard-navigable, it is not accessible. Screen reader users, mobility-impaired users, and power users all rely on keyboard navigation. Every interactive element must be reachable and operable via keyboard.
- **Color is not the only way to convey information** -- error states, charts, and status indicators must use more than color to differentiate. Add icons, text labels, or patterns. 8% of men have some form of color vision deficiency.
- **Automated tools catch 30% of issues** -- tools like axe, Lighthouse, and WAVE can detect missing alt text, low contrast, and missing labels. But they cannot detect keyboard traps, illogical focus order, or confusing content. Manual testing is required.

## Key information

### The four POUR principles

| Principle | Meaning | Key question |
|---|---|---|
| Perceivable | Users must be able to perceive the content through at least one sense | Can all users perceive the content, regardless of which senses they rely on? |
| Operable | Users must be able to operate the interface | Can all users interact with every control, regardless of input method? |
| Understandable | Users must be able to understand the content and interface | Can all users understand the content, navigation, and error messages? |
| Robust | Content must be compatible with current and future assistive technologies | Does the content work with screen readers, magnifiers, and other AT? |

### Conformance levels

| Level | Description | Examples | When to target |
|---|---|---|---|
| A (minimum) | Basic accessibility; the web page is not completely inaccessible | Non-text content has alt text, no keyboard traps, no auto-playing audio | The absolute minimum; insufficient for legal compliance |
| AA (mid-range) | Addresses the most common barriers for disabled users | Color contrast >= 4.5:1, focus indicators visible, consistent navigation | Legal standard in most jurisdictions; target for all products |
| AAA (highest) | The highest standard; not achievable for all content | Contrast >= 7:1, sign language interpretation, no time limits | Aspirational; target for specific content where feasible |

### Critical WCAG 2.1 AA success criteria (priority order)

| # | Criterion | Requirement | How to test |
|---|---|---|---|
| 1 | 1.1.1 Non-text Content (A) | All images and non-text content have text alternatives | Audit all `<img>` tags for `alt` attributes; decorative images use `alt=""` |
| 2 | 1.4.3 Contrast Minimum (AA) | Text has 4.5:1 contrast ratio; large text 3:1 | Use axe DevTools or a contrast checker on every color combination |
| 3 | 2.1.1 Keyboard (A) | All functionality is operable via keyboard | Tab through the entire page; every interactive element must receive focus and be operable |
| 4 | 2.4.3 Focus Order (A) | Focus order is logical and preserves meaning | Tab through the page; focus must move in a logical order (left-to-right, top-to-bottom in LTR) |
| 5 | 2.4.7 Focus Visible (AA) | Keyboard focus indicator is visible | Tab through the page; every focused element must have a visible focus indicator |
| 6 | 3.3.2 Labels or Instructions (A) | All inputs have labels or instructions | Audit every form field; each must have a visible label and a programmatic label |
| 7 | 4.1.2 Name, Role, Value (A) | All UI components have programmatic names, roles, and values | Use the accessibility tree in DevTools to verify every interactive element has a name and role |
| 8 | 1.4.4 Resize Text (AA) | Text can be resized to 200% without loss of content or functionality | Zoom to 200% in the browser; verify no content is cut off or overlapping |
| 9 | 2.4.6 Headings and Labels (AA) | Headings and labels describe the topic or purpose | Review all headings; they should form a logical outline. Labels should be descriptive. |
| 10 | 3.3.1 Error Identification (A) | Errors are identified and described in text | Trigger form validation errors; verify each error has a text description that is programmatically associated with the field |

### WCAG 2.2 additions (2023)

| Criterion | Requirement | Why it matters |
|---|---|---|
| 2.4.11 Focus Not Obscured (AA) | Focused element is not entirely hidden by sticky content | Fixed headers/footers can hide the focused element; ensure it remains visible |
| 2.4.12 Focus Not Obscured (AAA) | Focused element is not partially hidden by sticky content | Stricter version for AAA |
| 2.5.7 Dragging Movements (AA) | Drag operations have a single-pointer alternative | Not all users can perform drag gestures; provide click-to-select alternatives |
| 2.5.8 Target Size (AA) | Pointer targets are at least 24x24px | Smaller targets are hard to hit for users with motor impairments |
| 3.2.6 Consistent Help (A) | Help mechanisms are in the same location across pages | Users with cognitive disabilities rely on consistent placement |
| 3.3.7 Accessible Authentication (AA) | No cognitive function tests for authentication | CAPTCHAs and puzzle-based authentication exclude users with cognitive disabilities |

### Screen reader testing basics

The most important manual test is to use a screen reader to navigate the product. Set aside 30 minutes per sprint for this.

| Screen reader | OS | How to start |
|---|---|---|
| VoiceOver | macOS/iOS | Cmd+F5 (macOS) or triple-click side button (iOS) |
| NVDA | Windows | Free download from nvaccess.org |
| JAWS | Windows | Commercial; most commonly used in enterprise |
| TalkBack | Android | Enable in Accessibility settings |

**Screen reader testing checklist:**
1. Can you navigate to every interactive element using only the screen reader?
2. Does every image have a meaningful alt text (or is marked decorative)?
3. Can you complete the primary user task without seeing the screen?
4. Are dynamic content changes (notifications, loading states) announced to the screen reader?
5. Are form errors announced and linked to the offending field?

### Semantic HTML cheat sheet

| Use this | Instead of this | Because |
|---|---|---|
| `<button>` | `<div onclick="...">` | Buttons are focusable and announced as "button" by screen readers |
| `<a href="...">` | `<span onclick="...">` | Links are focusable and navigable via screen reader link lists |
| `<nav>` | `<div class="nav">` | Screen readers can skip to navigation regions |
| `<main>` | `<div class="main">` | Screen readers can skip to main content |
| `<h1>` - `<h6>` | `<div class="heading">` | Screen readers can navigate by heading hierarchy |
| `<label for="...">` | `<span class="label">` | Labels are programmatically associated with inputs |
| `<fieldset>` + `<legend>` | `<div>` + `<span>` | Groups of related form fields are announced together |

### Accessibility in the development lifecycle

| Phase | Accessibility activity | Who |
|---|---|---|
| Design | Color contrast check, focus order map, heading hierarchy | Designer |
| Development | Semantic HTML, keyboard navigation, ARIA where needed | Engineer |
| Code review | Automated axe/lighthouse check in CI; manual keyboard review | Engineer + peer |
| QA | Screen reader test of primary user flows; keyboard-only test | QA engineer |
| Release | Accessibility conformance statement updated; known issues documented | PM |

## Action recommendations

1. Run an automated accessibility audit using axe DevTools or Lighthouse on every page. Fix all Level A and AA violations.
2. Establish WCAG 2.1 AA as the minimum acceptance criterion for all new features. Add it to the definition of done.
3. Test the primary user flow with a keyboard only (no mouse). Every interactive element must be reachable, focusable, and operable.
4. Test the primary user flow with a screen reader (VoiceOver or NVDA). Can a non-sighted user complete the task?
5. Audit all color usage. Ensure no information is conveyed by color alone. Add icons or text labels to error states, charts, and status indicators.
6. Add an accessibility statement to the product. State the conformance level, known issues, and how to report accessibility problems.
7. Train the engineering team on semantic HTML. Replace `<div>` and `<span>` with proper elements (`<button>`, `<nav>`, `<main>`, `<h1>`-`<h6>`).
8. Integrate axe-core into the CI pipeline. Fail the build on new WCAG A and AA violations.

## Anti-patterns

- **Accessibility as a post-launch task** -- "we will fix accessibility in the next release." Retrofitting is 10-30x more expensive. Build it in from the start.
- **Relying only on automated tools** -- automated tools catch 30% of issues. Manual keyboard and screen reader testing is required for the remaining 70%.
- **ARIA misuse** -- adding ARIA attributes without understanding them. The first rule of ARIA: don't use ARIA if native HTML can do the job. Incorrect ARIA is worse than no ARIA.
- **Accessibility overlay widgets** -- adding a third-party toolbar that claims to "fix accessibility." Overlays introduce new accessibility issues and do not fix the underlying problems.
- **Color-only indicators** -- using red/green to indicate error/success without text or icons. 8% of men cannot distinguish these colors.
- **Removing focus indicators** -- `outline: none` without providing an alternative focus indicator. Keyboard users are lost without a visible focus indicator.

## Related

- Same class: [nielsen-heuristics.md](./nielsen-heuristics.md) -- accessibility is a subset of usability; Nielsen's heuristics overlap with WCAG
- Same class: [mobile-usability.md](./mobile-usability.md) -- mobile accessibility (touch targets, screen reader gestures)
- Same class: [./dashboard-accessibility-compliance.md](./dashboard-accessibility-compliance.md) -- accessibility compliance tracking dashboard
- Upstream: [../../frameworks/README.md](../../frameworks/README.md) -- PM frameworks for prioritizing accessibility work
- References: W3C -- *Web Content Accessibility Guidelines (WCAG) 2.1/2.2*; WebAIM -- *Screen Reader User Survey*; Deque -- *axe-core*; Gov.uk -- *Accessibility in Government Digital Services*