---
doc_type: module
prd_task_id: "YV-09-42"
title: "右键菜单系统 — 开发任务"
status: 已实现
priority: 中
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
estimate_frontend: 0.5
source_prd: "17-prd-右键菜单系统.md"
---

# 右键菜单系统 — 开发任务

> 来源 PRD：[17-prd-右键菜单系统.md](../prds/2026-09/17-prd-右键菜单系统.md)
> 需求编号：YV-09-42 · 优先级：中 · 人天：0.5d

## 五、实施步骤

| 步骤 | 任务 | 产出 | 验证方式 | 人天 |
|------|------|------|----------|------|
| 1 | 定义菜单项类型接口 | `types.ts` | TypeScript 类型检查通过 | 0.03 |
| 2 | 实现 useContextMenu Composable | `useContextMenu.ts` | show/hide 方法可正常调用 | 0.05 |
| 3 | 实现菜单定位引擎 | `useMenuPosition.ts` | 4 个角落点击均不超出视口 | 0.05 |
| 4 | 实现键盘导航 Hook | `useMenuKeyboard.ts` | 方向键导航、Enter/Esc 正常 | 0.05 |
| 5 | 实现 ContextMenu 主组件 | `ContextMenu.vue` | 菜单可正常渲染和关闭 | 0.08 |
| 6 | 实现 ContextMenuItem 子组件 | `ContextMenuItem.vue` | 5 种类型均正确渲染 | 0.06 |
| 7 | 实现 ContextSubMenu 子组件 | `ContextSubMenu.vue` | 2 级嵌套展开/关闭正常 | 0.06 |
| 8 | 编写样式文件 | `context-menu.scss` | 动画流畅、样式与 Element Plus 一致 | 0.03 |
| 9 | 数据表格页面集成右键菜单 | 修改表格页面 | 表格行右键显示编辑/删除/复制 | 0.03 |
| 10 | 文件列表页面集成右键菜单 | 修改文件页面 | 文件项右键显示重命名/下载/删除 | 0.02 |
| 11 | 批量操作集成 | 修改批量操作逻辑 | 选中多项后右键显示批量操作 | 0.02 |
| 12 | 组件测试 + 端到端验证 | 测试文件 | 6 个测试场景通过 | 0.02 |

**总计：** 0.5d

---
