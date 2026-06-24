# YryCdnStyles · CDN 首页样式集

> CDN 资源库首页 (`cdn/index.html`) 页面级样式集 · 从内联 `<style>` 迁出

## 文件

```
yry-cdn-styles/
├── index.html    # Demo 预览
└── index.css     # 首页样式 (217 行)
```

## 功能

- 两大样式块:
  - **页面级**: card-grid · item-card (icon/size-info 隐藏 · item-links 单行) · score-methodology-title/desc · sr-legend-hint
  - **评分体系**: score-methodology (sm-cards/sm-card/sm-card-header/sm-card-title/sm-card-grade.grade-A/B/C/D/sm-card-desc/sm-card-meta) + score-report (sr-header/sr-title/sr-badge/sr-grid/sr-cell/sr-breakdown-title/sr-dim/sr-compare/sr-summary-text/sr-link)
- 响应式断点 (640px)

## 使用

```html
<link rel="stylesheet" href="../cdn/yry-cdn-styles/index.css">
```

## 依赖

- `cdn/theme/index.css` — 设计令牌
- `cdn/yry-item-card/index.css` — 基础 item-card 样式 (本样式集对其做覆盖)
