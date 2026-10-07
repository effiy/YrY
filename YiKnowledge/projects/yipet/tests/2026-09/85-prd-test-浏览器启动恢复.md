---

doc_type: test
title: "浏览器启动恢复 — 测试用例"
status: 方案已编写
owner: 陈铭
created: 2026-09-11
updated: 2026-09-23
priority: P2
project: YiPet
roles: [engineer, qa]
prd_month: "202609"
source_prds: ["85-架构设计-浏览器启动恢复.md"]
source_modules: ["85-prd-task-浏览器启动恢复.md"]

type: test
---

# 浏览器启动恢复 — 测试用例

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。
| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-RS01 | chrome.runtime.onStartup | 恢复 Pet 状态 | P1 |
| TC-RS02 | 会话恢复 | chrome.storage 读取 | P1 |

