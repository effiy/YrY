---
type: okr-action
id: flow-t-005
title: OKR 深链修复：指标卡原地滚动 + 高亮
role: engineer
listType: risk
goal: prod-002
owner: Engineering Lead
deadline: '2026-08-12'
status: Done
priority: P1
progress: 100
skill: vue
agent: Engineer Agent
mcp: github
subtaskCount: 3
---

# OKR 深链修复：指标卡原地滚动 + 高亮

去掉不存在的 /metric/:id 路由，改为指标卡原地 scrollIntoView + 高亮，避免 404 并让指标详情可原地查看。

## 可执行任务分解（3 项）

### 1. 移除死路由

- 做法：删除 /metric/:id 相关路由与跳转逻辑。
- 完成标准：访问旧链不再 404，无残留路由。

### 2. 原地滚动定位

- 做法：scrollIntoView 平滑滚动到目标指标卡。
- 完成标准：点击指标链接平滑定位到目标卡。

### 3. 高亮反馈

- 做法：定位后临时高亮目标卡并自动消退。
- 完成标准：高亮 1600ms 后消失，视觉反馈清晰。

| Field | Value |
|---|---|
| Role | ⚡ Engineer |
| Goal | prod-002 |
| Owner | Engineering Lead |
| Deadline | 2026-08-12 |
| Priority | P1 |
| Status | Done |
| Progress | 100% |
| Skill | vue |
| Agent | Engineer Agent |
| MCP | github |