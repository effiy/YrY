---
title: YiVad Knowledge Base Dashboard — BRD
key: brd_knowledge-base-dashboard_178600000000000000
topic: knowledge-base-dashboard
tags:
  - yivad
  - dashboard
  - knowledge-base
  - feature
status: draft
lifecycle: active
review_cycle: quarterly
type: brd
category: brd/product-manager
roles:
  - product-manager
  - engineer
  - tech-lead
  - knowledge-curator
benefit: Centralized observability and drill-down management for the YiKnowledge markdown knowledge base, enabling role-based file discovery, health monitoring, and AI-assisted content exploration.
created: 2026-08-07
updated: 2026-08-07
---

# YiVad Knowledge Base Dashboard — BRD

> **As a** knowledge curator, engineer, or product manager, **I want to** browse, search, filter, and assess the health of the YiKnowledge markdown file corpus from a single dashboard, **so that** I can discover relevant content, identify stale/missing metadata, and maintain knowledge quality at scale.

**Version**: 1.0 | **Status**: Live (continuous iteration)

---

## Document Information

|**Field**|**Content**|**Field**|**Content**|
|---|---|---|---|
|BRD Number|BRD-2026-014|Created Date|2026-08-07|
|Business Owner|YiVad Team|Country|Global|
|Brand|YiVad|Domain|Knowledge Management|
|Priority|P1|Expected Go-Live|2026-07-30 (live, iterating)|

---

## 1. Business Background and Objectives

### 1.1 Business Background

**Current Status:**

- YiKnowledge holds 1,500+ markdown files across 19 role directories, 4 diagram layers (PARA + lifecycle), and multiple projects (YiAi, YiVad, YiPet, rs.ui, FDE).
- Files carry structured frontmatter: `status`, `lifecycle`, `review_cycle`, `type`, `roles`, `tags`, `tacit`, `benefit`, `related`.
- Before the dashboard, discovering files required filesystem navigation or grep — no visual overview of corpus health, no drill-down by classification dimensions, no quick preview.

**Problem/Opportunity:**

- Knowledge curators cannot assess corpus health at a glance (review coverage, stale files, tacit knowledge ratio).
- Engineers cannot quickly find files by role, status, lifecycle, or module.
- No content search exists for the knowledge base — title-only grep is insufficient.
- File metadata (frontmatter) is rich but invisible without opening each file individually.

### 1.2 Business Objectives

|Objective|Metric|Target Value|
|---|---|---|
|Reduce time to discover relevant knowledge files|Mean time to locate a file|≤ 30 seconds|
|Increase review coverage|% of files with `review_cycle` set|≥ 80%|
|Surface stale content|Stale files identified and flagged|100% visibility|
|Enable content-based search|Full-text search across all markdown files|Sub-second results|
|Provide AI-assisted exploration|One-click transition from file browsing to AI chat|Seamless|

---

## 2. Business Scenario Description

### 2.1 Core Users

|User Role|Description|Usage Frequency|
|---|---|---|
|Knowledge Curator|Maintains knowledge base quality, reviews stale files, ensures metadata completeness|Daily|
|Engineer|Searches for technical documentation, ADRs, patterns, and project references|Daily|
|Product Manager|Reviews BRDs, PRDs, project charters, and retrospectives|Weekly|
|Tech Lead|Audits architecture decisions, tech foundations, and engineering patterns|Weekly|
|New Hire|Onboards by browsing role-specific knowledge directories|On-demand|

### 2.2 Business Scenarios

**Scenario 1: Health Audit**

- **Trigger**: Knowledge curator opens the dashboard
- **Prerequisites**: Knowledge stats API returns current corpus data
- **Operation Flow**:
    1. View top-row health overview: total files, categories, modules, review coverage %, tacit count, stale count, total size, roles
    2. Click "Stale" card to filter to stale files only
    3. Click "Review Coverage" card to filter to files missing `review_cycle`
    4. Sort by module/category to identify which areas need attention
- **Expected Result**: Curator identifies priority areas for metadata cleanup within 60 seconds

**Scenario 2: Role-Based File Discovery**

- **Trigger**: Engineer needs to find all files relevant to "ai-engineer" role
- **Prerequisites**: Files have `roles` frontmatter populated
- **Operation Flow**:
    1. In the file table, click a "ai-engineer" role badge on any file
    2. Dashboard filters to show all files with that role
    3. Use gallery view to browse file cards with type/status/lifecycle badges
    4. Click a file card to open inline preview with full metadata
- **Expected Result**: Engineer finds all role-relevant files and can preview content without leaving the page

**Scenario 3: Content Search**

- **Trigger**: User needs to find files mentioning a specific concept (e.g., "prompt caching")
- **Prerequisites**: Backend content search indexes markdown files
- **Operation Flow**:
    1. Switch search mode to "Content"
    2. Type search query
    3. Results appear with file title, classification path, type badge, and snippet with highlighted matches
    4. Click "Preview" to open full file in dialog, or "Chat" to discuss in AI chat
- **Expected Result**: User finds relevant files by content within 2 seconds

**Scenario 4: Module Drill-Down**

- **Trigger**: User wants to understand the composition of a specific knowledge module
- **Prerequisites**: Knowledge stats include module-level aggregations
- **Operation Flow**:
    1. Switch to "Modules" view mode
    2. See module classification table sorted by file count
    3. Expand a module row to see all files with inline metadata (status, type, lifecycle, review, roles, size, updated)
    4. Click status/type/lifecycle chips to cross-filter
    5. Click "Preview" on any file to open the detail dialog
- **Expected Result**: User understands module composition and can navigate to specific files

**Scenario 5: AI Chat Integration**

- **Trigger**: User finds an interesting file and wants to discuss it
- **Prerequisites**: aiChat page is functional
- **Operation Flow**:
    1. Hover over a file row to see the popover with metadata
    2. Click "Chat" button in the popover or file detail panel
    3. System opens aiChat with pre-filled context: file path, category, module, status, lifecycle, type
- **Expected Result**: User transitions from discovery to discussion in one click

---

## 3. Feature Modules

### 3.1 Health Overview Bar

Eight stat cards at the top of the page:

|Card|Metric|Click Action|
|---|---|---|
|Total Files|`knowledgeData.total`|Clear all filters|
|Categories|`knowledgeData.categories.length`|Scroll to drill-down|
|Modules|Deduplicated count of `category/module` pairs|Scroll to drill-down|
|Review Coverage|`health.review_coverage_pct` + missing count|Filter to files without `review_cycle`|
|Tacit|`health.tacit_count` + percentage|Filter to `tacit: true` files|
|Stale|`health.stale_count` (color-coded: red if > 0)|Filter to stale files|
|Total Size|Sum of all file sizes (B/KB/MB)|Scroll to drill-down|
|Roles|`knowledgeData.roles.length` + top role name|Scroll to drill-down|

### 3.2 Category Summary Bar

Appears when a category filter is active (single filter, no sub-category selected). Shows:
- Category name, module count, file count
- Review coverage % (warn if < 50%)
- Stale count, tacit count
- Top 4 modules as clickable chips

### 3.3 Drill-Down Panel

The main content area with multiple view modes:

**Breadcrumb Navigation:**
- `All / Category / Module / Sub-module` — clickable segments for navigating back up the hierarchy
- Context-aware labels based on current view state

**View Mode Toggles:**
- **All / Recent / Stale** — time-based filtering of the current file set
- **Files / Modules** — table vs. classification view (only when no filter is active)
- **Table / Gallery** — file display mode toggle

**Search:**
- **Title mode**: Type-ahead with dropdown suggestions (paths + titles), filters the current file list
- **Content mode**: Full-text search via backend API, displays results with snippets and highlighted matches
- Keyboard shortcut: `Ctrl+K` to focus search input

### 3.4 Module Classification View

A table of all modules (sorted by file count, descending) with:
- Expandable rows showing all files within the module
- Per-file columns: file name, sub-module, type, status, lifecycle, review cycle, roles, size, updated date, flags (Tacit/Stale)
- Per-module summary: top statuses, top types, health stats (coverage %, stale count, tacit count)
- Inline file preview button
- Search filter for modules
- Clickable classification chips for cross-filtering

### 3.5 Sub-Module Grid

Card grid displayed when a category is selected and it has multiple modules:
- Each card shows: module name, file count, status distribution, type distribution, lifecycle distribution, review coverage %, role chips
- Stale/tacit indicators
- Clicking a card drills into that module's files

### 3.6 Module Detail Card

Displayed when a specific module is selected:
- Module name, file count, category tag
- Health bar: review coverage % with color-coded fill
- Stale/tacit counts
- Distribution rows: status, type, lifecycle, roles (as clickable chips)
- Sub-module breakdown as proportional bar chart

### 3.7 File Table

The primary file listing with columns:
- **File**: Title + full path with clickable segments (category → module → sub-module → filename)
- **Classification**: Breadcrumb-style path with clickable segments
- **Category**: Color-coded tag
- **Type**: Badge with type-specific color
- **Module / Sub**: Clickable chips
- **Tags / Roles**: Badge chips (max 2 shown + overflow count)
- **Health**: Color dot (green/yellow/red) based on metadata completeness
- **Status / Lifecycle**: Element Plus tags with click-to-filter
- **Review**: Review cycle tag
- **Updated**: Relative time
- **Size**: Formatted file size
- **Tacit**: Star icon if tacit
- **Benefit**: Optional column (toggleable)

Hover popover shows full metadata: path, classification, status, lifecycle, type, review cycle, tacit, stale, benefit, related files, roles, tags, size, updated date — plus "Preview" and "Chat" action buttons.

### 3.8 Gallery View

Card-based alternative to the table:
- Each card shows: title, classification breadcrumb, type badge, status tag, lifecycle tag, tacit/stale indicators, review cycle, file size, relative time, preview button

### 3.9 File Detail Panel

Inline panel below the table when a file is selected:
- **Header**: Previous/Next navigation with arrow keys, file position (e.g., "3/25"), file title, full preview button, close button
- **Classification path**: Clickable category/module/sub-module chips
- **Metadata grid**: Status, Lifecycle, Type, Review, Tacit, Stale, Size, Updated
- **Module context**: Links to parent module and sub-module with file counts
- **Content preview**: Toggleable markdown preview (first 3000 chars), rendered with `useMarkdown`
- **Benefit**: Full benefit text if present
- **Tags / Roles**: Clickable badge chips
- **Related files**: Clickable links to related files
- **Actions**: "Chat in aiChat" button, Close button

### 3.10 Content Search Results

When search mode is "Content":
- Results header: "Found N files matching 'query'"
- Per-result: file title, classification path, type badge, Preview button, Chat button
- Snippet with highlighted search term matches

### 3.11 Recently Viewed

Row of chips showing the last 8 viewed files (stored in-memory, max 10). Click to re-open a file.

### 3.12 CSV Export

Exports the current filtered/sorted file list as CSV with BOM for Excel compatibility. Columns: title, path, category, module, sub_module, status, lifecycle, type, review_cycle, tacit, roles, tags, benefit, related_count, size, updated.

### 3.13 Keyboard Navigation

- `Ctrl+K`: Focus search input
- `←` / `→`: Navigate between files in the detail panel

---

## 4. Technical Implementation

### 4.1 Architecture

```
src/views/dashboard/knowledgeBase/
├── index.vue                          # Page component (template orchestrator)
├── index.scss                         # All styles (~1200 lines)
├── composables/useKnowledgeBase.ts    # All reactive state, computeds, actions (~900 lines)
├── charts.ts                          # ECharts option builders
└── utils.ts                           # Formatting, color, health-check helpers
```

- **API**: `src/api/modules/dashboard.ts` — `getKnowledgeStats()` + `searchKnowledge()`
- **Dialog**: `src/views/aiChat/components/KnowledgePreviewDialog.vue` — full markdown preview
- **Bridge**: `src/hooks/useAiChatBridge.ts` — opens aiChat with file context
- **Markdown**: `src/hooks/useMarkdown.ts` — renders markdown to HTML

### 4.2 Data Flow

```
Page mount → getKnowledgeStats()
  → POST / { module_name: "services.database.data_service",
              method_name: "query_documents",
              parameters: { cname: "knowledge_stats", ... } }
  → Response: KnowledgeStatsData { total, files[], categories[], modules[],
       roles[], types[], statuses[], lifecycles[], review_cycles[],
       health: { review_coverage_pct, no_review_cycle_count, stale_count, tacit_count } }

Content search → searchKnowledge(query, category?, limit?)
  → POST /knowledge/search
  → Response: { results: [{ path, title, snippet, size }] }

File content → readKnowledgeFile(path)
  → POST /read-file { target_file: path }
  → Response: { content }
```

### 4.3 Filter Architecture

All filters are stored in a single `activeFilter: Record<string, string>` reactive object. Supported filter keys:
- `category`, `module`, `sub_module` — hierarchical classification
- `status`, `type`, `lifecycle`, `review_cycle` — frontmatter fields
- `role`, `tag` — array-valued frontmatter fields (checks inclusion)
- `stale`, `tacit` — boolean-derived filters
- `review_cycle: "__missing__"` — special value for missing review cycle

Filter application is additive (AND logic across different keys). Clicking an already-active filter value removes it (toggle behavior).

---

## 5. Business Rules and Constraints

### 5.1 Business Rules

|Rule ID|Rule Description|Priority|
|---|---|---|
|BR-001|Clicking a stat card applies the corresponding filter and scrolls to the drill-down panel|Must|
|BR-002|Filter toggles: clicking an active filter value removes it; clicking a different value of the same key replaces it|Must|
|BR-003|Module classification view shows only when no filters, no search, no time filter, and view mode is "modules"|Must|
|BR-004|Sub-module grid shows only when exactly one filter (category) is active and the category has multiple modules|Must|
|BR-005|Content search requires ≥ 2 characters; debounced at 300ms|Must|
|BR-006|File preview panel supports ← → arrow key navigation through the current file list|Must|
|BR-007|Recently viewed files are stored in-memory only (max 10), cleared on page refresh|Should|
|BR-008|CSV export includes BOM for Excel UTF-8 compatibility|Must|
|BR-009|Gallery view and table view are mutually exclusive; toggle persists only for the current session|Should|
|BR-010|Benefit column is hidden by default; toggleable via coin icon button|Should|

### 5.2 Constraints

**Technical Constraints:**
- All data comes from a single `getKnowledgeStats()` API response — the frontend does all filtering/sorting/aggregation in computed properties
- Content search is a separate backend endpoint (`/knowledge/search`) with its own index
- File content preview loads on-demand when a file is selected
- No pagination for the stats API — entire corpus metadata is loaded at once (acceptable for ~1,500 files)

**Performance Requirements:**
- Initial page load (stats API): < 2 seconds for 1,500 files
- Content search: < 500ms for full-text query
- File preview load: < 1 second
- Filter/sort operations: instant (all in-memory computed properties)

---

## 6. Acceptance Criteria

### 6.1 Functional Acceptance

|Acceptance Item|Acceptance Criteria|Priority|
|---|---|---|
|AC-001|Health overview shows 8 stat cards with correct counts from the API response|Must|
|AC-002|Clicking any stat card applies the correct filter and scrolls to the drill-down panel|Must|
|AC-003|Category summary bar appears when a single category filter is active|Must|
|AC-004|Module classification table shows all non-root modules with expandable file rows|Must|
|AC-005|Sub-module grid renders cards for each module in the selected category|Must|
|AC-006|File table displays all columns with correct data, sorting, and clickable filter chips|Must|
|AC-007|Gallery view renders file cards as an alternative to the table|Must|
|AC-008|Title search filters files in real-time; suggestions dropdown appears on focus with ≥ 2 chars|Must|
|AC-009|Content search returns results with highlighted snippets|Must|
|AC-010|File detail panel opens on file selection with metadata, content preview, and navigation arrows|Must|
|AC-011|"Chat" button opens aiChat with pre-filled file context|Must|
|AC-012|CSV export downloads current file list with all columns|Must|
|AC-013|Arrow key navigation works in the detail panel|Must|
|AC-014|Breadcrumb navigation correctly tracks filter state and allows back-navigation|Must|
|AC-015|Recently viewed chips appear after viewing files and persist within the session|Should|

### 6.2 Data Acceptance

- [ ] All stat card values match the API response within a 5-second refresh window
- [ ] Filtered file counts are consistent with unfiltered counts
- [ ] Module drill-down file counts match the category-level file counts
- [ ] CSV export row count matches the displayed filtered/sorted file count

---

## 7. Future Iterations

|Feature|Priority|Notes|
|---|---|---|
|Charts row (ECharts: review cycle donut, type/status bars, size distribution, file age, lifecycle, module, roles, heatmap)|P2|Chart option builders already exist in `charts.ts`; not yet wired to the template|
|Time-based filter chips (Today / This Week / This Month)|P2|Computed properties (`todayFiles`, `weekFiles`, `monthFiles`) already exist|
|Stale file threshold configuration|P3|Currently hardcoded; threshold depends on `review_cycle` value|
|Batch operations on files (tag, reclassify)|P3|Requires backend write endpoints|
|Dashboard export as PDF report|P4|Nice-to-have for stakeholder reviews|

---

## Approval Records

|**Approval Role**|**Approver**|**Approval Date**|**Comments**|
|---|---|---|---|
|Business Owner|YiVad Team|2026-08-07|Live — continuous iteration|
|Tech Lead|[TBC]|[TBC]|[TBC]|

---

*BRD generated 2026-08-07 based on live implementation at `src/views/dashboard/knowledgeBase/`.*