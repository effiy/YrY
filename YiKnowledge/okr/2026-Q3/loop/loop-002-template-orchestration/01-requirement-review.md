---
type: loop-record
loopId: loop-002
stage: requirement-review
title: 定义流程记录模板复用规范与三要素编排需求
role: curator
goalId: cur-001
status: done
created: 2026-08-17
updated: 2026-08-17
tags: [loop-record, requirement-review, template-reuse, orchestration]
---

# 01 需求评审 — loop-002

> 需求编号：loop-002 · 评审人：Curator · 状态：已通过

## PRD（产品需求文档）

### 背景 / 动机

loop-001 跑通了首条「AI 从需求到上线」自闭环，建立了 8 类流程记录模板和 loop/ 目录规范。但 loop-001 暴露了两个问题：

1. **模板复用靠人工**：每次新闭环需手动复制模板、改 frontmatter、填正文，没有自动化辅助。
2. **三要素编排映射分散**：7 角色的 skill/agent/mcp 映射散落在 `okrOrchestration.ts` 和 `OkrRecommendPanel.vue` 中，没有统一的编排清单。

**目标**：基于 loop-001 经验，规范化模板复用流程，沉淀三要素编排清单，补齐类型安全基线，为 loop-003 及后续闭环提供可复现的编排能力。

### 目标（Goal）

1. 模板复用规范化：INDEX 更新为 8 阶段，frontmatter 规范补充 `loopId`/`stage`/`goalId` 必填字段。
2. 三要素编排清单落盘：7 角色 skill/agent/mcp 映射沉淀为可读回的知识库文件。
3. 类型安全基线：清零 23 个 vue-tsc 既有错误，维护 0 错误基线。

### 范围（In Scope）

- 更新 `loop/INDEX.md` 目录结构与 frontmatter 规范（补充 3 个新阶段：code-review/deployment/retrospective）。
- 创建 `loop/_templates/` 03/06/08 三类新模板。
- 沉淀 7 角色三要素编排清单到 KB。
- 清零 23 个 vue-tsc 类型错误（knowledgeBase 17 + rag 4 + proTable 1 + menuMange 1）。

### 非目标（Out of Scope）

- 不引入自动化模板生成工具（留待 loop-003）。
- 不改变 OKR 数据接口（`okrData.ts` 接口不变）。
- 不新增 AI 推荐字段（`OkrRecommend` 字段集不变）。

### 干系人（Stakeholders）

| 角色 | 诉求 | 产出 |
|---|---|---|
| curator | 模板可复用、规范可执行 | 本文档 + INDEX 更新 + 新模板 |
| aier | 编排可复现 | 三要素编排清单 + 技术评审 |
| engineer | 类型安全基线 | 清零 23 错误 + 代码审查 |

## 验收标准（Acceptance Criteria）

| # | 验收判据 | 判定方式 | 状态 |
|---|---|---|---|
| AC1 | loop/INDEX.md 更新为 8 阶段含 frontmatter 规范 | 读 INDEX.md | ✅ |
| AC2 | 3 个新模板（03/06/08）就位 | 读 `loop/_templates/` | ✅ |
| AC3 | 7 角色三要素编排清单落盘可读回 | 读 KB 文件 | ✅ |
| AC4 | 23 个 vue-tsc 错误清零，0 新增 | `pnpm type:check` | ✅ |
| AC5 | 门禁通过后可构建 | `pnpm build:dev` | ✅ |

## WSJF 优先级

| 任务 | 价值 | 紧迫 | 难度 | WSJF | 优先级 |
|---|---|---|---|---|---|
| 清零 23 个 vue-tsc 错误 | 高(3) | 高(3) | 中(2) | 4.5 | P0 |
| INDEX + 模板更新 | 高(3) | 中(2) | 低(1) | 6.0 | P0 |
| 三要素编排清单 | 中(2) | 中(2) | 低(1) | 4.0 | P1 |
| 编排可复现性验证 | 中(2) | 低(1) | 低(1) | 2.0 | P2 |

## 决策记录

- 模板复用保持手动复制流程，不引入自动化工具（范围控制，loop-003 再评估）。
- frontmatter 新增 `loopId`/`stage`/`goalId` 三个必填字段，向后兼容 loop-001 已有记录。