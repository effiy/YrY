---

doc_type: test
prd_test_id: "YA-09-113"
title: "YA-09-113: 状态常量统一 — 测试方案"
status: 已完成
priority: P2
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"

type: test
---

# YA-09-113: 状态常量统一 — 测试方案

> **测试结果**：457 passed, 0 failed

## 1. 静态验证

| 场景 | 预期 |
|------|------|
| `quality.py` 无本地 `DONE_STATUSES` 定义 | `grep -c "DONE_STATUSES =" quality.py` → 0 |
| `quality.py` 无本地 `OPEN_STATUSES` 定义 | `grep -c "OPEN_STATUSES =" quality.py` → 0 |
| `quality.py` 导入 `CLOSED_STATUSES` | `grep -c "from shared.status import" quality.py` → 1 |
| 所有 `$in` 查询使用 `normalize_status_list` | `grep -c "normalize_status_list" quality.py` → 9 |

## 2. 回归测试

```bash
# 全量单元测试
python -m pytest tests/unit/ -q
# 457 passed

# shared/status 模块测试
python -m pytest tests/unit/shared/test_error_codes.py -v
# 全部通过
```

## 3. 行为验证

| 场景 | 旧行为 | 新行为 |
|------|--------|--------|
| 数据含 `"cancelled"` 状态 | 不计入 done | 计入 done ✓ |
| 数据含 `"Done"` (title-case) | 不计入 done | 计入 done ✓ |
| 数据含 `"Completed"` | 不计入 done | 计入 done ✓ |