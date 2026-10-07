---

title: "Gzip压缩中间件"
doc_type: test
prd_test_id: "YA-09-110"

type: test
status: 待开始
---

# YA-09-110: Gzip 压缩中间件 — 测试方案

| 场景 | 期望 |
|------|------|
| 响应 > 512 bytes | Content-Encoding: gzip |
| 响应 < 512 bytes | 无压缩 |
| 压缩比 | 原始体积明显减小 |
| 性能 | 3-4× faster than level 9 |