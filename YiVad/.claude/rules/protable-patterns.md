---
description: ProTable canonical table pattern — columns, pagination, selection, toolbar
globs: src/views/**/*.vue,src/components/ProTable/**/*
---

# ProTable Conventions

ProTable (`src/components/ProTable/`) is the canonical table pattern for YiVad. All new table pages must use it.

## Usage

```vue
<ProTable
  :columns="columns"
  :request-api="fetchData"
  :pagination="true"
  :selection="true"
/>
```

## Column Definition

Use `ColumnProps` from `src/components/ProTable/interface/`:
- `prop` — data field key
- `label` — column header
- `width` — optional fixed width
- `search` — configure search form item (el: `SelectFilter`, `TreeFilter`, etc.)
- `render` — custom cell render function

## Rules

1. **New table page → ProTable** — don't use raw `el-table`; ProTable integrates search, pagination, selection, and column settings
2. **Columns defined in page component** — or extracted to a `columns.ts` alongside the page
3. **Search form** → `SearchForm` component auto-generates from column `search` configs
4. **API calls through `src/api/`** — `requestApi` receives `{ pageNum, pageSize, ...searchParams }`
5. **Selection** → enable `:selection="true"`; access selected rows via `ref` handle
6. **Pagination** → `<Pagination>` child component handles it; don't add a second paginator
