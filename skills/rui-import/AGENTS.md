# rui-import Agent 角色

> rui-import 是独立工具技能，无 agent 角色定义。通过 `sync.mjs` 可执行入口直接调用。

## 技能定位

文档远端同步。将 workspace 内文档批量同步到远端 API，手动触发。

## 集成角色

本技能不定义 agent 角色，但被以下场景消费：

| 消费方 | 场景 | 方式 |
|--------|------|------|
| rui (编排器) | 交付阶段步骤 ② | 委托同步 |
| 手动调用 | 独立同步 | `/rui-import` |

## 可执行入口

- `node skills/rui-import/sync.mjs [options]` — 扫描 + 上传
- `node skills/rui-import/help.mjs` — 显示帮助