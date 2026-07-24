# Scene · 任务执行失败时状态自动回退到上一稳定点

> Story: [state](../index.md) · US-ST-2

## 用户故事

作为系统，任务执行失败时状态自动回退到上一稳定点。

## 验收

- 执行失败触发 `state.transition(session, rollback)`；恢复上一快照。
- 快照在每步成功后保存；最多保留 5 个历史快照。
- 回退后 session 标记为 `active`，前端可见错误并允许重试。

## 使用场景 · 模块化

- 执行器只发 `StepFailed`；`domain/state` 消费并执行回退 → 关注点分离。
- `domain/execution` 不直接管理回退逻辑；通过事件解耦，便于后续替换状态机实现。
