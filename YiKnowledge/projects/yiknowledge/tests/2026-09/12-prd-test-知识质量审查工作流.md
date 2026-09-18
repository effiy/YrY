---
doc_type: test
title: "YK-09-09: 知识质量审查工作流 — 测试用例"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-15
updated: 2026-09-15
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
prd_task_id: "YK-09-09"
source_prds: ["12-架构设计-知识质量审查工作流"]
source_modules: ["12-prd-task-知识质量审查工作流"]
source_okr: [yiknowledge-001]
---

# YK-09-09: 知识质量审查工作流 — 测试用例

> 来源 PRD：[12-架构设计-知识质量审查工作流.md](../../prds/2026-09/12-架构设计-知识质量审查工作流.md)
> 开发方案：[12-prd-task-知识质量审查工作流.md](../../devs/2026-09/12-prd-task-知识质量审查工作流.md)
> 需求编号：YK-09-09 · 优先级：P2

---

## 一、单元测试

| 编号 | 用例 | 输入 | 预期 |
|------|------|------|------|
| UT-RW-01 | 提交审查 | file_path + priority=P0 | 创建 ReviewTask，状态=pending |
| UT-RW-02 | 自动分配审查人 | task 创建 | 按领域+负载均衡分配 |
| UT-RW-03 | 审批通过 | approve(task_id) | 状态=approved，通知作者 |
| UT-RW-04 | 驳回 | reject(task_id, reason) | 状态=rejected，通知作者含原因 |
| UT-RW-05 | 检查清单编排 | run_automated_checks(file) | 汇总 frontmatter+命名+15 项结果 |
| UT-SL-01 | SLA P0 剩余时间 | priority=P0, created=now-12h | 剩余 12h |
| UT-SL-02 | SLA P0 超时 | priority=P0, created=now-25h | 标记 overdue，触发升级通知 |
| UT-SL-03 | SLA P1 未超时 | priority=P1, created=now-48h | 剩余 24h，不触发升级 |
| UT-SL-04 | P2 weekly 汇总 | 3 个 P2 文档待审查 | 周报汇总通知 |

---

## 二、集成测试

| 编号 | 场景 | 预期 |
|------|------|------|
| IT-RW-01 | 提交→检查清单→分配→审批→通知 | 全链路 5 步执行，通知正确发送 |
| IT-RW-02 | 检查清单中某模块不可用 | 标记 "unavailable"，其他检查继续 |

---

## 三、缺陷分级

| 级别 | 示例 |
|------|------|
| S1 — 严重 | SLA 超时未触发升级通知 |
| S2 — 一般 | 检查清单编排中单模块失败导致全部失败 |

---