# YrY CDN — 共享前端资源

项目根目录下的 `cdn/` 目录统一管理所有故事面板 HTML 页面的公共资源：主题色、CSS 组件、动画、JS 工具函数。

## 文件清单

```
cdn/
├── shared.css       # ★ 所有页面通用 — CSS Reset · 动画 · 面包屑 · 横向导航 · 工具栏 · Toast
├── shared.js        # ★ 所有页面通用 — YrY.toast() · YrY.copyCmd() · YrY.switchPanel() · 折叠/展开
├── theme.css        # Category B 页面 — 设计令牌(:root变量) · 统计卡片 · 标签页 · 折叠套件 · 进度条
└── theme-mono.css   # Category A 页面 — JetBrains Mono 主题 · 图表容器 · 图例 · 卡片圆点
```

## 页面分类

### Category A — Mono 主题 (深蓝黑底 + 等宽字体)

**页面类型**: 架构图、知识图谱

**加载顺序**:
```html
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../../../../cdn/shared.css">
<link rel="stylesheet" href="../../../../cdn/theme-mono.css">
<script src="../../../../cdn/shared.js"></script>
```

**CSS 类名前缀**: `.yry-mono-*` (容器/卡片/圆点/图例/页脚)

### Category B — System 主题 (深紫黑底 + 系统字体)

**页面类型**: 审查、测试面板、演示、计划清单、plan(计划总览)

**加载顺序**:
```html
<link rel="stylesheet" href="../../../../cdn/shared.css">
<link rel="stylesheet" href="../../../../cdn/theme.css">
<script src="../../../../cdn/shared.js"></script>
```

**CSS 类名前缀**: `.yry-*` (容器/统计卡/标签页/折叠套件/进度条/按钮/链接卡)

## 核心组件速查

| 组件 | CSS 类 | 适用主题 |
|------|--------|----------|
| 面包屑 | `.yry-breadcrumb` | 全部 |
| 横向导航 | `.yry-cross-nav` / `.yry-cross-link` | 全部 |
| 导出工具栏 | `.yry-toolbar` / `.yry-toolbar-actions` | 全部 |
| Toast 提示 | `.yry-toast` | 全部 |
| 页面容器 | `.yry-container` / `.yry-container-sm` | B |
| 页面头部 | `.yry-header` / `.yry-sub` | B |
| 统计卡片 | `.yry-stats` / `.yry-stat` | B |
| 健康条 | `.yry-bar-wrap` / `.yry-bar-outer` / `.yry-seg` | B |
| 标签页 | `.yry-tabs` / `.yry-tab` / `.yry-panel` | B |
| 折叠套件 | `.yry-suite` / `.yry-suite-head` / `.yry-suite-body` | B |
| 进度条 | `.yry-progress-wrap` / `.yry-progress-fill` | B |
| 按钮 | `.yry-btn` | B |
| 链接卡 | `.yry-link-grid` / `.yry-link-card` | B |
| 章节 | `.yry-section` | B |
| 图表容器 | `.yry-diagram-wrap` | A |
| 图谱容器 | `.yry-graph-wrap` | A |
| 脉冲圆点 | `.yry-pulse-dot` | A |
| 图例 | `.yry-mono-legend` | A |

## JS API (`YrY.*`)

```js
YrY.toast('消息文本')                          // 显示 Toast (默认 1.8s)
YrY.toast('消息', 3000)                        // 自定义时长
YrY.copyCmd(btnElement, '要复制的命令')          // 复制按钮: 📋→✅→📋
YrY.switchPanel('tabName')                     // 切换标签面板
YrY.switchPanel('tabName', '.yry-tab', '.yry-panel')  // 自定义选择器
YrY.initSuiteToggle('.yry-container')          // 初始化折叠套件点击
YrY.expandAllSuites()                          // 展开全部套件
YrY.collapseAllSuites()                        // 收起全部套件
YrY.fmtDur(142)                                // → "142ms"
YrY.esc('<script>')                            // → "&lt;script&gt;"
YrY.clipboardWrite(text, onSuccess, onFail)    // 写入剪贴板
```

## 设计令牌 (CSS 变量)

`theme.css` 定义了以下变量，所有 Category B 页面使用 `var(--yry-xxx)` 引用：

| 分组 | 变量 | 默认值 |
|------|------|--------|
| Surfaces | `--yry-bg` | `rgba(22,22,32,1)` |
| | `--yry-bg-card` | `linear-gradient(...)` |
| | `--yry-bg-flat` | `rgba(34,34,46,1)` |
| | `--yry-bg-raised` | `rgba(42,42,56,1)` |
| Brand | `--yry-accent` | `#FFC107` |
| | `--yry-cyan` | `#22d3ee` |
| Semantic | `--yry-pass` | `#22c55e` |
| | `--yry-fail` | `#ef4444` |
| | `--yry-warn` | `#f59e0b` |
| Text | `--yry-text` | `rgba(250,250,252,1)` |
| | `--yry-text2` | `rgba(160,160,164,1)` |
| | `--yry-text3` | `rgba(110,110,114,1)` |
| Elevation | `--yry-shadow` | `0 4px 20px rgba(0,0,0,0.3)` |
| | `--yry-radius` | `12px` |
| | `--yry-border` | `1px solid rgba(255,255,255,0.06)` |

## 迁移指南

将现有页面迁移到 CDN 的步骤：

1. **删除** 页内 `<style>` 中已被 CDN 覆盖的 CSS（变量定义、reset、动画、面包屑、cross-nav、tabs、stats、toast 等）
2. **添加** `<link>` 标签加载对应的 CDN CSS
3. **添加** `<script>` 标签加载 `shared.js`
4. **替换** CSS 类名为 `yry-*` 前缀版本（如 `class="container"` → `class="yry-container"`）
5. **替换** JS 函数调用为 `YrY.*` 版本（如 `toast('...')` → `YrY.toast('...')`）
6. **保留** 页面专属的 CSS（scene cards、file cards、SVG 样式等）

参考 `docs/故事任务面板/rui-npm/plan.html` 作为迁移范例。
