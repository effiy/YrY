---
doc_type: module
prd_task_id: "YV-09-198"
title: "YV-09-198: 用户个人资料页 — 头像/姓名/角色/团队/简介、活动摘要、贡献图、技能标签、联系方式、资料编辑 — 开发任务"
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
source_prd: "72-prd-用户个人资料页.md"
---

# YV-09-198: 用户个人资料页 — 头像/姓名/角色/团队/简介、活动摘要、贡献图、技能标签、联系方式、资料编辑 — 开发任务

> 来源 PRD：[72-prd-用户个人资料页.md](../prds/2026-09/72-prd-用户个人资料页.md)
> 需求编号：YV-09-198 · 优先级：P2 · 人天：0.3d

## 五、实施步骤

| 步骤 | 操作 | 路径 | 验证 | 人天 |
|------|------|------|------|------|
| 1 | 实现个人资料 API 服务 | `profile-service.ts` | 后端 API 调用正常 | 0.04 |
| 2 | 实现个人资料页主框架 | `ProfilePage.vue` | 页面布局 + 路由挂载 | 0.04 |
| 3 | 实现头部信息卡片 | `ProfileHeader.vue` | 头像/姓名/角色/团队/简介展示 | 0.04 |
| 4 | 实现活动摘要组件 | `ActivitySummary.vue` | 活动统计数字展示 | 0.03 |
| 5 | 实现贡献热力图 | `ContributionHeatmap.vue` | GitHub 风格热力图渲染 | 0.04 |
| 6 | 实现技能标签组件 | `SkillTags.vue` | 技能标签展示 + 分类筛选 | 0.03 |
| 7 | 实现联系方式组件 | `ContactInfo.vue` | 联系方式展示 | 0.02 |
| 8 | 实现活动时间线 | `ActivityTimeline.vue` | 活动历史列表 + 分页 | 0.03 |
| 9 | 实现资料编辑弹窗 | `ProfileEditDialog.vue` | 头像上传/裁剪 + 表单提交 | 0.03 |

**总人天：0.3d**

---
