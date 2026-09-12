---
title: YiPet Engineering — INDEX
tags: [index, yipet, navigation]
category: engineer/learn/projects/yipet
created: 2026-08-24
updated: 2026-09-10
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "Navigate YiPet project documentation"
related:
  - ./README.md
  - ../../INDEX.md
---

# YiPet — 项目索引

> Chrome MV3 浏览器扩展。交互式宠物伴侣、多角色 AI 聊天、双世界执行架构（ISOLATED + MAIN）。

## 核心文档

| 文档 | 用途 | 适合人群 |
|---|---|---|
| [01-架构设计](./01-项目-架构设计.md) | 双世界边界、四层 API、CDN 注入、四入口构建 | 所有开发者 |
| [02-开发规范](./02-项目-开发规范.md) | 命名约定、关键陷阱（双世界/CSP/构建）、RPC 契约、国际化 | 开发者 |
| [03-功能模块](./03-项目-功能模块.md) | Popup/聊天窗口/Content Script/API 服务/共享模块清单 | 开发者 |

## 用户故事

| 故事 | 领域 | 状态 |
|---|---|---|
| [宠物设置](./stories/pet-settings/story.md) | 宠物皮肤、角色、模型配置 | testing |

## 架构决策记录（ADR）

| ADR | 状态 | 说明 |
|---|---|---|
| [Chrome MV3 双世界边界](../../../leader/decisions/yipet/chrome-mv3-dual-world.md) | 已实施 | ISOLATED World + MAIN World 的通信架构 |
| [Biome Lint/Format](../../../leader/decisions/yipet/biome-lint-format.md) | 已实施 | Lint 和格式化工具链选型 |
| [AiCR 移植](../../../leader/decisions/yipet/aicr-port.md) | 已实施 | AI 代码审查功能从 YiWeb 移植至 YiPet |
| [React 18 + Ant Design 迁移](../../../leader/decisions/yipet/react-18-antd-migration.md) | 已实施 | UI 技术栈现代化迁移 |
| [四层 API 层](../../../leader/decisions/yipet/four-tier-api-layer.md) | 已实施 | Client → Endpoints → Types → Services 的分层设计 |
| [跨项目 Hub](../../../leader/decisions/yipet/cross-project-hub.md) | 已实施 | 浏览器扩展作为多项目集成中心 |

## 跨项目链接

- [YiPet CLAUDE.md](../../../../YiPet/CLAUDE.md) — 实时项目档案（模块边界、约束、近期变更）
- [RPC 协议](../../build/cross-project-rpc-protocol.md) — RPC 信封规范、参数名契约、已知 Bug 模式
- [产品管理](../../../producter/projects/yipet/project-management.md) — 迭代节奏、交付物
- [入职指南](../../run/onboarding/02-入职-YiPet入职.md) — 新人第一天快速上手

## 快速导航

### 我是 YiPet 新人开发者

1. 先读 [入职指南](../../run/onboarding/02-入职-YiPet入职.md) 完成环境搭建和扩展加载
2. 再读 [架构设计](./01-项目-架构设计.md) 理解双世界边界的核心概念
3. 然后读 [开发规范](./02-项目-开发规范.md) 了解关键陷阱（`--mode production`、CDN catalog、双世界 API 隔离）
4. 最后查 [功能模块](./03-项目-功能模块.md) 定位你要修改的模块