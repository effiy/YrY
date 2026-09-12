---
doc_type: module
prd_task_id: "YV-09-130"
title: "YV-09-130: 用户会话管理 — 活跃会话查看、强制下线、会话超时配置、并发会话限制 — 开发任务"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
estimate_frontend: 0.3
source_prd: "60-prd-用户会话管理.md"
---

# YV-09-130: 用户会话管理 — 活跃会话查看、强制下线、会话超时配置、并发会话限制 — 开发任务

> 来源 PRD：[60-prd-用户会话管理.md](../prds/2026-09/60-prd-用户会话管理.md)
> 需求编号：YV-09-130 · 优先级：P2 · 人天：0.3d

## 五、实施步骤

| 步骤 | 操作 | 路径 | 验证 | 人天 |
|------|------|------|------|------|
| 1 | 实现 YiAi SessionService（创建/列表/撤销） | `YiAi/services/auth/session_service.py` | 创建会话、列出会话、撤销会话正常 | 0.05 |
| 2 | 实现 Token 黑名单验证中间件 | `YiAi/middleware/auth.py` | 被撤销 Token 请求返回 401 | 0.03 |
| 3 | 实现会话心跳 + 清理任务 | `YiAi/services/auth/session_service.py` | 心跳更新 last_active，过期会话被清理 | 0.03 |
| 4 | 实现 YiVad 会话管理页面 | `YiVad/src/views/system/session-management.vue` | 列表展示、强制下线、批量操作 | 0.08 |
| 5 | 实现会话配置组件 | `YiVad/src/views/system/components/session-config.vue` | 超时、并发策略配置保存生效 | 0.04 |
| 6 | 实现心跳 Composable + 我的会话页面 | `YiVad/src/composables/useSessionHeartbeat.ts` + `my-sessions.vue` | 心跳正常发送，用户可看自己的会话 | 0.04 |
| 7 | 路由注册 + 集成测试 | `YiVad/src/router/` + 测试文件 | 路由可访问，功能端到端验证 | 0.03 |

**总人天：0.3d**

---
