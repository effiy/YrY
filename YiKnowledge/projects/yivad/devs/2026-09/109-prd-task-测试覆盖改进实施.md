---
title: "YV-09-109-TASK: 测试覆盖改进实施"
tags: [测试, 实施]
category: 项目/管理后台/开发
created: "2026-09-23"
source: 内部
type: task
status: 待开始
priority: P1
project: YiVad
project_id: yivad
owner: Chengliang.Yi
prd_month: "202609"
prd_task_id: YV-09-109-TASK
prd_ref: YV-09-109
estimate: 2.0
review_status: 已评审
roles: [engineer]
lifecycle: active
---

# YV-09-109-TASK: 测试覆盖改进实施

| Step | 文件 | 测试内容 | 预估 |
|------|------|----------|------|
| 1 | `tests/hooks/useTable.test.ts` | 竞态守卫：序列号不匹配时丢弃响应 | 30min |
| 2 | `tests/stores/aiChat.test.ts` | SSE streaming mock + chunk 处理 | 1h |
| 3 | `tests/routers/dynamicRouter.test.ts` | 无菜单→重定向；有菜单→addRoute | 45min |
| 4 | `tests/hooks/useNotificationSSE.test.ts` | localStorage key `"yivad-user"` 验证 | 15min |
| 5 | `tests/components/Grid.test.ts` | KeepAlive 监听器不累积 | 30min |

**验证**: `pnpm test -- --coverage` → Store 30%→60%, Hooks 65%→80%