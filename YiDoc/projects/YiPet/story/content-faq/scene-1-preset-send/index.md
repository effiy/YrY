# US-F1 · 快捷键唤起 + 上下文注入

> Story: [content-faq](../index.md) · 前端组件化

## 用户故事

作为浏览长文档的用户，我想在当前页面按快捷键唤起 FAQ 面板，并自动带上当前选区/URL 作为上下文，以便一键获得针对本页内容的解释。

## 验收标准

- 快捷键（默认 `Cmd/Ctrl+Shift+F`）在任意页面 300ms 内唤起 FAQ 面板，焦点自动落在输入框。
- 若有选区，则选区文本自动填入输入框并折叠展示；无选区时面板以"询问本页"模式启动。
- 再次按同一快捷键或 `Esc` 关闭面板，且不影响页面原有滚动位置。

## 使用场景 · 组件化

- `<FaqPanel>` 由 `<HotkeyListener>`、`<ContextPreview>`、`<QuestionInput>` 三个子组件拼装；快捷键逻辑独立于面板渲染。
- `useSelectionSnapshot()` composable 监听 `selectionchange`，去抖 150ms 后将选区快照交给 `<ContextPreview>`。
