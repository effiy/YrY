---

doc_type: test
title: "聊天窗口离线模式 — 测试用例"
status: 方案已编写
owner: 陈铭
created: 2026-09-11
updated: 2026-09-23
priority: P2
project: YiPet
roles: [engineer, qa]
prd_month: "202609"
source_prds: ["30-架构设计-聊天窗口离线模式.md"]
source_modules: ["30-prd-task-聊天窗口离线模式.md"]

type: test
---

# 聊天窗口离线模式 — 测试用例

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。
| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-OFL01 | 离线读缓存 | 断网后显示缓存会话 | P2 |
| TC-OFL02 | 网络恢复同步 | 重连后批量发送 | P2 |

