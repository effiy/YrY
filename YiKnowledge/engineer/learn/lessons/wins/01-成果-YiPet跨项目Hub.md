---
title: "Win: YiPet Cross-Project Hub — One Extension, Every Project"
tags: [win, yipet, cross-project, bridge, integration]
category: engineer/learn/lessons/wins
created: 2026-08-21
updated: 2026-09-10
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "Engineers understand the architectural pattern of making a browser extension the cross-project integration hub"
acceptance_criteria:
  - "What was built and why it succeeded"
  - "Key architectural decisions that enabled success"
  - "Replicable pattern for future cross-project integration"
related:
  - ./README.md
  - ../../../../YiPet/CLAUDE.md
  - ../../../../YiVad/CLAUDE.md
  - ../../../../YiAi/CLAUDE.md
---

# 成功案例：YiPet 跨项目集成中心 —— 一个扩展，连接所有项目

> **2026-08-05 Sprint。** YiPet 在一个 Sprint 内成为了 YrY 的跨项目集成中心——Bug 报告、YiVad 桥接、知识库绑定、会话管理——全部通过一个浮动在任意页面上的聊天窗口完成。

## 构建了什么

在一个 Sprint 周期内，YiPet 增加了以下跨项目功能：

### 1. Bug 报告系统
- **触发**：在任意页面上发现 Bug，从 YiPet 聊天窗口直接提交
- **数据流**：元数据（标题、严重程度、项目、模块）→ MongoDB `bugs` 集合；正文（详细描述、复现步骤）→ `YiKnowledge/lessons/failures/bugs/<key>.md`
- **价值**：从"发现 Bug"到"记录 Bug"的路径从切换应用 + 手动填表缩短为 30 秒内的即时操作

### 2. 近期 Bug 浏览与讨论
- **侧边栏标签**：聊天窗口侧边栏新增 "Bugs" 标签，列出最近 30 条 Bug
- **深度链接**：点击 Bug → 在 YiVad 中打开 Bug 详情页
- **上下文讨论**："Discuss" 按钮 → 在聊天中种子化 RAG 上下文（加载 Bug markdown 正文），AI 可以基于 Bug 描述进行代码分析

### 3. YiVad aiChat 桥接
- **工具栏按钮**：一键将当前页面上下文种子化到 YiVad 会话，`window.open` 打开 YiVad 的 aiChat 页面
- **逐条消息桥接**：每条 AI 宠物回复都有 "Open in YiVad" 按钮，种入对应消息内容

### 4. 跨项目导航下拉菜单
- 工具栏下拉菜单提供快速链接到 YiAi、YiVad 管理后台、aiChat、代码审查、Story Board

### 5. 页面感知的会话过滤
- 聊天侧边栏可按当前页面（hostname + pathname）过滤会话，便于找到与特定项目相关的历史对话

### 6. 页面感知的上下文芯片
- 自动识别 YiVad 详情页（Bug/Story），在聊天输入框上方显示一键式上下文提示按钮

### 7. 知识库绑定
- RAG 限定范围聊天：可按文件或文件夹级别限定检索范围
- 知识树浏览器：在侧边栏浏览 YiKnowledge 目录结构
- 文件预览：预览知识文件内容
- 保存到知识库：从聊天内容直接创建知识文件

### 8. 会话增强功能
- 导出为 Markdown、从消息分支、摘要会话、自动生成标题

## 为什么成功——四个关键架构决策

### 1. YiPet 作为浏览器扩展的独特视角优势

YiPet 位于用户浏览的每一页之上。它可以：
- 读取当前页面的 URL（知道用户在哪个项目的哪个页面）
- 读取页面内容（获取上下文）
- 注入 UI（浮动宠物、聊天窗口、工具提示）
- 不受同源策略限制（Chrome 扩展权限）

**这是天然的多项目集成中心优势**：没有任何其他 YrY 组件（YiVad SPA 或 YiAi 后端）拥有这种"站在每一页之上"的视角。

### 2. 四层 API 架构的扩展性

Sprint 启动时，API 层的四层架构（client → endpoints → types → services）已经就位。新增 `BugService`、`KnowledgeService`、`RagService` 只需遵循相同模式即可。架构吸收了新能力而无需重构。

```
已有: ApiClient → Endpoints → Types → AuthService, ChatService, SessionService, ...
新增: ApiClient → Endpoints → Types → BugService, KnowledgeService, RagService
```

### 3. YiAi 统一后端的 RPC 复用

每个跨项目功能（Bug 报告、会话种子化、知识库访问）都通过同一个 YiAi 后端。RPC 信封意味着新功能不需要新端点——它们复用现有的 `data_service`、`knowledge_service`、`rag_service`：

```
Bug 报告       → data_service.create_document("bugs", ...) + knowledge_service.write(...)
会话种子化     → session_service.create(...)
知识库检索     → rag_service.query(...)
```

### 4. 会话驱动的状态管理模式

聊天控制器的 `useSyncExternalStore` 模式使添加新状态（侧边栏视图、RAG 范围、知识树）对现有功能无侵入：

```typescript
// 每种新功能都遵循相同的模式：
// 1. 在 ChatState 中添加字段
// 2. 在 Controller 中添加操作
// 3. 在组件中使用新状态
```

## 可复用的架构模式——"浏览器扩展作为集成中心"

这个模式适用于任何需要集成多个 Web 应用的浏览器扩展：

### 模式四要素

1. **扩展作为观察者**：它可以观察用户访问的每一页——URL、内容、上下文
2. **桥接而非围栏**：每个集成都是单向链接——检测上下文 → 创建会话 → 在目标应用中打开
3. **后端作为集成层**：所有跨项目数据通过统一后端（YiAi）流动，而非应用间直接通信
4. **功能 = 状态 + 操作**：控制器模式使功能添加是**加性的**（增加状态和操作）而非**变性的**（修改架构）

### 何时使用这个模式

| 条件 | 是否为必要 |
|---|---|
| 有多个 Web 应用需要跨项目集成 | 是 |
| 用户需要在不同应用间传递上下文 | 是 |
| 你可以提供一个浏览器扩展 | 是 |
| 有一个统一的后端 API | 是 |

## 量化度量

- **0 次架构变更**：所有新功能都是加性的（纯增量代码）
- **约 15 个新控制器操作**：每个功能向已有控制器添加 1-3 个操作
- **4 个新侧边栏标签**：Knowledge、Stories、Bugs 与已有的 Sessions 并列
- **3 个新 API 服务**：`BugService`、`KnowledgeService`、`RagService` 遵循已有的四层模式
- **1 个 Sprint 完成**：从 0 到完整跨项目集成中心

## 关键启示

1. **架构吸收能力决定交付速度**：已经就位的 API 层和状态管理模式使新功能的添加成本极低
2. **位置决定价值**：浏览器扩展的"观察每一页"能力是一个独特的架构资产
3. **复用是复利**：RPC 信封让新功能无需新端点——这是前期架构投资带来的持续回报