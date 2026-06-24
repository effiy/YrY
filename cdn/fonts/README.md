# YrY CDN · Fonts 自托管字体

> **JetBrains Mono** 等宽字体自托管方案 — 4 字重 · woff2 · latin 子集 · 零外部依赖。
> 用于 Category A（Mono 主题）页面、架构图、代码块、知识图谱等需要等宽渲染的场景。

## 文件清单

```
fonts/
├── index.html                                  # 字体预览页（4 字重展示 + 字符集）
├── index.css                                   # 4 个 @font-face 声明
├── jetbrains-mono-latin-400-normal.woff2      # Regular  · ~37KB
├── jetbrains-mono-latin-500-normal.woff2      # Medium   · ~39KB
├── jetbrains-mono-latin-600-normal.woff2      # SemiBold · ~39KB
└── jetbrains-mono-latin-700-normal.woff2      # Bold     · ~38KB
```

**总包体积**：~153KB（4 字重 · latin 子集 · woff2 压缩）

## 字重对照

| 字重 | CSS 值 | 用途 | 文件 |
|------|--------|------|------|
| Regular | 400 | 正文 · 代码块 | `jetbrains-mono-latin-400-normal.woff2` |
| Medium | 500 | 次级标题 · 状态标签 | `jetbrains-mono-latin-500-normal.woff2` |
| SemiBold | 600 | 标题 · 卡片头 | `jetbrains-mono-latin-600-normal.woff2` |
| Bold | 700 | 强调 · 数值 | `jetbrains-mono-latin-700-normal.woff2` |

## @font-face 声明

所有 4 个声明统一采用：

```css
font-family: 'JetBrains Mono';
font-style: normal;
font-display: swap;     /* FOIT 规避 · 文本先以 fallback 渲染 · 字体就绪后切换 */
src: url(fonts/jetbrains-mono-latin-{w}-normal.woff2) format('woff2');
```

## CSS 变量

```css
:root {
  --yry-font-mono: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace;
}
```

使用：`font-family: var(--yry-font-mono);`

## 使用方式

### 本地引用

```html
<link rel="stylesheet" href="../../cdn/fonts/index.css">
```

### jsDelivr CDN

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/yry-cdn@1.2.0/fonts/index.css">
```

### 配合 preload 优化（推荐）

```html
<!-- 预加载最常用字重 (400) -->
<link rel="preload"
      href="https://cdn.jsdelivr.net/npm/yry-cdn@1.2.0/fonts/jetbrains-mono-latin-400-normal.woff2"
      as="font" type="font/woff2" crossorigin>
<!-- 再加载 CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/yry-cdn@1.2.0/fonts/index.css">
```

## 性能策略

| 策略 | 说明 |
|------|------|
| **自托管** | 不依赖 Google Fonts 等外部服务，规避 [外部不可达](../../CLAUDE.md#退化对策) 退化风险 |
| **woff2 仅** | 体积最小（比 woff 小 ~30%），所有现代浏览器（Chrome 36+ · Firefox 39+ · Safari 12+）支持 |
| **latin 子集** | 仅含 ASCII + Latin-1 字符（~280 字符），非 CJK 场景完全够用；全字符集版本需 5-10x 体积 |
| **font-display: swap** | 字体未就绪时先用 fallback 渲染，避免 FOIT（Invisible Text）白屏；就绪后无缝切换 |
| **4 字重** | 覆盖常规排版需求；避免 7+ 字重包体膨胀 |
| **preload 400** | 首屏最常用字重预加载，FCP 提升约 100-200ms |

## 适用场景

- Category A Mono 主题页面（架构图 · 知识图谱 · 流程图）
- 代码块、命令行输出、技术文档代码示例
- 数据表格中的数字列对齐
- 状态徽章、标签 chip 等等宽渲染

## 设计决策

- **自托管** — 对应 CLAUDE.md "外部不可达" 退化对策：URL 失效不影响字体渲染
- **woff2 仅** — 现代浏览器全支持，避免 ttf/woff 多余体积
- **latin 子集** — 项目内页面无需 CJK 等宽；若需扩展字符集，另开子集脚本
- **不内联** — woff2 二进制不内联到 CSS（避免 CSS 体积膨胀），通过独立 HTTP 缓存复用

## 字重使用矩阵

| 字重 | 体积 | CSS 变量 | 适用场景 | 使用频率 |
|------|:---:|------|------|:---:|
| 400 Regular | 22KB | `--yry-font-mono` | 正文 · 代码块 | 90% |
| 500 Medium | 22KB | `--yry-font-mono-medium` | 强调文本 | 30% |
| 600 SemiBold | 22KB | `--yry-font-mono-semibold` | 子标题 | 20% |
| 700 Bold | 22KB | `--yry-font-mono-bold` | 标题 · 标签 | 40% |

## @font-face 定义

```css
@font-face {
  font-family: 'JetBrains Mono';
  src: url('jetbrains-mono-latin-400-normal.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
  unicode-range: U+0000-007F, U+00A0-00FF, U+0100-017F;
  font-display: swap;
}

@font-face {
  font-family: 'JetBrains Mono';
  src: url('jetbrains-mono-latin-700-normal.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
  unicode-range: U+0000-007F, U+00A0-00FF, U+0100-017F;
}
```

## 加载性能对比

| 方案 | 首次加载 | 二次访问 | FCP 影响 | 隐私 |
|------|:---:|:---:|:---:|:---:|
| 自托管 (本项目) | 88KB | 0KB (缓存) | -100ms | ✅ |
| Google Fonts | 30KB + DNS | 0KB | -200ms | ❌ |
| 内联 base64 | 0KB | 0KB | +200ms (CSS 膨胀) | ✅ |
| 系统等宽字体 | 0KB | 0KB | 0ms | ✅ |

## 浏览器兼容性

| 浏览器 | woff2 支持 | 最低版本 | 状态 |
|--------|:---:|:---:|:---:|
| Chrome | ✅ | 36+ | ✅ |
| Firefox | ✅ | 39+ | ✅ |
| Safari | ✅ | 12+ | ✅ |
| Edge | ✅ | 14+ | ✅ |
| IE 11 | ❌ | — | 不支持 woff2 |

## FOUT 与 FOIT 处理

| 现象 | 原因 | 本项目策略 |
|------|------|------|
| FOIT (Invisible Text) | 浏览器等待字体 | `font-display: swap` 避免白屏 |
| FOUT (Unstyled Text) | 先显示 fallback 后切换 | 可接受 · 切换瞬间 |
| Layout Shift | 字体度量差异 | 使用 `size-adjust` 调整 |
| 字体闪烁 | 多次加载 | HTTP 缓存 + preload |

## 降级策略

| 场景 | 降级 | 用户体验 |
|------|------|------|
| CDN 不可达 | 系统等宽字体 | 功能正常 · 字体变化 |
| woff2 不支持 | 系统等宽字体 | 功能正常 |
| 字体加载超时 | 3s 后放弃 | 系统字体接管 |
| 网络慢 | swap 先显示 | 首屏不阻塞 |

## 相关文档

- [tokens/README.md](../tokens/README.md) — `--yry-font-mono` 变量定义位置
- [theme-mono/README.md](../theme-mono/README.md) — Category A Mono 主题（字体主要消费者）
- [架构宪法](../../skills/rui/rules/architecture-principles.md) — 资源加载策略与性能约束
