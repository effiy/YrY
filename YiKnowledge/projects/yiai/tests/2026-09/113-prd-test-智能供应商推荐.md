---

doc_type: test
prd_test_id: "YA-09-113"
title: "YA-09-113: 智能供应商推荐 — 测试方案"
status: 已完成
priority: P1
owner: Claude + Linter
created: 2026-09-23
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
source_task: "113-prd-task-智能供应商推荐.md"

type: test
---

# YA-09-113: 智能供应商推荐 — 测试方案

| 场景 | 期望 |
|------|------|
| 全部 healthy | recommended = 排名第一的供应商，healthy_count = N |
| mixed 状态 | healthy > degraded > down 排序 |
| 全部 down | recommended = null |
| 无供应商 | providers = [], counts 全 0 |
| RPC 调用 | 返回 ProviderRecommendation 结构 |
| YiVad 排名卡片 | #1-#N 排序 + 状态标签 + "Best" 标记 |

## 测试命令

```bash
pytest tests/unit/services/test_provider_health.py -v
```