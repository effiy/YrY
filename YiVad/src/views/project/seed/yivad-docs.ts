/**
 * Seed documentation pages for the YiVad project.
 * Each entry maps to a page in the `pages` collection.
 * Content is extracted from CLAUDE.md, package.json, rsbuild.config.ts, and the codebase.
 */
export interface SeedPage {
  title: string;
  content: string;
  order: number;
  tag: string;
}

export const yivadDocs: SeedPage[] = [
  {
    order: 1,
    tag: "getting-started",
    title: "快速开始",
    content: `# 快速开始

## 环境要求

- **Node.js** >= 16.18.0
- **pnpm** (推荐包管理器)
- **YiAi 后端** 必须运行在 \`http://localhost:10086\`

## 安装与启动

\`\`\`bash
# 1. 安装依赖
cd YiVad
pnpm install

# 2. 启动开发服务器
pnpm dev

# 3. 访问
# 浏览器打开 http://localhost:8848
\`\`\`

## 环境变量

YiVad 使用 \`RSBUILD_ENV_*\` 前缀的环境变量（Rsbuild 约定）：

| 变量 | 说明 | 默认值 |
|------|------|--------|
| \`RSBUILD_ENV_API_URL\` | 后端 API 地址 | \`http://localhost:10086\` |
| \`RSBUILD_ENV_PORT\` | 开发服务器端口 | \`8848\` |
| \`RSBUILD_ENV_PUBLIC_PATH\` | 部署路径 | \`/\` |
| \`RSBUILD_ENV_GLOB_APP_TITLE\` | 应用标题 | \`YiVad\` |
| \`RSBUILD_ENV_OPEN\` | 启动时自动打开浏览器 | \`false\` |
| \`RSBUILD_ENV_PROXY\` | 代理配置 (JSON) | \`[]\` |

## 完整栈启动

\`\`\`bash
# 1. 启动 YiAi 后端
cd YiAi && python main.py

# 2. 启动 YiVad 前端 (新终端)
cd YiVad && pnpm dev

# 3. 构建并加载 YiPet 扩展 (新终端)
cd YiPet && npm run build
\`\`\`

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | 3.5 | 前端框架 |
| TypeScript | 6 | 类型系统 |
| Rsbuild | 1 | 构建工具 |
| Pinia | 4 | 状态管理 |
| Element Plus | 2.14 | UI 组件库 |
| ECharts | 6 | 图表 |
| Vue Router | 5 | 路由 (hash 模式) |
| Axios | 1.18 | HTTP 请求 |
| Vue-i18n | 11 | 国际化 (zh + en) |
`
  },
  {
    order: 2,
    tag: "architecture",
    title: "目录结构",
    content: `# 目录结构

\`\`\`
src/
├── api/          — HTTP 请求层 (Axios 拦截器、取消、错误处理)
│   ├── index.ts           — RequestHttp 类
│   ├── helper/            — checkStatus, axiosCancel
│   ├── interface/         — TypeScript 类型定义
│   └── modules/           — 领域服务函数
├── assets/       — 静态资源 (字体、图标、图片、mock JSON)
├── components/   — 可复用组件
│   ├── ProTable/          — 标准表格组件
│   ├── ECharts/           — 图表封装
│   ├── Upload/            — 文件上传
│   ├── WangEditor/        — 富文本编辑器
│   ├── SearchForm/        — 搜索表单
│   ├── SelectFilter/      — 选择过滤器
│   ├── AiChatBox/         — AI 聊天框
│   ├── KnowledgePreviewDialog/ — 知识预览弹窗
│   ├── CommandPalette/    — 命令面板
│   ├── KeyboardShortcuts/ — 键盘快捷键
│   ├── MarkdownPreview/   — Markdown 预览
│   ├── MermaidViewer/     — Mermaid 图表渲染
│   ├── EntityBreadcrumb/  — 实体面包屑导航
│   ├── HeroDateNav/       — 日期导航
│   ├── OkrRecommend/      — OKR 推荐
│   ├── ErrorMessage/      — 错误页面 (403/404/500)
│   ├── Loading/           — 全屏加载
│   ├── Grid/              — 网格布局
│   ├── SwitchDark/        — 暗黑模式切换
│   ├── SvgIcon/           — SVG 图标
│   ├── ScoreBar/          — 评分条
│   ├── RagSources/        — RAG 来源展示
│   ├── TopicListPage/     — 主题列表
│   ├── TopicDetailPage/   — 主题详情
│   ├── TreeFilter/        — 树形过滤器
│   ├── SelectIcon/        — 图标选择器
│   ├── SparkGlowDefs/     — SVG 特效
│   ├── ImportExcel/       — Excel 导入
│   ├── MarkdownToolbar/   — Markdown 工具栏
│   └── NotificationBell.vue — 通知铃铛
├── config/       — 全局常量 (HOME_URL, DEFAULT_PRIMARY, 路由白名单)
├── directives/   — 自定义指令
│   ├── modules/auth.ts        — 权限指令 v-auth
│   ├── modules/copy.ts        — 复制指令 v-copy
│   ├── modules/waterMarker.ts — 水印指令 v-waterMarker
│   ├── modules/draggable.ts   — 拖拽指令 v-draggable
│   ├── modules/debounce.ts    — 防抖指令 v-debounce
│   ├── modules/throttle.ts    — 节流指令 v-throttle
│   └── modules/longpress.ts   — 长按指令 v-longpress
├── enums/        — HTTP 状态码、请求方法、内容类型
├── hooks/        — 组合式函数
│   ├── useTable.ts         — 表格逻辑
│   ├── useTheme.ts         — 主题切换
│   ├── useAuthButtons.ts   — 权限按钮
│   ├── useSelection.ts     — 选择逻辑
│   ├── useMarkdown.ts      — Markdown 渲染
│   ├── useDateFilter.ts    — 日期过滤
│   └── useResizable.ts     — 可调整大小
├── languages/    — i18n 配置 (zh-CN + en)
├── layouts/      — 多布局系统
│   ├── vertical/   — 垂直布局
│   ├── classic/    — 经典布局
│   ├── transverse/ — 横向布局
│   └── columns/    — 分栏布局
├── routers/      — 动态路由 + 权限守卫
│   ├── index.ts            — 路由实例
│   ├── beforeEach.ts       — 路由守卫
│   └── modules/
│       └── staticRouter.ts — 静态路由定义
├── stores/       — Pinia 状态管理
│   └── modules/
│       ├── global.ts       — 全局状态
│       ├── user.ts         — 用户状态
│       ├── auth.ts         — 认证状态
│       ├── tabs.ts         — 标签页
│       ├── keepAlive.ts    — 页面缓存
│       ├── aiChat.ts       — AI 聊天
│       ├── knowledge.ts    — 知识库
│       ├── knowledgeTree.ts — 知识树
│       ├── rag.ts          — RAG 检索
│       ├── story.ts        — 故事板
│       ├── bug.ts          — Bug 管理
│       ├── project.ts      — 项目管理
│       └── page.ts         — 页面/Wiki
├── styles/       — 全局 SCSS + Element Plus 主题覆盖
├── typings/      — 全局 TypeScript 类型声明
├── utils/        — 工具函数
│   ├── color.ts          — 颜色工具
│   ├── storage.ts        — localStorage 封装
│   ├── datetime.ts       — 日期时间格式化
│   ├── continuation.ts   — 连续性判断
│   └── confirmationAnswer.ts — 确认答案解析
└── views/        — 页面组件 (按功能域组织)
    ├── home/         — 首页
    ├── aiChat/       — AI 聊天
    ├── analytics/    — 数据分析
    ├── project/      — 项目管理
    ├── issue/        — 问题跟踪
    ├── cycle/        — 迭代管理
    ├── release/      — 发布管理
    ├── module/       — 模块管理
    ├── bug/          — Bug 管理
    ├── kanban/       — 看板
    ├── gantt/        — 甘特图
    ├── roadmap/      — 路线图
    ├── sprintPlanning/ — 冲刺规划
    ├── page/         — 页面/Wiki
    ├── rag/          — RAG 系统
    ├── search/       — 全局搜索
    ├── knowledge/    — 知识管理
    └── login/        — 登录
\`\`\`
`
  },
  {
    order: 3,
    tag: "architecture",
    title: "路由菜单",
    content: `# 路由菜单

## 路由架构

YiVad 使用 **Vue Router 5** 的 **hash 模式**，路由分为两层：

### 1. 静态路由 (\`staticRouter.ts\`)

静态路由是应用的骨架，包含登录、布局、RAG 系统等核心页面：

| 路径 | 名称 | 说明 |
|------|------|------|
| \`/\` | — | 重定向到首页 |
| \`/welcome\` | welcome | 欢迎页 |
| \`/login\` | login | 登录页 |
| \`/layout\` | layout | 主布局容器 |
| \`/rag\` | rag | RAG 系统主页 |
| \`/rag/retrieval\` | ragRetrieval | 检索探索器 |
| \`/rag/chat\` | ragChat | RAG 聊天 |
| \`/rag/compare\` | ragCompare | RAG 对比 |
| \`/rag/history\` | ragHistory | 查询历史 |
| \`/pipeline\` | pipeline | 知识管道 |
| \`/skills\` | skills | 技能管理 |
| \`/aier\` | aier | AI 工程师 |
| \`/engineer\` | engineer | 工程师角色 |
| \`/srer\` | srer | SRE 角色 |
| \`/curator\` | curator | 策展人角色 |
| \`/executiver\` | executiver | 管理者角色 |
| \`/leader\` | leader | 技术负责人 |
| \`/producter\` | producter | 产品经理 |

### 2. 动态路由

动态路由从后端菜单 API 加载，失败时回退到 \`authMenuList.json\`：

| 路径 | 名称 | 说明 |
|------|------|------|
| \`/home\` | home | 首页 |
| \`/project\` | project | 项目列表 |
| \`/project/:key\` | projectDetail | 项目详情 |
| \`/issue\` | issue | 问题列表 |
| \`/issue/:key\` | issueDetail | 问题详情 |
| \`/cycle\` | cycle | 迭代列表 |
| \`/cycle/:key\` | cycleDetail | 迭代详情 |
| \`/release\` | release | 发布列表 |
| \`/release/:key\` | releaseDetail | 发布详情 |
| \`/module\` | module | 模块列表 |
| \`/module/:key\` | moduleDetail | 模块详情 |
| \`/bug\` | bug | Bug 列表 |
| \`/bug/:key\` | bugDetail | Bug 详情 |
| \`/kanban\` | kanban | 看板视图 |
| \`/gantt\` | gantt | 甘特图 |
| \`/roadmap\` | roadmap | 路线图 |
| \`/sprintPlanning\` | sprintPlanning | 冲刺规划 |
| \`/analytics\` | analytics | 数据分析 |
| \`/page\` | page | 页面/Wiki |
| \`/search\` | search | 全局搜索 |
| \`/aiChat\` | aiChat | AI 聊天 |

## 路由守卫

路由守卫 (\`beforeEach.ts\`) 处理：
- **权限验证** — 检查 token 有效性
- **动态路由加载** — 从后端菜单 API 获取
- **登录重定向** — 未认证用户跳转登录页
- **404/403 错误处理**

## 降级策略

| 条件 | 行为 |
|------|------|
| 菜单 API 不可用 | 回退到 \`authMenuList.json\` |
| Token 过期 | 401 拦截器重定向到登录页 |
| 路由未匹配 | 显示 404 错误页面 |
`
  },
  {
    order: 4,
    tag: "architecture",
    title: "权限管理",
    content: `# 权限管理

## 权限体系

YiVad 的权限管理分为三个层级：

### 1. 路由级权限

- 动态路由从后端菜单 API 加载，根据用户角色返回不同的菜单树
- 路由守卫在每次导航时验证权限
- 未授权路由不会注册到 Vue Router

### 2. 按钮级权限 (\`v-auth\` 指令)

\`\`\`vue
<template>
  <!-- 只有拥有 delete 权限的用户才能看到此按钮 -->
  <el-button v-auth="'delete'">删除</el-button>

  <!-- 多个权限满足其一即可 -->
  <el-button v-auth="['admin', 'super']">管理</el-button>
</template>
\`\`\`

### 3. 自定义指令系统

| 指令 | 用途 | 文件 |
|------|------|------|
| \`v-auth\` | 按钮权限控制 | \`directives/modules/auth.ts\` |
| \`v-copy\` | 一键复制文本 | \`directives/modules/copy.ts\` |
| \`v-waterMarker\` | 页面水印 | \`directives/modules/waterMarker.ts\` |
| \`v-draggable\` | 元素拖拽 | \`directives/modules/draggable.ts\` |
| \`v-debounce\` | 输入防抖 | \`directives/modules/debounce.ts\` |
| \`v-throttle\` | 事件节流 | \`directives/modules/throttle.ts\` |
| \`v-longpress\` | 长按事件 | \`directives/modules/longpress.ts\` |

## 权限使用规范

- 所有按钮权限必须通过 \`v-auth\` 指令检查
- **禁止**使用内联 \`v-if\` 基于权限判断
- 权限值从后端菜单 API 的 \`buttons\` 字段获取
- 指令注册在 \`directives/index.ts\` 的 \`install\` 方法中
`
  },
  {
    order: 5,
    tag: "architecture",
    title: "网络请求",
    content: `# 网络请求

## 请求架构

YiVad 使用 **Axios** 封装了统一的 \`RequestHttp\` 类，位于 \`src/api/index.ts\`。

### RequestHttp 类

- **请求拦截器**：自动附加 JWT Token、处理重复请求取消、显示全屏 Loading
- **响应拦截器**：统一错误处理、Token 过期重定向、HTTP 状态码映射
- **取消机制**：\`AxiosCanceler\` 类管理重复请求的取消

### RPC 协议

所有发往 YiAi 后端的请求使用统一的 RPC 信封：

\`\`\`json
POST /  body: {
  "module_name": "services.<domain>.<service>",
  "method_name": "<method>",
  "parameters": { ... }
}
\`\`\`

响应格式：
\`\`\`json
{ "code": 0, "message": "ok", "data": <any> }
\`\`\`

### API 模块分层

\`\`\`
src/api/
├── index.ts              — RequestHttp 类 (Axios 封装)
├── helper/
│   ├── checkStatus.ts    — HTTP 状态码 → 错误信息
│   └── axiosCancel.ts    — 请求取消管理器
├── interface/
│   └── yiweb.ts          — 跨项目接口类型定义
└── modules/              — 领域服务函数
    ├── dataService.ts     — 通用数据 CRUD (RPC)
    ├── chatService.ts     — AI 聊天 (SSE 流式)
    ├── fileService.ts     — 文件读写 (REST)
    ├── agentService.ts    — Agent 聊天
    ├── knowledgeService.ts — 知识库 (REST)
    ├── ragService.ts      — RAG 检索
    ├── issueService.ts    — 问题管理
    ├── cycleService.ts    — 迭代管理
    ├── releaseService.ts  — 发布管理
    ├── moduleService.ts   — 模块管理
    ├── bug.ts             — Bug 管理
    ├── pageService.ts     — 页面/Wiki
    ├── projectService.ts  — 项目管理
    ├── demoService.ts     — 演示模板
    ├── weChatService.ts   — 微信消息
    ├── sessions.ts        — 会话管理
    └── faqService.ts      — FAQ 管理
\`\`\`

### 关键参数名约定

| 正确 | 错误 | 上下文 |
|------|------|--------|
| \`filter\` | \`query\` | \`data_service.query_documents\` |
| \`target_file\` | \`path\` | \`/read-file\`, \`/write-file\` |
| \`cname\` | \`collection_name\` | \`data_service\` 集合参数 |

> 这些参数名不匹配曾导致真实 Bug — 后端会忽略 \`query\` 参数，对 \`path\` 返回 422。

### SSE 流式传输

AI 聊天使用 Server-Sent Events：

\`\`\`
fetch POST /  body: { module_name: "services.ai.chat_service", ... }
  → YiAi FastAPI → StreamingResponse(text/event-stream)
  → 逐行解析 SSE → onChunk(text) / onDone() / onError(err)
\`\`\`
`
  },
  {
    order: 6,
    tag: "deployment",
    title: "构建部署",
    content: `# 构建部署

## 构建命令

| 命令 | 说明 |
|------|------|
| \`pnpm dev\` | 启动开发服务器 (端口 8848) |
| \`pnpm build:dev\` | 开发环境构建 |
| \`pnpm build:test\` | 测试环境构建 |
| \`pnpm build:pro\` | 生产环境构建 |
| \`pnpm preview\` | 构建并预览 |
| \`pnpm type:check\` | TypeScript 类型检查 |

## Rsbuild 配置

\`rsbuild.config.ts\` 关键配置：

### 插件
- \`@rsbuild/plugin-vue\` — Vue 3 SFC 编译
- \`@rsbuild/plugin-vue-jsx\` — JSX/TSX 支持
- \`@rsbuild/plugin-sass\` — SCSS 预处理 (全局注入 \`var.scss\`)
- \`@rsbuild/plugin-babel\` — Babel 转译
- \`unplugin-auto-import\` — 自动导入 (Vue, Router, Pinia, Element Plus)
- \`unplugin-vue-components\` — 组件自动注册 (Element Plus)

### 自定义插件
- \`svgSpritePlugin\` — SVG 雪碧图生成
- \`viewsGlobPlugin\` — 视图文件 glob 导入

### 输出配置
- 输出目录: \`dist/\`
- JS 分块: \`assets/js/[name]-[hash].js\`
- CSS 分块: \`assets/css/[name]-[hash].css\`
- 生产环境启用压缩，关闭 SourceMap

### 代理配置
通过 \`RSBUILD_ENV_PROXY\` 环境变量配置 JSON 代理规则

## 部署流程

\`\`\`bash
# 1. 类型检查
pnpm type:check

# 2. 构建
pnpm build:pro

# 3. 部署 dist/ 目录到静态服务器
# 确保配置正确的 PUBLIC_PATH

# 4. 健康检查
curl http://your-server/your-path/index.html
\`\`\`

## 浏览器支持

| 环境 | 目标 |
|------|------|
| 生产 | > 1%, not dead, not op_mini all |
| 开发 | Chrome/Firefox/Safari 最新版本 |
`
  },
  {
    order: 7,
    tag: "conventions",
    title: "项目规范",
    content: `# 项目规范

## 编码规范

| 领域 | 标准 |
|------|------|
| 组件风格 | \`<script setup lang="ts">\` + Composition API |
| Props/Emits | 使用类型泛型 \`defineProps<{...}>()\` 和 \`defineEmits<{...}>()\` |
| 状态管理 | Pinia 的 setup 函数语法 \`defineStore(() => {...})\` |
| 样式 | Scoped SCSS，使用 \`src/styles/\` 变量，禁止内联样式 (动态值除外) |
| Element Plus | \`el-\` 前缀，遵循 Element Plus 2.14 API |
| 路径导入 | 跨模块使用 \`@/\` 别名，同级使用相对路径 |

## 命名约定

| 约定 | 适用范围 |
|------|----------|
| PascalCase | 组件 (Vue SFC) |
| camelCase | 组合式函数 (hooks) |
| kebab-case | CSS 类名 |
| snake_case | Python 后端 (YiAi) |

## 代码质量

| 工具 | 用途 |
|------|------|
| ESLint 10 | JavaScript/TypeScript 检查 |
| Prettier 3 | 代码格式化 |
| Stylelint 17 | 样式检查 |
| Husky 9 | Git hooks 管理 |
| lint-staged 17 | 暂存文件检查 |
| commitlint 21 | 提交信息规范 |
| cz-git | 交互式提交 |

## 提交规范

使用 Conventional Commits：
\`\`\`
feat: 添加新功能
fix: 修复 Bug
docs: 文档更新
style: 代码格式
refactor: 重构
perf: 性能优化
test: 测试
chore: 构建/工具
\`\`\`

## 架构约束

- **ProTable 是标准表格模式** — 新表格页面必须使用 ProTable，禁止直接使用 \`el-table\`
- **禁止 Options API** — 只使用 \`<script setup>\`
- **Store 不直接导入 axios** — 通过 \`@/api/modules/*\` 函数调用
- **所有 API 调用通过 RequestHttp** — 不直接调用 \`axios\`
- **按钮权限使用 v-auth 指令** — 不禁用内联 \`v-if\` 权限判断
- **布局模式共享组件** — Header/Menu/Footer/Tabs 组件不按布局分叉
`
  },
  {
    order: 8,
    tag: "architecture",
    title: "组件分析",
    content: `# 组件分析

## 核心组件

### ProTable（标准表格）
最核心的表格组件，封装了分页、搜索、排序、选择、导出等功能。所有列表页面都应使用 ProTable。

### ECharts（图表封装）
对 ECharts 6 的 Vue 3 封装，支持响应式图表渲染和主题切换。

### AiChatBox（AI 聊天框）
AI 聊天界面组件，支持 SSE 流式传输、Agent 模式、知识库聊天、工具调用确认等。

### Upload（文件上传）
文件上传组件，支持拖拽上传、批量上传、进度显示。

### WangEditor（富文本编辑器）
基于 Wangeditor v5 的富文本编辑器封装。

### SearchForm（搜索表单）
动态搜索表单组件，支持多种输入类型和条件组合。

### KnowledgePreviewDialog（知识预览）
知识库文件的预览弹窗，支持 Markdown 渲染和 YAML frontmatter 展示。

### EntityBreadcrumb（实体面包屑）
可复用的面包屑导航组件，显示实体层级关系（Project → Cycle → Release → 当前）。

### MermaidViewer（Mermaid 图表）
Mermaid 图表渲染组件，支持流程图、时序图、甘特图等。

### CommandPalette（命令面板）
快速命令搜索面板，支持键盘快捷键唤出。

## 组件总数：30+ 个可复用组件

\`\`\`
AiChatBox, CommandPalette, ECharts, EntityBreadcrumb,
ErrorMessage, Grid, HeroDateNav, ImportExcel,
KeyboardShortcuts, KnowledgeMetaStrip, KnowledgePreviewDialog,
Loading, MarkdownPreview, MarkdownToolbar, MermaidViewer,
NotificationBell, OkrRecommend, ProTable, RagSources,
ScoreBar, SearchForm, SelectFilter, SelectIcon,
SparkGlowDefs, SvgIcon, SwitchDark, TopicDetailPage,
TopicListPage, TreeFilter, Upload, WangEditor
\`\`\`
`
  },
  {order: 9,
    tag: "architecture",
    title: "架构设计",
    content: `# 架构设计

## 整体架构

YiVad 是一个 Vue 3.5 SPA，采用以下架构模式：

### 前端分层

Views (页面组件) → Components (可复用组件) + Hooks (组合式函数) → Stores (Pinia 状态管理) → API Modules (领域服务函数) → RequestHttp (Axios 封装) → YiAi Backend (FastAPI)

### 数据流

#### 表格数据获取 (ProTable)
View 定义 columns + requestApi → api/modules/<domain>.ts → callService → http.post → YiAi data_service → MongoDB → { list, total, pageNum, pageSize, totalPages } → ProTable 渲染

#### AI 聊天 (SSE 流式)
aiChat store → streamChat(payload, onChunk, onDone, onError) → fetch POST → YiAi FastAPI → StreamingResponse(text/event-stream) → 逐行解析 SSE → 追加到消息列表 → onDone: 持久化会话

### 多布局系统
四种布局模式共享同一套 Header/Menu/Footer/Tabs 组件：Vertical, Classic, Transverse, Columns

### 降级策略
- 菜单 API 不可用：回退到 authMenuList.json
- Token 过期：401 拦截器重定向到登录
- 构建/类型检查失败：vue-tsc --noEmit 阻止构建
- SSE 流中断：消息标记 aborted=true，跳过自动转发
`
  },  {
    order: 10,
    tag: "dependencies",
    title: "开发依赖",
    content: `# 开发依赖

## 构建工具

| 包 | 版本 | 用途 |
|----|------|------|
| @rsbuild/core | ^1.0.0 | 构建引擎 |
| @rsbuild/plugin-vue | ^1.0.0 | Vue SFC 编译 |
| @rsbuild/plugin-vue-jsx | ^1.0.0 | JSX/TSX 支持 |
| @rsbuild/plugin-sass | ^1.0.0 | SCSS 预处理 |
| @rsbuild/plugin-babel | ^1.0.0 | Babel 转译 |
| sass | ^1.102.0 | SCSS 编译器 |
| typescript | ^6.0.3 | TypeScript 编译器 |

## 代码质量

| 包 | 版本 | 用途 |
|----|------|------|
| eslint | ^10.8.0 | JavaScript/TypeScript 检查 |
| @eslint/js | ^10.0.1 | ESLint 核心 |
| @typescript-eslint/eslint-plugin | ^8.65.0 | TS ESLint 插件 |
| @typescript-eslint/parser | ^8.65.0 | TS ESLint 解析器 |
| eslint-plugin-vue | ^10.10.0 | Vue ESLint 插件 |
| eslint-plugin-prettier | ^5.5.6 | Prettier 集成 |
| eslint-config-prettier | ^10.1.8 | Prettier 配置 |
| prettier | ^3.9.6 | 代码格式化 |
| stylelint | ^17.14.1 | 样式检查 |
| stylelint-config-standard | ^40.0.0 | 标准样式规则 |
| stylelint-config-standard-scss | ^17.0.0 | SCSS 样式规则 |
| stylelint-config-recommended-vue | ^1.6.1 | Vue 样式规则 |
| stylelint-order | ^7.0.0 | 样式属性排序 |

## Git 工具

| 包 | 版本 | 用途 |
|----|------|------|
| husky | ^9.1.7 | Git hooks |
| lint-staged | ^17.2.0 | 暂存文件检查 |
| @commitlint/cli | ^21.2.1 | 提交信息检查 |
| @commitlint/config-conventional | ^21.2.0 | 约定式提交配置 |
| cz-git | ^1.13.1 | 交互式提交 |
| czg | ^1.13.1 | 轻量级 cz-git |
| standard-version | ^9.5.0 | 版本发布 |

## 自动导入

| 包 | 版本 | 用途 |
|----|------|------|
| unplugin-auto-import | ^21.0.0 | 自动导入 API |
| unplugin-vue-components | ^32.1.0 | 组件自动注册 |

## 类型定义

@types/node, @types/md5, @types/nprogress, @types/qs, @types/sortablejs

## 其他

vue-tsc, vue-eslint-parser, autoprefixer, postcss, postcss-html, globals
`
  },
  {
    order: 11,
    tag: "dependencies",
    title: "构建依赖",
    content: `# 构建依赖 (运行时)

## 核心框架

| 包 | 版本 | 用途 |
|----|------|------|
| vue | ^3.5.40 | 前端框架 |
| vue-router | ^5.2.0 | 路由管理 |
| pinia | ^4.0.2 | 状态管理 |
| pinia-plugin-persistedstate | ^4.7.1 | 状态持久化 |

## UI 组件库

| 包 | 版本 | 用途 |
|----|------|------|
| element-plus | ^2.14.3 | UI 组件库 |
| @element-plus/icons-vue | ^2.3.2 | Element Plus 图标 |

## 图表与可视化

| 包 | 版本 | 用途 |
|----|------|------|
| echarts | ^6.1.0 | 图表库 |
| echarts-liquidfill | ^3.1.0 | 水球图扩展 |
| cytoscape | ^3.34.0 | 图形可视化 |
| cytoscape-dagre | ^2.5.0 | DAG 布局 |
| mermaid | ^11.16.1 | 图表渲染 |

## 编辑器

| 包 | 版本 | 用途 |
|----|------|------|
| @wangeditor/editor | ^5.1.23 | 富文本编辑器 |
| @wangeditor/editor-for-vue | ^5.1.12 | Vue 3 绑定 |

## 工具库

| 包 | 版本 | 用途 |
|----|------|------|
| axios | ^1.18.1 | HTTP 客户端 |
| dayjs | ^1.11.21 | 日期处理 |
| @vueuse/core | ^14.3.0 | Vue 组合式工具 |
| marked | ^18.0.7 | Markdown 解析 |
| md5 | ^2.3.0 | MD5 哈希 |
| qs | ^6.15.3 | 查询字符串 |
| nprogress | ^0.2.0 | 进度条 |
| screenfull | ^6.0.2 | 全屏 API |
| sortablejs | ^1.15.7 | 拖拽排序 |
| vuedraggable | ^4.1.0 | Vue 拖拽组件 |
| driver.js | ^1.8.0 | 用户引导 |
| vue-i18n | ^11.4.8 | 国际化 |
| mitt | ^3.0.1 | 事件总线 |
`
  },
  {order: 12,
    tag: "core-code",
    title: "核心代码",
    content: `# 核心代码

## 入口文件

### src/main.ts
应用入口，按顺序初始化：创建 Vue 应用实例 → 注册 Pinia → 注册 Vue Router → 注册 Element Plus → 注册自定义指令 → 注册全局组件 → 注册 i18n → 挂载应用

## 核心模块

### src/api/index.ts — RequestHttp
封装 Axios 实例，统一处理请求/响应拦截。JWT Token 自动附加。请求取消管理。全屏 Loading 控制。错误状态码映射。

### src/stores/modules/aiChat.ts — AI 聊天状态
管理对话历史和流式响应。Agent 模式支持（工具调用、确认、转向）。SSE 流式传输解析。会话持久化。自动转发到 WeCom。

### src/stores/modules/user.ts — 用户状态
用户信息管理。Token 存储。登录/登出逻辑。

### src/routers/beforeEach.ts — 路由守卫
权限验证。动态路由加载。登录重定向。

### src/hooks/useMarkdown.ts — Markdown 渲染
使用 marked 库解析 Markdown。支持代码高亮、表格、任务列表等。

### src/utils/continuation.ts — 连续性判断
判断用户消息是否为继续指令。与后端 Agent 的连续性语义一致。

### src/utils/confirmationAnswer.ts — 确认答案解析
从聊天消息中解析确认/拒绝意图。支持中文和英文关键词。

## 关键模式

### ProTable 模式
const columns: ColumnProps[] = [
  { prop: 'name', label: '名称', search: { el: 'input' } },
  { prop: 'status', label: '状态', enum: statusOptions }
]
const requestApi = (params) => getList(params)

### Pinia Setup Store 模式
export const useStore = defineStore('name', () => {
  const data = ref<Type[]>([])
  const loading = ref(false)
  async function fetch() { ... }
  return { data, loading, fetch }
})

### API 模块模式
import { queryDocuments, createDocument } from '@/api/modules/dataService'
export function getList(params) {
  return queryDocuments({ cname: 'collection', filter: params })
}
`
  }
];