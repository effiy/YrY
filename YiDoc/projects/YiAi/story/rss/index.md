# Story · RSS 订阅源（rss）

> 模块：[YiAi Story](../index.md) · `src/domain/rss/`

## 场景

- [US-RS-1 · 订阅 / 取消 RSS 源](scene-1-subscribe/index.md)
- [US-RS-2 · 定时拉取 RSS 并将新条目入消息流](scene-2-scheduled-fetch/index.md)
- [US-RS-3 · NewsList 中看到 RSS 条目，点击带入会话发问](scene-3-newslist-integration/index.md)

## 使用场景 · 模块化

- `domain/rss/` 负责订阅与去重逻辑；`services/rss/` 负责具体源抓取与解析；路由层只做调度。
- 新源类型加入：在 `services/rss/parsers/` 新增解析器，`domain/rss` 不感知具体协议。
