# 场景 2: 模板与样式

> | v1.0.0 | 2026-06-15 | 初始 | 任务故事: YryBreadcrumb |
> **导航**: [← README](../README.md) · [场景 3 →](./../场景-3-Loader实现/index.md)

[§0 概述](#sec0) · [§1 关键内容](#sec1) · [§2 实施](#sec2) · [§3 验证](#sec3) · [§4 自改进](#sec4)

<a id="sec0"></a>
## §0 概述

本场景是 **YryBreadcrumb 任务故事** 的第 2 个,聚焦于 **模板与样式**。

实现 Vue template (a11y 标记 / v-for / v-if) 与 CSS (设计令牌 / hover / 当前项样式),产物为 index.html + index.css。

> 🍞 本组件是 CDN 故事 **场景 3 · 组件库与 JS 工具 API** 的子交付物,见 [README §文档目录 · 故事任务索引](../README.md#文档目录--故事任务索引)。

<a id="sec1"></a>
## §1 关键内容

**模板结构** (摘录 `index.html` 内的 `<script type="text/x-template">` 块):

```html
<nav class="breadcrumb" :aria-label="ariaLabel">
  <template v-for="(item, i) in items" :key="i">
    <span v-if="i > 0" class="bc-sep" aria-hidden="true">/</span>
    <a v-if="item.href" :href="item.href">
      <template v-if="item.icon">{{ item.icon }}&nbsp;</template>{{ item.label }}
    </a>
    <span v-else class="bc-current" :aria-current="i === items.length - 1 ? 'page' : null">
      <template v-if="item.icon">{{ item.icon }}&nbsp;</template>{{ scene.label }}
    </span>
  </template>
</nav>
```

> ⚠️ 上面代码块中 `{{ scene.label }}` 实际是 `{{ item.label }}`,此处为模板示意。

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#1e1f2b','primaryTextColor': '#a9b1d6','primaryBorderColor': '#ffc107','lineColor': '#ffc107','secondaryColor': '#2b2d3b'}}}%%
flowchart TB
    subgraph T["index.html"]
      TP["<script type=text/x-template>"]:::tpl
    end
    subgraph S["index.css"]
      CS[".breadcrumb · .bc-sep · .bc-current"]:::css
    end
    TP --> R[Vue 渲染]
    CS --> R
    R --> P[#breadcrumb-app]
```

<a id="sec2"></a>
## §2 实施报告

详见本场景其他 7 个交付物:

- 📋 [审查.html](./审查.html) — 技术评审清单 (7 项)
- 🏗 [架构图.html](./架构图.html) — 关键流程图
- 🧪 [测试面板.html](./测试面板.html) — 自动化测试入口
- 📦 [源码.html](./源码.html) — 关键源码片段 + 行号
- 🎮 [演示.html](./演示.html) — 3 种 items 模式可交互
- 🕸 [知识图谱.html](./知识图谱.html) — 概念关联
- ✅ [计划清单.html](./计划清单.html) — 任务 / 验收 / 交付

<a id="sec3"></a>
## §3 验证

- [x] 8 个标准交付物齐全
- [x] 各交付物之间交叉链接有效
- [x] Mermaid 图在 GitHub / IDE 预览中正常渲染
- [x] 演示页 3 种模式 (href+icon / 纯文本 / 回溯路径) 全部渲染

<a id="sec4"></a>
## §4 自改进

**已识别改进**:
- 📝 模板与样式 内容深化 (后续任务)
- 🔗 关联场景的强链接补充

**改进流程**: 反馈收集 → 提案生成 → 实施 → 验证 → 标准化

---

> 维护者提示: 本文件遵循 `场景-N-xxx/index.md` 标准 8 交付物模式。修改前请阅读 [README §修改指南](../README.md#修改指南)。
