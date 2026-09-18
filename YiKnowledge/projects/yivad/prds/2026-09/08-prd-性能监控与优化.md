---
doc_type: prd
title: 性能监控与优化
tags: [性能, WebVitals, 路由性能, 代码分割, 懒加载]
category: 项目/管理后台/需求
created: '2026-09-09'
updated: '2026-09-15'
source: internal
type: 需求
status: 进行中
priority: 中
project: YiVad
project_id: yivad
owner: 陈铭
prd_month: '202609'
prd_task_id: YV-09-M12
estimate_frontend: 2.0
review_status: 已评审
implementation_progress: useSlowThreshold + performanceObserver 已实现并测试通过（10用例），WebVitals 采集器已创建
implementation_updated: '2026-09-15'
issue_type: 功能
roles: [engineer]
source_okr: [yivad-003]
---

# 性能监控与优化

> 需求编号：YV-09-M12 · 优先级：中 · 人天：2.0d

> **文档职责**：本文档定义**要做什么、为什么做、做到什么程度算完成**（WHAT / WHY），不含实现方案与测试用例。
> 实现方案见 [开发方案](../../devs/2026-09/08-prd-task-性能监控与优化.md)，验证方案见 [测试方案](../../tests/2026-09/08-prd-test-性能监控与优化.md)。


## 目录

- [一、背景](#sec-1)
- [二、目标](#sec-2)
- [三、功能需求](#sec-3)
- [四、性能阈值（NFR-1）](#sec-4)
- [五、性能评分（FR-8.4）](#sec-5)
- [六、验收标准](#sec-6)

---

---

<a id="sec-1"></a>
## 一、背景

YiVad 作为管理后台，随功能增长首屏体积和运行时性能需要持续监控。当前缺少性能数据采集、缺少 Web Vitals 监控、路由切换性能不可观测。需要建立性能监控基线并实施优化。

<a id="sec-2"></a>
## 二、目标

1. **可观测**：采集 Web Vitals (LCP/FCP/CLS/TTFB/INP)，路由级性能数据
2. **可优化**：基于采集数据识别瓶颈，实施代码分割和懒加载
3. **可持续**：性能回归通过自动化监控发现

<a id="sec-3"></a>
## 三、功能需求

| 编号 | 需求 | 说明 |
|------|------|------|
| FR-8.1 | Web Vitals 采集 | 采集 LCP/FCP/CLS/TTFB/INP 五项核心指标 |
| FR-8.2 | 路由性能追踪 | `beforeEach`/`afterEach` 记录路由切换耗时 |
| FR-8.3 | 自定义性能标记 | `markTiming`/`measureTiming` API 供开发者埋点 |
| FR-8.4 | 性能评分 | 基于权重计算综合性能评分（A-F 五级） |
| FR-8.5 | 指标历史 | 保留最近 100 条指标记录，支持趋势分析 |
| FR-8.6 | 慢路由告警 | dev 环境路由切换 > 100ms 控制台告警 |
| FR-8.7 | bfcache 恢复 | `pageshow` 事件恢复后重新采集 Web Vitals |
| FR-8.8 | 首屏体积控制 | 重依赖（xlsx/jspdf/ECharts）按需加载，不进首屏 |

<a id="sec-4"></a>
## 四、性能阈值（NFR-1）

| 指标 | Good | Needs Improvement | Poor |
|------|------|-------------------|------|
| LCP | ≤ 2500ms | ≤ 4000ms | > 4000ms |
| FCP | ≤ 1800ms | ≤ 3000ms | > 3000ms |
| CLS | ≤ 0.1 | ≤ 0.25 | > 0.25 |
| TTFB | ≤ 800ms | ≤ 1800ms | > 1800ms |
| INP | ≤ 100ms | ≤ 300ms | > 300ms |

<a id="sec-5"></a>
## 五、性能评分（FR-8.4）

综合评分按权重计算：LCP 25% + INP 25% + CLS 20% + FCP 15% + TTFB 15%

| 评分 | 等级 |
|------|------|
| ≥ 90 | A |
| ≥ 75 | B |
| ≥ 60 | C |
| ≥ 40 | D |
| < 40 | F |

<a id="sec-6"></a>
## 六、验收标准

- Web Vitals 五项指标自动采集并记录
- 路由切换耗时在 dev 环境实时输出
- `markTiming("component-render")` → `measureTiming("component-render")` 可用
- 首屏 chunk 中不含 `xlsx`/`jspdf`/完整 ECharts

---

> **文档边界**：本文档定义 WHAT/WHY。实现细节见[开发方案](../../devs/2026-09/08-prd-task-性能监控与优化.md)，测试用例见[测试方案](../../tests/2026-09/08-prd-test-性能监控与优化.md)。
