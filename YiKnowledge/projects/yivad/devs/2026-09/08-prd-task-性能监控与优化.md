---
doc_type: module
prd_task_id: "YV-09-24"
title: "YV-09-24: 性能监控与优化 — 开发方案"
status: 进行中
priority: 高
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-15
project: YiVad
prd_month: "202609"
estimate_frontend: 1.5
source_prd: "08-prd-性能监控与优化.md"
---

# YV-09-24: 性能监控与优化 — 开发方案

> 需求编号：YV-09-24 · 人天：1.5d

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

## 源码索引

| 文件 | 说明 | 文件路径 |
|------|------|------|
| `src/utils/performance/performanceObserver.ts` | 性能观察器 | `YiVad/src/utils/performance/performanceObserver.ts` |
| `src/hooks/useSlowThreshold.ts` | 慢请求阈值 hook | `YiVad/src/hooks/useSlowThreshold.ts` |

---

<a id="sec-1"></a>
## 一、方案概述

建立前端性能监控体系：页面加载指标（FCP/LCP/TTI）、组件渲染耗时、内存使用追踪。

### 监控指标

| 指标 | 采集方式 | 阈值 |
|------|---------|------|
| FCP | `web-vitals` 库 | < 1.5s |
| LCP | `web-vitals` 库 | < 2.5s |
| 路由切换耗时 | `router.beforeEach/afterEach` 差值 | < 200ms |
| 组件渲染耗时 | Vue DevTools Performance | — |

### 优化策略

| 策略 | 目标 | 实现 |
|------|------|------|
| 路由懒加载 | 首屏 JS ↓ | `() => import(...)` 按视图分块 |
| 虚拟滚动 | 大列表 DOM ↓ | `el-table-v2` 或 `vue-virtual-scroller` |
| KeepAlive 缓存 | Tab 切换重渲染 ↓ | `include` 动态管理 |
| v-memo | 静态内容跳过 diff | `v-memo="[item.id, item.status]"` |
| 图片懒加载 | 首屏图片请求 ↓ | `v-lazy` 指令 + IntersectionObserver |

### 实施步骤

| 步骤 | 内容 | 人天 |
|------|------|------|
| 1 | web-vitals 接入 + 指标面板 | 0.5 |
| 2 | 路由懒加载优化 | 0.25 |
| 3 | KeepAlive + v-memo 优化 | 0.5 |
| 4 | 图片懒加载指令 | 0.25 |

**合计：1.5d**

---

<a id="sec-2"></a>
## 二、完成定义（DoD）

- [ ] web-vitals 采集 FCP/LCP/TTI
- [ ] 路由切换 < 200ms
- [ ] 大列表虚拟滚动渲染 < 50 个 DOM 节点

---

## 实现记录

> 复核日期：2026-09-15 · 状态：进行中

### 源码产出

| 分类 | 文件数 | 内容 |
|------|--------|------|
| Hooks | 1 | 核心逻辑 composable
| Stores | 0 | —
| API | 0 | —
| 组件 | 0 | —
| 页面 | 0 | —
| **源码合计** | **1** | |

### 测试覆盖

| 分类 | 文件数 | 说明 |
|------|--------|------|
| Hook 测试 | 1 | useSlowThreshold.test.ts（5用例）
| 组件测试 | 0 | 待补
| 工具测试 | 1 | performanceObserver.test.ts（5用例）
| **测试合计** | **2** | |

### 缺口


| UI 组件 | 待创建 | |
| Hook 测试 | 待补 | |


## 架构总览

### 性能监控体系

```
Web Vitals 采集 (PerformanceObserver)
  LCP → PerformanceObserver("largest-contentful-paint")
  FCP → PerformanceObserver("paint")
  CLS → PerformanceObserver("layout-shift")
  TTFB → PerformanceObserver("navigation")
  INP → PerformanceObserver("event")

路由性能追踪 (Router hooks)
  beforeEach → performance.now() 记录开始
  afterEach → 计算耗时 + 记录历史

自定义标记 (markTiming/measureTiming)
  markTiming("component-render") → performance.mark
  measureTiming("component-render") → performance.measure
```


## 关键决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 性能采集 | PerformanceObserver API | 异步不阻塞主线程，支持 buffered 回读 |
| 评分模型 | 加权评分 (A-F 五级) | LCP 25% + INP 25% + CLS 20% + FCP 15% + TTFB 15% |
| 慢路由阈值 | DEV 环境 100ms | 仅开发阶段告警，生产不打印 |
| bfcache 恢复 | pageshow.persisted 检测 | 浏览器前进/后退时重新采集 Web Vitals |



---

<a id="sec-gap"></a>
## 已知缺口与技术债

> 状态：进行中（useSlowThreshold + performanceObserver 已完成，UI 组件待创建）

### 功能缺口

| # | 缺口 | 影响 | 建议 |
|---|------|------|------|
| 1 | Web Vitals 指标面板 UI 组件待创建 | 性能数据无可视化展示 | 创建 PerformancePanel 组件（0.3d） |
| 2 | 路由懒加载优化未实施 | 首屏 bundle 体积未优化 | 按视图拆分动态 import（0.25d） |

### 技术债

| # | 技术债 | 优先级 | 预计人天 | 说明 | 状态 |
|---|--------|--------|---------|------|------|
| 1 | 性能数据持久化 | P2 | 0.3 | 将 Web Vitals 数据上报至 YiAi 用于长期趋势分析 | 待实现 |
| 2 | KeepAlive 缓存策略优化 | P2 | 0.5 | 动态 include/exclude 管理缓存列表 | 待实现 |
