---
paths:
  - ".claude/**"
---

# rui-claude

> 操作仅限 `.claude/`，变更走 rui code 管线，git 由开发者手动操作。

[命令族全景](#命令族全景) · [适用](#适用) · [操作范围](#操作范围) · [sync](#sync--覆盖式同步) · [retro](#retro--复盘分析) · [history](#history--历史记录) · [git 约束](#git-约束) · [例外](#例外) · [生效标志](#生效标志)

## 命令族全景

```mermaid
flowchart TB
    ENTRY["/rui-claude"]:::src --> Q1{"子命令?"}

    Q1 -->|"&lt;req&gt;"| REQ["需求驱动变更"]:::cmd
    Q1 -->|"sync"| SYNC["覆盖式同步"]:::cmd
    Q1 -->|"update"| UPDATE["插件升级+清缓存+同步"]:::cmd
    Q1 -->|"retro"| RETRO["复盘分析"]:::cmd
    Q1 -->|"history"| HIST["历史记录"]:::cmd
    Q1 -->|"空输入"| LIST["推荐任务列表"]:::cmd

    REQ --> PIPE["走 rui code 管线<br/>分支隔离 → Gate A → 编码 → Gate B"]:::pipe
    SYNC --> OVER["API pull → 本地覆盖<br/>不走管线"]:::pipe
    RETRO --> REPORT["写入 docs/自改进故事面板/"]:::out
    HIST --> LOG[".claude/.history/<br/>rui-claude-history.jsonl"]:::out

    PIPE --> LOCAL["本地变更"]:::local
    LOCAL -.->|"禁止"| AUTO["自动 commit/push 🚫"]:::block
    LOCAL --> MANUAL["开发者手动 git"]:::manual

```

| 子命令 | 行为 | 走管线? | 产出位置 |
|--------|------|--------|---------|
| `需求` | 需求驱动的 .claude/ 变更 | ✅ rui code 管线 | `.claude/` 目录内 |
| `sync` | 覆盖式更新（API pull → 本地覆盖） | ❌ 不走管线 | `.claude/` 全量 |
| `update` | 插件升级（git pull → 清除缓存 → sync） | ❌ 不走管线 | 插件源码 + 缓存清除 + `.claude/` 三重刷新 |
| `retro` | 复盘分析 | ❌ 独立流程 | `docs/自改进故事面板/` |
| `history` | 自动记录历史 | ❌ 后台记录 | `.claude/.history/` |
| 空输入 | 推荐任务 | ❌ 不执行 | — |

## 适用

`/rui-claude` 命令族下的所有子命令（`sync` / `retro` / `history` / `需求`）。

## 操作范围

```mermaid
flowchart LR
    subgraph 允许["✅ 操作范围"]
        IN[".claude/ 目录内"]:::ok
    end
    subgraph 禁止["❌ 不可触及"]
        OUT1["外部源码文件"]:::block
        OUT2["业务目录"]:::block
        OUT3["系统配置"]:::block
    end
    允许 -.->|"边界"| 禁止

```

| # | 规则 | 反例 |
|---|------|------|
| 1 | 仅限 `.claude/` 目录，不得触及外部文件 | 修改 `src/` 下的业务代码 |
| 2 | `/rui-claude 需求` 修改 `.claude/` 必须通过 rui code 管线 | 直接在 main 分支改 `.claude/` 文件 |
| 3 | 空输入不执行管线，仅推荐任务 | 空输入触发完整管线 |

## sync — 覆盖式同步

```mermaid
flowchart LR
    TRIGGER["/rui-claude sync"]:::src --> CONFIRM{"确认用户意图?"}
    CONFIRM -->|"否"| ABORT["中止"]:::abort
    CONFIRM -->|"是"| PULL["rui-import<br/>dir=.claude/ mode=pull<br/>远端 API → 逐文件覆盖"]:::op
    PULL --> DONE["同步完成"]:::done

```

| # | 规则 | 说明 |
|---|------|------|
| 4 | `sync` 为覆盖式更新（API pull → 本地覆盖），执行前须确认用户意图 | 覆盖操作不可逆 |
| 5 | `API_X_TOKEN` 由环境变量传入，本 skill 不配置/存储/传递 | 凭据不在 `.claude/` 内 |

## retro — 复盘分析

```mermaid
flowchart LR
    TRIGGER["/rui-claude retro"]:::src --> ANALYZE["分析本地 .claude/<br/>结构"]:::op
    ANALYZE --> WRITE["写入复盘报告"]:::out
    WRITE --> PATH["docs/自改进故事面板/<br/>&lt;project&gt;-&lt;date&gt;.md"]:::file

    ANALYZE -.->|"不连接"| REMOTE["远端"]:::no

```

| # | 规则 |
|---|------|
| 6 | 复盘写入 `docs/自改进故事面板/<date>.md` |
| 7 | 仅分析本地 `.claude/` 结构，不连接远端 |

## history — 历史记录

```mermaid
flowchart LR
    CMD["任意 /rui-claude 命令"]:::src --> AUTO["自动追加"]:::op
    AUTO --> FILE[".claude/.history/<br/>rui-claude-history.jsonl"]:::file
    FILE -.->|"约束"| C1["仅本地"]:::rule
    FILE -.->|"约束"| C2["不入库"]:::rule
    FILE -.->|"约束"| C3["不同步"]:::rule

```

| # | 规则 |
|---|------|
| 8 | 自动记录到 `.claude/.history/rui-claude-history.jsonl`（仅本地，不入库不同步） |

## git 约束

```mermaid
flowchart TD
    CHANGE[".claude/ 变更完成"]:::src --> Q{"谁执行 git?"}
    Q -->|"自动"| BLOCK["禁止 🚫<br/>自动 commit<br/>自动 push"]:::block
    Q -->|"手动"| OK["✅<br/>git add<br/>git commit<br/>git push"]:::ok

```

| # | 规则 | 反例 |
|---|------|------|
| 9 | 禁止自动提交和推送，所有 git 操作由开发者手动执行 | 管线末尾自动执行 `git push` |

## 例外

```mermaid
flowchart LR
    SYNC_EX["sync 命令"]:::ex --> REASON["行为是恢复基线<br/>非业务变更"]:::reason
    REASON --> RESULT["不走 rui code 管线"]:::result

```

| 场景 | 处理 | 原因 |
|------|------|------|
| `sync` 覆盖式更新 | 不走 rui code 管线 | 行为是恢复基线，非业务变更 |

## 生效标志

```mermaid
flowchart LR
    S1["操作范围<br/>仅 .claude/ 内"]:::sig --> S2["变更走管线<br/>&lt;req&gt; 经 Gate A/B"]:::sig
    S2 --> S3["git 手动<br/>无自动 commit/push"]:::sig
    S3 --> S4["history 记录<br/>仅本地不入库"]:::sig

```

| 标志 | 未达标的处置 |
|------|------------|
| 操作仅限 `.claude/` 目录 | 撤销外部变更，重新在 .claude/ 内操作 |
| `需求` 变更走 rui code 管线 | 切回分支，重新走管线流程 |
| git 操作由开发者手动执行 | 撤销自动提交，手动重新 commit |
| history 仅本地不入库 | 从 git 暂存区移除 history 文件 |
