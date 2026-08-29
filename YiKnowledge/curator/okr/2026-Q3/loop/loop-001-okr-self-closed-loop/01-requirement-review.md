---
type: loop-record
loopId: loop-001
stage: requirement-review
title: 重定义 7 角色 OKR + 建立流程记录体系，跑通首条「AI 从需求到上线」自闭环
role: producter
goalId: prod-001
status: done
created: 2026-08-16
updated: 2026-08-16
tags: [okr, self-closed-loop, requirement-review, prd]
---

# 01 需求评审 — loop-001

> 需求编号：loop-001 · 评审人：PM YiAi · 状态：已通过

## PRD（产品需求文档）

### 背景 / 动机

Yi 家族（YiAi / YiVad / YiPet / YiKnowledge）已有一套 OKR 系统，但当前数据是「Yi 产品矩阵增长 / AI-First / 生态整合」等旧目标，且停留在演示数据层面——任务、周报、上线记录都是手工静态样例，没有真实闭环。

**目标**：重置所有老数据，把 7 个角色的 OKR 全部重定义为同一个北极星——**AI 从需求到上线完成整个流程自闭环**。AI 自己定义各角色 OKR、拆解成任务、亲自执行，并把全过程记录进知识库。

### 目标（Goal）

1. 7 角色 OKR 100% 对齐北极星，接口不变只换数据。
2. 建立「流程记录」基础设施（KB markdown + YiVad 新页），4+1 类记录统一落点。
3. 跑通首条真实闭环（loop-001），覆盖需求评审 → 技术评审 → 编码调试 → 测试 → 上线全链路。

### 范围（In Scope）

- 重写 `okrData.ts` / `okrFlowData.ts`（7 角色 goals/metrics/daily/weekly + 示例任务 + 上线记录）。
- 重建 KB `goals/` `metrics/` 镜像，删除旧数据。
- 新建 `loop/` 目录 + 5 类记录模板 + `INDEX.md`。
- 新建 YiVad「流程记录」页 `processRecord.vue` + 路由 + 菜单。

### 非目标（Out of Scope）

- 不改动 OKR 视图结构（`okr.vue` / `okrRole.vue` 只消费数据）。
- 不改动 AI 推荐机制（`OkrRecommend/*`、`okrRecommend.ts`、`okrOrchestration.ts`）。
- 不在单轮内跑完未来所有闭环，只交付可复用机制 + 一条完整样板。

### 干系人（Stakeholders）

| 角色 | 诉求 | 产出 |
|---|---|---|
| executiver | 北极星确立、审批 | exec-001 / exec-002 |
| producter | 需求可闭环 | 本文档 + PRD 模板 |
| leader | 技术可闭环 | ADR + 技术评审模板 |
| engineer | 编码可闭环 | processRecord.vue + 路由菜单 |
| srer | 测试上线可闭环 | 测试报告 + 上线记录 |
| aier | 编排可靠 | 三要素映射覆盖 |
| curator | 记录知识化 | 模板 + INDEX + 合规校验 |

## 验收标准（Acceptance Criteria）

| # | 验收判据 | 判定方式 | 状态 |
|---|---|---|---|
| AC1 | 7 角色 OKR 全部 trace 到北极星，KR 可验证 | 读 `okrData.ts` + goals markdown | ✅ |
| AC2 | 旧 OKR 数据清零，机制文件无改动 | `git status` + 目录核对 | ✅ |
| AC3 | 4+1 类记录模板 + loop 目录就位 | 读 `loop/_templates` | ✅ |
| AC4 | 「流程记录」页可列出 loop 记录并深链 KB | `pnpm dev` 手动验证 | ✅ |
| AC5 | 改动文件 vue-tsc 0 新增错误 | `pnpm typecheck` | ✅ |
| AC6 | 门禁通过后可构建 | `pnpm build` | ✅ |

## WSJF 优先级（价值 × 紧迫 ÷ 难度）

| 任务 | 价值 | 紧迫 | 难度 | WSJF | 优先级 |
|---|---|---|---|---|---|
| 清除旧数据 + 重定义 OKR | 高(3) | 高(3) | 低(1) | 9.0 | P0 |
| 技术评审 + 目录规范 | 高(3) | 中(2) | 低(1) | 6.0 | P0 |
| 流程记录页 + 路由菜单 | 高(3) | 中(2) | 中(2) | 3.0 | P1 |
| 4 类模板 + loop 目录 | 中(2) | 中(2) | 低(1) | 4.0 | P1 |
| 测试报告 + 上线记录 | 中(2) | 中(2) | 低(1) | 4.0 | P1 |
| 三要素编排映射 | 中(2) | 低(1) | 低(1) | 2.0 | P2 |

## 决策记录

- 记录载体：KB markdown 为事实源 + YiVad 新页整合展示（详见 02-technical-review ADR）。
- 数据 shape：`okrData.ts` 接口不变，只替换内容，视图零结构改动。
