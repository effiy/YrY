---
name: rui-claude
description: Manage ALL .claude/ directories across the repo — sync from remote, analyze health, and recommend tasks.
user_invocable: true
lifecycle: default-pipeline
---

# rui-claude

> **--help / -h / help — 本地脚本，零网络请求**
>
> 用户输入含 `--help`、`-h` 或 `help` 时，**无条件执行以下操作**：
> 1. 运行 `node skills/rui-claude/help.mjs`，将输出原样展示给用户
> 2. 立即停止，不得执行任何其他逻辑
> 3. 禁止：API 调用 · 网络请求 · 读取远端数据 · sync/retro/管线处理 · Agent 调度

作用范围：当前项目的 `.claude/` 目录。sync / retro 均以 `.claude/` 为操作边界。

## 命令族全景

```mermaid
flowchart TB
    ENTRY["/rui-claude"]:::src --> Q1{"子命令?"}

    Q1 -->|"sync"| SYNC["覆盖式同步<br/>API pull → 本地覆盖"]:::cmd
    Q1 -->|"retro"| RETRO["健康度分析<br/>三节复盘"]:::cmd
    Q1 -->|"history"| HIST["操作历史<br/>list / stats"]:::cmd
    Q1 -->|"&lt;req&gt;"| REQ["需求管线<br/>doc + code → 交付"]:::cmd
    Q1 -->|"空输入"| LIST["推荐任务<br/>5~10 条"]:::cmd

    SYNC --> S_OUT[".claude/ 全量覆盖"]:::out
    RETRO --> R_OUT["docs/自改进故事面板/<br/>&lt;project&gt;-&lt;date&gt;.md"]:::out
    HIST --> H_OUT[".claude/.history/<br/>rui-claude-history.jsonl"]:::out
    REQ --> PIPE["rui code 管线<br/>仅限 .claude/ 内"]:::pipe
    LIST --> L_OUT["推荐列表"]:::out

    classDef src fill:#e8f5e9,stroke:#2e7d32;
    classDef cmd fill:#e3f2fd,stroke:#1565c0;
    classDef out fill:#f3e5f5,stroke:#6a1b9a;
    classDef pipe fill:#fff3e0,stroke:#e65100;
```

| 命令 | 流程 | 产出 |
|------|------|------|
| `/rui-claude sync` | 查询远端 API → 逐文件 pull 覆盖本地 | `.claude/` 全量覆盖 |
| `/rui-claude retro` | 分析 .claude/ 结构健康度 → 三节复盘 | `docs/自改进故事面板/<date>.md` |
| `/rui-claude history` | 查看操作历史：`list [--limit N]` / `stats [--json]` | 终端输出 |
| `/rui-claude 需求` | 需求解析→故事拆分→逐故事 doc+code 管线→交付 | `.claude/` 内文件变更 |
| `/rui-claude` | 按 5 层管线评分推荐 5~10 条任务 | 推荐列表 |

## 操作边界

```mermaid
flowchart LR
    subgraph 允许["✅ 操作范围"]
        IN[".claude/"]:::ok
    end
    subgraph 禁止["❌ 不可触及"]
        OUT1["业务源码"]:::block
        OUT2["外部配置"]:::block
    end
    允许 -.->|"硬边界"| 禁止

    classDef ok fill:#e8f5e9,stroke:#2e7d32;
    classDef block fill:#ffebee,stroke:#c62828;
```

## sync — 覆盖式同步

```mermaid
flowchart LR
    TRIGGER["/rui-claude sync"]:::src --> CHECK{"确认用户意图?"}
    CHECK -->|"否"| ABORT["中止"]:::abort
    CHECK -->|"是"| PULL["node skills/import-docs/sync.mjs<br/>dir=.claude/ mode=pull<br/>远端 API → 逐文件覆盖本地"]:::op
    PULL --> DONE["完成<br/>自动记录 history"]:::done

    classDef src fill:#e8f5e9,stroke:#2e7d32;
    classDef abort fill:#eceff1,stroke:#90a4ae;
    classDef op fill:#e3f2fd,stroke:#1565c0;
    classDef done fill:#f3e5f5,stroke:#6a1b9a;
```

| 项目 | 说明 |
|------|------|
| 数据源 | 远端 API（`api.effiy.cn`），查询 sessions 集合中 `tags[0]=<workspace> && tags[1]=.claude` 的记录 |
| 行为 | 覆盖式更新，逐文件从远端 pull 覆盖本地 `.claude/`，保留嵌套目录结构 |
| 前置条件 | `API_X_TOKEN` 环境变量已配置 |
| 委托 | 完全委托 `import-docs`（`dir=.claude/ mode=pull`），不自行实现同步逻辑 |
| 完成后 | 自动记录 history |

## retro — 健康度分析

```mermaid
flowchart LR
    TRIGGER["/rui-claude retro"]:::src --> COLLECT["采集统计<br/>agents/ · rules/ · formulas.md · skills/"]:::op
    COLLECT --> WRITE["三节复盘"]:::op
    WRITE --> S1["§1 配置结构"]:::section
    WRITE --> S2["§2 健康度"]:::section
    WRITE --> S3["§3 改进项"]:::section
    S1 & S2 & S3 --> OUT["写入复盘文档"]:::out

    COLLECT -.->|"不连接"| REMOTE["远端"]:::no

    classDef src fill:#e8f5e9,stroke:#2e7d32;
    classDef op fill:#e3f2fd,stroke:#1565c0;
    classDef section fill:#f3e5f5,stroke:#6a1b9a;
    classDef out fill:#e8f5e9,stroke:#2e7d32;
    classDef no fill:#eceff1,stroke:#90a4ae;
```

| 项目 | 说明 |
|------|------|
| 触发方式 | `/rui-claude retro [--name <story>] [--json]` |
| 输入 | 本地 `.claude/` 目录的 `agents/` · `rules/` · `skills/` · `formulas.md` 等结构 |
| 网络 | 纯本地分析，不连远端 |
| 产出 | `docs/自改进故事面板/<date>.md`（三节：§1 配置结构 · §2 健康度 · §3 改进项） |

## history — 操作历史

```mermaid
flowchart LR
    CMD["sync / retro / &lt;req&gt; 完成"]:::src --> AUTO["自动追加历史条目"]:::op
    AUTO --> APPEND["追加写入"]:::store
    APPEND --> FILE[".claude/.history/<br/>rui-claude-history.jsonl"]:::file

    FILE -.->|"约束"| C1["append-only"]:::rule
    FILE -.->|"约束"| C2["不入库"]:::rule
    FILE -.->|"约束"| C3["不同步"]:::rule

    classDef src fill:#e8f5e9,stroke:#2e7d32;
    classDef op fill:#e3f2fd,stroke:#1565c0;
    classDef store fill:#fff3e0,stroke:#e65100;
    classDef file fill:#f3e5f5,stroke:#6a1b9a;
    classDef rule fill:#ffebee,stroke:#c62828;
```

| 子命令 | 说明 |
|--------|------|
| `list [--limit N]` | 列出最近 N 条操作记录 |
| `stats [--json]` | 操作统计摘要 |

## 核心规则

```mermaid
flowchart LR
    subgraph 边界["操作边界"]
        R1["仅限 .claude/"]:::rule
        R7["禁止自动 commit/push"]:::rule
    end
    subgraph 管线["管线约束"]
        R2["走 rui code 管线"]:::rule
        R3["feat 分支隔离"]:::rule
        R4["禁止 auto-merge"]:::rule
    end
    subgraph 行为["行为约束"]
        R5["sync 前确认意图"]:::rule
        R6["空输入只推荐不执行"]:::rule
    end

    classDef rule fill:#e3f2fd,stroke:#1565c0;
```

| # | 规则 | 违反标识 |
|---|------|---------|
| 1 | 操作范围仅限 `.claude/`，不得触及外部文件 | — |
| 2 | 对 `.claude/` 的代码修改必须通过 rui code 管线 | `skip-gate-a` |
| 3 | 必须在 `feat/<name>` 分支 | `no-checkout` |
| 4 | 禁止自动合并 | `auto-merge` |
| 5 | sync 覆盖式更新，执行前确认意图 | — |
| 6 | 空输入只推荐不执行 | — |
| 7 | 禁止自动 commit/push | — |

详见 [rules/rui-claude.md](../../rules/rui-claude.md)。

## 外部参考

> `.claude/` 配置管理、技能组织、安全约束思路参考以下资源。

```mermaid
flowchart LR
    subgraph 参考["外部参考"]
        R1["everything-claude-code<br/>harness 优化全集"]:::ref
        R2["superpowers<br/>行为纪律·验证门禁"]:::ref
        R3["GitHub Trending<br/>OSS Insight<br/>TrendShift"]:::ref
    end

    subgraph 应用["rui-claude 应用"]
        A1["sync — API 远端同步"]:::app
        A2["retro — 健康度分析模式"]:::app
        A3["需求 — 安全约束思路"]:::app
        A4["趋势 — 配置演进方向"]:::app
    end

    R1 --> A1 & A2
    R2 --> A3
    R3 --> A4

    classDef ref fill:#fff3e0,stroke:#e65100;
    classDef app fill:#e3f2fd,stroke:#1565c0;
```

| 命令 | 参考资源 | 汲取要点 |
|------|---------|---------|
| sync | import-docs | 远端 API 查询 + 文件下载模式 |
| retro | everything-claude-code · superpowers | 健康度指标、行为纪律审查 |
| 需求管线 | superpowers | 安全约束、验证门禁、仅限 `.claude/` 边界 |
| 趋势跟踪 | GitHub Trending · OSS Insight · TrendShift | `.claude/` 配置演进方向、新兴工具采纳 |

## 生效标志

```mermaid
flowchart LR
    S1["操作边界<br/>仅 .claude/ 内"]:::sig --> S2["sync 确认<br/>意图确认后覆盖"]:::sig
    S2 --> S3["管线完整<br/>变更走 rui code"]:::sig
    S3 --> S4["history 记录<br/>append-only 不入库"]:::sig

    classDef sig fill:#e8f5e9,stroke:#2e7d32;
```

| 标志 | 未达标的处置 |
|------|------------|
| 操作仅限 `.claude/` 目录 | 撤销外部变更 |
| sync 前确认用户意图 | 补确认后重新执行 |
| 变更走 rui code 管线 | 切分支重走管线 |
| history 仅本地不入库 | 从 git 暂存区移除 history 文件 |
