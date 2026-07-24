# US-SE1 · 长任务在后台持续，结果回写 content

> Story: [bg-services](../index.md) · 后端模块化

## 用户故事

作为发起长任务（如网页摘要）的用户，我想关掉 popup 后任务在 background 继续执行，完成后把结果回写到对应 tab 的 content script，以便关 popup 不丢任务。

## 验收标准

- `services/summary.start({tabId, url})` 立即返回 `taskId`；任务在 background 持续执行，不依赖 popup 存活。
- 任务完成后通过 `messaging.send({type:'summary.done', tabId, result})` 投递到 content；若 tab 已关闭则结果缓存 30 分钟。
- 同一 tab 重复发起同种任务返回已有 `taskId` 而非新建，避免重复扣费。

## 使用场景 · 模块化

- `services/` 暴露 `start() / cancel() / status()` 公共接口；handler 委派 services，不感知任务调度。
- 任务调度由 `services/scheduler.ts` 内部维护，handler 与 content 都只见 `taskId` 与结果事件 → 边界清晰。
