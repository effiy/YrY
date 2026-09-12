# YiVad

> 基于 Vue 3.5、TypeScript 6、Rsbuild 1、Pinia 4 和 Element Plus 2.14 构建的开源后台管理框架。提供强大的 ProTable 组件用于声明式表格配置，外加动态路由、按钮级权限控制、四种布局模式，以及完整的 hooks / directives / composables 库。

> **入门指南** → `YiKnowledge/projects/YiVad/onboarding.md`（8 个部分：环境搭建 / 工作流 / 已知陷阱 / 首日任务）

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
- [最近变更](#最近变更)

---

## 介绍

YiVad 是一个基于 Vue 3.5、TypeScript 6、Rsbuild 1、Pinia 4 和 Element Plus 2.14 构建的开源后台管理框架。项目提供了强大的 ProTable 组件，极大提升开发效率，同时包含常用组件、hooks、指令、动态路由、按钮级权限控制、四种布局模式、KeepAlive 缓存以及完整的 i18n（中文 + 英文）。

它是 Yi 家族的管理后台成员 — 与 **YiAi**（FastAPI 后端）和 **YiPet**（Chrome MV3 扩展）协同工作。

---

## 特性

- **Vue 3.5 + TypeScript 6**，单文件组件使用 `<script setup>`。
- **Rsbuild 1 构建工具**，支持 Sass、TSX 语法、CORS 代理和 SVG 图标精灵。
- **Pinia 4** 状态管理，搭配 `pinia-plugin-persistedstate` 实现 localStorage 同步。
- **完整的 Axios 封装**使用 TypeScript — 请求拦截、取消请求、通用请求封装、错误映射。
- **ProTable** 组件基于 Element Plus 构建 — 表格页面完全由列配置驱动。
- **Element Plus 2.14** — 尺寸切换、多主题、暗黑模式、i18n。
- **动态路由权限守卫**，使用 Vue Router 5 — 懒加载 + 按钮级权限控制。
- **通过 KeepAlive 实现页面缓存**，支持多级嵌套路由。
- **自定义指令** — `v-auth`、`v-copy`、`v-watermark`、`v-drag`、`v-throttle`、`v-debounce`、`v-longpress`。
- **统一代码格式化**，使用 ESLint 10 + Prettier 3 + Stylelint 17。
- **规范化提交**，使用 husky 9、lint-staged 17、commitlint 21、cz-git + czg。
- **浏览器支持**：Chrome、Edge、Firefox、Safari（最近 2 个版本）。不再支持 IE。

---

## 架构

YiVad 沿**组件化**轴前进：提取可复用组件、composables、共享 UI 原语；定义清晰的 props/events API；消除重复的标记代码。

```
┌──────────────────────────────────────────────────────────┐
│  布局（4 种模式）                                         │
│  vertical · classic · transverse · columns               │
│  通过 globalStore.layout 动态切换                         │
└──────────────────────┬───────────────────────────────────┘
                       │ 将页面挂载到
                       ▼
┌──────────────────────────────────────────────────────────┐
│  路由（动态）                                             │
│  Vue Router 5（hash 模式）· 路由来自后端菜单 API          │
│  回退到 src/assets/json/authMenuList.json                │
│  守卫：beforeEach → 权限检查 → 401 → 登录                │
└──────────────────────┬───────────────────────────────────┘
                       │ 渲染
                       ▼
┌──────────────────────────────────────────────────────────┐
│  ProTable（列配置）                                       │
│  声明式表格：搜索 · 分页 · 排序                           │
│  由 ColumnProps[] 驱动（无需重复的表格标记代码）           │
└──────────────────────┬───────────────────────────────────┘
                       │ 由
                       ▼
┌──────────────────────────────────────────────────────────┐
│  权限（v-auth 指令）                                     │
│  通过权限字符串列表实现按钮级可见性                       │
│  与路由守卫解耦 — 操作级控制                              │
└──────────────────────┬───────────────────────────────────┘
                       │ 通过 RequestHttp 进行 HTTP 请求
                       ▼
┌──────────────────────────────────────────────────────────┐
│  YiAi 后端（FastAPI :10086）                              │
│  RPC 信封：{module_name, method_name, parameters}        │
│  data_service · chat_service · /read-file · /write-file  │
└──────────────────────────────────────────────────────────┘
```

### 横切关注点

- **HTTP 层** — Axios `RequestHttp` 封装，含拦截器、取消请求和 `checkStatus` 错误映射（`src/api/`）。
- **状态层** — Pinia stores（`global`、`user`、`auth`、`tabs`、`keepAlive`，以及按功能划分的 stores：`aiChat`、`aicr/*`），支持持久化（`src/stores/`）。
- **Hooks** — composables（`useTable`、`useTheme`、`useAuthButtons`、`useSelection` 等），位于 `src/hooks/`。
- **指令** — 自定义指令，位于 `src/directives/modules/`，通过 `src/directives/index.ts` 注册。
- **i18n** — Vue-i18n 11，`zh-CN` + `en` 语言文件位于 `src/languages/`。

---

## 模块边界

### 前端分层（自上而下）

| 层 | 公共 API |
|---|---|
| `src/views/` | 按功能域组织的页面组件。每个页面从 `@/components`、`@/hooks`、`@/stores`、`@/api/modules` 导入。 |
| `src/layouts/` | 四种布局模式（vertical、classic、transverse、columns）— 共享 Header / Menu / Footer / Tabs 组件。不要按布局分别复刻。 |
| `src/components/` | 可复用组件：`ProTable/`、`ECharts/`、`Upload/`、`WangEditor/`、`SearchForm/` 等。ProTable 是标准表格 — 不要使用原始的 `el-table`。 |
| `src/hooks/` | Composables：`useTable`、`useTheme`、`useAuthButtons`、`useSelection` 等。文件名与 composable 同名（如 `useTable.ts`）。 |
| `src/stores/` | Pinia setup-function 语法的 stores。Store 可以从 `@/api/modules` 和 `@/hooks` 导入，但**严禁**直接导入 `axios`。 |
| `src/api/modules/` | 领域服务函数（`sessions.ts`、`chatService.ts`、`dataService.ts`、`fileService.ts`、`faqService.ts`、`weChatService.ts` 等）。面向 stores 和 views 的公共 API 层面。 |
| `src/api/index.ts` | `RequestHttp` 类 — Axios 封装，含拦截器、取消请求、错误映射。模块调用 `http.post(...)`；其他任何地方不得直接导入 axios。 |
| `src/directives/` | `v-auth`、`v-copy`、`v-watermark`、`v-drag`、`v-debounce`、`v-throttle`、`v-longpress`。通过 `src/directives/index.ts` 注册。 |
| `src/routers/` | Hash 模式 Vue Router 5，基于后端菜单 API 的动态路由。守卫在 `src/routers/beforeEach.ts`。 |

### 跨项目协议（YiVad ↔ YiAi）

| 操作 | 契约 |
|---|---|
| RPC 信封 | `{ module_name, method_name, parameters }` POST 到 `/` |
| `data_service.query_documents` | `parameters: { cname, filter?: dict, pageNum?, pageSize?, limit?, orderBy?, orderType? }`。**`filter`，而非 `query`。** |
| `data_service.create_document` / `update_document` / `delete_document` | `{ cname, key, data }`（创建/更新）或 `{ cname, key }`（删除）|
| Chat (SSE) | `streamChat({model, messages, system?, images?})` 通过 `services.ai.chat_service.chat` |
| `/read-file`、`/write-file` | 字段名为 `target_file`（而非 `path`）|
| `/upload-image-to-oss` | `{ data_url, filename, directory }` |
| `/knowledge/*` | 知识库扫描 / 读取 / 写入 / 元数据 CRUD |
| `/rag/*` | RAG 查询（单次）+ RAG 对话（SSE）+ 按文件变体；`scope` 按 `file_path` 子串过滤 |

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
RequestHttp 拦截器：附加 X-Token，转换响应，出错时 checkStatus
   │
   ▼ fetch POST http://localhost:10086/
YiAi data_service.query_documents
   ▼ repository.query_documents → _build_filter → MongoDB find().sort().skip().limit()
   ▼ { list: [...], total, pageNum, pageSize, totalPages }
ProTable 接收 { list, total } → 渲染行 + Pagination
```

### 对话（SSE 流式）

```
aiChat store / aicr chat store — sendMessage / regenerateMessageAt / resendMessageAt
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
Store 将增量追加到进行中的 pet 消息；中止时标记 aborted=true
   on done: upsertSession(...) + autoForwardToWeCom(streamed) [中止时跳过]
```

### 文件读写

```
View → fileService.readFile(path)
   ▼ fetch POST /read-file  body: { target_file: path }
   ▼ YiAi read_file → 磁盘（主）+ MongoDB（回退）→ { content }
View → fileService.writeFile(path, content)
   ▼ fetch POST /write-file  body: { target_file: path, content }
   ▼ YiAi write_file → 磁盘 + MongoDB upsert → 成功
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

### 代码检查

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
├─ build                   # Rsbuild 配置选项（svg-sprite、views-glob、代理）
├─ public                  # 静态资源（此文件夹不被打包）
├─ src
│  ├─ api                  # API 接口管理（RequestHttp + 模块）
│  ├─ assets               # 静态资源（字体、图标、图片、mock JSON）
│  ├─ components           # 全局组件（ProTable、ECharts、Upload、WangEditor）
│  ├─ config               # 全局配置（HOME_URL、DEFAULT_PRIMARY、路由白名单）
│  ├─ directives           # 全局指令（auth、copy、debounce、throttle、drag、longpress、watermark）
│  ├─ enums                # 通用枚举（HTTP 状态码、请求方法、内容类型）
│  ├─ hooks                # 通用 hooks（useTable、useTheme、useAuthButtons、useSelection）
│  ├─ languages            # i18n 国际化（中文 + 英文）
│  ├─ layouts              # 布局模块（vertical、classic、transverse、columns）
│  ├─ routers             # 路由管理（动态路由、守卫、菜单到路由映射）
│  ├─ stores              # Pinia stores（global、user、auth、tabs、keepAlive、aiChat、aicr/*）
│  ├─ styles              # 全局样式（SCSS、Element 覆盖、主题变量）
│  ├─ typings             # 全局 TypeScript 声明
│  ├─ utils               # 工具函数（颜色、菜单树操作、localStorage）
│  ├─ views               # 所有项目页面（按功能域组织）
│  │  ├─ about            #   关于家族页面（yivad、yiai、yipet 子页面）
│  │  ├─ aiChat           #   AI 聊天页面（从 YiWeb sessionChat 移植）
│  │  ├─ aicr             #   AI 代码审查页面（从 YiWeb aicr 移植；KnowledgeTree 桥接）
│  │  ├─ bug              #   Bug 列表 + 详情（按 YiKnowledge bug-logging-protocol）
│  │  ├─ knowledge        #   知识库浏览器（CategoryList + Detail + MarkdownView）
│  │  ├─ assembly, auth, dashboard, dataScreen, echarts, form,
│  │  │  home, link, login, menu, proTable, story, system
│  ├─ App.vue             # 根组件
│  ├─ main.ts             # 入口文件
│  └─ rsbuild-env.d.ts    # Rsbuild 客户端类型的 TypeScript 声明
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
- 生产环境仅支持现代浏览器。不再支持 IE。详细信息请参见 [Can I Use ES Module](https://caniuse.com/?search=ESModule)。

| IE | Edge | Firefox | Chrome | Safari |
| :---: | :---: | :---: | :---: | :---: |
| 不支持 | 最近 2 个版本 | 最近 2 个版本 | 最近 2 个版本 | 最近 2 个版本 |

---

## 领域语言

YiVad 是面向后台管理系统的领域模型，围绕三个核心概念构建：**菜单权限**、**动态路由**和**组件配置**。

### 术语

- **ProTable** — 基于 Element Plus `el-table` 构建的声明式表格组件，由 `columns` 配置数组驱动，实现表格渲染、搜索、分页和排序，消除重复的表格模板代码。
- **Dynamic Router** — 一种从后端菜单 API 获取权限菜单树、将其扁平化并在运行时通过 `router.addRoute()` 注册路由的机制。与静态路由不同，动态路由仅根据用户权限可见。
- **AuthButton** — 一种通过 `v-auth` 指令控制页面按钮可见性的权限模型。按钮权限列表从后端 API 获取，与页面路由解耦，支持细粒度的操作级权限控制。
- **Pinia Store Persist** — 一种使用 `pinia-plugin-persistedstate` 将 Pinia store 状态自动同步到 `localStorage` 的机制，确保用户状态（token、主题、标签页）在页面刷新后保留。
- **Layout Mode** — YiVad 支持四种布局模式：`vertical`（侧边栏）、`classic`（经典）、`transverse`（顶部导航）、`columns`（分栏），可通过 `globalStore.layout` 动态切换。
- **RPC 信封** — 每次跨项目调用 YiAi 后端执行端点时使用的 `{module_name, method_name, parameters}` 请求格式。
- **`filter`（而非 `query`）** — `data_service.query_documents` 中的 Mongo 过滤器参数名。后端的 `_build_filter` 读取的是 `filter`，而非 `query`。YiVad 在早期版本中曾发送 `query` 导致返回空结果。
- **`target_file`（而非 `path`）** — `/read-file` 和 `/write-file` 的文件路径字段名。YiVad 的 `fileService.readFile/writeFile` 曾发送 `path` 导致 422 错误。

### 术语关系

- **Dynamic Router** 依赖 **AuthButton** 的权限数据来确定哪些菜单可见。
- **ProTable** 依赖 `useTable` hook 来处理分页和数据获取。
- **Pinia Store Persist** 应用于 `global`、`user` 和 `tabs` stores。
- **Layout Mode** 消费 `globalStore` 中的主题和布局配置。
- 所有数据操作通过 **RPC 信封**到达 YiAi 的执行引擎或专用的 `/read-file`、`/write-file`、`/upload-image-to-oss` 端点。

### 示例对话

> **用户：** 我想在"用户管理"页面添加一个编辑按钮，但只有 admin 角色才能看到。
>
> **系统：** 在按钮上添加 `v-auth="'user:edit'"` 指令。后端通过 `authButtonList` API 返回当前角色的按钮权限列表。如果 `user:edit` 不在列表中，按钮将自动隐藏。

> **用户：** 如何在侧边栏菜单中添加新页面？
>
> **系统：** 在 `src/views/` 下创建页面组件，然后在后端菜单管理 API 中配置菜单项（path、name、component 路径）。前端使用**动态路由**在登录后自动获取并注册路由。如果后端不可用，可以直接在 `src/assets/json/authMenuList.json` 中添加菜单项。

### 区分标记

| 术语 | 容易混淆的概念 |
|------|---------------|
| **ProTable** | 不是 Element Plus 的 `el-table`；ProTable 是一个完整的表格解决方案，包含搜索、分页和列配置 |
| **Dynamic Router** | 不是 Vue Router 的懒加载（`() => import()`）或嵌套路由（children）；动态路由特指基于权限的运行时路由注册 |
| **AuthButton** | 不是路由守卫（`beforeEach`）；路由守卫控制页面级访问，而 AuthButton 控制页面内按钮级可见性 |
| **Persist** | 不是浏览器的 `localStorage` API；指的是 Pinia 插件的自动双向同步机制 |
| **Layout Mode** | 不是 CSS 布局或 Element Plus 的 `el-row/el-col` 网格；是页面级框架结构切换 |
| **`filter`** | 不是 `query`（后端的 `query_documents` 只识别 `filter`）；也不是 Mongo 的 `$filter` 聚合阶段 |
| **`target_file`** | 不是 `path` — 后端的 Pydantic 模型 `FileReadRequest`/`FileWriteRequest` 要求的是 `target_file` |

---