---
title: "ADR: YiVad Vitest Introduction and Rollout"
tags: [adr, yivad, vitest, testing, quality]
category: leader/decisions/yivad
created: 2026-08-21
updated: 2026-09-10
source: internal
type: decision
status: accepted
lifecycle: planned
review_cycle: quarterly
roles: [leader, engineer]
benefit: "理解 YiVad 的 Vitest 测试策略——分阶段实施计划，从最高投资回报率的 composable 测试到全面的 agent 模式端到端测试"
related:
  - ../../../engineer/learn/projects/yivad/README.md
  - ../../yiai/pytest-introduction.md
---

# ADR: YiVad Vitest 引入与分阶段实施

> **状态**：已接受 — 已规划，尚未实施
>
> 此 ADR 定义了 YiVad 的测试策略。当前 YiVad 测试覆盖率为零——这是项目中最大的技术债务项之一。

## 上下文

YiVad 当前测试覆盖率为零。最常修改的代码路径——ProTable 数据获取管线 (`requestApi => callService => RequestHttp => YiAi`)，在任何变更下都无回归保障。

**具体风险场景**：
- `filter`/`query` 和 `target_file`/`path` 参数名称不匹配的 bug 已实际发生——基础契约测试本可在开发阶段捕获这些问题
- Agent 模式（2026-08-08）引入了复杂的多轮协议——确认门、引导、追问、按会话恢复——这些状态转换完全未经自动化验证
- Composable 函数（`useTable`、`useSelection`、`useAuthButtons`）是逻辑密集层——修改它们时无任何安全保障

## 决策

**为 YiVad 引入 Vitest，采用分阶段实施策略：**

### 阶段 1：Composable 测试（最高投资回报率）
- `useTable` — 表格配置、分页逻辑、搜索状态
- `useSelection` — 行选择状态
- `useAuthButtons` — 权限解析逻辑
- `useAgent` — Agent 会话状态管理

**为什么从这里开始**：Composable 是逻辑密度最高的代码层，且易于测试（纯逻辑，不需要 DOM）。对 composable 的测试覆盖将以最小的测试代码量获得最大的行为保障。

### 阶段 2：集成测试
- 验证 `callService.query_documents` 发送 `filter`（而非 `query`）
- 验证 `fileService.readFile/writeFile` 发送 `target_file`（而非 `path`）
- 验证 RequestHttp 拦截器正确构造 RPC 信封 `{module_name, method_name, parameters}`

**为什么这一步很重要**：RPC 参数名称不匹配是 YrY 跨项目协作中最常见的 bug 模式。集成测试直接在 HTTP 层面验证契约——这比任何代码审查和文档都更可靠。

### 阶段 3：Agent 模式端到端测试
- 纯工具函数测试：`confirmationAnswerFor`（51 个测试）和 `isContinuationMessage`（21 个测试）——已完成
- Store 级集成测试：使用 mock SSE 事件运行 `runStream`
- 完整生命周期测试：create → confirm → steer → followup → max_turns → resume

**为什么这是最后一步**：Agent 模式端到端测试涉及 mock SSE 流、复杂的状态转换和异步时序——这是最复杂的测试层。在 composable 和集成测试建立基础后，再进入这一层。

## 选择理由

- Vitest 是 Vite/Rsbuild 项目的自然选择（原生 ESM、快速、零配置兼容）
- Composable 测试提供最高的覆盖率-投入比
- 契约测试捕获最常见的 bug 模式（参数名称不匹配）
- Agent 模式测试防止最复杂的状态机回归

## 后果

### 正面影响
- YiVad 获得全面的测试覆盖——重构安全性显著提高
- RPC 契约由自动化测试保障——不再依赖人工记忆参数名称
- Agent 模式的质量由测试保障——用户不会遇到状态机卡死或死循环

### 负面影响
- 测试开发和维护需要持续的工程投入
- 阶段 2 和 3 需要 YiAi 在测试环境中可用或可 mock

### 规范
- 所有新 composable 需在创建时同步编写测试
- CI 在每个 PR 上运行 `pnpm test`
- 测试失败阻止合并——与代码逻辑错误同等对待

## 适用场景

- 前端项目从零开始建立测试体系的实施路径参考
- 测试优先级排序——如何确定哪些代码应该先获得测试覆盖

## 反模式

- **在所有层平均分配测试精力。** 不是所有代码的测试价值相等。Composable（逻辑密集、多依赖方）比简单的展示组件更有测试价值。集中精力在最高风险、最高变更频率的代码上
- **为了覆盖率数字而写测试。** 测试"getter 返回了正确的值"是在浪费时间。每个测试都应回答"这个行为是否可能以某种方式出错"