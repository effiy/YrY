---
title: "项目详情页: Modules Tab 改为展示知识域卡片"
key: modules-tab-knowledge-domains-20260910
tags:
- ui-refinement
- modules
- knowledge-domains
- project-detail
category: projects/yivad/bugs/data
created: "2026-09-10"
updated: 2026-09-10
source: internal
type: improvement
status: resolved
severity: minor
priority: p2
project: YiVad
module: views/module/index.vue
reporter: Claude
environment: Chrome / macOS
affectedVersion: main
fixedVersion: main (post-fix 2026-09-10)
frequency: always
benefit: "缺陷记录：数据-Modules-Tab改为知识域卡片"
lifecycle: active
---

## Description

Modules Tab 原先展示 MongoDB `modules` 集合中的 Epic/Module 文档，与项目详情页的实际内容脱节。改为展示项目的知识域（Knowledge Domains）——读取 `YiKnowledge/projects/{key}/` 下的目录结构作为功能模块。

### 变更内容

**项目详情页（projectKey 存在时）**

| 变更 | 旧 | 新 |
|------|----|----|
| 数据源 | MongoDB `modules` 集合 | `knowledgeFiles`（YiKnowledge 目录结构） |
| 卡片内容 | Epic 名称/状态/进度 | 知识域名/描述/文件数 |
| 卡片点击 | 跳转 `/module/:key` | 预览知识文件列表 |

**知识域定义**（从 `YiKnowledge/projects/{key}/` 子目录派生）

| 目录 | 标签 | 图标 | 颜色 |
|------|------|------|------|
| `architecture/` | Architecture | Setting | #5470c6 |
| `patterns/` | Patterns | Collection | #91cc75 |
| `workflows/` | Workflows | Guide | #e6a23c |
| `guides/` | Guides | Document | #5ab1ef |
| `requirements/` | Requirements | Tickets | #ee6666 |
| `specs/` | Specs | Opportunity | #9b59b6 |

> `bugs/` 和 `requirements/` 目录排除在外（各自有独立 Tab）。

**独立 /module 路由不受影响**——保留完整的 MongoDB 模块管理功能。

### 联动修改

**DetailOverview.vue** — `totalModules` 统计改为知识域目录数（与 Modules Tab 内容一致）

```diff
- totalModules: modules.length,
+ totalModules: domainCount,  // 基于 knowledgeFiles 的目录数
```

## Verification

- [ ] 项目详情页 Modules Tab 显示知识域卡片（architecture、patterns、workflows 等）
- [ ] 卡片显示文件计数，与文档 Tab 文件数匹配
- [ ] 点击单文件域直接打开预览
- [ ] 点击多文件域显示文件列表
- [ ] Overview 侧边栏 Modules 统计数与卡片数一致
- [ ] 独立 `/module` 路由功能不受影响

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 预防措施

| 层面 | 措施 |
|------|------|
| 代码 | 项目详情页嵌入视图的数据源应优先使用 YiKnowledge 目录结构（`knowledgeFiles`），而非 MongoDB 集合 |
| 流程 | 数据源切换时需同步更新所有关联统计（如 Overview 侧边栏的 `totalModules`） |

## 经验教训

- **MongoDB 数据与文件系统数据的语义差异**：`modules` 集合存储的是 Epic/Module 管理实体，而 YiKnowledge 目录结构反映的是实际的知识组织方式。在项目详情页的上下文中，知识域（目录结构）比管理实体（Module 文档）更有意义
- **变更的联动范围**：切换 Modules Tab 数据源时，Overview 侧边栏的 `totalModules` 统计、Domain Overview 面板等关联展示都需同步修改

