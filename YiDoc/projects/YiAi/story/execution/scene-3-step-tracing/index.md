# Scene · 追踪每一步执行的状态与产物

> Story: [execution](../index.md) · US-EX-3

## 用户故事

作为运维，我能追踪每一步执行的状态与产物。

## 验收

- 每步发布 `StepStarted / StepDone / StepFailed` 事件，携带 `plan_id / step_id / artifact_uri`。
- `state.timeline(plan_id)` 返回有序状态迁移列表。
- 产物（artifact）存入 `domain/files`，timeline 引用其 `file_id`。

## 使用场景 · 模块化

- 执行器只发事件，不写状态机；`domain/state` 消费事件并持久化 → 关注点分离。
- observer 旁路记录；`domain/execution` 不直调 `domain/state`，通过事件契约解耦。
