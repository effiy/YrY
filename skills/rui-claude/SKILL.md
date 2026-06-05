---
name: rui-claude
description: Manage ALL .claude/ directories across the repo — sync from remote, analyze health, and recommend tasks.
user_invocable: true
lifecycle: default-pipeline
---

# rui-claude

> **--help / -h**：执行 `node skills/rui-claude/help.mjs` 输出完整帮助（含命令族全景 + 使用场景）。用户输入 `/rui-claude --help` 或 `/rui-claude -h` 或 `/rui-claude help` 时，跳过逻辑，直接运行脚本。

作用范围：当前项目的 `.claude/` 目录。sync / retro 均以 `.claude/` 为操作边界。

[命令族全景](#命令族全景) · [操作边界](#操作边界) · [sync](#sync) · [update](#update) · [update-version](#update-version) · [retro](#retro) · [history](#history) · [核心规则](#核心规则) · [参考模式](#参考模式) · [生效标志](#生效标志)

> **`version --up` 已迁移至 [`/rui version --up`](../rui/SKILL.md#version---up)。**

## 命令族全景

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
    ENTRY["/rui-claude"]:::src --> Q1{"子命令?"}

    Q1 -->|"sync"| SYNC["覆盖式同步<br/>API pull → 本地覆盖"]:::cmd
    Q1 -->|"update"| UPDATE["插件升级<br/>git pull → sync .claude/"]:::cmd
    Q1 -->|"update-version"| UV["版本收敛升级<br/>合并所有分支→升版→推送"]:::cmd
    Q1 -->|"retro"| RETRO["健康度分析<br/>三节复盘"]:::cmd
    Q1 -->|"history"| HIST["操作历史<br/>list / stats"]:::cmd
    Q1 -->|"&lt;req&gt;"| REQ["需求管线<br/>doc + code → 交付"]:::cmd
    Q1 -->|"空输入"| LIST["推荐任务<br/>5~10 条"]:::cmd

    SYNC --> S_OUT[".claude/ 全量覆盖"]:::out
    UV --> UV_OUT["所有分支合一<br/>版本号递增<br/>推送 + tag"]:::out
    RETRO --> R_OUT["docs/自改进故事面板/<br/>&lt;project&gt;-&lt;date&gt;.md"]:::out
    HIST --> H_OUT[".claude/.history/<br/>rui-claude-history.jsonl"]:::out
    REQ --> PIPE["rui code 管线<br/>仅限 .claude/ 内"]:::pipe
    LIST --> L_OUT["推荐列表"]:::out


```

| 命令 | 流程 | 产出 |
|------|------|------|
| `/rui-claude sync` | 查询远端 API → 逐文件 pull 覆盖本地 | `.claude/` 全量覆盖 |
| `/rui-claude update` | git pull 最新 YrY 插件 → 清除旧版本缓存 → sync 远端 .claude/ | 插件升级 + 缓存清除 + `.claude/` 刷新 |
| `/rui-claude update-version` | 合并所有分支到 main → 自主判定版本号 → 更新版本文件 → 推送远端 + tag | 版本收敛升级 |
| `/rui-claude retro` | 分析 .claude/ 结构健康度 → 三节复盘 | `docs/自改进故事面板/<date>.md` |
| `/rui-claude history` | 查看操作历史：`list [--limit N]` / `stats [--json]` | 终端输出 |
| `/rui-claude 需求` | 需求解析→故事拆分→逐故事 doc+code 管线→交付 | `.claude/` 内文件变更 |
| `/rui-claude` | 按 5 层管线评分推荐 5~10 条任务 | 推荐列表 |

## 操作边界

```mermaid
flowchart LR
    subgraph 允许["✅ 操作范围"]
        direction TB
    end
    subgraph 禁止["❌ 不可触及"]
        direction TB
        OUT2["外部配置"]:::block
    end
    允许 -.->|"硬边界"| 禁止


```

## sync — 覆盖式同步

```mermaid
flowchart LR
    TRIGGER["/rui-claude sync"]:::src --> CHECK{"确认用户意图?"}
    CHECK -->|"否"| ABORT["中止"]:::abort
    CHECK -->|"是"| PULL["node skills/rui-import/sync.mjs<br/>dir=.claude/ mode=pull<br/>远端 API → 逐文件覆盖本地"]:::op
    PULL --> DONE["完成<br/>自动记录 history"]:::done


```

| 项目 | 说明 |
|------|------|
| 数据源 | 远端 API（`api.effiy.cn`），查询 sessions 集合中 `tags[0]=<workspace> && tags[1]=.claude` 的记录 |
| 行为 | 覆盖式更新，逐文件从远端 pull 覆盖本地 `.claude/`，保留嵌套目录结构 |
| 前置条件 | `API_X_TOKEN` 环境变量已配置 |
| 委托 | 完全委托 `rui-import`（`dir=.claude/ mode=pull`），不自行实现同步逻辑 |
| 完成后 | 自动记录 history |

## update — 插件升级 + 缓存清除 + 配置同步

```mermaid
flowchart LR
    TRIGGER["/rui-claude update"]:::src --> PULL["git pull origin main<br/>拉取最新 YrY 插件源码"]:::op
    PULL --> CHECK{"pull 成功?"}
    CHECK -->|"否"| FAIL["网络失败<br/>提示手动重试"]:::abort
    CHECK -->|"是"| CLEAR["清除插件缓存<br/>rm -rf ~/.claude/plugins/<br/>cache/yry/yry/"]:::op
    CLEAR --> SYNC["rui-claude sync<br/>远端 .claude/ → 本地覆盖"]:::op
    SYNC --> DONE["升级完成<br/>插件源码 + 缓存清除 + .claude/ 三重刷新"]:::done


```

| 项目 | 说明 |
|------|------|
| 触发方式 | `/rui-claude update`，一键升级 YrY 插件并同步 .claude/ 配置 |
| 步骤 1 | `git pull origin main` — 拉取最新 YrY 插件源码到本地 |
| 步骤 2 | 清除插件缓存 — 删除 `~/.claude/plugins/cache/yry/yry/` 下所有旧版本目录，确保下次加载从最新源码重建缓存 |
| 步骤 3 | 委托 `rui-claude sync` — 从远端 API 覆盖同步最新 .claude/ 目录 |
| 前置条件 | 当前分支为 main，网络可达 origin + api.effiy.cn，`API_X_TOKEN` 已配置 |
| 降级 | git pull 失败时中止并提示手动重试；sync 失败时遵循 sync 自身的降级策略 |
| 完成后 | 自动记录 history |

## update-version — 版本收敛升级

> 将所有分支内容合并到 main → 自主判定下一版本号 → 更新版本文件 → git commit → 推送远端 + tag。
> **一键收敛所有 feat 分支并升级版本，全自主操作。**

```mermaid
flowchart LR
    TRIGGER["/rui-claude update-version"]:::src --> FETCH["git fetch --all<br/>获取所有远端分支"]:::op
    FETCH --> LIST["列出非 main 分支<br/>feat/* fix/* 等"]:::op
    LIST --> MERGE{"逐分支合并到 main"}
    MERGE -->|"成功"| NEXT["下一分支"]:::op
    MERGE -->|"冲突"| ABORT["中止 + 报告冲突<br/>用户手动解决"]:::abort
    NEXT --> ALL{"所有分支已合并?"}
    ALL -->|"否"| MERGE
    ALL -->|"是"| ANALYZE["分析变更范围<br/>git diff 判定版本类型"]:::op
    ANALYZE --> BUMP["自主升级版本号<br/>PATCH / MINOR / MAJOR"]:::op
    BUMP --> WRITE["更新版本文件<br/>plugin.json · marketplace.json<br/>CLAUDE.md · README.md"]:::op
    WRITE --> COMMIT["git commit<br/>含版本号 + 变更摘要"]:::op
    COMMIT --> PUSH["git push origin main<br/>+ git tag + push --tags"]:::op
    PUSH --> REPORT["输出升级摘要<br/>合并分支数 · 旧版本→新版本<br/>·变更类型·commit·tag"]:::out


```

| 项目 | 说明 |
|------|------|
| 触发方式 | `/rui-claude update-version`，一键分支收敛 + 版本升级 + 推送 |
| 步骤 1 | `git fetch --all` — 获取所有远端分支最新状态 |
| 步骤 2 | 列出所有非 main 分支（`feat/*`、`fix/*` 等），按创建时间排序 |
| 步骤 3 | 逐分支 `git merge --no-ff <branch>` 到 main，冲突时中止并列出冲突文件 |
| 步骤 4 | `git diff` 分析合并后的变更范围，按规则判定 PATCH / MINOR / MAJOR |
| 步骤 5 | 更新 `plugin.json` + `marketplace.json` + `CLAUDE.md` + `README.md` 版本号 |
| 步骤 6 | `git commit -m "chore: bump version X.Y.Z → A.B.C"` 含变更摘要 |
| 步骤 7 | `git push origin main && git tag vX.Y.Z && git push --tags` |
| 步骤 8 | 输出升级摘要：合并分支数、版本变更、commit hash、tag |
| 前置条件 | 工作区干净（无未提交变更），网络可达 origin |
| 冲突处理 | 任一分支合并冲突时立即中止，列出冲突文件，提示用户手动解决后重新执行 |
| 降级 | git fetch 失败时提示检查网络；版本文件更新失败时回滚 commit |
| 完成后 | 自动记录 history |

### 版本判定规则

| 变更信号 | 版本升级 | 示例 |
|---------|---------|------|
| 仅文档措辞/格式调整 | PATCH | `1.30.0` → `1.30.1` |
| 新增 skill/agent/rule/命令 | MINOR | `1.30.0` → `1.31.0` |
| 删除/重命名命令或接口 | MINOR | `1.30.0` → `1.31.0` |
| 架构重构/破坏性变更 | MAJOR | `1.30.0` → `2.0.0` |

### 版本文件同步清单

| 文件 | 路径 | 字段 |
|------|------|------|
| plugin.json | `.claude-plugin/plugin.json` | `.version` |
| marketplace.json | `.claude-plugin/marketplace.json` | `.metadata.version` + `.plugins[0].version` |
| CLAUDE.md | `CLAUDE.md` | 项目画像表 `版本` 行 |
| README.md | `README.md` | 版本引用 |

### 约束

| 约束 | 规则 |
|------|------|
| 不降级 | 新版本号必须 > 旧版本号 |
| 四文件同步 | plugin.json / marketplace.json / CLAUDE.md / README.md 版本号一致 |
| 不跳号 | 版本号严格递增 |
| git 强制 | 必须产生 git commit + tag |
| 仅 main | 在 main 分支上操作，推送目标为 origin/main |
| 工作区干净 | 执行前检查 `git status --porcelain`，有未提交变更时中止 |
| 冲突即停 | 任一分支合并冲突立即中止，不跳过不忽略 |

```mermaid
flowchart LR
    TRIGGER["/rui-claude retro"]:::src --> COLLECT["采集统计<br/>agents/ · rules/ · formulas.md · skills/"]:::op
    COLLECT --> WRITE["三节复盘"]:::op
    WRITE --> S1["§1 配置结构"]:::section
    WRITE --> S2["§2 健康度"]:::section
    WRITE --> S3["§3 改进项"]:::section
    S1 & S2 & S3 --> OUT["写入复盘文档"]:::out

    COLLECT -.->|"不连接"| REMOTE["远端"]:::no


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


```

| 子命令 | 说明 |
|--------|------|
| `list [--limit N]` | 列出最近 N 条操作记录 |
| `stats [--json]` | 操作统计摘要 |

## 核心规则

```mermaid
flowchart LR
    subgraph 边界["操作边界"]
        direction TB
        R7["禁止自动 commit/push"]:::rule
    end
    subgraph 管线["管线约束"]
        direction TB
        R3["feat 分支隔离"]:::rule
        R4["禁止 auto-merge"]:::rule
    end
    subgraph 行为["行为约束"]
        direction TB
        R6["空输入只推荐不执行"]:::rule
    end


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

## 参考模式

| 命令 | 参考要点 |
|------|---------|
| sync | 远端 API 查询 + 文件下载模式 |
| update | git pull + 清除插件缓存 + sync 级联操作，三重刷新 |
| retro | 健康度指标、行为纪律审查 |
| 需求管线 | 安全约束、验证门禁、仅限 `.claude/` 边界 |
| 趋势跟踪 | `.claude/` 配置演进方向、新兴工具采纳 |

## 生效标志

```mermaid
flowchart LR
    S1["操作边界<br/>仅 .claude/ 内"]:::sig --> S2["sync 确认<br/>意图确认后覆盖"]:::sig
    S2 --> S3["管线完整<br/>变更走 rui code"]:::sig
    S3 --> S4["history 记录<br/>append-only 不入库"]:::sig


```

| 标志 | 未达标的处置 |
|------|------------|
| 操作仅限 `.claude/` 目录 | 撤销外部变更 |
| sync 前确认用户意图 | 补确认后重新执行 |
| 变更走 rui code 管线 | 切分支重走管线 |
| history 仅本地不入库 | 从 git 暂存区移除 history 文件 |
