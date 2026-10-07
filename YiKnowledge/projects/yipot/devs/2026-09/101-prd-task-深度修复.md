---
doc_type: dev
title: "YiPot 深度修复 — 开发方案"
tags: [开发方案, 备份安全, 性能优化]
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
dev_id: YP-09-101
prd_ref: YP-09-61
estimate: 0.5
review_status: 已评审
roles: [engineer]
---

# YiPot 深度修复 — 开发方案

> 开发编号：YP-09-101 · 关联 PRD：YP-09-61

---

## 一、变更清单

| 文件 | 变更 | 说明 |
|------|------|------|
| `backup.rs:35,91,101` | `name.unwrap()` → `ok_or_else` | 3 处 panic → 结构化错误 |
| `lang_detect.rs` | 重构 | Lazy 全局单例 + 语言列表统一 |
| `updater.rs:7` | `unwrap()` → `unwrap_or(true)` | 配置类型不匹配防护 |

---

## 二、验证

```bash
cd YiPot/src-tauri && cargo check  # ✅
```

---

## 三、关联文件

| 类型 | 文件 |
|------|------|
| PRD | `../prds/2026-09/61-prd-深度修复.md` |
| 测试 | `../tests/2026-09/101-prd-test-深度修复.md` |
| Bug 008 | `../bugs/功能缺陷/008-功能-WebDav-name-unwrap-panic.md` |
| Bug 009 | `../bugs/功能缺陷/009-功能-lang-detect每次重建检测器.md` |