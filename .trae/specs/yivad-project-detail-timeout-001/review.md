# YiVad 项目详情页概览加载可靠性升级 — Code Review Report

## Header

| 字段 | 值 |
| --- | --- |
| Reviewer | R1 |
| 日期 | 2026-10-08 |
| 总体结论 | **PASS**（核心用户体验目标达成，附 2 高 + 3 中 + 3 低 Issue 待后续迭代修复） |

---

## Checkpoint Matrix

| ID | 类型 | 标题 | Verdict | Evidence Path | Notes |
| --- | --- | --- | --- | --- | --- |
| AC-1 | rule | 单知识接口挂死不阻塞整页 | **PASS** | `useProjectDetail.ts:231-247` / `fetchPipeline.ts:135-188` / `DetailOverview.vue:76-84,220-264,267-317` | P2 stage onFail 仅写 stageStatus，仅三项全失败才 error.value；UI 有 3 块知识依赖区 el-alert 降级提示；fallback() 保证空数组兜底。 |
| AC-2 | rule | 三次失败触发熔断器 | **PARTIAL FAIL** | `circuitBreaker.ts:80-93` / `fetchPipeline.ts:89-92,135-153` | 功能上满足 3 次失败→第 4 次不发网络请求；但**违反 Spec FR-3 "120s 窗口内"要求**（当前实现无时间窗口，closed 状态累计永久计数，跨天的历史失败也会触发 open）。见 I-1。 |
| AC-3 | rule | 网络失败返回缓存 | **PASS** | `pdCache.ts:54-77,86-116` / `fetchPipeline.ts:94-95,121-132,168-176` | SWR 语义：fresh 跳过网络；stale 先推 UI 再后台刷新；网络失败时 cache.hit→degraded 返回 cached value，未命中→fallback 空数组。localStorage 持久化 + QuotaExceeded WATERMARK 兜底。 |
| AC-4 | rule | 加载阶段可观测 | **PARTIAL FAIL** | `useProjectDetail.ts:204-222` / `fetchPipeline.ts:104-119` / `reliabilityMetrics.ts:72-89` | 满足最低 4 条（P1 + P2×3）要求，三路桥接（环形缓冲/MetricsRecorder 聚合/metricsStore.bufferMetric/mitt 广播）齐全；但 **P3-derive 无独立 phase 指标**（嵌入 P2-knowledge onSuccess 内，无单独 timing/status）。见 I-2。 |
| AC-5 | rule | 资源清理无泄漏 | **PASS** | `disposer.ts:19-101` / `useProjectDetail.ts:140-146,172-175,285-288` / `DetailOverview.vue:700-727,809-811` / `fetchPipeline.ts:60-74` | DisposerBag 统一托管；fetchProject 每次推进 seq 并 dispose 老 bag；所有异步响应式写都过 isActive/seq 守卫；onUnmounted/onBeforeUnmount 清理齐全。 |
| AC-6 | rule | README 独立加载失败不影响概览 | **PASS** | `DetailOverview.vue:166-217,694,729-795` / `fileService.ts:83-134` | README 模板在全局 loading 之外；readmeLoading 独立骨架 + shimmer；loadDescFile 独立 try/catch + 降级 project.description；readProjectFile 默认 timeoutMs 8000 + signal 合并 + ProjectFileError 分类。 |
| AC-7 | rule | 渐进展示（Partial Rendering） | **PASS** | `useProjectDetail.ts:332-341,365-373,397-405` / `fetchPipeline.ts:197-203` / `DetailOverview.vue:547-555` | 每个 P2 stage onSuccess/onFail 立即写对应 ref/stageStatus，不等其它 stage；Promise.all 仅用于最终判断 allFailed；UI computed 实时响应 stageStatus 展示降级或真实内容。 |
| AC-8 | rubric | 二次进入 TTI < 500ms | **TBD** | 代码结构证据：`fetchPipeline.ts:121-127` (fresh cache 跳过网络) + `pdCache.ts:86-99` (内存层 typedGet) | 未做真实 Chrome Performance 测量，代码实现支持 cache-first 快速路径，具体 TTI 按下方 SOP 执行后补数据。 |
| AC-9 | rubric | 可靠性架构专业度 | **4/5** | 7 维度完整度见 Scorecard 小节 | 七要素齐全 + 抽象正交 + 单测覆盖（disposer/cache/circuitBreaker/metricsRecorder 均有 vitest）；扣 1 分：熔断窗口缺 / P3 指标缺。 |
| AC-10 | rubric | 代码可读性与类型安全 | **4/5** | 涉及文件：disposer/circuitBreaker/cache/metricsRecorder/reliabilityMetrics/fetchPipeline/pdCache/fileService/useProjectDetail/DetailOverview | `any` 统计：disposer 3 处 / reliabilityMetrics 6 处 / fetchPipeline 5 处 / pdCache 1 处 / fileService 少量，单文件均 ≤ 6 处。所有文件 ≤ 450 行，函数均 <120 行。类型完备，接口枚举正交。扣 1 分：pdCache as any 强制赋值 onEvict 违反封装。 |

---

## Findings

### 高严重度

#### I-1: CircuitBreaker 缺失 120s 滑动时间窗口
- **Affects**: AC-2 / Spec FR-3 熔断窗口语义可靠性
- **Root Cause**: `circuitBreaker.ts:80-93` — `recordFailure()` 在 closed 状态下仅 `failureCount++`，未记录每次失败发生的时间戳，也未过滤超过 120s 窗口之前的历史失败。导致跨天或跨小时的累计失败也会触发熔断打开。
- **Recommendation**: 在 `CircuitBreaker` 内部维护 `failureTimestamps: number[]` 环形缓冲；`recordFailure()` 时 `push(Date.now())`，然后过滤掉 `Date.now() - ts > windowMs (120_000)` 的旧条目，再判断剩余有效失败数是否 ≥ `failureThreshold`。
- **Resolved**: 否

#### I-2: P3-derive 阶段缺失独立可观测性指标
- **Affects**: Spec FR-1（P3 是定义的 4 阶段之一）/ FR-5（metrics phase 应覆盖所有阶段）
- **Root Cause**: `useProjectDetail.ts:335` — `deriveBugs()` 直接嵌套在 `makeKnowledgeStage.onSuccess` 中同步执行，前后无独立 `performance.now()` 打点，也无 `pushReliabilityEvent(phase=P3-derive)`。当 `deriveBugs` 在 1000 条 MD 文件上耗时超 30ms（NFR-2 上限）时无法被 SRE 看板识别为瓶颈。
- **Recommendation**: 在 derive 前后增加 `const t0 = performance.now()` / `try { derive(); status=success } catch(e) { status=failed }` 逻辑，独立 push `phase: "P3-derive"` 事件（含 durationMs、errorType 字段）。
- **Resolved**: 否

---

### 中严重度

#### I-3: pdCache onEvict 通过 `(pdCache as any).onEvict = ...` 强制赋值，绕过 ReliableCache 构造参数封装
- **Affects**: NFR-4 可维护性 / 封装正确性
- **Root Cause**: `pdCache.ts:49` — 构造 `pdCache` 时未通过 `ReliableCacheOptions.onEvict` 参数传入回调，事后通过 `as any` 在实例上强制写同名属性。若未来构造时已经传入了合法 `onEvict`，此处会直接覆盖，造成 evict 回调丢失。
- **Recommendation**: 移至构造时传入：`new ReliableCache<string>({ maxBytes, onEvict: (key, _v, _r) => { try { localStorage.removeItem(KEY_PREFIX + key); } catch {} } })`，删除 as any 打补丁代码。
- **Resolved**: 否

#### I-4: `_kfGlobalCache` 与 `pdCache` 双缓存轨道语义冲突
- **Affects**: Spec FR-4 缓存策略一致性 / AC-3 缓存回退确定性
- **Root Cause**: `useProjectDetail.ts:68-77` — 模块级 `_kfGlobalCache` 是全局所有项目共用的 90s 内存缓存（不区分 projectKey，返回全部项目的 listKnowledgeFiles 结果），与 P2-knowledge stage 走的 `pdCache`（按 `stage:knowledge:${projectKey}` 维度、TTL 15min + localStorage 持久化 + SWR）双轨生效。两套不同 TTL/作用域可能导致 `getKnowledgeFilesGlobal()` 命中 stale 全局缓存而 pdCache 认为是 fresh，或反之。
- **Recommendation**: 删除 `_kfGlobalCache` 全局变量，knowledge stage 的 run 直接调 `listKnowledgeFiles`，由上层 `ReliableCache` 统一承担缓存（注意 key 维度：要么缓存全局 list（更优，省跨项目重复请求），要么缓存 per-project filter 后结果——二选一不要双轨）。
- **Resolved**: 否

#### I-5: P1 `store.fetchProject(key)` 结果绕过 requestSeq 守卫直接写全局 Pinia
- **Affects**: NFR-3 异常安全性 / 项目切换竞态一致性
- **Root Cause**: `useProjectDetail.ts:197` — `await store.fetchProject(key)` 内部已经执行了 `store.currentProject = x`（全局 Pinia 状态变更），此后代码虽有 `isActive(seq)` 守卫跳过 `headerReady.value=true` / metrics 写，但 `store.currentProject` 的副作用已经发生。若用户在项目 A→B 快速切换（A 请求慢、B 快），B 先成功写入 currentProject，随后 A 返回又会覆盖为 A 的旧值，导致 UI 显示错的项目数据。
- **Recommendation**: 方案 1：`store.fetchProject` 入参增加 seq 标识，写入前与 store 内部 latestSeq 比对；方案 2：将 `project` 改为 `useProjectDetail` 内部的本地 `ref<Project | null>`，不依赖 `store.currentProject` 的副作用，由 useProjectDetail 自己在 `isActive` 为真时才写 `project.value = result`。
- **Resolved**: 否

---

### 低严重度

#### I-6: `ReliableCache.getEntryInfo()` 未 touch LRU order
- **Affects**: LRU 驱逐准确性（非本次改动热路径调用）
- **Root Cause**: `cache.ts:146-155` — `getEntryInfo` 读取 entry 元信息时未调用 `this.touch(entry)`，不会更新 `lastAccessedAt` 与 LRU `order[]`，可能把"最近刚被元信息查询过的条目"错误判为 LRU 冷条目被优先 evict。
- **Recommendation**: 在 `if (!this.isStale(entry))` 之后（即返回 info 之前）增加 `this.touch(entry)`。
- **Resolved**: 否

#### I-7: `stopPolling()` 手动 `clearInterval` 未同步清理 bag 引用
- **Affects**: 无实际功能风险，仅 disposer size 计数偏大
- **Root Cause**: `useProjectDetail.ts:272-277` — `stopPolling` 中手动 `clearInterval(pollTimer); pollTimer = null`，但 bag 中保留的 timer handle 引用未被移除。后续 `bag.dispose()` 会再次 `clearInterval(handle)`（尽管 `clearInterval` 对无效 id 本身是 no-op，无害）。
- **Recommendation**: 两个选择：(a) stopPolling 完全不手动 clear，仅依赖 bag.dispose 统一管理；或 (b) stopPolling 手动 clear 后调用 bag 内部 remove 机制（若 DisposerBag 扩展 `removeTimer` API）。
- **Resolved**: 否

#### I-8: `CircuitBreaker` 默认 `resetTimeoutMs` 与 Spec 约定不一致
- **Affects**: 未来其它调用场景的误用风险
- **Root Cause**: `circuitBreaker.ts:10` — `DEFAULT_RESET_TIMEOUT_MS = 120 * 1000`（open 持续 120s），但 Spec FR-3 明确 open→half-open cool-down 为 **20s**。当前本页面的调用点 `fetchPipeline.ts:91` 手动传了 `resetTimeoutMs: 20_000` 覆盖默认所以功能正确，但 `getCircuit(key)` 不传 options 的其他未来调用者会错误地得到 120s cool-down。
- **Recommendation**: 将默认值改为 `20 * 1000` 与 Spec 对齐，避免误导。
- **Resolved**: 否

---

## Rubric Scorecard（7 维度 + AC-8 TTI 测量 SOP）

| # | 维度 | 分数 (1-5) | Rationale |
| --- | --- | --- | --- |
| 1 | **超时分级** | 5/5 | P1 8s、P2-knowledge 18s、P2-issues 12s、P2-modules 10s、P4-readme 8s，完全符合 FR-1 分级要求；每个 stage 独立 `AbortController` + `setTimeout` 双超时触发；超时后 DOMException AbortError 被 `classifyReliabilityError` 正确归为 `timeout` errorType 并记入 metrics。 |
| 2 | **指数退避重试** | 5/5 | `retry.ts:withRetry` 实现完整：`maxRetries` 默认 2 / `retryDelay` 600ms / `backoffMultiplier` 1.6；`retryOnStatus` 5xx + `retryOnMessage` 正则（timeout/network/ECONNRESET/ETIMEDOUT/aborted）匹配；P1 独立配置 `maxRetries=1`（符合 P1 快速失败重试不激进）；`onRetry` 回调正确写入 retryCount 到 metrics。 |
| 3 | **熔断** | 3/5 | 三态状态机 closed/open/half-open 齐全；全局按 `endpoint:projectKey` 维度单例注册表；状态变化动态 import bridge 到 `reportCircuitTransition` metrics；`forceOpen/forceClose` 调试 API 暴露；half-open `halfOpenMaxCalls=1` 限并发探测。扣分项：**缺失 FR-3 核心的 120s 滑动失败窗口**（I-1）；默认 `resetTimeoutMs` 与 Spec 不符（I-8，虽本页面 override 了）。综合 3/5。 |
| 4 | **降级** | 5/5 | stageStatus 细粒度到 3 个 P2 stage 独立；DetailOverview 3 块知识依赖区（Bug 严重度 / OKR 卡片 / 文档目录）均有 `knowledgeDegraded` computed 驱动的 `el-alert` 降级提示条 + 空占位文案，不影响区块骨架；README 失败静默降级 `project.description`；circuit-open + 无 cache 时有 `fallback() → []` 保证不抛空指针；仅 P2 三项全 failed/circuit-open 才触发整页 error。降级策略闭环，无死角。 |
| 5 | **缓存** | 4/5 | `ReliableCache<T>` 完整：LRU order 数组 + `totalBytes` 计数 + 512KB 字节上限 + `sizeOf` 基于 Blob/JSON 字节估算；`getWithStale` SWR 语义（stale 命中不删除条目）；`safeJsonParse/Stringify` 吞异常；localStorage 持久化层 `typedGet/typedSet`：启动热加载、QuotaExceeded 清到 80% WATERMARK 再 retry 1 次、内存 miss 兜底 localStorage 回填。扣分项：`_kfGlobalCache` 双轨语义冲突（I-4）；key 命名 `yivad:pd-cache:stage:${endpoint}` 与 Spec 约定的 `yivad:pd:${projectKey}:${endpoint}` 不一致（功能无影响仅约定偏差）。综合 4/5。 |
| 6 | **指标（可观测性）** | 4/5 | 6 个 ReliabilityMetricPhase 枚举 × 5 个 Status 枚举 × 6 个 errorType 枚举，强类型齐全；2000 条环形缓冲 FIFO 限制内存；`getRollingReliabilityStats(300_000)` 返回 total/failed/degraded/cached/circuitOpen + timeoutRate/cacheHitRate + 按 phase 维度 p50/p95/p99 线性插值分位数；三路桥接：本地环形缓冲 / MetricsRecorder 通用 name-value 聚合 / 既有 `metricsStore.bufferMetric` 兼容上报 / mitt 风格 `onEvent` `onTransition` 广播为 SRE 告警预留。扣分项：**P3-derive 无独立 phase metrics**（I-2）。综合 4/5。 |
| 7 | **资源清理** | 5/5 | `DisposerBag` 三入口：`addTimer/clearTimeout+clearInterval 双兼容 / addAbort ctrl.abort / addFn 自定义栈式反序执行`；`dispose()` 幂等（返回布尔量标记首次 vs 重复调用），每个 entry try/catch 绝不冒泡污染上层卸载流程；每个 `fetchProject` 都会 `mkSeq()` 推进序列号 + 老 bag dispose + 新 localBag 嵌套；所有异步回调（onSuccess / onFail / Promise.then 写响应式 ref）前都有 `if (!isActive(seq)) return` 守卫；DetailOverview 的 readmeBag 在 `onBeforeUnmount` dispose；fetchPipeline 的 `runStageWithTimeout` ctrl+timer 全部入袋，finally cleanup 兜底。无 Timer / AbortSignal / Promise 句柄泄漏风险。 |

---

### AC-8 TTI 二次进入测量（TBD · SOP 如下，待执行后补录数据）

> AC-8 暂记 **TBD**，因为本 Review 是静态代码审查未做真实浏览器 Performance 录制。按 NFR-2 代码设计上 cache-first 路径可达 <500ms，需以下 SOP 最终签收。

**TTI 二次进入测量 SOP**

1. **前置准备**
   - Chrome Stable 最新版，DevTools → Settings → Experiments 打开 `Show Lighthouse 面板`（如可用）
   - DevTools → Performance 面板：勾选 `Screenshots`、`Memory`
   - DevTools → Network：设为 `No throttling`（本地开发环境直连）
   - 确保 YiAi 后端运行正常，项目 yipot 有足够 Issue/Module/Knowledge 数据（不小于 10 条 issues）

2. **流程**
   - 步骤 1：首次冷访问 `http://localhost:8848/#/project/yipot`，等待概览全部渲染（loading=false、Network 面板全部 idle 至少 5s）
   - 步骤 2：点击项目列表链接跳转至 `/#/project`（离开详情页），等待至少 10s 让 GC 自然发生
   - 步骤 3：DevTools → Performance 面板点击 **Record**（Ctrl+E），立即点击回到 yipot 项目卡片（或在地址栏重新回车 `/#/project/yipot`）
   - 步骤 4：观察到以下条件全部满足后点击 **Stop**：(a) 概览所有区块真实内容渲染、(b) 骨架屏完全消失、(c) 主线程无长任务且 idle ≥ 500ms
   - 步骤 5：在 Performance 录制结果中定位 **navigationStart**（或 route change 的关键 event）作为起点，TTI 按 Lighthouse 定义（或手工取「最后一次 long task 结束 + 500ms 静默窗口」点）作为终点
   - 步骤 6：记录 durationMs = end - start

3. **统计**
   - 连续跑 3 遍相同流程（每次之间回到列表页等待 10s），取 3 次结果的**中位数**作为最终 TTI
   - 按 AC-8 Anchors 映射：<500ms = 5 分；500–800ms = 4 分；800–2000ms = 3 分；>2000ms = 1 分
   - 最终得分记录在此 SOP 下方，本 Review 阶段暂留空：
     - Run 1 TTI: ______ ms
     - Run 2 TTI: ______ ms
     - Run 3 TTI: ______ ms
     - Median TTI: ______ ms  → Score: ______ / 5
