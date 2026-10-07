---

doc_type: test
prd_test_id: "YA-09-103"
title: "YA-09-103: 供应商使用统计 — 测试方案"
status: 已完成
priority: P1
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
estimate: 0.1
source_task: "103-prd-task-供应商使用统计.md"

type: test
---

# YA-09-103: 供应商使用统计 — 测试方案

## 测试用例

| 场景 | 期望 |
|------|------|
| 3 供应商数据 | 返回 3 条，含 provider/count/success |
| 无数据 | [] |
| count ≥ success | 永远成立（success 是 count 的子集） |
| MongoDB 不可达 | []（不抛异常） |

## 测试命令

```bash
pytest tests/unit/services/test_provider_health.py::TestProviderBreakdown -v
```