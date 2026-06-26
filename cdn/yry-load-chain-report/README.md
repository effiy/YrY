# YryLoadChainReport · 加载链报告组件

> Vanilla 自定义元素 `<yry-load-chain-report>` · 零依赖 · 自包含数据获取 + 6 面板 tab 渲染

## 文件

```
yry-load-chain-report/
├── index.html    # Demo 预览
├── index.js      # 组件逻辑 (vanilla JS custom element)
└── index.css     # 组件样式
```

## 功能

- 读取 `自我改进/summary.json`
- 渲染 6 个 tab 面板: 概览 · 加载链路 · 可靠性 · 容错与回退 · 性能分析 · 诊断
- 五步加载链流程可视化 (shared.css → theme.css → 组件CSS → Vue3 → 组件JS)
- 三维加权评分 (可靠性40% · 容错性35% · 回退策略25%)
- XSS 防护: 所有用户数据经 `escapeHtml` 转义

## 使用

```html
<link rel="stylesheet" href="../../cdn/yry-load-chain-report/index.css">
<script src="../../cdn/shared/index.js"></script>
<script src="../../cdn/yry-load-chain-report/index.js"></script>
<yry-load-chain-report></yry-load-chain-report>
```

## 属性

| 属性 | 默认 | 说明 |
|------|------|------|
| `data-health-summary` | `../自我改进/summary.json` | 健康摘要 URL |

## 事件

- `yry-load-chain-report-ready` — 组件已注册
- `yry-load-chain-report-data` — CDN 数据加载完成 (detail: `{ loadScore, avgLoad, relPct, firstPaint, cdnHit, version }`)

## 依赖

- `cdn/shared/index.js` — 提供 `YrY.initTabs` 用于 tab 切换
- `cdn/theme/index.css` — 设计令牌
- `cdn/yry-tabs-panel/index.css` — tab 样式
