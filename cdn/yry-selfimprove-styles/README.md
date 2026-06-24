# YrySelfimproveStyles · 自我改进仪表板样式集

> 自我改进分析仪表板的页面级样式集 · 从 `docs/自我改进/index.html` 内联 `<style>` 迁出

## 文件

```
yry-selfimprove-styles/
├── index.html    # Demo 预览 (空壳)
└── index.css     # 仪表板样式 (217 行)
```

## 功能

- 15+ 命名空间样式: diag-grid · dim-grid · comp-grid · arch-summary · trend-chart · day-card · signal · skeleton · intro · branch · time-tabs · grade-bar · kpi-grid · priority-grid · diag-history · drift-grid · forecast · recurrence · skill-grid · dpr-table · ref-grid · flow-loop
- 响应式断点 (640px / 420px)

## 使用

```html
<link rel="stylesheet" href="../../cdn/yry-selfimprove-styles/index.css">
```

## 依赖

- `cdn/theme/index.css` — 设计令牌 (--yry-border / --yry-text2/3 / --yry-pass/warn/fail / --yry-accent / --yry-cyan)
- `cdn/shared-reports/index.css` — badge.A/B/C/D/.triggered/.clear 基础样式
