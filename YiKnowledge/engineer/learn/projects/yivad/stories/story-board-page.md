---
title: Story Board Page
key: 0f01370e-4a59-4db0-bf1c-e9718ac75410
tags:
- story-board
- kanban
- scenario-management
- ai-coding
- vue3
- pinia
- element-plus
- ollama
- gherkin
- bdd
category: engineer/learn/projects/yivad/stories
created: '2025-07-16'
updated: 2026-09-10
source: internal
type: story
status: testing
project: YiVad
story_name: story-board-page
---

# Story Board 页面

看板风格的故事管理面板，用于跟踪功能故事（Feature Stories）、史诗（Epics）和任务（Tasks）在完整的开发生命周期中的流转。支持卡片/列表双视图、多维度筛选（项目/时间/搜索）、Gherkin 风格 Given/When/Then 场景管理，以及通过 Ollama 集成的 AI 驱动 Claude Code Prompt 生成。

## 功能概述

### 生命周期阶段（6 列）

| 阶段 | 含义 | 典型操作 |
|---|---|---|
| Planning | 规划阶段——故事刚创建，正在收集上下文和验收标准 | 创建场景、定义 Given/When/Then 步骤 |
| Design | 设计阶段——技术方案设计、架构评审 | 添加设计文档链接、关联分析文件 |
| Develop | 开发阶段——编码实施中 | 关联代码文件、跟踪开发进度 |
| Testing | 测试阶段——功能测试和验收 | 记录测试结果、关联 Bug |
| Operations | 运营阶段——已上线运行 | 监控运行状态、收集用户反馈 |
| Archived | 归档——已完成或废弃 | 归档到知识库 |

### 双视图模式

| 视图 | 适用场景 | 特性 |
|---|---|---|
| 卡片视图（Card View） | 日常管理、快速浏览 | 卡片按阶段列展示，支持拖拽切换阶段 |
| 列表视图（List View） | 批量操作、数据导出 | 表格展示，支持多选、排序、批量状态变更 |

### 多维度筛选

| 筛选维度 | 用途 |
|---|---|
| 项目（Project） | 按项目过滤所有相关的故事 |
| 时间范围（Time） | 按创建/更新时间过滤 |
| 搜索（Search） | 全文搜索故事标题、描述、场景步骤 |

### 场景管理

每个故事可以包含多个场景（Scenario），使用 Gherkin 格式定义：

```
Scenario: 用户登录成功
  Given 用户在登录页面
  When 用户输入有效的用户名和密码
  And 点击"登录"按钮
  Then 页面跳转到首页
  And 显示用户名
```

场景与 Analysis Files 功能联动：
1. 定义场景 → 2. 生成 AI Prompt → 3. 填充关联 files 数组 → 4. 联动 AICR 代码审查

### AI Prompt 生成

通过 YiAi 的 Agent 服务（Ollama 集成），基于场景定义自动生成 Claude Code Prompt：
- 分析场景的业务逻辑和验收标准
- 识别项目中的相关源文件
- 生成结构化的分析指令（不改源码）

## 技术实现

### 前端技术栈

| 技术 | 用途 |
|---|---|
| Vue 3.5 + Composition API | UI 框架 |
| Pinia | 状态管理（`story.ts` Store） |
| Element Plus 2.14 | UI 组件（`el-card`、`el-table`、`el-dialog` 等） |
| Vue Router 5 | 路由（`/story-board`） |

### 后端通信

通过 YiVad 的 `RequestHttp` 发送 RPC 信封到 YiAi：
- 故事 CRUD：`data_service.query/create/update/delete`
- 场景管理：通过故事文档的嵌套数组字段
- AI Prompt 生成：`agentService.chat`（SSE 流式响应）

### 数据模型

```typescript
interface Story {
  key: string;
  title: string;
  description: string;
  status: 'planning' | 'design' | 'develop' | 'testing' | 'operations' | 'archived';
  project_key: string;
  scenarios: Scenario[];
  files: string[];          // 关联的源文件路径
  tags: string[];
  created_at: string;
  updated_at: string;
}

interface Scenario {
  name: string;
  description: string;
  steps: ScenarioStep[];    // Given/When/Then 步骤
}
```

## 适用场景

| 场景 | 使用方式 |
|---|---|
| 新功能开发管理 | 创建 Story → Planning 阶段定义场景 → 推进到 Develop |
| 技术债跟踪 | 创建技术债类 Story → 标记当前状态 → 追踪到 Archived |
| 跨项目协调 | 按项目筛选 → 多项目故事并排查看 → 识别依赖关系 |
| AI 辅助分析 | 定义场景 → 生成 AI Prompt → 填充文件 → AICR 审查 |