---
title: 项目专属 PM 文档
tags: [leaf, pm, projects, yiai, yivad, yipet]
category: producter/projects
created: 2026-08-06
updated: 2026-09-10
last_verified: 2026-09-10
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [producter]
benefit: "产品经理可在统一入口找到 YrY 各项目的管理文档，了解迭代节奏、交付物状态和跨项目依赖关系"
acceptance_criteria:
  - "YiAi、YiVad、YiPet 各项目均有 PM 管理文档"
  - "与工程文档的交叉引用链接"
related:
  - ../INDEX.md
  - ../../INDEX.md
  - ../../engineer/learn/projects/
---

# 项目专属 PM 文档

> **作为**产品经理，**我想要**找到各项目的 PM 管理文档，**以便**在各自的业务上下文中管理每个项目的需求、迭代和交付。

## 项目概览

| 项目 | 文档 | 项目定位 | 当前阶段 |
|---|---|---|---|
| YiAi | [yiai/01-项目-管理.md](./yiai/01-项目-管理.md) | 后端 AI 服务平台 — RPC 信封路由、Ollama LLM 推理、RAG 引擎、数据持久化 | 持续迭代中 |
| YiVad | [yivad/01-项目-管理.md](./yivad/01-项目-管理.md) | Vue 3.5 管理后台 — ProTable 数据管理、aiChat、Agent、知识底座前端 | 持续迭代中 |
| YiPet | [yipet/01-项目-管理.md](./yipet/01-项目-管理.md) | Chrome MV3 浏览器扩展 — 知识底座对话、跨项目桥接、多角色聊天 | 持续迭代中 |

## 跨项目依赖关系速览

```
YiAi（后端核心）
  ├─ YiVad 消费：聊天、数据 CRUD、文件管理、知识库、RAG、Agent
  └─ YiPet 消费：聊天、会话管理、数据查询、知识库、RAG

YiPet ←→ YiVad（跨项目桥接）
  └─ YiPet 通过 session key 桥接到 YiVad 的 aiChat 页面
```

**PM 关注点**：YiAi 的任何 API 变更同时影响 YiVad 和 YiPet。涉及 RPC 契约变更的需求需要跨项目协调——在 PRD 中明确标注影响的消费方。

### 跨项目依赖矩阵

|  | 依赖 YiAi | 依赖 YiVad | 依赖 YiPet |
|---|---|---|---|
| **YiAi** | — | 不依赖 | 不依赖 |
| **YiVad** | 聊天/数据/RAG/Agent/文件 | — | 不依赖 |
| **YiPet** | 聊天/会话/数据/RAG | Session Key 桥接 | — |

**关键路径**：YiAi → (YiVad ‖ YiPet)。YiVad 和 YiPet 可以并行开发（它们之间没有运行时依赖），但都依赖 YiAi 的 API 先就绪。

### 涉及两个以上项目的变更协调规则

1. YiAi API 变更 → 同时通知 YiVad PM 和 YiPet PM，不少于 1 个 Sprint 的迁移窗口
2. YiPet ↔ YiVad 桥接变更 → 两方 PM 对齐 session key 格式和跳转参数，变更前文档化
3. 跨项目 Bug → 先定位根因项目，再分配修复。不明确的先由消费方 PM 牵头排查
4. 详细协调方法见 [delivery/05-交付-跨项目协作.md](../delivery/05-交付-跨项目协作.md)

## 文档使用指南

### 新手 PM 入职（第一天）
1. 阅读三个项目的管理文档，了解各自的迭代节奏和交付物状态
2. 重点关注"当前交付物状态"表格，了解哪些已完成、哪些进行中

### 版本规划时
1. 查看三个项目的"当前交付物状态"，识别跨项目依赖
2. 涉及 YiAi API 变更时，确认 YiVad 和 YiPet 的适配时间纳入计划

### 每周同步时
1. 更新各项目的"当前交付物状态"表格
2. 记录新产生的关键决策

### PM 季度管理检查清单

每个季度，三个项目的 PM 共同检查：

- [ ] 各项目的"当前交付物状态"表格是否更新到了最新状态？
- [ ] 跨项目依赖是否有变化？——新增了哪些依赖、哪些依赖已完成可以移除？
- [ ] 本季度的联合里程碑是否达成？——如果没有，根本原因是什么？
- [ ] 有没有项目在"等"另一个项目超过 1 个 Sprint？——等待是否必要？
- [ ] 各项目的成功指标基准值是否需要更新？——收集了更多数据后，目标是否需要调整？
- [ ] 下季度的跨项目依赖是否已在联合 Sprint 规划中讨论？——参考 [delivery/05-交付-跨项目协作.md](../delivery/05-交付-跨项目协作.md)

### 新 PM 上手路径

第一次接触 YrY 项目的 PM，按以下顺序建立全局视角：

1. **读本文件**（10 分钟）——理解三个项目的关系和依赖拓扑
2. **读三个项目的管理文档**（30 分钟）——了解每个项目的定位、交付状态、Q3 优先事项
3. **读 [delivery/05-交付-跨项目协作.md](../delivery/05-交付-跨项目协作.md)**（15 分钟）——理解跨项目协作的三类模式和 API 依赖管理
4. **读 [INDEX.md](../INDEX.md)**（10 分钟）——了解 PM 知识库的全貌，按需查阅具体方法
5. **和三个项目的技术负责人各聊 15 分钟**——了解当前 Sprint 的实际进展和阻塞项（文档不一定完全反映最新状态）

## 交叉引用

- [../../engineer/learn/projects/](../../engineer/learn/projects/) — 各项目的工程文档镜像
- [../delivery/01-交付-运作Sprint.md](../delivery/01-交付-运作Sprint.md) — Sprint 管理和交付流程
- [../discovery/01-发现-编写PRD.md](../discovery/01-发现-编写PRD.md) — 用户研究和 PRD 模板
- [../../leader/decisions/](../../leader/decisions/) — 架构决策记录（ADR）
- [../okr/2026-Q3/](../okr/2026-Q3/) — 当前季度 OKR 和指标追踪