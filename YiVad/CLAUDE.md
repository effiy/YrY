# CLAUDE.md — YiVad

> Vue 3.5 管理后台。ProTable 驱动的数据视图、后端菜单 API 控制的动态路由、`v-auth` 指令实现的按钮级权限。通过 RPC 信封与 **YiAi**（FastAPI :10086）通信，与 **YiPet**（Chrome MV3 扩展）共享会话。

---

## 技术栈

| 层 | 选型 |
|---|------|
| 框架 | Vue 3.5 + TypeScript 5.x，`<script setup lang="ts">` |
| 构建 | Rsbuild 1（`@rsbuild/core` + `@rsbuild/plugin-vue`） |
| UI | Element Plus 2.14，全局自动导入（`unplugin-vue-components`） |
| 状态 | Pinia 4，setup-function 语法，`pinia-plugin-persistedstate` 持久化 |
| 路由 | Vue Router 5，hash 模式，后端菜单 API → 动态路由注册 |
| HTTP | 自定义 `RequestHttp` 类（Axios 封装），统一拦截器 + 错误映射 |
| 样式 | SCSS（`@rsbuild/plugin-sass`），全局注入 `src/styles/var.scss` |
| 图表 | ECharts 6 |
| i18n | Vue-i18n 11，中/英双语 |
| 测试 | Vitest + `@vue/test-utils` + jsdom |
| 质量 | ESLint 10 + Prettier 3 + Stylelint 17，husky 9 + lint-staged 17 |
| 提交 | commitlint 21 + cz-git（Conventional Commits） |

## 项目结构

```
src/
├── api/
│   ├── index.ts              — RequestHttp 类（Axios 封装、拦截器、取消请求）
│   ├── helper/               — checkStatus（错误码映射）、axiosCancel（请求取消）
│   ├── interface/            — 响应类型定义
│   └── modules/              — 领域服务函数（39 个模块）
│       ├── chatService.ts    — SSE 流式对话
│       ├── dataService.ts    — MongoDB CRUD（RPC 信封）
│       ├── fileService.ts    — 文件读写（/read-file、/write-file）
│       ├── knowledgeService.ts — 知识库 CRUD
│       ├── ragService.ts     — RAG 检索 + 对话
│       └── ...               — agent、bug、issue、project、user 等
├── assets/                   — 字体、图标、SVG、mock JSON
├── components/               — 55 个可复用组件
│   ├── ProTable/             — 标准表格（分页、排序、筛选、导出）
│   ├── ECharts/              — 图表封装
│   ├── AiChatBox/            — AI 对话面板
│   ├── KnowledgePreviewDialog/ — 知识预览弹窗
│   ├── MarkdownPreview/      — Markdown 渲染
│   ├── MermaidViewer/        — Mermaid 图表渲染
│   └── ...
├── config/                   — 全局常量（HOME_URL、路由白名单、默认主题色）
├── directives/               — 10 个自定义指令
│   ├── auth/                 — v-auth（按钮级权限）
│   ├── copy/                 — v-copy（一键复制）
│   ├── watermark/            — v-watermark（水印）
│   └── ...                   — debounce、throttle、draggable、longpress、sticky
├── hooks/                    — 63 composables
│   ├── useTable.ts           — ProTable 数据获取 + 分页逻辑
│   ├── useTheme.ts           — 主题切换
│   ├── useAuthButtons.ts     — 权限按钮列表
│   ├── useSelection.ts       — 多选管理
│   ├── useAiChatBridge.ts    — 跨项目（YiPet→YiVad）桥接
│   ├── useConversationTree.ts — 对话树管理
│   └── ...
├── languages/                — i18n 配置（zh-CN、en-US）
├── layouts/                  — 4 种布局模式
│   ├── vertical/             — 左侧垂直菜单
│   ├── classic/              — 顶部菜单 + 左侧子菜单
│   ├── transverse/           — 顶部横向菜单
│   └── columns/              — 分栏布局
├── routers/                  — 动态路由
│   ├── index.ts              — 路由实例 + 静态路由 + beforeEach 权限守卫
│   └── modules/              — staticRouter.ts、dynamicRouter.ts
├── stores/modules/           — 25 个 Pinia stores
│   ├── global.ts             — 全局状态（主题、语言、布局）
│   ├── user.ts               — 用户信息
│   ├── auth.ts               — 权限菜单
│   ├── tabs.ts               — 标签页管理
│   ├── keepAlive.ts          — 组件缓存
│   ├── aiChat.ts             — AI 对话（SSE 流式、消息管理）
│   ├── knowledge.ts          — 知识库内容
│   ├── knowledgeTree.ts      — 知识库目录树
│   ├── rag.ts                — RAG 检索
│   └── ...                   — bug、story、issue、project、module、page、rss
├── styles/                   — 全局 SCSS、Element Plus 覆盖、主题变量
├── typings/                  — 全局类型声明 + 自动生成（auto-imports.d.ts、components.d.ts）
├── utils/                    — 工具函数（颜色、菜单树、localStorage、日期）
└── views/                    — 28 个功能模块的页面组件
    ├── aiChat/               — AI 对话（核心页面）
    ├── knowledge/            — 知识库管理
    ├── project/              — 项目管理
    ├── bug/                  — Bug 追踪
    ├── issue/                — 问题管理
    ├── dashboard/            — 仪表盘
    ├── rag/                  — RAG 检索
    └── ...
```

## 架构分层

```
┌──────────────────────────────────────────────┐
│  Views（页面组件，按功能域组织）                │
│  导入：components、hooks、stores、api/modules  │
├──────────────────────────────────────────────┤
│  Components（可复用 UI 组件）                  │
│  ProTable / ECharts / AiChatBox / ...        │
├──────────────────────────────────────────────┤
│  Hooks（Composables，业务逻辑）                │
│  useTable / useTheme / useAuthButtons / ...  │
├──────────────┬───────────────────────────────┤
│  Stores      │  API Modules                  │
│  Pinia 状态  │  领域服务函数                   │
│  25 modules  │  39 modules                   │
├──────────────┴───────────────────────────────┤
│  RequestHttp（Axios 封装）                     │
│  拦截器、取消请求、错误映射                     │
├──────────────────────────────────────────────┤
│  YiAi FastAPI :10086（RPC 信封）              │
└──────────────────────────────────────────────┘
```

**硬约束：**
- Store **禁止**直接导入 `axios`——必须通过 `@/api/modules/*` 调用
- 页面 **禁止**使用原始 `el-table`——必须使用 `ProTable`
- 组件 **禁止**使用 Options API——仅 `<script setup lang="ts">`

## 数据流

### 表格获取（ProTable → YiAi → MongoDB）

```
View: columns + requestApi({ pageNum, pageSize, ...filters })
  → api/modules/<domain>.ts
    → callService("services.database.data_service", "query_documents",
                  { cname, filter, pageNum, pageSize })
      → http.post("", { module_name, method_name, parameters })
        → YiAi data_service.query_documents
          → _build_filter → MongoDB find().sort().skip().limit()
            ← { list, total, pageNum, pageSize, totalPages }
              ← ProTable 渲染 rows + Pagination
```

### 对话（SSE 流式）

```
aiChat store → streamChat(payload, onChunk, onDone, onError)
  → fetch POST /  body: { module_name: "services.ai.chat_service",
                          method_name: "chat",
                          parameters: { model, messages, stream: true } }
    → YiAi StreamingResponse(text/event-stream)
      → data: {"data": {"message": "..."}}\n\n   → onChunk(text)
      → data: {"done": true}\n\n                  → onDone()
      → error                                     → onError(err)
        → Store 增量追加到消息中
          → onDone: 检查 !aborted && !error 后自动转发到 WeCom
```

### 文件读写

```
View → fileService.readFile(path)  → POST /read-file  { target_file }
View → fileService.writeFile(p, c) → POST /write-file { target_file, content }
```

## 关键约束

### 构建

- `vue-tsc --noEmit` 必须通过 —— 阻断 `pnpm build:*`
- 环境变量前缀 `RSBUILD_ENV_*`（非 `VITE_*`）
- 自定义 Rsbuild 插件：`svgSpritePlugin`（SVG 雪碧图）、`viewsGlobPlugin`（视图自动发现）
- 自动导入：`unplugin-auto-import`（vue、vue-router、pinia）+ `unplugin-vue-components`（Element Plus）

### 路由

- Hash 模式（`createWebHashHistory`）
- 后端菜单 API 加载权限树 → 动态 `router.addRoute`
- 菜单 API 不可用时回退到 `src/assets/json/authMenuList.json`
- 401 拦截器 → 清除 stores → 重定向登录页

### 编码规范

| 规则 | 说明 |
|------|------|
| 组件 | `<script setup lang="ts">`，`defineProps<{...}>()`、`defineEmits<{...}>()` |
| 状态 | Pinia setup-function 语法：`defineStore(() => { ... })` |
| 样式 | 作用域 SCSS，变量来自 `src/styles/var.scss`（全局注入） |
| 导入 | 跨模块用 `@/` 别名，同级用相对路径 |
| 命名 | 组件 PascalCase，composables camelCase，CSS kebab-case |
| 权限 | `v-auth` 指令 —— 不得用 `v-if` 内联权限判断 |
| API 参数 | `filter`（非 `query`）、`target_file`（非 `path`）—— 这两个字段名曾是 bug 根源 |

### 降级策略

| 场景 | 行为 |
|------|------|
| 菜单 API 不可用 | 回退 `authMenuList.json` 静态菜单 |
| Token 过期 | 401 → 清除 user/auth store → 重定向登录页 |
| SSE 流中止 | 消息标记 `aborted=true`，部分内容持久化，跳过 WeCom 转发 |
| 构建失败 | `vue-tsc` 阻断构建，lint-staged 阻断提交 |
| 浏览器兼容 | 仅现代浏览器（Chrome/Edge/Firefox/Safari 最近 2 版本），ES module 输出 |

### 测试策略

| 类型 | 框架 | 运行方式 |
|------|------|----------|
| 类型检查 | `vue-tsc --noEmit` | `pnpm typecheck`（阻断构建） |
| 单元测试 | Vitest + `@vue/test-utils` + jsdom | `pnpm test` |
| 代码检查 | ESLint 10 + Prettier 3 + Stylelint 17 | `pnpm lint` / `pnpm lint:prettier` / `pnpm lint:stylelint` |
| 提交检查 | husky 9 + lint-staged 17 + commitlint 21 | 提交时自动触发 |

**质量门禁**：
- `vue-tsc --noEmit` 阻断 `pnpm build:*`——类型错误不可进入构建
- lint-staged 阻断提交——代码风格违规不可提交
- commitlint 阻断提交——非 Conventional Commits 格式不可提交

## 开发命令

```bash
pnpm dev              # 开发服务器 :8848
pnpm build:dev        # 开发环境构建
pnpm build:pro        # 生产环境构建
pnpm build:test       # 测试环境构建
pnpm preview          # 预览构建产物
pnpm lint             # ESLint 检查
pnpm lint:prettier    # Prettier 格式化
pnpm lint:stylelint   # Stylelint 检查
pnpm typecheck        # vue-tsc --noEmit
pnpm test             # vitest run
```

## 参考指引

| 资源 | 用途 |
|------|------|
| [rsbuild.config.ts](./rsbuild.config.ts) | 构建配置（插件、代理、别名、产物输出） |
| [tsconfig.json](./tsconfig.json) | TypeScript 严格模式配置 |
| [src/api/index.ts](./src/api/index.ts) | RequestHttp 类 —— 所有 HTTP 请求的入口 |
| [src/api/modules/](./src/api/modules/) | 39 个领域服务模块 |
| [src/stores/modules/](./src/stores/modules/) | 25 个 Pinia stores |
| [src/hooks/](./src/hooks/) | 63 composables |
| [src/components/](./src/components/) | 55 个可复用组件 |
| [src/directives/](./src/directives/) | 10 个自定义指令 |
| [src/routers/](./src/routers/) | 动态路由 + 权限守卫 |
| [src/config/index.ts](./src/config/index.ts) | 应用级常量 |
| [组件模式](../YiKnowledge/projects/yivad/patterns/component-patterns.md) | Vue 3.5 组件开发规范 |
| [状态管理](../YiKnowledge/projects/yivad/patterns/state-management.md) | Pinia store 模式与持久化 |
| [路由系统](../YiKnowledge/projects/yivad/architecture/routing.md) | 动态路由与权限守卫 |
| [API 模块](../YiKnowledge/projects/yivad/architecture/api-modules.md) | 39 个 API 服务模块参考 |
| [添加页面](../YiKnowledge/projects/yivad/workflows/adding-page.md) | 添加新页面工作流 |
| [YiAi/CLAUDE.md](../YiAi/CLAUDE.md) | 后端项目参考 |
| [../CLAUDE.md](../CLAUDE.md) | 根级 CLAUDE.md（RPC 协议、跨项目关系） |