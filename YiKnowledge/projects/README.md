---
title: 项目知识中心
tags: [projects, navigation, hub, yivad, yiai, yipet, yiknowledge, yipot]
category: projects
created: 2026-08-26
updated: 2026-09-20
last_verified: 2026-09-20
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: monthly
roles: [engineer, leader, product, curator]
benefit: "快速了解 5 个项目的知识产物组织方式和追溯模型，找到项目特定的需求、方案、测试、缺陷和规范"
acceptance_criteria:
  - "5 个项目均列出分类说明和导航入口"
  - "追溯模型清晰：Bug → PRD → Dev → Test → Workflow"
related:
  - ./INDEX.md
  - ../INDEX.md
  - ../README.md
  - ../curator/governance/00001-治理-知识健康看板.md
---

# 项目知识中心

> 5 个项目，1,650+ 知识文件。项目特定的需求、方案、测试、缺陷和规范均存放于此。完整文件清单见 [INDEX.md](./INDEX.md)。

---

## 追溯模型

所有项目采用统一的 **OKR → PRD → Dev → Test** 全链路追溯：

```mermaid
flowchart LR
  OKR["OKR 目标"] -->|"source_okr"| PRD["PRD 需求文档<br/>定义「做什么」"]
  PRD -->|"prd_task_id"| DEV["Dev 开发方案<br/>定义「怎么做」"]
  PRD -->|"source_prd"| BUG["Bug 缺陷报告"]
  DEV -->|"source_modules"| TEST["Test 测试用例<br/>定义「怎么验」"]
```

**规则：**
- 每个 **PRD** 的 `source_okr` 关联到 OKR 目标
- 每个 **Dev** 的 `prd_task_id` 关联到 PRD 需求编号
- 每个 **Bug** 的 `source_prd` 关联到来源 PRD
- 每个 **Test** 的 `source_modules` 关联到 Dev 模块

---

## 项目总览

| 项目 | 定位 | 技术栈 | 知识产物 |
|------|------|--------|---------|
| [YiVad](./yivad/) | Vue 3.5 管理后台 | Vue 3.5 + Rsbuild + Pinia + Element Plus | [OKR](./yivad/okrs/) · [PRD](./yivad/prds/) · [Dev](./yivad/devs/) · [Test](./yivad/tests/) · [Bug](./yivad/bugs/) · [Workflow](./yivad/workflows/) |
| [YiAi](./yiai/) | FastAPI 后端 | FastAPI + MongoDB + Ollama + llama_index | [OKR](./yiai/okrs/) · [PRD](./yiai/prds/) · [Dev](./yiai/devs/) · [Test](./yiai/tests/) · [Bug](./yiai/bugs/) · [Workflow](./yiai/workflows/) |
| [YiPet](./yipet/) | Chrome MV3 扩展 | Vue 3.5 + Chrome MV3 + Rsbuild | [OKR](./yipet/okrs/) · [PRD](./yipet/prds/) · [Dev](./yipet/devs/) · [Test](./yipet/tests/) · [Bug](./yipet/bugs/) · [Workflow](./yipet/workflows/) |
| [YiKnowledge](./yiknowledge/) | 知识库 | Markdown + YAML Frontmatter | [PRD](./yiknowledge/prds/) · [Dev](./yiknowledge/devs/) · [Test](./yiknowledge/tests/) · [Bug](./yiknowledge/bugs/) · [Workflow](./yiknowledge/workflows/) |
| [YiPot](./yipot/) | Tauri 桌面翻译应用 | Tauri 1.x + Rust + React 18/Jotai/NextUI | [OKR](./yipot/okrs/) · [PRD](./yipot/prds/) · [Dev](./yipot/devs/) · [Test](./yipot/tests/) · [Bug](./yipot/bugs/) · [Workflow](./yipot/workflows/) |

### 项目职责

| 项目 | 核心职责 | 关键模块 |
|------|---------|---------|
| **YiVad** | 管理后台 SPA——ProTable 驱动、动态路由、按钮级权限 | 项目管理、Issue 追踪、Bug 看板、AI 聊天、知识库、RAG 检索、全局搜索 |
| **YiAi** | AI 后端——所有前端的唯一数据源，RPC 信封路由、SSE 流式、RAG 引擎、Agent 循环 | 聊天服务、数据服务、知识库、RAG、RSS、Agent、认证、Dashboard |
| **YiPet** | 浏览器扩展——页面注入交互式宠物伴侣，4 层 API 架构，跨项目桥接 YiVad | Content Script、Service Worker、聊天窗口、浮动宠物、Popup |
| **YiKnowledge** | 知识库——7 个角色目录、5 个流水线阶段，YiAi RAG 数据源 | 知识治理、工程实践、技术决策、产品需求、AI 赋能 |
| **YiPot** | 桌面翻译应用——划词/输入/剪切板三模式翻译、OCR识别、TTS朗读、生词本、插件式多翻译服务 | 划词翻译、全局热键、系统托盘、截图识别、翻译服务(20+)、TTS朗读、生词本、备份同步、配置管理 |

---

## 近期动态（2026-09）

| 项目 | 状态 | 重点工作 |
|------|------|---------|
| **YiVad** | 活跃开发 | 项目页面全量重构（God Component → composable + 组件拆分），17 个子页面架构优化 |
| **YiAi** | 活跃迭代 | 性能优化（uvloop/连接池复用/熔断器/优雅排水）、代码健康修复、RAG 增量刷新修复 |
| **YiPet** | 稳定维护 | 安全合规加固、NativeMessaging 探索 |
| **YiKnowledge** | 活跃治理 | 跨项目模板标准化、知识生命周期治理、文件命名规范化、项目知识文件坏味道清理 |
| **YiPot** | 活跃重构/加固 | 品牌全面重命名 (Pot→YiPot)、移除自动更新、删除外部链接、安全加固(unwrap→null-safe)、配置文件 com.yipot.desktop 迁移 |

---

## 每项目知识结构

```
projects/<项目名>/
├── README.md           # 项目知识库索引（快速导航、约束速查、技术栈速查）
├── okrs/               # OKR 目标与关键结果（按季度归档）
│   └── {quarter}/
├── prds/               # 产品需求 PRD（按月归档）
│   └── {month}/
├── devs/               # 开发方案（按月归档）
│   └── {month}/
├── tests/              # 测试用例（按月归档）
│   └── {month}/
├── bugs/               # 缺陷报告（按分类子目录归档）
│   ├── README.md       # 缺陷索引
│   └── {分类}/
└── workflows/          # 开发规范 + 操作指南 + 流程规范 + 架构设计 + 设计模式
```

## 文档模板

| 文档类型 | YiAi 模板 | YiPet 模板 |
|---------|----------|-----------|
| PRD 需求文档 | [模板](./yiai/prds/模板/00-模板-需求文档.md) | [模板](./yipet/prds/模板/00-模板-需求文档.md) |
| Dev 开发方案 | [模板](./yiai/devs/模板/00-模板-开发方案.md) | [模板](./yipet/devs/模板/00-模板-开发方案.md) |
| Test 测试用例 | [模板](./yiai/tests/模板/00-模板-测试规格.md) | [模板](./yipet/tests/模板/00-模板-测试规格.md) |
| Bug 缺陷报告 | [模板](./yiai/bugs/2026-09/模板/00-模板-项目bug模板.md) | [模板](./yipet/bugs/2026-09/模板/00-模板-扩展bug模板.md) |

## 导航入口

| 入口 | 适用场景 |
|------|---------|
| [INDEX.md](./INDEX.md) | 查看所有项目完整文件清单（按项目 × 分类矩阵） |
| [yivad/README.md](./yivad/README.md) | YiVad 知识库：新人入门、日常开发、代码审查、约束速查 |
| [yiai/README.md](./yiai/README.md) | YiAi 知识库：新人入门、日常开发、代码审查、约束速查 |
| [yipet/README.md](./yipet/README.md) | YiPet 知识库：新人入门、日常开发、代码审查、约束速查 |
| [yiknowledge/README.md](./yiknowledge/README.md) | YiKnowledge 项目知识：知识治理、RAG 集成 |
| [yipot/README.md](./yipot/README.md) | YiPot 知识库：新人入门、Tauri + Rust 约束、桌面端常见坑排查 |
| [../INDEX.md](../INDEX.md) | 知识库顶层索引（角色目录 + 流水线阶段） |

## 跨项目关联

- [../../CLAUDE.md](../../CLAUDE.md) — 单体仓库级 CLAUDE.md（RPC 协议、跨项目关系）
- [../../YiAi/CLAUDE.md](../../YiAi/CLAUDE.md) — YiAi 项目约束与近期变更
- [../../YiVad/CLAUDE.md](../../YiVad/CLAUDE.md) — YiVad 项目约束与近期变更
- [../../YiPet/CLAUDE.md](../../YiPet/CLAUDE.md) — YiPet 项目约束与近期变更
- [../../YiPot/CLAUDE.md](../../YiPot/CLAUDE.md) — YiPot 项目约束与近期变更
- [../engineer/learn/projects/](../engineer/learn/projects/) — 工程类项目文档
- [../leader/decisions/](../leader/decisions/) — 架构决策记录