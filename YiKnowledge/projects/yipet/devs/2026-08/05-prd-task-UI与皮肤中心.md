---
doc_type: module
prd_task_id: "YP-08-08"
title: "YP-08-08: UI 与皮肤中心 — 开发方案"
status: 已完成
priority: P0
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-15
project: YiPet
project_id: yipet
prd_month: "202608"
source_prd: "05-功能实现-UI与皮肤中心.md"
---

# YP-08-08: UI 与皮肤中心 — 开发方案

> 需求编号：YP-08-08 · 优先级：P0

---

## 一、方案概述

Popup 皮肤中心重构：实时预览 + 角色/颜色/模型选择器 + 皮肤环。

### Popup 功能

| 功能 | 说明 |
|------|------|
| 角色选择 | 猫/狗/狐狸等角色切换 |
| 颜色选择 | 6 种专业预设主题 |
| 模型选择 | Ollama 模型切换 |
| 实时预览 | 选择即时反映到 Floating Pet |

### 皮肤环

Floating Pet 周围的环形角色/颜色选择器，hover/click 交互。

```css
.pet-ring {
  position: absolute;
  width: 120px; height: 120px;
  border-radius: 50%;
  /* 角色选项分布在环上 */
}
```

### 实施步骤

| 步骤 | 内容 |
|------|------|
| 1 | Popup 皮肤中心 UI |
| 2 | 皮肤环组件 |
| 3 | chrome.storage 偏好持久化 |

---

## 二、Color Theme 专业版设计（2026-09-15 优化）

### 2.1 问题根因

Color Theme 的 `applyThemeColors(document.documentElement, idx)` 将 CSS 变量注入到**宿主页面**的 `:root` 上，导致访问 YiVad 页面时覆盖了页面原生样式。例如 `http://localhost:8848/#/knowledge/executiver` 页面被暗色主题变量覆盖后变得不可读。

### 2.2 解决方案：容器级作用域隔离

**核心改动**：将主题 CSS 变量从 `document.documentElement` 迁移到 YiPet 自己的 DOM 容器上：

| 入口点 | 修改前 | 修改后 |
|--------|--------|--------|
| `overlay.ts` (MAIN) | `applyThemeColors(document.documentElement, color)` | `applyThemeColors(petContainer, color)` |
| `relay.ts` (ISOLATED) | `applyThemeColors(document.documentElement, color)` | `applyThemeColors(overlay, color)` + `applyThemeColors(chatRoot, color)` + 事件通知 |
| `chat/stores/chat.ts` (MAIN) | 仅存储 `colorIndex` 状态 | `applyThemeColors(#yipet-chat-root, idx)` |
| `popup/App.vue` | `applyThemeColors(document.documentElement, c)` | 保持不变（弹窗有独立 document） |

### 2.3 主题色板重新设计

弃用原有的 5 个 "Quantum X" 暗色主题，替换为 6 个专业色板：

| 序号 | 主题 | 色调 | 风格 |
|------|------|------|------|
| -1 | None (Light) | Indigo 基色 + 白色背景 | 亮色/中性，不干扰宿主页面 |
| 0 | Slate Pro | 蓝灰 `#64748b` | 极简专业 |
| 1 | Indigo | 靛蓝 `#6366f1` | 现代专注 |
| 2 | Ocean | 青蓝 `#0d9488` | 冷静清晰 |
| 3 | Forest | 翠绿 `#16a34a` | 自然沉稳 |
| 4 | Sunset | 琥珀 `#d97706` | 温暖活力 |
| 5 | Rose | 玫瑰 `#be185d` | 柔和创意 |

**设计原则**：
- 所有暗色主题的文字/背景对比度 ≥ 4.5:1 (WCAG AA)
- 每个主题有独立协调的 accent 色彩
- 背景层级分明（primary → secondary → tertiary → elevated）

### 2.4 涉及文件

```
YiPet/src/
├── shared/theme/colors.ts              # 6 个专业色板 + None Palette
├── content/config/theme-config.ts       # 内容脚本副本（同步）
├── content/rendering/overlay.ts         # 修改：作用域到 #yipet-overlay
├── content/ipc/relay.ts                 # 修改：作用域到各容器 + 事件通知
├── chat/stores/chat.ts                  # 修改：setColorIndex 应用主题到聊天容器
├── popup/data.ts                        # 修改：COLOR_LABELS 更新
└── popup/components/ColorPicker.vue     # 修改：显示主题名称标签 + 自定义颜色

---

## 三、页面主题模式 + 自定义颜色（2026-09-15 追加）

### 3.1 页面主题模式

| 文件 | 改动 |
|------|------|
| `content/rendering/page-theme.ts` | **新增** — `applyPageTheme(colorIndex)` 启动页面级主题，通过 `color-scheme: dark` + 微弱 CSS `filter` + `<body>` 最小样式注入 |
| `content/ipc/relay.ts` | **修改** — 新增 `setPageTheme` case 处理器 |
| `shared/ipc/messages.ts` | **修改** — 新增 `setPageTheme` action |
| `popup/types.ts` | **修改** — 新增 `pageTheme: boolean` |
| `popup/stores/popup.ts` | **修改** — 新增 `setPageTheme(enabled)` action |
| `popup/App.vue` | **修改** — 新增页面主题开关 UI |
| `public/_locales/*/messages.json` | **修改** — 新增 4 个 i18n key |

**设计决策**：
- 使用 `color-scheme: dark` 而非强制颜色覆盖——尊重网站的原生暗色模式
- CSS `filter` 强度极低（`sepia(0.05-0.12)`），不会破坏图片或可读性
- 仅在 `<body>` 上设置背景/文字颜色，不触碰组件级样式
- 可通过开关即时启用/关闭

### 3.2 自定义颜色

| 文件 | 改动 |
|------|------|
| `shared/theme/color-generator.ts` | **新增** — `generatePalette(hex)` 从单一主色推导完整 `ThemePalette` |
| `shared/theme/index.ts` | **修改** — 添加 `generatePalette` 导出 |
| `popup/components/ColorPicker.vue` | **修改** — 新增自定义颜色色块 + `el-color-picker` + hex 输入 |
| `popup/stores/popup.ts` | **修改** — 新增 `setCustomColor(hex)` action，`customColor` 字段持久化 |

**生成算法**：
- 背景色：主色色相 + HSL 亮度 6%-22%，饱和度 8%-12%
- 文字色：主色色相 + HSL 亮度 80%-92%，饱和度 8%-10%
- Accent 色：主色色相 +30°，饱和度 40%-60%，亮度 45%-75%
- 所有色值保持 WCAG AA 对比度（≥4.5:1）
```