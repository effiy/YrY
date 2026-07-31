---
key: sc_conversation_history
name: 对话历史管理
status: planning
priority: p2
createdAt: 1700000000000
updatedAt: 1700000000000
---

# 对话历史管理

## 描述 (description)

用户可以查看历史对话列表，点击某条对话进入详情继续聊天，也可删除不需要的对话。

## 触发条件 (trigger)

用户点击侧边栏中的历史对话条目。

## 前置条件 (prerequisites)

- 用户已登录
- 存在至少一条历史对话

## 预期结果 (expectedResult)

- 侧边栏展示对话列表，按更新时间倒序
- 点击某条对话后加载完整历史消息
- 删除对话后列表实时更新
- 删除操作有二次确认

## 步骤 (steps)

| Order | Action | Description |
|-------|--------|-------------|
| 1 | Given | 用户已登录，存在多条历史对话 |
| 2 | When | 用户打开聊天页面，侧边栏展示对话列表 |
| 3 | Then | 对话列表按更新时间倒序排列，每条显示标题和更新时间 |
| 4 | When | 用户点击某条对话 |
| 5 | Then | 加载该对话的完整消息历史 |
| 6 | When | 用户右键某条对话选择删除 |
| 7 | Then | 弹出二次确认弹窗 |
| 8 | And | 确认后对话从列表移除，数据被删除 |
| 9 | And | 若删除的是当前活跃对话，自动切换到下一条或新建对话 |

## 标签 (tags)

- AI
- Chat
- History
- Session

## 关联文件 (files)

- filePath: src/views/aiChat/components/ConversationSidebar.vue
- filePath: src/views/aiChat/components/ConversationListItem.vue
- filePath: src/api/modules/sessions.ts
