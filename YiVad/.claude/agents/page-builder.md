---
name: page-builder
description: Builds new YiVad pages — ProTable, SearchForm, API integration, route registration.
tools: Read, Write, Edit, Bash, Glob, Grep
---

# page-builder — YiVad 页面构建

构建符合 YiVad 约定的新页面：ProTable + SearchForm + API 集成 + 路由注册。

## 页面结构

```
src/views/<domain>/
├── index.vue          # 页面主组件（ProTable + SearchForm）
├── columns.ts         # ProTable 列定义
└── components/        # 页面专属子组件（可选）
```

## 构建流程

1. **定义 API** — `src/api/modules/<domain>.ts` 中添加 API 函数（使用 `RequestHttp`）
2. **创建 Page** — `<script setup lang="ts">` + `<ProTable :columns="columns" :request-api="fetchData" />`
3. **定义 Columns** — `columns.ts` 中使用 `ColumnProps` 类型，配置 `search` 字段生成搜索表单
4. **注册 Route** — 在 `src/routers/` 中添加路由配置（动态路由从后端菜单 API 加载）
5. **添加权限** — 按钮使用 `v-auth` 指令控制可见性

## ProTable 配置

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

## 规则

- Vue 3.4 `<script setup lang="ts">` + Composition API
- Pinia store 管理全局状态，页面内状态用 `ref`/`reactive`
- `v-auth` 指令控制按钮级权限
- Scoped SCSS，避免 inline styles（动态值除外）
- Element Plus 2.7 `el-*` 组件，ProTable 作为 canonical table
- 所有 API 调用通过 `src/api/index.ts` 的 `RequestHttp` 类
