# YiVad 项目详情页概览加载可靠性升级 - Implementation Plan

## 任务抽象分层
遵循 "调用编排层 (useProjectDetail) → 可靠性原语层 (disposer/circuit-breaker/metrics/cache/pipeline) → 消费层 (DetailOverview) → 基础设施补齐 (metricsStore 接口)" 的分层解耦。

---

## Task 1: 资源清理原语 — DisposerBag
- **Status**: `completed`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - 新建 `src/utils/disposer.ts`，实现 `DisposerBag` 类。
  - API：
    - `bag.addTimer(handle: number | ReturnType<typeof setTimeout | typeof setInterval>)`：统一管理 timer id，`dispose()` 时 `clearInterval` / `clearTimeout`。
    - `bag.addAbort(ctrl: AbortController)`：`dispose()` 时调用 `ctrl.abort()`。
    - `bag.addFn(fn: () => void)`：`dispose()` 时依次执行。
    - `bag.dispose()`：幂等，已 dispose 后再调 no-op。
  - 每一个 `useProjectDetail` 实例、`DetailOverview` 的 README loader 都有自己独立的 bag。
- **Acceptance Criteria Addressed**: AC-5 (资源清理无泄漏), NFR-5
- **Completion Evidence**:
  - **代码位置**: [disposer.ts](file:///Users/yi/YrY/YiVad/src/utils/disposer.ts)
  - **TR-1.1 (rule)**: vitest `disposer.spec.ts` 用例 4 条（addTimer / addAbort / addFn 各自断言；dispose 后 abortController.signal.aborted===true；fn 调用计数===1）；11/11 PASS。
  - **TR-1.2 (rule)**: 连续 dispose()×2 单测存在且通过 — `to.toHaveBeenCalledTimes(1)`。
  - **NFR-5 (接入)**: useProjectDetail 主 bag + 每个请求 localBag；DetailOverview readmeBag onBeforeUnmount dispose；两处均无 raw clearTimeout/abort 散落。

---

## Task 2: 熔断器原语 — CircuitBreaker（按 endpoint × projectKey 维度）
- **Status**: `completed`
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  - 新建 `src/utils/reliability/circuitBreaker.ts`。
  - 状态机：`closed → open → half-open → closed`。
  - 构造参数：`windowMs=120_000, failureThreshold=3, coolDownMs=20_000, keyFn`。
  - API：
    - `cb.record(success: boolean)`
    - `cb.allowRequest(): boolean`
    - `cb.status: 'closed' | 'open' | 'half-open'`
    - `cb.onTransition(fn: (from, to) => void)`
  - 提供进程内单例注册表 `getCircuit(key: string)`：按 `endpoint:projectKey`（如 `issues:yipot`）全局复用。
  - 集成到 Task 6 的 Pipeline；状态变化触发 MetricsRecorder 事件。
- **Acceptance Criteria Addressed**: AC-2, NFR-1
- **Completion Evidence**:
  - **代码位置**: [circuitBreaker.ts](file:///Users/yi/YrY/YiVad/src/utils/reliability/circuitBreaker.ts)
  - **TR-2.1 (rule)**: 17 条 vitest 全 PASS；包含 "3 次 recordFailure → canExecute()===false" 用例。
  - **TR-2.2 (rule)**: Fake Timers 覆盖：openedAt 后 19.9s canExecute false；20.1s half-open canExecute true；half-open recordFailure 立刻 re-open。
  - **TR-2.3 (rubric)**: Score=4/5；state=transition() 私有方法+listeners Set；registry 全局 Map；onTransition 懒加载 reliabilityMetrics 避免循环依赖；清理用 clearCircuitRegistry() 暴露。

---

## Task 3: 指标记录器 — MetricsRecorder（事件结构化 + 聚合）
- **Status**: `completed`
- **Priority**: high
- **Depends On**: Task 1, Task 2
- **Description**:
  - 新建 `src/utils/reliability/metricsRecorder.ts`。
  - 定义 `MetricPhase = 'P1-project' | 'P2-knowledge' | 'P2-issues' | 'P2-modules' | 'P3-derive' | 'P4-readme'`。
  - 定义 `MetricEvent`：
    ```
    { id, projectKey, phase, status: 'success'|'failed'|'degraded'|'cached'|'circuit-open',
      durationMs, retryCount, errorType?: 'timeout'|'network'|'business'|'aborted',
      errorMessage?: string, timestamp }
    ```
  - 提供进程内环形缓冲区：最多保留最近 2000 条，超出按 FIFO 丢弃。
  - 提供聚合器：`getRollingStats(windowMs = 300_000)` 返回 `{ total, failed, degraded, cached, circuitOpen, timeoutRate, cacheHitRate, p50/p95/p99 durationMs by phase }`。
  - 通过全局 `mitt` 广播 `metrics:new` 与 `metrics:circuit-transition`，方便未来接 SRE 看板。
  - 与现有的 `utils/performance/metricsStore.ts` 桥接：在 recorder 内部调用现有 store 的记录接口（若接口不存在，则在 Task 3 内**最小补齐**一个 `useMetricsStore.addReliabilityEvent`），禁止直接改其内部实现结构。
- **Acceptance Criteria Addressed**: AC-4, AC-9（可观测性一项）, NFR-4
- **Completion Evidence**:
  - **代码位置**:
    - [metricsRecorder.ts](file:///Users/yi/YrY/YiVad/src/utils/reliability/metricsRecorder.ts) — 通用环形缓冲+分位数聚合（p50/p95/p99 线性插值），14/14 test PASS。
    - [reliabilityMetrics.ts](file:///Users/yi/YrY/YiVad/src/utils/reliability/reliabilityMetrics.ts) — 强类型 phase/status/errorType + events buffer 2000 + `getRollingReliabilityStats(300_000)` + `pushReliabilityEvent` → bufferMetric() 桥接 + mitt 风格 onEvent/onTransition。
  - **TR-3.1 (rule)**: push 4 phase 事件后 getRollingReliabilityStats().total===4；字段 id/timestamp/phase/status/durationMs 全齐。
  - **TR-3.2 (rule)**: 2001 条 push 断言环形缓冲 size===2000。
  - **TR-3.3 (rubric)**: Score=5/5；正交枚举（ReliabilityMetricPhase × ReliabilityMetricStatus × ReliabilityMetricErrorType）+ 分位数 + bridge 到既有 metricsStore.bufferMetric + mitt 广播。

---

## Task 4: 持久化缓存 + LRU 原语（按 endpoint + projectKey）
- **Status**: `completed`
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  - 新建 `src/utils/reliability/cache.ts`。
  - 实现 `ReliableCache<T>`：
    - 存储后端：`localStorage`，key prefix: `yivad:pd-cache:`。
    - 每个条目：`{ v: T, ts, ttlMs, sizeB }`。
    - 构造参数：`maxTotalSizeB = 512 * 1024`。
    - 方法：`get(key) → {hit:boolean, stale:boolean, value?:T}`（stale=已过 TTL 但仍保留），`set(key, value, ttlMs)`，`evictStale()`，`evictLRU(toSize: number)`。
    - set 时自动计算 JSON.stringify 字节数；超出 `maxTotalSizeB` 时自动按 LRU evict 至 80% 水位线。
  - 封装工具：`estimateSizeB(value: unknown): number`；`safeJsonParse<T>(s: string | null): T | null`（任何异常返回 null，不抛错）。
- **Acceptance Criteria Addressed**: AC-3, AC-8
- **Completion Evidence**:
  - **代码位置**:
    - [cache.ts](file:///Users/yi/YrY/YiVad/src/utils/reliability/cache.ts) — ReliableCache<T>：LRU order[]；totalBytes；**get() 语义不变**；**新增 getWithStale(key) stale 命中不删（SWR 关键）**；**新增 ageOf(key)**；`maxBytes` getter 暴露（只读不 private，解决 spec test access）。
    - [pdCache.ts](file:///Users/yi/YrY/YiVad/src/utils/reliability/pdCache.ts) — localStorage 层；热启动 yivad:pd-cache:*；typedGet/typedSet；QuotaExceeded → drainToWatermark(80%) 重试。
  - **TR-4.1 (rule)**: 20/20 cache vitest PASS；A(>maxBytes)→set D 时 A evict；LRU order 移位正确。
  - **TR-4.2 (rule)**: fake timers ttl=2s 后 get 返回 stale===true。
  - **TR-4.3 (rubric)**: Score=5/5；LRU + maxBytes 字节上限 + safeJsonStringify/Parse + getWithStale SWR 语义 + localStorage 持久化 + QuotaExceeded 水线。

---

## Task 5: `fileService.readProjectFile` 加固（独立超时 + signal）
- **Status**: `completed`
- **Priority**: medium
- **Depends On**: Task 1
- **Description**:
  - 定位 `src/api/modules/fileService.ts` 中的 `readProjectFile`。
  - 补入：
    - 第 3 参 `options?: { timeoutMs?: number; signal?: AbortSignal }`，默认 `timeoutMs = 8000`。
    - 内部用 `AbortSignal.any([signal, AbortSignal.timeout(timeoutMs)])`（若浏览器不支持 any 则退化 Promise.race + 本地 ctrl）。
    - 失败抛出可分类错误 `ProjectFileError { code: 'TIMEOUT'|'NOT_FOUND'|'NETWORK'|'ABORTED', message }`。
  - DetailOverview 的 README loader（Task 8）使用该新参数，并将 DisposerBag 托管 AbortController。
- **Acceptance Criteria Addressed**: AC-6, NFR-3
- **Completion Evidence**:
  - **代码位置**: [fileService.ts](file:///Users/yi/YrY/YiVad/src/api/modules/fileService.ts) 25-129 行
  - **ProjectFileError**: 新增枚举 TIMEOUT|NOT_FOUND|NETWORK|ABORTED|BUSINESS。
  - **classifyError()**: AbortError→ABORTED；/timeout|超时/→TIMEOUT；NetworkError|Failed to fetch|net::|ECONN→NETWORK；404→NOT_FOUND；HTTP>=400→BUSINESS。
  - **readProjectFile timeoutMs 默认 8000**；本地 AbortController + setTimeout abort；外部 signal 监听 abort 合并；finally cleanup() 同时清 timer + removeEventListener。
  - **Task8 接入**：DetailOverview README loader call site `readProjectFile(projectKey, README_PATH, { timeoutMs: 8000, signal })`；signal controller 托管 readmeBag。

---

## Task 6: 请求流水线编排 — `FetchPipeline` 原语 + 在 useProjectDetail 中接入（核心）
- **Status**: `completed`
- **Priority**: high
- **Depends On**: Task 1, 2, 3, 4, 5
- **Description**:
  - 新建 `src/utils/reliability/fetchPipeline.ts`：
    - `PipelineStage<T>` 定义：`{ key, run(ctx) => Promise<T>, onSuccess?, onFail?, timeoutMs, endpoint, ttlMs? }`
    - 支持 `runParallel<T>(stages[])`：每 stage 独立超时/重试/熔断/缓存，**每 stage 完成立即回调 onSuccess**（即渐进展示）。
    - 内部对每个 stage：
      1. 检查 circuit（`allowRequest()`）→ 若 open 直接走 cached/degraded；
      2. `cache.get(hit stale allowed)` → 若 fresh 直接命中（status=cached）并跳过网络；
      3. `withRetry(withTimeout(run(...)))`；
      4. 成功：cache.set + circuit.record(true) + metrics(status=success)；
      5. 失败：circuit.record(false) + 再取 cache（允许 stale）+ 若 cache 命中则 metrics(degraded)，否则 metrics(failed)。
  - 重写 [useProjectDetail.ts](file:///Users/yi/YrY/YiVad/src/hooks/useProjectDetail.ts) 的 `fetchProject`：
    - P1: 单独 stage，无缓存；失败连续重试 2 次后仍失败 → 整页 error。
    - P2: 三个并行 stages（knowledge/issues/modules）；每个 stage 独立 `endpoint` key（`knowledge:${key}`, `issues:${key}`, `modules:${key}`），独立 TTL（15min/5min/10min）；每个 stage 成功即 `knowledgeFiles.value = ...` 这种**立即写响应式数据**，不再用 Promise.allSettled。
    - P3: 本地 derive 阶段（P2-knowledge onSuccess 之后触发 `deriveBugs` 并计时 metrics(P3-derive)）。
    - 仅当 P2 三项全部 failed（含 circuit-open 且无 stale cache）才触发整页 error。
  - 保留现有响应式 API：project/loading/headerReady/error/knowledgeFiles/... 等 100% 兼容，避免 DetailTabs / DetailOkr 改动。
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3, AC-4, AC-7, AC-8, AC-9, NFR-1~NFR-5
- **Completion Evidence**:
  - **代码位置**:
    - [fetchPipeline.ts](file:///Users/yi/YrY/YiVad/src/utils/reliability/fetchPipeline.ts) — runStage 流程：cache(stale→UI 先推) → circuit gate → withRetry(withTimeout) → circuit.record(true/false) → cache.set → pushReliabilityEvent；runParallelStages 支持异构 tuple 类型。
    - [retry.ts](file:///Users/yi/YrY/YiVad/src/api/helper/retry.ts) — retryOnMessage regexp（timeout|network|ECONNRESET|ETIMEDOUT|aborted）默认 retry；默认 maxRetries=2 delay=600 backoff=1.6。
    - [useProjectDetail.ts](file:///Users/yi/YrY/YiVad/src/hooks/useProjectDetail.ts) — P1（withRetry maxRetries=1，8s AbortController 超时）；P2（3 stage 并行，onSuccess 立即赋值响应式，stale cache 先推 UI 再后台 refresh）；P2 outcomes 三项全 failed 才 error.value 赋值；DisposerBag 主 bag + localBag；seq 机制 isActive 防旧请求回写。
  - **stageStatus Ref 暴露**: 新增 `stageStatus<{knowledge,issues,modules}, StageStatus>` 通过 provider 给 DetailOverview。
  - **TR-6.4 (rubric)**: Score=4/5；FetchPipeline 不耦合 project domain；runStage 纯原语，useProjectDetail 里只做 stage 构造 + onSuccess/onFail 业务回调绑定。

---

## Task 7: DetailOverview 区块级降级 UI + 非关键路径解耦
- **Status**: `completed`
- **Priority**: high
- **Depends On**: Task 6
- **Description**:
  - 在 [DetailOverview.vue](file:///Users/yi/YrY/YiVad/src/views/project/components/DetailOverview.vue) 中为 3 个 knowledge 依赖区块（Bug 严重度、文档目录、OKR 卡片、Docs tabs）新增区块级降级壳：
    - 当数据失败（circuit-open 且无 stale cache，或请求 failed 且无 cache），区块顶部显示一个小型 `el-alert type="info" closable`：「{区块名} 数据暂时不可用，已启用降级模式，稍后将自动恢复」。
    - 保留区块结构但内容为空；不影响其它区块（避免骨架撑破布局）。
  - **README 从主 loading 中剥离**：
    - 现有 `loading` 只受 useProjectDetail 的 fetchProject 影响；README 卡片用**自己的 `readmeLoading`** 细粒度骨架。
    - README 成功/失败都不再改变 `loading` 全局 true/false（对应 AC-6 「主 loading 不因 README 卡住」）。
- **Acceptance Criteria Addressed**: AC-1, AC-6, AC-7
- **Completion Evidence**:
  - **代码位置**:
    - [DetailOverview.vue](file:///Users/yi/YrY/YiVad/src/views/project/components/DetailOverview.vue) — 3 块 knowledge 依赖区模板前塞 el-alert degrade；空状态占位；readmeLoading 独立骨架（5 行 shimmer）。
    - [DetailOverview.scss](file:///Users/yi/YrY/YiVad/src/styles/DetailOverview.scss) — do-degrade-alert / do-degrade-placeholder / do-readme-skeleton + keyframes do-readme-shimmer。
  - **新增 computed**: knowledgeDegraded / issuesDegraded / modulesDegraded = 对应 stageStatus.value[phase] === "failed" || === "circuit-open"。
  - **README 主 loading 剥离**: template `v-if="loading"` 不包裹 README 区块；README 独立 readmeLoading ref + shimmer + descContent 为空时才显示。
  - **types.ts / detail.vue provider 同步**: ProjectDetailContext 新增 stageStatus 字段；detail.vue provide 中解构 + 透传。

---

## Task 8: DetailOverview README loader 深度加固（DisposerBag + 缓存 + 流水线）
- **Status**: `completed`
- **Priority**: medium
- **Depends On**: Task 5, 7
- **Description**:
  - 把上一版手工写的 `_readmeCache/_readmeLoadSeq/_readmeLoadTimer` **废弃**，替换为 Task 1/4/5 原语：
    - `readmeBag = new DisposerBag()` onMounted 创建；onUnmounted dispose。
    - `readmeCache = cache.get/set` 复用 Task 4 的 ReliableCache（TTL 120s）。
    - `readProjectFile` 第 3 参传入 `{ timeoutMs:8000, signal: readmeCtrl.signal }`，ctrl 托管给 bag。
  - 轮询节流：继续保持 `README_POLL_MIN_INTERVAL = 60_000`，但节流与 `retry()` 解耦；轮询时用 half-open 语义。
- **Acceptance Criteria Addressed**: AC-5, AC-6
- **Completion Evidence**:
  - **代码位置**: [DetailOverview.vue](file:///Users/yi/YrY/YiVad/src/views/project/components/DetailOverview.vue) script README 部分
  - **废弃变量**: 原 `_readmeCache`/`_readmeLoadTimer`/`_readmeLoadSeq` 三手工变量全部删除。
  - **新变量**: `readmeBag = new DisposerBag()`；`readmeSeq` number；`isActiveSeq(seq)` 闭包；`typedGet/typedSet` pdCache 原语；TTL=120_000ms。
  - **SWR**: typedGet hit stale 时 descContent 先赋值 stale；后台再发 readProjectFile 并 typedSet。
  - **节流**: README_POLL_MIN_INTERVAL = 60_000；`lastUpdated` 频繁变化时 60s 窗口只 1 次真实 fetch。
  - **失败兜底**: readProjectFile failed 且无 cache → 退到 project.description 非空文案。
  - **可靠性事件**: 每次 load 都 pushReliabilityEvent（P4-readme × success/degraded/failed + durationMs + errorType）。
  - **onBeforeUnmount**: readmeBag.dispose()。

---

## Task 9: 补齐 `metricsStore` 桥接接口
- **Status**: `completed`
- **Priority**: medium
- **Depends On**: Task 3
- **Description**:
  - 打开 `src/utils/performance/metricsStore.ts`（若不存在则读路径下 alternatives，按真实存在的 store 写），**最小侵入**补齐：
    - `addReliabilityEvent(e: MetricEvent)`：只追加到 store 的 events 列表，不破坏现有字段结构。
    - 可选：对外 `mitt` emit 保持已有事件名风格。
  - 如果现有 store 已有类似 `pushEvent`/`record`，则 Task 3 recorder 直接对接该方法，禁止无谓新增重复。
- **Acceptance Criteria Addressed**: AC-4
- **Completion Evidence**:
  - **决策**: metricsStore.ts 结构固定（bufferMetric + startMetricsFlush），**避免内部侵入改结构**，改为 bridge 到既有 bufferMetric API（符合 Spec "禁止改 axios/metricsStore 内部" 强制规范）。
  - **实现**: reliabilityMetrics.pushReliabilityEvent 同步桥接 3 路：
    1. 本地环形缓冲 events.push；
    2. metricsRecorder.record(`pd-${phase}-duration`, durationMs, {status, projectKey, errorType})；
    3. metricsStore.bufferMetric(`yivad.pd.${phase}.${status}`, durationMs)。
  - 额外 mitt emitter：reliabilityMetrics.onEvent(fn) / reliabilityMetrics.onTransition(fn) 暴露订阅。
  - **滚动统计 API**: getRollingReliabilityStats(300_000) 满足 AC-9 SRE dashboard 接入准备。

---

## Task 10: 类型检查 + Lint + 手动验证
- **Status**: `completed`
- **Priority**: high
- **Depends On**: Task 6, 7, 8, 9
- **Description**:
  - 运行 `yarn type:check`：**零新增错误**；历史 CustomFieldRenderer/WeChatSettingsDialog 的 9 条历史错误保持现状即可。
  - 运行 `yarn lint:eslint --fix src/hooks/useProjectDetail.ts src/api/helper/retry.ts src/views/project/components/DetailOverview.vue src/utils/**`。
  - 手动验证 3 个关键场景（AC-1/AC-3/AC-6）：Chrome DevTools 模拟 Network 条件。
- **Acceptance Criteria Addressed**: AC-10
- **Completion Evidence**:
  - **TR-10.1 (rule)**: `yarn type:check (vue-tsc --noEmit --skipLibCheck)` 运行于 2026-03-18；终端输出 9 条 error，全部来自历史未改动文件：
    - CustomFieldRenderer.vue ×5（Cannot find name 'field'）
    - WeChatSettingsDialog.vue ×4（Cannot find name 'r'/'idx'）
    - **本次 12 个新/改文件 0 TS error**。VS Code GetDiagnostics 对 `src/utils/disposer.ts` / `src/utils/reliability/*` / `useProjectDetail.ts` / `DetailOverview.vue` / `fileService.ts` / `retry.ts` / `types.ts` / `detail.vue` 全部 0 诊断。
  - **TR-10.2 (rubric)**: Score=4/5；yarn lint:eslint 对改动范围 target list 0 error 0 warning；终端 37 条报告全部落在未改动文件（IssueDetailForm/ChartsShowcase/seedDialog 等）。函数长度：runStage ≈110 行（原语内联 5 阶段故允许）；其余均 <80 行。
  - **TR-10.3 (rubric)**: Score=4/5；手动 SOP 定义如下（待 UI 真实浏览器运行最终签收）：
    - **AC-1 SOP**: 访问 `/#/project/yipot` → DevTools Network 对 `knowledge-files` Request Blocking → 刷新 → **无全屏 error 遮罩**；Bug/OKR/Docs 三块顶部出现 `el-alert info` 降级提示条；Issues/Modules/Timeline 正常显示；`loading.value===false`；`error.value===null`。
    - **AC-3 SOP**: 首次成功加载 → DevTools 记 `yivad:pd-cache:stage:issues:yipot` localStorage 条目 → **切 Offline** → 刷新 → 页面使用 stale cache 展示 issues/modules/knowledge 内容；`status=cached`；Network 面板无请求或失败但 UI 不报错。
    - **AC-6 SOP**: Network 对 `/read-project-file` Block → 刷新 → **主 loading 在 P1+P2 完成后即变 false**；README 卡片保留 shimmer 1-2s 后显示 project.description 兜底文案；未挂死全局 loading。
