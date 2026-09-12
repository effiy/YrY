---
doc_type: module
prd_task_id: "YV-09-229"
title: "YV-09-229: 项目拆分 — 单项目拆分为多项目、Issue 选择、成员分配与配置复制 — 开发任务"
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
source_prd: "83-prd-项目拆分.md"
---

# YV-09-229: 项目拆分 — 单项目拆分为多项目、Issue 选择、成员分配与配置复制 — 开发任务

> 来源 PRD：[83-prd-项目拆分.md](../prds/2026-09/83-prd-项目拆分.md)
> 需求编号：YV-09-229 · 优先级：P2 · 人天：0.3d

## 五、实施步骤

| 步骤 | 内容 | 涉及文件 | 验证方式 | 人天 |
|------|------|---------|---------|------|
| 1 | 类型定义 + Split Service | `types/projectSplit.ts`, `services/projectSplitService.ts` | 类型检查通过 | 0.04 |
| 2 | 拆分配置面板组件 | `SplitConfigPanel.vue` | 子项目增删正常 | 0.05 |
| 3 | Issue 分配组件 | `IssueAllocator.vue` | 自动分配 + 手动拖拽 | 0.06 |
| 4 | 子项目配置组件 | `SplitTargetConfig.vue` | 配置复制 + 成员分配 | 0.05 |
| 5 | 拆分预览组件 | `SplitPreview.vue` | 预览数据正确 | 0.04 |
| 6 | 拆分进度组件 | `SplitProgress.vue` | 进度步骤正确 | 0.03 |
| 7 | 项目拆分主页面 | `ProjectSplit.vue` | 所有组件集成正常 | 0.02 |
| 8 | 路由 + 菜单配置 | `routes.ts`，菜单 | 页面可访问 | 0.01 |

**总计：0.3d**

---
