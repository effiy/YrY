---
doc_type: test
title: "YA-09-07: 上下文压缩服务 — 测试规格"
status: 已完成
priority: P1
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-16
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-07"
source_prds: ["13-需求-上下文压缩服务"]
source_modules: ["13-prd-task-上下文压缩服务"]
source_okr: [yiai-003]
---

# YA-09-07: 上下文压缩服务 — 测试规格

---

## 一、单元测试

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-CP-01 | 超窗口 80% → 自动摘要 | 前 N-2 轮对话被摘要替代 |
| UT-CP-02 | 未超窗口 → 不压缩 | 全部消息保留 |
| UT-CP-03 | 摘要后 token < 窗口 50% | 摘要压缩比 > 50% |
| UT-CP-04 | 滑动窗口保留最近 2 轮 | 最近 2 轮完整保留（不参与摘要） |

---

## 二、缺陷分级

| 级别 | 示例 |
|------|------|
| S1 — 严重 | 摘要丢失关键上下文导致 LLM 回答质量下降 |

---