# rui-claude Agent 角色

> rui-claude 是独立工具技能，无 agent 角色定义。通过 `help.mjs` 可执行入口直接调用。

## 技能定位

`.claude/` 配置管理。扫描/同步/更新/回溯 .claude/ 目录下的配置文件。

## 集成角色

本技能不定义 agent 角色，但被以下场景消费：

| 消费方 | 场景 | 方式 |
|--------|------|------|
| rui-init (初始化) | 项目初始化阶段 | 配置同步 |
| rui-yry (自改进) | D7 配置漂移诊断 | 配置对比 |
| 手动调用 | 配置管理 | `/rui-claude` |

## 可执行入口

- `node skills/rui-claude/help.mjs` — 显示帮助