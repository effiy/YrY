---

title: "优雅关闭"
doc_type: test
prd_test_id: "YA-09-111"

type: test
status: 待开始
---

# YA-09-111: 优雅关闭 — 测试方案

| 场景 | 期望 |
|------|------|
| 正常关闭 | inflight 归零后退出 |
| 超时 30s | 强制关闭 |
| inflight 计数 | /debug/performance 可查 |