---
title: 多标签页工作区
tags:
- 标签页
- 多任务
- 工作区
- 分屏
- 会话恢复
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
prd_task_id: YV-09-44
estimate_frontend: 1.0
review_status: 待评审
issue_type: 功能
roles:
- engineer
- qa
source_okr: [yivad-003]
---

# 多标签页工作区

> 需求编号：YV-09-44 · 优先级：P2 · 人天：1.0d
> 依赖：无（纯前端组件，独立实现）

## 改动总览

| 改动点 | 类型 | 涉及文件 |
|--------|------|---------|
| TabBar 标签栏组件 | 新增 | `src/components/tab-bar/TabBar.vue` |
| TabItem 标签项组件 | 新增 | `src/components/tab-bar/TabItem.vue` |
| useTabWorkspace Composable | 新增 | `src/composables/useTabWorkspace.ts` |
| 标签页状态管理 Store | 新增 | `src/stores/tabWorkspace.ts` |
| 标签页配置类型 | 新增 | `src/components/tab-bar/types.ts` |
| 标签页拖拽排序 | 新增 | `src/composables/useTabDrag.ts` |
| 标签页右键菜单 | 新增 | `src/components/tab-bar/TabContextMenu.vue` |
| 标签页持久化 | 新增 | `src/stores/tabPersistence.ts` |
| 标签页内存管理 | 新增 | `src/composables/useTabMemory.ts` |
| 分屏视图组件 | 新增 | `src/components/tab-bar/SplitView.vue` |
| 路由配置修改 | 修改 | `src/router/index.ts`（支持标签页路由模式） |

## 涉及文件

```
YiVad/
└── src/
    ├── components/
    │   └── tab-bar/
    │       ├── TabBar.vue                     # 新增：标签栏主组件
    │       ├── TabItem.vue                    # 新增：标签项组件
    │       ├── TabContextMenu.vue             # 新增：标签右键菜单
    │       ├── SplitView.vue                  # 新增：分屏视图组件
    │       └── types.ts                       # 新增：标签页类型定义
    ├── composables/
    │   ├── useTabWorkspace.ts                 # 新增：标签页工作区 Composable
    │   ├── useTabDrag.ts                      # 新增：标签拖拽 Hook
    │   └── useTabMemory.ts                    # 新增：标签内存管理 Hook
    ├── stores/
    │   ├── tabWorkspace.ts                    # 新增：标签页状态管理
    │   └── tabPersistence.ts                  # 新增：标签页持久化
    ├── router/
    │   └── index.ts                           # 修改：支持标签页路由模式
    └── styles/
        └── tab-bar.scss                       # 新增：标签栏样式
```

## 基本信息

| 字段 | 值 |
|------|-----|
| 需求编号 | YV-09-44 |
| 模块 | 全局交互组件 |
| 优先级 | **P2**（提升多任务效率，非阻塞） |
| 前端人天 | 1.0d |
| 后端人天 | -- |
| 依赖 | 42-右键菜单系统（TabContextMenu 依赖 ContextMenu） |

---

## 背景

YiVad 当前是单页面管理模式，用户每次只能查看一个详情页。当用户需要同时查看多个项目详情、对比数据、或在编辑一个页面时参考另一个页面时，必须在浏览器标签页之间切换或在页面间反复导航。这种单页面模式严重限制了多任务工作效率。

**核心问题：**

| # | 问题 | 严重程度 | 影响 |
|---|------|----------|------|
| 1 | **无法同时查看多个详情页** -- 每次只能打开一个页面 | **高** | 用户需要在多个页面间反复切换，操作路径长，效率低 |
| 2 | **对比操作不便** -- 无法并排查看两个项目/文档/Issue | **中** | 对比数据时需要打开两个浏览器标签页，信息割裂 |
| 3 | **页面状态丢失** -- 切换页面后，之前页面的滚动位置、过滤条件丢失 | **中** | 用户返回时需要重新设置过滤条件、滚动到之前位置 |
| 4 | **无打开历史** -- 无法快速回到之前打开过的页面 | **低** | 用户需要重新导航到之前访问的页面 |
| 5 | **标签页过多时管理困难** -- 当用户打开 10+ 个标签页时，难以找到目标标签页 | **低** | 标签页堆积，查找效率降低 |

## 一、现状分析

### 当前页面导航模式

| 场景 | 当前行为 | 问题 |
|------|---------|------|
| 打开项目详情 | 导航到 `/project/:key`，替换当前页面 | 无法同时查看多个项目 |
| 在多个页面间工作 | 通过侧边栏菜单反复切换 | 每次切换丢失页面状态 |
| 对比两个文档 | 打开两个浏览器标签页 | 信息割裂，需要来回切换窗口 |
| 编辑一个页面时参考另一个 | 编辑到一半导航到参考页面，再返回 | 编辑内容可能丢失 |
| 页面意外关闭 | 页面状态完全丢失 | 需要重新导航和设置 |

### 根因分析矩阵

| 缺失项 | 根因 | 影响链 |
|--------|------|--------|
| 标签页系统 | 未实现标签页组件和路由管理，当前为单页面 SPA 模式 | 无法同时打开多个页面，多任务效率低 |
| 标签页状态管理 | 未实现标签页状态 Store，页面状态在切换时丢失 | 返回页面时需要重新设置过滤、滚动等状态 |
| 标签页持久化 | 未实现 sessionStorage 持久化，刷新后无法恢复 | 用户刷新页面后所有标签页丢失 |
| 分屏功能 | 未实现分屏视图组件，无法并排查看 | 对比操作需要两个浏览器窗口 |
| 标签页内存管理 | 未实现非活跃标签页内容卸载 | 大量标签页时内存占用高，页面性能下降 |

---

## 二、设计决策

### 标签页架构选型

| 维度 | 路由驱动标签页 | 组件驱动标签页 | 决策 |
|------|-------------|-------------|------|
| 路由同步 | 标签页与 URL 自动同步 | 需手动管理 URL 更新 | **路由驱动** |
| 浏览器前进/后退 | 自然支持 | 需要额外处理 | **路由驱动** |
| 状态持久化 | 通过路由参数恢复 | 需要自行保存/恢复 | **路由驱动** |
| 灵活性 | 受限于路由结构 | 更灵活，可缓存任意组件 | 折中方案 |

**决策：** 采用路由驱动的标签页方案。每个标签页对应一个路由，标签页切换通过 `router.push` 实现。对于需要在标签页间保持状态的场景（如未保存的表单），使用 `<KeepAlive>` + `include/exclude` 控制缓存。

### 标签页状态模型

| 状态 | 图标 | 描述 | 触发条件 |
|------|------|------|---------|
| active | 蓝色高亮 | 当前显示的标签页 | 用户点击或通过 Ctrl+数字切换 |
| inactive | 默认 | 已打开但未显示的标签页 | 用户切换到其他标签页 |
| dirty | 圆点标记 | 有未保存的更改 | 用户编辑了表单但未保存 |
| loading | 旋转图标 | 内容正在加载中 | 标签页对应的页面数据正在请求 |
| error | 红色图标 | 内容加载失败 | API 请求返回错误 |

### 标签页限制策略

| 策略 | 数值 | 原因 |
|------|------|------|
| 最大标签页数 | 10 | 超过 10 个标签页时标签栏难以管理，且内存占用过高 |
| 超出时的行为 | 提示用户关闭现有标签页 | 引导用户管理标签页，而非静默拒绝 |
| 固定标签页数量 | 最多 3 个 | 固定标签页不受"关闭其他"影响 |
| 分屏最大数量 | 2 个标签页 | 2 栏分屏是最实用的对比场景 |

---

## 三、目标架构

```
┌──────────────────────────────────────────────────────────────────┐
│                      Tab Workspace System                        │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │                    TabBar.vue                             │    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  ◀ ▶  │    │
│  │  │ Tab 1 ● │ │ Tab 2   │ │ Tab 3 * │ │ Tab 4   │  ...   │    │
│  │  │ Project │ │  Issue  │ │  Doc    │ │  File   │        │    │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘        │    │
│  │  ← 水平滚动，overflow 箭头 →                              │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │              TabWorkspace Store (Pinia)                    │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │    │
│  │  │ tabs[]       │  │ activeTabId  │  │ pinnedTabs[]  │  │    │
│  │  │ - id         │  │ - current    │  │ - max 3       │  │    │
│  │  │ - title      │  │ - previous   │  │ - always show │  │    │
│  │  │ - route      │  └──────────────┘  └───────────────┘  │    │
│  │  │ - icon       │                                        │    │
│  │  │ - state      │  ┌──────────────────────────────┐     │    │
│  │  │ - dirty      │  │ TabPersistence (sessionStorage)│     │    │
│  │  │ - pinned     │  │ - save on change              │     │    │
│  │  │ - scrollPos  │  │ - restore on reload           │     │    │
│  │  └──────────────┘  └──────────────────────────────┘     │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │                   Tab Memory Manager                      │    │
│  │  ┌────────────────────────────────────────────────────┐  │    │
│  │  │  Active Tab: Full render + KeepAlive               │  │    │
│  │  │  Recent (last 3): KeepAlive cache                  │  │    │
│  │  │  Other tabs: Unload content, restore on focus      │  │    │
│  │  └────────────────────────────────────────────────────┘  │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │                   SplitView.vue                           │    │
│  │  ┌─────────────────────┐ ┌─────────────────────┐         │    │
│  │  │     Left Panel      │ │     Right Panel     │         │    │
│  │  │     Tab A           │ │     Tab B           │         │    │
│  │  │                     │ │                     │         │    │
│  │  └─────────────────────┘ └─────────────────────┘         │    │
│  │  ← 可拖拽调整分屏比例 →                                    │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 四、具体改动

### 4.1 标签页类型定义

**文件：** `src/components/tab-bar/types.ts`（新增）

```typescript
// 标签页状态
type TabState = 'active' | 'inactive' | 'dirty' | 'loading' | 'error';

// 标签页定义
interface TabDefinition {
  id: string;                    // 唯一标识（通常为路由路径）
  title: string;                 // 标签页标题
  route: {                       // 关联路由
    name: string;
    params?: Record<string, string>;
    query?: Record<string, string>;
  };
  icon?: string;                 // 图标
  state: TabState;               // 当前状态
  pinned: boolean;               // 是否固定
  dirty: boolean;                // 是否有未保存更改
  scrollPosition?: number;       // 滚动位置（用于恢复）
  filterState?: Record<string, any>; // 过滤条件（用于恢复）
  createdAt: number;             // 创建时间戳
  lastAccessedAt: number;        // 最后访问时间戳
}

// 标签页操作
type TabAction =
  | 'close'
  | 'close-others'
  | 'close-all'
  | 'close-to-right'
  | 'pin'
  | 'unpin'
  | 'split-left'
  | 'split-right'
  | 'refresh';
```

### 4.2 标签页状态管理 Store

**文件：** `src/stores/tabWorkspace.ts`（新增）

```typescript
import { defineStore } from 'pinia';
import type { TabDefinition, TabState } from '@/components/tab-bar/types';
import { tabPersistence } from './tabPersistence';

const MAX_TABS = 10;
const MAX_PINNED = 3;

export const useTabWorkspaceStore = defineStore('tabWorkspace', {
  state: () => ({
    tabs: [] as TabDefinition[],
    activeTabId: null as string | null,
    splitMode: false,
    splitTabId: null as string | null,
    splitRatio: 0.5, // 分屏比例，默认 50:50
  }),

  getters: {
    activeTab: (state) => state.tabs.find((t) => t.id === state.activeTabId),
    pinnedTabs: (state) => state.tabs.filter((t) => t.pinned),
    unpinnedTabs: (state) => state.tabs.filter((t) => !t.pinned),
    tabCount: (state) => state.tabs.length,
    isMaxReached: (state) => state.tabs.length >= MAX_TABS,
    splitTab: (state) => state.tabs.find((t) => t.id === state.splitTabId),
  },

  actions: {
    // 打开新标签页
    openTab(tab: Omit<TabDefinition, 'id' | 'state' | 'createdAt' | 'lastAccessedAt'>): string | null {
      const id = this.buildTabId(tab.route);

      // 检查是否已达到最大标签页数
      if (this.tabs.length >= MAX_TABS && !this.tabs.find((t) => t.id === id)) {
        // 返回 null 表示需要提示用户关闭标签页
        return null;
      }

      // 检查是否已存在
      const existing = this.tabs.find((t) => t.id === id);
      if (existing) {
        this.activeTabId = id;
        existing.lastAccessedAt = Date.now();
        existing.state = 'active';
        return id;
      }

      const newTab: TabDefinition = {
        ...tab,
        id,
        state: 'active',
        pinned: false,
        dirty: false,
        createdAt: Date.now(),
        lastAccessedAt: Date.now(),
      };

      this.tabs.push(newTab);
      this.activeTabId = id;
      this.persist();
      return id;
    },

    // 关闭标签页
    closeTab(tabId: string): void {
      const index = this.tabs.findIndex((t) => t.id === tabId);
      if (index === -1) return;

      const tab = this.tabs[index];

      // 如果有未保存更改，需确认
      if (tab.dirty) {
        // 触发确认对话框（由组件处理）
        return;
      }

      this.tabs.splice(index, 1);

      // 如果关闭的是当前标签页，切换到相邻标签页
      if (this.activeTabId === tabId) {
        const newActive = this.tabs[Math.min(index, this.tabs.length - 1)];
        this.activeTabId = newActive?.id ?? null;
      }

      // 如果关闭的是分屏标签页，退出分屏模式
      if (this.splitTabId === tabId) {
        this.splitMode = false;
        this.splitTabId = null;
      }

      this.persist();
    },

    // 关闭其他标签页
    closeOthers(tabId: string): void {
      this.tabs = this.tabs.filter((t) => t.id === tabId || t.pinned);
      this.activeTabId = tabId;
      this.persist();
    },

    // 关闭所有标签页
    closeAll(): void {
      this.tabs = this.tabs.filter((t) => t.pinned);
      this.activeTabId = this.tabs[0]?.id ?? null;
      this.splitMode = false;
      this.splitTabId = null;
      this.persist();
    },

    // 关闭右侧标签页
    closeToRight(tabId: string): void {
      const index = this.tabs.findIndex((t) => t.id === tabId);
      if (index === -1) return;
      this.tabs = this.tabs.filter((t, i) => i <= index || t.pinned);
      this.persist();
    },

    // 固定/取消固定标签页
    togglePin(tabId: string): void {
      const tab = this.tabs.find((t) => t.id === tabId);
      if (!tab) return;

      if (!tab.pinned && this.pinnedTabs.length >= MAX_PINNED) {
        return; // 固定标签页已达上限
      }

      tab.pinned = !tab.pinned;
      this.persist();
    },

    // 拖拽排序
    reorder(fromIndex: number, toIndex: number): void {
      const [moved] = this.tabs.splice(fromIndex, 1);
      this.tabs.splice(toIndex, 0, moved);
      this.persist();
    },

    // 更新标签页状态
    updateTabState(tabId: string, state: Partial<TabDefinition>): void {
      const tab = this.tabs.find((t) => t.id === tabId);
      if (tab) Object.assign(tab, state);
      this.persist();
    },

    // 进入分屏模式
    enterSplitMode(tabId: string): void {
      this.splitMode = true;
      this.splitTabId = tabId;
    },

    // 退出分屏模式
    exitSplitMode(): void {
      this.splitMode = false;
      this.splitTabId = null;
    },

    // 持久化
    persist(): void {
      tabPersistence.save({
        tabs: this.tabs,
        activeTabId: this.activeTabId,
      });
    },

    // 从持久化恢复
    restore(): void {
      const saved = tabPersistence.load();
      if (saved) {
        this.tabs = saved.tabs;
        this.activeTabId = saved.activeTabId;
      }
    },

    // 构建标签页 ID
    buildTabId(route: { name: string; params?: Record<string, string> }): string {
      const paramStr = route.params
        ? Object.entries(route.params)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([k, v]) => `${k}=${v}`)
            .join('&')
        : '';
      return paramStr ? `${route.name}?${paramStr}` : route.name;
    },
  },
});
```

### 4.3 标签页持久化

**文件：** `src/stores/tabPersistence.ts`（新增）

```typescript
const STORAGE_KEY = 'yivad-tab-workspace';

interface PersistedTabState {
  tabs: Array<{
    id: string;
    title: string;
    route: { name: string; params?: Record<string, string>; query?: Record<string, string> };
    pinned: boolean;
    scrollPosition?: number;
  }>;
  activeTabId: string | null;
}

export const tabPersistence = {
  save(state: PersistedTabState): void {
    try {
      // 仅持久化必要字段，不保存 dirty/loading 等瞬时状态
      const slim = {
        tabs: state.tabs.map((t) => ({
          id: t.id,
          title: t.title,
          route: t.route,
          pinned: t.pinned,
          scrollPosition: t.scrollPosition,
        })),
        activeTabId: state.activeTabId,
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(slim));
    } catch (e) {
      console.warn('[TabPersistence] Failed to save tab state:', e);
    }
  },

  load(): PersistedTabState | null {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.warn('[TabPersistence] Failed to load tab state:', e);
      return null;
    }
  },

  clear(): void {
    sessionStorage.removeItem(STORAGE_KEY);
  },
};
```

### 4.4 标签页内存管理

**文件：** `src/composables/useTabMemory.ts`（新增）

```typescript
import { ref, watch, type Ref } from 'vue';

/**
 * 管理标签页的 KeepAlive 缓存策略
 * - 活跃标签页：完整渲染
 * - 最近 3 个标签页：保持缓存
 * - 其他标签页：卸载内容，恢复时重新渲染
 */
export function useTabMemory(tabIds: Ref<string[]>, activeTabId: Ref<string | null>) {
  const cachedTabs = ref<string[]>([]);

  function updateCache() {
    const active = activeTabId.value;
    if (!active) {
      cachedTabs.value = [];
      return;
    }

    // 缓存：活跃标签页 + 最近访问的 2 个标签页
    const recent = tabIds.value
      .filter((id) => id !== active)
      .slice(-2);

    cachedTabs.value = [active, ...recent];
  }

  watch([tabIds, activeTabId], updateCache, { immediate: true });

  return {
    cachedTabs, // 传递给 <KeepAlive :include="cachedTabs">
  };
}
```

### 4.5 标签页拖拽排序

**文件：** `src/composables/useTabDrag.ts`（新增）

```typescript
import { ref, type Ref } from 'vue';

export function useTabDrag(
  tabIds: Ref<string[]>,
  onReorder: (fromIndex: number, toIndex: number) => void
) {
  const dragIndex = ref<number | null>(null);
  const dragOverIndex = ref<number | null>(null);

  function onDragStart(index: number, event: DragEvent) {
    dragIndex.value = index;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', tabIds.value[index]);
    }
  }

  function onDragOver(index: number, event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    dragOverIndex.value = index;
  }

  function onDrop(index: number, _event: DragEvent) {
    if (dragIndex.value !== null && dragIndex.value !== index) {
      onReorder(dragIndex.value, index);
    }
    dragIndex.value = null;
    dragOverIndex.value = null;
  }

  function onDragEnd() {
    dragIndex.value = null;
    dragOverIndex.value = null;
  }

  return {
    dragIndex,
    dragOverIndex,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
  };
}
```

### 4.6 分屏视图组件

**文件：** `src/components/tab-bar/SplitView.vue`（新增）

核心功能：
- 左右两栏布局，中间可拖拽调整比例
- 每栏独立渲染一个标签页内容
- 支持单独关闭任一栏（退出分屏模式）
- 拖拽分隔线时显示半透明指示线
- 最小宽度限制：每栏不小于 320px
- 分屏比例持久化到 localStorage

### 4.7 标签页右键菜单

**文件：** `src/components/tab-bar/TabContextMenu.vue`（新增）

复用 42-右键菜单系统，提供标签页专用菜单项：
- 关闭 (Close)
- 关闭其他 (Close Others)
- 关闭右侧 (Close to Right)
- 关闭所有 (Close All)
- 分隔线
- 固定/取消固定 (Pin/Unpin)
- 分隔线
- 在左侧分屏 (Split Left)
- 在右侧分屏 (Split Right)
- 分隔线
- 刷新 (Refresh)

---

## 五、实施步骤

| 步骤 | 任务 | 产出 | 验证方式 | 人天 |
|------|------|------|----------|------|
| 1 | 定义标签页类型接口 | `types.ts` | TypeScript 类型检查通过 | 0.03 |
| 2 | 实现标签页状态管理 Store | `tabWorkspace.ts` | 打开/关闭/切换标签页正常 | 0.12 |
| 3 | 实现标签页持久化 | `tabPersistence.ts` | 刷新页面后标签页恢复 | 0.06 |
| 4 | 实现 TabBar 标签栏组件 | `TabBar.vue` | 标签页横向排列，overflow 箭头显示 | 0.12 |
| 5 | 实现 TabItem 标签项组件 | `TabItem.vue` | 5 种状态正确渲染 | 0.08 |
| 6 | 实现标签页拖拽排序 | `useTabDrag.ts` | 拖拽标签页可重新排序 | 0.08 |
| 7 | 实现标签页右键菜单 | `TabContextMenu.vue` | 右键菜单项完整，功能正常 | 0.06 |
| 8 | 实现标签页内存管理 | `useTabMemory.ts` | 非活跃标签页内容卸载，切换时恢复 | 0.08 |
| 9 | 实现分屏视图组件 | `SplitView.vue` | 两栏并排显示，比例可拖拽调整 | 0.12 |
| 10 | 修改路由配置支持标签页模式 | `router/index.ts` | 路由切换时自动打开/切换标签页 | 0.10 |
| 11 | 集成 Ctrl+Click 和中间点击打开新标签页 | `TabBar.vue` + 路由配置 | Ctrl+Click 链接在新标签页打开 | 0.05 |
| 12 | 标签页限制提示 | `TabBar.vue` | 超过 10 个标签页时提示用户 | 0.03 |
| 13 | 全局布局集成标签栏 | 修改 `AppLayout.vue` | 标签栏在页面顶部显示 | 0.04 |
| 14 | 组件测试 + 端到端验证 | 测试文件 | 6 个测试场景通过 | 0.03 |

**总计：** 1.0d

---

## 六、测试规格

### Scenario 1: 打开新标签页
- **GIVEN** 用户在项目列表页面，当前有 2 个标签页
- **WHEN** 用户点击项目"Platform"的详情链接
- **THEN** 标签栏新增第 3 个标签页"Platform"，自动切换到该标签页，页面显示项目详情

### Scenario 2: 关闭标签页
- **GIVEN** 用户有 3 个标签页，当前在第 2 个标签页
- **WHEN** 用户点击第 2 个标签页的关闭按钮
- **THEN** 第 2 个标签页关闭，自动切换到第 3 个标签页（或第 1 个，如果第 3 个不存在）

### Scenario 3: 标签页拖拽排序
- **GIVEN** 标签栏有 4 个标签页：[项目A, IssueB, 文档C, 文件D]
- **WHEN** 用户拖拽"文档C"到"项目A"之前
- **THEN** 标签页顺序变为：[文档C, 项目A, IssueB, 文件D]

### Scenario 4: 标签页持久化恢复
- **GIVEN** 用户有 3 个标签页，当前在"文档C"标签页
- **WHEN** 用户刷新页面（F5）
- **THEN** 页面加载后，标签栏仍显示 3 个标签页，当前仍为"文档C"标签页

### Scenario 5: 分屏视图
- **GIVEN** 用户有标签页 A 和标签页 B
- **WHEN** 用户在标签页 B 上右键选择"在右侧分屏"
- **THEN** 页面分为左右两栏，左栏显示标签页 A，右栏显示标签页 B；中间分隔线可拖拽调整比例

### Scenario 6: 标签页上限提示
- **GIVEN** 用户已打开 10 个标签页（达到上限）
- **WHEN** 用户尝试打开第 11 个标签页
- **THEN** 弹出提示"已达到最大标签页数量 (10)，请关闭部分标签页后再试"，不打开新标签页

---

## 七、风险与缓解

| 风险 | 概率 | 影响 | 等级 | 缓解措施 | 应急预案 |
|------|------|------|------|----------|----------|
| 标签页过多导致浏览器内存不足 | 中 | 高 | 高 | 限制最大 10 个标签页；非活跃标签页卸载内容；使用 KeepAlive 仅缓存最近 3 个 | 降低最大标签页数至 8 |
| 标签页路由与面包屑导航冲突 | 中 | 中 | 中 | 面包屑导航与标签页同步更新，标签页切换时更新面包屑 | 标签页模式和面包屑模式二选一 |
| 分屏视图下组件状态冲突 | 中 | 中 | 中 | 同一组件在分屏中创建两个独立实例，使用不同的 key 隔离 | 同一组件不允许在两个分屏中同时打开 |
| sessionStorage 容量不足 | 低 | 低 | 低 | 仅持久化必要字段（路由信息），不保存完整状态 | 降级为无持久化 |
| 标签页拖拽与浏览器默认拖拽行为冲突 | 低 | 低 | 低 | 使用 `preventDefault` 阻止浏览器默认行为 | 禁用拖拽排序，使用右键菜单排序 |

---

## 八、回滚策略

| 回滚场景 | 回滚方式 | 影响范围 | 恢复时间 |
|----------|----------|----------|----------|
| 标签页系统导致页面崩溃 | 在布局中移除 `<TabBar>` 组件，恢复单页面模式 | 所有页面 | < 5min |
| 标签页持久化数据损坏 | 清除 sessionStorage 中 `yivad-tab-workspace` key | 标签页恢复 | < 1min |
| 分屏视图布局异常 | 禁用分屏功能，移除 SplitView 组件 | 分屏功能 | < 2min |
| 内存管理导致页面闪烁 | 扩大 KeepAlive 缓存范围至所有标签页 | 标签页内容 | < 3min |

**回滚验证：**
- 回滚后页面恢复单页面模式，侧边栏导航正常
- 回滚后无 console 错误
- 回滚后 `pnpm build` 构建成功

---

## 九、设计决策记录

### D-01: 使用路由驱动而非组件驱动的标签页

**背景：** 标签页可以通过路由驱动（每个标签页是一个路由）或组件驱动（标签页管理组件实例）。
**决策：** 使用路由驱动方案，标签页切换通过 `router.push` 实现。
**权衡：** 路由驱动与浏览器前进/后退按钮自然兼容，URL 可分享，但灵活性略低于组件驱动。
**后果：** 某些场景（如多个相同类型的详情页）需要不同的路由参数区分。同一类型页面在标签页中打开多次时需要不同的 key。

### D-02: 标签页上限设为 10 个

**背景：** 需要限制标签页数量以防止内存溢出和标签栏溢出。
**决策：** 最大 10 个标签页，超过时提示用户关闭部分标签页。
**权衡：** 10 个标签页在 1920px 宽屏幕上可勉强显示（每个标签页约 180px），同时满足大多数多任务场景需求。
**后果：** 如果用户需要同时打开超过 10 个页面，需要通过浏览器标签页辅助。后续可根据用户反馈调整。

### D-03: 使用 sessionStorage 而非 localStorage 持久化

**背景：** 标签页状态需要在页面刷新后恢复，但不需要跨会话保留。
**决策：** 使用 sessionStorage，页面刷新后恢复，关闭浏览器标签页后自动清除。
**权衡：** 用户关闭浏览器标签页后标签页状态丢失，但避免了跨会话的陈旧标签页堆积。
**后果：** 如果用户期望跨会话保留标签页，后续可考虑升级为 localStorage + 时间戳过期策略。

### D-04: KeepAlive 仅缓存最近 3 个标签页

**背景：** KeepAlive 缓存所有标签页会消耗大量内存。
**决策：** 仅缓存活跃标签页 + 最近访问的 2 个标签页（共 3 个），其他标签页切换时重新渲染。
**权衡：** 切换到非缓存标签页时会有短暂加载时间，但大幅降低了内存占用。
**后果：** 需要确保页面组件在重新渲染时能正确恢复状态（通过路由参数和持久化状态）。

---

## 十、可观测性

### 关键指标

| 指标 | 采集方式 | 告警阈值 | 说明 |
|------|---------|---------|------|
| 平均标签页数量 | Store 快照统计 | > 8 | 用户是否接近上限，是否需要调整上限 |
| 标签页上限触发率 | 自定义事件埋点 | > 10% | 用户经常被限制，需要提高上限 |
| 分屏使用率 | 自定义事件埋点 | -- | 分屏功能的使用频率 |
| 标签页拖拽使用率 | 自定义事件埋点 | -- | 拖拽排序的使用频率 |
| 标签页恢复成功率 | sessionStorage 恢复统计 | < 95% | 持久化恢复是否可靠 |
| 内存峰值 | `performance.memory` 统计 | > 200MB | 标签页内存占用是否过高 |

### 日志规范

| 日志级别 | 场景 | 示例 |
|---------|------|------|
| `DEBUG` | 标签页操作 | `[TabWorkspace] Opened tab: project-detail?key=PL` |
| `INFO` | 标签页上限 | `[TabWorkspace] Max tabs reached (10), rejected new tab` |
| `WARN` | 持久化失败 | `[TabPersistence] Failed to save: quota exceeded` |
| `ERROR` | 标签页恢复失败 | `[TabPersistence] Corrupted data, cleared storage` |

---

## 十一、代码审查检查清单

- [ ] `types.ts` 中 TabDefinition、TabState、TabAction 类型完整
- [ ] `tabWorkspace.ts` Store 中所有 action 实现正确（open/close/closeOthers/closeAll/closeToRight/togglePin/reorder）
- [ ] `tabPersistence.ts` 保存/恢复逻辑正确，sessionStorage 异常处理完善
- [ ] `TabBar.vue` 水平滚动功能正常，overflow 箭头在合适时机显示
- [ ] `TabItem.vue` 5 种状态（active/inactive/dirty/loading/error）正确渲染
- [ ] `useTabDrag.ts` 拖拽排序功能正常，与浏览器默认拖拽不冲突
- [ ] `TabContextMenu.vue` 菜单项完整，功能正常，复用 ContextMenu 组件
- [ ] `useTabMemory.ts` KeepAlive 缓存策略正确，非缓存标签页切换时重新渲染
- [ ] `SplitView.vue` 分屏比例可拖拽，最小宽度 320px 限制生效
- [ ] 标签页上限提示在达到 10 个时正确触发
- [ ] Ctrl+Click 和中间点击链接在新标签页打开
- [ ] 页面刷新后标签页正确恢复
- [ ] `vue-tsc --noEmit` 类型检查通过

---

## 回归问题预测

| # | 问题 | 预测场景 | 根因 | 预防措施 |
|---|------|---------|------|---------|
| 1 | 标签页切换后滚动位置丢失 | 用户在标签页 A 滚动到页面中间，切换到标签页 B 再切回 A，页面回到顶部 | 未保存和恢复滚动位置 | 在 Store 中保存每个标签页的 scrollPosition，切换时恢复 |
| 2 | 分屏视图中同一路由组件状态串扰 | 分屏中两个面板使用同一个路由组件，一个面板的操作影响另一个 | 两个组件实例共享同一 Pinia Store 状态 | 分屏组件使用不同的 key 和独立的 Store scope |
| 3 | 标签页关闭后 KeepAlive 缓存未清理 | 关闭标签页后，其组件实例仍缓存在 KeepAlive 中 | KeepAlive include 列表未及时更新 | 关闭标签页时同步从 include 中移除 |
| 4 | 标签页拖拽时 Drop 位置计算错误 | 拖拽标签页到目标位置后，插入位置偏移 | 拖拽指示线位置计算不准确 | 使用 `dragOverIndex` 计算插入位置，考虑拖拽方向 |
| 5 | 标签页持久化恢复时路由参数丢失 | 恢复的标签页路由参数（如项目 key）不完整 | 持久化时未保存完整的路由参数 | 持久化时保存完整的 route.name + route.params + route.query |
| 6 | 标签页过多时标签栏 UI 溢出 | 10 个标签页在 1366px 屏幕上无法完全显示 | 标签项最小宽度不足，标签栏无滚动 | 设置标签项最小宽度 120px，超出时显示水平滚动箭头 |

---

## 性能分析

### 标签页操作性能

| 操作 | 耗时 | 说明 |
|------|------|------|
| 打开新标签页 | < 100ms | 路由跳转 + 组件渲染 |
| 切换标签页（已缓存） | < 50ms | KeepAlive 激活，无重新渲染 |
| 切换标签页（未缓存） | < 200ms | 组件重新渲染 + 数据请求 |
| 关闭标签页 | < 30ms | Store 更新 + KeepAlive 清理 |
| 拖拽排序 | < 20ms | Store 数组重排 |
| 分屏切换 | < 150ms | 布局切换 + 第二个组件渲染 |

### 内存占用

| 场景 | 内存占用 | 说明 |
|------|---------|------|
| 1 个标签页 | ~30MB | 基准 |
| 3 个标签页（全部缓存） | ~50MB | 3 个组件实例缓存 |
| 5 个标签页（3 个缓存） | ~55MB | 非缓存标签页内容已卸载 |
| 10 个标签页（3 个缓存） | ~60MB | 内存管理有效 |
| 分屏模式（2 个标签页） | ~55MB | 两个组件实例同时渲染 |

### 标签栏渲染性能

| 标签页数量 | 标签栏宽度 | 渲染时间 | 说明 |
|----------|----------|---------|------|
| 1-3 个 | 自适应 | < 5ms | 标签项宽度充足 |
| 4-7 个 | 自适应 | < 8ms | 标签项开始压缩 |
| 8-10 个 | 需要滚动 | < 10ms | 水平滚动激活 |

---

## 补充：单元测试用例

### UT-MT01: useTabs

| # | 测试场景 | 输入 | 期望结果 |
|---|---------|------|---------|
| 1 | 打开标签 | 访问新路由 | tabs 新增一项 |
| 2 | 关闭标签 | 点击关闭按钮 | tabs 移除，自动切换到相邻标签 |
| 3 | 右键菜单 | 右键标签 | 关闭/关闭其他/关闭右侧 |
| 4 | 标签持久化 | 刷新页面 | 标签列表从 localStorage 恢复 |
| 5 | 重复打开 | 访问已存在的标签 | 切换到已有标签 |
| 6 | 标签溢出 | 打开 10+ 标签 | 水平滚动，左右箭头显示 |

## 补充：实例演示页面

### Demo-MT01: 多标签页工作区演示
展示标签页管理：打开/关闭/切换/右键菜单/拖拽排序/持久化恢复。配合面包屑导航展示完整导航体系。

---

