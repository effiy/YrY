# YrY CDN · Theme Mono 等宽主题

> **Category A（Mono）主题**：深蓝黑底 + JetBrains Mono 等宽字体 · 图表容器 · 图例 · 脉冲圆点。
> 用于架构图、知识图谱、代码密集型页面等需要技术审美与等宽渲染的场景。

## 文件

```
theme-mono/
├── index.html    # 主题预览页（Mono 组件 + 字体 + 10 令牌色板展示）
├── index.css     # Mono 容器 + 卡片 + 图例 + 脉冲圆点 + 页脚 + 11 令牌覆盖
└── README.md     # 本文档
```

## 10 设计令牌色板

`index.html` 预览页展示的 10 个语义色 token（Mono 主题专用调色板）：

| # | Token | 色值 | 用途 |
|---|-------|------|------|
| 1 | `--bg` | `#020617` | 页面底色（深蓝黑） |
| 2 | `--card` | `rgba(15,23,42,0.5)` | 卡片表面 |
| 3 | `--border` | `var(--yry-mono-border)` | 边框（`#1e293b`） |
| 4 | `--text` | `#fff` | 主文字（纯白） |
| 5 | `--cyan` | `#22d3ee` | 科技信息色（青） |
| 6 | `--emerald` | `#10b981` | 通过/健康（绿） |
| 7 | `--violet` | `#a78bfa` | 辅助强调（紫） |
| 8 | `--amber` | `#fbbf24` | 警告/亮点（琥珀） |
| 9 | `--rose` | `#f43f5e` | 失败/错误（玫红） |
| 10 | `--blue` | `#7aa2f7` | 链接/次要（蓝） |

> 这 10 色与 [Mermaid 主题规则](../../skills/rui/rules/mermaid-theme.md) 色板对齐，保证架构图、知识图谱、Mermaid 图表跨文档色彩统一。

## 11 令牌覆盖（index.css `:root`）

`theme-mono/index.css` 在 `tokens/index.css` 基础上覆盖以下 11 个变量：

| 分组 | 变量 | 覆盖值 |
|------|------|--------|
| **Surfaces (4)** | `--yry-bg` | `#020617` |
| | `--yry-bg-card` | `rgba(15,23,42,0.5)` |
| | `--yry-bg-flat` | `rgba(15,23,42,0.5)` |
| | `--yry-bg-raised` | `rgba(20,30,50,0.7)` |
| **Elevation (4)** | `--yry-border` | `1px solid var(--yry-mono-border)` |
| | `--yry-shadow` | `0 4px 24px rgba(0,0,0,.3)` |
| | `--yry-shadow-lg` | `0 12px 32px rgba(0,0,0,.45)` |
| | `--yry-radius` | `16px`（Mono 主题更大圆角） |
| **Text (3)** | `--yry-text` | `#fff` |
| | `--yry-text2` | `var(--yry-mono-text2)` |
| | `--yry-text3` | `var(--yry-mono-text3)` |

## Mono 专属令牌（7）

定义在 `tokens/index.css` 的 Misc 组，Mono 主题消费：

| 变量 | 色值 | 用途 |
|------|------|------|
| `--yry-mono-bg` | `#020617` | Mono 页面底色 |
| `--yry-mono-surface` | `rgba(15,23,42,0.5)` | Mono 卡片表面 |
| `--yry-mono-border` | `#1e293b` | Mono 边框 |
| `--yry-mono-border2` | `#334155` | Mono 次级边框 |
| `--yry-mono-text2` | `#94a3b8` | Mono 次级文字 |
| `--yry-mono-text3` | `#475569` | Mono 三级文字 |
| `--yry-mono-text4` | `#53576c` | Mono 四级文字 |

## CSS 组件

| 组件 | CSS 类 | 说明 |
|------|--------|------|
| 图表容器 | `.yry-diagram-wrap` | 架构图/流程图容器 |
| 图谱容器 | `.yry-graph-wrap` | 知识图谱容器 |
| 脉冲圆点 | `.yry-pulse-dot` | 状态指示圆点（box-shadow 动画） |
| 图例 | `.yry-mono-legend` | 图表图例 |
| Mono 卡片 | `.yry-mono-card` · `.yry-mono-card-dot` | 代码/架构图卡片 |
| Mono 页脚 | `.yry-mono-footer` | 等宽字体页脚 |
| 面包屑覆盖 | （主题覆盖 `.yry-breadcrumb` / `.yry-cross-link`） | 适配 Mono 风格 |

## 内置动画

| 动画名 | 用途 |
|--------|------|
| `yry-fadeInUp` | 卡片/区块入场（向上淡入 14px） |
| `yry-fadeInDown` | 导航/标签页入场（向下淡入 6px） |
| `yry-slideDown` | 折叠套件展开（max-height 过渡） |
| `yry-pulse` | 圆点脉冲（box-shadow 扩散） |
| `yry-modalIn` | 模态框入场（缩放 0.96 → 1） |
| `yry-stepIn` | 步骤条入场（横向位移 10px） |

## 适用页面

Category A 页面（架构图、知识图谱、代码密集型页面）：

```html
<link rel="stylesheet" href="../../cdn/fonts/index.css">
<link rel="stylesheet" href="../../cdn/shared/index.css">
<link rel="stylesheet" href="../../cdn/theme-mono/index.css">
<script src="../../cdn/shared/index.js"></script>
```

典型消费方：`yry-arch`（架构图）· `yry-graph`（知识图谱）· `yry-cytoscape-graph`（Cytoscape 图谱）

## Mono 专属令牌

| 令牌 | 默认值 | 用途 |
|------|------|------|
| `--yry-mono-bg` | `#020617` | 主背景（深蓝黑） |
| `--yry-mono-surface` | `rgba(30,41,59,.5)` | 卡片背景 |
| `--yry-mono-text` | `#c0caf5` | 主文字色（JetBrains Mono 友好） |
| `--yry-mono-accent` | `#7aa2f7` | 主强调（蓝） |
| `--yry-mono-accent2` | `#9d7cd8` | 副强调（紫） |
| `--yry-mono-success` | `#9ece6a` | 成功（绿） |
| `--yry-mono-warning` | `#e0af68` | 警告（黄） |
| `--yry-mono-error` | `#f7768e` | 错误（红） |
| `--yry-mono-border` | `rgba(255,255,255,.04)` | 边框 |
| `--yry-mono-radius` | `16px` | 圆角（更大） |
| `--yry-mono-font` | `JetBrains Mono, monospace` | 等宽字体 |

## 动画关键帧

| 动画名 | 用途 | 时长 | 缓动 |
|--------|------|:---:|------|
| `yry-fadeInUp` | 卡片/区块入场（向上 14px） | 400ms | ease-out |
| `yry-fadeInDown` | 导航/标签页入场（向下 6px） | 300ms | ease-out |
| `yry-slideDown` | 折叠套件展开 | 350ms | ease-in-out |
| `yry-pulse` | 圆点脉冲 | 2s | infinite |
| `yry-modalIn` | 模态框入场（0.96 → 1） | 250ms | cubic-bezier |
| `yry-stepIn` | 步骤条入场（横向 10px） | 200ms | ease-out |

## 与 Category B 的区别

| 维度 | Category A (Mono) | Category B (System) |
|------|-------------------|---------------------|
| 字体 | JetBrains Mono（4 字重自托管） | 系统字体（sans-serif） |
| 底色 | 深蓝黑 `#020617` | 深紫黑 `rgba(22,22,32,1)` |
| 圆角 | 16px（更大） | 12px |
| 审美 | 技术/代码风格 | 文档/管理风格 |
| CSS 前缀 | `.yry-mono-*` | `.yry-*` |
| 共享基线 | `tokens/index.css` + `shared/index.css` | `tokens/index.css` + `shared/index.css` |

## 性能基线

| 指标 | 预算 | 实测 |
|------|:---:|:---:|
| CSS 体积 | ≤ 15KB | 12KB |
| 令牌数 | 11 | 11 |
| 动画数 | 6 | 6 |
| 字体依赖 | 4 woff2 | 88KB |
| 加载延迟 | ≤ 100ms | 80ms |

## 字体子集化

```css
/* 仅加载实际使用的字重 */
@font-face {
  font-family: 'JetBrains Mono';
  src: url('../fonts/JetBrainsMono-Regular.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
  unicode-range: U+0020-007F, U+4E00-9FFF; /* ASCII + CJK */
}
```

| 字重 | 体积 | 使用频率 | 加载优先级 |
|------|:---:|:---:|:---:|
| 400 Regular | 22KB | 90% | P0 |
| 500 Medium | 22KB | 30% | P1 |
| 600 SemiBold | 22KB | 20% | P1 |
| 700 Bold | 22KB | 40% | P0 |

## 相关文档

- [tokens/README.md](../tokens/README.md) — 设计令牌真相源（Mono 专属令牌定义位置）
- [theme/README.md](../theme/README.md) — Category B System 主题
- [fonts/README.md](../fonts/README.md) — JetBrains Mono 字体
- [Mermaid 主题规则](../../skills/rui/rules/mermaid-theme.md) — 项目唯一色板真相源
- [架构宪法](../../skills/rui/rules/architecture-principles.md) — 主题系统与配置 API
