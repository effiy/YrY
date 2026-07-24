# Scene · 流式回复期间中断与重试

> Story: [claude](../index.md) · US-C3

## 用户故事

作为用户，流式回复期间能中断与重试。

## 验收

- 流式期间显示"停止"按钮，点击后立即终止 reader。
- 中断后保留已接收片段；"重试"基于上一条 user 消息重新发起。
- AbortController 释放，无泄漏 socket。

## 使用场景 · 组件化

- `<StreamControls>` 组件承载停止 / 重试按钮；emit `stop` / `retry`。
- `useStream()` composable 包装 `AbortController` + `requestHelper.js` 的 reader 生命周期。
