---
doc_type: prd
title: "YP-09-23: 聊天弹框样式对齐 YiVad AI Chat — 视觉一致性与专业化"
tags: [需求文档, 体验优化, 聊天窗口, 样式对齐, UI一致性, 前端]
category: 项目/浏览器扩展/需求
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: 需求
status: 已完成
implementation_progress: 已全部实现并测试通过
implementation_updated: '2026-09-23'
priority: P1
project: YiPet
project_id: yipet
owner: 陈铭
prd_month: "202609"
related_dev: "239-prd-task-聊天弹框样式对齐YiVad.md"
related_test: "239-prd-test-聊天弹框样式对齐YiVad.md"
prd_task_id: YP-09-23
estimate_frontend: 1.0
review_status: 待评审
issue_type: 体验优化
roles: [engineer]
source_okr: [yipet-004]
related_modules: [239-prd-task-聊天弹框样式对齐YiVad]
related_tests: [239-prd-test-聊天弹框样式对齐YiVad]
---

# YP-09-23: 聊天弹框样式对齐 YiVad AI Chat — 视觉一致性与专业化

> **文档职责**：本文档定义**要做什么、为什么做、做到什么程度算完成**（WHAT / WHY），不含实现方案与测试用例。

> 需求编号：YP-09-23 · 优先级：P1 · 人天：1.0d · 状态：已完成
> 参考标准：`http://localhost:8848/#/ai-chat` YiVad AI Chat 模块

## 背景

YiPet 聊天弹框是用户与 AI 交互的核心界面。当前实现与 YiVad 管理后台的 AI Chat 模块在视觉风格上存在 8 类不一致：

| # | 不一致项 | YiVad（标准） | YiPet（当前） | 影响 |
|---|---------|--------------|-------------|------|
| 1 | 用户消息气泡 | 渐变主题色背景 + 白色文字，圆角 `18px 18px 4px 18px` | 浅蓝色纯色背景 + 深色文字，通用圆角 | 品牌识别度低 |
| 2 | 助手消息气泡 | 白色背景 + 边框，圆角 `18px 18px 18px 4px` | 灰色填充背景，无边框 | 层次感不足 |
| 3 | 消息元数据 | 默认隐藏（opacity:0），悬停时显示 | 始终可见 | 界面冗余 |
| 4 | 消息分组 | 同角色连续消息自动合并圆角 | 无分组 | 视觉噪音 |
| 5 | 日期分隔符 | 线条式（`::before`/`::after` 伪元素） | 胶囊标签式 | 风格不一致 |
| 6 | 滚动到底按钮 | 胶囊按钮 + 未读计数徽章 | 圆形按钮 | 功能缺失 |
| 7 | 快捷按钮 | 白色卡片式 + 悬停阴影/缩放 | 纯色填充式 | 精致度不足 |
| 8 | 输入框焦点环 | `box-shadow: 0 0 0 3px primary-rgb/12%` + `translateY(-1px)` | 简单的边框变色 | 交互反馈弱 |

## 目标

以 YiVad `http://localhost:8848/#/ai-chat` 聊天模块为唯一标准，将 YiPet 聊天弹框的视觉样式、交互行为和内容呈现对齐到一致水平。

### 验收标准

- [x] 用户消息气泡：渐变主题色背景、白色文字、正确圆角
- [x] 助手消息气泡：白色背景 + 边框、正确圆角
- [x] 消息元数据默认隐藏，悬停时平滑显示
- [x] 同角色连续消息自动分组合并圆角
- [x] 日期分隔符为线条式样式
- [x] 滚动到底按钮为胶囊样式 + 未读计数徽章
- [x] Markdown 渲染：代码块含复制按钮、表格、任务列表、引用块样式一致
- [x] 快捷按钮：白色卡片式 + 悬停阴影/缩放效果
- [x] 输入框焦点环匹配 YiVad
- [x] 窗口拖拽头部精简（移除冗余的流式状态指示器，已在 inline header 中展示）
- [x] `vue-tsc --noEmit` 通过，`npm run build` 通过，138 个测试全部通过

## 范围

### 涉及文件

| 文件 | 变更类型 |
|------|---------|
| `src/chat/components/MessageBubble/styles/bubble.scss` | 重写 |
| `src/chat/components/MessageBubble/MessageBubble.vue` | 修改（+分组逻辑） |
| `src/chat/components/MessageBubble/MessageMetaRow.vue` | 修改（类名对齐） |
| `src/chat/components/MessageBubble/MessageActions.vue` | 修改（移除冗余透明度） |
| `src/chat/components/ChatMessages_styles/messages.scss` | 重写 |
| `src/chat/components/ChatMessages.vue` | 修改（+未读计数、移除重复 watch） |
| `src/chat/components/ChatInput_styles/input.scss` | 重写 |
| `src/chat/components/QuickButtons.vue` | 修改（样式重写） |
| `src/chat/components/ChatHeader.vue` | 修改（精简） |

### 不变更范围

- 聊天核心逻辑（store、API、流式处理）
- 侧边栏（sessions/knowledge/bugs/stories）
- 工具栏（ChatToolbar）
- RAG/知识库集成
- 跨项目桥接
- StatsBar / ProjectHealthCard（YiPet 独有功能保留）

## 非目标

- 不新增功能特性
- 不修改后端 API
- 不修改弹窗（popup）模块
- 不修改内容脚本（content script）注入逻辑

## 风险

| 风险 | 缓解 |
|------|------|
| 样式变更影响现有功能 | 全部 138 个测试通过 + typecheck + build 通过 |
| CSS 特异性冲突 | 使用与 YiVad 相同的 BEM 类名规范 |
| 消息分组逻辑性能 | computed 属性基于已有 messages 数组，开销可忽略 |