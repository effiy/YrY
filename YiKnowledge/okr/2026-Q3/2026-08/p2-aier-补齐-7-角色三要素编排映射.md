---
type: okr-action
id: flow-t-009
title: 补齐 7 角色三要素编排映射
role: aier
listType: weekly
goal: aier-001
owner: AI Engineer
deadline: '2026-08-16'
status: Done
priority: P2
progress: 100
reason: '确认 7 角色 skill/agent/mcp 三要素确定性映射覆盖，AI 推荐按 WSJF 可复现，编排结果落盘可读回。'
skill: skill-creator
agent: AI Engineer Agent
mcp: yiai
subtaskCount: 3
---

# 补齐 7 角色三要素编排映射

确认 7 角色 skill/agent/mcp 三要素确定性映射覆盖，AI 推荐按 WSJF 可复现，编排结果落盘可读回。

## 可执行任务分解（3 项）

### 1. 核对 7 角色三要素映射

- 做法：ROLE_SKILL / ENGINEERING_ROLES 映射覆盖 7 角色。
- 完成标准：每角色有缺省 skill/agent/mcp。

### 2. 校验 AI 推荐可复现

- 做法：WSJF 评分 + 三要素解析走通，离线兜底可用。
- 完成标准：推荐结果可复现、可落盘。

### 3. 校验编排落盘可读回

- 做法：taskToMeta / taskFromMeta 往返一致。
- 完成标准：三要素不丢失。

| Field | Value |
|---|---|
| Role | 🤖 AI Engineer |
| Goal | aier-001 |
| Owner | AI Engineer |
| Deadline | 2026-08-16 |
| Priority | P2 |
| Status | Done |
| Progress | 100% |
| Skill | skill-creator |
| Agent | AI Engineer Agent |
| MCP | yiai |