# Story · integrations/wework · 企微集成

> 模块：[YiPet Story](../index.md) · `src/background/integrations/wework/`

## 场景

- [US-W1 · 企微成员收到任务完成通知](scene-1-notify-task-done/index.md)
- [US-W2 · 企微回调能触发 background handler](scene-2-callback-trigger/index.md)

## 使用场景 · 模块化

- `integrations/wework/` 对外暴露 `notify() / on_callback()`；SDK 适配在模块内部，不外泄。
