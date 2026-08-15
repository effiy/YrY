---
type: okr-action
id: flow-t-009
title: 清零 22 个 vue-tsc 类型错误，恢复 YiVad 可构建
role: engineer
listType: risk
goal: eng-005
owner: Engineering Lead
deadline: '2026-08-21'
status: At Risk
priority: P0
progress: 15
skill: vue
agent: Engineer Agent
mcp: github
subtaskCount: 5
---

# 清零 22 个 vue-tsc 类型错误，恢复 YiVad 可构建

pnpm build 被 22 个 vue-tsc 类型错误阻断，YiVad 无法构建部署。TypeScript strict 与 vue-tsc --noEmit 是硬基线。错误分布：knowledgeBase dashboard 17 个（TS2339 Refresh/Search 未定义、TS2345 DefaultRow→KnowledgeFileSummary/path）、rag 4 个（history 2 + retrieval 2，TS2345 DefaultRow→HistoryEntry/RagSource）、proTable 1 个（TS2344）。需逐文件修复并验证全量构建通过。

## 可执行任务分解（5 项）

### 1. 修复 knowledgeBase dashboard 17 个错误

- 做法：补上 TS2339 缺失的 Refresh/Search 引用，修正 TS2345 DefaultRow 到 KnowledgeFileSummary/path 的类型。
- 完成标准：vue-tsc 该文件 0 错误。

### 2. 修复 rag/history 2 个 TS2345

- 做法：把 DefaultRow 收窄为 HistoryEntry 类型。
- 完成标准：该文件 0 错误。

### 3. 修复 rag/retrieval 2 个 TS2345

- 做法：把 DefaultRow 收窄为 RagSource 类型。
- 完成标准：该文件 0 错误。

### 4. 修复 proTable/complexProTable 1 个 TS2344

- 做法：修正泛型约束，消除 TS2344。
- 完成标准：该文件 0 错误。

### 5. 全量构建验证

- 做法：运行 vue-tsc --noEmit 与 pnpm build 确认无错误。
- 完成标准：0 类型错误，构建成功，可部署。

| Field | Value |
|---|---|
| Role | ⚡ Engineer |
| Goal | eng-005 |
| Owner | Engineering Lead |
| Deadline | 2026-08-21 |
| Priority | P0 |
| Status | At Risk |
| Progress | 15% |
| Skill | vue |
| Agent | Engineer Agent |
| MCP | github |