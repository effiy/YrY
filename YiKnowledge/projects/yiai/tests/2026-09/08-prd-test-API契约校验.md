---
doc_type: test
title: "YA-09-08: API 契约校验 — 测试规格"
status: 已完成
priority: P1
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-16
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-08"
source_prds: ["08-需求-API契约校验"]
source_modules: ["08-prd-task-API契约校验"]
source_okr: [yiai-001]
---

# YA-09-08: API 契约校验 — 测试规格

> 来源 PRD：[08-需求-API契约校验.md](../../prds/2026-09/08-需求-API契约校验.md)
> 开发方案：[08-prd-task-API契约校验.md](../../devs/2026-09/08-prd-task-API契约校验.md)

---

## 一、单元测试

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-AP-01 | 已知参数通过 | `{cname, filter}` → 校验通过 |
| UT-AP-02 | 未知参数 WARNING | `{query: "test"}` → WARNING "未知参数 query" |
| UT-AP-03 | 已知+未知混合 | `{cname, filter, query}` → cname/filter 通过，query WARNING |
| UT-AP-04 | 参数名 `target_file` 而非 `path` | 使用 `path` → WARNING |

---

## 二、缺陷分级

| 级别 | 示例 |
|------|------|
| S1 — 严重 | 已知参数被误报为未知 |
| S2 — 一般 | 未知参数未被 WARNING |

---