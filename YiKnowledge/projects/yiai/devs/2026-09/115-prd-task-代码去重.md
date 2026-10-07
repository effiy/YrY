---

doc_type: task
prd_task_id: "YA-09-115"
title: "YA-09-115: 代码去重 — 技术实现"
status: 已完成
priority: P3
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
source_prd: "115-需求-代码去重.md"

type: task
---

# YA-09-115: 代码去重 — 技术实现

## 变更文件

`server/routes/dashboard/rss.py` — `rss_stats()` 函数

### 删除内容（22 行）

```python
def _article_ts(a: dict) -> int | None:
    ts = a.get("published_parsed") or a.get("createdTime") or a.get("published")
    if ts is None: return None
    if isinstance(ts, int | float):
        i = int(ts)
        return i * 1000 if len(str(abs(i))) <= 10 else i
    ts_str = str(ts).strip()
    if not ts_str: return None
    _head = ts_str.split(".")[0]
    if _head.lstrip("-").isdigit():
        i = int(_head)
        return i * 1000 if len(_head.lstrip("-")) <= 10 else i
    for fmt in ("%Y-%m-%dT%H:%M:%S.%fZ", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S", "%Y-%m-%d"):
        try: return int(datetime.strptime(ts_str, fmt).replace(tzinfo=tz.utc).timestamp() * 1000)
        except ValueError: continue
    try: return int(datetime.fromisoformat(ts_str.replace("Z", "+00:00")).timestamp() * 1000)
    except Exception: return None
```

### 新增导入

```python
from data.date_helpers import parse_ms_ts
```

### 移除导入

```python
from datetime import datetime
from datetime import timezone as tz
```

### 调用替换

```python
# Before
ts = _article_ts(a)

# After
ts = parse_ms_ts(a.get("published_parsed") or a.get("createdTime") or a.get("published"))
```

## 净变更

- **删除**：24 行（22 行函数 + 2 行导入）
- **新增**：2 行（1 行导入 + 1 行调用）
- **净减**：22 行