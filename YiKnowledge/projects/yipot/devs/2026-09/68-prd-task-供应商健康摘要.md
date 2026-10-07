---

doc_type: module
prd_id: "PO-09-68"
title: "PO-09-68-dev: 供应商健康摘要 — 开发方案"
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

# PO-09-68-dev: 供应商健康摘要 — 开发方案

## 改动清单

### 1. `History/index.jsx` — loadYiAiStats 提取健康计数

```jsx
const providers = health?.providers || {};
const provEntries = Object.values(providers);
const healthyCount = provEntries.filter(p => p.status === 'healthy').length;
setYiAiStats({ ..., healthyProviders: healthyCount, totalProviders: provEntries.length });
```

### 2. `History/index.jsx` — Stats bar 模板

```jsx
{yiAiStats.totalProviders > 0 && (
    <span className={yiAiStats.healthyProviders === yiAiStats.totalProviders
        ? 'text-green-500' : 'text-yellow-500'}>
        {yiAiStats.healthyProviders}/{yiAiStats.totalProviders} healthy
    </span>
)}
```

### 3. 完整 Stats Bar

```
142 records · 89 unique · ~120 avg | 142 Ai tr. · 5 langs
  320 cached · 5/5 healthy · 85% 👍 · en→zh zh→en  [🔄] [just now] [🔍]
```

## 验证步骤

1. 启动 YiAi + 多个翻译引擎
2. 打开 YiPot History
3. 确认显示 "5/5 healthy"（绿）或 "3/5 healthy"（黄）