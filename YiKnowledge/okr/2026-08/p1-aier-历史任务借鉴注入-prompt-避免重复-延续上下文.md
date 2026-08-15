---
type: okr-action
id: flow-t-003
title: 历史任务借鉴注入 prompt（避免重复、延续上下文）
role: aier
listType: sprint
goal: aier-002
owner: AI Engineer
deadline: '2026-08-13'
status: Done
priority: P1
progress: 100
skill: skill-creator
agent: AI Engineer Agent
mcp: yiai
subtaskCount: 3
---

# 历史任务借鉴注入 prompt（避免重复、延续上下文）

为避免重复造轮子并延续上下文，生成 / 重生成任务编排时，把其它清单里已编排的历史任务（标题 + skill/agent/mcp）注入 prompt，让模型借鉴已有决策；上限 15 条防止 prompt 膨胀。

## 可执行任务分解（3 项）

### 1. 采集历史已编排任务

- 做法：扫描各清单，提取带 skill / agent / mcp 的历史任务。
- 完成标准：得到去重后的历史任务集合（标题 + 三要素）。

### 2. 注入 prompt 并截断

- 做法：生成 / 重生成时喂入 ≤15 条历史任务上下文。
- 完成标准：prompt 含借鉴段且不超长，无重复条目。

### 3. 回归验证

- 做法：对比注入前后生成结果，确认新任务不再重复已有决策。
- 完成标准：重复项数量下降，新任务三要素与历史一致时不再重新决策。

| Field | Value |
|---|---|
| Role | 🤖 AI Engineer |
| Goal | aier-002 |
| Owner | AI Engineer |
| Deadline | 2026-08-13 |
| Priority | P1 |
| Status | Done |
| Progress | 100% |
| Skill | skill-creator |
| Agent | AI Engineer Agent |
| MCP | yiai |