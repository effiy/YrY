# US-SE2 · 长任务可取消与查询进度

> Story: [bg-services](../index.md) · 后端模块化

## 用户故事

作为发起长任务的用户，我想在 popup 看到当前任务的进度百分比，并能随时取消，以便在跑偏或不需要时及时止损。

## 验收标准

- `services/summary.status(taskId)` 立即返回 `{state, progress: 0..1, startedAt}`，≤ 30ms 响应。
- `services/summary.cancel(taskId)` 在 200ms 内停止后续 token 请求；已花费的 API 费用记入审计日志。
- 进度变化通过 `messaging.broadcast({type:'summary.progress', taskId, progress})` 推送订阅者（popup/content）。

## 使用场景 · 模块化

- `services/` 内每个具体 service（如 summary）实现 `start/cancel/status` 三方法；scheduler 统一调度与进度上报。
- handler 只做参数校验 + 委派 services；进度上报由 services 主动发起，handler 不参与推送循环。
