---
doc_type: dev
title: "YiPot 安全加固与最终扫描（第二十二轮）— 开发方案"
tags: [开发方案, 安全加固, 密码掩码, clippy]
category: projects/yipot/devs
created: 2026-09-23
updated: 2026-09-23
source: internal
type: task
status: 已完成
priority: P2
project: YiPot
owner: Chengliang.Yi
prd_month: "202609"
dev_id: YP-09-125
prd_ref: YP-09-83
estimate: 0.25
roles: [engineer]
---

# YiPot 安全加固与最终扫描（第二十二轮）— 开发方案

> 开发编号：YP-09-125 · 关联 PRD：YP-09-83

---

## 一、变更清单

| 文件 | 变更 | 说明 |
|------|------|------|
| `baidu/Config.jsx` | 修改 | secret 字段添加 `type='password'` |

---

## 二、审计扫描

| 维度 | 工具 | 结果 |
|------|------|------|
| console.log | `grep -rn "console\." src/` | 0 matches |
| 未使用导入 | 人工审查 | 0 blocking |
| Rust clippy | `cargo clippy` | 18 warnings (unneeded return — upstream) |
| useEffect deps | 人工审查 | 1 missing (checkYiAi — accepted) |

---

## 三、验证

```bash
pnpm build
cargo clippy -- -W clippy::unwrap_used
```

## 四、关联文件

- PRD 83: `../prds/2026-09/83-prd-安全加固最终扫描第二十二轮.md`
- Bug 043: `../bugs/安全隐私/043-config-password-type-missing.md`