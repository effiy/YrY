---
title: "Tech Debt: YiVad No Test Framework"
tags: [tech-debt, yivad, testing, vitest]
category: leader/architecture
created: 2026-08-21
updated: 2026-09-10
source: internal
type: assessment
status: stable
lifecycle: active
review_cycle: quarterly
roles: [leader]
benefit: "追踪 YiVad 测试框架技术债务及其缓解计划，评估当前风险水平"
related:
  - ../decisions/yivad/vitest-introduction.md
  - ../../../engineer/learn/projects/yivad/README.md
---

# 技术债：YiVad 缺少测试框架

> **状态**：未关闭 — Vitest ADR 已审批，尚未实施
>
> **影响范围**：YiVad 前端所有模块（composables、stores、API 调用链、组件逻辑）

## 影响评估

### 风险分析

- **回归风险**：每次重构均携带未知回归风险。无测试覆盖意味着无法验证重构后的行为等价性
- **历史教训**：`filter`/`query` 和 `target_file`/`path` 参数名称不匹配的 bug 本可通过基础的契约测试在开发阶段捕获，而非等到用户报告
- **受影响最严重的路径**：ProTable 数据获取管线 `requestApi => callService => RequestHttp => YiAi`，这是 YrY 中最频繁修改的代码路径
- **agent 模式的复杂度**：2026-08-08 引入的 agent 模式具备多轮协议（确认门、引导、追问、按会话恢复），状态机复杂度极高且无自动化测试保障

### 影响量化

| 影响维度 | 当前状态 | 严重程度 |
|---|---|---|
| 核心数据流（ProTable → YiAi）| 无测试 | 高 — 数据管线修改易引入回归 |
| 权限逻辑（v-auth）| 无测试 | 中 — 权限错误导致安全或体验问题 |
| RPC 参数契约 | 无测试 | 高 — 曾导致实际 bug |
| agent 状态机 | 无测试（仅纯函数已测试） | 高 — 复杂状态转换无保障 |
| UI 组件渲染 | 无测试 | 低 — 视觉问题易于发现 |

## 缓解计划

| 阶段 | 范围 | 优先级 | 时间线 | 状态 |
|-------|-------|----------|----------|------|
| 1 | Composable 测试（useTable、useSelection、useAuthButtons）| P0 | 下一个迭代 | 未开始 |
| 2 | RPC 契约集成测试 | P0 | 阶段 1 之后 | 未开始 |
| 3 | Agent 模式端到端测试 | P1 | 阶段 2 之后 | 未开始 |

### 阶段 1：Composable 测试（最高投资回报率）

- `useTable` — 表格配置、分页逻辑、搜索状态管理
- `useSelection` — 行选择状态
- `useAuthButtons` — 权限解析逻辑
- `useAgent` — agent 会话管理

**为什么优先**：Composable 是逻辑密度最高的代码层。对 composable 的测试覆盖将以最小的代码量获得最大的行为保障。

### 阶段 2：集成测试

- 验证 `callService.query_documents` 发送 `filter`（而非 `query`）
- 验证 `fileService.readFile/writeFile` 发送 `target_file`（而非 `path`）
- 验证 RequestHttp 拦截器正确封装 RPC 信封

**为什么优先**：RPC 参数名称不匹配是跨项目协作中最常见的 bug 模式。集成测试直接防止这类问题。

### 阶段 3：Agent 模式端到端测试

- 纯函数测试：`confirmationAnswerFor`（51 个测试）和 `isContinuationMessage`（21 个测试）——已完成
- Store 级集成测试：使用 mock SSE 事件测试 `runStream`
- 完整生命周期：create → confirm → steer → followup → max_turns → resume

**为什么优先**：Agent 模式状态机是 YiVad 中最复杂的逻辑，人工测试无法覆盖所有状态转换路径。

## 相关技术债务

| 项目 | 问题 | ADR |
|---------|-------|-----|
| YiAi | 零测试覆盖（部分解决：76 个测试，2026-08-21）| [pytest-introduction](../decisions/yiai/pytest-introduction.md) |
| YiPet | 双世界边界零集成测试 | 尚未处理 |

## 适用场景

- 评估 YiVad 重构的风险水平
- 为新功能开发前的测试策略决策提供依据
- 向管理层说明测试框架投入的必要性

## 审查计划

下次审查日期：2026-09-21