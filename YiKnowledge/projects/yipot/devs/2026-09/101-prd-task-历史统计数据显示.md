---

doc_type: task
prd_task_id: "PO-09-101"
title: "PO-09-101: 历史统计数据显示 — 技术设计"
status: 已完成
priority: P1
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
source_prd: "56-prd-历史统计数据显示.md"

type: task
---

# PO-09-101: 统计显示 — 技术设计

## 实现

```sql
SELECT COUNT(*) as c FROM history
SELECT COUNT(DISTINCT text) as c FROM history
SELECT AVG(LENGTH(result)) as c FROM history
```

React：`const [stats, setStats] = useState({total:0, uniqueSources:0, avgLength:0})` → `loadStats()` on mount