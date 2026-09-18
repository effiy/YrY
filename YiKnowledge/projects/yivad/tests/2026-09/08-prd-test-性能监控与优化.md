---
doc_type: test
title: "性能监控与优化体系 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-15
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-24"
source_prds: ["08-prd-性能监控与优化"]
source_modules: []
---
# 性能监控与优化体系 — 测试规格

> 来源 PRD：[08-prd-性能监控与优化.md](../../prds/2026-09/08-prd-性能监控与优化.md)

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。用例覆盖度以 PRD 的 `FR-x.y` / `NFR-x` 编号追溯，不复制需求正文。
> 提取日期：2026-09-11

---

<a id="sec-6"></a>
## 六、测试规格

### 单元测试：webVitals（自研）

#### Scenario: 指标采集
- **GIVEN** 调用 `initWebVitals()`
- **WHEN** 页面完成加载
- **THEN** `getLatestMetrics()` 返回包含 LCP、FCP、CLS、TTFB 的 Record

#### Scenario: 评级正确
- **GIVEN** LCP = 2000ms
- **WHEN** 记录指标
- **THEN** `rating = "good"`
- **GIVEN** LCP = 3000ms
- **WHEN** 记录指标
- **THEN** `rating = "needs-improvement"`
- **GIVEN** LCP = 5000ms
- **WHEN** 记录指标
- **THEN** `rating = "poor"`

### 单元测试：vLazyLoad

#### Scenario: 图片懒加载
- **GIVEN** 图片元素在视口外
- **WHEN** 挂载 `v-lazy-load` 指令
- **THEN** 图片 src 未设置，仅 data-src 有值

#### Scenario: 进入视口后加载
- **GIVEN** 图片元素在视口外，已挂载指令
- **WHEN** IntersectionObserver 触发 isIntersecting
- **THEN** 图片开始加载，src 被设置

### 单元测试：memoryLeakDetector

#### Scenario: 正常内存无检测
- **GIVEN** 10 个采样点，内存稳定在 30MB 左右
- **WHEN** 调用 `detectLeak()`
- **THEN** 返回 `null`（无泄漏）

#### Scenario: 内存增长检测
- **GIVEN** 10 个采样点，内存从 30MB 增长到 50MB（+66%）
- **WHEN** 调用 `detectLeak()`
- **THEN** 返回 `warning` 级别告警

### 单元测试：metricsStore

#### Scenario: 缓冲批量上报
- **GIVEN** 缓冲中有 5 条记录
- **WHEN** 第 20 条记录被添加
- **THEN** `flush()` 被自动调用，发送 POST 请求

#### Scenario: 页面卸载时兜底上报
- **GIVEN** 缓冲中有 3 条未上报记录
- **WHEN** 触发 `beforeunload` 事件
- **THEN** 使用 `sendBeacon` 发送剩余记录

### 组件测试：Performance 页面

#### Scenario: 四模块渲染
- **GIVEN** 访问 `/performance` 路由
- **WHEN** 页面加载完成
- **THEN** 实时指标、历史趋势图、页面分布图、路由记录表均正常渲染

#### Scenario: 时间范围切换
- **GIVEN** 性能页面已加载
- **WHEN** 用户点击"最近 7 天"
- **THEN** 调用 `queryMetrics` 且 start_time 为 7 天前，趋势图数据更新

#### Scenario: 导出报告
- **GIVEN** 性能页面有数据
- **WHEN** 用户点击"导出报告"
- **THEN** 触发 JSON 文件下载，包含 metrics、routeTimings、memory

### API 测试：performance_metrics

#### Scenario: 批量写入性能数据
- **GIVEN** 3 条性能记录
- **WHEN** 调用 `batch_insert`
- **THEN** MongoDB `performance_metrics` 集合新增 3 条文档

#### Scenario: 聚合查询
- **GIVEN** 已写入 100 条 LCP 记录（值在 1500-4000ms 之间）
- **WHEN** 调用 `query_aggregated` with `metric_names=["LCP"]`
- **THEN** 返回 avg/p50/p75/p95/max/min 均合理

---

## 源码索引

| 文件 | 说明 | 文件路径 |
|------|------|------|
| `src/utils/performance/performanceObserver.ts` | 性能观察器 | `YiVad/src/utils/performance/performanceObserver.ts` |
| `src/hooks/useSlowThreshold.ts` | 慢请求阈值 hook | `YiVad/src/hooks/useSlowThreshold.ts` |

---

## 覆盖矩阵

| 编号 | 用例 | 覆盖 FR | 优先级 | 自动化 |
|------|------|--------|--------|--------|
| TC-PERF-001 | slowThreshold 读写 | FR-8.8 | P1 | ✅ useSlowThreshold.test.ts |
| TC-PERF-002 | formatSlowThreshold 格式化 | FR-8.8 | P1 | ✅ useSlowThreshold.test.ts |
| TC-PERF-003 | SLOW_THRESHOLD_PRESETS 预设 | FR-8.8 | P1 | ✅ useSlowThreshold.test.ts |
| TC-PERF-004 | markTiming 创建标记 | FR-8.3 | P1 | ✅ performanceObserver.test.ts |
| TC-PERF-005 | measureTiming 测量耗时 | FR-8.3 | P1 | ✅ performanceObserver.test.ts |
| TC-PERF-006 | getUserMeasures 获取记录 | FR-8.5 | P1 | ✅ performanceObserver.test.ts |





## 执行状态

| 指标 | 值 |
|------|-----|
| 全局测试 | 78 文件 · 680 用例 · 100% 通过 |
| 本模块测试 | 2 文件 · 10 用例 · 全部通过 |
| 执行命令 | `cd YiVad && pnpm test` |
