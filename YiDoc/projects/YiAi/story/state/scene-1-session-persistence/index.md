# Scene · 会话状态（草稿 / 进行 / 归档）持久化且可恢复

> Story: [state](../index.md) · US-ST-1

## 用户故事

作为用户，我的会话状态（草稿 / 进行 / 归档）持久化且可恢复。

## 验收

- 状态机：`draft → active → archived`；非法迁移拒绝并返回 `INVALID_TRANSITION`。
- 状态持久化到 MongoDB `sessions`；刷新或重连后恢复。
- observer 旁路发布 `SessionTransitioned` 事件。

## 使用场景 · 模块化

- `domain/state.transition(session_id, event)` 是唯一公共入口；规则在 domain。
- `services/state/` 持久化；路由层只调用 `transition()`，不感知迁移规则。
