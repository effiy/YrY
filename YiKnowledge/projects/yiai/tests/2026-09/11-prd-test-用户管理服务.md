---
doc_type: test
title: "YA-09-11: 用户管理服务 — 测试规格"
status: 已完成
priority: P1
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-16
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-11"
source_prds: ["11-需求-用户管理服务"]
source_modules: ["11-prd-task-用户管理服务"]
source_okr: [yiai-001]
---

# YA-09-11: 用户管理服务 — 测试规格

> 来源 PRD：[11-需求-用户管理服务.md](../../prds/2026-09/11-需求-用户管理服务.md)
> 开发方案：[11-prd-task-用户管理服务.md](../../devs/2026-09/11-prd-task-用户管理服务.md)

---

## 一、单元测试

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-UM-01 | 创建用户 | username+password → MDB users 新增 |
| UT-UM-02 | 用户名重复 → 1003 | `cname` 冲突 → RESOURCE_EXISTS |
| UT-UM-03 | CSV 批量导入 100 条 | 100 条全部成功 |
| UT-UM-04 | CSV 格式错误 → 校验失败 | 缺少必填列 → INVALID_PARAMS |
| UT-UM-05 | 部门树查询 | 父子部门嵌套结构 |

---

## 二、缺陷分级

| 级别 | 示例 |
|------|------|
| S0 — 阻断 | 用户删除后关联数据未级联处理 |
| S1 — 严重 | CSV 导入部分成功部分失败无汇总报告 |
| S2 — 一般 | 部门树循环引用检测缺失 |

---