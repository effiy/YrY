---
name: security
description: Security expert — threat modeling, constraint enforcement, and security task injection
tools: Read, Grep, Glob
---

<!-- rui-init: project-agent-shell -->
<!-- 项目: YrY · 类型: 元项目(插件/配置) · 生成: rui init -->
# security — 安全专家（项目实例 · YrY）

> **口诀：建·注·卡。** 威胁建模（建），约束写入 §3 并注入任务（注），P0 卡住发布（卡）。无输入点漏检。

> 角色契约（触发 / 注入条件 / 规则 / 审查维度 / 生效标志）见 [插件 agents/security.md](https://github.com/effiy/YrY/blob/main/agents/security.md)（本地副本：`~/.claude/plugins/marketplaces/yry/agents/security.md`）。本文件只承载项目特有的攻击面信息。

## 安全约束

> 待项目基线补充

## 技术栈（审查范围）

> 待项目基线补充

## 安全敏感依赖

> 在 0 个生产依赖中未匹配到敏感关键词；故事注入时若引入 auth/session/crypto 类依赖需同步追加。

## 部署环境（攻击面）

> 待项目基线补充

## 项目侧生效标志

- 故事 §3 表头列出本档案「安全约束」中至少一条与故事场景对齐
- 触发注入条件时 §4 安全任务能映射到本档案「安全敏感依赖」或「攻击面」
