# US-H1 · 每条命令可观测（日志 / 错误）

> Story: [bg-handlers](../index.md) · 后端模块化

## 用户故事

作为运维者，我想每条命令的进入/退出/耗时/错误都进入结构化日志，并能按 traceId 串联同一请求的多条 handler 调用，以便定位线上偶发问题。

## 验收标准

- 每条命令进入 handler 时自动写入 `{ts, traceId, type, tabId}`；退出时写 `{ts, traceId, duration, ok}`。
- handler 抛错时错误经 `errors/normalize.ts` 归一化为 `{code, message, stack?}`，写入日志且不影响其他 handler。
- 日志按 ring buffer 保留最近 500 条；超出自动落盘到 `chrome.storage.local` 的 `logs/` 段。

## 使用场景 · 模块化

- `observability/` 暴露 `startSpan(type)` / `logError(err)` 公共接口；handler 调用 `startSpan()` 包裹自身逻辑，不感知存储细节。
- `errors/` 独立模块：`normalize()` 接收任意异常返回归一化结构；handler 只依赖该接口，不重复实现 try/catch。
