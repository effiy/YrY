---
paths:
  - "**/*.md"
---

# mermaid-theme

> YrY 项目 Mermaid 图统一配色系统。源自 beautiful-mermaid 的两色基础设计——所有视觉元素从 bg + fg 两个颜色通过 `color-mix()` 派生。本文件是配色唯一真相源（single source of truth），所有 `agents/`、`rules/`、`skills/`、`docs/` 下的 mermaid 图必须遵循此色板。

[两色基础](#two-color) · [Tokyo Night Dark 主题](#tokyo-night-dark) · [统一 semantic classDef 色板](#classdef) · [Agent 配色映射](#agent-mapping) · [浅色主题备选](#light-theme) · [设计溯源](#origin)

<a id="two-color"></a>
## 两色基础

源自 [beautiful-mermaid](https://github.com/anthropics/beautiful-mermaid) 的核心设计：

> 每张图只需要两个颜色：**背景色（bg）** 和 **前景色（fg）**。所有其他视觉元素（文字层级、连线、节点填充、边框、箭头）都从这两个颜色按精确权重派生。

```
bg + fg → 两色输入
  ├── text (100% fg)          — 节点标签、标题
  ├── text-sec (60% fg→bg)    — 分组标题、副标签
  ├── text-muted (40% fg→bg)  — 边标签、轴刻度
  ├── text-faint (25% fg→bg)  — 弱化元素
  ├── line (50% fg→bg)        — 连线/边
  ├── arrow (85% fg→bg)       — 箭头
  ├── node-fill (3% fg→bg)    — 节点背景
  ├── node-stroke (20% fg→bg) — 节点边框
  ├── group-hdr (5% fg→bg)    — 子图标题栏
  └── inner-stroke (12% fg→bg) — 内部分隔线
```

**富化模式**：可选覆盖 3 个派生色——`line`（连线）、`accent`（强调色/箭头）、`muted`（次级文字）。未设置时自动回退到 color-mix 派生值。

<a id="tokyo-night-dark"></a>
## Tokyo Night Dark 主题（默认）

YrY 默认使用 Tokyo Night Dark 配色。所有 mermaid 图的第一个代码块必须包含此 `%%{init}%%` 块：

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#1e1f2b',
  'primaryTextColor': '#a9b1d6',
  'primaryBorderColor': '#3d59a1',
  'lineColor': '#3d59a1',
  'secondaryColor': '#2b2d3b',
  'tertiaryColor': '#21232f',
  'noteBkgColor': '#21232f',
  'noteTextColor': '#53576c'
}}}%%
```

### 色值速查

| 变量 | hex | 派生权重 | 用途 |
|------|-----|---------|------|
| `primaryColor` | `#1e1f2b` | node-fill (3%) | 节点默认背景 |
| `primaryTextColor` | `#a9b1d6` | text (100%) | 节点文字 |
| `primaryBorderColor` | `#3d59a1` | curated line | 节点边框 |
| `lineColor` | `#3d59a1` | curated line | 连线/箭头 |
| `secondaryColor` | `#2b2d3b` | inner-stroke (12%) | 备选节点色 |
| `tertiaryColor` | `#21232f` | group-hdr (5%) | 子图标题栏 |
| `noteBkgColor` | `#21232f` | group-hdr (5%) | 注释背景 |
| `noteTextColor` | `#53576c` | text-muted (40%) | 注释文字 |

### 派生完整色表（10 级梯度）

| 派生元素 | 权重 | hex | 说明 |
|---------|------|-----|------|
| `text` | 100% fg | `#a9b1d6` | 主文字 |
| `arrow` | 85% fg→bg | `#949bbc` | 箭头填充 |
| `text-sec` | 60% fg→bg | `#707590` | 次级文字 |
| `line` | 50% fg→bg | `#62667e` | 连线（派生值） |
| `text-muted` | 40% fg→bg | `#53576c` | 弱化文字 |
| `text-faint` | 25% fg→bg | `#3e4152` | 极弱文字 |
| `node-stroke` | 20% fg→bg | `#373949` | 节点边框（派生值） |
| `inner-stroke` | 12% fg→bg | `#2b2d3b` | 内部分隔 |
| `key-badge` | 10% fg→bg | `#282a38` | 键标记 |
| `group-hdr` | 5% fg→bg | `#21232f` | 分组标题 |
| `node-fill` | 3% fg→bg | `#1e1f2b` | 节点填充 |

### 富化色（curated overrides）

当 `%%{init}%%` 不足以表达时，以下 curated 色值用于 classDef 强调：

| 色名 | hex | 用途 |
|------|-----|------|
| `accent` | `#7aa2f7` | 强调边框、箭头、核心节点 |
| `line` | `#3d59a1` | 连线色（curated，比派生值更饱和） |
| `muted` | `#565f89` | 次级文字（curated） |

<a id="classdef"></a>
## 统一 semantic classDef 色板

所有 YrY mermaid 图使用以下 12 个语义类。每个文件只定义其实际使用的类（通常 3-5 个）。

```
classDef default    fill:#1e1f2b,stroke:#373949,color:#a9b1d6
classDef core       fill:#1b1e2e,stroke:#7aa2f7,color:#7aa2f7
classDef exec       fill:#1e1f2b,stroke:#565f89,color:#a9b1d6
classDef review     fill:#1e1f2b,stroke:#7aa2f7,color:#a9b1d6
classDef cross      fill:#21232f,stroke:#565f89,color:#a9b1d6
classDef must       fill:#1e1f2b,stroke:#7aa2f7,color:#7aa2f7
classDef good       fill:#1a2a1a,stroke:#34d399,color:#a9b1d6
classDef bad        fill:#2a1a1a,stroke:#f87171,color:#a9b1d6
classDef risk       fill:#2a1a1a,stroke:#f87171,color:#f87171
classDef milestone  fill:#2a2417,stroke:#fbbf24,color:#fbbf24
classDef goal       fill:#1a2a1a,stroke:#34d399,color:#34d399
classDef note       fill:#21232f,stroke:#3e4152,color:#53576c
```

### 语义类含义

| 类名 | 含义 | 典型使用场景 |
|------|------|-------------|
| `default` | 默认节点 | 通用节点，无特殊语义 |
| `core` | 核心/入口 | 管线入口、关键决策点、核心模块 |
| `exec` | 执行/实现 | coder、tester、执行步骤 |
| `review` | 审查/验证 | code-reviewer、security、质量门禁 |
| `cross` | 横切/基础设施 | 共享服务、横切关注点、平台层 |
| `must` | 强制/必选 | 不可跳过的步骤、铁律约束 |
| `good` | 通过/正确 | 检查通过、正确路径、验证成功 |
| `bad` | 失败/错误 | 检查失败、违规、错误路径 |
| `risk` | 风险/危险 | 安全风险、P0 阻断、威胁 |
| `milestone` | 里程碑/阶段 | 版本节点、关键交付物 |
| `goal` | 目标/终点 | 最终状态、完成标志 |
| `note` | 注释/说明 | 补充信息、备注、图例 |

<a id="agent-mapping"></a>
## Agent 配色映射

每个 Agent 生成 mermaid 图时，优先使用其对应颜色语义：

| Agent | 主色调 | 常用 classDef | 角色语义 |
|-------|--------|--------------|---------|
| pm | accent | `core`, `exec`, `goal`, `note` | 决策入口 → 执行委托 → 目标完成 |
| architect | accent | `core`, `note`, `cross` | 核心设计 → 横切约束 |
| coder | exec | `exec`, `must`, `good`, `bad`, `note` | 实现执行 → 质量判断 |
| tester | review | `review`, `risk`, `good`, `bad`, `must` | 验证审查 → 风险标记 |
| code-reviewer | review | `review`, `note`, `good`, `bad` | 代码审查 → 质量判断 |
| security | risk | `risk`, `must`, `good`, `bad` | 安全风险 → 强制约束 |
| reporter | note | `default`, `note`, `goal` | 记录整理 → 产出归档 |
| self-improve | cross | `exec`, `note`, `cross` | 横切改进 → 执行评估 |

<a id="light-theme"></a>
## 浅色主题备选

当需要在浅色背景环境下渲染时（如部分文档平台），使用 Tokyo Night Light：

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#e1e2e6',
  'primaryTextColor': '#343b58',
  'primaryBorderColor': '#34548a',
  'lineColor': '#34548a',
  'secondaryColor': '#d5d6db',
  'tertiaryColor': '#e1e2e6',
  'noteBkgColor': '#e1e2e6',
  'noteTextColor': '#9699a3'
}}}%%
```

浅色 classDef 色板（如需混用浅色主题）：

```
classDef default    fill:#e1e2e6,stroke:#34548a,color:#343b58
classDef core       fill:#e1e2e6,stroke:#34548a,color:#34548a
classDef good       fill:#ecfdf5,stroke:#34d399,color:#343b58
classDef bad        fill:#fef2f2,stroke:#f87171,color:#343b58
classDef risk       fill:#fef2f2,stroke:#f87171,color:#f87171
classDef milestone  fill:#fffbeb,stroke:#fbbf24,color:#92400e
classDef goal       fill:#ecfdf5,stroke:#34d399,color:#34d399
classDef note       fill:#e1e2e6,stroke:#9699a3,color:#9699a3
```

<a id="origin"></a>
## 备选主题库（源自 beautiful-mermaid 15 套主题）

> 当项目需要在不同渲染环境下切换主题时（如浅色/深色文档平台），以下主题可从 beautiful-mermaid 的 `THEMES` 直接映射。
> 每套主题仅需两个颜色（bg + fg），其他视觉元素通过 `color-mix()` 自动派生。

### 深色主题

| 主题名 | bg | fg | 适用场景 |
|--------|-----|-----|---------|
| Tokyo Night（默认） | `#1a1b26` | `#a9b1d6` | YrY 默认 |
| Tokyo Night Storm | `#24283b` | `#a9b1d6` | 高对比度深色 |
| Catppuccin Mocha | `#1e1e2e` | `#cdd6f4` | 柔和深色 |
| Nord Dark | `#2e3440` | `#d8dee9` | 北欧极简深色 |
| Dracula | `#282a36` | `#f8f8f2` | 经典 Dracula |
| GitHub Dark | `#0d1117` | `#c9d1d9` | GitHub 深色 |
| One Dark | `#282c34` | `#abb2bf` | Atom 风格 |
| Solarized Dark | `#002b36` | `#839496` | 护眼深色 |

### 浅色主题

| 主题名 | bg | fg | 适用场景 |
|--------|-----|-----|---------|
| Tokyo Night Light | `#d5d6db` | `#343b58` | 浅色文档平台 |
| Catppuccin Latte | `#eff1f5` | `#4c4f69` | 柔和浅色 |
| Nord Light | `#eceff4` | `#3b4252` | 北欧极简浅色 |
| GitHub Light | `#ffffff` | `#24292f` | GitHub 浅色 |
| Solarized Light | `#fdf6e3` | `#657b83` | 护眼浅色 |
| Zinc Light | `#fafafa` | `#18181b` | 中性锌色 |
| Zinc Dark | `#18181b` | `#fafafa` | 中性锌色深 |

### 切换主题（仅改两个变量）

在 mermaid `%%{init}%%` 中仅需更换 `primaryColor` 和 `primaryTextColor`：

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '<bg>',        // ← 改这里
  'primaryTextColor': '<fg>',    // ← 改这里
  'primaryBorderColor': '<line>',
  'lineColor': '<line>',
  'secondaryColor': '<surface>',
  'tertiaryColor': '<surface>'
}}}%%
```

> **派生色自动适配**：`primaryBorderColor` / `lineColor` / `secondaryColor` / `tertiaryColor` 从 bg+fg 通过 `color-mix()` 派生。但在 mermaid 原生 `themeVariables` 中需预计算为静态 hex——参见上方 [10 级梯度表](#派生完整色表10-级梯度)。

## 渲染质量准则（源自 beautiful-mermaid）

### 同步渲染优先

beautiful-mermaid 通过 ELK.js 的 FakeWorker 绕过实现同步布局，确保 SVG 生成是确定性的——同一输入始终产生同一输出。YrY 的 mermaid 图遵循相同原则：

| 准则 | 说明 |
|------|------|
| 确定性输出 | 同一 mermaid 代码在不同平台渲染结果一致 |
| 预计算色值 | CSS `color-mix()` 不可用时，使用预计算的静态 hex |
| 无外部依赖 | mermaid 图仅依赖 `%%{init}%%` 中的 themeVariables，不依赖外部 CSS |

### 数据属性语义化

所有 mermaid 节点应使用语义化 ID，使渲染后的 SVG 含有意义的 `data-*` 属性：

| 属性 | 用途 | 示例 |
|------|------|------|
| `data-id` | 节点标识符 | `data-id="pm"` → 用于样式/脚本定位 |
| `data-label` | 节点显示文本 | `data-label="产品决策者"` |
| `data-from` / `data-to` | 边的源和目标 | `data-from="pm" data-to="coder"` |

### 节点形状选择指南

| 形状 | mermaid 语法 | 适用场景 | YrY 中的用法 |
|------|-------------|---------|------------|
| 圆角矩形 | `A("label")` | 标准节点 | 默认 Agent/步骤 |
| 矩形 | `A["label"]` | 数据/文件 | 文档产出 |
| 菱形 | `A{"label"}` | 决策/门禁 | Gate A/B 检查 |
| 圆柱 | `A[("label")]` | 数据库/存储 | 知识图谱.json |
| 圆形 | `A(("label"))` | 起点/终点 | 管线入口/出口 |
| 子程序 | `A[["label"]]` | 子流程 | subgraph 嵌套 |
| 六边形 | `A{{"label"}}` | 准备/初始化 | init 阶段 |
| 体育场 | `A(["label"])` | 终端节点 | 交付收口 |

### 边样式选择指南

| 样式 | mermaid 语法 | 适用场景 |
|------|-------------|---------|
| 实线箭头 | `-->` | 正常数据流/控制流 |
| 粗线箭头 | `==>` | 重要/强制路径 |
| 虚线箭头 | `-.->` | 可选/降级路径 |
| 带标签箭头 | `-->|text|` | 协议/方法标注 |
| 双向箭头 | `<-->` | 同步通信 |

## 设计溯源

本配色系统派生自 beautiful-mermaid 的 CSS 变量架构：

| beautiful-mermaid | YrY mermaid |
|-------------------|-------------|
| `var(--bg)` + `var(--fg)` | `%%{init}%%` themeVariables |
| `var(--_text)`, `var(--_line)`, … | 预计算 hex 值写入 classDef |
| `var(--accent)` curated override | `#7aa2f7` 用于 `core`/`review`/`must` |
| `var(--muted)` curated override | `#565f89` 用于 `exec`/`cross` |
| `color-mix(in srgb, var(--fg) X%, var(--bg))` | 预计算静态 hex（本表 10 级梯度） |

Mermaid 原生 `themeVariables` 不支持 CSS `color-mix()`，因此采用预计算 hex 值固化到 `%%{init}%%` 和 `classDef` 中。
