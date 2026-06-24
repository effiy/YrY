# YryScoreReport · 评分报告组件

> Vanilla 自定义元素 `<yry-score-report>` · 零依赖 · 自包含数据获取 + 多面板渲染

## 文件

```
yry-score-report/
├── index.html    # Demo 预览
├── index.js      # 组件逻辑 (vanilla JS custom element)
└── index.css     # 组件样式
```

## 功能

- 读取 `score-report.json` 并渲染完整评分报告
- 包含: 头部 · 综合评分网格 · 分类汇总 · 维度分解表 · 改进建议 · 架构合规 · AI 摘要 · 亮点/风险
- 自动分级 (A≥90 / B≥75 / C≥60 / D<60) 与状态色 (critical/warn/ok)
- XSS 防护: 所有用户数据经 `escapeHtml` 转义

## 使用

```html
<link rel="stylesheet" href="../../cdn/yry-score-report/index.css">
<script src="../../cdn/yry-score-report/index.js"></script>
<yry-score-report data-src="score-report.json"></yry-score-report>
```

## 属性

| 属性 | 默认 | 说明 |
|------|------|------|
| `data-src` | `score-report.json` | 评分数据 JSON URL |

## 事件

- `yry-score-report-ready` — 组件已注册
- `yry-score-report-error` — 数据加载失败 (detail: `{ error }`)

## 数据格式 (score-report.json)

```json
{
  "meta": { "title": "...", "version": "1.0", "date": "2026-06-22", "dataPoints": 30 },
  "composite": { "score": 85, "grade": "A", "label": "优秀" },
  "breakdown": [
    { "label": "维度名", "category": "cat", "score": 90, "grade": "A",
      "weight": "10%", "status": "ok", "gap": 10, "recommendation": "..." }
  ],
  "recommendations": [
    { "priority": "P0", "dim": "维度", "action": "改进动作" }
  ],
  "architecture": {
    "grade": "A", "passed": 9, "failed": 1,
    "dims": [{ "dim": "内核体积", "passed": true }]
  },
  "diagnostics": { "triggered": 1, "total": 8, "rate": 12.5 },
  "contribution": { "dragTotal": 5.2 },
  "categories": { "cat": { "score": 85, "dimCount": 5, "weight": "30%" } },
  "summary": {
    "summary": "...",
    "highlights": ["..."],
    "risks": ["..."]
  }
}
```

## 依赖

- 共享样式 `cdn/theme/index.css` (提供 `--yry-*` design tokens,可降级使用 fallback)
