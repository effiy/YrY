# YryTrendStyles · 趋势报告样式集

> 技术趋势监控仪表板页面级样式集 · 从 `docs/趋势报告/index.html` 内联 `<style>` 迁出

## 文件

```
yry-trend-styles/
├── index.html    # Demo 预览
└── index.css     # 仪表板样式 (56 行)
```

## 功能

- 9 命名空间样式: src-grid (数据源卡片) · vel-grid (速率项) · cat-bars (分类条) · quality-card (数据质量) · trend-sparkline-wrap (趋势图) · health-ref (健康引用) · freshness-dot (新鲜度指示) · momentum-bar (动量条)
- 响应式断点 (640px)

## 使用

```html
<link rel="stylesheet" href="../../cdn/yry-trend-styles/index.css">
```

## 依赖

- `cdn/theme/index.css` — 设计令牌
