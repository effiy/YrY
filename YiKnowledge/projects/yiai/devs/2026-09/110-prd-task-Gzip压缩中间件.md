---

title: "Gzip压缩中间件"
doc_type: task
prd_task_id: "YA-09-110"

type: task
status: 待开始
---

# YA-09-110: Gzip 压缩中间件 — 技术设计

## 实现

**文件**：`server/gzip_middleware.py`

**核心**：纯 ASGI 协议 `__call__(scope, receive, send)` + zlib.compress(level=1) + minimum_size=512 字节阈值

**对比 Starlette**：level 9 → level 1，体积增 ~10%，速度 3-4× faster

## 非功能需求

| 维度 | 目标 |
|------|------|
| 压缩速度 | 3-4× faster than level 9 |
| 小响应跳过 | < 512 bytes 不压缩 |