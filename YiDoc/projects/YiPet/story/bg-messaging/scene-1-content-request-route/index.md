# US-M1 · content 请求路由到 background

> Story: [bg-messaging](../index.md) · 后端模块化

## 用户故事

作为 content script，我想通过一个统一的 messaging 接口把"用户发了一条消息"路由到 background，由 background 决定调用哪个 handler，以便 content 不感知后端拓扑。

## 验收标准

- content 调用 `messaging.send({type:'chat.send', payload})` 必须在 50ms 内完成本地派发（不含 handler 执行）。
- background 的 `router` 按 `type` 路由到 handler，未匹配时返回 `{ok:false, reason:'no-handler'}` 而非抛错。
- 路由层捕获 handler 同步异常，统一转 `{ok:false, reason:'handler-error', message}` 给 content。

## 使用场景 · 模块化

- `messaging/` 暴露 `send()` / `on()` 两个公共接口；内部 `router.ts` 维护 type → handler 表，handler 通过 `register()` 自注册。
- content 与 background 都只依赖 `messaging/` 的接口签名，不直接 import handler 实现 → 边界清晰、可独立测试。
