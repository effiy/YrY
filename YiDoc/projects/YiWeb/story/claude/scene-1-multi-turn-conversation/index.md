# Scene · 多轮对话上下文跨消息持久化

> Story: [claude](../index.md) · US-C1

## 用户故事

作为用户，我能与 Claude 进行多轮对话，上下文跨消息持久化。

## 验收

- 消息按发送顺序追加；上下文窗口超限时自动截断最旧非系统消息。
- 会话持久化到 localStorage，刷新后恢复。
- 系统消息始终保留在窗口顶端。

## 使用场景 · 组件化

- `<MessageList>` + `<MessageBubble>` 组件；列表仅渲染，不持有状态。
- `useConversation()` composable 管理消息收发、上下文截断、持久化。
