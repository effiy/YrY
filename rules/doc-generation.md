---
paths:
  - "docs/**/*.md"
  - ".claude/formulas.md"
---

# doc-generation

> 文档生成的七条强制约束。表达优先：图 → 结构化文本 → 表。编号即顺序；不可提前创建。

故事文档公式见 [formulas.md](../skills/rui/formulas.md)；目录与数据契约见 [coder.md](../skills/rui/coder.md)。

## 七约束全景

```mermaid
flowchart TB
    subgraph C1["① 版头齐"]
        H1["F.meta 版本头"]:::c
        H2["F.nav 导航块"]:::c
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

    C1 --> C2 --> C3 --> C4 --> C5 --> C6 --> C7

    classDef c fill:#e3f2fd,stroke:#1565c0;
```

| 约束 | 一句话 | 违反示例 |
|------|--------|---------|
| ① 版头齐 | 每文档必含版本行 + 导航块 | 无 F.meta 版本头直接开写 |
| ② 表达优先 | 图 → 结构化文本 → 表，架构/流程/关系优先 mermaid | 大段文字描述架构，无图 |
| ③ 目录清 | 故事文档按 `<name>/` 独立子目录 | 文档散落在项目根目录 |
| ④ 证据足 | Level A/B 写入，C 标注待补充，D 禁止出现 | "应该有个 UserService" |
| ⑤ 产出聚 | 文件按管线阶段创建，不可提前 | 编码前已写好实施报告 |
| ⑥ 裁剪准 | 增量更新按 T1/T2/T3 自动裁剪管线 | T1 措辞修正跑完整管线 |
| ⑦ 无魔数 | 硬编码数值必须语义化：代码用命名常量，文档用语义描述 | `Math.max(2, 28)` / "最近 5 个故事" |

## 适用

`docs/故事任务面板/` 下的故事文档产出。参考文档公式（F.ref.\*）不受此约束。

目录的创建、删除、重命名由 `/rui-story` 管理，详见 [rui-story SKILL.md](../skills/rui-story/SKILL.md)。文档内容生成由 `/rui doc` 负责。

## ① 版头齐

```mermaid
flowchart LR
    subgraph 必含["每文档必含"]
        META["F.meta<br/>版本行：v{版本} | {日期} | {模型} | {分支}"]:::must
        NAV["F.nav<br/>导航块：关联文档链接"]:::must
    end
    META --> DOC["文档开头"]:::out
    NAV --> DOC
    NAV --> TAIL["主体章节末尾"]:::out

    classDef must fill:#e3f2fd,stroke:#1565c0;
    classDef out fill:#e8f5e9,stroke:#2e7d32;
```

| # | 规则 | 反例 |
|---|------|------|
| 1 | 版本行必填，占位符 `{...}` 留空即偏差 | `v{版本} \| {日期}` — 未替换占位符 |
| 2 | 主体章节首尾含导航块（F.nav），索引文件除外 | 文章末尾无关联文档链接 |

## ② 表达优先

```mermaid
flowchart LR
    subgraph 优先级["表达优先级（不可降级）"]
        A["① 图<br/>mermaid / 流程图<br/>架构 / 流程 / 关系"]:::first
        B["② 结构化文本<br/>列表 / 层级 / 关键点<br/>补充图中无法容纳的细节"]:::second
        C["③ 表<br/>数据对照 / 矩阵<br/>精确数值与映射"]:::third
    end
    A --> B --> C

    subgraph 反例["降级违规"]
        X1["架构用大段文字 → 应改用 mermaid"]:::bad
        X2["对比信息用列表 → 应改用表格"]:::bad
        X3["以无图文档为出发点 → 应先画图"]:::bad
    end

    classDef first fill:#e8f5e9,stroke:#2e7d32;
    classDef second fill:#e3f2fd,stroke:#1565c0;
    classDef third fill:#f3e5f5,stroke:#6a1b9a;
    classDef bad fill:#ffebee,stroke:#c62828;
```

| # | 规则 | 反例 |
|---|------|------|
| 3 | **图优先** — 架构、流程、组件关系、数据流必须先以 mermaid 图呈现，文字仅补充图中无法容纳的细节 | 一份技术评审无任何 mermaid 图 |
| 4 | **表优于列表** — 需要对照、比较、映射的信息优先用表格，纯枚举或步骤用列表 | 接口参数用文字列表逐行描述而非表格 |
| 5 | **禁止文替图** — 能用图表达的信息，不得仅用文字。文档以图为骨架，文字为血肉 | "系统由 A、B、C 三个模块组成，A 调用 B，B 调用 C…" — 无图 |
| 6 | **图先于文** — 每个章节的 mermaid 图位于该章节文字之前，读者先看结构再读细节 | 先写三段背景，末尾附一个小图 |

## ③ 目录清

```mermaid
flowchart LR
    INPUT["CLI 输入<br/>&lt;name&gt;"]:::src --> PARSE["解析 kebab-case"]:::op
    PARSE --> PATH["docs/故事任务面板/<br/>&lt;name&gt;/"]:::out

    classDef src fill:#e8f5e9,stroke:#2e7d32;
    classDef op fill:#e3f2fd,stroke:#1565c0;
    classDef out fill:#f3e5f5,stroke:#6a1b9a;
```

| 文档类 | 路径模式 | 编号规则 | 用途 |
|--------|---------|---------|------|
| 故事 | `docs/故事任务面板/<name>/` | 编号前缀 + 补充 | 执行 |

| 约束 | 规则 |
|------|------|
| `<name>` | kebab-case |
| CLI 输入 | `<name>` |
| 03/04/06/07 文件名 | 如 `{project}-03-后端技术评审.md` |

## ④ 证据足

证据等级定义见 [agents/AGENT.md](../agents/AGENT.md#证据等级)（A 已验证 · B 可推导 · C 待补充 · D 禁止）。文档生成阶段遵循同等级规则。

| # | 规则 | 反例 |
|---|------|------|
| 7 | Level A/B 可直接写入；C 标注 `> 待补充`；D 禁止出现 | 无来源断言"系统性能提升 30%" |
| 8 | 不编造未验证的模块名/接口/路径/文件名 | "新增 `/api/v2/users` 接口" — 无源码证据 |
| 9 | 跨文档引用先指向索引文件，再按需深入章节 | 直接链到某个章节，跳过索引 |

## ⑤ 产出聚

```mermaid
flowchart LR
    subgraph 阶段["管线阶段"]
        P1["文档生成"]:::phase
        P2["验证"]:::phase
        P3["自改进"]:::phase
        P4["交付"]:::phase
    end
    subgraph 产出["创建文件"]
        O1["01 故事任务<br/>02 用户使用场景<br/>03/04 技术评审<br/>05 测试评审"]:::file
        O2["06/07 实施报告<br/>08 测试报告"]:::file
        O3["09 自改进复盘"]:::file
        O4["00 消息通知列表"]:::file
    end
    P1 --> O1
    P2 --> O2
    P3 --> O3
    P4 --> O4

    classDef phase fill:#e3f2fd,stroke:#1565c0;
    classDef file fill:#f3e5f5,stroke:#6a1b9a;
```

| 阶段 | 创建文件 | 条件 |
|------|---------|------|
| 文档生成 | 01 + 02 + 03/04 + 05 + 补充 | 01/用户场景 必创建；03/04 按项目类型 |
| 验证 | 06/07/08 | 有对应技术评审时 |
| 自改进 | 09 | 必创建 |
| 交付 | 00 | 自动追加 |

## ⑥ 裁剪准

```mermaid
flowchart TD
    CHANGE["变更请求"] --> Q1{"变更范围?"}
    Q1 -->|"措辞/格式修正"| T1["T1<br/>跳过影响分析<br/>跳过架构设计<br/>仅刷新变更章节"]:::t1
    Q1 -->|"增删/接口变更"| T2["T2<br/>裁剪影响分析<br/>裁剪架构设计<br/>刷新目标 + 下游"]:::t2
    Q1 -->|"边界变化/跨故事重构"| T3["T3<br/>完整重跑影响分析<br/>完整重跑架构设计<br/>全级联刷新"]:::t3

    classDef t1 fill:#e8f5e9,stroke:#2e7d32;
    classDef t2 fill:#fff3e0,stroke:#e65100;
    classDef t3 fill:#ffebee,stroke:#c62828;
```

| 级别 | 范围 | 影响分析 | 架构设计 | 文档刷新 |
|------|------|---------|---------|---------|
| **T1** | 措辞/格式修正 | 跳过 | 跳过 | 仅变更章节 |
| **T2** | 增删/接口变更 | 裁剪 | 裁剪 | 目标 + 下游 |
| **T3** | 边界变化/跨故事重构 | 完整重跑 | 完整重跑 | 全级联刷新 |

## ⑦ 无魔数

```mermaid
flowchart LR
    subgraph 禁止["❌ 魔法数字"]
        N1["代码中裸数值<br/>Math.max(2, 28)"]:::bad
        N2["文档中硬编码量级<br/>如 100 个 · < 5 秒"]:::bad
        N3["阈值/比例裸值<br/>通过率 ≥ 90%"]:::bad
    end
    subgraph 必须["✅ 语义化"]
        S1["命名常量<br/>COLUMN_MIN_PADDING<br/>LEFT_COLUMN_WIDTH"]:::good
        S2["语义描述<br/>超出常规面板量级<br/>在合理响应时间内"]:::good
        S3["门禁概念<br/>不低于门禁阈值<br/>达到质量基线标准"]:::good
    end
    禁止 --> 必须

    classDef bad fill:#ffebee,stroke:#c62828;
    classDef good fill:#e8f5e9,stroke:#2e7d32;
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
- `agents/` 下的 Agent 定义

## 补充文档

```mermaid
flowchart TD
    STORY["故事需求"] --> Q1{"涉及 UI 改造?"}
    Q1 -->|"是"| D1["📄 页面设计.md"]:::doc
    Q1 -->|"否"| Q2{"涉及 API 变更?"}
    Q2 -->|"是"| D2["📄 API契约.md"]:::doc
    Q2 -->|"否"| Q3{"涉及数据存储变更?"}
    Q3 -->|"是"| D3["📄 数据迁移.md"]:::doc
    Q3 -->|"否"| Q4{"涉及第三方集成?"}
    Q4 -->|"是"| D4["📄 集成方案.md"]:::doc
    Q4 -->|"否"| Q5{"涉及新权限控制?"}
    Q5 -->|"是"| D5["📄 权限模型.md"]:::doc
    Q5 -->|"否"| Q6{"性能敏感?"}
    Q6 -->|"是"| D6["📄 性能基准.md"]:::doc
    Q6 -->|"否"| NONE["无需补充文档"]:::none

    classDef doc fill:#e3f2fd,stroke:#1565c0;
    classDef none fill:#eceff1,stroke:#90a4ae;
```

| 触发条件 | 生成文档 | 主导 |
|---------|---------|------|
| UI 改造 | 页面设计.md | pm |
| API 变更 | API契约.md | pm |
| 数据存储变更 | 数据迁移.md | pm |
| 第三方集成 | 集成方案.md | pm |
| 新权限控制 | 权限模型.md | pm |
| 性能敏感 | 性能基准.md | pm |

## 策展

```mermaid
flowchart LR
    CLOSE["故事关闭"]:::src --> COMMIT["git commit<br/>变更提交"]:::must
    COMMIT --> DONE["策展完成"]:::done

    FROM["--from-code"]:::src --> Q1{"req?"}
    Q1 -->|"空"| EXPLORE["探索模式<br/>pm 扫描源码 → 推荐列表<br/>用户选择 → 生成文档"]:::mode
    Q1 -->|"有值"| REVERSE["反推模式<br/>pm 从源码反推<br/>证据 Level B + 源码路径"]:::mode
    EXPLORE & REVERSE --> OUT["输出落故事任务面板"]:::out

    classDef src fill:#e8f5e9,stroke:#2e7d32;
    classDef must fill:#e3f2fd,stroke:#1565c0;
    classDef done fill:#f3e5f5,stroke:#6a1b9a;
    classDef mode fill:#fff3e0,stroke:#e65100;
    classDef out fill:#e8f5e9,stroke:#2e7d32;
```

| # | 规则 | 说明 |
|---|------|------|
| 10 | 策展阶段必须 git commit | 故事关闭但变更未提交 → 违规 |
| 11a | `--from-code` req 空：探索模式，pm 扫描源码推荐列表 | 用户选择后生成文档 |
| 11b | `--from-code` req 有值：反推模式，证据 Level B | 标注源码路径，缺口标 `> 待补充` |

## 例外

| 场景 | 处理 |
|------|------|
| T1 级变更 | 跳过影响分析与架构设计 |
| 反推命令 | 只读源码，不触发 Gate A/B（见 code-pipeline.md） |

## 生效标志

```mermaid
flowchart LR
    S1["版头齐<br/>版本行 + 导航块"]:::sig --> S2["表达优先<br/>图 → 结构化文本 → 表"]:::sig
    S2 --> S3["目录清<br/>&lt;name&gt;/ 合规"]:::sig
    S3 --> S4["证据足<br/>无 Level D 内容"]:::sig
    S4 --> S5["产出聚<br/>文件按阶段创建"]:::sig
    S5 --> S6["策展完成<br/>git commit 已提交"]:::sig
    S6 --> S7["无魔数<br/>命名常量 + 语义描述"]:::sig

    classDef sig fill:#e8f5e9,stroke:#2e7d32;
```

| 标志 | 未达标的处置 |
|------|------------|
| 版头齐：版本行 + 导航块 | 补 F.meta / F.nav |
| 表达优先：图 → 结构化文本 → 表，架构/流程/关系有 mermaid | 文字改图，列表改表，补齐缺失的 mermaid |
| 目录清：`<name>/` 合规 | 移动文件到正确目录 |
| 证据足：无 Level D 内容 | 删 D 级内容，补 C 标注或查证升级 |
| 产出聚：文件按阶段创建，不提前 | 删除提前创建的文件 |
| 策展完成：git commit 已提交 | 执行 git commit |
| 基线溯源：03-09 均有 §0 基线溯源且链接有效 | 补基线溯源表 |
| 基线声明：01+02 均有 §0 基线声明且无禁止内容 | 补基线声明或移除禁止内容 |
| 无魔数：代码中裸数值已提取为命名常量，文档中硬编码量级/阈值已语义化 | 代码提取常量，文档改写语义描述 |
