---

doc_type: module
prd_id: "PO-09-67"
title: "PO-09-67-dev: 刷新时间戳 — 开发方案"
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

# PO-09-67-dev: 刷新时间戳 — 开发方案

## 改动清单

### 1. `History/index.jsx` — 新增状态 + 时间戳显示

**状态**：
```jsx
const [lastRefresh, setLastRefresh] = useState(null);
```

**loadYiAiStats 设置**：
```jsx
setLastRefresh(Date.now());
```

**UI 显示**（刷新按钮旁）：
```jsx
{lastRefresh && (
    <span className='text-[10px] text-default-400 whitespace-nowrap'>
        {(() => {
            const s = Math.floor((Date.now() - lastRefresh) / 1000);
            if (s < 5) return 'just now';
            if (s < 60) return `${s}s ago`;
            return `${Math.floor(s / 60)}m ago`;
        })()}
    </span>
)}
```

### 2. Stats bar 最终布局

```
[local] | [YiAi stats] ...flex... [🔄] [just now] [🔍 search]
```

## 验证步骤

1. 打开 History 页面，确认显示 "just now"
2. 等待 30 秒，确认显示 "30s ago"
3. 点击刷新，确认重置为 "just now"