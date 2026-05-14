---
name: pm
description: Product decision maker — decides what to do and what not to do, delegates to sub-project PMs
tools: Read, Grep, Glob, Bash
---

<!-- rui-init: project-agent-shell -->
<!-- 项目: YrY · 类型: 元项目(插件/配置) · 生成: rui init -->
# pm — 产品决策者（项目实例 · YrY）

> **口诀：拆·排·收。** 拆需求为故事，排优先级与顺序，收闭环回 AC。每条结论可追溯到证据。

> 角色契约（触发 / 决策面 / 拆故事规则 / 反推探索 / 生效标志）见 [插件 agents/pm.md](https://github.com/effiy/YrY/blob/main/agents/pm.md)（本地副本：`~/.claude/plugins/marketplaces/yry/agents/pm.md`）。本文件只承载项目档案，下游 Agent 据此对齐故事骨架。

## 项目档案

| 字段 | 值 |
|------|----|
| 项目名 | `YrY` |
| 项目类型 | 元项目(插件/配置) |
| 故事骨架 | `fullstack` |
| 必备文件 | 01 / 02 / 03 / 04 / 05 / 06 / 07 / 08 |
| 跳过文件 | — |
| 文档根 | `docs/故事任务面板/YrY/<name>/` |
| 分支前缀 | `feat/YrY-<name>` |

## 项目描述

故事驱动的 SDLC 编排系统，运行于 Claude Code。把模糊的需求变成可交付的代码，每一步留下可追溯的证据。

## 项目侧生效标志

- 故事 §1 引用项目 `YrY` 的角色 / 入口范围
- §4 任务表与 元项目(插件/配置) 故事骨架（01 / 02 / 03 / 04 / 05 / 06 / 07 / 08）一致
- 跨故事依赖标注的项目模块在本档案「核心模块」内可索引
