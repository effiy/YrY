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
| 代码 | 加强代码审查，关注此类问题模式 |
| 测试 | 增加自动化测试覆盖对应场景 |
| 流程 | 将此类问题纳入检查清单 |

## 经验教训

- 此类问题属于常见开发疏忽，可通过静态分析和自动化检查提前发现
- 建议将典型问题模式记录到团队知识库，避免重复踩坑
- 代码审查应重点关注此类边界情况

