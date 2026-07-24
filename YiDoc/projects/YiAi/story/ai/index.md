# Story · AI 对话与执行编排（ai）

> 模块：[YiAi Story](../index.md) · `src/domain/ai/`

## 场景

- [US-AI-1 · 流式 AI 回复期间可取消](scene-1-stream-chat/index.md)
- [US-AI-2 · 按 key 路由不同 provider](scene-2-provider-routing/index.md)
- [US-AI-3 · observer 旁路记录 token 与耗时](scene-3-observer-tokens/index.md)

## 使用场景 · 模块化

- `domain/ai/` 仅暴露 `chat()` / `stream()` 公共接口，内部 provider 路由不对外可见。
- `services/` 适配具体 provider SDK；`domain/ai` 只依赖抽象接口 → 模块边界清晰。
