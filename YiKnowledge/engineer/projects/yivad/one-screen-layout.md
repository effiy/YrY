---
title: YiVad one-screen layout with scrollable overflow
aliases: [yivad-one-screen-layout, yivad-scroll-layout, yivad-viewport-layout]
tags: [yivad, layout, css, scroll, viewport, flex, useResizable]
category: engineer/projects/yivad
created: 2026-08-06
updated: 2026-08-07
last_verified: 2026-08-07
source: YiVad/src/layouts/ + YiVad/src/views/ + YiVad/src/hooks/useResizable.ts
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
tacit: false
roles: [engineer, new-hire]
benefit: "Engineers understand how YiVad achieves one-screen-per-page layout with scrollable overflow, and how to apply the pattern to new pages"
acceptance_criteria:
  - "the three-layer layout architecture (root → layout → page) is clearly explained"
  - "the flex + min-height:0 + overflow pattern is documented with code examples"
  - "the calc(100vh - Npx) height calculation is explained for each layout mode"
  - "useResizable composable usage is documented"
  - "anti-patterns (double scrollbar, height leak, missing min-height:0) are identified"
related:
  - ./functional-modules.md
  - ./architecture.md
  - ./engineering/claude.md
---

# YiVad one-screen layout with scrollable overflow

> **As an** engineer, **I want to** understand the one-screen layout pattern, **so that** new pages follow the same convention and avoid double-scrollbar or height-leak bugs.

## Summary

YiVad uses a three-layer flex layout architecture to ensure every page fills exactly one screen height and scrolls internally when content overflows. The root layout (`el-container` → `el-header` + `el-aside` + `el-main`) establishes the viewport-filling frame. The `el-main` component (`src/layouts/components/Main/index.vue` + `index.scss`) bridges layout and page with `flex: 1; min-height: 0; overflow: hidden`. Each page component uses `height: calc(100vh - Npx)` (where N = header + tabs height) and `overflow: auto` on the scrollable area. The `useResizable` composable adds draggable split-pane support for side panels.

## Core viewpoints

- **Three-layer architecture** — root layout (viewport frame) → `el-main` (flex bridge) → page (scroll container). Each layer has a distinct role; mixing them causes double scrollbars.
- **`min-height: 0` is non-negotiable** — flex children default to `min-height: auto`, which prevents shrinking below content height. Without `min-height: 0`, `overflow: hidden/auto` on the child is useless.
- **`overflow: hidden` on the flex parent, `overflow: auto` on the scroll target** — this is the canonical pattern. The parent clips, the child scrolls.
- **`calc(100vh - Npx)` = page height** — N varies by layout mode (header height + tabs height). Pages must know their layout context to pick the right N.
- **`useResizable` for side panels** — draggable resizer between sidebar and main content; persists width to localStorage; uses Pointer Events for mouse/touch/pen.

## Key information

### Layer 1: Root layout (viewport frame)

Four layout modes in `src/layouts/`, each establishing a full-viewport flex container:

| Layout | File | Structure |
|---|---|---|
| Vertical | `LayoutVertical/index.vue` | `el-container` > `el-aside` (100vh) + `el-container` > `el-header`(55px) + `Main` |
| Classic | `LayoutClassic/index.vue` | `el-container` > `el-header`(55px) + `el-container.classic-content`(calc(100%-55px)) > `el-aside`(calc(100vh-55px)) + `Main` |
| Columns | `LayoutColumns/index.vue` | `el-container` > `.aside-split`(70px) + `el-aside` + `el-container` > `el-header`(55px) + `Main` |
| Transverse | `LayoutTransverse/index.vue` | `el-container` > `el-header`(55px) + `Main` |

Key SCSS patterns shared across all layouts:

```scss
.el-container {
  width: 100%;
  min-height: 100%;        // fill viewport
}
.el-aside {
  .aside-box {
    display: flex;
    flex-direction: column;
    height: 100%;           // fill parent
    .el-scrollbar {
      height: calc(100% - 55px);  // minus logo height
    }
  }
}
.el-header {
  height: 55px;             // fixed header height
}
```

The sidebar uses `height: 100vh` (Vertical) or `height: calc(100vh - 55px)` (Classic, where header is outside the aside). The `el-scrollbar` inside the sidebar calculates its own height as `calc(100% - 55px)` to subtract the logo area.

### Layer 2: el-main (flex bridge)

`src/layouts/components/Main/index.vue` renders `<router-view>` inside `<el-main>`. This is the critical bridge between layout and page:

```scss
// src/layouts/components/Main/index.scss
.el-main {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  flex: 1 1 0%;            // grow to fill remaining space
  min-height: 0;            // allow shrinking — REQUIRED for overflow to work
  height: auto;
  padding: 0;
  overflow: hidden;         // clip at this boundary, child scrolls

  .main-view {
    flex: 1;
    min-height: 0;          // same rule for the nested flex child
    overflow-y: auto;       // THIS is where scrolling happens
  }
}
```

The `Tabs` component (multi-tab bar, ~40px) renders inside `Main` before `el-main`, so the available height for `.main-view` is effectively `100vh - 55px(header) - 40px(tabs) = 100vh - 95px`. This is why most pages use `calc(100vh - 95px)`.

### Layer 3: Page component (scroll container)

Each page sets its own height and designates which child scrolls. Two common patterns:

**Pattern A: Full-page flex column (most common)**

```vue
<template>
  <div class="page" :style="{ height: 'calc(100vh - 95px)' }">
    <header class="page__header">...</header>
    <div class="page__body">  <!-- scrolls -->
      ...
    </div>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  overflow: hidden;          // parent clips
}
.page__header {
  flex-shrink: 0;            // fixed height, don't shrink
}
.page__body {
  flex: 1;
  min-height: 0;             // allow shrinking
  overflow-y: auto;          // scroll here
}
</style>
```

**Pattern B: Split-pane with resizable sidebar (aiChat)**

```vue
<template>
  <div class="page">
    <aside :style="{ width: sidebarW + 'px' }">...</aside>
    <div class="resizer" @pointerdown="startResize" />
    <section class="page__main">...</section>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  height: 100%;              // inherit from .main-view
  overflow: hidden;
}
.page__main {
  flex: 1;
  min-width: 0;
  height: calc(100vh - 95px);
  overflow: auto;
}
</style>
```

### Page height reference table

| Page | Height | Notes |
|---|---|---|
| `aiChat/index.vue` | `calc(100vh - 95px)` | 55px header + 40px tabs |
| `brd/index/index.vue` | `calc(100vh - 95px)` | same |
| `code-review/index/index.vue` | `calc(100vh - 95px)` | same |
| `code-review/bugs/index.vue` | `calc(100vh - 95px)` | same |
| `rss/index.vue` | `calc(100vh - 95px)` | same |
| `tech-leadership/index/index.vue` | `calc(100vh - 95px)` | same |
| `story/index.vue` | `calc(100vh - 95px)` | same |
| `rag/chat.vue` | `calc(100vh - 120px)` | 55px header + 40px tabs + 25px extra |
| `story/components/StoryTable.vue` | `calc(100vh - 263px)` | 55px header + 40px tabs + 168px story header + cards |
| `system/menuMange/index.vue` | `calc(100vh - 55px - 40px)` | explicit formula |
| `login/index.vue` | `min-height: 100vh` | no header/tabs on login page |
| `ConversationSidebar.vue` | `calc(100vh - 95px)` | sidebar inside aiChat page |
| `TopicDetailPage/index.vue` | `max-height: calc(100vh - 95px)` | max-height variant |
| `link/claude/index.vue` | `calc(100vh - 100px)` | 55px header + 45px link bar |

### useResizable composable

`src/hooks/useResizable.ts` — draggable split-pane resizer:

```ts
const { width, isResizing, startResize } = useResizable(
  220,    // initialWidth
  200,    // minWidth
  600,    // maxWidth
  "aiChat.sidebarW",  // localStorage key (optional)
  false   // invert: true for left-edge resizers
);
```

- Uses Pointer Events (mouse + touch + pen).
- While dragging, a full-viewport transparent overlay prevents iframes/hoverable elements from swallowing events.
- `body` gets `cursor: col-resize; user-select: none` during drag.
- Width persists to localStorage via the `storageKey` parameter.
- `invert=true` for left-edge resizers (drag right = shrink panel).
- Cleans up listeners and body styles on unmount (even mid-drag).

Usage sites:
- `aiChat/index.vue` — sidebar resizer (220px, min 200, max 600)
- `AiChatBox.vue` — side panel resizer (180px, min 180, max 480) + session sidebar
- `KnowledgePreviewDialog.vue` — chat panel resizer (600px, min 320, max 900)

### Maximize mode

When a page is maximized (`globalStore.maximize = true`), `#app` gets class `main-maximize`:

```scss
// src/styles/element.scss
.main-maximize {
  .aside-split, .el-aside, .el-header, .el-footer, .tabs-box {
    display: none !important;
  }
}
```

This hides the chrome, giving the page full viewport height. Pages should handle this by using `height: 100%` (inheriting from `.main-view`) rather than hardcoding `calc(100vh - 95px)` when maximize support is needed.

### CSS utility classes

From `src/styles/element.scss`:

- `.content-box` — `display: flex; flex-direction: column; height: 100%` for simple centered content
- `.main-box` — `display: flex; width: 100%; height: 100%` for left-right flex layouts (treeFilter pages)
- `.table-box` / `.table-main` — `display: flex; flex: 1; flex-direction: column; width: 100%; height: 100%` for ProTable pages

## Action recommendations

1. **New page: use Pattern A** — `display: flex; flex-direction: column; height: calc(100vh - 95px); overflow: hidden` on root, `flex: 1; min-height: 0; overflow-y: auto` on the scrollable body.
2. **New page with sidebar: use Pattern B** — `display: flex; height: 100%; overflow: hidden` on root, `useResizable` for the draggable divider, `overflow: auto` on the main area.
3. **Always set `min-height: 0` on flex children that should scroll** — without it, the flex child expands to fit its content and `overflow` has no effect.
4. **Always set `overflow: hidden` on the parent of the scrollable area** — prevents the parent from growing and creating a second scrollbar.
5. **Fixed header/footer inside the page: `flex-shrink: 0`** — prevents them from being squeezed when the body scrolls.
6. **If the page must support maximize mode**, use `height: 100%` instead of `calc(100vh - Npx)` so it auto-adapts when chrome is hidden.
7. **`useResizable` for any draggable split** — don't roll your own; the composable handles Pointer Events, overlay, body styles, and cleanup.

## Anti-patterns

- **Missing `min-height: 0`** — the most common cause of "overflow not working." The flex child grows to content height, `overflow-y: auto` never activates, and the whole page scrolls instead.
- **Missing `overflow: hidden` on parent** — results in double scrollbar (outer page scroll + inner body scroll).
- **Hardcoding `calc(100vh - 95px)` on nested components** — the nested component doesn't know the layout context. Use `height: 100%` and let the parent control the height.
- **`height: 100vh` on pages with header/tabs** — causes 95px of content to be hidden below the fold.
- **`overflow: scroll` instead of `overflow: auto`** — always shows scrollbar track even when content fits.
- **Using raw `mousedown` for resize handles** — doesn't work on touch devices. Use `useResizable` which uses Pointer Events.
- **Forgetting `flex-shrink: 0` on fixed headers** — header gets squeezed when the body content is large.


- **Missing `min-height: 0` on a flex child that should scroll** — flex children default to `min-height: auto`, which means they expand to fit their content and never shrink below it. Without `min-height: 0`, `overflow-y: auto` has no effect because the child is already tall enough to show everything, and the entire page scrolls instead.
- **Missing `overflow: hidden` on the parent of a scrollable area** — when the parent of a scrollable flex child does not have `overflow: hidden`, the parent itself grows to accommodate the child's content, creating a double-scrollbar situation where both the outer container and the inner body have independent scrollbars.
- **Hardcoding `calc(100vh - 95px)` on deeply nested components** — a nested component that hardcodes the page-height formula cannot be reused in a different layout context (e.g., inside a dialog, inside a maximized view, or with a different header height). Nested components should use `height: 100%` and let the nearest layout-aware ancestor control the height.
- **Using `height: 100vh` on a page that sits below header and tabs** — `100vh` is the full viewport height, but the page sits below a 55px header and 40px tabs bar, so 95px of content is pushed below the fold and becomes invisible. The correct formula for most pages is `calc(100vh - 95px)`, adjusted for the specific layout mode.
- **Using raw `mousedown`/`mouseup` for resize handles instead of `useResizable`** — raw mouse events do not work on touch devices, and manually managing the transparent overlay, body cursor style, and user-select disabling during drag is error-prone and leaks listeners. The `useResizable` composable uses Pointer Events for cross-device support and handles cleanup, overlay, and localStorage persistence automatically.

## Related

- [YiVad functional modules](./functional-modules.md) — 20 view domains, useResizable composable, and layout modes inventory
- [YiVad architecture](./architecture.md) — layer boundaries, source topology, and tech stack underpinning the layout system
- [YiVad development standards](./dev-standards.md) — component naming, SFC structure, and scoped SCSS conventions
- [Knowledge preview dialog modules](./knowledge-preview-dialog-modules.md) — useResizable usage in the dialog's chat panel resizer
- [YiVad engineering CLAUDE.md](./engineering/claude.md) — project constraints and self-constraints for layout components