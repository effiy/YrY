---
doc_type: module
prd_task_id: "YV-09-129"
title: "YV-09-129: 功能实现-外部集成日志 — 按集成维度的请求/响应日志、错误追踪、速率限制监控、集成使用分析、Webhook 投递日志 — 开发任务"
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
source_prd: "59-prd-外部集成日志.md"
---

# YV-09-129: 功能实现-外部集成日志 — 按集成维度的请求/响应日志、错误追踪、速率限制监控、集成使用分析、Webhook 投递日志 — 开发任务

> 来源 PRD：[59-prd-外部集成日志.md](../prds/2026-09/59-prd-外部集成日志.md)
> 需求编号：YV-09-129 · 优先级：P2 · 人天：0.3d

## 五、实施步骤

| 步骤 | 内容 | 涉及文件 | 验证方式 | 人天 |
|------|------|---------|---------|------|
| 1 | 类型定义 + API 服务 | `types/integrationLog.ts`, `services/integrationLogService.ts` | 类型检查通过 | 0.03 |
| 2 | useIntegrationLog 状态管理 | `composables/useIntegrationLog.ts` | 查询+筛选+分页+轮询 | 0.04 |
| 3 | LogFilter + LogList | `LogFilter.vue`, `LogList.vue` | 筛选功能+列表渲染 | 0.05 |
| 4 | LogDetail 详情面板 | `LogDetail.vue` | 请求/响应双栏+脱敏切换 | 0.05 |
| 5 | IntegrationStats 仪表盘 | `IntegrationStats.vue` | 统计图表+速率监控 | 0.05 |
| 6 | WebhookDeliveryLog 投递日志 | `WebhookDeliveryLog.vue` | 投递列表+状态+重试 | 0.03 |
| 7 | IntegrationLogs 主页面 | `IntegrationLogs.vue` | 完整布局 | 0.03 |
| 8 | 路由 + 菜单配置 | `routes.ts` | 页面可访问 | 0.01 |
| 9 | 轮询+性能优化 | 复用已有组件 | 30秒轮询正确 | 0.01 |

**总计：0.3d**

---
