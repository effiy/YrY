---
doc_type: test
title: "性能监控与优化体系 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-24"
source_prds: ["08-prd-性能监控与优化"]
source_modules: []
---
# 性能监控与优化体系 — 测试规格

> 来源 PRD：[08-prd-性能监控与优化.md](../../prds/2026-09/08-prd-性能监控与优化.md)
> 提取日期：2026-09-11

---

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


## 补充：单元测试用例

### UT-PF01: usePerformanceMonitor

| # | 测试场景 | 输入 | 期望结果 |
|---|---------|------|---------|
| 1 | FPS 采集 | requestAnimationFrame 回调 | fps 值在 0-120 范围 |
| 2 | 内存采集 | performance.memory | usedJSHeapSize > 0 |
| 3 | 长任务检测 | 任务 > 50ms | 标记为长任务 |
| 4 | DOM 节点数 | querySelectorAll('*') | 节点数 > 0 |
| 5 | 采样间隔 | 30s 定时器 | 每 30s 采集一次 |

### UT-PF02: 代码分割验证

| # | 测试场景 | 输入 | 期望结果 |
|---|---------|------|---------|
| 1 | 路由懒加载 | 访问路由 | 按需加载 chunk |
| 2 | 动态 import | import('xlsx') | 仅在需要时加载 |
| 3 | 首屏体积 | 构建产物分析 | 首屏 JS < 500KB |

