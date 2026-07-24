# US-C3 · 流式回答 + 中断/续传

> Story: [content-chat](../index.md) · 前端组件化

## 用户故事

作为长答案的提问者，我想看到模型回答逐字流式出现，并且可随时按"停止"中断；中断后能基于已生成内容续传或重新提问。

## 验收标准

- 流式 token 以 ≤ 80ms 节拍增量渲染，未完成时显示"生成中"光标。
- "停止"按钮立即中断 fetch（AbortController），已生成内容保留为一条 `partial` 消息。
- 中断消息可点"继续生成" → 用历史 + partial 作为 prefix 续传；也可点"重试"整条重发。

## 使用场景 · 组件化

- `<StreamingMessage>` 内部用 `useTokenStream()`，组件只接收 `stream$` 与 `onAbort`；UI 不感知 fetch 细节。
- `<StopButton>` 与 `<RetryButton>` 是无状态纯组件，靠 props 驱动；中断逻辑集中在 `useChatSession()`。
