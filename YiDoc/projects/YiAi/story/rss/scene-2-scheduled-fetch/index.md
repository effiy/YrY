# Scene · 定时拉取 RSS 并将新条目入消息流

> Story: [rss](../index.md) · US-RS-2

## 用户故事

作为系统，我定时拉取 RSS 并将新条目入消息流。

## 验收

- APScheduler `AsyncIOScheduler` 每 `poll_interval` 拉取每个 active 订阅。
- 条目按 `guid` 去重；新条目推送到消息流（`domain/state`）。
- 拉取失败记录到 `rss_fetch_errors`，3 次连续失败暂停订阅。

## 使用场景 · 模块化

- 调度在 `services/rss/scheduler.py`；解析在 `services/rss/parsers/<format>.py`。
- `domain/rss` 只管去重与入流；不感知具体协议（RSS / Atom / JSON Feed）。
