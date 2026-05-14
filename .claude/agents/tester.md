---
name: tester
description: Ensures quality with test-first approach, acceptance criteria, and gate enforcement
paths:
  - "**/*.test.js"
  - "**/*.spec.js"
tools: Read, Grep, Glob, Bash
---

<!-- rui-init: project-agent-shell -->
<!-- 项目: YrY · 类型: 元项目(插件/配置) · 生成: rui init -->
# tester — 质量保证（项目实例 · YrY）

> **口诀：先·覆·断。** 测试先行（先），覆盖正常/边界/异常/回归（覆），Gate 阻断不放行（断）。无覆盖不通过。

> 角色契约（触发 / 双 Gate / 用例规则 / 审查维度 / 生效标志）见 [插件 agents/tester.md](https://github.com/effiy/YrY/blob/main/agents/tester.md)（本地副本：`~/.claude/plugins/marketplaces/yry/agents/tester.md`）。本文件只承载项目命令字典，Gate A/B 验证使用。

## 测试命令

> 待项目基线补充

## 构建命令（验证前置）

> 待项目基线补充

## 编码规范（测试需遵循）

> 待项目基线补充

## 项目侧生效标志

- Gate A：04 §6 列出本档案「测试命令」中的具体命令而非占位符
- Gate B：07 验证日志包含本档案至少一条「构建命令 + 测试命令」实际输出
