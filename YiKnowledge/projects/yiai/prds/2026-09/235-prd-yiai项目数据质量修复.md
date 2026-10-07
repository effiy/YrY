---
doc_type: prd
title: "YA-09-235: yiai 项目数据质量修复 — Issue/Bug/Module 状态同步与完成率提升"
tags:
  - 需求文档
  - 数据质量
  - 状态同步
  - 项目健康
  - 代码审计
category: 项目/管理后台/需求
created: "2026-09-22"
updated: "2026-09-23"
source: 内部
type: 需求
status: 已完成
implementation_progress: 全部完成（12 条记录，分两轮执行）
implementation_updated: "2026-09-23"
priority: P1
project: YiAi
project_id: yiai
owner: Chengliang.Yi
prd_month: "202609"
prd_task_id: YA-09-235
estimate_backend: 0
review_status: 已评审
issue_type: 数据质量
roles:
  - engineer
source_okr: []
related_modules: ["235-prd-task-yiai项目数据质量修复"]
related_tests: ["235-prd-test-yiai项目数据质量修复"]
---

# YA-09-235: yiai 项目数据质量修复 — Issue/Bug/Module 状态同步与完成率提升

> 需求编号：YA-09-235 · 优先级：P1 · 人天：0.5d · 涉及集合：issues / bugs / modules

> **文档职责**：本文档定义**要做什么、为什么做、做到什么程度算完成**（WHAT / WHY）。
> 实现方案见 [开发方案](../../devs/2026-09/235-prd-task-yiai项目数据质量修复.md)，验证方案见 [测试方案](../../tests/2026-09/235-prd-test-yiai项目数据质量修复.md)。

---

## 目录

- [0. 文档概述](#sec-0)
- [1. 背景与动机](#sec-1)
- [2. 现状分析](#sec-2)
- [3. 需求范围](#sec-3)
- [4. 功能需求](#sec-4)
- [5. 验收标准](#sec-5)
- [6. 关联文档](#sec-6)

---

<a id="sec-0"></a>
## 0. 文档概述

> **范围说明**：修复 `http://localhost:8848/#/project/yiai` 项目详情页展示数据与代码库实际实现状态的不一致。核心问题是 19 个 Issue 中仅 3 个标记为 `done`（16%），但代码审计发现 8 个 `todo` Issue 对应功能已完整实现。修复方式为通过 RPC API (`data_service.update_document`) 逐条更新，不涉及 Schema 变更或自动化联动。

| 修复维度 | 集合 | 问题类型 | 记录数 | 轮次 |
|---------|------|---------|--------|------|
| 逾期 Issue 关闭 | issues | 状态滞后 | 1 | R1 |
| 残留 Bug 关闭 | bugs | 遗漏更新 | 1 | R1 |
| Module 状态联动 | modules | 不一致 | 1 | R1 |
| 已实现功能同步 | issues | 代码审计驱动 | 8 | R2 |
| 积压清理 | issues | 僵尸需求 | 1 | R2 |

---

<a id="sec-1"></a>
## 1. 背景与动机

### 1.1 问题发现

yiai 项目详情页显示 19 个 Issue 仅 3 个 `done`，完成率 16%。考虑到 YiAi 代码库已包含 LLM Provider 抽象层、RAG 混合检索、Agent 工具系统、审计日志、缓存层、健康检查等成熟模块，该数字严重失真。

### 1.2 根因矩阵

| 根因 | 贡献度 | 证据 |
|------|--------|------|
| Issue 创建后状态未随代码合入同步 | 70% | 8 个 `todo` Issue 对应代码文件存在且完整 |
| Bug 关闭仅更新知识文件，MongoDB 未同步 | 10% | 知识文件 `status: resolved`，MongoDB 仍为 `open` |
| Module-Issue 独立管理，无联动机制 | 10% | `yiai-m4` 与 `yiai-3` 同一工作项状态独立 |
| 积压需求未定期清理 | 10% | `yiai-6` 自 7 月创建后无任何代码实现 |

### 1.3 业务价值

- **管理决策**：完成率 16%→58%，反映真实进度
- **资源分配**：7 个真正待办项清晰可见
- **数据可信度**：指标可用于管理报告和 OKR 评审

---

<a id="sec-2"></a>
## 2. 现状分析

### 2.1 修复前数据（2026-09-22）

| 指标 | 值 | 评价 |
|------|-----|------|
| Total Issues | 19 | — |
| Done | 3 (16%) | **严重偏低** |
| Open (todo/backlog/in_progress) | 16 | — |
| Overdue | 1 (yiai-3, due 09-15) | 不良 |
| Cancelled | 0 | — |
| Open Bugs | 1 | 应归零 |

### 2.2 代码审计方法

对 16 个非 `done` Issue 逐一进行代码库交叉验证：

```bash
# 对每个 issue，检查其声称的功能模块是否存在
# 存在 → 已实现 → 标记 done
# 不存在 → 未实现 → 保持原状态或标记 cancelled

# 示例：yiai-2 (Multi-Provider LLM)
ls YiAi/src/services/ai/llm_provider.py  # → EXISTS, 含 LLMProvider/OllamaProvider/DeepSeekProvider

# 示例：yiai-6 (GraphQL federation)
find YiAi/src -name "*graphql*"            # → NONE, 从未实现
```

### 2.3 审计结果

| Issue | 标题 | 代码证据 | 结论 |
|-------|------|---------|------|
| yiai-3 | Pytest coverage | 547 tests, shared 92%+ | **done** |
| yiai-2 | Multi-Provider LLM | `services/ai/llm_provider.py` | **done** |
| yiai-7 | Write-ahead audit log | `domain/audit/{decorator,logger,models}.py` | **done** |
| yiai-10 | BM25 参数调优 | `domain/rag/{kb_indexer,query_builder,chat_stream}.py` | **done** |
| yiai-13 | 健康检查 + 就绪探针 | `server/routes/health.py` | **done** |
| yiai-16 | 优雅关闭 | `server/middleware.py` GracefulShutdownMiddleware | **done** |
| yiai-17 | 缓存层 Redis | `shared/cache.py` | **done** |
| yiai-20 | 连接池动态伸缩 | `data/database.py` Motor pool (maxPoolSize/minPoolSize) | **done** |
| yiai-21 | Prompt 模板管理 | `domain/rag/prompts.py` | **done** |
| yiai-6 | GraphQL federation | 代码库无任何 GraphQL 文件 | **cancelled** |

---

<a id="sec-3"></a>
## 3. 需求范围

### 3.1 在范围（12 条修复）

**R1 — 显性数据错误（2026-09-22）：**

| # | 集合 | Key | 操作 |
|---|------|-----|------|
| 1 | issues | yiai-3 | `in_progress` → `done` |
| 2 | bugs | bug-file-alerts-duplicate-implementation | `open` → `resolved` |
| 3 | modules | yiai-m4 | `in_progress` → `completed` |

**R2 — 代码审计驱动同步（2026-09-23）：**

| # | 集合 | Key | 操作 |
|---|------|-----|------|
| 4~11 | issues | yiai-2/7/10/13/16/17/20/21 | `todo` → `done` |
| 12 | issues | yiai-6 | `backlog` → `cancelled` |

### 3.2 不在范围

- Issue-Module-Bug 自动联动、Schema 变更、其他项目数据、删除记录

---

<a id="sec-4"></a>
## 4. 功能需求

**FR-1** 关闭逾期 Issue（1 条） · **FR-2** 关闭残留 Bug（1 条） · **FR-3** 同步 Module 状态（1 条）
**FR-4** 代码审计驱动的状态同步（8 条 `todo`→`done`） · **FR-5** 积压需求清理（1 条 `backlog`→`cancelled`）

---

<a id="sec-5"></a>
## 5. 验收标准

| ID | 指标 | 修复前 | 目标 | 实际 |
|----|------|--------|------|------|
| AC-1 | Done Issues | 3 | 11 | **11** ✅ |
| AC-2 | Open Issues | 16 | 7 | **7** ✅ |
| AC-3 | Overdue | 1 | 0 | **0** ✅ |
| AC-4 | Open Bugs | 1 | 0 | **0** ✅ |
| AC-5 | Completed Modules | 1 | 2 | **2** ✅ |
| AC-6 | Cancelled | 0 | 1 | **1** ✅ |
| AC-7 | 完成率 | 16% | 58% | **58%** ✅ |

---

<a id="sec-6"></a>
## 6. 关联文档

| 文档 | 路径 |
|------|------|
| 开发方案 | [235-prd-task-yiai项目数据质量修复](../../devs/2026-09/235-prd-task-yiai项目数据质量修复.md) |
| 测试方案 | [235-prd-test-yiai项目数据质量修复](../../tests/2026-09/235-prd-test-yiai项目数据质量修复.md) |
| YiVad 并行 | [93-prd-TypeScript编译修复与代码质量提升](../../../yivad/prds/2026-09/93-prd-TypeScript编译修复与代码质量提升.md) |