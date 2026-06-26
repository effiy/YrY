# YrY CDN · Theme 主题系统

> **项目唯一主题色真相源**：深色 GitHub-dark 风格 (`#0d1117` → `#e6edf3`)。
> 所有 YrY 页面的 CSS 自定义属性统一定义于 `index.css`。

## 文件

```
theme/
├── index.html        # 主题预览页（色板 + 令牌速查表）
├── index.css         # 全部设计令牌定义（~180 行，唯一真相源）
├── theme-index.css   # 预览页专用样式
└── README.md         # 本文档
```

## 快速开始

```html
<link rel="stylesheet" href="../../../../cdn/theme/index.css">
```

单文件即可获得全部 CSS 自定义属性。无额外依赖，不 `@import` 任何文件。

## 设计令牌总览

`index.css` 在 `:root` 中定义 **70+ CSS 自定义属性**，分 14 组：

| # | 分组 | 变量数 | 命名前缀 | 说明 |
|---|------|:---:|------|------|
| 1 | Surfaces | 6 | `--bg*` | 背景表面 (页面→卡片→浮层→遮罩) |
| 2 | Text | 4 | `--text*` | 文本层级 (主→次→辅→禁用) |
| 3 | Border | 4 | `--border*` | 边框 (实色→半透明 4 档) |
| 4 | Brand | 6 | `--yry-accent*` / `--yry-cyan*` | 品牌强调色 + 科技色 (含 bg/soft/border 变体) |
| 5 | Semantic | 14 | `--yry-pass*` / `--yry-fail*` / `--yry-warn*` / `--yry-info*` / `--yry-skip` | 语义状态色 (含 bg/soft/border 变体) |
| 6 | RGB Channels | 7 | `--yry-*-rgb` | RGB 分量 (用于 `rgba(var(--yry-*-rgb), alpha)`) |
| 7 | Links | 3 | `--link*` | 链接色 |
| 8 | Shadows | 3 | `--shadow*` | 阴影 (sm / md / lg 三级) |
| 9 | Radius | 4 | `--radius*` | 圆角 (sm / md / lg / xl 四级) |
| 10 | Spacing | 7 | `--gap-*` | 间距 (2px → 16px) |
| 11 | Font Sizes | 9 | `--fs-*` | 字号 (10px → 32px) |
| 12 | Misc | 7 | `--yry-emerald` / `--yry-violet` 等 | 辅助色 |
| 13 | Mono Tokens | 7 | `--yry-mono-*` | Category A 架构图专用 (由 theme-mono 覆盖) |
| 14 | Legacy Aliases | 12 | `--yry-color-*` | 向后兼容旧命名 |

## 核心令牌速查

### Surfaces（背景表面）

| 变量 | 值 | 用途 |
|------|-----|------|
| `--bg1` | `#0d1117` | 页面底色 |
| `--bg2` | `#161b22` | 卡片 / 区块底色 |
| `--bg3` | `#1c2128` | 浮层 / 激活态底色 |
| `--bg-hover` | `#21262d` | hover 态 |
| `--bg-soft` | `rgba(255,255,255,0.04)` | 微淡底色叠加 |
| `--bg-overlay` | `rgba(0,0,0,0.6)` | 模态遮罩 |

`--yry-bg` → `var(--bg1)` · `--yry-bg-card` / `--yry-bg-flat` → `var(--bg2)` · `--yry-bg-raised` → `var(--bg3)`

### Text（文本层级）

| 变量 | 值 | 用途 |
|------|-----|------|
| `--text1` | `#e6edf3` | 主文字 |
| `--text2` | `#9da7b3` | 次级文字 |
| `--text3` | `#6e7681` | 辅助文字 / meta 信息 |
| `--text-muted` | `#484f58` | 禁用 / 占位 |

`--yry-text` / `--yry-text1` → `var(--text1)` · `--yry-text2` → `var(--text2)` · `--yry-text3` → `var(--text3)`

### Brand（品牌色）

| 变量 | 值 | 用途 |
|------|-----|------|
| `--yry-accent` | `#8b5cf6` | 主强调色 (violet) |
| `--yry-accent-bg` | `rgba(139,92,246,0.1)` | 强调色背景 |
| `--yry-accent-soft` | `rgba(139,92,246,0.15)` | 强调色柔化背景 |
| `--yry-accent-border` | `rgba(139,92,246,0.3)` | 强调色边框 |
| `--yry-cyan` | `#06b6d4` | 科技信息色 |
| `--yry-cyan-bg` | `rgba(6,182,212,0.1)` | 科技色背景 |

### Semantic（语义色）

| 变量 | 值 | 用途 |
|------|-----|------|
| `--yry-pass` | `#22c55e` | 通过 / 健康 |
| `--yry-pass-bg` | `rgba(34,197,94,0.1)` | 通过态背景 |
| `--yry-fail` | `#ef4444` | 失败 / 错误 |
| `--yry-fail-bg` | `rgba(239,68,68,0.1)` | 失败态背景 |
| `--yry-warn` | `#f59e0b` | 警告 |
| `--yry-warn-bg` | `rgba(245,158,11,0.1)` | 警告态背景 |
| `--yry-info` | `#3b82f6` | 信息 |
| `--yry-info-bg` | `rgba(59,130,246,0.1)` | 信息态背景 |
| `--yry-skip` | `#6b7280` | 跳过 / 未评估 |

每种语义色还有 `-soft` (15% 透明度) 和 `-border` (30% 透明度) 变体（pass / fail / warn）。

### RGB Channels

| 变量 | 值 | 用法示例 |
|------|-----|------|
| `--yry-pass-rgb` | `34, 197, 94` | `rgba(var(--yry-pass-rgb), 0.15)` |
| `--yry-fail-rgb` | `239, 68, 68` | `rgba(var(--yry-fail-rgb), 0.15)` |
| `--yry-warn-rgb` | `245, 158, 11` | `rgba(var(--yry-warn-rgb), 0.15)` |
| `--yry-accent-rgb` | `139, 92, 246` | `rgba(var(--yry-accent-rgb), 0.12)` |
| `--yry-cyan-rgb` | `6, 182, 212` | `rgba(var(--yry-cyan-rgb), 0.12)` |
| `--yry-emerald-rgb` | `16, 185, 129` | `rgba(var(--yry-emerald-rgb), 0.1)` |
| `--yry-violet-rgb` | `167, 139, 250` | `rgba(var(--yry-violet-rgb), 0.1)` |

### Elevation（阴影 / 圆角 / 边框 / 间距 / 字号）

| 类别 | 变量 | 值 |
|------|------|-----|
| Shadow | `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.3)` |
| | `--shadow` | `0 4px 12px rgba(0,0,0,0.4)` |
| | `--shadow-lg` | `0 8px 24px rgba(0,0,0,0.5)` |
| Radius | `--radius-sm` | `4px` |
| | `--radius` | `8px` |
| | `--radius-lg` | `12px` |
| | `--radius-xl` | `16px` |
| Spacing | `--gap-2` ~ `--gap-16` | `2px` ~ `16px` (7 档) |
| Font | `--fs-xs` ~ `--fs-4xl` | `10px` ~ `32px` (9 档) |

## 命名约定

| 命名空间 | 含义 | 示例 |
|------|------|------|
| `--bg*` | 背景表面 (primary naming) | `--bg1`, `--bg-hover` |
| `--text*` | 文本层级 (primary naming) | `--text1`, `--text-muted` |
| `--border*` | 边框 (primary naming) | `--border1`, `--border-soft` |
| `--yry-*` | YrY 品牌/语义令牌 (alias layer) | `--yry-accent`, `--yry-pass-bg` |
| `--yry-*-rgb` | RGB 分量 (用于 rgba 组合) | `--yry-pass-rgb` |
| `--yry-mono-*` | Category A Mono 主题专用 | `--yry-mono-bg` |
| `--yry-color-*` | 向后兼容旧命名 | `--yry-color-accent` |
| `--link*` | 链接色 | `--link`, `--link-hover` |
| `--shadow*` | 阴影 | `--shadow-sm` |
| `--radius*` | 圆角 | `--radius-lg` |
| `--gap-*` | 间距 | `--gap-8` |
| `--fs-*` | 字号 | `--fs-base` |

## 与 Category A（Mono）的关系

| 维度 | Category B (System) | Category A (Mono) |
|------|---------------------|---------------------|
| 主题文件 | `theme/index.css` | `theme-mono/index.css` |
| 令牌来源 | 自身定义 (自包含) | `@import` tokens → theme 令牌后覆盖 |
| 字体 | 系统字体 (sans-serif) | JetBrains Mono (等宽) |
| 底色 | `#0d1117` (深灰黑) | `#020617` (深蓝黑) |
| 圆角 | 12px (`--radius-lg`) | 16px |
| 审美 | 文档/管理风格 | 技术/代码风格 |
| 主要消费方 | docs/index.html, 审查页, 健康报告 | 架构图, 知识图谱 |

Category A 页面同时加载 `tokens/index.css` + `theme-mono/index.css`，后者覆盖表面/文本令牌为 mono 深色主题。语义令牌（`--yry-pass` / `--yry-fail` / `--yry-warn` / `--yry-accent` / `--yry-cyan`）从 `theme/index.css` 继承，两个 Category 保持一致。

## 加载链

```
theme/index.css               ← 唯一真相源 (本文件)
  ├── 定义全部 :root 变量
  │
  ├── cdn/tokens/index.css    ← @import url('../theme/index.css') (向后兼容)
  │     └── cdn/theme-mono/index.css  ← @import tokens + 覆盖表面/文本令牌
  │
  ├── cdn/shared/index.css    ← 消费 var(--bg1, fallback) 等
  │     └── 提供 Reset / Layout / 通用组件样式
  │
  └── Category B 页面         ← <link rel="stylesheet" href="theme/index.css">
        └── docs/index.html · cdn/index.html · tests/index.html · 健康报告 等
```

## 定制

覆盖 `:root` 变量即可切换主题色（无需修改 `theme/index.css`）：

```css
:root {
  --yry-accent: #your-color;
  --bg1: #your-bg;
  --radius: 8px;
}
```

所有组件样式通过 `var(--*)` 引用，自动响应变量覆盖。对应 [架构宪法](../../skills/rui/rules/architecture-principles.md) "配置 API 规范" — 令牌是配置，组件是消费。

## 相关文档

- [theme/index.html](./index.html) — 主题预览页（色板 + 令牌速查表）
- [theme-mono/README.md](../theme-mono/README.md) — Category A Mono 主题（架构图专用）
- [tokens/README.md](../tokens/README.md) — 设计令牌（向后兼容，委托至 theme/index.css）
- [shared/README.md](../shared/README.md) — 共享基线 CSS（Reset · 组件样式）
- [架构宪法](../../skills/rui/rules/architecture-principles.md) — 配置 API 与扩展机制
- [Mermaid 主题规则](../../skills/rui/rules/mermaid-theme.md) — Mermaid 图配色系统
