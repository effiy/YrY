# Scene · NewsList 中看到 RSS 条目，点击带入会话发问

> Story: [rss](../index.md) · US-RS-3

## 用户故事

作为用户，我能在 NewsList 中看到 RSS 条目，点击带入会话发问。

## 验收

- `/rss/items` 返回最近条目（按发布时间倒序，分页）。
- 点击条目 → 前端携带 `rss_item_id` 发起会话，后端将条目正文作为 context。
- 条目阅读状态标记 `read=true`。

## 使用场景 · 模块化

- 路由 `routes/rss.py` 只读 `domain/rss.list_items()`；domain 联接 `domain/state` 建会话。
- `domain/rss` 不直接创建 session，通过 `domain/state` 公共接口 → 模块依赖单向。
