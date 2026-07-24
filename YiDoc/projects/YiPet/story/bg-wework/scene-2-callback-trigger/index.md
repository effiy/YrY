# US-W2 · 企微回调能触发 background handler

> Story: [bg-wework](../index.md) · 后端模块化

## 用户故事

作为在企微群内点击"查看详情"或"重新跑一次"按钮的用户，我想企微回调能触发 background 的对应 handler，以便在企微内一键驱动 YiPet 动作。

## 验收标准

- 企微回调 URL 由 `integrations/wework/callback.ts` 暴露；签名校验在 50ms 内完成，未通过返回 401。
- 回调事件转 `messaging.send({type:'wework.callback', payload})` → router 路由到对应 handler；handler 不感知回调来源。
- 回调 handler 复用既有 `services/*/start()` 公共接口，不绕开调度器直接起任务。

## 使用场景 · 模块化

- `integrations/wework/` 对外暴露 `on_callback()` 注册入口；回调路由由模块内部完成，handler 只看到标准化事件。
- handler 与 wework 模块无直接依赖；wework 替换为其他 IM 时，handler 代码不变，只换 `integrations/<im>/` 实现。
