---

doc_type: test
title: "流式渲染优化 — 测试用例"
status: 方案已编写
owner: 陈铭
created: 2026-09-11
updated: 2026-09-23
priority: P2
project: YiPet
roles: [engineer, qa]
prd_month: "202609"
source_prds: ["83-架构设计-流式渲染优化.md"]
source_modules: ["83-prd-task-流式渲染优化.md"]

type: test
---

# 流式渲染优化 — 测试用例

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。
| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-STR01 | rAF 批量更新 | 60fps 稳定 | P1 |
| TC-STR02 | 代码块缓冲 | 完整后渲染 | P2 |

