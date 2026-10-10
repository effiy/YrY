# Bug 专业化 & 数据实时化 — 实现任务清单 (tasks.md)

> 生成日期：2026-10-10 · 基于 `spec.md` 的 AC 分解

---

## 原子任务总览

| # | 任务标题 | 优先级 | 关联 AC | 预计复杂度 | 依赖 |
|---|---|:---:|:---:|:---:|:---:|
| T1 | **Bug store & 类型升级**：BugDocument 加 `reopenCount`/`timeline`；store 统一成为唯一数据源（index.vue 的 allBugs ref 改为 bugStore.bugs computed） | HIGH | AC-R3, AC-R4, NFR-4.1, A2 | 🔴 高 | 无 |
| T2 | **SRE 计算引擎**：抽 `src/utils/reliability/sloMetrics.ts`，支持滑动窗口、线性插值 p95、TTD 估算、SLA 多状态判断、Reopen 计数 | HIGH | AC-R1, AC-R2, AC-R3, NFR-2.1, NFR-2.2 | 🔴 高 | T1 |
| T3 | **实时驱动层**：列表页引入 `useTimestamp(60s)`、`useDataFreshness`、`useLiveMetrics` + 60s 轮询 + visibility 暂停；Live badge 组件 | HIGH | AC-R5, AC-R6, NFR-5.1, NFR-5.2 | 🟠 中 | T1 |
| T4 | **滑动窗口切换 + URL 持久化**：SLO 灯带上方 5 档 toggle，写入/读取 `?window=` query，所有 SLO computed 依赖 window | HIGH | AC-R2, AC-U1, NFR-1.2 | 🟠 中 | T2 |
| T5 | **列表页 UI 升级**：SLO 指标可点击下钻；Risk Matrix 16 格 click → set(Severity,Priority)；OKR 四卡 click 联动；Reopen ×N pill；CSV 末尾加三列 | HIGH | AC-U4, AC-R7, AC-U1, ADR-C4 | 🟡 中高 | T2, T4 |
| T6 | **Analytics 升级**：MTTR Trend 下方叠加 ControlChart；UCL 异常点生成 Actionable Alerts Strip（可点击筛选该日） | MEDIUM | FR-C, AC-U4 | 🟡 中 | T2 |
| T7 | **详情页升级**：SLA 倒计时第 5 宫格；5-Why 自动绑定 stepsToReproduce；STRIDE 默认勾选策略；Rollback RTO 进度条；Audit timeline 优先字段；Traceability 闭环 | HIGH | FR-F, AC-U3, AC-R4 | 🔴 高 | T1 |
| T8 | **类型 & lint & 单测回归**：bug 模块零 TS / 零 ESLint；`tests/api/bug.test.ts` 加 reopen/SLA 边界用例 | HIGH | AC-R9, NFR-4 | 🟡 中 | T1–T7 |

---

## 详细任务

### Task 1: Bug store & 类型升级

**目标**：统一列表和详情的数据源到 Pinia `bugStore.bugs`；BugDocument 新增向后兼容字段。

**文件范围**：
- 改：`src/api/modules/bug.ts`（BugDocument 加字段、BugTimelineEvent type）
- 改：`src/stores/modules/bug.ts`（fetchBugs 后为每个 bug 推断 `reopenCount` / `timeline` 缺省值；selectedBug 同样处理）
- 改：`src/views/bug/index.vue`（删除 `allBugs = ref<BugDocument[]>()` 本地 ref，改为 `const allBugs = computed(() => bugStore.bugs)`；init 流程 `bugStore.fetchBugs()` 而不是本地加载）

**TR（本地测试要求）**：

| ID | 类型 | 条件 | 证据 |
|---|---|---|---|
| T1-R1 | rule | BugDocument.reopenCount 缺失时，`status==='reopened' && resolvedAt!=null` → 推断值 = 1；其余 0 | 单测 cases 3 条，断言推断函数结果 |
| T1-R2 | rule | bugStore.fetchBugs 完成后，index.vue 的 `allBugs.value.length === bugStore.bugs.length` 恒真 | DevTools Pinia state inspection / 控制台 `pinia.state.value['yivad-bug'].bugs.length === document.querySelector('.bug-header__count').innerText` 一致 |
| T1-R3 | rule | detail.vue 进入详情时，即使 bugs.value 为空，fallback 2 fetchBugs 后也能找到 key（详情页不再空白） | 直接访问 `#/bug/{key}` URL（不从列表点进），验证 `selectedBug != null` |
| T1-U1 | rubric | 数据源统一质量 0-2，阈值 ≥ 1.5：2 = 无重复源，bugStore 成为唯一真源；1 = index.vue 仍保留本地 fallback 但优先 store；0 = 双源各自独立 | 代码审计 + 断点调试 |

---

### Task 2: SRE 计算引擎（sloMetrics.ts）

**目标**：抽出纯函数，可单测可复用；保证所有页面口径一致。

**文件范围**：
- 新建：`src/utils/reliability/sloMetrics.ts`（SloWindow, SloResult, calcSloMetrics, calcBugMttr, calcBugSlaOk, calcBugReopenCount 等导出）
- 改：`src/views/bug/index.vue`（`sloMttr / sloCriticalSla / sloReopenRate / sloResolveRate` 全部替换成 `computed(() => calcSloMetrics(allBugs.value, { window, now: now.value }).mttrP95{...})` 调用）
- 改：`tests/api/bug.test.ts`（加 sloMetrics 5 个边界用例）

**TR**：

| ID | 类型 | 条件 | 证据 |
|---|---|---|---|
| T2-R1 | rule | `calcPercentile([3,6,7,8,50], 95)` 结果 = 41.6（线性插值）；不是 50。 | 单元测试断言 |
| T2-R2 | rule | `window = 7d & now = 2026-10-10T00:00:00Z` → 只包含 `createdAt/resolvedAt ≥ 2026-10-03T00:00:00Z` 的 bug。使用 Date mocking 的 10 条样本中窗口内 3 条 → MTTR 值只对这 3 条统计。 | 单测 sample dataset 固定种子 |
| T2-R3 | rule | Severity=critical, status=reopened, 已 resolvedAt 一次 (耗时 2h) 又 reopened → SLA 判定 **not OK**。 | 单测 |
| T2-R4 | rule | status=in_progress non-done bug → TTD = now - createdAt，计入 MTTR 样本（避免低估长尾）。 | 单测：样本 [3h, 5h, in_progress for 80h] → p95 = 71h（不是 5h 样本的 p95 = 4.8h） |
| T2-U1 | rubric | 代码可复用性 0-2，阈值 ≥ 1.5：2 = detail.vue 也复用 sloMetrics 单 bug MTTR 函数；1 = 仅 index 用；0 = 散落 computed 各自实现 | 代码审计 |

---

### Task 3: 实时驱动层

**目标**：列表 + 详情都具备 now 驱动响应式；Live badge / Freshness 徽章可见；SSE 变 → 灯带增量变。

**文件范围**：
- 新建：`src/views/bug/components/LiveBadge.vue`（三态 ● LIVE / ⟳ POLL 60s / ⚠ OFFLINE，带 connect 详情弹窗）
- 改：`src/views/bug/index.vue`：
  - 加 `const now = useTimestamp({ interval: 60_000 })`
  - `useDataFreshness()`，在 `fetchBugs()` 成功后 `markFresh()`
  - `useLiveMetrics()` watch `data.value` → 若 `open_bugs / total_bugs` 变动超阈值 → 触发 `fetchBugs()` 的轻量全量刷新
  - 60s 轮询 `watchEffect(() => tick)` 或 setInterval + DisposerBag.addTimer
  - document.visibilitychange → hidden 时 clearInterval，visible 时立即拉一次再恢复
  - 页面 header 右侧放入 `<LiveBadge>` 和 `Last refreshed {ageLabel}`（可点击手动刷新）
- 改：`src/views/bug/detail.vue`：
  - `useNow(30_000)` 改为 `useTimestamp(10_000)`（Critical 倒计时精确到 10s）

**TR**：

| ID | 类型 | 条件 | 证据 |
|---|---|---|---|
| T3-R1 | rule | 列表页 SLA breach 标签：打开某 critical open bug（age=3h55m）。mock Date.now 向前推进 10 分钟 → age=4h05m → 标签立刻出现 SLA OVER。不需要手动刷新页面。 | 手动时间推进验证 / 单测（vitest useFakeTimers） |
| T3-R2 | rule | 页面切 background 3 分钟后切回 foreground，立即触发一次 fetchBugs 并 markFresh。 | DevTools Network → XHR/fetch 记录（mock 环境下有 `/api/bug/list` 被重新调用） |
| T3-R3 | rule | Live badge 三态都有 role=status + aria-label。 | ESLint `vuejs-accessibility` 规则通过；DOM 属性检查 |
| T3-U1 | rubric | 实时性质量 0-3，阈值 ≥ 2：3 = SSE 增量响应 + 轮询 fallback + visibility 节能；2 = 缺 SSE 增量但其余齐全；1 = 仅轮询；0 = 无自动刷新 | 代码审计 + Network 验证 |

---

### Task 4: 滑动窗口切换 + URL 持久化

**目标**：24h/7d/30d/90d/All 五档；切窗口所有 SLO 即时重算；可分享链接。

**文件范围**：
- 改：`src/views/bug/index.vue` 模板 + script：
  - 新增 `<el-radio-group v-model="windowKey" size="small">`（五档按钮）
  - `windowKey = ref<'24h'|'7d'|'30d'|'90d'|'all'>('30d')`
  - `onMounted` 读 `route.query.window` → 有合法值则覆盖默认
  - `watch(windowKey, v => router.replace({ query: { ...route.query, window: v } }))`
  - `windowMs = computed(...)` → 作为参数传给 `calcSloMetrics`

**TR**：

| ID | 类型 | 条件 | 证据 |
|---|---|---|---|
| T4-R1 | rule | 默认 30d → URL 有 `?window=30d`；用户点 7d → URL → `?window=7d`；刷新页面后 7d 保持。 | 手动操作验证 |
| T4-R2 | rule | 切换 30d → All，SLO 灯带四个数字都变化（样本差异足够）。响应时间 < 100ms。 | Performance 面板 measure |
| T4-U1 | rubric | 可发现性 0-2，阈值 ≥ 1.5：2 = tooltip 显示 "当前口径：最近 X 天内 open 或 resolved 的 bug"；1 = 无 tooltip 但按钮清晰；0 = 看不到可切换。 | UX 人工检查 |

---

### Task 5: 列表页 UI 升级（可下钻联动）

**目标**：所有 summary 卡片都可点击联动筛选。

**文件范围**：
- 改：`src/views/bug/index.vue`
  - OKR 四卡外层包 `<el-button link type="primary" @click="goOkr1()">` 或直接 div clickable
  - `goOkrOpenCriticalP0` → filterSeverity=['critical'], filterPriority=['p0'], filterStatus=non-done（通过 linkFactory 跳 /bug 自身带 query 或改本地筛选）
  - Risk Matrix 16 格：@click="setRiskCell(priority, severity)" 自动设置 filterPriority + filterSeverity
  - Title 列 SLA BreachTag 旁新增 `Reopen ×{n}` pill（当 reopenCount ≥1 时显示）
  - CSV 导出：在末尾追加三列 mttrHours / reopenCount / slaWindowStartAt（index 本地 computed 已有，传给 csv 导出函数）

**TR**：

| ID | 类型 | 条件 | 证据 |
|---|---|---|---|
| T5-R1 | rule | 点击 OKR "Unassigned open" 后，active filter chips 中出现 "Assignee: （空 or Unassigned）" + "Status: non-done" 至少二选一 chip；ProTable list 结果 ≤ Open 总数。 | DOM 验证 |
| T5-R2 | rule | Risk Matrix 点 priority=p0 × severity=critical → 右侧筛选器：Priority=[P0], Severity=[Critical] 被勾选。 | DOM 验证 4 组不同单元格 |
| T5-R3 | rule | CSV 导出末尾三列 `mttrHours,reopenCount,slaWindowStartAt` 名称正确；第一个 resolved bug 行 mttrHours 是数字非空；第一个 open bug 行 mttrHours 为空字符串。 | 本地保存 CSV 用 head 命令查看 |
| T5-R4 | rule | 跨页跳转都通过 `linkFactory.menu_bugDetail / linkFactory.menu_bug`（搜索 `router.push('/bug'` 源码 → 0 个 match；所有都走 linkFactory）。 | Grep 验证：`src/views/bug` 下无裸 `router.push('/bug/` |
| T5-U1 | rubric | 联动深度 0-3，阈值 ≥ 2：3 = OKR 四卡 + RiskMatrix 16 + Alert Strip 全部可钻；2 = 缺 Alert Strip；1 = 仅 OKR 四卡；0 = 不可钻 | 手动验证 |

---

### Task 6: Analytics 升级（ControlChart + 异常点）

**目标**：MTTR Trend 下方展示 ControlChart；异常点生成 Actionable Alerts Strip。

**文件范围**：
- 改：`src/views/bug/index.vue`：
  - 现有 `<MttrTrendChart>` 下方插入 `<ControlChart v-if="controlChartData.length >= 8" :data="controlChartData" :ucl="ucl" :lcl="lcl" :mean="mean"/>`
  - 新增 `Actionable Alerts` strip：最近 5 条 `{date, mttrValue} where mttrValue > UCL`，每条可 click → 设置筛选器 date=该天（通过 ProTable 的 search form 字段 / 或新增 created_at 日期范围筛选）
- 改：`src/utils/reliability/sloMetrics.ts` 新增 `calcControlLimits(series: TrendDataPoint[])` 函数（移动极差 MR̄ × 2.66）

**TR**：

| ID | 类型 | 条件 | 证据 |
|---|---|---|---|
| T6-R1 | rule | UCL 计算样本 [10, 10, 11, 9, 10, 50]（最后一个异常） → UCL > 20，50 > UCL 被识别为异常。 | 单测断言 |
| T6-R2 | rule | Alerts 最多显示 5 条；每条显示 "2026-10-05 MTTR=50h > UCL=23h" 文案。 | DOM 验证 mock 数据 |
| T6-U1 | rubric | SPC 专业度 0-2，阈值 ≥ 1.5：2 = ControlChart + UCL 点红 + Alert Strip 点击下钻；1 = 有 ControlChart 但没 Alert；0 = 未上控制图 | UX + 代码审计 |

---

### Task 7: 详情页升级

**目标**：4 个 Tab 全部达到 SRE 工业级。

**文件范围**：
- 改：`src/views/bug/detail.vue`
  1. **Overview 第 5 宫格**：SLA 倒计时。`computeTimeLeft(severity, createdAt, now, status)` → "4h37m remaining" / "OVER by 1h02m"。颜色三档。
  2. **RCA 5-Why**：若 `selectedBugContent?.stepsToReproduce.length ≥ 1`，自动：Why 1 文本 = `Why did step 1 (${步骤}) produce ${actualResult} 而不是 ${expectedResult}?`；后续 Why 用 "为什么会出现上述结果？" 模板。Cause/Solution 继续预填。
  3. **STRIDE 默认勾选策略**：BugType=security → 默认勾选 Spoofing / Information Disclosure；severity=critical 再默认勾选 DoS；BugType=data → 勾选 Information Disclosure；其他类型默认 0 勾。
  4. **Rollback RTO 进度条**：L1-L5 每级 `rtoMinutes` 固定（L1=5, L2=15, L3=60, L4=240, L5=1440），Steps 数组长度 = 总步骤，completedSteps = mock infer 或 timeline 状态。彩色进度条 + `3/5 steps · 5m RTO`。
  5. **Audit timeline 优先字段**：若 `selectedBug.timeline?.length > 0` → 直接渲染为 timeline item；否则保留现有的 createdAt/updatedAt/resolvedAt 推断逻辑。
  6. **Traceability 闭环**：OKR+Audit Tab 顶部 5 宫格 PRD（可选链接）→ Issue → Bug → TestRun（可选）。有 issue_key 时点进去用 `linkFactory.menu_issueDetail`。
- 新增：`src/views/bug/components/SlaCountdown.vue`（单组件，可复用到列表列）

**TR**：

| ID | 类型 | 条件 | 证据 |
|---|---|---|---|
| T7-R1 | rule | critical bug，age=3h59m，推进 2 分钟 → 从 "1m remaining" 变 "OVER by 1m"，颜色从黄变红色。 | useFakeTimers 测试 / 手动推进 |
| T7-R2 | rule | BugType=security 且 severity=critical 的详情，STRIDE checklist 默认勾选项数 = 3（Spoofing, Information Disclosure, DoS）。数 checked 复选框数 = 3。 | DOM 验证 3 个不同 bug |
| T7-R3 | rule | Rollback L3 (60m RTO, 5 steps, 2 done) → 进度条 40%，文案 "2/5 steps · 60m RTO"。 | DOM 断言 |
| T7-R4 | rule | 当 BugDocument.timeline 存在 3 条事件时，Audit 渲染 3 条；否则推断至少 3 条（created / status-change / resolved-or-updated）。 | DOM 验证 mock 数据 |
| T7-U1 | rubric | 详情深度 0-5，阈值 ≥ 4。5 = 以上 6 项全部实现且有动效；4 = 缺 Traceability；3 = 缺 2 项；0-2 = 多数没做。 | 人工 UX 审查 |

---

### Task 8: 类型 / Lint / 单测回归

**目标**：bug 模块 0 TS / 0 ESLint；新增 sloMetrics 单测 100% 覆盖率。

**文件范围**：
- 改：`tests/api/bug.test.ts`
- 改：`vitest.config.ts`（如需要覆盖 sloMetrics）
- 执行：`cd /Users/yi/YrY/YiVad && yarn type:check` → `grep "src/views/bug\|src/stores/modules/bug\|src/views/bug/components"` 输出为空；
- 执行：`yarn lint` → bug 模块路径下零 error/warning。

**TR**：

| ID | 类型 | 条件 | 证据 |
|---|---|---|---|
| T8-R1 | rule | 执行 `yarn type:check 2>&1 | grep -E 'src/views/bug|src/stores/modules/bug\.ts|sloMetrics'` → 空 | 命令行输出 |
| T8-R2 | rule | 执行 `npx eslint src/views/bug src/views/bug/components src/stores/modules/bug.ts src/utils/reliability/sloMetrics.ts` → 0 问题 | 命令行输出 |
| T8-R3 | rule | `yarn test -- tests/api/bug.test.ts utils/reliability/` → PASS，覆盖 sloMetrics calcPercentile / calcControlLimits / calcSloMetrics / calcBugMttr 四个主函数 | vitest 输出 |
| T8-U1 | rubric | 代码质量 0-2，阈值 ≥ 1.5：2 = 以上均 pass + 单测覆盖关键分支（reopened 判 SLA、non-done 包含 TTD、窗口边界）；1 = 单测覆盖主路径但缺边界；0 = 有 lint/ts 问题 | 代码审计 + 覆盖率报告 |

---

## 风险 & 缓解

| 风险 | 概率 | 影响 | 缓解 |
|---|:---:|:---:|---|
| T1 index.vue 改 bugStore.bugs 后，现有 ProTable fetch 逻辑耦合本地 allBugs 造成列表空 | 高 | 🔴 高 | 保持中间态 `allBugs = ref`，先在 watch(bugStore.bugs, deep: true) 里 sync，功能稳定再删除本地 ref 两步走 |
| T2 滑动窗口改 URL query，导致现有 `?projectKey=` / `?search=` 参数丢失 | 中 | 🟠 中 | 路由 replace 时 `{ ...route.query, window: v }`，保留其他 query |
| T3 useTimestamp 每 60s 全局更新，引发 341 行 age 重绘性能抖动 | 中 | 🟠 中 | 列表 age 改为 memoize：`<AgeDisplay :ts="row.createdAt" :now="now">` 子组件仅接收自身 row 的 now 变化，避免全表 computed 重算 |
| T7 详情页 useTimestamp 10s 间隔造成 CPU 占用上升（尤其详情有 4 tab 重内容） | 中 | 🟡 低 | 仅非 done status 的 bug 启用 10s；done 状态降到 60s tick |

---

## 任务执行顺序建议（严格依赖顺序）

1. T1 →（数据层唯一真源，所有上层基础）
2. T2 →（SRE 引擎抽出）
3. T3 + T4（实时 + 窗口，可并行但 T3 修改 index 模板 T4 也改，建议先 T4 再 T3 或串行）
4. T5 →（联动基于 SRE 引擎和窗口）
5. T6 →（Analytics 基于 sloMetrics calcControlLimits）
6. T7 →（详情页独立，可与 T5/T6 并行，但需 T1 的 timeline 字段）
7. T8 →（最后收尾 lint/type/test）
