---
doc_type: dev
title: "YiPot 健壮性强化 — 开发方案"
tags: [开发方案, 截图, 配置, 健壮性]
category: 项目/桌面应用/开发
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: task
status: 已完成
priority: P1
project: YiPot
project_id: yipot
owner: Chengliang.Yi
prd_month: '202609'
dev_id: YP-09-102
prd_ref: YP-09-62
estimate: 0.5
review_status: 已评审
roles: [engineer]
---

# YiPot 健壮性强化 — 开发方案

> 开发编号：YP-09-102 · 关联 PRD：YP-09-62

---

## 一、变更清单

| 文件 | 变更 | 说明 |
|------|------|------|
| `screenshot.rs` | 重构 | 5 处 unwrap → match + error 日志 |
| `config.rs:get` | 修改 | 2 处 unwrap → `?` 运算符 |
| `config.rs:set` | 修改 | 4 处 unwrap → match + warn 日志 |
| `config.rs:is_first_run` | 修改 | 2 处 unwrap → match |

总计：消除 **13 处** `unwrap()/expect()` 调用

---

## 二、验证

```bash
cargo check  # ✅
```

---

## 三、关联文件

| 类型 | 文件 |
|------|------|
| PRD | `../prds/2026-09/62-prd-健壮性强化.md` |
| 测试 | `../tests/2026-09/102-prd-test-健壮性强化.md` |
| Bug 010 | `../bugs/功能缺陷/010-功能-screenshot-unwrap崩溃.md` |