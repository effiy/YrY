---
title: chat/stores/chat.ts 超大 Store 文件（1615 行）
tags: [yipet, code-quality, maintainability]
category: projects/yipet/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiPet
type: bug
status: resolved
severity: minor
priority: p2
---

# chat/stores/chat.ts 超大 Store 文件

## 现象

`src/chat/stores/chat.ts` 文件达到 **1615 行**，包含所有聊天状态管理和业务逻辑：

- 会话管理（CRUD、收藏、重命名、批量删除）
- 窗口管理（拖拽、调整大小、全屏）
- 消息发送/流式接收/重新生成/重发
- 知识库/RAG（树加载、状态、范围、来源预览、分解）
- 缺陷报告（表单草稿、提交）
- 上下文文件管理（页面上下文、知识文件）
- 提示词历史、草稿图片、反馈、导出
- 标签页可见性恢复
- 跨项目桥接（YiVad aiChat、缺陷详情）

## 根因分析

- 从 ChatController 类迁移到 Pinia store 时，将所有逻辑集中在一个文件中
- 缺乏按关注点拆分的意识——Store 成为了"上帝对象"
- 多个 `_timer` 变量（`_searchTimer`、`_scrollTimer`、`_confirmationTimer`、`_compactionTimer`）未在 dispose 中清理

## 涉及文件

- `src/chat/stores/chat.ts` — 1615 行，需要拆分

## 修复方案

按关注点拆分为多个 composable：

1. `useChatMessages` — 消息发送、流式接收、重新生成、持久化
2. `useChatSessions` — 会话 CRUD、收藏、搜索、批量操作
3. `useChatWindow` — 窗口拖拽/调整大小/全屏/侧边栏
4. `useChatKnowledge` — 知识库树、RAG 状态、来源预览、分解
5. `useChatContext` — 页面上下文、上下文文件
6. `useChatBridge` — 跨项目桥接（YiVad、缺陷）

主 store 仅组合这些 composable 并暴露统一接口。


## 影响范围

**影响模块**：`src/chat/stores/chat.ts`（1615 行），所有聊天功能（消息收发、会话管理、知识库、RAG、缺陷报告）。
**影响用户**：开发者维护成本高，新功能添加困难，代码审查效率低。
**影响范围**：所有依赖 chat store 的前端组件和 composable。
## 预防措施

| 层面 | 措施 | 责任人 |
|------|------|--------|
| 代码审查 | Store 文件超过 300 行时触发强制拆分审查 | 开发者 |
| 架构 | 新功能优先实现为 composable，store 仅做组合和状态编排 | 架构师 |
| 工具 | ESLint 规则 `max-lines-per-file` 限制 store 文件行数 | DevOps |
| 流程 | 新增 store 逻辑前先评估是否可独立为 composable | 开发者 |


## 经验教训

大型 Pinia store 是技术债的温床——随着功能迭代，store 会自然膨胀为"上帝对象"。应该在 store 超过 300 行时立即拆分，而非等到 1600 行再重构。拆分成本随行数指数增长。
