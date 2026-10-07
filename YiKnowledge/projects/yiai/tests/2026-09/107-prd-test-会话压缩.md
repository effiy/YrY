---

title: "会话压缩"
doc_type: test
prd_test_id: "YA-09-107"

type: test
status: 待开始
---

# YA-09-107: 会话压缩 — 测试方案

| 场景 | 期望 |
|------|------|
| 上下文 < 80% | 不触发压缩 |
| 上下文 ≥ 80% | 触发压缩 |
| 压缩后 token 减少 | saved > 0 |
| 压缩日志记录 | compactionLog 新增条目 |