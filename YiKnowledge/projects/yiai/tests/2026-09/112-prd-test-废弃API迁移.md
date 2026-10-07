---

doc_type: test
prd_test_id: "YA-09-112"
title: "YA-09-112: 废弃 API 迁移 — 测试方案"
status: 已完成
priority: P1
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"

type: test
---

# YA-09-112: 废弃 API 迁移 — 测试方案

> **测试结果**：457 passed, 0 failed

## 1. 静态验证

| 场景 | 命令 | 预期 |
|------|------|------|
| 零残留 `utcnow()` | `grep -rn "\.utcnow()" src/` | 无输出 |
| `timezone` 导入齐全 | `grep -L timezone` on target files | 全部通过 |

## 2. 回归测试

```bash
# 全量单元测试
python -m pytest tests/unit/ -q
# 457 passed

# 受影响模块专项测试
python -m pytest tests/unit/services/test_provider_health.py -v  # 16 passed
python -m pytest tests/unit/services/ -v                           # 全部通过
python -m pytest tests/unit/domain/test_execution.py -v           # 全部通过
```

## 3. 运行时验证

```python
# 确认 timezone-aware datetime 行为正确
>>> from datetime import datetime, timezone
>>> dt = datetime.now(timezone.utc)
>>> dt.tzinfo is not None
True
>>> dt.isoformat()
'2026-09-23T15:30:00.123456+00:00'
>>> dt.strftime('%Y-%m-%d')
'2026-09-23'
```