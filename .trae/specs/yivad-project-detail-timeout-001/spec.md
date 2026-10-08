# YiVad 项目详情页概览加载可靠性升级 - Product Requirements Document

## Overview
- **Summary**: 对 `/#/project/:key` 页面的「概览」数据加载流水线进行专业化可靠性工程改造，系统性解决 30s 超时（`timeout of 30000ms exceeded`）导致整页失败的问题。交付物包含：分级超时与指数退避重试、细粒度熔断降级、请求流水线拆分（关键路径/非关键路径解耦）、SRE 可观测性指标（指标注册/暴露/观测）、前端持久化缓存 + 缓存失效策略、Timer/AbortController 资源清理契约。
- **Purpose**: 消除 YiVad 项目详情页进入即失败的最关键 P0 体验问题，使即使后端 YiAi 处于冷启动、磁盘扫描、或单接口抖动状态时，页面也能 100% 展示内容，只是对「非关键块」显示占位/过期数据，而不再出现全屏红色错误页。
- **Target Users**: YiVad 全量用户（研发负责人、架构师、项目经理、QA、SRE）；SRE 团队使用新增的性能/错误指标看板。

## Goals
- G1: 概览页首屏**不出现 30s 级挂死**，关键路径（Header + Tabs + 主区块骨架）在最坏 10s 内可见。
- G2: 后端单接口（任意一个）失败时，**概览页始终呈现可用内容**，失败块只降级不阻塞其余块。
- G3: 引入可观测性：每次加载的**每个请求阶段**都产出结构化指标，供前端 SRE 看板消费。
- G4: 引入可靠性机制：超时分级、熔断、降级缓存、资源清理；不出现 Timer / AbortSignal / Promise 句柄泄漏。
- G5: 性能基线：缓存命中时二次进入项目详情页 **< 500ms 可交互**。

## Non-Goals
- 不修改后端 YiAi / MongoDB schema / RPC handler；仅在前端侧做可靠性工程。
- 不引入新的状态管理框架（保持 Pinia）；不引入 RxJS / Redux-Observable。
- 不改动 Issue / Module / Bug / Member 其它 Tab 的独立数据管线，只加固 Hook 层透出的数据。
- 不重写 DetailOverview.vue 的 UI 样式 / i18n 文案语义（只做加载/降级逻辑）。
- 不做跨页全局 HTTP 层重构（`api/index.ts` axios 实例的超时仍保持 30s，由调用方用 `Promise.race` 覆盖）。

## Background & Context
### 现场证据
1. 访问 `http://localhost:8848/#/project/yipot` 出现全屏错误：`加载概览数据失败 timeout of 30000ms exceeded`。
2. 数据加载由 [useProjectDetail.ts](file:///Users/yi/YrY/YiVad/src/hooks/useProjectDetail.ts) 集中编排：Phase 1 `store.fetchProject(key)`；Phase 2 `Promise.allSettled([knowledgeFiles, issues, modules])`。
3. 其中 `listKnowledgeFiles("projects")` 走 YiAi `POST /knowledge-files`，后端会扫 `~/YiKnowledge/projects/**` 全量 MD 文件并反序列化 Frontmatter，冷启动或目录大时是典型慢接口；且该接口返回**全部项目**的文件列表，前端再 `filter(path.startsWith(projects/<key>/))`，有明显 I/O 和序列化浪费。
4. 全局 axios [api/index.ts](file:///Users/yi/YrY/YiVad/src/api/index.ts) 配置 `timeout: ResultEnum.TIMEOUT = 30000`，属于超大水桶超时，会把瞬时网络抖动放大成 30s 阻塞。
5. DetailOverview 的 README 读取 `readProjectFile()` 与主加载无隔离、无节流，每次 `lastUpdated` 变动都重读，极易叠加放大阻塞。
6. 项目内存约束：用户 profile 要求「关注资源清理（如 Timer 句柄）、异常隔离和 API 返回值的一致性」——必须体现在实现中。

### 现有代码上下文
- 核心链路（已完成 v1 加固，本次升级为 v2 专业版）：
  - [useProjectDetail.ts](file:///Users/yi/YrY/YiVad/src/hooks/useProjectDetail.ts)
  - [retry.ts](file:///Users/yi/YrY/YiVad/src/api/helper/retry.ts)
  - [DetailOverview.vue](file:///Users/yi/YrY/YiVad/src/views/project/components/DetailOverview.vue)
  - [knowledgeService.ts](file:///Users/yi/YrY/YiVad/src/api/modules/knowledgeService.ts)
  - [fileService.ts](file:///Users/yi/YrY/YiVad/src/api/modules/fileService.ts)（`readProjectFile` 待加固）
- 性能/指标基础设施（已存在但未接入本页面）：
  - [metricsStore.ts](file:///Users/yi/YrY/YiVad/src/utils/performance/metricsStore.ts)
  - [performanceObserver.ts](file:///Users/yi/YrY/YiVad/src/utils/performance/performanceObserver.ts)

## Functional Requirements

### FR-1: 请求流水线分阶段
概览加载拆成**四个可观测阶段**，每阶段独立超时/重试/熔断：
1. P1-Header: `store.fetchProject(key)` → 8s 硬超时。
2. P2-Meta（并行）：`getKnowledgeFiles(projectKey)` 18s、`getIssueList({pageSize:60})` 12s、`getModuleList({pageSize:30})` 10s。
3. P3-Derive（CPU 本地，I/O 0 成本）：基于 KnowledgeFiles 推导 Bug / PRD / Module / Test 列表。
4. P4-Readme（非关键异步，不在主 loading 内）：`readProjectFile` 8s 独立超时，失败降级到 `project.description`。

### FR-2: 细粒度错误降级
- P1 失败（连续重试 2 次后仍失败）：展示 DetailError 重试页（现有行为保持）。
- P2 中任意请求失败：**绝不**触发整页 `error`；将该数据源设为空数组，并在 UI 对应区块显示「数据暂时不可用，稍后自动重试」样式（非阻塞提示条）。
- 只在 P2 三项全部失败（或 P1 失败）时才写 `error`，触发全屏错误页。
- P4 Readme 失败：静默使用 `project.description` 文本，若 description 不存在显示 README 的空状态，不得 throw 到上层。

### FR-3: 熔断机制（Circuit Breaker）
- 按 endpoint（按 projectKey 维度）维护三态熔断器：`closed / open / half-open`。
- 失败阈值：120s 窗口内同一 endpoint 连续失败 3 次 → 打开熔断器，后续请求直接走「熔断降级」并跳过网络。
- 恢复策略：open 持续 20s 后进入 half-open，放一笔探测请求；成功 → closed；失败 → 重新 open 20s。
- 熔断器状态变化写入性能指标 store。

### FR-4: 持久化缓存与回退
- `knowledgeFiles`、`issues`、`modules` 三项写入 `localStorage` 持久化缓存（key = `yivad:pd:${projectKey}:${endpoint}`），TTL：
  - knowledge: 15min
  - issues: 5min
  - modules: 10min
- 策略：网络优先；网络失败 → 读取缓存（无论 TTL 是否过期都先展示）并在右侧提示条显示「数据为 N 分钟前的缓存，已请求更新」；网络成功 → 刷新缓存。
- 缓存条目大小超过 512KB 时按 LRU 清退最久未使用的 projectKey 条目。

### FR-5: 可观测性指标
每次调用 `fetchProject()` 产出一条结构化 metrics：
- 字段：`projectKey`、`phase`（P1/P2a/P2b/P2c/P3/P4）、`status`（success/failed/degraded/cached/circuit-open）、`durationMs`、`retryCount`、`errorType`（timeout/network/business/aborted）、`timestamp`。
- 指标 push 到 `metricsStore`（已有的 `useMetricsStore`），并提供对外订阅接口以便后续接企业微信 IM 告警。
- 全局统计指标：近 5 分钟超时率、降级率、缓存命中率。

### FR-6: 资源清理契约
- 所有 `setTimeout` / `setInterval` 句柄统一由单一 `DisposerBag` 管理，在 `onUnmounted` / `stopPolling` / 新请求开始时全部 `clear`。
- 所有潜在挂起的 Promise（加载中请求）在 `requestSeq` 推进或组件卸载时**静默丢弃其结果**，并清理对应的 timeout handler。
- 禁止出现重复 timer：README 加载、轮询、loading、骨架动画各用独立 disposer。

### FR-7: 渐进展示（Progressive Skeleton）
- 保持现有骨架屏语义（Header Skeleton → Content Skeleton → 内容），但：
  - P2 中若单请求先完成，应**先填入该请求对应的数据槽**，其它槽继续骨架/加载中态，而非等全部完成。
  - 即 Phase 2 不再强制等 `Promise.allSettled` 全部结束再批量赋值；每个 promise fulfilled/rejected 时立刻处理。

## Non-Functional Requirements

### NFR-1: 可靠性（SLO）
- P99 概览页「可交互时间」 ≤ 10s（以浏览器 TTI 为准），即使后端某单接口冷启动挂死 18s 也可通过降级达标。
- 30 天内页面因「超时导致整页失败」的比例 ≤ 0.1%。

### NFR-2: 性能
- 本地开发环境热启动 + 全缓存命中：二次进入同一项目 TTI ≤ 500ms。
- 单次 `fetchProject` 主逻辑（不包含网络）CPU 占用 ≤ 20ms，避免在主线程上做大规模数组计算。
- `deriveBugs/deriveModules/deriveTests` 采用短路：当 knowledgeFiles 为空时直接 return []；1000 条 MD 文件的正则匹配在 MBP M1 上 ≤ 30ms。

### NFR-3: 异常安全性
- 任何一段 P2/P3/P4 的 throw 都必须被 catch，且不会冒泡使 `loading === true` 卡死。
- 任何 API 返回结构缺字段（如 `res.data.list undefined`）都以空结构兜底，不抛 TypeError。

### NFR-4: 可维护性
- 所有新增可靠性抽象保持单文件 ≤ 400 行，独立可测（DisposerBag, CircuitBreaker, MetricsRecorder, FetchPipeline）。
- 每个抽象暴露 TypeScript 类型，不使用 any 超过 3 处（每文件计数）。

### NFR-5: 资源
- 组件卸载后 1s 内清理完所有 timer / 事件订阅；无 MemoryLeakDetector（若启用）告警。

## Constraints
- **Technical**:
  - 保持 Vue 3 + TypeScript + Pinia；不得引入新全局状态容器。
  - 不修改 `api/index.ts` 全局 axios 超时（防止影响其它业务），由调用方 `Promise.race(AbortSignal.timeout)` 覆盖。
  - CSS 变量/主题命名继续遵守不包含数字、语义化的规范（memory 要求）。
- **Business**:
  - 不破坏 `DetailOkr` 等 Tab 依赖 `okrSummary` / `allIssues` / `allModules` 现有响应式结构。
  - `activeTab === "overview"` 切换时触发的 `retry()` 必须继续可用。
- **Dependencies**:
  - 只能使用 `package.json` 已有依赖；禁止新 `yarn add`。可使用 `dayjs`, `lodash-es`, `@vueuse/core`。

## Assumptions
- A1: `metricsStore` 的对外 API 已经或可以在本页落地时同步调整为 `push(event: MetricEvent)`；若不存在对应方法则在实现任务中补齐最小接口。
- A2: 后端 `listKnowledgeFiles("projects")` 接口本身不会被前端优化替代，允许做客户端缓存/预过滤（符合 non-goal 不改后端）。
- A3: 企业微信告警对接不在本次 scope，但要求指标暴露为结构化 JS 数组 + `mitt` 事件，以便 SRE 后续接入。

## Open Questions
- [ ] Q1: 熔断窗口参数（120s / 3 次 / 20s cool-down）是否需要可配置化到 `config/index.ts`？默认值暂按上述。
- [ ] Q2: 缓存 LRU 上限（目前 512KB）是否需要扩展？如果项目知识库普遍 > 2MB，需要压缩或换成 IndexedDB。默认 512KB。
- [ ] Q3: 指标是否需要上报到后端 YiAi `/metrics`？默认只放前端内存 + localStorage，不做跨域上报。

---

## Acceptance Criteria

### AC-1: 单知识接口挂死不阻塞整页
- **Type**: `rule`
- **Given**: 打开 `/#/project/yipot`，模拟 `POST /knowledge-files` 被 `AbortSignal.timeout(18000)` 拒绝
- **When**: 进入页面后等待 20s
- **Then**: 页面 Header + Tabs 渲染完成；Overview 页面的 Summary、Stats strip、WIP、Due health 等 Issue/Module 驱动的区块正常展示；Knowledge/Bug 相关区块显示「数据暂不可用」非阻塞提示条；**不出现 DetailError 全屏错误页**
- **Pass Condition**: `error.value === null` 且 `headerReady === true` 且 Overview 主骨架被替换
- **Evidence**: 手动浏览器测试（DevTools Network throttling + block URL pattern `/knowledge-files` 模拟失败）

### AC-2: 三次失败触发熔断器
- **Type**: `rule`
- **Given**: 单项目下 `getIssueList` 在 120s 内连续失败 3 次
- **When**: 发起第 4 次调用（无论 retry 还是用户手动 retry）
- **Then**: 第 4 次调用不产生真实网络请求（Network 面板看不到），立即返回 cached / fallback 空数组；指标中记录 `status=circuit-open`
- **Pass Condition**: 请求次数为 0（DevTools count ≤ 3），metricsStore 中有 1 条 `circuit-open`
- **Evidence**: 单测 `CircuitBreaker.spec.ts` + DevTools Network 截图/计数

### AC-3: 网络失败返回缓存
- **Type**: `rule`
- **Given**: 某项目 `knowledgeFiles` 已成功加载过一次并写入 localStorage，后端 now 断网（Offline）
- **When**: 重新进入该项目
- **Then**: P2a 阶段立即命中缓存，`knowledgeFiles.value` 与上次成功相同；UI 提示条展示「数据为 N 分钟前缓存」
- **Pass Condition**: 0 笔网络请求（DevTools offline 模式），内容与上次一致
- **Evidence**: DevTools Application / Local Storage 面板 + Offline 测试

### AC-4: 加载阶段可观测
- **Type**: `rule`
- **Given**: 正常加载一次项目详情
- **When**: 加载完成后查询 `metricsStore` 事件列表
- **Then**: 至少出现 4 条记录（P1 + P2a/K + P2b/I + P2c/M），每条均包含 `phase`/`status`/`durationMs`
- **Pass Condition**: 4+ events, all fields 非空，P1 status=success
- **Evidence**: 控制台 `console.table(metricsStore.events)` 截图

### AC-5: 资源清理无泄漏
- **Type**: `rule`
- **Given**: 组件挂载后加载中（`loading=true`），用户路由跳走触发 `onUnmounted`
- **When**: `onUnmounted` 执行后 1s
- **Then**: 所有 `pollTimer` / `_readmeLoadTimer` / 自定义 `setTimeout` 都已 `clearInterval/clearTimeout`；挂起请求结果到达时不得触发 `xx.value = ...` 写操作
- **Pass Condition**: `performance.memory`（若可用）未增长；单测中对 DisposerBag 调用 `dispose()` 后所有 disposer 被调用一次
- **Evidence**: DisposerBag 单元测试断言 + MemoryLeakDetector（若存在）无报警

### AC-6: README 独立加载失败不影响概览
- **Type**: `rule`
- **Given**: 进入项目页，`readProjectFile` 返回 Promise reject 或超时 8s
- **When**: 继续浏览概览其它区块
- **Then**: README 卡片要么显示 `project.description`，要么显示空状态；概览其余区块全部正常
- **Pass Condition**: `loading.value === false` 且 `error.value === null`，且不会出现 8s 内主 loading 仍 true 的情况（因为 README 不在主 loading）
- **Evidence**: DevTools block `/file/read` 并观察 UI

### AC-7: 渐进展示（Partial Rendering）
- **Type**: `rule`
- **Given**: 人为让 P2b/issues 500ms 返回、P2c/modules 1s 返回、P2a/knowledge 10s 返回
- **When**: 在 t=1s, t=5s, t=11s 分别观察页面
- **Then**: t=1s 时 Issue 驱动的区块（WIP/Due health/Recently Completed）已渲染真实数据；t=5s Module 区渲染；t=11s Bug/Knowledge/Docs 区渲染
- **Pass Condition**: 时间点观察到的真实内容对应已完成的 promise
- **Evidence**: 屏幕录制或分时间点截图

### AC-8: 二次进入 TTI < 500ms（缓存命中）
- **Type**: `rubric`
- **Dimension**: 二次进入同一项目的可交互时间
- **Scale**: 1-5
- **Anchors**:
  - 1 = > 2000ms
  - 3 = 800ms 至 2000ms
  - 5 = < 500ms
- **Pass Threshold**: >= 4
- **Evidence**: `performance.mark`/`performance.measure` + Chrome Performance 面板录制

### AC-9: 可靠性架构专业度
- **Type**: `rubric`
- **Dimension**: 可靠性工程完整度（超时分级/重试/熔断/降级/缓存/指标/清理七要素）
- **Scale**: 1-5
- **Anchors**:
  - 1 = 只具备超时，无其它机制
  - 3 = 具备超时+重试+缓存三要素，缺熔断或指标或清理任一
  - 5 = 七要素齐全，每要素均有独立抽象和单测/断言
- **Pass Threshold**: >= 4
- **Evidence**: 代码评审：检查 DisposerBag / CircuitBreaker / MetricsRecorder / 持久化缓存 LRU / Pipeline 抽象存在 + 断言

### AC-10: 代码可读性与类型安全
- **Type**: `rubric`
- **Dimension**: 新增代码类型严格度与可读性
- **Scale**: 1-5
- **Anchors**:
  - 1 = any 大量使用、文件 > 800 行、无注释
  - 3 = 基本类型正确、any ≤ 10 处、文件大小中等
  - 5 = 零 any（除外部库边界）、抽象正交、函数头注释齐备、单测覆盖
- **Pass Threshold**: >= 4
- **Evidence**: `vue-tsc --noEmit` 对涉及文件无错误；GetDiagnostics 零错误；`eslint` @typescript-eslint/no-explicit-any 告警数 ≤ 3/文件
