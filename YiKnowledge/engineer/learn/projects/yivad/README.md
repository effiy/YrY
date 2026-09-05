---
lifecycle: active
title: YiVad Engineering — README
status: stable
type: summary
category: engineer/learn/projects/yivad
tags:
  - yivad
  - engineering
  - readme
  - project-meta
created: 2026-08-03
updated: 2026-08-07
source: internal
last_verified: 2026-08-07
roles:
- engineer
benefit: "Engineers can understand and apply yivad engineering — readme with clear frameworks, actionable recommendations, and anti-pattern awareness"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
review_cycle: quarterly
tacit: false
related:
  - ./changelog.md
  - ./claude.md
  - ../README.md
---

# YiVad

> **作为** engineer，**我希望**理解并应用 YiVad 工程 — README，**以便**项目上下文被保留并可供团队访问。

> 使用 Vue 3.5、TypeScript 6、Rsbuild 1、Pinia 4 和 Element Plus 2.14 构建的开源后台管理框架。提供强大的 ProTable 组件用于声明式表格配置，以及动态路由、按钮级权限控制、四种布局模式和完整的 hooks / directives / composables 库。

> **新人 onboarding** → `YiKnowledge/engineer/run/onboarding/yivad/onboarding.md`（8 个章节：环境搭建 / 工作流 / 踩坑速查 / 第一天任务）

## 摘要

- YiVad 是一个 Vue 3.5 + TypeScript 6 后台管理框架，使用 Rsbuild 1、Pinia 4 和 Element Plus 2.14，提供 ProTable 驱动的声明式表格、来自后端菜单 API 的动态路由，以及通过 `v-auth` 指令实现的按钮级权限控制
- ProTable 是 YiVad 中最重要的架构模式——它将搜索、分页、排序和列配置封装为声明式 API，偏离这一模式是页面不一致的最常见原因
- `filter`/`query` 和 `target_file`/`path` 的 bug 是同一模式在不同领域中的表现：由于 YiVad 和 YiAi 之间缺乏自动化契约测试，导致 RPC 参数名静默不匹配
- `aiChat.ts` 中的 SSE `onDone` 守卫（`!aborted && !error`）防止部分或已中止的聊天内容被自动转发到 WeCom——每个具有外部副作用的 SSE 处理器都必须包含此守卫
- 动态路由依赖于 `authMenuList.json` 静态回退文件作为一等资产进行维护；当后端菜单 API 不可用时，过时的回退文件意味着用户看到的是损坏的菜单

## 核心观点

**ProTable 是 YiVad 中最重要的架构模式，偏离它是最常见的不一致来源。** ProTable 将搜索、分页、排序和列配置封装为声明式 API。使用原始 `el-table` 替代 ProTable 意味着从头重新实现分页、搜索和列配置。自我约束"ProTable 是规范表格模式"的存在，是因为每个不用 ProTable 构建的表格最终都需要 ProTable 提供的功能。

**`v-auth` 指令是权限控制的正确粒度，内联 `v-if` 权限检查始终是错误的。** 通过 `v-auth` 实现的按钮级权限与路由守卫解耦，支持细粒度的操作级控制。基于权限状态使用 `v-if` 会在权限模型和视图层之间创建紧耦合。

**`filter`/`query` 和 `target_file`/`path` 的 bug 是同一 bug 模式在不同领域中的表现。** 两者都是 YiVad 和 YiAi 之间的 RPC 参数名不匹配。两者都是静默的（无错误，错误结果或 422）。两者在同一周内修复（2026-07-28）。根本原因是两个代码库之间缺乏自动化契约测试。

**来自后端菜单 API 的动态路由功能强大，但静态回退文件（`authMenuList.json`）必须作为一等资产进行维护。** 当后端菜单 API 不可用时，整个导航结构依赖于静态 JSON 回退。如果回退过时，用户看到的是过时或损坏的菜单。添加新路由时必须更新回退文件。

**SSE `onDone` 守卫（`!aborted && !error`）是流式协议副作用安全的经验教训。** 2026-07-28 在 `aiChat.ts` 中的修复防止部分或已中止的聊天内容被自动转发到 WeCom 机器人。每个具有外部副作用（持久化、转发、通知）的 SSE `onDone` 处理器都必须包含类似的守卫。没有它，中途中止的用户会将不完整内容发送到外部渠道。

---

## 目录

- [介绍](#介绍)
- [特性](#特性)
- [架构](#架构)
- [模块边界](#模块边界)
- [数据流](#数据流)
- [安装与使用](#安装与使用)
- [目录结构](#目录结构)
- [浏览器支持](#浏览器支持)
- [领域语言](#领域语言)
- [近期变更](#近期变更)

---

## 介绍

YiVad 是一个使用 Vue 3.5、TypeScript 6、Rsbuild 1、Pinia 4 和 Element Plus 2.14 构建的开源后台管理框架。该项目提供强大的 ProTable 组件，极大提升开发效率，以及常用组件、hooks、指令、动态路由、按钮级权限控制、四种布局模式、KeepAlive 缓存和完整的 i18n（中英文）。

它是 Yi 家族的成员之一——与 **YiAi**（FastAPI 后端）和 **YiPet**（Chrome MV3 扩展）并列。

---

## 特性

- **Vue 3.5 + TypeScript 6**，使用 `<script setup>` 单文件组件。
- **Rsbuild 1 构建工具**，支持 Sass、TSX 语法、CORS 代理和 SVG 图标精灵。
- **Pinia 4** 状态管理，配合 `pinia-plugin-persistedstate` 实现 localStorage 同步。
- **完整的 Axios 封装**（TypeScript）——请求拦截、取消、通用请求封装、错误映射。
- **ProTable** 组件，基于 Element Plus 构建——表格页面完全由列配置驱动。
- **Element Plus 2.14**——尺寸切换、多主题、暗色模式、i18n。
- **动态路由权限守卫**，配合 Vue Router 5——懒加载 + 按钮级权限控制。
- **通过 KeepAlive 实现页面缓存**，支持多级嵌套路由。
- **自定义指令**——`v-auth`、`v-copy`、`v-watermark`、`v-drag`、`v-throttle`、`v-debounce`、`v-longpress`。
- **统一代码格式化**，使用 ESLint 10 + Prettier 3 + Stylelint 17。
- **标准化提交**，使用 husky 9、lint-staged 17、commitlint 21、cz-git + czg。
- **浏览器支持**：Chrome、Edge、Firefox、Safari（最近 2 个版本）。不再支持 IE。

---

## 架构

YiVad 沿**组件化**轴线推进：提取可复用组件、composables、共享 UI 原语；定义清晰的 props/events API；消除重复的标记代码。

```
┌──────────────────────────────────────────────────────────┐
│  Layout（4 种模式）                                        │
│  vertical · classic · transverse · columns               │
│  通过 globalStore.layout 动态切换                         │
└──────────────────────┬───────────────────────────────────┘
                       │ 将页面挂载到
                       ▼
┌──────────────────────────────────────────────────────────┐
│  Router（动态）                                           │
│  Vue Router 5（hash 模式）· 路由来自后端菜单 API           │
│  回退到 src/assets/json/authMenuList.json                │
│  守卫：beforeEach → 权限检查 → 401 → login               │
└──────────────────────┬───────────────────────────────────┘
                       │ 渲染
                       ▼
┌──────────────────────────────────────────────────────────┐
│  ProTable（列配置）                                       │
│  声明式表格：搜索 · 分页 · 排序                            │
│  由 ColumnProps[] 驱动（无需重复的表格标记代码）            │
└──────────────────────┬───────────────────────────────────┘
                       │ 由以下门控
                       ▼
┌──────────────────────────────────────────────────────────┐
│  Auth（v-auth 指令）                                      │
│  通过权限字符串列表实现按钮级可见性控制                      │
│  与路由守卫解耦——操作级控制                                │
└──────────────────────┬───────────────────────────────────┘
                       │ 通过 RequestHttp 发送 HTTP 请求
                       ▼
┌──────────────────────────────────────────────────────────┐
│  YiAi Backend（FastAPI :10086）                           │
│  RPC 信封：{module_name, method_name, parameters}        │
│  data_service · chat_service · /read-file · /write-file  │
└──────────────────────────────────────────────────────────┘
```

### 横切关注点

- **HTTP 层** — Axios `RequestHttp` 封装，包含拦截器、取消和 `checkStatus` 错误映射（`src/api/`）。
- **状态层** — Pinia stores（`global`、`user`、`auth`、`tabs`、`keepAlive`，以及按功能划分的 stores：`aiChat`、`knowledge`、`knowledgeTree`、`rag`、`story`、`bug`），支持持久化（`src/stores/`）。
- **Hooks** — composables（`useTable`、`useTheme`、`useAuthButtons`、`useSelection` 等）位于 `src/hooks/`。
- **指令** — 自定义指令位于 `src/directives/modules/`，通过 `src/directives/index.ts` 注册。
- **i18n** — Vue-i18n 11，`zh-CN` + `en` 语言文件位于 `src/languages/`。

---

## 模块边界

### 前端分层（自上而下）

| 层 | 公共 API |
|---|---|
| `src/views/` | 按功能领域组织的页面组件。每个页面从 `@/components`、`@/hooks`、`@/stores`、`@/api/modules` 导入。 |
| `src/layouts/` | 四种布局模式（vertical、classic、transverse、columns）——共享 Header / Menu / Footer / Tabs 组件。不要按布局分叉。 |
| `src/components/` | 可复用组件：`ProTable/`、`ECharts/`、`Upload/`、`WangEditor/`、`SearchForm/` 等。ProTable 是规范表格——不要使用原始 `el-table`。 |
| `src/hooks/` | Composables：`useTable`、`useTheme`、`useAuthButtons`、`useSelection` 等。文件名与 composable 同名（`useTable.ts`）。 |
| `src/stores/` | Pinia setup-function stores。Stores 可以从 `@/api/modules` 和 `@/hooks` 导入，但**不得**直接导入 `axios`。 |
| `src/api/modules/` | 领域服务函数（`sessions.ts`、`chatService.ts`、`dataService.ts`、`fileService.ts`、`faqService.ts`、`weChatService.ts` 等）。Stores 和 views 的公共 API 表面。 |
| `src/api/index.ts` | `RequestHttp` 类——Axios 封装，包含拦截器、取消、错误映射。Modules 调用 `http.post(...)`；其他代码不得导入 axios。 |
| `src/directives/` | `v-auth`、`v-copy`、`v-watermark`、`v-drag`、`v-debounce`、`v-throttle`、`v-longpress`。通过 `src/directives/index.ts` 注册。 |
| `src/routers/` | Hash 模式 Vue Router 5，配合来自后端菜单 API 的动态路由。守卫位于 `src/routers/beforeEach.ts`。 |

### 跨项目协议（YiVad ↔ YiAi）

| 操作 | 契约 |
|---|---|
| RPC 信封 | `{ module_name, method_name, parameters }` POST 到 `/` |
| `data_service.query_documents` | `parameters: { cname, filter?: dict, pageNum?, pageSize?, limit?, orderBy?, orderType? }`。**`filter`，不是 `query`。** |
| `data_service.create_document` / `update_document` / `delete_document` | `{ cname, key, data }`（create/update）或 `{ cname, key }`（delete） |
| Chat（SSE） | `streamChat({model, messages, system?, images?})` 通过 `services.ai.chat_service.chat` |
| `/read-file`、`/write-file` | 字段名为 `target_file`（不是 `path`） |
| `/upload-image-to-oss` | `{ data_url, filename, directory }` |
| `/knowledge/*` | 知识库扫描 / 读取 / 写入 / 元数据 CRUD |
| `/rag/*` | RAG 查询（一次性）+ RAG 聊天（SSE）+ 按文件变体；`scope` 按 `file_path` 子字符串过滤 |

---

## 数据流

### 表格获取（ProTable）

```
View 组件定义 columns + requestApi
   │
   ▼
ProTable 从 column.search 配置渲染 SearchForm
   │ 搜索/分页时：requestApi({ pageNum, pageSize, ...filters })
   ▼
api/modules/<domain>.ts → callService("services.database.data_service",
                                      "query_documents",
                                      { cname, filter, pageNum, pageSize })
   │ http.post("", {module_name, method_name, parameters})
   ▼
RequestHttp 拦截器：附加 X-Token、转换响应、错误时 checkStatus
   │
   ▼ fetch POST http://localhost:10086/
YiAi data_service.query_documents
   ▼ repository.query_documents → _build_filter → MongoDB find().sort().skip().limit()
   ▼ { list: [...], total, pageNum, pageSize, totalPages }
ProTable 接收 { list, total } → 渲染行 + Pagination
```

### 聊天（SSE 流式）

```
aiChat store — sendMessage / regenerateMessageAt / resendMessageAt
   │
   ▼ streamChat(payload, onChunk, onDone, onError)
fetch POST /  body: {module_name: "services.ai.chat_service",
                     method_name: "chat",
                     parameters: {model, messages, stream: true, system?, images?}}
                     signal: AbortController
   ▼
YiAi FastAPI → StreamingResponse(text/event-stream)
   yields: data: {"data": {"message": "..."}}\n\n
   ends:   data: {"done": true}\n\n
   ▼
streamChat 逐行解析 SSE，调用 onChunk(text) / onDone() / onError(err)
   ▼
Store 将增量追加到进行中的 pet 消息；中止时，标记 aborted=true
   on done: upsertSession(...) + autoForwardToWeCom(streamed) [aborted 时跳过]
```

### 文件读取/写入

```
View → fileService.readFile(path)
   ▼ fetch POST /read-file  body: { target_file: path }
   ▼ YiAi read_file → 磁盘（主）+ MongoDB（备用）→ { content }
View → fileService.writeFile(path, content)
   ▼ fetch POST /write-file  body: { target_file: path, content }
   ▼ YiAi write_file → 磁盘 + MongoDB upsert → success
```

---

## 安装与使用

### 安装

```bash
pnpm install
```

### 运行

```bash
pnpm dev      # 启动开发服务器，支持 HMR
pnpm serve    # dev 的别名
```

### 构建

```bash
# 开发环境
pnpm build:dev

# 测试环境
pnpm build:test

# 生产环境
pnpm build:pro
```

### Lint

```bash
# ESLint 代码检查
pnpm lint:eslint

# Prettier 代码格式化
pnpm lint:prettier

# Stylelint 样式格式化
pnpm lint:stylelint
```

### 提交

```bash
# 提交代码（提交前自动运行 lint:lint-staged）
pnpm commit
```

### 类型检查

```bash
pnpm type:check   # vue-tsc --noEmit --skipLibCheck
```

---

## 目录结构

```text
YiVad
├─ .husky                  # husky 配置文件
├─ .vscode                 # VSCode 推荐配置
├─ build                   # Rsbuild 配置选项（svg-sprite、views-glob、proxy）
├─ public                  # 静态资源（此文件夹不打包）
├─ src
│  ├─ api                  # API 接口管理（RequestHttp + modules）
│  ├─ assets               # 静态资源（字体、图标、图片、mock JSON）
│  ├─ components           # 全局组件（ProTable、ECharts、Upload、WangEditor）
│  ├─ config               # 全局配置（HOME_URL、DEFAULT_PRIMARY、路由白名单）
│  ├─ directives           # 全局指令（auth、copy、debounce、throttle、drag、longpress、watermark）
│  ├─ enums                # 通用枚举（HTTP 状态、请求方法、内容类型）
│  ├─ hooks                # 通用 hooks（useTable、useTheme、useAuthButtons、useSelection）
│  ├─ languages            # i18n 国际化（zh-CN + en）
│  ├─ layouts              # 布局模块（vertical、classic、transverse、columns）
│  ├─ routers             # 路由管理（动态路由、守卫、菜单到路由映射）
│  ├─ stores              # Pinia stores（global、user、auth、tabs、keepAlive、aiChat、knowledge、knowledgeTree、rag、story、bug）
│  ├─ styles              # 全局样式（SCSS、Element 覆盖、主题变量）
│  ├─ typings             # 全局 TypeScript 声明
│  ├─ utils               # 工具函数（color、菜单树操作、localStorage）
│  ├─ views               # 所有项目页面（按功能领域组织）
│  │  ├─ about            #   关于家族页面（yivad、yiai、yipet 子页面）
│  │  ├─ activity         #   活动流
│  │  ├─ aiChat           #   AI 聊天页面（agent 模式、SSE 流式、工具确认）
│  │  ├─ analytics        #   Pipeline 分析仪表盘
│  │  ├─ apiToken         #   API token 管理
│  │  ├─ bug              #   Bug 跟踪（列表 + 详情）
│  │  ├─ customStatus     #   自定义问题状态定义
│  │  ├─ customView       #   已保存的问题过滤视图
│  │  ├─ cycle            #   迭代周期（列表 + 详情 + 规划面板）
│  │  ├─ dashboard        #   仪表盘（knowledgeBase、rssContent、aiAnalytics）
│  │  ├─ favorites        #   用户收藏
│  │  ├─ gantt            #   甘特图时间线
│  │  ├─ home             #   首页
│  │  ├─ import           #   CSV/JSON 问题导入
│  │  ├─ inbox            #   通知收件箱
│  │  ├─ integration      #   Webhook 集成
│  │  ├─ invite           #   成员邀请
│  │  ├─ issue            #   问题跟踪（列表 + 详情）
│  │  ├─ kanban           #   看板
│  │  ├─ knowledge        #   知识库（pipeline、角色、技能、目标、指标）
│  │  ├─ label            #   标签管理
│  │  ├─ login            #   登录页面
│  │  ├─ module           #   模块管理（列表 + 详情）
│  │  ├─ page             #   文档页面
│  │  ├─ project          #   项目管理（列表 + 详情）
│  │  ├─ projectSettings  #   项目级设置
│  │  ├─ rag              #   RAG 系统（检索、聊天、对比、历史）
│  │  ├─ release          #   发布管理（列表 + 详情）
│  │  ├─ roadmap          #   路线图时间线
│  │  ├─ search           #   全文搜索
│  │  ├─ settings         #   工作区设置
│  │  ├─ sprintPlanning   #   迭代规划面板
│  │  ├─ system           #   系统管理（菜单、账户、角色、部门、字典、日志、任务）
│  │  ├─ timeReport       #   工时报告
│  │  ├─ trash            #   回收站（软删除条目）
│  │  └─ welcome          #   欢迎页面
│  ├─ App.vue             # 根组件
│  ├─ main.ts             # 入口文件
│  └─ rsbuild-env.d.ts    # Rsbuild 客户端类型 TypeScript 声明
├─ .editorconfig           # 统一编辑器编码风格配置
├─ .env                    # Rsbuild 通用配置
├─ .env.development        # 开发环境配置
├─ .env.production         # 生产环境配置
├─ .env.test               # 测试环境配置
├─ .eslintignore           # 忽略 ESLint 检查
├─ .eslintrc.cjs           # ESLint 配置文件
├─ .gitignore              # 忽略 git 提交
├─ .prettierignore         # 忽略 Prettier 格式化
├─ .prettierrc.cjs         # Prettier 配置
├─ .stylelintignore        # 忽略 stylelint 格式化
├─ .stylelintrc.cjs        # stylelint 配置
├─ CHANGELOG.md            # 项目变更日志
├─ commitlint.config.cjs   # Git 提交规范配置
├─ index.html              # 入口 HTML
├─ LICENSE                 # 开源许可证
├─ lint-staged.config.cjs  # lint-staged 配置
├─ package-lock.json       # 依赖版本锁定
├─ package.json            # 依赖管理
├─ postcss.config.cjs      # PostCSS 配置
├─ README.md               # README 介绍
├─ tsconfig.json           # TypeScript 全局配置
└─ rsbuild.config.ts      # Rsbuild 全局配置
```

---

## 浏览器支持

- 本地开发推荐使用最新版 Chrome — [下载](https://www.google.com/intl/zh-CN/chrome/)。
- 生产环境仅支持现代浏览器。不再支持 IE。更多详情请参见 [Can I Use ES Module](https://caniuse.com/?search=ESModule)。

| IE | Edge | Firefox | Chrome | Safari |
| :---: | :---: | :---: | :---: | :---: |
| 不支持 | 最近 2 个版本 | 最近 2 个版本 | 最近 2 个版本 | 最近 2 个版本 |

---

## 领域语言

YiVad 是后台管理系统领域模型，围绕三个核心概念构建：**菜单权限**、**动态路由**和**组件配置**。

### 术语

- **ProTable** — 基于 Element Plus `el-table` 构建的声明式表格组件，由 `columns` 配置数组驱动表格渲染、搜索、分页和排序，消除重复的表格模板代码。
- **Dynamic Router** — 从后端菜单 API 获取权限菜单树，将其扁平化并在运行时通过 `router.addRoute()` 注册路由的机制。与静态路由不同，动态路由仅根据用户权限显示。
- **AuthButton** — 通过 `v-auth` 指令控制页面按钮可见性的权限模型。按钮权限列表从后端 API 获取，与页面路由解耦，支持细粒度的操作级权限控制。
- **Pinia Store Persist** — 使用 `pinia-plugin-persistedstate` 自动将 Pinia store 状态同步到 `localStorage` 的机制，确保用户状态（token、主题、tabs）在页面刷新后保留。
- **Layout Mode** — YiVad 支持四种布局模式：`vertical`（侧边栏）、`classic`（经典）、`transverse`（顶部导航）、`columns`（分栏），可通过 `globalStore.layout` 动态切换。
- **RPC 信封** — 用于每次跨项目调用 YiAi 后端执行端点的 `{module_name, method_name, parameters}` 请求格式。
- **`filter`（不是 `query`）** — `data_service.query_documents` 中的 Mongo 过滤参数名。后端的 `_build_filter` 读取 `filter`，而非 `query`。YiVad 在早期版本中发送的是 `query`，导致返回空结果。
- **`target_file`（不是 `path`）** — `/read-file` 和 `/write-file` 的文件路径字段名。YiVad 的 `fileService.readFile/writeFile` 曾发送 `path`，导致 422 错误。

### 术语关系

- **Dynamic Router** 依赖 **AuthButton** 的权限数据来确定哪些菜单可见。
- **ProTable** 依赖 `useTable` hook 来处理分页和数据获取。
- **Pinia Store Persist** 应用于 `global`、`user` 和 `tabs` stores。
- **Layout Mode** 从 `globalStore` 消费主题和布局配置。
- 所有数据操作通过 **RPC 信封** 发送到 YiAi 的执行引擎或专用端点 `/read-file`、`/write-file`、`/upload-image-to-oss`。

### 示例对话

> **用户：** 我想在"用户管理"页面添加一个编辑按钮，但只有 admin 角色可以看到。
>
> **系统：** 在按钮上添加 `v-auth="'user:edit'"` 指令。后端通过 `authButtonList` API 返回当前角色的按钮权限列表。如果 `user:edit` 不在列表中，按钮将自动隐藏。

> **用户：** 如何在侧边栏菜单中添加新页面？
>
> **系统：** 在 `src/views/` 下创建页面组件，然后在后端菜单管理 API 中配置菜单项（path、name、component path）。前端使用**动态路由**在登录后自动获取并注册路由。如果后端不可用，可以直接在 `src/assets/json/authMenuList.json` 中添加菜单项。

### 歧义消除标记

| 术语 | 容易混淆的概念 |
|------|---------------|
| **ProTable** | 不是 Element Plus 的 `el-table`；ProTable 是包含搜索、分页和列配置的完整表格解决方案 |
| **Dynamic Router** | 不是 Vue Router 的懒加载（`() => import()`）或嵌套路由（children）；动态路由特指基于权限的运行时路由注册 |
| **AuthButton** | 不是路由守卫（`beforeEach`）；路由守卫控制页面级访问，而 AuthButton 控制页面内按钮级可见性 |
| **Persist** | 不是浏览器的 `localStorage` API；指的是 Pinia 插件的自动双向同步机制 |
| **Layout Mode** | 不是 CSS 布局或 Element Plus 的 `el-row/el-col` 网格；是页面级框架结构切换 |
| **`filter`** | 不是 `query`（后端的 `query_documents` 只识别 `filter`）；不是 Mongo 的 `$filter` 聚合阶段 |
| **`target_file`** | 不是 `path`——后端的 Pydantic 模型 `FileReadRequest`/`FileWriteRequest` 要求 `target_file` |

---

## 行动建议

1. **在下一个 sprint 内为 ProTable 数据获取 pipeline 引入 Vitest。** 当前架构零测试覆盖，而 ProTable requestApi -> callService -> RequestHttp -> YiAi 链是最常修改的代码路径。编写 3 个 composable 测试（useTable、useSelection、useAuthButtons）和 1 个集成测试，验证 `query_documents` 调用使用 `filter`（而非 `query`）达到正确的 RPC 信封格式。这是最高 ROI 的测试投资，因为它能捕获已导致真实 bug 的参数名回归。

2. **在 CI pipeline 中添加 `staticRouter.ts` 验证步骤，校验 `authMenuList.json` 中的每个路由都有对应的组件文件。** 当前回退机制依赖于静态 JSON 与实际组件文件保持同步。当添加新路由但未更新回退文件时，没有后端菜单 API 启动应用的用户会看到损坏的菜单。一个读取 `authMenuList.json` 并验证每个 `component` 路径在磁盘上存在的 CI 检查可以防止这种静默损坏状态。

3. **创建一页"ProTable 速查表"，将每个 `ColumnProps` 字段映射到其视觉效果和 RPC 契约影响。** 当前文档在多处引用 ProTable（CLAUDE.md、ProTable 模式规则、readme），但没有任何地方有一份单一参考回答："我想添加一个可搜索、可排序、带自定义渲染函数的列——我该写什么？"这份速查表应与 ProTable 组件放在一起，并从 onboarding 文档中链接。

4. **安排每月跨项目契约对齐检查，作为 15 分钟日历事件。** `filter`/`query` 和 `target_file`/`path` 的 bug 是同一模式在不同领域中的表现。每月一次由 YiVad 和 YiAi 各一名工程师检查跨项目协议表，审查新增参数或变更的字段名，可以在契约不匹配变成 bug 之前捕获它。该检查应作为重复日历事件，而非临时任务。

5. **添加 `RSBUILD_ENV_` 前缀验证 lint 规则，捕获任何残留的 `VITE_` 引用。** Vite 到 Rsbuild 的迁移变更了环境变量前缀，但开发者很容易习惯性地添加新的 `VITE_` 变量。在 pre-commit hooks 中添加一个简单的基于 grep 的 lint 规则，拒绝任何包含 `import.meta.env.VITE_` 的文件，可以在环境变量前缀回归到达 PR 之前阻止它。

6. **为 confirmation/steering/followup/resume 生命周期添加 agent 模式 E2E 测试。** pi Agent 循环（2026-08-08）引入了一个复杂的多轮协议，包括确认门禁、自然语言引导、followup 排队和按会话恢复。一个模拟完整 agent 生命周期（create → confirm → steer → followup → max_turns → resume）并针对运行中的 YiAi 实例的 Vitest 套件，可以捕获最复杂的前端状态机中的回归。从 `confirmationAnswerFor` 和 `isContinuationMessage` 纯工具测试开始（已分别单元测试 51/51 和 21/21），然后为 `runStream` 添加 store 级集成测试，使用 mock SSE 事件。

## 反模式

- **在新表格页面中使用原始 `el-table` 而非 ProTable。** ProTable 是规范表格模式。它将搜索、分页、排序和列配置封装为声明式 API。使用原始 `el-table` 意味着从头重新实现所有这些功能，导致页面不一致。

- **使用 `v-if` 配合权限状态而非 `v-auth` 指令。** `v-auth` 指令将权限逻辑与视图层解耦。使用 `v-if` 配合 `authStore.hasPermission('user:edit')` 内联创建紧耦合，使得在不触及每个视图的情况下无法更改权限模型。

- **直接调用 `axios` 而非通过 `RequestHttp`。** `RequestHttp` 类封装了 Axios，包含拦截器、取消、错误映射和 RPC 信封。直接导入 `axios` 绕过所有这些层，破坏认证、错误处理和统一响应信封。

- **在 RPC 调用中使用 `query` 而非 `filter`，或使用 `path` 而非 `target_file`。** 两种参数名不匹配都已导致真实 bug。后端静默忽略 `query`，对 `path` 返回 422。始终使用跨项目协议表中记录的契约名称。

- **在自动转发 SSE 结果到 WeCom 之前跳过 `!aborted && !error` 守卫。** 2026-07-28 在 `aiChat.ts` 中的修复防止部分或已中止的聊天内容被自动转发。每个具有外部副作用的 SSE `onDone` 处理器都必须包含此守卫。

## 相关

- [YiVad CLAUDE.md](./claude.md) — 项目配置、模块边界、自我约束和近期变更
- [YiVad changelog](./changelog.md) — 变更日志索引，含入口指针和 STALE 标记
- [YiVad architecture](../架构设计.md) — 技术栈、分层边界、关键数据流和降级策略
- [YiVad development standards](../开发规范.md) — 编码规范、命名、ProTable、SSE 和 RPC 字段契约
- [YiVad functional modules](../功能模块.md) — 20 个视图领域、18 个 API 模块、11 个 stores 清单
- [YiVad pipeline closed-loop](../流水线闭环.md) — 需求到部署的页面流程、数据模型和阶段映射

## 近期变更

### 2026-07-31 — Knowledge + RAG api 模块

- **`src/api/modules/`**：新增 `knowledgeService.ts`（扫描/读取/写入/stories）和 `ragService.ts`（RAG 聊天使用现有 SSE 解析器）。后端路由位于 `YiAi/src/server/routes/knowledge.py` 和 `rag.py`。
- **`src/stores/modules/`**：新增 `knowledge.ts`、`knowledgeTree.ts`、`story.ts` Pinia stores，支持 aiChat 知识功能。
- **`src/views/aiChat/components/KnowledgePreviewDialog.vue`**：知识详情弹窗——渲染 markdown 正文 + frontmatter 信息条（status / lifecycle / review_cycle / tacit / type / roles / tags + 可点击的 `related` 链接）。
- **`src/views/story/index.vue`**：Story Board 列表 + 详情抽屉。概览 tab 渲染 `store.storyMarkdown`（markdown 正文 + frontmatter 元数据条）。
- **不存在独立的 `/knowledge/*`、`/aicr/*` 或 `/bug/*` 路由或页面**——早期会话中的 `src/views/{knowledge,aicr,bug}/` + `KnowledgeTree.vue` + `useAicrKnowledgeStore` 声明从未落地到 master。Stores 和 api 模块仅支持 aiChat 功能。Bug UI 位于 `src/views/code-review/bugs/`（而非 `src/views/bug/`）。

### 2026-07-30 — 侧边栏对齐 + RSS → YiKnowledge 卸载

- **侧边栏对齐**：ChatSidebar + ConversationSidebar + ConversationSessionSidebar（均位于 `src/views/aiChat/components/`）对齐到 FileTree 风格基线——收藏 + 批量操作 + 悬停操作行 + 行内重命名。
- **RSS 卸载**：RSS 正文内容移至 `YiKnowledge/{category}` 下的 YiKnowledge markdown 文件；MongoDB 现在仅存储元数据（`category_path` + `file_path`）。

### 2026-07-28 — Bug 修复

- **`src/api/modules/fileService.ts`**：`readFile` 和 `writeFile` 发送 `{ path }`，但 YiAi 的 `/read-file` 和 `/write-file` 端点要求 `target_file`（Pydantic `FileReadRequest` / `FileWriteRequest`）。每次调用都会 422。已修复两者为发送 `{ target_file: path, content }`。
- **`src/stores/modules/aiChat.ts`**：在 SSE `onDone` 时，store 现在在调用 `autoForwardToRobots(streamed)` 之前检查 `!lastPet?.aborted && !lastPet?.error`。此前，如果用户中途中止，部分内容仍会自动转发到 WeCom 机器人。（早期会话中提到的 `aicr/chat.ts` 已 STALE——不存在 aicr store；此守卫位于 aiChat store 中。）

### 2026-07-28 — Vite → Rsbuild 迁移

- 从 Vite 8 迁移到 **Rsbuild 1**。环境变量前缀现在为 `RSBUILD_ENV_*`（不再有 `VITE_` 泄漏）。`svg-sprite` + `views-glob` 自定义插件复制了被丢弃的 Vite 功能。

### 2026-07-27 — aiChat 移植（来自 YiWeb）

- 移植了 YiWeb 的 `sessionChat` 页面。每条消息的操作（重新生成/重试/重新发送/删除/编辑）、`streamingType`、`aborted` 标志、`scrollTick` 节流。修复了 `index.vue` 的 `useResizable` 脚手架 bug。

### 2026-07-27 — aicr 移植（来自 YiWeb）— STALE

- **声称**：端到端移植了 YiWeb 的 `aicr` 页面：9 个 Pinia stores（`aicr/chat`、`sessions`、`faqs`、`fileTree`、`filters`、`modals`、`models`、`ui`、`weChat`）+ 8 个模态组件 + 卡片/图表视图 + 完整的 `CodeViewer`/`ChatPanel` 对等。
- **实际情况（2026-08-04 审计）**：`src/views/aicr/` 和 `src/stores/modules/aicr/` 在 master 上不存在。0 个 aicr 特定提交。该声明从未落地。aiChat 移植（上一行）是真实的且已发布；aicr 风格的功能已被整合到 aiChat 组件中，而非独立的 aicr 页面树。

### 2026-08-08 — aiChat agent 模式（pi Agent 循环）

- **Agent 工具确认 UI**：`MessageList.vue` 为写操作（`db_create`/`db_update`/`db_delete`）渲染确认横幅，含 Approve/Reject 按钮。120 秒后自动拒绝。`aiChat.ts` 的 `pendingConfirmation` 携带 `confirmationId`；`approvePendingConfirmation()`/`rejectPendingConfirmation()` 调用 `POST /agent/confirm`。
- **Agent 工具时间线**：`tool_execution_start`/`tool_execution_end` 处理器在 `AgentTimeline` 中渲染实时工具调用——运行中显示 Loading spinner，完成时显示最终内容/错误。`AgentEventsPanel.vue` 扩展以处理 `model_switch` 事件。
- **自动引导纯文本消息到运行中的 agent**：`sendMessage` 不再丢弃运行中的消息——纯文本现在调用 `POST /agent/steer`，反映为用户气泡，并 toast 确认。斜杠命令和图片保持原有行为。
- **聊天确认答案（自然语言权限）**：`src/utils/confirmationAnswer.ts` 中的 `confirmationAnswerFor(text)` 将聊天消息分类为 approve/reject——输入 `approve`/`yes` 批准，`reject`/`no` 拒绝。带额外文字拒绝时同时拒绝并引导修正。已单元测试 51/51。
- **按会话恢复继续（持久化循环）**：`max_turns_reached` 后，下一次发送带有真正续接意图（`continue`/`resume`/...）的消息时，仅发送用户消息并带 `resume: true`。后端恢复已持久化的工具轨迹。max_turns 后的新任务作为全新运行。
- **续接检测**：`src/utils/continuation.ts` 的 `isContinuationMessage(text)` 与 `YiAi` 的 `_is_continuation` 完全一致——前端/后端对 max_turns 后消息的分类完全相同。已单元测试 21/21。
- **未完成任务展示**：`agent_end` 带 `stop_reason=max_turns_reached` 时追加 `> 任务可能未完成。回复"continue"继续。`，让用户知道需要继续。
- **实时 agent 轮次进度指示器**：`agentTurnProgress` 计算属性（`{current, max, active, nearLimit}`）在每轮时间线上方渲染 `el-progress` 进度条。距 max_turns 2 轮以内时显示警告色。
- **模型切换展示**：`model_switch` 事件追加 `> 模型自动切换：from → to` 到流式消息——升级恢复可见。
- **时间线中跳过的工具调用**：`tool_execution_end` 处理器在匹配的结束工具时立即清除 `pendingConfirmation`——确认在后端展示工具结束时（已执行或已跳过）立即解决。
- **排队的 /followup 消息**：`/followup` 消息在用户侧渲染为 `followup` 类型气泡，带"Follow-up queued"标签。从请求历史中排除，确保已消费的 followup 不会被重新发送。
- **KnowledgeChatPanel agent 模式**：知识文件预览弹窗的聊天模块端到端支持 agent 模式——agent 切换开关、max-turns、system-prompt、模型轮换、工具生命周期事件、确认横幅和 `model_switch` 展示。按文件持久化。