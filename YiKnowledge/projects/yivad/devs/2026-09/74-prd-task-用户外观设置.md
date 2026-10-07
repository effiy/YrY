---
prd_task_id: "YV-09-200"
title: "YV-09-200: 用户外观设置 — 开发方案"
status: 已完成
priority: P3
owner: 陈铭
created: 2026-09-11
updated: 2026-09-14
project: YiVad
prd_month: "202609"
estimate_frontend: 0.25
source_prd: "74-prd-用户外观设置.md"
type: task
category: projects/yivad/devs
source: YiVad
tags: [yivad, dev, 用户外观设置]
roles: [engineer]
benefit: "开发方案：task-用户外观设置"
lifecycle: active
---

# YV-09-200: 用户外观设置 — 开发方案

> 需求编号：YV-09-200 · 人天：0.25d

> **文档职责**：本文档定义**怎么做、为什么怎么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

## 源码索引

| 文件 | 说明 | 路径 |
|------|------|------|
| `AppearanceSettings.vue` | 外观设置页面 | `src/views/settings/` |
| `ThemeSelector.vue` | 主题选择器（亮/暗/自动） | `src/components/user/` |
| `globalStore.ts` | 全局设置 Store（主题/语言/布局） | `src/stores/modules/` |

---

<a id="sec-1"></a>
## 一、方案概述

用户可自定义界面外观：语言/主题/紧凑模式/字体大小。

### 架构方案

**技术路线**：独立路由页面 `/settings/appearance`，每个外选项为独立设置卡片（而非表单）。主题切换通过 CSS 变量 + Element Plus dark mode 实时生效。语言切换通过 `vue-i18n` `locale.value = 'zh'|'en'` 即时切换。偏好双写（localStorage 即时生效 + MongoDB 持久化）。

**数据模型**：
```typescript
interface AppearanceSettings {
  language: 'zh' | 'en';          // 默认: 浏览器语言
  theme: 'light' | 'dark' | 'auto'; // 默认: light
  compact_mode: boolean;          // 默认: false
  font_size: 'small' | 'medium' | 'large'; // 默认: medium
}
```

**主题切换机制**：
```
用户切换主题
  → AppearanceSettings.theme = 'dark'
  → document.documentElement.classList.toggle('dark', true)
  → Element Plus dark mode CSS 变量生效
  → globalStore.theme 更新
  → localStorage.setItem('yivad-theme', 'dark')  // 立即可用
  → debounce 3s → YiAi data_service.update_document("users", { appearance })  // 异步持久化

auto 模式:
  → window.matchMedia('(prefers-color-scheme: dark)').addListener(...)
  → 系统主题变化时自动切换
```

**组件树**：
```
AppearanceSettings.vue (设置卡片列表)
├── ThemeSelector.vue (亮/暗/自动 三个选项卡片 + 实时预览)
├── LanguageSelector.vue (zh/en 两个选项卡片)
├── CompactModeToggle.vue (el-switch + 预览对比图)
└── FontSizeSelector.vue (小/中/大 三个选项卡片 + 文字预览)
```

**关键决策**：
- 双写策略：localStorage 优先（页面刷新立即恢复），MongoDB 异步持久化（debounce 3s，跨设备同步）
- 主题切换：通过 `document.documentElement.classList` + CSS 变量，不刷新页面
- auto 模式：监听 `prefers-color-scheme` 媒体查询，系统主题变化时自动切换
- 字体大小：通过 CSS 变量 `--font-size-multiplier` (0.875/1.0/1.125) 全局缩放，不影响 Element Plus 组件内部字体
- 紧凑模式：减少 padding/margin（通过 `--compact-multiplier: 0.75`），表格行高从 48px 降至 36px

### 外观选项

| 设置 | 选项 | 默认 | 实现方式 |
|------|------|------|---------|
| 语言 | zh / en | 浏览器语言 | `vue-i18n` locale 切换 |
| 主题 | light / dark / auto | light | CSS class + Element Plus dark mode |
| 紧凑模式 | 开 / 关 | 关 | CSS 变量 `--compact-multiplier` |
| 字体大小 | 小 / 中 / 大 | 中 | CSS 变量 `--font-size-multiplier` |

### 实施步骤：0.25d

| 步骤 | 内容 | 验证 | 人天 |
|------|------|------|------|
| 1 | AppearanceSettings 页面 + 4 设置卡片 | 卡片渲染 + 切换交互 | 0.10 |
| 2 | 主题切换（light/dark/auto）+ 实时预览 | CSS class 切换 + 系统主题监听 | 0.08 |
| 3 | 语言/紧凑/字体 设置 + 双写持久化 | localStorage + MongoDB | 0.07 |

---

<a id="sec-2"></a>
## 二、完成定义（DoD）

- [ ] 4 种外观设置各自独立卡片 + 切换交互
- [ ] 主题切换：light ↔ dark 即时生效 + auto 跟随系统
- [ ] 语言切换：zh ↔ en 即时生效，所有页面同步更新
- [ ] 紧凑模式：开关后表格/卡片间距实时变化
- [ ] 字体大小：三档切换，文字实时缩放
- [ ] localStorage 双写 + MongoDB debounce 3s 持久化
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

> **状态**：已完成（0.25d）· **复核日期**：2026-09-15

### 产出

| 分类 | 文件数 | 说明 |
|------|--------|------|
| 页面 | 1 | AppearanceSettings.vue |
| 组件 | 1 | ThemeSelector.vue |
| Store | 1 | globalStore (主题/语言/布局偏好) |
| 测试 | 1 | 见测试方案 |

---

## 代码审查检查清单

- [x] 4 设置卡片渲染 + 切换交互
- [x] 主题 light/dark/auto 三种模式
- [x] auto 模式监听系统主题变化
- [x] 语言切换即时生效
- [x] localStorage + MongoDB 双写
- [x] 空状态/加载态/错误态覆盖
- [x] 用户可见文本国际化
- [x] `vue-tsc --noEmit` 通过