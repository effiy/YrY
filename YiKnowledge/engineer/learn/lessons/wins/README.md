---
title: success case study / Wins
aliases: [wins-leaf-readme, wins-readme]
tags: [leaf, lessons, wins]
category: engineer/lessons
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: quarterly
roles: [engineer, leader]
benefit: "Engineers can understand and apply success case study / wins with clear frameworks, actionable recommendations, and anti-pattern awareness"
acceptance_criteria:
  - "scope of the leaf directory is clearly bounded"
  - "file inventory table is complete with one-liner descriptions"
  - cross-references to related leaves and parent INDEX are present
related:
  - ../INDEX.md
  - ../README.md
  - ../../INDEX.md
  - ../../run/review-lessons.md
---

# 成功案例研究 / Wins

> **作为** engineer，**我希望**理解并应用成功案例研究，**以便**成功结果可以被持续复制。

> 产品发布、技术实施和流程优化的成功案例。包含可复用经验和量化成果。

## 包含范围

- 产品发布成功案例研究（含可复用经验）
- 技术实施成功案例（架构选型、性能优化）
- 流程优化成功案例（效率提升、协作改进）
- 季度高价值积累评选

## 文件类型与命名

- `*-win.md`：单点成功案例研究
- `*-summary.md`：某主题成功案例合集
- 命名使用英文 kebab-case

## 已包含

| 文件 | 内容 | 状态 |
|---|---|---|
| [yivad-aicr-phase-port.md](win-yivad-aicr-phase-port.md) | YiVad aicr 7 阶段移植方法论（STALE — 未落地；参考架构） | reference |
| [yiai-brd-agent-launch.md](win-yiai-brd-agent-launch.md) | YiAi BRD agent 上线（撰写时间 -79%） | active |
| [yipet-stack-migration-win.md](win-yipet-stack-migration.md) | YiPet 技术栈迁移（React 15->18.3 + Bootstrap->AntD + ESLint->Biome；lint -91%） | active |
| [yry-vite-to-rsbuild-migration-win.md](win-yry-vite-to-rsbuild-migration.md) | YrY Vite->Rsbuild 迁移（dev 90s->8s / HMR 12%->0.5%） | active |
| [yiai-rag-hybrid-retrieval-win.md](win-yiai-rag-hybrid-retrieval.md) | YiAi RAG 混合检索（QueryFusionRetriever + LLMRerank + 行内引用 + scope） | active |
| [yivad-leaf-view-leaves-ssot-win.md](win-yivad-leaf-view-leaves-ssot.md) | YiVad 叶子视图层 28 叶子 SSOT 方法论（STALE — 未落地；参考架构） | reference |
| [yiai-supply-chain-hardening-win.md](win-yiai-supply-chain-hardening.md) | YiAi 供应链加固方法论（STALE — 未落地；参考架构） | reference |
| [yivad-vitest-phase-one-win.md](win-yivad-vitest-phase-one.md) | YiVad Vitest Phase 1 方法论（STALE — 未落地；参考架构） | reference |
| [yiai-llm-phase-two-win.md](win-yiai-llm-phase-two.md) | YiAi LLM Phase 2 方法论（STALE — 未落地；参考架构） | reference |
| [yivad-vitest-phase-two-win.md](win-yivad-vitest-phase-two.md) | YiVad Vitest Phase 2 方法论（STALE — 未落地；参考架构） | reference |
| [yiai-llm-phase-three-win.md](win-yiai-llm-phase-three.md) | YiAi LLM Phase 3 方法论（STALE — 未落地；参考架构） | reference |
| [yiai-llm-phase-four-win.md](win-yiai-llm-phase-four.md) | YiAi LLM Phase 4 方法论（STALE — 未落地；参考架构） | reference |
| [yivad-vitest-phase-three-win.md](win-yivad-vitest-phase-three.md) | YiVad Vitest Phase 3 方法论（STALE — 未落地；参考架构） | reference |
| [yiai-llm-phase-five-win.md](win-yiai-llm-phase-five.md) | YiAi LLM Phase 5 方法论（STALE — 未落地；参考架构） | reference |
| [yivad-vitest-phase-four-win.md](win-yivad-vitest-phase-four.md) | YiVad Vitest Phase 4 方法论（STALE — 未落地；参考架构） | reference |
| [yipet-aicr-phase-one-win.md](win-yipet-aicr-phase-one.md) | YiPet aicr Phase 1 方法论（STALE — 未落地；参考架构） | reference |
| [yiai-knowledge-watcher-win.md](win-yiai-knowledge-watcher.md) | YiAi Knowledge Watcher 实现（apscheduler 30s 轮询 + SHA-256 增量哈希 + 30s 防抖 + 3 次失败指数退避 + 死信队列 + 周日 02:00 全量重建兜底 + 绕过 macOS FSEvents；0 事故；延迟 < 60s） | active |
| [yivad-shared-client-vendor-win.md](win-yivad-shared-client-vendor.md) | YiVad 共享客户端 vendor 方法论（STALE — 未落地；参考架构） | reference |
| [yipet-aicr-phase-two-win.md](win-yipet-aicr-phase-two.md) | YiPet aicr Phase 2 方法论（STALE — 未落地；参考架构） | reference |
| [yipet-aicr-phase-three-win.md](win-yipet-aicr-phase-three.md) | YiPet aicr Phase 3 方法论（STALE — 未落地；参考架构） | reference |
| [yipet-aicr-phase-four-win.md](win-yipet-aicr-phase-four.md) | YiPet aicr Phase 4 方法论（STALE — 未落地；参考架构） | reference |
| [yipet-aicr-phase-five-win.md](win-yipet-aicr-phase-five.md) | YiPet aicr Phase 5 方法论（STALE — 未落地；参考架构） | reference |
| [yiai-pytest-phase-one-win.md](win-yiai-pytest-phase-one.md) | YiAi pytest Phase 1 方法论（STALE — 未落地；参考架构） | reference |
| [yiai-pytest-phase-two-win.md](win-yiai-pytest-phase-two.md) | YiAi pytest Phase 2 方法论（STALE — 未落地；参考架构） | reference |
| [yiai-pytest-phase-three-win.md](win-yiai-pytest-phase-three.md) | YiAi pytest Phase 3 方法论（STALE — 未落地；参考架构） | reference |
| [yiai-pytest-phase-four-win.md](win-yiai-pytest-phase-four.md) | YiAi pytest Phase 4 方法论（STALE — 未落地；参考架构） | reference |

## 待包含

- AI 上线案例研究
- 性能优化成功案例研究
- 流程改进成功案例研究

## 推荐写作结构

1. 背景（业务场景、目标）
2. 方案（技术栈、架构、流程）
3. 关键成功因素
4. 量化成果
5. 可复用经验
6. 后续演进

## 相关叶子

- [../failures/](.) — 失败案例对比
- [../gotchas/](.) — 踩坑记录对比
- [../../../producter/delivery/retrospective-meeting.md](../../producter/delivery/retrospective-meeting.md) — 复盘会议
- [../../../curator/templates/retrospective.md](../../producter/delivery/retrospective.md) — 复盘模板
- [../../processes/review-lessons.md](../process/review-lessons.md) — 场景入口