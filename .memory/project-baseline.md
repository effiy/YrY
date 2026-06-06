---
name: project-baseline
description: YrY 项目基线信息 — 类型、架构、版本
metadata:
  type: reference
---

# YrY 项目基线

| 维度 | 值 |
|------|-----|
| 项目名 | YrY |
| 类型 | **meta** — Claude Code 插件，纯规约驱动 |
| 版本 | 4.3.0 |
| 架构 | plugin — 8 技能 + 9 Agent + 10 规则 + 4 共享库（lib/） |
| 生态 | 无 package.json，markdown 规约 + node 辅助脚本 + 共享 lib/ 消除重复 |
| 自托管 | 是 — YrY 用自身管线管理自身演进 |

## 技能列表

rui, rui-bot, rui-claude, rui-import, rui-npm, rui-story, rui-trends, update-config

## Agent 列表

pm, planner, coder, tester, reporter, security, self-improve, code-reviewer, architect

## 共享库

lib/constants.mjs, lib/fs.mjs, lib/tty.mjs, lib/help-layout.mjs
