---
doc_type: module
prd_task_id: "YV-09-37"
title: "拖拽排序系统 — 开发任务"
status: 已实现
priority: 中
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
estimate_frontend: 1.0
source_prd: "14-prd-拖拽排序系统.md"
---

# 拖拽排序系统 — 开发任务

> 来源 PRD：[14-prd-拖拽排序系统.md](../prds/2026-09/14-prd-拖拽排序系统.md)
> 需求编号：YV-09-37 · 优先级：中 · 人天：1.0d

## 五、实施步骤

| 步骤 | 任务 | 产出 | 验证方式 | 人天 |
|------|------|------|----------|------|
| 1 | 实现 useDraggable Composable | `useDraggable.ts` | 元素可拖拽移动，事件正确触发 | 0.12 |
| 2 | 实现 useDroppable Composable | `useDroppable.ts` | 拖拽元素进入/离开放置区域高亮正确 | 0.10 |
| 3 | 实现 useSortable Composable | `useSortable.ts` | 列表元素可拖拽排序，FLIP 动画正确 | 0.15 |
| 4 | 实现 FLIP 动画引擎 | `dragAnimation.ts` | 元素移动后播放平滑过渡动画 | 0.08 |
| 5 | 实现 useKeyboardSortable | `useKeyboardSortable.ts` | Space 选取、方向键移动、Space 放置 | 0.12 |
| 6 | 实现触摸拖拽 Polyfill | `touchDragPolyfill.ts` | 移动端长按 300ms 触发拖拽 | 0.08 |
| 7 | 创建 DragHandle 组件 | `DragHandle.vue` | 拖拽手柄六点图标，hover 变 grab 光标 | 0.03 |
| 8 | 创建 SortableList 组件 | `SortableList.vue` | 列表可拖拽排序，键盘可访问 | 0.10 |
| 9 | 实现排序持久化服务 | `sortPersistence.ts` | 排序结果 500ms 防抖保存到后端 | 0.05 |
| 10 | 实现撤销/重做扩展 | `useUndoRedo.ts` 扩展 | 拖拽操作可撤销（Ctrl+Z） | 0.05 |
| 11 | 集成到项目列表页 | `ProjectList/index.vue` | 项目列表可拖拽排序 | 0.05 |
| 12 | 集成到看板页面 | `Kanban/index.vue` | 卡片可跨列拖拽 | 0.05 |
| 13 | 整体验证 | 全流程拖拽排序 | 鼠标/键盘/触摸三种方式排序正确 | 0.02 |

**总计：** 1.0d

---
