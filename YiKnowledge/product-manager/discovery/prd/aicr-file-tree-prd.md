---
title: AICR File Tree PRD Instance
aliases:
  - aicr file tree PRD
  - AICR file tree requirements
  - Code review file tree
tags:
  - PRD
  - aicr
  - file-tree
  - code-review
  - AI
  - YiVad
category: product-manager/discovery/prd
created: 2026-08-07
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: prd
status: draft
lifecycle: active
review_cycle: quarterly
roles:
  - product-manager
  - engineer
benefit: PMs and engineers have a concrete PRD instance for the AICR file tree component, including interaction design, performance targets, and requirements for a code-aware file explorer
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - ./brd-agent-prd.md
  - ./aichat-port-prd.md
  - ../../frameworks/write-a-spec-or-prd.md
  - ../../../knowledge-curator/templates/prd.md
  - ../../../engineer/lessons/win-yivad-aicr-phase-port.md
---

# AICR File Tree PRD Instance

> **As a** product manager, **I want to** define the requirements for the AICR file tree component, **so that** the engineering team has a clear specification for building a code-aware file explorer that supports the AI code review workflow.

> This is a concrete PRD instance for the AICR (AI Code Review) file tree component. The file tree is the primary navigation interface for code review sessions -- users browse, select, and inspect files within the context of an AI-powered code review. Reference the PRD template at [../../../knowledge-curator/templates/prd.md](../../../knowledge-curator/templates/prd.md).

## Summary

- The AICR file tree is a code-aware file explorer component that displays the file structure of a repository or code review session. It supports hierarchical navigation, file selection, diff indicators, and batch operations.
- Three user personas: code reviewer (navigates files to review changes), code author (views review comments on their files), and team lead (monitors review progress across the file tree).
- Core functional requirements: hierarchical file tree rendering with lazy loading, file selection (single and multi-select), diff indicators (added, modified, deleted, reviewed), batch operations (approve all, request changes), and integration with the code viewer and chat panel.
- Interaction design requirements: keyboard navigation, drag-and-drop reordering, context menus, search/filter, and collapsible directories with state persistence.
- Performance targets: render 10,000+ files without jank, expand/collapse directories in < 50ms, filter/search in < 100ms, lazy load on scroll.

## Core viewpoints

- **The file tree is a navigation tool, not a file manager** -- users interact with the file tree to find and select files for review. It is not a full file manager. The feature set should be scoped to the code review workflow: navigate, select, review, approve.
- **Performance at scale is the primary technical challenge** -- repositories can have 10,000+ files. The file tree must render efficiently, scroll smoothly, and filter quickly. Virtual scrolling, lazy loading, and memoization are required from day one.
- **Diff indicators are the primary value add** -- a plain file tree is a commodity component. The AICR file tree's value is the diff indicators that show which files have been added, modified, deleted, reviewed, or have pending comments. These indicators guide the reviewer's attention.
- **Integration with code viewer and chat panel is the system design challenge** -- the file tree, code viewer, and chat panel form a three-panel layout. Selecting a file in the tree opens it in the code viewer. AI comments on a file appear in the chat panel. The three components must stay in sync.

## Key information

### Background and problem

**Current state**: The AICR feature in YiVad needs a file tree component for navigating code changes during AI-powered code review sessions. The file tree must integrate with the existing CodeViewer (displays file content) and ChatPanel (displays AI review comments).

**Problem statement**: How might we design a performant, code-aware file tree that enables efficient navigation of code changes during AI code review sessions, with diff indicators, batch operations, and seamless integration with the code viewer and chat panel?

**Business value**:
- Reviewer efficiency: reviewers can navigate code changes faster with visual diff indicators
- Review completeness: batch operations and progress indicators help reviewers track review coverage
- Integration: the file tree is the navigation hub for the three-panel AICR layout

### User personas

**Persona 1: Code Reviewer (primary user)**
- Role: Senior engineer reviewing code changes
- Context: Reviews 5-20 pull requests per week. Needs to navigate large diffs efficiently.
- Workflow: Scan file tree for changed files -> Select a file -> Review the diff in the code viewer -> Read AI comments in the chat panel -> Approve or request changes
- Pain points: "I waste time finding which files actually changed. Large PRs have too many files to review one by one. I need to track which files I've already reviewed."
- Goals: Quickly identify changed files, track review progress, batch approve trivial changes

**Persona 2: Code Author (secondary user)**
- Role: Engineer who submitted the code changes
- Context: Checks review comments and responds to feedback
- Workflow: Open the file tree -> See which files have comments -> Click on a file -> Read the comment in the chat panel -> Respond or fix the code
- Pain points: "I don't know which files have comments until I click on them. I need to see an overview of all comments across all files."
- Goals: See which files have pending comments, navigate to files with unresolved feedback

**Persona 3: Team Lead (tertiary user)**
- Role: Engineering manager monitoring review progress
- Context: Checks that code reviews are thorough and complete
- Workflow: Open the review session -> Check the file tree for review progress indicators -> Identify files that have not been reviewed
- Pain points: "I can't tell if the reviewer has looked at every file. I need to see review coverage at a glance."
- Goals: See review progress per file, identify unreviewed files

### Functional requirements

**FR1: File Tree Rendering**
- Render hierarchical file/directory structure with collapsible directories
- Support lazy loading: child nodes are loaded when the parent directory is expanded
- Support virtual scrolling for large file trees (10,000+ files)
- Display file icons based on file type/extension
- Display directory expand/collapse state with chevron icons
- Persist directory expand/collapse state across sessions

**FR2: Diff Indicators**
- Show file status indicators: Added (A), Modified (M), Deleted (D), Renamed (R), Unchanged (no indicator)
- Show review status indicators: Reviewed (checkmark), Unreviewed (no indicator), Has comments (comment icon)
- Show aggregate status on directories: directory shows the combined status of all files within it
- Color-code indicators: green (added), yellow (modified), red (deleted), blue (reviewed)

**FR3: File Selection**
- Single-click to select a file (opens in code viewer)
- Multi-select with Ctrl+Click (Windows/Linux) or Cmd+Click (Mac)
- Range select with Shift+Click
- Select all files in a directory
- Visual indication of selected files (highlighted row)

**FR4: Batch Operations**
- Approve all selected files
- Request changes on all selected files
- Mark all selected files as reviewed
- Batch operations must show a confirmation dialog with the count of affected files
- Batch operations must be undoable within 5 seconds (toast with undo button)

**FR5: Search and Filter**
- Search files by name (fuzzy search)
- Filter by file status: show only Added, Modified, Deleted, etc.
- Filter by review status: show only Unreviewed, Has Comments, etc.
- Filter by file extension
- Search/filter must update in real-time as the user types (< 100ms)

**FR6: Context Menu**
- Right-click on a file: Open in code viewer, Mark as reviewed, Add comment, Copy file path
- Right-click on a directory: Expand all, Collapse all, Mark all as reviewed
- Context menu must be keyboard accessible (Shift+F10 or equivalent)

**FR7: Keyboard Navigation**
- Arrow keys to navigate up/down the file tree
- Enter to select/open a file
- Left arrow to collapse a directory
- Right arrow to expand a directory
- Space to toggle selection
- Ctrl+A to select all files
- Escape to clear selection

**FR8: Integration**
- Selecting a file in the tree opens it in the CodeViewer component
- AI comments on a file are displayed in the ChatPanel and indicated on the file in the tree
- The three-panel layout (file tree, code viewer, chat panel) must be resizable
- The file tree must respond to external events: file added by AI, file status changed by reviewer

### Interaction design requirements

**Layout**: The file tree occupies the left panel of the three-panel AICR layout. Minimum width: 200px. Default width: 300px. Resizable by the user.

**Visual design**:
- File tree rows: 28px height, with hover and selected states
- Indentation: 16px per level of nesting
- File icons: 16x16px, color-coded by file type
- Status indicators: 8x8px dots or 16x16px icons, positioned to the left of the file name
- Directory chevrons: 12x12px, rotated 90 degrees when expanded

**State persistence**:
- Expanded/collapsed directories: persisted across sessions (localStorage)
- Selected file: restored on page reload
- Filter state: cleared on page reload

**Empty states**:
- No files in the review session: "No files to review. Start a new review session."
- No results for search/filter: "No files match your search. Try a different query."
- All files reviewed: "All files reviewed. Great work!"

### Performance requirements

| Requirement | Target | Measurement |
|---|---|---|
| Initial render (1,000 files) | < 200ms | Chrome DevTools Performance tab |
| Initial render (10,000 files) | < 500ms | Chrome DevTools Performance tab |
| Expand/collapse directory | < 50ms | Time from click to rendered children |
| Search/filter | < 100ms | Time from keystroke to filtered results |
| Scroll performance | 60fps | Chrome DevTools frame rate during scroll |
| Memory usage | < 50MB for 10,000 files | Chrome DevTools Memory tab |
| Lazy load on scroll | < 100ms for next batch of 100 files | Time from scroll to rendered new rows |

### Non-functional requirements

| Requirement | Target |
|---|---|
| Accessibility | WCAG 2.1 AA (keyboard navigation, screen reader support, focus management) |
| Browser support | Chrome, Firefox, Safari, Edge (latest 2 versions) |
| Responsive | Minimum width 200px; gracefully handles narrow viewports |
| Internationalization | i18n support for all UI strings |
| Error handling | Graceful degradation when file data is unavailable or malformed |

### Success metrics

| Metric | Target |
|---|---|
| Time to navigate to a specific file | < 3 seconds (from opening the review to finding the file) |
| Review coverage | > 90% of files reviewed per session |
| User satisfaction (CSAT) | > 80% |
| Performance | All targets met for 10,000+ file repositories |
| Accessibility | WCAG 2.1 AA compliance |

### Risks and dependencies

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Performance with large repositories (10,000+ files) | High | High | Virtual scrolling from day one; lazy loading; performance testing with realistic data |
| Three-panel layout synchronization bugs | Medium | High | Define a clear event protocol between file tree, code viewer, and chat panel; integration tests |
| Diff data format changes from the backend | Medium | Medium | Define a stable data contract; version the API; graceful handling of unknown statuses |
| Accessibility requirements not met | Medium | Medium | Accessibility audit in each sprint; keyboard navigation implemented from day one |

## Action recommendations

1. Implement virtual scrolling from day one. Do not wait until performance becomes a problem. Virtual scrolling is a foundational requirement for large file trees.
2. Define the data contract between the file tree, code viewer, and chat panel before writing any component code. The three components must agree on the event protocol.
3. Implement keyboard navigation alongside mouse interactions. Accessibility is not an afterthought. Every mouse interaction must have a keyboard equivalent.
4. Performance test with 10,000+ files from the first sprint. Use realistic data (not generated test data). Find and fix performance issues early.
5. Diff indicators are the primary value add. Ensure they are visually clear, color-coded, and accessible to color-blind users (use icons in addition to color).

## Anti-patterns

- **Building a generic file tree** -- a generic file tree component does not have diff indicators, review status, or batch operations. The AICR file tree is purpose-built for the code review workflow. Build for the use case, not for reusability.
- **Ignoring performance at scale** -- testing with 50 files and assuming it will work with 10,000. Performance testing with realistic data from the first sprint.
- **No keyboard navigation** -- a file tree that is not keyboard-navigable is inaccessible to power users and users with disabilities. Every mouse interaction must have a keyboard equivalent.
- **Three-panel layout without event protocol** -- the file tree, code viewer, and chat panel must stay in sync. Without a defined event protocol, they will drift apart. Define the protocol before writing code.
- **No state persistence** -- losing expanded/collapsed state and selected file on page reload. The reviewer must re-navigate to the same file. Persist state across sessions.

## Related

- Same class: [./brd-agent-prd.md](./brd-agent-prd.md) -- another PRD instance in the same directory
- Same class: [./aichat-port-prd.md](./aichat-port-prd.md) -- AI Chat port PRD (chat panel integration)
- Upstream: [../../frameworks/write-a-spec-or-prd.md](../../frameworks/write-a-spec-or-prd.md) -- PRD writing framework
- Template: [../../../knowledge-curator/templates/prd.md](../../../knowledge-curator/templates/prd.md) -- PRD template
- Reference: [../../../engineer/lessons/win-yivad-aicr-phase-port.md](../../../engineer/lessons/win-yivad-aicr-phase-port.md) -- YiVad AICR port win document
- References: Internal YiVad AICR project; file tree component for AI code review