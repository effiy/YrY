# US-C2 · 页面上下文注入 + DOM 片段引用

> Story: [content-chat](../index.md) · 前端组件化

## 用户故事

作为与页面内容深度对话的用户，我想把当前页面的标题、正文摘要、以及我选中的 DOM 片段一并交给模型，以便答案能锚定到页面具体位置。

## 验收标准

- 首次唤起面板时自动构建页面上下文（title + meta + 正文前 800 字），缓存 5 分钟。
- 选区带"引用到对话"按钮：点击后把选区文本作为一条 `quote` 消息追加到消息流，模型回答时可见。
- 引用消息可点击"回到原文" → 触发 scrollIntoView + 高亮 1.5s 后淡出。

## 使用场景 · 组件化

- `<PageContextBuilder>` 模块在后台 worker 中跑，结果通过 `usePageContext()` 拉取；面板组件只消费快照。
- `<QuoteMessage>` 自描述：携带 `xpath` 与 `text`，渲染时由 `<MessageList>` 统一接管，不感知背景获取。
