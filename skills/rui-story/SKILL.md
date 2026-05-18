---
name: rui-story
description: Story panel management and sync. Manage stories under docs/故事任务面板/. Command: /rui-story.
user_invocable: true
lifecycle: default-pipeline
---

# rui-story

> 故事任务面板管理：查 · 同步。操作边界仅限 `docs/故事任务面板/`。
>
> **--help / -h**：执行 `node skills/rui-story/help.mjs` 输出完整帮助（含场景示例）。用户输入 `/rui-story --help` 或 `/rui-story -h` 或 `/rui-story help` 时，跳过管线逻辑，直接运行脚本并将输出展示给用户。
>
> 哲学源自 [CLAUDE.md](../../CLAUDE.md)。本文件定义命令面与操作规约。

## 命令族全景

```mermaid
flowchart TD
    ENTRY["/rui-story"]:::entry --> Q1{"有参数吗?"}
    Q1 -->|"无"| OVERVIEW["状态概览<br/>按状态统计 + 最近活动"]:::read
    Q1 -->|"有"| Q2{"哪个子命令?"}
    Q2 -->|"list"| LIST["进度全景<br/>所有故事详细表格"]:::read
    Q2 -->|"show &lt;name&gt;"| SHOW["单故事详情<br/>文件清单/状态/元数据"]:::read
    Q2 -->|"sync &lt;name&gt;?"| SYNC["文档同步<br/>委托 import-docs"]:::write

    classDef entry fill:#fff3e0,stroke:#e65100;
    classDef read fill:#e8f5e9,stroke:#2e7d32;
    classDef write fill:#e3f2fd,stroke:#1565c0;
```

| 命令 | 类型 | 作用 |
|------|------|------|
| `/rui-story` | 只读 | 状态概览：按状态统计 + 最近活动 |
| `/rui-story list` | 只读 | 进度全景：所有故事详细表格（状态/文件数/最后修改/分支） |
| `/rui-story show <name>` | 只读 | 单故事详情：文件清单/状态/元数据/git 分支 |
| `/rui-story sync [<name>]` | 写入 | 从远端同步文档到本地，需指定故事名称；未指定时展示推荐提示 |

`<name>` 为 kebab-case（如 `user-login`）。

## 操作边界

```mermaid
flowchart LR
    subgraph 允许["✅ 允许"]
        A1["docs/故事任务面板/<br/>面板查询与同步"]:::ok
        A2["import-docs 同步委托"]:::ok
    end
    subgraph 禁止["❌ 禁止"]
        B1["创建故事文档内容<br/>那是 /rui doc"]:::bad
        B2["修改源码<br/>那是 /rui code"]:::bad
        B3["创建/切换 git 分支<br/>那是 /rui code"]:::bad
    end

    classDef ok fill:#e8f5e9,stroke:#2e7d32;
    classDef bad fill:#ffebee,stroke:#c62828;
```

## 状态判定

> 按文件存在性 + `.memory/rui-state.json` 判定故事状态。

```mermaid
flowchart TD
    START["扫描故事目录"]:::s --> CHK01{"01-故事任务.md<br/>存在?"}
    CHK01 -->|"否"| NS["not_started"]:::s0
    CHK01 -->|"是"| CHKDOC{"文档基线齐全?<br/>含 02 05 + 按类型 03/04"}
    CHKDOC -->|"否"| DIP["docs_in_progress"]:::s1
    CHKDOC -->|"是"| CHKIMP{"实施报告存在?<br/>06 或 07"}
    CHKIMP -->|"否"| DD["docs_done"]:::s2
    CHKIMP -->|"是"| CHKVER{"08-测试用例报告.md<br/>存在?"}
    CHKVER -->|"否"| CIP["code_in_progress"]:::s3
    CHKVER -->|"是"| CHKBLK{"rui-state.json<br/>blocked=true?"}
    CHKBLK -->|"是"| BLK["blocked"]:::s5
    CHKBLK -->|"否"| CD["code_done"]:::s4

    classDef s fill:#e3f2fd,stroke:#1565c0;
    classDef s0 fill:#eceff1,stroke:#90a4ae;
    classDef s1 fill:#fff3e0,stroke:#e65100;
    classDef s2 fill:#e8f5e9,stroke:#2e7d32;
    classDef s3 fill:#e3f2fd,stroke:#1565c0;
    classDef s4 fill:#c8e6c9,stroke:#388e3c;
    classDef s5 fill:#ffebee,stroke:#c62828;
```

| 状态 | 条件 | 含义 |
|------|------|------|
| `not_started` | 01-故事任务.md 不存在 | 目录空或仅有元数据 |
| `docs_in_progress` | 01 存在，文档基线不完整 | 文档生成进行中 |
| `docs_done` | 文档基线齐全，实施报告不存在 | 等待编码 |
| `code_in_progress` | 06 或 07 存在，08 不存在 | 实现验证中 |
| `code_done` | 08 存在，未阻断 | 可交付 |
| `blocked` | `.memory/rui-state.json` 含 `blocked=true` | 管线阻断 |

项目类型按存在文件推断：有 03/06 = 含后端；有 04/07 = 含前端；两者均有 = fullstack；均无 = meta。

## `/rui-story` — 状态概览

> 无参数入口。扫描全部故事，按状态聚合，输出摘要 + 最近活动。

```mermaid
flowchart LR
    A["扫描<br/>docs/故事任务面板/"]:::op --> B["逐目录判定状态"]:::op
    B --> C["按状态聚合计数"]:::op
    C --> D["输出摘要表<br/>+ 最近修改的故事列表"]:::out

    classDef op fill:#e3f2fd,stroke:#1565c0;
    classDef out fill:#e8f5e9,stroke:#2e7d32;
```

**输出**：

```
故事任务面板 · 状态概览
─────────────────────────────
  code_done        0
  code_in_progress  0
  docs_done         0
  docs_in_progress  0
  not_started       0
  blocked           0
─────────────────────────────
  合计             0 个故事

最近活动：无
```

## `/rui-story list` — 进度全景

> 从 `/rui list` 迁移。扫描全部故事输出详情表格。

```mermaid
flowchart LR
    A["扫描<br/>docs/故事任务面板/"]:::op --> B["逐目录：状态 + 文件数<br/>+ 最后修改 + git 分支"]:::op
    B --> C["按最后修改降序排列"]:::op
    C --> D["输出表格"]:::out

    classDef op fill:#e3f2fd,stroke:#1565c0;
    classDef out fill:#e8f5e9,stroke:#2e7d32;
```

**输出列**：`Story | Status | Files | Last Modified | Type | Branch`

- **Files**：故事目录下 `.md` 文件数量
- **Last Modified**：目录中最晚文件修改时间
- **Type**：按存在文件推断（backend / frontend / fullstack / meta）
- **Branch**：`git branch --list "feat/<name>"` — 有则显示分支名，无则为 `—`

## `/rui-story show <name>` — 单故事详情

```mermaid
flowchart LR
    PARSE["解析 name"]:::op --> LOCATE["定位目录<br/>docs/故事任务面板/&lt;name&gt;/"]:::op
    LOCATE --> ENUM["枚举文件<br/>含大小 / 修改时间"]:::op
    ENUM --> META["读取元数据<br/>.memory/rui-state.json<br/>story-type.json"]:::op
    META --> BRANCH["检查 git 分支<br/>git branch --list"]:::op
    BRANCH --> OUT["输出详述卡"]:::out

    classDef op fill:#e3f2fd,stroke:#1565c0;
    classDef out fill:#e8f5e9,stroke:#2e7d32;
```

**输出结构**：

```
<name> · <status badge>

📂 目录: docs/故事任务面板/<name>/
📋 类型: <type>
📄 文件: <N> 个

  文件清单:
  01-rui-story-故事任务.md         2.3 KB  2026-05-17 10:30
  02-rui-story-用户使用场景.md      4.1 KB  2026-05-17 10:35
  ...

🔀 Git 分支: feat/<name>  (或 —)

📊 元数据:
  状态: <status>
  阶段: <current_stage>
  阻断原因: <block_reason 或 —>
```

## `/rui-story sync [<name>]` — 从远端同步文档

```mermaid
flowchart LR
    Q{"有 &lt;name&gt;?"} -->|"是"| SCOPED["node skills/import-docs/sync.mjs<br/>dir=docs/故事任务面板/&lt;n&gt;/"]:::op
    Q -->|"否"| RECOMMEND["展示可同步故事推荐<br/>等待用户选择"]:::op
    SCOPED --> OUT["输出同步结果"]:::out
    RECOMMEND --> OUT

    classDef op fill:#e3f2fd,stroke:#1565c0;
    classDef out fill:#e8f5e9,stroke:#2e7d32;
```

- 方向：从远端同步文档到本地，完全委托 import-docs，不自行实现同步逻辑
- 指定故事：`dir=docs/故事任务面板/<name>/` → 直接同步
- 未指定：展示可同步故事推荐提示，等待用户选择后再同步

## 核心规则

```mermaid
flowchart LR
    subgraph 规则["4 条硬约束"]
        R1["仅查询与同步<br/>不创建文档内容"]:::rule
        R2["不修改源码<br/>不创建/切换 git 分支"]:::rule
        R3["sync 完全委托<br/>import-docs"]:::rule
        R4["kebab-case<br/>命名硬规范"]:::rule
    end

    classDef rule fill:#e3f2fd,stroke:#1565c0;
```

| # | 规则 | 违反处置 |
|---|------|---------|
| 1 | 仅查询故事面板状态和同步文档，不创建故事文档内容（那是 `/rui doc`） | 撤销误创建的文件 |
| 2 | 不修改源码，不创建/切换 git 分支（那是 `/rui code`） | — |
| 3 | sync 完全委托 import-docs，不自行实现同步 | 修正命令重试 |
| 4 | `<name>` = kebab-case | 拒绝执行 |

## 生效标志

```mermaid
flowchart LR
    F1["sync 正确委托<br/>import-docs"]:::sig
    F1 --> F2["list/show 状态<br/>判定准确"]:::sig

    classDef sig fill:#e8f5e9,stroke:#2e7d32;
```

| 标志 | 未达标的处置 |
|------|------------|
| sync 正确委托 import-docs | 修正命令参数重试 |
| list/show 状态判定准确 | 修正判定逻辑 |

## 与 rui 的关系

> rui-story 从 rui 接管了 `list` 命令。其余所有管线阶段（doc / code / update）仍由 rui 编排。

```mermaid
flowchart LR
    RUI["/rui<br/>SDLC 编排"]:::rui -->|"doc 创建文档"| PANEL["docs/故事任务面板/"]:::panel
    RS["/rui-story<br/>面板管理"]:::story -->|"查询 + 同步"| PANEL

    classDef rui fill:#fff3e0,stroke:#e65100;
    classDef story fill:#e3f2fd,stroke:#1565c0;
    classDef panel fill:#e8f5e9,stroke:#2e7d32;
```
