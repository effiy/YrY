---
doc_type: module
prd_task_id: "YV-09-86"
title: "YV-09-86: AI Chat 页面布局修复与体验优化 — 开发方案"
status: 已完成
priority: P0
owner: ""
roles: [engineer]
created: 2026-09-16
updated: 2026-09-16
project: YiVad
project_id: yivad
prd_month: "202609"
estimate_frontend: 0.5
---

# YV-09-86: AI Chat 页面布局修复与体验优化 — 开发方案

## 一、问题描述

`/aiChat` 页面在初始加载时出现空白问题，主要原因为 AiChatBox 组件的 fill 模式布局结构缺陷。此外，ChatToolbar 中的 Context 按钮弹出面板功能不完善：
1. 缺少文件拖拽添加功能，用户仅能通过 `@` 输入框提及方式添加上下文文件
2. 独立的 Knowledge files 侧边栏占用页面空间，且与 Context 功能割裂
3. 知识文件浏览需打开独立侧边栏，无法在 Context 面板中直接完成

## 二、根因分析

### 布局结构错误（核心问题）

`AiChatBox.vue` 的 fill 模式中，`ai-chat-box__body` 是 `display: flex` 容器（默认 `flex-direction: row`），但聊天组件（`MessageList`、`QuickButtons`、`ChatInput`）作为直接子元素与会话侧边栏（`ConversationSessionSidebar`）一起被布局在同一行中。

SCSS 中已定义 `.ai-chat-box__chat` 类（`display: flex; flex-direction: column; flex: 1`），但模板中**缺失该包装元素**，导致：
- 消息列表、快捷按钮、输入框与会话侧边栏横向排列
- 消息列表的 `flex: 1` 无法正确获取垂直空间
- 整个聊天区域布局坍塌，页面呈现空白

### 高度链脆弱

`Main/index.scss` 的 `.main-view` 仅设置 `flex: 1` 和 `overflow-y: auto`，缺少 `display: flex`。当子组件使用 `height: 100%` 时，在部分场景下无法正确解析百分比高度。

### 首次加载体验差

首次访问无会话时，页面仅显示空状态提示，知识文件侧边栏默认隐藏，用户体验不友好。

### Context 面板功能不完善

ChatToolbar 的 Context 按钮弹出面板仅展示已有上下文文件列表或空状态提示，缺失两个关键能力：
- 无法从知识库浏览并选择文件添加到上下文
- 无拖拽知识文件到上下文区域的交互方式
- 知识文件浏览需要打开独立的工具栏按钮和侧边栏，交互碎片化

## 三、修复方案

### 3.1 布局修复（AiChatBox.vue）

在 `ai-chat-box__body` 内添加 `<div class="ai-chat-box__chat">` 包装元素，将聊天相关组件（标题、会话头、消息列表、快捷按钮、输入框、LlamaIndexPanel）包裹在独立的列布局中：

```
ai-chat-box__body [flex row]
├── ai-chat-box__session-sidebar  [180px]
├── ai-chat-box__session-resizer  [4px]
└── ai-chat-box__chat             [flex: 1, flex column]
    ├── ai-chat-box__hdr (title)
    ├── ai-chat-box__chat-hdr
    ├── MessageList
    ├── QuickButtons
    ├── ChatInput
    └── LlamaIndexPanel
```

### 3.2 高度链加固（Main/index.scss）

`.main-view` 添加 `display: flex; flex-direction: column;`，确保子组件能通过 `flex: 1` 和 `height: 100%` 正确获取视口高度。

### 3.3 Context 面板重构 — 知识文件浏览集成（ChatToolbar/index.vue）

将知识文件浏览功能集成到 Context 弹出面板中，使用双 Tab 布局：

```
Context 弹出面板 (width: 520px)
├── Tab Bar
│   ├── [Context (N)] — 当前上下文文件列表
│   └── [Browse]      — 知识文件浏览器
├── Context Tab 内容
│   ├── 上下文文件列表（预览/编辑/删除）
│   └── 拖拽放置区
└── Browse Tab 内容
    ├── 搜索过滤输入框
    └── 知识文件目录树
        ├── 文件夹（可折叠）
        └── 文件（点击 → 添加到 Context）
```

**核心实现**：
- `contextPopoverTab` ref 切换 Context/Browse 双 Tab
- `onContextPopoverShow` — 弹出时自动切换到 Browse（无上下文时）或 Context Tab
- `knowledgeTree` computed — 从 `knowledgeTreeStore.filteredCategories` 构建目录树，支持搜索过滤
- `onKnowledgeFileClick` — 点击知识文件直接添加到 Context（调用 `addContextFiles`）
- `knowledgeExpandedFolders` — 管理文件夹展开/折叠状态
- 弹出时自动调用 `knowledgeStore.loadAll()` 加载知识库（缓存优化）

### 3.4 拖拽添加上下文（ChatToolbar/index.vue + ConversationSidebar.vue）

在 Context Tab 中保留拖拽放置区，支持从 Browse Tab 或外部拖拽文件添加为上下文：

**ChatToolbar/index.vue（放置目标）**：
- `onContextDragOver/Enter/Leave/Drop` 拖拽事件处理器，接收 `application/x-knowledge-file` MIME 类型
- 文件列表下方显示拖拽放置区（虚线边框 + hover 高亮）
- `onContextDrop` 中解析拖拽数据，通过 `store.addContextFile + applyContextChange` 添加文件
- 自动跳过已存在于上下文中的文件

**ConversationSidebar.vue（拖拽源）**：
- 知识文件树节点添加 `draggable="true"` 和 `@dragstart` 事件
- `onFileDragStart` 中将文件元数据序列化为 JSON

### 3.5 布局简化 — 移除知识文件侧边栏（aiChat/index.vue）

移除 `aiChat/index.vue` 中的 `ConversationSidebar` 组件及相关布局：
- 删除 `aside ai-chat__side` 侧边栏区域
- 删除 `ai-chat__resizer` 拖拽分割条
- 删除 `useResizable` 和 `knowledgeSidebarVisible` 相关逻辑
- 聊天区域 (`AiChatBox`) 占满全宽

### 3.6 移除独立知识文件选择按钮（ChatToolbar/index.vue）

移除工具栏中独立的 `CollectionTag` 按钮（原 "Start chat from knowledge file" 弹出选择器），其功能已被 Context 面板的 Browse Tab 替代。

## 四、影响范围

| 文件 | 修改类型 |
|------|---------|
| `src/components/AiChatBox/AiChatBox.vue` | 模板结构调整（fill 模式添加 `ai-chat-box__chat` 包装） |
| `src/layouts/components/Main/index.scss` | CSS 增强（`.main-view` 添加 flex 容器属性） |
| `src/views/aiChat/index.vue` | 大幅简化（移除 ConversationSidebar、resizer、knowledgeSidebarVisible 逻辑） |
| `src/views/aiChat/components/ChatToolbar/index.vue` | 重构 Context popover（双 Tab 布局 + 知识浏览 + 拖拽区）；移除知识文件选择器按钮 |
| `src/views/aiChat/components/ConversationSidebar.vue` | 新增 dragstart 拖拽源（保留组件供其他页面使用） |

## 五、验证方法

1. 访问 `/aiChat` 页面，确认聊天区域占满全宽，无知识文件侧边栏
2. 点击 Context 按钮，确认弹出面板有 Context / Browse 双 Tab
3. 在 Browse Tab 中搜索并点击知识文件，确认文件成功添加到 Context
4. 切换到 Context Tab，确认文件列表显示刚添加的文件
5. 从 Browse Tab 拖拽文件到 Context Tab 的放置区，确认文件添加成功
6. 移除上下文文件后发送消息，确认 AI 不再引用该文件内容
7. 在空上下文中打开面板，确认默认显示 Browse Tab 引导用户添加文件