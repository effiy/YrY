---
title: Keyboard shortcuts and aria-labels — a11y patterns + keyboard shortcuts + Element Plus focus trap
tags:
- accessibility
- aria
- aria-label
- aria-hidden
- keyboard
- shortcut
- focus-trap
- element-plus
- v-longpress
- wcag
category: engineer/quality-security
created: 2026-08-05
updated: 2026-08-05
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles:
- accessibility-engineer
- frontend-engineer
- designer
- qa-engineer
- code-reviewer
benefit: New components no longer miss aria-label / keyboard shortcuts / focus trap, can reach WCAG 2.1 AA baseline
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../README.md
- ../../../YiVad/src/components/TopicDetailPage/index.vue
- ../../../YiVad/src/views/aiChat/components/ConversationSessionSidebar.vue
- ../../../YiVad/src/views/aiChat/components/SessionStatusBar.vue
- ../../../YiVad/src/directives/modules/longpress.ts
- ../../../YiVad/src/views/system/menuMange/index.vue
- ../../../YiVad/src/views/story/index.vue
tacit: false
---

# Keyboard shortcuts and aria-labels — a11y patterns + keyboard shortcuts + Element Plus focus trap

> **As an** accessibility-engineer,**I want to** a pattern record of ARIA usage, keyboard shortcut conventions, Element Plus modal focus trap and v-longpress touch accessibility,**so that** new components no longer miss aria-label / keyboard shortcuts / focus trap, and can reach WCAG 2.1 AA baseline.

> YiVad frontend already has a11y patterns: `TopicDetailPage` breadcrumb / TOC aria-label, `ConversationSessionSidebar` icon-only button aria-label, `SessionStatusBar` SVG sparkline dynamic aria-label, `@keydown.meta.s` / `@keydown.ctrl.s` dual-binding save, `v-longpress` touch long-press. This article is the meta-doc for a11y patterns, organized against the WCAG 2.1 AA baseline.

## Summary

- **icon-only interactive elements must have aria-label** — `el-button :icon="Plus" aria-label="New session"` is the pattern; otherwise screen readers cannot read the button's purpose
- **decorative SVG uses aria-hidden** — `<svg aria-hidden="true">` skips screen readers; sparkline / chart and other data visualization SVGs must have a dynamic `:aria-label` describing the trend
- **keyboard shortcut dual-binding meta + ctrl** — macOS `meta` (Cmd) + Windows / Linux `ctrl`; `@keydown.meta.s.prevent` + `@keydown.ctrl.s.prevent` dual binding is the pattern
- **`.prevent` modifier prevents browser defaults** — `@keydown.meta.s.prevent` blocks the browser save dialog
- **Escape closes overlays** — `@keydown.escape` closes modal / drawer / popover; does not depend on the top-right X button
- **Enter submits forms** — `@keydown.enter` submits; do not force user to click Submit
- **Element Plus modal has built-in focus trap** — `el-dialog` / `el-drawer` auto trap; custom modals must have `aria-modal="true"` + tab loop
- **v-longpress supports touch accessibility** — touch users have no right-click / hover; long-press is the context menu replacement

## Core viewpoints

- **icon-only button is an a11y high-risk area** — `el-button :icon="Plus"` has no text, screen reader reads "button" and stops; `aria-label="New session"` makes the screen reader read "New session button"; the project's `ConversationSessionSidebar.vue:97` is the pattern
- **aria-label is the a11y text source for icon buttons** — not `title` (that's a tooltip); `title` is a hover hint, `aria-label` is what screen readers read; both can be used together (`ConversationSessionSidebar.vue:97` has both `title="New session" aria-label="New session"`)
- **decorative vs data SVG distinction** — decorative SVG (SvgIcon / SparkGlowDefs) uses `aria-hidden="true"` to skip; data visualization SVG (sparkline / chart) uses `:aria-label="..."` to describe the trend ("Cumulative cost trajectory across N messages, latest $X"); do not treat data SVG as decorative
- **keyboard shortcut cross-platform dual-binding** — macOS `meta` (Cmd), Windows / Linux `ctrl`; binding only one misses half the users; `@keydown.meta.s.prevent` + `@keydown.ctrl.s.prevent` is a project hard rule
- **`.prevent` modifier prevents browser defaults** — without `.prevent`, Cmd+S triggers the browser save dialog, intercepting form save; Ctrl+S likewise
- **Escape is a hard rule for overlay closing** — modal / drawer / popover must respond to `@keydown.escape`; only relying on the X button forces keyboard users to tab to X to close
- **Element Plus modal has built-in focus trap** — `el-dialog` / `el-drawer` auto trap focus (tab loops inside the modal); custom modals must have `aria-modal="true"` + tab loop + Esc close; do not bypass Element Plus to custom modals
- **v-longpress is the touch-accessible context menu replacement** — touch users have no right-click; long-press 2 seconds to trigger is the touch context menu pattern; `directives/modules/longpress.ts:48` `touchstart` listener is the touch path

## Key information

### aria-label pattern (icon-only button)

```vue
<!-- ✅ Pattern: icon-only button with aria-label + title -->
<el-button
  size="small"
  type="primary"
  :icon="Plus"
  title="New session"
  aria-label="New session"
  @click="onNewSession"
/>

<!-- ✅ Pattern: dynamic aria-label binding -->
<el-button :aria-label="title" @click="onClick">
  <el-icon><Plus /></el-icon>
</el-button>

<!-- ❌ Anti-pattern: icon-only button without aria-label -->
<el-button :icon="Plus" @click="onNewSession" />
<!-- Screen reader reads "button", no context -->
```

**Field division**:
| Field | Purpose | Reader |
|---|---|---|
| `aria-label` | Screen reader (VoiceOver / NVDA) | Visually impaired users |
| `title` | Browser tooltip | Mouse users |
| `text` (slot) | Visible text | Everyone |

icon-only button should have both `aria-label` (required) + `title` (optional).

### aria-label pattern (nav / section / aside)

```vue
<!-- ✅ Pattern: breadcrumb uses nav + aria-label -->
<nav class="topic-detail__breadcrumb" aria-label="Breadcrumb">
  ...
</nav>

<!-- ✅ Pattern: TOC uses aside + aria-label -->
<aside v-if="tocContent.toc.length >= 2" class="topic-detail__toc" aria-label="Table of contents">
  ...
</aside>

<!-- ✅ Pattern: stats uses section + aria-label -->
<section v-if="stats.some(s => s.value !== '—')" class="tlr-overview__stats" aria-label="Knowledge base stats">
  ...
</section>
```

**When to use aria-label on container**:
- `<nav>` must have (distinguish multiple navs, e.g. "Breadcrumb" / "Main" / "Footer")
- `<aside>` must have (distinguish multiple asides)
- `<section>` recommended (distinguish multiple sections)

### aria-hidden pattern (decorative SVG)

```vue
<!-- ✅ Pattern: decorative SVG uses aria-hidden -->
<svg-icon name="arrow" aria-hidden="true" />

<!-- ✅ Pattern: SparkGlowDefs (purely decorative, only defines gradients) -->
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <defs>...</defs>
</svg>

<!-- ❌ Anti-pattern: data SVG uses aria-hidden -->
<svg class="sparkline" aria-hidden="true">
  <!-- sparkline is data, screen reader should read trend -->
</svg>
```

### SVG sparkline dynamic aria-label (data visualization)

```vue
<!-- ✅ Pattern: data SVG uses dynamic :aria-label to describe trend -->
<svg
  class="ssb-cost-spark"
  :width="SPARK_W"
  :height="SPARK_H"
  :viewBox="`0 0 ${SPARK_W} ${SPARK_H}`"
  :aria-label="`Cumulative cost trajectory across ${costHistory.length} messages, latest $${costSparkLatest.toFixed(4)}`"
  @mouseleave="costHoverIdx = null"
>
  ...
</svg>
```

**Dynamic aria-label template**:
- "Cumulative cost trajectory across N messages, latest $X"
- "Input vs output token trajectory"
- "Tool call latency sparkline"

Template key points: quantity + latest value + trend semantics, so the screen reader reads the core info in one pass.

### Keyboard shortcut conventions

```vue
<!-- ✅ Pattern: Cmd/Ctrl+S dual-binding save -->
<el-form
  :model="form"
  :rules="rules"
  label-width="110px"
  label-suffix=":"
  @keydown.meta.s.prevent="handleSave"
  @keydown.ctrl.s.prevent="handleSave"
>
  ...
</el-form>

<!-- ✅ Pattern: Escape closes overlay -->
<el-input
  v-model="faqSearch"
  size="small"
  clearable
  placeholder="Search FAQs..."
  @keydown.escape="faqVisible = false"
/>

<!-- ✅ Pattern: Enter submits -->
<el-input
  v-model="newTagInput"
  size="small"
  placeholder="Add tag (e.g. ctx:path/to/file)"
  @keydown.enter="addNewTag"
/>

<!-- ✅ Pattern: Enter applies threshold -->
<el-input
  v-model="slowThreshold"
  @keyup.enter="applySlowThreshold"
/>
```

**Conventions**:
| Shortcut | Purpose | Implementation |
|---|---|---|
| `Cmd+S` / `Ctrl+S` | Form save | `@keydown.meta.s.prevent` + `@keydown.ctrl.s.prevent` |
| `Esc` | Close overlay (modal / drawer / popover / search) | `@keydown.escape` |
| `Enter` | Submit form / apply value | `@keydown.enter` or `@keyup.enter` |
| `Tab` | Focus loop (handled by Element Plus modal trap) | automatic |
| `Shift+Tab` | Reverse focus | automatic |

**`@keydown` vs `@keyup`**:
- `@keydown` — triggers earlier, suitable for save / submit (fires as the key goes down)
- `@keyup` — triggers later, suitable for applying after input completes (after Enter, input value is final)

### Element Plus modal focus trap

```vue
<!-- ✅ Pattern: el-dialog auto focus trap -->
<el-dialog v-model="visible" title="Edit Session" width="500px">
  <el-form>...</el-form>
  <template #footer>
    <el-button @click="visible = false">Cancel</el-button>
    <el-button type="primary" @click="save">Save</el-button>
  </template>
</el-dialog>
<!-- Element Plus auto traps focus, tab loops inside the modal; Esc close is handled by Element Plus -->

<!-- ✅ Pattern: el-drawer also auto traps -->
<el-drawer v-model="visible" title="Filters" direction="rtl">
  ...
</el-drawer>

<!-- ❌ Anti-pattern: custom modal without focus trap -->
<div v-if="visible" class="custom-modal">
  <!-- no aria-modal="true", no tab loop, Esc does not close -->
</div>
```

**Custom modals must have**:
1. `role="dialog"` + `aria-modal="true"`
2. focus trap (tab loops inside modal, implemented with `tabindex` + keydown handler)
3. Esc close (`@keydown.escape`)
4. focus moves to first focusable element when entering the modal
5. focus returns to the trigger button after closing the modal

### v-longpress touch accessibility

```vue
<!-- ✅ Pattern: v-longpress supports touch long-press -->
<el-button v-longpress="handleLongPress" type="primary">
  Long press for 2 seconds to trigger
</el-button>
```

Inside `directives/modules/longpress.ts`:
```typescript
el.addEventListener("touchstart", start);  // touch path
el.addEventListener("mousedown", start);   // mouse path
```

**Touch-accessible scenarios**:
- destructive action (delete / batch operation) — touch users have no right-click, long-press is the context menu replacement
- drag handle touch replacement — long-press to enter drag mode
- multi-select mode entry — long-press to trigger batch mode

## Anti-patterns (do not)

- **Do not leave icon-only button without aria-label** — screen reader reads "button"; `aria-label="..."` is mandatory
- **Do not use aria-hidden on data SVG** — sparkline / chart is data, screen reader should read trend; `aria-hidden` only for decorative SVG
- **Do not bind only meta or only ctrl** — misses half the users; dual-binding `meta` + `ctrl` is a project hard rule
- **Do not miss `.prevent` on shortcuts** — without prevent the browser default pops a save dialog / jumps page
- **Do not let modal not respond to Esc** — keyboard users must be able to close with Esc; only X button forces keyboard users to tab-find X
- **Do not build custom modal without focus trap** — tab escapes the modal, keyboard users get lost; use `el-dialog` or bring your own trap
- **Do not treat v-longpress as mouse-only** — touch users need it more; `touchstart` listener is mandatory
- **Do not put multiple navs without aria-label** — multiple `<nav>` all need `aria-label` to distinguish (Breadcrumb / Main / Footer)
- **Do not use title to replace aria-label** — `title` is a tooltip not a screen reader source; `aria-label` is
- **Do not miss dual-binding meta + ctrl on form save** — macOS / Windows / Linux users each make up half; missing one side degrades user experience

## Action recommendations

When running a11y audit on new components:

1. **icon-only button audit** — grep `:icon=` to find icon-only buttons, confirm each has `aria-label`
2. **SVG audit** — grep `<svg` to find all SVGs; decorative ones add `aria-hidden="true"`; data ones add dynamic `:aria-label`
3. **nav / aside / section audit** — grep `<nav` / `<aside` / `<section`, confirm all have `aria-label`
4. **Keyboard shortcut audit** — grep `@keydown` to find shortcuts, confirm `meta` + `ctrl` dual-binding; confirm `.prevent` modifier
5. **Esc close audit** — grep `<el-dialog` / `<el-drawer` / `<el-popover`, confirm Element Plus auto handles Esc; for custom overlays grep `@keydown.escape`
6. **focus trap audit** — custom modals grep `role="dialog"` + `aria-modal="true"`; using `el-dialog` is auto trap
7. **v-longpress audit** — touch-accessible destructive actions grep `v-longpress`, confirm `touchstart` listener exists
8. **axe-core scoring** — Lighthouse Accessibility score < 90 is an optimization signal; axe-core browser extension runs detailed audit

When upgrading existing components:

1. Grep `:icon=` to find icon-only buttons, add `aria-label` one by one
2. Grep `<svg` to find SVGs, add `aria-hidden` for decorative, `:aria-label` for data
3. Grep `@keydown` to find shortcuts, add `meta` + `ctrl` dual-binding + `.prevent`
4. Grep `<nav` / `<aside` / `<section`, add `aria-label`
5. Add `role="dialog"` + `aria-modal="true"` + Esc close + focus trap to custom overlays
6. Run VoiceOver / NVDA manually to smoke-test the main flows

## Related

- [accessibility-engineer/README.md](../README.md) — Accessibility Engineer working directory
- [YiVad/src/components/TopicDetailPage/index.vue](../../../YiVad/src/components/TopicDetailPage/index.vue) — breadcrumb / TOC aria-label pattern sample (line 7, 231)
- [YiVad/src/views/aiChat/components/ConversationSessionSidebar.vue](../../../YiVad/src/views/aiChat/components/ConversationSessionSidebar.vue) — icon-only button aria-label pattern (line 97, 103)
- [YiVad/src/views/aiChat/components/SessionStatusBar.vue](../../../YiVad/src/views/aiChat/components/SessionStatusBar.vue) — SVG sparkline dynamic aria-label pattern (line 1192, 1322, 1522)
- [YiVad/src/components/SvgIcon/index.vue](../../../YiVad/src/components/SvgIcon/index.vue) — decorative SVG aria-hidden pattern
- [YiVad/src/directives/modules/longpress.ts](../../../YiVad/src/directives/modules/longpress.ts) — `v-longpress` touch-accessible directive (touchstart at line 48)
- [YiVad/src/views/system/menuMange/index.vue](../../../YiVad/src/views/system/menuMange/index.vue) — Cmd/Ctrl+S dual-binding save pattern (line 63)
- [YiVad/src/views/story/index.vue](../../../YiVad/src/views/story/index.vue) — Cmd/Ctrl+S form save (line 205, 295)
- [YiVad/src/views/aiChat/components/KnowledgeChatPanel.vue](../../../YiVad/src/views/aiChat/components/KnowledgeChatPanel.vue) — Esc close / Enter submit pattern (line 622, 647)
- [knowledge-curator/templates/knowledge-leaf.md](../../knowledge-curator/templates/knowledge-leaf.md) — leaf template
