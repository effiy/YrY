---

title: "SSE流式工具"
doc_type: task
prd_task_id: "YA-09-109"

type: task
status: 待开始
---

# YA-09-109: SSE 流式工具 — 技术设计

## 实现

**文件**：`shared/sse_utils.py`

```python
def format_sse(data) → f"data: {orjson.dumps(data).decode()}\n\n"
async def stream_async(gen, format_fn) → StreamingResponse
def stream_sync(gen, format_fn) → StreamingResponse
```

**消费者**：`server/routes/chat.py`、`server/routes/rag.py`、`server/routes/execution.py`

**去重**：2026-09-10 从 chat/rag/execution 路由中移除重复的 `_format_sse`/`_stream_async`（共 43 行）

## 非功能需求

| 维度 | 实现 |
|------|------|
| 性能 | orjson 2-5× faster |
| 维护性 | 单点修改，3 个路由消费者 |