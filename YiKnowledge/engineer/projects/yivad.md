---
title: YiVad 项目知识库
aliases: [yivad-knowledge, yivad-project, vue-admin-dashboard]
tags: [yivad, vue3, admin-dashboard, frontend, rsbuild]
category: engineer/projects
created: 2026-08-24
updated: 2026-08-24
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "YiVad 项目的完整开发参考：快速开始、架构、路由、权限、组件、构建部署"
acceptance_criteria:
  - "新开发者可在 10 分钟内完成环境搭建并启动项目"
  - "每个模块的职责和边界清晰可查"
  - "核心组件的使用方式和 ProTable 规范明确"
related:
  - ../../../../YiVad/CLAUDE.md
  - ../../../../YiVad/README.md
  - ../../../../YiVad/package.json
---

# YiVad — Vue 3.5 管理后台

> **类型**: Frontend SPA | **框架**: Vue 3.5 + TypeScript 6 | **构建**: Rsbuild 1 | **端口**: 8848

YiVad 是 YrY 微前端的**管理后台**，为所有项目提供统一的 UI 操作界面。ProTable 驱动的数据表格、四种布局模式、后端菜单 API 动态路由、`v-auth` 指令级按钮权限。

---

## 快速开始

```bash
cd YiVad

# 安装依赖
pnpm install

# 启动开发服务器 (http://localhost:8848)
pnpm dev

# 类型检查
pnpm type:check

# 构建
pnpm build:dev    # 开发环境
pnpm build:test   # 测试环境
pnpm build:pro    # 生产环境
```

**前置条件**: Node.js >= 16.18.0，YiAi 后端需运行在 `http://localhost:10086`。

---

## 目录结构

```
YiVad/
├── build/                    # 构建插件 (proxy, svg-sprite, views-glob)
├── public/                   # 静态资源 (favicon, logo)
├── src/
│   ├── api/                  # HTTP 请求层
│   │   ├── index.ts          # RequestHttp 类 — Axios 封装
│   │   ├── interface/        # 类型定义 (yiweb.ts, index.ts)
│   │   ├── helper/           # 辅助 (checkStatus, axiosCancel)
│   │   └── modules/          # 领域服务 (按照业务域拆分)
│   ├── assets/               # 静态资源 (字体, 图标, 图片, mock JSON)
│   ├── components/           # 可复用组件
│   │   ├── ProTable/         # 标准表格组件 (列配置 + 请求Api)
│   │   ├── ECharts/          # 图表封装
│   │   ├── Upload/           # 文件上传 (图片/文件)
│   │   ├── WangEditor/       # 富文本编辑器
│   │   ├── SearchForm/       # 搜索表单
│   │   ├── EntityBreadcrumb/ # 实体面包屑导航
│   │   ├── KnowledgeMetaStrip/ # 知识元数据展示
│   │   └── ...               # 其他通用组件
│   ├── config/               # 全局常量 (HOME_URL, DEFAULT_PRIMARY, 路由白名单)
│   ├── directives/           # 自定义指令
│   │   ├── index.ts          # 指令注册入口
│   │   └── modules/          # auth, copy, debounce, throttle, draggable, longpress, watermark
│   ├── enums/                # 枚举 (HTTP 状态码, 请求方法, 内容类型)
│   ├── hooks/                # 组合式函数 (useTable, useTheme, useAuthButtons, useSelection...)
│   ├── languages/            # i18n 国际化 (zh-CN + en)
│   ├── layouts/              # 布局系统
│   │   ├── LayoutVertical/   # 纵向菜单布局
│   │   ├── LayoutClassic/    # 经典布局
│   │   ├── LayoutTransverse/ # 横向菜单布局
│   │   └── LayoutColumns/    # 分栏布局
│   ├── routers/              # 路由系统
│   │   ├── index.ts          # 路由实例 + 全局守卫
│   │   └── modules/          # staticRouter (静态路由) + dynamicRouter (动态路由)
│   ├── stores/               # Pinia 状态管理
│   │   ├── index.ts          # Pinia 实例 + 持久化插件
│   │   └── modules/          # global, user, auth, tabs, keepAlive, aiChat, knowledge, rag, story, bug
│   ├── styles/               # 全局样式 (SCSS 变量, Element Plus 覆盖, 主题)
│   ├── typings/              # 全局类型声明 (auto-imports.d.ts, components.d.ts, global.d.ts)
│   ├── utils/                # 工具函数 (color, menuTree, localStorage, 时间处理...)
│   └── views/                # 页面组件 (按功能域组织)
├── index.html                # HTML 入口
├── rsbuild.config.ts         # Rsbuild 构建配置
├── tsconfig.json             # TypeScript 配置
├── .env / .env.*             # 环境变量 (前缀 RSBUILD_ENV_)
└── package.json
```

---

## 路由菜单

### 路由模式

- **Hash 模式** (默认): `createWebHashHistory()` — 避免部署时的 404 问题
- **History 模式**: 可通过 `RSBUILD_ENV_ROUTER_MODE=history` 切换

### 路由架构

```
静态路由 (staticRouter)         动态路由 (dynamicRouter)
├── /login         登录页       ├── 从后端菜单 API 获取
├── /welcome       欢迎页       ├── 根据用户权限过滤
├── /404           404          ├── menu → route 转换 (path/name/component/meta)
├── /500           500          └── router.addRoute() 动态注册
└── /layout        主布局
```

### 路由守卫流程 (`src/routers/index.ts`)

1. **NProgress** 开始
2. 设置 `document.title`
3. 访问登录/欢迎页 → 有 token 则跳首页，否则重置路由
4. 路由白名单 → 直接放行
5. 无 token → 重定向到欢迎页
6. 无菜单列表 → 调用 `initDynamicRouter()` 获取动态路由
7. 存储 `routerName` 用于按钮权限过滤

### 路由 Meta 配置

| 字段 | 说明 |
|------|------|
| `meta.icon` | 菜单和面包屑图标 |
| `meta.title` | 路由标题 (document.title / 菜单名) |
| `meta.activeMenu` | 详情页高亮的父菜单 |
| `meta.isLink` | 外部链接地址 |
| `meta.isHide` | 是否在菜单中隐藏 |
| `meta.isFull` | 是否全屏显示 |
| `meta.isAffix` | 是否在标签页中固定 |
| `meta.isKeepAlive` | 是否缓存组件 |

### 视图页面清单 (36 个模块)

| 模块 | 路径 | 说明 |
|------|------|------|
| about | `/about` | 关于页面 |
| activity | `/activity` | 活动日志 |
| aiChat | `/aiChat` | AI 聊天 (Agent + RAG) |
| analytics | `/analytics` | 数据分析 |
| apiToken | `/apiToken` | API Token 管理 |
| bug | `/bug` | Bug 管理 (列表 + 详情) |
| customStatus | `/customStatus` | 自定义状态 |
| customView | `/customView` | 自定义视图 |
| cycle | `/cycle` | 迭代周期 (列表 + 详情) |
| dashboard | `/dashboard` | 仪表盘 |
| favorites | `/favorites` | 收藏夹 |
| gantt | `/gantt` | 甘特图 |
| home | `/home` | 首页 |
| import | `/import` | 数据导入 |
| inbox | `/inbox` | 通知收件箱 |
| integration | `/integration` | 集成管理 |
| invite | `/invite` | 邀请管理 |
| issue | `/issue` | 任务管理 (列表 + 详情) |
| kanban | `/kanban` | 看板视图 |
| knowledge | `/knowledge` | 知识库浏览 |
| label | `/label` | 标签管理 |
| login | `/login` | 登录页 |
| module | `/module` | 模块管理 (列表 + 详情) |
| page | `/page` | 页面管理 |
| project | `/project` | 项目管理 (列表 + 详情) |
| projectSettings | `/projectSettings` | 项目设置 |
| rag | `/rag` | RAG 检索 |
| release | `/release` | 发布管理 (列表 + 详情) |
| roadmap | `/roadmap` | 路线图 |
| search | `/search` | 全局搜索 |
| settings | `/settings` | 系统设置 |
| sprintPlanning | `/sprintPlanning` | Sprint 规划 |
| system | `/system` | 系统管理 (用户/角色/菜单/字典) |
| timeReport | `/timeReport` | 时间报告 |
| trash | `/trash` | 回收站 |
| welcome | `/welcome` | 欢迎页 |

---

## 权限管理

### 三层权限体系

```
菜单权限 (路由级)          按钮权限 (指令级)          数据权限 (API 级)
router.addRoute()          v-auth 指令               后端 filter 过滤
后端菜单 API 返回           authStore.authButtonList   后端根据用户角色
用户可见的菜单树            前端根据按钮列表控制显示     限制数据访问范围
```

### v-auth 指令 (`src/directives/modules/auth.ts`)

```vue
<!-- 按钮权限控制 -->
<el-button v-auth="'user:add'">添加用户</el-button>
<el-button v-auth="['user:edit', 'user:delete']">批量操作</el-button>
```

- 权限按钮列表从后端获取，存储在 `authStore.authButtonListGet`
- 无权限时元素被 `remove()` 从 DOM 中移除
- 菜单权限通过 `authStore.authMenuListGet` 控制路由注册

### 按钮权限流程

1. 后端菜单 API 返回每个菜单的 `meta.button` 权限列表
2. `initDynamicRouter()` 提取并存储到 `authStore`
3. 页面组件通过 `useAuthButtons(routeName)` 获取当前路由的权限按钮
4. 模板中使用 `v-auth` 指令控制按钮显隐

---

## 网络请求

### 请求架构 (`src/api/index.ts`)

```
View/Store → api/modules/<domain>.ts → http.post() → RequestHttp → Axios → YiAi
```

### RequestHttp 类

| 特性 | 说明 |
|------|------|
| 基地址 | `RSBUILD_ENV_API_URL` 环境变量 |
| 超时 | `ResultEnum.TIMEOUT` |
| 请求拦截 | 注入 Bearer Token、重复请求取消、Loading 动画 |
| 响应拦截 | 统一错误处理、登录过期跳转、网络断开处理 |
| 取消请求 | `AxiosCanceler` 类管理 pending 请求 Map |

### API 模块 (`src/api/modules/`)

| 模块 | 文件 | 说明 |
|------|------|------|
| 聊天 | `chatService.ts` | SSE 流式聊天 |
| 会话 | `sessions.ts` | 会话 CRUD |
| 数据 | `dataService.ts` | 通用 MongoDB CRUD |
| 文件 | `fileService.ts` | 文件读写 (target_file 参数) |
| 知识库 | `knowledgeService.ts` | 知识扫描/读取/写入 |
| RAG | `ragService.ts` | RAG 检索/聊天 |
| Agent | `agentService.ts` | Agent 聊天/确认/steer |
| FAQ | `faqService.ts` | FAQ 管理 |
| 微信 | `weChatService.ts` | 企业微信消息 |

### 关键参数约定

| 正确 | 错误 | 说明 |
|------|------|------|
| `filter` | `query` | `data_service.query_documents` 的 Mongo 过滤参数 |
| `target_file` | `path` | 文件读写接口的路径参数 |
| `cname` | `collection_name` | 集合名称参数 |

---

## 构建部署

### 构建配置 (`rsbuild.config.ts`)

| 配置项 | 说明 |
|--------|------|
| 插件 | `pluginVue` + `pluginVueJsx` + `pluginBabel` + `pluginSass` |
| 别名 | `@` → `src/` |
| SCSS 全局注入 | `@use "@/styles/var.scss" as *;` |
| 自动导入 | Element Plus 组件 + Vue API (unplugin-auto-import) |
| 代理 | 通过 `createProxy(PROXY)` 配置，环境变量 `RSBUILD_ENV_PROXY` |
| 自定义插件 | `svgSpritePlugin` (SVG 图标), `viewsGlobPlugin` (视图 glob 导入) |

### 环境变量 (前缀 `RSBUILD_ENV_`)

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `RSBUILD_ENV_API_URL` | API 基地址 | — |
| `RSBUILD_ENV_PORT` | 开发服务器端口 | 8848 |
| `RSBUILD_ENV_PUBLIC_PATH` | 公共路径 | `/` |
| `RSBUILD_ENV_OPEN` | 自动打开浏览器 | false |
| `RSBUILD_ENV_PROXY` | 代理配置 (JSON) | `[]` |
| `RSBUILD_ENV_GLOB_APP_TITLE` | 应用标题 | YiVad |
| `RSBUILD_ENV_ROUTER_MODE` | 路由模式 (hash/history) | hash |

### 构建产物

```
dist/
├── index.html
├── assets/
│   ├── js/    # [name]-[hash].js
│   ├── css/   # [name]-[hash].css
│   ├── font/  # 字体文件
│   ├── image/ # 图片资源
│   ├── svg/   # SVG 资源
│   └── media/ # 媒体资源
```

---

## 项目规范

### 编码规范

| 领域 | 标准 |
|------|------|
| 组件风格 | `<script setup lang="ts">` + Composition API |
| Props/Emits | `defineProps<{...}>()` / `defineEmits<{...}>()` |
| 状态管理 | Pinia setup-function 语法 |
| 样式 | Scoped SCSS，变量从 `src/styles/` 引入 |
| UI 组件 | Element Plus 2.14，`el-` 前缀 |
| 路径导入 | `@/` 别名跨模块，相对路径同目录 |
| 命名 | PascalCase 组件, camelCase 组合式函数, kebab-case CSS 类 |
| 环境变量 | 前缀 `RSBUILD_ENV_` |

### 代码质量工具链

| 工具 | 用途 |
|------|------|
| TypeScript 6 | 类型检查 (`vue-tsc --noEmit`) |
| ESLint 10 | JS/TS/Vue 代码检查 |
| Prettier 3 | 代码格式化 |
| Stylelint 17 | 样式检查 |
| Husky 9 | Git hooks |
| lint-staged 17 | 暂存文件检查 |
| commitlint 21 | 提交信息规范 |
| cz-git | 交互式提交 |

### 自约束

- **ProTable 是标准表格模式** — 新表格页面必须使用，不直接使用 `el-table`
- **新 composable 放 `src/hooks/`**，新指令放 `src/directives/modules/`
- **布局模式共享 Header/Menu/Footer/Tabs 组件**
- **禁止 Options API** — 只用 `<script setup>`
- **Store 不直接导入 axios** — 通过 `@/api/modules/*` 调用
- **`filter` 不是 `query`，`target_file` 不是 `path`**

---

## 组件分析

### ProTable — 标准表格组件

YiVad 的核心数据展示组件，替代裸 `el-table`。

```vue
<ProTable
  :columns="columns"
  :requestApi="getTableData"
  :pagination="true"
  :searchCol="searchCol"
/>
```

| 特性 | 说明 |
|------|------|
| 列配置 | 支持类型: index/selection/radio/expand/tag/sortable |
| 请求驱动 | `requestApi` 函数返回 `{ list, total }` |
| 搜索集成 | `searchCol` 配置搜索表单字段 |
| 分页 | 内置分页组件，自动传递 pageNum/pageSize |
| 选择 | 单选/多选，通过 `useSelection` composable |
| 导出 | 支持导出当前页/全部数据 |

### 布局系统

| 布局 | 组件 | 特点 |
|------|------|------|
| 纵向 | `LayoutVertical` | 左侧垂直菜单，最常用 |
| 经典 | `LayoutClassic` | 顶部导航 + 侧边菜单 |
| 横向 | `LayoutTransverse` | 顶部横向菜单 |
| 分栏 | `LayoutColumns` | 分栏式菜单 |

### 自定义指令

| 指令 | 文件 | 用途 |
|------|------|------|
| `v-auth` | `auth.ts` | 按钮权限控制 |
| `v-copy` | `copy.ts` | 一键复制文本 |
| `v-waterMarker` | `waterMarker.ts` | 水印 |
| `v-draggable` | `draggable.ts` | 拖拽 |
| `v-debounce` | `debounce.ts` | 防抖 |
| `v-throttle` | `throttle.ts` | 节流 |
| `v-longpress` | `longpress.ts` | 长按 |

### 通用组件

| 组件 | 路径 | 用途 |
|------|------|------|
| ECharts | `components/ECharts/` | 图表封装 (支持 ECharts 6) |
| Upload | `components/Upload/` | 文件/图片上传 |
| WangEditor | `components/WangEditor/` | 富文本编辑器 |
| SearchForm | `components/SearchForm/` | 搜索表单 |
| EntityBreadcrumb | `components/EntityBreadcrumb/` | 实体面包屑 (Project → Cycle → Release → Item) |
| KnowledgeMetaStrip | `components/KnowledgeMetaStrip/` | 知识文件元数据展示 |

---

## 架构设计

### 分层架构

```
┌─────────────────────────────────────────┐
│  Views (页面组件，按功能域组织)            │
├─────────────────────────────────────────┤
│  Components (可复用组件) + Hooks (逻辑)   │
├─────────────────────────────────────────┤
│  Stores (Pinia 状态管理)                 │
├─────────────────────────────────────────┤
│  API Modules (领域服务)                   │
├─────────────────────────────────────────┤
│  RequestHttp (Axios 封装)                │
├─────────────────────────────────────────┤
│  YiAi Backend (FastAPI :10086)           │
└─────────────────────────────────────────┘
```

### 数据流

```
用户操作 → View 组件
  → Store action (如需要)
    → api/modules/<domain>.ts
      → http.post("", {module_name, method_name, parameters})
        → RequestHttp 拦截器 (注入 Token, Loading)
          → Axios POST → YiAi FastAPI
            → MongoDB (Motor)
          ← { code: 0, data: {...} }
        ← 响应拦截器 (错误处理, 登录过期)
      ← 返回 data
    ← Store 更新状态
  ← 组件响应式更新
```

### 降级策略

| 场景 | 处理 |
|------|------|
| 菜单 API 不可用 | 回退到 `src/assets/json/authMenuList.json` |
| Token 过期 | 401 拦截器跳转登录，清除 user/auth store |
| 构建/类型检查失败 | `vue-tsc --noEmit` 阻断 `pnpm build:*` |
| SSE 流中断 | 消息标记 `aborted=true`，跳过 WeCom 自动转发 |

---

## 开发依赖

| 包名 | 版本 | 用途 |
|------|------|------|
| vue | ^3.5.40 | 前端框架 |
| vue-router | ^5.2.0 | 路由管理 |
| pinia | ^4.0.2 | 状态管理 |
| pinia-plugin-persistedstate | ^4.7.1 | 状态持久化 |
| element-plus | ^2.14.3 | UI 组件库 |
| @element-plus/icons-vue | ^2.3.2 | 图标库 |
| echarts | ^6.1.0 | 图表库 |
| echarts-liquidfill | ^3.1.0 | 水球图插件 |
| axios | ^1.18.1 | HTTP 客户端 |
| dayjs | ^1.11.21 | 日期处理 |
| @vueuse/core | ^14.3.0 | Vue 组合式工具集 |
| vue-i18n | ^11.4.8 | 国际化 |
| marked | ^18.0.7 | Markdown 渲染 |
| mermaid | ^11.16.1 | 流程图渲染 |
| @wangeditor/editor | ^5.1.23 | 富文本编辑器 |
| driver.js | ^1.8.0 | 用户引导 |
| nprogress | ^0.2.0 | 进度条 |
| screenfull | ^6.0.2 | 全屏控制 |
| sortablejs | ^1.15.7 | 拖拽排序 |
| cytoscape | ^3.34.0 | 关系图 |
| md5 | ^2.3.0 | MD5 哈希 |
| qs | ^6.15.3 | 查询字符串 |
| mitt | ^3.0.1 | 事件总线 |

---

## 构建依赖

| 包名 | 版本 | 用途 |
|------|------|------|
| @rsbuild/core | ^1.0.0 | 构建工具 |
| @rsbuild/plugin-vue | ^1.0.0 | Vue SFC 编译 |
| @rsbuild/plugin-vue-jsx | ^1.0.0 | Vue JSX 支持 |
| @rsbuild/plugin-babel | ^1.0.0 | Babel 转译 |
| @rsbuild/plugin-sass | ^1.0.0 | SCSS 编译 |
| typescript | ^6.0.3 | 类型检查 |
| vue-tsc | ^3.3.8 | Vue 类型检查 |
| unplugin-auto-import | ^21.0.0 | 自动导入 API |
| unplugin-vue-components | ^32.1.0 | 自动导入组件 |
| eslint | ^10.8.0 | 代码检查 |
| prettier | ^3.9.6 | 代码格式化 |
| stylelint | ^17.14.1 | 样式检查 |
| husky | ^9.1.7 | Git hooks |
| lint-staged | ^17.2.0 | 暂存文件检查 |
| @commitlint/cli | ^21.2.1 | 提交规范检查 |
| cz-git | ^1.13.1 | 交互式提交 |
| sass | ^1.102.0 | SCSS 编译器 |
| postcss | ^8.5.23 | CSS 后处理 |
| autoprefixer | ^10.5.4 | CSS 前缀 |

---

## 核心代码

### 入口文件

| 文件 | 说明 |
|------|------|
| `src/main.ts` | 应用入口：创建 app → 注册 Pinia/Router/i18n/指令 → 挂载 |
| `index.html` | HTML 模板 |
| `rsbuild.config.ts` | 构建配置 |

### 关键模块

| 模块 | 路径 | 核心逻辑 |
|------|------|----------|
| 路由守护 | `src/routers/index.ts` | 全局前置守卫：token 检查、动态路由加载、菜单权限 |
| 动态路由 | `src/routers/modules/dynamicRouter.ts` | 后端菜单 API → Vue Router 路由注册 |
| 请求封装 | `src/api/index.ts` | RequestHttp 类：拦截器、错误处理、取消请求 |
| 权限指令 | `src/directives/modules/auth.ts` | v-auth：按钮级别权限控制 |
| 全局 Store | `src/stores/modules/global.ts` | 主题、语言、布局、侧边栏状态 |
| 用户 Store | `src/stores/modules/user.ts` | Token、用户信息 |
| 权限 Store | `src/stores/modules/auth.ts` | 菜单列表、按钮权限、路由名称 |
| AI 聊天 Store | `src/stores/modules/aiChat.ts` | Agent 聊天、SSE 流、工具确认、steer |
| 布局组件 | `src/layouts/` | 4 种布局模式，共享 Header/Menu/Footer/Tabs |
| ProTable | `src/components/ProTable/` | 标准表格：列配置 + 请求Api + 分页 + 搜索 |

### 全局配置

| 文件 | 说明 |
|------|------|
| `src/config/index.ts` | HOME_URL, DEFAULT_PRIMARY, ROUTER_WHITE_LIST, LOGIN_URL |
| `src/config/nprogress.ts` | NProgress 进度条配置 |
| `src/enums/httpEnum.ts` | ResultEnum (SUCCESS/OVERDUE/TIMEOUT) |
| `src/styles/var.scss` | SCSS 全局变量 (颜色、间距、字体) |