---
doc_type: module
prd_task_id: "YV-09-82"
title: "YV-09-82: 客户与外部协作门户 — 受限权限客户访问、共享项目视图、反馈收集、安全文件共享、品牌化门户、外部活动日志 — 开发任务"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
estimate_frontend: 0.5
source_prd: "37-prd-客户与外部协作门户.md"
---

# YV-09-82: 客户与外部协作门户 — 受限权限客户访问、共享项目视图、反馈收集、安全文件共享、品牌化门户、外部活动日志 — 开发任务

> 来源 PRD：[37-prd-客户与外部协作门户.md](../prds/2026-09/37-prd-客户与外部协作门户.md)
> 需求编号：YV-09-82 · 优先级：P2 · 人天：0.5d

## 五、实施步骤

| 步骤 | 操作 | 路径 | 验证 | 人天 |
|------|------|------|------|------|
| 1 | 定义类型 + 数据模型 | `src/types/client.ts` | 类型检查通过 | 0.02 |
| 2 | 实现客户认证 | `useClientAuth.ts` | 验证码登录正常 | 0.06 |
| 3 | 实现门户路由守卫 | `portalGuard.ts` | 未登录重定向 | 0.03 |
| 4 | 实现门户布局 + 品牌化 | `PortalLayout.vue` | 品牌化样式生效 | 0.06 |
| 5 | 实现门户视图（概览/Issue/文件/反馈） | `portal/*.vue` | 受限数据正确展示 | 0.15 |
| 6 | 实现客户管理页 | `ClientManage.vue` | CRUD 正常 | 0.08 |
| 7 | 实现门户配置页 | `PortalConfig.vue` | 品牌化 + 模块配置 | 0.05 |
| 8 | 路由 + i18n | 路由注册 + 中英文 | 页面可访问，i18n 正常 | 0.05 |

**总人天：0.5d**

---
