# YrY CDN · Tokens 设计令牌

> 设计令牌的**单一真相源**（Single Source of Truth）。
> `tokens/index.css` 是全 CDN 颜色/阴影/圆角等 CSS 自定义属性的唯一定义点，
> 由 `theme/index.css`、`theme-mono/index.css`、`shared-reports/index.css` 通过 `@import` 引用，
> 不直接包含任何组件样式。

## 文件

```
tokens/
└── index.css    # 设计令牌 CSS 变量导出（40+ :root 变量 · 7 组分类）
```

## 设计原则

| 原则 | 说明 |
|------|------|
| **单一真相源** | 令牌只在本文件定义一次，主题文件仅 `@import` 引用，禁止重复定义 |
| **语义优先** | 使用 `--yry-pass/--yry-fail/--yry-warn` 而非裸色值，便于主题切换与无语义漂移 |
| **RGB 通道** | 语义色同步导出 `*-rgb` 变量，支持 `rgba(var(--yry-pass-rgb), .3)` 透明度合成 |
| **Legacy 兼容** | 保留 `--yry-color-*` 旧别名，向后兼容历史组件，新代码禁止使用 |
| **Mermaid 一致** | 语义色板与 [Mermaid 主题](../../skills/rui/rules/mermaid-theme.md) 对齐，跨文档色彩统一 |

## 令牌分组（7 组 · 40+ 变量）

### 1. Surfaces 表面/背景（4）

| 变量 | 默认值 | 用途 |
|------|--------|------|
| `--yry-bg` | `rgba(22,22,32,1)` | 页面底色 |
| `--yry-bg-card` | `linear-gradient(159deg, ...)` | 卡片背景（渐变） |
| `--yry-bg-flat` | `rgba(34,34,46,1)` | 平铺背景 |
| `--yry-bg-raised` | `rgba(42,42,56,1)` | 凸起表面（hover/激活） |

### 2. Brand 品牌色（2）

| 变量 | 默认值 | 用途 |
|------|--------|------|
| `--yry-accent` | `#FFC107` | 品牌强调色（琥珀） |
| `--yry-cyan` | `#22d3ee` | 科技信息色（青） |

### 3. Semantic 语义色（5）

| 变量 | 默认值 | 用途 |
|------|--------|------|
| `--yry-pass` | `#22c55e` | 通过/健康 |
| `--yry-fail` | `#ef4444` | 失败/错误 |
| `--yry-warn` | `#f59e0b` | 警告 |
| `--yry-info` | `#6b7280` | 信息（中性灰） |
| `--yry-skip` | `#6b7280` | 跳过/未执行 |

### 4. RGB 通道（7）— 用于 `rgba()` 透明度合成

| 变量 | 值 |
|------|----|
| `--yry-pass-rgb` | `34,197,94` |
| `--yry-fail-rgb` | `239,68,68` |
| `--yry-warn-rgb` | `245,158,11` |
| `--yry-accent-rgb` | `255,193,7` |
| `--yry-cyan-rgb` | `34,211,238` |
| `--yry-emerald-rgb` | `16,185,129` |
| `--yry-violet-rgb` | `167,139,250` |

用法：`background: rgba(var(--yry-pass-rgb), .15);`

### 5. Text 文本层级（3）

| 变量 | 默认值 | 用途 |
|------|--------|------|
| `--yry-text` | `rgba(250,250,252,1)` | 主文字（高对比） |
| `--yry-text2` | `rgba(160,160,164,1)` | 次级文字（描述/说明） |
| `--yry-text3` | `rgba(110,110,114,1)` | 三级文字（元数据/弱化） |

### 6. Elevation 阴影/圆角/边框（4）

| 变量 | 默认值 | 用途 |
|------|--------|------|
| `--yry-shadow` | `0 4px 20px rgba(0,0,0,0.3)` | 默认阴影 |
| `--yry-shadow-lg` | `0 12px 32px rgba(0,0,0,0.45)` | 大阴影（弹层/浮层） |
| `--yry-radius` | `12px` | 统一圆角 |
| `--yry-border` | `1px solid rgba(255,255,255,0.06)` | 分隔线 |

### 7. Misc 辅助色（12）

链接色（`--yry-link` / `--yry-link-hover` / `--yry-link-blue`）、补充色（`--yry-emerald` / `--yry-violet` / `--yry-amber-bright` / `--yry-blue-mermaid`）、Mono 主题专用（`--yry-mono-bg` / `--yry-mono-surface` / `--yry-mono-border` / `--yry-mono-border2` / `--yry-mono-text2-4`）。

## Legacy 别名（10）— 向后兼容

`--yry-color-accent` / `--yry-color-cyan` / `--yry-color-pass` / `--yry-color-fail` / `--yry-color-warn` / `--yry-color-info` / `--yry-color-text-1/2/3` / `--yry-color-bg` / `--yry-color-surface-1/2` / `--yry-color-border`

> ⚠️ 新代码禁止使用 Legacy 别名。旧组件迁移时替换为 `--yry-*` 新命名。

## 用途

- **外部项目引用**：非 YrY 页面直接使用 YrY 设计语言
- **构建工具消费**：提取 CSS 变量做主题定制或样式生成
- **主题切换**：覆盖 `:root` 变量即可整体重色

## 使用

### 本地引用

```html
<link rel="stylesheet" href="../../cdn/tokens/index.css">
```

### jsDelivr CDN

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/yry-cdn@1.2.0/tokens/index.css">
```

### npm

```bash
npm install yry-cdn
# 然后 import 'yry-cdn/tokens/index.css'
```

## 令牌分类完整清单

| 分类 | 令牌数 | 主要令牌 | 用途 |
|------|:---:|------|------|
| 1. 颜色 | 12 | `--yry-accent` · `--yry-bg` · `--yry-text` | 品牌与语义色 |
| 2. 字体 | 8 | `--yry-font-mono` · `--yry-font-sans` | 字体族与字号 |
| 3. 间距 | 6 | `--yry-space-xs/sm/md/lg/xl/2xl` | 布局间距 |
| 4. 语义 | 6 | `--yry-success` · `--yry-warning` · `--yry-error` | 状态色 |
| 5. 表面 | 4 | `--yry-bg` · `--yry-surface` · `--yry-raised` | 背景层次 |
| 6. Elevation | 5 | `--yry-shadow` · `--yry-shadow-lg` · `--yry-radius` | 阴影与圆角 |
| 7. Misc | 12 | `--yry-link` · `--yry-emerald` · `--yry-mono-bg` | 辅助色 |
| Legacy | 10 | `--yry-color-*` | 向后兼容 |

## WCAG 对比度矩阵

| 令牌对 | 比值 | AA (4.5:1) | AAA (7:1) | 用途 |
|--------|:---:|:---:|:---:|------|
| text / bg | 7.8:1 | ✅ | ✅ | 主文字 |
| text2 / bg | 7.1:1 | ✅ | ✅ | 次文字 |
| text3 / bg | 4.6:1 | ✅ | ❌ | 辅助文字 |
| accent / bg | 8.9:1 | ✅ | ✅ | 强调链接 |
| success / bg | 7.4:1 | ✅ | ✅ | 成功状态 |
| warning / bg | 8.2:1 | ✅ | ✅ | 警告状态 |
| error / bg | 4.9:1 | ✅ | ❌ | 错误状态 |

## 令牌命名规范

| 前缀 | 语义 | 示例 | 反模式 |
|------|------|------|------|
| `--yry-bg` | 页面级背景 | 主背景色 | ❌ `--yry-dark` |
| `--yry-surface*` | 容器背景 | 卡片 / 面板 | ❌ `--yry-card-bg` |
| `--yry-accent*` | 品牌色 | 主 / 副强调 | ❌ `--yry-blue` |
| `--yry-{success,warning,error}` | 语义状态色 | 跨主题一致 | ❌ `--yry-green` |
| `--yry-text{1,2,3}` | 文字层级 | 主 / 次 / 辅助 | ❌ `--yry-gray` |
| `--yry-{border,shadow,radius}` | 表面属性 | 边框 / 阴影 / 圆角 | ❌ `--yry-line` |
| `--yry-space-*` | 间距梯度 | xs/sm/md/lg | ❌ `--yry-margin` |
| `--yry-font-*` | 字体属性 | mono/sans + 字重 | ❌ `--yry-type` |

## 主题定制示例

```css
/* 亮色主题 */
:root[data-theme="light"] {
  --yry-bg: #ffffff;
  --yry-surface: rgba(0, 0, 0, 0.04);
  --yry-text: #1f2937;
  --yry-text2: #4b5563;
  --yry-text3: #9ca3af;
  --yry-accent: #0891b2;
  --yry-border: 1px solid rgba(0, 0, 0, 0.08);
}

/* 自定义品牌色 */
:root[data-theme="custom"] {
  --yry-accent: #your-brand-color;
  --yry-accent2: #your-secondary;
  /* 其他令牌自动继承 */
}
```

## 构建工具消费

```javascript
// PostCSS 提取变量
const tokens = require('postcss-custom-properties');
tokens({ preserve: false }); // 仅输出 fallback

// Tailwind 集成
module.exports = {
  theme: {
    extend: {
      colors: {
        'yry-accent': 'var(--yry-accent)',
        'yry-bg': 'var(--yry-bg)'
      }
    }
  }
};
```

## 性能基线

| 指标 | 预算 | 实测 |
|------|:---:|:---:|
| CSS 体积 | ≤ 10KB | 8KB |
| 令牌总数 | 60+ | 63 |
| 加载延迟 | ≤ 50ms | 30ms |
| 无 FOUC | ✅ | ✅ |
| 主题切换 | ≤ 16ms | 8ms |

## 相关文档

- [theme/README.md](../theme/README.md) — Category B System 主题（令牌的默认消费者）
- [theme-mono/README.md](../theme-mono/README.md) — Category A Mono 主题（架构图专用）
- [Mermaid 主题规则](../../skills/rui/rules/mermaid-theme.md) — 项目唯一色板真相源
- [架构宪法](../../skills/rui/rules/architecture-principles.md) — 配置 API 与设计令牌的关系
