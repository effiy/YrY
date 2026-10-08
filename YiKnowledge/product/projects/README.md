---
title: 项目专属 PM 文档
tags: [leaf, pm, projects, yiai, yivad, yipet, yipot, yiknowledge]
category: product/projects
created: 2026-08-06
updated: 2026-10-07
last_verified: 2026-10-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [product]
benefit: "产品经理可在统一入口找到 5 个项目的管理文档、指标与度量、Q4 OKR，了解迭代节奏、交付物状态和跨项目依赖关系"
acceptance_criteria:
  - "YiAi / YiVad / YiPet / YiPot / YiKnowledge 均有 01-管理 + 02-指标与度量两类文档"
  - "与工程文档、OKR、Runbook 的交叉引用完整"
related:
  - ../INDEX.md
  - ../../INDEX.md
  - ../../engineer/projects/
  - ../../projects/
---

# 项目专属 PM 文档

> **作为**产品经理，**我想要**找到 5 个项目的 PM 管理文档、指标文档和 OKR，**以便**在各自的业务上下文中管理每个项目的需求、迭代、度量和交付。

## 项目概览

| 项目 | 管理文档（01） | 指标与度量（02） | 2026 Q4 OKR | 项目定位 | 当前阶段 |
|---|---|---|---|---|---|
| YiAi | [yiai/0001-项目-管理.md](./yiai/001-项目-管理.md) | [yiai/0002-项目-指标与度量.md](./yiai/002-项目-指标与度量.md) | [projects/yiai Q4](../../projects/yiai/okrs/2026-Q4/README.md) | 后端 AI 服务平台 — RPC 信封路由、Ollama LLM 推理、RAG 引擎、数据持久化 | 持续迭代中 |
| YiVad | [yivad/0001-项目-管理.md](./yivad/001-项目-管理.md) | [yivad/0002-项目-指标与度量.md](./yivad/002-项目-指标与度量.md) | [projects/yivad Q4](../../projects/yivad/okrs/2026-Q4/README.md) | Vue 3.5 管理后台 — ProTable 数据管理、aiChat、Agent、知识底座前端、项目页 | 持续迭代中 |
| YiPet | [yipet/0001-项目-管理.md](./yipet/001-项目-管理.md) | [yipet/0002-项目-指标与度量.md](./yipet/002-项目-指标与度量.md) | [projects/yipet Q4](../../projects/yipet/okrs/2026-Q4/README.md) | Chrome MV3 浏览器扩展 — 知识底座对话、跨项目桥接、多角色聊天、工具集 | 持续迭代中 |
| YiPot | [yipot/0001-项目-管理.md](./yipot/001-项目-管理.md) | [yipot/0002-项目-指标与度量.md](./yipot/002-项目-指标与度量.md) | [projects/yipot Q4](../../projects/yipot/okrs/2026-Q4/README.md) | Tauri 1.x 桌面翻译 — 划词/OCR/TTS/托盘/本地 HTTP 60828/21 翻译引擎 | 持续迭代中 |
| YiKnowledge | [yiknowledge/0001-项目-管理.md](./yiknowledge/001-项目-管理.md) | [yiknowledge/0002-项目-指标与度量.md](./yiknowledge/002-项目-指标与度量.md) | [projects/yiknowledge Q4](../../projects/yiknowledge/okrs/2026-Q4/README.md) | 7 角色 × 5 阶段 × 5 项目知识中心 — Frontmatter 规范、模板、治理、图表 | 持续迭代中 |

## 跨项目依赖关系速览

```
YiAi（后端核心）
  ├─ YiVad 消费：聊天、数据 CRUD、文件管理、知识库、RAG、Agent
  ├─ YiPet 消费：聊天、会话管理、数据查询、知识库、RAG
  └─ YiPot 消费：翻译分析数据接入、智能引擎推荐（goal-004）、历史页 YiAi 路由
YiKnowledge
  └─ 索引供给 YiAi RAG & 所有项目文档（7 角色）
YiPot / YiPet / YiVad
  └─ 通过 RPC 信封 统一调用 YiAi
```

**PM 关注点**：YiAi 的任何 API 变更同时影响 YiVad / YiPet / YiPot 三方。涉及 RPC 契约变更的需求需要跨项目协调，并在 PRD 中明确标注影响的消费方。

### 跨项目依赖矩阵

|  | 依赖 YiAi | 依赖 YiVad | 依赖 YiPet | 依赖 YiKnowledge | 依赖 YiPot |
|---|---|---|---|---|---|
| **YiAi** | — | 不依赖 | 不依赖 | RAG 知识来源 | 翻译分析数据反哺 |
| **YiVad** | 聊天/数据/RAG/Agent/文件/RPC | — | 不依赖 | 文档导航 | 项目页数据展示 |
| **YiPet** | 聊天/会话/数据/RAG | Session Key 桥接 | — | 文档导航 | 不依赖 |
| **YiPot** | 翻译分析/引擎推荐/RAG 上下文 | 不依赖 | 不依赖 | 知识库检索 | — |
| **YiKnowledge** | 索引+RAG | 展示 | 展示 | — | 展示 |

**关键路径**：YiKnowledge → YiAi RAG 索引 → (YiVad ‖ YiPet ‖ YiPot)。三方前端可并行，但都依赖 YiAi API 先就绪。

### 涉及两个以上项目的变更协调规则

1. YiAi API 变更 → 同时通知 YiVad / YiPet / YiPot PM，不少于 1 个 Sprint 的迁移窗口
2. YiPet ↔ YiVad 桥接变更 → 两方 PM 对齐 session key 格式和跳转参数，变更前文档化
3. 跨项目 Bug → 先定位根因项目，再分配修复；不明确的先由消费方 PM 牵头排查
4. 详细协调方法见 [delivery/0005-交付-跨项目协作.md](../delivery/005-交付-跨项目协作.md)
5. 稳定性 / Runbook 问题 → 统一参考 [sre/run](../../sre/run/) 中的项目级 Runbook（YiAi 03 / YiPot 04 / YiVad 05）

## 文档使用指南

### 新手 PM 入职（第一天）
1. 阅读本 README + 5 个项目的管理文档（01），了解迭代节奏和交付物状态
2. 打开 5 份「指标与度量」（02）文档，理解北极星指标 / AARRR / SLO 三个核心表
3. 跳到 [Q4 OKR](#项目概览)，了解每个项目在本季度的 4 Goal × 3 KR
4. 遇到线上故障排障：参考 [sre/INDEX](../../sre/INDEX.md) 中的常用入口 + 三份项目级 Runbook

### 版本规划时
1. 查看 5 个项目的指标「当前值 vs Q4 目标」，识别最弱的 2-3 个 KR
2. 涉及 YiAi API 变更时，确认 YiVad / YiPet / YiPot 的适配时间纳入联合 Sprint 规划
3. 技术选型/架构决策：参考 [leader/decisions](../../leader/decisions/) — 本轮新增 YiPot 06-10、YiKnowledge 06-10 共 10 份 ADR
4. 风险与威胁模型：参考 5 份 STRIDE 威胁模型（projects/*/bugs/*/STRIDE-*.md）

### 每周同步时
1. 更新各项目管理文档中的「当前交付物状态」表
2. 指标仪表盘：对照 02-指标文档，记录任何偏离 SLO 的异常
3. 记录新产生的关键决策（新 ADR 放 leader/decisions）

### PM 季度管理检查清单（Q4 版）

每个季度，5 个项目的 PM + SRE 共同检查：

- [ ] 5 份「02-指标与度量」的「当前值」列更新到本月
- [ ] 跨项目依赖矩阵是否有变化？—— 新增/移除的依赖在本 README 反映
- [ ] Q4 4 Goal × 3 KR 的达成率 ≥ 60%？ — 如果未达成，识别根因并记录复盘
- [ ] 有没有项目在「等」另一个项目超过 1 个 Sprint？—— 等待是否必要？
- [ ] SLO 达成率 ≥ 99%（P0/P1）？—— 消耗的错误预算是否进入下季度改进列表？
- [ ] 5 份 STRIDE 威胁模型的 30/60/90 天缓解表 30 天已完成 ≥ 80%？
- [ ] 下季度的联合 Sprint 规划中是否已讨论跨项目依赖？—— 参考 [delivery/0005-交付-跨项目协作.md](../delivery/005-交付-跨项目协作.md)

### 新 PM 上手路径

第一次接触 YrY 的 PM，按以下顺序在 2 小时内建立全局视角：

1. **读本 README**（15 分钟）—— 理解 5 项目拓扑 + 依赖矩阵 + Q4 OKR 入口
2. **读 5 个项目的 0001-项目-管理.md**（40 分钟）—— 定位/愿景/用户/负责人/节奏/交付物
3. **读 5 个项目的 0002-项目-指标与度量.md**（40 分钟）—— 北极星/AARRR/SLO/22 行指标字典
4. **读 [delivery/0005-交付-跨项目协作.md](../delivery/005-交付-跨项目协作.md)**（15 分钟）—— 三类协作模式 + RPC 依赖管理
5. **读 [INDEX.md](../INDEX.md)**（10 分钟）—— PM 角色全貌
6. **各项目技术负责人聊 10 分钟 × 5**（50 分钟）—— 确认文档状态和阻塞项

## 交叉引用

- [../../engineer/projects/](../../engineer/projects/) — 各项目的工程文档镜像 + 5 天新人入职路线图
- [../../engineer/projects/](../../engineer/projects/) — 01-YiAi 到 06-YiKnowledge 的工程视角项目介绍
- [../delivery/0001-交付-运作Sprint.md](../delivery/001-交付-运作Sprint.md) — Sprint 管理和交付流程
- [../discovery/0001-发现-编写PRD.md](../discovery/001-发现-编写PRD.md) — 用户研究和 PRD 模板
- [../../leader/decisions/](../../leader/decisions/) — 架构决策记录（本轮新增 ADR 10 份）
- [../../sre/INDEX](../../sre/INDEX.md) — SRE 运维 + 项目级 Runbook + Gameday 演练
- [../../curator/COLLABORATION.md](../../curator/COLLABORATION.md) — 协作总索引（入职/Mentor/会议/排期/跨项目/治理/项目管理七入口）