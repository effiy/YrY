# YrySkillReport · 技能评分报告组件

> Vanilla 组件 · 自定义元素 `<yry-skill-report>` · 自包含技能评分报告页面

## 文件

```
yry-skill-report/
├── index.html    # Demo 预览 + 使用说明
├── index.js      # 数据获取 + 6 标签页渲染逻辑
└── index.css     # 组件样式 (skill-grid · dim-grid · signal-grid · panel-grid 等)
```

## 功能

- 自包含技能评分报告 — 一行 `<yry-skill-report>` 替代整个报告页主体
- 6 个标签页自动渲染：概览 · 技能清单 · 维度评分 · 范式合规 · 趋势 · 成熟度
- 自动 fetch `data-summary-url` 并填充所有面板
- 派发 `yry-skill-report-ready` / `yry-skill-report-kpi` / `yry-skill-report-error` 事件

## 使用

```html
<link rel="stylesheet" href="../../../../cdn/yry-skill-report/index.css">
<script src="../../../../cdn/shared-reports/index.js"></script>
<script src="../../../../cdn/shared/index.js"></script>
<script src="../../../../cdn/yry-skill-report/index.js"></script>

<yry-skill-report data-summary-url="../自我改进/summary.json"></yry-skill-report>
<script>YrY.initTabs('#main-tabs');</script>
```

## 属性

| 属性 | 默认 | 说明 |
|------|------|------|
| `data-summary-url` | `../自我改进/summary.json` | summary.json 的 URL |

## 依赖

- `shared-reports/index.js` — `window.YrYReports` 工具集 (评分颜色/等级/badge/SVG sparkline)
- `shared/index.js` — `window.YrY.initTabs` 与 `switchPanel` 标签页逻辑
- `theme/index.css` — 设计令牌
- `shared-reports/index.css` — `.stat` `.intro` `.card` `.table` 基础样式
- `yry-tabs-panel/index.css` — `.yry-tabs` `.yry-tab` `.yry-panel` 标签页样式
