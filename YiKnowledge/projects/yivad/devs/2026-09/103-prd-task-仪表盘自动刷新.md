---

doc_type: task
prd_task_id: "YV-09-103"
title: "YV-09-103: 仪表盘自动刷新 — 技术设计"
status: 已完成
priority: P2
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiVad
project_id: yivad
prd_month: "202609"
estimate_frontend: 0.1
source_prd: "103-prd-仪表盘自动刷新.md"

type: task
---

# YV-09-103: 自动刷新 — 技术设计

## 实现

```typescript
const polling = ref(false);
let pollTimer: ReturnType<typeof setInterval> | null = null;

function togglePolling() {
  polling.value = !polling.value;
  if (polling.value) pollTimer = setInterval(fetchAll, 30000);
  else { clearInterval(pollTimer); pollTimer = null; }
}

// onUnmounted: if (pollTimer) clearInterval(pollTimer);
```

## 非功能需求

| 维度 | 目标 |
|------|------|
| 内存 | onUnmounted clearInterval |
| 频率 | 30s，避免过度请求 |