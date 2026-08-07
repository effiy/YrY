---
title: Sidebar parity — YiPet ChatSidebar + YiVad aiChat/aicr three-end alignment
tags:
- design
- ui-pattern
- sidebar
- parity
- yipet
- yivad
- aiicr
category: engineer/architecture-design
created: 2026-08-05
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles:
- designer
- frontend-engineer
- tech-lead
benefit: when adding/modifying sidebar-class components, a single place surfaces the shared baseline and differencing boundaries across three ends
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../../README.md
- ../../knowledge-curator/templates/knowledge-leaf.md
- ../README.md
tacit: false
---

# Sidebar parity — YiPet ChatSidebar + YiVad aiChat/aicr three-end alignment

> **As a** designer, **I want to** record a shared baseline and differencing boundaries for the three-end sidebars, **so that** new sidebar-class components do not drift independently and alignment decisions have a basis to follow.

> The three-end sidebars: YiPet `ChatSidebar` (React + antd), YiVad aiChat `ConversationSidebar` (Vue + Element Plus), YiVad aicr `FileTree.vue` (Vue + Element Plus). As of 2026-07-29, after several rounds of alignment they share a common interaction paradigm.

## Summary

- **Baseline evolution path**: aicr `FileTree` had all features (initial baseline) → the three ends aligned to FileTree → reversed, aligning instead to aiChat `ConversationListItem` (more concise) → three ends share the same shape.
- **Shared interaction**: search / New primary action / batch mode / hover-revealed action row (favorite · rename · delete) / persisted favorite star / active highlight.
- **Shared structure (list item)**: title row + meta timestamp two-row layout, matching `aiChat/components/ConversationListItem.vue`.
- **Batch-mode convention**: toolbar hidden in batch mode via toggle button; bottom bar = `N selected` + `Delete selected` (danger) + `Cancel`; danger actions gated by `confirm()` / `ElMessageBox.confirm`.
- **Backend contract**: YiAi `data_service.update_document` passes through arbitrary fields; `isFavorite: boolean` is transparently persisted in the `sessions` collection with no backend changes.

## Core viewpoints

- **Parity decisions need "an explicit baseline end"** — early on, the aicr FileTree with the most features served as the baseline to align YiPet/aiChat; later reversed to aiChat ConversationListItem as the baseline (more concise), with the rationale "the simplest end is the best", to avoid feature stacking.
- **Interaction alignment precedes visual alignment** — the three ends first unified hover action row, batch exit path, and empty-state copy, then unified colors/rounded corners; sidebars with the same functionality but different visuals are considered already aligned.
- **Icon-only + title is this project's primary action paradigm** — New / Batch toggle use icon buttons (PlusOutlined / Operation) with `title=` copy, matching the YiPet SearchBar.
- **Batch mode exit path must be explicit** — toolbar toggle hidden in batch mode; exit relies on the bottom `Cancel` button; users must not get stuck in batch mode.

## Key information

### Shared baseline (already implemented across three ends)

- **Search** — sidebar header inline `el-input` / antd `Input.Search`, bound to the store's `searchQuery`.
- **New** — icon-only primary (`Plus` / `PlusOutlined`), with `title="New conversation"` etc.
- **Batch toggle** — icon-only (`Operation` / `UnorderedListOutlined`), `v-if="!batchMode"` hidden.
- **List item two rows** — title row + meta timestamp (`mm-dd hh:mm`).
- **Hover action row** — favorite (Star/StarFilled toggle) + rename (Edit/EditPen) + delete (Delete/DeleteOutlined).
- **Favorite persisted star** — `isFavorite` field passes through to YiAi `sessions` collection, no backend changes needed.
- **Active highlight** — when selectedKey matches, `.ft-item--active` / `.cs-item--active` background color.
- **Batch mode** — leaves only multi-select + bottom bar (`N selected` + danger `Delete selected` + `Cancel`).
- **Danger action confirm** — batch delete gated by `ElMessageBox.confirm` / `confirm()`.
- **Default expanded all folders** — `defaultExpandedKeys` returns all folder keys.
- **Click folder row to expand** — `expandAction="click"` (antd) / `:expand-on-click-node="true"` (el-tree).

### Per-end differencing boundaries (do not force unification)

- **aicr FileTree view-mode switch** — tree / cards / graph three states, only aicr has; YiPet ChatSidebar / aiChat ConversationSidebar do not need it.
- **aicr card-view descriptions** — `FileTreeCards.vue` row-inline editable `pageDescription`, only appears in aicr business context.
- **YiPet native confirm** — `bulkDeleteSessions` uses browser-native `confirm()`; aiChat/aicr use `ElMessageBox.confirm`; do not force unification (in-end consistency is enough).
- **Drag re-sort** — none of the three sidebars support it in their lists; only aicr `FilterBar` tag pills support it, and it is not part of sidebar parity.

## Action recommendations

When adding a sidebar-class component:

1. First decide the baseline end (pick from the existing three ends the one whose features/interaction are closest); if none of the three ends match, first implement in the most recent end and align the other two.
2. Reuse the 12 shared baseline items, only differing in business-specific parts (view mode / business-specific fields).
3. Restrict the hover action row to leaves; keep folders as pure expand labels.
4. Batch mode bottom bar + Cancel exit path + danger Delete + confirm must all be in place.
5. Backend fields (`isFavorite` / `tags`) pass through to YiAi `sessions` collection, no backend changes.
6. Validation: `pnpm type:check` (Vue end), `npm run typecheck` (React end) must pass; hover / batch / exit three states manually regression-tested.

## Anti-patterns

- **Showing the batch delete button in the toolbar alongside the bottom bar** — the batch mode bottom bar (with `N selected`, Delete, Cancel) is the exclusive location for batch actions. Duplicating the delete button in the toolbar creates two trigger paths with different confirmation flows, and the toolbar toggle itself must be hidden during batch mode.
- **Adding hover actions to folder rows** — folders are pure expand/collapse labels and should not have hover-revealed action rows (rename, delete, new-file-here). The hover action row belongs exclusively to leaf items; adding it to folders was attempted in aicr FileTree and subsequently removed because it created confusion between navigation and manipulation.
- **Using `v-model` on a read-only computed property** — when a computed like `store.panelVisible` is defined as `computed(() => selectedStory.value !== null)`, it is read-only and `v-model` silently fails to write. The drawer must use `:model-value=` for one-way binding, with the `@close` handler responsible for toggling the underlying state.
- **Embedding the expand/collapse toggle button inside the `<aside>` element** — when the sidebar is collapsed (`width: 0; overflow: hidden`), any button inside `<aside>` becomes unclickable. The toggle button must be a sibling of `<aside>`, positioned adjacent to it in the DOM so it remains visible and interactive regardless of sidebar state.
- **Adding a new sidebar without first choosing a baseline end** — creating a sidebar from scratch without selecting one of the three existing implementations (YiPet ChatSidebar, YiVad aiChat ConversationSidebar, aicr FileTree) as the baseline guarantees feature drift. The new sidebar must start from the closest existing end, inherit the 12 shared baseline items, and only diverge in business-specific areas.

## Related

- [designer/README.md](../README.md) — design directory
- [knowledge-curator/templates/knowledge-leaf.md](../../knowledge-curator/templates/knowledge-leaf.md) — leaf template
- [engineer/](.) — engineering patterns directory (partial cross-citation)
- [knowledge-curator/diagrams/user-journey.md](../../knowledge-curator/diagrams/user-journey.md) — user journey of the 4 diagrams; sidebar is a key breakpoint in the knowledge stream
