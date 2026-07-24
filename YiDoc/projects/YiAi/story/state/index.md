# Story · 会话 / 任务状态机（state）

> 模块：[YiAi Story](../index.md) · `src/domain/state/`

## 场景

- [US-ST-1 · 会话状态（草稿 / 进行 / 归档）持久化且可恢复](scene-1-session-persistence/index.md)
- [US-ST-2 · 任务执行失败时状态自动回退到上一稳定点](scene-2-rollback-on-failure/index.md)
- [US-ST-3 · 查询某用户全部任务状态时间线](scene-3-timeline-query/index.md)

## 使用场景 · 模块化

- `domain/state/` 定义状态机与迁移规则；`services/state/` 持久化层；observer 旁路记录迁移事件。
- 路由层只调用 `state.transition(session_id, event)`，不感知具体迁移逻辑。
