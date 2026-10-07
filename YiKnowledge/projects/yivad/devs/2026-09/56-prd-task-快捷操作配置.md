---
prd_task_id: "YV-09-124"
title: "YV-09-124: 快捷操作配置 — 开发方案"
status: 已完成
priority: P3
owner: 陈铭
created: 2026-09-11
updated: 2026-09-14
project: YiVad
prd_month: "202609"
estimate_frontend: 0.25
source_prd: "56-prd-快捷操作配置.md"
type: task
category: projects/yivad/devs
source: YiVad
tags: [yivad, dev, 快捷操作配置]
roles: [engineer]
benefit: "开发方案：task-快捷操作配置"
lifecycle: active
---

# YV-09-124: 快捷操作配置 — 开发方案

> 需求编号：YV-09-124 · 人天：0.25d

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

## 源码索引

| 文件 | 说明 | 路径 |
|------|------|------|
| `QuickActionBar.vue` | 快捷工具栏（顶部固定栏+可折叠） | `src/components/quickActions/` |
| `QuickActionEditor.vue` | 操作配置面板（添加/删除/排序） | `src/components/quickActions/` |
| `ActionRegistry.ts` | 操作注册表（静态声明+动态注册） | `src/utils/` |
| `useQuickActions.ts` | 快捷操作 composable（CRUD+持久化） | `src/composables/` |
| `useActionRecommendation.ts` | 操作推荐引擎（频率×时间衰减） | `src/composables/` |
| `quickActionStore.ts` | 用户快捷操作配置 Store | `src/stores/modules/` |

---

<a id="sec-1"></a>
## 一、方案概述

用户可自定义 Cmd+K 命令面板中的 Quick Actions：添加/删除/排序常用操作。系统根据使用频率×时间衰减算法自动推荐高频操作，用户拖拽排序自定义工具栏布局。

### 架构方案

**技术路线**：快捷操作系统由三层组成——(1) 操作注册层（`ActionRegistry` 管理可用操作池），(2) 推荐引擎层（`useActionRecommendation` 频率×时间衰减），(3) UI 层（`QuickActionBar` 顶部固定工具栏+ `QuickActionEditor` 配置面板）。操作分为静态声明（页面级 `defineActions`）和动态注册（运行时条件触发）两种方式。

**操作注册模型**：
```typescript
interface ActionDefinition {
  id: string;                    // 全局唯一标识
  label: string;                 // 显示名称（i18n key）
  icon: string;                  // Element Plus 图标名
  handler: () => void | Promise<void>;
  shortcut?: string;             // 默认快捷键
  scope: 'global' | 'page';     // 快捷键生效范围
  context?: {                    // 上下文条件（动态注册用）
    page?: string;
    minSelection?: number;
  };
}

// 静态声明（页面组件中）
defineActions([
  { id: 'issue.export-csv', label: 'exportCsv', icon: 'Download', handler: exportCsv },
  { id: 'issue.batch-delete', label: 'batchDelete', icon: 'Delete', handler: batchDelete, 
    context: { minSelection: 1 } },
]);

// 动态注册（条件满足时）
actionRegistry.register({
  id: 'bug.bulk-assign', 
  label: 'bulkAssign', 
  icon: 'User',
  handler: bulkAssign,
  context: { page: '/bug', minSelection: 2 },
});
```

**推荐算法**：
```
score(action) = usage_count × exp(-λ × days_since_last_use)
λ = ln(2) / 14  (半衰期 14 天)

示例：
  昨天使用 10 次的操作: 10 × exp(-0.05×1) ≈ 9.5
  2 周前使用 10 次: 10 × exp(-0.05×14) ≈ 5.0
  1 月前使用 10 次: 10 × exp(-0.05×30) ≈ 2.2
```

**组件树**：
```
QuickActionBar.vue (顶部固定栏，可折叠)
├── QuickActionButton.vue ×N (32×32 图标按钮 + tooltip + 快捷键标签)
├── QuickActionDivider.vue (分隔线)
├── QuickActionAddButton.vue (打开配置面板)
├── QuickActionCollapseButton.vue (折叠/展开)
└── QuickActionRecommendation.vue (推荐操作提示: "你是否想将'导出CSV'加入快捷栏?")
    └── 基于 useActionRecommendation 的 score 排序

QuickActionEditor.vue (配置面板 el-drawer)
├── AvailableActionsList.vue (可用操作池，按分类分组)
├── MyActionsList.vue (拖拽排序 + 删除 + 快捷键绑定)
└── ShortcutBindingDialog.vue (快捷键录制器: 按下组合键→显示→确认)
```

**数据流**：
```
页面加载
  → ActionRegistry 加载静态声明 + 历史动态注册
  → quickActionStore 加载用户配置（localStorage: yivad-quick-actions）
  → useActionRecommendation 计算推荐分数
  → QuickActionBar 渲染（用户已选操作 + 推荐提示）

用户点击操作
  → ActionRegistry.execute(id)
  → useActionRecommendation.recordUse(id)  // 记录使用，更新分数

用户拖拽排序 / 添加快捷操作
  → quickActionStore.updateConfig(newOrder)
  → persist to localStorage
  → QuickActionBar 重新渲染

快捷键绑定
  → ShortcutBindingDialog 录制组合键
  → 冲突检测: 检查是否与现有全局/页面级快捷键冲突
  → 保存到 quickActionStore.shortcutBindings
```

**关键决策**：
- 工具栏位置：顶部固定栏（紧贴主工具栏下方），占用 ~40px，可折叠——与浏览器书签栏概念一致
- 操作注册机制：静态声明（页面 `defineActions` 导出）+ 动态注册（运行时 `actionRegistry.register`），互补覆盖
- 推荐算法：频率 × 时间衰减（半衰期 14 天），纯前端本地计算，无需后端
- 快捷键范围：默认页面级（避免跨页面冲突），全局快捷键 Ctrl+K/Ctrl+F 等为系统保留不可覆盖
- 操作持久化：用户配置存 localStorage `yivad-quick-actions`，`{ actionIds: string[], order: number[], shortcutBindings: Record<string,string> }`
- 冲突检测：保存快捷键时遍历 `ActionRegistry` 检查重复，页面级快捷键在不同页面间不冲突

### 配置项

| 字段 | 说明 | 示例 |
|------|------|------|
| 操作名 | 显示名称（i18n key） | `quickActions.exportCsv` |
| 图标 | Element Plus 图标名 | `Download` |
| 快捷键 | 可选组合键（Ctrl/Alt/Shift+字母） | `Ctrl+E` |
| 跳转路径 | 操作目标路由（仅导航类操作） | `/issue?filter=open` |

### 实施步骤：0.25d

| 步骤 | 内容 | 验证 | 人天 |
|------|------|------|------|
| 1 | ActionRegistry + useQuickActions composable | 注册/执行/查询操作 | 0.06 |
| 2 | QuickActionBar UI（固定栏+按钮+折叠） | 工具栏渲染+交互 | 0.06 |
| 3 | QuickActionEditor（拖拽排序+快捷键绑定） | 配置面板全流程 | 0.06 |
| 4 | useActionRecommendation + 推荐提示 | 频率×衰减计算+推荐UI | 0.04 |
| 5 | 持久化+快捷键冲突检测 | localStorage + 冲突提示 | 0.03 |

---

<a id="sec-2"></a>
## 二、完成定义（DoD）

- [ ] ActionRegistry 支持静态声明（defineActions）+ 动态注册（register/unregister）
- [ ] QuickActionBar 顶部固定栏渲染用户已选操作（最多 10 个）
- [ ] 拖拽排序持久化到 localStorage
- [ ] 推荐引擎基于频率×时间衰减计算分数，提示用户添加高频操作
- [ ] 快捷键绑定支持 Ctrl/Alt/Shift+字母组合，冲突时提示
- [ ] 预置操作：新建 Issue/项目/模块，打开最近访问页面
- [ ] 折叠/展开按钮 + 空状态（无快捷操作时引导配置）
- [ ] `vue-tsc --noEmit` 通过

---

<a id="sec-gap"></a>
## 已知缺口与技术债

> 状态：已完成

### 功能缺口

| # | 缺口 | 影响 | 建议 |
|---|------|------|------|
| — | 无 | — | — |

### 技术债

| # | 技术债 | 优先级 | 预计人天 | 说明 | 状态 |
|---|--------|--------|---------|------|------|
| — | 无 | — | — | — | — |

---

## 实现完成记录

> **状态**：已完成（0.25d 轻量特性）· **复核日期**：2026-09-15

### 产出

| 分类 | 文件数 | 说明 |
|------|--------|------|
| 组件 | 2 | QuickActionBar + QuickActionEditor |
| Composable | 2 | useQuickActions + useActionRecommendation |
| Utils | 1 | ActionRegistry (操作注册表) |
| Store | 1 | quickActionStore (配置持久化) |
| 测试 | 1 | 见测试方案 |

---

## 代码审查检查清单

- [x] ActionRegistry 静态声明 + 动态注册机制完整
- [x] QuickActionBar 顶部固定栏渲染正确（按钮+分隔线+折叠）
- [x] 拖拽排序持久化到 localStorage
- [x] 推荐引擎分数计算正确（频率×时间衰减）
- [x] 快捷键冲突检测 + 提示
- [x] 空状态引导（无快捷操作时显示配置引导）
- [x] 用户可见文本国际化
- [x] `vue-tsc --noEmit` 通过