<!-- rui-init: project-agent-shell -->
<!-- 项目: YrY · 类型: 元项目(插件/配置) · 生成: rui init -->
# Agents（项目实例 · YrY）

> **口诀：指人、给据、收口。** 每条决策必有人负责，每个结论必有证据，每个变更必收闭环。

> 角色拓扑、共用底线（证据等级 / 影响分析 / 生效标志）见 [插件 agents/AGENT.md](https://github.com/effiy/YrY/blob/main/agents/AGENT.md)（本地副本：`~/.claude/plugins/marketplaces/yry/agents/AGENT.md`）。本文件只承载项目特有的角色画像。

## 项目角色画像

| Agent | 项目侧主要承载 | 项目档案 |
|-------|--------------|---------|
| pm | 故事拆分锚定项目 `YrY` | [pm.md](./pm.md) |
| coder | 元项目(插件/配置)（公式 `模块 → 接口 → 数据流`） | [coder.md](./coder.md) |
| tester | 项目构建/测试命令 + Gate A/B | [tester.md](./tester.md) |
| security | 项目安全约束 + 敏感依赖 | [security.md](./security.md) |
| reporter | 项目文档路径 + 交叉引用 | [reporter.md](./reporter.md) |
| self-improve | 项目记忆/提案数据源 | [self-improve.md](./self-improve.md) |

## 项目档案

- 项目: **YrY**
- 类型: **元项目(插件/配置)**
- 描述: 故事驱动的 SDLC 编排系统，运行于 Claude Code。把模糊的需求变成可交付的代码，每一步留下可追溯的证据。
- 生态: meta
