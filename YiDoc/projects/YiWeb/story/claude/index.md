# Story · Claude 对话交互（claude）

> 模块：[YiWeb Story](../index.md) · `src/views/claude/`

## 场景

- [US-C1 · 多轮对话上下文跨消息持久化](scene-1-multi-turn-conversation/index.md)
- [US-C2 · 模板 / Starter 初始化新对话](scene-2-template-starter/index.md)
- [US-C3 · 流式中断 + 重试 + 恢复](scene-3-stream-interrupt-retry/index.md)
- [US-C4 · 搜索对话历史 + 归档](scene-4-search-archive/index.md)

## 使用场景 · 模块化

- `views/claude/` 基于 `createBaseView` 入口，对话状态完全由 store 管理。
- 流式交互采用 SSE + AbortController，中断时保留已收到的 token。
