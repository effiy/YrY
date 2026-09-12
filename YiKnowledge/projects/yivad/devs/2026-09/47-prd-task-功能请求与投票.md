---
doc_type: module
prd_task_id: "YV-09-100"
title: "YV-09-100: 功能请求与投票 — 用户投票、权重体系、功能排名与全生命周期状态追踪 — 开发任务"
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
source_prd: "47-prd-功能请求与投票.md"
---

# YV-09-100: 功能请求与投票 — 用户投票、权重体系、功能排名与全生命周期状态追踪 — 开发任务

> 来源 PRD：[47-prd-功能请求与投票.md](../prds/2026-09/47-prd-功能请求与投票.md)
> 需求编号：YV-09-100 · 优先级：P2 · 人天：0.3d

## 五、实施步骤

| 步骤 | 内容 | 涉及文件 | 验证方式 | 人天 |
|------|------|---------|---------|------|
| 1 | 类型定义 + Feature Service | `types/featureRequest.ts`, `services/featureService.ts` | 类型检查通过 | 0.04 |
| 2 | 投票按钮组件 | `VoteButton.vue` | 投票/撤票交互正常 | 0.03 |
| 3 | 请求卡片组件 | `FRequestCard.vue` | 卡片渲染 + 投票状态 | 0.04 |
| 4 | 请求创建弹窗 | `FRequestCreate.vue` | 表单验证 + 创建成功 | 0.04 |
| 5 | 请求详情抽屉 | `FRequestDetail.vue` | 详情展示 + 状态时间线 | 0.05 |
| 6 | 我的投票面板 | `MyVotes.vue` | 已投票列表 + 剩余票数 | 0.04 |
| 7 | 功能请求主页面 | `FeatureRequest.vue` | 排名列表 + 筛选排序 | 0.05 |
| 8 | 路由 + 菜单配置 | `routes.ts`, 菜单 | 页面可访问 | 0.01 |

**总计：0.3d**

---
