---
doc_type: test
title: "YK-09-37: 语义搜索渐进迁移 — 测试用例"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-16
updated: 2026-09-16
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
prd_task_id: "YK-09-37"
source_prds: ["40-架构设计-语义搜索渐进迁移"]
source_modules: ["40-prd-task-语义搜索渐进迁移"]
source_okr: [yiknowledge-001]
---

# YK-09-37: 语义搜索渐进迁移 — 测试用例

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-MG-01 | 灰度 10%→混合检索 | 10% 用户使用混合检索，90% 仍用 BM25 |
| UT-MG-02 | 混合检索 MRR ≥ BM25 | 各阶段 MRR 不低于基线 |
| UT-MG-03 | 回滚到 BM25 | 灰度配置 0% → 全部用户恢复 BM25 |

---