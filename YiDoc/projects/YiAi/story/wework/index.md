# Story · 企微联动（wework）

> 模块：[YiAi Story](../index.md) · `src/domain/wework/`

## 场景

- [US-WW-1 · 企微成员收到任务完成通知](scene-1-notify-task-done/index.md)
- [US-WW-2 · 企微回调触发执行引擎启动](scene-2-callback-trigger/index.md)
- [US-WW-3 · 失败回调有重试与死信](scene-3-retry-deadletter/index.md)

## 使用场景 · 模块化

- `domain/wework/` 对外暴露 `notify()` / `on_callback()`；企微 SDK 适配在 `services/` 层。
- 路由层只委派 `wework.on_callback(payload)`，不解析企微协议细节。
