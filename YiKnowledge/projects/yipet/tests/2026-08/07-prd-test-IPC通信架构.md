---
doc_type: test
title: "YP-08-03: IPC 通信架构 — 测试用例"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202608"
source_prds: ["07-架构设计-IPC通信架构"]
source_modules: ["07-prd-task-IPC通信架构"]
---

# IPC 通信架构 — 测试用例

## 测试用例

| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-IPC-001 | ISOLATED→MAIN | postMessage 正确传递 | P0 |
| TC-IPC-002 | IPC_SECRET 验证 | 非法签名被拒绝 | P0 |
| TC-IPC-003 | 时间戳 5s 过期 | 过期消息被拒绝 | P0 |
| TC-IPC-004 | ISOLATED→SW | sendMessage 正确路由 | P0 |
| TC-IPC-005 | SW 休眠恢复 | 唤醒后状态恢复 | P1 |

## 出口准则

- [ ] P0 用例 100% 通过