---
type: okr-action
id: flow-t-001
title: 打通 home / okr / rss / knowledge 菜单跳转关联
role: engineer
listType: sprint
goal: exec-005
owner: Engineering Lead
deadline: '2026-08-14'
status: Done
priority: P0
progress: 100
skill: vue
agent: Engineer Agent
mcp: github
subtaskCount: 3
---

# 打通 home / okr / rss / knowledge 菜单跳转关联

跨页导航闭环是 YiVad 信息架构的骨架：让用户从 Home 直达 OKR / RSS / Knowledge，各子菜单之间互跳无死链，为「需求 → 编排 → 执行 → 上线」流程提供统一入口与可回跳的深链。

## 可执行任务分解（3 项）

### 1. 梳理路由与菜单映射

- 做法：遍历 authMenuList 与 router 配置，核对 home / okr / rss / knowledge 及子菜单的 path→component 对应关系，标出缺失与错配。
- 完成标准：产出一份 route→component 对照清单，无 unknown route、无重复 path。

### 2. 修复菜单跳转关联

- 做法：统一所有 nav 按钮与 quick-nav 卡片的跳转目标为已注册路由，补齐缺失路由项。
- 完成标准：点击任意导航均无 404，breadcrumb 可回跳上级。

### 3. 深链与回退验证

- 做法：用 ?goal= 等深链参数验证从聚合页回跳角色 OKR。
- 完成标准：深链可定位并高亮目标，返回路径正确。

| Field | Value |
|---|---|
| Role | ⚡ Engineer |
| Goal | exec-005 |
| Owner | Engineering Lead |
| Deadline | 2026-08-14 |
| Priority | P0 |
| Status | Done |
| Progress | 100% |
| Skill | vue |
| Agent | Engineer Agent |
| MCP | github |