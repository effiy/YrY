# CLAUDE.md — YiVad

> Vue 3.5 管理后台 — Yi 家族的管理 UI 成员。以 ProTable 为核心驱动，支持四种布局模式，基于后端菜单 API 的动态路由，通过 `v-auth` 实现按钮级权限控制。与 **YiAi**（FastAPI 后端）和 **YiPet**（Chrome MV3 扩展）协同工作。

---

## 目录

- [基本信念](#基本信念)
- [铁律](#铁律)
- [架构方向](#架构方向)
- [项目概况](#项目概况)
- [项目结构](#项目结构)
- [模块边界](#模块边界)
- [数据流](#数据流)
- [项目约束](#项目约束)
- [降级对策](#降级对策)
- [自我约束](#自我约束)
- [最近变更](#最近变更)
- [参考指引](#参考指引)

---

## 基本信念

- **信任模型。** Claude 有足够的能力深入理解这个代码库。给它需要的上下文，信任它做出正确的判断。
- **珍惜注意力。** 你写的每一行代码被阅读的次数远多于被编写的次数。为读者而写，而非为作者而写。
- **验证现实。** 运行代码，读取结果。断言胜过自信。最快出错的方式就是跳过验证。
- **先思考再编码。** 明确陈述假设；如果存在多种解释，将其列出；如果有更简单的做法，直接说出来。

## 铁律

- **简单优先。** 不做超出需求的功能；不为一次性代码引入抽象；不为不可能发生的场景做错误处理。如果写了 200 行而 50 行就能搞定，重写它。
- **精准修改。** 不要"顺手优化"相邻代码；匹配现有风格；每一行改动都要追溯到用户的需求。当你的改动产生了孤儿代码（未使用的导入、死变量），清理它们——但不要主动清理既有的死代码，除非明确要求。
- **目标驱动执行。** 将任务转化为可验证的目标；对于多步骤任务，给出简要计划并附上每步的验证检查。强成功标准让你能独立循环推进；弱成功标准则需要不断澄清。

## 架构方向

> **组件化。**
>
> 作为 Vue 3 前端项目，YiVad 沿组件提取轴前进。提取可复用组件、composables 和共享 UI 原语。定义清晰的 props/events API。消除重复的标记代码。

## 项目概况

| 属性 | 值 |
|----------|-------|
| 名称 | YiVad |
| 类型 | 前端 (SPA) |
| 版本 | 1.0.0 |
| 框架 | Vue 3.5 + TypeScript 6 |
| 构建 | Rsbuild 1 |
| 状态管理 | Pinia 4（搭配 `pinia-plugin-persistedstate`）|
| UI | Element Plus 2.14 |
| 图表 | ECharts 6 |
| 路由 | Vue Router 5（hash 模式，动态路由）|
| HTTP | Axios（自定义 `RequestHttp` 封装）|
| i18n | Vue-i18n 11（中文 + 英文）|
| 架构 | 单页 SPA，动态路由 |
| 测试框架 | Vitest + @vue/test-utils + jsdom |
| 代码检查/格式化 | ESLint 10 + Prettier 3 + Stylelint 17，husky 9 + lint-staged 17 |
| 提交 | commitlint 21 + cz-git |
| 运行环境 | 浏览器（Chrome、Edge、Firefox、Safari — 最近 2 个版本）|

## 项目结构

```
src/
├── api/          — HTTP 请求层（Axios 拦截器、取消请求、错误处理）
├── assets/       — 静态资源（字体、图标、图片、mock JSON）
├── components/   — 可复用组件（ProTable、ECharts、Upload、WangEditor 等）
├── config/       — 全局常量（HOME_URL、DEFAULT_PRIMARY、路由白名单）
├── directives/   — 自定义指令（auth、copy、debounce、throttle、draggable、longpress、watermark）
├── enums/        — HTTP 状态码、请求方法、内容类型
├── hooks/        — Composables（useTable、useTheme、useAuthButtons、useSelection 等）
├── languages/    — i18n 配置（中文 + 英文）
├── layouts/      — 多布局系统（vertical、classic、transverse、columns）
├── routers/      — 动态路由，含权限守卫和菜单到路由的映射
├── stores/       — Pinia stores（global、user、auth、tabs、keepAlive、aiChat、knowledge、knowledgeTree、rag、story、bug）
├── styles/       — 全局 SCSS、Element 样式覆盖、主题变量
├── typings/      — 全局 TypeScript 类型声明
├── utils/        — 通用工具（颜色、菜单树操作、localStorage 等）
└── views/        — 按功能域组织的页面组件
```

## 模块边界

### 前端分层（自上而下）

| 层 | 公共 API |
|---|---|
| `src/views/` | 按功能域组织的页面组件。每个页面从 `@/components`、`@/hooks`、`@/stores`、`@/api/modules` 导入。 |
| `src/layouts/` | 四种布局模式（vertical、classic、transverse、columns）— 共享 Header / Menu / Footer / Tabs 组件。不要按布局分别复刻。 |
| `src/components/` | 可复用组件：`ProTable/`、`ECharts/`、`Upload/`、`WangEditor/`、`SearchForm/` 等。ProTable 是标准表格 — 不要使用原始的 `el-table`。 |
| `src/hooks/` | Composables：`useTable`、`useTheme`、`useAuthButtons`、`useSelection` 等。文件名与 composable 同名（如 `useTable.ts`）。 |
| `src/stores/` | Pinia setup-function 语法的 stores。Store 可以从 `@/api/modules` 和 `@/hooks` 导入，但**严禁**直接导入 `axios`。 |
| `src/api/modules/` | 领域服务函数（`sessions.ts`、`chatService.ts`、`dataService.ts`、`fileService.ts`、`faqService.ts`、`weChatService.ts`、`knowledgeService.ts`、`ragService.ts` 等）。面向 stores 和 views 的公共 API 层面。 |
| `src/api/index.ts` | `RequestHttp` 类 — Axios 封装，含拦截器、取消请求、错误映射。模块调用 `http.post(...)`；其他任何地方不得直接导入 axios。 |
| `src/directives/` | `v-auth`、`v-copy`、`v-watermark`、`v-drag`、`v-debounce`、`v-throttle`、`v-longpress`。通过 `src/directives/index.ts` 注册。 |
| `src/routers/` | Hash 模式 Vue Router 5，基于后端菜单 API 的动态路由。守卫在 `src/routers/beforeEach.ts`。 |

### 跨项目协议（YiVad ↔ YiAi）

每次跨项目调用使用的"RPC 信封"：

```
POST /  body: {
  "module_name": "services.<domain>.<service>",
  "method_name": "<method>",
  "parameters": { <方法特定的结构> }
}
response: { "code": 0, "message": "ok", "data": <any> }
```

| 方法 | 契约 |
|---|---|
| `data_service.query_documents` | `parameters: { cname | collection_name, filter?: dict, pageNum?, pageSize?, limit?, fields?, excludeFields?, orderBy?, orderType? }`。`filter` 字典通过 `_build_filter` 合并到 Mongo 查询中。**请勿使用 `query` — 它会被静默忽略。** |
| `data_service.create_document` | `parameters: { cname, data }` |
| `data_service.update_document` | `parameters: { cname, key, data }` |
| `data_service.delete_document` | `parameters: { cname, key }` |
| Chat (SSE) | `streamChat({model, messages, system?, images?})` 通过 `services.ai.chat_service.chat` |
| `/read-file`、`/write-file` | 字段名为 **`target_file`**（而非 `path`）；`content`；可选 `is_base64` |
| `/upload-image-to-oss` | `{ data_url, filename, directory }` |
| `/delete-file`、`/delete-folder`、`/rename-file`、`/rename-folder` | `target_file` / `target_dir` / `old_path`+`new_path` / `old_dir`+`new_dir` |
| `/knowledge/*` | 知识库扫描 / 读取 / 写入 / 元数据 CRUD（MongoDB `knowledge_files` 中的 markdown 树镜像）|
| `/rag/*` | RAG 查询（单次）+ RAG 对话（SSE）+ 按文件变体；`scope` 按 `file_path` 子串过滤 |

## 数据流

### 表格获取（ProTable）

```
View 定义 columns + requestApi
   ▼ requestApi({ pageNum, pageSize, ...filters })
api/modules/<domain>.ts → callService("services.database.data_service",
                                      "query_documents",
                                      { cname, filter, pageNum, pageSize })
   ▼ http.post("", {module_name, method_name, parameters})
RequestHttp 拦截器：附加 X-Token，转换响应，出错时 checkStatus
   ▼ fetch POST http://localhost:10086/
YiAi data_service.query_documents → repository.query_documents
   ▼ _build_filter(query_params) → MongoDB find().sort().skip().limit()
   ▼ { list: [...], total, pageNum, pageSize, totalPages }
ProTable 接收 { list, total } → 渲染行 + Pagination
```

### 对话（SSE 流式）

```
aiChat store — sendMessage / regenerateMessageAt / resendMessageAt
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
streamChat 逐行解析 SSE → onChunk(text) / onDone() / onError(err)
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

## 项目约束

### 不可妥协的基线

- TypeScript 严格模式（`tsconfig.json`）— `vue-tsc --noEmit` 必须通过。
- ESLint 10 + Prettier 3 + Stylelint 17 预提交钩子（通过 husky 9 + lint-staged 17）。
- Conventional Commits 由 commitlint 21 + cz-git 强制执行。
- 所有 API 调用必须通过 `src/api/index.ts` 的 `RequestHttp` 类 — 不得直接调用原始 `axios`。
- 按钮权限通过 `v-auth` 指令检查 — 不得内联 `v-if` 基于权限控制。
- 动态路由从后端菜单 API 加载（回退到 `authMenuList.json`）。
- 页面组件使用 `<script setup lang="ts">` — 不得使用 Options API。

### 编码规范

| 领域 | 规范 |
|---|---|
| 组件风格 | `<script setup lang="ts">` + Composition API |
| Props / Emits | `defineProps<{...}>()` 和 `defineEmits<{...}>()` 使用类型泛型 |
| 状态 | Pinia 使用 setup-function 语法（`defineStore(() => {...})`）|
| 样式 | 作用域 SCSS，变量来自 `src/styles/`，除动态值外不使用内联样式 |
| Element Plus | `el-` 前缀，遵循 Element Plus 2.14 API |
| 路径导入 | 跨模块导入使用 `@/` 别名，同级文件使用相对路径 |
| 命名 | 组件 PascalCase，composables camelCase，CSS 类 kebab-case |
| 环境变量 | 前缀 `RSBUILD_ENV_*`（自 Vite 迁移至 Rsbuild 后）|

## 降级对策

| 条件 | 措施 |
|-----------|--------|
| 菜单 API 不可用 | 回退到 `src/assets/json/authMenuList.json` |
| Token 过期 | 401 拦截器重定向到登录页，清除 user/auth stores |
| 构建/类型检查失败 | `vue-tsc --noEmit` 阻断 `pnpm build:*`；提交钩子在 lint 错误时阻断 |
| 测试/类型检查失败 | `vue-tsc --noEmit` 阻断 `pnpm build:*`；CI 中运行 `vitest run`；提交钩子在 lint 错误时阻断 |
| 浏览器不支持 (IE) | 构建仅面向现代浏览器；ES module 输出 |
| SSE 流中止 | Pet 消息标记 `aborted=true`；持久化写入部分内容；跳过自动转发到 WeCom（参见 `aiChat.ts` 修复）|

## 自我约束

- **ProTable 是标准表格模式** — 新的表格页面必须使用它；不要直接使用原始 `el-table`。
- **新的 composables 放在 `src/hooks/`**，新的指令在 `src/directives/modules/` — 通过中心的 `index.ts` 注册。
- **布局模式共享 Header / Menu / Footer / Tabs 组件集** — 不要按布局分别复刻。
- **禁止 Options API** — 仅使用 `<script setup>`；使用 `ref` / `reactive` 定义状态，而非 `data()`。
- **Store 不得导入 axios** — 它们调用 `@/api/modules/*` 函数，这些函数进而调用 `@/api/index.ts` 中的 `http.post(...)`。
- **`filter`（而非 `query`）和 `target_file`（而非 `path`）** — 这两个字段名曾是过去 bug 的根源。调用 YiAi 时始终使用契约名称。
- **SSE `onDone` 在自动转发到外部渠道（WeCom）之前必须检查 `!aborted && !error`** — 参见 `src/stores/modules/aiChat.ts` 2026-07-28 修复。（早期对 `aicr/chat.ts` 的引用已经过时 — 不存在 aicr store。）

## 参考指引

| 文档 | 用途 |
|----------|---------|
| [docs/specs/](./docs/specs/) | 架构规格 + 模式模板（API、组件、stores、ProTable）|
| [docs/workflows/](./docs/workflows/) | 任务工作流（添加页面、API 调用、stores）|
| [README.md](./README.md) | 项目概述、快速入门、领域语言 |
| [.env](./.env) | 环境变量 |
| [rsbuild.config.ts](./rsbuild.config.ts) | 构建配置 |
| [tsconfig.json](./tsconfig.json) | TypeScript 配置 |
| [src/config/index.ts](./src/config/index.ts) | 应用级常量 |
| [src/api/index.ts](./src/api/index.ts) | RequestHttp 类 — Axios 封装 |
| [src/stores/modules/aiChat.ts](./src/stores/modules/aiChat.ts) | aiChat store — SSE 流式、agent 循环、确认 |
| [YiKnowledge/projects/YiVad/onboarding.md](../YiKnowledge/projects/YiVad/onboarding.md) | YiVad 入门指南 |