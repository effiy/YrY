---
title: 主题系统与暗色模式增强
tags:
- 主题
- 暗色模式
- CSS变量
- Element Plus
- 可访问性
category: 项目/管理后台/需求
created: 2026-09-09
updated: 2026-09-10
source: 内部
type: 需求
status: 已实现
priority: 高
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: YV-09-26
estimate_frontend: 1.5
review_status: 已实现
issue_type: 功能
roles:
- engineer
source_okr: [yivad-003]
---

# 主题系统与暗色模式增强

> 需求编号：YV-09-26 · 优先级：P1 · 状态：已实现

## 改动总览

| 改动点 | 类型 | 涉及文件 |
|--------|------|---------|
| CSS 语义化颜色令牌 + 暗色变体 | 扩展 | `src/styles/common.scss` |
| Element Plus CSS 变量映射 | 新增 | `src/styles/element-override.css` |
| useTheme 增强（auto 模式、toggleTheme、data-theme） | 修改 | `src/hooks/useTheme.ts` |
| 全局 Store 增加 themeMode 字段 | 修改 | `src/stores/modules/global.ts`, `src/stores/interface/index.ts` |
| 暗色模式 CSS 选择器迁移 | 修改 | `src/styles/element-dark.scss` |
| 主题切换过渡动画 | 新增 | `src/styles/common.scss`（追加） |
| 无障碍支持（高对比度、减弱动效） | 新增 | `src/styles/common.scss`（追加） |
| SwitchDark 三模式选择器 | 修改 | `src/components/SwitchDark/index.vue` |
| 反闪烁脚本增强 | 修改 | `index.html` |
| 水印颜色变量化 | 修改 | `src/layouts/index.vue` |
| 单元测试 | 新增 | `tests/hooks/useTheme.test.ts` |

## 背景

YiVad 已有基础暗色模式（`html.dark` class + Element Plus dark CSS vars），但缺少以下能力：

| # | 缺失能力 | 影响 |
|---|---------|------|
| 1 | **无 auto 模式** — 不支持跟随系统偏好自动切换 | 用户需手动切换，夜间/日间频繁操作 |
| 2 | **无统一语义令牌** — 颜色引用分散在 Element Plus 变量中 | 无法在暗色模式下自定义页面级颜色（如背景、文本） |
| 3 | **主题切换无过渡** — 颜色瞬间变化 | 切换体验割裂 |
| 4 | **无无障碍主题** — prefers-contrast / prefers-reduced-motion | 视障用户无法使用 |

## 已实现改动

### 1. CSS 变量令牌系统（common.scss）

在已有设计令牌基础上扩展语义化颜色令牌，支持亮/暗双模式：

```scss
:root {
  --color-bg-page: #F5F7FA;
  --color-bg-container: #FFFFFF;
  --color-text-primary: #111827;
  --color-text-secondary: #4B5563;
  --color-border-base: #E5E7EB;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  /* ... 等 20+ 令牌 */
}

[data-theme="dark"] {
  --color-bg-page: #0F172A;
  --color-bg-container: #1E293B;
  --color-text-primary: #F1F5F9;
  --color-border-base: #334155;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3);
  /* ... 暗色变体 */
}
```

### 2. Element Plus 变量映射（element-override.css）

单文件将语义令牌映射到 Element Plus CSS 变量，替换原来的硬编码 `element-dark.scss` 中部分颜色：

```css
[data-theme="dark"] {
  --el-bg-color: var(--color-bg-container);
  --el-text-color-primary: var(--color-text-primary);
  --el-border-color: var(--color-border-base);
  /* ... 完整映射 */
}
```

### 3. useTheme 增强

从 `html.dark` class 迁移到 `data-theme` 属性，新增三种模式：

| 模式 | 行为 |
|------|------|
| `light` | 始终亮色 |
| `dark` | 始终暗色 |
| `auto` | 跟随 `prefers-color-scheme` 系统偏好 |

新增 API：
- `setThemeMode(mode: 'light' | 'dark' | 'auto')` — 设置主题模式
- `toggleTheme()` — 快速切换亮/暗
- `resolveIsDark()` — 解析当前有效暗色状态

**Element Plus 兼容：** 暗色模式下同时设置 `data-theme="dark"` 和 `class="dark"`，确保 Element Plus 内置暗色 CSS vars（`element-plus/theme-chalk/dark/css-vars.css`）继续生效。

**向后兼容：** `initTheme()` 检测到旧版 `isDark: true` + `themeMode: "light"` 状态时，自动升级 `themeMode` 为 `"dark"`。

### 4. 全局 Store 扩展

`global.ts` 新增 `themeMode: 'light' | 'dark' | 'auto'` 字段，默认 `'light'`。保留 `isDark` 字段不变，由 `useTheme` 计算同步。

### 5. 主题切换过渡动画

切换时添加 `theme-transitioning` class，仅对颜色属性启用 300ms ease 过渡。首次加载无动画（避免闪烁）。

### 6. 无障碍支持

- **高对比度：** `@media (prefers-contrast: high)` 下增强颜色对比度
- **减弱动效：** `@media (prefers-reduced-motion: reduce)` 下禁用所有动画和过渡

### 7. SwitchDark UI

从单一暗色开关升级为三按钮选择器（Light / Dark / Auto），使用 `Sunny` / `Moon` / `Setting` 图标。

### 8. 反闪烁脚本增强

`index.html` 内联脚本支持解析 `themeMode`，在 `auto` 模式下检测系统偏好，在首屏渲染前设置正确的 `data-theme` 属性。

## 设计决策记录

### D-01: 扩展而非重写

项目已有可用的暗色模式基础设施（Element Plus dark CSS vars + `html.dark` class + `useTheme` hook）。本次改动在此基础上扩展，而非从零重建，避免了不必要的风险和工作量。

### D-02: data-theme + class="dark" 双轨制

`data-theme` 作为规范主题标识（支持三模式），`class="dark"` 作为 Element Plus 兼容层。两者同时存在，互不冲突。

### D-03: 单文件 > 多文件

需求文档提议创建 15+ 个独立 CSS 文件。实际实现将所有令牌、暗色变体、无障碍样式、过渡动画合并到已有 `common.scss` 中，Element Plus 映射单独一个文件。减少文件数量和导入复杂度。

## 涉及文件

```
YiVad/
├── src/
│   ├── styles/
│   │   ├── common.scss                  # 扩展：语义令牌 + 暗色变体 + a11y + 过渡
│   │   ├── element-override.css         # 新增：Element Plus 变量映射
│   │   ├── element-dark.scss            # 修改：html.dark → [data-theme="dark"]
│   │   └── element.scss                 # 修改：硬编码替换为 var(--shadow-md)
│   ├── hooks/
│   │   ├── useTheme.ts                  # 增强：auto/toggle/data-theme/兼容
│   │   └── interface/index.ts           # 修改：新增 ThemeModeType
│   ├── stores/
│   │   ├── modules/global.ts            # 修改：新增 themeMode 字段
│   │   └── interface/index.ts           # 修改：GlobalState 新增 themeMode
│   ├── components/SwitchDark/
│   │   └── index.vue                    # 修改：三模式选择器
│   ├── layouts/
│   │   ├── index.vue                    # 修改：水印颜色变量化
│   │   └── components/ThemeDrawer/
│   │       └── index.vue                # 修改："Dark Mode" → "Theme Mode"
│   └── main.ts                          # 修改：引入 element-override.css
├── tests/hooks/
│   └── useTheme.test.ts                 # 新增：13 个用例
└── index.html                           # 修改：反闪烁脚本增强
```

## 延后项

以下需求文档中提及的功能延后到后续迭代：

| 功能 | 原因 |
|------|------|
| ThemeBuilder 自定义主题页面 | UI 工作量大、优先级低，可作为独立需求 |
| useThemeContext 组件级主题 | 当前无实际场景需要独立主题区域 |
| 所有组件硬编码颜色全量迁移 | 渐进式迁移，基础设施先行 |
| ECharts/Monaco Editor 暗色联动 | 需逐个组件适配，当前使用默认主题可接受 |

## 技术债务

| # | 技术债 | 优先级 | 说明 |
|---|--------|--------|------|
| 1 | 全量硬编码颜色 → CSS 变量迁移 | P2 | global.ts Options → setup-function 语法迁移 | P3 | 保持一致性，非阻塞 |

## 验证清单

- [x] `pnpm test` 全部 388 个测试通过（含 13 个新增 useTheme 测试）
- [ ] 亮色/暗色/auto 三种模式手动切换正常
- [ ] 刷新页面后主题偏好保持，无白屏闪烁
- [ ] 4 种布局在暗色模式下显示正常
- [ ] Element Plus 组件（表格、弹窗、抽屉、表单）暗色模式正确
- [ ] 高对比度/减弱动效系统设置生效

---

## 补充：单元测试用例

### UT-TH01: useTheme

| # | 测试场景 | 输入 | 期望结果 |
|---|---------|------|---------|
| 1 | 默认主题 | 首次加载 | 跟随系统偏好或默认亮色 |
| 2 | 手动切换 | switchTheme('dark') | html 添加 class 'dark' |
| 3 | 持久化 | 切换后刷新 | localStorage 恢复主题 |
| 4 | Auto 模式 | 系统切换暗色 | 自动跟随系统设置 |
| 5 | CSS 变量 | 暗色模式 | --el-bg-color 等变量更新 |

### UT-TH02: 布局切换

| # | 测试场景 | 输入 | 期望结果 |
|---|---------|------|---------|
| 1 | 4 种布局 | vertical/classic/transverse/columns | 对应布局渲染正确 |
| 2 | 暗色适配 | 布局 + 暗色模式 | 所有布局暗色正常 |
| 3 | Element Plus 组件 | el-table/dialog/drawer | 暗色渲染正确 |

## 补充：实例演示页面

### Demo-TH01: 主题系统演示
展示三种主题模式（亮色/暗色/Auto）+ 四种布局的实时切换效果，包含 Element Plus 组件的暗色适配展示。

