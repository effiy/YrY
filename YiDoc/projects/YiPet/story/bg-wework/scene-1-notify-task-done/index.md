# US-W1 · 企微成员收到任务完成通知

> Story: [bg-wework](../index.md) · 后端模块化

## 用户故事

作为团队负责人，我想当 background 的长任务完成（或失败）时，相关企微成员收到卡片消息通知，以便离开浏览器也能掌握任务状态。

## 预收标准

- 任务 `done` / `failed` 事件触发 `wework.notify({chatId, taskId, state, summary})`；30s 内企微群收到卡片。
- 通知失败时进入 `wework/` 内部重试队列，最多 3 次（指数退避）；仍失败写入 deadletter 段供人工补发。
- 通知内容包含任务 ID、状态、耗时、摘要前 120 字、可点击的"在 YiPet 中查看"链接。

## 使用场景 · 模块化

- `integrations/wework/` 暴露 `notify()` 公共接口；内部 `queue.ts` 维护重试与 deadletter，handler 只调用 `notify()` 不感知策略。
- 企微 SDK 适配在 `integrations/wework/sdk.ts` 内部；外部模块只见 `notify()` 签名，可替换为钉钉/飞书而不影响 handler。
