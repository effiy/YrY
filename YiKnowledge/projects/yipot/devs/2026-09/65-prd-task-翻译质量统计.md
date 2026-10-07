---

doc_type: module
prd_id: "PO-09-65"
title: "PO-09-65-dev: 翻译质量统计 — 开发方案"
status: 已完成
priority: P2
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"

type: task
---

# PO-09-65-dev: 翻译质量统计 — 开发方案

## 改动清单

### 1. `History/index.jsx` — loadYiAiStats 新增反馈数据

```jsx
const [analytics, topPairs, memStats, health] = await Promise.all([
    api.translation.getAnalytics?.(7).catch(() => null),
    api.translation.getTopLanguagePairs?.(5).catch(() => null),
    api.translation.getMemoryStats?.().catch(() => null),
    api.translation.getProviderHealth?.(168).catch(() => null),  // 7 days
]);
const fb = health?.feedback || { good: 0, bad: 0 };
const fbTotal = fb.good + fb.bad;
setYiAiStats({
    ...,
    feedbackGood: fb.good,
    feedbackTotal: fbTotal,
    feedbackPct: fbTotal > 0 ? Math.round((fb.good / fbTotal) * 100) : null,
});
```

### 2. `History/index.jsx` — Stats bar 模板新增反馈率

```jsx
{yiAiStats.feedbackTotal > 0 && (
    <span title={`${yiAiStats.feedbackGood} good · ${yiAiStats.feedbackTotal - yiAiStats.feedbackGood} bad`}
        className={yiAiStats.feedbackPct >= 80 ? 'text-green-500'
            : yiAiStats.feedbackPct >= 50 ? 'text-yellow-500' : 'text-red-500'}>
        {yiAiStats.feedbackPct}% 👍
    </span>
)}
```

### 3. 完整 Stats Bar 效果

```
142 records · 89 unique · ~120 avg | 142 Ai tr. · 5 langs · 320 cached · 85% 👍 · en→zh zh→en
```

| 指标 | 来源 | 颜色 |
|------|------|------|
| N records | 本地 SQLite | 灰 |
| N Ai tr. | YiAi 7d analytics | 灰 |
| N cached | YiAi memory_stats | 紫 |
| **N% 👍** | **YiAi feedback ratio** | **绿/黄/红** |
| en→zh | YiAi top pairs | 灰 |

## 验证步骤

1. 在 YiPot TargetArea 中点击几次 👍 和 👎
2. 打开 History 页面
3. 确认显示 `N% 👍` 反馈率（颜色正确）