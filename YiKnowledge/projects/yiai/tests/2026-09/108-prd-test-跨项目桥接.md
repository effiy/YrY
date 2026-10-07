---

title: "跨项目桥接"
doc_type: test
prd_test_id: "YA-09-108"

type: test
status: 待开始
---

# YA-09-108: 跨项目桥接 — 测试方案

| 场景 | 期望 |
|------|------|
| 生成 token | 返回有效 token 字符串 |
| 验证有效 token | 返回 session_key |
| 重复使用 token | 拒绝（已消费） |
| 过期 token | 拒绝（>60s） |