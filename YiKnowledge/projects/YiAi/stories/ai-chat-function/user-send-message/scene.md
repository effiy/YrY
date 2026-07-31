---
key: sc_user_send_message
name: 用户发送消息
status: planning
priority: p1
createdAt: 1700000000000
updatedAt: 1700000000000
---

# 用户发送消息

## 描述 (description)

用户在聊天输入框中输入文本消息，点击发送后消息展示在对话列表中，服务端返回 AI 回复。

## 触发条件 (trigger)

用户点击发送按钮或按下 Enter 键。

## 前置条件 (prerequisites)

- 用户已登录
- 对话 Session 已创建

## 预期结果 (expectedResult)

- 用户消息出现在对话列表中
- 显示加载状态
- AI 回复以 Markdown 渲染后展示
- 对话历史被保存

## 步骤 (steps)

| Order | Action | Description |
|-------|--------|-------------|
| 1 | Given | 用户已在聊天界面，存在一个活跃的 Session |
| 2 | When | 用户在输入框中输入文本并点击发送 |
| 3 | Then | 消息出现在对话列表右侧（用户侧） |
| 4 | And | 显示 AI 正在回复的加载动画 |
| 5 | And | AI 回复以 Markdown 渲染格式出现在对话列表左侧 |
| 6 | And | 对话自动滚动到最新消息 |

## 标签 (tags)

- AI
- Chat
- Message

## 关联文件 (files)

- filePath: src/views/aiChat/components/ChatInput.vue
- filePath: src/views/aiChat/components/MessageBubble.vue
- filePath: src/views/aiChat/components/MessageList.vue
