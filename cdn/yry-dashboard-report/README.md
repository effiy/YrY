# YryDashboardReport · 评分仪表板报告组件

> 文档中心首页评分仪表板样式与脚本 · 从 `docs/css/score-report.css` + `docs/js/score-report.js` 整合迁出

## 文件

```
yry-dashboard-report/
├── index.html    # Demo 预览
├── index.js      # 评分报告数据填充脚本 (673 行)
└── index.css     # 评分方法 + 实时评分报告 + 卡片网格 + 帮助面板 + 概览模式样式 (2218 行)
```

## 功能

- **评分方法 (Score Methodology)** — 八维加权健康评估模型 (PHI/SHI/TQI/SII/AQI/DQI/UPHI/DHI) 8 卡片展示
- **实时评分报告 (Score Report)** — 综合评分网格 · 维度分解 · 趋势预测 · P0 告警
- **数据源优先级** — `score-report.json` → `summary.json` → `cdn-summary/index.json` → 内置默认值
- **工具函数** — 浏览器端复刻 `lib/scoring.mjs` 核心逻辑 (getGrade / classifyScore / detectTrend)
- **UX 增强样式 (2026-06-25 迁入)**:
  - **报告卡片网格 (`.yry-card-grid`)** — 卡片化入口展示 · hover 抬升 · 数据热度着色 · 访问计数徽章 · 排序下拉 · 紧凑视图 · 复制链接
  - **章节锚点复制按钮 (`.yry-anchor-copy`)** — 标题 hover 显示 # 按钮 · 一键复制深链
  - **滚动揭示动画 (`.score-report`)** — IntersectionObserver 触发淡入上滑
  - **概览模式 (`#panelDashboard.is-overview`)** — Tab 内全部 section 折叠为标题 · 单击展开
  - **页面背景径向渐变 (`body`)** — 顶部柔光 · 底部紫色光晕
  - **帮助面板 (`.yry-help-*`)** — `?` 键调出快捷键列表 · 底部重置偏好按钮
- **通用类** — `.yry-accent-text` · `.sr-intro-box` · `.sr-footer-note` · `.sr-table` · `.sr-subsection` 等

## 使用

```html
<link rel="stylesheet" href="../cdn/yry-dashboard-report/index.css">
<script src="../cdn/yry-dashboard-report/index.js"></script>
```

组件为脚本+样式集，非自定义元素。脚本在加载后自动填充页面中 `#sm-grade-*` / `#sr-*` 等 ID 元素。

## 依赖

- `cdn/theme/index.css` — 设计令牌
- `cdn/shared-reports/index.js` — `window.YrYReports` 工具函数
- `cdn/shared/index.js` — `window.YrY.initTabs`
