---
doc_type: module
prd_task_id: "YV-09-46"
title: "实时协作光标与状态 — 开发任务"
status: 需求已编写
priority: 中
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
estimate_frontend: 1.0
source_prd: "21-prd-实时协作光标与状态.md"
---

# 实时协作光标与状态 — 开发任务

> 来源 PRD：[21-prd-实时协作光标与状态.md](../prds/2026-09/21-prd-实时协作光标与状态.md)
> 需求编号：YV-09-46 · 优先级：中 · 人天：1.0d

## 五、实施步骤

| 步骤 | 任务 | 产出 | 验证方式 | 人天 |
|------|------|------|----------|------|
| 1 | 创建 WebSocket 服务层 | `wsService.ts` | 连接/断连/重连/心跳逻辑正确 | 0.15 |
| 2 | 创建在线状态 Store | `presence.ts` | 状态管理、隐私级别持久化 | 0.05 |
| 3 | 实现 usePresence Composable | `usePresence.ts` | 连接管理、状态切换、空闲检测 | 0.10 |
| 4 | 实现 useCursorTracking Composable | `useCursorTracking.ts` | 500ms 节流光标位置上报 | 0.05 |
| 5 | 创建 PresenceIndicator 组件 | `PresenceIndicator.vue` | 4 种状态正确渲染 | 0.05 |
| 6 | 创建 RemoteCursor 组件 | `RemoteCursor.vue` | 远程光标位置平滑跟随 | 0.10 |
| 7 | 创建 ActiveUsersList 组件 | `ActiveUsersList.vue` | 用户列表渲染、展开收起 | 0.10 |
| 8 | 创建 CollisionWarning 组件 | `CollisionWarning.vue` | 编辑冲突检测与警告 | 0.10 |
| 9 | 创建 PrivacyToggle 组件 | `PrivacyToggle.vue` | 三级隐私切换 | 0.05 |
| 10 | 集成到详情页 | 各详情页 `index.vue` | 在线状态、远程光标正常工作 | 0.10 |
| 11 | 与 YV-09-45 页面锁定联动 | `usePageLock.ts` | 锁定信息显示锁持有者 | 0.10 |
| 12 | 整体验证 | 双浏览器协作测试 | 状态同步、光标显示、冲突警告 | 0.05 |

**总计：** 1.0d

---
