---
title: UX Design Patterns and Checklist
aliases: [ux-patterns, usability-checklist, accessibility-checklist, design-checklist]
tags: [producter, discovery, ux, usability, accessibility, design]
category: producter/discovery/ux
created: 2026-08-24
updated: 2026-08-24
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [producter, engineer]
benefit: "Producters and engineers verify UX quality before release with a structured checklist covering usability, accessibility, and visual design"
acceptance_criteria:
  - "3 checklists: usability, accessibility, visual design"
  - "each item is verifiable (pass/fail)"
  - "includes YrY-specific UX patterns"
related:
  - ./README.md
  - ../../frameworks/do-user-research.md
  - ../../discovery/write-a-prd.md
  - ../../../curator/templates/usability-test-report.md
---

# UX Design Patterns and Checklist

> **When to use:** Before any user-facing release. Run the usability checklist on every feature; the accessibility checklist on every release; the visual design checklist on every UI change.

## Usability Checklist

### Navigation
- [ ] Can the user complete the primary task in ≤ 3 clicks from the home page?
- [ ] Is the current location clearly indicated (breadcrumb, active nav item)?
- [ ] Can the user go back? Is the back button behavior predictable?
- [ ] Is the search function visible and accessible from every page?

### Feedback
- [ ] Does every action produce immediate feedback (spinner, toast, animation)?
- [ ] Are loading states shown for operations > 500ms?
- [ ] Are error messages specific and actionable ("Connection refused" → "Cannot connect to YiAi. Check that the server is running on port 10086.")?
- [ ] Are success states confirmed (toast, green checkmark)?

### Forms
- [ ] Are required fields marked with `*`?
- [ ] Is validation real-time (not just on submit)?
- [ ] Are error messages next to the field they refer to?
- [ ] Can the user undo or cancel before submitting?

### Content
- [ ] Is the most important information visible without scrolling?
- [ ] Are empty states helpful? ("No projects yet" → "No projects yet. Create one or start from a demo.")
- [ ] Are destructive actions protected by confirmation dialogs?

## Accessibility Checklist

### Keyboard
- [ ] All interactive elements are reachable via Tab
- [ ] Focus order is logical (left-to-right, top-to-bottom)
- [ ] Focus is visible (visible outline or ring)
- [ ] Esc closes modals, dropdowns, and popovers
- [ ] Enter/Space activates buttons and links

### Screen Reader
- [ ] All images have `alt` text (or `aria-hidden` for decorative)
- [ ] Form inputs have associated `<label>` elements
- [ ] Dynamic content changes are announced (`aria-live` regions)
- [ ] Page has a logical heading hierarchy (h1 → h2 → h3)

### Visual
- [ ] Color contrast ratio ≥ 4.5:1 for normal text
- [ ] Information is not conveyed by color alone (add icons or text)
- [ ] Text can be resized to 200% without breaking layout
- [ ] `prefers-reduced-motion` is respected

## Visual Design Checklist

### Consistency
- [ ] Spacing follows the design system (4px/8px grid)
- [ ] Typography is consistent (max 2-3 font sizes per page)
- [ ] Colors are from the design system palette (not one-off hex values)
- [ ] Icons are from the same icon set (Ant Design Icons for YiVad/YiPet)

### Responsive
- [ ] Layout works at 320px (small phone) to 2560px (large desktop)
- [ ] No horizontal scrollbar at any supported width
- [ ] Touch targets are ≥ 44×44px (WCAG minimum)

### YiVad-Specific
- [ ] ProTable columns are responsive (hide low-priority columns on small screens)
- [ ] Dynamic routing breadcrumbs are correct
- [ ] Permission-based visibility is working (hidden elements don't leave gaps)

### YiPet-Specific
- [ ] Chat window doesn't overflow the viewport
- [ ] Popup is usable at minimum Chrome extension popup size
- [ ] Content script injection doesn't break host page layout
- [ ] Dark mode respected (popup and chat window)

## YrY UX Patterns

### Loading States

| Pattern | YiVad | YiPet |
|---|---|---|
| Page load | ProTable skeleton | Spin while loading sessions |
| Action in progress | Button loading state | Send button disabled + spinner |
| Streaming | N/A | Phase indicator (thinking → retrieving → streaming) |
| Empty state | "No data" with CTA button | "No sessions yet" with quick-start prompt |

### Error States

| Error | User sees | Action |
|---|---|---|
| YiAi unreachable | "Cannot connect to server. Check that YiAi is running on port 10086." | Retry button |
| Network timeout | "Request timed out. Check your connection." | Retry button |
| Permission denied | "You don't have access to this page." | Back to home button |
| Validation error | Field-level error message | Fix the field |

### Confirmation Dialogs

Use for: delete, destructive edits, irreversible actions.

Pattern:
```
┌─────────────────────────────────┐
│ ⚠️ Delete "Project SHOP"?       │
│                                 │
│ This will delete the project,   │
│ all issues, cycles, and         │
│ releases. This cannot be undone.│
│                                 │
│ Type "SHOP" to confirm:         │
│ [___________]                   │
│                                 │
│ [Cancel]  [Delete Project]      │
└─────────────────────────────────┘
```

## Anti-patterns

| Anti-pattern | Why it fails | Fix |
|---|---|---|
| "No data" empty state with no CTA | User doesn't know what to do next | Always include a CTA: "Create your first X" or "Start from a demo" |
| Silent failures | User clicks, nothing happens; thinks the app is broken | Every action produces feedback: success, error, or loading |
| Technical error messages | "ECONNREFUSED 127.0.0.1:10086" means nothing to most users | Translate: "Cannot connect to YiAi. Check that the server is running." |
| No focus management after modal opens | Keyboard focus stays behind the modal; screen reader users are trapped | Move focus to the modal when it opens; restore focus when it closes |