---
type: okr-action
id: flow-t-002
title: 为每个推荐任务落地编排三要素 skill / agent / mcp
role: aier
listType: sprint
goal: exec-002
owner: AI Engineer
deadline: '2026-08-13'
status: Done
priority: P0
progress: 100
skill: skill-creator
agent: AI Engineer Agent
mcp: yiai
subtaskCount: 3
---

# 为每个推荐任务落地编排三要素 skill / agent / mcp

编排是把「目标」转成「可执行任务」的关键一步：为每个推荐任务显式指派 skill（能力）、agent（执行者）、mcp（外部工具/数据源）三要素，形成确定性角色×清单映射作为 AI 精调的兜底，保证编排结果可复现、可落盘、可读回。

## 可执行任务分解（3 项）

### 1. 建立角色×清单确定性映射

- 做法：按 7 角色定义推荐任务到 skill / agent / mcp 的默认映射表。
- 完成标准：每个角色的典型任务都有缺省三要素，映射表可查。

### 2. 编排结果随任务落盘

- 做法：把三要素写入任务 frontmatter（skill / agent / mcp 字段）。
- 完成标准：重新扫描可读回三要素，无字段丢失。

### 3. AI 精调兜底

- 做法：对缺省映射覆盖不到的任务，用 AI 补全三要素并回写。
- 完成标准：冷门任务也能得到合理的三要素，无空值。

| Field | Value |
|---|---|
| Role | 🤖 AI Engineer |
| Goal | exec-002 |
| Owner | AI Engineer |
| Deadline | 2026-08-13 |
| Priority | P0 |
| Status | Done |
| Progress | 100% |
| Skill | skill-creator |
| Agent | AI Engineer Agent |
| MCP | yiai |