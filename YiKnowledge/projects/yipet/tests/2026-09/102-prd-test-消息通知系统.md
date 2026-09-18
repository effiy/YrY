---
doc_type: test
title: "消息通知系统 — 测试用例"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202609"
source_prds: ["102-功能实现-消息通知系统"]
source_modules: ["102-prd-task-消息通知系统"]
---

# 消息通知系统 — 测试用例

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

## 测试用例

| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-NTF01 | chrome.notifications | `create` 正常弹出通知 | P1 |
| TC-NTF02 | AI 回复完成通知 | SSE 流结束→通知 | P1 |
| TC-NTF03 | 企微 Webhook | POST webhook URL 成功 | P2 |

## 出口准则

- [ ] P1 用例 100% 通过