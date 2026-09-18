---
doc_type: test
title: "YA-09-18: Agent 工具调用结果缓存 — 测试规格"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-16
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-18"
source_prds: ["18-需求-Agent工具调用结果缓存"]
source_modules: ["18-prd-task-Agent工具调用结果缓存"]
source_okr: [yiai-001]
---

# YA-09-18: Agent 工具调用结果缓存 — 测试规格

---

## 一、单元测试

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-AC-01 | 相同参数→缓存命中 | 第 2 次调用不执行工具，直接返回缓存 |
| UT-AC-02 | TTL 过期→重新执行 | 缓存过期后重新调用工具 |
| UT-AC-03 | 副作用工具不缓存 | `code_execute`/`write_file` 每次执行 |
| UT-AC-04 | 不同参数→缓存 miss | 参数变化→重新执行工具 |

---

## 二、缺陷分级

| 级别 | 示例 |
|------|------|
| S1 — 严重 | 副作用工具被缓存（重复执行破坏性操作） |
| S2 — 一般 | TTL 过短导致缓存命中率低 |

---