---

title: "AiChatBox"
doc_type: test
prd_test_id: "YV-09-106"

type: test
status: 待开始
---

# YV-09-106: AiChatBox — 测试方案

| 场景 | 期望 |
|------|------|
| 发送消息 | SSE 流式接收 |
| 停止生成 | abort → aborted=true |
| 消息持久化 | MongoDB sessions 写入 |
| 桥接打开 | ?session=key 选择会话 |
| 空消息发送 | 按钮 disabled |