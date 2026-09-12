---
doc_type: test
title: "YV-07-01: 项目初始化与构建系统 — Vue 3.5 + TypeScript strict + Rsbuild — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202607"
prd_task_id: "YV-07-01"
source_prds: ["01-prd-项目初始化与构建系统"]
source_modules: []
---
# YV-07-01: 项目初始化与构建系统 — Vue 3.5 + TypeScript strict + Rsbuild — 测试规格

> 来源 PRD：[01-prd-项目初始化与构建系统.md](../../prds/2026-07/01-prd-项目初始化与构建系统.md)
> 提取日期：2026-09-11

---

### 4.7 边缘场景处理

| # | 场景 | 描述 | 处理策略 | 实现细节 |
|---|------|------|---------|---------|
| 1 | Rsbuild proxy 导致 HMR WebSocket 代理到后端 | `proxy: { '/': 'http://localhost:10086' }` 将 `/rsbuild-hmr` WebSocket 也代理到 YiAi，HMR 失效 | 仅代理 API 请求：`proxy: { '/api': { target: '...', pathRewrite: { '^/api': '' } } }` | HMR 路径 `/rsbuild-hmr` 和 `/__webpack_hmr` 不经过代理 |
| 2 | pnpm 幽灵依赖在 CI 中构建失败 | 本地 `node_modules` 中存在未声明的依赖，CI 中 `pnpm` 严格隔离不可用 | `package.json` 中显式声明所有直接依赖 | `pnpm why <pkg>` 排查幽灵依赖 |
| 3 | SSE 流式响应被 proxy 超时断开 | Rsbuild dev server proxy 默认超时 30s，SSE 长连接被断开 | `proxy.timeout: 300000`（5min），匹配 LLM 响应 | `proxy: { timeout: 300000 }` |
| 4 | `unplugin-vue-components` dts 路径错误 | Rsbuild 4.x 中 `dts: 'src/types/components.d.ts'` 实际生成在 `src/.rsbuild/components.d.ts` | 改为 `dts: 'components.d.ts'`，tsconfig 中显式 include | 路径解析逻辑差异 |
| 5 | `pnpm-lock.yaml` lockfileVersion 不兼容 | 本地 pnpm 9.x 生成 `lockfileVersion: '9.0'`，CI pnpm 8.x 无法识别 | `engines.pnpm` 锁定版本 `>=9.0.0`，CI 中显式安装 pnpm@9 | `packageManager: "pnpm@9.x.x"` |
| 6 | `chunkSplit.strategy` 导致 Element Plus 异步加载 | `split-by-experience` 将 `ElMessage` 拆分到异步 chunk，拦截器调用时未注册 | `chunkSplit.override` 中将 `element-plus` 加入 vendor 分组 | 确保 Element Plus 整体在首屏 vendor chunk |
| 7 | 生产构建 sourceMap 泄露源码 | `output.sourceMap: false` 确认生产禁用 | CI 检查 `dist/` 无 `.map` 文件 | 构建后扫描脚本 |
| 8 | TypeScript strict 下 vue-tsc 耗时过长 | 80+ `.vue` 文件后类型检查 > 60s | `skipLibCheck: true` 跳过 node_modules 检查 | CI 耗时降至 ~25s |
| 9 | 环境变量在 HMR 时丢失 | `import.meta.env.RS_BUILD_API_BASE` 在 HMR 边界处为 `undefined` | 添加 fallback：`\|\| 'http://localhost:10086'` | 构造函数中打印 baseURL 便于调试 |
| 10 | CSS Modules 与 Element Plus 样式冲突 | hash 类名优先级高于 Element Plus BEM 类名 | `cssModules.localIdentName: '[local]_[hash:base64:5]'` | 避免与 Element Plus 类名冲突 |


## 测试规格

### Requirement: 项目初始化

#### Scenario: 开发服务器启动成功
- **Given** 依赖已安装（`pnpm install`）
- **When** 运行 `pnpm dev`
- **Then** 服务器在 30s 内启动，控制台输出 `Rsbuild server started`
- **And** 访问 `http://localhost:8848` 渲染首页

#### Scenario: TypeScript 类型检查通过
- **Given** 所有源代码就绪
- **When** 运行 `vue-tsc --noEmit`
- **Then** 退出码 0，无类型错误

#### Scenario: 生产构建成功
- **Given** 同上
- **When** 运行 `pnpm build`
- **Then** 构建产物生成在 `dist/` 目录
- **And** 构建耗时 < 60s

### Requirement: RPC 通信

#### Scenario: RequestHttp RPC 拦截器正确解析响应
- **Given** YiAi 后端运行中
- **When** 调用 `rpcCall("services.data_service", "query_documents", {cname: "menus"})`
- **Then** 返回 `data` 字段内容（非 `{code, message, data}` 信封）
- **And** `code !== 0` 时抛出 `RpcError`

#### Scenario: 401 响应自动清除认证
- **Given** Token 已过期
- **When** 调用任意 RPC 接口
- **Then** 拦截器捕获 `code === 4001`，清除 Pinia stores，重定向到登录页

---


## 边缘场景处理

| # | 场景 | 触发条件 | 处理策略 | 优先级 |
|---|------|---------|---------|--------|
| 1 | Rsbuild HMR 在环境变量为 `undefined` 时请求发到错误 URL | `import.meta.env.RS_BUILD_API_BASE` 在 HMR 边界处为 `undefined` | 添加 fallback：`const baseURL = import.meta.env.RS_BUILD_API_BASE \|\| 'http://localhost:10086'` | P0 |
| 2 | Element Plus 全量导入导致首屏 JS > 1MB | 未配置 `unplugin-vue-components` 按需导入 | 添加 `unplugin-vue-components` + `unplugin-auto-import`，首屏 JS 降至 ~400KB gzip | P0 |
| 3 | `pnpm install --frozen-lockfile` 在 CI 中因 lockfile 版本不兼容失败 | 本地 pnpm 9.x vs CI pnpm 8.x | 在 `package.json` 中通过 `engines.pnpm` 锁定版本，`packageManager` 声明版本 | P1 |
| 4 | Rsbuild proxy 配置直接代理 `/` 导致 HMR WebSocket 连接被代理到 YiAi | `server.proxy: { '/': 'http://localhost:10086' }` 将所有请求代理 | 仅代理 API 请求：`proxy: { '/api': { target: '...', pathRewrite: { '^/api': '' } } }` | P0 |
| 5 | `vue-tsc --noEmit` 在 80+ `.vue` 文件时耗时 > 60s | CI 构建超时 | 添加 `skipLibCheck: true`，CI 耗时降至 ~25s | P1 |
| 6 | `chunkSplit.strategy: 'split-by-experience'` 将 Element Plus 按包拆分 | `ElMessage` 被分到异步 chunk，拦截器调用时未加载 | 将 `element-plus` 加入 `chunkSplit.override` 的 vendor 分组 | P1 |
| 7 | CSS Modules 与 Element Plus 类名冲突 | CSS Modules 生成的 hash 类名优先级高于 Element Plus BEM 类名 | 配置 `cssModules.localIdentName` 为 `[local]_[hash:base64:5]` | P2 |
| 8 | 动态路由 `router.addRoute` 在已注册路由时重复添加 | `router.hasRoute` 在路由注册完成前返回 `false` | 添加 `routesLoaded` 标志位，首次加载完成后设为 `true` | P1 |
| 9 | `clearAuth()` 仅清除 Pinia store 内存状态，localStorage 持久化数据残留 | `pinia-plugin-persistedstate` 的持久化状态未被清除 | 在 `clearAuth()` 中同时调用 `localStorage.removeItem('auth')` | P1 |
| 10 | `unplugin-vue-components` 的 `dts` 路径在 Rsbuild 4.x 中解析错误 | Rspack 内核路径解析逻辑与 Webpack 不同 | 将 `dts` 路径改为相对于项目根目录，并在 `tsconfig.json` 中显式添加 | P2 |
| 11 | SSE 流式响应因 Rsbuild proxy 默认 30s 超时而断开 | AI 聊天流式响应持续 > 30s | 添加 `proxy.timeout: 300000`（5 分钟），匹配 LLM 最长响应时间 | P1 |
| 12 | 生产构建 `sourceMap` 配置不一致导致源码泄露 | 生产环境 `sourceMap` 未设为 `false` | 确认 `rsbuild.config.ts` 中 `output.sourceMap` 在生产环境为 `false` | P1 |

---


## 扩展测试规格

### Requirement: 构建系统

#### Scenario: 开发服务器 HMR 热更新
- **GIVEN** 开发服务器运行中（`pnpm dev`）
- **WHEN** 修改 `.vue` 文件中的模板内容
- **THEN** 浏览器在 100ms 内自动更新，不刷新页面，组件状态保持
- **AND** 控制台输出 `[HMR] updated`

#### Scenario: 生产构建产物分析
- **GIVEN** 源代码就绪
- **WHEN** 运行 `pnpm build`
- **THEN** `dist/` 目录生成，包含 `index.html`、`js/`、`css/`、`assets/`
- **AND** 主 JS bundle < 800KB (gzip)
- **AND** 无 `.map` 文件（source map 已禁用）

#### Scenario: 依赖安全审计
- **GIVEN** 依赖已安装
- **WHEN** 运行 `pnpm audit --audit-level=high`
- **THEN** 无高危漏洞，中危漏洞 < 5 个
- **AND** 退出码为 0

#### Scenario: Biome 代码检查
- **GIVEN** 源代码就绪
- **WHEN** 运行 `npx biome check src/`
- **THEN** 0 个错误，0 个警告
- **AND** 退出码为 0

#### Scenario: 环境变量在构建时正确注入
- **GIVEN** `.env.production` 中 `RS_BUILD_API_BASE=https://api.yivad.internal`
- **WHEN** 运行 `pnpm build`
- **THEN** 构建产物中 `import.meta.env.RS_BUILD_API_BASE` 被替换为 `"https://api.yivad.internal"`
- **AND** 非 `RS_BUILD_*` 前缀的环境变量不暴露到客户端

---

