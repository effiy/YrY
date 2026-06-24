# rui-health Agent 角色

> rui-health 是独立工具技能，无 agent 角色定义。通过 `health.mjs` 可执行入口直接调用。

## 技能定位

系统健康诊断。从 rui-bot 按 SRP 拆分，负责 16 维度评分、D0-D8 诊断引擎、HTML 报告生成和健康趋势持久化。

## 集成角色

本技能不定义 agent 角色，但被以下场景消费：

| 消费方 | 场景 | 方式 |
|--------|------|------|
| rui-bot | 健康通知 | 通过报告文件路径解耦 |
| rui-yry (自改进) | 自改进面板 | 读取 health-trend.jsonl |
| Cron 定时 | 自动健康巡检 | 每 30 分钟 |
| 通知面板 | 健康评分展示 | 读取 HTML 报告索引 |

## 与 rui-bot 的 SRP 边界

- **rui-health**: 管健康诊断 + 报告生成
- **rui-bot**: 管消息推送 + 通知发送
- **解耦方式**: 通过报告文件路径传递，不直接调用

## 可执行入口

- `node skills/rui-health/health.mjs [--json|--html|--trend|--notify]` — 运行诊断
- `node skills/rui-health/help.mjs` — 显示帮助