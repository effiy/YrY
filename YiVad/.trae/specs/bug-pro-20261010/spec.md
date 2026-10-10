# Bug 管理模块专业化 & 数据准确实时化 需求规格 (spec.md)

> 生成日期：2026-10-10 · 关联路由：`#/bug`、`#/bug/:id`

---

## 1. 问题陈述（Problem Statement）

当前 Bug 模块的第一版 UI 已具备视觉专业化（SLO 灯带、Risk Matrix、Tab 详情等），但存在三个结构性缺陷：

1. **SRE 指标计算不精确**：
   - **MTTR p95** 使用 `Date.now() - b.createdAt` 直接计算，对 reopen 后累计时间不加权、对 in_progress / resolved 阶段不分段，数值是"静态快照"，与工业 SRE MTTR（open → in_progress → resolved 的端到端耗时统计口径）不一致。
   - **Critical SLA 达标率**：`DONE_STATUSES` 与 `non-DONE` 二分类；但 **reopened** bug 在 resolved 后被重新置 open，导致"曾经完成一次"也被算作 OK —— SLA 必须按**最终关闭**或"最近一次 open → resolved"窗口判断。
   - **Reopen Rate**：仅用 `status === "reopened"` 计数，无法反映"反复 re-open ≥2 次"的质量信号。
   - **滑动窗口缺失**：所有 SLO 指标基于**全量历史**而非最近 30/7/1 天窗口。导致 SLO 灯带对最近质量事故无感，对 SRE on-call 无指导意义。
2. **实时性不足**：
   - 列表页无定时 refresh、无 SSE push、无 freshness 倒计时。用户打开页面 10 分钟后看到的数据是"10 分钟前的快照"。
   - AgeHours、SLA Breach 基于 `Date.now()` 只在首次加载时计算，组件不重算直到热更新或 HMR。详情页 `useNow(30_000)` 30s tick 太慢；Critical bug 的 SLA breach 以"1 分钟粒度"可见时已是严重事故后知。
3. **可追溯性与审计证据缺失**：
   - 列表/详情页 OKR Impact 四个数字不能点开下钻（没有"点击跳到当前筛选"的联动）。
   - 审计 trail (detail L4 Audit) 仅基于 createdAt/resolvedAt/updatedAt 推断事件，没有真实 status 变更记录字段。
   - "MTTR 超出 UCL 的异常点"（SPC 控制图）没有在 UI 上作为 **Actionable Alert** 呈现。

---

## 2. 目标用户（Users）

| 用户角色 | 主要诉求 |
|---|---|
| **SRE / On-call 工程师** | SLO 灯带实时性；MTTR p95 准确；Critical SLA breach 秒级感知 |
| **研发负责人 / TL** | Reopen 统计口径可解释；Risk Matrix 可钻取；OKR Impact 可点击下钻 |
| **QA / 测试工程师** | SLA 基于 open→resolved 窗口而非全量 bug；RCA 内容与当前 bug 内容强绑定；导出 CSV 字段准确 |
| **产品经理** | 详情页 Audit 能看到状态流转确切时序；Reopen ≥2 次的 bug 有高亮标签 |

---

## 3. 功能需求（Functional Requirements）

### FR-A 数据源 & 指标计算专业化（列表页 SLO 灯带）
- FR-A1 **MTTR 口径统一**：
  - 以 "最近一次 open → 本次 resolved" 的时间差为单 bug TTR（忽略 resolved→reopened→open 的中间阶段残留时间）。
  - 若 bug 仍在 `in_progress`，以 **TTD（Time To Detect=createdAt→now）** 作为"未完成 TTR"的估算值参与分位（计入 p95，避免低估未解决长尾）。
- FR-A2 **滑动时间窗口**：
  - 默认 30 天窗口（`createdAt 或 resolvedAt 任意 ≥ now - 30d` 的 bug 参与计算）。
  - SLO 灯带右上方提供窗口切换：**24h / 7d / 30d / 90d / All**，所有 computed 基于窗口重算。
  - 窗口切换后 URL query 持久化（`?window=7d`），用户分享链接保留视图上下文。
- FR-A3 **Critical SLA 准确率修正**：
  - resolved bug 的 breach 判断 = `min(resolvedAt - createdAt, 最近一次 open 到 resolved 的时间) < SLA_HOURS[severity]`。
  - reopened bug 不计入"已达标"，**必须最终 closed 或 closed 状态下 resolved 才计数 OK**。
  - 分母：所有 severity=critical 且在窗口内 open 过的 bug（含当前 open）。
- FR-A4 **Reopen Rate 口径升级**：
  - 统计：window 内 `reopenCount ≥ 1` 的 bug 数 / 窗口内总 bug 数（而不是 status === "reopened" 的快照）。
  - 新增 **2+/3+ re-open** 的次级指标（在 cheat sheet 里展示）。
- FR-A5 **Resolve Rate 口径**：`(resolved + closed 在窗口内完成的) / (窗口内 open 过的)`。

### FR-B 实时性（列表页 + 详情页）
- FR-B1 **数据 Freshness 徽章**：列表页 header 右侧显示 `Last refreshed {ageLabel}` + 实时旋转小图标，支持点击"手动刷新"图标。
- FR-B2 **自动轮询 + SSE**：
  - 后台轮询 60s 一次（`fetchBugs`，若 ETag/Last-Modified 未变则 304 不重算）；
  - 同时接入已存在的 `useLiveMetrics().data` → SSE `open_bugs` / `today_created` / `overdue_count` 变动 → 触发**增量重算** SLO（不做全量拉，仅更新灯带的 `open_bugs` 等 summary 数字）。
  - tab 切换 visible=false 时暂停（`document.visibilityState` + `useTimestamp` 节流）。
- FR-B3 **now 驱动的响应式 Age / SLA**：
  - 列表页引入 `useTimestamp(interval=60_000ms)`，将 `ageHoursOf(b)` 改为 computed（依赖 now）。SLA breach 标签从"页面打开时判定"变成每 60 秒重判，用户停留期间会从 OK → WARN → FAIL 动态切换。
  - 详情页 `useNow(30_000)` 改为 `useTimestamp(10_000)`，并把 "Time left in SLA" 做成倒计时组件（Critical bug：`4h37m remaining`，breach 后显示 `OVER by 1h02m`）。
- FR-B4 **WebSocket / SSE 连接状态**：右上角 Live badge `● LIVE`（SSE 已连）/ `⟳ POLL 60s`（仅轮询 fallback）/ `⚠ OFFLINE`，click 查看连接详情（延迟、重试次数、最后数据时间）。

### FR-C SRE 控制图 & 异常点可行动（列表页 Analytics）
- FR-C1 在现有 MTTR Trend Chart 之上，叠加 **SPC 控制图 UCL/LCL**（使用已存在的 `<ControlChart>` 组件）：
  - Mean = 30d MTTR p50；UCL = `Mean + 2.66 × MR̄`（移动极差法）；LCL = max(0, Mean − 2.66 × MR̄）。
  - 超出 UCL 的点 → 标红并生成 **"Actionable Alert"**：`{date} MTTR={x}h > UCL={y}h`。
- FR-C2 异常点下方新增 Alert Strip：最多显示最近 5 条 UCL 异常，支持点击"仅看该天"筛选。

### FR-D Reopen ≥2 次的 Bug 标记（列表 + 详情）
- FR-D1 列表页增加 **"Reopen" 图标列**（或在 Title 列 SLA 标签旁显示 `Reopen ×3` pill）。
- FR-D2 Detail Overview Tab 的 SRE 深色卡增加 "Reopens" 字段（与 Risk / MTTR / SLA / Status 并列）。
- FR-D3 导出 CSV：新增 `reopenCount`、`mttrHours`（单条 bug 的 TTR）、`slaWindowStartAt` 三列。

### FR-E 下钻联动（列表 → 筛选、OKR → 筛选）
- FR-E1 OKR Impact 四张卡片全部可点击：
  - "Open Critical+P0" → 自动设置筛选器 `Severity=[critical] AND Priority=[p0] AND Status=[open,in_progress,reopened]`。
  - "Resolved this week" → 日期筛选 `resolvedAt in [周一00:00, now]`（或窗口=7d + Status=resolved/closed）。
  - "Reopened this cycle" → 设置 Risk Filter = 自定义 "Reopened"，仅显示 reopenCount ≥1。
  - "Unassigned open" → Assignee = empty + Status non-done。
- FR-E2 Risk Matrix 单元格（4×4）@click 直接设置 Severity + Priority 二元筛选；hover tooltip 提示该单元格包含的 bug keys 前 5 个。

### FR-F 详情页专业化深化
- FR-F1 **SLA 倒计时**（Overview 卡第 5 宫格）：`{h}h{m}m remaining` 或 `OVER by {h}h{m}m`，颜色随剩余时间分级（green / yellow 50% / red breach）。
- FR-F2 **RCA 5-Why 与 bug 内容强绑定**：
  - 解析 `selectedBugContent.stepsToReproduce[i]`，按步骤编号自动填入 5-Why 追问链 `Why #1: 在步骤 {i} 时 {原因}？`。
  - 若 BugType=security，STRIDE 六项中 `Spoofing | Tampering | Repudiation | Information Disclosure | DoS | Elevation`，第一项 Spoofing 默认 checked，DoS 在 severity=critical 时默认 checked。
- FR-F3 **Rollback L1-L5 RTO 可视化**：每级显示彩色进度条 `RTO 5m — ═══════░ 3 steps` （已完成/总步骤、已占用 vs RTO 剩余）。
- FR-F4 **Audit Trail 精确化**：基于 `createdAt / updatedAt / resolvedAt / closedAt` + status 文本映射 + `reopenCount` 推断 exact 事件流。若 updateBug 时写入 `timeline: { status: string, ts, by }[]` 字段（新增可选字段向后兼容），则优先使用 timeline 数据渲染。
- FR-F5 **Traceability 闭环展示**：OKR Audit Tab 增加一行 "PRD → Issue → Bug → Test" 五宫格，展示 `issue_key | iteration | testRun links`（mock 可从 issue_key 字段拼接跳转）。

---

## 4. 非功能需求（Non-Functional Requirements）

### NFR-1 性能
- NFR-1.1：341 条 bug 数据集下，从页面 mount 到首次 SLO 灯带数值可见 ≤ 350ms（Lighthouse TTI 不退化）。
- NFR-1.2：SLO 灯带指标重算（滑动窗口切换 30d→7d）≤ 60ms。
- NFR-1.3：Age/SLA 每 60s 重算，单 bug 的 computed 值变化引起的 DOM 重绘 ≤ 20ms。

### NFR-2 数据准确性
- NFR-2.1：`mttrHours` 与 MTTR p95 的计算必须使用**线性插值分位算法**（`MetricsRecorder.percentile` 中的方法，即 idx=(p/100)*(n-1)，上下索引加权）——不得使用 `Math.floor(p*n/100)` 的粗近似。
- NFR-2.2：滑动窗口边界必须**严格闭区间**（≥ now − windowDays×86400000），不得"按日自然边界"。

### NFR-3 可访问性 / 语义化
- NFR-3.1：所有 SLO 灯带、Live badge、倒计时带 role=status、aria-label。
- NFR-3.2：kbd 快捷键描述保留在 cheat sheet，⌘/⌥ 符号语义正确。

### NFR-4 向后兼容
- NFR-4.1：`BugDocument` 新增字段 `reopenCount?: number`、`timeline?: BugTimelineEvent[]` **必须可选**，mock / legacy bugs 缺值时自动从 `status==='reopened' + resolvedAt!==null` 推断。
- NFR-4.2：csv 导出新增列必须加在末尾，不破坏既有消费者列顺序依赖。

### NFR-5 错误容忍
- NFR-5.1：SSE 连接失败 → 自动降级为 60s 轮询，Live badge 显示 `⟳ POLL 60s fallback`。
- NFR-5.2：fetchBugs 失败（AbortError / 5xx）不抛页面级 error，保留上一次成功数据并在 freshness 徽章上 `⚠ stale` 警告。

---

## 5. 约束 / 依赖 / 假设 / 开放问题

### 约束（Constraints）
- C1：**包管理器 yarn**，不使用 pnpm / npm。
- C2：主题变量命名语义化（xs/sm/md/lg/light/dark/primary/secondary），不新增带数字后缀的 token。
- C3：ProTable row-key 禁止使用字面量字符串 `"key"`；必须是函数 `row => row.key` 或引用其他字段。
- C4：跨页搜索跳转**必须通过 `src/utils/linkFactory.ts`**，禁止直接 `router.push('/bug/' + key)` 硬编码。

### 依赖（Dependencies）
- D1：已存在的 `useLiveMetrics`（SSE from `yiAiBaseUrl/dashboard/live`）——复用其中 `open_bugs / today_created / overdue_count / total_bugs` 四字段。
- D2：已存在的 `useDataFreshness`（`markFresh / ageLabel`）。
- D3：已存在的 `<ControlChart>` 组件。
- D4：`MetricsRecorder.percentile` 线性分位实现（复用或抽 util）。

### 假设（Assumptions）
- A1：mock 模式下（`RSBUILD_ENV_USE_MOCK === "true"`）`fetchBugs()` 快速返回，60s 轮询不会触发真实后端压力。
- A2：bugStore 目前 bugs.value 与 index.vue 的本地 `allBugs` ref 重复源——**本轮将把列表页数据源切换到 `bugStore.bugs` computed，解决详情 fallback 的根本问题**。
- A3：用户在 `#/bug` 路由打开 tab 超过 30 分钟场景极少，暂停/恢复轮询以节省资源。

### 开放问题（Open Questions）
- OQ1：**窗口切换 URL query 中 window= 的取值是否允许自定义 1d/3d？** 本轮默认给 24h/7d/30d/90d/All 五档，如需更多在 Tasks 里扩展。
- OQ2：**WebSocket vs SSE**：后端没推 WebSocket 消息，本轮仅用 SSE + 轮询混合。待后端有 WS 通道再升级。
- OQ3：**Actionable Alerts 的持久化**？本轮仅内存生成 + tooltip，不写入后端。

---

## 6. 非目标（Non-Goals）

- NG1：不做 Bug 创建/编辑 Form 的字段重构（本轮聚焦数据准确性 & 实时性）。
- NG2：不做 Board 拖拽（Low priority，留待下一轮）。
- NG3：不接入真实后端的 WebSocket 推送（仅 SSE + 轮询）。
- NG4：不修复 CustomFieldRenderer / search/index.vue 等 bug 模块外遗留 TS 错误。
- NG5：不重写 bug store 的 fetchBugs 实现（只保证接口 contract 不破坏）。

---

## 7. 验收标准（Acceptance Criteria）

### 规则类（rule）——必须通过
- **AC-R1**：MTTR p95 计算使用 `MetricsRecorder` 线性插值分位算法（对 5 个样本输入 [3, 6, 7, 8, 50]h，p95 = 41.6h，不是 50）。
- **AC-R2**：滑动窗口切换到 7d 时，所有 SLO 灯带数值仅使用 `now - 7×86400000` 之后（含边界） open 或 resolved 的 bug 参与。
- **AC-R3**：Critical SLA 对 reopened bug **never counts as OK**，除非最终 Status ∈ `{resolved, closed}` 且 `min(最近一次 open→resolved 时长) < SLA_HOURS[critical]`。
- **AC-R4**：详情页的 Reopen Count 字段如果从 BugDocument.reopenCount 取不到，fallback 为 status==='reopened' 时=1 else 0（不能 NaN 或 undefined）。
- **AC-R5**：列表页 Age/SLA 每 60 秒重算一次（在 mock 里手动推进 Date.now 62 秒，SLA breach 标签状态从 false 变 true 能被观察到）。
- **AC-R6**：Live badge 三种状态（LIVE/POLL/OFFLINE）都有 aria-label，并有 tooltip 显示"最后数据时间"。
- **AC-R7**：CSV 导出末尾追加 `mttrHours,reopenCount,slaWindowStartAt` 三列，存在数值的 bug 行填充正确（resolved bug 才填 mttrHours；否则为空字符串）。
- **AC-R8**：ProTable row-key 是函数 `row => row.key` 或等效 path，非字符串字面量 `"key"`。
- **AC-R9**：bug 模块 ESLint + TypeScript 零错误（执行 `yarn type:check | grep src/views/bug` 为空；`eslint src/views/bug src/views/bug/components src/stores/modules/bug.ts` 零错误）。

### 评分类（rubric）——必须达到阈值
- **AC-U1（SRE 专业化·SLO 灯带，0-5 分，阈值 ≥ 4.0）**：
  - 5：5 项指标（MTTR / SLA / Reopen / Resolve / Live）全部有滑动窗口 toggle、URL query 持久化、tooltip 详细口径说明、点击可下钻筛选。
  - 4：4 项可下钻 + 滑动窗口；仅 Live badge 无下钻。
  - 3：有滑动窗口但无 URL 持久化或口径说明。
  - 0–2：仍为静态快照。
- **AC-U2（数据实时性，0-5 分，阈值 ≥ 4.0）**：
  - 5：SSE push 触发增量更新 + 60s 轮询 fallback + visibility 暂停/恢复 + freshness 徽章点击刷新 + now 驱动 SLA 实时切换。
  - 4：满足上面 4 条，缺 SSE push 增量更新（但数值会在 60s 轮询后变）。
  - 3：仅 60s 轮询 + freshness 徽章。
  - 0–2：仍为单次加载无自动刷新。
- **AC-U3（RCA / Rollback / Audit 深化，0-5 分，阈值 ≥ 4.0）**：
  - 5：SLA 倒计时 + 5-Why 绑定 stepsToReproduce + STRIDE 默认勾选策略 + Rollback RTO 进度条 + Audit timeline 优先从 BugDocument.timeline 渲染。
  - 4：满足上面 4 条，缺 timeline 字段（只用 inferred）。
  - 3：仅有 SLA 倒计时和 Rollback RTO 进度条。
  - 0–2：无以上增强。
- **AC-U4（可追溯联动，0-5 分，阈值 ≥ 3.5）**：
  - 5：OKR 四卡点击联动筛选 + Risk Matrix 16 格点击二元筛选 + hover 显示 keys + 异常点 Alert Strip 按日筛选。
  - 4：OKR 四卡 + Risk Matrix，缺异常点 Alert Strip。
  - 3：OKR 四卡联动。
  - 0–2：无联动。
- **AC-U5（性能不退化，0-3 分，阈值 ≥ 2.5）**：
  - 3：TTI ≤ 350ms，SLO 窗口切换 ≤ 60ms。
  - 2：TTI ≤ 500ms，SLO 窗口切换 ≤ 100ms。
  - 0–1：TTI > 800ms 或切换卡顿 > 200ms。

---

## 8. 成功证据摘要（Sign-off Summary）

以上 9 条 rule AC 全部 pass，加上 5 条 rubric AC 加权平均 ≥ 4.0，即视为本轮专业化 & 数据实时化改造成功。
