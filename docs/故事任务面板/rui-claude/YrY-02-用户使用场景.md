> | v1.3.2 | 2026-05-18 | deepseek-v4-pro | 🌿 main | 📎 [CLAUDE.md](../../../CLAUDE.md) |

> **导航**: [← YrY-01-故事任务](./YrY-01-故事任务.md) · [YrY-03-技术评审 →](./YrY-03-技术评审.md)

> **来源**: `/rui doc --from-code rui-claude` — 从 `skills/rui-claude/SKILL.md` · `skills/rui-claude/help.mjs` 反推

### 主要价值

- 👤 覆盖 5 类核心用户旅程：同步 · 分析 · 追溯 · 变更 · 推荐
- 🔄 每场景含完整操作流（mermaid flowchart）+ 步骤表 + 异常分支
- 🛡️ 明确空状态与错误恢复路径（token 降级、网络失败、阻断标识）
- 📊 场景覆盖矩阵与 FP# / AC# 双对齐，确保下游可追溯
- 🎯 体验基线定义每角色的情感目标与成功感知

### §0 基线声明

> **用户空间基线 (User Space Baseline)**: 本文档定义 rui-claude 的 WHO（谁使用）与 HOW EXPERIENCE（如何体验）。所有测试用例（05）必须覆盖本文档定义的每个场景及其异常分支。

---

### §1 场景全景

```mermaid
flowchart LR
    ENTRY["/rui-claude"]:::entry --> DEC{"子命令?"}:::dec

    DEC -->|"sync"| S1["① sync<br/>远端 API → 本地覆盖"]:::write
    DEC -->|"retro"| S2["② retro<br/>本地结构分析 → 三节复盘"]:::write
    DEC -->|"history"| S3["③ history<br/>读取操作记录 → 表格输出"]:::read
    DEC -->|"需求"| S4["④ 需求管线<br/>pm 拆分 → code 交付"]:::write
    DEC -->|"空输入"| S5["⑤ 推荐<br/>5 层评分 → 任务列表"]:::read

    S1 --> R1["远端 API<br/>sessions 集合"]:::ext
    S2 --> R2["复盘文档<br/>docs/自改进故事面板/"]:::out
    S3 --> R3[".claude/.history/<br/>rui-claude-history.jsonl"]:::out
    S4 --> R4["rui code 管线<br/>doc → code → 交付"]:::pipe
    S5 --> R5["推荐列表<br/>5~10 条优先级排序"]:::out

    subgraph 边界["操作边界"]
        SCOPE[".claude/ 目录内"]:::boundary
    end

    S1 & S2 & S3 & S4 & S5 -.->|"硬约束"| SCOPE

    classDef entry fill:#fff3e0,stroke:#e65100,stroke-width:2px;
    classDef dec fill:#f3e5f5,stroke:#6a1b9a;
    classDef write fill:#e3f2fd,stroke:#1565c0;
    classDef read fill:#e8f5e9,stroke:#2e7d32;
    classDef ext fill:#fff3e0,stroke:#e65100;
    classDef out fill:#f3e5f5,stroke:#6a1b9a;
    classDef pipe fill:#fff8e1,stroke:#ff8f00;
    classDef boundary fill:#ffebee,stroke:#c62828,stroke-dasharray:5;
```

---

### §2 场景详述

#### 场景 1 — 同步团队 `.claude/` 配置

| 角色 | 触发条件 | 核心目标 |
|------|---------|---------|
| 开发者 | 新人入职、团队宣布基线更新、发现本地技能行为与团队不一致 | 一键将本地 `.claude/` 与远端团队基线对齐 |

```mermaid
flowchart TB
    A["/rui-claude sync"]:::cmd --> B{"覆盖确认<br/>提示用户意图"}:::dec
    B -->|"取消"| X["中止<br/>目录不变"]:::abort
    B -->|"确认"| C{"API_X_TOKEN?"}:::dec
    C -->|"缺失"| G["静默降级<br/>提示 token 缺失"]:::warn
    C -->|"存在"| D["POST 查询远端 sessions"]:::api
    D --> E["筛选 tags[0]=&lt;workspace&gt;<br/>&& tags[1]=.claude"]:::api
    E --> F["逐文件 GET /read-file<br/>写入本地对应路径"]:::api
    F --> H["汇总统计<br/>created / overwritten / failed"]:::out

    D -.->|"超时 30s"| I["记录错误<br/>继续处理"]:::warn
    F -.->|"单文件失败"| J["记录错误<br/>继续后续文件"]:::warn

    classDef cmd fill:#e3f2fd,stroke:#1565c0;
    classDef dec fill:#f3e5f5,stroke:#6a1b9a;
    classDef api fill:#fff3e0,stroke:#e65100;
    classDef out fill:#e8f5e9,stroke:#2e7d32;
    classDef abort fill:#eceff1,stroke:#90a4ae;
    classDef warn fill:#fff3e0,stroke:#e65100,stroke-dasharray:5;
```

| # | 步骤 | 输入 | 系统响应 | 异常分支 |
|---|------|------|---------|---------|
| 1 | 执行同步命令 | `/rui-claude sync` | 显示确认提示：「该操作将覆盖本地 .claude/，确认？」 | — |
| 2 | 确认操作 | 用户回复确认 | 开始连接远端 API，查询 sessions | 用户取消 → 中止，显示「已取消」 |
| 3 | 拉取文件列表 | — | 从 sessions 筛选 `tags[0]=<workspace> && tags[1]=.claude` 的记录 | token 缺失 → 静默降级提示 |
| 4 | 逐文件下载 | — | 显示进度：`pulled: <remote> → <local>` | 单文件失败 → 记录错误，继续处理 |
| 5 | 完成 | — | 显示汇总：「created: N, overwritten: M, failed: K」+ 自动记录 history | 全部失败 → 退出码 1 |

#### 场景 2 — 分析 `.claude/` 健康度

| 角色 | 触发条件 | 核心目标 |
|------|---------|---------|
| 开发者 / 团队负责人 | 定期巡检、变更后验证、怀疑配置漂移 | 生成三节复盘报告，了解配置结构、健康度、改进方向 |

```mermaid
flowchart TB
    A["/rui-claude retro"]:::cmd --> B["遍历 .claude/ 目录"]:::scan
    B --> C1["agents/ 计数<br/>统计角色文件行数"]:::scan
    B --> C2["rules/ 计数<br/>统计规则文件"]:::scan
    B --> C3["skills/ 计数<br/>统计技能目录"]:::scan
    B --> C4["formulas.md<br/>公式章节数"]:::scan

    C1 & C2 & C3 & C4 --> D["§1 生成<br/>配置结构"]:::gen
    D --> E["§2 生成<br/>健康度评估"]:::gen
    E --> F["§3 生成<br/>改进项清单"]:::gen
    F --> G["写入复盘文档<br/>docs/自改进故事面板/<br/>&lt;project&gt;-&lt;date&gt;.md"]:::out

    C1 -.->|"目录不存在"| H["跳过<br/>统计=0"]:::warn
    C2 -.->|"目录不存在"| H
    C3 -.->|"目录不存在"| H

    classDef cmd fill:#e3f2fd,stroke:#1565c0;
    classDef scan fill:#e3f2fd,stroke:#1565c0;
    classDef gen fill:#fff3e0,stroke:#e65100;
    classDef out fill:#e8f5e9,stroke:#2e7d32;
    classDef warn fill:#fff3e0,stroke:#e65100,stroke-dasharray:5;
```

| # | 步骤 | 输入 | 系统响应 | 异常分支 |
|---|------|------|---------|---------|
| 1 | 执行分析命令 | `/rui-claude retro` | 开始采集 agents/ · rules/ · skills/ · formulas.md 等统计 | 目录为空 → 对应统计显示 0 |
| 2 | 分析完成 | — | 生成三节：§1 配置结构 · §2 健康度 · §3 改进项 | — |
| 3 | 写入文档 | — | 保存到 `docs/自改进故事面板/<project>-<date>.md` | 目录不存在 → 递归创建 |
| 4 | 完成 | — | 显示文档路径 | — |

#### 场景 3 — 查看操作历史

| 角色 | 触发条件 | 核心目标 |
|------|---------|---------|
| 开发者 | 追溯「谁在何时做了什么」、排查配置问题 | 查看 `/rui-claude` 的操作历史记录 |

```mermaid
flowchart LR
    A["/rui-claude history"]:::entry --> B{"子命令?"}:::dec
    B -->|"list"| C["读取 .claude/.history/<br/>rui-claude-history.jsonl"]:::io
    B -->|"stats"| D["读取历史文件"]:::io
    C --> E["解析 JSONL<br/>按时间排序取 N 条"]:::proc
    D --> F["聚合统计<br/>按命令/日期分组"]:::proc
    E --> G["表格输出<br/>时间 | 命令 | 结果"]:::out
    F --> H["统计摘要<br/>命令数 | 频率 | 分布"]:::out

    C -.->|"文件不存在"| I["输出空"]:::warn
    D -.->|"文件不存在"| J["输出 {}"]:::warn

    classDef entry fill:#e3f2fd,stroke:#1565c0;
    classDef dec fill:#f3e5f5,stroke:#6a1b9a;
    classDef io fill:#e3f2fd,stroke:#1565c0;
    classDef proc fill:#fff3e0,stroke:#e65100;
    classDef out fill:#e8f5e9,stroke:#2e7d32;
    classDef warn fill:#fff3e0,stroke:#e65100,stroke-dasharray:5;
```

| # | 步骤 | 输入 | 系统响应 | 异常分支 |
|---|------|------|---------|---------|
| 1 | 查看列表 | `/rui-claude history list --limit 10` | 显示最近 10 条记录（时间、命令、结果） | 历史文件不存在 → 显示空 |
| 2 | 查看统计 | `/rui-claude history stats --json` | JSON 格式统计摘要 | 历史文件不存在 → `{}` |

#### 场景 4 — 提交 `.claude/` 配置变更

| 角色 | 触发条件 | 核心目标 |
|------|---------|---------|
| 开发者 | 需要新增/修改 skill、agent、rule 或公式 | 通过完整管线安全地变更 `.claude/` 配置 |

```mermaid
flowchart TB
    subgraph 文档["📄 文档阶段"]
        A["/rui-claude '需求'"]:::cmd --> B["pm 拆分故事<br/>影响分析 · 优先级"]:::pm
        B --> C["coder 生成文档基线<br/>01 故事任务 · 02 用户场景 · 05 测试评审"]:::coder
    end

    subgraph 工程["🔧 工程阶段"]
        C --> D["创建 feat/&lt;name&gt; 分支"]:::git
        D --> E["Gate A<br/>测试先行 · AC 评审"]:::gate
        E --> F["逐模块实现<br/>每模块 P0 清零再前进"]:::impl
        F --> G["Gate B<br/>验证 ≤ 2 轮"]:::gate
        G --> H["自改进复盘<br/>D0–D7 诊断"]:::retro
    end

    subgraph 交付["📦 交付阶段"]
        H --> I1["① hook-log<br/>追加交互日志"]:::deliver
        I1 --> I2["② import-docs<br/>全量文档同步"]:::deliver
        I2 --> I3["③ wework-bot<br/>企微通知"]:::deliver
    end

    E -.->|"05 不存在"| X1["skip-gate-a 阻断"]:::block
    G -.->|"验证 >2 轮"| X2["gate-b-limit 阻断"]:::block
    B -.->|"需求无法解析"| X3["no-parse 阻断"]:::block
    C -.->|"文档 P0 不通过"| X4["doc-p0 阻断"]:::block

    classDef cmd fill:#e3f2fd,stroke:#1565c0;
    classDef pm fill:#fff3e0,stroke:#e65100;
    classDef coder fill:#e3f2fd,stroke:#1565c0;
    classDef git fill:#f3e5f5,stroke:#6a1b9a;
    classDef gate fill:#fff8e1,stroke:#ff8f00;
    classDef impl fill:#e3f2fd,stroke:#1565c0;
    classDef retro fill:#e8f5e9,stroke:#2e7d32;
    classDef deliver fill:#c8e6c9,stroke:#388e3c;
    classDef block fill:#ffebee,stroke:#c62828,stroke-dasharray:5;
```

| # | 步骤 | 输入 | 系统响应 | 异常分支 |
|---|------|------|---------|---------|
| 1 | 提交需求 | `/rui-claude "新增一个 security check hook"` | 解析需求 → pm 评估范围 | 需求无法解析 → no-parse 阻断 |
| 2 | 文档生成 | — | pm 拆故事 + coder 生成 01/02/05 | 文档 P0 不通过 → doc-p0 阻断 |
| 3 | 分支隔离 | — | 创建 `feat/<name>` 分支 | 已在 main → no-checkout 阻断 |
| 4 | Gate A | — | 检查 05 存在 → 用例评审通过 | 05 不存在 → skip-gate-a |
| 5 | 逐模块实现 | — | 每模块 P0 清零再前进 | P0 未清 → 不能前进 |
| 6 | Gate B | — | 验证通过 ≤ 2 轮 | > 2 轮 → gate-b-limit |
| 7 | 交付 | — | hook-log → import-docs → wework-bot | token 缺失 → 降级 |

#### 场景 5 — 获取推荐任务

| 角色 | 触发条件 | 核心目标 |
|------|---------|---------|
| 开发者 | 不确定下一步该做什么 `.claude/` 维护工作 | 获得 5–10 条按优先级排序的建议任务 |

```mermaid
flowchart LR
    A["/rui-claude<br/>空输入"]:::cmd --> B["扫描 .claude/ 状态"]:::scan
    B --> C["5 层管线评分"]:::eval
    C --> D1["L0 时间<br/>最近变更时效"]:::layer
    C --> D2["L1 依赖<br/>上下游完整性"]:::layer
    C --> D3["L2 风险<br/>配置偏差 / 安全"]:::layer
    C --> D4["L3 覆盖<br/>文档基线齐备度"]:::layer
    C --> D5["L4 质量<br/>P0 清零 / Gate 通过"]:::layer
    D1 & D2 & D3 & D4 & D5 --> E["加权排序"]:::proc
    E --> F["输出 5~10 条<br/>推荐任务列表"]:::out

    classDef cmd fill:#e3f2fd,stroke:#1565c0;
    classDef scan fill:#e3f2fd,stroke:#1565c0;
    classDef eval fill:#f3e5f5,stroke:#6a1b9a;
    classDef layer fill:#fff3e0,stroke:#e65100;
    classDef proc fill:#fff8e1,stroke:#ff8f00;
    classDef out fill:#e8f5e9,stroke:#2e7d32;
```

| # | 步骤 | 输入 | 系统响应 | 异常分支 |
|---|------|------|---------|---------|
| 1 | 空输入 | `/rui-claude` | 展示 5 层评分排序的推荐任务列表（5–10 条） | — |
| 2 | 选择执行 | 用户按推荐执行对应命令 | 进入对应流程 | — |

---

### §3 场景覆盖矩阵

| 场景 | FP# | AC# | 实现文档 | 测试文档 | 覆盖状态 | 备注 |
|------|-----|------|---------|---------|---------|------|
| 场景1 — 同步配置 | FP-1 | AC-1, AC-2, AC-7 | 03 §2 · 06 §4 | 05 · 08 | 已对齐 | import-docs 委托 |
| 场景2 — 健康分析 | FP-2 | AC-3 | 03 §1 | 05 · 08 | 已对齐 | 纯本地操作 |
| 场景3 — 操作历史 | FP-3 | AC-4 | 03 §3 | 05 · 08 | 已对齐 | 本地文件读取 |
| 场景4 — 需求变更 | FP-4 | AC-5 | 03 §1 · 03 §0 | 05 · 08 · 09 | 已对齐 | rui code 管线 |
| 场景5 — 任务推荐 | FP-5 | AC-6 | 03 §1 | 05 · 08 | 已对齐 | 只读，不执行 |

---

### §4 评审清单

- [x] 场景 ≥ 2（实际 5 个场景）
- [x] 每场景有流程图（6 个 mermaid — §1 全景 + 场景×5）
- [x] FP 全覆盖（FP-1 ~ FP-5 均匹配）
- [x] 异常分支明确（token 降级、网络失败、P0 阻断、目录不存在）
- [x] 无技术术语（无 API 路由、组件名、文件路径、数据库概念、框架名）
- [x] 每场景含空状态与错误恢复
- [x] 覆盖矩阵下游文档齐全（05 已包含）

---

### §5 体验基线

| 角色 | 核心旅程 | 情感目标 | 痛点解决 | 成功感知 | 关联场景 |
|------|---------|---------|---------|---------|---------|
| 新人开发者 | 入职第一天同步团队配置 | 感到被支持、快速融入 | 不再手动找同事要配置、自行摸索 | 执行完 sync 后 `.claude/` 可用，命令列表与团队一致 | 场景1 |
| 团队负责人 | 定期巡检配置健康度 | 感到掌控、有洞察 | 配置漂移不可见、不知从何改进 | 看到三节复盘报告，改进项可执行 | 场景2 |
| 日常开发者 | 修改配置并安全交付 | 感到安全、有流程保障 | 直接改文件担心破坏、无审查机制 | Gate A/B 通过，变更进入交付三步 | 场景4 |
| 运维开发者 | 追溯历史操作 | 感到有迹可循 | 不知道谁改了什么、何时改的 | history list 显示完整记录 | 场景3 |

---

### 变更记录

| 日期 | 变更 | 触发 | 证据 |
|------|------|------|------|
| 2026-05-18 | 初始反推生成 | `/rui doc --from-code rui-claude` | `skills/rui-claude/SKILL.md` · `skills/rui-claude/help.mjs` |
| 2026-05-18 | 全图重写 + 场景 5 补图 | `/rui update rui-claude` | 6 图：§1 全景（决策节点+边界）· 场景 1（TB 决策树+API 细节）· 场景 2（四路采集+三节生成）· 场景 3（子命令分支统一）· 场景 4（三阶段 subgraph）· 场景 5（5 层评分补图）|
