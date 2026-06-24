# rui-version Agent 角色

> rui-version 是管线工具技能，无 agent 角色定义。通过 `help.mjs` 可执行入口直接调用。

## 技能定位

语义化版本管理。自主判定下一版本号 (MAJOR/MINOR/PATCH)，更新所有版本文件，git commit + tag + push。项目级和故事级统一入口。

## 集成角色

本技能不定义 agent 角色，但被以下场景消费：

| 消费方 | 场景 | 方式 |
|--------|------|------|
| rui (编排器) | 交付阶段 | 委托版本升级 |
| rui-yry (自改进) | 每个闭环 | 自动 bump 版本号 |
| 手动调用 | 版本管理 | `/rui-version --up` |

## 版本判定

| 变更类型 | 版本升级 | 触发信号 |
|---------|:---:|------|
| 破坏性 API 变更 | MAJOR | 删除/重命名公开接口 |
| 新增功能/接口 | MINOR | 新增 export/故事/skill |
| 修复/文档/重构 | PATCH | bug fix/文档更新 |

## 可执行入口

- `node skills/rui-version/help.mjs` — 显示帮助