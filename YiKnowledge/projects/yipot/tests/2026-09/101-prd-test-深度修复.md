---
doc_type: test
title: "YiPot 深度修复 — 测试方案"
tags: [测试方案, 备份, 性能]
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
test_id: YP-09-101
prd_ref: YP-09-61
dev_ref: YP-09-101
estimate: 0.125
review_status: 已评审
roles: [engineer]
---

# YiPot 深度修复 — 测试方案

> 测试编号：YP-09-101

---

## 测试用例

| 编号 | 描述 | 预期 | 结果 |
|------|------|------|------|
| TC-001 | `cargo check` | 编译通过 | ✅ |
| TC-002 | WebDAV get name=null | 返回 Error，不 panic | — |
| TC-003 | WebDAV put name=null | 返回 Error，不 panic | — |
| TC-004 | WebDAV delete name=null | 返回 Error，不 panic | — |
| TC-005 | lang_detect 连续调用 | 2nd+ 调用 <1ms | — |
| TC-006 | check_update 配置错误 | 使用默认 true | — |
| TC-007 | `pnpm build` | 前端构建通过 | ✅ |