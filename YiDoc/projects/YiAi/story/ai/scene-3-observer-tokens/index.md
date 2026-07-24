# Scene · observer 旁路记录 token 与耗时

> Story: [ai](../index.md) · US-AI-3

## 用户故事

作为运维，我能看到每次 AI 调用的 token 消耗与耗时（observer 旁路）。

## 验收

- 每次 AI 调用发布 `AIInvoked` 事件，携带 `tokens_in / tokens_out / latency_ms`。
- observer 旁路写入 metrics backend；主流程不等待 observer 完成。
- observer 异常不污染主流程（`guard` 限制深度 3）。

## 使用场景 · 模块化

- `src/observer/` 是横切层，通过 ASGI 中间件 wrap；`domain/ai` 不感知 observer。
- 事件契约在 `shared/events.py` 定义；observer 订阅而非直调 → 解耦。
