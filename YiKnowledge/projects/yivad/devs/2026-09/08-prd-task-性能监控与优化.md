---
doc_type: module
prd_task_id: "YV-09-24"
title: "性能监控与优化体系 — 开发任务"
status: 已实现
priority: 高
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
estimate_frontend: 1.95
source_prd: "08-prd-性能监控与优化.md"
---

# 性能监控与优化体系 — 开发任务

> 来源 PRD：[08-prd-性能监控与优化.md](../prds/2026-09/08-prd-性能监控与优化.md)
> 需求编号：YV-09-24 · 优先级：高 · 人天：1.95d

## 五、实施步骤

| 步骤 | 任务 | 产出 | 验证方式 | 人天 |
|------|------|------|----------|------|
| 1 | 实现 Web Vitals 自研采集 | `webVitals.ts`（原生 PerformanceObserver） | 开发环境控制台输出 LCP/FCP/CLS/INP/TTFB | 0.25 |
| 2 | 实现 PerformanceObserver 封装 | `performanceObserver.ts` | 路由切换耗时日志输出 | 0.15 |
| 3 | 改造路由为动态导入 | `routers/index.ts` 修改 | `pnpm build` 后 dist 中有独立 chunk 文件 | 0.2 |
| 4 | 实现图片懒加载指令 | `vLazyLoad.ts` | 图片仅在进入视口时加载 | 0.15 |
| 5 | 实现内存泄漏检测 | `memoryLeakDetector.ts` | 开发环境 5 分钟后有内存趋势报告 | 0.15 |
| 6 | 配置 Rsbuild 打包分析 | `rsbuild.config.ts` 修改 | `RSBUILD_ANALYZE=true pnpm build` 输出分析报告 | 0.15 |
| 7 | 实现性能数据持久化 | `metricsStore.ts` | 生产环境 batch 上报成功 | 0.1 |
| 8 | 实现性能监控页面 | `views/performance/index.vue` | `/performance` 路由可访问，四模块正常渲染 | 0.3 |
| 9 | 实现 YiAi 性能数据 API | `services/performance/metrics_service.py` | API 可正常读写 MongoDB | 0.15 |
| 10 | 创建性能回归 CI 流水线 | `.github/workflows/perf-check.yml` | PR 中触发 Lighthouse CI 检查 | 0.15 |
| 11 | 集成测试 + 端到端验证 | 完整流程验证 | 所有性能指标可采集，路由懒加载正常，监控页面正常 | 0.15 |

**总计：** 1.95d（自研 Web Vitals 替代 web-vitals 库 +0.05d，性能监控页面独立路由 +0.35d，较原始 1.5d 增加 0.45d）

---
