---
title: YiVad 知识库索引
tags: [yivad, admin-dashboard, vue3, rsbuild, pinia, element-plus, protable, dynamic-routes, sse, echart]
category: projects/yivad
created: 2026-09-02
updated: 2026-10-09
source: YiVad
type: index
status: stable
lifecycle: active
review_cycle: monthly
roles: [engineer, product, leader]
benefit: "YiVad Vue 3.5 管理后台完整知识体系索引——ProTable 驱动、动态路由 + v-auth 权限、24 Pinia Stores × 58 Composables、SSE 流式对话、19 功能模块、新人 5 天上手路线图"
benefit_secondary: "覆盖 316+ 知识产物，108 Dev · 104 Task · 104 Test · OKR→PRD→Dev→Test 全链路可追溯"
acceptance_criteria:
  - "架构分层：Views → Components → Hooks → Stores + API Modules → RequestHttp → YiAi"
  - "ProTable + 动态路由 + v-auth 按钮权限三板斧说明清楚"
  - "Axios 拦截器 AbortSignal 联合策略（AxiosCanceler + 外部超时）"
  - "Hook 多级 Watchdog：Hook 12s · UI 22s，强制跳出骨架屏"
  - "新人 5 天上手路线图：Day1~Day5 任务 + Checklist + 常见坑"
related:
  - ../INDEX.md
  - ../README.md
  - ../../MEMORY.md
  - ../../../YiVad/CLAUDE.md
aliases:
  - yivad-readme
  - yivad-overview
  - yi-family-admin-dashboard
  - yivad-protable-dynamic-routes
  - yivad-sse-race-governance
---

# YiVad 项目知识库

> **Yi Family 管理后台中枢** — Vue 3.5 + Rsbuild 构建的单页管理后台。ProTable 驱动的标准化数据视图，后端菜单 API 控制的动态路由 + `v-auth` 按钮级权限，24 Pinia Stores + 58 Composables 组合式架构，与 YiAi 后端通过 RPC 信封协议（SSE 流式对话 + 统一响应）通信，为 YiPet 提供会话桥接、为 YiPot 提供翻译健康度看板。

---

## 0. 新人入职指南 — 5 天上手路线图

| 阶段 | 核心任务 | 交付物 | 参考文档 | Checklist |
|------|---------|--------|---------|-----------|
| **Day 1 · 环境启动** | Node 18+ · pnpm · 启动 YiAi (10086) + YiVad (8848) | 浏览器 `http://localhost:8848` 登录页可见，Mock 菜单加载成功 | [环境搭建](./workflows/操作指南/001-指南-环境搭建.md) | `pnpm dev` 无报错 ✓ · `pnpm type:check` 0 错误 ✓ |
| **Day 2 · 架构三板斧** | ProTable + 动态路由 + v-auth 权限 · 走一遍 `/bug` 列表页完整流程 | 手绘请求链路图：View → useTable → api/modules/ → RequestHttp → YiAi → MongoDB | [项目架构](./workflows/开发规范/002-规范-项目架构.md) · [页面模式](./workflows/开发规范/004-规范-页面模式.md) | 能口述 `callService(module, method, params)` 流程 ✓ |
| **Day 3 · Stores + Composables** | 通读 24 Stores + 58 Hooks 核心（useTable/useTheme/useAiChatTools 等）| 选 1 个 Hook 写 1 个 Vitest 用例 | [useTable 源码](../../../YiVad/src/hooks/useTable.ts) · [测试策略] | 测试文件 `tests/unit/xxx.test.ts` 运行通过 ✓ |
| **Day 4 · 功能开发** | 独立完成 1 个 CRUD 小模块（ProTable 列 + Form + 新增/编辑/删除）| PR 合入，通过 Code Review 13 项 Checklist | [开发任务](./workflows/操作指南/002-指南-开发任务.md) · [组件规范](./workflows/开发规范/006-规范-组件开发.md) | ProTable 分页筛选排序正常 · `v-auth` 生效 · 国际化 $t 无硬编码 ✓ |
| **Day 5 · 竞态与可观测性** | watch 首帧跳过 · DisposerBag.reset 使用 · SSE 取消机制 · Hook Watchdog 12s/22s | 调试复现一次"旧请求覆盖新数据"并修复 | [常见问题排查](./workflows/操作指南/003-指南-常见问题.md) | loading 不永久挂死 · `aborted` 消息标记正常 · fallback UI 可见 ✓ |

---

## 0.1 快速入门 — 三阶上手（30 秒 / 5 分钟 / 30 分钟）

> 与 YiPot / YiAi / YiPet / YiKnowledge 统一三阶结构，避免跨项目新人 5 份 README 各有各的格式。

### 0.1.1 30 秒速览（我只想了解 YiVad 的定位、红线、入口）

| 关注点 | 跳转位置 | 30 秒掌握的关键信息 |
|--------|---------|------------------|
| YiVad 一句话定位 | 上方页面简介 + §1 项目画像类型/框架/端口行 | Vue 3.5 + Rsbuild 单页管理后台（SPA），端口 `8848`，Yi Family 5 项目统一管理中枢：YiPet 会话桥接、YiPot 翻译健康看板、YiAi SSE 流式统一入口 |
| 硬约束红线（违反 = 线上 Bug + QA 打回）| §9 关键约束速查（Hard Constraints）顶部 4 条 | ① 异步状态管理**必须**用 DisposerBag.reset（不能用 dispose，CanceledError 防旧请求覆盖新结果 §4 Bug 根因）<br/>② SSE 取消全链路 AbortSignal.any（联合 12s/22s Watchdog）<br/>③ ProTable row-key 必须唯一 key（不能用数组 index，防止级联删除残余）<br/>④ `watch` flush:post 首帧要跳过（首帧假 loading 挂死 Bug）|
| 接手从哪开始 | §0.2 按角色学习路径 | 找自己的角色（FE/SRE/QA/Product/Leader）→ 对应章节顺序 |

> **结束条件**：能说清楚 YiVad 与 YiAi 的关系，能说出 4 条红线中的至少 3 条。

### 0.1.2 5 分钟快速启动（登录页可见 + Bug 列表页跑一遍完整 CRUD）

> 前提：Node 18+ · pnpm；**YiAi（端口 10086）必须先启动**（YiVad 所有 `/api` 请求都代理到 YiAi）。缺依赖 → §0 Day 1 环境搭建 + YiAi README §0.1.2。

| 步骤 | 命令 / 动作 | 预期结果 | 异常排查跳转 |
|------|------------|---------|------------|
| ① 安装依赖 | `cd /Users/yi/YrY/YiVad && pnpm install` | 无 WARN 红色，rsbuild 插件正常加载 | [环境搭建](./workflows/操作指南/001-指南-环境搭建.md) · §10.2 依赖缺失 FAQ |
| ② 启动前后端 | 终端 A：`cd ../YiAi && uv run python main.py`（等 health ok）<br/>终端 B：`pnpm dev`（YiVad 自己）| A：`10086 health ok`；B：浏览器自动开 `http://localhost:8848`，Mock 菜单加载成功 | [常见问题排查](./workflows/操作指南/003-指南-常见问题.md) · §4 异步竞态治理（骨架屏挂死排查）|
| ③ 体验一条完整链路 | 登录（Mock 账密）→ 左侧菜单 Bug 列表 → 新建一条 → 编辑 → 删除 | ProTable 增删改查刷新正常，无「loading 永久挂死」无「老数据覆盖新数据」 | §4 SSE 异步竞态 4 板斧 + useProjectDetail DisposerBag.reset |
| ④ 质量门禁（5 分钟可跑子集）| `pnpm type:check && pnpm lint && npx vitest run tests/unit/useTable.test.ts tests/unit/DisposerBag.test.ts` | typecheck 0 error · ESLint 0 warning · 2 tests PASS | §10 技术栈速查 · husky 9 + lint-staged 17 提交门禁 |
| ⑤ E2E 冒烟（2 分钟）| `npx playwright test e2e/specs/smoke.spec.ts --project=chromium` | 登录 → Bug CRUD 全链路通过（含截图）| §11 开发命令 · Playwright trace.zip 定位失败点 |

> **结束条件**：8848 登录 + Bug CRUD 一圈 + typecheck + lint + 单测 + Playwright smoke 全绿。

### 0.1.3 30 分钟主线（独立交付一个 CRUD 模块，走三板斧）

| 步骤 | 主题 | 用时 | 跳转锚点 / 参考文档 | 交付物 |
|------|------|------|-------------------|-------|
| ① 三板斧模式对齐 + 1 个 Gold Copy（/bug 列表）精读 | 6 分 | §3 核心架构三板斧（ProTable + 动态路由 + v-auth）· [页面模式](./workflows/开发规范/004-规范-页面模式.md) | 能说出新页面的 3 件套：ProTable 列 def · 路由 meta.roles · v-auth 按钮白名单 |
| ② 按 Day 4 模板生成 5 个文件：views/ · api/modules/ · stores/ · composables/ · tests/unit/ | 10 分 | [开发任务](./workflows/操作指南/002-指南-开发任务.md) · §2 架构分层全景图（19 模块目录组织）| 5 文件骨架齐全，ProTable row-key 使用唯一 key（非数组 index）|
| ③ 对接 YiAi 新 RPC：callService(module,method,params) + 全程 AbortSignal + 4 板斧竞态保护 | 9 分 | §3 RPC 信封协议 · §4 SSE 异步竞态治理 · [组件规范](./workflows/开发规范/006-规范-组件开发.md) | RequestHttp 拦截器无 CanceledError 外泄；首帧 loading 不永久挂死；24 Pinia Stores 对应模块引用正确 |
| ④ 自查：typecheck + lint + Vitest coverage ≥ 75% | 3 分 | §9 Hard Constraints · [代码审查](./workflows/流程规范/003-流程-代码审查.md) CR Checklist 13 项 | CR 自查 13/13 ✅，useTable 核心场景 100% 覆盖 |
| ⑤ PR 关联对应 PRD / Task / Test（Frontmatter related 字段）| 2 分 | INDEX 技能协作链 §4 OKR→PRD→Task 追溯 · [Bug 模板](../yipot/bugs/模板/) | PR 标题 `feat(yivad/pages/xxx): 新增 xxx 管理页`；links 3 知识库文件 |

> **结束条件**：PR 已发出 + CI（RSBuild build + typecheck + lintstaged + vitest + playwright smoke）全绿。

---

## 0.2 按角色学习路径（我是 FE/SRE/QA/Product/Leader 从哪切入）

| 角色 | 首选章节顺序 | 重点锚点 | 典型 2 周交付任务 |
|------|------------|---------|----------------|
| **前端工程师 FE** | §0.1.2 5 分钟启动 → §3 三板斧 → §4 异步竞态 4 板斧 → §8 快速导航矩阵 → §10 技术栈 → §11 开发命令 | ProTable 列定义 · 58 Composables 复用 · 24 Stores Setup 语法 · DisposerBag.reset · AbortSignal.any | 新增 CRUD 管理页 · 优化老页面的 CanceledError（把 dispose 换成 reset）· ECharts 6 可视化新增图表组件 |
| **后端对接工程师（YiAi 侧）** | §3 RPC 信封 callService 调用链 → §2 RequestHttp 5 模块结构 → §7 目录结构 → §5 19 功能模块 → §6 关键源码索引 | callService 参数三要素（module_name / method_name / parameters）· `bridge_service` 一次性签名 · SSE 帧格式 · 后端菜单 API shape | 菜单 API 新增字段 shape 变更对齐 · YiPot 健康看板新增指标 · YiPet 会话桥接 C-006 三端互信新接口 |
| **SRE / 可观测性** | §4 SSE 看门狗 12s/22s 双层 → §9 Hard Constraints → §6 源码内模块索引 → §11 开发命令 | 首帧 flush:post skip · Watchdog 超时告警（sentry 埋点）· RSBuild 体积预算（ProTable/ECharts/Monaco）· Playwright 1420 端口 tauri-driver | 前端 Core Web Vitals LCP/INP/CLS SLO 四件套落地（对齐 YiPot §16 SRE）· 看板异常告警 PagerDuty 排班 |
| **QA / 测试** | §3三板斧边界 → §4 异步竞态（真实 Bug 根因）→ §5 19 模块分类 → §10 Playwright E2E + Vitest | CanceledError 复现脚本 · row-key 级联删残余复现 · useTable 筛选排序分页边界 · ECharts SSR 水合异常场景 | 新增 12 条 E2E · 测试金字塔目标 70(Unit)/20(Integration)/10(E2E) · DORA 变更失败率基线 |
| **Product 产品经理** | §5 19 功能模块总览 → §1 项目画像能力边界 → §0 Day1-Day5 能力矩阵 · OKR→PRD 追溯 | ProTable 标准筛选排序分页能力 · 动态菜单权限 · v-auth 按钮级粒度 · AI ChatBox 对话能力 | 写一份 2026-Q4 「项目级 CR18 统一治理看板」PRD（对齐 RICE + OKR goal-003）|
| **Leader / 架构师** | §2 架构分层全景图 → §3 三板斧 + §4 异步竞态（4 个真实 Bug 已修复模式沉淀）→ §9 Hard Constraints 4 红线 → [跨项目契约 §15](../../yipot/README.md#L560-L713) · [INDEX §4 task-planning](../INDEX.md) | DisposerBag 统一 dispose→reset 迁移审计 · row-key=index 全仓扫描 · RPC 信封唯一契约（禁止裸接口）· 跨项目 6 契约 C-001~C-006 | ADR-014「SSE 异步竞态治理四板斧标准模式」· 2027-Q1 前端 Monorepo 统一评估（YiVad + YiPet + YiPot src/）|

---

## 1. 项目画像

| 维度 | 规格 |
|------|------|
| **项目名称** | YiVad — Yi Family Admin Dashboard |
| **类型** | 管理后台 SPA（单页应用） |
| **版本** | 1.0.0 |
| **前端框架** | Vue 3.5.40 · `<script setup lang="ts">` · Composition API 100% |
| **构建工具** | Rsbuild 1.x（Rspack 内核）· 自定义插件：SVG Sprite · Views Glob 自动发现 |
| **UI 组件** | Element Plus 2.14 · 自动导入（unplugin-vue-components）|
| **状态管理** | Pinia 4.x · Setup Function 语法 · 24 stores · pinia-plugin-persistedstate 持久化 |
| **路由系统** | Vue Router 5 · Hash 模式（`createWebHashHistory`）· **后端菜单 → 动态 addRoute** |
| **权限体系** | `v-auth` 自定义指令（按钮级）· 路由 meta.roles（菜单级）· 登录 JWT |
| **表格引擎** | **ProTable**（自研）· 分页 · 排序 · 筛选 · 列显隐 · 导出 · 行选择 |
| **HTTP 客户端** | Axios 1.18.1 · 自研 RequestHttp 类 · 拦截器 · 取消请求 · 错误映射 |
| **SSE 流式** | eventsource-parser · AbortSignal 全链路透传 |
| **图表可视化** | ECharts 6 · echarts-liquidfill · 水球 · Mermaid 11 · 甘特 · Cytoscape 拓扑 |
| **富文本** | WangEditor 5 · Markdown (marked 18) · 代码高亮 |
| **国际化** | vue-i18n 11 · zh-CN + en-US 双语 · 菜单/组件/消息全覆盖 |
| **快捷键** | ⌘K 命令面板 · 10+ 分类 · 50+ 命令注册中心 |
| **测试框架** | Vitest 4 · @vue/test-utils 2.4 · jsdom · Playwright E2E（e2e/specs/smoke.spec.ts）|
| **质量门禁** | ESLint 10 + Prettier 3 + Stylelint 17 · husky 9 + lint-staged 17 · commitlint 21 |
| **开发端口** | `:8848` · 代理 `/api` → YiAi `:10086` |
| **知识产物** | 108 Dev · 104 Task · 104 Test · 合计 **316+** 文件 |

---

## 2. 架构分层全景图

```
┌────────────────────────────────────────────────────────────────────────────┐
│  Views（页面组件层，19 功能模块，按功能域组织）                               │
│  /ai-chat /bug /dashboard /gantt /home /import /issue /kanban /knowledge    │
│  /login /module /notification /project /rag /reports /roadmap /search       │
│  /showcase /system                                                          │
│  ✅ 导入：components · hooks · stores + api/modules                         │
├────────────────────────────────────────────────────────────────────────────┤
│  Components（55 可复用组件层）                                               │
│  ProTable / ECharts / AiChatBox / KnowledgePreviewDialog / MarkdownPreview  │
│  MermaidViewer / WangEditor / Upload / ProForm / DataFreshnessBar / ...    │
├────────────────────────────────────────────────────────────────────────────┤
│  Hooks（58 个 Composables · 业务逻辑复用层）                                │
│  useTable / useTheme / useAuthButtons / useSelection / useLiveMetrics      │
│  useAiChatTools / useConversationTree / useDetailTabs / useTableExport     │
│  useMarkdown / useMenuI18n / useOkrFormat / useProjectDetail / ...         │
├───────────────────────────────────────────┬────────────────────────────────┤
│  Stores（24 Pinia Modules · 状态层）       │  API Modules（37 领域服务层）  │
│  global · user · auth · tabs · keepAlive  │  chatService · dataService      │
│  aiChat · rag · knowledge(+Tree) · bug    │  fileService · knowledgeService │
│  story · issue · project · module · page  │  ragService · bug · session     │
│  dashboard · notification · search · ...  │  user · system · translation    │
│                                            │  bridge · metrics · ...         │
├───────────────────────────────────────────┴────────────────────────────────┤
│  RequestHttp（Axios 封装层）                                                │
│  ├─ helper/checkStatus    — 错误码 401→清登录 · 403→禁言 · 5xx→重试 3 次    │
│  ├─ helper/axiosCancel    — AxiosCanceler：重复 URL 自动 cancel（⚠️ 联合信号）│
│  ├─ helper/batch · retry  — 批处理 · tenacity 指数退避                     │
│  └─ ✅ **AbortSignal 联合**：`AbortSignal.any([外部超时信号, 内部去重信号])` │
├────────────────────────────────────────────────────────────────────────────┤
│  RPC Proxy（dev:8848 /api → YiAi :10086 /）                                 │
│  callService("services.database.data_service", "query_documents", params)  │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. 核心架构三板斧

### 3.1 ProTable（标准化 CRUD 表格引擎）

> **硬约束：禁止直接使用 `el-table`** —— 所有列表页必须通过 ProTable 组件，以统一分页/筛选/排序/导出/列显隐/行选择行为。

标准调用范式：

```vue
<script setup lang="ts">
import { ProTable } from '@/components'
import { useTable } from '@/hooks/useTable'
import { bugService } from '@/api/modules/bug'

const columns = [/* 列定义，含 type=selection/index/expand/操作列 */]
const { table, loading, search, pagination } = useTable({
  requestApi: bugService.listBugs,      // 必须是 (params) => Promise<{list, total}>
  requestParams: { project: 'yivad' },  // 附加 filter 参数
  autoLoad: true,                        // onMounted 自动请求第一页
})
</script>
<template>
  <ProTable :columns="columns" v-bind="table" v-model:loading="loading" />
</template>
```

**useTable 关键特性**：
- 响应式 `searchForm` + `resetParams()` 重置
- 分页：`pageNum` / `pageSize`，内置 `pageSizes: [10, 20, 50, 100]`
- 行选择：`selectedRowKeys` + `onSelectionChange`
- 导出：CSV / JSON / XLSX / PDF（`@/utils/export/*`）
- **Hook Watchdog 12s**：超时强制跳出 loading，展示错误重试 fallback UI

### 3.2 动态路由（后端菜单 API → `router.addRoute`）

```
  beforeEach(to) → userStore.getAuthMenuList()
         │
         ├─ ✅ 首次进入 · 菜单未加载
         │   ├─ 调用 authStore.getAuthMenuList()
         │   │   ├─ 成功：后端菜单树 JSON → dynamicRouter.handler()
         │   │   │                → 逐个 router.addRoute 注册
         │   │   └─ 失败/401/403：
         │   │       ├─ 401/403 → 清 session → 跳转 /login
         │   │       └─ 其他错误 → **fallback 本地 `authMenuList.json` 缓存**
         │   └─ next({ ...to, replace: true })  重进一次，确保路由已注册
         │
         └─ ✅ 已加载 → meta.roles 校验 → 放行 / 403
```

**菜单硬约束（project_memory）**：
- 菜单管理 ProTable 的 `row-key` 必须为 **`key`**（非 `path`），与后端 RPC `deleteMenu(key)` 主键一致
- 菜单**删除（单条/批量）必须执行递归级联清理所有子节点**，防止数据库孤儿节点
- 提供 `POST /system/menus/bulk-reset` 一键恢复默认菜单（项目详情页"Reset Defaults"按钮）

### 3.3 v-auth 按钮级权限自定义指令

```vue
<template>
  <!-- ✅ 正确：v-auth 指令 -->
  <el-button v-auth="'bug:create'" type="primary">新建 Bug</el-button>
  <el-button v-auth="['bug:update', 'bug:delete']">批量操作</el-button>

  <!-- ❌ 禁止：内联 v-if 判断 -->
  <el-button v-if="userStore.roles.includes('admin')">删除</el-button>
</template>
```

指令实现要点：
- 全局注册 `app.directive('auth', { mounted(el, binding) { ... } })`
- 未命中权限 → `el.parentNode?.removeChild(el)` 或 `el.style.display = 'none'`
- 权限列表来源：`authStore.buttonList`（登录时 JWT + 菜单 API 聚合返回）

---

## 4. SSE 流式 + 异步竞态治理（真实 Bug 根因总结）

### 4.1 Axios AbortSignal 联合策略（硬约束）

> **根因 Bug（2026-09）**：`AxiosCanceler` 拦截器里直接 `config.signal = controller.signal`，业务侧设置的外部超时 `AbortSignal`（30s）被完全覆盖 → 超时永远不触发 → 请求无限挂死 → UI 骨架屏永久。

**正确写法**（`config.signal` **不能直接赋值覆盖**，必须联合）：

```typescript
// Axios 请求拦截器 ✅
config.signal = AbortSignal.any([
  config.signal ?? new AbortController().signal,   // 业务侧超时信号（保留）
  cancelController.signal,                          // AxiosCanceler 内部去重信号
])
```

### 4.2 Hook 多级 Watchdog 机制

| Watchdog | 超时阈值 | 保护对象 | 超时时行为 |
|----------|---------|---------|-----------|
| **Hook 级** | **12s** | useTable / useProjectDetail / useLiveMetrics 等内部请求 | `loading = false` · `error = '请求超时，请重试'` · 展示 fallback 重试按钮 |
| **UI 级** | **22s** | 页面 Skeleton 骨架屏 · 页面整体 Promise.race | 骨架屏自动隐藏 · Header Banner 红色"连接超时" · 可点击"强制刷新" |
| **SSE 级** | 60s 无新数据帧 | AI 聊天流式 | 发送 `done:true` 标记 · 聊天消息标记 `aborted:true` · 持久化存储 |

### 4.3 useProjectDetail 真实修复案例（2026-10-09）

> **根因**：`fetchProject()` 入口错误调用 `DisposerBag.dispose()` → 将容器 `disposed=true` → 后续注册的 `AbortController` 立即触发 `abort()` → 请求全部 `CanceledError` → 项目详情页无限骨架屏。
>
> **修复**：新增 `DisposerBag.reset()` 方法——**仅清空条目，保留容器活动状态**（不设 disposed=true）；`fetchProject` 改为 `reset()` 替代 `dispose()`，嵌套 bag cleanup fn 不再级联 abort。

### 4.4 `watch(key, { flush: 'post' })` 首帧跳过

```typescript
// ✅ 正确：跳过首次 flush，避免与 onMounted 初始化请求对撞 → 互相 cancel
const firstRun = ref(true)
watch(
  () => route.params.projectKey,
  async (key) => {
    if (firstRun.value) { firstRun.value = false; return }  // 跳过首帧
    await fetchProject(key)
  },
  { flush: 'post', immediate: true }
)

onMounted(() => { fetchProject(route.params.projectKey) })  // onMounted 负责首次加载
```

---

## 5. 19 功能模块总览

| 模块路径 | 核心功能 | 关键依赖 |
|---------|---------|---------|
| **ai-chat/** | AI 对话（SSE 流式）· 会话树 · 文件上下文 · MCP 工具调用时间线 · 成本 Mini 图 | ProTable / ECharts / WangEditor |
| **bug/** | Bug 追踪（看板 + 列表 + 详情）· 严重度/优先级 · STRIDE 6 维关联 | ProTable · MarkdownPreview |
| **dashboard/** | 看板总览（知识库 RSS 分析 / 翻译供应商健康 / 实时 KPI SSE） | ECharts 6（饼/柱/折/水球）|
| **gantt/** | 甘特图（项目排期）· 拖拽调时 · 里程碑 · 关键路径 | Cytoscape + 自研 |
| **home/** | 首页仪表盘（今日焦点 · 知识动态 · 活动时间轴 · 数据新鲜度脉冲）| useDataFreshness · DataFreshnessBar |
| **import/** | 数据导入导出（CSV/JSON/XLSX/PDF）· 同步监控 · 进度条 | `utils/export/*` · `utils/import/*` |
| **issue/** | 问题管理（列表 + 详情 + 评论 · 关联 PRD/Bug）| ProTable · 状态机 |
| **kanban/** | 看板视图（拖拽排期 · Bug/Story/Issue 统一） | SortableJS · vuedraggable |
| **knowledge/** | 知识库管理（7 角色 · executive/pipeline/skills/goals/metrics/resume）| Tree 组件 · MarkdownPreview |
| **login/** | 登录页（账号密码 · 企业微信 SSO · 验证码 · 记住我）| bcrypt + JWT |
| **module/** | 模块管理（模块化拆分 · OKR 关联 · 状态追踪）| ProTable · Gantt 关联 |
| **notification/** | 通知中心 + 偏好设置（企业微信/WebPush/邮件 · 分级订阅）| 实时 SSE · WebPush |
| **project/** | 项目管理（列表 + 详情图表：燃尽图 / 累积流 / 缺陷密度）| ECharts · 子页面 17 个 |
| **rag/** | RAG 检索中心（概览 · 聊天 · 对比 · 历史 · 检索配置）| 向量 + BM25 · useLiveMetrics |
| **reports/** | 报表中心（ReportBuilder 可视化配置 · ReportPreview 渲染） | ECharts · 导出 PDF |
| **roadmap/** | 路线图（季度/年度规划 · 里程碑 · 版本发布列车）| Mermaid · 甘特 |
| **search/** | 全局搜索（Fuse.js 模糊 · 快捷键 ⌘K · 跨项目知识 + 会话 + Bug）| fuse.js 7 · mitt Bus |
| **showcase/** | 组件展示场（Components / Directives / Charts 23 示例）| All Components |
| **system/** | 系统管理（菜单 / 账户 / 角色 / 部门 / 字典 / 操作日志 / 定时任务）| 动态路由 + v-auth 全量覆盖 |

---

## 6. 关键模块索引（源码内）

| 分类 | 代表文件 | 说明 |
|------|---------|------|
| **HTTP 核心** | `src/api/index.ts` RequestHttp 类 · `helper/axiosCancel` | Axios 封装 · AbortSignal 联合 · 401/5xx 处理 |
| **RPC 调用模式** | `src/api/helper/postJson.ts` | `callService(module, method, params)` 统一入口 |
| **API 服务模块** | `src/api/modules/`（37 个文件）| chat/data/file/knowledge/rag/bug/session/user/translation/metrics... |
| **ProTable 引擎** | `src/components/ProTable/index.vue` · `src/hooks/useTable.ts` | 自研 CRUD 表格 + 12s Watchdog |
| **24 Pinia Stores** | `src/stores/modules/*.ts` | aiChat / rag / knowledge(+Tree) / bug / story / auth / tabs ... |
| **58 Composables** | `src/hooks/*.ts` | useTable / useTheme / useLiveMetrics / useAiChatTools / useDetailTabs / useProjectDetail ... |
| **10 自定义指令** | `src/directives/` | v-auth · v-copy · v-watermark · v-debounce · v-throttle · v-draggable · v-longpress ... |
| **动态路由** | `src/routers/modules/dynamicRouter.ts` | 后端菜单 → router.addRoute → fallback 本地 JSON |
| **布局系统** | `src/layouts/`（4 模式：vertical/classic/transverse/columns）| 左菜单/上菜单/分栏 |
| **主题系统** | `src/styles/theme/tokens.ts` · `src/hooks/useTheme.ts` | 语义化 CSS 变量（禁止数字命名 · light/dark/primary/secondary）|
| **SSE 工具** | `src/utils/sse.ts` · `src/utils/continuation.ts` | extractDelta 去重 · AbortController 管理 · 续传机制 |
| **资源清理** | `src/utils/disposer.ts` | DisposerBag：`reset()` 复用 · `dispose()` 终态销毁 |
| **i18n 双语** | `src/languages/index.ts` + `scripts/check-i18n-locales.mjs` | 缺失 key 检查脚本（长期保留脚本）|
| **国际化规范** | `_locales/**/*.json`（YiPet 同）· manifest 声明 web_accessible_resources | ✅ 需在 manifest.json 中**显式声明**（硬约束）|
| **导出工具** | `src/utils/export/{csv,json,xlsx,pdf,index}.ts` · FileSaver | 4 种格式导出 ProTable 数据 |
| **E2E 冒烟** | `e2e/specs/smoke.spec.ts` · Playwright 配置 | 登录 → 加载菜单 → 首页 3 大卡片可见 |

---

## 7. 目录结构（知识库内）

```
YiKnowledge/projects/yivad/
├── README.md                  # ⭐ 本文件
├── okrs/                      # OKR 目标（按季度，OKR → PRD 追溯）
│   └── 2026-Q3/ · 2026-Q4/    # goal-001 架构重构 · goal-002 文档分离
├── prds/                      # 产品需求 PRD（按月归档）
│   └── 2026-08/ · 2026-09/    # 组件化/RBAC/暗色主题/composable 分层
├── devs/                      # 开发方案文档（按月归档，PRD → Dev → Test）
│   ├── 2026-07/ · 2026-08/
│   └── 2026-09/               # README.md：OKR→PRD→Module→Test 全链路矩阵
├── tests/                     # 测试规格（按月归档）
│   └── 2026-07~09/            # README.md：PRD → Module → Test 可追溯
├── bugs/                      # 缺陷与 2026-09 分类归档
│   ├── README.md              # 缺陷索引 + 排查流程
│   └── 2026-09/ 模板/国际化/代码质量/数据/路由权限/跨项目/  # STRIDE 威胁模型
└── workflows/                 # 工作流 3 大类
    ├── 开发规范/  9 篇  代码约定·架构·API开发·页面模式·质量构建·组件·Composable·活动时间轴·国际化
    ├── 操作指南/  3 篇  环境搭建·开发任务·常见问题排查
    └── 流程规范/  4 篇  分支变更·需求到上线·变更状态·代码审查
```

---

## 8. 快速导航矩阵

### 8.1 高频排查 10 坑

| 症状 | 根因首猜 | 去哪看 | 修复方法 |
|------|---------|-------|---------|
| 项目详情页无限骨架屏 / CanceledError | `DisposerBag.dispose()` → 设为 disposed=true → 后续 Abort 立即触发 | [常见问题排查](./workflows/操作指南/003-指南-常见问题.md) · disposer.ts reset | 改为 `reset()`，保留容器活动 |
| 骨架屏永不消失 · 请求永不报错 | 业务侧 `AbortSignal` 被 AxiosCanceler 覆盖 → 超时失效 | §4.1 联合策略 · [API开发规范](./workflows/开发规范/003-规范-API开发.md) | `AbortSignal.any([业务, 内部])` |
| 切换页面 tab 旧请求数据覆盖新 | watch flush:'post' 首帧未跳过 · onMounted 撞车 → 互相 cancel | §4.4 firstRun 跳过 · useProjectDetail | firstRun ref 守卫 |
| 菜单删除后列表仍然显示子菜单 | 未执行递归级联删除 · DB 孤儿节点 | §3.2 菜单约束 · deleteMenu(key) 递归 impl | 遍历 children，逐个 `deleteMenu(sub.key)` |
| 新建按钮 admin 看不到 · 权限不生效 | 使用了 `v-if roles.includes` 而非 `v-auth` | §3.3 · [代码约定 #硬约束](./workflows/开发规范/001-规范-代码约定.md) | 改为 `v-auth="'xxx:create'"` |
| 翻译/菜单 · filter 返回全量结果 | 参数名写了 `query` 而非 `filter`（后端静默忽略）| [API开发 #参数命名契约](./workflows/开发规范/003-规范-API开发.md) | `parameters.filter` |
| 读文件 422 Unprocessable | 参数名 `path` 而非 `target_file` | 同上 | 改为 `target_file` |
| 表格不展示 · `el-table` 渲染不出来 | 违反硬约束：禁止直接 `el-table`，必须 ProTable | §3.1 ProTable · [组件开发](./workflows/开发规范/006-规范-组件开发.md) | 重构为 ProTable + useTable |
| AI 聊天中断后"永远加载中" | 缺少 SSE onError · AbortError 正则漏匹配 `The user aborted a request` | utils/sse.ts AbortError 全正则匹配 | 补全 CanceledError / ERR_CANCELED 正则 |
| 加载配置主题后页面白屏闪烁 | 主题变量命名 600/700 数字 · 被 Lint 拦截（project_memory 禁止数字）| §5 主题系统 tokens.ts · useTheme | 改为语义化 light/dark/primary/secondary/surface |

### 8.2 Code Review 13 项必查

| # | 检查项 | 违规后果 | 参考 |
|---|--------|---------|------|
| 1 | 列表页 **ProTable**（禁止原生 el-table）| 分页筛选导出交互全不统一 | §3.1 · [组件开发](./workflows/开发规范/006-规范-组件开发.md) |
| 2 | 按钮权限 **`v-auth`**（禁止 v-if 内联 roles 判断）| 权限绕过 · 维护困难 | §3.3 · [代码约定](./workflows/开发规范/001-规范-代码约定.md) |
| 3 | 国际化 **`$t()`**（禁止硬编码中文/英文）| 双语用户体验不一致 | [国际化规范](./workflows/开发规范/008-规范-国际化规范.md) |
| 4 | **RequestHttp + api/modules/**（禁止直接 axios/fetch）| 拦截器取消重试错误映射全失效 | §2 架构 · [API开发](./workflows/开发规范/003-规范-API开发.md) |
| 5 | 参数命名 **`filter`** 非 `query` · **`target_file`** 非 `path` | 返回全量 / 422 | [API开发 #参数命名契约](./workflows/开发规范/003-规范-API开发.md) |
| 6 | 组件全部 `<script setup lang="ts">`（禁止 Options API）| TS 类型不完整 · 维护成本高 | [代码约定](./workflows/开发规范/001-规范-代码约定.md) |
| 7 | **Stores 不直接 import axios**（必须过 api/modules）| 拦截器全旁路 · cancel/token 失效 | §2 架构分层 |
| 8 | API 请求透传 **`{timeout, signal}`** 到最底层（YiVad 硬约束）| Abort 永远不触发 · hook watchdog 兜底 | §4 · project_memory |
| 9 | AxiosCanceler **AbortSignal.any() 联合**（不覆盖 config.signal）| 超时全失效 | §4.1 |
| 10 | Hook + onMounted 首帧请求**防撞**（watch flush:post 首帧跳过）| 互相 cancel 数据竞态 | §4.4 |
| 11 | 异步 guard 分支全部 **`loading=false, headerReady=true` 显式重置** | 骨架屏永久挂死 | project_memory Hard Constraints |
| 12 | DisposerBag **`reset()` 复用**（不 dispose）· cleanup 嵌套级联 | AbortController 请求前 abort · CanceledError | §4.3 · disposer.ts |
| 13 | SSE 错误：AbortError 正则全覆盖（用户中止 / ERR_CANCELED / CanceledError）| 流式中断后 UI 永久 loading | utils/sse.ts · [常见问题排查](./workflows/操作指南/003-指南-常见问题.md) |

---

## 9. 关键约束速查（Hard Constraints）

### ✅ 必须遵守

1. **ProTable 强制**：列表页使用 `ProTable + useTable()`，禁止 `el-table`
2. **v-auth 强制**：按钮权限用指令，禁止 `v-if="roles.includes(...)"`
3. **`i18n 强制`**：所有用户可见文本 `$t()` / `t()`，禁止硬编码中文/英文
4. **Axios 封装**：通过 `RequestHttp → api/modules`，禁止直接 `axios` / `fetch`
5. **参数契约**（与 YiAi 对齐）：`filter` 非 `query` · `target_file` 非 `path` · `cname` 集合名
6. **AbortSignal 全链路**：YiVad 所有 API 服务（knowledgeService/dataService 等）**必须支持并透传** `{timeout, signal}` 对象参数
7. **Axios 联合信号**：`config.signal = AbortSignal.any([外部, 内部])`，禁止直接赋值覆盖
8. **Hook Watchdog**：useXxx Hook 内异步请求必须 ≥ 12s 超时；页面 22s fallback UI
9. **菜单 row-key=key**：与后端 `deleteMenu(key)` 主键对齐；删除必递归级联子节点
10. **CSS 变量语义化**：禁止数字命名（如 `--color-600`）→ `--color-primary/secondary/surface/sunken`
11. **DisposerBag 复用**：清理后复用场景用 `reset()`（保留 active），不用 `dispose()`（设 disposed=true）
12. **watch + onMounted 防撞**：watch flush:post 首次跳过；onMounted 负责首次
13. **权限失败回退**：菜单 API 不可用 → fallback 本地 JSON；仅明确 401/403 才清 session 跳登录
14. **错误正则全匹配**：AbortError 三正则 — "The user aborted..." · `ERR_CANCELED` · `CanceledError`

### ❌ 严格禁止

1. 组件中直接 import axios 或 `fetch('/api/...')`（跳 RequestHttp 拦截器）
2. 列表页直接 `<el-table :data="list">` 手写分页（绕 ProTable 规范）
3. 按钮用 `v-if` 判断角色（绕 v-auth 统一权限中心）
4. 文本硬编码（`'新建'` / `'Create'` 直接写 template）
5. API 参数名 `query` / `path`（被后端静默忽略 → 生产级 Bug）
6. AxiosCanceler `config.signal = ctrl.signal` 直接覆盖（超时全失效）
7. Hook 请求未设置 12s Watchdog，仅依赖 Promise pending（骨架屏永久挂死）
8. 页面切换 / onMounted + watch immediate 不防撞（两次请求互相 cancel 数据错乱）
9. DisposerBag.dispose() 在非终态调用 → 后续 abort 立即触发 → CanceledError
10. 主题变量命名含数字（`--text-600` 等）→ Lint 拦截 · project_memory 禁令

---

## 10. 技术栈速查表

| 分类 | 技术 | 版本 | 用途 |
|------|------|------|------|
| **UI 框架** | Vue | 3.5.40 | `<script setup>` · Composition API · 响应式 |
| **TS 编译器** | TypeScript | 6.0.3 | strict mode · vue-tsc 阻断构建 |
| **构建工具** | Rsbuild | 1.0.0 | Rspack 内核 · SVG Sprite · Views Glob 自定义插件 |
| **UI 组件库** | Element Plus | 2.14.3 | Dialog/Form/Table/Tree/Pagination 统一交互 |
| **状态管理** | Pinia | 4.0.2 | Setup Function · 24 stores · 持久化插件 |
| **路由** | Vue Router | 4.6.4 | Hash 模式 · 动态 addRoute · 菜单 fallback |
| **HTTP** | Axios | 1.18.1 | RequestHttp 类 · 拦截器 · 取消 · 重试 · 信号联合 |
| **SSE 流式** | eventsource-parser | 4.1.1 | 聊天 / 看板实时 KPI · AbortSignal |
| **图表** | ECharts | 6.1.0 | 饼/柱/折/散/水球 + 自定义主题 |
| **图/拓扑** | Cytoscape | 3.34.0 + dagre | 甘特/拓扑/知识图谱 |
| **图示** | Mermaid | 11.16.1 | 流程图/甘特/时序/架构图渲染 |
| **富文本** | WangEditor | 5.1.23 | 所见即所得 · 图片/视频上传 |
| **Markdown** | marked | 18.0.7 | 聊天/知识库安全渲染 |
| **国际化** | vue-i18n | 11.4.8 | zh-CN + en-US · 消息/菜单/组件 |
| **表格引擎** | **自研 ProTable** | 1.0 | CRUD 标准 · 筛选排序 · 列显隐 · 导出 · 行选 |
| **模糊搜索** | Fuse.js | 7.5.0 | 全局搜索 · 命令面板 · 文档召回 |
| **拖拽** | SortableJS · vuedraggable | 1.15.7 / 4.1.0 | 看板 / 列表拖拽排序 |
| **单元测试** | Vitest | 4.0.0 + @vue/test-utils 2.4 | 41/41 用例 · jsdom · coverage v8 |
| **E2E** | Playwright | 1.63.0 | 冒烟测试 `e2e/specs/smoke.spec.ts`（保留）|
| **Lint/Format** | ESLint 10 + Prettier 3 + Stylelint 17 | — | husky 9 + lint-staged 17 阻断级 |
| **提交规范** | commitlint + cz-git | 21 / 1.13 | Conventional Commits |
| **包管理** | pnpm / yarn | 9+ / 1.22 | 锁文件严格 |

---

## 11. 开发命令速查

```bash
# 环境
pnpm install           # 安装依赖
npx husky install      # Git Hooks

# 开发
pnpm dev               # Rsbuild Dev Server → http://localhost:8848
                       #   代理 /api → YiAi http://localhost:10086

# 构建（3 模式，均阻断级 vue-tsc --noEmit）
pnpm build:dev         # 开发环境
pnpm build:test        # 测试环境
pnpm build:pro         # 生产环境
pnpm preview           # 预览 dist 构建产物

# 质量门禁（CI 阻断级，4 件套）
pnpm type:check        # vue-tsc --noEmit · 0 错误必须
pnpm lint              # ESLint --fix + Prettier --write + Stylelint --cache --fix
pnpm i18n:check        # node scripts/check-i18n-locales.mjs（⚠️ 长期保留脚本，禁删）
pnpm i18n:check:detail # 同上，逐文件列出缺失 key
pnpm test              # vitest run · 41/41 必须全绿
pnpm test:coverage     # vitest --coverage
pnpm check             # typecheck + lint + test 串联

# E2E 冒烟（Playwright）
pnpm exec playwright install chromium   # 首次安装浏览器
pnpm exec playwright test               # 运行 e2e/specs/smoke.spec.ts
```

---

## 12. 相关资源索引

### 12.1 项目级文档
- [YiVad/CLAUDE.md](../../../YiVad/CLAUDE.md) — 技术栈表 · 项目结构 · 架构分层 · 数据流 · 硬约束 · 近期变更
- [YrY/CLAUDE.md](../../../CLAUDE.md) — 单体仓库级 RPC 协议 · 跨项目关系
- [YiAi README → §3 RPC 协议](../yiai/README.md#L81) — `module_name / method_name / parameters` 信封完整契约

### 12.2 知识库层
- [projects/README.md](../README.md) · [INDEX.md](../INDEX.md) · [../../MEMORY.md](../../MEMORY.md)
- [../../INDEX.md](../../INDEX.md) — 全库总导航（7 角色 × 阶段 × 2,450+ 文件）

### 12.3 跨项目契约
- [YiAi 知识库](../yiai/README.md) — 后端：响应信封 · SSE 帧 · RAG · 翻译健康度
- [YiPet 知识库](../yipet/README.md) — 扩展：跨项目桥接 · 每条消息 aiChat 跳转 · Bug 报告入口
- [YiPot 知识库](../yipot/README.md) — 桌面：翻译供应商健康度数据消费 · Dashboard 数据源

### 12.4 工程角色层
- [engineer/README.md](../../engineer/README.md) · [engineer/learn/lessons/](../../engineer/learn/lessons/)
- [leader/decisions/](../../leader/decisions/) — ADR 决策
- [sre/README.md](../../sre/README.md) — 前端性能 SLO（LCP/CLS/INP）· Web Vitals 看板

---

## 13. 变更历史

| 日期 | 变更摘要 |
|------|---------|
| 2026-10-09 | **README 专业化重构**：新增 5 天入职路线图 · 6 层架构全景图 · 三板斧（ProTable/动态路由/v-auth）深度说明 · SSE 流式 + 异步竞态治理 4 大真实 Bug（DisposerBag.reset / 联合 AbortSignal / Hook Watchdog / watch 首帧跳过）· 19 功能模块表格 · 源码关键索引 15 类 · 10 坑排查 · CR 13 项 Checklist · Hard Constraints 14 必/10 禁 · 技术栈 20+ 分类 · 命令速查含 i18n 保留脚本 |
| 2026-10-07 | 修复 useProjectDetail CanceledError：DisposerBag.dispose → reset · 移除 7777/8787 硬编码端口引用 |
| 2026-09-23 | 代码质量审计 6 大模块：竞态条件 / 防护模式 / 基础设施 / 类型安全 / 生产质量 / 最终报告（18 bug 修复）|
| 2026-09-02 | 初版创建：基础索引 + 快速导航 |
