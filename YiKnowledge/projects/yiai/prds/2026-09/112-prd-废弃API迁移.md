---

doc_type: module
prd_id: "YA-09-112"
title: "YA-09-112: Python 3.12+ 废弃 API 迁移 — datetime.utcnow() 替换"
status: 已完成
priority: P1
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
related_tasks: ["112-prd-task-废弃API迁移.md"]
related_tests: ["112-prd-test-废弃API迁移.md"]

type: 需求
---

# YA-09-112: Python 3.12+ 废弃 API 迁移

> **PRD 版本**：v1.0 · **状态**：已完成

## 1. 背景

Python 3.12 正式标记 `datetime.utcnow()` 为废弃 API（[PEP 615](https://peps.python.org/pep-0615/)），Python 3.14+ 将移除该函数。YiAi 代码库中存在 **15 处** 调用，分布在 10 个文件中，主要集中在 `services/analytics/` 和 `services/export/` 模块。

使用 `utcnow()` 返回的 "naive" datetime 对象缺少时区信息，在跨时区比较、序列化、数据库存储时容易产生歧义。替换为 `datetime.now(timezone.utc)` 产生 "aware" datetime 对象，语义明确、行为一致。

## 2. 用户问题

- **目标用户**：后端开发者 / DevOps
- **问题陈述**：Python 3.14 升级后 `utcnow()` 被移除，当前代码将直接报 `AttributeError`
- **证据**：强 — `python -W error::DeprecationWarning` 在 3.12+ 即可复现

## 3. 范围

**In scope**：`src/` 下全部 15 处 `datetime.utcnow()` 调用，含导入语句同步修改

**Out of scope**：其他废弃 API（`datetime.utcfromtimestamp` 等，当前代码库未使用）

## 4. 影响文件

| 文件 | 调用数 | 导入状态 |
|------|--------|---------|
| `services/analytics/aggregator/efficiency.py` | 1 | 缺少 `timezone` |
| `services/analytics/aggregator/quality.py` | 1 | 缺少 `timezone` |
| `services/analytics/aggregator/file_alerts.py` | 1 | ✓ 已有 `timezone` |
| `services/analytics/file_alerts.py` | 1 | 缺少 `timezone` |
| `services/analytics/project_dashboard.py` | 1 | 缺少 `timezone` |
| `services/analytics/module_dashboard.py` | 3 | 缺少 `timezone` |
| `services/analytics/collector.py` | 2 | 缺少 `timezone` |
| `services/export/export_service.py` | 2 | 缺少 `timezone` |
| `services/report/report_service.py` | 2 | 缺少 `timezone` |
| `server/routes/analytics.py` | 1 | 缺少 `timezone` |

## 5. 实现

```python
# Before (Python 3.12+ DeprecationWarning)
from datetime import datetime
now = datetime.utcnow()

# After (timezone-aware)
from datetime import datetime, timezone
now = datetime.now(timezone.utc)
```

对于仅需 ISO 字符串的场景，`.isoformat()` 行为不变：
```python
# Before
datetime.utcnow().isoformat()  # "2026-09-23T15:30:00.123456"
# After  
datetime.now(timezone.utc).isoformat()  # "2026-09-23T15:30:00.123456+00:00"
```

**注意**：替换后 ISO 字符串末尾包含 `+00:00` 时区后缀。对 `[:10]` 切片（取日期部分）或 `.strftime()` 格式化无影响。

## 6. 验收标准

- [x] `grep -rn "\.utcnow()" src/` 返回 0 结果
- [x] 10 个文件的 `from datetime import` 导入均包含 `timezone`
- [x] 457 个单元测试全部通过
- [x] 无 `DeprecationWarning` 残留