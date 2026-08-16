---
type: okr-action
id: flow-t-008
title: 上线记录可视化（pipeline launch records）
role: engineer
listType: sprint
goal: exec-005
owner: Engineering Lead
deadline: '2026-08-18'
status: In Progress
priority: P1
progress: 40
skill: vue
agent: Engineer Agent
mcp: github
subtaskCount: 3
---

# 上线记录可视化（pipeline launch records）

把上线 artifact / 版本 / 环境 / 关联目标渲染到 pipeline 页，让「执行 → 上线」链路可视化、可追溯。

## 可执行任务分解（3 项）

### 1. 定义上线记录结构

- 做法：定义 launch record 字段：artifact / version / env / status / goalId。
- 完成标准：字段完整且可扩展。

### 2. 渲染 pipeline 页

- 做法：artifact / 版本 / 环境 / 状态渲染到 pipeline 页。
- 完成标准：pipeline 页可见上线记录，排序正确。

### 3. 关联目标

- 做法：上线记录关联 goalId 并支持跳回目标。
- 完成标准：可跳回对应 OKR 目标。

| Field | Value |
|---|---|
| Role | ⚡ Engineer |
| Goal | exec-005 |
| Owner | Engineering Lead |
| Deadline | 2026-08-18 |
| Priority | P1 |
| Status | In Progress |
| Progress | 40% |
| Skill | vue |
| Agent | Engineer Agent |
| MCP | github |