# Scene · 查询某用户全部任务状态时间线

> Story: [state](../index.md) · US-ST-3

## 用户故事

作为运维，我能查询某用户全部任务状态时间线。

## 验收

- 接口 `GET /state/timeline?user_id=&session_id=` 返回有序迁移列表。
- 过滤：按 session_id / 时间范围；分页。
- 每条含：`session_id / from / to / event / timestamp`。

## 使用场景 · 模块化

- `domain/state.timeline(user_id, filters)` 是公共入口；读 `services/state/`。
- 路由层只做参数解析与分页；不感知查询语义 → 路由瘦，domain 胖。
