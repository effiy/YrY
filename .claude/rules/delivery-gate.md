---
paths:
  - "docs/故事任务面板/**/.memory/rui-state.json"
  - "docs/故事任务面板/**/*.md"
---

# delivery-gate

> **口诀：标记即证据。** 三步交付按序执行，每步必标记。

## 适用

YrY 每个 `/rui` 命令的末端。

## 三步管线

| # | 操作 | 标记 |
|---|------|------|
| 1 | 追加日志 | `log_appended` |
| 2 | 文档同步 | `docs_synced` |
| 3 | 发送通知 | `notification_sent` |

## 规则

1. 标记即证据：未标记视为未执行
2. 顺序强制：三步严格按序
3. Stop hook：1 小时内有活动且未闭合 → 阻断
4. `API_X_TOKEN` 仅从环境变量读取，禁止写入文件
5. 缺 Token → `no-token` 降级，跳过推送但仍标记

## 阻断标识

| 标识 | 触发 | 降级 |
|------|------|------|
| `delivery-incomplete` | 三步未全部标记 | 否 |
| `no-token` | API_X_TOKEN 缺失 | 是 |
