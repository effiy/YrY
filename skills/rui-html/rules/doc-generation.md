---
paths:
  - "docs/**/*.md"
  - ".claude/formulas.md"
---

# doc-generation

> 文档生成的九条强制约束。表达优先：图 → 结构化文本 → 表。编号即顺序；不可提前创建。


[铁律](#iron-law) · [九约束全景](#eight-constraints) · [适用](#scope) · [① 版头齐](#meta-nav) · [② 表达优先](#diagram-first) · [③ 目录清](#dir-clean) · [④ 证据足](#evidence) · [⑤ 产出聚](#output-cohesion) · [⑥ 裁剪准](#precision-cut) · [⑦ 无魔数](#no-magic) · [⑧ 效果证](#proof) · [⑨ 单源生](#single-source) · [补充文档](#supplementary) · [策展](#curation) · [例外](#exceptions) · [生效标志](#effectiveness)

<a id="iron-law"></a>
## 铁律

```
NO MAGIC NUMBERS — EVERY NUMERIC LITERAL MUST BE SEMANTICALLY NAMED
```

魔法数字是最基本的反模式之一。代码中裸数值必须提取为命名常量，文档中硬编码量级/阈值/时限必须改写为语义描述。此约束不可妥协，违反即 P0。

| 铁律 | 源于 | 含义 | 违反信号 |
|------|------|------|---------|
| **无魔数** | 惜注意 | 代码裸数值→命名常量，文档硬编码量级→语义描述 | `Math.max(2, 28)`、文档写"最近 5 个"、"通过率 ≥ 90%" |

故事文档公式见 [formulas.md](../skills/rui/formulas.md)；目录与数据契约见 [coder.md](../skills/rui/coder.md)。

<a id="eight-constraints"></a>
## 九约束全景

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#1e1f2b',
  'primaryTextColor': '#a9b1d6',
  'primaryBorderColor': '#3d59a1',
  'lineColor': '#3d59a1',
  'secondaryColor': '#2b2d3b',
  'tertiaryColor': '#21232f'
}}}%%
flowchart TB
    subgraph C1["① 版头齐"]
        H1["F.meta 版本行"]:::c
        H2["F.toc 标题链接跳转目录"]:::c
        H3["F.nav 导航块"]:::c
    end
    subgraph C2["② 表达优先"]
        G1["图 → 结构化文本 → 表"]:::c
        G2["架构/流程/关系优先 mermaid"]:::c
    end
    subgraph C3["③ 目录清"]
        D1["命名 + 路径约束"]:::c
    end
    subgraph C4["④ 证据足"]
        E1["Level A/B 写入"]:::c
        E2["C 标注 / D 禁止"]:::c
    end
    subgraph C5["⑤ 产出聚"]
        O1["管线阶段 → 文件创建"]:::c
    end
    subgraph C6["⑥ 裁剪准"]
        T1["T1/T2/T3 增量分级"]:::c
    end
    subgraph C7["⑦ 无魔数"]
        N1["硬编码数值 → 命名常量"]:::c
        N2["阈值/量级/时限 → 语义描述"]:::c
    end
    subgraph C8["⑧ 效果证"]
        V1["技术评审 → 效果示意"]:::c
        V2["实施报告 → 实施截图"]:::c
        V3["实施报告 → 可操作验证步骤"]:::c
    end

    C1 --> C2 --> C3 --> C4 --> C5 --> C6 --> C7 --> C8 --> C9

    subgraph C8["⑧ 效果证"]
        V1["技术评审 → 效果示意"]:::c
        V2["实施报告 → 实施截图"]:::c
        V3["实施报告 → 可操作验证步骤"]:::c
    end
    subgraph C9["⑨ 单源生"]
        S1["HTML 唯一数据源<br/>= 场景 index.md"]:::c
        S2["HTML 不可脱离 index.md<br/>独立编写或硬编码"]:::c
        S3["index.md 变更 → HTML 必重生"]:::c
    end


```

| 约束 | 一句话 | 违反示例 |
|------|--------|---------|
| ① 版头齐 | 每文档必含版本行 + 标题链接跳转目录 + 导航块，字段可验证，链接可闭合 | 无 F.meta 版本行 / 无 F.toc 目录 / 导航块链接指向不存在文件 |
| ② 表达优先 | 图 → 结构化文本 → 表，架构/流程/关系优先 mermaid | 大段文字描述架构，无图 |
| ③ 目录清 | 故事文档按 `<name>/` 独立子目录 | 文档散落在项目根目录 |
| ④ 证据足 | Level A/B 写入，C 标注待补充，D 禁止出现 | "应该有个 UserService" |
| ⑤ 产出聚 | 文件按管线阶段创建，不可提前 | 编码前已写好实施报告 |
| ⑥ 裁剪准 | 增量更新按 T1/T2/T3 自动裁剪管线 | T1 措辞修正跑完整管线 |
| ⑦ 无魔数 | 硬编码数值必须语义化：代码用命名常量，文档用语义描述 | `Math.max(2, 28)` / "最近 5 个故事" |
| ⑧ 效果证 | 技术评审必含效果示意，实施报告必含截图+可操作验证步骤（后端 curl，前端操作路径） | 实施报告只有文字无截图无验证命令 |
| ⑨ 单源生 | 场景 7 类 HTML 的唯一数据源是对应场景的 `index.md`；HTML 不可独立创作，index.md 变更后必须重生 | 直接写一份「演示.html」文案而不从 index.md 提取 |

<a id="scope"></a>
## 适用

`docs/故事任务面板/` 下的故事文档产出。`skills/` 目录下的规则与角色定义不受此约束。

目录的创建、删除、重命名由 `/rui-story` 管理，详见 [rui-story SKILL.md](../skills/rui-story/SKILL.md)。文档内容生成由 `/rui doc` 负责。

<a id="meta-nav"></a>
## ① 版头齐

```mermaid
flowchart LR
    subgraph 必含["每文档必含三组件"]
        direction TB
        TOC["F.toc<br/>标题链接跳转目录"]:::must
        NAV["F.nav<br/>导航块"]:::must
    end
    META --> DOC_TOP["文档开头<br/>紧跟 # 标题"]:::out
    TOC --> DOC_TOP
    NAV --> DOC_END["主体章节末尾"]:::out


```

三组件位序不可变：

```
# 文档标题
> F.meta — 版本行            ← 文档开头，紧跟标题
  F.toc — 标题链接跳转目录    ← 文档开头，紧跟 F.meta，无前缀无标签

... 正文 ...

> F.nav — 导航块             ← 主体章节末尾（生效标志之前）
```

### F.meta 版本行

置于文档标题（`#`）之后、F.toc 之前。格式：

```markdown
> v{版本} | {YYYY-MM-DD} | {模型名} | feat/{name}
```

| 字段 | 说明 | 示例 | 必填 |
|------|------|------|:---:|
| `v{版本}` | 项目当前版本号 | `v1.6.6` | ✓ |
| `{日期}` | 文档生成/更新日期，ISO 8601 | `2026-05-21` | ✓ |
| `{模型}` | 生成该文档的模型名 | `Claude Opus 4.7` | ✓ |
| `{分支}` | 当前 git 分支名 | `feat/user-login` | ✓ |

**约束**：
- 占位符 `{...}` 留空即偏差（`#1`）
- 版本号必须与 `plugin.json` / `CLAUDE.md` 一致
- 分支名必须与实际 git 分支一致，不可凭记忆填写

### F.toc 标题链接跳转目录

置于 F.meta 之后、正文第一个 `##` 之前。列出文档内所有 `##` 级标题链接，以 `·` 分隔单行排布，无前缀无标签。格式：

```markdown
[§1 概述](#sec1) · [§2 设计](#sec2) · [§3 测试](#sec3) · [§4 附录](#sec4)
```

| 规则 | 说明 |
|------|------|
| 定位 | F.meta 之后，正文首个 `##` 之前，独占一行 |
| 覆盖 | 文档内全部 `##` 级标题，不遗漏 |
| 锚点 | 统一使用 `<a id="..."></a>` 显式锚点（纯 ASCII kebab-case），置于目标 `##` 标题上方 |
| 格式 | 单行，纯 `[标题](#id)` · `[标题](#id)` ...，无前缀无标签 |
| 排列 | 按标题在文档中的出现顺序 |
| 豁免 | `README.md` / `CLAUDE.md` 等索引文件不要求 F.toc |

### F.nav 导航块

置于主体章节末尾（生效标志之前）。格式：

```markdown
---

> 关联文档：[上一篇](../<prev>/) · [下一篇](../<next>/) · [文档索引](../)
> 上游基线：[故事任务.md](./故事任务.md) · [场景-1-<slug>/index.md](./场景-1-<slug>/index.md)
> 生成模型：{模型名} | 生成日期：{YYYY-MM-DD}
```

| 字段 | 说明 | 必填 |
|------|------|:---:|
| 关联文档 | 上一篇/下一篇故事文档链接或索引链接 | ✓ |
| 上游基线 | 本文档所依赖的上游文档（如故事任务.md → 场景-N-<slug>.md 的依赖链） | ✓ |
| 生成模型 | 生成该文档的模型名（与 F.meta 一致） | ✓ |
| 生成日期 | ISO 8601 日期（与 F.meta 一致） | ✓ |

**约束**：
- 索引文件（README.md / CLAUDE.md）不要求导航块（`#2`）
- 基线文档（故事任务.md）的导航块侧重下游链接到场景文档
- 场景文档（场景-N-<slug>.md）的导航块侧重上游溯源到基线
- 链接目标必须存在，不可指向不存在的文件

| # | 规则 | 反例 |
|---|------|------|
| 1 | 版本行必填，占位符 `{...}` 留空即偏差 | `v{版本} \| {日期}` — 未替换占位符 |
| 2 | 主体章节首尾含导航块（F.nav），索引文件除外 | 文章末尾无关联文档链接 |
| 3 | 版本行字段必须可验证：版本号对 `plugin.json`、分支对 `git branch` | 分支写 `feat/user-login` 但实际在 `main` |
| 4 | 导航块上游基线链必须闭合：每个链接指向已存在的文档 | 指向 `./使用场景.md` 但该文件不存在（已迁移至 场景-N-<slug>.md） |
| 5 | F.toc 必须覆盖文档内全部 `##` 级标题，无一遗漏 | 文档有 8 个 `##` 但 F.toc 只列出 5 个 |
| 6 | F.toc 锚点必须为纯 ASCII kebab-case，使用 `<a id>` 显式标记 | 锚点含中文或 Unicode 符号导致跳转失效 |

<a id="diagram-first"></a>
## ② 表达优先

```mermaid
flowchart LR
    subgraph 优先级["表达优先级（不可降级）"]
        direction TB
        B["② 结构化文本<br/>列表 / 层级 / 关键点<br/>补充图中无法容纳的细节"]:::second
        C["③ 表<br/>数据对照 / 矩阵<br/>精确数值与映射"]:::third
    end
    A --> B --> C

    subgraph 反例["降级违规"]
        direction TB
        X2["对比信息用列表 → 应改用表格"]:::bad
        X3["以无图文档为出发点 → 应先画图"]:::bad
    end


```

| # | 规则 | 反例 |
|---|------|------|
| 3 | **图优先** — 架构、流程、组件关系、数据流必须先以 mermaid 图呈现，文字仅补充图中无法容纳的细节 | 一份技术评审无任何 mermaid 图 |
| 4 | **表优于列表** — 需要对照、比较、映射的信息优先用表格，纯枚举或步骤用列表 | 接口参数用文字列表逐行描述而非表格 |
| 5 | **禁止文替图** — 能用图表达的信息，不得仅用文字。文档以图为骨架，文字为血肉 | "系统由 A、B、C 三个模块组成，A 调用 B，B 调用 C…" — 无图 |
| 6 | **图先于文** — 每个章节的 mermaid 图位于该章节文字之前，读者先看结构再读细节 | 先写三段背景，末尾附一个小图 |

### Mermaid 编写规范

> mermaid 语法错误是文档退化的重要来源。以下规则确保图在任何 mermaid 版本下可正常渲染。
>
> **统一配色系统见 [mermaid-theme.md](./mermaid-theme.md)**——所有 mermaid 图的 `%%{init}%%` 主题配置和 classDef 色板以该文件为唯一真相源。

| # | 规则 | 错误 | 正确 |
|---|------|------|------|
| M1 | **节点标签必须引号包裹** — 含空格、特殊字符、中文的标签必须 `[""]` | `A[用户输入]` | `A["用户输入"]` |
| M2 | **避免裸 `&`** — `&` 在 mermaid 中可能被解释为 HTML 实体边界，含 `&` 的标签必须引号包裹 | `A["D0 & D7"]` | `A["D0 & D7"]` |
| M3 | **避免 `()` 在节点标签中** — 圆括号是 mermaid 形状语法，含 `()` 的文本必须引号包裹 | `A[init()]` | `A["init()"]` |
| M3a | **避免 `--` 在节点标签中** — `--` 是 mermaid 连线语法（`---`=粗线，`-->`=箭头），含 `--` 的文本必须引号包裹，尤其菱形节点 `{--x}` → `{"--x"}` | `C{--no-send?}` | `C{"--no-send?"}` |
| M4 | **direction 必须在 subgraph 内声明** — 含 2+ 节点的 subgraph 必须首行声明 `direction LR` 或 `direction TB` | subgraph 内无 direction 声明 | `subgraph X["标题"]`<br/>`    direction LR`<br/>`    A --> B`<br/>`end` |
| M5 | **style/classDef 目标 ID 必须精确匹配** — 节点 ID 不含引号和特殊字符 | `style A["xx"] ...` | `style A ...`（只写 ID 部分）|
| M6 | **仅允许 `<br/>` 作为 HTML 标签** — `<br/>` 是 mermaid 中唯一支持的多行换行机制，可在双引号标签内使用；其他 HTML 标签（`<b>`、`<i>`、`<div>`、`<font>` 等）禁止 | `A["用户<b>输入</b>"]` | `A["用户<br/>输入"]` |
| M7 | **简短的箭头标签** — 箭头上的标签（`-->|text|`）应简短（≤ 20 字符），避免换行和特殊字符 | `-->|"用户点击提交按钮后触发"|` | `-->|"点击提交"|` |
| M8 | **htmlLabels 由渲染平台管理** — GitHub/VS Code Markdown Preview 的 mermaid 渲染器自动处理 htmlLabels。仅在导出为自包含 HTML 时需显式设置 `mermaid.initialize({htmlLabels: true})` | — | — |
| M9 | **`%%{init}%%` 主题必须声明** — 每个文件的**第一个** mermaid 代码块必须包含 `%%{init}%%` 主题配置，配色取自 [mermaid-theme.md](./mermaid-theme.md) 的 Tokyo Night Dark 模板 | 文件中所有 mermaid 图均无 `%%{init}%%` | 首个 mermaid 块顶部加 `%%{init: {...}}%%` |
| M10 | **classDef 使用统一语义色板** — `classDef` 定义的颜色必须来自 [mermaid-theme.md](./mermaid-theme.md#classdef) 中的 12 个语义类。每文件只定义其实际使用的类 | 自造 ad-hoc fill/stroke hex 值 | 从 mermaid-theme.md 色板复制语义 classDef |
| M11 | **subgraph 方向必须声明** — 含 2+ 节点的每个 subgraph，首行必须声明 `direction`（同 M4 强化版） | subgraph 无 direction | `subgraph X["标题"]`<br/>`    direction LR` |
| M12 | **语义类名优先** — classDef 名称使用抽象语义（`core`/`exec`/`review`/`risk`/`good`/`bad`），不使用视觉描述（`red`/`blue`/`green`/`yellow`） | `classDef red fill:#f87171` | `classDef risk fill:#2a1a1a,stroke:#f87171,color:#f87171` |

**验证规则**：任何包含 mermaid 图的文件在提交前必须通过以下检查：
- 文件中首个 mermaid 代码块含 `%%{init}%%` 主题配置（`grep -c '%%{init' <file>`）
- 含 2+ 节点的 subgraph 均有 `direction` 声明
- 所有 `flowchart`/`graph` 图中引用的节点 ID 均在图中定义
- `classDef` 颜色与 [mermaid-theme.md](./mermaid-theme.md) 色板一致
- 无 `<b>`、`<i>`、`<div>`、`<font>` 等禁止的 HTML 标签（`<br/>` 除外）
- mermaid.live 粘贴验证无语法错误

<a id="dir-clean"></a>
## ③ 目录清

```mermaid
flowchart LR
    INPUT["CLI 输入<br/>&lt;name&gt;"]:::src --> PARSE["解析 kebab-case"]:::op
    PARSE --> PATH["docs/故事任务面板/<br/>&lt;name&gt;/"]:::out


```

| 文档类 | 路径模式 | 命名规则 | 用途 |
|--------|---------|---------|------|
| 故事 | `docs/故事任务面板/<name>/` | 文件含项目名前缀 | 执行 |

| 约束 | 规则 |
|------|------|
| `<name>` | 纯语义 kebab-case（如 `user-login`），不加项目名前缀 |
| CLI 输入 | `<name>` |
| 场景文档文件名 | 如 `场景-1-<slug>/index.md`（含 §0-§4 全部生命周期节） |

<a id="evidence"></a>
## ④ 证据足

证据等级定义见 [skills/rui/AGENT.md](../../rui/AGENT.md#证据等级)（A 已验证 · B 可推导 · C 待补充 · D 禁止）。文档生成阶段遵循同等级规则。

| # | 规则 | 反例 |
|---|------|------|
| 7 | Level A/B 可直接写入；C 标注 `> 待补充`；D 禁止出现 | 无来源断言"系统性能提升 30%" |
| 8 | 不编造未验证的模块名/接口/路径/文件名 | "新增 `/api/v2/users` 接口" — 无源码证据 |
| 9 | 跨文档引用先指向索引文件，再按需深入章节 | 直接链到某个章节，跳过索引 |

<a id="output-cohesion"></a>
## ⑤ 产出聚

```mermaid
flowchart LR
    subgraph 阶段["管线阶段"]
        direction TB
        P2["实现"]:::phase
        P3["验证"]:::phase
    end
    subgraph 产出["创建文件"]
        direction TB
        O2["知识图谱.json<br/>知识图谱.html"]:::file
    end
    P1 --> O1
    P3 --> O2


```

| 阶段 | 创建文件 | 条件 |
|------|---------|------|
| 文档生成 | 故事任务.md + 场景-N-<slug>.md（§0 技术评审 · §1 测试设计） + 场景-N-<slug>.html（架构图） | 故事任务.md 必创建 |
| 实现 | 场景-N-<slug>.md（§2 实施报告） | 由 coder 按模块逐次写入 |
| 验证 | 场景-N-<slug>.md（§3 测试报告 · §4 自改进） + 知识图谱.json + 知识图谱.html | 由 tester 写入 |
| 交付 | 交付收口（见 delivery-gate.md） | — |

<a id="precision-cut"></a>
## ⑥ 裁剪准

```mermaid
flowchart TD
    CHANGE["变更请求"] --> Q1{"变更范围?"}
    Q1 -->|"措辞/格式修正"| T1["T1<br/>跳过影响分析<br/>跳过架构设计<br/>仅刷新变更章节"]:::t1
    Q1 -->|"增删/接口变更"| T2["T2<br/>裁剪影响分析<br/>裁剪架构设计<br/>刷新目标 + 下游"]:::t2
    Q1 -->|"边界变化/跨故事重构"| T3["T3<br/>完整重跑影响分析<br/>完整重跑架构设计<br/>全级联刷新"]:::t3


```

| 级别 | 范围 | 影响分析 | 架构设计 | 文档刷新 |
|------|------|---------|---------|---------|
| **T1** | 措辞/格式修正 | 跳过 | 跳过 | 仅变更章节 |
| **T2** | 增删/接口变更 | 裁剪 | 裁剪 | 目标 + 下游 |
| **T3** | 边界变化/跨故事重构 | 完整重跑 | 完整重跑 | 全级联刷新 |

<a id="no-magic"></a>
## ⑦ 无魔数

```mermaid
flowchart LR
    subgraph 禁止["❌ 魔法数字"]
        direction TB
        N2["文档中硬编码量级<br/>如 100 个 · < 5 秒"]:::bad
        N3["阈值/比例裸值<br/>通过率 ≥ 90%"]:::bad
    end
    subgraph 必须["✅ 语义化"]
        direction TB
        S2["语义描述<br/>超出常规面板量级<br/>在合理响应时间内"]:::good
        S3["门禁概念<br/>不低于门禁阈值<br/>达到质量基线标准"]:::good
    end
    禁止 --> 必须


```

| # | 规则 | 反例 |
|---|------|------|
| 12 | **代码无魔数** — 所有硬编码数值（超时/宽度/数量/阈值）提取为命名常量，常量名语义化 | `Math.max(2, 28 - left.length)` — 2 和 28 无名称 |
| 13 | **文档无魔数** — 配置值（展示条数/量级阈值/时限）用语义描述替代裸数字，或引用命名常量 | "最近修改的 5 个故事" — 5 写死在文档中 |
| 14 | **阈值命名** — 质量门禁通过率、性能时限等阈值定义为门禁概念，不直接写百分比/秒数 | "P1 通过率 ≥ 90%" → 应改为 "P1 通过率不低于门禁阈值" |

### 代码与文档的分工

| 场景 | 代码 | 文档 |
|------|------|------|
| 最近活动展示条数 | `const RECENT_COUNT = 5` | "最近修改的故事列表"（不写死数量） |
| 列格式化宽度 | `const LEFT_COLUMN_WIDTH = 28` | 无需在文档中体现 |
| 边界测试量级 | 测试数据工厂参数 | "超出常规面板量级"（描述场景，不硬编码个数） |
| 响应时限 | `const RESPONSE_TIMEOUT_MS = 5000` | "在合理响应时间内完成" |
| 质量门禁阈值 | `const P1_PASS_RATE = 0.9` | "P1 通过率不低于门禁阈值" |

### 适用范围

- `skills/` 下的帮助脚本（`.mjs`/`.js`/`.ts`）
- `docs/故事任务面板/` 下的故事文档（01–10）
- `rules/` 下的规则文档
- `skills/<skill>/<role>.md` Agent 角色定义

<a id="proof"></a>
## ⑧ 效果证

```mermaid
flowchart LR
    subgraph 评审["技术评审"]
        direction TB
        R2["前端评审 → UI 效果示意<br/>展示预期界面形态"]:::review
    end
    subgraph 报告["实施报告"]
        direction TB
        P2["前端报告 → UI 截图<br/>展示实际实现的界面"]:::report
        P3["🔑 可操作验证步骤<br/>后端: curl 命令<br/>前端: 操作路径"]:::must
    end
    评审 --> 报告 --> P3


```

| # | 规则 | 反例 |
|---|------|------|
| 15 | **评审有效果** — 技术评审必须包含效果示意 mermaid 图，展示实现后的预期系统行为与数据流（后端）或预期界面形态（前端） | 技术评审只有接口列表和组件树，无效果总览图 |
| 16 | **报告有截图** — 实施报告必须包含实际 API 响应截图或终端运行输出截图（后端）或实际 UI 截图（前端）。截图需附简要说明 | 实施报告无任何截图，仅文字描述"已完成" |
| 17 | **报告可操作** — 实施报告必须包含每个接口的 curl 验证命令（含完整 URL、请求体、预期响应）（后端）或从入口到目标页面的操作路径（含点击序列与预期显示）（前端） | "API 已通过测试" — 无 curl 命令可供复现；"页面正常显示" — 无操作路径可供验证 |

### 效果图类型指南

| 文档 | 效果图类型 | 最低数量 | 内容要求 |
|------|-----------|---------|---------|
| 技术评审（后端） | mermaid flowchart / sequenceDiagram | ≥ 1 | 展示核心业务流经各服务/模块的完整路径与关键决策点 |
| 技术评审（前端） | mermaid 组件交互图 / UI 线框图 | ≥ 1 | 展示核心用户操作对应的组件渲染路径与状态变化 |
| 实施报告（后端） | 终端截图（含 curl 请求+响应） | ≥ 1 张/接口 | 完整展示请求命令与服务器返回结果 |
| 实施报告（前端） | UI 截图 | ≥ 1 张/场景 | 展示实际渲染的页面，覆盖正常态 + 关键状态（空/错误/加载） |

### 可操作验证步骤规范

| 文档 | 验证格式 | 必含要素 |
|------|---------|---------|
| 实施报告（后端） | fenced code block (`bash`)，每接口一块 | 完整 curl 命令（含 URL、method、headers、body）、预期响应摘要。不可用 `localhost`，使用可配置的基础 URL 占位符 `${BASE_URL}` |
| 实施报告（前端） | 编号操作步骤列表 | 起始页面 → 每步操作（点击/输入）→ 预期显示。步骤可被独立复现，不依赖上下文记忆 |

<a id="single-source"></a>
## ⑨ 单源生

> **场景 7 类 HTML 的唯一数据源 = 对应场景的 `index.md`。** HTML 不可独立创作；`index.md` 变更后必须重生 HTML。

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#1e1f2b',
  'primaryTextColor': '#a9b1d6',
  'primaryBorderColor': '#3d59a1',
  'lineColor': '#3d59a1',
  'secondaryColor': '#2b2d3b',
  'tertiaryColor': '#21232f'
}}}%%
flowchart LR
    MD["场景-N-&lt;slug&gt;/<br/>index.md<br/>§0–§4 五章节"]:::src --> EXTRACT["rui-html<br/>extractor.mjs<br/>提取结构化数据"]:::tool
    EXTRACT --> GEN["generator.mjs<br/>模板渲染"]:::tool
    GEN --> H1["计划清单.html"]:::out
    GEN --> H2["架构图.html"]:::out
    GEN --> H3["知识图谱.html"]:::out
    GEN --> H4["源码.html"]:::out
    GEN --> H5["测试面板.html"]:::out
    GEN --> H6["演示.html"]:::out
    GEN --> H7["审查.html"]:::out

    classDef src fill:#3d59a1,color:#fff
    classDef tool fill:#fbbf24,color:#000
    classDef out fill:#34d399,color:#000
```

### 核心原则

| # | 规则 | 反例 | 处置 |
|---|------|------|------|
| 18 | **唯一数据源** — 场景目录下 7 类 HTML（计划清单/架构图/知识图谱/源码/测试面板/演示/审查）必须从 `index.md` §0–§4 五章节提取生成，不可独立创作 | 直接写一份「演示.html」文案，与 index.md 无对应关系 | 删除 HTML，重跑 `/rui-html <story> --force` |
| 19 | **不可硬编码场景内容** — HTML 中的文字、表格、mermaid 图必须能在 `index.md` 中找到对应来源；占位符、虚构示例不得写入 HTML | 演示.html 含「此功能由张三在 2024 年开发」等 index.md 之外的内容 | 删除虚构内容，重新生成 |
| 20 | **章节一一对应** — `index.md` 每一节（§0/§1/§2/§3/§4）映射到特定 HTML 类型：§0→架构图/演示，§1→测试面板，§2→计划清单/源码，§3→测试面板，§4→审查 | 把 §3 测试报告的内容写入 审查.html（应属测试面板） | 按映射表调整模板选择 |
| 21 | **变更即重生** — `index.md` 任一章节发生内容变更（不限于格式/措辞），对应的 HTML 必须用 `/rui-html <story> --force` 重新生成 | index.md 已更新但 HTML 未变，存在内容漂移 | 重跑生成命令，覆盖旧文件 |
| 22 | **模板为壳，markdown 为核** — 模板（`skills/rui-html/templates/`）只承载样式、布局、组件；所有场景特异性内容（标题、版本号、模块名、表格数据、mermaid 图）一律来自 `index.md` | 模板里直接写「本场景展示 XX 模块的初始化流程」 | 模板回归为通用壳 |
| 23 | **不可手改 HTML** — 生成后人工编辑 HTML 文件不被允许（除调试用临时改动并已还原） | 手动修改演示.html 字号/颜色/段落顺序 | 还原修改；如需改样式，改模板而非 HTML |

### 章节—HTML 映射表

| `index.md` 章节 | 主要 HTML 文档 | 次要 HTML 文档 | 数据用途 |
|----------------|---------------|---------------|---------|
| §0 技术评审 | 架构图.html · 演示.html | — | mermaid 架构图 · 效果示意 |
| §1 测试设计 | 测试面板.html | — | TC-N/TC-B 用例表 · Gate A 交接 |
| §2 实施报告 | 计划清单.html · 源码.html | 演示.html | 步骤清单 · 产物清单 · 架构决策 |
| §3 测试报告 | 测试面板.html | 审查.html | 套件结果 · 门禁判定 |
| §4 自改进 | 审查.html | — | D0–D7 诊断 · 改进建议 |
| 元数据（首行 + 版本行） | 全部 7 份 | — | 标题 · 版本号 · 日期 |

### 反例与处置

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#1e1f2b',
  'primaryTextColor': '#a9b1d6',
  'primaryBorderColor': '#3d59a1',
  'lineColor': '#3d59a1',
  'secondaryColor': '#2b2d3b',
  'tertiaryColor': '#21232f'
}}}%%
flowchart TD
    BAD["❌ 违规形态"]:::bad
    BAD --> B1["HTML 凭空编写<br/>无 index.md 来源"]:::bad
    BAD --> B2["HTML 含 index.md<br/>不存在的内容"]:::bad
    BAD --> B3["index.md 更新<br/>HTML 未重生"]:::bad
    BAD --> B4["模板里硬编码<br/>场景特异性内容"]:::bad
    B1 & B2 & B3 & B4 --> FIX["重跑 /rui-html &lt;story&gt; --force<br/>或修正模板"]:::fix

    classDef bad fill:#7f1d1d,color:#fff
    classDef fix fill:#34d399,color:#000
```

| 违规形态 | 检测方法 | 修复 |
|---------|---------|------|
| HTML 内容无 index.md 来源 | 抽取 HTML 文本，grep 不到 `index.md` | 删除 HTML 重生 |
| HTML 含 index.md 之外的事实断言 | 文本溯源，证据 Level A/B 验证失败 | 删虚构内容重生 |
| index.md 变更后 HTML 未更新 | 比对 git diff 中 index.md 与 HTML 改动是否同步 | 跑 `--force` 重生 |
| 模板硬编码场景内容 | 模板路径 `skills/rui-html/templates/` 下 grep 场景专有名词 | 模板改通用壳 |

### 适用范围

| 包含 | 不包含 |
|------|--------|
| `docs/故事任务面板/<story>/场景-N-<slug>/*.html` | `docs/故事任务面板/<story>/演示/*.html`（独立演示页，可手写） |
| 7 类文档：计划清单/架构图/知识图谱/源码/测试面板/演示/审查 | `docs/故事任务面板/<story>/知识图谱.html`（汇总页，从 json 生成） |
| 模板：`skills/rui-html/templates/cat-a/` 与 `cat-b/` | 模板目录内的示例 HTML（仅作模板参考源） |

### 与其他约束的协同

| 约束 | 协同方式 |
|------|---------|
| ④ 证据足 | HTML 中所有断言必须能在 `index.md` 找到 Level A/B 证据 |
| ⑤ 产出聚 | HTML 在实现/验证阶段由 `/rui-html` 生成，遵循管线阶段 |
| ⑥ 裁剪准 | T1 措辞修正 → index.md 修改后 HTML 必须 `--force` 重生 |
| ⑦ 无魔数 | HTML 内的数值与配置也来自 `index.md`，无独立魔数来源 |

---

> **补充文档触发 · 策展 · 例外 · 生效标志** → 详见 **[doc-generation-lifecycle.md](doc-generation-lifecycle.md)**。
