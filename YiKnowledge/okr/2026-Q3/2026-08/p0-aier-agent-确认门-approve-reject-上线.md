---
type: okr-action
id: flow-t-006
title: Agent 确认门（Approve/Reject）上线
role: aier
listType: daily
goal: exec-002
owner: AI Engineer
deadline: '2026-08-11'
status: Done
priority: P0
progress: 100
skill: skill-creator
agent: AI Engineer Agent
mcp: yiai
subtaskCount: 3
---

# Agent 确认门（Approve/Reject）上线

写操作需用户确认（Approve / Reject），120s 超时自动拒绝，保证 agent 不擅自落盘；同时支持在聊天输入框回复「可以 / 不要」等自然语言审批。

## 可执行任务分解（3 项）

### 1. 后端确认门

- 做法：写操作前暂停等待 approve / reject 决策，120s 超时。
- 完成标准：超时自动拒绝，未批准不执行写。

### 2. 前端确认 UI

- 做法：渲染 Approve / Reject 按钮 + 聊天自然语言审批。
- 完成标准：按钮与自然语言均可完成审批，状态及时反馈。

### 3. 拒绝记忆

- 做法：记录被拒调用签名，相同调用不再二次弹窗。
- 完成标准：重复写被自动拦截，不重复询问。

| Field | Value |
|---|---|
| Role | 🤖 AI Engineer |
| Goal | exec-002 |
| Owner | AI Engineer |
| Deadline | 2026-08-11 |
| Priority | P0 |
| Status | Done |
| Progress | 100% |
| Skill | skill-creator |
| Agent | AI Engineer Agent |
| MCP | yiai |