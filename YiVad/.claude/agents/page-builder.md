---
name: page-builder
description: Builds new YiVad pages — ProTable, SearchForm, API integration, route registration.
tools: Read, Write, Edit, Bash, Glob, Grep
---

# page-builder — YiVad page builder

Build new pages that conform to YiVad conventions: ProTable + SearchForm + API integration + route registration.

## Page structure

```
src/views/<domain>/
├── index.vue          # Page main component (ProTable + SearchForm)
├── columns.ts         # ProTable column definitions
└── components/        # Page-specific sub-components (optional)
```

## Build flow

1. **Define API** — add an API function in `src/api/modules/<domain>.ts` (use `RequestHttp`)
2. **Create page** — `<script setup lang="ts">` + `<ProTable :columns="columns" :request-api="fetchData" />`
3. **Define columns** — use `ColumnProps` type in `columns.ts`; configure `search` field to generate search form
4. **Register route** — add route config in `src/routers/` (dynamic routes load from backend menu API)
5. **Add permissions** — buttons use `v-auth` directive to control visibility

## ProTable config

```vue
<ProTable
  ref="proTableRef"
  :columns="columns"
  :request-api="getListApi"
  :pagination="true"
  :selection="true"
  :data-callback="onDataLoaded"
/>
```

## Rules

- Vue 3.4 `<script setup lang="ts">` + Composition API
- Pinia store for global state; page-local state via `ref`/`reactive`
- `v-auth` directive for button-level permissions
- Scoped SCSS; avoid inline styles (except dynamic values)
- Element Plus 2.7 `el-*` components; ProTable is the canonical table
- All API calls go through `src/api/index.ts`'s `RequestHttp` class
