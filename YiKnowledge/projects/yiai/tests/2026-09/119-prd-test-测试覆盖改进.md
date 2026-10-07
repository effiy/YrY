---

doc_type: test
prd_test_id: "YA-09-119"
title: "YA-09-119: 测试覆盖改进 — 测试方案"
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

# YA-09-119: 测试覆盖改进 — 测试方案

> **测试结果**：492 passed, 0 failed (+35 from baseline 457)

## 新增用例覆盖矩阵

| 模块 | 文件 | 用例 | 覆盖类型 |
|------|------|------|---------|
| `shared/url_guard.py` | `test_url_guard.py` | 21 | 拦截 12 + 放行 5 + 边界 4 |
| `server/routes/mcp.py` | `test_mcp_extract.py` | 10 | str/list/None/attr/model_dump/fallback |
| `services/notification` | `test_notification_service.py` | 4 | BusinessException + helpers |

## 回归

```bash
python -m pytest tests/unit/ -q
# 492 passed, 0 failed
```