# coder 工作手册

> 三件事：**写到哪个目录**、**文档按什么生命周期创建**、**附属数据怎么落**。

故事文档公式（F.story.\* / F.supp.\*）见 [formulas.md](./formulas.md)；强制约束见 [rules/doc-generation.md](../../rules/doc-generation.md)；coder 角色契约见 [agents/coder.md](../../agents/coder.md)。故事拆分决策树见 [agents/pm.md](../../agents/pm.md)。

[目录布局](#目录布局) · [故事目录骨架](#故事目录骨架) · [文件创建生命周期](#文件创建生命周期) · [完整度判定](#完整度判定) · [数据契约](#数据契约) · [生效标志](#生效标志)

## 目录布局

```
docs/
└── 故事任务面板/<name>/   ← 执行：主线 + 补充
```

**命名规则**：`<name>` 纯语义 kebab-case（如 `user-login`、`claude-config`），不加项目名前缀。CLI 输入 `<name>`，对应路径 `docs/故事任务面板/<name>/`。详见 [rules/doc-generation.md](../../rules/doc-generation.md)。

## 故事目录骨架

```mermaid
flowchart LR
    subgraph 基线["基线文档（问题+用户空间）"]
        B1["故事任务.md<br/>WHAT & WHY"]:::baseline
        B2["使用场景.md<br/>WHO & HOW"]:::baseline
    end
    subgraph 必选["必选（所有类型）"]
        C1["技术评审.md"]:::must
        C2["测试设计.md"]:::must
        C4["实施报告.md"]:::must
        C5["测试报告.md"]:::must
        C6["自改进复盘.md"]:::must
    end
    subgraph 补充["按需"]
        E1["{专题}.md"]:::supp
    end

```

| 文件 | 必选 | 负责人 | 阶段 |
|------|:---:|--------|------|
| 故事任务.md | ✓ | pm | 文档生成 |
| 使用场景.md | ✓ | pm | 文档生成 |
| 技术评审.md | ✓ | coder | 文档生成 |
| 测试设计.md | ✓ | tester | 文档生成 |
| 实施报告.md | ✓ | coder | 验证 |
| 测试报告.md | ✓ | tester | 验证 |
| 自改进复盘.md | ✓ | pm + reporter | 自改进 |
| {专题}.md | 按需 | pm 决策 | 文档生成 |

补充文档按需触发，决策树见 [rules/doc-generation.md](../../rules/doc-generation.md#补充文档)，公式见 [formulas.md](./formulas.md#补充文档公式)。

> **文档按管线阶段顺序创建**：故事任务+使用场景是基线（问题空间+用户空间），技术评审+测试设计是解决方案文档，实施报告+测试报告+自改进复盘是验证与改进文档——不可提前创建。

## 文件创建生命周期

```mermaid
flowchart TB
    A["需求解析"]:::phase --> B["规划"]:::phase
    B --> C["影响分析"]:::phase
    C --> D["架构设计"]:::phase
    D --> E["文档生成"]:::phase
    E -->|"创建"| E1["故事任务<br/>使用场景<br/>技术评审<br/>测试设计<br/>补充文档"]:::create
    E --> F["预检"]:::phase
    F --> G["Gate A"]:::gate
    G --> H["实现"]:::phase
    H --> I["验证"]:::phase
    I -->|"创建"| I1["实施报告<br/>测试报告"]:::create
    I --> J["自改进"]:::phase
    J -->|"创建"| J1["自改进复盘"]:::create
    J --> K["交付"]:::phase

```


## 完整度判定

```mermaid
flowchart LR
    NS["任务<br/>01 不存在"]:::s0 --> DIP["设计<br/>技术/测试评审缺失"]:::s1
    DIP --> IMP["实施<br/>必选文档齐全"]:::s2
    IMP --> TST["测试<br/>部分实施报告存在"]:::s3
    TST --> RPT["报告<br/>必选 + 自改进齐全"]:::s4
    RPT --> IMPV["改进<br/>自改进复盘存在"]:::s5

```

| 状态 | 条件 |
|------|------|
| `任务` | 故事任务文档不存在 |
| `设计` | 故事任务文档存在，技术评审/测试设计有缺失 |
| `实施` | 所有必选文档文件存在 |
| `测试` | 文档齐全，实施报告存在，测试报告缺失 |
| `报告` | 所有必选文件存在 |
| `改进` | 自改进复盘存在 |

完整度按文件存在性判定；任务推荐按链式管线分层评分排序：阻断 → 故事推进 → 覆盖 → 健康 → 同步。

## 生效标志

| 标志 | 未达标的处置 |
|------|------------|
| 目录 `<name>/` 命名合规 | 移动文件到正确目录 |
| 按项目类型必选文档齐全 | 补创建缺失文档 |
| 首尾导航块 + 跨文档引用完整 | 补 F.nav 导航块（见 [formulas.md](./formulas.md)） |
| 完整度状态机判定精确 | 核对文档存在性，修正状态 |
