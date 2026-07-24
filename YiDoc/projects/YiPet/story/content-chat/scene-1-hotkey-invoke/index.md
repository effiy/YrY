# US-C1 · 快捷键唤起聊天 + 选区作为上下文

> Story: [content-chat](../index.md) · 前端组件化

## 用户故事

作为在长页面阅读中遇到疑问的用户，我想按快捷键唤起一个贴在页面右侧的聊天面板，并把当前选区作为首轮提问的上下文，以便边读边问。

## 验收标准

- 快捷键 `Cmd/Ctrl+J` 在任意 tab 300ms 内唤起聊天面板，面板默认右侧贴边、可拖拽改宽度。
- 选区文本自动作为"上下文卡片"附在输入框上方，可一键删除或固定。
- 面板折叠/展开状态记忆到 `chrome.storage.local`，跨刷新保留。

## 使用场景 · 组件化

- `<ChatShell>` 只负责布局与拖拽；消息流由 `<MessageList>` 渲染，输入区由 `<ChatInput>` 渲染，上下文卡片由 `<ContextCard>` 渲染，三者通过 `useChatSession()` 协同。
- `useHotkey()` composable 通用化，接收键码 + 回调；不耦合到具体面板。
