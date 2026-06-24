# YryHealthIndex · 健康报告索引组件

> Vanilla 自定义元素 `<yry-health-index>` · 零依赖 · 自包含数据获取 + 报告列表渲染

## 文件

```
yry-health-index/
├── index.html    # Demo 预览
├── index.js      # 组件逻辑 (vanilla JS custom element)
└── index.css     # 组件样式
```

## 功能

- 读取 `reports.json` 渲染健康报告历史列表
- 列: 日期 · 时间 · 评分 · 等级 · 诊断 · 操作
- 空状态引导运行 `node skills/rui-bot/send.mjs health --html`
- 错误状态降级显示
- XSS 防护: 所有用户数据经 `escapeHtml` / `escapeAttr` 转义

## 使用

```html
<link rel="stylesheet" href="../../cdn/yry-health-index/index.css">
<script src="../../cdn/yry-health-index/index.js"></script>
<yry-health-index data-src="reports.json"></yry-health-index>
```

## 属性

| 属性 | 默认 | 说明 |
|------|------|------|
| `data-src` | `reports.json` | 报告列表 JSON URL |

## 事件

- `yry-health-index-ready` — 组件已注册
- `yry-health-index-data` — 数据加载完成 (detail: `{ count, reports }`)
- `yry-health-index-error` — 数据加载失败 (detail: `{ error }`)

## 数据格式 (reports.json)

```json
[
  {
    "date": "2026-06-22",
    "time": "14:30",
    "score": 96,
    "grade": "A",
    "triggers": 1,
    "file": "health-2026-06-22.html"
  }
]
```

## 依赖

- `cdn/theme/index.css` — 设计令牌
- `cdn/shared-reports/index.css` — `.yry-badge` 等基础样式
