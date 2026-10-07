---

doc_type: test
prd_test_id: "YA-09-114"
title: "YA-09-114: 异常类型规范化 — 测试方案"
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

# YA-09-114: 异常类型规范化 — 测试方案

> **测试结果**：457 passed, 0 failed

## 1. 测试矩阵

| 场景 | 预期 | 测试 |
|------|------|------|
| `state.update("nonexistent", data)` | `BusinessException(DATA_NOT_FOUND)` | `test_update_not_found_raises` ✓ |
| `state.delete("nonexistent")` | `BusinessException(DATA_NOT_FOUND)` | `test_delete_not_found_raises` ✓ |
| `rss.set_config(type="interval", interval=30)` | `BusinessException(INVALID_PARAMS)` | 静态验证 |
| `rss.set_config(type="cron", hour=25)` | `BusinessException(INVALID_PARAMS)` | 静态验证 |

## 2. 异常类型搜索验证

```bash
# RPC 可见的 ValueError（排除翻译 provider __init__、Pydantic validator、migration）
grep -rn "raise ValueError" src/domain/state/ src/domain/rss/ src/services/notification/ src/server/routes/
# 预期：0 结果
```

## 3. 回归测试

```bash
python -m pytest tests/unit/ -q
# 457 passed
```