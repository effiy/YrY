---

doc_type: test
title: "图片粘贴拖拽上传 — 测试用例"
status: 方案已编写
owner: 陈铭
created: 2026-09-11
updated: 2026-09-23
priority: P2
project: YiPet
roles: [engineer, qa]
prd_month: "202609"
source_prds: ["40-架构设计-图片粘贴拖拽上传.md"]
source_modules: ["40-prd-task-图片粘贴拖拽上传.md"]

type: test
---

# 图片粘贴拖拽上传 — 测试用例

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。
| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-UP01 | Ctrl+V 粘贴 | clipboardData.files | P0 |
| TC-UP02 | 拖拽上传 | dataTransfer.files | P0 |
| TC-UP03 | 大小限制 10MB | 超限提示 | P1 |

