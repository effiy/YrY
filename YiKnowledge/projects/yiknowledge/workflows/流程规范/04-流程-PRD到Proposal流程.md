---
title: PRD 到 Proposal 流程
tags: [yiknowledge, workflow, prd, proposal, openspec]
category: projects/yiknowledge/workflows
created: 2026-09-07
updated: 2026-09-10
source: YiKnowledge
type: workflow
status: active
---

# PRD 到 Proposal 流程

> 从需求到 Proposal 的结构化提炼流程，减少理解偏差，加速知识库碰撞。
>
> 本流程定义如何将知识库需求（新增领域、角色调整、结构优化等）转化为可执行的开发提案（Proposal）。

## 流程

```
需求输入（PRD/Jira/口述）
  │
  ▼  第一层：结构化提取 → 用户确认
提炼后的需求摘要
  │
  ▼  第二层：知识库碰撞（并行子代理）
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
1. [功能1]: [简要描述 + 内容类型标注（架构/模式/指南/工作流/规范）]
2. [功能2]: [简要描述]
...

### 约束条件
- [约束1: 如"遵循 kebab-case 命名规范"]
- [约束2: 如"目录层级不超过 3 级"]
- [约束3: 如"使用三段式内容结构"]
...

### 待确认项
- [ ] [待确认1: 如"角色归属待 curator 确认"]
- [ ] [待确认2: 如"分类标准是否适用新领域"]
...
```

**确认卡点**：提炼完成后暂停，让用户确认/补充后再进入第二层。
**待确认项未全部解决前，不进入 design 阶段。**

## 第二层：知识库碰撞

并行启动子代理搜索四个维度：

| 子代理 | 搜索目标 | 输出到 Proposal 的哪部分 |
|--------|----------|--------------------------|
| 搜现有内容 | 知识库中是否已有类似内容/领域 | 影响范围 |
| 搜角色目录 | 角色目录结构和已有分类 | 依赖 + 目录变更 |
| 搜 frontmatter | 已有 tags/category/type 分类标准 | 依赖模块 |
| 搜 spec | `YiKnowledge/projects/yiknowledge/specs/` 中的已有规范 | 规范引用 |

### 搜索清单

- **角色目录**：各角色目录下是否有相关领域内容
- **项目目录**：`projects/` 下是否有相关项目知识
- **跨领域索引**：SECURITY.md、COLLABORATION.md、ENGINEERING.md 中是否有相关条目
- **生命周期**：`curator/governance/lifecycle.md` 中的状态定义
- **模板**：`curator/templates/` 中的内容模板
- **规范**：`YiKnowledge/projects/yiknowledge/specs/` 中相关规范

## 第三层：组装 Proposal

将前两层输出组装为标准 Proposal 格式：

```markdown
# Proposal: [需求名称]

## Why
[业务背景：为什么做这件事]

## What Changes
[核心变更列表]

### 内容变更
- [文件路径]: [新增/修改/删除]（架构 | 模式 | 指南 | 工作流）

### 目录变更
- [目录路径]: [新增/调整]

### 角色归属
- [角色]: [新增内容归属]

## Capabilities
[新增或修改的知识领域]

## Dependencies
[依赖的现有内容、分类标准、角色目录]

## Impact
[影响范围：哪些内容需要更新，是否影响 RAG 检索]
```

## 使用方式

在 Claude Code 中：

```
你: 从这份需求生成 Proposal [粘贴/描述需求]
我:
  1. 做需求结构化提取，输出给你确认
  2. 你确认后，并行搜索知识库
  3. 组装 proposal.md
  4. 你审阅
```

## YiKnowledge 特定注意事项

### 内容类型与规范映射

| 内容类型 | 遵循规范 | 核心要求 |
|----------|----------|----------|
| 架构文档 | `specs/file-standards.md` | 10+ 章节、ASCII 图、代码示例 |
| 模式文档 | `specs/knowledge-entry.md` | 三段式结构、反模式表格 |
| 指南文档 | `specs/file-standards.md` | 步骤化、可操作、约束清晰 |
| 工作流文档 | `specs/governance.md` | 流程图、检查清单、卡点 |
| 规范文档 | `specs/knowledge-entry.md` | 强制/禁止规则、验证方法 |

### 强制约束检查

- 所有文件 frontmatter 包含 8 个必需字段
- 文件名使用 kebab-case，禁止下划线和数字
- 目录层级不超过 3 级：`role/problem-domain/file.md`
- 每条知识属于唯一角色目录（物理位置）
- 多角色覆盖使用 `roles:` 字段声明
- 内容结构遵循三段式（Summary → Core viewpoints → Key information）

### 角色边界判断

新增内容时，使用决策树判定角色归属：

```
内容属于哪个角色？
├── 业务策略、市场分析 → executiver/
├── 产品需求、用户故事 → producter/
├── 技术决策、架构选择 → leader/
├── 实现模式、代码质量 → engineer/
├── 发布运维、监控告警 → srer/
├── AI 方法论、RAG/Agent → aier/
└── 知识治理、模板标准 → curator/
```

## 与需求状态的关系

- 需求提取完成后，状态设为 `proposed`
- 待确认项全部解决后才推进到 `designing`
- Proposal 完成后进入 `implementing`
- 实现完成并验证后进入 `done`