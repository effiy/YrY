---
doc_type: test
title: "YA-09-19: LLM Prompt 模板管理 — 测试规格"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-16
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-19"
source_prds: ["19-需求-LLM-Prompt模板管理与版本控制"]
source_modules: ["19-prd-task-LLM-Prompt模板管理与版本控制"]
source_okr: [yiai-002]
---

# YA-09-19: LLM Prompt 模板管理 — 测试规格

---

## 一、单元测试

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-PT-01 | Jinja2 变量插值 | `{{name}}` → 替换为实际值 |
| UT-PT-02 | 版本切换 latest→stable | 模板内容切换到 stable 版本 |
| UT-PT-03 | 变量缺失→报错 | 未提供变量 → 渲染失败 + 明确错误信息 |
| UT-PT-04 | AB 测试分流 | user_id → 分配 variant A/B |

---

## 二、缺陷分级

| 级别 | 示例 |
|------|------|
| S1 — 严重 | 模板渲染异常导致 LLM 调用失败 |
| S2 — 一般 | 版本回滚后旧版本内容错误 |

---