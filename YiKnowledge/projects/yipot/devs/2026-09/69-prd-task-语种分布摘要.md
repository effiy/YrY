---

doc_type: module
prd_id: "PO-09-69"
title: "PO-09-69-dev: 语种分布摘要 — 开发方案"
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

# PO-09-69-dev: 语种分布摘要 — 开发方案

## 改动

### loadYiAiStats 提取 Top 3 语言

```jsx
topLangs: (analytics?.by_target_language || [])
    .sort((a, b) => b.count - a.count).slice(0, 3)
    .map(l => l.language),
```

### Stats bar 模板

```jsx
{yiAiStats.topLangs?.length > 0 && (
    <span className='text-default-500' title='Top target languages'>
        {yiAiStats.topLangs.join(' ')}
    </span>
)}
```

### 效果

```
5 langs zh en ja
```