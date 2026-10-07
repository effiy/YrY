---
title: "YiPot 自动化检查脚本与 ESLint 配置 — Bug 042"
tags: [bug, quality, automation, eslint, pre-commit]
category: projects/yipot/bugs
created: 2026-09-23
updated: 2026-09-23
source: internal
type: bug
status: resolved
severity: trivial
priority: p3
project: yipot
module: .scripts/, .eslintrc.cjs
reporter: Claude
environment: all
affected_version: 3.0.7
fixed_version: 3.0.8
frequency: always
roles: [engineer]
---

# 缺少自动化质量检查基础设施

---

## 一、现状

3.0.7 无 ESLint 配置、pre-commit hook、config safety 检查脚本。所有质量检查依赖人工审计。

## 二、新增

| 文件 | 用途 |
|------|------|
| `.eslintrc.cjs` | ESLint 配置：no-undef/ prefer-const/ no-unused-vars |
| `.scripts/check-config-defaults.sh` | 服务 config 默认值检查 |
| `.scripts/pre-commit.sh` | Pre-commit hook：config + build + Rust check |

## 三、验证

```bash
bash .scripts/check-config-defaults.sh  # ✅ All services have config default values.
```

## 四、安装 pre-commit

```bash
ln -sf ../../.scripts/pre-commit.sh .git/hooks/pre-commit
```