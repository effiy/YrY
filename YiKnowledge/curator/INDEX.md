---
title: "知识管理者角色索引"
tags: [index, curator, governance, diagrams, templates, archive]
category: curator
created: 2026-08-06
updated: 2026-09-10
last_verified: 2026-09-10
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [curator]
benefit: "知识管理者在一个索引中找到治理、图表、模板和归档四类资源"
acceptance_criteria:
  - "4 个子目录各有 README 文件"
related:
  - ./README.md
  - ../INDEX.md
---

# 知识管理者 — 角色索引

> **流水线层级**：Knowledge Governance（横切关注）——维护知识库结构。Curator 是**元角色**——维护知识库结构，不创建领域内容。本索引提供 curator 目录下所有资源的导航入口。

## 子目录

| 领域 | 内容 | 核心用途 |
|---|---|---|
| [governance/](./governance/) | 知识生命周期、收件箱/分类队列、就绪检查清单 | 维护知识库健康运营 |
| [diagrams/](./diagrams/) | 知识地图、用户旅程、目录蓝图、看板索引 | 可视化知识库结构与流向 |
| [archive/](./archive/) | 废弃文件索引与归档流程 | 追溯已移除内容的历史 |
| [templates/](./templates/) | 知识叶子、ADR、PRD、技术设计、会议记录等模板 | 统一文档结构规范 |

## 快速导航

### 如果你是 Curator 新人，按此顺序阅读

1. [README.md](./README.md) — 理解 curator 角色的范围与边界
2. [governance/02-治理-治理规范.md](./governance/02-治理-治理规范.md) — 理解 4 角色、3 节奏模型
3. [governance/04-治理-就绪检查清单.md](./governance/04-治理-就绪检查清单.md) — 任何知识文件发布前的 10 题门禁
4. [governance/03-治理-收件箱.md](./governance/03-治理-收件箱.md) — 处理新进入的知识内容

### 如果你要创建新文件

1. 选择模板：[templates/00-INDEX.md](./templates/00-INDEX.md)
2. 复制使用：[templates/02-模板-知识叶子模板.md](./templates/02-模板-知识叶子模板.md)（通用）或专用模板
3. 发布前执行：[governance/04-治理-就绪检查清单.md](./governance/04-治理-就绪检查清单.md)

### 如果你要执行审查

1. 每周审查：[governance/03-治理-收件箱.md](./governance/03-治理-收件箱.md) + [governance/07-治理-分类处理.md](./governance/07-治理-分类处理.md)
2. 每月审查：[governance/01-治理-知识健康看板.md](./governance/01-治理-知识健康看板.md)
3. 每季度审查：[governance/02-治理-治理规范.md](./governance/02-治理-治理规范.md) + [governance/06-治理-隐性知识待办.md](./governance/06-治理-隐性知识待办.md)

## 跨角色引用

- [../README.md](../README.md) — 知识库概览与设计原则
- [../INDEX.md](../INDEX.md) — 全库索引
- [./COLLABORATION.md](./COLLABORATION.md) — 协作领域索引