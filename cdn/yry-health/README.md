# YryHealth · 健康报告样式

> 健康报告页面专属样式: 22KB CSS · 评分环 · 维度卡片 · 趋势图

## 文件

```
yry-health/
├── index.html    # 健康报告样式预览页
└── index.css     # 健康报告专属样式 (22KB CSS)
```

## 状态

⚠️ **待完善** — 缺少独立 JS 交互层

## 功能

- 健康报告页面的布局和样式
- 评分环 (`.h-score-ring`) 样式
- 维度卡片和趋势图样式
- 健康条分段颜色

## 加载

```html
<link rel="stylesheet" href="../../../../cdn/yry-health/index.css">
```

## 关联

- 健康数据: `health-report/index.json`
- 健康趋势: `docs/健康报告/health-cdn-*.html`
- 评分更新: `lib/cdn-score-updater.mjs`
- 健康检查: `node skills/rui-bot/send.mjs health`