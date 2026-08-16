---
type: okr-action
id: flow-t-006
title: 写 processRecord.vue 流程记录整合页 + 路由 + 菜单
role: engineer
listType: sprint
goal: exec-001
owner: Engineering Lead
deadline: '2026-08-16'
status: Done
priority: P1
progress: 100
reason: '新增「流程记录」页：通过 knowledgeService.scanKnowledge 读取 loop/ 目录，按闭环列出 4+1 类记录，深链到 KB 文件（复用 KnowledgePreviewDialog）。注册路由与菜单。'
skill: vue
agent: Engineer Agent
mcp: github
subtaskCount: 3
---

# 写 processRecord.vue 流程记录整合页 + 路由 + 菜单

新增「流程记录」页：通过 knowledgeService.scanKnowledge 读取 loop/ 目录，按闭环列出 4+1 类记录，深链到 KB 文件（复用 KnowledgePreviewDialog）。注册路由与菜单。

## 可执行任务分解（3 项）

### 1. 写 processRecord.vue

- 做法：扫描 loop/ 目录，聚合每条闭环的 01~05 记录，卡片渲染 + 状态标签。
- 完成标准：页面可列出全部闭环记录。

### 2. 注册路由

- 做法：staticRouter.ts 加 /executiver/process 路由。
- 完成标准：路由可达，无 404。

### 3. 加菜单项

- 做法：authMenuList.json 加菜单入口，activeMenu 指向 /executiver。
- 完成标准：侧边栏可见「流程记录」入口。

| Field | Value |
|---|---|
| Role | ⚡ Engineer |
| Goal | exec-001 |
| Owner | Engineering Lead |
| Deadline | 2026-08-16 |
| Priority | P1 |
| Status | Done |
| Progress | 100% |
| Skill | vue |
| Agent | Engineer Agent |
| MCP | github |