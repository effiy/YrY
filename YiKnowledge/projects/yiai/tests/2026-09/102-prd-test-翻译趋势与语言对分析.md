---

doc_type: test
prd_test_id: "YA-09-102"
title: "YA-09-102: 翻译趋势与语言对分析 — 测试方案"
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
source_task: "102-prd-task-翻译趋势与语言对分析.md"

type: test
---

# YA-09-102: 翻译趋势与语言对分析 — 测试方案

## 测试用例

### TC-01：hourly_trend 时间序列

| 场景 | 期望 |
|------|------|
| days=1 | ≤24 条，按 hour 升序 |
| days=7 | ≤168 条 |
| 无数据 | [] |
| hour 格式 | YYYY-MM-DDTHH |
| count/chars | 均为非负整数 |

### TC-02：top_language_pairs 排名

| 场景 | 期望 |
|------|------|
| limit=5 | ≤5 条，按 count 降序 |
| 无数据 | [] |
| 字段完整 | from/to/count/total_chars |

### TC-03：错误处理

| 场景 | 期望 |
|------|------|
| MongoDB 不可达 | 返回空 []，不抛异常 |

## 测试命令

```bash
pytest tests/unit/services/test_provider_health.py::TestHourlyTrend tests/unit/services/test_provider_health.py::TestTopLanguagePairs -v
```