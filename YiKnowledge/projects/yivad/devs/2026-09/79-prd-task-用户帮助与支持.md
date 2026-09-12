---
doc_type: module
prd_task_id: "YV-09-205"
title: "YV-09-205: 用户帮助与支持 — FAQ、文档链接、视频教程、支持工单、工单跟踪、反馈提交、社区论坛 — 开发任务"
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
source_prd: "79-prd-用户帮助与支持.md"
---

# YV-09-205: 用户帮助与支持 — FAQ、文档链接、视频教程、支持工单、工单跟踪、反馈提交、社区论坛 — 开发任务

> 来源 PRD：[79-prd-用户帮助与支持.md](../prds/2026-09/79-prd-用户帮助与支持.md)
> 需求编号：YV-09-205 · 优先级：P2 · 人天：0.3d

## 五、实施步骤

| 步骤 | 操作 | 路径 | 验证 | 人天 |
|------|------|------|------|------|
| 1 | 实现帮助服务层 | `help-service.ts` | FAQ/文档/工单/反馈 API | 0.04 |
| 2 | 实现帮助中心首页 | `HelpCenter.vue` | 搜索 + 快速入口 + 热门FAQ + 工单概览 | 0.05 |
| 3 | 实现 FAQ 分类折叠页面 | `FaqPage.vue` + `FaqAccordion.vue` | 分类筛选 + 折叠展开 + 有帮助评分 | 0.04 |
| 4 | 实现文档页面 | `DocumentationPage.vue` | 分类列表 + Markdown 渲染 | 0.04 |
| 5 | 实现视频教程页面 | `VideoTutorialsPage.vue` | 外部视频嵌入 + 分类 | 0.03 |
| 6 | 实现工单创建 + 列表 + 详情 | `TicketCreate.vue` + `TicketList.vue` + `TicketDetail.vue` | 创建表单 + 列表 + 评论 | 0.04 |
| 7 | 实现反馈表单 | `FeedbackForm.vue` | 结构化字段 + 截图上传 | 0.04 |
| 8 | 添加路由配置 | `routes.ts` | 帮助中心路由完整配置 | 0.02 |

**总人天：0.3d**

---
