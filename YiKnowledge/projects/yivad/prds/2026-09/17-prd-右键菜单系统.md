---
title: 右键菜单系统
tags:
- 右键菜单
- ContextMenu
- 交互优化
- 批量操作
- 键盘无障碍
category: 项目/管理后台/需求
created: 2026-09-09
updated: 2026-09-10
source: 内部
type: 需求
status: 已实现
priority: 中
project: YiVad
project_id: yivad
owner: 陈铭
prd_month: "202609"
prd_task_id: YV-09-42
estimate_frontend: 0.5
review_status: 待评审
issue_type: 功能
roles:
- engineer
- qa
source_okr: [yivad-003]
---

# 右键菜单系统

> 需求编号：YV-09-42 · 优先级：P2 · 人天：0.5d
> 依赖：无（纯前端组件，独立实现）

## 改动总览

| 改动点 | 类型 | 涉及文件 |
|--------|------|---------|
| ContextMenu 核心组件 | 新增 | `src/components/context-menu/ContextMenu.vue` |
| ContextMenu 类型定义 | 新增 | `src/components/context-menu/types.ts` |
| useContextMenu Composable | 新增 | `src/composables/useContextMenu.ts` |
| 菜单定位引擎 | 新增 | `src/components/context-menu/useMenuPosition.ts` |
| 键盘导航 Hook | 新增 | `src/composables/useMenuKeyboard.ts` |
| 菜单项子组件 | 新增 | `src/components/context-menu/ContextMenuItem.vue` |
| 子菜单组件 | 新增 | `src/components/context-menu/ContextSubMenu.vue` |
| 批量操作集成 | 修改 | 各页面组件中集成右键菜单 |

## 涉及文件

```
YiVad/
└── src/
    ├── components/
    │   └── context-menu/
    │       ├── ContextMenu.vue                # 新增：右键菜单主组件
    │       ├── ContextMenuItem.vue            # 新增：菜单项组件
    │       ├── ContextSubMenu.vue             # 新增：子菜单组件
    │       ├── types.ts                       # 新增：菜单类型定义
    │       └── useMenuPosition.ts             # 新增：菜单定位引擎
    ├── composables/
    │   ├── useContextMenu.ts                  # 新增：右键菜单 Composable
    │   └── useMenuKeyboard.ts                 # 新增：键盘导航 Hook
    └── styles/
        └── context-menu.scss                  # 新增：右键菜单样式
```

## 基本信息

| 字段 | 值 |
|------|-----|
| 需求编号 | YV-09-42 |
| 模块 | 全局交互组件 |
| 优先级 | **P2**（提升操作效率，非阻塞） |
| 前端人天 | 0.5d |
| 后端人天 | -- |
| 依赖 | 无 |

---

## 背景

YiVad 当前所有页面均依赖浏览器默认右键菜单，用户无法通过右键快速执行上下文相关操作。在数据表格、文件列表、Issue 卡片等场景中，用户需要将鼠标移动到远处的工具栏才能执行"编辑"、"删除"、"复制"等操作，操作路径长、效率低。

**核心问题：**

| # | 问题 | 严重程度 | 影响 |
|---|------|----------|------|
| 1 | **无上下文操作入口** -- 所有操作依赖顶部工具栏或行内按钮 | **中** | 用户操作路径长，需要频繁切换鼠标焦点位置 |
| 2 | **批量操作不便** -- 选中多个项目后，无法快速批量操作 | **中** | 选中后需移动到工具栏点击批量按钮，增加操作步骤 |
| 3 | **浏览器默认菜单无业务价值** -- 浏览器默认菜单提供"返回"、"刷新"等与业务无关选项 | **低** | 用户无法利用右键菜单提升工作效率 |
| 4 | **无键盘右键等效操作** -- 仅依赖鼠标右键，键盘用户无法触发上下文菜单 | **低** | 键盘用户（包括无障碍需求）无法使用上下文操作 |
| 5 | **操作发现性差** -- 新用户不知道可以对某个元素执行哪些操作 | **低** | 右键菜单天然提供操作发现，当前缺失这一渠道 |

## 一、现状分析

### 当前右键交互矩阵

| 场景 | 当前行为 | 期望行为 | 差距 |
|------|---------|---------|------|
| 数据表格行 | 浏览器默认菜单 | 右键显示"编辑"、"删除"、"复制"、"查看详情"等上下文操作 | 完全缺失 |
| 文件列表项 | 浏览器默认菜单 | 右键显示"重命名"、"下载"、"删除"、"移动到"等文件操作 | 完全缺失 |
| Issue 卡片 | 浏览器默认菜单 | 右键显示"编辑"、"分配"、"变更状态"、"添加标签"等操作 | 完全缺失 |
| 文本选中 | 浏览器默认菜单 | 右键显示"复制"、"搜索选中文本"、"翻译"等操作 | 部分缺失 |
| 批量选中项 | 浏览器默认菜单 | 右键显示"批量删除"、"批量导出"、"批量分配"等操作 | 完全缺失 |
| 标签页标签 | 浏览器默认菜单 | 右键显示"关闭"、"关闭其他"、"关闭右侧"、"固定"等操作 | 完全缺失 |

### 根因分析矩阵

| 缺失项 | 根因 | 影响链 |
|--------|------|--------|
| 自定义右键菜单 | 未开发 ContextMenu 组件，未拦截 `contextmenu` 事件 | 所有页面依赖浏览器默认菜单，无法提供上下文操作 |
| 菜单项类型系统 | 未定义菜单项数据结构（action/divider/submenu 等） | 无法统一管理不同场景的菜单配置 |
| 子菜单支持 | 未实现嵌套菜单逻辑和鼠标/键盘导航 | 复杂操作（如"移动到 → 子目录"）无法归类展示 |
| 批量操作集成 | 右键菜单与批量选中状态未联动 | 选中多个项目后右键无法触发批量操作 |
| 键盘无障碍 | 未处理 Context Menu 键、方向键导航、Esc 关闭 | 键盘用户无法使用右键菜单 |

---

## 二、设计决策

### 菜单组件架构选型

| 维度 | 自研 ContextMenu 组件 | 使用 Element Plus Dropdown | 决策 |
|------|----------------------|--------------------------|------|
| 上下文绑定 | 可绑定到任意 DOM 元素 | 需包裹在 Dropdown 组件内 | **自研**（更灵活） |
| 定位控制 | 完全控制定位逻辑（自动翻转、边缘避让） | 依赖 Popper.js，定位选项有限 | **自研**（更精确） |
| 子菜单 | 完全控制嵌套层级和动画 | 仅支持单层菜单 | **自研**（需要 2 级子菜单） |
| 键盘导航 | 完全控制焦点管理和键盘事件 | 键盘导航有限 | **自研**（需要完整无障碍） |
| 样式一致性 | 需自行维护与 Element Plus 风格一致 | 天然一致 | 通过复用 Element Plus CSS 变量弥补 |

**决策：** 自研 ContextMenu 组件，通过复用 Element Plus CSS 变量保持视觉一致性，使用 Teleport 渲染到 body 避免 z-index 问题。

### 菜单项类型设计

| 类型 | 用途 | 示例 |
|------|------|------|
| `action` | 普通操作项 | "编辑"、"删除"、"复制" |
| `divider` | 分隔线 | 菜单分组间分隔 |
| `submenu` | 子菜单触发器 | "移动到 →"、"分配 →" |
| `checkbox` | 开关选项 | "显示已归档"、"自动刷新" |
| `radio` | 单选选项 | 排序方式："按名称"/"按日期"/"按大小" |

### 定位引擎策略

| 策略 | 描述 | 触发条件 |
|------|------|---------|
| 默认右下 | 菜单在鼠标右下角展开 | 有足够空间 |
| 水平翻转 | 右侧空间不足时翻转到左侧 | 鼠标 x + 菜单宽度 > 视口宽度 |
| 垂直翻转 | 下方空间不足时翻转到上方 | 鼠标 y + 菜单高度 > 视口高度 |
| 双向翻转 | 同时水平和垂直翻转 | 右下角空间不足 |

---

## 三、目标架构

```
┌──────────────────────────────────────────────────────────────────┐
│                      ContextMenu System                          │
│                                                                  │
│  ┌──────────────────┐    ┌──────────────────┐                   │
│  │  useContextMenu  │    │  useMenuKeyboard │                   │
│  │  - show(x,y)     │    │  - ↑↓ navigate   │                   │
│  │  - hide()        │    │  - Enter select   │                   │
│  │  - items[]       │    │  - Esc close      │                   │
│  │  - context       │    │  - → open submenu │                   │
│  └────────┬─────────┘    │  - ← close submenu│                   │
│           │               └────────┬─────────┘                   │
│           │                        │                             │
│           ▼                        ▼                             │
│  ┌─────────────────────────────────────────────┐                 │
│  │              ContextMenu.vue                 │                 │
│  │  ┌─────────────────────────────────────┐    │                 │
│  │  │  useMenuPosition(x, y, menuSize)    │    │                 │
│  │  │  - 自动翻转                          │    │                 │
│  │  │  - 边缘避让                          │    │                 │
│  │  │  - 动画 (scale+fade, 150ms)          │    │                 │
│  │  └─────────────────────────────────────┘    │                 │
│  │  ┌─────────────────────────────────────┐    │                 │
│  │  │  ContextMenuItem.vue                 │    │                 │
│  │  │  - action / divider / submenu        │    │                 │
│  │  │  - checkbox / radio                  │    │                 │
│  │  │  - disabled + tooltip                │    │                 │
│  │  │  - shortcut display                  │    │                 │
│  │  └─────────────────────────────────────┘    │                 │
│  │  ┌─────────────────────────────────────┐    │                 │
│  │  │  ContextSubMenu.vue                  │    │                 │
│  │  │  - 嵌套展开 (max 2 levels)            │    │                 │
│  │  │  - 悬停/点击展开                      │    │                 │
│  │  │  - 延迟关闭 (300ms grace period)      │    │                 │
│  │  └─────────────────────────────────────┘    │                 │
│  └─────────────────────────────────────────────┘                 │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │              页面集成层 (各业务页面)                        │    │
│  │  - 表格行: @contextmenu → show(编辑/删除/复制/详情)         │    │
│  │  - 文件列表: @contextmenu → show(重命名/下载/删除/移动)      │    │
│  │  - Issue卡片: @contextmenu → show(编辑/分配/状态/标签)       │    │
│  │  - 文本选择: @contextmenu → show(复制/搜索/翻译)            │    │
│  │  - 批量选中: @contextmenu → show(批量删除/导出/分配)         │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 四、具体改动

### 4.1 菜单项类型定义

**文件：** `src/components/context-menu/types.ts`（新增）

```typescript
// 菜单项基础类型
interface BaseMenuItem {
  id: string;
  label: string;
  type: 'action' | 'divider' | 'submenu' | 'checkbox' | 'radio';
  disabled?: boolean;
  disabledReason?: string; // tooltip 显示禁用原因
  shortcut?: string;       // 快捷键显示 (Ctrl+C, Delete 等)
  icon?: string;           // 图标名称
  danger?: boolean;        // 危险操作（红色高亮）
}

// 操作项
interface ActionItem extends BaseMenuItem {
  type: 'action';
  action: (context: MenuContext) => void;
}

// 分隔线
interface DividerItem {
  id: string;
  type: 'divider';
}

// 子菜单
interface SubMenuItem extends BaseMenuItem {
  type: 'submenu';
  children: MenuItem[];
}

// 复选框项
interface CheckboxItem extends BaseMenuItem {
  type: 'checkbox';
  checked: boolean;
  onChange: (checked: boolean, context: MenuContext) => void;
}

// 单选项
interface RadioItem extends BaseMenuItem {
  type: 'radio';
  value: string;
  currentValue: string;
  onChange: (value: string, context: MenuContext) => void;
}

type MenuItem = ActionItem | DividerItem | SubMenuItem | CheckboxItem | RadioItem;

// 菜单上下文（传递给 action 回调）
interface MenuContext {
  element: HTMLElement;           // 被右键点击的元素
  selectedIds?: string[];         // 批量选中的 ID 列表
  pageContext?: Record<string, any>; // 页面级上下文数据
}
```

### 4.2 useContextMenu Composable

**文件：** `src/composables/useContextMenu.ts`（新增）

```typescript
import { ref, readonly } from 'vue';
import type { MenuItem, MenuContext } from '@/components/context-menu/types';

export function useContextMenu() {
  const visible = ref(false);
  const position = ref({ x: 0, y: 0 });
  const items = ref<MenuItem[]>([]);
  const context = ref<MenuContext | null>(null);

  function show(
    event: MouseEvent,
    menuItems: MenuItem[],
    ctx?: Partial<MenuContext>
  ) {
    event.preventDefault();
    event.stopPropagation();
    position.value = { x: event.clientX, y: event.clientY };
    items.value = menuItems;
    context.value = {
      element: event.target as HTMLElement,
      ...ctx,
    };
    visible.value = true;
  }

  function hide() {
    visible.value = false;
    items.value = [];
    context.value = null;
  }

  // 通过 Context Menu 键触发（键盘用户）
  function showAtTarget(
    target: HTMLElement,
    menuItems: MenuItem[],
    ctx?: Partial<MenuContext>
  ) {
    const rect = target.getBoundingClientRect();
    position.value = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    items.value = menuItems;
    context.value = {
      element: target,
      ...ctx,
    };
    visible.value = true;
  }

  return {
    visible: readonly(visible),
    position: readonly(position),
    items: readonly(items),
    context: readonly(context),
    show,
    hide,
    showAtTarget,
  };
}
```

### 4.3 菜单定位引擎

**文件：** `src/components/context-menu/useMenuPosition.ts`（新增）

```typescript
import { ref, computed, type Ref } from 'vue';

interface Position {
  x: number;
  y: number;
}

export function useMenuPosition(
  anchor: Ref<Position>,
  menuWidth: Ref<number>,
  menuHeight: Ref<number>
) {
  const adjustedPosition = computed(() => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 8; // 与视口边缘的最小间距

    let x = anchor.value.x;
    let y = anchor.value.y;

    // 水平翻转：右侧空间不足
    if (x + menuWidth.value > viewportWidth - padding) {
      x = Math.max(padding, x - menuWidth.value);
    }

    // 垂直翻转：下方空间不足
    if (y + menuHeight.value > viewportHeight - padding) {
      y = Math.max(padding, y - menuHeight.value);
    }

    // 确保不超出左/上边界
    x = Math.max(padding, Math.min(x, viewportWidth - menuWidth.value - padding));
    y = Math.max(padding, Math.min(y, viewportHeight - menuHeight.value - padding));

    return { x, y };
  });

  // 动画方向：根据翻转情况决定 scale 变换原点
  const transformOrigin = computed(() => {
    const originX = anchor.value.x + menuWidth.value > window.innerWidth ? 'right' : 'left';
    const originY = anchor.value.y + menuHeight.value > window.innerHeight ? 'bottom' : 'top';
    return `${originY} ${originX}`;
  });

  return { adjustedPosition, transformOrigin };
}
```

### 4.4 键盘导航 Hook

**文件：** `src/composables/useMenuKeyboard.ts`（新增）

```typescript
import { ref, onMounted, onUnmounted, type Ref } from 'vue';

export function useMenuKeyboard(
  visible: Ref<boolean>,
  items: Ref<any[]>,
  onSelect: (index: number) => void,
  onClose: () => void
) {
  const activeIndex = ref(-1);

  function handleKeydown(e: KeyboardEvent) {
    if (!visible.value) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        activeIndex.value = Math.min(activeIndex.value + 1, items.value.length - 1);
        // 跳过 disabled 和 divider 项
        while (
          activeIndex.value < items.value.length &&
          (items.value[activeIndex.value]?.disabled ||
           items.value[activeIndex.value]?.type === 'divider')
        ) {
          activeIndex.value++;
        }
        if (activeIndex.value >= items.value.length) activeIndex.value = 0;
        break;

      case 'ArrowUp':
        e.preventDefault();
        activeIndex.value = Math.max(activeIndex.value - 1, 0);
        while (
          activeIndex.value > 0 &&
          (items.value[activeIndex.value]?.disabled ||
           items.value[activeIndex.value]?.type === 'divider')
        ) {
          activeIndex.value--;
        }
        break;

      case 'Enter':
        e.preventDefault();
        if (activeIndex.value >= 0) {
          onSelect(activeIndex.value);
        }
        break;

      case 'Escape':
        e.preventDefault();
        onClose();
        break;

      case 'ArrowRight':
        e.preventDefault();
        // 展开当前聚焦的子菜单
        if (items.value[activeIndex.value]?.type === 'submenu') {
          // 触发子菜单展开
        }
        break;

      case 'ArrowLeft':
        e.preventDefault();
        // 关闭当前子菜单，返回父级
        break;
    }
  }

  // 监听 Context Menu 键
  function handleContextMenuKey(e: KeyboardEvent) {
    if (e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10')) {
      e.preventDefault();
      // 触发当前焦点元素的右键菜单
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('keydown', handleContextMenuKey);
  });

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown);
    document.removeEventListener('keydown', handleContextMenuKey);
  });

  return { activeIndex };
}
```

### 4.5 ContextMenu 主组件

**文件：** `src/components/context-menu/ContextMenu.vue`（新增）

核心功能：
- 使用 `<Teleport to="body">` 渲染到 body 层
- 150ms scale+fade 入场动画
- 点击菜单外部自动关闭
- 菜单项类型路由：根据 `type` 渲染不同的子组件
- 批量操作：当 `selectedIds.length > 1` 时自动切换为批量菜单项
- 支持 `v-auth` 指令控制菜单项权限

### 4.6 样式

**文件：** `src/styles/context-menu.scss`（新增）

```scss
.context-menu {
  position: fixed;
  z-index: 9999;
  min-width: 180px;
  max-width: 280px;
  padding: 4px 0;
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-light);
  border-radius: var(--el-border-radius-base);
  box-shadow: var(--el-box-shadow-light);

  // 入场动画
  animation: context-menu-enter 150ms ease-out;

  &__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 12px;
    font-size: 13px;
    color: var(--el-text-color-primary);
    cursor: pointer;
    transition: background-color 100ms;

    &:hover:not(&--disabled) {
      background: var(--el-fill-color-light);
    }

    &--disabled {
      color: var(--el-text-color-disabled);
      cursor: not-allowed;
    }

    &--danger {
      color: var(--el-color-danger);
    }
  }

  &__shortcut {
    margin-left: 24px;
    font-size: 11px;
    color: var(--el-text-color-secondary);
  }

  &__divider {
    height: 1px;
    margin: 4px 8px;
    background: var(--el-border-color-lighter);
  }

  &__submenu-arrow {
    margin-left: auto;
    font-size: 10px;
  }
}

@keyframes context-menu-enter {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

---

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

## 六、测试规格

### Scenario 1: 右键菜单正常显示
- **GIVEN** 用户在数据表格页面，鼠标悬停在某一行上
- **WHEN** 用户右键点击该行
- **THEN** 浏览器默认菜单被阻止，自定义右键菜单在鼠标位置附近显示，包含"编辑"、"删除"、"复制"、"查看详情"等菜单项

### Scenario 2: 菜单自动翻转避免溢出
- **GIVEN** 用户在视口右下角右键点击一个元素
- **WHEN** 菜单默认位置超出视口边界
- **THEN** 菜单自动翻转到鼠标左上方，所有菜单项完全可见，不超出视口

### Scenario 3: 键盘导航菜单项
- **GIVEN** 右键菜单已显示，焦点在菜单上
- **WHEN** 用户按 ↓ 键 3 次，然后按 Enter 键
- **THEN** 高亮依次移动到第 1、第 2、第 3 个菜单项（跳过 disabled 和 divider），Enter 触发第 3 个菜单项的 action

### Scenario 4: 批量选中右键菜单
- **GIVEN** 用户在表格中选中了 3 行数据
- **WHEN** 用户右键点击其中任意一行
- **THEN** 菜单显示"批量删除 (3)"、"批量导出 (3)"、"批量分配 (3)"等批量操作项

### Scenario 5: 子菜单展开与关闭
- **GIVEN** 右键菜单包含"移动到"子菜单项
- **WHEN** 用户悬停在"移动到"上
- **THEN** 子菜单在右侧展开，显示"项目 A"、"项目 B"、"项目 C"等选项；鼠标移出子菜单区域后 300ms 自动关闭

### Scenario 6: 禁用项显示 tooltip
- **GIVEN** 右键菜单中"删除"项被标记为 disabled，disabledReason 为"无删除权限"
- **WHEN** 用户悬停在"删除"项上
- **THEN** 菜单项灰色显示，tooltip 显示"无删除权限"，点击不触发任何操作

---

## 七、风险与缓解

| 风险 | 概率 | 影响 | 等级 | 缓解措施 | 应急预案 |
|------|------|------|------|----------|----------|
| 菜单定位在极端视口尺寸下不准确 | 低 | 低 | 低 | 定位引擎覆盖四角测试，padding 确保最小间距 | 降级为固定居中显示 |
| 子菜单延迟关闭导致操作卡顿 | 中 | 低 | 低 | 300ms grace period 平衡响应速度和防误触 | 缩短 grace period 至 150ms |
| 与 Element Plus 组件 z-index 冲突 | 中 | 中 | 中 | 使用 Teleport to body + z-index 9999 | 动态读取当前页面最高 z-index + 1 |
| 大量菜单项导致性能问题 | 低 | 低 | 低 | 菜单项超过 20 个时建议使用分组 | 虚拟滚动菜单项 |
| 移动端无法触发右键菜单 | 低 | 低 | 低 | 移动端使用长按手势触发，或使用三点菜单按钮 | 移动端禁用右键菜单，使用操作按钮 |

---

## 八、回滚策略

| 回滚场景 | 回滚方式 | 影响范围 | 恢复时间 |
|----------|----------|----------|----------|
| 右键菜单组件导致页面崩溃 | 移除 `@contextmenu` 事件绑定，恢复浏览器默认行为 | 所有集成页面 | < 5min |
| 菜单定位错误导致菜单不可见 | 回退 `useMenuPosition.ts` 至固定右下定位 | 右键菜单 | < 2min |
| 子菜单无限嵌套导致内存泄漏 | 限制子菜单深度为 1 级 | 子菜单功能 | < 3min |

**回滚验证：**
- 回滚后各页面右键恢复浏览器默认菜单
- 回滚后无 console 错误
- 回滚后 `pnpm build` 构建成功

---

## 九、设计决策记录

### D-01: 自研 ContextMenu 而非使用 Element Plus Dropdown

**背景：** Element Plus 提供 `el-dropdown` 组件，但需要将触发元素包裹在 Dropdown 组件内部。
**决策：** 自研 ContextMenu 组件，使用 Teleport 渲染到 body。
**权衡：** 需要自行维护样式和行为逻辑，但获得了完全的控制权（定位、子菜单、键盘导航、动画）。
**后果：** 样式需通过复用 Element Plus CSS 变量保持一致性，升级 Element Plus 时需检查 CSS 变量兼容性。

### D-02: 子菜单最大深度为 2 级

**背景：** 深层嵌套菜单会增加操作复杂度和认知负担。
**决策：** 限制子菜单最大深度为 2 级（根菜单 → 子菜单 → 孙菜单）。
**权衡：** 某些复杂操作（如"移动到 → 项目 → 模块 → 子模块"）无法在右键菜单中完成，需在独立对话框中操作。
**后果：** 产品或设计团队需在需求评审时确认 2 级深度是否满足业务需求。

### D-03: 使用 150ms 动画时长

**背景：** 菜单动画需要快速响应，不能拖慢操作。
**决策：** 使用 150ms scale+fade 入场动画。
**权衡：** 150ms 是 UI 动画的最小感知时长，既提供视觉反馈又不影响操作速度。
**后果：** 需在 `prefers-reduced-motion` 媒体查询中禁用动画，满足无障碍需求。

### D-04: 批量操作通过 selectedIds 上下文传递

**背景：** 右键菜单需要感知当前页面的批量选中状态。
**决策：** 通过 `MenuContext.selectedIds` 传递选中项列表，菜单项配置中根据 `selectedIds.length` 决定显示单项操作还是批量操作。
**权衡：** 菜单配置与页面状态耦合，但避免了全局状态管理的复杂性。
**后果：** 每个集成页面需要在 `show()` 调用时传入 `selectedIds`。

---

## 十、可观测性

### 关键指标

| 指标 | 采集方式 | 告警阈值 | 说明 |
|------|---------|---------|------|
| 右键菜单打开次数 | 自定义事件埋点 | -- | 按页面和菜单项统计使用频率 |
| 菜单项点击率 | 自定义事件埋点 | -- | 各菜单项点击次数 / 菜单打开次数 |
| 子菜单展开率 | 自定义事件埋点 | -- | 子菜单展开次数 / 菜单打开次数 |
| 菜单关闭方式 | 自定义事件埋点 | -- | 点击菜单项 / 点击外部 / 按 Esc 的分布 |
| 键盘导航使用率 | 自定义事件埋点 | -- | 键盘导航次数 / 菜单打开次数 |

### 日志规范

| 日志级别 | 场景 | 示例 |
|---------|------|------|
| `DEBUG` | 菜单打开/关闭 | `[ContextMenu] Opened on page=project-list, items=5` |
| `WARN` | 菜单项配置错误 | `[ContextMenu] Missing action handler for item id=delete` |
| `ERROR` | 菜单定位异常 | `[ContextMenu] Position overflow: x=1200, y=900, viewport=1280x720` |

---

## 十一、代码审查检查清单

- [ ] `types.ts` 中 MenuItem 联合类型完整，覆盖所有 5 种类型
- [ ] `useContextMenu.ts` 中 show/hide/showAtTarget 方法实现正确
- [ ] `useMenuPosition.ts` 覆盖 4 个角落定位场景，边缘 padding 合理
- [ ] `useMenuKeyboard.ts` 处理所有 6 个功能键（↑↓←→ Enter Esc）
- [ ] `ContextMenu.vue` 使用 Teleport to body，点击外部正确关闭
- [ ] `ContextMenuItem.vue` 正确渲染 disabled 状态、tooltip、shortcut
- [ ] `ContextSubMenu.vue` 正确实现悬停展开和 300ms 延迟关闭
- [ ] 动画使用 `prefers-reduced-motion` 媒体查询适配无障碍
- [ ] 样式文件使用 Element Plus CSS 变量，保持视觉一致性
- [ ] 批量操作集成：selectedIds.length > 1 时显示批量操作
- [ ] `vue-tsc --noEmit` 类型检查通过

---

## 回归问题预测

| # | 问题 | 预测场景 | 根因 | 预防措施 |
|---|------|---------|------|---------|
| 1 | 菜单在 iframe 内无法渲染 | 页面包含 iframe 时，Teleport to body 的菜单可能被 iframe 遮挡 | iframe 的 z-index 可能高于菜单容器 | 使用 `position: fixed` + 最高 z-index，必要时在 iframe 上层渲染 |
| 2 | 菜单关闭后焦点丢失 | 用户按 Esc 关闭菜单后，焦点未回到触发元素 | 关闭菜单时未调用 `focus()` 恢复焦点 | 在 hide() 方法中记录触发元素，关闭后恢复焦点 |
| 3 | 菜单项 action 中异步操作导致菜单提前关闭 | 点击"删除"后，确认对话框弹出前菜单已关闭 | action 执行与菜单关闭的顺序问题 | action 中返回 Promise，菜单在 Promise resolve/reject 前保持打开 |
| 4 | 滚动时菜单位置不更新 | 右键菜单打开后用户滚动页面，菜单仍停留在原位置 | 菜单使用 fixed 定位，不随页面滚动 | 页面滚动时自动关闭菜单，或在 scroll 事件中更新菜单位置 |
| 5 | 多个菜单同时打开 | 用户快速在不同元素上右键，出现多个菜单叠加 | 未检查当前是否已有菜单打开 | show() 方法中先调用 hide() 关闭已有菜单 |
| 6 | 子菜单在触摸设备上无法悬停展开 | 移动端无 hover 事件，子菜单无法通过悬停展开 | 触摸设备缺少 hover 交互 | 子菜单同时支持 click 展开，移动端使用点击展开 |

---

## 性能分析

### 组件渲染性能

| 场景 | 菜单项数量 | 预估渲染时间 | 说明 |
|------|----------|-------------|------|
| 简单菜单 | 3-5 项 | < 5ms | 无子菜单、无 disabled 项 |
| 标准菜单 | 6-10 项 | < 10ms | 含分隔线、快捷键显示 |
| 复杂菜单 | 10-15 项 | < 15ms | 含 2 层子菜单、checkbox/radio |
| 批量菜单 | 8-12 项 | < 10ms | 含批量操作项 |

### 动画性能

| 动画属性 | 使用方式 | GPU 加速 | 说明 |
|---------|---------|---------|------|
| opacity | CSS transition | 是 | fade 效果 |
| transform: scale() | CSS transition | 是 | scale 效果，使用 transform 而非 width/height |
| 总动画时长 | 150ms | -- | 用户感知延迟 < 50ms，体验流畅 |

### 内存占用

| 组件实例 | 内存占用 | 说明 |
|---------|---------|------|
| 单次菜单渲染 | ~2KB | 菜单组件 + 菜单项组件 + Teleport |
| 子菜单展开 | ~1KB/级 | 额外渲染子菜单项 |
| 菜单关闭后 | 0KB | 组件卸载，Teleport 内容清除 |

---

## 补充：单元测试用例

### UT-CM01: useContextMenu

| # | 测试场景 | 输入 | 期望结果 |
|---|---------|------|---------|
| 1 | 右键触发 | 右键点击目标元素 | 菜单在鼠标位置显示 |
| 2 | 自定义操作 | items=[{label:'编辑', action:fn}] | 点击触发对应 action |
| 3 | 条件显示 | item.visible=false | 该项不在菜单中显示 |
| 4 | 菜单关闭 | 点击菜单外区域 | 菜单消失 |
| 5 | 嵌套菜单 | 子菜单展开 | 子菜单渲染在正确位置 |
| 6 | Teleport | 菜单渲染位置 | 挂载到 body，避免 overflow hidden |

## 补充：实例演示页面

### Demo-CM01: 右键菜单演示
展示右键菜单在表格行、文件夹树、文本等不同场景下的上下文操作。支持嵌套子菜单、条件显示、快捷键提示。

---

