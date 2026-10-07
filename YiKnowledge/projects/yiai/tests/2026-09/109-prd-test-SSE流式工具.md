---

title: "SSE流式工具"
doc_type: test
prd_test_id: "YA-09-109"

type: test
status: 待开始
---

# YA-09-109: SSE 流式工具 — 测试方案

| 场景 | 期望 |
|------|------|
| format_sse | `data: {...}\n\n` 格式 |
| orjson 序列化 | datetime/numpy 兼容 |
| stream_async | text/event-stream Content-Type |
| stream_sync | 同步 generator 正常流式 |