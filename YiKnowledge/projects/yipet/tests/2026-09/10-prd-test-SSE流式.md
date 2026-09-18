---
doc_type: test
title: "SSE 流式可靠性 — 测试用例"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202609"
source_prds: ["10-稳定性-SSE流式"]
source_modules: ["10-prd-task-SSE流式"]
---

# SSE 流式可靠性 — 测试用例

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

## 测试用例

| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-SSE01 | 自动重连 | 断连→指数退避 1s/2s/4s/8s | P0 |
| TC-SSE02 | AbortSignal 清理 | 组件卸载→SSE 取消 | P0 |
| TC-SSE03 | 断点续传 | 从最后 token 位置继续 | P1 |
| TC-SSE04 | 错误传播 | done 帧携带 error 字段 | P1 |

## 出口准则

- [ ] P0 用例 100% 通过