---

doc_type: test
prd_test_id: "YV-09-100"
title: "YV-09-100: 翻译分析仪表盘 — ECharts 可视化 — 测试方案"
status: 已完成
priority: P2
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiVad
project_id: yivad
prd_month: "202609"
estimate: 0.25
source_task: "100-prd-task-翻译分析仪表盘.md"
source_prds: ["100-prd-翻译分析仪表盘"]
tags: [test, dashboard, echarts, vue3, edge-cases]
benefit: "测试用例：翻译分析仪表盘"
lifecycle: active

type: test
---

# YV-09-100: 翻译分析仪表盘 — 测试方案

> **版本**：v2.0 · **人天**：0.25d · **状态**：已完成

---

## 1. 测试范围

| 维度 | 说明 |
|------|------|
| 组件 | `TranslationAnalytics.vue` |
| API | `translationService.ts`（getProviderHealth/getHourlyTrend/getProviderBreakdown） |
| 依赖 | YiAi 后端需运行，ECharts 需正常渲染 |

---

## 2. 功能测试

### TC-01：KPI 卡片渲染

| # | 场景 | 期望 |
|---|------|------|
| 1.1 | 正常数据 | 5 卡片显示数值+单位 |
| 1.2 | API 返回 0 | 显示 "0"（非 "—"） |
| 1.3 | API 返回 null | 显示 "—" |
| 1.4 | 响应式布局 xs | 2 列 |
| 1.5 | 响应式布局 sm | 3 列 |
| 1.6 | 响应式布局 md+ | 5 列 |

### TC-02：ECharts 图表

| # | 场景 | 期望 |
|---|------|------|
| 2.1 | 饼图数据正常 | 环形饼图渲染，标签+百分比 |
| 2.2 | 饼图数据为空 | 不崩溃，空白图表 |
| 2.3 | 柱状图颜色编码 | 绿≥90%, 黄≥70%, 红<70% |
| 2.4 | 折线图 dataZoom | 滑块可拖拽，图表缩放 |
| 2.5 | 窗口 resize | 图表自适应重绘 |

### TC-03：供应商表格

| # | 场景 | 期望 |
|---|------|------|
| 3.1 | 数据正常 | 列表渲染，含 Provider/Calls/Success/Success Rate |
| 3.2 | Calls 排序 | 点击列头排序 |
| 3.3 | 空数据 | "No data yet" |
| 3.4 | Success Rate 进度条 | `el-progress` 颜色编码 |

### TC-04：控制栏

| # | 场景 | 期望 |
|---|------|------|
| 4.1 | 切换 24h | 数据刷新 |
| 4.2 | 切换 30d | 全部图表+表格刷新 |
| 4.3 | 点击 Refresh | loading 状态 + 数据刷新 |
| 4.4 | 自动刷新（后续） | 每 30s 自动拉取 |

---

## 3. 边界与异常测试

### TC-10：API 失败

| # | 场景 | 期望 |
|---|------|------|
| 10.1 | YiAi 不可达 | `el-alert` 错误提示 + Retry 按钮 |
| 10.2 | 部分 API 失败 | 成功的图表正常渲染，失败的 skip |
| 10.3 | 网络超时 | 错误提示，不影响页面其他元素 |

### TC-11：内存泄漏

| # | 场景 | 期望 |
|---|------|------|
| 11.1 | 组件卸载 | ECharts 实例 `dispose()` |
| 11.2 | 频繁 resize | 无内存增长（Chrome DevTools Memory） |
| 11.3 | 频繁切换时间范围 | setOption notMerge 防止数据残留 |

### TC-12：暗色模式

| # | 场景 | 期望 |
|---|------|------|
| 12.1 | 切换到暗色模式 | 图表颜色可读 |
| 12.2 | KPI 卡片 | CSS 变量自动适配 |
| 12.3 | 表格 | Element Plus 暗色主题自动适配 |

---

## 4. 回归测试

| # | 验证内容 |
|---|---------|
| R1 | `translationService` 原有函数不受影响（`getTranslationAnalytics`、`getTranslationMemoryStats`） |
| R2 | `vue-tsc --noEmit` 无新增类型错误 |
| R3 | `pnpm build:dev` 构建成功 |

---

## 5. 兼容性测试

| 浏览器 | 版本 | 状态 |
|--------|------|------|
| Chrome | 最新 2 版本 | ✅ |
| Edge | 最新 2 版本 | ✅ |
| Firefox | 最新 2 版本 | ✅ |
| Safari | 最新 2 版本 | ✅ |

## 6. 测试命令

```bash
cd YiVad && pnpm test && pnpm type:check
```