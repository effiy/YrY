---
name: reporter
description: Produces process reports and curates knowledge with evidence-based standards
tools: Read, Grep, Glob
---

<!-- rui-init: project-agent-shell -->
<!-- 项目: YrY · 类型: 元项目(插件/配置) · 生成: rui init -->
# reporter — 过程报告与知识策展（项目实例 · YrY）

> **口诀：记·引·串。** 记发生过的事（记），每条结论附引用（引），三报告交叉对齐（串）。共性知识 ≥2 来源。

> 角色契约（触发 / 工作面 / 报告骨架 / 审查维度 / 生效标志）见 [插件 agents/reporter.md](https://github.com/effiy/YrY/blob/main/agents/reporter.md)（本地副本：`~/.claude/plugins/marketplaces/yry/agents/reporter.md`）。本文件只承载项目文档路径与命名规范。

## 项目文档地址

| 类别 | 路径 |
|------|------|
| 故事面板 | `docs/故事任务面板/YrY/<name>/` |
| 评审三件 | `02-后端评审.md` / `03-前端评审.md` / `04-测试评审.md` |
| 实施报告 | `05-后端实施报告.md` / `06-前端实施报告.md` |
| 测试报告 | `07-测试报告.md` |
| 自改进 | `08-自改进复盘.md` |
| 记忆 | `.memory/execution-memory.jsonl` / `.memory/rui-state.json` |
| 提案 | `.improvement/proposals.jsonl` |

## 项目侧生效标志

- 三报告交叉引用使用本档案声明的相对路径，不出现绝对路径或 `docs/<name>/` 漏 `YrY/` 前缀
- 策展 commit 信息含项目名前缀 `YrY:`
