---

doc_type: test
prd_test_id: "YA-09-101"
title: "YA-09-101: 供应商健康监控 — 测试方案"
status: 已完成
priority: P0
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
estimate: 0.1
source_task: "101-prd-task-供应商健康监控.md"

type: test
---

# YA-09-101: 供应商健康监控 — 测试方案

> 子测试文档，主测试：[100-prd-test-翻译分析增强](./100-prd-test-翻译分析增强.md)

## 测试用例

### TC-01：健康状态边界

| 成功率 | 期望 status |
|--------|------------|
| 100% | healthy |
| 95% | healthy |
| 94.9% | degraded |
| 70% | degraded |
| 69.9% | down |
| 0% | down |

### TC-02：空数据与错误

| 场景 | 期望 |
|------|------|
| 无记录 | `providers: {}` |
| MongoDB 不可达 | 空结果，不抛异常 |
| 单供应商 | 正确统计 |

### TC-03：多供应商

| 场景 | 期望 |
|------|------|
| 3 供应商不同状态 | 各自 status 正确 |
| 混合成功/失败 | success_rate 精确到 4 位小数 |

## 测试命令

```bash
pytest tests/unit/services/test_provider_health.py::TestProviderHealth -v
```