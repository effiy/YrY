---
doc_type: module
prd_task_id: "YV-09-31"
title: "面包屑与导航系统 — 开发任务"
status: 需求已编写
priority: 中
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
estimate_frontend: 0.5
source_prd: "11-prd-面包屑与导航系统.md"
---

# 面包屑与导航系统 — 开发任务

> 来源 PRD：[11-prd-面包屑与导航系统.md](../prds/2026-09/11-prd-面包屑与导航系统.md)
> 需求编号：YV-09-31 · 优先级：中 · 人天：0.5d

## 五、实施步骤

| 步骤 | 任务 | 产出 | 验证方式 | 人天 |
|------|------|------|----------|------|
| 1 | 创建导航状态 Store | `src/stores/navigation.ts` | Store 初始化正常，持久化读写正确 | 0.10 |
| 2 | 创建面包屑组件 | `BreadcrumbNav.vue` | 面包屑正确显示路径层级，点击可导航 | 0.08 |
| 3 | 创建标签页组件 | `TabBar.vue`, `TabItem.vue` | 标签页可打开/关闭/切换 | 0.10 |
| 4 | 创建标签页右键菜单 | `TabContextMenu.vue` | 右键菜单正确显示，各操作生效 | 0.05 |
| 5 | 创建最近页面下拉 | `RecentPagesDropdown.vue` | 最近访问页面列表正确 | 0.03 |
| 6 | 创建 useTabManager Composable | `useTabManager.ts` | 键盘快捷键全部生效 | 0.05 |
| 7 | 扩展路由 Meta 类型 | `src/router/index.ts` | TypeScript 编译通过，meta 扩展生效 | 0.02 |
| 8 | 集成到 MainLayout | `MainLayout.vue` | 面包屑和标签页栏在全局布局中正确显示 | 0.05 |
| 9 | 集成测试 + 端到端验证 | 所有页面面包屑正确、标签页功能正常 | 手动验证所有导航路径 | 0.02 |

**总计：** 0.5d

---
