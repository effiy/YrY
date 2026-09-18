---
doc_type: test
title: "YA-09-09: 审计日志完善 — 测试规格"
status: 已完成
priority: P1
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-16
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-09"
source_prds: ["09-需求-审计日志"]
source_modules: ["09-prd-task-审计日志"]
source_okr: [yiai-001]
---

# YA-09-09: 审计日志完善 — 测试规格

> 来源 PRD：[09-需求-审计日志.md](../../prds/2026-09/09-需求-审计日志.md)
> 开发方案：[09-prd-task-审计日志.md](../../devs/2026-09/09-prd-task-审计日志.md)

---

## 一、单元测试

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-AL-01 | @audit_log 装饰器集成 | 装饰方法调用 → MDB audit_logs 写入 |
| UT-AL-02 | 查询 API：按时间范围 | `from=2026-09-01, to=2026-09-15` → 过滤正确 |
| UT-AL-03 | 查询 API：按操作人 | `operator="admin"` → 仅返回该用户记录 |
| UT-AL-04 | 查询 API：按模块 | `module="data_service"` → 过滤正确 |

---

## 二、缺陷分级

| 级别 | 示例 |
|------|------|
| S1 — 严重 | 审计日志写入失败但方法返回成功（数据不一致） |
| S2 — 一般 | 查询 API 时间范围过滤包含边界错误 |

---