# 场景 5: 测试与发布

> | v1.0.0 | 2026-06-15 | 初始 | 任务故事: YryBreadcrumb |
> **导航**: [← README](../README.md) · [场景 1 →](./../场景-1-需求与设计/index.md)

[§0 概述](#sec0) · [§1 关键内容](#sec1) · [§2 实施](#sec2) · [§3 验证](#sec3) · [§4 自改进](#sec4)

<a id="sec0"></a>
## §0 概述

本场景是 **YryBreadcrumb 任务故事** 的第 5 个,聚焦于 **测试与发布**。

覆盖 7 项自测清单,集成到 npm 包 yry-cdn,确保 cdn/package.json files[] 包含全部 4 个新文件。

> 🍞 本组件是 CDN 故事 **场景 3 · 组件库与 JS 工具 API** 的子交付物,见 [README §文档目录 · 故事任务索引](../README.md#文档目录--故事任务索引)。

<a id="sec1"></a>
## §1 关键内容

**自测清单** (7 项,逐项勾选):

- [x] `node --check cdn/yry-breadcrumb/index.js` 语法通过
- [x] 浏览器直接打开 `cdn/yry-breadcrumb/index.html`,3 个 demo 全部渲染
- [x] 控制台无 Vue warning / fetch error
- [x] 硬刷新后 `#breadcrumb-app` 内出现 `<nav class="breadcrumb">`
- [x] 计划清单页面 mount 脚本能正确挂载,4 个条目显示
- [x] 键盘 Tab 能从第 1 个链接聚焦到当前项前的最后链接
- [x] 屏幕阅读器朗读顺序: link → (separator skip) → link → ... → current

**npm 集成**:
- 包名: `yry-cdn` · 当前版本: `1.1.0`
- `cdn/package.json` `files[]` 包含 4 个新文件路径
- 语义化版本: 新增组件为 minor (1.1.0) · 破坏性变更才会 major

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#1e1f2b','primaryTextColor': '#a9b1d6','primaryBorderColor': '#f472b6','lineColor': '#f472b6','secondaryColor': '#2b2d3b'}}}%%
flowchart TB
    TC[自测 7 项] -->|通过| NPM[npm 集成]
    NPM --> PKG[files[]]
    NPM --> V[v1.1.0]
    V --> PUB[publish]
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
- 📝 测试与发布 内容深化 (后续任务)
- 🔗 关联场景的强链接补充

**改进流程**: 反馈收集 → 提案生成 → 实施 → 验证 → 标准化

---

> 维护者提示: 本文件遵循 `场景-N-xxx/index.md` 标准 8 交付物模式。修改前请阅读 [README §修改指南](../README.md#修改指南)。
