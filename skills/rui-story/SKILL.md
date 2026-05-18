---
name: rui-story
description: Story panel management and sync. Manage stories under docs/故事任务面板/. Command: /rui-story.
user_invocable: true
lifecycle: default-pipeline
---

# rui-story

> 故事任务面板管理：查 · 同步。数据源为远端 API，默认远端模式，不读本地文件系统。
>
> **--help / -h**：执行 `node skills/rui-story/help.mjs` 输出完整帮助（含场景示例）。用户输入 `/rui-story --help` 或 `/rui-story -h` 或 `/rui-story help` 时，跳过管线逻辑，直接运行脚本并将输出展示给用户。
>
> 哲学源自 [CLAUDE.md](../../CLAUDE.md)。本文件定义命令面与操作规约。

## 命令族全景

```mermaid
flowchart TD
    ENTRY["/rui-story"]:::entry --> Q1{"有参数吗?"}
    Q1 -->|"无"| OVERVIEW["状态概览<br/>远端查询 → 按状态统计 + 最近活动"]:::read
    Q1 -->|"有"| Q2{"哪个子命令?"}
    Q2 -->|"list"| LIST["进度全景<br/>远端查询 → 所有故事详细表格"]:::read
    Q2 -->|"show <name>"| SHOW["单故事详情<br/>远端查询 → 文件清单/状态/元数据"]:::read
    Q2 -->|"sync <name>?"| SYNC["文档同步<br/>远端 → 本地（委托 import-docs）"]:::write

    classDef entry fill:#fff3e0,stroke:#e65100;
    classDef read fill:#e8f5e9,stroke:#2e7d32;
    classDef write fill:#e3f2fd,stroke:#1565c0;
```

| 命令 | 类型 | 数据源 | 作用 |
|------|------|--------|------|
| `/rui-story` | 只读 | 远端 API | 状态概览：按状态统计 + 最近活动 |
| `/rui-story list` | 只读 | 远端 API | 进度全景：所有故事详细表格（状态/文件数/最后修改/分支） |
| `/rui-story show <name>` | 只读 | 远端 API | 单故事详情：文件清单/状态/元数据 |
| `/rui-story sync [<name>]` | 写入 | 远端 API | 从远端拉取文档到本地；未指定名称时展示推荐提示 |

`<name>` 为 kebab-case（如 `user-login`）。

## 数据源

> **默认且唯一模式：远端 API**。所有查询操作（概览/list/show）直接查询远端 API，不读本地文件系统。
> 仅 `sync` 命令涉及本地写入（从远端拉取到本地），其余命令零本地文件系统访问。

```mermaid
flowchart LR
    subgraph 远端["远端 API (api.effiy.cn)"]
        SESSIONS["sessions 集合<br/>file_path 前缀 故事任务面板/"]
    end

    subgraph 命令["命令"]
        OVERVIEW["/rui-story"]
        LIST["/rui-story list"]
        SHOW["/rui-story show"]
    end

    SESSIONS -->|"query_documents"| OVERVIEW
    SESSIONS -->|"query_documents"| LIST
    SESSIONS -->|"query_documents"| SHOW

    classDef api fill:#e3f2fd,stroke:#1565c0;
    classDef cmd fill:#e8f5e9,stroke:#2e7d32;
```

**API 调用方式**：
```
POST <apiUrl>/
{
  "module_name": "services.database.data_service",
  "method_name": "query_documents",
  "parameters": { "cname": "sessions", "limit": 10000 }
}
```

从响应的 `data.list` 中筛选 `file_path` 以 `故事任务面板/` 开头的记录。每条记录包含 `file_path`、`title`、`tags`、`createdAt`、`updatedAt` 等字段。

## 操作边界

```mermaid
flowchart LR
    subgraph 允许["✅ 允许"]
        A1["远端 API 查询<br/>故事任务面板 session"]:::ok
        A2["sync 委托 import-docs<br/>远端 → 本地"]:::ok
    end
    subgraph 禁止["❌ 禁止"]
        B1["读取本地文件系统<br/>（查询操作）"]:::bad
        B2["创建故事文档内容<br/>那是 /rui doc"]:::bad
        B3["修改源码<br/>那是 /rui code"]:::bad
        B4["创建/切换 git 分支<br/>那是 /rui code"]:::bad
    end

    classDef ok fill:#e8f5e9,stroke:#2e7d32;
    classDef bad fill:#ffebee,stroke:#c62828;
```

## 状态判定

> 按远端 sessions 的 `file_path` 存在性 + `.memory/rui-state.json`（仅 blocked 标记查本地）判定故事状态。

```mermaid
flowchart TD
    START["查询远端 sessions<br/>file_path 前缀 故事任务面板/"]:::s --> GROUP["按故事名称分组<br/>从 file_path 提取"]:::s
    GROUP --> CHK01{"{project}-01-故事任务.md<br/>存在?"}
    CHK01 -->|"否"| NS["not_started"]:::s0
    CHK01 -->|"是"| CHKDOC{"文档基线齐全?<br/>含 02 05 + 按类型 03/04"}
    CHKDOC -->|"否"| DIP["docs_in_progress"]:::s1
    CHKDOC -->|"是"| CHKIMP{"实施报告存在?<br/>06 或 07"}
    CHKIMP -->|"否"| DD["docs_done"]:::s2
    CHKIMP -->|"是"| CHKVER{"{project}-08-测试用例报告.md<br/>存在?"}
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
| `not_started` | {project}-01-故事任务.md 不存在于远端 | 目录空或仅有元数据 |
| `docs_in_progress` | 01 存在于远端，文档基线不完整 | 文档生成进行中 |
| `docs_done` | 远端文档基线齐全，实施报告不存在 | 等待编码 |
| `code_in_progress` | 06 或 07 存在于远端，08 不存在 | 实现验证中 |
| `code_done` | 08 存在于远端，未阻断 | 可交付 |
| `blocked` | `.memory/rui-state.json` 含 `blocked=true`（本地例外） | 管线阻断 |

项目类型按远端文件推断：有 03/06 = 含后端；有 04/07 = 含前端；两者均有 = fullstack；均无 = meta。

## `/rui-story` — 状态概览

> 无参数入口。查询远端 API，按状态聚合，输出摘要 + 最近活动。零本地文件系统读取。

```mermaid
flowchart LR
    A["查询远端 API<br/>sessions 集合"]:::op --> B["筛选 故事任务面板/ 前缀"]:::op
    B --> C["按故事名分组判定状态"]:::op
    C --> D["按状态聚合计数"]:::op
    D --> E["输出摘要表<br/>+ 最近修改的故事列表"]:::out

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

> 查询远端 API 获取全部故事面板 session，输出详情表格。零本地文件系统读取。

```mermaid
flowchart LR
    A["查询远端 API<br/>sessions 集合"]:::op --> B["筛选 故事任务面板/ 前缀"]:::op
    B --> C["逐故事：状态 + 文件数<br/>+ 最后修改 + git 分支"]:::op
    C --> D["按更新时间降序排列"]:::op
    D --> E["输出表格"]:::out

    classDef op fill:#e3f2fd,stroke:#1565c0;
    classDef out fill:#e8f5e9,stroke:#2e7d32;
```

**输出列**：`Story | Status | Files | Last Modified | Type | Branch`

- **Files**：远端该故事下的 session 数量
- **Last Modified**：远端 sessions 中最晚 `updatedAt`
- **Type**：按远端文件推断（backend / frontend / fullstack / meta）
- **Branch**：`git branch --list "feat/<name>"` — 有则显示分支名，无则为 `—`

## `/rui-story show <name>` — 单故事详情

```mermaid
flowchart LR
    PARSE["解析 name"]:::op --> QUERY["查询远端 API<br/>sessions 集合"]:::op
    QUERY --> FILTER["筛选 file_path 匹配<br/>故事任务面板/&lt;name&gt;/"]:::op
    FILTER --> SORT["按 file_path 排序"]:::op
    SORT --> BRANCH["检查 git 分支<br/>git branch --list"]:::op
    BRANCH --> OUT["输出详述卡"]:::out

    classDef op fill:#e3f2fd,stroke:#1565c0;
    classDef out fill:#e8f5e9,stroke:#2e7d32;
```

**输出结构**：

```
<name> · <status badge>

📂 远端路径: 故事任务面板/<name>/
📋 类型: <type>
📄 文件: <N> 个

  文件清单:
  YrY-01-故事任务.md         2026-05-17 10:30
  YrY-02-用户使用场景.md      2026-05-17 10:35
  ...

🔀 Git 分支: feat/<name>  (或 —)

📊 元数据:
  状态: <status>
  阻断原因: <block_reason 或 —>
```

## `/rui-story sync [<name>]` — 从远端同步文档

```mermaid
flowchart LR
    Q{"有 &lt;name&gt;?"} -->|"是"| SCOPED["node skills/import-docs/sync.mjs<br/>dir=docs/故事任务面板/&lt;n&gt;/ mode=pull"]:::op
    Q -->|"否"| RECOMMEND["展示可同步故事推荐<br/>等待用户选择"]:::op
    SCOPED --> OUT["输出同步结果"]:::out
    RECOMMEND --> OUT

    classDef op fill:#e3f2fd,stroke:#1565c0;
    classDef out fill:#e8f5e9,stroke:#2e7d32;
```

- 方向：从远端同步文档到本地，完全委托 import-docs（`mode=pull`），不自行实现同步逻辑
- 指定故事：`dir=docs/故事任务面板/<name>/ mode=pull` → 远端下载覆盖本地
- 未指定：展示可同步故事推荐提示，等待用户选择后再同步

## 核心规则

```mermaid
flowchart LR
    subgraph 规则["5 条硬约束"]
        R1["远端 API 为默认数据源<br/>查询不读本地文件系统"]:::rule
        R2["仅查询与同步<br/>不创建文档内容"]:::rule
        R3["不修改源码<br/>不创建/切换 git 分支"]:::rule
        R4["sync 完全委托<br/>import-docs"]:::rule
        R5["kebab-case<br/>命名硬规范"]:::rule
    end

    classDef rule fill:#e3f2fd,stroke:#1565c0;
```

| # | 规则 | 违反处置 |
|---|------|---------|
| 1 | 所有查询操作使用远端 API，不读本地文件系统（sync 写入除外） | 修正为远端查询 |
| 2 | 仅查询故事面板状态和同步文档，不创建故事文档内容（那是 `/rui doc`） | 撤销误创建的文件 |
| 3 | 不修改源码，不创建/切换 git 分支（那是 `/rui code`） | — |
| 4 | sync 完全委托 import-docs，不自行实现同步 | 修正命令重试 |
| 5 | `<name>` = kebab-case | 拒绝执行 |

## 生效标志

```mermaid
flowchart LR
    F1["list/show/概览 查询<br/>远端 API 非本地"]:::sig
    F1 --> F2["sync 正确委托<br/>import-docs"]:::sig
    F2 --> F3["状态判定准确<br/>基于远端 file_path"]:::sig

    classDef sig fill:#e8f5e9,stroke:#2e7d32;
```

| 标志 | 未达标的处置 |
|------|------------|
| list/show/概览查询远端 API，非本地文件系统 | 修正为远端查询 |
| sync 正确委托 import-docs | 修正命令参数重试 |
| 状态判定基于远端 file_path 准确 | 修正判定逻辑 |

## 与 rui 的关系

> rui-story 从 rui 接管了 `list` 命令。其余所有管线阶段（doc / code / update）仍由 rui 编排。

```mermaid
flowchart LR
    RUI["/rui<br/>SDLC 编排"]:::rui -->|"doc 创建文档"| PANEL["远端 故事任务面板/"]:::panel
    RS["/rui-story<br/>面板管理"]:::story -->|"查询 + 同步"| PANEL

    classDef rui fill:#fff3e0,stroke:#e65100;
    classDef story fill:#e3f2fd,stroke:#1565c0;
    classDef panel fill:#e8f5e9,stroke:#2e7d32;
```
