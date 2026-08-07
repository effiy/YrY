---
title: Micro-Interaction Design
aliases:
  - Micro-interaction
  - Micro-interactions
  - Animation design
  - Feedback patterns
tags:
  - UX
  - design
  - animation
  - interaction
  - feedback
  - micro-interactions
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
benefit: PMs can specify micro-interaction requirements that make products feel responsive and trustworthy, reducing user anxiety and perceived wait time
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - nielsen-heuristics.md
  - ai-product-ux-patterns.md
  - mobile-usability.md
  - ../../frameworks/README.md
tacit: false
---

# Micro-Interaction Design

> **As a** product manager, **I want to** specify micro-interaction requirements for loading, feedback, and error states, **so that** the product feels responsive and trustworthy, and users are never left wondering "did it work?"

> Micro-interactions are the small moments in a product that communicate status, provide feedback, and guide behavior. They are the difference between a product that feels alive and a product that feels dead. A well-designed micro-interaction is invisible; a poorly designed one is all the user remembers.

## Summary

- Micro-interactions are the contained product moments that do one thing: a button press, a loading spinner, a notification, a pull-to-refresh, a swipe-to-delete, an error message. They are the smallest unit of interaction design.
- Every micro-interaction has four parts: trigger (what starts it), rules (what happens), feedback (what the user sees/hears/feels), and loops/modes (what happens over time or in repeated use).
- The primary purpose of micro-interactions is to communicate system status to the user, fulfilling Nielsen's first heuristic ("visibility of system status"). Without them, the user is left guessing.
- Well-designed micro-interactions reduce perceived wait time by 10-30% compared to static loading states. Animation and skeleton screens make waits feel shorter than spinners.
- Error recovery micro-interactions (undo, retry, edit) are the most impactful and most often neglected. A graceful error recovery can turn a frustrated user into a loyal one.

## Core viewpoints

- **A micro-interaction that is absent is a micro-interaction that is broken** -- the most common micro-interaction failure is not a bad animation; it is the complete absence of feedback. A button that is clicked with no response, a form that is submitted with no confirmation, a page that is loading with no indicator. Silence is the worst feedback.
- **Animation is not decoration; it is communication** -- every animation should answer a question: where did this come from? where is it going? what just happened? Animations that exist purely for visual appeal (the "bling" anti-pattern) slow down the user and add no value.
- **Perceived performance beats actual performance** -- a 200ms operation with good feedback feels faster than a 100ms operation with no feedback. Optimistic updates (showing the result before the server confirms) make the product feel instant. Skeleton screens make loading feel shorter than spinners.
- **Error recovery is a micro-interaction superpower** -- the difference between a good product and a great product is how it handles errors. Undo, retry, and edit-after-submit micro-interactions turn errors from dead ends into detours. Every error state should have a path forward.
- **Micro-interactions signal brand personality** -- the style of animation, the tone of feedback, and the design of empty states all communicate who the product is. A playful bounce animation signals a casual brand; a precise fade signals a professional brand. These choices are product decisions, not just design decisions.

## Key information

### The four-part structure of every micro-interaction

| Part | Description | Example (Like button) | Failure mode |
|---|---|---|---|
| Trigger | What initiates the micro-interaction | User taps the heart icon | No visual response to tap; user taps again |
| Rules | What happens, under what conditions | Toggle like state; if already liked, unlike; if not, like | Double-tap causes double-toggle; user is confused |
| Feedback | What the user perceives | Heart fills with color, brief scale animation, count increments | No feedback; user does not know if it worked |
| Loops/Modes | What happens over time or with repeated use | Heart stays filled on return; count persists across sessions | Heart resets on page reload; user thinks the like was lost |

### Loading state patterns

| Pattern | Description | Perceived speed | Best for | Avoid when |
|---|---|---|---|---|
| Skeleton screen | Gray placeholder shapes that mimic the layout of the content | Fastest (feels like content is loading progressively) | Page loads, list views, content-heavy screens | Content structure is highly variable |
| Spinner | A rotating indicator | Medium (feels like waiting) | Short operations (< 2 seconds) | Long operations (> 2 seconds); users perceive spinner as "stuck" |
| Progress bar | A bar that fills from 0% to 100% | Medium-Fast (feels like progress is being made) | Operations with known duration (file upload, export) | Duration is unknown; fake progress bars destroy trust |
| Optimistic update | Immediately show the result; roll back if the server returns an error | Fastest (feels instant) | High-confidence operations (like, save, delete) | Low-confidence operations or operations with side effects |
| Background indicator | A subtle indicator in the status bar or header | Does not block the user | Background sync, auto-save | Critical operations where the user must wait for confirmation |

### Feedback patterns by interaction type

| Interaction type | Minimal feedback | Good feedback | Excellent feedback |
|---|---|---|---|
| Button press | No response | Button changes color/state on press | Button animates, shows result inline, and provides haptic feedback |
| Form submission | Page reloads (or nothing) | Success message appears at top of page | Inline success with the submitted data shown, next step suggested |
| Delete | Item disappears (no confirmation) | Confirmation dialog + item removed | Undo toast appears for 5 seconds; item can be restored |
| Drag and drop | Item snaps to position | Item animates to new position, other items reflow | Ghost of original position remains; drop zone highlights as item approaches |
| Pull to refresh | Spinner appears | Pull-to-refresh animation with haptic feedback | Custom animation + timestamp of last refresh + new content count |

### Error recovery patterns

| Pattern | Description | When to use | Example |
|---|---|---|---|
| Undo | Allow the user to reverse the last action | Destructive actions (delete, archive, send) | "Item deleted. Undo?" (5-second toast) |
| Retry | Allow the user to attempt the operation again | Network failures, timeout errors | "Failed to save. [Retry] [Save locally]" |
| Edit in place | Allow the user to correct the input without starting over | Form validation errors, failed submissions | Inline error message with the field focused and editable |
| Graceful degradation | Show a reduced but functional experience | Feature unavailable due to permissions or connectivity | "Offline. You can still view saved items." |
| Fallback content | Show alternative content when the primary content fails | Image loading failures, API timeouts | Broken image replaced with a placeholder and description |

### Animation principles for micro-interactions

| Principle | Description | Do | Don't |
|---|---|---|---|
| Duration | How long the animation takes | 200-500ms for most interactions; < 200ms for subtle feedback | > 1 second for any UI animation (feels sluggish) |
| Easing | The acceleration curve of the animation | Ease-out for entering elements; ease-in for exiting elements | Linear easing (feels robotic and unnatural) |
| Purpose | What the animation communicates | Spatial relationships, state changes, attention direction | Decoration-only animations that add no information |
| Motion sensitivity | Respecting users who prefer reduced motion | Check `prefers-reduced-motion` media query; provide static alternatives | Animations that are essential for understanding the interface |
| Staggering | Animating elements in sequence | Stagger list items by 50-100ms each | Staggering too many items (causes a wave effect that feels slow) |

### Loading time thresholds and user perception

| Response time | User perception | Required feedback |
|---|---|---|
| < 100ms | Instant | None (but provide feedback anyway for perceived quality) |
| 100ms - 1s | The system is responding; slight delay noticeable | Subtle feedback (button state change, brief animation) |
| 1s - 10s | The user's attention is at risk; they may switch tasks | Progress indicator, skeleton screen, or estimated time remaining |
| > 10s | The user will leave unless engaged | Progress bar with estimated time, background processing with notification when complete |

### Micro-interaction audit checklist

For each interactive element in the product, ask:
1. **Trigger**: What initiates this micro-interaction? Is the trigger obvious to the user?
2. **Rules**: What happens? Are the rules consistent (same action = same result)?
3. **Feedback**: What does the user see/hear/feel? Is feedback immediate and unambiguous?
4. **Loops/Modes**: What happens if the user repeats the action? What happens if the action fails? What happens over time?
5. **Error state**: What happens when something goes wrong? Is there a path forward (undo, retry, edit)?
6. **Empty state**: What does the user see when there is no data? Is it an opportunity for guidance or a dead end?

## Action recommendations

1. Audit the product for missing feedback: every interactive element must respond to user action within 100ms. Identify and fix silent elements.
2. Replace spinners on operations longer than 2 seconds with skeleton screens or progress bars. Spinners signal "waiting"; skeleton screens signal "loading."
3. Add undo functionality to all destructive actions (delete, archive, send). Show a 5-second toast with an undo button.
4. Add retry and graceful degradation to all network-dependent operations. The user should never see a blank screen due to a network error.
5. Review all animations: does each animation communicate something (spatial relationship, state change, attention direction)? Remove decorative-only animations.
6. Check `prefers-reduced-motion` support. Provide static alternatives for users who have requested reduced motion.
7. Design error recovery micro-interactions for every error state. Every error must have a path forward.

## Anti-patterns

- **Silent interactions** -- clicking a button with no feedback. The user clicks again, potentially triggering the action twice. Every interactive element must respond.
- **Decorative animations** -- animations that exist purely for visual appeal and add no information. They slow the user down and increase cognitive load. Every animation must communicate.
- **Fake progress bars** -- a progress bar that fills at a constant rate regardless of actual progress. It destroys trust. If you cannot measure progress, use a spinner or indeterminate indicator.
- **Spinners for everything** -- using a spinner for every loading state. Spinners feel like waiting. Skeleton screens and optimistic updates feel like progress.
- **No error recovery** -- an error message with no path forward. "Something went wrong" with no retry button, no undo, and no way to save current work. Every error must offer a way out.
- **Ignoring motion sensitivity** -- no `prefers-reduced-motion` support. Some users experience dizziness or nausea from animations. Respect their preference.

## Related

- Same class: [nielsen-heuristics.md](./nielsen-heuristics.md) -- micro-interactions fulfill Nielsen's first heuristic: visibility of system status
- Same class: [ai-product-ux-patterns.md](./ai-product-ux-patterns.md) -- AI-specific micro-interactions (streaming output, thinking display, tool call transparency)
- Same class: [mobile-usability.md](./mobile-usability.md) -- mobile micro-interactions (haptic feedback, pull-to-refresh, swipe gestures)
- Upstream: [../../frameworks/README.md](../../frameworks/README.md) -- PM frameworks for prioritizing micro-interaction improvements
- References: Dan Saffer -- *Microinteractions: Designing with Details* (O'Reilly, 2013); Val Head -- *Designing Interface Animation*; Material Design -- *Motion Guidelines*; Nielsen Norman Group -- *Animation for Attention and Comprehension*