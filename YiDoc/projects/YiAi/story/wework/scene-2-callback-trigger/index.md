# Scene · 企微回调触发执行引擎启动

> Story: [wework](../index.md) · US-WW-2

## 用户故事

作为系统，企微回调能触发执行引擎启动。

## 验收

- 企微回调路由验签（`wework_signature`）；失败拒绝。
- 验签后 `wework.on_callback(payload)` 翻译为 `execution.run(plan)`。
- 异步执行，立即返回 `accepted=true` + `plan_id`。

## 使用场景 · 模块化

- `routes/wework.py` 只验签 + 委派；不解析业务 payload。
- `domain/wework.on_callback()` 翻译回调为 plan；调 `domain/execution.run()` → 模块单向依赖。
