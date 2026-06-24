# rui-npm Agent 角色

> rui-npm 是独立工具技能，无 agent 角色定义。通过 `rui-npm.mjs` 可执行入口直接调用。

## 技能定位

个人 npm packages 管理器。搜索、安装、更新、列表、信息、卸载、本地发布、npx 执行、CDN 引用、账号级管理。

## 集成角色

本技能不定义 agent 角色，但被以下场景消费：

| 消费方 | 场景 | 方式 |
|--------|------|------|
| rui-init (初始化) | 安装项目依赖 | 委托安装 |
| rui-yry (自改进) | D5 依赖退化诊断 | 依赖健康检查 |
| rui-analysis | 安全扫描 | npm audit |
| 手动调用 | 包管理 | `/rui-npm <command>` |

## 可执行入口

- `node skills/rui-npm/rui-npm.mjs [command]` — 执行 npm 操作
- `node skills/rui-npm/help.mjs` — 显示帮助