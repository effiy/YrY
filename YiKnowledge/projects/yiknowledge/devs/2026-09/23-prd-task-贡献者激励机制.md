---
doc_type: module
prd_task_id: "YK-09-20"
title: "YK-09-20: 贡献者激励机制 — 开发方案"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-16
updated: 2026-09-16
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
estimate_frontend: 0.5
source_prd: "23-架构设计-贡献者激励机制.md"
source_okr: [yiknowledge-001]
related_tests: ["23-prd-test-贡献者激励机制"]
---

# YK-09-20: 贡献者激励机制 — 开发方案

> 来源 PRD：[23-架构设计-贡献者激励机制.md](../../prds/2026-09/23-架构设计-贡献者激励机制.md)
> 需求编号：YK-09-20 · 优先级：P2 · 人天：0.5d

---

## 一、架构总览

通过贡献积分 + 排行榜激励知识库参与。积分规则：新建文档 +5、修复 Bug +3、审核通过 +2、👍 反馈 +1。Dashboard API 暴露排行榜（月度/季度/年度）。

## 二、实施步骤

| 步骤 | 任务 | 人天 |
|------|------|------|
| 1 | 积分规则引擎 | 0.15 |
| 2 | 排行榜聚合 API | 0.15 |
| 3 | Dashboard 前端展示 | 0.1 |
| 4 | 测试 | 0.1 |

**总计：0.5d**

## 三、已知缺口与技术债

| # | 技术债 | 优先级 | 说明 | 状态 |
|---|--------|--------|------|------|
| 1 | 积分规则硬编码 | P3 | 不可动态调整积分规则 | 待实施 |

---