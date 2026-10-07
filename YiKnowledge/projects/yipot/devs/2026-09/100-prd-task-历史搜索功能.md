---

doc_type: task
prd_task_id: "PO-09-100"
title: "PO-09-100: 历史搜索功能 — 技术设计"
status: 已完成
priority: P0
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
source_prd: "55-prd-历史搜索功能.md"

type: task
---

# PO-09-100: 历史搜索 — 技术设计

## 实现

```sql
-- 搜索 + 分页联动
SELECT COUNT(*) FROM history WHERE text LIKE '%q%' OR result LIKE '%q%'
SELECT * FROM history WHERE text LIKE '%q%' OR result LIKE '%q%'
  ORDER BY id DESC LIMIT 20 OFFSET N
```

**React 状态**：`searchQuery` → `onValueChange` → `setPage(1)` → `getData()`

**图标**：`HiOutlineSearch`（react-icons/hi）