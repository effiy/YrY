---
doc_type: test
title: "YK-09-08: 跨项目知识依赖图谱 — 测试用例"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-15
updated: 2026-09-15
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
prd_task_id: "YK-09-08"
source_prds: ["11-架构设计-跨项目知识依赖图谱"]
source_modules: ["11-prd-task-跨项目知识依赖图谱"]
source_okr: [yiknowledge-001]
---

# YK-09-08: 跨项目知识依赖图谱 — 测试用例

> 来源 PRD：[11-架构设计-跨项目知识依赖图谱.md](../../prds/2026-09/11-架构设计-跨项目知识依赖图谱.md)
> 开发方案：[11-prd-task-跨项目知识依赖图谱.md](../../devs/2026-09/11-prd-task-跨项目知识依赖图谱.md)
> 需求编号：YK-09-08 · 优先级：P2

---

## 一、单元测试

| 编号 | 用例 | 输入 | 预期 |
|------|------|------|------|
| UT-DG-01 | related 边权重 1.0 | frontmatter `related: [./other.md]` | 边 weight=1.0, type=related |
| UT-DG-02 | link 边权重 0.5 | 正文 `[text](./other.md)` | 边 weight=0.5, type=link |
| UT-DG-03 | 同一边去重取最大权重 | related 1.0 + link 0.5 → 同一边 | weight=1.0 |
| UT-DG-04 | BFS 1 跳影响 | doc A 变更, doc B 引用 A | B 标记为一级影响 |
| UT-DG-05 | BFS 2 跳影响 | A→B→C, A 变更 | B 一级, C 二级 |
| UT-DG-06 | BFS 不超过 2 跳 | A→B→C→D | D 不受影响 |
| UT-DG-07 | 孤立文档检测 | 文档无 related 且无 link 边 | 标记为孤立文档 |
| UT-DG-08 | 语义缺口检测 | A 和 B 语义相似(cos>0.7)但无边 | 标记为知识缺口 |

---

## 二、集成测试

| 编号 | 场景 | 预期 |
|------|------|------|
| IT-DG-01 | 全库图谱构建 | 800 文档 → 节点 800, 边 ~4000, 构建 < 5s |
| IT-DG-02 | 变更影响分析 API | `analyze_impact("rpc-protocol.md")` → 返回受影响文档列表 |

---

## 三、缺陷分级

| 级别 | 示例 |
|------|------|
| S1 — 严重 | 依赖边丢失（related 字段未解析到） |
| S2 — 一般 | 孤立文档误判（有 link 但未被检测到） |

---