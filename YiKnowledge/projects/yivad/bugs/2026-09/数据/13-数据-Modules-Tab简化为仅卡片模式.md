---
title: "项目详情页: Modules Tab 简化为仅卡片模式"
key: modules-tab-simplify-card-only-20260910
tags:
- ui-refinement
- modules
- project-detail
category: projects/yivad/bugs/data
created: "2026-09-10"
updated: 2026-09-10
source: internal
type: improvement
status: resolved
severity: minor
priority: p3
project: YiVad
module: views/module/index.vue
reporter: Claude
environment: Chrome / macOS
affectedVersion: main
fixedVersion: main (post-fix 2026-09-10)
frequency: always
---

## Description

访问 `http://localhost:8848/#/project/yivad` → Modules Tab 时，页面展示了完整的 ModuleList 组件，包括侧边栏（统计卡片、Overview、Needs Attention、Data Quality）、视图模式切换器（Table/Card/List）以及 Table/List 视图。在项目详情页的上下文中，这些元素分散注意力，仅保留卡片模式即可满足需求。

### 移除内容

| 元素 | 说明 |
|------|------|
| 侧边栏 (Sidebar) | 统计卡片、Overview/Needs Attention/Data Quality 面板 |
| 视图模式切换 | Table/Card/List 三选一 radio group |
| Table 视图 | ProTable 表格 |
| List 视图 | 列表行布局 |

### 保留内容

| 元素 | 说明 |
|------|------|
| Card 视图 | 卡片网格布局 |
| 搜索框 + New Module 按钮 | 顶部工具栏 |
| Create/Edit 对话框 | 新建/编辑模块弹窗 |

## Steps to Reproduce

1. 访问 `http://localhost:8848/#/project/yivad`
2. 切换到 Modules Tab
3. 观察页面布局 —— 原先有侧边栏和视图模式切换

## Fix

### views/module/index.vue

**1. 侧边栏条件隐藏 (line 65)**

```diff
- <div class="module-list__sidebar">
+ <div v-if="!props.projectKey" class="module-list__sidebar">
```

**2. 强制 card 视图 (line 398)**

```diff
  const viewMode = ref<"table" | "card" | "list">("card");
+ const effectiveViewMode = computed(() => props.projectKey ? "card" as const : viewMode.value);
```

模板中所有 `viewMode` 引用替换为 `effectiveViewMode`，确保 `projectKey` 存在时始终渲染卡片视图。

> 独立 `/module` 路由不受影响 —— `projectKey` 为 undefined 时完整功能照常展示。

## Verification

- [ ] 项目详情页 Modules Tab 仅显示 ProTable（无侧边栏、无视图切换）
- [ ] 搜索和 New Module 功能正常
- [ ] 独立 `/module` 路由仍显示完整布局（侧边栏 + 视图切换）
- [ ] 语言切换后功能正常

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 预防措施

| 层面 | 措施 |
|------|------|
| 代码 | 加强代码审查，关注此类问题模式 |
| 测试 | 增加自动化测试覆盖对应场景 |
| 流程 | 将此类问题纳入检查清单 |

## 经验教训

- 此类问题属于常见开发疏忽，可通过静态分析和自动化检查提前发现
- 建议将典型问题模式记录到团队知识库，避免重复踩坑
- 代码审查应重点关注此类边界情况

