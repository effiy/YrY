# rui-skills Agent 角色

> rui-skills 是独立工具技能，无 agent 角色定义。不属于 rui 编排管线。

## 技能定位

Agent 技能生态发现与安装。搜索开放生态中的 Agent 技能包，五维质量验证，协助安装。从 rui-trends 按 SRP 拆分。

## 集成角色

本技能不定义 agent 角色，但被以下场景消费：

| 消费方 | 场景 | 方式 |
|--------|------|------|
| rui-trends | 技能发现委托 | 趋势中的技能发现转交 |
| 手动调用 | 按需扩展能力 | `/rui-skills <command>` |

## 可执行入口

- `npx skills find [query]` — 搜索技能
- `npx skills add <package>` — 安装技能
- `node skills/rui-skills/help.mjs` — 显示帮助