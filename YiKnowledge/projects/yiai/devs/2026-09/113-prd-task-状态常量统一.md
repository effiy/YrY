---

doc_type: task
prd_task_id: "YA-09-113"
title: "YA-09-113: 状态常量统一 — 技术实现"
status: 已完成
priority: P2
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
source_prd: "113-需求-状态常量统一.md"

type: task
---

# YA-09-113: 状态常量统一 — 技术实现

## 变更文件

`services/analytics/aggregator/quality.py`

### 导入修正

```python
# Before
from data.database import db
from .helpers import _cache_key

# After
from data.database import db
from .helpers import _cache_key
from shared.status import CLOSED_STATUSES, ACTIVE_STATUSES, normalize_status_list
```

### 硬编码替换（9 处）

```python
# Before: 仅匹配 3 种状态（缺少 cancelled）
"status": {"$in": list(DONE_STATUSES)}  # → ["closed", "resolved", "done"]

# After: 匹配 4 种状态 + 8 种大小写变体
"status": {"$in": normalize_status_list(CLOSED_STATUSES)}
# → ["done", "closed", "resolved", "cancelled",
#    "Done", "Closed", "Resolved", "Cancelled", "Completed"]
```

### 影响范围

| 函数 | 使用次数 | 上下文 |
|------|---------|--------|
| `get_quality_metrics()` | 9 | MongoDB 聚合管道 `$match` 阶段 |

## 兼容性

- `normalize_status_list()` 返回列表，与原 `list()` 调用签名兼容
- 返回更多状态值（含遗留变体），不会漏掉数据
- MongoDB `$in` 查询语义不变