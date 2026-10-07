---
doc_type: test
title: "YiPot 健壮性强化 — 测试方案"
tags: [测试方案, 截图, 配置, 健壮性]
category: 项目/桌面应用/测试
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: test
status: 已完成
priority: P1
project: YiPot
project_id: yipot
owner: Chengliang.Yi
prd_month: '202609'
test_id: YP-09-102
prd_ref: YP-09-62
dev_ref: YP-09-102
estimate: 0.125
review_status: 已评审
roles: [engineer]
---

# YiPot 健壮性强化 — 测试方案

> 测试编号：YP-09-102

---

## 测试用例

| 编号 | 描述 | 预期 | 结果 |
|------|------|------|------|
| TC-001 | `cargo check` | 编译通过 | ✅ |
| TC-002 | `pnpm build` | 构建通过 | ✅ |
| TC-003 | 正常截图 | 功能不变 | — |
| TC-004 | Wayland 截图失败 | 不崩溃，日志有 error | — |
| TC-005 | 磁盘满时写配置 | 不崩溃，日志有 warn | — |
| TC-006 | Store 锁竞争 | 不崩溃 | — |
| TC-007 | APP 未初始化时 get/set | 返回 None/不崩溃 | — |