---
doc_type: module
prd_task_id: "YV-09-121"
title: "YV-09-121: 系统公告管理 — 定向公告、定时发布、模板管理、可关闭记忆与分析统计 — 开发任务"
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
source_prd: "55-prd-系统公告管理.md"
---

# YV-09-121: 系统公告管理 — 定向公告、定时发布、模板管理、可关闭记忆与分析统计 — 开发任务

> 来源 PRD：[55-prd-系统公告管理.md](../prds/2026-09/55-prd-系统公告管理.md)
> 需求编号：YV-09-121 · 优先级：P2 · 人天：0.3d

## 五、实施步骤

| 步骤 | 内容 | 涉及文件 | 验证方式 | 人天 |
|------|------|---------|---------|------|
| 1 | 类型定义 + API 服务 | `types/announcement.ts`, `services/announcementService.ts` | 类型检查通过 | 0.03 |
| 2 | useAnnouncement composable | `composables/useAnnouncement.ts` | 定向过滤逻辑正确 | 0.04 |
| 3 | GlobalBanner Banner 组件 | `GlobalBanner.vue` | 多条轮播、关闭交互 | 0.04 |
| 4 | TargetRuleEditor 定向规则编辑器 | `TargetRuleEditor.vue` | AND/OR 组合规则正确 | 0.04 |
| 5 | AnnounceForm 创建/编辑表单 | `AnnounceForm.vue` | 表单校验+预览 | 0.05 |
| 6 | TemplateSelector 模板选择器 | `TemplateSelector.vue` | 模板内容正确填充 | 0.02 |
| 7 | AnnounceTable + AnnounceStats | `AnnounceTable.vue`, `AnnounceStats.vue` | 列表+统计数据 | 0.03 |
| 8 | 公告管理主页面 | `Announcements.vue` | 完整 CRUD + 状态管理 | 0.04 |
| 9 | App.vue 集成 + 路由配置 | `App.vue`, `routes.ts` | 公告在全局显示 | 0.01 |

**总计：0.3d**

---
