---
doc_type: module
prd_task_id: "YV-07-03"
title: "YV-07-03: 布局与动态路由 — 三栏布局 + 菜单驱动的动态路由 — 开发任务"
status: 已完成
priority: P0
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202607"
estimate_frontend: 4.0
source_prd: "03-prd-布局与动态路由.md"
---

# YV-07-03: 布局与动态路由 — 三栏布局 + 菜单驱动的动态路由 — 开发任务

> 来源 PRD：[03-prd-布局与动态路由.md](../prds/2026-07/03-prd-布局与动态路由.md)
> 需求编号：YV-07-03 · 优先级：P0 · 人天：4.0d

## 4.2 实施步骤

| 步骤 | 内容 | 验证方式 | 人天 |
|------|------|---------|------|
| 1 | MainLayout 三栏布局实现（CSS Grid: `grid-template-columns: auto 1fr`） | 布局渲染正确，Sidebar (240px) + Header (56px) + Main (flex:1)，响应式断点 < 768px 侧边栏隐藏 | 1.0 |
| 2 | Sidebar 递归菜单组件（`SidebarItem.vue` 递归渲染 `el-sub-menu`） | 多级菜单（最多 3 级）展开/折叠，图标渲染（Element Plus Icons），当前菜单高亮，菜单搜索过滤 | 1.0 |
| 3 | 动态路由 + 菜单数据加载（`dynamicRouter.ts` + `guard.ts`） | 路由守卫加载菜单 → flat → addRoute 动态注册 → 组件懒加载正确映射 | 1.0 |
| 4 | 路由守卫 + 权限控制（登录态 + 菜单加载时序 + 权限检查） | 未登录→跳转登录，无权限→跳转 403，菜单加载中→显示骨架屏 | 0.5 |
| 5 | Breadcrumb + StatusBar + 侧边栏持久化 + el-menu 多级展开 | 面包屑动态生成（route.matched），侧边栏折叠持久化到 localStorage，子菜单自动展开 | 0.5 |

**总计：4.0d**
