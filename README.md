# YrY <sub>v5.1.0</sub>

> 故事驱动的 SDLC 编排系统 — 需求 → 文档 → 代码 → 交付。YrY 用自身管线管理自身演进。18 技能 + 10 Agent + 12 规则 + 18 共享库 + 9 维度健康检查 + 企微通知。

[系统全景](#系统全景) · [管线](#管线) · [快速开始](#快速开始) · [命令](#命令) · [/rui](#rui) · [/rui-story](#rui-story) · [/rui-claude](#rui-claude) · [/rui-docs](#rui-docs) · [/rui-npm](#rui-npm) · [Agent 角色](#agent-角色) · [规则](#规则) · [技能](#技能) · [目录结构](#目录结构) · [领域语言](#领域语言) · [技术趋势](#技术趋势)

## 系统全景

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
    CMD["/rui · /rui-story · /rui-claude"]

    subgraph Skills[十八技能]
        direction TB
        CORE["主线: rui · rui-code · rui-init · rui-update · rui-yry"]:::skill
        MGMT["管理: rui-story · rui-claude · rui-skills"]:::skill
        BOT["通知: rui-bot · rui-import"]:::skill
        DOCS["文档: rui-html · rui-doc · rui-reporter"]:::skill
        DISC["发现: rui-trends · rui-analysis · rui-npm"]:::skill
        EVO["演进: rui-version · rui-plan · self-improve"]:::skill
    end

    subgraph Agents[九角色]
        PM[("pm")]:::core
        PLANNER[planner]:::agent
        ARCHITECT[architect]:::agent
        CODER[coder]:::agent
        REVIEWER[code-reviewer]:::agent
        TESTER[tester]:::agent
        REPORTER[reporter]:::agent
        SECURITY[security]:::agent
        SI[self-improve]:::agent
    end

    CMD --> RUI & RC
    RUI --> PM
    PM --> ARCHITECT & CODER & TESTER & REPORTER
    ARCHITECT -.设计.-> CODER
    REVIEWER -.审查.-> CODER
    SECURITY -.约束.-> CODER
    SI -.提案.-> PM
    ID -.hook.-> WW

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

<a id="rui"></a>

### /rui — 业务故事 SDLC

| 命令 | 类型 | 作用 |
|------|------|------|
| `/rui` | 只读 | 5 层管线评分排序，推荐下一步任务 |
| `/rui doc <需求>` | 写入 | 拆需求出文档：生成故事文档基线，不改源码 |
| `/rui doc --from-code 需求` | 写入 | 从源码反推完整文档基线到故事目录（源码只读） |
| `/rui version --up` | 写入 | 版本升级：自主判定 → 更新文件 → git commit → 推送 + tag |
| `/rui version --rollback <name>` | 写入 | 版本回退：基于 git 版本链回退故事文档到历史版本 |
| `/rui-code <name>` | 写入 | 源码实现：Gate A → 逐模块 P0 清零 → Gate B → 复盘 → 交付 |
| `/rui-init` | 写入 | 项目初始化：detect → explore → generate → architect → setup → verify → trigger |
| `/rui-update <name> [ctx]` | 写入 | 增量更新：T1/T2/T3 自动裁剪管线 |
| `/rui-yry [--depth N]` | 写入 | 自主自改进：全扫描→诊断→实现→验证→版本升级，循环至无改进空间 |
| `/rui-skills` | 只读 | 技能市场：发现和安装 Claude/Agent 技能包 |

<a id="rui-story"></a>

### /rui-story — 故事任务面板管理

| 命令 | 类型 | 数据源 | 作用 |
|------|------|--------|------|
| `/rui-story` | 只读 | 远端 API | 状态概览：按 6 种状态统计 + 最近活动 |
| `/rui-story list` | 只读 | 远端 API | 进度全景：所有故事详情表格（状态/文件数/类型/分支） |
| `/rui-story health` | 只读 | 远端 API + 本地 | 健康检查：凭据/API 可达性/配置/数据完整性 |
| `/rui-story sync [<name>]` | 写入 | 远端 API | 委托 rui-import 从远端拉取文档覆盖本地 |
| `/rui-story remove <name>` | 写入 | 本地文件系统 | 删除指定故事整个本地目录（需确认） |
| `/rui-story --help` | 只读 | 本地 | 完整命令用法 + 场景示例 |

<a id="rui-claude"></a>

### /rui-claude — .claude/ 配置管理

| 命令 | 类型 | 作用 |
|------|------|------|
| `/rui-claude` | 只读 | 按 5 层管线评分推荐 5~10 条任务 |
| `/rui-claude history [list\|stats]` | 只读 | 操作历史：list 列出最近操作，stats 统计摘要 |
| `/rui-claude retro` | 写入 | 健康度分析：分析 .claude/ 结构产出复盘报告 |
| `/rui-claude sync` | 写入 | 远端同步：API pull 覆盖本地 `.claude/`（需确认意图） |
| `/rui-claude <需求>` | 写入 | 需求管线：仅限 `.claude/` 内的 doc+code→交付 |

<a id="rui-npm"></a>

### /rui-npm — 个人 npm 包管理

| 命令 | 类型 | 作用 |
|------|------|------|
| `/rui-npm search <keyword>` | 只读 | 按关键词搜索 npm registry，结构化展示结果 |
| `/rui-npm install <pkg>[@version]` | 写入 | 安装包到当前项目 |
| `/rui-npm update <pkg>` | 写入 | 更新指定包到兼容最新版本 |
| `/rui-npm list [--depth N]` | 只读 | 列出当前项目已安装的依赖 |
| `/rui-npm info <pkg>` | 只读 | 查看包的完整元数据（版本/许可证/维护者） |
| `/rui-npm uninstall <pkg>` | 写入 | 从当前项目卸载包 |
| `/rui-npm publish <path>` | 写入 | 发布本地文件或目录为 npm 包，即刻可用 |
| `/rui-npm npx <pkg>[@version]` | 执行 | 通过 npx 直接运行包，无需安装 |
| `/rui-npm audit` | 只读 | 审计已安装依赖的安全漏洞 |
| `/rui-npm --help` | 只读 | 完整命令用法 + 场景示例 |

## Agent 角色

```mermaid
flowchart LR
    PM[pm<br>决策中枢] -->|拆故事| ARCHITECT[architect<br>架构设计]
    ARCHITECT -->|设计规约| CODER[coder<br>代码实现]
    CODER -->|逐模块| TESTER[tester<br>质量卡点]
    TESTER -->|Gate A·阻编码| CODER
    TESTER -->|Gate B·阻交付| REPORTER[reporter<br>过程记录]
    REPORTER -->|三报告| PM
    REVIEWER[code-reviewer<br>代码审查] -.审查.-> CODER
    SECURITY[security<br>威胁建模] -.约束.-> CODER
    SI[self-improve<br>持续改进] -.提案.-> PM

```

- **pm** — 决策中枢：决定做/不做/延期，串起全部 Agent
- **planner** — 实施规划：从设计出实施计划，拆任务、排顺序、审查交接 coder
- **architect** — 系统架构设计：设计系统级架构、评估权衡、创建 ADR
- **coder** — 代码实现：逐模块编码，P0 清零方进下一模块
- **code-reviewer** — 代码审查：审查代码正确性、模式、反模式、简化机会（只读）
- **tester** — 质量卡点：Gate A 阻编码、Gate B 阻交付
- **reporter** — 过程记录：三报告交叉闭合
- **security** — 威胁建模：§3 安全约束注入，P0 卡发布
- **self-improve** — 持续改进：采集执行数据，生成改进提案

共用契约见 [agents/AGENT.md](./agents/AGENT.md)，专项规约见 `agents/<role>.md`。

## 规则

```mermaid
flowchart LR
    subgraph 管线阶段
        direction TB
        S2[预检]
        S3[Gate A]
        S4[实现]
        S5[Gate B]
        S6[交付]
    end

    CP[code-pipeline] -.-> S2 & S3 & S4 & S5
    DOC[doc-generation] -.-> S1
    AD[architecture-diagram] -.-> S1
    KG[knowledge-graph] -.-> S1 & S6
    SG[security-guardrails] -.-> S4
    DG[delivery-gate] -.-> S6
    SI[self-improve] -.-> S6
    RC[rui-claude] -.-> .claude/

```

- **code-pipeline** — 源码改动：分支隔离 · Gate A/B · 逐模块清零，支撑技术含根因追溯/纵深防御/反馈回路/深度模块/垂直切片
- **delivery-gate** — 交付收口：日志 → 同步 → 通知，手动触发
- **doc-generation** — 文档产出：目录命名 · 骨架模板 · 附属数据存放
- **architecture-diagram** — 架构图约束：自包含 HTML+SVG 深色主题
- **knowledge-graph** — 知识图谱：三层 schema（story → scene → source）
- **mermaid-theme** — Mermaid 统一配色：项目唯一色板真相源
- **plan-execution** — 计划执行：创建→审查→执行→验证管线
- **security-guardrails** — 安全护栏：防线在信任边界处，输入必校验
- **self-improve** — 自改进闭环：D0-D7 诊断 · 经验技能化 · 记忆压缩注入 · 效果评估 E1-E4
- **rui-claude** — .claude/ 管理：仅限 `.claude/` · 禁自动 commit/push

详见 [`rules/`](./rules/)。

## 技能

### 主线

- **rui** (`/rui doc · version --up · --rollback · --from-code`) — 故事驱动 SDLC 编排入口。需求解析、文档生成、版本管理
- **rui-code** (`/rui-code <name>`) — 源码实现管线：Gate A → 逐模块 P0 清零 → Gate B → 复盘 → 交付
- **rui-init** (`/rui-init`) — 项目初始化：detect → explore → generate → architect → setup → verify → trigger
- **rui-update** (`/rui-update <name> [ctx]`) — 增量更新：T1/T2/T3 自动裁剪管线
- **rui-yry** (`/rui-yry [--depth N]`) — 自主自改进循环：全扫描 → 诊断 → 实现 → 验证 → 版本升级，循环至无改进空间
- **rui-story** (`/rui-story list · health · sync · remove`) — 故事面板远端查询、进度管理、同步、删除
- **rui-claude** (`/rui-claude sync · retro · history`) — .claude/ 配置远端同步与复盘
- **rui-skills** (`/rui-skills`) — 技能市场：发现和安装 Claude/Agent 技能包

### 自动化与通知

- **rui-bot** — 企微通知推送（3 场景：完成/阻断/门禁失败）+ Rich/Verbose 格式 + Dry-Run 预览 + 失败队列自动重试
  - `health` 子命令：9 维度综合健康检查（Token/配置/机器人/API/报告/格式/D0-D7/Git/安全）
  - D0-D7 引导诊断：无执行记忆时从 git 历史 + 场景文档新鲜度 + 提案闭合率推导诊断信号，覆盖全部 8 维度
  - `health --html` 生成 `docs/健康报告/` 仪表板 HTML（摘要卡 + 趋势对比 + ⚡新增/恶化标记 + 维度历史迷你图 + 评级火花图 + 改进建议）
  - `health --diff` 仅输出与上次检查的差异（维度变化 + 新增/已解决诊断 + 综合评分变化）
  - `health --alert` 评分低于阈值 (70) 自动发送分级告警（🔴 严重 / 🟡 警告），同诊断不重复通知
  - `health --short` 单行摘要输出，适合脚本和 cron 集成
  - `health --notify` 发送健康摘要通知到企微
  - `flush` 子命令：重试失败队列中的通知
  - 健康趋势持久化到 `.memory/health-trend.jsonl`，驱动维度变化指示（↑↓→ + 数值）
  - 通知投递日志 `.memory/notification-log.jsonl`，记录每次发送的时间/状态/结果
  - 自循环报告系统（12 技能定期巡检 → HTML 报告 → 企微通知，附带健康评分 + 触发诊断）

### 文档与报告

- **rui-html** — 场景 HTML 文档生成：markdown → 7 类标准 HTML（计划清单/架构图/知识图谱/源码/测试面板/演示/审查）
- **rui-doc** — 文档新鲜度检查，自动检测过期文档
- **rui-reporter** — 知识策展与过程报告：故事进度/知识图谱一致性/交付摘要/跨故事趋势

### 分析与发现

- **rui-trends** — 技术趋势监控：GitHub Trending / OSS Insight / TrendShift 结构化报告
- **rui-analysis** — 代码健康看门狗：复杂度/耦合/文件膨胀/依赖健康/架构边界检测
- **rui-npm** (`/rui-npm search · install · update · list · info · uninstall · publish · npx · audit`) — npm 包管理全生命周期

### 质量与演进

- **rui-version** — 版本漂移检测与自动升级
- **rui-plan** — 计划新鲜度检查与执行追踪
- **rui-import** — 文档远端同步（per-document instant + batch safety-net）
- **self-improve** — 持续自改进闭环：D0-D7 诊断 → 提案生成 → 物化为故事 → 效果评估 (E1-E4)

详见 [`skills/`](./skills/)。所有脚本通过 [`lib/`](./lib/)（18 文件含 `lib/engine/` 诊断/评估/物化/升级引擎）共享 TTY 格式化、项目工具、诊断引擎、Mermaid 主题和常量定义。

## 目录结构

```
YrY/
├── agents/                  # 9 个 Agent 角色契约
│   ├── AGENT.md             #   角色拓扑与共用底线
│   ├── pm.md / planner.md / architect.md / coder.md
│   ├── code-reviewer.md / tester.md
│   ├── reporter.md / security.md
│   └── self-improve.md
├── rules/                   # 12 组约束规则
│   ├── code-pipeline.md     #   分支隔离 · Gate A/B
│   ├── delivery-gate.md     #   三步 hook
│   ├── doc-generation.md    #   文档生成规范
│   ├── architecture-diagram.md # 架构图约束
│   ├── knowledge-graph.md   #   知识图谱约束
│   ├── mermaid-theme.md     #   Mermaid 统一主题配置
│   ├── plan-execution.md    #   计划执行与验证管线
│   ├── security-guardrails.md  # 安全护栏
│   ├── self-improve.md      #   自改进闭环
│   └── rui-claude.md        #   .claude/ 管理约束
├── skills/                  # 18 项技能规约
│   ├── rui/                 #   SDLC 编排入口 (doc · version)
│   ├── rui-code/            #   源码实现管线 (Gate A/B · P0 清零)
│   ├── rui-init/            #   项目初始化
│   ├── rui-update/          #   增量更新 (T1/T2/T3)
│   ├── rui-yry/             #   自主自改进循环
│   ├── rui-story/           #   故事面板管理
│   ├── rui-claude/          #   .claude/ 配置管理
│   ├── rui-skills/          #   技能市场发现与安装
│   ├── rui-import/          #   文档远端同步
│   ├── rui-bot/             #   企微通知 + 9维健康检查 + 自循环报告
│   ├── rui-html/            #   场景 HTML 文档生成 (7 类)
│   ├── rui-doc/             #   文档新鲜度检查
│   ├── rui-reporter/        #   知识策展与过程报告
│   ├── rui-trends/          #   技术趋势监控
│   ├── rui-analysis/        #   代码健康看门狗
│   ├── rui-npm/             #   npm 包管理
│   ├── rui-version/         #   版本漂移检测
│   ├── rui-plan/            #   计划执行追踪
│   └── self-improve/        #   自改进闭环
├── docs/
│   ├── index.html           #   文档中心着陆页
│   ├── 健康报告/             #   9 维度健康仪表板 + 历史趋势
│   ├── 自循环报告/           #   12 技能定期巡检报告
│   └── 故事任务面板/         #   故事产出目录
│       └── <name>/
│           ├── 故事任务.md  #     故事定义与 AC
│           └── 场景-<N>-<slug>/
│               ├── 计划清单.html  # 实施清单
│               ├── 架构图.html    # SVG 架构图
│               ├── 知识图谱.html  # 知识图谱可视化
│               ├── 源码.html      # 源码交叉引用
│               ├── 测试面板.html  # 测试仪表盘
│               ├── 演示.html      # 交互演示
│               └── 审查.html      # D0-D7 审查报告
├── lib/                     # 18 文件共享库（消除跨文件重复）
│   ├── constants.mjs        #   共享常量（超时/并发/阈值/路径）
│   ├── tty.mjs / fs.mjs     #   TTY 格式化 / 文件系统工具
│   ├── network.mjs          #   网络请求封装
│   ├── audit.mjs            #   工具调用审计
│   ├── branch-check.mjs     #   分支隔离强制
│   ├── proposals.mjs        #   改进提案编排
│   └── engine/              #   诊断引擎
│       ├── diagnostics.mjs  #     D0-D7 诊断（纯逻辑）
│       ├── evaluate.mjs     #     E1-E4 效果评估
│       ├── materialize.mjs  #     提案→故事物化
│       └── upgrade.mjs      #     经验→规则升级检测
├── tests/                   # 自检测试套件
│   ├── run.mjs              #   测试运行器
│   ├── skills/ agents/ rules/ integration/
│   └── lib/                 #   测试工具（harness + helpers）
├── .claude/                 # Claude Code 本地配置
├── .claude-plugin/          # 插件清单与市场元数据
├── CLAUDE.md
└── README.md
```

## 领域语言

> 理解术语再动手。每术语含 _Avoid_ 别名防止漂移。

```mermaid
flowchart TD
    REQ[需求] -->|拆为| STORY[故事]
    STORY -->|通过| PIPE[管线]
    PIPE -->|产出| DOCS[故事文档]
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
| **Gate A** | 编码前的强制性阻断点。`测试设计.md` 不存在或未就绪→编码不得开始。单行 CSS/文案为唯一例外。 | test gate, pre-code check |
| **Gate B** | 编码后的闭合验证。五步检查（环境快照→静态预检→设计对齐→单次执行→三报告）。修复 > 2 轮→阻断。 | verification gate, post-code check |
| **P0 / P1 / P2** | P0 = 阻塞发布必修项；P1 = 当轮修复项；P2 = 记录不阻断项。P0 不清零不进下一模块。 | critical / major / minor |
| **阻断** | 管线在当前阶段停止，状态写入 `.memory/rui-state.json`。阻断≠失败，重跑同命令从中断点续。区别于"降级"（记录标记但不停止前进）。 | stop, halt, fail |
| **铁律** | 四条不可妥协的规则：验先于称、溯先于修、清先于进、表达优先（图→文本→表）。 | rule, constraint |
| **影响链** | 变更点的完整传递依赖图。五步闭合：列变更→选搜索词→全项目搜索→二级传递→标注处置。未闭合 = `chain-broken` 阻断。 | dependency graph, impact analysis |
| **分支隔离** | **强制门禁**。任何 Edit/Write 前须验证 `git branch --show-current` 为 `feat/<name>`。未通过 = `no-branch-isolation` 阻断。 | feature branch |
| **反推** | 只读模式。`--from-code` 从源码反推文档；`--from-doc` 从文档反推源码补充。 | reverse engineering, backfill |
| **证据等级** | A=已验证(附路径) B=可推导(附推导链) C=未验证(标"待补充") D=幻觉(视为错误)。 | confidence level |
| **Agent** | 六大协作角色：pm coder tester reporter security self-improve。每角色有交接信号和验证方式。 | bot, worker, role |
| **公式** | 结构化文档产出规范。分为通用元素 (F.meta/F.nav/F.evidence)、故事主线 (F.story.*)、补充文档 (F.supp.*)。区别于"模板"——公式是规约 (what)，模板是文件 (how)；本系统只用公式。 | template, format |
| **交付收口** | rui-import + rui-bot 手动触发。 | delivery pipeline, post-steps |
| **自改进** | D0–D7 诊断循环。采集执行数据→六维评估→生成改进提案→提案闭合。 | retrospective, post-mortem |
| **执行记忆** | `.memory/execution-memory.jsonl`（追加）+ `.memory/rui-state.json`（覆盖写）。 | state, log |
| **项目类型** | frontend / backend / fullstack / meta / unknown。决定技术评审章节裁剪（纯前端跳过 API/数据/后端性能，纯后端跳过组件/状态/交互/样式/DOM）。 | stack type |
| **需求** | `/rui` 的输入：纯文本、`@` 文件引用、或 URL。pm 解析后拆为一组故事。 | input, spec, feature request |
| **插件** | YrY 本身是 Claude Code 插件，用自身管线管理自身演进。 | extension, addon |

> 项目约束见 [CLAUDE.md](./CLAUDE.md#项目约束)。

## 技术趋势

> 技术趋势通过 `/rui-trends` 实时查询；架构模式与方法论内联于各技能规约（自包含原则）。
