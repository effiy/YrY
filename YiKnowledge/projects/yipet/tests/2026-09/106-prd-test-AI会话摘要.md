---

title: "AI会话摘要"
doc_type: test
prd_test_id: "YP-09-106"

type: test
status: 待开始
---

# YP-09-106: AI 会话摘要 — 测试方案

| 场景 | 期望 |
|------|------|
| 20+ 消息会话 | 流式生成 5-8 要点 |
| 空会话 | 按钮 disabled |
| 复制摘要 | clipboard.writeText 成功 |
| 流式中关闭 | 关联 abort |