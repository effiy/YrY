---
doc_type: test
title: "YiPot 安全加固与最终扫描（第二十二轮）— 测试方案"
tags: [测试方案, 安全, clippy, 扫描]
category: projects/yipot/tests
created: 2026-09-23
updated: 2026-09-23
source: internal
type: test
status: 已完成
priority: P2
project: YiPot
prd_ref: YP-09-83
dev_ref: YP-09-125
roles: [engineer]
---

# YiPot 安全加固与最终扫描（第二十二轮）— 测试方案

> 关联 PRD：YP-09-83 · 关联开发：YP-09-125

---

## 测试用例

### TC-01: baidu Config password masking

| 项 | 内容 |
|-----|------|
| **步骤** | 设置 → 服务 → Baidu 翻译 → 配置 secret |
| **预期** | secret 字段为密码掩码输入框（圆点显示） |

### TC-02: Console 清洁度

| 项 | 内容 |
|-----|------|
| **命令** | `grep -rn "console\.\(log\|debug\|trace\)" src/ --include="*.jsx" \| grep -v node_modules` |
| **预期** | 0 matches |

### TC-03: Rust clippy unwrap audit

| 项 | 内容 |
|-----|------|
| **命令** | `cargo clippy -- -W clippy::unwrap_used` |
| **预期** | 0 new unwrap warnings（前 20 轮已全部消除） |

### TC-04: 构建完整性

| 项 | 内容 |
|-----|------|
| **命令** | `cargo check && pnpm build` |
| **预期** | Both pass |

---

## 关联文档

- PRD 83: `../prds/2026-09/83-prd-安全加固最终扫描第二十二轮.md`
- Dev 125: `../devs/2026-09/125-prd-task-安全加固最终扫描第二十二轮.md`