# YrY CDN · Tokens 设计令牌

> **委托层**：`tokens/index.css` 现通过 `@import url('../theme/index.css')` 转发全部令牌。
> **真相源已统一至 [`theme/index.css`](../theme/index.css)**。
> 本文件仅为向后兼容保留，已有消费者无需修改。

## 文件

```
tokens/
├── index.css    # @import url('../theme/index.css') (向后兼容委托)
└── README.md    # 本文档
```

## 变更说明

自 2026-06 起，所有设计令牌的定义已统一迁移至 `cdn/theme/index.css`（项目唯一主题色真相源）。

`tokens/index.css` 不再定义任何 CSS 变量，仅通过 `@import` 转发 `theme/index.css` 的全部令牌。

### 迁移指南

```html
<!-- 旧方式 (仍然有效) -->
<link rel="stylesheet" href="../../cdn/tokens/index.css">

<!-- 新方式 (推荐，减少一次 @import 跳转) -->
<link rel="stylesheet" href="../../cdn/theme/index.css">
```

## 兼容性

| 消费者 | 影响 |
|--------|------|
| `cdn/theme-mono/index.css` (`@import url('../tokens/index.css')`) | ✅ 无影响 — 自动跟随委托链 |
| 直接 `<link>` 加载 `tokens/index.css` 的页面 | ✅ 无影响 — 透明转发 |
| CSS `@import url('../../tokens/index.css')` | ✅ 无影响 — 多一层跳转 |

## 核心令牌速查

以下令牌由 `theme/index.css` 定义，通过 `tokens/index.css` 透明转发：

### Surfaces (背景)

| 变量 | 值 | 说明 |
|------|-----|------|
| `--yry-bg` | `var(--bg1)` = `#0d1117` | 页面底色 |
| `--yry-bg-card` | `var(--bg2)` = `#161b22` | 卡片背景 |
| `--yry-bg-flat` | `var(--bg2)` = `#161b22` | 平铺背景 |
| `--yry-bg-raised` | `var(--bg3)` = `#1c2128` | 凸起表面 |

### Brand (品牌色)

| 变量 | 值 | 说明 |
|------|-----|------|
| `--yry-accent` | `#8b5cf6` | 品牌强调色 (violet) |
| `--yry-cyan` | `#06b6d4` | 科技信息色 |

### Semantic (语义色)

| 变量 | 值 | 说明 |
|------|-----|------|
| `--yry-pass` | `#22c55e` | 通过/健康 |
| `--yry-fail` | `#ef4444` | 失败/错误 |
| `--yry-warn` | `#f59e0b` | 警告 |
| `--yry-info` | `#3b82f6` | 信息 |
| `--yry-skip` | `#6b7280` | 跳过/未评估 |

### Text (文本层级)

| 变量 | 值 | 说明 |
|------|-----|------|
| `--yry-text` / `--yry-text1` | `var(--text1)` = `#e6edf3` | 主文字 |
| `--yry-text2` | `var(--text2)` = `#9da7b3` | 次级文字 |
| `--yry-text3` | `var(--text3)` = `#6e7681` | 辅助文字 |

### Elevation (阴影/圆角/边框)

| 变量 | 值 |
|------|-----|
| `--yry-shadow` | `0 4px 12px rgba(0,0,0,0.4)` |
| `--yry-shadow-lg` | `0 8px 24px rgba(0,0,0,0.5)` |
| `--yry-radius` | `12px` |
| `--yry-border` | `1px solid rgba(255,255,255,0.08)` |

> 完整令牌清单（70+ 变量 · 14 组）见 [theme/README.md](../theme/README.md)

## 相关文档

- [theme/README.md](../theme/README.md) — **主题唯一真相源** (70+ 令牌 · 完整文档)
- [theme/index.css](../theme/index.css) — 全部令牌定义
- [theme-mono/README.md](../theme-mono/README.md) — Category A Mono 主题
- [Mermaid 主题规则](../../skills/rui/rules/mermaid-theme.md) — Mermaid 图配色系统
