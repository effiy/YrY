# rui-bot Agent 角色

> rui-bot 是独立工具技能，无 agent 角色定义。通过 `send.mjs` 可执行入口直接调用。

## 技能定位

企业微信机器人通知。负责消息推送和日志追加，健康诊断委托 rui-health。

## 集成角色

本技能不定义 agent 角色，但被以下管线阶段消费：

| 消费方 | 场景 | 方式 |
|--------|------|------|
| rui (编排器) | 交付阶段 | 委托发送通知 |
| rui-health | 健康告警 | 通过报告文件路径 |
| Cron 定时 | 自动轮询 | 通知队列 + 健康报告 + 失败重试 |

## 可执行入口

- `node skills/rui-bot/send.mjs [options]` — 发送通知或健康检查
- `node skills/rui-bot/help.mjs` — 显示帮助