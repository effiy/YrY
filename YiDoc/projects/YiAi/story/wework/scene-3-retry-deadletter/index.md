# Scene · 失败回调有重试与死信

> Story: [wework](../index.md) · US-WW-3

## 用户故事

作为运维，失败回调有重试与死信。

## 验收

- webhook 失败指数退避重试（max 5 次：1s / 2s / 4s / 8s / 16s）。
- 超过 max 后入死信集合 `wework_deadletter`，保留 30 天。
- 运维可通过 `wework.replay(msg_id)` 手动重投。

## 使用场景 · 模块化

- `services/wework/retry.py` 实现退避；`services/wework/deadletter.py` 持久化。
- `domain/wework.replay()` 是公共入口；domain 不感知重试细节，只暴露 replay 抽象。
