---
type: okr-goal
id: yivad-003
title: "全项目视图优化与体验提升"
status: in_progress
period: "2026 Q3"
owner: 陈铭
project: YiVad
project_id: yivad
progress: 85
updated: 2026-09-11
kr1: "9 个视图模块完成架构优化，消除 God Component/God Composable"
kr1_completion: 90
kr2: "全项目国际化覆盖，新增 ~136 i18n Key"
kr2_completion: 85
kr3: "样式效果统一改造，视觉一致性 + 响应式适配"
kr3_completion: 80
kr4: "项目健康大盘 + 数据导入能力就绪"
kr4_completion: 100
related_prds:
  - projects/yivad/prds/2026-09/00-prd-需求总览.md
  - projects/yivad/prds/2026-09/01-prd-列表组件体系.md
  - projects/yivad/prds/2026-09/02-prd-表单组件体系.md
---

# 全项目视图优化与体验提升

> Q3 体验工程目标。在 goal-001 建立 Project 页面分层架构标杆后，将 composable 拆分、组件化、骨架屏三态渲染等模式推广到 YiVad 其余 9 个核心视图，同步完成全项目国际化和视觉一致性改造。

## 背景

八月基础设施和九月 Project 页面重构完成后，YiVad 面临两个不对称问题：

**架构不对称**：Project 页面经过 24.25d 重构后拥有 8 composables + 3 hooks 的完整分层架构，而 AI Chat、RSS Content、Knowledge、Issue、RAG、Module、Bug、Kanban、Roadmap、Global Search 等 10 个视图仍处于不同程度的架构债中。AI Chat 的 Store 和组件混合了流式数据处理、消息管理和 UI 渲染；RSS Content 页面未抽取 composable；Issue 侧边栏内联了图表逻辑。

**体验不对称**：重构后的 Project 页面具备完整的四态渲染（骨架屏/错误态/空状态/数据态）、国际化和键盘快捷键支持。同一应用中其他页面缺少加载骨架屏、错误消息未经 i18n 处理、样式风格不统一。

本目标消除这些不对称——将 Project 页面验证的模式推广到全项目，使 YiVad 28 个视图在架构质量和用户体验上达到统一标准。

## 季度演进

### 八月 — 模式验证

八月在完成 ProTable、RBAC、暗色主题等基础设施后，Bug/Issue/Module 列表页率先完成初步 composable 抽取（`useBugData`、`useBugCharts`、`useIssueStats`、`useIssueCharts`、`useModuleData`、`useModuleCharts`），但仅为统计逻辑分离，未达到完整的分层标准（缺少 risk/filter 层，无骨架屏，样式未统一）。

该阶段的产出验证了一个关键判断：列表页的 composable 拆分模式可在不同视图中复用，但需要统一的层模型和代码审查标准。

### 九月 — 全项目推广

九月上旬在 Project 页面建立四层 data/stats/risk/filter 模型的同时，中旬启动全项目推广，覆盖 10 个视图模块。

**视图架构优化（9 个视图，KR1）**：

| 视图 | 重构前 | 重构内容 | 状态 |
|------|--------|----------|------|
| RSS Content | 无 composable，渲染和逻辑混合 | 抽取数据加载 composable、组件拆分、骨架屏 | ✅ |
| AI Chat | Store 混合流式处理+UI 逻辑 | Store 职责拆分、流式处理 hook 提取、工具函数去重 | ✅ |
| Knowledge | rssManager 混合多个职责 | rssManager 拆分、路由统一、composable 提取 | ✅ |
| Issue | 侧边栏内联图表、无加载态 | 侧边栏组件化、图表迁移至 composable、三态渲染 | ✅ |
| RAG | useRagStream 存在但未激活 | 激活 useRagStream、快捷键统一、composable 整合 | ✅ |
| Module | 未使用 ProTable、无骨架屏 | DetailSkeleton 共享、ProTable 列配置优化 | ✅ |
| Bug | 内联图表+统计 | Composable 分层规范化、骨架屏 | ✅ |
| Kanban | 无加载态、乐观更新逻辑内联 | 组件拆分优化、加载态补全 | ✅ |
| Roadmap | 右键菜单逻辑内联 | 组件拆分、Markdown 预览编辑优化 | ✅ |
| Global Search | 竞态控制内联 | Composable 提取、可折叠分组优化 | ✅ |

每个视图遵循统一模式：数据获取 → composable → 组件消费；三态覆盖（loading/error/empty）；共享组件复用（DetailSkeleton 被 Module 视图复用）。

**国际化覆盖（KR2）**：

新增 ~136 个 i18n Key，覆盖 Project 页面的 7 个 Tab、通用组件（ProTable/SearchForm/HeroDateNav）、错误提示和空状态文案。中英文双语同步维护。i18n Key 按功能域命名（`project.detail.tabs.*`、`project.detail.*`、`common.*`），遵循 vue-i18n 11 的点分隔命名规范。

**样式效果改造（KR3）**：

- 视觉一致性：统一页面间距（24px padding）、卡片圆角（8px）、阴影层级（3 级）、色彩变量引用。消除 5 处硬编码颜色，全部迁移至 Element Plus CSS 变量。
- 微交互：Tab 切换添加 `<Transition name="fade">` 200ms 过渡动画；按钮 hover/active 状态统一；列表项 hover 高亮。
- 响应式适配：页面容器改用百分比宽度 + max-width 约束，日期筛选组件在小屏下自适应换行。
- Markdown 预览样式：从非 scoped 迁移至 scoped + `:deep()` 穿透方案，消除跨组件样式泄漏。代码块、引用块、表格在亮色/暗色主题下均保持一致的视觉表现。

**项目健康大盘 + 数据导入（KR4）**：

项目健康大盘（Project Health Dashboard）在列表页上方展示 4 个维度的健康指标卡片——风险项目数、逾期任务数、停滞项目数、无成员项目数——每个卡片可点击筛选对应项目列表。数据导入功能支持 CSV/JSON 批量导入 Issue，含字段映射、校验和错误行回显。

**代码质量收尾**：

- 类型集中管理：`types.ts` 新增 10+ 类型定义和 12 个常量，消除跨 composable 的重复类型声明
- 死代码清理：移除 70 行非 scoped 样式、2 处重复的工具函数（`roleTagType`、`activityColor`）
- 导入路径别名化：`../../` 相对路径全部迁移至 `@/` 别名
- 循环依赖检查：`madge --circular` 零循环依赖
- 构建验证：`vue-tsc --noEmit` + `pnpm lint` + `pnpm build` 全部通过

### 十月 — AI Chat 深度重构与体验打磨

十月的重点是将九月中遗留的 AI Chat 深度重构完成，并对全项目进行体验一致性打磨。

**AI Chat 深度重构**：

AI Chat 是 YiVad 中最复杂的页面（仅次于 Project），九月完成了 Store 职责拆分和工具函数去重。十月需要完成：

| 任务 | 内容 | 人天 |
|------|------|------|
| 组件拆分 | 消息列表、输入区、会话侧边栏、对话树 4 个独立组件 | 2.0 |
| 流式处理 hook | `useChatStream` — 封装 SSE 连接、断线重连、消息增量更新 | 1.5 |
| 对话树优化 | `useConversationTree` 状态管理从 Store 中剥离 | 1.0 |
| 三态渲染 | 骨架屏（首次加载）+ 错误态 + 空会话引导 | 0.5 |

**体验一致性打磨**：

- 全项目骨架屏审计：逐一检查 28 个视图的三态覆盖情况，补全缺失的加载态和错误态
- 国际化补全：审计 `zh-CN` 和 `en-US` 文件，确保所有用户可见文案均已 i18n 化，消除硬编码中文
- 键盘快捷键统一：将 Project 页面验证的快捷键模式（Tab 切换、日期导航、搜索聚焦）推广到其他视图

**成功标准**：十月结束时，YiVad 所有核心视图（28 个）均具备完整的加载/错误/空/数据四态渲染，用户可见文案 100% i18n 覆盖，AI Chat 达到与 Project 页面同等的架构质量标准。

## 关键结果

| KR | 描述 | 完成度 |
|---|------|--------|
| KR1 | 9 个视图模块完成架构优化 | 90% |
| KR2 | 全项目国际化覆盖，~136 i18n Key | 85% |
| KR3 | 样式效果统一改造，视觉一致性 | 80% |
| KR4 | 项目健康大盘 + 数据导入就绪 | 100% |

## KR1 — 视图架构优化

RSS Content、AI Chat、Knowledge、Issue、RAG、Module、Bug、Kanban、Roadmap、Global Search 共 10 个视图完成 composable 抽取和组件拆分（AI Chat 组件拆分为十月任务）。每个视图遵循 data → view 两层最小模型或 data/stats 三层模型，消除单文件混合职责。共享组件复用：DetailSkeleton 被 Module 视图复用，HeroDateNav 被多个视图复用。

## KR2 — 国际化

新增 ~136 个 i18n Key，覆盖 Project 页面 7 个 Tab、日期筛选组件、ProTable/SearchForm 通用组件、错误提示和空状态文案。中英文双语同步。Key 按功能域点分隔命名（`project.detail.tabs.*`），遵循 vue-i18n 11 规范。

## KR3 — 样式效果改造

统一页面间距、卡片圆角、阴影层级、色彩变量引用。消除 5 处硬编码颜色迁移至 CSS 变量。Tab 切换 `<Transition>` 动画。Markdown 预览 scoped + `:deep()` 隔离。亮色/暗色双主题兼容。

## KR4 — 健康大盘与数据导入

项目健康大盘实时展示风险项目数、逾期任务数、停滞项目数、无成员项目数 4 个指标卡片，点击可筛选。数据导入支持 CSV/JSON 批量导入 Issue，含字段映射、校验、错误行回显。