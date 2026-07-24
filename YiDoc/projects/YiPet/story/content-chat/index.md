# Story · content/chat · AI 对话面板

> 页面：[YiPet Story](../index.md) · `src/content/chat/`

## 场景

- [US-CC1 · 任意网页按快捷键呼出 chat 面板，多轮对话](scene-1-hotkey-invoke/index.md)
- [US-CC2 · 面板感知当前页面上下文](scene-2-page-context/index.md)
- [US-CC3 · 流式回复能中断与重试](scene-3-stream-interrupt/index.md)
- [US-CC4 · 消息支持 Mermaid 图表渲染](scene-4-mermaid-render/index.md)

## 使用场景 · 组件化

- `content/mermaid/` 封装图表渲染为独立模块；chat 通过事件总线调用，不内嵌渲染逻辑。
- `content/ai/` 作为 AI 能力外观层，chat 只编排，不直接接触 background messaging。
