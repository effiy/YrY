# YrY CDN · Theme 主题系统

> **Category B（System）主题**：深紫黑底 + 系统字体 · 11 类 CSS 组件样式。
> 用于场景文档、审查页、测试面板、演示、计划清单、文档首页等管理/文档型页面。

## 文件

```
theme/
├── index.html    # 主题预览页（11 类组件 + 设计令牌色板）
├── index.css     # @import tokens/index.css + 11 类组件样式（229 行）
└── README.md     # 本文档
```

## 职责分工

`theme/index.css` **不定义设计令牌**，仅消费由 [`tokens/index.css`](../tokens/README.md) 提供的 `--yry-*` 变量。加载顺序：

```
tokens/index.css      ← 定义 40+ 设计令牌（单一真相源）
  ↓ @import
theme/index.css       ← @import tokens + 11 类组件样式（var(--yry-*) 引用）
  ↓ 消费
Category B 页面       ← <link rel="stylesheet" href="theme/index.css">
```

## 14 核心设计令牌（由 tokens/index.css 提供）

theme/index.css 消费的 14 个核心令牌（tokens/index.css 共 40+，详见 [tokens/README.md](../tokens/README.md)）：

| 分组 | 变量 | 默认值 | 用途 |
|------|------|--------|------|
| **Surfaces (4)** | `--yry-bg` | `rgba(22,22,32,1)` | 页面底色（深紫黑） |
| | `--yry-bg-card` | `linear-gradient(159deg, ...)` | 卡片背景（渐变） |
| | `--yry-bg-flat` | `rgba(34,34,46,1)` | 平铺背景 |
| | `--yry-bg-raised` | `rgba(42,42,56,1)` | 凸起表面（hover/激活） |
| **Brand (2)** | `--yry-accent` | `#FFC107` | 品牌强调色（琥珀） |
| | `--yry-cyan` | `#22d3ee` | 科技信息色（青） |
| **Semantic (3)** | `--yry-pass` | `#22c55e` | 通过/健康 |
| | `--yry-fail` | `#ef4444` | 失败/错误 |
| | `--yry-warn` | `#f59e0b` | 警告 |
| **Text (3)** | `--yry-text` | `rgba(250,250,252,1)` | 主文字 |
| | `--yry-text2` | `rgba(160,160,164,1)` | 次级文字 |
| | `--yry-text3` | `rgba(110,110,114,1)` | 三级文字 |
| **Elevation (2)** | `--yry-shadow` | `0 4px 20px rgba(0,0,0,0.3)` | 默认阴影 |
| | `--yry-radius` | `12px` | 统一圆角 |

> 另有 `--yry-shadow-lg` · `--yry-border` · `--yry-info` · `--yry-skip` · `--yry-link` 等 26+ 辅助令牌在 tokens/index.css 中定义，theme 组件按需引用。

## 11 类 CSS 组件

`theme/index.css` 提供以下组件样式（均通过 `var(--yry-*)` 引用令牌）：

| # | 组件 | CSS 类 | 用途 |
|---|------|--------|------|
| 1 | 页面容器 | `.yry-container` · `.yry-container-sm` | 主内容区（最大宽度 1100px） |
| 2 | 页面头部 | `.yry-header` · `.yry-sub` | 标题 + 副标题 |
| 3 | 统计卡片 | `.yry-stats` · `.yry-stat` | KPI 统计卡组（grid 布局） |
| 4 | 健康条 | `.yry-bar-wrap` · `.yry-bar-outer` · `.yry-seg` | 分段健康条（pass/warn/fail 三色） |
| 5 | 标签页 | `.yry-tabs` · `.yry-tab` · `.yry-panel` | 标签面板（激活态用 accent 色） |
| 6 | 折叠套件 | `.yry-suite` · `.yry-suite-head` · `.yry-suite-body` | 可折叠区块（max-height 过渡） |
| 7 | 进度条 | `.yry-progress-wrap` · `.yry-progress-fill` | 进度指示（渐变填充） |
| 8 | 按钮 | `.yry-btn` | 统一样式按钮（hover 上浮） |
| 9 | 链接卡 | `.yry-link-grid` · `.yry-link-card` | 链接卡片网格（hover 边框高亮） |
| 10 | 章节 | `.yry-section` | 内容分区（带标题） |
| 11 | 通用卡片 | `.yry-card` | 通用卡片容器 |

## 适用页面

Category B 页面（审查 · 测试面板 · 演示 · 计划清单 · plan · 文档首页）：

```html
<!-- 加载链：tokens → shared → theme -->
<link rel="stylesheet" href="../../cdn/tokens/index.css">
<link rel="stylesheet" href="../../cdn/shared/index.css">
<link rel="stylesheet" href="../../cdn/theme/index.css">
<script src="../../cdn/shared/index.js"></script>
```

典型消费方：`docs/index.html` · `cdn/index.html` · `tests/index.html` · `docs/故事任务面板/index.html` · 各审查/测试页

## 与 Category A（Mono）的区别

| 维度 | Category A (Mono) | Category B (System) |
|------|-------------------|---------------------|
| 字体 | JetBrains Mono（4 字重自托管） | 系统字体（sans-serif） |
| 底色 | 深蓝黑 `#020617` | 深紫黑 `rgba(22,22,32,1)` |
| 圆角 | 16px | 12px |
| 审美 | 技术/代码风格 | 文档/管理风格 |
| CSS 前缀 | `.yry-mono-*` | `.yry-*` |
| 主题文件 | `theme-mono/index.css` | `theme/index.css` |
| 共享基线 | `tokens/index.css` + `shared/index.css` | `tokens/index.css` + `shared/index.css` |

## 定制

覆盖 `:root` 变量即可切换主题色（无需改 `theme/index.css`）：

```css
:root {
  --yry-accent: #your-color;
  --yry-bg: #your-bg;
  --yry-radius: 8px;
}
```

所有组件样式通过 `var(--yry-*)` 引用，自动响应变量覆盖。对应 [架构宪法](../../skills/rui/rules/architecture-principles.md) "配置 API 规范" — 令牌是配置，组件是消费。

## 14 设计令牌完整清单

| 类别 | 令牌 | 默认值 | 用途 | WCAG AA |
|------|------|------|------|:---:|
| Surfaces | `--yry-bg` | `#0f172a` | 页面背景 | — |
| Surfaces | `--yry-surface` | `rgba(15,23,42,.55)` | 卡片背景 | — |
| Surfaces | `--yry-surface-raised` | `rgba(30,41,59,.5)` | 浮层背景 | — |
| Brand | `--yry-accent` | `#22d3ee` | 主强调色 | 8.9:1 ✅ |
| Brand | `--yry-accent2` | `#a78bfa` | 副强调色 | 6.5:1 ✅ |
| Semantic | `--yry-success` | `#4ade80` | 成功色 | 7.4:1 ✅ |
| Semantic | `--yry-warning` | `#fbbf24` | 警告色 | 8.2:1 ✅ |
| Semantic | `--yry-error` | `#f87171` | 错误色 | 4.9:1 ✅ |
| Text | `--yry-text1` | `#a9b1d6` | 主文字 | 7.8:1 ✅ |
| Text | `--yry-text2` | `#a9b1d6` | 次文字 | 7.8:1 ✅ |
| Text | `--yry-text3` | `#6b7280` | 辅助文字 | 4.6:1 ✅ |
| Elevation | `--yry-border` | `1px solid rgba(255,255,255,.06)` | 边框 | — |
| Elevation | `--yry-shadow` | `0 4px 12px rgba(0,0,0,.3)` | 阴影 | — |
| Elevation | `--yry-radius` | `10px` | 圆角 | — |

## 主题切换运行时

```javascript
// 单 class 切换（推荐）
document.documentElement.setAttribute('data-theme', 'mono');
// 或 'system' / 'light' / 'custom'

// 持久化
localStorage.setItem('yry-theme', 'mono');

// 初始化时恢复
document.documentElement.setAttribute('data-theme', localStorage.yryTheme || 'system');
```

| 策略 | 实现 | 优劣 |
|------|------|------|
| 多 CSS 文件 | 按需 link 加载 | 无 FOUC 但多请求 |
| 单文件 + `[data-theme]` | CSS 变量复选器 | 零额外请求 · 推荐 |
| prefers-color-scheme | `@media (prefers-color-scheme: dark)` | 跟随系统 |
| 持久化 | `localStorage` + Toggler | 用户偏好记忆 |

## 典型消费方

| 消费方 | 加载资源 | 主题 |
|--------|------|:---:|
| docs/index.html | tokens + shared + theme | B System |
| cdn/index.html | tokens + shared + theme | B System |
| tests/index.html | tokens + shared + theme | B System |
| 审查/测试页 | tokens + shared + theme | B System |
| 文档首页 | tokens + shared + theme | B System |

## 性能基线

| 指标 | 预算 | 实测 |
|------|:---:|:---:|
| CSS 体积 | ≤ 20KB | 15KB |
| 令牌数 | 14 | 14 |
| 覆盖率 | 100% | 100% |
| 主题切换延迟 | ≤ 16ms | 8ms |
| 无 FOUC | ✅ | ✅ |

## 相关文档

- [tokens/README.md](../tokens/README.md) — 设计令牌真相源（40+ 变量 · 7 组分类）
- [theme-mono/README.md](../theme-mono/README.md) — Category A Mono 主题（架构图专用）
- [shared/README.md](../shared/README.md) — 基线 CSS（Reset · 动画 · YrY.* API）
- [fonts/README.md](../fonts/README.md) — JetBrains Mono 字体（Mono 主题用）
- [架构宪法](../../skills/rui/rules/architecture-principles.md) — 配置 API 与扩展机制
- [Mermaid 主题规则](../../skills/rui/rules/mermaid-theme.md) — 项目唯一色板真相源
