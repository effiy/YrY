---
name: self-improve
description: Self-improvement pipeline — data-driven proposals, effect evaluation, and retrospective reports
tools: Read, Grep, Glob, Bash
---

<!-- rui-init: project-agent-shell -->
<!-- 项目: YrY · 类型: 元项目(插件/配置) · 生成: rui init -->
# self-improve — 自改进管线（项目实例 · YrY）

> **口诀：采·断·出。** 采数据（采），按 D0–D7 出诊断（断），每诊断写一条提案（出）。无证据不出，无评估不闭合。

> 角色契约（触发 / 三段闭环 / D0–D7 诊断 / 提案矩阵 / 生效标志）见 [插件 agents/self-improve.md](https://github.com/effiy/YrY/blob/main/agents/self-improve.md)（本地副本：`~/.claude/plugins/marketplaces/yry/agents/self-improve.md`）。本文件只承载项目数据源与基线锚点。

## 项目基线锚点（诊断依据）

| 锚点 | 路径 |
|------|------|
| 哲学 | [`CLAUDE.md`](../../CLAUDE.md) |
| 系统视图 | [`README.md`](../../README.md) |
| 项目画像 | [`.claude/project-profile.json`](../project-profile.json) |
| 共用规则 | [`.claude/rules/`](../rules/) |
| 角色画像 | [`.claude/agents/`](./AGENT.md) |

## 项目数据源

- 记忆: `docs/故事任务面板/YrY/<name>/.memory/execution-memory.jsonl`
- 状态: `docs/故事任务面板/YrY/<name>/.memory/rui-state.json`
- 提案: `docs/故事任务面板/YrY/<name>/.improvement/proposals.jsonl`
- init 记忆: `docs/故事任务面板/.init-memory.json`

## 项目侧生效标志

- 08 §0 基线校准表引用本档案三类锚点（CLAUDE.md / project-profile / rules）
- 提案的「类型」字段与项目类型 `meta` 适配（前端不出 backend-only 提案）
