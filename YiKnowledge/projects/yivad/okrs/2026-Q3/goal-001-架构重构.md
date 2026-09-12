---
type: okr-goal
id: yivad-001
title: "Project 页面架构重构"
status: completed
period: "2026 Q3"
owner: 陈铭
project: YiVad
project_id: yivad
progress: 100
updated: 2026-09-11
kr1: "detail.vue 从 1450 行缩减至 ≤200 行"
kr1_completion: 100
kr2: "useProjectInsights 拆分为 4 个单一职责 composable (data/stats/risk/filter)"
kr2_completion: 100
kr3: "7 个 Tab 组件独立 SFC，provide/inject 替代 props 透传"
kr3_completion: 100
kr4: "零功能回归，32 个用例全部通过，vue-tsc 零新增错误"
kr4_completion: 100
metric1_id: "yivad-m01"
metric1_desc: "detail.vue 行数"
metric1_current: "178"
metric1_target: "≤200"
metric2_id: "yivad-m02"
metric2_desc: "project 视图 composable 文件数（含共享 hooks）"
metric2_current: "10"
metric2_target: "≥8"
metric3_id: "yivad-m03"
metric3_desc: "vue-tsc 类型错误"
metric3_current: "0"
metric3_target: "0"
related_prds:
  - projects/yivad/prds/2026-09/00-prd-需求总览.md
---

# Project 页面架构重构

> Q3 核心工程目标。以 Project 页面为突破口，建立 YiVad 全项目的分层架构标准——data/stats/risk/filter 四层 composable 模型、provide/inject 详情页模式、共享 hooks 提取规范。

## 背景

Project 页面是 YiVad 管理后台的入口页面，承载项目信息、需求、模块、Bug、文档、分析、OKR 七个维度的数据展示与交互。重构前存在三个递进的结构性问题：

**页面级**：`detail.vue` 1450 行，`useProjectInsights.ts` 380 行——两个 God Object 混合了数据加载、统计聚合、风险检测、过滤管理、Tab 切换、UI 渲染。修改任一功能需在巨型文件中定位，无法独立测试，无法并行开发。

**系统级**：`getIssueList` 被入口和 Overview Tab 各调一次；Docs Tab 仅占位文本；Bug/Issue/Module/Knowledge 等列表页各自内联图表和统计逻辑，无统一的 composable 分层规范。

**扩散风险**：九月规划了 OKR Tab、Requirements Tab、Devs Tab、文档分离等新功能。如果不先建立架构标杆，新增的每个 Tab 都会继续复制 God Component 模式，技术债将几何级增长。

## 季度演进

### 八月 — 基础设施铺设

Q3 前四周聚焦于全项目级别的工程能力建设，为该目标的九月重构提供技术前提。

**组件体系**：提取 ProTable/SearchForm/Upload 三个通用组件，以配置驱动消除 40% 跨页面重复模板代码。ProTable 的 columns 配置 + 具名插槽混合模式在 Issue 页面完成验证，为列表页统一数据交互提供了标准容器。

**测试基础设施**：搭建 Vitest + @vue/test-utils + jsdom，建立 L1（vue-tsc 类型检查）→ L2（composables 纯函数单测）→ L3（组件测试）→ L4（手动回归）四层质量门禁。18 个测试文件、109 个用例覆盖核心模块。该基础设施是后续重构零回归的前提——没有它，1450 行的 God Component 拆分不可控。

**权限体系**：实现路由级守卫 + 按钮级 v-auth 指令 + 菜单过滤三层 RBAC，建立了 `router.beforeEach` → `authStore.loadPermissions()` → 动态注册路由 → `v-auth` DOM 控制的完整链路。

**主题系统**：CSS 变量方案实现运行时暗色切换，index.html 内联预加载脚本消除闪烁，为所有页面提供一致的设计令牌基础。

**其他基础设施**：8 个自定义指令（auth/copy/watermark/draggable/debounce/throttle/longpress/sticky）、RequestHttp 五层拦截器链（取消/Loading/认证/错误映射/重试）、AbortController 请求去重。

八月 PRD 中该目标仅列为"项目详情页优化"（YV-08-01-10），规划 3.0d。但重构 Bug/Issue/Module 列表页时，发现详情页的架构债务远超初步评估——这不是优化问题，是需要完整重构的问题。决策：将详情页重构升级为九月核心目标，纳入 YV-09-01（15 项子需求，24.25d）。

### 九月 — 核心重构与扩展交付

九月分两个迭代推进。上旬完成核心架构拆分，中旬在此基础上扩展新功能。

**上旬（9/1–9/7）—— 分层架构建立**

`detail.vue` 从 1450 行缩减至 178 行，仅保留编排职责。核心技术动作：

1. 提取 `useProjectDetail` 共享 hook 到 `src/hooks/`：单次 `Promise.all` 统一拉取 project/issues/modules/bugs/knowledgeFiles，请求序列号防竞态，30s 静默轮询。直接消除了 `getIssueList` 被入口和 Overview Tab 重复调用的历史问题。
2. 提取 `useDetailTabs` 共享 hook：7 个 Tab 的注册配置（名称/图标/组件/badge 计数）从 detail.vue 模板中解耦为数据驱动配置。
3. 提取 `useDateFilter` 共享 hook：日期筛选导航（前一天/后一天/今天/清除）。
4. 建立 `provide(PROJECT_DETAIL_KEY, ctx)` → `useProjectDetail()` inject 的数据分发模式，替代 props 逐层透传。所有 Tab 消费同一份响应式数据，Tab 切换时无额外请求。

`useProjectInsights.ts` 按职责拆为四层纯函数：

| 层 | 文件 | 职责 | 副作用 |
|----|------|------|--------|
| Data | `useProjectData.ts` | 拉取全量 projects/issues/bugs/modules | API 调用 |
| Stats | `useProjectStats.ts` | 按 key 聚合统计、完成率、活动序列、Top N | 无 |
| Risk | `useProjectRisk.ts` | 5 类风险检测（逾期/停滞/未分配/无成员/无描述） | 无 |
| Filter | `useProjectFilter.ts` | 跨维度筛选、撤销历史栈（MAX_HISTORY=20） | 无 |

依赖方向严格单向：data → stats → risk，filter 独立。Stats 和 Risk 为纯计算层，输入 refs 输出 computeds，可独立单测而无需 mock 任何 API。`useProjectInsights.ts` 保留为组合入口，将四层组装为向后兼容的统一 API 供列表页使用。

**中旬（9/8–9/15）—— Tab 扩展与新功能**

分层架构就绪后，新增 Tab 只需三步：创建 SFC → 在 `useDetailTabs` 注册 → 通过 `useProjectDetail()` inject 获取数据。任何 Tab 的修改不影响其他 Tab 和入口。

基于此架构，中旬交付了超出八月 PRD 规划的四项新能力：

1. **DetailOkr** — 从 YiKnowledge 双路径扫描 OKR 数据。项目级路径 `projects/{key}/okrs/` 读取项目专属目标，角色级路径 `{role}/okr/{quarter}/{goal-id}/goal.md` 读取跨项目角色目标。解析 goal.md frontmatter 中的 KR 和 metric 字段，SVG 进度环可视化，按角色分组展示。
2. **DetailRequirements** — 从 YiKnowledge `prd/` 目录提取产品需求文档，按月份分组，通过 `prd_task_id` 关联开发模块与测试文档。支持从 `useProjectDetail` 已加载的文件列表零 API 派生。
3. **DetailDevs** — 以产品需求为组织框架展示开发模块列表。每个模块卡片显示来源 PRD、关联测试、MongoDB 运行时模块链接，实现 YiKnowledge 文档 ↔ MongoDB 运行数据的双向关联。该 Tab 是 goal-002（文档职责分离与知识关联）的前端落地载体。
4. **DetailQuality** — Bug 列表，替代原 BugList 简单嵌入方案，支持按状态/严重度筛选。

Tab 交付对比：

| 维度 | 八月 PRD 规划 | 九月实际交付 |
|------|-------------|------------|
| Tab 数量 | 6（Overview/IssueList/ModuleList/DetailDocs/BugList/DetailMembers） | 7（概览/OKR/需求/模块/质量/文档/分析） |
| 数据获取 | 各 Tab 独立调用 API | 入口统一 load，inject 消费 |
| 新增 Tab 成本 | 需修改 detail.vue 模板和逻辑 | 创建 SFC + 注册 Tab 配置即可 |
| YiKnowledge 关联 | 无 | OKR/需求/模块三个 Tab 直接消费 YiKnowledge 文件 |

**附带优化**：`DetailSkeleton` 和 `DetailError` 为四种状态（加载/错误/不存在/正常）提供完整 UI 覆盖；`<Transition name="fade">` 为 Tab 切换提供 200ms 过渡动画；切换回 Overview Tab 时自动 `retry()` 刷新确保 Todo 列表一致性；30s 静默轮询不绑定 Tab 生命周期。

### 十月 — 模式推广与债务收敛

九月重构产出的不仅是 Project 页面本身，更是一套经过验证的、可复用的架构模式。十月的核心任务是将这些模式推广到 YiVad 其他视图，最大化 Q3 工程投入的杠杆效应。

**现状评估**：YiVad 28 个视图模块中，仅 project（8 composables + 3 hooks）和 aiChat（6 composables + 3 hooks）具备完整的分层架构。issue（5 composables）、bug（2 composables）、module（2 composables）、rag（3 composables + 2 hooks）有部分 composable 但未采用 data/stats/risk/filter 分层。knowledge（1 composable）和其余 20 个视图零分层。共享 hooks 目录仅有 project 和 aiChat 贡献了 4 个文件。

**推广计划**：

| 优先级 | 视图 | 当前状态 | 十月目标 | 人天 |
|--------|------|----------|----------|------|
| P0 | bug | 2 composables，无分层 | 对齐 data/stats/risk 三层，提取 useBugDetail hook | 2.0 |
| P0 | issue | 5 composables，无分层 | 重组为 data/stats/filter 三层，提取共享 hooks | 2.0 |
| P0 | module | 2 composables，无分层 | 对齐 data/stats 两层，Module 详情页 provide/inject | 1.5 |
| P1 | knowledge | 1 composable | 建立 data/filter 两层，树形数据加载 hook | 1.5 |
| P1 | rag | 3 composables + 2 hooks | 对齐分层规范，统一 hooks 目录结构 | 1.0 |
| P2 | dashboard | 零分层 | 提取 useDashboardData hook，三态渲染 | 1.0 |
| P2 | home | 零分层 | 复用 useHomeData 模式，对齐 project 标准 | 0.5 |

**模式标准化**：

1. **列表页标准**：data → stats → risk → filter 四层（risk 按需选择），纯计算层零副作用，组合入口向后兼容。
2. **详情页标准**：入口仅编排职责（≤200 行），provide/inject 数据分发，Tab 组件独立可测，共享 hooks 提取到 `src/hooks/`。
3. **代码审查检查项**：新建视图必须通过分层架构审查——入口行数、composable 纯度、API 调用去重、状态覆盖。

**债务收敛**：移除重构过程中保留的 `@deprecated` 标记代码；统一下线各视图中直接调用 `axios` 的残余代码；将已验证的 composable 模式回写到 YiKnowledge 架构文档。

**成功标准**：十月结束时，YiVad 核心业务视图（project/bug/issue/module/knowledge/rag/dashboard）全部采用统一分层架构，共享 hooks 目录从 4 个增至 10+ 个，新视图从第一天起即遵循模式。

## 关键结果

| KR | 描述 | 完成度 |
|---|------|--------|
| KR1 | detail.vue 从 1450 行缩减至 ≤200 行 | 100% |
| KR2 | useProjectInsights 拆分为 4 个单一职责 composable | 100% |
| KR3 | 7 个 Tab 组件独立 SFC，provide/inject 数据分发 | 100% |
| KR4 | 零功能回归，32 个用例全部通过 | 100% |

## KR1 — 入口精简

`detail.vue` 178 行，仅承担编排职责：通过 `useProjectDetail` 统一加载数据，通过 `useDetailTabs` 管理 Tab，通过 `useDateFilter` 管理日期导航，通过 `provide(PROJECT_DETAIL_KEY, ctx)` 向所有子组件注入共享上下文。四种状态（加载/错误/不存在/正常）完整覆盖。

消除了 `getIssueList` 重复调用——原入口和 Overview Tab 各拉一次，现在入口层统一拉取，所有 Tab 通过 inject 消费同一份数据，由 30s 全局轮询保持新鲜度。

## KR2 — Composable 分层

列表页建立 data → stats → risk → filter 四层纯函数模型，依赖方向严格单向，每层零副作用、可独立单测。`useProjectInsights.ts` 作为组合入口保持向后兼容。

详情页新增三个独立 composable：`useProjectOkrs` 从 YiKnowledge 双路径（项目级 + 角色级目录）扫描并解析 goal.md frontmatter；`useRequirements` 从 `prd/` 目录提取需求文档，支持从已有文件列表零 API 派生；`useYiKnowledgeModules` 从 `modules/` 目录提取模块文档并按 `prd_task_id` 索引。

三个共享 hooks 提取到 `src/hooks/` 供全局复用：`useProjectDetail`（统一数据加载 + 防竞态 + 轮询）、`useDetailTabs`（Tab 注册）、`useDateFilter`（日期导航）。

## KR3 — Tab 组件化

每个 Tab 是独立 SFC，通过 `useProjectDetail()` inject 获取共享数据，无需 props 透传。八月 PRD 规划的 6 个 Tab 被重构为 7 个语义更清晰的 Tab：概览/OKR/需求/模块/质量/文档/分析。OKR、需求、模块、质量四个 Tab 为九月新增，直接促成了 goal-002（文档职责分离与知识关联）的实现。