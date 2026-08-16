---
type: okr-action
id: flow-t-007
title: 清零 23 个 vue-tsc 既有类型错误
role: engineer
listType: risk
goal: eng-005
owner: Engineering Lead
deadline: '2026-08-16'
status: Done
priority: P0
progress: 100
skill: vue
agent: Engineer Agent
mcp: github
subtaskCount: 4
---

# 清零 23 个 vue-tsc 既有类型错误

清零 23 个 vue-tsc 类型错误恢复 YiVad 可构建：knowledgeBase dashboard 17（TS2339 Refresh/Search、TS2345 DefaultRow→KnowledgeFileSummary）、rag 4（history/retrieval DefaultRow 收窄）、proTable 1（TS2344 泛型）、menuMange 1（TS2353 TreeOptionProps.value→node-key）。

## 可执行任务分解（4 项）

### 1. 修 knowledgeBase dashboard 17 错误

- 做法：补 TS2339 Refresh/Search 引用，修正 TS2345 DefaultRow 类型。
- 完成标准：该文件 vue-tsc 0 错误。

### 2. 修 rag history/retrieval 4 错误

- 做法：DefaultRow 收窄为 HistoryEntry / RagSource。
- 完成标准：两个文件 0 错误。

### 3. 修 proTable complexProTable 1 错误

- 做法：修正泛型约束 TS2344。
- 完成标准：该文件 0 错误。

### 4. 修 menuMange TreeOptionProps 1 错误

- 做法：el-tree-select props.value 已从 TreeOptionProps 移除，改用 node-key。
- 完成标准：该文件 0 错误。

| Field | Value |
|---|---|
| Role | ⚡ Engineer |
| Goal | eng-005 |
| Owner | Engineering Lead |
| Deadline | 2026-08-16 |
| Priority | P0 |
| Status | Done |
| Progress | 100% |
| Skill | vue |
| Agent | Engineer Agent |
| MCP | github |