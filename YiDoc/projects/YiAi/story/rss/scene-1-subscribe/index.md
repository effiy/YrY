# Scene · 订阅 / 取消 RSS 源

> Story: [rss](../index.md) · US-RS-1

## 用户故事

作为用户，我能订阅 / 取消 RSS 源。

## 验收

- 订阅接口接收 feed URL + poll interval；存入 MongoDB `rss_subs`。
- 取消 = 标记 `active=false`，不删记录以便后续审计。
- 列表接口返回 active 订阅；支持分页。

## 使用场景 · 模块化

- `domain/rss.subscribe(url)` + `unsubscribe(sub_id)` 是公共入口。
- 持久化在 `services/rss/store.py`；domain 不直接调 Mongo client → 模块边界清晰。
