---

doc_type: test
title: "资源加载优先级 — 测试用例"
status: 方案已编写
owner: 陈铭
created: 2026-09-11
updated: 2026-09-23
priority: P2
project: YiPet
roles: [engineer, qa]
prd_month: "202609"
source_prds: ["93-架构设计-资源加载优先级.md"]
source_modules: ["93-prd-task-资源加载优先级.md"]

type: test
---

# 资源加载优先级 — 测试用例

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。
| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-PRL01 | Pet CSS high | 优先加载 | P1 |
| TC-PRL02 | 工具 JS low | idle 加载 | P2 |

