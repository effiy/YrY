# YryTestReport · 测试报告组件

> Vanilla 自定义元素 `<yry-test-report>` · 零依赖 · 自包含数据获取 + 6 面板 tab 渲染

## 文件

```
yry-test-report/
├── index.html    # Demo 预览
├── index.js      # 组件逻辑 (vanilla JS custom element)
└── index.css     # 组件样式
```

## 功能

- 读取 `自我改进/summary.json` 渲染 6 个 tab 面板
- 三维加权评分 (覆盖率50% · 通过率30% · 充分度20%)
- 工程成熟度 7 维评估 + SVG 雷达图
- 6 大测试套件清单 + 成熟度阶段条
- 改进速率 + 风险分析面板
- XSS 防护: 所有用户数据经 `escapeHtml` 转义

## 使用

```html
<link rel="stylesheet" href="../../cdn/yry-test-report/index.css">
<script src="../../cdn/shared/index.js"></script>
<script src="../../cdn/yry-test-report/index.js"></script>
<yry-test-report></yry-test-report>
```

## 属性

| 属性 | 默认 | 说明 |
|------|------|------|
| `data-health-summary` | `../自我改进/summary.json` | 健康摘要 JSON URL |

## 事件

- `yry-test-report-ready` — 组件已注册
- `yry-test-report-data` — 数据加载完成 (detail: `{ testScore, covScore, passScore, totalCases, version }`)

## 依赖

- `cdn/shared/index.js` — `YrY.initTabs`
- `cdn/theme/index.css` — 设计令牌
- `cdn/yry-tabs-panel/index.css` — tab 样式
