---

doc_type: test
title: "沙箱逃逸防护 — 测试用例"
status: 方案已编写
owner: 陈铭
created: 2026-09-11
updated: 2026-09-23
priority: P2
project: YiPet
roles: [engineer, qa]
prd_month: "202609"
source_prds: ["78-架构设计-沙箱逃逸防护.md"]
source_modules: ["78-prd-task-沙箱逃逸防护.md"]

type: test
---

# 沙箱逃逸防护 — 测试用例

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。
| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-SBX01 | iframe sandbox | allow-scripts 隔离 | P2 |
| TC-SBX02 | Origin 校验 | postMessage 检查 | P2 |

