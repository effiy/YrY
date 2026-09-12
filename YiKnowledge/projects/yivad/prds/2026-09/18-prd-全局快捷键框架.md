---
title: 全局快捷键框架
tags:
- 快捷键
- 键盘导航
- 无障碍
- 生产力
- 基础设施
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
prd_task_id: YV-09-43
estimate_frontend: 0.5
review_status: 待评审
issue_type: 功能
roles:
- engineer
- qa
source_okr: [yivad-003]
---

# 全局快捷键框架

> 需求编号：YV-09-43 · 优先级：P2 · 人天：0.5d
> 依赖：无（纯前端基础设施，独立实现）

## 改动总览

| 改动点 | 类型 | 涉及文件 |
|--------|------|---------|
| useKeyboardShortcuts Composable | 新增 | `src/composables/useKeyboardShortcuts.ts` |
| 快捷键注册表 | 新增 | `src/shortcuts/registry.ts` |
| 快捷键冲突检测 | 新增 | `src/shortcuts/conflict-detector.ts` |
| 快捷键覆盖层组件 | 新增 | `src/components/ShortcutOverlay.vue` |
| 快捷键设置页面 | 新增 | `src/views/settings/ShortcutSettings.vue` |
| 快捷键分类定义 | 新增 | `src/shortcuts/categories.ts` |
| 标准化快捷键配置 | 新增 | `src/shortcuts/defaults.ts` |
| 快捷键使用分析 | 新增 | `src/shortcuts/analytics.ts` |

## 涉及文件

```
YiVad/
└── src/
    ├── composables/
    │   └── useKeyboardShortcuts.ts          # 新增：快捷键注册/监听 Composable
    ├── shortcuts/
    │   ├── registry.ts                      # 新增：全局快捷键注册表
    │   ├── conflict-detector.ts             # 新增：冲突检测引擎
    │   ├── categories.ts                    # 新增：快捷键分类定义
    │   ├── defaults.ts                      # 新增：标准化快捷键配置
    │   └── analytics.ts                     # 新增：快捷键使用分析
    ├── components/
    │   └── ShortcutOverlay.vue              # 新增：快捷键帮助覆盖层
    └── views/
        └── settings/
            └── ShortcutSettings.vue         # 新增：快捷键自定义设置页面
```

## 基本信息

| 字段 | 值 |
|------|-----|
| 需求编号 | YV-09-43 |
| 模块 | 全局基础设施 |
| 优先级 | **P2**（提升键盘操作效率，非阻塞） |
| 前端人天 | 0.5d |
| 后端人天 | -- |
| 依赖 | 无 |

---

## 背景

YiVad 作为管理后台，用户需要频繁执行重复操作（保存、搜索、切换页面、新建项目等）。当前所有操作依赖鼠标点击，键盘用户和高级用户无法通过快捷键快速完成任务，操作效率低。同时，快捷键系统的缺失也影响无障碍合规（WCAG 2.1 要求键盘可操作性）。

**核心问题：**

| # | 问题 | 严重程度 | 影响 |
|---|------|----------|------|
| 1 | **无快捷键体系** -- 所有操作仅能通过鼠标完成 | **中** | 高级用户无法通过键盘快速操作，每日重复操作累计浪费 15-20 分钟 |
| 2 | **快捷键冲突风险** -- 无统一注册机制，组件各自绑定键盘事件 | **中** | 未来多组件绑定同一快捷键时行为不可预测 |
| 3 | **快捷键不可发现** -- 用户不知道有哪些快捷键可用 | **中** | 用户无法学习和使用快捷键，功能利用率低 |
| 4 | **无快捷键自定义** -- 用户无法根据个人习惯修改快捷键 | **低** | 不同编辑器/IDE 背景的用户需要适应固定快捷键 |
| 5 | **无作用域隔离** -- 输入框内编辑时快捷键误触发 | **中** | 在 input 中按 Ctrl+S 可能触发页面保存而非浏览器保存 |

## 一、现状分析

### 当前键盘事件处理方式

| 场景 | 当前行为 | 问题 |
|------|---------|------|
| 全局键盘事件 | 各组件通过 `@keydown` 自行绑定 | 分散在各处，无统一管理，易冲突 |
| 输入框内快捷键 | 组件自行判断 `event.target` 是否为 input | 判断逻辑分散，不一致，易遗漏 |
| 快捷键冲突 | 无检测 | 两个组件绑定同一快捷键时，行为不可预测 |
| 快捷键发现 | 无 | 用户不知道快捷键存在 |
| 快捷键自定义 | 无 | 用户无法根据自己的习惯修改 |

### 根因分析矩阵

| 缺失项 | 根因 | 影响链 |
|--------|------|--------|
| 统一注册机制 | 未构建快捷键注册表，各组件独立绑定事件 | 快捷键分散在各组件中，难以管理和发现冲突 |
| 作用域管理 | 未定义快捷键作用域（global/page/component/input） | 输入框内快捷键误触发，全局快捷键干扰输入 |
| 发现性 | 未提供快捷键帮助界面 | 用户不知道存在哪些快捷键，靠口口相传 |
| 自定义能力 | 未提供快捷键设置页面和持久化 | 用户无法根据习惯调整快捷键 |
| 序列快捷键 | 未实现按键序列检测 | 无法实现类似 Vim 的多键组合快捷键 |

---

## 二、设计决策

### 快捷键注册方式选型

| 维度 | 全局注册表 | 组件内声明式 | 决策 |
|------|----------|-----------|------|
| 冲突检测 | 注册时自动检测 | 需手动检查 | **全局注册表** |
| 统一管理 | 集中管理，易于审计 | 分散在各组件中 | **全局注册表** |
| 动态启用/禁用 | 根据作用域自动切换 | 组件需自行处理 | **全局注册表** |
| 自定义支持 | 用户修改后统一更新 | 需通知各组件 | **全局注册表** |
| 开发体验 | 需要额外注册步骤 | 在组件内直接声明，更直观 | 折中方案 |

**决策：** 采用全局注册表 + Composable 声明式 API。组件通过 `useKeyboardShortcuts()` 声明快捷键，底层由全局注册表统一管理冲突检测、作用域过滤和事件分发。

### 快捷键作用域设计

| 作用域 | 优先级 | 描述 | 示例 |
|--------|--------|------|------|
| `input` | 1 (最高) | 仅在输入框内有效 | Ctrl+B 加粗（编辑器内） |
| `component` | 2 | 仅在特定组件聚焦时有效 | Space 切换选中（表格行） |
| `page` | 3 | 仅在特定页面内有效 | Ctrl+N 新建项目（项目列表页） |
| `global` | 4 (最低) | 全局有效 | Ctrl+K 命令面板，? 快捷键帮助 |

**作用域合并规则：** 当多个作用域注册了同一快捷键时，高优先级作用域覆盖低优先级。同作用域内的冲突通过 warning 提示。

### 快捷键分类

| 分类 | 描述 | 典型快捷键 |
|------|------|----------|
| navigation | 页面导航 | Ctrl+1~9 切换标签页，G then I 前往 Issues |
| editing | 编辑操作 | Ctrl+S 保存，Ctrl+Z 撤销，F2 重命名 |
| view | 视图切换 | Ctrl+Shift+G 切换网格/列表视图 |
| tools | 工具操作 | Ctrl+K 命令面板，Ctrl+F 搜索 |
| accessibility | 无障碍 | ? 快捷键帮助，Ctrl+Shift+H 高对比度模式 |

---

## 三、目标架构

```
┌──────────────────────────────────────────────────────────────────┐
│                    Global Shortcut Framework                     │
│                                                                  │
│  ┌──────────────────────────────────────────────────────┐        │
│  │              Shortcut Registry (registry.ts)          │        │
│  │  ┌────────────┐  ┌────────────┐  ┌───────────────┐  │        │
│  │  │ Register   │  │ Unregister │  │ Conflict      │  │        │
│  │  │ shortcut   │  │ shortcut   │  │ Detection     │  │        │
│  │  └────────────┘  └────────────┘  └───────────────┘  │        │
│  │  ┌────────────────────────────────────────────────┐  │        │
│  │  │          Scope Manager                         │  │        │
│  │  │  input > component > page > global (priority)  │  │        │
│  │  └────────────────────────────────────────────────┘  │        │
│  │  ┌────────────────────────────────────────────────┐  │        │
│  │  │          Sequence Detector                      │  │        │
│  │  │  "G then I" → Go to Issues                     │  │        │
│  │  │  Timeout: 1000ms between keys                   │  │        │
│  │  └────────────────────────────────────────────────┘  │        │
│  └──────────────────────────────────────────────────────┘        │
│                                                                  │
│  ┌───────────────────────┐    ┌──────────────────────────────┐   │
│  │  useKeyboardShortcuts │    │  Default Shortcuts           │   │
│  │  (Composable)         │    │  (defaults.ts)               │   │
│  │  - register(shortcut) │    │  - Ctrl+S: Save              │   │
│  │  - unregister(id)     │    │  - Ctrl+Z/Y: Undo/Redo       │   │
│  │  - isEnabled(id)      │    │  - Ctrl+F: Search            │   │
│  │  - scope: Ref<Scope>  │    │  - Ctrl+K: Command Palette   │   │
│  └───────────────────────┘    │  - Ctrl+P: Print             │   │
│                               │  - Ctrl+Shift+N: New Item    │   │
│  ┌───────────────────────┐    │  - Escape: Close/Dismiss     │   │
│  │  ShortcutOverlay.vue  │    │  - F2: Rename                │   │
│  │  (? key triggers)     │    │  - Delete: Delete Selected   │   │
│  │  - 分组显示           │    │  - ?: Shortcut Overlay       │   │
│  │  - 搜索过滤           │    │  - G then I: Go to Issues    │   │
│  │  - 点击执行           │    └──────────────────────────────┘   │
│  └───────────────────────┘                                       │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  ShortcutSettings.vue (Settings Page)                    │    │
│  │  - 分组列表显示所有快捷键                                  │    │
│  │  - 点击快捷键进入编辑模式（键盘录制）                        │    │
│  │  - 冲突实时提示                                           │    │
│  │  - 重置为默认值                                           │    │
│  │  - 持久化到 localStorage                                  │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  Analytics (analytics.ts)                                │    │
│  │  - 快捷键使用频率统计                                      │    │
│  │  - 未使用快捷键列表（可能需要优化发现性）                     │    │
│  │  - 用户自定义快捷键比例                                    │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 四、具体改动

### 4.1 快捷键注册表

**文件：** `src/shortcuts/registry.ts`（新增）

```typescript
interface ShortcutDefinition {
  id: string;                    // 唯一标识，如 "global.save"
  keys: string;                  // 快捷键组合，如 "Ctrl+S"
  description: string;           // 描述，如 "保存当前内容"
  category: ShortcutCategory;    // 分类
  scope: ShortcutScope;          // 作用域
  handler: (event: KeyboardEvent) => void;
  enabled?: boolean;             // 是否启用（默认 true）
  sequence?: string[];           // 序列快捷键，如 ["G", "I"]
  sequenceTimeout?: number;      // 序列超时时间（默认 1000ms）
}

type ShortcutScope = 'global' | 'page' | 'component' | 'input';
type ShortcutCategory = 'navigation' | 'editing' | 'view' | 'tools' | 'accessibility';

class ShortcutRegistry {
  private shortcuts: Map<string, ShortcutDefinition> = new Map();
  private sequenceBuffer: { keys: string[]; timestamp: number }[] = [];
  private modalOpen = false;

  // 注册快捷键
  register(shortcut: ShortcutDefinition): void {
    // 冲突检测
    const existing = this.findConflict(shortcut);
    if (existing) {
      console.warn(
        `[Shortcut] Conflict: "${shortcut.id}" (${shortcut.keys}) ` +
        `conflicts with "${existing.id}" (${existing.keys})`
      );
    }
    this.shortcuts.set(shortcut.id, shortcut);
  }

  // 注销快捷键
  unregister(id: string): void {
    this.shortcuts.delete(id);
  }

  // 冲突检测
  private findConflict(shortcut: ShortcutDefinition): ShortcutDefinition | null {
    for (const [, existing] of this.shortcuts) {
      if (
        existing.keys === shortcut.keys &&
        existing.scope === shortcut.scope &&
        existing.id !== shortcut.id
      ) {
        return existing;
      }
    }
    return null;
  }

  // 全局键盘事件处理
  handleKeydown(event: KeyboardEvent): void {
    // 模态框打开时禁用全局快捷键（Escape 除外）
    if (this.modalOpen && event.key !== 'Escape') return;

    // 序列快捷键检测
    if (this.sequenceBuffer.length > 0) {
      this.handleSequence(event);
      return;
    }

    const keyString = this.buildKeyString(event);
    const matched = this.findMatchedShortcuts(keyString);

    if (matched.length > 0) {
      // 按作用域优先级排序，取最高优先级
      const best = this.resolveByScope(matched);
      event.preventDefault();
      best.handler(event);
    }
  }

  // 构建快捷键字符串
  private buildKeyString(event: KeyboardEvent): string {
    const parts: string[] = [];
    if (event.ctrlKey) parts.push('Ctrl');
    if (event.shiftKey) parts.push('Shift');
    if (event.altKey) parts.push('Alt');
    if (event.metaKey) parts.push('Meta');
    parts.push(event.key.length === 1 ? event.key.toUpperCase() : event.key);
    return parts.join('+');
  }

  // 按作用域优先级解析
  private resolveByScope(matched: ShortcutDefinition[]): ShortcutDefinition {
    const scopeOrder = { input: 0, component: 1, page: 2, global: 3 };
    return matched.sort((a, b) => scopeOrder[a.scope] - scopeOrder[b.scope])[0];
  }

  // 设置模态框状态
  setModalOpen(open: boolean): void {
    this.modalOpen = open;
  }
}

export const shortcutRegistry = new ShortcutRegistry();
```

### 4.2 useKeyboardShortcuts Composable

**文件：** `src/composables/useKeyboardShortcuts.ts`（新增）

```typescript
import { onMounted, onUnmounted, watch, ref, type Ref } from 'vue';
import { shortcutRegistry } from '@/shortcuts/registry';
import type { ShortcutDefinition, ShortcutScope } from '@/shortcuts/registry';

interface UseKeyboardShortcutsOptions {
  scope: Ref<ShortcutScope> | ShortcutScope;
  enabled?: Ref<boolean> | boolean;
}

export function useKeyboardShortcuts(
  shortcuts: Omit<ShortcutDefinition, 'scope'>[],
  options: UseKeyboardShortcutsOptions
) {
  const scope = ref(typeof options.scope === 'string' ? options.scope : options.scope.value);
  const isEnabled = ref(typeof options.enabled === 'boolean' ? options.enabled : options.enabled?.value ?? true);

  // 注册所有快捷键
  function registerAll() {
    shortcuts.forEach((s) => {
      shortcutRegistry.register({
        ...s,
        scope: scope.value,
        handler: (event) => {
          if (!isEnabled.value) return;
          s.handler(event);
        },
      });
    });
  }

  // 注销所有快捷键
  function unregisterAll() {
    shortcuts.forEach((s) => {
      shortcutRegistry.unregister(s.id);
    });
  }

  onMounted(() => registerAll());
  onUnmounted(() => unregisterAll());

  // 作用域变化时重新注册
  if (typeof options.scope !== 'string') {
    watch(options.scope, () => {
      unregisterAll();
      scope.value = options.scope.value;
      registerAll();
    });
  }

  return {
    isEnabled,
  };
}
```

### 4.3 标准化快捷键配置

**文件：** `src/shortcuts/defaults.ts`（新增）

```typescript
import type { ShortcutDefinition } from './registry';

export const defaultShortcuts: Omit<ShortcutDefinition, 'scope'>[] = [
  // === Navigation ===
  {
    id: 'nav.command-palette',
    keys: 'Ctrl+K',
    description: '打开命令面板',
    category: 'navigation',
    handler: () => { /* 打开命令面板 */ },
  },
  {
    id: 'nav.go-to-issues',
    keys: '', // 序列快捷键，无直接按键
    description: '前往 Issues 页面',
    category: 'navigation',
    sequence: ['G', 'I'],
    handler: () => { /* 导航到 Issues */ },
  },
  {
    id: 'nav.go-to-projects',
    keys: '',
    description: '前往项目列表',
    category: 'navigation',
    sequence: ['G', 'P'],
    handler: () => { /* 导航到项目列表 */ },
  },

  // === Editing ===
  {
    id: 'edit.save',
    keys: 'Ctrl+S',
    description: '保存当前内容',
    category: 'editing',
    handler: () => { /* 触发保存 */ },
  },
  {
    id: 'edit.undo',
    keys: 'Ctrl+Z',
    description: '撤销',
    category: 'editing',
    handler: () => { /* 触发撤销 */ },
  },
  {
    id: 'edit.redo',
    keys: 'Ctrl+Y',
    description: '重做',
    category: 'editing',
    handler: () => { /* 触发重做 */ },
  },
  {
    id: 'edit.rename',
    keys: 'F2',
    description: '重命名选中项',
    category: 'editing',
    handler: () => { /* 触发重命名 */ },
  },
  {
    id: 'edit.delete',
    keys: 'Delete',
    description: '删除选中项',
    category: 'editing',
    handler: () => { /* 触发删除确认 */ },
  },

  // === View ===
  {
    id: 'view.search',
    keys: 'Ctrl+F',
    description: '搜索',
    category: 'view',
    handler: () => { /* 聚焦搜索框 */ },
  },
  {
    id: 'view.print',
    keys: 'Ctrl+P',
    description: '打印',
    category: 'view',
    handler: () => { /* 触发打印 */ },
  },

  // === Tools ===
  {
    id: 'tools.new-item',
    keys: 'Ctrl+Shift+N',
    description: '新建项目',
    category: 'tools',
    handler: () => { /* 打开新建对话框 */ },
  },

  // === Accessibility ===
  {
    id: 'a11y.shortcut-help',
    keys: '?',
    description: '显示快捷键帮助',
    category: 'accessibility',
    handler: () => { /* 打开快捷键覆盖层 */ },
  },
  {
    id: 'a11y.close-dismiss',
    keys: 'Escape',
    description: '关闭/取消',
    category: 'accessibility',
    handler: () => { /* 关闭当前对话框 */ },
  },
];
```

### 4.4 快捷键覆盖层组件

**文件：** `src/components/ShortcutOverlay.vue`（新增）

核心功能：
- 按 `?` 键触发，显示半透明遮罩 + 快捷键列表
- 按分类分组（navigation/editing/view/tools/accessibility）
- 支持搜索过滤（输入关键字实时过滤）
- 点击任意快捷键可直接执行
- 再次按 `?` 或 Esc 关闭
- 首次登录时自动弹出提示（localStorage 标记）

### 4.5 快捷键设置页面

**文件：** `src/views/settings/ShortcutSettings.vue`（新增）

核心功能：
- 分组列表显示所有快捷键及其当前绑定
- 点击快捷键进入编辑模式：显示"按下新快捷键..."提示，录制键盘输入
- 冲突实时检测：录制时检查是否与其他快捷键冲突
- 重置为默认值按钮
- 持久化到 localStorage，key 为 `yivad-shortcut-settings`
- 导入/导出快捷键配置（JSON 格式）

### 4.6 快捷键使用分析

**文件：** `src/shortcuts/analytics.ts`（新增）

```typescript
class ShortcutAnalytics {
  private usageCount: Map<string, number> = new Map();
  private lastUsed: Map<string, number> = new Map();

  recordUsage(shortcutId: string): void {
    this.usageCount.set(shortcutId, (this.usageCount.get(shortcutId) || 0) + 1);
    this.lastUsed.set(shortcutId, Date.now());
  }

  getUnused(days: number): string[] {
    const threshold = Date.now() - days * 86400000;
    return Array.from(this.lastUsed.entries())
      .filter(([, timestamp]) => timestamp < threshold)
      .map(([id]) => id);
  }

  getMostUsed(limit: number): Array<{ id: string; count: number }> {
    return Array.from(this.usageCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id, count]) => ({ id, count }));
  }
}

export const shortcutAnalytics = new ShortcutAnalytics();
```

---

## 五、实施步骤

| 步骤 | 任务 | 产出 | 验证方式 | 人天 |
|------|------|------|----------|------|
| 1 | 实现快捷键注册表 | `registry.ts` | 注册/注销/冲突检测可正常执行 | 0.08 |
| 2 | 实现 useKeyboardShortcuts Composable | `useKeyboardShortcuts.ts` | 组件内注册快捷键，切换页面后自动注销 | 0.06 |
| 3 | 实现标准化快捷键配置 | `defaults.ts` | 所有标准快捷键定义完整 | 0.04 |
| 4 | 实现快捷键分类定义 | `categories.ts` | 5 个分类定义完整 | 0.02 |
| 5 | 实现快捷键覆盖层组件 | `ShortcutOverlay.vue` | 按 ? 显示/隐藏，搜索过滤正常 | 0.08 |
| 6 | 实现快捷键设置页面 | `ShortcutSettings.vue` | 录制快捷键、冲突提示、持久化正常 | 0.08 |
| 7 | 实现快捷键使用分析 | `analytics.ts` | 统计最近使用、最常用快捷键 | 0.03 |
| 8 | 全局注册键盘事件监听 | `main.ts` 中挂载 | 全局快捷键可正常触发 | 0.02 |
| 9 | 模态框状态联动 | 修改 Modal/Dialog 组件 | 模态框打开时快捷键正确禁用 | 0.03 |
| 10 | 序列快捷键检测 | `registry.ts` 序列检测逻辑 | "G then I" 可正常触发 | 0.03 |
| 11 | 组件测试 + 端到端验证 | 测试文件 | 6 个测试场景通过 | 0.03 |

**总计：** 0.5d

---

## 六、测试规格

### Scenario 1: 全局快捷键触发
- **GIVEN** 用户在项目列表页面，未打开任何模态框
- **WHEN** 用户按下 Ctrl+K
- **THEN** 命令面板打开，搜索框自动聚焦

### Scenario 2: 模态框内快捷键禁用
- **GIVEN** 删除确认对话框已打开
- **WHEN** 用户按下 Ctrl+S（保存快捷键）
- **THEN** 保存快捷键不触发，仅对话框内的 Escape 键可关闭对话框

### Scenario 3: 序列快捷键
- **GIVEN** 用户在任意页面
- **WHEN** 用户依次按下 G 键，然后 1 秒内按下 I 键
- **THEN** 页面导航到 Issues 页面；序列超时（超过 1 秒）则序列重置

### Scenario 4: 快捷键覆盖层
- **GIVEN** 用户在任意页面
- **WHEN** 用户按下 ? 键
- **THEN** 半透明遮罩显示，分组列出所有已注册的快捷键；搜索框可过滤快捷键；再次按 ? 或 Esc 关闭

### Scenario 5: 快捷键自定义
- **GIVEN** 用户在快捷键设置页面
- **WHEN** 用户点击"保存"快捷键，按下 Ctrl+Shift+S
- **THEN** "保存"快捷键更新为 Ctrl+Shift+S；如果 Ctrl+Shift+S 已被其他快捷键占用，显示冲突警告

### Scenario 6: 输入框内快捷键不干扰
- **GIVEN** 用户在文本输入框中编辑文本
- **WHEN** 用户按下 Ctrl+S
- **THEN** 若当前输入框注册了 `input` 作用域的 Ctrl+S，则触发输入框的保存逻辑；否则触发全局保存逻辑（取决于作用域优先级）

---

## 七、风险与缓解

| 风险 | 概率 | 影响 | 等级 | 缓解措施 | 应急预案 |
|------|------|------|------|----------|----------|
| 快捷键与浏览器默认快捷键冲突 | 中 | 中 | 中 | 优先使用 Ctrl+Shift 组合避免常见冲突；Ctrl+S/Ctrl+P 等常用快捷键使用 `preventDefault` 拦截 | 在快捷键覆盖层中标注"覆盖浏览器默认行为" |
| 用户自定义快捷键导致功能无法触发 | 低 | 中 | 低 | 设置页面提供"重置为默认"按钮；冲突实时提示 | 恢复默认快捷键配置 |
| 序列快捷键检测影响正常输入 | 低 | 中 | 低 | 序列仅在非输入框作用域生效；序列超时 1000ms 后自动重置 | 禁用序列快捷键功能 |
| 多位用户快捷键配置冲突（共享设备） | 低 | 低 | 低 | 快捷键配置仅存储在 localStorage（浏览器级别） | 提供导入/导出配置功能 |
| 快捷键使用分析数据过大 | 低 | 低 | 低 | 仅保留最近 30 天数据，自动清理旧数据 | 手动清除 analytics 数据 |

---

## 八、回滚策略

| 回滚场景 | 回滚方式 | 影响范围 | 恢复时间 |
|----------|----------|----------|----------|
| 快捷键干扰正常操作 | 在 `main.ts` 中移除全局 `keydown` 监听 | 所有快捷键 | < 2min |
| 快捷键覆盖层样式异常 | 移除 `ShortcutOverlay.vue` 挂载 | 快捷键帮助 | < 1min |
| 用户自定义快捷键保存失败 | 清除 localStorage 中 `yivad-shortcut-settings` | 快捷键设置 | < 1min |
| 快捷键冲突导致页面崩溃 | 禁用冲突检测，恢复默认快捷键 | 快捷键系统 | < 3min |

**回滚验证：**
- 回滚后所有页面键盘操作恢复正常
- 回滚后无 console 错误
- 回滚后 Ctrl+C/Ctrl+V 等浏览器默认快捷键正常工作

---

## 九、设计决策记录

### D-01: 使用全局注册表而非组件内事件绑定

**背景：** 快捷键可以在组件内通过 `@keydown` 绑定，但无法检测冲突和作用域。
**决策：** 使用全局注册表统一管理所有快捷键，组件通过 `useKeyboardShortcuts` Composable 声明式注册。
**权衡：** 增加了一层抽象，但获得了冲突检测、作用域管理、动态启用/禁用等能力。
**后果：** 所有快捷键必须在 `onMounted` 中注册，`onUnmounted` 中注销，确保无内存泄漏。

### D-02: 使用 ? 作为快捷键帮助触发键

**背景：** 需要为快捷键帮助覆盖层选择一个触发键。
**决策：** 使用 `?` 键（无需修饰键），与 GitHub、GitLab 等主流开发工具保持一致。
**权衡：** `?` 在输入框中是常用字符，需要区分输入框内外。通过作用域机制：仅在非 `input` 作用域触发。
**后果：** 用户在搜索框中输入 `?` 时不会触发覆盖层。

### D-03: 快捷键持久化到 localStorage

**背景：** 用户自定义快捷键需要在页面刷新后保留。
**决策：** 将快捷键配置持久化到 localStorage，key 为 `yivad-shortcut-settings`。
**权衡：** 不同设备/浏览器间不同步，但避免了后端存储的复杂性。用户可通过导入/导出 JSON 文件手动同步。
**后果：** 后续可考虑将快捷键配置同步到后端用户配置中。

### D-04: 序列快捷键超时设为 1000ms

**背景：** 类似 Vim 的序列快捷键（如 "G then I"）需要超时机制来区分序列和独立按键。
**决策：** 序列快捷键超时设为 1000ms，超时后序列缓冲区重置。
**权衡：** 1000ms 足够大多数用户完成序列输入，同时不会因为等待过长而影响正常输入。
**后果：** 极快打字的用户可能需要适应 1000ms 的序列输入窗口。后续可根据分析数据调整。

---

## 十、可观测性

### 关键指标

| 指标 | 采集方式 | 告警阈值 | 说明 |
|------|---------|---------|------|
| 快捷键使用率 | `analytics.ts` 统计 | 任意快捷键使用率 < 5% | 快捷键设计可能不符合用户习惯 |
| 快捷键覆盖层打开次数 | 自定义事件埋点 | -- | 用户发现快捷键的意愿 |
| 用户自定义快捷键比例 | localStorage 扫描 | -- | 默认快捷键是否满足用户需求 |
| 快捷键冲突次数 | `registry.ts` console.warn 计数 | > 0 | 需要审查默认快捷键设计 |
| 序列快捷键成功率 | 序列触发次数 / 序列开始次数 | < 80% | 序列超时时间可能太短 |

### 日志规范

| 日志级别 | 场景 | 示例 |
|---------|------|------|
| `DEBUG` | 快捷键触发 | `[Shortcut] Triggered: edit.save (Ctrl+S)` |
| `WARN` | 快捷键冲突 | `[Shortcut] Conflict: "nav.search" (Ctrl+F) vs "editor.find" (Ctrl+F)` |
| `ERROR` | 快捷键注册失败 | `[Shortcut] Failed to register "edit.save": handler is missing` |

---

## 十一、代码审查检查清单

- [ ] `registry.ts` 中快捷键注册/注销/冲突检测逻辑正确
- [ ] `useKeyboardShortcuts.ts` 在 onMounted 注册、onUnmounted 注销
- [ ] `defaults.ts` 覆盖所有标准快捷键（Ctrl+S/Z/Y/F/K/P, Ctrl+Shift+N, Escape, F2, Delete, ?）
- [ ] `categories.ts` 5 个分类定义完整
- [ ] `ShortcutOverlay.vue` 按 ? 打开/关闭，搜索过滤正常，分组显示正确
- [ ] `ShortcutSettings.vue` 录制快捷键、冲突检测、持久化功能正常
- [ ] 模态框打开时非 Escape 快捷键被禁用
- [ ] 输入框内快捷键作用域优先级正确
- [ ] 序列快捷键检测逻辑正确，超时重置正常
- [ ] `analytics.ts` 统计逻辑正确，数据不泄露用户隐私
- [ ] `vue-tsc --noEmit` 类型检查通过

---

## 回归问题预测

| # | 问题 | 预测场景 | 根因 | 预防措施 |
|---|------|---------|------|---------|
| 1 | 快捷键拦截浏览器默认行为导致功能异常 | 用户按下 Ctrl+P 期望打印，但被快捷键系统拦截 | `preventDefault` 覆盖了浏览器默认行为 | 对浏览器保留快捷键（Ctrl+T 新标签页、Ctrl+W 关闭标签页等）不注册 |
| 2 | 序列快捷键在非英文输入法下失效 | 中文输入法下按 G 键可能触发输入法候选而非快捷键 | 输入法组合状态（compositionstart/compositionend）未处理 | 检测 `event.isComposing`，输入法激活时跳过序列检测 |
| 3 | 快捷键设置页面录制时无法捕获特殊键 | 用户尝试录制 Ctrl+Shift+ArrowUp 但 ArrowUp 被浏览器拦截 | 浏览器的默认行为（如滚动）在 `keydown` 事件中触发 | 录制模式下对所有按键调用 `preventDefault()` |
| 4 | 快捷键注册表在 SPA 路由切换时未清理 | 从页面 A 切换到页面 B 后，页面 A 的快捷键仍触发 | 组件 `onUnmounted` 未被调用（keep-alive 缓存） | 在 `onActivated`/`onDeactivated` 中管理快捷键生命周期 |
| 5 | 快捷键覆盖层中的快捷键与覆盖层自身快捷键冲突 | 覆盖层中搜索框按 Ctrl+F 应触发覆盖层内搜索，但被全局搜索拦截 | 覆盖层未使用 `input` 作用域 | 覆盖层打开时使用 `input` 作用域，覆盖层搜索框内的快捷键优先于全局 |
| 6 | 用户自定义快捷键保存后，不同标签页快捷键不一致 | 用户在一个标签页修改快捷键，另一个标签页仍使用旧快捷键 | localStorage 更新后其他标签页未检测到变化 | 监听 `storage` 事件，其他标签页检测到变化后重新加载快捷键配置 |

---

## 性能分析

### 键盘事件处理性能

| 场景 | 处理时间 | 说明 |
|------|---------|------|
| 全局 keydown 事件 | < 0.5ms | 按键字符串构建 + Map 查找 |
| 冲突检测 | < 0.1ms | Map 遍历，O(n) 复杂度 |
| 序列检测 | < 0.2ms | 缓冲区匹配 + 时间戳比较 |
| 作用域过滤 | < 0.1ms | 数组排序 + 优先级比较 |

### 内存占用

| 组件实例 | 内存占用 | 说明 |
|---------|---------|------|
| 快捷键注册表 | ~5KB | 20-30 个快捷键定义，每个约 200B |
| 快捷键覆盖层 | ~3KB | 组件渲染 + 搜索过滤 |
| 快捷键设置页面 | ~5KB | 表单组件 + 录制状态 |
| analytics 数据 | ~2KB | 30 天使用数据 |

### 快捷键覆盖层渲染性能

| 快捷键数量 | 渲染时间 | 说明 |
|----------|---------|------|
| 10 个 | < 5ms | 小规模 |
| 20 个 | < 8ms | 标准规模 |
| 30 个 | < 12ms | 包含自定义快捷键 |

---

## 补充：单元测试用例

### UT-HK01: useKeyboardShortcuts

| # | 测试场景 | 输入 | 期望结果 |
|---|---------|------|---------|
| 1 | 注册快捷键 | `register('ctrl+s', saveHandler)` | 按键触发 handler |
| 2 | 冲突检测 | 注册已存在的快捷键 | 控制台警告或后者覆盖 |
| 3 | 作用域隔离 | 弹窗内注册的快捷键 | 弹窗外不触发 |
| 4 | 注销 | 组件卸载 | 快捷键不再触发 |
| 5 | 输入框豁免 | 焦点在 input/textarea | 快捷键不触发 |
| 6 | 动态注册 | 条件变化时注册/注销 | 响应式更新快捷键绑定 |

## 补充：实例演示页面

### Demo-HK01: 快捷键速查面板
展示 `?` 键弹出的快捷键速查面板，列出所有注册的快捷键、作用域和描述。支持搜索和自定义快捷键绑定。

---

