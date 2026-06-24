# rui-story Agent 角色

> rui-story 是管线工具技能，无 agent 角色定义。通过 `rui-story.mjs` 可执行入口直接调用。

## 技能定位

故事面板管理。远端 + 本地故事面板查询、同步、删除、冲突检测。管理知识图谱三层 schema (story→scene→source)。

## 集成角色

本技能不定义 agent 角色，但被以下场景消费：

| 消费方 | 场景 | 方式 |
|--------|------|------|
| rui (编排器) | 推荐引擎 §0 面板同步 | 委托查询 |
| rui-yry (自改进) | §1 全量扫描 | 委托扫描 |
| 手动调用 | 面板管理 | `/rui-story <command>` |

## 知识图谱所有权

- **pm**: 创建 story/scene 节点 + 定义功能点
- **coder**: 创建 source 节点 + implements 边
- **reporter**: 读取验证，不写入

## 可执行入口

- `node skills/rui-story/rui-story.mjs [command]` — 面板操作
- `node skills/rui-story/help.mjs` — 显示帮助