# Scene · 对单条评论 accept / dismiss / reply

> Story: [aicr](../index.md) · US-A2

## 用户故事

作为 reviewer，我能对单条评论做 accept / dismiss / reply 操作。

## 验收

- 每条评论行携带三个操作按钮：accept / dismiss / reply。
- accept 标记为已解决并置灰；dismiss 需填写理由后隐藏；reply 在行内展开输入框。
- 所有操作回写本地 state，未回写 GitHub（回写见 US-A3）。

## 使用场景 · 组件化

- `<CommentRow>` 组件 emit `action` 事件，父组件路由到 `useReview()`。
- `<ReplyInput>` 组件承载行内回复，独立于 `<CommentRow>` 生命周期。
