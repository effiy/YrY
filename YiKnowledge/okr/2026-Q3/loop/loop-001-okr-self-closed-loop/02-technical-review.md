---
type: loop-record
loopId: loop-001
stage: technical-review
title: 数据模型与记录载体选型（ADR）+ 页面结构与 KB 目录规范
role: leader
goalId: lead-001
status: done
created: 2026-08-16
updated: 2026-08-16
tags: [okr, self-closed-loop, technical-review, adr]
---

# 02 技术评审 — loop-001

> 需求编号：loop-001 · 评审人：Tech Lead · 状态：已通过

## 架构决策记录（ADR）

### ADR-001 记录载体选型：KB markdown 为事实源 + YiVad 新页整合展示

- **Context（背景）**：用户要求「整个流程记录都应该在知识库里，包括需求评审、技术评审、代码的编写和调试、测试报告等等内容」，同时「需要时可以建立新页面对数据进行记录和整合」。二者是「单一事实源」与「可读性展示」的关系。
- **Decision（决策）**：知识库 markdown（`YiKnowledge/okr/2026-Q3/loop/`）作为**事实源**，承载全部流程记录的完整内容；YiVad 新增「流程记录」页（`processRecord.vue`）通过 `knowledgeService.scanKnowledge` **只读**扫描 `loop/` 目录做整合展示，深链回 KB 文件（复用 `KnowledgePreviewDialog.vue`）。不做 YiVad → KB 的反向写入。
- **Consequences（后果）**：
  - ✅ 单一事实源，RAG 可直接检索 KB markdown，记录可版本化（git）。
  - ✅ YiVad 页只管展示，零数据同步成本。
  - ⚠️ 记录的新增/修改需走 KB 写入（`writeKnowledgeFile`），页面不提供编辑。

### ADR-002 页面结构：按闭环聚合 4+1 类记录卡片

- **Context**：一条闭环产出 5 类记录（需求评审/技术评审/构建调试/测试报告/上线），散在 `loop-001-*/` 目录下。
- **Decision**：`processRecord.vue` 用 `scanKnowledge("loop")` 拿到 `loop/` 目录树，按 `loopId` 聚合为闭环卡片；每条闭环内部按 stage 顺序渲染 5 类记录条目（读 frontmatter `stage` / `title` / `status`），点条目深链到 KB 文件。stage → 图标/标签映射常量内聚。
- **Consequences**：✅ 一览全部闭环 + 单条闭环全链路；⚠️ 依赖 `scanKnowledge` 返回的目录结构稳定。

### ADR-003 KB 目录规范：`loop/loop-XXX-<slug>/` + `_templates/`

- **Context**：循环记录需可复用、可索引、可检索。
- **Decision**：`loop/` 下每次闭环一个目录 `loop-XXX-<slug>/`，内放 01~05 编号记录；`loop/_templates/` 放 5 类模板；`loop/INDEX.md` 做整合索引。记录 frontmatter 固定 `type: loop-record` + `loopId` + `stage` + `title` + `role` + `goalId` + `status` + `created` + `updated`（兼容 KB rulebook 必填字段）。
- **Consequences**：✅ 目录规范可复用、模板可复制；⚠️ stage 取值需与页面映射常量保持一致（5 个枚举值）。

## 数据模型

- **OKR 数据层**（YiVad）：`okrData.ts` 接口（`GoalItem` / `MetricItem` / `DailyRoleData` / `WeeklyRoleData` / `ChecklistItem`）不变，只替换数据；`okrFlowData.ts` 的 `EXAMPLE_TASKS` / `EXAMPLE_LAUNCHES` 派生自新 OKR。
- **流程记录层**（KB）：`loop-record` frontmatter schema 见 ADR-003；`stage` 枚举 `requirement-review | technical-review | build-debug | test-report | launch`。
- **页面读取链路**：`processRecord.vue → knowledgeService.scanKnowledge("loop") → KnowledgeFileEntry[] → 聚合渲染 → KnowledgePreviewDialog 深链`。

## 风险与对策

| 风险 | 影响 | 对策 |
|---|---|---|
| `scanKnowledge` 返回结构变化 | 页面聚合失败 | 前端做空态与回退，聚合逻辑容错 |
| 新页引入新类型错误 | 破坏构建门禁 | 复用既有类型（`KnowledgeFileEntry` / `KnowledgeMeta`），写完即 `pnpm typecheck` |
| KB 目录与页面 stage 枚举漂移 | 记录漏展示 | 枚举常量单一来源，模板 frontmatter 与之一致 |

## 决策可回溯表

| 决策 | 关联需求 | 记录位置 |
|---|---|---|
| ADR-001 载体选型 | loop-001 PRD 决策记录 | 本文档 |
| ADR-002 页面结构 | loop-001 AC4 | 本文档 |
| ADR-003 目录规范 | loop-001 AC3 | 本文档 |
