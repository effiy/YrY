# YryComponentReport · 组件评分报告组件

> Vanilla 自定义元素 `<yry-component-report>` · 零依赖 · 自包含数据获取 + 6 面板 tab 渲染

## 文件

```
yry-component-report/
├── index.html    # Demo 预览
├── index.js      # 组件逻辑 (vanilla JS custom element, 含 62 组件清单)
└── index.css     # 组件样式
```

## 功能

- 读取 `cdn-summary/index.json` + `自我改进/summary.json` 渲染 6 个 tab 面板
- 四维加权评分 (CSS规范性30% · API一致性25% · 可访问性20% · 响应式25%)
- 62 组件清单 + 10 大类别评分 + 形态分布
- SVG 趋势对比图 + 问题追踪 + 成熟度/速率/风险面板
- XSS 防护: 所有用户数据经 `escapeHtml` 转义

## 使用

```html
<link rel="stylesheet" href="../../cdn/yry-component-report/index.css">
<script src="../../cdn/shared/index.js"></script>
<script src="../../cdn/yry-component-report/index.js"></script>
<yry-component-report></yry-component-report>
```

## 属性

| 属性 | 默认 | 说明 |
|------|------|------|
| `data-cdn-summary` | `../../cdn/cdn-summary/index.json` | CDN 摘要 URL |
| `data-health-summary` | `../自我改进/summary.json` | 健康摘要 URL |

## 事件

- `yry-component-report-ready` — 组件已注册
- `yry-component-report-data` — CDN 数据加载完成 (detail: `{ overall, compCount, aCountPct, version }`)

## 依赖

- `cdn/shared/index.js` — `YrY.initTabs`
- `cdn/theme/index.css` — 设计令牌
- `cdn/yry-tabs-panel/index.css` — tab 样式
