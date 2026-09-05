---
title: PRD 到 Proposal 流程
tags: [yivad, workflow, prd, proposal, openspec]
category: projects/yivad/workflows
created: 2026-09-02
updated: 2026-09-02
source: YiVad
type: workflow
status: active
---

# PRD 到 Proposal 流程

> 从需求到 Proposal 的结构化提炼流程，减少理解偏差，加速代码库碰撞。
>
> 本流程定义如何将产品需求（PRD、Jira、口述）转化为可执行的开发提案（Proposal）。

## 流程

```
需求输入（PRD/Jira/口述）
  │
  ▼  第一层：结构化提取 → 用户确认
提炼后的需求摘要
  │
  ▼  第二层：代码库碰撞（并行子代理）
影响分析 + 现有能力匹配
  │
  ▼  第三层：组装 Proposal
proposal.md
```

## 第一层：需求结构化提取

不管需求来源，先提炼为以下统一格式：

```markdown
## 需求摘要

### 业务背景
[一段话：为什么做这件事，解决了什么问题]

### 核心功能点
1. [功能1]: [简要描述 + 页面类型标注（列表/表单/详情/图表）]
2. [功能2]: [简要描述]
...

### 约束条件
- [约束1: 如"使用 ProTable 组件实现表格"]
- [约束2: 如"按钮权限使用 v-auth 指令"]
- [约束3: 如"支持中英文国际化"]
...

### 待确认项
- [ ] [待确认1: 如"角色权限待产品确认"]
- [ ] [待确认2: 如"接口字段兼容需后端确认"]
...
```

**确认卡点**：提炼完成后暂停，让用户确认/补充后再进入第二层。
**待确认项未全部解决前，不进入 design 阶段。**

## 第二层：代码库碰撞

并行启动子代理搜索四个维度：

| 子代理 | 搜索目标 | 输出到 Proposal 的哪部分 |
|--------|----------|--------------------------|
| 搜现有模块 | 代码中是否已有类似功能/页面（`src/views/`） | 影响范围 |
| 搜 API | 是否已有可复用接口（`src/api/modules/`） | 依赖 + API 变更 |
| 搜 i18n | 已有语言 key 和模块（`src/languages/modules/`） | 依赖模块 |
| 搜 spec | `YiKnowledge/projects/yivad/specs/` 中的已有规范 | 规范引用 |

### 搜索清单

- **页面组件**：`src/views/` 中是否有类似功能页面
- **API 模块**：`src/api/modules/` 中是否有可复用接口
- **Store**：`src/stores/modules/` 中是否有相关状态
- **组件**：`src/components/` 中是否有可复用组件
- **Hooks**：`src/hooks/` 中是否有可复用 Hook
- **国际化**：`src/languages/modules/` 中是否有已有 key
- **规范**：`YiKnowledge/projects/yivad/specs/` 中相关规范

## 第三层：组装 Proposal

将前两层输出组装为标准 Proposal 格式：

```markdown
# Proposal: [需求名称]

## Why
[业务背景：为什么做这件事]

## What Changes
[核心变更列表]

### 页面变更
- [页面路径]: [变更描述]（列表页 | 表单页 | 详情页 | 图表页）

### API 变更
- [API 函数]: [新增/修改/复用]

### 组件变更
- [组件]: [新增/修改/复用]

### Store 变更
- [Store]: [新增/修改/复用]

## Capabilities
[新增或修改的能力]

## Dependencies
[依赖的现有模块、API、组件]

## Impact
[影响范围：哪些文件需要修改]
```

## 使用方式

在 Claude Code 中：

```
你: 从这份需求生成 Proposal [粘贴/描述需求]
我:
  1. 做需求结构化提取，输出给你确认
  2. 你确认后，并行搜索代码库
  3. 组装 proposal.md
  4. 你审阅
```

## YiVad 特定注意事项

### 页面类型与规范映射

| 页面类型 | 遵循规范 | 核心组件 |
|----------|----------|----------|
| 列表页 | `specs/模式/列表页/规范.md` | ProTable |
| 表单页 | `specs/模式/表单页/规范.md` | el-form |
| 详情页 | `specs/模式/表单页/规范.md` | el-form (disabled) |
| 图表页 | `specs/架构/组件模式/规范.md` | ECharts |
| AI 聊天 | `src/stores/modules/aiChat.ts` | AiChatBox |

### 强制约束检查

- 表格页面必须使用 ProTable（不直接使用 el-table）
- 按钮权限必须使用 v-auth 指令
- 所有文本必须使用国际化（Vue-i18n）
- API 调用必须通过 RequestHttp 封装
- 组件使用 `<script setup lang="ts">` 语法

## 与需求状态的关系

- 需求提取完成后，状态设为 `proposed`
- 待确认项全部解决后才推进到 `designing`
- Proposal 完成后进入 `implementing`
- 实现完成并验证后进入 `done`