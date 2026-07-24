# Scene · 企微成员收到任务完成通知

> Story: [wework](../index.md) · US-WW-1

## 用户故事

作为企微成员，我能收到任务完成通知。

## 验收

- 任务完成触发 `wework.notify(user_ids, message)` → 发企微 webhook。
- 消息 markdown 格式，包含任务标题、结果摘要、详情链接。
- 发送失败入重试队列；成功记录到 `wework_sent`。

## 使用场景 · 模块化

- `domain/wework.notify()` 是公共抽象；企微 webhook SDK 在 `services/wework/client.py`。
- `domain/wework` 不感知企微协议；失败重试由 `services/wework/retry.py` 承担 → 关注点分离。
