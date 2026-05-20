# YrY

> 故事驱动的 SDLC 编排系统 — 需求 → 文档 → 代码 → 交付。YrY 用自身管线管理自身演进。

## 系统全景

```mermaid
flowchart TD
    CMD["/rui · /rui-story · /rui-claude"]

    subgraph Skills[五技能]
        RUI[rui]:::skill
        RS[rui-story]:::skill
        RC[rui-claude]:::skill
        ID[import-docs]:::skill
        WW[wework-bot]:::skill
    end

    subgraph Agents[六角色]
        PM[("pm")]:::core
        CODER[coder]:::agent
        TESTER[tester]:::agent
        REPORTER[reporter]:::agent
        SECURITY[security]:::agent
        SI[self-improve]:::agent
    end

    CMD --> RUI & RC
    RUI --> PM
    PM --> CODER & TESTER & REPORTER
    SECURITY -.约束.-> CODER
    SI -.提案.-> PM
    ID -.hook.-> WW

    classDef core fill:#fff3e0,stroke:#e65100;
    classDef agent fill:#e3f2fd,stroke:#1565c0;
    classDef skill fill:#e8f5e9,stroke:#2e7d32;
```

## 管线

```mermaid
flowchart LR
    A[需求解析] --> B[自适应规划] --> C[影响分析] --> D[架构设计] --> E[文档基线]
    E --> F[预检·分支隔离]
    F --> G[Gate A·测试先行]
    G --> H[逐模块实现·P0清零]
    H --> I[Gate B·验证]
    I --> J[自改进·复盘]
    J --> K[交付]
    K --> K1[追加日志] --> K2[文档同步] --> K3[企微通知]
```

每阶段产出对应编号文档（01–09），交付时三步 hook 按序执行。详见 [rules/code-pipeline.md](./rules/code-pipeline.md)、[rules/delivery-gate.md](./rules/delivery-gate.md)。

## 快速开始

```bash
# 1. 建立项目基线（首次必做）
/rui init

# 2. 从源码反推文档（存量项目）
/rui doc --from-code

# 3. 端到端交付（新需求）
/rui 用户登录功能支持手机号+验证码

# 4. 查看进度
/rui-story list
```

> init 生成 CLAUDE.md 项目约束 + README 领域语言 + 故事面板目录。存量项目用 `doc --from-code` 反推文档基线。

## 命令

只读命令不触发末端 hook，写入命令末端自动执行交付三步。

```mermaid
flowchart TD
    Q1{"改的是业务故事<br>还是 .claude/ 配置?"}
    Q1 -->|"业务故事"| Q2{"已有故事吗?"}
    Q1 -->|".claude/ 配置"| RC["/rui-claude"]
    Q2 -->|"无·仓库新搭"| INIT["/rui init"]
    Q2 -->|"无·已有需求"| E2E["/rui <需求>"]
    Q2 -->|"无·已有源码"| FC["/rui doc --from-code"]
    Q2 -->|"已拆只缺文档"| DOC["/rui doc <需求>"]
    Q2 -->|"文档齐缺实现"| CODE["/rui code <name>"]
    Q2 -->|"代码改完想补文档"| FD["/rui code --from-doc"]
    Q2 -->|"小修小补"| UPD["/rui update"]
    Q2 -->|"只想看进度"| LIST["/rui-story list 或 /rui-story"]
```

### /rui — 业务故事 SDLC

| 命令 | 类型 | 作用 |
|------|------|------|
| `/rui` | 只读 | 5 层管线评分排序，推荐下一步任务 |
| `/rui init` | 写入 | 建立基线：detect → explore → generate → setup → verify → trigger |
| `/rui <需求>` | 写入 | 端到端：doc + code 自动串联，逐故事串行 |
| `/rui doc <需求>` | 写入 | 拆需求出文档：生成 01/02/03/04，不改源码 |
| `/rui code <name>` | 写入 | 实现故事：Gate A → 逐模块 → Gate B → 复盘 → 交付 |
| `/rui update <name> [ctx]` | 写入 | 增量更新：T1/T2/T3 自动裁剪 |
| `/rui doc --from-code 需求` | 只读 | 从源码反推文档：补缺失不覆盖 |
| `/rui code --from-doc <name>` | 只读 | 从文档反推码：禁止改源码 |

### /rui-story — 故事任务面板管理

| 命令 | 类型 | 作用 |
|------|------|------|
| `/rui-story` | 只读 | 状态概览：按状态统计 + 最近活动 |
| `/rui-story list` | 只读 | 进度全景：所有故事详细表格（从 `/rui` 迁移） |
| `/rui-story show <name>` | 只读 | 单故事详情：文件清单/状态/元数据 |
| `/rui-story delete <name>` | 写入 | 删除故事目录（需确认） |
| `/rui-story sync [<name>]` | 写入 | 触发文档同步（委托 import-docs） |
| `/rui-story rename <old> <new>` | 写入 | 重命名故事目录 |

### /rui-claude — .claude/ 配置管理

| 命令 | 类型 | 作用 |
|------|------|------|
| `/rui-claude` | 只读 | 任务推荐 |
| `/rui-claude history [--limit N]` | 只读 | 操作历史 |
| `/rui-claude retro [--name <story>]` | 写入 | 健康复盘 |
| `/rui-claude sync` | 写入 | 远端同步：API pull 覆盖本地 `.claude/` |
| `/rui-claude 需求` | 写入 | 需求管线 |

> ⚠️ `sync` 执行前必须确认意图。详见 [rules/rui-claude.md](./rules/rui-claude.md)。

## Agent 角色

```mermaid
flowchart LR
    PM[pm<br>决策中枢] -->|拆故事| CODER[coder<br>代码实现]
    CODER -->|逐模块| TESTER[tester<br>质量卡点]
    TESTER -->|Gate A·阻编码| CODER
    TESTER -->|Gate B·阻交付| REPORTER[reporter<br>过程记录]
    REPORTER -->|三报告| PM
    SECURITY[security<br>威胁建模] -.约束.-> CODER
    SI[self-improve<br>持续改进] -.提案.-> PM
```

- **pm** — 决策中枢：决定做/不做/延期，串起全部 Agent
- **coder** — 代码实现：逐模块编码，P0 清零方进下一模块
- **tester** — 质量卡点：Gate A 阻编码、Gate B 阻交付
- **reporter** — 过程记录：三报告交叉闭合
- **security** — 威胁建模：§3 安全约束注入，P0 卡发布
- **self-improve** — 持续改进：采集执行数据，生成改进提案

共用契约见 [agents/AGENT.md](./agents/AGENT.md)，专项规约见 `agents/<role>.md`。

## 规则

```mermaid
flowchart LR
    subgraph 管线阶段
        S1[需求→文档]
        S2[预检]
        S3[Gate A]
        S4[实现]
        S5[Gate B]
        S6[交付]
    end

    CP[code-pipeline] -.-> S2 & S3 & S4 & S5
    DOC[doc-generation] -.-> S1
    DG[delivery-gate] -.-> S6
    SI[self-improve] -.-> S6
    RC[rui-claude] -.-> .claude/
```

- **code-pipeline** — 源码改动：分支隔离 · Gate A/B · 逐模块清零，支撑技术含根因追溯/纵深防御/反馈回路/深度模块/垂直切片
- **delivery-gate** — 交付收口：三步按序（日志 → 同步 → 通知），缺一不可
- **doc-generation** — 文档产出：目录命名 · 骨架模板 · 附属数据存放
- **self-improve** — 复盘改进：数据采集 → 诊断 → 提案，`no-metrics` 降级不阻断
- **rui-claude** — .claude/ 管理：仅限 `.claude/` · 禁自动 commit/push

详见 [`rules/`](./rules/)。

## 技能

- **rui** (`/rui init · doc · code · update · --from-code`) — 故事驱动 SDLC 主线，含诊断纪律、架构深化、交接纪律
- **rui-story** (`/rui-story list · show · create · delete · sync · rename`) — 故事面板 CRUD 管理、进度查询、文档同步
- **rui-claude** (`/rui-claude sync · retro · history`) — .claude/ 配置远端同步与复盘
- **import-docs** — 自动（hook 触发）：批量同步故事文档到远端 API
- **wework-bot** — 自动（hook 触发）：企微机器人推送管线状态通知

详见 [`skills/`](./skills/)。

## 目录结构

```
YrY/
├── agents/                  # 6 个 Agent 角色契约
│   ├── AGENT.md             #   角色拓扑与共用底线
│   ├── pm.md / coder.md / tester.md
│   ├── reporter.md / security.md
│   └── self-improve.md
├── rules/                   # 5 组约束规则
│   ├── code-pipeline.md     #   分支隔离 · Gate A/B
│   ├── delivery-gate.md     #   三步 hook
│   ├── doc-generation.md    #   文档生成规范
│   ├── self-improve.md      #   自改进流程
│   └── rui-claude.md        #   .claude/ 管理约束
├── skills/                  # 5 项技能规约
│   ├── rui/                 #   SDLC 编排
│   │   ├── formulas.md      #     故事文档公式
│   │   ├── coder.md         #     工作手册·数据契约
│   │   └── ranking.md       #     推荐评分框架
│   ├── rui-story/           #   故事面板管理
│   ├── rui-claude/          #   .claude/ 配置管理
│   ├── import-docs/         #   文档远端同步
│   └── wework-bot/          #   企微通知
├── docs/
│   └── 故事任务面板/        #   故事产出目录
│       └── <name>/
│           ├── 01-09.md     #     管线文档
│           ├── .memory/     #     执行记忆（跨会话持久化）
│           └── .improvement/ #    改进提案
├── CLAUDE.md
└── README.md
```

## 领域语言

> 理解术语再动手。每术语含 _Avoid_ 别名防止漂移。

```mermaid
flowchart TD
    REQ[需求] -->|拆为| STORY[故事]
    STORY -->|通过| PIPE[管线]
    PIPE -->|产出| DOCS[01-09 文档]
    AGENT[Agent] -->|执行| PIPE
    FORMULA[公式] -->|驱动| DOCS
    EVIDENCE[证据等级] -->|约束| DOCS
    PIPE -->|阻断点| GA[Gate A]
    PIPE -->|阻断点| GB[Gate B]
    PIPE -->|收口| TRIAD[交付三步]
    SI[自改进] -->|采集| MEM[执行记忆]
    MEM -->|记录| PIPE
```

| 术语 | 含义 | Avoid |
|------|------|-------|
| **管线** | 端到端 SDLC 流程，需求→交付，每阶段有进入/退出条件。区别于"交付三步"（仅末端收口动作）。 | workflow, process, 流程 |
| **故事** | 管线中单一、独立、可完成的作业单元。一个需求可拆为多个故事串行通过管线，各产出一组 01–09 文档。故事内 §4 的工作拆分称"任务"，非管线单元。 | task, ticket, issue |
| **故事任务面板** | `docs/故事任务面板/<name>/` 目录。每个故事的所有产物内聚在此。 | output directory, doc folder |
| **Gate A** | 编码前的强制性阻断点。`{project}-测试设计.md` 不存在或未就绪→编码不得开始。单行 CSS/文案为唯一例外。 | test gate, pre-code check |
| **Gate B** | 编码后的闭合验证。五步检查（环境快照→静态预检→设计对齐→单次执行→三报告）。修复 > 2 轮→阻断。 | verification gate, post-code check |
| **P0 / P1 / P2** | P0 = 阻塞发布必修项；P1 = 当轮修复项；P2 = 记录不阻断项。P0 不清零不进下一模块。 | critical / major / minor |
| **阻断** | 管线在当前阶段停止，状态写入 `.memory/rui-state.json`。阻断≠失败，重跑同命令从中断点续。区别于"降级"（记录标记但不停止前进）。 | stop, halt, fail |
| **铁律** | 三条不可妥协的规则：验先于称、溯先于修、清先于进。 | rule, constraint |
| **影响链** | 变更点的完整传递依赖图。五步闭合：列变更→选搜索词→全项目搜索→二级传递→标注处置。未闭合 = `chain-broken` 阻断。 | dependency graph, impact analysis |
| **分支隔离** | **强制门禁**。任何 Edit/Write 前须验证 `git branch --show-current` 为 `feat/<name>`。未通过 = `no-branch-isolation` 阻断。 | feature branch |
| **反推** | 只读模式。`--from-code` 从源码反推文档；`--from-doc` 从文档反推源码补充。 | reverse engineering, backfill |
| **证据等级** | A=已验证(附路径) B=可推导(附推导链) C=未验证(标"待补充") D=幻觉(视为错误)。 | confidence level |
| **Agent** | 六大协作角色：pm coder tester reporter security self-improve。每角色有交接信号和验证方式。 | bot, worker, role |
| **公式** | 结构化文档产出规范。分为通用元素 (F.meta/F.nav/F.evidence)、故事主线 (F.story.*)、补充文档 (F.supp.*)。区别于"模板"——公式是规约 (what)，模板是文件 (how)；本系统只用公式。 | template, format |
| **交付三步** | 管线末端强制序列：hook-log → import-docs → wework-bot。任一缺失 = 管线未闭合。 | delivery pipeline, post-steps |
| **自改进** | D0–D7 诊断循环。采集执行数据→六维评估→生成改进提案→提案闭合。 | retrospective, post-mortem |
| **执行记忆** | `.memory/execution-memory.jsonl`（追加）+ `.memory/rui-state.json`（覆盖写）。 | state, log |
| **项目类型** | frontend / backend / fullstack / meta / unknown。决定文档生成矩阵（前端补 03/06，后端补 02/05，全栈全部补）。 | stack type |
| **需求** | `/rui` 的输入：纯文本、`@` 文件引用、或 URL。pm 解析后拆为一组故事。 | input, spec, feature request |
| **插件** | YrY 本身是 Claude Code 插件，用自身管线管理自身演进。 | extension, addon |

> 项目约束见 [CLAUDE.md](./CLAUDE.md#项目约束)。

## 外部参考

> pm 拆故事、架构设计、自改进时，应主动查阅以下资源汲取模式与理念。
>
> **融合原则**：从不凭感觉执行——每阶段有对应参考，每参考有明确应用场景。外链失效时，技能规约仍独立可执行（自包含原则）。

### 外部参考 → 管线阶段 映射

```mermaid
flowchart LR
    subgraph 参考["外部参考资源"]
        R1["故事描述<br/>superpowers<br/>get-shit-done<br/>ui-ux-pro-max<br/>karpathy-skills<br/>mattpocock-skills"]:::ref
        R2["实现与架构<br/>everything-claude-code<br/>system-design-primer<br/>ruflo<br/>hermes-agent<br/>claude-mem<br/>agentmemory"]:::ref
        R3["工具与平台<br/>Claude Code 官方文档"]:::ref
        R4["趋势与发现<br/>GitHub Trending<br/>OSS Insight<br/>TrendShift<br/>Top-Starred"]:::ref
    end

    subgraph 管线["管线阶段"]
        S1["① 需求→文档<br/>pm 拆分 + coder 设计"]:::phase
        S2["② 预检→实现<br/>Gate A + P0 清零"]:::phase
        S3["③ 验证→自改进<br/>Gate B + D0-D7"]:::phase
        S4["④ 交付<br/>三步收口"]:::phase
    end

    R1 --> S1
    R2 --> S2 & S3
    R3 --> S2 & S3
    R4 --> S4

    classDef ref fill:#f3e5f5,stroke:#6a1b9a;
    classDef phase fill:#e3f2fd,stroke:#1565c0;
```

| 管线阶段 | 查阅的外部参考 | 汲取什么 |
|---------|--------------|---------|
| 需求→文档 | superpowers · get-shit-done · ui-ux-pro-max · karpathy-skills · mattpocock-skills | 故事拆分模式 · AC 设计方法 · UI 交互状态覆盖 · LLM 编码陷阱规避 · 真实工程纪律 |
| 预检→实现 | everything-claude-code · system-design-primer · ruflo · Claude Code 文档 | 上下文质量优先 · 深模块设计 · 多 Agent 协作模式 · harness 能力边界 |
| 验证→自改进 | claude-mem · agentmemory · hermes-agent · superpowers | 记忆压缩注入 · 基准评估 · 经验技能化 · 验证门禁 |
| 交付 | GitHub Trending · OSS Insight · TrendShift · Top-Starred | 技术趋势验证 · 架构健康度 · 新兴工具 · 社区验证参照 |

### 故事描述 — 模式与方法论

| 资源 | 用途 | YrY 中的体现 |
|------|------|------------|
| [obra/superpowers](https://github.com/obra/superpowers) | AI agent 软件开发方法论：可组合 skills、spec-driven 开发、验证门禁、行为纪律 | 行为纪律 Red Flags · 验证门禁五步法 · 94% PR 驳回率提炼的纪律 |
| [gsd-build/get-shit-done](https://github.com/gsd-build/get-shit-done/tree/main) | 元提示与上下文工程，专注"上下文退化"问题 | 惜注意原则 · 退化三因对策 · 上下文工程四原则 |
| [mattpocock/skills](https://github.com/mattpocock/skills) | 真实工程场景 Agent skills 集合，强调"不是 vibe coding" | CONTEXT-FORMAT 参照 · 工程纪律 · 文档写作原则 |
| [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | 161 条推理规则 + 67 种 UI 风格，跨平台 UI/UX 设计 | 前端故事 §2 用户场景 · ≥3 交互状态覆盖 · pm 前端故事额外约束 |
| [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills) | Karpathy 对 LLM 编码陷阱的观察提炼 | Agent 纪律参考 · 故事拆分陷阱规避 · pm 决策参考 |

### 实现与架构 — 执行模式

| 资源 | 用途 | YrY 中的体现 |
|------|------|------------|
| [thedotmack/claude-mem](https://github.com/thedotmack/claude-mem) | 跨会话持久化记忆引擎，AI 压缩 + 相似检索自动注入 | 执行记忆体系 · `.memory/` 数据契约 · 跨会话记忆注入 |
| [affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code/blob/main/README.zh-CN.md) | Agent harness 性能优化全集 | 研究优先开发 · 上下文质量优先 · hook 实践 |
| [rohitg00/agentmemory](https://github.com/rohitg00/agentmemory) | 基于真实世界基准的 AI 编码 Agent 持久化记忆方案 | 基准评估 · 记忆压缩策略 · 效果评估 E1–E4 |
| [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | 自改进 AI Agent：从经验创建 skill、自我优化、跨会话搜索 | 经验技能化 · 提案升级规则 · 自改进闭环 |
| [ruvnet/ruflo](https://github.com/ruvnet/ruflo) | 多 Agent 编排平台：100+ Agent 群、分布式集群智能、自学习记忆 | Agent 拓扑 · 三种协作模式 · 插件架构 |
| [donnemartin/system-design-primer](https://github.com/donnemartin/system-design-primer) | 大规模系统设计学习资源，含 Anki 抽认卡 | 架构设计阶段 · 深模块设计 · 伸缩性考量 |

### 工具与平台

| 资源 | 用途 | YrY 中的体现 |
|------|------|------------|
| [Claude Code 官方文档](https://code.claude.com/docs/en/overview) | CLI 完整功能参考：hooks、MCP、skills、IDE 集成、权限系统 | 技能设计时确认 harness 能力边界 · hook 配置 · MCP 集成 |

### 趋势与发现

| 资源 | 用途 | YrY 中的体现 |
|------|------|------------|
| [GitHub Trending](https://github.com/trending) | 每日/每周热门仓库，感知社区当前关注方向 | 自改进阶段 · 技术趋势验证 · 新兴工具发现 |
| [OSS Insight](https://ossinsight.io/) | 开源数据分析平台，仓库排名、开发者画像 | 技术选型数据支撑 · 技术债量化对比 |
| [TrendShift](https://trendshift.io/github-trending-repositories?trending-range=7) | GitHub 仓库趋势变化追踪，按时间窗口比较 star 增长 | 识别快速上升项目 · 技术方向判断 |
| [GitHub Top-Starred](https://github.com/search?q=stars%3A%3E100000&type=repositories&s=stars&o=desc) | 十万星以上顶级项目列表 | 技术选型时参考社区验证的高质量开源项目 |

### 自改进生态系统

> YrY 从外部参考汲取模式，通过自改进管线沉淀为自身规则。生态系统闭环如下：

```mermaid
flowchart TB
    subgraph 外部["外部生态"]
        E1["superpowers<br/>行为纪律"]:::ext
        E2["claude-mem<br/>记忆引擎"]:::ext
        E3["hermes-agent<br/>经验技能化"]:::ext
        E4["ruflo<br/>多Agent编排"]:::ext
        E5["everything-claude-code<br/>研究优先"]:::ext
        E6["ui-ux-pro-max<br/>UI推理规则"]:::ext
    end

    subgraph YrY["YrY 内化"]
        Y1["agents/AGENT.md<br/>Red Flags + 验证门禁"]:::yry
        Y2["rules/self-improve.md<br/>记忆压缩 + 基准评估"]:::yry
        Y3["agents/self-improve.md<br/>提案升级规则"]:::yry
        Y4["agents/AGENT.md<br/>三种协作模式"]:::yry
        Y5["CLAUDE.md<br/>执行模式: 研究优先"]:::yry
        Y6["agents/pm.md<br/>UI ≥3状态覆盖"]:::yry
    end

    外部 -->|"汲取模式"| YrY
    YrY -->|"提案验证"| 外部

    classDef ext fill:#f3e5f5,stroke:#6a1b9a;
    classDef yry fill:#e8f5e9,stroke:#2e7d32;
```
