# rui-trends Agent 角色

> rui-trends 是管线工具技能，无 agent 角色定义。通过 `rui-trends.mjs` 可执行入口直接调用。

## 技能定位

技术趋势发现。查询 GitHub Trending、OSS Insight、TrendShift、Top-Starred 四个数据源，输出结构化趋势报告。技能发现委托 rui-skills。

## 集成角色

本技能不定义 agent 角色，但被以下场景消费：

| 消费方 | 场景 | 方式 |
|--------|------|------|
| rui-yry (自改进) | D0/D3/D5/D6 诊断 | 读取趋势报告 |
| rui-plan (计划) | 技术选型验证 | 读取趋势快照 |
| 手动调用 | 独立趋势探查 | `/rui-trends <sub>` |

## 数据源

| # | 数据源 | 频率 |
|---|--------|------|
| 1 | GitHub Trending | 每日 |
| 2 | OSS Insight | 每周 |
| 3 | TrendShift | 每周 |
| 4 | Top-Starred | 按需 |

## 可执行入口

- `node skills/rui-trends/rui-trends.mjs [command]` — 趋势查询
- `node skills/rui-trends/help.mjs` — 显示帮助